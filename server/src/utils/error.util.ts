export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
  
    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleError = (error: Error | AppError): { statusCode: number; message: string } => {
    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        message: error.message,
      };
    }
  
    // Log unexpected errors
    console.error('Unexpected error:', error);
  
    return {
      statusCode: 500,
      message: 'Internal server error',
    };
  };