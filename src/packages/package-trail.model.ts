import { Model } from "@app/internal/postgres";
import { Package } from "./package.model";

export interface PackageTrail extends Model {
  /**
   * reference to the package in question
   */
  package_id: string;
  /**
   * state of package after the package state has been updated
   * basicall, the most recent version of the package's state
   */
  current_state: Package;
}
