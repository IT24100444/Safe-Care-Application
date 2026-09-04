import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
      minlength: [3, 'Facility name must be at least 3 characters']
    },
    facilityType: {
      type: String,
      required: [true, 'Facility type is required'],
      enum: ['Hospital', 'Clinic', 'Medical Center', 'Specialized Care', 'Diagnostic Center'],
      default: 'Hospital'
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City/Location is required'],
      trim: true,
      index: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true
    },
    emergency24x7: {
      type: Boolean,
      default: false
    },
    operatingHours: {
      type: String,
      default: '24/7'
    },
    description: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    totalBeds: {
      type: Number,
      default: 50
    },
    website: {
      type: String,
      default: ''
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

facilitySchema.index({ name: 'text', city: 'text', description: 'text' });

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;
