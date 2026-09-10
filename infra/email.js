import nodemailer from "nodemailer";
import { ServiceError } from "infra/errors.js";

const transportOptions = {
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT ? Number(process.env.EMAIL_SMTP_PORT) : undefined,
  secure: process.env.NODE_ENV === "production",
};

if (process.env.EMAIL_SMTP_USER && process.env.EMAIL_SMTP_PASSWORD) {
  transportOptions.auth = {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  };
}

const transporter = nodemailer.createTransport(transportOptions);

async function send(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError({
      message: "Falha ao enviar e-mail.",
      action:
        "Verifique se o serviço de email está ativo e se as credenciais estão corretas.",
      cause: error,
      context: mailOptions,
    });
  }
}

const email = {
  send,
};

export default email;
