import prisma from '../lib/script';

export const listeController = {
  // Créer un nouvel enregistrement
  createListe: async (req, res) => {
    try {
      console.log("req.body", req.body);
      const liste = await prisma.liste.create({
        data: {
          date_du_jour: req.body.date_du_jour, // Correction de la clé
          formateur: req.body.formateur,
          nom_prenom: req.body.nom_prenom,
          heure_arriveer: req.body.heure_arriveer, // Correction de la clé
          signature: req.body.signature,
        },
      });
      res.status(201).json(liste);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la création de la liste' });
    }
  },

  // Lire tous les enregistrements
  getAllListes: async (req, res) => {
    try {
      const listes = await prisma.liste.findMany();
      res.status(200).json(listes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des listes' });
    }
  },
  //Recupérer une liste par id
     getListeById : async (req, res) => {
      try {
          const { id } = req.params; // Récupération de l'ID depuis l'URL
  
          if (!id) {
              return res.status(400).json({ error: "L'ID est requis" });
          }
  
          const liste = await prisma.liste.findUnique({
              where: {
                  id_liste: parseInt(id) // Convertir l'ID en entier
              }
          });
  
          if (!liste) {
              return res.status(404).json({ error: "Liste non trouvée" });
          }
  
          res.json(liste);
      } catch (error) {
          console.error("Erreur Prisma :", error);
          res.status(500).json({ error: "Erreur serveur" });
      }
  },

//Mise à jour d'une liste
  updateListeById: async (req, res) => {
    try {
      const { id } = req.params; // Récupération de l'ID
      const parsedId = parseInt(id); // Convertir l'ID en entier
  
      if (isNaN(parsedId)) {
        return res.status(400).json({ error: "L'ID doit être un nombre valide" });
      }
  
      // Vérifier si la liste existe avant de la mettre à jour
      const existingListe = await prisma.liste.findUnique({
        where: { id_liste: parsedId }
      });
  
      if (!existingListe) {
        return res.status(404).json({ error: "Liste non trouvée" });
      }
  
      // Mise à jour des champs (en gardant les anciennes valeurs si elles ne sont pas envoyées)
      const updatedListe = await prisma.liste.update({
        where: { id_liste: parsedId },
        data: {
          date_du_jour: req.body.date_du_jour || existingListe.date_du_jour,
          formateur: req.body.formateur || existingListe.formateur,
          nom_prenom: req.body.nom_prenom || existingListe.nom_prenom,
          heure_arriveer: req.body.heure_arriveer || existingListe.heure_arriveer,
          signature: req.body.signature || existingListe.signature
        },
      });
  
      res.status(200).json(updatedListe);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour de la liste" });
    }
  },
  
  // Supprimer un enregistrement par ID
  deleteListeById: async (req, res) => {
    try {
      const { id} = req.params;
      await prisma.liste.delete({
        where: {
          id_liste: parseInt(id),
        },
      });
      res.status(204).send(); // Pas de contenu à renvoyer
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la suppression de la liste' });
    }
  },
}
  

export default listeController;