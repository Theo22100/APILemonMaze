const { getDB } = require("../database/database");

async function migrateLieu() {
  const db = await getDB();
  try {
    // Créer la table `lieu` si elle n'existe pas déjà
    await db.query(`
      CREATE TABLE IF NOT EXISTS lieu (
        idlieu INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        GPS VARCHAR(650) NOT NULL,
        info VARCHAR(300) NOT NULL,
        code INT NOT NULL,
        active TINYINT NOT NULL DEFAULT 1,
        id_ville INT,
        FOREIGN KEY (id_ville) REFERENCES ville(idville)
      );
    `);

    // Vérifier si la table est vide, sinon insérer un exemple de donnée
    const [rows] = await db.query("SELECT COUNT(*) as count FROM lieu;");
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          'Little Délirium',
          'https://www.google.fr/maps/place/Little+Délirium+Café+Rennes/@48.1062657,-1.6786742,18z/data=!4m15!1m7!3m6!1s0x480edfdca9e2e09b:0x947fd668e4089e82!2sLittle+Délirium+Café+Rennes!8m2!3d48.1062788!4d-1.6779422!16s%2Fg%2F11mn0nd_tj!3m6!1s0x480edfdca9e2e09b:0x947fd668e4089e82!8m2!3d48.1062788!4d-1.6779422!15sCiFkZWxpcml1bSBjaGFybGVzIGRlIGdhdWxsZSByZW5uZXNaIyIhZGVsaXJpdW0gY2hhcmxlcyBkZSBnYXVsbGUgcmVubmVzkgEDYmFy4AEA!16s%2Fg%2F11mn0nd_tj?entry=ttu',
          "Bar avec plus de 2 000 bières, concerts le jeudi soir et objets de décoration sur l'univers de la brasserie.",
          4925,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          'Musée des beaux arts',
          'https://www.google.com/maps/dir//20+Quai+Emile+Zola,+35000+Rennes/@48.1102772,-1.6726458,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x480ede3571bbdfe3:0x47452abd296511eb!2m2!1d-1.6748103!2d48.1097886?entry=ttu',
          "Le musée des Beaux-Arts de Rennes est un musée d'art et d'archéologie français. Il a été constitué avec, pour fonds initial, les œuvres saisies lors des confiscations révolutionnaires effectuées en 1794 dans les édifices religieux et civils de la ville de Rennes.",
          2190,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          'Le Comptoir',
          'https://www.google.com/maps/place//data=!4m2!3m1!1s0x480ede313980c4bd:0x36501d331a62da6e?sa=X&ved=1t:8290&ictx=11',
          'Le Comptoir est un bar pour passer un vrai moment de détente !',
          2573,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          'WarpZone',
          'https://www.google.com/maps/dir//WarpZone+Rennes,+92+Mail+François+Mitterrand,+35000+Rennes/@48.1084838,-1.6957199,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x480ede2aa4706b1f:0xcc09232560ffd4ec!2m2!1d-1.6957952!2d48.1085053?entry=ttu',
          'Des soirées à thème, tournois et consoles de jeux vidéo dans un bar gaming au cadre chaleureux et boisé !',
          4428,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          "Bar Tiffany's",
          'https://www.google.com/maps/dir//19+Rue+Paul+Bert,+35000+Rennes/@48.1107911,-1.7517501,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x480ede4b81161adb:0x1e7e98f9ce7f7d19!2m2!1d-1.6694354!2d48.1108461?entry=ttu',
          "Burgers et large choix de whiskys proposés dans un pub à l'ambiance détendue avec tables de billard et terrasse fermée.",
          1109,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          "Bar le Saint Germain",
          'https://www.google.com/maps/dir//9+Pl.+Saint-Germain,+35000+Rennes/@48.1105025,-1.7582534,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x480ede359efe7405:0x22b4d70cb76dc65d!2m2!1d-1.6758574!2d48.1105317?hl=fr&entry=ttu',
          "Bar sobre servant des burgers, de la bière et du whisky dans un cadre classique. Retransmissions d'événements sportifs.",
          3758,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          "Fox and Friends Pub",
          'https://www.google.com/maps?hl=fr&gl=fr&um=1&ie=UTF-8&fb=1&sa=X&geocode=Ka1SDS0y3g5IMaIMZqjx72h7&daddr=13+Rue+de+la+Monnaie,+35000+Rennes',
          'Murs rouges, terrasse et lampes éclectique dans un bar décontracté offrant brunchs, tapas et petits plats.',
          8106,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          "Penny Lane",
          'https://www.google.com/maps?hl=fr&gl=fr&um=1&ie=UTF-8&fb=1&sa=X&geocode=Kefubm803g5IMR5JaXmTT_gj&daddr=1+Rue+de+Coetquen,+35000+Rennes',
          'Dégustation de vins, tartines et planches de charcuterie dans une ambiance conviviale avec concerts.',
          1430,
          1,
          1
        );
      `);
      await db.query(`
        INSERT INTO lieu (nom, GPS, info, code, active, id_ville) VALUES (
          "O'Connell's Irish Pub",
          'https://www.google.com/maps?hl=fr&gl=fr&um=1&ie=UTF-8&fb=1&sa=X&geocode=KR_nq8013g5IMU4E-2p9vegu&daddr=6+Pl.+du+Parlement+de+Bretagne,+35000+Rennes',
          'Carte typique, concerts live, matchs de rugby, happy hour et jeu de fléchettes pour ce pub irlandais animé.',
          3693,
          1,
          1
        );
      `);

      console.log("Table 'lieu' initialisée avec l'exemple de donnée.");
    } else {
      console.log("Table 'lieu' déjà initialisée.");
    }
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
    process.exit(1);
  }
}

module.exports = { migrateLieu };
