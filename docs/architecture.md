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

The current business flow is: React public facility/service views and auth-aware admin views → shared Axios client → Express routes → authentication/RBAC → thin controllers → facility and health-service services → Mongoose → Atlas. FastAPI remains independent and contains no facility, database, or AI logic.
