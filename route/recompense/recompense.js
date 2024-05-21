const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recompense
 *   description: Opérations liées aux récompenses
 */



/**
 * @swagger
 * /recompense/recompenses:
 *   get:
 *     summary: Obtenir la liste des récompenses
 *     tags: [Recompense]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/recompense/recompenses", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT * FROM recompense;");
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
 * /recompense/getrecompense/{id}:
 *   get:
 *     summary: Obtenir les données d'une récompense
 *     tags: [Recompense]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense à récupérer
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
 *                   description: Données de la récompense
 *       '404':
 *         description: Récompense non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/recompense/getrecompense/:id", async (req, res) => {
  const recompenseId = req.params.id;

  try {
    const db = await getDB();
    const [recompense] = await db.query("SELECT * FROM recompense WHERE idrecompense = ?;", [recompenseId]);
    if (recompense.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      data: recompense[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des données de la récompense"
    });
  }
});

/**
 * @swagger
 * /recompense/create-recompense:
 *   post:
 *     summary: Créer une nouvelle récompense
 *     tags: [Recompense]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la récompense
 *               info:
 *                 type: string
 *                 description: Info de la récompense
 *               citronBleu:
 *                 type: integer
 *                 description: Nombre de citrons bleus
 *               citronOrange:
 *                 type: integer
 *                 description: Nombre de citrons oranges
 *               citronRouge:
 *                 type: integer
 *                 description: Nombre de citrons rouges
 *               citronVert:
 *                 type: integer
 *                 description: Nombre de citrons verts
 *               id_lieu:
 *                 type: integer
 *                 description: ID du lieu associé à la récompense
 *               id_type:
 *                 type: integer
 *                 description: ID du type associé à la récompense
 *     responses:
 *       '200':
 *         description: Récompense créée avec succès
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
router.post("/recompense/create-recompense", async (req, res) => {
    try {
      const { nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type } = req.body;
  
      if (!nom || !info || citronBleu === undefined || citronOrange === undefined || citronRouge === undefined || citronVert === undefined || id_lieu === undefined || id_type === undefined) {
        return res.status(400).json({
          success: false,
          message: "Tous les champs sont requis"
        });
      }
  
      const db = await getDB();
  
      // Vérifier si le lieu & type existe
      const [type] = await db.query("SELECT * FROM lieu WHERE idtype = ?;", [id_type]);
      if (type.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Le type spécifié n'existe pas"
        });
      }

      const [lieu] = await db.query("SELECT * FROM type WHERE idlieu = ?;", [id_lieu]);
      if (lieu.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Le lieu spécifié n'existe pas"
        });
      }
  
      await db.query("INSERT INTO recompense (nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", [nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type]);
  
      res.status(200).json({
        success: true,
        message: "Récompense créée avec succès"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur"
      });
    }
  });
  
  

/**
 * @swagger
 * /recompense/delete-recompense/{id}:
 *   delete:
 *     summary: Supprimer une récompense
 *     tags: [Recompense]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense à supprimer
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
 *         description: Récompense non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete("/recompense/delete-recompense/:id", async (req, res) => {
  const recompenseId = req.params.id;
  try {
    const db = await getDB();
    const [recompense] = await db.query("SELECT * FROM recompense WHERE idrecompense = ?;", [recompenseId]);
    if (recompense.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense non trouvée"
      });
    }

    await db.query("DELETE FROM recompense WHERE idrecompense = ?;", [recompenseId]);

    res.status(200).json({
      success: true,
      message: "Récompense supprimée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la récompense"
    });
  }
});

/**
 * @swagger
 * /recompense/update-recompense/{id}:
 *   put:
 *     summary: Mettre à jour les données d'une récompense
 *     tags: [Recompense]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la récompense à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de la récompense
 *               info:
 *                 type: string
 *                 description: Info de la récompense
 *               citronBleu:
 *                 type: integer
 *                 description: Nombre de citrons bleus
 *               citronOrange:
 *                 type: integer
 *                 description: Nombre de citrons oranges
 *               citronRouge:
 *                 type: integer
 *                 description: Nombre de citrons rouges
 *               citronVert:
 *                 type: integer
 *                 description: Nombre de citrons verts
 *               id_lieu:
 *                 type: integer
 *                 description: ID du lieu associé à la récompense
 *               id_type:
 *                 type: integer
 *                 description: ID du type associé à la récompense
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
 *         description: Récompense non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/recompense/update-recompense/:id", async (req, res) => {
  const recompenseId = req.params.id;
  const { nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type } = req.body;

  try {
    const db = await getDB();
    const [recompense] = await db.query("SELECT * FROM recompense WHERE idrecompense = ?;", [recompenseId]);
    if (recompense.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Récompense non trouvée"
      });
    }

    // Vérifiez si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lieu non trouvé"
      });
    }

    // Vérifiez si le type existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [id_type]);
    if (type.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Type non trouvé"
      });
    }

    await db.query("UPDATE recompense SET nom = ?, info = ?, citronBleu = ?, citronOrange = ?, citronRouge = ?, citronVert = ?, id_lieu = ?, id_type = ? WHERE idrecompense = ?;", [nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type, recompenseId]);

    res.status(200).json({
      success: true,
      message: "Récompense mise à jour avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la récompense"
    });
  }
});



module.exports = router;
