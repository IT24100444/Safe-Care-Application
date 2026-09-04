import mongoose from 'mongoose';

const careRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    patientContact: {
      type: String,
      required: [true, 'Patient contact number or email is required'],
      trim: true
    },
    serviceRequired: {
      type: String,
      required: [true, 'Specific service needed is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Medical department/specialty is required'],
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
    locationCity: {
      type: String,
      required: [true, 'Location / City is required'],
      trim: true
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium'
    },
    preferredFacilityType: {
      type: String,
      enum: ['Any', 'Hospital', 'Clinic', 'Medical Center', 'Specialized Care', 'Diagnostic Center'],
      default: 'Any'
    },
    maxBudget: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      default: 25000,
      min: [0, 'Budget must be at least 0']
    },
    additionalNotes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Matched', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    selectedFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      default: null
    }
  },
  {
    timestamps: true
  }
);

careRequestSchema.index({ patient: 1, department: 1, locationCity: 1, urgency: 1 });

const CareRequest = mongoose.model('CareRequest', careRequestSchema);
export default CareRequest;
