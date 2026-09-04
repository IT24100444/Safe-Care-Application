# Development setup (macOS)

Install Node.js/npm, Python 3.11 or newer, and Git. Clone or open the repository root.

Frontend: `cd frontend/careroute-web`, run `npm install`, then `npm run dev`. Use `npm test`, `npm run lint`, and `npm run build` for validation.

Node: `cd backend/node-api`, run `npm install`, copy `.env.example` to `.env`, set a real Atlas `MONGODB_URI` and strong random `JWT_SECRET`, and run `npm run dev`. `JWT_EXPIRES_IN` defaults to `1h`. Run `npm test` and `npm run lint` without a database. Atlas must allow your current IP and the URI's database user must have appropriate access.

Python: `cd python-service/fastapi-service`, run `python3 -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt`, and `uvicorn app.main:app --reload --port 8000`. Validate with `pytest` and `ruff check .`.

Never commit `.env`; service-specific `.env.example` files document supported values.

For development ADMIN provisioning, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the process environment and run `node scripts/createAdmin.js` from `backend/node-api`. The password must follow the same 8–128 character letter-and-number policy. The script requires Atlas connectivity, rejects duplicates, hashes the password, closes the connection, and never prints credentials. Do not add these values to source control.

For DOCTOR provisioning, set `DOCTOR_NAME`, `DOCTOR_EMAIL`, and `DOCTOR_PASSWORD`, then run `npm run create:doctor` from `backend/node-api`. The script applies the same password policy, hashes with bcrypt cost 12, rejects duplicate email, prints no credentials, and always closes the database connection. It creates only the User; use the ADMIN doctor screen to create or link the professional profile. There is no public DOCTOR registration endpoint.

Doctor schedule dates are interpreted as Asia/Colombo calendar dates and times use `HH:mm`. ADMIN manages schedule changes. DOCTOR self pages are read-only. Computed availability is not bookable until the appointment feature is implemented.
