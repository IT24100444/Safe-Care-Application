import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { getConfig } from './config/env.js'
import healthRoutes from './routes/healthRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import User from './models/User.js'
import { createAuthRouter } from './routes/authRoutes.js'
import HealthService from './models/HealthService.js'
import HealthcareFacility from './models/HealthcareFacility.js'
import {facilityRoutes,serviceRoutes} from './routes/resourceRoutes.js'
import Doctor from './models/Doctor.js'
import DoctorSchedule from './models/DoctorSchedule.js'
import { createDoctorRouters } from './routes/doctorRoutes.js'

export function createApp({ registerAdditionalRoutes, userModel = User, healthServiceModel=HealthService, facilityModel=HealthcareFacility, doctorModel=Doctor, scheduleModel=DoctorSchedule } = {}) {
  const config = getConfig()
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: config.frontendUrl, credentials: true }))
  app.use(express.json({ limit: '100kb' }))
  if (config.nodeEnv !== 'test') app.use(morgan('tiny'))
  app.use('/api/v1/health', healthRoutes)
  app.use('/api/v1/auth', createAuthRouter(userModel))
  app.use('/api/v1/health-services',serviceRoutes(healthServiceModel,userModel))
  app.use('/api/v1/facilities',facilityRoutes(facilityModel,healthServiceModel,userModel))
  const { doctorRouter, scheduleRouter } = createDoctorRouters({ DoctorModel: doctorModel, ScheduleModel: scheduleModel, FacilityModel: facilityModel, HealthServiceModel: healthServiceModel, UserModel: userModel })
  app.use('/api/v1/doctors', doctorRouter)
  app.use('/api/v1/schedules', scheduleRouter)
  registerAdditionalRoutes?.(app)
  app.use(notFound)
  app.use(errorHandler)
  return app
}

export default createApp()
