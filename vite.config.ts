import { getSsrEndpoint } from "@vite-plugin-vercel/vike";
import react from "@vitejs/plugin-react-swc";
import { readFile } from "fs/promises";
import path from "path";
import vike from "vike/plugin";
import { ConfigEnv, ServerOptions, defineConfig, loadEnv } from "vite";
import vercel from "vite-plugin-vercel";

const envDir = path.join(__dirname, "./env");

function getServerOptions(
  env: Record<string, string>
): ServerOptions | undefined {
  return {
    open: env.OPEN === "true",
    host: !!env.HOST && env.HOST,
  };
}

async function getServerlessEndpoint({
  file,
  destination,
  cache,
}: {
  file: string;
  destination: string;
  cache: boolean;
}) {
  const sourcefile = path.join(__dirname, file);
  return {
    source: {
      contents: await readFile(sourcefile, "utf-8"),
      sourcefile,
      loader: "ts",
      resolveDir: path.dirname(sourcefile),
    },
    destination: destination,
    addRoute: true,
    isr: cache ? { expiration: 15 } : undefined,
  };
}

export default defineConfig(async (config: ConfigEnv) => {
  const env = loadEnv(config.mode, envDir, "");

  return {
    plugins: [
      react({
        plugins: [],
      }),
      vike({ prerender: { partial: true } }),
      vercel(),
    ],
    server: getServerOptions(env),
    envDir,
    envPrefix: ["VITE_", "VERCEL_ANALYTICS_ID"],
    vercel: {
      additionalEndpoints: [
        await getSsrEndpoint({}, path.join(__dirname, "ssr_.template.ts")),
        await getServerlessEndpoint({
          file: "graphql.ts",
          destination: "query",
          cache: false,
        }),
        await getServerlessEndpoint({
          file: "graphql.ts",
          destination: "cache",
          cache: true,
        }),
        await getServerlessEndpoint({
          file: "graphql.ts",
          destination: "crash",
          cache: true,
        }),
        await getServerlessEndpoint({
          file: "graphql.ts",
          destination: "error",
          cache: true,
        }),
      ],
    },
  };
});
