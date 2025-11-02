import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@learnmate.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export class EmailService {
  /**
   * Send email verification link to user
   */
  static async sendVerificationEmail(
    toEmail: string,
    userName: string,
    verificationToken: string
  ): Promise<void> {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      console.log('Verification token for development:', verificationToken);
      return;
    }

    const backendUrl = process.env.VITE_API_URL || 'https://ai-student-r9ay.onrender.com';
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: 'Aily - Потвърждение на имейл адрес',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Добре дошъл в Aily!</h2>
          <p>Привет ${userName},</p>
          <p>Благодарим, че се регистрира. За да активираш своя профил, моля потвърди своя имейл адрес чрез клик на линка по-долу:</p>

          <!-- Verification link -->
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Потвърди имейл адрес
            </a>
          </p>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Или копирай и постави този линк в браузъра си:<br>
            <code style="background: #f0f0f0; padding: 8px; display: inline-block; margin-top: 8px;">
              ${verificationLink}
            </code>
          </p>
          <p style="color: #666; font-size: 12px;">
            Този линк е валиден за 24 часа.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Aily Team
          </p>
        </div>
      `,
      text: `Потвърди своя имейл адрес: ${verificationLink}`,
    };

    try {
      await sgMail.send(msg);
      console.log(`✓ Verification email sent to ${toEmail}`);
    } catch (error: any) {
      console.error('❌ SendGrid Error:', {
        status: error.code,
        message: error.message,
        errors: error.response?.body?.errors,
        details: error.response?.body
      });
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email after email verification
   */
  static async sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      return;
    }

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: 'Aily - Добре дошъл!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Имейлът си е потвърден!</h2>
          <p>Привет ${userName},</p>
          <p>Поздравления! Твоят имейл адрес е успешно потвърден и можеш вече да използваш Aily.</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Влез в Aily
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Aily Team
          </p>
        </div>
      `,
      text: 'Твоят имейл адрес е потвърден. Можеш вече да използваш Aily.',
    };

    try {
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw here as email is not critical after registration
    }
  }

  /**
   * Send custom email to user
   */
  static async sendCustomEmail(toEmail: string, userName: string, subject: string, message: string): Promise<void> {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      return;
    }

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `Aily - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>Привет ${userName},</p>
          ${message}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Aily Team
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Custom email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw new Error('Failed to send custom email');
    }
  }

  /**
   * Send admin notification
   */
  static async sendAdminNotification(toEmail: string, subject: string, message: string): Promise<void> {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
      return;
    }

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `Aily Admin - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Admin Notification: ${subject}</h2>
          ${message}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Aily Admin System
          </p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Admin notification sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw new Error('Failed to send admin notification');
    }
  }
}
