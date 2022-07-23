import { Model } from "@app/internal/postgres";

/**
 * A data representation of a recorded package within the system
 */
export interface Package extends Model {
  /**
   * title (or name) of the ppackage
   */
  title: string;
  /**
   * package description
   */
  description?: string;
  /**
   * size of package in KG
   */
  size: number;
  /**
   * current status of the package
   */
  status: PackageStatus;
}

export const packageStatuses = <const>[
  "PICKED_UP",
  "IN_TRANSIT",
  "WAREHOUSE",
  "DELIVERED",
];
export type PackageStatus = typeof packageStatuses[number];

/**
 * data required to record a new package entry
 */
export type RecordPackageDTO = Pick<
  Package,
  "description" | "size" | "status" | "title"
>;
