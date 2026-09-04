# Database design

MongoDB Atlas access is encapsulated by the Node API's Mongoose connection module. The `User` schema now contains `name`, normalized unique `email`, non-selected `passwordHash`, `role`, `preferredLanguage`, `isActive`, and timestamps. Email has the only current explicit unique index. Passwords are hashed with bcryptjs cost 12 before persistence.

Appointment remains future-only. Doctor ownership is resolved through its optional one-to-one `userId` relationship; structural mutations remain ADMIN-only.

`HealthService` now stores unique trimmed `name`, normalized bounded `category`, optional bounded `description`, `isActive`, and timestamps. `HealthcareFacility` stores name, one of eight centralized facility types, one of all 25 Sri Lankan districts, address/contact metadata, a subset of `en`/`si`/`ta`, HealthService ObjectId references, emergency capability, description, active status, and timestamps.

Both resources use soft deactivation. Facility service references are retained historically when a service is deactivated. New assignments require every referenced service to exist and be active, while public population and serialization omit inactive referenced services.

`Doctor` stores optional unique sparse `userId → User`, domain-facing name, application-category specialization, qualification, `facilityIds → HealthcareFacility`, `healthServiceIds → HealthService`, supported `en`/`si`/`ta` languages, `IN_PERSON` consultation metadata, bio, active status, and timestamps. Linked users must have DOCTOR role. Assignment references must be active when added; inactive history remains but is filtered publicly. Search indexes cover specialization, facility, service, and active status. The specialization list is an application taxonomy, not an official Sri Lankan clinical taxonomy.

`DoctorSchedule` stores `doctorId → Doctor`, `facilityId → HealthcareFacility`, local calendar date, start/end `HH:mm`, allowed slot duration, active status, and timestamps. Compound lookup indexes cover doctor/date and facility/date. It stores no generated slots. The service prevents past creation, invalid membership, and any same-doctor interval overlap across facilities. Adjacent intervals are allowed. Appointment is not implemented.
