import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

// Load environment variables from local .env
dotenv.config();

// Import schemas using shared paths
import { User, LawFirm } from "../shared/schema";

async function runSeed() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/lefri-ai";
  console.log("Connecting to MongoDB at:", uri);
  
  await mongoose.connect(uri);
  console.log("Connected successfully.");

  const testEmails = ["citizen@lefri.ai", "lawyer@lefri.ai", "admin@lefri.ai"];

  // 1. Clean up old test data
  console.log("Cleaning up old test users...");
  await User.deleteMany({ email: { $in: testEmails } });
  await LawFirm.deleteMany({ name: "Firma Legal de Prueba" });

  // 2. Create Citizen User
  console.log("Creating Citizen user...");
  const citizen = new User({
    email: "citizen@lefri.ai",
    name: "Ciudadano de Prueba",
    role: "citizen",
    country: "EC",
    language: "es",
    phone: "0999999999",
  });
  await citizen.save();
  console.log("Citizen user created.");

  // 3. Create Law Firm and Lawyer User
  console.log("Creating Law Firm...");
  const firm = new LawFirm({
    name: "Firma Legal de Prueba",
    specialty: "general",
    subscriptionPlan: "free",
    proBonoLimit: 3,
    proBonoUsed: 0,
    notorietyScore: 100,
    whatsAppSessionActive: false
  });
  await firm.save();
  console.log("Law Firm created.");

  console.log("Creating Lawyer user...");
  const lawyer = new User({
    email: "lawyer@lefri.ai",
    name: "Abogado de Prueba",
    role: "lawyer",
    country: "EC",
    language: "es",
    phone: "0988888888",
    lawFirmId: firm._id
  });
  await lawyer.save();
  console.log("Lawyer user created.");

  // 4. Create Admin User
  console.log("Creating Admin user...");
  const admin = new User({
    email: "admin@lefri.ai",
    name: "Administrador de Prueba",
    role: "admin",
    country: "EC",
    language: "es",
    phone: "0977777777",
  });
  await admin.save();
  console.log("Admin user created.");

  console.log("\n==============================================");
  console.log("SEEDING COMPLETED SUCCESSFULLY!");
  console.log("----------------------------------------------");
  console.log("Test accounts are ready to use:");
  console.log("1. Citizen User:     citizen@lefri.ai");
  console.log("2. Lawyer User:      lawyer@lefri.ai");
  console.log("3. Admin User:       admin@lefri.ai");
  console.log("----------------------------------------------");
  console.log("Note: You can use any password to log in.");
  console.log("==============================================\n");

  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
