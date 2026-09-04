# API conventions

Node endpoints use `/api/v1`. Success is `{ "success": true, "data": {} }`. Errors are `{ "success": false, "error": { "code": "CODE", "message": "Safe message" } }`; validation errors may add field-level `details`.

Use 200 for successful reads, 201 for creation, 204 for successful no-content operations, 400 for malformed input, 404 for missing resources, 409 for conflicts, 422 for validation failures, and 500 for unexpected failures. JSON fields use camelCase and date-times should use ISO 8601 UTC strings. Pagination will be defined when the first list endpoint is designed. Versioning is URL-based and configuration comes from environment variables.

## Authentication endpoints

- `POST /api/v1/auth/register`: public; accepts `name`, `email`, `password`, and `preferredLanguage` (`en`, `si`, or `ta`). A supplied `role` is rejected. Returns 201 with safe `user` and `token`.
- `POST /api/v1/auth/login`: public; accepts `email` and `password`. Unknown email and wrong password share the same safe 401 response. Returns safe `user` and `token`.
- `GET /api/v1/auth/me`: requires `Authorization: Bearer <token>` and returns the current database-loaded user.

The JWT contains only subject/user ID, role, issued-at, and expiration claims. The response never includes `passwordHash`. Roles are `PATIENT`, `DOCTOR`, and `ADMIN`; public registration permits PATIENT only.

## Facility and service endpoints

Public active reads are `GET /api/v1/health-services`, `GET /api/v1/health-services/:id`, `GET /api/v1/facilities`, and `GET /api/v1/facilities/:id`. Lists return `{ success: true, data: { items, count } }`. Service list filters are `category` and bounded, escaped `search`. Facility filters are `district`, `facilityType`, `healthService`, `language`, and boolean `emergencyAvailable`; filters are allowlisted and combinable.

ADMIN-only Bearer-authenticated mutations are `POST`, `PATCH /:id`, and `DELETE /:id` on both resource roots. POST accepts the schema fields documented in database design. PATCH is partial and accepts only validated resource fields. DELETE performs one-way soft deactivation and returns the deactivated record. Invalid IDs and filters return controlled validation errors; missing/inactive records return 404; invalid/inactive service references return 422; duplicate service names return 409.

## Doctor and schedule endpoints

Public reads are `GET /api/v1/doctors`, `GET /api/v1/doctors/:id`, and `GET /api/v1/doctors/:doctorId/availability?date=YYYY-MM-DD`. Doctor filters are `specialization`, `facility`, `healthService`, `language`, and escaped bounded `name`; all are allowlisted and combinable. Public serialization excludes `userId`, email, credentials, and Mongoose metadata and omits inactive facility/service references.

`GET /api/v1/doctors/me` and `GET /api/v1/schedules/mine` require DOCTOR and resolve ownership from the database-loaded authenticated User. ADMIN-only endpoints are `POST /api/v1/doctors`, `PATCH /api/v1/doctors/:id`, `DELETE /api/v1/doctors/:id`, plus `GET /api/v1/schedules`, `GET /api/v1/schedules/:id`, `POST /api/v1/schedules`, `PATCH /api/v1/schedules/:id`, and `DELETE /api/v1/schedules/:id`. Schedule list filters are `doctor`, `facility`, and `date`. DELETE is soft deactivation. Dates are real `YYYY-MM-DD` values in the Asia/Colombo calendar context; times are 24-hour `HH:mm`. Overlap conflicts return 409. Availability generates every full slot within each interval and does not represent a booking or reservation.
