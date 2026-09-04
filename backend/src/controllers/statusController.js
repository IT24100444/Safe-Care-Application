import FacilityStatus from '../models/FacilityStatus.js';
import Facility from '../models/Facility.js';

// @desc    Get all facility statuses with facility details
// @route   GET /api/statuses
// @access  Public
export const getAllStatuses = async (req, res, next) => {
  try {
    const { status, city } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    let statuses = await FacilityStatus.find(filter)
      .populate('facility', 'name facilityType city address contactNumber emergency24x7')
      .populate('updatedBy', 'name role')
      .sort({ updatedAt: -1 });

    if (city) {
      statuses = statuses.filter(
        st => st.facility && st.facility.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: statuses.length,
      data: statuses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status for specific facility
// @route   GET /api/statuses/facility/:facilityId
// @access  Public
export const getStatusByFacilityId = async (req, res, next) => {
  try {
    const status = await FacilityStatus.findOne({ facility: req.params.facilityId })
      .populate('facility', 'name facilityType city address contactNumber emergency24x7')
      .populate('updatedBy', 'name role');

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'No operational status record found for this facility'
      });
    }

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update operational status for a facility
// @route   POST /api/statuses
// @access  Private (Admin, Facility Manager, Healthcare Staff)
export const createOrUpdateStatus = async (req, res, next) => {
  try {
    const { facility: facilityId, status, operatingHours, emergencyAvailable, currentWaitTimeMinutes, notice, departmentAvailability } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Role check: If not admin, check if user is manager or staff of this facility
    if (req.user.role !== 'admin') {
      const isAuthorized =
        (facility.manager && facility.manager.toString() === req.user.id) ||
        (req.user.assignedFacility && req.user.assignedFacility.toString() === facility._id.toString());
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'You are only authorized to update the operational status of your assigned facility.'
        });
      }
    }

    // Upsert status
    const updatedStatus = await FacilityStatus.findOneAndUpdate(
      { facility: facilityId },
      {
        status,
        operatingHours: operatingHours || facility.operatingHours,
        emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : facility.emergency24x7,
        currentWaitTimeMinutes: currentWaitTimeMinutes || 15,
        notice: notice || 'Operational',
        departmentAvailability: departmentAvailability || [],
        updatedBy: req.user.id
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('facility', 'name facilityType city contactNumber');

    res.status(200).json({
      success: true,
      message: `Operational status updated to "${status}" successfully`,
      data: updatedStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete status record (reverts to unmonitored default)
// @route   DELETE /api/statuses/:id
// @access  Private (Admin only)
export const deleteStatus = async (req, res, next) => {
  try {
    const status = await FacilityStatus.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ success: false, message: 'Status record not found' });
    }

    await status.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Status record removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
