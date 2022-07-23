import "reflect-metadata";
import "../../src/http/controllers/packages/package.controller";

import { Logger, defaultSerializers } from "@risemaxi/octonet";
import { Package, PackageRepository } from "../../src/packages";
import { findPkgById, getTrail, recordPackageDTO } from "../helpers/packages";

import { App } from "../../src/app";
import { Application } from "express";
import { Container } from "inversify";
import { Knex } from "knex";
import LIB_TYPES from "../../src/internal/inversify";
import TYPES from "../../src/config/inversify.types";
import { createPostgres } from "../../src/config/postgres";
import env from "../../src/config/env";
import { getSuccess } from "../utils";
import request from "supertest";

const basePath = "/api/v1/packages";
let pg: Knex;
let app: Application;

beforeAll(async () => {
  const container = new Container();
  const logger = new Logger({
    name: env.service_name,
    serializers: defaultSerializers(),
  });

  container.bind<Logger>(LIB_TYPES.Logger).toConstantValue(logger);

  pg = await createPostgres(logger);
  container.bind<Knex>(LIB_TYPES.KnexDB).toConstantValue(pg);

  container
    .bind<PackageRepository>(TYPES.PackageRepository)
    .to(PackageRepository);

  app = new App(container, logger).server.build();
});

describe("packages.record", () => {
  it("should successfully record a new package entry", async () => {
    const dto = recordPackageDTO();
    const res = await getSuccess<Package>(
      request(app).post(basePath).send(dto)
    );

    const [pkg, trail] = await Promise.all([
      findPkgById(pg, res.id),
      getTrail(pg, res.id),
    ]);

    expect(pkg?.description).toBe(res.description);
    expect(pkg?.size).toBe(res.size);
    expect(pkg?.status).toBe(res.status);
    expect(pkg?.title).toBe(res.title);
    expect(trail.length).toBe(1);
  });

  it("should set a default status of `WAREHOUSE` if none is set", async () => {
    const dto = recordPackageDTO({ status: undefined });

    const res = await getSuccess<Package>(
      request(app).post(basePath).send(dto)
    );

    const pkg = await findPkgById(pg, res.id);

    expect(pkg).toBeDefined();
    expect(pkg?.status).toBe("WAREHOUSE");
  });
});
