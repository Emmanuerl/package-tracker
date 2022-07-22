import { BasicConfig, basicConfig, loadEnv } from "@app/internal/env";

import joi from "joi";

export interface ApplicationEnv extends BasicConfig {
  postgres_host: string;
  postgres_port: number;
  postgres_db: string;
  postgres_user: string;
  postgres_password: string;
}

const env = loadEnv<ApplicationEnv>({
  ...basicConfig,
  postgres_host: joi.string().required(),
  postgres_port: joi.number().required(),
  postgres_db: joi.string().required(),
  postgres_user: joi.string().required(),
  postgres_password: joi.string().required(),
});

export default env;
