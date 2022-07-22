import { Knex } from "knex";

export async function isHealthy(pg: Knex) {
  try {
    await pg.raw("select now()");
  } catch (err) {
    throw new Error("postgres is not ready");
  }
}
