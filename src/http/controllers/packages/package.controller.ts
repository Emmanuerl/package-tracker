import { Package, PackageRepository, RecordPackageDTO } from "@app/packages";

import { Controller } from "@app/internal/http";
import TYPES from "@app/config/inversify.types";
import { inject } from "inversify";
import {
  controller,
  httpPost,
  request,
  requestBody,
  response,
} from "inversify-express-utils";
import { Request, Response } from "express";
import { autoValidate } from "@app/http/middlewares";
import { isRecordPackageDTO } from "./package.validator";

@controller("/packages")
export class PackageController extends Controller<Package> {
  @inject(TYPES.PackageRepository) private readonly repo: PackageRepository;

  /**
   * Recording package entries, assumes a default status of "WAREHOUSE" is none is provided
   * @param req
   * @param res
   * @param body
   * @returns
   */
  @httpPost("/", autoValidate(isRecordPackageDTO))
  async record(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: RecordPackageDTO
  ) {
    const pkg = await this.repo.record(body);

    return this.send(req, res, pkg);
  }
}
