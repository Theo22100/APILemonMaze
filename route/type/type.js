const {
  getDB
} = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Type
 *   description: Opérations liées aux Types
 */


/**
 * @swagger
 * /type/types:
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
router.get("/type/types", async (req, res) => {
  try {
    const db = await getDB();
    const [types] = await db.query("SELECT * FROM type;");
    res.status(200).json({
      success: true,
      data: types
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
 * /type/gettype/{idtype}:
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
router.get("/type/gettype/:idtype", async (req, res) => {
  const typeId = req.params.idtype;

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [typeId]);
    if (type.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Type non trouvé"
      });
    }

    // Renvoyer les données de l'utilisateur
    res.status(200).json({
      success: true,
      data: type[0]
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
 * /type/add-type:
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
router.post("/type/add-type", async (req, res) => {
  const {
    nom
  } = req.body;

  // Vérifier si le champ nom est fourni
  if (!nom) {
    return res.status(400).json({
      success: false,
      error: "Le nom du type est requis."
    });
  }

  try {
    const db = await getDB();
    // Insérer le nouveau type dans la base de données
    await db.query("INSERT INTO type (nom) VALUES (?);", [nom]);
    res.status(200).json({
      success: true,
      message: "Type créé avec succès."
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
 * /type/update-type/{idtype}:
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
router.put("/type/update-type/:idtype", async (req, res) => {
  const idtype = req.params.idtype;
  const {
    nom
  } = req.body;

  // Vérifier si le nouveau nom est fourni
  if (!nom) {
    return res.status(400).json({
      success: false,
      error: "Nouveau nom du type requis."
    });
  }

  try {
    const db = await getDB();
    // Vérifier si le type existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [idtype]);
    if (type.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Type non trouvé."
      });
    }

    // Mettre à jour le nom du type dans la base de données
    await db.query("UPDATE type SET nom = ? WHERE idtype = ?;", [nom, idtype]);
    res.status(200).json({
      success: true,
      message: "Type modifié avec succès."
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
 * /type/delete-type/{idtype}:
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
router.delete("/type/delete-type/:idtype", async (req, res) => {
  const idtype = req.params.idtype;
  try {
    const db = await getDB();
    // Vérifier si le type existe
    const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [idtype]);
    if (type.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Type non trouvé."
      });
    }

    // Supprimer le type de la base de données
    await db.query("DELETE FROM type WHERE idtype = ?;", [idtype]);
    res.status(200).json({
      success: true,
      message: "Type supprimé avec succès."
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