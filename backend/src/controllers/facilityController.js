import Facility from '../models/Facility.js';
import MedicalService from '../models/MedicalService.js';
import FacilityStatus from '../models/FacilityStatus.js';

// @desc    Get all facilities with filtering & live status
// @route   GET /api/facilities
// @access  Public
export const getFacilities = async (req, res, next) => {
  try {
    const { search, city, type, emergency } = req.query;
    const filter = {};

    if (city) {
      filter.city = new RegExp(city, 'i');
    }
    if (type && type !== 'All') {
      filter.facilityType = type;
    }
    if (emergency === 'true') {
      filter.emergency24x7 = true;
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const facilities = await Facility.find(filter)
      .populate('manager', 'name email phone')
      .sort({ createdAt: -1 });

    // Attach latest live operational status to each facility
    const facilityIds = facilities.map(f => f._id);
    const statuses = await FacilityStatus.find({ facility: { $in: facilityIds } });
    const statusMap = new Map();
    statuses.forEach(st => statusMap.set(st.facility.toString(), st));

    const enrichedFacilities = facilities.map(fac => {
      const live = statusMap.get(fac._id.toString());
      return {
        ...fac.toObject(),
        liveStatus: live ? live.status : 'Available',
        currentWaitTime: live ? live.currentWaitTimeMinutes : 15,
        statusNotice: live ? live.notice : 'Operational'
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedFacilities.length,
      data: enrichedFacilities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single facility by ID
// @route   GET /api/facilities/:id
// @access  Public
export const getFacilityById = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id).populate('manager', 'name email phone');
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const liveStatus = await FacilityStatus.findOne({ facility: facility._id });
    const services = await MedicalService.find({ facility: facility._id, isAvailable: true });

    res.status(200).json({
      success: true,
      data: {
        ...facility.toObject(),
        liveStatus,
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new facility
// @route   POST /api/facilities
// @access  Private (Admin only)
export const createFacility = async (req, res, next) => {
  try {
    const facilityData = {
      ...req.body,
      createdBy: req.user.id
    };

    const facility = await Facility.create(facilityData);

    // Initialize baseline operational status
    await FacilityStatus.create({
      facility: facility._id,
      status: 'Available',
      operatingHours: facility.operatingHours || '24/7',
      emergencyAvailable: facility.emergency24x7 || false,
      currentWaitTimeMinutes: 15,
      notice: 'Facility operational and accepting patients.',
      updatedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Healthcare facility added successfully',
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing facility
// @route   PUT /api/facilities/:id
// @access  Private (Admin or assigned Facility Manager)
export const updateFacility = async (req, res, next) => {
  try {
    let facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Role check: Admin can update any facility.
    // Facility Manager can only update their own facility.
    if (req.user.role === 'manager') {
      const isAssigned =
        (facility.manager && facility.manager.toString() === req.user.id) ||
        (req.user.assignedFacility && req.user.assignedFacility.toString() === facility._id.toString());
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own assigned facility.'
        });
      }
    }

    facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Facility details updated successfully',
      data: facility
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private (Admin only)
export const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Cascade delete related services and status records
    await MedicalService.deleteMany({ facility: facility._id });
    await FacilityStatus.deleteMany({ facility: facility._id });
    await facility.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Facility and associated services deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
