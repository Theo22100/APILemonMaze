const {
  getDB
} = require("../../database/database");
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
      success: false,
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
 *                 etat:
 *                   type: boolean
 *                   description: Etat de la partie
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
        success: false,
        error: "Partie non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      data: party[0]
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
    const db = await getDB();

    // Vérifier si le parcours existe
    const [parkour] = await db.query("SELECT * FROM parkour WHERE idparkour = ?;", [id_parkour]);
    if (parkour.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Parcours non trouvé."
      });
    }

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM users WHERE id = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé."
      });
    }

    // Insérer la nouvelle partie dans la base de données
    const [result] = await db.query("INSERT INTO party (id_parkour, id_user) VALUES (?, ?);", [id_parkour, id_user]);
    const idparty = result.insertId; // Récupérer l'ID de la partie créée

    // Sélectionner 4 questions aléatoires
    const [questions] = await db.query("SELECT idquestion FROM question ORDER BY RAND() LIMIT 4;");
    if (questions.length < 4) {
      return res.status(500).json({
        success: false,
        error: "Pas assez de questions disponibles."
      });
    }

    // Ajouter les questions à la table partyquestion
    for (const question of questions) {
      await db.query("INSERT INTO partyquestion (idparty, idquestion) VALUES (?, ?);", [idparty, question.idquestion]);
    }

    res.json({
      success: true,
      message: "Partie créée avec succès",
      idparty: idparty,
      questions: questions.map(q => q.idquestion) // Retourner les IDs des questions ajoutées
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
  const {
    id_parkour,
    id_user
  } = req.body;
  try {
    const db = await getDB();
    // Vérifier si la partie existe
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
    if (party.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Partie non trouvée"
      });
    }

    // Vérifier si le parcours existe
    const [parkour] = await db.query("SELECT * FROM parkour WHERE id_parkour = ?;", [id_parkour]);
    if (parkour.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parcours non trouvé"
      });
    }

    // Vérifier si l'utilisateur existe
    const [user] = await db.query("SELECT * FROM user WHERE id_user = ?;", [id_user]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Mettre à jour les informations de la partie dans la base de données
    await db.query("UPDATE party SET id_parkour = ?, id_user = ? WHERE idparty = ?;", [id_parkour, id_user, idparty, ]);
    res.status(200).json({
      success: true,
      message: `Partie ${idparty} modifiée avec succès`
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


    // Vérifiez d'abord si l'utilisateur existe
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
    if (party.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Partie non trouvé"
      });
    }

    // Supprimez l'utilisateur de la bdd
    await db.query("DELETE FROM party WHERE idparty = ?;", [idparty]);
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

/**
 * @swagger
 * /party/update-etat/{idparty}:
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
 *               etat:
 *                 type: integer
 *                 description: Etat du parcours de la partie
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
router.put("/party/update-etat/:idparty", async (req, res) => {
  const idparty = req.params.idparty;
  const {
    etat
  } = req.body;
  try {
    const db = await getDB();
    // Vérifier si la partie existe
    const [party] = await db.query("SELECT * FROM party WHERE idparty = ?;", [idparty]);
    if (party.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Partie non trouvée"
      });
    }


    // Mettre à jour l'etat de la partie dans la base de données
    await db.query("UPDATE party SET etat = ? WHERE idparty = ?;", [etat, idparty, ]);
    res.status(200).json({
      success: true,
      message: `Etat ${etat} Partie ${idparty} modifiée avec succès`
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
 * /party/getpartyetat/{idparty}:
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
 *                 etat:
 *                   type: integer
 *                   description: etat de la partie
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/party/getpartyetat/:idparty", async (req, res) => {
  try {
    const idparty = req.params.idparty;
    const db = await getDB();
    const [party] = await db.query("SELECT etat FROM party WHERE idparty = ?;", [idparty]);

    if (party.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Partie non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      data: party[0]
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
 * /party/getcodewithetat/{idparty}:
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
 *                 etat:
 *                   type: integer
 *                   description: Etat de la partie
 *                 code:
 *                   type: integer
 *                   description: Code du lieu associé
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get("/party/getcodewithetat/:idparty", async (req, res) => {
  try {
    const idparty = req.params.idparty;
    const db = await getDB();

    // Requête SQL pour obtenir l'état de la partie et le lieu conditionnel
    const [party] = await db.query(`
      SELECT p.etat,
             CASE
               WHEN p.etat = 0 THEN l1.code
               WHEN p.etat = 1 THEN l2.code
               WHEN p.etat = 2 THEN l3.code
               WHEN p.etat = 3 THEN l4.code
               ELSE NULL
             END AS code
      FROM party p
      JOIN parkour pk ON p.id_parkour = pk.idparkour
      LEFT JOIN lieu l1 ON pk.id_lieu1 = l1.idlieu
      LEFT JOIN lieu l2 ON pk.id_lieu2 = l2.idlieu
      LEFT JOIN lieu l3 ON pk.id_lieu3 = l3.idlieu
      LEFT JOIN lieu l4 ON pk.id_lieu4 = l4.idlieu
      WHERE p.idparty = ?;
    `, [idparty]);

    if (party.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Partie non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        etat: party[0].etat,
        code: party[0].code
      }
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
 * /party/add-etat/{idparty}:
 *   put:
 *     summary: Incrémenter l'état d'une partie de 1 et renvoyer le nouvel état
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
 *                 new_etat:
 *                   type: integer
 *                   description: Le nouvel état de la partie
 *       '404':
 *         description: Partie non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/party/add-etat/:idparty", async (req, res) => {
  try {
    const idparty = req.params.idparty;
    console.log(`Received request to increment state for party with ID: ${idparty}`);

    if (!idparty || isNaN(idparty)) {
      const errorMessage = "ID de la partie invalide";
      console.error(errorMessage);
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    const db = await getDB();

    const [party] = await db.query("SELECT etat FROM party WHERE idparty = ?;", [idparty]);
    if (party.length === 0) {
      const errorMessage = "Partie non trouvée";
      console.error(errorMessage);
      return res.status(404).json({
        success: false,
        message: errorMessage
      });
    }

    const newEtat = party[0].etat + 1;
    await db.query("UPDATE party SET etat = ? WHERE idparty = ?;", [newEtat, idparty]);

    res.status(200).json({
      success: true,
      new_etat: newEtat
    });
  } catch (error) {
    console.error("Erreur interne du serveur", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
});



module.exports = router;