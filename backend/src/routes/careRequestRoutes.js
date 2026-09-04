import express from 'express';
import {
  createCareRequest,
  getCareRequests,
  getCareRequestById,
  updateCareRequest,
  deleteCareRequest,
  previewRecommendations
} from '../controllers/careRequestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCareRequest } from '../middleware/validate.js';

const router = express.Router();

router.post('/preview-recommendations', previewRecommendations);

router.route('/')
  .get(protect, getCareRequests)
  .post(protect, validateCareRequest, createCareRequest);

router.route('/:id')
  .get(protect, getCareRequestById)
  .put(protect, updateCareRequest)
  .delete(protect, deleteCareRequest);

export default router;
