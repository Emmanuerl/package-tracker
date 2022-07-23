import {
  Package,
  PackageTrail,
  RecordPackageDTO,
  packageStatuses,
} from "../../src/packages";

import { AsyncNullable } from "@risemaxi/octonet";
import { Knex } from "knex";
import faker from "faker";

/**
 * generated a record package DTO
 * @param extra
 * @returns
 */
export function recordPackageDTO(
  extra?: Partial<RecordPackageDTO>
): RecordPackageDTO {
  return {
    size: faker.datatype.number(),
    status: packageStatuses[faker.datatype.number() % packageStatuses.length],
    title: faker.name.title(),
    description: faker.lorem.lines(2),
    ...extra,
  };
}

/**
 * retrieves a package entry by ID, returns null if ID doesn't belong to an existing package
 * @param pg
 * @param id
 * @returns
 */
export function findPkgById(pg: Knex, id: string): AsyncNullable<Package> {
  return pg<Package>("packages").where("id", id).first("*");
}

/**
 * retrievs the state trail for a specified package
 * @param pg
 * @param id
 * @returns
 */
export function getTrail(pg: Knex, packageId: string): Promise<PackageTrail[]> {
  return pg<PackageTrail>("package_trail")
    .where("package_id", packageId)
    .returning("*");
}

export async function createPackage(
  pg: Knex,
  dto = recordPackageDTO(),
  overrides: Partial<Package> = {}
): Promise<Package> {
  const [pkg] = await pg<Package>("packages").insert(
    {
      description: dto.description,
      size: dto.size,
      status: dto.status,
      title: dto.title,
      delivered_at: dto.status === "DELIVERED" ? new Date() : undefined,
      picked_up_at: dto.status === "PICKED_UP" ? new Date() : undefined,
      ...overrides,
    },
    "*"
  );
  return pkg;
}
