const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /oldlogin:
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
router.post("/oldlogin", async (req, res) => {
    try {
      const mail = req.body.mail;
      const password = req.body.password;
  
      const user = await db.query("SELECT pseudo, mail, password FROM users WHERE mail = ?;", [mail]);
  
      // Vérifier si l'utilisateur est trouvé
      if (user[0].length === 0) {
        return res.status(401).json({
          success: false,
          status: "Utilisateur non trouvé."
        });
      }
  
      const userData = user[0][0];
      const userPassword = userData.password;
      if (userPassword !== password) {
        return res.status(401).json({
          success: false,
          status: "Mot de passe incorrect."
        });
      } else {
        return res.json({
          success:true,
          status: "Connecté",
          mail: userData.mail // Ajout du champ mail dans la réponse JSON
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error"
      });
    }
  });


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
router.post("/login", async (req, res) => {
  try {
    const mail = req.body.mail;
    const password = req.body.password;
    const db = await getDB();

    const user = await db.query("SELECT pseudo, mail, password FROM users WHERE mail = ?;", [mail]);

    // Vérifier si l'utilisateur est trouvé
    if (user[0].length === 0) {
      return res.status(401).json({
        success: false,
        status: "Utilisateur non trouvé."
      });
    }

    const userData = user[0][0];
    const userPassword = userData.password;
    if (userPassword !== password) {
      return res.status(401).json({
        success: false,
        status: "Mot de passe incorrect."
      });
    } else {
      return res.json({
        success: true,
        status: "Connecté",
        mail: userData.mail 
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});



module.exports = router;