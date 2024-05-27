const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");
const db = require("./database/database");
const { migrateType } = require("./migrate/migratetype");
const { migrateVille } = require("./migrate/migrateville");
const app = express();

app.use(cors());
app.use(express.json());

const typeRoutes = require("./route/type/type.js");

app.use(typeRoutes);

// Configuration de Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentation de l'API de LemonMaze",
    },
  },
  // Chemin vers routes
  apis: ["./main.js", 
  "./route/type/type.js"], 
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));



// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Lemonmaze !",
  });
});



// Connexion à la base de données et démarrage du serveur
async function startServer() {
  try {
    await migrateType();
    await migrateVille();
    const db = await require("./database/database").getDB();
    if (db) {
      // Démarrer serveur
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
      });
    } else {
      console.error("La connexion à la base de données a échoué.");
    }
  } catch (error) {
    console.error("Une erreur s'est produite lors de la connexion à la base de données :", error);
    process.exit(1);
  }
}


startServer();

module.exports = app;

// LetsEncrypt
// Certbot