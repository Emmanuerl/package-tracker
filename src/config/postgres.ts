import { Logger } from "@risemaxi/octonet";
import Postgrator from "postgrator";
import env from "./env";
import knex from "knex";
import path from "path";
import pg from "pg";

// parse numeric types as floats
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

export async function createPostgres(logger: Logger) {
  const pg = knex({
    client: "pg",
    connection: {
      host: env.postgres_host,
      port: env.postgres_port,
      user: env.postgres_user,
      password: env.postgres_password,
      database: env.postgres_db,
      ssl: false,
      application_name: env.service_name,
    },
  });
  pg.on("error", (err) => logger.error(err));

  // Create postgrator instance
  const postgrator = new Postgrator({
    migrationPattern: path.join(process.cwd(), "db/migrations/*"),
    driver: "pg",
    database: env.postgres_db,
    schemaTable: "schema_migrations",
    execQuery: (query) => pg.raw(query),
  });

  await postgrator.migrate();

  return pg;
}
