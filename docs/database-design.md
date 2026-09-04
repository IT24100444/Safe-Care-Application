# Database design

MongoDB Atlas access is encapsulated by the Node API's Mongoose connection module. The `User` schema now contains `name`, normalized unique `email`, non-selected `passwordHash`, `role`, `preferredLanguage`, `isActive`, and timestamps. Email has the only current explicit unique index. Passwords are hashed with bcryptjs cost 12 before persistence.

Future data areas are Doctor, DoctorSchedule, and Appointment. Future ownership rules will restrict patients to their records, doctors to assigned appointments where allowed, and administrators according to explicit route policies. Those future schemas and checks do not yet exist.

`HealthService` now stores unique trimmed `name`, normalized bounded `category`, optional bounded `description`, `isActive`, and timestamps. `HealthcareFacility` stores name, one of eight centralized facility types, one of all 25 Sri Lankan districts, address/contact metadata, a subset of `en`/`si`/`ta`, HealthService ObjectId references, emergency capability, description, active status, and timestamps.

Both resources use soft deactivation. Facility service references are retained historically when a service is deactivated. New assignments require every referenced service to exist and be active, while public population and serialization omit inactive referenced services. Doctor, DoctorSchedule, and Appointment remain future-only.
