import {
  InvalidPackageStatusChange,
  Package,
  PackageNotFound,
  PackageRepository,
  RecordPackageDTO,
  UpdatePackageStatusDTO,
} from "@app/packages";

import { Controller } from "@app/internal/http";
import TYPES from "@app/config/inversify.types";
import { inject } from "inversify";
import {
  controller,
  httpPost,
  httpPut,
  request,
  requestBody,
  requestParam,
  response,
} from "inversify-express-utils";
import { Request, Response } from "express";
import { autoValidate } from "@app/http/middlewares";
import {
  isPackageId,
  isRecordPackageDTO,
  isUpdatePackageStatusDTO,
} from "./package.validator";
import { ApplicationError } from "@app/internal/errors";
import { StatusCodes } from "http-status-codes";

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

  @httpPut(
    "/:id/status",
    autoValidate(isPackageId, "params"),
    autoValidate(isUpdatePackageStatusDTO)
  )
  async updateStatus(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") packageId: string,
    @requestBody() body: UpdatePackageStatusDTO
  ) {
    try {
      const pkg = await this.repo.updateStatus(packageId, body.status);
      return this.send(req, res, pkg);
    } catch (err) {
      if (err instanceof PackageNotFound) {
        throw new ApplicationError(StatusCodes.NOT_FOUND, err.message);
      } else if (err instanceof InvalidPackageStatusChange) {
        throw new ApplicationError(StatusCodes.CONFLICT, err.message);
      }

      throw err;
    }
  }
}
