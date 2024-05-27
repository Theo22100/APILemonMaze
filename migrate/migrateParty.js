const { getDB } = require("../database/database");

async function migrateParty() {
  const db = await getDB();
  try {
    // Créer la table `party` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS party (
        idparty INT AUTO_INCREMENT PRIMARY KEY,
        dateDebut DATETIME DEFAULT CURRENT_TIMESTAMP,
        dateFin DATETIME DEFAULT NULL,
        etat INT DEFAULT 0,
        abandon TINYINT DEFAULT 0,
        id_parkour INT NOT NULL,
        id_user INT NOT NULL,
        FOREIGN KEY (id_parkour) REFERENCES parkour(idparkour) ON DELETE CASCADE,
        FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    const [rows] = await db.query("SELECT COUNT(*) as count FROM party;");
    if (rows[0].count === 0) {
      
      console.log("Table 'party' initialisée avec un exemple de donnée.");
    } else {
      console.log("Table 'party' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateParty };
