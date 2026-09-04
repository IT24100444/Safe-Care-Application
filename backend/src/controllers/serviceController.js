import MedicalService from '../models/MedicalService.js';
import Facility from '../models/Facility.js';

// @desc    Get all medical services with filtering & facility details
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    const { department, facility, search, maxFee, serviceType } = req.query;
    const filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }
    if (facility) {
      filter.facility = facility;
    }
    if (serviceType && serviceType !== 'All') {
      filter.serviceType = serviceType;
    }
    if (maxFee) {
      filter.fees = { $lte: Number(maxFee) };
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const services = await MedicalService.find(filter)
      .populate('facility', 'name facilityType city address contactNumber emergency24x7')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res, next) => {
  try {
    const service = await MedicalService.findById(req.params.id)
      .populate('facility', 'name facilityType city address contactNumber emergency24x7 imageUrl');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Medical service not found' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medical service
// @route   POST /api/services
// @access  Private (Admin or Facility Manager for own facility)
export const createService = async (req, res, next) => {
  try {
    const { facility: facilityId } = req.body;

    // Verify facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Target healthcare facility not found' });
    }

    // Role check: If user is manager, verify they own/manage this facility
    if (req.user.role === 'manager') {
      const isOwner =
        (facility.manager && facility.manager.toString() === req.user.id) ||
        (req.user.assignedFacility && req.user.assignedFacility.toString() === facility._id.toString());
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only add medical services to your own facility.'
        });
      }
    }

    const service = await MedicalService.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Medical service registered successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical service
// @route   PUT /api/services/:id
// @access  Private (Admin or Facility Manager for own facility)
export const updateService = async (req, res, next) => {
  try {
    let service = await MedicalService.findById(req.params.id).populate('facility');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Medical service not found' });
    }

    // Role check: Facility Manager check
    if (req.user.role === 'manager') {
      const fac = service.facility;
      const isOwner =
        (fac && fac.manager && fac.manager.toString() === req.user.id) ||
        (req.user.assignedFacility && req.user.assignedFacility.toString() === fac._id.toString());
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only update medical services of your own facility.'
        });
      }
    }

    service = await MedicalService.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('facility', 'name facilityType city');

    res.status(200).json({
      success: true,
      message: 'Medical service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical service
// @route   DELETE /api/services/:id
// @access  Private (Admin or Facility Manager for own facility)
export const deleteService = async (req, res, next) => {
  try {
    const service = await MedicalService.findById(req.params.id).populate('facility');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Medical service not found' });
    }

    if (req.user.role === 'manager') {
      const fac = service.facility;
      const isOwner =
        (fac && fac.manager && fac.manager.toString() === req.user.id) ||
        (req.user.assignedFacility && req.user.assignedFacility.toString() === fac._id.toString());
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete medical services of your own facility.'
        });
      }
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medical service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
