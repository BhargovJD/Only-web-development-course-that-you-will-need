
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


const getCurrentUser = asyncHandler(async (req, res) => {

    // req.user contains the authenticated user's information.
    // It is populated by the verifyJWT middleware.
    
    // Return HTTP 200 with the user's details and a success message.
    return res.status(200).json(
        new ApiResponse(
            200,
            "Current user fetched successfully",
            req.user
        )
    );
});

// Controller to verify a user's email address
const verifyEmail = asyncHandler(async (req, res) => {

    // Extract the verification token from the URL parameters.
    // Example URL: /verify-email/abc123xyz
    const { verificationToken } = req.params;

    // If the token is missing, return a 400 Bad Request error.
    if (!verificationToken) {
        throw new ApiError(
            400,
            "Email verification token is required"
        );
    }

    // Hash the token received from the user using SHA-256.
    // This must match the hashing method used when the token was generated.
    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    // Find the user whose stored verification token matches the hash.
    // Also check that the token's expiry time is still in the future.
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    });

    // If no matching user is found, the token is invalid or expired.
    if (!user) {
        throw new ApiError(
            400,
            "Invalid or expired verification token"
        );
    }

    // Remove the verification token so it cannot be reused.
    user.emailVerificationToken = undefined;

    // Remove the token's expiry time as it is no longer needed.
    user.emailVerificationExpiry = undefined;

    // Mark the user's email address as verified.
    user.isEmailVerified = true;

    // Save the changes to MongoDB.
    // Validation is skipped because we are updating verification fields.
    await user.save({ validateBeforeSave: false });

    // Send a successful response to the client.
    return res.status(200).json(
        new ApiResponse(
            200,
            "Email verified successfully",
            {
                isEmailVerified: true,
                message: "Email verified successfully"
            }
        )
    );
});



const resendEmailVerification = asyncHandler(async (req, res) => {

    // Find the logged-in user using the ID set by verifyJWT middleware.
    const user = await User.findById(req.user._id);

    // If the user does not exist, return a 404 Not Found error.
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // If the email is already verified, there is no need to resend verification.
    // HTTP 409 indicates a conflict with the current resource state.
    if (user.isEmailVerified) {
        throw new ApiError(409, "Email already verified");
    }

    // Generate a new temporary verification token.
    // unHashedToken: original token sent to the user's email.
    // hashedToken: hash stored in the database.
    // tokenExpiry: expiration time of the token.
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    // Store the hashed verification token in the user document.
    user.emailVerificationToken = hashedToken;

    // Store the token's expiration time.
    user.emailVerificationExpiry = tokenExpiry;

    // Save the new token and expiry in MongoDB.
    // This option skips Mongoose validation; use it only if necessary.
    await user.save({ validateBeforeSave: false });

    // Send the verification email to the user's email address.
    await sendEmail({
        email: user.email,

        // Subject displayed in the recipient's email inbox.
        subject: "Please verify your email",

        // Generate the email body with the user's name and verification link.
        mailgenContent: emailVerificationMailGenerator(
            user.userName,

            // Construct the verification URL using the request protocol,
            // host, API route, and original verification token.
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`
        )
    });

    // Return HTTP 200 if the email-sending operation completes successfully.
    return res.status(200).json(
        new ApiResponse(
            200,
            "Email verification sent successfully",
            {
                message: "Email verification sent successfully"
            }
        )
    );
});



const refreshAccessToken = asyncHandler(async (req, res) => {

    // Get the refresh token from the cookie first.
    // If the cookie is unavailable, check the request body.
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    // Reject the request if the client did not provide a refresh token.
    if (!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Refresh token is required. Unauthorized access."
        );
    }

    let decodedToken;

    try {
        // Verify the refresh token using the refresh token secret.
        // This checks the token's signature and expiration.
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        // Handle invalid, expired, or incorrectly signed JWTs.
        throw new ApiError(
            401,
            "Invalid or expired refresh token."
        );
    }

    // Find the user whose ID is stored in the decoded JWT payload.
    const user = await User.findById(decodedToken._id);

    // Reject the request if the user does not exist.
    if (!user) {
        throw new ApiError(
            401,
            "User not found. Invalid refresh token."
        );
    }

    // Compare the incoming token with the refresh token stored in MongoDB.
    // Use refreshToken (singular), assuming that is your schema field.
    // This prevents an old or replaced refresh token from being reused.
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(
            401,
            "Refresh token is invalid. Unauthorized access."
        );
    }

    // Configure the authentication cookies.
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Generate a new access token and rotate the refresh token.
    // Assumption: this helper also saves the new refresh token to MongoDB.
    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    // Send the new tokens through HTTP-only cookies.
    // The browser stores them for subsequent authenticated requests.
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "Access token refreshed successfully",
                { accessToken }
            )
        );
});



// Exports the functions so that routes can use them.
export { registerUser, loginUser, logoutUse, getCurrentUser, verifyEmail };
