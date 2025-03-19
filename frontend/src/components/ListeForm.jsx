import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

function ListeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/liste`, formData);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la création de la liste:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Créer une nouvelle liste
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Créer
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")} fullWidth>
              Annuler
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ListeForm;
