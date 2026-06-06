require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const dbService = require("./services/dbService");

// Express App Initialization
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Root Route
app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to the Pakhtunkhwa Model School Zangali Branch API Server!",
    status: "Running",
    databaseMode: dbService.isMongo() ? "MongoDB" : "Local JSON Fallback",
  });
});

// Import Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const attendanceRoutes = require("./routes/attendance");
const feeRoutes = require("./routes/fees");
const noticeRoutes = require("./routes/notices");

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notices", noticeRoutes);

// Seed Data Generator Function
const seedDatabase = async () => {
  try {
    const existingUsers = await dbService.users.find({});
    if (existingUsers.length > 0) {
      console.log(
        "📚 Database already contains user accounts. Skipping seeding.",
      );
      return;
    }

    console.log(
      "🌱 Database is empty. Seeding initial Admin account...",
    );

    // Hashing passwords synchronously for the seeds
    const adminPassword = bcrypt.hashSync("admin123", 10);

    // 1. Seed Users (Only Admin)
    await dbService.users.create({
      name: "Principal Tariq Zaman",
      email: "admin@pms.edu",
      password: adminPassword,
      role: "admin",
      phone: "+92 333 9123456",
      address: "Zangali Kohat Road, Peshawar, KP",
    });

    console.log("✅ Default admin account seeded successfully!");
    console.log("🔑 Credentials:");
    console.log("   - Admin:   admin@pms.edu / admin123");
    console.log("🌱 Seeding process complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
};

// Start Server
const startServer = async () => {
  // Initialize MongoDB connection or JSON fallback
  await dbService.initialize();

  // Run seed script
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(
      `🚀 Pakhtunkhwa Model School server running on port ${PORT}...`,
    );
  });
};

startServer();
