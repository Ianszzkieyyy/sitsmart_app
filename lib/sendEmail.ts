import nodemailer from "nodemailer";

// Configure your email transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail(userEmail: string, userName: string | null) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: "Are you still there, SitSmart user?",
    html: `<p>Hi ${userName || 'there'},</p><p>We've noticed you've been away from your desk for a while during an active session. Remember to end your session if you're done!</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Away from desk email sent successfully.");
  } catch (error) {
    console.error("Error sending away from desk email:", error);
  }
}