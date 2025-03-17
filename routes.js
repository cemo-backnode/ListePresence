import express from 'express';
import  listeController  from '../controller/controllerListe.js'; // Importation nommée

const router = express.Router();

// Récupérer toutes les listes
router.get('/liste', listeController.getAllListes);

// Créer une nouvelle liste
router.post('/liste', listeController.createListe);

// Récupérer une liste par ID
router.get('/liste/:id', listeController.getListeById);

// Mettre à jour une liste par ID
router.patch('/liste/:id', listeController.updateListeById);

// Supprimer une liste par ID
router.delete('/liste/:id', listeController.deleteListeById);