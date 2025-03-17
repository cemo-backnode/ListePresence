// Importer Express
import express from 'express';

// Créer une application Express
const app = express();

// Définir un port (par défaut 3000)
const port = process.env.PORT || 3000;

// Middleware pour gérer les requêtes JSON
app.use(express.json());

// Route de base (GET)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
