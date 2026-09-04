# Safe Care Application 

CareRoute LK is a multilingual healthcare navigation and appointment platform for Sri Lanka. The current application provides the project foundation and JWT authentication for PATIENT, DOCTOR, and ADMIN identities. Public registration always creates PATIENT accounts; DOCTOR and ADMIN identities must be provisioned outside public endpoints.

## Technology

- React, Vite, React Router, Axios, i18next, Lucide React
- Node.js, Express, Mongoose, MongoDB Atlas
- Python, FastAPI, Pydantic, httpx
- Jest/Supertest, Vitest/Testing Library, pytest, ESLint, Ruff

## Repository

- `frontend/careroute-web` — browser application
- `backend/node-api` — primary API and database owner
- `python-service/fastapi-service` — non-AI Python service
- `tests/integration` — reserved for future cross-service tests
- `docs` — architecture, setup, API, database, and testing notes

## macOS setup

Required: Node.js/npm, Python 3.11+, Git, and a MongoDB Atlas project for live Node startup.

```sh
cd frontend/careroute-web
npm install
npm run dev
```

```sh
cd backend/node-api
npm install
cp .env.example .env
# Set MONGODB_URI and a strong, randomly generated JWT_SECRET in .env
npm run dev
```

```sh
cd python-service/fastapi-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Quality commands: `npm test`, `npm run lint`, and `npm run build` in the relevant JavaScript service; `pytest` and `ruff check .` in the activated Python environment.

Current Node APIs cover health, authentication, health services, facilities, doctors, schedules, and computed doctor availability. Run Node tests with `npm test`.

The browser stores only the access token in localStorage and sends it as a Bearer token. This is pragmatic for the hackathon but exposes the token if an XSS vulnerability exists. JWT logout is client-side, tokens are not revoked, and login rate limiting is a future security improvement. Backend authorization always uses the database-loaded user—not browser role state.

There are no appointments, recommendations, chatbots, or AI capabilities. `fourth.json` is intentionally empty because the fourth product language remains pending confirmation and is not exposed in the selector.

See [development setup](docs/development-setup.md) for details.

## Facility and health-service management

Public users can browse active health services and search active facilities by district, facility type, service, supported language, and emergency capability. Facility details contain only stored navigation metadata; the application does not claim clinical suitability, live availability, ratings, or official verification.

ADMIN users can create, edit, and deactivate facilities and health services through protected API and UI routes. Deactivation is one-way in the current MVP and does not physically delete records. Historical facility references to deactivated services remain stored, but public responses omit those inactive services. PATIENT and DOCTOR accounts cannot mutate this data.

To provision an administrator, configure `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run `node scripts/createAdmin.js` from `backend/node-api`. To provision a DOCTOR login, use `DOCTOR_NAME`, `DOCTOR_EMAIL`, and `DOCTOR_PASSWORD` with `npm run create:doctor`; an ADMIN then links that User ObjectId in `/admin/doctors`. Credentials are environment-only and neither privileged role has a public registration route.

## Doctor schedules and configured availability

Public users can search active doctors by specialization, facility, health service, language, and escaped name text, view safe profile details, select a date, and view configured schedule slots. Slots are calculated from active schedules; they are not reservations and booking begins in Part 5. ADMIN manages doctor profiles, assignments, links, and schedules. DOCTOR accounts have read-only self-profile and self-schedule pages resolved from the authenticated user. Schedule dates and `HH:mm` times use the `Asia/Colombo` calendar convention; durations are 15, 20, 30, 45, or 60 minutes.
