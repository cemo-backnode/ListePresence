import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Stack,
  Badge,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const EleveList = () => {
  const [eleves, setEleves] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eleveToDelete, setEleveToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingEleve, setEditingEleve] = useState(null);
  const [newEleve, setNewEleve] = useState({ nom: "", prenom: "" });
  const [statistiques, setStatistiques] = useState({});

  useEffect(() => {
    fetchEleves();
    fetchStatistiques();
  }, []);

  const fetchStatistiques = async () => {
    try {
      const response = await axios.get("http://localhost:3000/listes-presence");
      const listes = response.data;

      // Calculer les statistiques par élève
      const stats = {};
      listes.forEach((liste) => {
        liste.presences.forEach((presence) => {
          if (!stats[presence.eleveId]) {
            stats[presence.eleveId] = {
              present: 0,
              en_retard: 0,
              absent: 0,
              total: 0,
            };
          }
          stats[presence.eleveId][presence.statut]++;
          stats[presence.eleveId].total++;
        });
      });
      setStatistiques(stats);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const fetchEleves = async () => {
    try {
      const response = await axios.get("http://localhost:3000/eleves");
      setEleves(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves:", error);
      toast.error("Erreur lors de la récupération des élèves");
    }
  };

  const handleDeleteClick = (eleve) => {
    setEleveToDelete(eleve);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:3000/eleves/${eleveToDelete.id}`);
      fetchEleves();
      setDeleteDialogOpen(false);
      setEleveToDelete(null);
      toast.success("Élève supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élève:", error);
      toast.error("Erreur lors de la suppression de l'élève");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEleveToDelete(null);
  };

  const handleAddClick = () => {
    setEditingEleve(null);
    setNewEleve({ nom: "", prenom: "" });
    setAddDialogOpen(true);
  };

  const handleEditClick = (eleve) => {
    setEditingEleve(eleve);
    setNewEleve({ nom: eleve.nom, prenom: eleve.prenom });
    setAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingEleve) {
        await axios.put(
          `http://localhost:3000/eleves/${editingEleve.id}`,
          newEleve
        );
        toast.success("Élève modifié avec succès !");
      } else {
        await axios.post("http://localhost:3000/eleves", newEleve);
        toast.success("Élève ajouté avec succès !");
      }
      fetchEleves();
      setAddDialogOpen(false);
      setEditingEleve(null);
      setNewEleve({ nom: "", prenom: "" });
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      toast.error(
        editingEleve
          ? "Erreur lors de la modification de l'élève"
          : "Erreur lors de l'ajout de l'élève"
      );
    }
  };

  const handleCancel = () => {
    setAddDialogOpen(false);
    setEditingEleve(null);
    setNewEleve({ nom: "", prenom: "" });
  };

  const filteredEleves = eleves.filter(
    (eleve) =>
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Liste des Élèves
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Total : {eleves.length} élèves
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Ajouter un Élève
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un élève..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredEleves.map((eleve) => (
          <Grid item xs={12} sm={6} md={4} key={eleve.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {eleve.nom} {eleve.prenom}
                </Typography>
                {statistiques[eleve.id] && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Tooltip title="Présences">
                      <Badge
                        badgeContent={statistiques[eleve.id].present}
                        color="success"
                      >
                        <CheckCircleIcon color="success" />
                      </Badge>
                    </Tooltip>
                    <Tooltip title="Retards">
                      <Badge
                        badgeContent={statistiques[eleve.id].en_retard}
                        color="warning"
                      >
                        <WarningIcon color="warning" />
                      </Badge>
                    </Tooltip>
                    <Tooltip title="Absences">
                      <Badge
                        badgeContent={statistiques[eleve.id].absent}
                        color="error"
                      >
                        <CancelIcon color="error" />
                      </Badge>
                    </Tooltip>
                  </Stack>
                )}
              </CardContent>
              <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                <Tooltip title="Modifier">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(eleve)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(eleve)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer l'élève {eleveToDelete?.nom}{" "}
          {eleveToDelete?.prenom} ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={handleCancel}>
        <DialogTitle>
          {editingEleve ? "Modifier l'élève" : "Ajouter un élève"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            value={newEleve.nom}
            onChange={(e) => setNewEleve({ ...newEleve, nom: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Prénom"
            fullWidth
            value={newEleve.prenom}
            onChange={(e) =>
              setNewEleve({ ...newEleve, prenom: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Annuler</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingEleve ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EleveList;
