# Development setup (macOS)

Install Node.js/npm, Python 3.11 or newer, and Git. Clone or open the repository root.

Frontend: `cd frontend/careroute-web`, run `npm install`, then `npm run dev`. Use `npm test`, `npm run lint`, and `npm run build` for validation.

Node: `cd backend/node-api`, run `npm install`, copy `.env.example` to `.env`, set a real Atlas `MONGODB_URI` and strong random `JWT_SECRET`, and run `npm run dev`. `JWT_EXPIRES_IN` defaults to `1h`. Run `npm test` and `npm run lint` without a database. Atlas must allow your current IP and the URI's database user must have appropriate access.

Python: `cd python-service/fastapi-service`, run `python3 -m venv .venv`, `source .venv/bin/activate`, `pip install -r requirements.txt`, and `uvicorn app.main:app --reload --port 8000`. Validate with `pytest` and `ruff check .`.

Never commit `.env`; service-specific `.env.example` files document supported values.

For development ADMIN provisioning, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the process environment and run `node scripts/createAdmin.js` from `backend/node-api`. The password must follow the same 8–128 character letter-and-number policy. The script requires Atlas connectivity, rejects duplicates, hashes the password, closes the connection, and never prints credentials. Do not add these values to source control.
