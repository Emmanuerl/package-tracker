import { ApplicationError } from "@app/internal/errors";
import { DataValidationError, validate } from "@app/internal/joi";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SchemaLike } from "joi";

/**
 * Creates a middleware that validate the given request based on the
 * context and respond with status code `400`(with appropriate metadata) when
 * schema validation fails.
 * @param schema schema to use for validation
 * @param context whether to validate the request body or its query. Defaults to request body
 * @returns a middleware
 */
export function autoValidate(schema: SchemaLike, context: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req[context] = validate(req[context], schema);
      next();
    } catch (err) {
      if (err instanceof DataValidationError) {
        const message =
          context === "body" ? "Your request body is invalid" : "Your request query parameters are invalid";
        throw new ApplicationError(StatusCodes.BAD_REQUEST, message, err.messages);
      }

      throw err;
    }
  };
}
