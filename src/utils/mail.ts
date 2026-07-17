import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

const getMailConfig = () => {
  const user = process.env.EMAIL_USER?.trim();
  const password = process.env.EMAIL_PASSWORD;

  if (!user || !password) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_PASSWORD.",
    );
  }

  return { user, password };
};

const getTransporter = () => {
  if (!transporter) {
    const { user, password } = getMailConfig();
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: password,
      },
    });
  }

  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions) => {
  const { user } = getMailConfig();

  await getTransporter().sendMail({
    from: `"Academic Planner" <${user}>`,
    to,
    subject,
    html,
  });
};