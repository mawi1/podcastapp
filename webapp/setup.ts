import fs from "fs";
import path, { dirname } from "path";
import { GenericContainer } from "testcontainers";
import { fileURLToPath } from "url";
import type { TestProject } from "vitest/node";
import YAML from "yaml";

export async function setup(project: TestProject) {
  const dockerComposePath = path.resolve(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "docker-compose.yaml"
  );
  const file = fs.readFileSync(dockerComposePath, "utf8");
  const postgresImage = YAML.parse(file)["services"]["postgres_db"]["image"];
  const user = "USER";
  const password = "PASSWORD";

  globalThis.postgresContainer = await new GenericContainer(postgresImage)
    .withExposedPorts(5432)
    .withEnvironment({ POSTGRES_USER: user, POSTGRES_PASSWORD: password })
    .start();
  project.provide("postgresConfig", {
    user,
    password,
    host: globalThis.postgresContainer.getHost(),
    port: globalThis.postgresContainer.getMappedPort(5432),
  });
}

export async function teardown() {
  console.log("testcontainer teardon");
  await globalThis.postgresContainer.stop();
}
