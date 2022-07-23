import { Package, RecordPackageDTO } from "./package.model";

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
      },
      "*"
    );
    return pkg;
  }
}
