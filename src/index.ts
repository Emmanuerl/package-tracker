import "module-alias/register";
import "reflect-metadata";

import { Logger, defaultSerializers } from "@risemaxi/octonet";

import { App } from "./app";
import { Container } from "inversify";
import { Knex } from "knex";
import LIB_TYPES from "./internal/inversify";
import { createPostgres } from "./config/postgres";
import env from "./config/env";
import http from "http";
import { isHealthy } from "./config/health";

const start = async () => {
  const logger = new Logger({
    name: env.service_name,
    serializers: defaultSerializers(),
  });
  const container = new Container();

  try {
    container.bind<Logger>(LIB_TYPES.Logger).toConstantValue(logger);

    // setup postgres
    const pg = await createPostgres(logger);
    container.bind<Knex>(LIB_TYPES.KnexDB).toConstantValue(pg);
    logger.log("successfully connected to postgres and has run migration");

    const app = new App(container, logger, () => isHealthy(pg));
    const appServer = app.server.build();

    // start http server
    const httpServer = http.createServer(appServer);
    httpServer.on("listening", () =>
      logger.log(`${env.service_name} HTTP server listening on ${env.port}`)
    );

    httpServer.listen(env.port);

    process.on("SIGTERM", async () => {
      logger.log("exiting aplication...");

      httpServer.close(() => {
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error(err);
  }
};

start();
