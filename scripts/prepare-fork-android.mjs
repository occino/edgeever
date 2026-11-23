import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function prepareForkAndroidConfig(config, runNumber) {
  const build = Number(runNumber);
  const versionCode = config.expo.android.versionCode + build;
  if (!Number.isSafeInteger(build) || build < 1 || !Number.isSafeInteger(versionCode) || versionCode > 2_100_000_000) {
    throw new Error("A positive workflow run number within the Android version-code limit is required.");
  }
  return {
    ...config,
    expo: {
      ...config.expo,
      name: "EdgeEver Test",
      scheme: "edgeever-occino-test",
      android: { ...config.expo.android, package: "org.edgeever.mobile.occino.test", versionCode },
      updates: { ...config.expo.updates, enabled: false },
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = "apps/mobile/app.json";
  const config = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, `${JSON.stringify(prepareForkAndroidConfig(config, process.env.GITHUB_RUN_NUMBER), null, 2)}\n`);
}
