import { createHash } from "node:crypto";
import createHttpError from "http-errors";
import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  includeEmail?: boolean;
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const emailKey = (req: Request) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
};

export const createRateLimit = (options: RateLimitOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (buckets.size > 10_000) {
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
    }

    const identity = options.includeEmail
      ? `${req.ip}:${emailKey(req)}`
      : req.ip;
    const key = `${req.baseUrl}${req.path}:${identity}`;
    const existing = buckets.get(key);
    const bucket = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : existing;

    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader("RateLimit-Limit", options.max);
    res.setHeader("RateLimit-Remaining", Math.max(0, options.max - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > options.max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return next(createHttpError.TooManyRequests("Too many requests"));
    }
    next();
  };
