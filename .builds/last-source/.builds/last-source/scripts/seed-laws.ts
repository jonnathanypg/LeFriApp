import { connectToDatabase } from '../server/db';
import { LegalDocument } from '../shared/schema';
import { geminiService } from '../server/services/gemini';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleLaws = [
  {
    title: "Constitución de la República del Ecuador - Artículo 325",
    content: "El Estado garantizará el derecho al trabajo. Se reconocen todas las modalidades de trabajo, en relación de dependencia o autónomas, con inclusión del labores de autosustento y cuidado humano, y como actor de la economía social y solidaria.",
    country: "EC",
    category: "Constitución",
    tags: ["trabajo", "derechos", "estado"],
    sectionId: "Art. 325",
    sectionName: "Derechos del Trabajo"
  },
  {
    title: "Constitución de la República del Ecuador - Artículo 326",
    content: "El derecho al trabajo se sustenta en los siguientes principios: 1. El Estado impulsará el pleno empleo y la eliminación del subempleo y del desempleo. 2. Los derechos laborales son irrenunciables e intangibles. Será nula toda estipulación en contrario. 3. A trabajo de igual valor corresponderá igual remuneración.",
    country: "EC",
    category: "Constitución",
    tags: ["trabajo", "principios", "remuneracion"],
    sectionId: "Art. 326",
    sectionName: "Principios del Trabajo"
  },
  {
    title: "Código del Trabajo del Ecuador - Artículo 188 (Despido Intempestivo)",
    content: "El empleador que despidiere intempestivamente al trabajador, será condenado a indemnizarlo de conformidad con el tiempo de servicio: hasta tres años de servicio, con el valor correspondiente a tres meses de remuneración; y, de más de tres años, con el valor equivalente a un mes de remuneración por cada año de servicio, sin que en ningún caso ese valor exceda de veinticinco meses de remuneración. La fracción de año se considerará como año completo.",
    country: "EC",
    category: "Código de Trabajo",
    tags: ["despido", "indemnizacion", "contrato"],
    sectionId: "Art. 188",
    sectionName: "Despido Intempestivo"
  },
  {
    title: "Código del Trabajo del Ecuador - Artículo 169 (Causas para terminación de contrato)",
    content: "El contrato de trabajo termina: 1. Por las causas legalmente previstas en el contrato; 2. Por acuerdo de las partes; 3. Por la conclusión de la obra, período de labor o servicios objeto del contrato; 4. Por muerte o incapacidad del trabajador o extinción de la persona jurídica empleadora; 5. Por caso fortuito o fuerza mayor que imposibilite el trabajo, como incendio, terremoto, tempestad, explosión, plagas del campo, guerra.",
    country: "EC",
    category: "Código de Trabajo",
    tags: ["terminacion", "contrato", "causas"],
    sectionId: "Art. 169",
    sectionName: "Terminación de Contrato"
  },
  {
    title: "Constitución de la República de Colombia - Artículo 25",
    content: "El trabajo es un derecho y una obligación social y goza, en todas sus modalidades, de la especial protección del Estado. Toda persona tiene derecho a un trabajo en condiciones dignas y justas.",
    country: "CO",
    category: "Constitución",
    tags: ["trabajo", "derechos", "estado"],
    sectionId: "Art. 25",
    sectionName: "Derecho al Trabajo"
  },
  {
    title: "Código Sustantivo del Trabajo de Colombia - Artículo 64 (Terminación unilateral sin justa causa)",
    content: "En todo contrato de trabajo va envuelta la condición resolutoria por incumplimiento de lo pactado, con indemnización de perjuicios a cargo de la parte responsable. Esta indemnización comprende el lucro cesante y el daño emergente. En caso de terminación unilateral del contrato de trabajo sin justa causa comprobada, por parte del empleador, o si éste da lugar a la terminación unilateral por parte del trabajador por alguna de las justas causas contempladas en la ley, el primero deberá al segundo una indemnización.",
    country: "CO",
    category: "Código del Trabajo",
    tags: ["despido", "indemnizacion", "justa causa"],
    sectionId: "Art. 64",
    sectionName: "Terminación sin Justa Causa"
  }
];

async function seed() {
  console.log("Starting seed process for laws...");
  const conn = await connectToDatabase();
  if (!conn) {
    console.error("Database connection failed. Seeding aborted.");
    process.exit(1);
  }

  // Limpiar base de datos anterior de leyes
  console.log("Cleaning existing legal documents...");
  await LegalDocument.deleteMany({});

  for (const law of sampleLaws) {
    console.log(`Generating embedding for: ${law.title}...`);
    // Combinar título y contenido para un embedding más rico
    const textToEmbed = `${law.title}\n\n${law.content}`;
    const embedding = await geminiService.getEmbedding(textToEmbed);

    const doc = new LegalDocument({
      ...law,
      embedding
    });

    await doc.save();
    console.log(`Successfully saved: ${law.title}`);
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Critical error in seeding script:", err);
  process.exit(1);
});
