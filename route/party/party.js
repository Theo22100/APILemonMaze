const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();







/**
 * @swagger
 * /party/parties:
 *   get:
 *     summary: Obtenir la liste de toutes les parties
 *     tags: [Party]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/party/parties", async (req, res) => {
  try {
    const db = await getDB();
    // Récupérer toutes les parties depuis la base de données
    const parties = await db.query("SELECT * FROM party;");

    // Envoyer la liste des parties en réponse
    res.status(200).json(parties[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success:false,
      error: "Erreur interne du serveur"
    });
  }
});





/**
 * @swagger
 * /party/getparty/{idparty}:
 *   get:
 *     summary: Obtenir les informations spécifiques d'une partie
 *     tags: [Party]
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
router.get("/party/getparty/:idparty", async (req, res) => {
  try {
    const idparty = req.params.idparty;
    const db = await getDB();
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);

    if (party.length === 0) {
      return res.status(404).json({
        success:false,
        error: "Partie non trouvée"
      });
    }

    res.status(200).json({success:true,data:party[0]});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success:false,
      error: "Erreur interne du serveur"
    });
  }
});


/**
 * @swagger
 * /party/create-party:
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
router.post("/party/create-party", async (req, res) => {
  const {
    id_parkour,
    id_user
  } = req.body;
  try {
    // Vérifier si le parcours existe
    const db = await getDB();
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id_parkour]);
    if (parkour.length === 0) {
      return res.status(404).json({
        success:false,
        error: "Parcours non trouvé."
      });
    }

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({
        success:false,
        error: "Utilisateur non trouvé."
      });
    }

    // Insérer la nouvelle partie dans la base de données
    await db.query("INSERT INTO party (id_parkour, id_user) VALUES (?, ?);", [id_parkour, id_user]);

    res.json({
      success: true,
      message: "Partie créée avec succès"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success:false,
      error: "Erreur interne du serveur."
    });
  }
});



/**
 * @swagger
 * /party/update-party/{idparty}:
 *   put:
 *     summary: Modifier une partie
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: idparty
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
 *         description: Ressource non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/party/update-party/:idparty", async (req, res) => {
  const idparty = req.params.idparty;
  const { id_parkour, id_user } = req.body;
  try {
    const db = await getDB();
    // Vérifier si la partie existe
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
    if (party.length === 0) {
      return res.status(404).json({ success: false, message: "Partie non trouvée" });
    }

    // Vérifier si le parcours existe
    const [parkour] = await db.query("SELECT * FROM parkour WHERE id_parkour = ?;", [id_parkour]);
    if (parkour.length === 0) {
      return res.status(404).json({ success: false, message: "Parcours non trouvé" });
    }

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM user WHERE id_user = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Mettre à jour les informations de la partie dans la base de données
    await db.query("UPDATE party SET id_parkour = ?, id_user = ? WHERE idparty = ?;", [id_parkour, id_user, idparty]);
    res.status(200).json({ success: true, message: `Partie ${idparty} modifiée avec succès` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
});



/**
 * @swagger
 * /party/delete-party/{idparty}:
 *   delete:
 *     summary: Supprimer une partie
 *     tags: [Party]
 *     parameters:
 *       - in: path
 *         name: idparty
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
router.delete("/party/delete-party/:idparty", async (req, res) => {
  const idparty = req.params.idparty;
  try {
    const db = await getDB();
    // Code pour supprimer la partie spécifiée depuis la base de données
    res.status(200).json({
      success: true,
      message: `Partie ${idparty} supprimée avec succès`
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
 * /party/update-date-fin/{idparty}:
 *   put:
 *     summary: Mettre à jour la date de fin d'une partie avec la date actuelle
 *     tags: [Party]
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
router.put("/party/update-date-fin/:idparty", async (req, res) => {
  try {
    const idparty = req.params.idparty;
    const db = await getDB();

    // Mettre à jour la date de fin avec la date actuelle
    await db.query("UPDATE party SET dateFin = CURRENT_TIMESTAMP WHERE idparty = ?;", [idparty]);

    res.status(200).json({
      success: true,
      message: "Date de fin mise à jour avec succès"
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