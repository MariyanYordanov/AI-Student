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

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: 'LearnMate - Потвърждение на имейл адрес',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Добре дошъл в LearnMate!</h2>
          <p>Привет ${userName},</p>
          <p>Благодарим, че се регистрира. За да активираш своя профил, моля потвърди своя имейл адрес чрез клик на линка по-долу:</p>
          <p>
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Потвърди имейл адрес
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
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
            LearnMate Team
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
      subject: 'LearnMate - Добре дошъл!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Имейлът си е потвърден!</h2>
          <p>Привет ${userName},</p>
          <p>Поздравления! Твоят имейл адрес е успешно потвърден и можеш вече да използваш LearnMate.</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Влез в LearnMate
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            LearnMate Team
          </p>
        </div>
      `,
      text: 'Твоят имейл адрес е потвърден. Можеш вече да използваш LearnMate.',
    };

    try {
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw here as email is not critical after registration
    }
  }
}
