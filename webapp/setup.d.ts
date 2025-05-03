import { StartedTestContainer } from "testcontainers";
import "vitest";

declare module "vitest" {
  export interface ProvidedContext {
    postgresConfig: {
      user: string;
      password: string;
      host: string;
      port: number;
    };
  }
}

declare global {
  namespace globalThis {
    // eslint-disable-next-line no-var
    var postgresContainer: StartedTestContainer;
  }
}
