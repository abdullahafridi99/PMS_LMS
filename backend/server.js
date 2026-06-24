require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const bcrypt = require("bcryptjs");
const dbService = require("./services/dbService");
const { initializeSocket } = require("./sockets/socketHandler");

// Express App Initialization
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow external visual layouts/scripts in dev
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Serve uploads folder statically for fallback Cloudinary mock files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Main Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Pakhtunkhwa Model School SaaS System API Server!",
    status: "Running",
    databaseMode: dbService.isMongo() ? "MongoDB" : "Local JSON Fallback",
  });
});

// Import Routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const attendanceRoutes = require("./routes/attendance");
const feeRoutes = require("./routes/fees");
const examRoutes = require("./routes/exams");
const lmsRoutes = require("./routes/lms");
const homeworkRoutes = require("./routes/homework");
const transportRoutes = require("./routes/transport");
const inventoryRoutes = require("./routes/inventory");
const aiRoutes = require("./routes/ai");
const logsRoutes = require("./routes/logs");
const noticeRoutes = require("./routes/notices");
const settingsRoutes = require("./routes/settings");
const smsLogsRoutes = require("./routes/smsLogs");
const inquiriesRoutes = require("./routes/inquiries");
const emailLogsRoutes = require("./routes/emailLogs");

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/lms", lmsRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sms-logs", smsLogsRoutes);
app.use("/api/inquiries", inquiriesRoutes);
app.use("/api/email-logs", emailLogsRoutes);

// Seed Data Generator Function
const seedDatabase = async () => {
  try {
    console.log("🌱 Checking database seeding requirements...");

    // 1. Check & Seed Settings (principal, school facade, and staff directory)
    const settings = await dbService.settings.findOne({ key: 'landing_page' });
    if (settings) {
      console.log("📚 Settings document ('landing_page') already exists.");
      if (settings.principalName !== 'Principal Tariq Zaman') {
        console.log(`🔧 Updating principalName in Settings from "${settings.principalName}" to "Principal Tariq Zaman"...`);
        await dbService.settings.findOneAndUpdate({ key: 'landing_page' }, { ...settings, principalName: 'Principal Tariq Zaman' });
      }
    } else {
      console.log("🌱 Settings document seeded successfully!");
    }

    // 2. Check & Seed Admin User
    const existingAdmin = await dbService.users.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log("🌱 Admin account not found. Seeding default Admin...");
      const adminPassword = bcrypt.hashSync("admin123", 10);
      await dbService.users.create({
        name: "Principal Tariq Zaman",
        email: "admin@pms.edu",
        password: adminPassword,
        role: "admin",
        phone: "+92 333 9123456",
        address: "Zangali Kohat Road, Peshawar, KP",
      });
      console.log("✅ Default admin account seeded successfully! (admin@pms.edu / admin123)");
    } else {
      console.log(`📚 Admin account already exists: ${existingAdmin.name} (${existingAdmin.email})`);
      if (existingAdmin.name !== 'Principal Tariq Zaman') {
        console.log(`🔧 Updating Admin name in users from "${existingAdmin.name}" to "Principal Tariq Zaman"...`);
        await dbService.users.findByIdAndUpdate(existingAdmin.id || existingAdmin._id, { name: 'Principal Tariq Zaman' });
      }
    }

    // 3. Check & Seed Teacher User
    const existingTeacher = await dbService.users.findOne({ role: 'teacher' });
    if (!existingTeacher) {
      console.log("🌱 Teacher account not found. Seeding default Teacher...");
      const teacherPassword = bcrypt.hashSync("admin123", 10);
      await dbService.users.create({
        name: "Sir Niamat Ullah",
        email: "teacher1@pms.edu",
        password: teacherPassword,
        role: "teacher",
        phone: "+92 312 9876543",
        address: "Senior Mathematics Head",
        cnic: "1730122222222",
        studentId: "17301-2222222-2" 
      });
      console.log("✅ Default teacher account seeded successfully! (teacher1@pms.edu / admin123, CNIC: 17301-2222222-2)");
    } else {
      console.log(`📚 Teacher account already exists: ${existingTeacher.name} (${existingTeacher.email})`);
    }

    // 4. Seed default courses inside LMS
    const courses = await dbService.lms.find({});
    if (courses.length === 0) {
      console.log("📚 Seeding default courses in LMS...");
      await dbService.lms.create({
        courseName: "General Physics Grade 9",
        class: "Grade 9",
        subject: "Physics",
        lectures: [
          { title: "Introduction to Physical Quantities", videoUrl: "https://www.youtube.com/watch?v=M_Tj_kFkX4M", description: "Basics of measurements, base units, and derived units." }
        ],
        notes: [
          { title: "Chapter 1 Physics Formula Sheet", fileUrl: "/uploads/ch1_physics_formulas.pdf" }
        ],
        quizzes: [
          {
            quizTitle: "Base Units Quiz",
            durationMinutes: 10,
            questions: [
              { questionText: "Which of the following is a base unit of mass?", options: ["gram", "kilogram", "pound", "ton"], correctOptionIdx: 1 }
            ]
          }
        ]
      });
    }

    console.log("🌱 Seeding check complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
};

// Create HTTP server for socket.io attachment
const server = http.createServer(app);

// Initialize Sockets
initializeSocket(server);

// Start Server
const startServer = async () => {
  // Initialize MongoDB connection or JSON fallback
  await dbService.initialize();

  // Run seed script
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`🚀 Pakhtunkhwa Model School server running on port ${PORT}...`);
  });
};

startServer();
