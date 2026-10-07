export class AppError extends Error {
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: unknown,
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.status = statusCode;
    this.isOperational = isOperational;
    this.details = details;
  }
}

// For not found
export class NotFound extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
// Validation error class
export class ValidationError extends AppError {
  constructor(message = 'Invalid request data', details?: any) {
    super(message, 400, true, details);
  }
}
// JWT error class

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// Forbidden or access control error class

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

// Database error class

export class DatabaseError extends AppError {
  constructor(message = 'Database error', details?: any) {
    super(message, 500, true, details);
  }
}

// Rate limit error

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}
