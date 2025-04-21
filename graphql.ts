import {
  getDefaultPageContextInit,
  getDefaultResponseHandler,
} from "@vite-plugin-vercel/vike/helpers";

export default async function handler(
  request: Parameters<typeof getDefaultPageContextInit>[0],
  response: Parameters<typeof getDefaultResponseHandler>[0]
) {
  console.info(`Serverless function ${request.url} was invoked`);

  const crash = request.url.includes("crash") || !!request.headers["x-crash"];
  response.setHeader("x-serverless-function", request.url as string);
  response.setHeader("content-type", "application/json");

  const error = request.url.includes("error") || !!request.headers["x-error"];

  if (crash) {
    response.statusCode = +request.headers["x-crash"] || 500;
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return response.json({
      message: `I crashed :( (${new Date().toTimeString()})`,
    });
  } else if (error) {
    response.statusCode = +request.headers["x-error"] || 500;
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    throw new Error(`I errored :( (${new Date().toTimeString()})`);
  } else {
    response.statusCode = 200;
    return response.json({
      message: `Hello World from ${request.url} (${new Date().toTimeString()})`,
    });
  }
}
