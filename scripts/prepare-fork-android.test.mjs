import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { prepareForkAndroidConfig } from "./prepare-fork-android.mjs";

const config = JSON.parse(readFileSync(new URL("../apps/mobile/app.json", import.meta.url), "utf8"));

test("isolates test installs while preserving production configuration and plugins", () => {
  const before = structuredClone(config);
  const result = prepareForkAndroidConfig(config, "1");
  expect(result.expo.android.package).toBe("org.edgeever.mobile.occino.test");
  expect(result.expo.scheme).toBe("edgeever-occino-test");
  expect(result.expo.updates.enabled).toBe(false);
  expect(result.expo.plugins).toEqual(config.expo.plugins);
  expect(result.expo.version).toBe(config.expo.version);
  expect(config).toEqual(before);
});

test("allows later runs to update earlier test builds and rejects invalid codes", () => {
  const first = prepareForkAndroidConfig(config, "1");
  const second = prepareForkAndroidConfig(config, "2");
  expect(second.expo.android.versionCode).toBe(first.expo.android.versionCode + 1);
  for (const value of [undefined, "", "0", "-1", "1.5", "abc", "2100000000"]) {
    expect(() => prepareForkAndroidConfig(config, value)).toThrow();
  }
});
