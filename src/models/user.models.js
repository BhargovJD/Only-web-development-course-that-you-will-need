// Import mongoose.
// mongoose helps Node.js connect to MongoDB and work with MongoDB data.
import mongoose, { Schema } from "mongoose";

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

// Create a Mongoose model named "user" using userSchema.
// This model is used to create, read, update and delete users
// in the MongoDB database.
export const User = mongoose.model("user", userSchema);
