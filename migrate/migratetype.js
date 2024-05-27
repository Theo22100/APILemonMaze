const { getDB } = require("../database/database");

async function migrateType() {
  const db = await getDB();
  try {
    // Créer la table `type` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS type (
        idtype INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL
      );
    `);

    // Vérifier si la table est vide, sinon insérer un exemple de donnée
    const [rows] = await db.query("SELECT COUNT(*) as count FROM type;");
    if (rows[0].count === 0) {
      await db.query("INSERT INTO type (nom) VALUES ('Bar');");
      await db.query("INSERT INTO type (nom) VALUES ('Restaurant');");
      await db.query("INSERT INTO type (nom) VALUES ('Musée');");
      await db.query("INSERT INTO type (nom) VALUES ('Bibliothèque');");
      console.log("Table 'type' initialisée avec l'exemple de donnée.");
    } else {
      console.log("Table 'type' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateType };
