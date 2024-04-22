const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const mysql = require("mysql2/promise");
const cors = require("cors");
const config = require("config");

let db = null;
const app = express();

app.use(cors());
app.use(express.json());

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
  apis: ["./main2.js"], // Chemin vers routes
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Connexion à la base de données
async function connectToDatabase() {
  try {
    db = await mysql.createConnection({
      host: config.get("db.host"),
      user: config.get("db.user"),
      password: config.get("db.password"),
      database: config.get("db.database"),
      charset: config.get("db.charset"),
      port: config.get("db.port"),
    });
    console.log("Connexion à la base de données réussie");
  } catch (error) {
    console.error("Échec de la connexion à la base de données");
    console.error(error);
    process.exit(1);
  }
}

// Routes

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       '200':
 *         description: Connecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la connexion
 *                 mail:
 *                   type: string
 *                   description: Adresse e-mail de l'utilisateur
 *       '401':
 *         description: Utilisateur non trouvé ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la connexion
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/login", async (req, res) => {
    try {
      const mail = req.body.mail;
      const password = req.body.password;
  
      const user = await db.query("SELECT pseudo, mail, password FROM users WHERE mail = ?;", [mail]);
  
      // Vérifier si l'utilisateur est trouvé
      if (user[0].length === 0) {
        return res.status(401).json({
          status: "Utilisateur non trouvé."
        });
      }
  
      const userData = user[0][0];
      const userPassword = userData.password;
      if (userPassword !== password) {
        return res.status(401).json({
          status: "Mot de passe incorrect."
        });
      } else {
        return res.json({
          status: "Connecté",
          mail: userData.mail // Ajout du champ mail dans la réponse JSON
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error"
      });
    }
  });
  



/**
 * @swagger
 * /create-user:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *                 description: Pseudo de l'utilisateur
 *               mail:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *               age:
 *                 type: integer
 *                 description: Age de l'utilisateur
 *               ville:
 *                 type: string
 *                 description: Ville de l'utilisateur
 *     responses:
 *       '200':
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la création de l'utilisateur
 *       '400':
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description de l'erreur
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description de l'erreur interne du serveur
 */
app.post("/create-user", async (req, res) => {
    try {
      const {
        pseudo,
        mail,
        password,
        age,
        ville
      } = req.body;
  
      if (!pseudo) {
        return res.status(400).json({
          error: "Pseudo is required"
        });
      }
      if (!age) {
        return res.status(400).json({
          error: "Age is required"
        });
      }
      if (!ville) {
        return res.status(400).json({
          error: "Ville is required"
        });
      }
      if (!mail) {
        return res.status(400).json({
          error: "Mail is required"
        });
      }
  
      if (!password) {
        return res.status(400).json({
          error: "Password is required"
        });
      }
  
      // Vérifier si le pseudo est déjà pris
      const existingUser = await db.query("SELECT * FROM users WHERE pseudo = ?;", [pseudo]);
  
      if (existingUser[0].length > 0) {
        console.log("pseudo pris");
        return res.status(400).json({
          status: "Ce pseudo est déjà pris !"
        });
      }
  
      // Vérifier si le mail est déjà pris
      const existingMail = await db.query("SELECT * FROM users WHERE mail = ?;", [mail]);
  
      if (existingMail[0].length > 0) {
        return res.status(400).json({
          status: "Ce mail est déjà associé à un compte !"
        });
      }
  
      await db.query("INSERT INTO users (pseudo, mail, password, age, ville) VALUES (?, ?, ?, ?, ?);", [pseudo, mail, password, age, ville]);
  
      res.json({
        status: "OK"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Internal Server Error"
      });
    }
});

/**
 * @swagger
 * /delete-user:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur à supprimer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/delete-user", async (req, res) => {
  const userId = req.body.userId;
  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Supprimez l'utilisateur de la base de données
    await db.query("DELETE FROM users WHERE id = ?;", [userId]);

    res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

/**
 * @swagger
 * /get-user:
 *   get:
 *     summary: Obtenir les données d'un utilisateur
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 data:
 *                   type: object
 *                   description: Données de l'utilisateur
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/get-user", async (req, res) => {
  const userId = req.query.userId;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Renvoyer les données de l'utilisateur
    res.status(200).json({ success: true, data: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des données de l'utilisateur" });
  }
});



/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtenir la liste des utilisateurs
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
});

/**
 * @swagger
 * /change-password:
 *   put:
 *     summary: Changer le mot de passe d'un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur dont le mot de passe doit être changé
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe de l'utilisateur
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/change-password", async (req, res) => {
  const userId = req.body.userId;
  const newPassword = req.body.newPassword;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le mot de passe de l'utilisateur
    await db.query("UPDATE users SET password = ? WHERE id = ?;", [newPassword, userId]);

    res.status(200).json({ success: true, message: "Mot de passe changé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du changement de mot de passe" });
  }
});

/**
 * @swagger
 * /change-email:
 *   put:
 *     summary: Changer l'adresse e-mail d'un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur dont l'adresse e-mail doit être changée
 *               newEmail:
 *                 type: string
 *                 description: Nouvelle adresse e-mail de l'utilisateur
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/change-email", async (req, res) => {
  const userId = req.body.userId;
  const newEmail = req.body.newEmail;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Mettre à jour l'adresse e-mail de l'utilisateur
    await db.query("UPDATE users SET mail = ? WHERE id = ?;", [newEmail, userId]);

    res.status(200).json({ success: true, message: "Adresse e-mail changée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du changement d'adresse e-mail" });
  }
});


// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Lemonmaze !",
  });
});



/**
 * @swagger
 * /add-citron-bleu:
 *   post:
 *     summary: Ajouter un certain nombre de citrons bleus à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons bleus à ajouter
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/add-citron-bleu", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Ajoutez le nombre à la colonne citronBleu
    await db.query("UPDATE users SET citronBleu = citronBleu + ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Bleu ajouté avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Bleu" });
  }
});


/**
 * @swagger
 * /add-citron-orange:
 *   post:
 *     summary: Ajouter un certain nombre de citrons oranges à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons oranges à ajouter
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/add-citron-orange", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Ajoutez le nombre à la colonne citronOrange
    await db.query("UPDATE users SET citronOrange = citronOrange + ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Orange ajouté avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Orange" });
  }
});

/**
 * @swagger
 * /add-citron-rouge:
 *   post:
 *     summary: Ajouter un certain nombre de citrons rouges à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons rouges à ajouter
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/add-citron-rouge", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Ajoutez le nombre à la colonne citronRouge
    await db.query("UPDATE users SET citronRouge = citronRouge + ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Rouge ajouté avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'ajout du citron Rouge" });
  }
});

/**
 * @swagger
 * /add-citron-vert:
 *   post:
 *     summary: Ajouter un certain nombre de citrons verts à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons verts à ajouter
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/add-citron-vert", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Ajoutez le nombre à la colonne citronVert
    await db.query("UPDATE users SET citronVert = citronVert + ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Vert ajouté avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Vert" });
  }
});


/**
 * @swagger
 * /remove-citron-bleu:
 *   post:
 *     summary: Retirer un certain nombre de citrons bleus à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons bleus à retirer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/remove-citron-bleu", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Retirez le nombre de citrons bleus
    await db.query("UPDATE users SET citronBleu = citronBleu - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Bleu retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Bleu" });
  }
});

/**
 * @swagger
 * /remove-citron-orange:
 *   post:
 *     summary: Retirer un certain nombre de citrons oranges à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons oranges à retirer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/remove-citron-orange", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Retirez le nombre de citrons oranges
    await db.query("UPDATE users SET citronOrange = citronOrange - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Orange retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Orange" });
  }
});

/**
 * @swagger
 * /remove-citron-rouge:
 *   post:
 *     summary: Retirer un certain nombre de citrons rouges à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons rouges à retirer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/remove-citron-rouge", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Retirez le nombre de citrons rouges
    await db.query("UPDATE users SET citronRouge = citronRouge - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Rouge retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Rouge" });
  }
});

/**
 * @swagger
 * /remove-citron-vert:
 *   post:
 *     summary: Retirer un certain nombre de citrons verts à un utilisateur
 *     tags: [Citron]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons verts à retirer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/remove-citron-vert", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  try {
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Retirez le nombre de citrons verts
    await db.query("UPDATE users SET citronVert = citronVert - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Vert retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Vert" });
  }
});


/* VILLE */

/**
 * @swagger
 * /add-ville:
 *   post:
 *     summary: Ajouter une nouvelle ville
 *     tags: [Ville]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la ville
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/add-ville", async (req, res) => {
  const nom = req.body.nom;

  try {
    // Insérer la nouvelle ville dans la base de données
    await db.query("INSERT INTO ville (nom) VALUES (?);", [nom]);

    res.status(200).json({ success: true, message: "Ville ajoutée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'ajout de la ville" });
  }
});

/**
 * @swagger
 * /modify-ville/{id}:
 *   put:
 *     summary: Modifier le nom d'une ville existante
 *     tags: [Ville]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ville à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom de la ville
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Ville non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/modify-ville/:id", async (req, res) => {
  const id = req.params.id;
  const nom = req.body.nom;

  try {
    // Vérifier d'abord si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({ success: false, message: "Ville non trouvée" });
    }

    // Modifier le nom de la ville
    await db.query("UPDATE ville SET nom = ? WHERE idville = ?;", [nom, id]);

    res.status(200).json({ success: true, message: "Nom de la ville modifié avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la modification du nom de la ville" });
  }
});

/**
 * @swagger
 * /delete-ville/{id}:
 *   delete:
 *     summary: Supprimer une ville existante
 *     tags: [Ville]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ville à supprimer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de l'opération
 *       '404':
 *         description: Ville non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/delete-ville/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Vérifier d'abord si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({ success: false, message: "Ville non trouvée" });
    }

    // Supprimer la ville de la base de données
    await db.query("DELETE FROM ville WHERE idville = ?;", [id]);

    res.status(200).json({ success: true, message: "Ville supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression de la ville" });
  }
});

/**
 * @swagger
 * /villes:
 *   get:
 *     summary: Obtenir la liste de toutes les villes
 *     tags: [Ville]
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idville:
 *                     type: integer
 *                     description: ID de la ville
 *                   nom:
 *                     type: string
 *                     description: Nom de la ville
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/villes", async (req, res) => {
  try {
    // Récupérer la liste de toutes les villes depuis la base de données
    const [villes] = await db.query("SELECT * FROM ville;");
    res.status(200).json(villes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /ville/{id}:
 *   get:
 *     summary: Obtenir les informations d'une ville spécifique
 *     tags: [Ville]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ville à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idville:
 *                   type: integer
 *                   description: ID de la ville
 *                 nom:
 *                   type: string
 *                   description: Nom de la ville
 *       '404':
 *         description: Ville non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/ville/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Récupérer les informations de la ville spécifique depuis la base de données
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({ error: "Ville non trouvée" });
    }
    res.status(200).json(ville[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});



/*  LIEU */

/**
 * @swagger
 * /create-lieu:
 *   post:
 *     summary: Créer un nouveau lieu
 *     tags: [Lieu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du lieu
 *               gps:
 *                 type: string
 *                 description: Coordonnées GPS du lieu
 *               info:
 *                 type: string
 *                 description: Informations sur le lieu
 *               active:
 *                 type: boolean
 *                 description: Statut d'activation du lieu
 *               id_ville:
 *                 type: integer
 *                 description: ID de la ville associée au lieu
 *     responses:
 *       '200':
 *         description: Lieu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu créé
 *                 nom:
 *                   type: string
 *                   description: Nom du lieu
 *                 gps:
 *                   type: string
 *                   description: Coordonnées GPS du lieu
 *                 info:
 *                   type: string
 *                   description: Informations sur le lieu
 *                 active:
 *                   type: boolean
 *                   description: Statut d'activation du lieu
 *                 id_ville:
 *                   type: integer
 *                   description: ID de la ville associée au lieu
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Ville non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/create-lieu", async (req, res) => {
  const { nom, gps, info, active, id_ville } = req.body;

  try {
    // Vérifier si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id_ville]);
    if (ville.length === 0) {
      return res.status(404).json({ error: "Ville non trouvée." });
    }

    // Insérer le nouveau lieu dans la base de données
    const [result] = await db.query("INSERT INTO lieu (nom, gps, info, active, id_ville) VALUES (?, ?, ?, ?, ?);", [nom, gps, info, active, id_ville]);
    const idlieu = result.insertId;

    res.status(200).json({
      idlieu,
      nom,
      gps,
      info,
      active,
      id_ville
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});


/**
 * @swagger
 * /lieux:
 *   get:
 *     summary: Obtenir la liste de tous les lieux
 *     tags: [Lieu]
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idlieu:
 *                     type: integer
 *                     description: ID du lieu
 *                   nom:
 *                     type: string
 *                     description: Nom du lieu
 *                   gps:
 *                     type: string
 *                     description: Coordonnées GPS du lieu
 *                   info:
 *                     type: string
 *                     description: Informations sur le lieu
 *                   active:
 *                     type: boolean
 *                     description: Statut d'activation du lieu
 *                   id_ville:
 *                     type: integer
 *                     description: ID de la ville associée au lieu
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/lieux", async (req, res) => {
  try {
    const [lieux] = await db.query("SELECT * FROM lieu;");
    res.status(200).json(lieux);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /lieu/{idlieu}:
 *   get:
 *     summary: Obtenir les informations d'un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu
 *                 nom:
 *                   type: string
 *                   description: Nom du lieu
 *                 gps:
 *                   type: string
 *                   description: Coordonnées GPS du lieu
 *                 info:
 *                   type: string
 *                   description: Informations sur le lieu
 *                 active:
 *                   type: boolean
 *                   description: Statut d'activation du lieu
 *                 id_ville:
 *                   type: integer
 *                   description: ID de la ville associée au lieu
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({ error: "Lieu non trouvé." });
    }
    res.status(200).json(lieu[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /delete-lieu/{idlieu}:
 *   delete:
 *     summary: Supprimer un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à supprimer
 *     responses:
 *       '200':
 *         description: Lieu supprimé avec succès
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/delete-lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({ error: "Lieu non trouvé." });
    }

    // Supprimer le lieu de la base de données
    await db.query("DELETE FROM lieu WHERE idlieu = ?;", [idlieu]);
    res.status(200).json({ message: "Lieu supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});


/**
 * @swagger
 * /update-lieu/{idlieu}:
 *   put:
 *     summary: Modifier un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du lieu
 *               gps:
 *                 type: string
 *                 description: Nouvelles coordonnées GPS du lieu
 *               info:
 *                 type: string
 *                 description: Nouvelles informations sur le lieu
 *               active:
 *                 type: boolean
 *                 description: Nouvel état d'activité du lieu
 *               id_ville:
 *                 type: integer
 *                 description: Nouvel ID de la ville associée au lieu
 *     responses:
 *       '200':
 *         description: Lieu modifié avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/update-lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  const { nom, gps, info, active, id_ville } = req.body;
  
  // Vérifier si tous les champs requis sont fournis
  if (!nom || !gps || !info || active === undefined || !id_ville) {
    return res.status(400).json({ error: "Tous les champs requis sont nécessaires." });
  }

  try {
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({ error: "Lieu non trouvé." });
    }

    // Mettre à jour les informations du lieu dans la base de données
    await db.query("UPDATE lieu SET nom = ?, gps = ?, info = ?, active = ?, id_ville = ? WHERE idlieu = ?;", [nom, gps, info, active, id_ville, idlieu]);
    res.status(200).json({ message: "Lieu modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /lieux/{id}/desactiver:
 *   put:
 *     summary: Désactiver un lieu en le passant à l'état inactif
 *     tags: [Lieux]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du lieu à désactiver
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la mise à jour a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de la mise à jour
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/lieux/:id/desactiver", async (req, res) => {
  try {
    const id = req.params.id;
    
    // Mettre à jour l'attribut "active" du lieu à 0
    await db.query("UPDATE lieu SET active = 0 WHERE idlieu = ?;", [id]);
    
    res.status(200).json({ success: true, message: "Lieu désactivé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
});


/**
 * @swagger
 * /lieux/{id}/activer:
 *   put:
 *     summary: Activer un lieu en le passant à l'état inactif
 *     tags: [Lieux]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du lieu à désactiver
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la mise à jour a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de la mise à jour
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/lieux/:id/activer", async (req, res) => {
  try {
    const id = req.params.id;
    
    // Mettre à jour l'attribut "active" du lieu à 1
    await db.query("UPDATE lieu SET active = 1 WHERE idlieu = ?;", [id]);
    
    res.status(200).json({ success: true, message: "Lieu activé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
});








/* TYPES */ 


/**
 * @swagger
 * /create-type:
 *   post:
 *     summary: Créer un nouveau type
 *     tags: [Type]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du nouveau type
 *     responses:
 *       '200':
 *         description: Type créé avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/create-type", async (req, res) => {
  const { nom } = req.body;
  
  // Vérifier si le champ nom est fourni
  if (!nom) {
    return res.status(400).json({ error: "Le nom du type est requis." });
  }

  try {
    // Insérer le nouveau type dans la base de données
    await db.query("INSERT INTO type (nom) VALUES (?);", [nom]);
    res.status(200).json({ message: "Type créé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});





/**
 * @swagger
 * /types:
 *   get:
 *     summary: Obtenir la liste de tous les types
 *     tags: [Type]
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idtype:
 *                     type: integer
 *                     description: ID du type
 *                   nom:
 *                     type: string
 *                     description: Nom du type
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/types", async (req, res) => {
  try {
    const [types] = await db.query("SELECT * FROM type;");
    res.status(200).json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /type/{idtype}:
 *   get:
 *     summary: Obtenir les informations d'un type spécifique
 *     tags: [Type]
 *     parameters:
 *       - in: path
 *         name: idtype
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idtype:
 *                   type: integer
 *                   description: ID du type
 *                 nom:
 *                   type: string
 *                   description: Nom du type
 *       '404':
 *         description: Type non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/type/:idtype", async (req, res) => {
  const idtype = req.params.idtype;
  try {
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [idtype]);
    if (type.length === 0) {
      return res.status(404).json({ error: "Type non trouvé." });
    }
    res.status(200).json(type[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /delete-type/{idtype}:
 *   delete:
 *     summary: Supprimer un type spécifique
 *     tags: [Type]
 *     parameters:
 *       - in: path
 *         name: idtype
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type à supprimer
 *     responses:
 *       '200':
 *         description: Type supprimé avec succès
 *       '404':
 *         description: Type non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/delete-type/:idtype", async (req, res) => {
  const idtype = req.params.idtype;
  try {
    // Vérifier si le type existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [idtype]);
    if (type.length === 0) {
      return res.status(404).json({ error: "Type non trouvé." });
    }

    // Supprimer le type de la base de données
    await db.query("DELETE FROM type WHERE idtype = ?;", [idtype]);
    res.status(200).json({ message: "Type supprimé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});


/**
 * @swagger
 * /update-type/{idtype}:
 *   put:
 *     summary: Modifier un type spécifique
 *     tags: [Type]
 *     parameters:
 *       - in: path
 *         name: idtype
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du type
 *     responses:
 *       '200':
 *         description: Type modifié avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Type non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/update-type/:idtype", async (req, res) => {
  const idtype = req.params.idtype;
  const { nom } = req.body;
  
  // Vérifier si le nouveau nom est fourni
  if (!nom) {
    return res.status(400).json({ error: "Nouveau nom du type requis." });
  }

  try {
    // Vérifier si le type existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [idtype]);
    if (type.length === 0) {
      return res.status(404).json({ error: "Type non trouvé." });
    }

    // Mettre à jour le nom du type dans la base de données
    await db.query("UPDATE type SET nom = ? WHERE idtype = ?;", [nom, idtype]);
    res.status(200).json({ message: "Type modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /update-lieu/{idlieu}:
 *   put:
 *     summary: Modifier un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du lieu
 *               gps:
 *                 type: string
 *                 description: Nouvelles coordonnées GPS du lieu
 *               info:
 *                 type: string
 *                 description: Nouvelles informations sur le lieu
 *               active:
 *                 type: boolean
 *                 description: Nouvel état d'activité du lieu
 *               id_ville:
 *                 type: integer
 *                 description: Nouvel ID de la ville associée au lieu
 *     responses:
 *       '200':
 *         description: Lieu modifié avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/update-lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  const { nom, gps, info, active, id_ville } = req.body;
  
  // Vérifier si tous les champs requis sont fournis
  if (!nom || !gps || !info || active === undefined || !id_ville) {
    return res.status(400).json({ error: "Tous les champs requis sont nécessaires." });
  }

  try {
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({ error: "Lieu non trouvé." });
    }

    // Mettre à jour les informations du lieu dans la base de données
    await db.query("UPDATE lieu SET nom = ?, gps = ?, info = ?, active = ?, id_ville = ? WHERE idlieu = ?;", [nom, gps, info, active, id_ville, idlieu]);
    res.status(200).json({ message: "Lieu modifié avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/*  PARKOUR */

/**
 * @swagger
 * /parkours:
 *   get:
 *     summary: Obtenir la liste de tous les parcours
 *     tags: [Parkour]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/parkours", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM parkour;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /parkour/{id}:
 *   get:
 *     summary: Obtenir les informations d'un parcours spécifique
 *     tags: [Parkour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du parcours à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *       '404':
 *         description: Parcours non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/parkour/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
    if (parkour.length === 0) {
      return res.status(404).json({ error: "Parcours non trouvé." });
    }
    res.json(parkour[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});



/**
 * @swagger
 * /create-parkour:
 *   post:
 *     summary: Créer un nouveau parcours
 *     tags: [Parkour]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du nouveau parcours
 *               avis:
 *                 type: integer
 *                 description: Avis du nouveau parcours
 *               id_lieu1:
 *                 type: integer
 *                 description: ID du premier lieu du nouveau parcours
 *               id_lieu2:
 *                 type: integer
 *                 description: ID du deuxième lieu du nouveau parcours
 *               id_lieu3:
 *                 type: integer
 *                 description: ID du troisième lieu du nouveau parcours
 *               id_lieu4:
 *                 type: integer
 *                 description: ID du quatrième lieu du nouveau parcours
 *               id_type:
 *                 type: integer
 *                 description: ID du type du nouveau parcours
 *     responses:
 *       '200':
 *         description: Parcours créé avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Lieu ou type non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/create-parkour", async (req, res) => {
  const { nom, avis, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type } = req.body;
  
  // Vérifier si les champs requis sont fournis
  if (!nom || !avis || !id_lieu1 || !id_lieu2 || !id_lieu3 || !id_lieu4 || !id_type) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    // Vérifier si les lieux spécifiés existent
    const lieux = await Promise.all([
      db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu1]),
      db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu2]),
      db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu3]),
      db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu4])
    ]);

    // Si un des lieux n'est pas trouvé, renvoyer une erreur 404
    if (lieux.some(([result]) => result.length === 0)) {
      return res.status(404).json({ error: "Lieu non trouvé." });
    }

    // Vérifier si le type spécifié existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [id_type]);
    if (type.length === 0) {
      return res.status(404).json({ error: "Type non trouvé." });
    }

    // Insérer le nouveau parcours dans la base de données
    await db.query("INSERT INTO parkour (nom, avis, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type) VALUES (?, ?, ?, ?, ?, ?, ?);", 
      [nom, avis, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type]);
    res.status(200).json({ message: "Parcours créé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /parkour/{id}:
 *   put:
 *     summary: Modifier un parcours spécifique
 *     tags: [Parkour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du parcours à modifier
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du parcours
 *               avis:
 *                 type: string
 *                 description: Nouvel avis sur le parcours
 *               id_lieu1:
 *                 type: integer
 *                 description: Nouvel ID du premier lieu du parcours
 *               id_lieu2:
 *                 type: integer
 *                 description: Nouvel ID du deuxième lieu du parcours
 *               id_lieu3:
 *                 type: integer
 *                 description: Nouvel ID du troisième lieu du parcours
 *               id_lieu4:
 *                 type: integer
 *                 description: Nouvel ID du quatrième lieu du parcours
 *               id_type:
 *                 type: integer
 *                 description: Nouvel ID du type de parcours
 *     responses:
 *       '200':
 *         description: Succès
 *       '404':
 *         description: Parcours non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/parkour/:id", async (req, res) => {
  const id = req.params.id;
  const { nom, avis, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type } = req.body;
  try {
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
    if (parkour.length === 0) {
      return res.status(404).json({ error: "Parcours non trouvé." });
    }
    await db.query("UPDATE parkour SET nom = ?, avis = ?, id_lieu1 = ?, id_lieu2 = ?, id_lieu3 = ?, id_lieu4 = ?, id_type = ? WHERE idparkour = ?;", [nom, avis, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type, id]);
    res.json({ success: true, message: "Parcours modifié avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

/**
 * @swagger
 * /parkour/{id}:
 *   delete:
 *     summary: Supprimer un parcours spécifique
 *     tags: [Parkour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du parcours à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *       '404':
 *         description: Parcours non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/parkour/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
    if (parkour.length === 0) {
      return res.status(404).json({ error: "Parcours non trouvé." });
    }
    await db.query("DELETE FROM parkour WHERE idparkour = ?;", [id]);
    res.json({ success: true, message: "Parcours supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});


/* PARTY */

/**
 * @swagger
 * /create-party:
 *   post:
 *     summary: Créer une nouvelle partie
 *     tags: [Party]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_parkour:
 *                 type: integer
 *                 description: ID du parcours de la partie
 *               id_user:
 *                 type: integer
 *                 description: ID de l'utilisateur participant à la partie
 *     responses:
 *       '200':
 *         description: Succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Parcours ou utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/create-party", async (req, res) => {
  const { id_parkour, id_user } = req.body;
  try {
    // Vérifier si le parcours existe
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id_parkour]);
    if (parkour.length === 0) {
      return res.status(404).json({ error: "Parcours non trouvé." });
    }

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Insérer la nouvelle partie dans la base de données
    await db.query("INSERT INTO party (id_parkour, id_user) VALUES (?, ?);", [id_parkour, id_user]);
    
    res.json({ success: true, message: "Partie créée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});





/**
 * @swagger
 * /parties:
 *   get:
 *     summary: Obtenir la liste de toutes les parties
 *     tags: [Party]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/parties", async (req, res) => {
  try {
    // Récupérer toutes les parties depuis la base de données
    const parties = await db.query("SELECT * FROM party;");
    
    // Envoyer la liste des parties en réponse
    res.status(200).json(parties[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});





/**
 * @swagger
 * /party/{id}:
 *   get:
 *     summary: Obtenir les informations spécifiques d'une partie
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la partie
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idparty:
 *                   type: integer
 *                   description: ID de la partie
 *                 dateDebut:
 *                   type: string
 *                   format: date-time
 *                   description: Date de début de la partie
 *                 dateFin:
 *                   type: string
 *                   format: date-time
 *                   description: Date de fin de la partie
 *                 abandon:
 *                   type: boolean
 *                   description: Indique si la partie a été abandonnée
 *                 id_parkour:
 *                   type: integer
 *                   description: ID du parcours associé à la partie
 *                 id_user:
 *                   type: integer
 *                   description: ID de l'utilisateur associé à la partie
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/party/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [id]);
    
    if (party.length === 0) {
      return res.status(404).json({ error: "Partie non trouvée" });
    }
    
    res.status(200).json(party[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});


/**
 * @swagger
 * /delete-party/{id}:
 *   delete:
 *     summary: Supprimer une partie
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la partie à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.delete("/delete-party/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Code pour supprimer la partie spécifiée depuis la base de données
    res.status(200).json({ success: true, message: `Partie ${id} supprimée avec succès` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
});

/**
 * @swagger
 * /update-party/{id}:
 *   put:
 *     summary: Modifier une partie
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la partie à modifier
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_parkour:
 *                 type: integer
 *                 description: ID du nouveau parcours de la partie
 *               id_user:
 *                 type: integer
 *                 description: ID du nouvel utilisateur participant à la partie
 *     responses:
 *       '200':
 *         description: Succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/update-party/:id", async (req, res) => {
  const id = req.params.id;
  const { id_parkour, id_user } = req.body;
  try {
    // Code pour modifier la partie spécifiée avec les nouvelles données depuis la base de données
    res.status(200).json({ success: true, message: `Partie ${id} modifiée avec succès` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
});

/**
 * @swagger
 * /party/{id}/update-date-fin:
 *   put:
 *     summary: Mettre à jour la date de fin d'une partie avec la date actuelle
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la partie
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si la mise à jour a réussi
 *                 message:
 *                   type: string
 *                   description: Message décrivant le résultat de la mise à jour
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
app.put("/party/:id/update-date-fin", async (req, res) => {
  try {
    const id = req.params.id;
    
    // Mettre à jour la date de fin avec la date actuelle
    await db.query("UPDATE party SET dateFin = CURRENT_TIMESTAMP WHERE idparty = ?;", [id]);
    
    res.status(200).json({ success: true, message: "Date de fin mise à jour avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Erreur interne du serveur" });
  }
});






















// Connexion à la base de données et démarrage du serveur
async function startServer() {
  await connectToDatabase();
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
  });
}

startServer();