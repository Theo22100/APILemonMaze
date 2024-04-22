

// Routes

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       '200':
 *         description: Connecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la connexion
 *                 mail:
 *                   type: string
 *                   description: Adresse e-mail de l'utilisateur
 *       '401':
 *         description: Utilisateur non trouvé ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la connexion
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/login", async (req, res) => {
    try {
      const mail = req.body.mail;
      const password = req.body.password;
  
      const user = await db.query("SELECT pseudo, mail, password FROM users WHERE mail = ?;", [mail]);
  
      // Vérifier si l'utilisateur est trouvé
      if (user[0].length === 0) {
        return res.status(401).json({
          status: "Utilisateur non trouvé."
        });
      }
  
      const userData = user[0][0];
      const userPassword = userData.password;
      if (userPassword !== password) {
        return res.status(401).json({
          status: "Mot de passe incorrect."
        });
      } else {
        return res.json({
          status: "Connecté",
          mail: userData.mail // Ajout du champ mail dans la réponse JSON
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error"
      });
    }
  });
  

/**
 * @swagger
 * /parkourbar:
 *   post:
 *     summary: Obtenir les détails d'un parcours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID du parcours
 *     responses:
 *       '200':
 *         description: Succès
 *       '400':
 *         description: Mauvaise requête
 *       '404':
 *         description: Parcours non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
app.post("/parkourbar", async (req, res) => {
  try {
    const id = req.body.id;

    // Vérifier si l'ID est fourni
    if (!id) {
      return res.status(400).json({
        error: "L'ID du parcours est requis.",
      });
    }

    // Requête SQL paramétrée pour éviter les injections SQL
    const parkourBar = await db.query("SELECT * FROM parkour WHERE id = ?;", [id]);

    // Vérifier si un parcours est trouvé avec cet ID
    if (parkourBar.length === 0) {
      return res.status(404).json({
        error: "Parkour non trouvé pour l'ID spécifié.",
      });
    }

    // Renvoyer les données du parcours
    res.json({
      status: "Succès",
      data: parkourBar[0][0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
});

/**
 * @swagger
 * /create-user:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *                 description: Pseudo de l'utilisateur
 *               mail:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       '200':
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Statut de la création de l'utilisateur
 *       '400':
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description de l'erreur
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description de l'erreur interne du serveur
 */
app.post("/create-user", async (req, res) => {
    try {
      const {
        pseudo,
        mail,
        password
      } = req.body;
  
      if (!pseudo) {
        return res.status(400).json({
          error: "Pseudo is required"
        });
      }
      if (!mail) {
        return res.status(400).json({
          error: "Mail is required"
        });
      }
  
      if (!password) {
        return res.status(400).json({
          error: "Password is required"
        });
      }
  
      // Vérifier si le pseudo est déjà pris
      const existingUser = await db.query("SELECT * FROM users WHERE pseudo = ?;", [pseudo]);
  
      if (existingUser[0].length > 0) {
        console.log("pseudo pris");
        return res.status(400).json({
          status: "Ce pseudo est déjà pris !"
        });
      }
  
      // Vérifier si le mail est déjà pris
      const existingMail = await db.query("SELECT * FROM users WHERE mail = ?;", [mail]);
  
      if (existingMail[0].length > 0) {
        return res.status(400).json({
          status: "Ce mail est déjà associé à un compte !"
        });
      }
  
      await db.query("INSERT INTO users (pseudo, mail, password) VALUES (?, ?, ?);", [pseudo, mail, password]);
  
      res.json({
        status: "OK"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Internal Server Error"
      });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtenir la liste des utilisateurs
 *     responses:
 *       '200':
 *         description: Succès
 *       '500':
 *         description: Erreur interne du serveur
 */
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users;");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur interne du serveur.",
    });
  }
});

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "Lemonmaze !",
  });
});

