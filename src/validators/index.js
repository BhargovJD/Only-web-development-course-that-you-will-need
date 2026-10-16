import { body } from "express-validator";

const userRegisterValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .toLowerCase(),
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("User name is required")
        .isString()
        .withMessage("Invalid user name")
        .toLowerCase(),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Invalid password"),
];

export { userRegisterValidator };