import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';

describe('OtpService', () => {
  let otpService: OtpService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = otpService.generateOtp();

      expect(otp).toMatch(/^\d{6}$/);
      expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otp)).toBeLessThanOrEqual(999999);
    });

    it('should generate different OTPs on consecutive calls', () => {
      // With random functions, there's a small chance they produce the same value
      // Let's generate multiple and ensure at least one is different
      const otps = new Set();
      for (let i = 0; i < 5; i++) {
        otps.add(otpService.generateOtp());
      }

      // If we have more than one unique OTP, the function is generating different values
      expect(otps.size).toBeGreaterThan(1);
    });
  });

  describe('saveOtp', () => {
    it('should save OTP with expiration time to user', async () => {
      const userId = 'user123';
      const otp = '123456';

      await otpService.saveOtp(userId, otp);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
        email_verification_otp: otp,
        email_verification_expires: expect.any(Date),
      });
    });

    it('should set expiration time to 15 minutes from now', async () => {
      const userId = 'user123';
      const otp = '123456';

      // Mock Date.now for consistent testing
      const now = new Date('2023-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      await otpService.saveOtp(userId, otp);

      // Extract the expires date from the call
      const updateCall = userModel.findByIdAndUpdate.mock.calls[0][1];
      const expiresDate = updateCall.email_verification_expires;

      // Check that it's 15 minutes later (with some tolerance for test execution time)
      const expectedExpires = new Date('2023-01-01T12:15:00Z');
      expect(expiresDate.getTime()).toBeCloseTo(expectedExpires.getTime(), -2); // -2 means tolerance of 100ms

      // Restore original Date implementation
      jest.spyOn(global, 'Date').mockRestore();
    });
  });

  describe('validateOtp', () => {
    it('should return false if user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      const result = await otpService.validateOtp('user123', '123456');

      expect(result).toBe(false);
    });

    it('should return false if OTP does not match', async () => {
      userModel.findById.mockResolvedValue({
        email_verification_otp: '654321',
        email_verification_expires: new Date(Date.now() + 1000 * 60 * 15), // 15 min in future
      });

      const result = await otpService.validateOtp('user123', '123456');

      expect(result).toBe(false);
    });

    it('should return false if OTP is expired', async () => {
      userModel.findById.mockResolvedValue({
        email_verification_otp: '123456',
        email_verification_expires: new Date(Date.now() - 1000), // 1 second in past
      });

      const result = await otpService.validateOtp('user123', '123456');

      expect(result).toBe(false);
    });

    it('should return true if OTP matches and is not expired', async () => {
      userModel.findById.mockResolvedValue({
        email_verification_otp: '123456',
        email_verification_expires: new Date(Date.now() + 1000 * 60 * 15), // 15 min in future
      });

      const result = await otpService.validateOtp('user123', '123456');

      expect(result).toBe(true);
    });
  });
});
