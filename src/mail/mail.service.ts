import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private commonContext() {
    return {
      appName: 'Service Sphere',
      supportEmail: 'support@servicesphere.com',
      currentYear: new Date().getFullYear(),
    };
  }

  /**
   * Send a verification email - used for both welcome and verification resend emails
   * @param email The recipient's email
   * @param name The recipient's name
   * @param otp The verification code
   * @param isWelcome Whether this is a welcome email (true) or verification resend email (false)
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    otp: string,
    isWelcome: boolean = false,
  ): Promise<void> {
    const subject = isWelcome
      ? 'Welcome to Service Sphere! Confirm Your Email'
      : 'Verify Your Email - Service Sphere';

    const title = isWelcome
      ? 'Welcome to Service Sphere!'
      : 'Verify Your Email Address';

    const message = isWelcome
      ? 'Thank you for joining Service Sphere. Please use the following code to verify your email address:'
      : 'You requested a new verification code for your Service Sphere account. Please use the following code to verify your email address:';

    try {
      this.logger.log(
        `Sending ${isWelcome ? 'welcome' : 'verification resend'} email to ${email}`,
      );
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: 'verification-email',
        context: {
          ...this.commonContext(),
          name,
          otp,
          subject,
          title,
          message,
        },
      });
      this.logger.log(
        `${isWelcome ? 'Welcome' : 'Verification resend'} email sent successfully to ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ${isWelcome ? 'welcome' : 'verification resend'} email to ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send a welcome email to a new user
   * @param email The recipient's email
   * @param name The recipient's name
   * @param otp The verification code
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    return this.sendVerificationEmail(email, name, otp, true);
  }

  /**
   * Send a verification resend email
   * @param email The recipient's email
   * @param name The recipient's name
   * @param otp The verification code
   */
  async sendVerificationResendEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    return this.sendVerificationEmail(email, name, otp, false);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    try {
      this.logger.log(`Sending password reset email to ${email}`);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          ...this.commonContext(),
          name,
          token,
          url: `${process.env.URL || 'http://localhost'}:${process.env.PORT || '3000'}/api/v1/auth/reset-password/${token}`,
        },
      });
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
