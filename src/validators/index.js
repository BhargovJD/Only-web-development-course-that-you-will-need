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


const userLoginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .toLowerCase(),
    body("password")
];

const userChangeCurrentPasswordValidator = ()=> {
    return [
        body("currentPassword")
            .trim()
            .notEmpty()
            .withMessage("Current password is required")
            .isString()
            .withMessage("Invalid current password"),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New password is required")
            .isString()
            .withMessage("Invalid new password"),
    ];
};

const userForgotPasswordRequestValidator = ()=> {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email address")
            .toLowerCase(),
    ];
}

const userResetForgotPasswordValidator = ()=> {
    return [
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("New password is required")
            .isString()
            .withMessage("Password is required"),
    ];
};


export { userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordRequestValidator };