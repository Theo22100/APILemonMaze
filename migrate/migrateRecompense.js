const { getDB } = require("../database/database");

async function migrateRecompense() {
  const db = await getDB();
  try {
    // Créer la table `recompense` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS recompense (
        idrecompense INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(60) NOT NULL,
        info VARCHAR(100) NOT NULL,
        citronBleu INT NOT NULL,
        citronOrange INT NOT NULL,
        citronRouge INT NOT NULL,
        citronVert INT NOT NULL,
        id_lieu INT NOT NULL,
        id_type INT NOT NULL,
        FOREIGN KEY (id_lieu) REFERENCES lieu(idlieu) ON DELETE CASCADE,
        FOREIGN KEY (id_type) REFERENCES type(idtype) ON DELETE CASCADE
      );
    `);

    const [rows] = await db.query("SELECT COUNT(*) as count FROM recompense;");
    if (rows[0].count === 0) {

      await db.query(`
        INSERT INTO recompense (nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type) VALUES (
          "1.50€ offert",
          "Offre exclusivement valable sur les cocktails de la carte. Offre non cumulable.",
          0,
          0,
          140,
          0,
          1,
          1
        );
      `);

      await db.query(`
        INSERT INTO recompense (nom, info, citronBleu, citronOrange, citronRouge, citronVert, id_lieu, id_type) VALUES (
          "UN CARNET OFFERT",
          "Offre exclusivement valable en boutique pour tout achat supérieur à 15 euros.",
          0,
          0,
          0,
          100,
          2,
          4
        );
      `);
      console.log("Table 'recompense' initialisée avec un exemple de donnée.");
    } else {
      console.log("Table 'recompense' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateRecompense };
