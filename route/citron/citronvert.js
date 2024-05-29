const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /remove-citron-vert:
 *   put:
 *     summary: Retirer un certain nombre de citrons verts à un utilisateur
 *     tags: [CitronVert]
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
 *                 description: Nombre de citrons verts à retirer
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
router.put("/remove-citron-vert", async (req, res) => {
  const userId = req.body.userId;
  const nombre = parseInt(req.body.nombre, 10);

  if (userId== 'null' || userId== '0' ||  nombre <= 0) {
    return res.status(400).json({ success: false, message: "Requête invalide" });
  }

  try {
    const db = await getDB();
    // Vérifiez d'abord si l'utilisateur existe et récupérez le nombre actuel de citrons verts
    const [user] = await db.query("SELECT citronVert FROM users WHERE id = ?;", [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const currentCitronVert = user[0].citronVert;

    // Vérifiez si le retrait ne rendra pas le nombre de citrons verts inférieur à zéro
    if (currentCitronVert - nombre < 0) {
      return res.status(200).json({ success: false, message: "Nombre insuffisant de citrons verts" });
    }

    // Retirez le nombre de citrons verts
    await db.query("UPDATE users SET citronVert = citronVert - ? WHERE id = ?;", [nombre, userId]);

    res.status(200).json({ success: true, message: "Citron Vert retiré avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du Citron Vert" });
  }
});



  
/**
 * @swagger
 * /add-citron-vert:
 *   put:
 *     summary: Ajouter un certain nombre de citrons verts à un utilisateur
 *     tags: [CitronVert]
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
 *                 description: Nombre de citrons verts à ajouter
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
router.put("/add-citron-vert", async (req, res) => {
    const userId = req.body.userId;
    const nombre = req.body.nombre;
  
    try {
      const db = await getDB();
      // Vérifiez d'abord si l'utilisateur existe
      const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [userId]);
      if (user.length === 0) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }
  
      // Ajoutez le nombre à la colonne citronVert
      await db.query("UPDATE users SET citronVert = citronVert + ? WHERE id = ?;", [nombre, userId]);
  
      res.status(200).json({ success: true, message: "Citron Vert ajouté avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur lors de l'ajout du Citron Vert" });
    }
  });
  


module.exports = router;