
import { User } from "../models/user.models.js"; // Imports the User model to interact with the users collection.
import { ApiResponse } from "../utils/api-response.js"; // Imports the standard API success response class.
import { ApiError } from "../utils/api-error.js"; // Imports the custom API error class.
import { asyncHandler } from "../utils/async-handler.js"; // Automatically forwards async errors to Express error middleware.
import { sendEmail, emailVerificationEmailGenerator } from "../utils/mail.js"; // Imports the email sender and verification template.

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

    // Extracts the fields expected by the User schema from the request body.
    const { userName, email, password } = req.body;

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
        userName,
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
        mailgenContent: emailVerificationEmailGenerator(
            user.email,
            unHashedToken,
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


const loginUser = asyncHandler(async (req, res) => {

    // Extracts the email and password sent by the client in the request body.
    const { email, password } = req.body;

    // Searches the database for a user with the provided email address.
    const user = await User.findOne({ email });

    // Returns a generic error if the email does not match any user.
    // Using the same message for email and password errors avoids revealing which is incorrect.
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Checks whether the submitted password matches the user's stored hashed password.
    // This method should be defined in your User model.
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    // Rejects the login if the password is incorrect.
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Prevents users from logging in until they have verified their email.
    // Include this check if email verification is mandatory in your application.
    // if (!user.isEmailVerified) {
    //     throw new ApiError(403, "Please verify your email before logging in");
    // }

    // Generates a new access token and refresh token for the authenticated user.
    // The helper also saves the refresh token in the database.
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    // Retrieves the updated user document while excluding sensitive fields.
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshTokens -emailVerificationToken -emailVerificationTokenExpiry"
    );

    // Ensures the user document was successfully retrieved.
    if (!loggedInUser) {
        throw new ApiError(500, "Failed to login user");
    }

    // Configures cookie security options.
    const options = {
        httpOnly: true, // Prevents client-side JavaScript from reading these cookies.
        secure: process.env.NODE_ENV === "production", // Requires HTTPS in production; allows HTTP during local development.
        sameSite: "lax" // Helps protect against cross-site request forgery in common navigation scenarios.
    };

    // Sends an HTTP 200 response, sets both tokens as cookies,
    // and returns the user details and tokens in the JSON response.
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, "Login successful", {
                user: loggedInUser,
                accessToken,
                refreshToken,
                message: "Login successful"
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
await User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: ""}}, {new: true});
const options = {
    httpOnly: true,
    secure: true,
};

return res.status(200).clearCookie("refreshToken", options).clearCookie("accessToken", options).json(new ApiResponse(200, "Logout successful", { message: "Logout successful" }));
});


// Exports the functions so that routes can use them.
export { registerUser, loginUser, logoutUser };
