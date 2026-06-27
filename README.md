# CollabDoc

CollabDoc is a full-stack collaborative document editor with a Spring Boot backend and a Vite + React frontend.

## Project Structure

- `backend/workflow-engine/` - Spring Boot application, WebSocket/STOMP support, persistence, and API services.
- `frontend/collabdoc-frontend/` - React application for the browser UI.

## Getting Started

### Backend

```bash
cd backend/workflow-engine
./gradlew bootRun
```

### Frontend

```bash
cd frontend/collabdoc-frontend
npm install
npm run dev
```

## Notes

- The backend exposes the API and WebSocket endpoints used by the frontend.
- Keep environment-specific values in local `.env` or `application-local*.properties` files.