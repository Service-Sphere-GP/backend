import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';

describe('MailService', () => {
  let mailService: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const mockMailerService = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);

    // Mock logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should call mailerService.sendMail with correct parameters', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const otp = '123456';

      process.env.URL = 'http://localhost';
      process.env.PORT = '3000';

      await mailService.sendWelcomeEmail(email, name, otp);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Welcome to Service Sphere! Confirm Your Email',
        template: 'welcome',
        context: expect.objectContaining({
          name,
          otp,
          verificationLink: `http://localhost:3000/api/v1/auth/verify-email/${otp}`,
        }),
      });
    });

    it('should handle errors when sending fails', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const otp = '123456';

      const error = new Error('Failed to send email');
      jest.spyOn(mailerService, 'sendMail').mockRejectedValue(error);

      await expect(
        mailService.sendWelcomeEmail(email, name, otp),
      ).rejects.toThrow(error);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should call mailerService.sendMail with correct parameters', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'reset-token-123';

      process.env.URL = 'http://localhost';
      process.env.PORT = '3000';

      await mailService.sendPasswordResetEmail(email, name, token);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: expect.objectContaining({
          name,
          token,
          resetLink: `http://localhost:3000/api/v1/auth/reset-password/${token}`,
        }),
      });
    });

    it('should handle errors when sending fails', async () => {
      const email = 'test@example.com';
      const name = 'Test User';
      const token = 'reset-token-123';

      const error = new Error('Failed to send email');
      jest.spyOn(mailerService, 'sendMail').mockRejectedValue(error);

      await expect(
        mailService.sendPasswordResetEmail(email, name, token),
      ).rejects.toThrow(error);
    });
  });

  describe('commonContext', () => {
    it('should return object with common email context', () => {
      const context = mailService['commonContext']();

      expect(context).toEqual({
        appName: 'Service Sphere',
        supportEmail: 'support@servicesphere.com',
        currentYear: new Date().getFullYear(),
      });
    });
  });
});
