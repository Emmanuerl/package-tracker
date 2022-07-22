import { StatusCodes } from "http-status-codes";
import { Test } from "supertest";
import { promisify } from "util";

export const sleep = promisify(setTimeout);

export async function getSuccess<T>(t: Test) {
  const { body } = await t.expect(StatusCodes.OK);
  return body as T;
}

export async function getError(code: number, t: Test): Promise<string> {
  const { body } = await t.expect(code);
  return body.message;
}
