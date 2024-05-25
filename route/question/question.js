const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /question/questions:
 *   get:
 *     summary: Obtenir la liste de toutes les questions
 *     tags: [Question]
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
 *                   idquestion:
 *                     type: integer
 *                     description: ID de la question
 *                   question:
 *                     type: string
 *                     description: Texte de la question
 *                   reponse1:
 *                     type: string
 *                     description: Première réponse
 *                   reponse2:
 *                     type: string
 *                     description: Deuxième réponse
 *                   reponse3:
 *                     type: string
 *                     description: Troisième réponse
 *                   reponse4:
 *                     type: string
 *                     description: Quatrième réponse
 *                   bonnereponse:
 *                     type: integer
 *                     description: Index de la bonne réponse (1 à 4)
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/question/questions", async (req, res) => {
  try {
    const db = await getDB();
    const [questions] = await db.query("SELECT * FROM question;");
    res.status(200).json({
      success: true,
      data: questions
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
 * /question/getquestion/{id}:
 *   get:
 *     summary: Obtenir les informations d'une question spécifique
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idquestion:
 *                   type: integer
 *                   description: ID de la question
 *                 question:
 *                   type: string
 *                   description: Texte de la question
 *                 reponse1:
 *                   type: string
 *                   description: Première réponse
 *                 reponse2:
 *                   type: string
 *                   description: Deuxième réponse
 *                 reponse3:
 *                   type: string
 *                   description: Troisième réponse
 *                 reponse4:
 *                   type: string
 *                   description: Quatrième réponse
 *                 bonnereponse:
 *                   type: integer
 *                   description: Index de la bonne réponse (1 à 4)
 *       '404':
 *         description: Question non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/question/getquestion/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await getDB();
    const [question] = await db.query("SELECT * FROM question WHERE idquestion = ?;", [id]);
    if (question.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Question non trouvée"
      });
    }
    res.status(200).json({
      success: true,
      data: question[0]
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
 * /question/add-question:
 *   post:
 *     summary: Ajouter une nouvelle question
 *     tags: [Question]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Texte de la question
 *               reponse1:
 *                 type: string
 *                 description: Première réponse
 *               reponse2:
 *                 type: string
 *                 description: Deuxième réponse
 *               reponse3:
 *                 type: string
 *                 description: Troisième réponse
 *               reponse4:
 *                 type: string
 *                 description: Quatrième réponse
 *               bonnereponse:
 *                 type: integer
 *                 description: Index de la bonne réponse (1 à 4)
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
router.post("/question/add-question", async (req, res) => {
  const { question, reponse1, reponse2, reponse3, reponse4, bonnereponse } = req.body;

  try {
    const db = await getDB();
    await db.query("INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (?, ?, ?, ?, ?, ?);", [question, reponse1, reponse2, reponse3, reponse4, bonnereponse]);

    res.status(200).json({
      success: true,
      message: "Question ajoutée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de la question"
    });
  }
});

/**
 * @swagger
 * /question/modify-question/{id}:
 *   put:
 *     summary: Modifier une question existante
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Texte de la question
 *               reponse1:
 *                 type: string
 *                 description: Première réponse
 *               reponse2:
 *                 type: string
 *                 description: Deuxième réponse
 *               reponse3:
 *                 type: string
 *                 description: Troisième réponse
 *               reponse4:
 *                 type: string
 *                 description: Quatrième réponse
 *               bonnereponse:
 *                 type: integer
 *                 description: Index de la bonne réponse (1 à 4)
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
 *         description: Question non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/question/modify-question/:id", async (req, res) => {
  const id = req.params.id;
  const { question, reponse1, reponse2, reponse3, reponse4, bonnereponse } = req.body;

  try {
    const db = await getDB();
    const [existingQuestion] = await db.query("SELECT * FROM question WHERE idquestion = ?;", [id]);
    if (existingQuestion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question non trouvée"
      });
    }

    await db.query("UPDATE question SET question = ?, reponse1 = ?, reponse2 = ?, reponse3 = ?, reponse4 = ?, bonnereponse = ? WHERE idquestion = ?;", [question, reponse1, reponse2, reponse3, reponse4, bonnereponse, id]);

    res.status(200).json({
      success: true,
      message: "Question modifiée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification de la question"
    });
  }
});

/**
 * @swagger
 * /question/delete-question/{id}:
 *   delete:
 *     summary: Supprimer une question existante
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la question à supprimer
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
 *         description: Question non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete("/question/delete-question/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await getDB();
    const [existingQuestion] = await db.query("SELECT * FROM question WHERE idquestion = ?;", [id]);
    if (existingQuestion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Question non trouvée"
      });
    }

    await db.query("DELETE FROM question WHERE idquestion = ?;", [id]);

    res.status(200).json({
      success: true,
      message: "Question supprimée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la question"
    });
  }
});

/**
 * @swagger
 * /question/idquestions:
 *   get:
 *     summary: Obtenir la liste de toutes les questions
 *     tags: [Question]
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
 *                   idquestion:
 *                     type: integer
 *                     description: ID de la question
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/question/idquestions", async (req, res) => {
  try {
    const db = await getDB();
    const [questions] = await db.query("SELECT idquestion FROM question;");
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur."
    });
  }
});

module.exports = router;
