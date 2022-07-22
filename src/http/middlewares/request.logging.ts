import { NextFunction, Request, Response } from "express";

import { Logger } from "@risemaxi/octonet";

const kubernetesAgents = [/kube-probe/i, /Prometheus/i];

/*
 * Captures and stores the body of the response in `Request.locals.body` whenever
 * `Response.json` is called
 * @param _req express request
 * @param res express response
 * @param next next middleware function
 */
export function captureBody(_req: Request, res: Response, next: NextFunction) {
  const json = res.json;

  res.json = function (body?: any) {
    res.locals.body = body instanceof Buffer ? JSON.parse(body.toString()) : body;
    return json.call(this, body);
  };

  next();
}

function hasUserAgent(req: Request, ignore: RegExp[]) {
  return ignore.some(x => x.test(req.headers["user-agent"]));
}

/**
 * Create middleware to log requests
 * @param logger octonent logger
 * @param ignore user agents of requests to ignore
 */
export function logRequest(logger: Logger, ignore = []) {
  // ignore kubernetes requests by default
  ignore.push(...kubernetesAgents);

  return function (req: Request, _res: Response, next: NextFunction) {
    // ignore some user agents
    if (hasUserAgent(req, ignore)) {
      return next();
    }

    logger.request(req);
    next();
  };
}
