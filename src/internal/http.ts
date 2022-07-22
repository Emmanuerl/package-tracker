import { Logger } from "@risemaxi/octonet";
import { Request, Response } from "express";
import Status from "http-status-codes";
import { inject, injectable } from "inversify";

import TYPES from "./inversify";

@injectable()
export class Controller<T> {
  @inject(TYPES.Logger) protected log: Logger;

  protected send(req: Request, res: Response, t: T) {
    res.status(Status.OK).send(t);
    this.log.response(req, res);
  }
}
