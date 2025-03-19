import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

function ListeList() {
  const [listes, setListes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedListe, setSelectedListe] = useState(null);
  const [editForm, setEditForm] = useState({ titre: "", description: "" });

  useEffect(() => {
    fetchListes();
  }, []);

  const fetchListes = async () => {
    try {
      const response = await axios.get(`${API_URL}/liste`);
      setListes(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des listes:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/liste/${id}`);
      fetchListes();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleEdit = (liste) => {
    setSelectedListe(liste);
    setEditForm({ titre: liste.titre, description: liste.description });
    setOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`${API_URL}/liste/${selectedListe.id}`, editForm);
      setOpen(false);
      fetchListes();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Liste des Listes
      </Typography>
      <Grid container spacing={3}>
        {listes.map((liste) => (
          <Grid item xs={12} sm={6} md={4} key={liste.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {liste.titre}
                </Typography>
                <Typography color="text.secondary">
                  {liste.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEdit(liste)}>
                  Modifier
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(liste.id)}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Modifier la liste</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            fullWidth
            value={editForm.titre}
            onChange={(e) =>
              setEditForm({ ...editForm, titre: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ListeList;
