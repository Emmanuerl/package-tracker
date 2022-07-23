import joi from "joi";
import { packageStatuses } from "@app/packages";

export const isRecordPackageDTO = joi.object().keys({
  description: joi.string().trim(),
  size: joi.number().required(),
  status: joi
    .string()
    .valid(...packageStatuses)
    .default("WAREHOUSE"),
  title: joi.string().required(),
});
