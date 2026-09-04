import bcrypt from 'bcryptjs'
import { provisionDoctorUser } from '../src/services/doctorProvisioningService.js'
import { doctorService } from '../src/services/doctorService.js'
import { scheduleService } from '../src/services/scheduleService.js'
import { generateTimeSlots } from '../src/utils/timeSlots.js'

const id=n=>n.toString(16).padStart(24,'0'),doctorId=id(10),facilityId=id(20),serviceId=id(30),userId=id(40)
const facility={_id:facilityId,name:'City Hospital',district:'Colombo',isActive:true}
const healthService={_id:serviceId,name:'General Medicine',category:'General',isActive:true}
const doctor=(overrides={})=>({_id:doctorId,name:'Dr Test',specialization:'GENERAL_PRACTITIONER',qualification:'MBBS',facilityIds:[facility],healthServiceIds:[healthService],supportedLanguages:['en'],consultationType:'IN_PERSON',bio:'',isActive:true,...overrides})
const schedule=(overrides={})=>({_id:id(50),doctorId,facilityId,date:'2099-09-10',startTime:'09:00',endTime:'10:00',slotDurationMinutes:20,isActive:true,...overrides})
const populated=value=>({populate:async()=>value})

describe('doctor service',()=>{
  const refs={countDocuments:async query=>query._id.$in.length};const users={findById:async()=>({role:'DOCTOR'})}
  test('creates and normalizes a safe doctor',async()=>{const model={findOne:async()=>null,create:async data=>doctor(data)};const result=await doctorService(model,refs,refs,users).create({name:'Dr Test',specialization:'GENERAL_PRACTITIONER',facilityIds:[facilityId],healthServiceIds:[serviceId],supportedLanguages:['en','en']});expect(result).toMatchObject({name:'Dr Test',consultationType:'IN_PERSON'});expect(result).not.toHaveProperty('userId')})
  test.each([['facility',{},refs,{countDocuments:async()=>0}],['service',{}, {countDocuments:async()=>0},refs]])('rejects inactive or missing %s relationships',async(_label,model,services,facilities)=>{await expect(doctorService(model,facilities,services,users).create({facilityIds:[facilityId],healthServiceIds:[serviceId],supportedLanguages:['en']})).rejects.toMatchObject({statusCode:422})})
  test('requires linked users to have DOCTOR role',async()=>{const service=doctorService({findOne:async()=>null},refs,refs,{findById:async()=>({role:'PATIENT'})});await expect(service.create({facilityIds:[],healthServiceIds:[],supportedLanguages:['en'],userId})).rejects.toMatchObject({code:'INVALID_DOCTOR_USER'})})
  test('rejects duplicate user links',async()=>{const service=doctorService({findOne:async()=>doctor()},refs,refs,users);await expect(service.create({facilityIds:[],healthServiceIds:[],supportedLanguages:['en'],userId})).rejects.toMatchObject({statusCode:409})})
  test('builds only allowlisted combined filters and escapes names',async()=>{let filter;const model={find:value=>{filter=value;return populated([])}};await doctorService(model,refs,refs,users).list({specialization:'DENTIST',facility:facilityId,healthService:serviceId,language:'ta',name:'a.*',ignored:{$ne:1}});expect(filter).toEqual({isActive:true,specialization:'DENTIST',facilityIds:facilityId,healthServiceIds:serviceId,supportedLanguages:'ta',name:{$regex:'a\\.\\*',$options:'i'}})})
  test('filters inactive populated references and authentication fields',async()=>{const value=doctor({userId,email:'secret@example.test',facilityIds:[facility,{...facility,_id:id(21),isActive:false}],healthServiceIds:[healthService,{...healthService,_id:id(31),isActive:false}]});const model={findOne:()=>populated(value)};const result=await doctorService(model,refs,refs,users).get(doctorId);expect(result.facilities).toHaveLength(1);expect(result.healthServices).toHaveLength(1);expect(result).not.toHaveProperty('email');expect(result).not.toHaveProperty('userId')})
  test('own profile lookup is server user based and missing is controlled',async()=>{const model={findOne:()=>populated(null)};await expect(doctorService(model,refs,refs,users).getOwn(userId)).rejects.toMatchObject({code:'DOCTOR_PROFILE_NOT_FOUND'})})
  test('update and one-way deactivation work',async()=>{let active=true;const model={findOneAndUpdate:async(_f,data)=>active?(data.isActive===false&&(active=false),doctor(data)):null};const service=doctorService(model,refs,refs,users);expect((await service.update(doctorId,{bio:'Updated'})).bio).toBe('Updated');expect((await service.deactivate(doctorId)).isActive).toBe(false);await expect(service.deactivate(doctorId)).rejects.toMatchObject({statusCode:404})})
})

describe('slot generation',()=>{
  test.each([['09:00','10:00',20,['09:00','09:20','09:40']],['09:00','10:00',30,['09:00','09:30']],['09:00','09:50',30,['09:00']]])('generates bounded slots',(...args)=>expect(generateTimeSlots(args[0],args[1],args[2])).toEqual(args[3]))
  test.each([['10:00','09:00',20],['09:00','09:00',20],['bad','10:00',20],['09:00','10:00',0]])('rejects invalid interval %#',(...args)=>expect(()=>generateTimeSlots(args[0],args[1],args[2])).toThrow())
})

describe('schedule service',()=>{
  const doctors={findOne:async()=>doctor({facilityIds:[facilityId]})},facilities={findOne:async()=>facility}
  test('creates valid schedule',async()=>{const model={findOne:async()=>null,create:async data=>schedule(data)};expect((await scheduleService(model,doctors,facilities,{today:()=> '2099-01-01'}).create(schedule())).startTime).toBe('09:00')})
  test('rejects an inactive doctor',async()=>{const service=scheduleService({},{findOne:async()=>null},facilities,{today:()=> '2099-01-01'});await expect(service.create(schedule())).rejects.toMatchObject({code:'INVALID_DOCTOR_REFERENCE'})})
  test('rejects inactive facility',async()=>{const service=scheduleService({},doctors,{findOne:async()=>null},{today:()=> '2099-01-01'});await expect(service.create(schedule())).rejects.toMatchObject({code:'INVALID_FACILITY_REFERENCE'})})
  test('rejects facility outside doctor assignment',async()=>{const service=scheduleService({}, {findOne:async()=>doctor({facilityIds:[]})},facilities,{today:()=> '2099-01-01'});await expect(service.create(schedule())).rejects.toMatchObject({code:'FACILITY_NOT_ASSIGNED'})})
  test.each([{date:'2020-01-01'},{date:'2099-02-30'},{startTime:'10:00',endTime:'09:00'},{startTime:'09:00',endTime:'09:00'},{slotDurationMinutes:17}])('rejects invalid schedule %#',async overrides=>{const model={findOne:async()=>null};await expect(scheduleService(model,doctors,facilities,{today:()=> '2099-01-01'}).create(schedule(overrides))).rejects.toMatchObject({statusCode:422})})
  test('rejects overlap at any facility and permits adjacency',async()=>{let existing=schedule();const model={findOne:async query=>query.startTime?existing:null,create:async data=>schedule(data)};const service=scheduleService(model,doctors,facilities,{today:()=> '2099-01-01'});await expect(service.create(schedule({startTime:'09:30',endTime:'10:30'}))).rejects.toMatchObject({code:'SCHEDULE_OVERLAP'});existing=null;await expect(service.create(schedule({startTime:'10:00',endTime:'11:00'}))).resolves.toMatchObject({startTime:'10:00'})})
  test('availability excludes inactive facilities and generates slots',async()=>{const model={find:()=>populated([schedule({doctorId:doctor(),facilityId:facility}),schedule({_id:id(51),doctorId:doctor(),facilityId:{...facility,isActive:false}})])};const result=await scheduleService(model,doctors,facilities).availability(doctorId,'2099-09-10');expect(result.schedules).toHaveLength(1);expect(result.schedules[0].availableSlots).toEqual(['09:00','09:20','09:40'])})
  test('empty availability is a valid result',async()=>{const model={find:()=>populated([])};await expect(scheduleService(model,doctors,facilities).availability(doctorId,'2099-09-10')).resolves.toMatchObject({schedules:[]})})
  test('list uses allowlisted filters',async()=>{let filter;const model={find:value=>{filter=value;return populated([])}};await scheduleService(model,doctors,facilities).list({doctor:doctorId,facility:facilityId,date:'2099-09-10',ignored:'x'});expect(filter).toEqual({isActive:true,doctorId,facilityId,date:'2099-09-10'})})
})

describe('doctor account provisioning',()=>{
  test('creates a hashed DOCTOR credential without plaintext',async()=>{let saved;const model={findOne:async()=>null,create:async data=>(saved=data,data)};await provisionDoctorUser(model,{name:'Dr User',email:'DR@example.test',password:'Strong123'});expect(saved).toMatchObject({email:'dr@example.test',role:'DOCTOR'});expect(saved).not.toHaveProperty('password');expect(await bcrypt.compare('Strong123',saved.passwordHash)).toBe(true)})
  test.each([{name:'x',email:'dr@example.test',password:'Strong123'},{name:'Doctor',email:'invalid',password:'Strong123'},{name:'Doctor',email:'dr@example.test',password:'weak'}])('rejects invalid credentials',async input=>{await expect(provisionDoctorUser({findOne:async()=>null},input)).rejects.toMatchObject({statusCode:422})})
  test('rejects duplicate email',async()=>{await expect(provisionDoctorUser({findOne:async()=>({})},{name:'Doctor',email:'dr@example.test',password:'Strong123'})).rejects.toMatchObject({statusCode:409})})
})
