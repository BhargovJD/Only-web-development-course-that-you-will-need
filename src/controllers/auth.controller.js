
import User from "../models/User.js"; // Imports the User model to interact with the users collection.
import ApiResponse from "../utils/apiResponse.js"; // Imports the standard API success response class.
import ApiError from "../utils/apiError.js"; // Imports the custom API error class.
import asyncHandler from "express-async-handler"; // Automatically forwards async errors to Express error middleware.
import sendEmail from "../utils/sendEmail.js"; // Imports the utility used to send emails.
import { emailVerificationMailgenContent } from "../utils/emailTemplates.js"; // Imports the email verification template. Adjust the path/name to match your project.

// Generates an access token and a refresh token for a given user.
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Finds the user in the database using their MongoDB ID.
        const user = await User.findById(userId);

        // Throws an error if the user does not exist.
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generates a short-lived access token using the User model method.
        const accessToken = user.generateAccessToken();

        // Generates a refresh token used to obtain new access tokens.
        const refreshToken = user.generateRefreshToken();

        // Stores the refresh token in the user's database document.
        // Confirm whether your schema expects a string or an array.
        user.refreshTokens = refreshToken;

        // Saves the updated user without running schema validation.
        // This option is useful when updating token fields only.
        await user.save({ validateBeforeSave: false });

        // Returns both tokens to the calling function.
        return { accessToken, refreshToken };

    } catch (error) {
        // Preserves known application errors, such as "User not found".
        if (error instanceof ApiError) {
            throw error;
        }

        // Converts unexpected errors into a server error.
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
};

// Handles user registration requests.
const registerUser = asyncHandler(async (req, res) => {

    // Extracts the user's name, email, and password from the request body.
    const { name, email, password } = req.body;

    // Checks whether a user with the same email already exists.
    const existingUser = await User.findOne({ email });

    // Prevents duplicate registration using the same email address.
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // Creates a new user in the database.
    // The password should be hashed by a pre-save hook in the User model.
    // Email verification is initially marked as incomplete.
    const user = await User.create({
        name,
        email,
        password,
        isEmailVerified: false
    });

    // Generates a temporary verification token and its expiration time.
    // The raw token is returned for the email link; the hashed token is stored.
    const {
        unHashedToken,
        hashedToken,
        tokenExpiry
    } = user.generateTemporaryToken();

    // Saves the hashed verification token in the user's document.
    user.emailVerificationToken = hashedToken;

    // Sets the expiration time after which the token is no longer valid.
    user.emailVerificationTokenExpiry = tokenExpiry;

    // Saves the verification details without rerunning schema validation.
    await user.save({ validateBeforeSave: false });

    // Builds the verification URL using the current protocol and host.
    const verificationURL =
        `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email?verify-email-token=${unHashedToken}`;

    // Sends the email containing the verification link.
    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username ?? user.name,
            verificationURL
        )
    });

    // Retrieves the newly created user while excluding sensitive fields.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens -emailVerificationToken -emailVerificationTokenExpiry"
    );

    // Ensures that the user was successfully retrieved.
    if (!createdUser) {
        throw new ApiError(500, "Failed to register user");
    }

    // Returns HTTP 201 with the user details and verification instructions.
    return res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            {
                user: createdUser,
                message: "User registered successfully. Please verify your email to continue"
            }
        )
    );
});

// Exports the functions so that routes can use them.
export { registerUser };
