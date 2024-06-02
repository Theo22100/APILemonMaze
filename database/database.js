const mysql = require("mysql2/promise");
const config = require("config");


let db = null;

async function connectToDatabase() {
  try {
    db = await mysql.createConnection({
      host: config.get("db.host"),
      user: config.get("db.user"),
      password: config.get("db.password"),
      database: config.get("db.database"),
      charset: config.get("db.charset"),
      port: config.get("db.port"),
    });
    console.log("Connexion à la base de données réussie");
  } catch (error) {
    console.error("Échec de la connexion à la base de données");
    console.error(error);
    process.exit(1);
  }
}

async function getDB() {
  if (!db) {
    await connectToDatabase();
  } else {
    try {
      await db.ping();
    } catch (error) {
      console.error("Connexion à la base de données perdue. Reconnexion en cours...");
      await connectToDatabase();
    }
  }
  return db;
}

module.exports = {
  getDB
};
