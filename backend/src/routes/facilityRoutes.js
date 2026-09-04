import express from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility
} from '../controllers/facilityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateFacility } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(getFacilities)
  .post(protect, authorize('admin'), validateFacility, createFacility);

router.route('/:id')
  .get(getFacilityById)
  .put(protect, authorize('admin', 'manager'), updateFacility)
  .delete(protect, authorize('admin'), deleteFacility);

export default router;
