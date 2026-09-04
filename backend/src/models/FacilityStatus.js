import mongoose from 'mongoose';

const facilityStatusSchema = new mongoose.Schema(
  {
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Associated healthcare facility is required'],
      unique: true // Each facility has its current active operational status
    },
    status: {
      type: String,
      required: [true, 'Operational status is required'],
      enum: {
        values: ['Available', 'Busy', 'Unavailable', 'Closed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Available'
    },
    operatingHours: {
      type: String,
      default: 'Open 24 Hours'
    },
    emergencyAvailable: {
      type: Boolean,
      default: true
    },
    currentWaitTimeMinutes: {
      type: Number,
      default: 15,
      min: [0, 'Wait time cannot be negative']
    },
    icuCapacityAvailable: {
      type: Number,
      default: 8,
      min: [0, 'ICU capacity cannot be negative']
    },
    departmentAvailability: [
      {
        department: {
          type: String,
          required: true
        },
        isAvailable: {
          type: Boolean,
          default: true
        },
        waitMinutes: {
          type: Number,
          default: 15
        },
        notes: {
          type: String,
          default: ''
        }
      }
    ],
    notice: {
      type: String,
      default: 'Normal operations active.'
    },
    effectiveFrom: {
      type: Date,
      default: Date.now
    },
    effectiveUntil: {
      type: Date,
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const FacilityStatus = mongoose.model('FacilityStatus', facilityStatusSchema);
export default FacilityStatus;
