import serverless from "serverless-http";
import app from "../../app.js";

console.log("api.js loaded, app:", !!app);

export const handler = async (event, context) => {
  console.log("Function started", event.path);
  try {
    const result = await serverless(app)(event, context);
    console.log("Function finished");
    return result;
  } catch (err) {
    console.error("Function crashed:", err);
    throw err;
  }
};
