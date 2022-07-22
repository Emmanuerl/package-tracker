import joi, { SchemaLike, ValidationError } from "joi";

/**
 * Contains a field to error message map extracted from the ValidationError
 */
export class DataValidationError extends Error {
  readonly messages: { [key: string]: string } = {};
  constructor(baseErr: ValidationError) {
    super("Could not validate the given that");
    baseErr.details.forEach((detail) => {
      this.messages[detail.context.label] = detail.message;
    });
  }
}

/**
 * Validate the data using the given schema and extract a message map if it fails
 * @param data object to validate
 * @param schema joi schema to use for validation
 * @returns the parsed value by joi or throws `DataValidationError` if validation fails
 */
export function validate(data: any, schema: SchemaLike) {
  const realSchema = joi.compile(schema);
  const { error, value } = realSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new DataValidationError(error);
  }

  return value;
}
