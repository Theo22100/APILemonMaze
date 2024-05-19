const {
  getDB
} = require("../../database/database");
const express = require('express');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Database
 *   description: Opérations liées à la base de données
 */

/**
 * @swagger
 * /bdd/test:
 *   get:
 *     summary: Test de connexion à la base de données
 *     tags: [Database]
 *     responses:
 *       '200':
 *         description: Connexion à la base de données réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indiquant que la connexion à la base de données a réussi
 *       '500':
 *         description: Erreur lors de la connexion à la base de données
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Message d'erreur indiquant la raison de l'échec de la connexion
 */
router.get("/bdd/test", async (req, res) => {
  try {
    // Test de connexion à la base de données
    const db = await getDB();
    const [rows] = await db.query("SELECT 1 AS test_value;");
    res.status(200).json({
      message: "Connexion à la base de données réussie"
    });
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error);
    res.status(500).json({
      error: "Erreur lors de la connexion à la base de données"
    });
  }
});

/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: Obtenir la liste des utilisateurs
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/user/users", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM users;");
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur."
    });
  }
});

/**
 * @swagger
 * /user/getuser/{id}:
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
router.get("/user/getuser/:id", async (req, res) => {
  const userId = req.query.userId;

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Renvoyer les données de l'utilisateur
    res.status(200).json({
      success: true,
      data: user[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données de l'utilisateur"
    });
  }
});


/**
 * @swagger
 * /user/create-user:
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
router.post("/user/create-user", async (req, res) => {
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
        success: false,
        error: "Pseudo is required"
      });
    }
    if (!age) {
      return res.status(400).json({
        success: false,
        error: "Age is required"
      });
    }
    if (!ville) {
      return res.status(400).json({
        success: false,
        error: "Ville is required"
      });
    }
    if (!mail) {
      return res.status(400).json({
        success: false,
        error: "Mail is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        error: "Password is required"
      });
    }
    const db = await getDB();

    // Vérifier si le pseudo est déjà pris
    const existingUser = await db.query("SELECT * FROM users WHERE pseudo = ?;", [pseudo]);

    if (existingUser[0].length > 0) {
      return res.status(400).json({
        success: false,
        error: "Ce pseudo est déjà pris !"
      });
    }

    // Vérifier si le mail est déjà pris
    const existingMail = await db.query("SELECT * FROM users WHERE mail = ?;", [mail]);

    if (existingMail[0].length > 0) {
      return res.status(400).json({
        success: false,
        error: "Ce mail est déjà associé à un compte !"
      });
    }

    await db.query("INSERT INTO users (pseudo, mail, password, age, ville) VALUES (?, ?, ?, ?, ?);", [pseudo, mail, password, age, ville]);

    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      success: false
    });
  }
});

/**
 * @swagger
 * /user/delete-user/{id}:
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
router.delete("/user/delete-user/:id", async (req, res) => {
  const userId = req.params.id; // Récupérer l'ID de l'utilisateur à partir des paramètres d'URL
  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Supprimez l'utilisateur de la bdd
    await db.query("DELETE FROM users WHERE id = ?;", [userId]);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur"
    });
  }
});





/**
 * @swagger
 * /user/change-password/{id}:
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
router.put("/user/change-password/:id", async (req, res) => {
  const userId = req.body.userId;
  const newPassword = req.body.newPassword;

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Mettre à jour le mot de passe de l'utilisateur
    await db.query("UPDATE users SET password = ? WHERE id = ?;", [newPassword, userId]);

    res.status(200).json({
      success: true,
      message: "Mot de passe changé avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de mot de passe"
    });
  }
});

/**
 * @swagger
 * /user/change-email/{id}:
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
router.put("/user/change-email/:id", async (req, res) => {
  const userId = req.body.userId;
  const newEmail = req.body.newEmail;

  try {
    const db = await getDB();

    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    await db.query("UPDATE users SET mail = ? WHERE id = ?;", [newEmail, userId]);

    res.status(200).json({
      success: true,
      message: "Adresse e-mail changée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement d'adresse e-mail"
    });
  }
});



module.exports = router;
