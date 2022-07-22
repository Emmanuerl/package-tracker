import { inject, injectable } from "inversify";

import { Knex } from "knex";
import TYPES from "./inversify";

/**
 * Base row type for postgresql tables
 */
export interface Model {
  /**
   * ID of the row
   */
  id: string;
  /**
   * date the row was created
   */
  created_at: Date;
}

@injectable()
export class Repository<T> {
  @inject(TYPES.KnexDB) protected knex: Knex;

  /**
   * creates a knex query object for a specified table
   * @param table table name
   * @param excluded fields which should be excluded from the query result to be returned
   * @returns
   */
  protected setup(table: string, ...excluded: string[]) {
    return () => this.knex<T>(table).queryContext({ excluded });
  }
}

export type Possible<T> = Promise<T | undefined>;
