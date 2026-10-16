import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options) => {
    // Create a Mailgen instance to generate email templates
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Management System",
            link: "http://localhost:3000",
        },
    });

    // Generate the plain-text version of the email
    const emailText = mailGenerator.generatePlaintext(
        options.mailgenContent
    );
 
    // Generate the HTML version of the email
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    // Configure Nodemailer to connect to Mailtrap SMTP
    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });

    // Define the email details
    const mail = {
        from: process.env.MAILTRAP_SMTP_FROM,
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML,
    };

    try {
        // Send the email using the configured SMTP transport
        await transport.sendMail(mail);

        // Return true if sending succeeds
        return true;
    } catch (error) {
        // Log the error if sending fails
        console.error("Email sending failed:", error);

        // Return false if sending fails
        return false;
    }
};


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

export { emailVerificationEmailGenerator, forgotPasswordEmailGenerator, sendEmail };

