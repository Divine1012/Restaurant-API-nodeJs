// src/config/swagger.js
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const swaggerPath = path.resolve('./src/config/swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger UI disponible sur /api-docs");
};

export default setupSwagger;
