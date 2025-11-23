import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { AppError } from '../utils/error.util';

/**
 * Middleware to handle validation results from express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error: ValidationError) => {
        // Handle different error types
        if (error.type === 'field') {
          return `${error.path}: ${error.msg}`;
        }
        return error.msg;
      })
      .join(', ');

    throw new AppError(errorMessages, 400);
  }

  next();
};

/**
 * Middleware to sanitize request data
 */
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove any potential XSS or malicious content
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Trim whitespace
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};