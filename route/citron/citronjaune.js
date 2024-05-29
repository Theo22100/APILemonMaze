const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /remove-citron-jaune:
 *   put:
 *     summary: Retirer un certain nombre de citrons jaunes à un utilisateur
 *     tags: [CitronJaune]
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
 *                 description: Nombre de citrons jaunes à retirer
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
router.put("/remove-citron-jaune", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;

  if (typeof userId !== 'number' || typeof nombre !== 'number' || nombre <= 0) {
    return res.status(400).json({ success: false, message: "Requête invalide" });
  }

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe et récupérez le nombre actuel de citrons jaunes
    const [user] = await db.query("SELECT citronJaune FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const currentCitronJaune = user[0].citronJaune;

    // Vérifiez si le retrait ne rendra pas le nombre de citrons jaunes inférieur à zéro
    if (currentCitronJaune - nombre < 0) {
      return res.status(200).json({ success: false, message: "Nombre insuffisant de citrons jaunes" });
    }

    // Retirez le nombre de citrons jaunes
    await db.query("UPDATE users SET citronJaune = citronJaune - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Jaune retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Jaune" });
  }
});



  
/**
 * @swagger
 * /add-citron-jaune:
 *   put:
 *     summary: Ajouter un certain nombre de citrons jaunes à un utilisateur
 *     tags: [CitronJaune]
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
 *                 description: Nombre de citrons jaunes à ajouter
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
router.put("/add-citron-jaune", async (req, res) => {
    const userId = req.body.userId;
    const nombre = req.body.nombre;
  
    try {
      const db = await getDB();
      // Vérifiez d'abord si l'utilisateur existe
      const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
  
      // Ajoutez le nombre à la colonne citronJaune
      await db.query("UPDATE users SET citronJaune = citronJaune + ? WHERE id = ?;", [nombre, userId]);
  
      res.status(200).json({ success: true, message: "Citron Jaune ajouté avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Jaune" });
    }
  });
  


module.exports = router;