const { getDB } = require("../database/database");

async function migrateParkour() {
  const db = await getDB();
  try {
    // Créer la table `parkour` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS parkour (
        idparkour INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(45) NOT NULL,
        id_lieu1 INT,
        id_lieu2 INT,
        id_lieu3 INT,
        id_lieu4 INT,
        id_type INT,
        FOREIGN KEY (id_lieu1) REFERENCES lieu(idlieu),
        FOREIGN KEY (id_lieu2) REFERENCES lieu(idlieu),
        FOREIGN KEY (id_lieu3) REFERENCES lieu(idlieu),
        FOREIGN KEY (id_lieu4) REFERENCES lieu(idlieu),
        FOREIGN KEY (id_type) REFERENCES type(idtype)
      );
    `);

    // Vérifier si la table est vide, sinon insérer un exemple de donnée
    const [rows] = await db.query("SELECT COUNT(*) as count FROM parkour;");
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO parkour (nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type) VALUES (
          'Parcours Bar 1',
          1, 3, 4, 5, 
          1
        );
      `);
      await db.query(`
        INSERT INTO parkour (nom, id_lieu1, id_lieu2, id_lieu3, id_lieu4, id_type) VALUES (
          'Parcours Bar 2',
          6, 7, 8, 9, 
          1
        );
      `);
      console.log("Table 'parkour' initialisée avec l'exemple de donnée.");
    } else {
      console.log("Table 'parkour' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateParkour };
