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
