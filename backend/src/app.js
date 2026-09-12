import express from "express";
import cors from "cors";

import citizenAuth from "./routes/auth.citizen.routes.js";
import adminAuth from "./routes/auth.admin.routes.js";
import grievances from "./routes/grievance.routes.js";
import admin from "./routes/admin.routes.js";
import assistant from "./routes/assistant.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { resolveLocale } from "./middleware/locale.middleware.js";
import { t } from "./i18n/index.js";
import { env } from "./config/env.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  env.frontendUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost development
      if (
        origin === "http://localhost:5173" ||
        origin === "http://127.0.0.1:5173"
      ) {
        return callback(null, true);
      }

      // Allow the configured production frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
  })
);

app.use(express.json({ limit: "8mb" }));
app.use(resolveLocale);

app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    message: "Smart City API is running",
    // Sprint 1 smoke test: confirms X-App-Lang / Accept-Language resolution
    // and the backend i18next instance are both wired correctly. Remove or
    // repurpose once Sprint 3 lands real translated messages.
    locale: { resolved: req.lang, sample: t("common:smoke_test", req.lang) },
  })
);

app.use("/api/auth/citizen", citizenAuth);
app.use("/api/auth/admin", adminAuth);
app.use("/api/grievances", grievances);
app.use("/api/admin", admin);
app.use("/api/assistant", assistant);

app.use(errorHandler);

export default app;