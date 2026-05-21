import serverless from "serverless-http";
import express from "express";
import { apiRouter } from "../../server/api";

const app = express();
app.use("/api", apiRouter);

export const handler = serverless(app);
