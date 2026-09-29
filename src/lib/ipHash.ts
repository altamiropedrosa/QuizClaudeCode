import { createHash } from "node:crypto";

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Salted SHA-256 of the IP: the raw IP is never stored. */
export function hashIp(ip: string, salt = process.env.IP_HASH_SALT): string {
  if (!salt) throw new Error("IP_HASH_SALT não configurado");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
