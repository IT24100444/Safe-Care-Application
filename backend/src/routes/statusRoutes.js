import express from 'express';
import {
  getAllStatuses,
  getStatusByFacilityId,
  createOrUpdateStatus,
  deleteStatus
} from '../controllers/statusController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateStatus } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(getAllStatuses)
  .post(protect, authorize('admin', 'manager', 'staff'), validateStatus, createOrUpdateStatus);

router.route('/facility/:facilityId')
  .get(getStatusByFacilityId);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteStatus);

export default router;
