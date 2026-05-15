import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import stripeWebhookRouter from "./routes/webhooks/stripe";

const app: Express = express();

app.set("trust proxy", 1);
app.use(cors());

app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
