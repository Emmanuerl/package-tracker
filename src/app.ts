import { captureBody, errors, logRequest } from "@app/http/middlewares";
import express, { Application } from "express";

import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { Logger } from "@risemaxi/octonet";
import Status from "http-status-codes";
import { capitalize } from "lodash";
import cors from "cors";
import env from "@app/config/env";
import helmet from "helmet";
import responseTime from "response-time";

export class App {
  readonly server: InversifyExpressServer;
  constructor(
    container: Container,
    logger: Logger,
    healthCheck = () => Promise.resolve()
  ) {
    const opts: any = [null, null, false];
    this.server = new InversifyExpressServer(
      container,
      null,
      {
        rootPath: env.api_version,
      },
      ...opts
    );

    // setup server-level middlewares
    this.server.setConfig((app: Application) => {
      app.disable("x-powered-by");

      app.use(express.static(process.cwd() + "/public"));

      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // enable CORS for browser clients
      app.use(cors());
      app.options("*", cors());

      app.use(helmet());
      app.use(responseTime());

      app.use(logRequest(logger));
      app.use(captureBody);
    });

    /**
     * Register handlers after all middlewares and controller routes have been mounted
     */
    this.server.setErrorConfig((app: Application) => {
      // expose index endpoint
      app.get("/", async (_req, res) => {
        try {
          await healthCheck();
        } catch (err) {
          return res.status(Status.INTERNAL_SERVER_ERROR).send(err.message);
        }

        return res.status(200).sendFile(process.cwd() + "/public/index.html");
      });

      app.get(env.api_version, async (_req, res) => {
        try {
          await healthCheck();
        } catch (err) {
          return res.status(Status.INTERNAL_SERVER_ERROR).send(err.message);
        }

        return res
          .status(200)
          .send(`${capitalize(env.node_env)} is up and running 👉🏾👈🏾`);
      });

      // register 404 route handler
      app.use((_req, res, _next) => {
        return res.status(404).send("Whoops! Route doesn't exist.");
      });

      app.use(errors(logger));
    });
  }
}
