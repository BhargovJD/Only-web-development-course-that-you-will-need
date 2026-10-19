# Project documentation

This is a backend API for user accounts. It registers users, logs them in, verifies email, resets passwords, and issues JSON Web Tokens (JWTs). There is no frontend in this repository. You talk to it with Postman, Thunder Client, or `curl.exe`.

The base URL while you develop locally is:

```text
http://localhost:8000
```

## 1. How a request moves through the app

Every request follows the same path.

1. `src/index.js` loads `.env`, then starts the Express app and connects to MongoDB.
2. `src/app.js` runs shared middleware: CORS, JSON body parsing, form parsing, static files, and cookies.
3. The URL decides which router runs.
   - `/api/v1/healthcheck` goes to `src/routes/healthcheck.routes.js`.
   - `/api/v1/auth/...` goes to `src/routes/auth.routes.js`.
   - `/` returns a short plain-text greeting.
4. A route may run a validator, then `validateRequest`, then `verifyJWT`, then a controller.
5. The controller uses the `User` model, and sometimes the mail helper, then sends a JSON response.
6. If a controller throws an `ApiError`, `asyncHandler` passes it to the error handler at the bottom of `src/app.js`.

```text
Client
  -> src/index.js          (env, database, listen)
  -> src/app.js            (CORS, JSON, cookies)
  -> src/routes/*.js       (which URL, which checks)
  -> src/validators        (is the body well formed?)
  -> src/middlewares       (is the token valid?)
  -> src/controllers       (the actual work)
  -> src/models            (MongoDB)
  -> src/utils             (response shape, email, errors)
```

## 2. Start the project

Install dependencies once:

```text
npm install
```

MongoDB must be running on your machine. The connection string in `.env` points at a local database named `projectsmanagement`.

Start the API in development:

```text
npm run dev
```

That runs `nodemon src/index.js`, so the server restarts when you save a file. `npm start` runs the same entry file once, without restarting.

When it is ready, the terminal prints:

```text
MongoDB connected
Server is running on port 8000
```

This project uses ES modules (`"type": "module"` in `package.json`). Every local import must end with `.js`.

## 3. Environment variables

Create a `.env` file in the project root. Do not commit real secrets. The names below are the ones the code reads.

| Name | Used by | What it does |
|---|---|---|
| `PORT` | `src/index.js` | Port the server listens on. Falls back to `3000` if missing. The sample project uses `8000`. |
| `MONGO_URI` | `src/db/index.js` | MongoDB connection string. |
| `CORS_ORIGIN` | `src/app.js` | Allowed browser origins, separated by commas. If it is missing, every origin is allowed. |
| `ACCESS_TOKEN_SECRET` | User model and `verifyJWT` | Secret used to sign and check the access token. |
| `ACCESS_TOKEN_EXPIRES_IN` | User model | Access token lifetime, for example `15m`. |
| `REFRESH_TOKEN_SECRET` | User model and refresh controller | Secret used to sign and check the refresh token. |
| `REFRESH_TOKEN_EXPIRES_IN` | User model | Refresh token lifetime, for example `7d`. |
| `MAILTRAP_SMTP_HOST` | `src/utils/mail.js` | SMTP host. |
| `MAILTRAP_SMTP_PORT` | `src/utils/mail.js` | SMTP port. |
| `MAILTRAP_SMTP_USER` | `src/utils/mail.js` | SMTP username. |
| `MAILTRAP_SMTP_PASSWORD` | `src/utils/mail.js` | SMTP password. |
| `MAILTRAP_SMTP_FROM` | `src/utils/mail.js` | From address on outgoing mail. |
| `FORGOT_PASSWORD_URL` | Forgot-password controller | Front-end page that receives the reset token, for example `http://localhost:3000/forgot-password`. |
| `NODE_ENV` | Cookie helper | When this is `production`, auth cookies are marked `secure` and are only sent over HTTPS. |

`src/index.js` calls `dotenv.config()` before it imports `src/app.js`. That order matters, because `app.js` reads `CORS_ORIGIN` as soon as it loads.

## 4. File by file

### `src/index.js`

This is the entry point. It loads `.env`, imports the Express app, connects to MongoDB, and listens on `PORT`. If the database connection fails, the process exits.

### `src/app.js`

Builds the Express application.

- `cors` allows browser clients to call the API. `credentials: true` lets browsers send cookies.
- `express.json` reads JSON bodies up to 16 KB and puts them on `req.body`.
- `express.urlencoded` does the same for form bodies.
- `express.static("public")` serves files from the `public` folder. `public/images` is currently empty.
- `cookie-parser` reads the `Cookie` header onto `req.cookies`.
- Mounts the health-check router at `/api/v1/healthcheck`.
- Mounts the auth router at `/api/v1/auth`.
- `GET /` sends the text `Hello from Express with ES modules!`.
- The last function is the error handler. It turns an `ApiError` into JSON.

### `src/db/index.js`

Exports `connectDB`. It calls `mongoose.connect(process.env.MONGO_URI)` and logs `MongoDB connected`.

The Mongoose model name is `user`, so MongoDB stores documents in the `users` collection.

### `src/models/user.models.js`

Defines the `User` model and the methods the controllers call.

Stored fields:

| Field | Meaning |
|---|---|
| `avatar.url`, `avatar.localPath` | Profile image. Defaults to a placeholder URL. |
| `userName` | Required, unique, stored in lowercase. |
| `email` | Required, unique, stored in lowercase. |
| `fullName` | Optional. Registration does not ask for it. |
| `password` | Required. Stored as a bcrypt hash, never as plain text. |
| `isEmailVerified` | Starts as `false`. |
| `refreshToken` | Latest refresh token. Empty after logout. |
| `forgotPasswordToken`, `forgotPasswordExpiry` | Hashed reset token and its expiry. |
| `emailVerificationToken`, `emailVerificationExpiry` | Hashed verification token and its expiry. |
| `createdAt`, `updatedAt` | Added automatically. |

Methods:

- A pre-save hook hashes `password` with bcrypt when that field changes.
- `isPasswordCorrect(plainPassword)` compares a plain password with the hash.
- `generateAccessToken()` signs a JWT with `userId` and `email`. The id field in the token is `userId`, not `_id`.
- `generateRefreshToken()` signs a longer-lived JWT with the same payload.
- `generateTemporaryToken()` creates a random token for email verification and password reset. The email or link gets the raw token. The database stores a SHA-256 hash. The token expires after **2 minutes**.

### `src/routes/healthcheck.routes.js`

`GET /` on this router becomes `GET /api/v1/healthcheck`. It calls `healthCheck`.

### `src/routes/auth.routes.js`

Maps each auth URL to its validator, middleware, and controller. Public routes do not require a logged-in user. Secure routes run `verifyJWT` first.

| Method and path | Middleware | Controller |
|---|---|---|
| `POST /register` | register validator, `validateRequest` | `registerUser` |
| `POST /login` | login validator, `validateRequest` | `loginUser` |
| `GET /verify-email/:verificationToken` | none | `verifyEmail` |
| `POST /refresh-token` | none | `refreshAccessToken` |
| `POST /forgot-password` | forgot-password validator, `validateRequest` | `forgotPasswordRequest` |
| `POST /reset-password/:resetToken` | reset validator, `validateRequest` | `resetForgotPassword` |
| `POST /logout` | `verifyJWT` | `logoutUser` |
| `GET /current-user` | `verifyJWT` | `getCurrentUser` |
| `POST /change-current-password` | `verifyJWT`, password validator, `validateRequest` | `changeCurrentPassword` |
| `POST /reset-email-verification` | `verifyJWT` | `resendEmailVerification` |

None of these routes read query parameters.

### `src/controllers/healthcheck.controllers.js`

Returns HTTP 200 with the message `Server is running...`. It does not check the database.

### `src/controllers/auth.controller.js`

Contains the account actions. A private helper, `generateAccessAndRefreshToken`, creates both tokens and saves the refresh token on the user.

Cookie options used by login, refresh, and logout:

- `httpOnly: true`, so browser JavaScript cannot read the cookie.
- `secure: true` only when `NODE_ENV` is `production`.
- `sameSite: "lax"`.

Login sets two cookies, `accessToken` and `refreshToken`, and also returns both tokens in the JSON body. Refresh sets both cookies again, but the JSON body contains only the new access token. After a refresh, read the new refresh token from the `Set-Cookie` header.

Email verification is not required for login. The check exists in `loginUser` and is commented out.

`sendEmail` returns `false` when Mailtrap rejects a message. The register, forgot-password, and resend controllers do not check that return value, so those routes can still respond with success when the email was not delivered. Watch the server terminal if a message does not arrive.

### `src/middlewares/validator.middleware.js`

`validateRequest` collects errors from express-validator. If any rule failed, it stops the request with HTTP 422 and this message: `Received data is not valid`. Each item in `errors` looks like `{ "email": "Email is required" }`.

### `src/middlewares/auth.middleware.js`

`verifyJWT` protects secure routes.

1. It reads `req.cookies.accessToken`.
2. If that cookie is missing, it reads `Authorization: Bearer <token>`.
3. It verifies the signature and expiry with `ACCESS_TOKEN_SECRET`.
4. It loads the user with `decodedToken.userId`.
5. It removes `password`, `refreshToken`, `emailVerificationToken`, and `emailVerificationExpiry` from that user.
6. It sets `req.user` and calls `next()`.

No token produces `401 Unauthorized`. A bad, expired, or unknown token produces `401 Invalid access token`.

### `src/validators/index.js`

Each export is a function that returns a list of body rules. Routes call them like `userRegisterValidator()`.

| Validator | Required body fields |
|---|---|
| `userRegisterValidator` | `email`, `userName`, `password` |
| `userLoginValidator` | `email`, `password` |
| `userChangeCurrentPasswordValidator` | `currentPassword`, `newPassword` |
| `userForgotPasswordRequestValidator` | `email` |
| `userResetForgotPasswordValidator` | `newPassword` |

Email and username are trimmed and lowercased before the controller sees them. Passwords are trimmed. Empty strings fail validation.

### `src/utils/api-response.js`

Success JSON always has this shape:

```json
{
  "statusCode": 200,
  "message": "Short description",
  "data": {},
  "success": true
}
```

`success` is `true` when `statusCode` is below 400. If `data` is omitted, that field is left out of the JSON. The health check does this.

### `src/utils/api-error.js`

`ApiError` carries `statusCode`, `message`, `errors`, and `data: null`. The handler in `app.js` sends:

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [],
  "data": null
}
```

### `src/utils/async-handler.js`

Wraps an async controller. A thrown error is forwarded to the Express error handler instead of crashing the request.

### `src/utils/mail.js`

- `sendEmail` builds HTML and plain text with Mailgen and sends it through Nodemailer.
- `emailVerificationEmailGenerator(name, token, link)` builds the verification email. The button uses `link`.
- `forgotPasswordEmailGenerator(name, token, link)` builds the reset email. The button uses `link`.

The verification link points at this API:

```text
http://localhost:8000/api/v1/auth/verify-email/<raw-token>
```

The reset link points at the front end:

```text
http://localhost:3000/forgot-password/<raw-token>
```

To finish a reset, take that raw token and call `POST /api/v1/auth/reset-password/<raw-token>`.

### `src/utils/constants.js`

Defines role names (`admin`, `project_admin`, `member`) and task statuses (`todo`, `in_progress`, `done`). No current route imports this file. It is ready for later project and task features.

## 5. Shared request rules

- Send JSON bodies with the header `Content-Type: application/json`.
- No current route uses query parameters.
- Secure routes need the access token in the `accessToken` cookie or in this header:

```text
Authorization: Bearer <accessToken>
```

The cookie is checked first. A browser that stored the login cookies can call secure routes without the header. Postman does this when its cookie jar is enabled.

- Opening a `POST` route in the browser address bar sends `GET`. Express answers with HTML: `Cannot GET /api/v1/auth/login`. Use a `POST` request instead.
- A broken JSON body returns HTTP 400. The `message` is the parser error.
- Validation failures return HTTP 422 before the controller runs.

## 6. Suggested test order

Use a new email address so you do not collide with an existing user. Do these steps within 2 minutes of each email, because verification and reset tokens expire that quickly.

1. `GET /api/v1/healthcheck`
2. `POST /api/v1/auth/register`
3. Open the verification link from the email, or call `GET /api/v1/auth/verify-email/<token>`
4. `POST /api/v1/auth/login` and keep the cookies or the `accessToken`
5. `GET /api/v1/auth/current-user`
6. `POST /api/v1/auth/change-current-password`
7. `POST /api/v1/auth/refresh-token`
8. `POST /api/v1/auth/forgot-password`
9. `POST /api/v1/auth/reset-password/<token>`
10. Log in again with the new password
11. `POST /api/v1/auth/reset-email-verification` only if `isEmailVerified` is still `false`
12. `POST /api/v1/auth/logout`

The examples below use `curl.exe` so they work in PowerShell, where `curl` is a different command.

## 7. API reference

### GET `/`

Confirms the process is serving HTTP. This is plain text, not the usual JSON envelope.

```text
curl.exe http://localhost:8000/
```

Response `200`:

```text
Hello from Express with ES modules!
```

### GET `/api/v1/healthcheck`

Confirms the Express app is handling API routes. It does not require a body, token, or database check.

```text
curl.exe http://localhost:8000/api/v1/healthcheck
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Server is running...",
  "success": true
}
```

### POST `/api/v1/auth/register`

Creates a user, hashes the password, stores a verification token, and sends a verification email.

Body:

| Field | Required | Rules |
|---|---|---|
| `email` | yes | Valid email. Stored in lowercase. |
| `userName` | yes | Non-empty string. Stored in lowercase. |
| `password` | yes | Non-empty string. Hashed before it is stored. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"ada@example.com\",\"userName\":\"ada\",\"password\":\"pass1234\"}"
```

Response `201`:

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6740exampleid",
      "avatar": {
        "url": "https://placehold.co/200x200",
        "localPath": ""
      },
      "userName": "ada",
      "email": "ada@example.com",
      "isEmailVerified": false,
      "createdAt": "2026-10-19T09:00:00.000Z",
      "updatedAt": "2026-10-19T09:00:00.000Z"
    },
    "message": "User registered successfully. Please verify your email to continue"
  },
  "success": true
}
```

The password and tokens are not included.

Errors:

| Status | When | Message |
|---|---|---|
| 422 | Missing or invalid email, username, or password | `Received data is not valid` |
| 409 | Email already exists | `User with this email already exists` |
| 409 | Username already exists | `Username is already taken` |
| 500 | User was created but could not be loaded again | `Failed to register user` |

### GET `/api/v1/auth/verify-email/:verificationToken`

Marks the matching user's email as verified. The token is the raw value from the email link, not the hash stored in MongoDB.

URL parameter:

| Name | Required | Meaning |
|---|---|---|
| `verificationToken` | yes | Raw token from the verification email. |

No body and no auth header.

```text
curl.exe http://localhost:8000/api/v1/auth/verify-email/paste-the-token-here
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "isEmailVerified": true,
    "message": "Email verified successfully"
  },
  "success": true
}
```

Errors:

| Status | When | Message |
|---|---|---|
| 400 | Token does not match a user, or it is older than 2 minutes | `Invalid or expired verification token` |

A successful call deletes the stored token, so the same link cannot be used twice.

### POST `/api/v1/auth/login`

Checks the email and password, saves a new refresh token, and returns both tokens.

Body:

| Field | Required | Rules |
|---|---|---|
| `email` | yes | Valid email. |
| `password` | yes | Non-empty string. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -c cookies.txt -d "{\"email\":\"ada@example.com\",\"password\":\"pass1234\"}"
```

`-c cookies.txt` saves the `accessToken` and `refreshToken` cookies for the next commands.

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6740exampleid",
      "userName": "ada",
      "email": "ada@example.com",
      "isEmailVerified": false
    },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "message": "Login successful"
  },
  "success": true
}
```

The response also sets:

```text
Set-Cookie: accessToken=<jwt>; HttpOnly; SameSite=Lax
Set-Cookie: refreshToken=<jwt>; HttpOnly; SameSite=Lax
```

Errors:

| Status | When | Message |
|---|---|---|
| 422 | Missing or invalid email or password | `Received data is not valid` |
| 401 | Unknown email or wrong password | `Invalid email or password` |
| 500 | Tokens could not be created or the user could not be reloaded | `Failed to generate access and refresh token` or `Failed to login user` |

An unverified email can still log in.

### GET `/api/v1/auth/current-user`

Returns the user attached by `verifyJWT`.

Auth: `accessToken` cookie or `Authorization: Bearer <accessToken>`.

No body.

```text
curl.exe http://localhost:8000/api/v1/auth/current-user -b cookies.txt
```

Or, without cookies:

```text
curl.exe http://localhost:8000/api/v1/auth/current-user -H "Authorization: Bearer paste-access-token"
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Current user fetched successfully",
  "data": {
    "_id": "6740exampleid",
    "avatar": {
      "url": "https://placehold.co/200x200",
      "localPath": ""
    },
    "userName": "ada",
    "email": "ada@example.com",
    "isEmailVerified": true,
    "createdAt": "2026-10-19T09:00:00.000Z",
    "updatedAt": "2026-10-19T09:00:00.000Z"
  },
  "success": true
}
```

`password`, `refreshToken`, and the email-verification fields are removed. If a reset is in progress, `forgotPasswordToken` and `forgotPasswordExpiry` can still appear on this object.

Errors:

| Status | When | Message |
|---|---|---|
| 401 | No cookie and no Authorization header | `Unauthorized` |
| 401 | Token is expired, signed with the wrong secret, or the user was deleted | `Invalid access token` |

### POST `/api/v1/auth/refresh-token`

Issues a new access token and replaces the refresh token. Send the current refresh token in the `refreshToken` cookie or in the JSON body. The cookie wins if both are present.

Body, only when you are not sending the cookie:

| Field | Required | Meaning |
|---|---|---|
| `refreshToken` | yes, if there is no cookie | The refresh token from login. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/refresh-token -b cookies.txt -c cookies.txt
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "<new-jwt>"
  },
  "success": true
}
```

Both cookies are replaced. The new refresh token is in `Set-Cookie`, not in `data`. The previous refresh token stops working.

Errors:

| Status | When | Message |
|---|---|---|
| 401 | No refresh token was sent | `Refresh token is required. Unauthorized access.` |
| 401 | Signature is bad or the token is expired | `Invalid or expired refresh token.` |
| 401 | `userId` inside the token does not match a user | `User not found. Invalid refresh token.` |
| 401 | Token does not match the one saved on the user | `Refresh token is invalid. Unauthorized access.` |

### POST `/api/v1/auth/logout`

Clears the saved refresh token and clears both auth cookies. The access token itself stays valid until it expires. A client that still has a copy of that access token can call secure routes until then.

Auth: `accessToken` cookie or `Authorization: Bearer <accessToken>`.

No body.

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/logout -b cookies.txt -c cookies.txt
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Logout successful",
  "data": {
    "message": "Logout successful"
  },
  "success": true
}
```

Errors are the same 401 cases as `current-user`.

### POST `/api/v1/auth/change-current-password`

Changes the password of the logged-in user. The new password is hashed by the model.

Auth: access token.

Body:

| Field | Required | Rules |
|---|---|---|
| `currentPassword` | yes | Must match the stored password. |
| `newPassword` | yes | Must be different from the current password. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/change-current-password -H "Content-Type: application/json" -b cookies.txt -d "{\"currentPassword\":\"pass1234\",\"newPassword\":\"pass5678\"}"
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  },
  "success": true
}
```

Errors:

| Status | When | Message |
|---|---|---|
| 401 | Missing or bad access token | `Unauthorized` or `Invalid access token` |
| 422 | A password field is missing | `Received data is not valid` |
| 404 | The user id from the token no longer exists | `User not found` |
| 401 | `currentPassword` is wrong | `Invalid old password` |
| 400 | `newPassword` equals the current password | `New password must be different from the current password` |

### POST `/api/v1/auth/forgot-password`

Creates a 2-minute reset token and emails a link to `FORGOT_PASSWORD_URL/<raw-token>`.

Body:

| Field | Required | Rules |
|---|---|---|
| `email` | yes | Valid email of an existing user. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/forgot-password -H "Content-Type: application/json" -d "{\"email\":\"ada@example.com\"}"
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Password reset email sent successfully",
  "data": {
    "message": "Password reset email sent successfully"
  },
  "success": true
}
```

Errors:

| Status | When | Message |
|---|---|---|
| 422 | Missing or invalid email | `Received data is not valid` |
| 404 | No user has that email | `User not found` |

This route says the email was sent even if Mailtrap later rejects it. Check the server log if the inbox stays empty.

### POST `/api/v1/auth/reset-password/:resetToken`

Sets a new password when the raw reset token is still valid. The token comes from the last path segment of the forgot-password email link.

URL parameter:

| Name | Required | Meaning |
|---|---|---|
| `resetToken` | yes | Raw token from the reset link. |

Body:

| Field | Required | Rules |
|---|---|---|
| `newPassword` | yes | Non-empty string. The field name is `newPassword`, not `password`. |

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/reset-password/paste-the-token-here -H "Content-Type: application/json" -d "{\"newPassword\":\"pass9012\"}"
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "message": "Password reset successfully"
  },
  "success": true
}
```

Errors:

| Status | When | Message |
|---|---|---|
| 422 | `newPassword` is missing | `Received data is not valid` |
| 400 | Token does not match, or it is older than 2 minutes | `Invalid or expired reset token` |

The token is deleted after a successful reset.

### POST `/api/v1/auth/reset-email-verification`

Sends a new verification email to the logged-in user. The route name says "reset", and the controller function is `resendEmailVerification`.

Auth: access token.

No body.

```text
curl.exe -X POST http://localhost:8000/api/v1/auth/reset-email-verification -b cookies.txt
```

Response `200`:

```json
{
  "statusCode": 200,
  "message": "Email verification sent successfully",
  "data": {
    "message": "Email verification sent successfully"
  },
  "success": true
}
```

The new link is:

```text
http://localhost:8000/api/v1/auth/verify-email/<new-raw-token>
```

Errors:

| Status | When | Message |
|---|---|---|
| 401 | Missing or bad access token | `Unauthorized` or `Invalid access token` |
| 404 | User from the token no longer exists | `User not found` |
| 409 | Email is already verified | `Email already verified` |

## 8. What is not built yet

The constants file describes roles and task statuses, but there are no project, task, or role routes. Registration does not accept `fullName` or an avatar upload. Login does not block unverified users.
