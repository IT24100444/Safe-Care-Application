# Testing strategy

Frontend component tests validate the shell, public auth forms, absence of public role selection, and protected routing with Vitest and Testing Library. Node API tests use Supertest with an isolated injectable User model double. This exercises validation, bcrypt hashing, JWTs, controllers, middleware, and contracts without downloading MongoDB binaries or touching Atlas. Python tests use pytest and FastAPI TestClient.

`tests/integration` is reserved for meaningful future cross-service tests. Manual smoke tests check each service startup and health route. After changes, run focused tests, full service tests, lint, frontend build, then cross-service regression checks when those tests exist.

Part 3 resource tests use injected model/service doubles and Supertest; they never use Atlas. They cover public active-only behavior, CRUD contracts, filters, relationship integrity, RBAC, safe database error mapping, and development admin provisioning. Frontend Vitest tests mock only HTTP feature modules and exercise public and admin workflows. Python remains regression-only.
