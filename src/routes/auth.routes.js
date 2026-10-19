// Imports the Router function from Express to create a modular route handler.
import { Router } from "express";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js";

import { validateRequest } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Imports the registerUser controller that handles user registration logic.
import { registerUser } from "../controllers/auth.controller.js";
import { loginUser } from "../controllers/auth.controller.js";
import { logoutUser } from "../controllers/auth.controller.js";
// Creates a new Express router instance.
const router = Router();

// Defines the POST /register route and connects it to the registerUser controller.
// When a POST request reaches this route, registerUser executes.
// Public routes
router.route("/register").post(userRegisterValidator(), validateRequest, registerUser);
router.route("/login").post(userLoginValidator(), validateRequest, loginUser);
router.route("verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordRequestValidator(), validateRequest, forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(), validateRequest, resetForgotPassword);



// Secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-current-password").post(verifyJWT, userChangeCurrentPasswordValidator(), validateRequest, changeCurrentPassword);
router.route("/reset-email-verification").post(verifyJWT, resetEmailVerification);





// Exports the router so it can be imported and mounted in the main Express application.
export default router;