import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import ejs from 'ejs';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const renderTemplate = async (
  templateName: string,
  data: Record<string, any>,
) => {
  const fs = await import('fs');
  const possiblePaths = [
    path.join(process.cwd(), 'apps', 'auth-service', 'src', 'utils', 'email-templates', `${templateName}.ejs`),
    path.join(__dirname, '..', 'email-templates', `${templateName}.ejs`),
    path.join(__dirname, 'email-templates', `${templateName}.ejs`),
  ];

  const templatePath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];

  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
): Promise<boolean> => {
  try {
    const html = await renderTemplate(templateName, data);

    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('Error while sending email:', error);
    return false;
  }
};
