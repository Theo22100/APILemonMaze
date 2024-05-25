const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");
const db = require("./database/database");
const app = express();

app.use(cors());
app.use(express.json());
const citronBleu = require("./route/citron/citronbleu.js");
const citronJaune = require("./route/citron/citronjaune.js");
const citronRouge = require("./route/citron/citronrouge.js");
const citronVert = require("./route/citron/citronvert.js");
const lieuRoutes = require("./route/lieu/lieu.js");
const userRoutes = require("./route/user/user.js");
const typeRoutes = require("./route/type/type.js");
const utilsRoutes = require("./route/utils/utils.js");
const partyRoutes = require("./route/party/party.js");
const recompenseRoutes = require("./route/recompense/recompense.js");
const recompenseUserRoutes = require("./route/recompense_user/recompense_user.js");
const parkourRoutes = require("./route/parkour/parkour.js");
const villeRoutes = require("./route/ville/ville.js");
const questionRoutes = require("./route/question/question.js");
const partyquestionRoutes = require("./route/partyquestion/partyquestion.js");
app.use(userRoutes,typeRoutes,parkourRoutes,utilsRoutes,villeRoutes,lieuRoutes,citronBleu,citronJaune,citronRouge,citronVert,partyRoutes,recompenseRoutes,recompenseUserRoutes,partyquestionRoutes,questionRoutes);

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
  "./route/citron/citronbleu.js", 
  "./route/citron/citronjaune.js", 
  "./route/citron/citronrouge.js", 
  "./route/citron/citronvert.js",
  "./route/lieu/lieu.js", 
  "./route/parkour/parkour.js",
  "./route/party/party.js", 
  "./route/recompense/recompense.js", 
  "./route/recompense_user/recompense_user.js", 
  "./route/type/type.js",
  "./route/user/user.js",
  "./route/utils/utils.js", 
"./route/ville/ville.js", 
"./route/question/question.js", 
"./route/partyquestion/partyquestion.js"], 
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