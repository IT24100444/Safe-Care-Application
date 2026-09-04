import mongoose from 'mongoose'
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:120,unique:true},category:{type:String,required:true,trim:true,maxlength:80},description:{type:String,trim:true,maxlength:1000,default:''},isActive:{type:Boolean,default:true}},{timestamps:true,versionKey:false})
export default mongoose.model('HealthService',schema)
