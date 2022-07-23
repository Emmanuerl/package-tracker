import "reflect-metadata";
import "../../src/http/controllers/packages/package.controller";

import { Logger, defaultSerializers } from "@risemaxi/octonet";
import { Package, PackageRepository } from "../../src/packages";
import {
  createPackage,
  findPkgById,
  getTrail,
  recordPackageDTO,
} from "../helpers/packages";

import { App } from "../../src/app";
import { Application } from "express";
import { Container } from "inversify";
import { Knex } from "knex";
import LIB_TYPES from "../../src/internal/inversify";
import TYPES from "../../src/config/inversify.types";
import { createPostgres } from "../../src/config/postgres";
import env from "../../src/config/env";
import { getError, getSuccess } from "../utils";
import request from "supertest";
import { datatype, date } from "faker";
import { StatusCodes } from "http-status-codes";

const basePath = "/api/v1/packages";
let pg: Knex;
let app: Application;
let container: Container;

beforeAll(async () => {
  container = new Container();
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

    if (<string>pkg?.status in ["IN_TRANSIT", "WAREHOUSE"]) {
      expect(pkg?.picked_up_at).toBeFalsy();
      expect(pkg?.delivered_at).toBeFalsy();
    }
  });

  it("should set a default status of `WAREHOUSE` if none is set", async () => {
    const dto = recordPackageDTO({ status: undefined });

    const res = await getSuccess<Package>(
      request(app).post(basePath).send(dto)
    );

    const pkg = await findPkgById(pg, res.id);

    expect(pkg).toBeDefined();
    expect(pkg?.status).toBe("WAREHOUSE");
    expect(pkg?.picked_up_at).toBeFalsy();
    expect(pkg?.delivered_at).toBeFalsy();
  });

  it("should set the picked_up_at field if provided status is `PICKED_UP`", async () => {
    const dto = recordPackageDTO({ status: "PICKED_UP" });
    const res = await getSuccess<Package>(
      request(app).post(basePath).send(dto)
    );

    const pkg = await findPkgById(pg, res.id);

    expect(pkg?.picked_up_at).toBeDefined();
  });

  it("should set the delivered_at field if provided status is `DELIVERED`", async () => {
    const dto = recordPackageDTO({ status: "DELIVERED" });
    const res = await getSuccess<Package>(
      request(app).post(basePath).send(dto)
    );

    const pkg = await findPkgById(pg, res.id);

    expect(pkg?.delivered_at).toBeDefined();
  });
});

describe("packages.updateStatus", () => {
  it("should successfully update a package's status", async () => {
    const pkg = await createPackage(
      pg,
      recordPackageDTO({ status: "WAREHOUSE" })
    );

    await getSuccess(
      request(app)
        .put(`${basePath}/${pkg.id}/status`)
        .send({ status: "IN_TRANSIT" })
    );

    const savedPkg = await findPkgById(pg, pkg.id);

    expect(savedPkg?.status).toBe("IN_TRANSIT");
    // ensure other properties aren't changed
    expect(savedPkg?.title).toBe(pkg.title);
    expect(savedPkg?.delivered_at).toBe(pkg.delivered_at);
    expect(savedPkg?.description).toBe(pkg.description);
    expect(savedPkg?.size).toBe(pkg.size);
    expect(savedPkg?.picked_up_at).toBe(pkg.picked_up_at);
  });

  it("should fail if the package ID is invalid", async () => {
    const err = await getError(
      StatusCodes.NOT_FOUND,
      request(app)
        .put(`${basePath}/${datatype.uuid()}/status`)
        .send({ status: "IN_TRANSIT" })
    );

    expect(err).toBe("The specified package does not exist");
  });

  it("should return early if no changes in status is made", async () => {
    const pkg = await createPackage(
      pg,
      recordPackageDTO({ status: "WAREHOUSE" })
    );
    const repo = container.get<PackageRepository>(TYPES.PackageRepository);
    const updateMethod = jest.spyOn(repo, "update");

    await getSuccess(
      request(app)
        .put(`${basePath}/${pkg.id}/status`)
        .send({ status: "WAREHOUSE" })
    );

    expect(updateMethod.mock.calls.length).toBe(0);
  });

  it("should fail if trying to set an already delivered package to delivered", async () => {
    const pkg = await createPackage(
      pg,
      recordPackageDTO({ status: "WAREHOUSE" }),
      { delivered_at: date.past() }
    );
    const err = await getError(
      StatusCodes.CONFLICT,
      request(app)
        .put(`${basePath}/${pkg.id}/status`)
        .send({ status: "DELIVERED" })
    );

    expect(err).toBe("Package has already been delivered");
  });

  it("should fail if trying to set an already picked up package to picked up", async () => {
    const pkg = await createPackage(
      pg,
      recordPackageDTO({ status: "WAREHOUSE" }),
      { picked_up_at: date.past() }
    );
    const err = await getError(
      StatusCodes.CONFLICT,
      request(app)
        .put(`${basePath}/${pkg.id}/status`)
        .send({ status: "PICKED_UP" })
    );

    expect(err).toBe("Package has already been picked up");
  });
});
