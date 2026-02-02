// Carga variables de entorno ANTES de usar process.env o Prisma
require("dotenv").config({ path: ".env.utf8" });

const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to Database");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Cierre elegante
    const shutdown = async () => {
      try {
        await prisma.$disconnect();
      } finally {
        server.close(() => process.exit(0));
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to connect to Database:", error);
    process.exit(1);
  }
}

main();
