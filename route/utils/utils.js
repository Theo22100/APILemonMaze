const { getDB } = require("../../database/database");
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require("config");

const secretKey = config.get("key.token");

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
 *               pseudo:
 *                 type: string
 *                 description: Pseudo de l'utilisateur
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
 *                 token:
 *                   type: string
 *                   description: Token JWT de l'utilisateur
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
router.post("/login", async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    const db = await getDB();

    const [user] = await db.query("SELECT id, pseudo, password, mail, age, ville FROM users WHERE pseudo = ?;", [pseudo]);

    // Vérifier si l'utilisateur est trouvé
    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        status: "Utilisateur non trouvé."
      });
    }
    
    const userData = user[0];
    const userPassword = userData.password;

    // Vérifier si le mot de passe est correct
    if (userPassword !== password) {
      return res.status(401).json({
        success: false,
        status: "Mot de passe incorrect."
      });
    } else {
      // Créer un token JWT
      const token = jwt.sign(
        { userId: userData.id, mail: userData.mail, age: userData.age, ville: userData.ville }, // Payload
        secretKey, // Clé secrète
        { expiresIn: '1h' } // Options
      );
      return res.json({
        success: true,
        token: token,
        status: "Connecté",
        pseudo: userData.pseudo,
        mail: userData.mail,
        id: userData.id,
        age: userData.age,
        ville: userData.ville
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      status: "Internal Server Error"
    });
  }
});

module.exports = router;
