const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  return transporter;
};

const buildResetEmail = ({ name, resetUrl }) => {
  const displayName = name || 'there';

  return {
    subject: 'Reset your Budgetly password',
    text: [
      `Hi ${displayName},`,
      '',
      'We received a request to reset your Budgetly password.',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'This link expires in 30 minutes. If you did not request a reset, you can safely ignore this email.',
      '',
      '— Budgetly',
    ].join('\n'),
    html: `
      <div style="background:#f8fafc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#059669">Budgetly</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25">Reset your password</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569">Hi ${displayName},</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569">
            We received a request to reset your Budgetly password. Click the button below to choose a new one.
          </p>
          <p style="margin:0 0 24px">
            <a href="${resetUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px">
              Reset password
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#64748b">
            This link expires in 30 minutes. If you did not request a reset, you can safely ignore this email.
          </p>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.7;color:#94a3b8;word-break:break-all">
            ${resetUrl}
          </p>
        </div>
      </div>
    `,
  };
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      '[email] EMAIL_USER/EMAIL_PASS are not configured. Password reset link:',
      resetUrl,
    );
    return { delivered: false };
  }

  const { subject, text, html } = buildResetEmail({ name, resetUrl });

  await mailer.sendMail({
    from: `"Budgetly" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true };
};

module.exports = { sendPasswordResetEmail };
