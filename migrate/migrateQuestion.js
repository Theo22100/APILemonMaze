const { getDB } = require("../database/database");

async function migrateQuestion() {
  const db = await getDB();
  try {
    // Créer la table `question` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS question (
        idquestion INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(200) NOT NULL,
        reponse1 VARCHAR(200) NOT NULL,
        reponse2 VARCHAR(200) NOT NULL,
        reponse3 VARCHAR(200) NOT NULL,
        reponse4 VARCHAR(200) NOT NULL,
        bonnereponse INT NOT NULL
      );
    `);

    // Vérifier si la table est vide, sinon insérer un exemple de donnée
    const [rows] = await db.query("SELECT COUNT(*) as count FROM question;");
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quelle est l'origine de la tradition du 'Jeudi noir' à Rennes ?",
          "Une bataille d'encre qui aurait explosé dans l'amphithéâtre de Rennes 2 en 1950.",
          'Elle remonte à une grève étudiante en 1968.',
          "Un défi d'étudiants, s'habiller en noir le 1er jour de la rentrée.",
          'En Bretagne, le jeudi est couronné roi des jours pluvieux selon les statistiques.',
          2
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quelle est l'origine du festival Trans Musicales de Rennes ?",
          'Une fête médiévale dédiée à la musique celtique.',
          "Un mouvement de soutien à la reconstruction de l'Opéra de Rennes.",
          'Un groupe de jeunes musiciens rennais en 1979.',
          'Une initiative municipale pour promouvoir le tourisme en 1995.',
          3
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quel est le surnom du Stade Rennais Football Club ?",
          "Les Aigles de Rennes.",
          "Les Dragons Rennais.",
          "Les Rouges et Noirs.",
          "Les Renards Bretons.",
          3
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quelle particularité distingue l'Université Rennes 2 ?",
          "Elle est dédiée exclusivement aux sciences exactes.",
          "Elle a le plus grand campus d'arts et de lettres de France.",
          "C'est la plus ancienne université de Bretagne.",
          "Elle possède le premier laboratoire de robotique de France.",
          2
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quelle est l'importance historique de la rue Saint-Michel, surnommée 'la rue de la Soif' ?",
          "Elle était autrefois le centre de la production de cidre à Rennes.",
          "Elle est connue pour ses nombreux bars et sa vie nocturne animée.",
          "Elle était le lieu des exécutions publiques au Moyen Âge.",
          "C'est l'endroit où la première école de Rennes a été construite.",
          2
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quel événement tragique a marqué l'histoire du Parlement de Bretagne à Rennes ?",
          "Il a été détruit lors de la Révolution française.",
          "Un incendie l'a gravement endommagé en 1994.",
          "Une épidémie de peste a ravagé ses occupants en 1625.",
          "Elle symbolise la reconstruction de la ville après l'incendie de 1720.",
          2
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Pourquoi la Tour de l'Horloge de Rennes est-elle célèbre ?",
          "Elle contient la plus ancienne horloge astronomique de France.",
          "Elle était autrefois le donjon du château de Rennes.",
          "Elle a été construite pour commémorer la victoire sur les Anglais en 1450.",
          "Elle symbolise la reconstruction de la ville après l'incendie de 1720.",
          4
        );
      `);
      await db.query(`
        INSERT INTO question (question, reponse1, reponse2, reponse3, reponse4, bonnereponse) VALUES (
          "Quel événement historique a eu lieu au parc du Thabor à Rennes en 1789 ?",
          "Un duel entre deux nobles bretons.",
          "La plantation de l'arbre de la liberté.",
          "Une réunion secrète des révolutionnaires rennais.",
          "La première fête de la Fédération de Rennes.",
          2
        );
      `);
      console.log("Table 'question' initialisée avec un exemple de donnée.");
    } else {
      console.log("Table 'question' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateQuestion };
