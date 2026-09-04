import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecare');
    console.log(`[Safe Care] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Safe Care] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
