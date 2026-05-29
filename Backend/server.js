require("dotenv").config();
const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorhandler.middleware");
const connectDB = require("./config/db");
const { swaggerDocs } = require("./config/swagger");

const app = express();

// Global Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Setup Swagger
swaggerDocs(app);

// Eagerly connect to database (useful for local development to see the connection log immediately)
connectDB().catch(console.error);

// Ensure Database is connected before processing any request (Serverless Safe)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

// Routes
app.get("/", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
        success: true,
        message: {
            title: "SPA Management API is running 🚀",
            description: "Welcome to the premium SPA Management System API. The system handles secure user authentication, appointment scheduling, and spa services catalog."
        },
        version: "1.0.0",
        documentation: `${baseUrl}/api-docs`
    });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/home", require("./routes/home.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/banners", require("./routes/banner.routes"));

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
})

// error handler
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

module.exports = app;
