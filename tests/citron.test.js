const request = require('supertest');
const app = require('../main'); // Supposons que votre application Express est définie dans un fichier app.js

describe('POST /add-citron-vert', () => {
  test('Ajoute un citron vert avec succès', async () => {
    const response = await request(app)
      .post('/add-citron-vert')
      .send({ userId: 12, nombre: 5 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Citron Vert ajouté avec succès");
  });

  test('Échoue si l\'utilisateur n\'est pas trouvé', async () => {
    const response = await request(app)
      .post('/add-citron-vert')
      .send({ userId: 1, nombre: 5 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Utilisateur non trouvé");
  });

});
