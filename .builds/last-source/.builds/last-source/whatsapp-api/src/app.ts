import "dotenv/config"
import express from "express"
import cors from "cors"
import routes from "./infrastructure/router"
import mongoose from "mongoose"
import { WhatsAppManager } from "./infrastructure/whatsapp-manager"

const port = process.env.PORT || 3001
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('tmp'))
app.use(`/`, routes)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lefri-ai';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("whatsapp-api connected to MongoDB");
    // Autostart previously logged in sessions
    await WhatsAppManager.autoStartAll();
  })
  .catch(err => {
    console.error("whatsapp-api failed to connect to MongoDB:", err);
  });

app.listen(port, () => console.log(`Ready...${port}`))