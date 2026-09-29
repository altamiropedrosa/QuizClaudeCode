import { describe, expect, it } from "vitest";
import { clientIp, hashIp } from "./ipHash";

describe("clientIp", () => {
  it("usa o primeiro IP de x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("cai para x-real-ip e depois para 'unknown'", () => {
    expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("hashIp", () => {
  it("é determinístico, depende do salt e não contém o IP", () => {
    const a = hashIp("1.2.3.4", "salt-a");
    expect(a).toBe(hashIp("1.2.3.4", "salt-a"));
    expect(a).not.toBe(hashIp("1.2.3.4", "salt-b"));
    expect(a).not.toContain("1.2.3.4");
  });

  it("falha sem salt", () => {
    expect(() => hashIp("1.2.3.4", "")).toThrow();
  });
});
