const {
  getDB
} = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /ville/villes:
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
router.get("/ville/villes", async (req, res) => {
  try {
    const db = await getDB();
    // Récupérer la liste de toutes les villes depuis la base de données
    const [villes] = await db.query("SELECT * FROM ville;");
    res.status(200).json({
      success: true,
      data: villes
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
 * /ville/getville/{id}:
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
router.get("/ville/getville/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await getDB();
    // Récupérer les informations de la ville spécifique depuis la base de données
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Ville non trouvée"
      });
    }
    res.status(200).json({
      success: true,
      data: ville[0]
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
 * /ville/add-ville:
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
router.post("/ville/add-ville", async (req, res) => {
  const nom = req.body.nom;

  try {
    const db = await getDB();
    // Insérer la nouvelle ville dans la base de données
    await db.query("INSERT INTO ville (nom) VALUES (?);", [nom]);

    res.status(200).json({
      success: true,
      message: "Ville ajoutée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de la ville"
    });
  }
});

/**
 * @swagger
 * /ville/modify-ville/{id}:
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
router.put("/ville/modify-ville/:id", async (req, res) => {
  const id = req.params.id;
  const nom = req.body.nom;

  try {
    const db = await getDB();
    // Vérifier d'abord si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ville non trouvée"
      });
    }

    // Modifier le nom de la ville
    await db.query("UPDATE ville SET nom = ? WHERE idville = ?;", [nom, id]);

    res.status(200).json({
      success: true,
      message: "Nom de la ville modifié avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du nom de la ville"
    });
  }
});

/**
 * @swagger
 * /ville/delete-ville/{id}:
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
router.delete("/ville/delete-ville/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = await getDB();
    // Vérifier d'abord si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id]);
    if (ville.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ville non trouvée"
      });
    }

    // Supprimer la ville de la base de données
    await db.query("DELETE FROM ville WHERE idville = ?;", [id]);

    res.status(200).json({
      success: true,
      message: "Ville supprimée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la ville"
    });
  }
});




module.exports = router;