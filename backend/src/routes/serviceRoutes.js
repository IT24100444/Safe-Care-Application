import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateService } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('admin', 'manager'), validateService, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorize('admin', 'manager'), updateService)
  .delete(protect, authorize('admin', 'manager'), deleteService);

export default router;
