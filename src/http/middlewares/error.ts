import { ApplicationError } from "@app/internal/errors";
import { APIError, Logger } from "@risemaxi/octonet";
import { NextFunction, Request, Response } from "express";
import Status from "http-status-codes";

/**
 * Middleware for automatically interpreting `ApplicationError` and `APIError`. It responsds
 * with `INTERNAL_SERVER_ERROR` if the error is not one of either.
 * @param logger octonet logger
 */
export function errors(logger: Logger) {
  return function (err: any, req: Request, res: Response, next: NextFunction) {
    // handling for asynchronous situations where error is thrown after response has been sent
    if (res.headersSent) return next(err);

    if (err instanceof ApplicationError) {
      res.status(err.code).json({ message: err.message, data: err.data });
    } else if (err instanceof APIError) {
      res.status(err.status).json({ message: err.message, data: err.data });
    } else {
      res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "We are having system level issues. Please bear with us"
      });
    }

    logger.httpError(err, req, res);
  };
}
