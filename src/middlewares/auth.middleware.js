
import jwt from "jsonwebtoken";
import { User } from "../models/user.models";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

// Middleware to verify the JWT access token
export const verifyJWT = asyncHandler(async (req, res, next) => {

    // Get the token from the cookie first.
    // If it is not available, check the Authorization header.
    // Expected header format: Authorization: Bearer <token>
    const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

    // If no token is provided, reject the request.
    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    let decodedToken;

    try {
        // Verify the token's signature and expiration using the secret key.
        // Throws an error if the token is invalid or expired.
        decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );
    } catch (error) {
        // Reject requests containing an invalid or expired token.
        throw new ApiError(401, "Invalid access token");
    }

    // Find the user whose MongoDB ID is stored in the JWT payload.
    // Exclude sensitive fields from the returned user document.
    const user = await User.findById(decodedToken?._id)
        .select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        );

    // If the user no longer exists, reject the request.
    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    // Attach the authenticated user's information to the request.
    // Controllers can now access it using req.user.
    req.user = user;

    // Pass control to the next middleware or route handler.
    next();
});
