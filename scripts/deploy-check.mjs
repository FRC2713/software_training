import { readFileSync } from "node:fs";

const contract = JSON.parse(
  readFileSync(new URL("../.hawk/app.json", import.meta.url), "utf8")
);

if (process.argv.includes("--contract")) {
  console.log(JSON.stringify(contract));
} else {
  const missing = contract.required_env.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  try {
    for (const name of ["APP_URL", "HAWK_SUITE_ISSUER", "RUNNER_URL"]) {
      if (process.env[name]) {
        const url = new URL(process.env[name]);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      }
    }
    if (
      process.env.HAWK_SUITE_TRUST_PROXY &&
      process.env.HAWK_SUITE_TRUST_PROXY !== "true"
    ) {
      throw new Error();
    }
    if (
      process.env.HAWK_SUITE_TEAM_ID &&
      !/^T[A-Z0-9]+$/.test(process.env.HAWK_SUITE_TEAM_ID)
    ) {
      throw new Error();
    }
    if (process.env.PORT) {
      const port = Number(process.env.PORT);
      if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error();
    }
    console.log(JSON.stringify({ status: "ok", contract: contract.schema }));
  } catch {
    // Parse errors can contain credentials. Report names, never values.
    console.error(
      "Invalid deployment configuration; check the app environment contract."
    );
    process.exit(1);
  }
}
