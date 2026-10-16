// Import mongoose.
// mongoose helps Node.js connect to MongoDB and work with MongoDB data.
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Create a Mongoose schema for the User document.
// A schema defines the structure and rules of user data in MongoDB.
const userSchema = new Schema(
    {
        // -------------------- AVATAR --------------------

        // Store the user's profile/avatar information.
        avatar: {
            // Define the structure/type of the avatar object.
            type: {
                // URL of the user's avatar image.
                url: String,

                // Local path where the avatar image may be stored.
                localPath: String,
            },

            // Default avatar information.
            // If the user does not provide an avatar,
            // these values will be used.
            default: {
                url: "https://placehold.co/200x200",
                localPath: "",
            },
        },

        // -------------------- USERNAME --------------------

        // Store the user's username.
        userName: {
            // Username must be a String.
            type: String,

            // Username is mandatory.
            required: true,

            // Two users cannot have the same username.
            unique: true,

            // Convert the username to lowercase before storing it.
            lowercase: true,

            // Remove unnecessary spaces from the beginning and end.
            trim: true,

            // Create an index for faster searching using username.
            index: true,
        },

        // -------------------- EMAIL --------------------

        // Store the user's email address.
        email: {
            // Email must be a String.
            type: String,

            // Email is mandatory.
            required: true,

            // Two users cannot have the same email.
            unique: true,

            // Convert email to lowercase before storing it.
            lowercase: true,

            // Remove unnecessary spaces.
            trim: true,
        },

        // -------------------- FULL NAME --------------------

        // Store the user's full name.
        fullName: {
            // Full name must be a String.
            type: String,

            // Remove unnecessary spaces from the beginning and end.
            trim: true,
        },

        // -------------------- PASSWORD --------------------

        // Store the user's password.
        password: {
            // Password must be a String.
            type: String,

            // Password is mandatory.
            // If it is missing, Mongoose will show this message.
            required: [true, "Password is required"],
        },

        // -------------------- EMAIL VERIFICATION --------------------

        // Store whether the user's email has been verified.
        isEmailVerified: {
            // This value will be true or false.
            type: Boolean,

            // By default, a newly created user is not verified.
            default: false,
        },

        // -------------------- REFRESH TOKEN --------------------

        // Store the refresh token used for authentication.
        refreshToken: {
            // Refresh token is stored as a String.
            type: String,
        },

        // -------------------- FORGOT PASSWORD TOKEN --------------------

        // Store the token generated when the user requests
        // a password reset.
        forgotPasswordToken: {
            // The token is stored as a String.
            type: String,
        },

        // Store the expiry time of the forgot-password token.
        forgotPasswordExpiry: {
            // The expiry value will be stored as a Date.
            type: Date,
        },

        // -------------------- EMAIL VERIFICATION TOKEN --------------------

        // Store the token generated for email verification.
        emailVerificationToken: {
            // The verification token is stored as a String.
            type: String,
        },

        // Store the expiry time of the email verification token.
        emailVerificationExpiry: {
            // The expiry value will be stored as a Date.
            type: Date,
        },
    },
    {
        // createdAt
        // updatedAt
        timestamps: true,
    },
);

// Pre-save hook.
// This function will run automatically BEFORE a User document is saved
// to MongoDB.
userSchema.pre("save", async function () {
    // Check whether the password field has been modified.
    //
    // this = the current User document.
    //
    // If the password has NOT been modified, there is no need to hash it again.
    // Returning ends this async hook; Mongoose then continues the save.
    if (!this.isModified("password")) return;

    // Hash the user's password using bcrypt.
    //
    // this.password = the current password.
    //
    // bcrypt.hash(this.password, 10):
    //   - this.password = plain-text password
    //   - 10 = salt rounds (cost factor)
    //
    // await waits until bcrypt finishes hashing the password.
    //
    // The hashed password is then stored back in this.password.
    this.password = await bcrypt.hash(this.password, 10);
});

// method
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate an access token for the logged-in user
userSchema.methods.generateAccessToken = function () {

    // Create the data (payload) that will be stored inside the JWT
    const payload = {
        userId: this._id,  // MongoDB ID of the current user
        email: this.email, // Email address of the current user
    };

    // Get the secret key from the environment variables
    // This key is used to sign the JWT securely
    const secret = process.env.ACCESS_TOKEN_SECRET;

    // Get the access token's expiration time from environment variables
    // Example: "15m" means the token expires after 15 minutes
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;

    // Generate and return the signed JWT
    // The third argument must be an options object containing expiresIn
    return jwt.sign(payload, secret, { expiresIn });
};


// Method to generate a refresh token for the logged-in user
userSchema.methods.generateRefreshToken = function () {

    // Create the payload containing the user's ID and email
    const payload = {
        userId: this._id,  // Unique ID of the current user
        email: this.email, // Email address of the current user
    };

    // Get the refresh token's secret key from environment variables
    const secret = process.env.REFRESH_TOKEN_SECRET;

    // Get the refresh token's expiration time from environment variables
    // Example: "7d" means the token expires after 7 days
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

    // Generate and return the signed refresh token
    return jwt.sign(payload, secret, { expiresIn });
};


// Method to generate a temporary token
// Commonly used for email verification, password resets, or similar tasks
userSchema.methods.generateTemporaryToken = function () {

    // Generate 32 cryptographically secure random bytes
    // Convert those bytes into a 64-character hexadecimal string
    const unHashedToken = crypto.randomBytes(32).toString("hex");

    // Hash the original token using SHA-256
    // Store the hash in the database instead of the original token
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    // Set the token's expiration time to 2 minutes from now
    const tokenExpiry = Date.now() + (2 * 60 * 1000); // 2 minutes in milliseconds

    // Return the original token, its hash, and its expiry timestamp
    // Send unHashedToken to the user; store hashedToken and tokenExpiry in the database
    return { unHashedToken, hashedToken, tokenExpiry };
};
// Create a Mongoose model named "user" using userSchema.
// This model is used to create, read, update and delete users
// in the MongoDB database.
export const User = mongoose.model("user", userSchema);
