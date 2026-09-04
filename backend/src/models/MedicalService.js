import mongoose from 'mongoose';

const medicalServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Cardiology',
        'Dental',
        'General Consultation',
        'Emergency Care',
        'Pediatrics',
        'Orthopedics',
        'Laboratory & Diagnostics',
        'Radiology & Imaging',
        'Neurology',
        'Dermatology',
        'Oncology',
        'Other'
      ],
      default: 'General Consultation'
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Associated healthcare facility is required']
    },
    fees: {
      type: Number,
      required: [true, 'Service fee is required (LKR)'],
      default: 3500,
      min: [0, 'Service fee cannot be negative']
    },
    description: {
      type: String,
      default: ''
    },
    serviceType: {
      type: String,
      enum: ['Inpatient', 'Outpatient', 'Emergency', 'Diagnostic', 'Consultation', 'Surgical'],
      default: 'Outpatient'
    },
    estimatedDuration: {
      type: String,
      default: '30-45 mins'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    doctorInCharge: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

medicalServiceSchema.index({ name: 'text', department: 'text', description: 'text' });

const MedicalService = mongoose.model('MedicalService', medicalServiceSchema);
export default MedicalService;
