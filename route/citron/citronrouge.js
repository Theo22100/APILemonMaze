const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /remove-citron-rouge:
 *   put:
 *     summary: Retirer un certain nombre de citrons rouges à un utilisateur
 *     tags: [CitronRouge]
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
 *                 description: Nombre de citrons rouges à retirer
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
router.put("/remove-citron-rouge", async (req, res) => {
  const userId = req.body.userId;
  const nombre = req.body.nombre;
  console.log(userId, nombre);

  if ( userId.isEmpty || nombre <= 0) {
    return res.status(400).json({ success: false, message: "Requête invalide" });
  }

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe et récupérez le nombre actuel de citrons rouges
    const [user] = await db.query("SELECT citronRouge FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const currentCitronRouge = user[0].citronRouge;

    // Vérifiez si le retrait ne rendra pas le nombre de citrons rouges inférieur à zéro
    if (currentCitronRouge - nombre < 0) {
      return res.status(400).json({ success: false, message: "Nombre insuffisant de citrons rouges" });
    }

    // Retirez le nombre de citrons rouges
    await db.query("UPDATE users SET citronRouge = citronRouge - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Rouge retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Rouge" });
  }
});



  
/**
 * @swagger
 * /add-citron-rouge:
 *   put:
 *     summary: Ajouter un certain nombre de citrons rouges à un utilisateur
 *     tags: [CitronRouge]
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
 *                 description: Nombre de citrons rouges à ajouter
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
router.put("/add-citron-rouge", async (req, res) => {
    const userId = req.body.userId;
    const nombre = req.body.nombre;
  
    try {
      const db = await getDB();
      // Vérifiez d'abord si l'utilisateur existe
      const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
  
      // Ajoutez le nombre à la colonne citronRouge
      await db.query("UPDATE users SET citronRouge = citronRouge + ? WHERE id = ?;", [nombre, userId]);
  
      res.status(200).json({ success: true, message: "Citron Rouge ajouté avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Rouge" });
    }
  });
  


module.exports = router;