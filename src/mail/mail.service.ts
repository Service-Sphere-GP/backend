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

  async sendWelcomeEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    try {
      this.logger.log(`Sending welcome email to ${email}`);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Service Sphere! Confirm Your Email',
        template: 'welcome',
        context: {
          ...this.commonContext(),
          name,
          otp,
          verificationLink: `${process.env.URL}:${process.env.PORT}/api/v1/auth/verify-email/${otp}`,
        },
      });
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
        error.stack,
      );
      throw error; 
    }
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
          resetLink: `${process.env.URL}:${process.env.PORT}/api/v1/auth/reset-password/${token}`,
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
