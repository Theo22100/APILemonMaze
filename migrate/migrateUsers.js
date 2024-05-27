const { getDB } = require("../database/database");

async function migrateUsers() {
  const db = await getDB();
  try {
    // Créer la table `users` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pseudo VARCHAR(25) NOT NULL,
        mail VARCHAR(60) NOT NULL,
        password VARCHAR(100) NOT NULL,
        created DATETIME DEFAULT CURRENT_TIMESTAMP,
        age INT NOT NULL,
        ville VARCHAR(60) NOT NULL,
        citronBleu INT DEFAULT 0,
        citronJaune INT DEFAULT 0,
        citronRouge INT DEFAULT 0,
        citronVert INT DEFAULT 0
      );
    `);

    const [rows] = await db.query("SELECT COUNT(*) as count FROM users;");
    if (rows[0].count === 0) {
      
      console.log("Table 'users' initialisée avec un exemple de donnée.");
    } else {
      console.log("Table 'users' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateUsers };
