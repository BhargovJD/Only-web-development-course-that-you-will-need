import mailgen from "mailgen";



const emailVerificationEmailGenerator = (email, verificationToken,link) => {
    return {
        body: {
            name: email,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions: "To get started, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Verify your account",
                    link: link,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help you.",
        },
        subject: "Welcome to our app! We're very excited to have you on board.",
    }
};

const forgotPasswordEmailGenerator = (email, resetPasswordToken,link) => {
    return {
        body: {
            name: email,
            intro: "You requested a password reset. Please click the button below to reset your password.",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Reset your password",
                    link: link,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help you.",
        },
        subject: "Reset your password",
    }
};

export { emailVerificationEmailGenerator, forgotPasswordEmailGenerator };

