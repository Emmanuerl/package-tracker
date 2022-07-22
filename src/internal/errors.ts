/**
 * HTTP error codes as classes. This serves as the base class.
 */
export class ApplicationError extends Error {
  constructor(readonly code: number, message: string, readonly data?: any) {
    super(message);
  }
}

/**
 * Wraps an internal error so errors middleware can log only internal error
 */
export class WrapperError extends Error {
  constructor(readonly code: number, message: string, readonly err?: Error) {
    super(message);
  }
}
