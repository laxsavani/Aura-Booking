const fs = require("fs");
const path = require("path");
const { swaggerSpec } = require("./config/swagger");

try {
  const outputPath = path.join(__dirname, "swagger.json");
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf8");
  console.log(`✅ swagger.json successfully generated at ${outputPath}`);
  process.exit(0);
} catch (error) {
  console.error("❌ Failed to generate swagger.json:", error);
  process.exit(1);
}
