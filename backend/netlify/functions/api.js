import serverless from "serverless-http";
import app from "../../app.js";

console.log("api.js loaded, app:", !!app);
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": event.headers.origin || "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      body: "",
    };
  }

  return await serverlessHandler(event, context);
};
