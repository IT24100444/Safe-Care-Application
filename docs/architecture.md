# Architecture

```text
Browser -> React + Vite (:5173)
        -> AuthContext / shared Axios client
        -> Node.js / Express (:5000)
        -> authentication and role middleware
        -> Mongoose -> MongoDB Atlas

FastAPI service (:8000) -> future non-AI Python functions
                         -> may later call Node over HTTP
```

React never connects to MongoDB. Frontend role checks affect navigation only; authorization is enforced from the user reloaded by Node middleware. `app.js` remains importable without starting HTTP or MongoDB. FastAPI remains separate, independently testable, and non-AI.

The current business flow is: React public resource/doctor views and role-aware management views → shared Axios client → Express routes → authentication/RBAC → thin controllers → facility, doctor, and schedule services → Mongoose → Atlas. Doctor availability is generated in backend business logic from active schedule intervals; no slot arrays are persisted. FastAPI remains independent and contains no healthcare domain or AI logic.
