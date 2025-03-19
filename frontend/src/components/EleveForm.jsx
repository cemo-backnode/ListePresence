import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

const EleveForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/eleves", formData);
      setFormData({ nom: "", prenom: "" });
      toast.success("Élève ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création de l'élève:", error);
      toast.error("Erreur lors de l'ajout de l'élève");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Ajouter un Élève
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Prénom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Ajouter
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EleveForm;
