import '../config';
import nodemailer from 'nodemailer';

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = async () => {
  if (smtpConfigured) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMTP is not configured. Cannot send OTP email.');
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendOtpEmail = async (to: string, code: string): Promise<string | undefined> => {
  if (process.env.NODE_ENV === 'test') {
    return undefined;
  }

  const from = process.env.SMTP_FROM || 'no-reply@mhcs.local';
  const message = {
    from,
    to,
    subject: 'Your MHCS sign-in verification code',
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p>`,
  };

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail(message);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (!smtpConfigured) {
      console.warn('SMTP is not configured. Using Ethereal test account for OTP delivery.');
      console.info(`DEV OTP for ${to}: ${code}`);
      if (previewUrl) {
        console.info(`Preview email URL: ${previewUrl}`);
      }
      return previewUrl || undefined;
    }

    if (process.env.NODE_ENV !== 'production' && previewUrl) {
      console.info(`OTP email preview URL: ${previewUrl}`);
      return previewUrl;
    }

    return undefined;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }

    console.warn('Failed to send OTP email via SMTP, falling back to Ethereal.', err);
    const testAccount = await nodemailer.createTestAccount();
    const fallbackTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    const info = await fallbackTransporter.sendMail(message);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.info(`DEV OTP for ${to}: ${code}`);
    if (previewUrl) {
      console.info(`Fallback preview email URL: ${previewUrl}`);
    }
    return previewUrl || undefined;
  }
};
