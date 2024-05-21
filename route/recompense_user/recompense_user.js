const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RecompenseUser
 *   description: Opérations liées aux récompenses des utilisateurs
 */

/**
 * @swagger
 * /recompense_user/recompenses_users:
 *   get:
 *     summary: Obtenir la liste des récompenses des utilisateurs
 *     tags: [RecompenseUser]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/recompense_user/recompenses_users", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM recompense_user;");
    res.status(200).json({
      success: true,
      message: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur."
    });
  }
});

/**
 * @swagger
 * /recompense_user/getrecompense_user/{id}:
 *   get:
 *     summary: Obtenir les données d'une récompense utilisateur
 *     tags: [RecompenseUser]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense utilisateur à récupérer
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
 *                   description: Données de la récompense utilisateur
 *       '404':
 *         description: Récompense utilisateur non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/recompense_user/getrecompense_user/:id", async (req, res) => {
  const recompenseUserId = req.params.id;

  try {
    const db = await getDB();
    const [recompenseUser] = await db.query("SELECT * FROM recompense_user WHERE id_recompense_user = ?;", [recompenseUserId]);
    if (recompenseUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense utilisateur non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      data: recompenseUser[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données de la récompense utilisateur"
    });
  }
});

/**
 * Générer un code aléatoire de 10 caractères
 */
function generateRandomCode() {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * @swagger
 * /recompense_user/create-recompense_user:
 *   post:
 *     summary: Créer une nouvelle récompense utilisateur
 *     tags: [RecompenseUser]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_user:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               id_recompense:
 *                 type: integer
 *                 description: ID de la récompense
 *     responses:
 *       '200':
 *         description: Récompense utilisateur créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indique si l'opération a réussi
 *       '400':
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Description de l'erreur
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Description de l'erreur interne du serveur
 */
router.post("/recompense_user/create-recompense_user", async (req, res) => {
  try {
    const { id_user, id_recompense } = req.body;
    const code = generateRandomCode();

    if (id_user === undefined || id_recompense === undefined) {
      console.error("Champs manquants: id_user ou id_recompense");
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis"
      });
    }

    const db = await getDB();

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [id_user]);
    if (user.length === 0) {
      console.error(`Utilisateur non trouvé: id_user=${id_user}`);
      return res.status(400).json({
        success: false,
        message: "L'utilisateur spécifié n'existe pas"
      });
    }

    // Vérifier si la récompense existe
    const [recompense] = await db.query("SELECT * FROM recompense WHERE idrecompense = ?;", [id_recompense]);
    if (recompense.length === 0) {
      console.error(`Récompense non trouvée: id_recompense=${id_recompense}`);
      return res.status(400).json({
        success: false,
        message: "La récompense spécifiée n'existe pas"
      });
    }

    await db.query("INSERT INTO recompense_user (id_user, id_recompense, code) VALUES (?, ?, ?);", [id_user, id_recompense, code]);

    res.status(200).json({
      success: true,
      message: "Récompense utilisateur créée avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la création de la récompense utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
});


/**
 * @swagger
 * /recompense_user/delete-recompense_user/{id}:
 *   delete:
 *     summary: Supprimer une récompense utilisateur
 *     tags: [RecompenseUser]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense utilisateur à supprimer
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
 *         description: Récompense utilisateur non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete("/recompense_user/delete-recompense_user/:id", async (req, res) => {
  const recompenseUserId = req.params.id;
  try {
    const db = await getDB();
    const [recompenseUser] = await db.query("SELECT * FROM recompense_user WHERE id_recompense_user = ?;", [recompenseUserId]);
    if (recompenseUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense utilisateur non trouvée"
      });
    }

    await db.query("DELETE FROM recompense_user WHERE id_recompense_user = ?;", [recompenseUserId]);

    res.status(200).json({
      success: true,
      message: "Récompense utilisateur supprimée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la récompense utilisateur"
    });
  }
});

/**
 * @swagger
 * /recompense_user/update-recompense_user/{id}:
 *   put:
 *     summary: Mettre à jour les données d'une récompense utilisateur
 *     tags: [RecompenseUser]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense utilisateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_user:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               id_recompense:
 *                 type: integer
 *                 description: ID de la récompense
 *               code:
 *                 type: string
 *                 description: Code de la récompense utilisateur
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
 *         description: Récompense utilisateur non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/recompense_user/update-recompense_user/:id", async (req, res) => {
  const recompenseUserId = req.params.id;
  const { id_user, id_recompense, code } = req.body;

  try {
    const db = await getDB();
    const [recompenseUser] = await db.query("SELECT * FROM recompense_user WHERE id_recompense_user = ?;", [recompenseUserId]);
    if (recompenseUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense utilisateur non trouvée"
      });
    }

    // Vérifiez si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE iduser = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Vérifiez si la récompense existe
    const [recompense] = await db.query("SELECT * FROM recompense WHERE idrecompense = ?;", [id_recompense]);
    if (recompense.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense non trouvée"
      });
    }

    await db.query("UPDATE recompense_user SET id_user = ?, id_recompense = ?, code = ? WHERE id_recompense_user = ?;", [id_user, id_recompense, code, recompenseUserId]);

    res.status(200).json({
      success: true,
      message: "Récompense utilisateur mise à jour avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la récompense utilisateur"
    });
  }
});





/**
 * @swagger
 * /recompense_user/list-user-recompenses/{id_user}:
 *   get:
 *     summary: Obtenir toutes les récompenses d'un utilisateur
 *     tags: [RecompenseUser]
 *     parameters:
 *       - in: path
 *         name: id_user
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur
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
 *                   id_recompense_user:
 *                     type: integer
 *                     description: ID de la récompense utilisateur
 *                   id_user:
 *                     type: integer
 *                     description: ID de l'utilisateur
 *                   id_recompense:
 *                     type: integer
 *                     description: ID de la récompense
 *                   code:
 *                     type: string
 *                     description: Code de la récompense utilisateur
 *                   nom:
 *                     type: string
 *                     description: Nom de la récompense
 *                   info:
 *                     type: string
 *                     description: Info de la récompense
 *                   citronBleu:
 *                     type: integer
 *                     description: Nombre de citrons bleus
 *                   citronOrange:
 *                     type: integer
 *                     description: Nombre de citrons oranges
 *                   citronRouge:
 *                     type: integer
 *                     description: Nombre de citrons rouges
 *                   citronVert:
 *                     type: integer
 *                     description: Nombre de citrons verts
 *       '404':
 *         description: Utilisateur ou récompenses non trouvées
 *       '500':
 *         description: Erreur interne du serveur
 */

router.get("/recompense_user/list-user-recompenses/:id_user", async (req, res) => {
    const userId = req.params.id_user;
  
    try {
      const db = await getDB();
      const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }
  
      const [recompensesUser] = await db.query(`
        SELECT ru.id_recompense_user, ru.id_user, ru.id_recompense, ru.code, r.nom, r.info, r.citronBleu, r.citronOrange, r.citronRouge, r.citronVert
        FROM recompense_user ru
        JOIN recompense r ON ru.id_recompense = r.idrecompense
        WHERE ru.id_user = ?;
      `, [userId]);
  
      if (recompensesUser.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Aucune récompense trouvée pour cet utilisateur"
        });
      }
  
      res.status(200).json({
        success: true,
        recompenses: recompensesUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur"
      });
    }
  });

module.exports = router;
