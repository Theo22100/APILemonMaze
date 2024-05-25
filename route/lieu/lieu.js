const {
  getDB
} = require("../../database/database");
const express = require('express');
const router = express.Router();





/**
 * @swagger
 * /lieu/lieux:
 *   get:
 *     summary: Obtenir la liste de tous les lieux
 *     tags: [Lieu]
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
 *                   idlieu:
 *                     type: integer
 *                     description: ID du lieu
 *                   nom:
 *                     type: string
 *                     description: Nom du lieu
 *                   gps:
 *                     type: string
 *                     description: Coordonnées GPS du lieu
 *                   info:
 *                     type: string
 *                     description: Informations sur le lieu
 *                   code:
 *                     type: integer
 *                     description: Code pour débloquer
 *                   active:
 *                     type: boolean
 *                     description: Statut d'activation du lieu
 *                   id_ville:
 *                     type: integer
 *                     description: ID de la ville associée au lieu
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/lieu/lieux", async (req, res) => {
  try {
    const db = await getDB();
    const [lieux] = await db.query("SELECT * FROM lieu;");
    res.status(200).json({
      success: false,
      data: lieux
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
 * /lieu/getlieu/{idlieu}:
 *   get:
 *     summary: Obtenir les informations d'un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu
 *                 nom:
 *                   type: string
 *                   description: Nom du lieu
 *                 gps:
 *                   type: string
 *                   description: Coordonnées GPS du lieu
 *                 info:
 *                   type: string
 *                   description: Informations sur le lieu
 *               code:
 *                 type: integer
 *                 description: Code pour débloquer
 *                 active:
 *                   type: boolean
 *                   description: Statut d'activation du lieu
 *                 id_ville:
 *                   type: integer
 *                   description: ID de la ville associée au lieu
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/lieu/getlieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    const db = await getDB();
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }
    res.status(200).json({
      success: true,
      data: lieu[0]
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
 * /lieu/getnomlieu/{idlieu}:
 *   get:
 *     summary: Obtenir les informations d'un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu
 *                 nom:
 *                   type: string
 *                   description: Nom du lieu
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/lieu/getnomlieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    const db = await getDB();
    const [lieu] = await db.query("SELECT nom FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }
    res.status(200).json({
      success: true,
      data: lieu[0]
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
 * /lieu/create-lieu:
 *   post:
 *     summary: Créer un nouveau lieu
 *     tags: [Lieu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom du lieu
 *               gps:
 *                 type: string
 *                 description: Coordonnées GPS du lieu
 *               info:
 *                 type: string
 *                 description: Informations sur le lieu
 *               code:
 *                 type: integer
 *                 description: Code pour débloquer
 *               active:
 *                 type: boolean
 *                 description: Statut d'activation du lieu
 *               id_ville:
 *                 type: integer
 *                 description: ID de la ville associée au lieu
 *     responses:
 *       '200':
 *         description: Lieu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu créé
 *                 nom:
 *                   type: string
 *                   description: Nom du lieu
 *                 gps:
 *                   type: string
 *                   description: Coordonnées GPS du lieu
 *                 info:
 *                   type: string
 *                   description: Informations sur le lieu
 *                 active:
 *                   type: boolean
 *                   description: Statut d'activation du lieu
 *                 id_ville:
 *                   type: integer
 *                   description: ID de la ville associée au lieu
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Ville non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post("/lieu/create-lieu", async (req, res) => {
  const {
    nom,
    gps,
    info,
    code,
    active,
    id_ville
  } = req.body;

  try {
    const db = await getDB();
    // Vérifier si la ville existe
    const [ville] = await db.query("SELECT * FROM ville WHERE idville = ?;", [id_ville]);
    if (ville.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Ville non trouvée."
      });
    }

    // Insérer le nouveau lieu dans la base de données
    const [result] = await db.query("INSERT INTO lieu (nom, gps, info, code, active, id_ville) VALUES (?, ?, ?, ?, ?, ?);", [nom, gps, info, code, active, id_ville]);
    const idlieu = result.insertId;

    res.status(200).json({
      success: true,
      idlieu,
      nom,
      gps,
      info,
      code,
      active,
      id_ville
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
 * /lieu/update-lieu/{idlieu}:
 *   put:
 *     summary: Modifier un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nouveau nom du lieu
 *               gps:
 *                 type: string
 *                 description: Nouvelles coordonnées GPS du lieu
 *               info:
 *                 type: string
 *                 description: Nouvelles informations sur le lieu
 *               code:
 *                 type: integer
 *                 description: Code pour débloquer
 *               active:
 *                 type: boolean
 *                 description: Nouvel état d'activité du lieu
 *               id_ville:
 *                 type: integer
 *                 description: Nouvel ID de la ville associée au lieu
 *     responses:
 *       '200':
 *         description: Lieu modifié avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/lieu/update-lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  const {
    nom,
    gps,
    info,
    code,
    active,
    id_ville
  } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!nom || !gps || !info || !code || active === undefined || !id_ville) {
    return res.status(400).json({
      success: false,
      error: "Tous les champs requis sont nécessaires."
    });
  }

  try {
    const db = await getDB();
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }

    // Mettre à jour les informations du lieu dans la base de données
    await db.query("UPDATE lieu SET nom = ?, gps = ?, info = ?, code = ?, active = ?, id_ville = ? WHERE idlieu = ?;", [nom, gps, info, code, active, id_ville, idlieu]);
    res.status(200).json({
      success: true,
      message: "Lieu modifié avec succès."
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
 * /lieu/getcode/{idlieu}:
 *   get:
 *     summary: Obtenir les informations d'un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à récupérer
 *     responses:
 *       '200':
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idlieu:
 *                   type: integer
 *                   description: ID du lieu
 *                 code:
 *                   type: string
 *                   description: Code pour débloquer
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/lieu/getcode/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    const db = await getDB();
    const [lieu] = await db.query("SELECT code FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }
    res.status(200).json({
      success: true,
      data: lieu[0]
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
 * /lieu/update-code/{idlieu}:
 *   put:
 *     summary: Modifier un code d'un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: integer
 *                 description: Code pour débloquer
 *     responses:
 *       '200':
 *         description: Lieu modifié avec succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/lieu/update-code/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  const {
    code
  } = req.body;

  // Vérifier si tous les champs requis sont fournis
  if (!code) {
    return res.status(400).json({
      success: false,
      error: "Tous les champs requis sont nécessaires."
    });
  }

  try {
    const db = await getDB();
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }

    // Mettre à jour les informations du lieu dans la base de données
    await db.query("UPDATE lieu SET code = ? WHERE idlieu = ?;", [code, idlieu]);
    res.status(200).json({
      success: true,
      message: "Lieu modifié avec succès."
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
 * /lieu/delete-lieu/{idlieu}:
 *   delete:
 *     summary: Supprimer un lieu spécifique
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lieu à supprimer
 *     responses:
 *       '200':
 *         description: Lieu supprimé avec succès
 *       '404':
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete("/lieu/delete-lieu/:idlieu", async (req, res) => {
  const idlieu = req.params.idlieu;
  try {
    const db = await getDB();
    // Vérifier si le lieu existe
    const [lieu] = await db.query("SELECT * FROM lieu WHERE idlieu = ?;", [idlieu]);
    if (lieu.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lieu non trouvé."
      });
    }
    
    // Supprimer le lieu de la base de données
    await db.query("DELETE FROM lieu WHERE idlieu = ?;", [idlieu]);
    res.status(200).json({
      success: true,
      message: "Lieu supprimé avec succès."
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
 * /lieu/desactiver/{idlieu}:
 *   put:
 *     summary: Désactiver un lieu en le passant à l'état inactif
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         description: ID du lieu à désactiver
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
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/lieu/desactiver/:idlieu", async (req, res) => {
  try {
    const id = req.params.idlieu;
    const db = await getDB();

    // Mettre à jour l'attribut "active" du lieu à 0
    await db.query("UPDATE lieu SET active = 0 WHERE idlieu = ?;", [id]);

    res.status(200).json({
      success: true,
      message: "Lieu désactivé avec succès"
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
 * /lieu/activer/{idlieu}:
 *   put:
 *     summary: Activer un lieu en le passant à l'état inactif
 *     tags: [Lieu]
 *     parameters:
 *       - in: path
 *         name: idlieu
 *         required: true
 *         description: ID du lieu à désactiver
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
 *         description: Lieu non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/lieu/activer/:idlieu", async (req, res) => {
  try {
    const db = await getDB();
    const id = req.params.idlieu;

    // Mettre à jour l'attribut "active" du lieu à 1
    await db.query("UPDATE lieu SET active = 1 WHERE idlieu = ?;", [id]);

    res.status(200).json({
      success: true,
      message: "Lieu activé avec succès"
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