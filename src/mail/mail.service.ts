import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private commonContext() {
    return {
      appName: 'Service Sphere',
      supportEmail: 'support@servicesphere.com',
      currentYear: new Date().getFullYear(),
    };
  }

  async sendWelcomeEmail(email: string, name: string, otp: string): Promise<void> {
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
  }


  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    try {
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
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error);
    }
  }
}
