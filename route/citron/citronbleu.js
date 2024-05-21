const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /remove-citron-bleu:
 *   put:
 *     summary: Retirer un certain nombre de citrons bleus à un utilisateur
 *     tags: [CitronBleu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons bleus à retirer
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
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/remove-citron-bleu", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  if (typeof userId !== 'number' || typeof nombre !== 'number' || nombre <= 0) {
    return res.status(400).json({ success: false, message: "Requête invalide" });
  }

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe et récupérez le nombre actuel de citrons bleus
    const [user] = await db.query("SELECT citronBleu FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const currentCitronBleu = user[0].citronBleu;

    // Vérifiez si le retrait ne rendra pas le nombre de citrons bleus inférieur à zéro
    if (currentCitronBleu - nombre < 0) {
      return res.status(400).json({ success: false, message: "Nombre insuffisant de citrons bleus" });
    }

    // Retirez le nombre de citrons bleus
    await db.query("UPDATE users SET citronBleu = citronBleu - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Bleu retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Bleu" });
  }
});



  
/**
 * @swagger
 * /add-citron-bleu:
 *   put:
 *     summary: Ajouter un certain nombre de citrons bleus à un utilisateur
 *     tags: [CitronBleu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID de l'utilisateur
 *               nombre:
 *                 type: integer
 *                 description: Nombre de citrons bleus à ajouter
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
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/add-citron-bleu", async (req, res) => {
    const userId = req.body.userId;
    const nombre = req.body.nombre;
  
    try {
      const db = await getDB();
      // Vérifiez d'abord si l'utilisateur existe
      const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
  
      // Ajoutez le nombre à la colonne citronBleu
      await db.query("UPDATE users SET citronBleu = citronBleu + ? WHERE id = ?;", [nombre, userId]);
  
      res.status(200).json({ success: true, message: "Citron Bleu ajouté avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Bleu" });
    }
  });
  


module.exports = router;