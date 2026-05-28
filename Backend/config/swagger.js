const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SPA Management API",
            version: "1.0.0",
            description: "API documentation for the SPA Management system, including authentication, appointments, and services management.",
        },
        servers: [
            {
                url: "https://aura-booking-nine.vercel.app",
                description: "Production Server (Vercel)",
            },
            {
                url: "http://localhost:5000",
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [require("path").join(__dirname, "../routes/*.js")], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
    // Expose raw swagger JSON
    app.get("/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    // Check for Vercel serverless environment or production mode
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        // Serve a pure, self-contained HTML file from CDN assets to avoid serverless packaging constraints
        app.get("/api-docs", (req, res) => {
            res.setHeader("Content-Type", "text/html");
            res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aura Booking API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
            `);
        });

        // Redirect api-docs/ to api-docs to ensure consistent loading
        app.get("/api-docs/", (req, res) => {
            res.redirect("/api-docs");
        });
    } else {
        // Local offline development: use standard swagger-ui-express file serving
        const swaggerOptions = {
            customCss: ".swagger-ui .topbar { display: none }"
        };
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
    }

    console.log("📄 Swagger Docs available at http://localhost:5000/api-docs");
};

module.exports = { swaggerDocs, swaggerSpec };
