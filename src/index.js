import express from "express";
import { connectDB } from "./mongo.js";

const app = express();

await connectDB();

app.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("🔗 Swagger UI disponible : http://localhost:3000/api-docs");
});

export default app;