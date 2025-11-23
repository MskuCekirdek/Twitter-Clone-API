import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.handler.js";
import { notFoundMiddleware } from "./middlewares/not.found.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 API running on http://localhost:${PORT}`);
});

app.use(notFoundMiddleware);
app.use(errorHandler);
