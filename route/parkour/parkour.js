const { getDB } = require("../../database/database");
const express = require('express');
const router = express.Router();

/*  PARKOUR */

/**
 * @swagger
 * /parkour/parkours:
 *   get:
 *     summary: Obtenir la liste de tous les parcours
 *     tags: [Parkour]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/parkour/parkours", async (req, res) => {
    try {
      const db = await getDB();
      const [rows] = await db.query("SELECT * FROM parkour;");
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ sucess:true,error: "Erreur interne du serveur." });
    }
  });

/**
 * @swagger
 * /parkour/parkoursidbar:
 *   get:
 *     summary: Obtenir la liste des idparkour de tous les parcours bar
 *     tags: [Parkour]
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/parkour/parkoursidbar", async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query("SELECT idparkour FROM parkour WHERE id_type = 1;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucess:true,error: "Erreur interne du serveur." });
  }
});
  
  /**
   * @swagger
   * /parkour/getparkour/{idparkour}:
   *   get:
   *     summary: Obtenir les informations d'un parcours spécifique
   *     tags: [Parkour]
   *     parameters:
   *       - in: path
   *         name: idparkour
   *         required: true
   *         description: ID du parcours à récupérer
   *         schema:
   *           type: integer
   *     responses:
   *       '200':
   *         description: Succès
   *       '404':
   *         description: Parcours non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  router.get("/parkour/getparkour/:idparkour", async (req, res) => {
    const id = req.params.idparkour;
    try {
      const db = await getDB();
      const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
      if (parkour.length === 0) {
        return res.status(404).json({ success: false,error: "Parcours non trouvé." });
      }
      res.json({success: true,data:parkour[0]});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false,error: "Erreur interne du serveur." });
    }
  });
  
  
  
  /**
   * @swagger
   * /parkour/create-parkour:
   *   post:
   *     summary: Créer un nouveau parcours
   *     tags: [Parkour]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nom:
   *                 type: string
   *                 description: Nom du nouveau parcours
   *               id_lieu1:
   *                 type: integer
   *                 description: ID du premier lieu du nouveau parcours
   *               id_lieu2:
   *                 type: integer
   *                 description: ID du deuxième lieu du nouveau parcours
   *               id_lieu3:
   *                 type: integer
   *                 description: ID du troisième lieu du nouveau parcours
   *               id_lieu4:
   *                 type: integer
   *                 description: ID du quatrième lieu du nouveau parcours
   *               id_type:
   *                 type: integer
   *                 description: ID du type du nouveau parcours
   *     responses:
   *       '200':
   *         description: Parcours créé avec succès
   *       '400':
   *         description: Mauvaise requête
   *       '404':
   *         description: Lieu ou type non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  router.post("/parkour/create-parkour", async (req, res) => {
    const { nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type } = req.body;
    
    // Vérifier si les champs requis sont fournis
    if (!nom || !id_lieu1 || !id_lieu2 || !id_lieu3 || !id_lieu4 || !id_type) {
      return res.status(400).json({ success:false,error: "Tous les champs sont requis." });
    }
  
    try {
      const db = await getDB();
      // Vérifier si les lieux spécifiés existent
      const lieux = await Promise.all([
        db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu1]),
        db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu2]),
        db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu3]),
        db.query("SELECT * FROM lieu WHERE idlieu = ?;", [id_lieu4])
      ]);
  
      // Si un des lieux n'est pas trouvé, renvoyer une erreur 404
      if (lieux.some(([result]) => result.length === 0)) {
        return res.status(404).json({ success:false, error: "Lieu non trouvé." });
      }
  
      // Vérifier si le type spécifié existe
      const [type] = await db.query("SELECT * FROM type WHERE idtype = ?;", [id_type]);
      if (type.length === 0) {
        return res.status(404).json({ success:false,error: "Type non trouvé." });
      }
      
      // Insérer le nouveau parcours dans la base de données
      await db.query("INSERT INTO parkour (nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type) VALUES (?, ?, ?, ?, ?, ?);", 
        [nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type]);
      res.status(200).json({ success:true,message: "Parcours créé avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success:false,error: "Erreur interne du serveur." });
    }
  });
  
  /**
   * @swagger
   * /parkour/modifparkour/{idparkour}:
   *   put:
   *     summary: Modifier un parcours spécifique
   *     tags: [Parkour]
   *     parameters:
   *       - in: path
   *         name: idparkour
   *         required: true
   *         description: ID du parcours à modifier
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nom:
   *                 type: string
   *                 description: Nouveau nom du parcours
   *               id_lieu1:
   *                 type: integer
   *                 description: Nouvel ID du premier lieu du parcours
   *               id_lieu2:
   *                 type: integer
   *                 description: Nouvel ID du deuxième lieu du parcours
   *               id_lieu3:
   *                 type: integer
   *                 description: Nouvel ID du troisième lieu du parcours
   *               id_lieu4:
   *                 type: integer
   *                 description: Nouvel ID du quatrième lieu du parcours
   *               id_type:
   *                 type: integer
   *                 description: Nouvel ID du type de parcours
   *     responses:
   *       '200':
   *         description: Succès
   *       '404':
   *         description: Parcours non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  router.put("/parkour/modifparkour/:idparkour", async (req, res) => {
    const id = req.params.idparkour;
    const { nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type } = req.body;
    try {
      const db = await getDB();
      const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
      if (parkour.length === 0) {
        return res.status(404).json({ success: false,error: "Parcours non trouvé." });
      }
      await db.query("UPDATE parkour SET nom = ?, id_lieu1 = ?, id_lieu2 = ?, id_lieu3 = ?, id_lieu4 = ?, id_type = ? WHERE idparkour = ?;", [nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type, id]);
      res.json({ success: true, message: "Parcours modifié avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false,error: "Erreur interne du serveur." });
    }
  });
  
  /**
   * @swagger
   * /parkour/parkour-delete/{idparkour}:
   *   delete:
   *     summary: Supprimer un parcours spécifique
   *     tags: [Parkour]
   *     parameters:
   *       - in: path
   *         name: idparkour
   *         required: true
   *         description: ID du parcours à supprimer
   *         schema:
   *           type: integer
   *     responses:
   *       '200':
   *         description: Succès
   *       '404':
   *         description: Parcours non trouvé
   *       '500':
   *         description: Erreur interne du serveur
   */
  router.delete("/parkour/parkour-delete/:idparkour", async (req, res) => {
    const id = req.params.idparkour;
    try {
      const db = await getDB();
      const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id]);
      if (parkour.length === 0) {
        return res.status(404).json({ success: false,error: "Parcours non trouvé." });
      }
      await db.query("DELETE FROM parkour WHERE idparkour = ?;", [id]);
      res.json({ success: true, message: "Parcours supprimé avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false,error: "Erreur interne du serveur." });
    }
  });
  


module.exports = router;