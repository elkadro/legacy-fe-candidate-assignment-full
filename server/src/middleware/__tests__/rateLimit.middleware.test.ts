import { Request, Response, NextFunction } from 'express';
import { rateLimit, authRateLimit, clearRateLimitStore } from '../rateLimit.middleware';

describe('rateLimit.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();

    // Use unique IPs for each test to avoid interference
    const uniqueIp = `127.0.0.${Math.floor(Math.random() * 255)}`;
    
    mockRequest = {
      headers: {},
      socket: {
        remoteAddress: uniqueIp,
      } as any,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
    
    // Clear rate limit store before each test
    clearRateLimitStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearRateLimitStore();
  });

  describe('rateLimit', () => {
    it('should allow first request', () => {
      const middleware = rateLimit(1000, 1);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should block request exceeding rate limit', () => {
      const middleware = rateLimit(1000, 1);
      
      // First request - should pass
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request - should be blocked
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Too many requests',
        })
      );
      expect(mockNext).toHaveBeenCalledTimes(1); // Only called once (first request)
    });

    it('should reset after window expires', async () => {
      const middleware = rateLimit(100, 1); // 100ms window
      
      // First request
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request - blocked
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(statusMock).toHaveBeenCalledWith(429);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Clear mocks
      jest.clearAllMocks();

      // Third request - should pass (window expired)
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should use x-forwarded-for header if available', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      };

      const middleware = rateLimit(1000, 1);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should use x-real-ip header if available', () => {
      mockRequest.headers = {
        'x-real-ip': '192.168.1.2',
      };

      const middleware = rateLimit(1000, 1);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should use remoteAddress as fallback', () => {
      // Use a unique IP for this test
      const uniqueIp = '192.168.1.100';
      mockRequest.headers = {};
      mockRequest.socket = {
        remoteAddress: uniqueIp,
      } as any;

      const middleware = rateLimit(1000, 1);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should use "unknown" if no IP is available', () => {
      mockRequest.headers = {};
      mockRequest.socket = {} as any;

      const middleware = rateLimit(1000, 1);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should include retryAfter in error response', () => {
      const middleware = rateLimit(5000, 1);
      
      // First request
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Second request - blocked
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: expect.any(Number),
        })
      );
    });
  });

  describe('authRateLimit', () => {
    it('should use 5 second window and 1 request limit', () => {
      // First request - should pass
      authRateLimit(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request - should be blocked
      authRateLimit(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(statusMock).toHaveBeenCalledWith(429);
    });
  });
});

