export const getAllowedOrigins = (
  raw = process.env.CORS_ALLOWED_ORIGINS ?? "",
) =>
  new Set(
    raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

export const isOriginAllowed = (
  origin: string | undefined,
  allowedOrigins = getAllowedOrigins(),
  nodeEnv = process.env.NODE_ENV,
) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  return nodeEnv !== "production" && allowedOrigins.size === 0;
};

export const getTrustProxy = (
  raw = process.env.TRUST_PROXY,
): false | number | string[] => {
  const value = raw?.trim();

  if (!value || value.toLowerCase() === "false") return false;
  if (value.toLowerCase() === "true") {
    throw new Error(
      "TRUST_PROXY=true trusts arbitrary clients. Use a hop count or explicit proxy CIDRs.",
    );
  }

  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};
