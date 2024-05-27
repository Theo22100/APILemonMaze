const { getDB } = require("../database/database");

async function migrateRecompenseUser() {
  const db = await getDB();
  try {
    // Créer la table `recompense_user` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS recompense_user (
        id_recompense_user INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        id_recompense INT NOT NULL,
        code VARCHAR(10) NOT NULL,
        FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (id_recompense) REFERENCES recompense(idrecompense) ON DELETE CASCADE
      );
    `);
    const [rows] = await db.query("SELECT COUNT(*) as count FROM recompense_user;");
    if (rows[0].count === 0) {
      console.log("Table 'recompense_user' déjà initialisée.");
    } else {
      console.log("Table 'recompense_user' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateRecompenseUser };
