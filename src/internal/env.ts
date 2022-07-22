import { DataValidationError, validate } from "./joi";
import joi, { SchemaLike } from "joi";

import dotenv from "dotenv";
import mapKeys from "lodash/mapKeys";

export class IncompleteEnvError extends Error {
  constructor(error: DataValidationError) {
    super(
      `Unable to load environment:\n${JSON.stringify(error.messages, null, 2)}`
    );
  }
}

/**
 * Load process environment and validate the keys needed. Do make sure you
 * specify every key you plan to use in the schema as it removes unknown
 * keys.
 * @param schema schema to use for validation
 */
export function loadEnv<T extends BasicConfig>(schema: SchemaLike): T {
  dotenv.config();
  const processedEnv = mapKeys(process.env, (_, key) => {
    return key.toLowerCase();
  });

  try {
    return validate(processedEnv, schema);
  } catch (err) {
    if (err instanceof DataValidationError) {
      throw new IncompleteEnvError(err);
    }

    throw err;
  }
}

const trimmedString = joi.string().trim();
const trimmedRequiredString = trimmedString.required();

export const basicConfig = {
  api_version: trimmedString.default("/api/v1"),
  node_env: trimmedString
    .valid("dev", "test", "production", "staging")
    .default("dev"),
  port: joi.number().required(),
  service_name: trimmedRequiredString,
};

/**
 * Type definitiion of basic application config. Default interface to extend when
 * creating your own config.
 */
export interface BasicConfig {
  /**
   * Help API clients choose
   */
  api_version: string;
  /**
   * Eqivalent to `NODE_ENV`
   */
  node_env: string;
  /**
   * What port number to serve the app
   */
  port: number;
  /**
   * Name of the service. This will appear in the logs
   */
  service_name: string;
}
