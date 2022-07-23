import { Package, PackageStatus, RecordPackageDTO } from "./package.model";

import { AsyncNullable } from "@risemaxi/octonet";
import { Repository } from "@app/internal/postgres";

export class PackageRepository extends Repository<Package> {
  private db = this.setup("packages");

  /**
   * record a new package entry
   * @param dto
   */
  async record(dto: RecordPackageDTO): Promise<Package> {
    const [pkg] = await this.db().insert(
      {
        description: dto.description,
        size: dto.size,
        status: dto.status,
        title: dto.title,
        delivered_at: dto.status === "DELIVERED" ? new Date() : undefined,
        picked_up_at: dto.status === "PICKED_UP" ? new Date() : undefined,
      },
      "*"
    );
    return pkg;
  }

  /**
   * finds a package entry  by it's ID, creates an optional room for context
   * change to make the method reusable even in transactions
   * @param id
   * @param ctx
   * @returns
   */
  async find(id: string, ctx = this.db()): AsyncNullable<Package> {
    return await ctx.where("id", id).first("*");
  }

  /**
   * finds a package entry  by it's ID, creates an optional room for context
   * change to make the method reusable even in transactions
   * @param id
   * @param ctx
   * @returns
   */
  async update(
    id: string,
    data: Partial<Package>,
    ctx = this.db()
  ): AsyncNullable<Package> {
    const [pkg] = await ctx.where("id", id).update(data, "*");
    return pkg;
  }

  async updateStatus(
    id: string,
    status: PackageStatus
  ): AsyncNullable<Package> {
    let pkg: Package = null;
    await this.knex.transaction(async (trx) => {
      const db = trx<Package>("packages");

      pkg = await this.find(id, db);

      if (!pkg) {
        throw new PackageNotFound();
      }

      if (status === pkg.status) {
        return pkg;
      }

      if (status == "DELIVERED" && pkg.delivered_at) {
        throw new InvalidPackageStatusChange(
          "Package has already been delivered"
        );
      } else if (status == "PICKED_UP" && pkg.picked_up_at) {
        throw new InvalidPackageStatusChange(
          "Package has already been picked up"
        );
      }

      pkg.status = status;
      pkg.delivered_at = status == "DELIVERED" ? new Date() : pkg.delivered_at;
      pkg.picked_up_at = status == "PICKED_UP" ? new Date() : pkg.picked_up_at;

      await this.update(pkg.id, pkg, db);

      await trx.commit();
    });

    return pkg;
  }
}

export class PackageNotFound extends Error {
  constructor() {
    super("The specified package does not exist");
  }
}

export class InvalidPackageStatusChange extends Error {
  constructor(message: string) {
    super(message);
  }
}
