import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { setupSocketIO } from "./services/socket.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import poolRoutes from "./routes/pools.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import venueRoutes from "./routes/venues.js";
import reviewRoutes from "./routes/reviews.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// Socket.IO
setupSocketIO(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`SQUAD API server running on 0.0.0.0:${PORT}`);
});
