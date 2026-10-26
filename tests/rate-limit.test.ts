import { describe, expect, test } from "bun:test";
import {
  createLimiter,
  E2E_LIMIT_FACTOR,
  resolveLimit,
} from "@/lib/rate-limit-core";

describe("limiteur de débit", () => {
  test("bloque au-delà du quota dans la fenêtre", () => {
    const limiter = createLimiter();
    const results = Array.from({ length: 4 }, () =>
      limiter("login:1.2.3.4", 3, 1000, 0),
    );
    expect(results).toEqual([true, true, true, false]);
  });

  test("réautorise après expiration de la fenêtre", () => {
    const limiter = createLimiter();
    limiter("login:ip", 1, 1000, 0);
    expect(limiter("login:ip", 1, 1000, 500)).toBe(false);
    expect(limiter("login:ip", 1, 1000, 1001)).toBe(true);
  });

  test("isole les clés (action et IP)", () => {
    const limiter = createLimiter();
    limiter("login:a", 1, 1000, 0);
    expect(limiter("login:b", 1, 1000, 0)).toBe(true);
    expect(limiter("register:a", 1, 1000, 0)).toBe(true);
  });

  test("quota d'origine sans drapeau E2E (production)", () => {
    expect(resolveLimit(10, {})).toBe(10);
    expect(resolveLimit(10, { NODE_ENV: "production" })).toBe(10);
    expect(resolveLimit(10, { E2E_TEST_MODE: "true" })).toBe(10);
    expect(resolveLimit(10, { E2E_TEST_MODE: "0" })).toBe(10);
  });

  test("quota relevé mais jamais désactivé avec E2E_TEST_MODE=1", () => {
    expect(resolveLimit(10, { E2E_TEST_MODE: "1" })).toBe(10 * E2E_LIMIT_FACTOR);
    expect(Number.isFinite(resolveLimit(10, { E2E_TEST_MODE: "1" }))).toBe(true);
  });
});
