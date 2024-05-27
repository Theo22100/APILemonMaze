const { getDB } = require("../database/database");

async function migratePartyQuestion() {
  const db = await getDB();
  try {
    // Créer la table `partyquestion` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS partyquestion (
        idparty INT,
        idquestion INT,
        PRIMARY KEY (idparty, idquestion),
        FOREIGN KEY (idparty) REFERENCES party(idparty) ON DELETE CASCADE,
        FOREIGN KEY (idquestion) REFERENCES question(idquestion) ON DELETE CASCADE
      );
    `);

    const [rows] = await db.query("SELECT COUNT(*) as count FROM partyquestion;");
    if (rows[0].count === 0) {
      console.log("Table 'partyquestion' initialisée avec un exemple de donnée.");
    } else {
      console.log("Table 'partyquestion' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migratePartyQuestion };
