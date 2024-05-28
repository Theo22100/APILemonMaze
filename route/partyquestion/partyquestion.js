const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /partyquestion/add-questions:
 *   post:
 *     summary: Ajouter des questions à une partie
 *     tags: [PartyQuestion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idparty:
 *                 type: integer
 *                 description: ID de la partie
 *               questions:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Liste des ID des questions
 *     responses:
 *       '200':
 *         description: Questions ajoutées avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Partie ou question non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post("/partyquestion/add-questions", async (req, res) => {
    const { idparty, questions } = req.body;
  
    if (!idparty || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: "Données invalides"
      });
    }
  
    try {
      const db = await getDB();
  
      // Vérifier si la partie existe
      const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
      if (party.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Partie non trouvée"
        });
      }
  
      // Vérifier si toutes les questions existent
      for (const questionId of questions) {
        const [question] = await db.query("SELECT * FROM question WHERE idquestion = ?;", [questionId]);
        if (question.length === 0) {
          return res.status(404).json({
            success: false,
            error: `Question avec ID ${questionId} non trouvée`
          });
        }
      }
  
      // Ajouter les questions à la partie
      for (const questionId of questions) {
        await db.query("INSERT INTO PartyQuestion (idparty, idquestion) VALUES (?, ?);", [idparty, questionId]);
      }
  
      res.json({
        success: true,
        message: "Questions ajoutées avec succès"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur"
      });
    }
  });


  /**
 * @swagger
 * /partyquestion/{idparty}:
 *   get:
 *     summary: Récupérer les questions d'une partie
 *     tags: [PartyQuestion]
 *     parameters:
 *       - in: path
 *         name: idparty
 *         required: true
 *         description: ID de la partie
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès
 *       '404':
 *         description: Partie ou questions non trouvées
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/partyquestion/:idparty", async (req, res) => {
    const idparty = req.params.idparty;
  
    try {
      const db = await getDB();
  
      // Vérifier si la partie existe
      const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
      if (party.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Partie non trouvée"
        });
      }
  
      // Récupérer les questions pour la partie
      const [questions] = await db.query(`
        SELECT q.* 
        FROM question q
        JOIN partyquestion pq ON q.idquestion = pq.idquestion
        WHERE pq.idparty = ?;
      `, [idparty]);
  
      res.status(200).json({success: true, data: questions});
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur"
      });
    }
  });
  

  /**
 * @swagger
 * /partyquestion/remove-question:
 *   delete:
 *     summary: Supprimer une question d'une partie
 *     tags: [PartyQuestion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idparty:
 *                 type: integer
 *                 description: ID de la partie
 *               idquestion:
 *                 type: integer
 *                 description: ID de la question
 *     responses:
 *       '200':
 *         description: Question supprimée avec succès
 *       '404':
 *         description: Partie ou question non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete("/partyquestion/remove-question", async (req, res) => {
    const { idparty, idquestion } = req.body;
  
    if (!idparty || !idquestion) {
      return res.status(400).json({
        success: false,
        error: "Données invalides"
      });
    }
  
    try {
      const db = await getDB();
  
      // Vérifier si l'association existe
      const [association] = await db.query("SELECT * FROM partyquestion WHERE idparty = ? AND idquestion = ?;", [idparty, idquestion]);
      if (association.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Association non trouvée"
        });
      }
  
      // Supprimer l'association
      await db.query("DELETE FROM partyquestion WHERE idparty = ? AND idquestion = ?;", [idparty, idquestion]);
  
      res.json({
        success: true,
        message: "Question supprimée de la partie avec succès"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Erreur interne du serveur"
      });
    }
  });
  
  module.exports = router;