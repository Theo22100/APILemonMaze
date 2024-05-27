const { getDB } = require("../database/database");

async function migrateVille() {
  const db = await getDB();
  try {
    // Créer la table `ville` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS ville (
        idville INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(60) NOT NULL
      );
    `);

    // Vérifier si la table est vide, sinon insérer un exemple de donnée
    const [rows] = await db.query("SELECT COUNT(*) as count FROM ville;");
    if (rows[0].count === 0) {
      await db.query("INSERT INTO ville (nom) VALUES ('Rennes');");
      await db.query("INSERT INTO ville (nom) VALUES ('Brest');");
      console.log("Table 'ville' initialisée avec l'exemple de donnée.");
    } else {
      console.log("Table 'ville' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateVille };
