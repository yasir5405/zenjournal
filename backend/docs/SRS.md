# Project Requirement Document (PRD) – ZenJournal
1. Project Overview

ZenJournal is a mental health journaling web application where users can securely log their daily thoughts and experiences. In future stages, AI will provide reflective insights and patterns to help users with mental wellness.

At the current stage, the focus is on user authentication (signup, login, JWT protection).

2. Objectives / Goals

Provide a secure signup & login system.

Store users in MongoDB with hashed passwords.

Ensure only authenticated users can access journal-related routes (future).

Maintain clean and scalable code using modular structure.

3. Scope
In-Scope (Current Stage ✅)

User signup with validation (Zod).

User login with password check & JWT token.

JWT-based authentication middleware (verifyJWT).

Error handling middleware for consistent API responses.

Dummy .env file for environment variables.

Out-of-Scope (Future Stages 🚧)

Journal CRUD (Create, Read, Update, Delete).

AI-powered reflections & insights.

User profile & settings.

Deployment & scaling.

4. Functional Requirements

Signup

User enters name, email, password.

System validates inputs.

System stores hashed password.

Duplicate emails not allowed.

Login

User enters email, password.

System verifies credentials.

On success, a JWT token is set in cookies.

JWT Verification

Middleware checks for valid JWT in cookies.

Unauthorized requests are rejected.

Error Handling

Centralized error handler returns JSON responses with proper codes.

5. Non-Functional Requirements

Security:

Passwords hashed with bcrypt.

JWT authentication for protected routes.

Maintainability:

Modular structure (controllers, models, utils, middlewares).

Consistency:

Standard error format across APIs.

6. Tech Stack & Tools

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Validation: Zod

Authentication: JWT, bcrypt

Environment Management: dotenv

Version Control: Git + GitHub

7. Deliverables (Current Stage)

User authentication APIs: /signup, /login.

JWT middleware for route protection.

Dummy .env.example file.

README.md with setup instructions.