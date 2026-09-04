import CareRequest from '../models/CareRequest.js';
import { rankFacilitiesForRequest } from '../services/recommendationEngine.js';

// @desc    Create new care request and compute recommendations
// @route   POST /api/care-requests
// @access  Private (Patient, Admin)
export const createCareRequest = async (req, res, next) => {
  try {
    const careRequestData = {
      ...req.body,
      patient: req.user.id,
      patientName: req.body.patientName || req.user.name,
      patientContact: req.body.patientContact || req.user.email || req.user.phone
    };

    const careRequest = await CareRequest.create(careRequestData);

    // Run Recommendation Engine
    const recommendations = await rankFacilitiesForRequest(careRequest);

    res.status(201).json({
      success: true,
      message: 'Care request submitted successfully. Ranked recommendations generated.',
      data: careRequest,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get care requests (Patients get their own, Admin/Staff get all)
// @route   GET /api/care-requests
// @access  Private
export const getCareRequests = async (req, res, next) => {
  try {
    const { status, urgency, city } = req.query;
    const filter = {};

    // Patient only sees their own requests
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (urgency && urgency !== 'All') {
      filter.urgency = urgency;
    }
    if (city) {
      filter.locationCity = new RegExp(city, 'i');
    }

    const requests = await CareRequest.find(filter)
      .populate('patient', 'name email phone')
      .populate('selectedFacility', 'name facilityType city contactNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single care request with real-time recommendations
// @route   GET /api/care-requests/:id
// @access  Private
export const getCareRequestById = async (req, res, next) => {
  try {
    const careRequest = await CareRequest.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('selectedFacility');

    if (!careRequest) {
      return res.status(404).json({ success: false, message: 'Care request not found' });
    }

    // Role check: Patient can only view their own
    if (req.user.role === 'patient' && careRequest.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this care request'
      });
    }

    // Generate real-time ranked recommendations
    const recommendations = await rankFacilitiesForRequest(careRequest);

    res.status(200).json({
      success: true,
      data: careRequest,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update care request
// @route   PUT /api/care-requests/:id
// @access  Private
export const updateCareRequest = async (req, res, next) => {
  try {
    let careRequest = await CareRequest.findById(req.params.id);
    if (!careRequest) {
      return res.status(404).json({ success: false, message: 'Care request not found' });
    }

    // Authorization check
    if (req.user.role === 'patient' && careRequest.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own care requests'
      });
    }

    careRequest = await CareRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const recommendations = await rankFacilitiesForRequest(careRequest);

    res.status(200).json({
      success: true,
      message: 'Care request updated successfully',
      data: careRequest,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Cancel care request
// @route   DELETE /api/care-requests/:id
// @access  Private
export const deleteCareRequest = async (req, res, next) => {
  try {
    const careRequest = await CareRequest.findById(req.params.id);
    if (!careRequest) {
      return res.status(404).json({ success: false, message: 'Care request not found' });
    }

    if (req.user.role === 'patient' && careRequest.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own care requests'
      });
    }

    await careRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Care request deleted/cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run instant recommendation analysis without saving
// @route   POST /api/care-requests/preview-recommendations
// @access  Public
export const previewRecommendations = async (req, res, next) => {
  try {
    const recommendations = await rankFacilitiesForRequest(req.body);
    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
