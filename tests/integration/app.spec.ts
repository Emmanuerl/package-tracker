import { Logger, defaultSerializers } from "@risemaxi/octonet";

import { App } from "../../src/app";
import { Container } from "inversify";
import env from "../../src/config/env";
import { getSuccess } from "../utils";
import request from "supertest";

const container = new Container();
const logger = new Logger({
  name: env.service_name,
  serializers: defaultSerializers(),
});
const app = new App(container, logger).server.build();

describe("[GET] Health checker", () => {
  it("should successfully query the health checker", async () => {
    await getSuccess(request(app).get("/api/v2"));
  });
});
