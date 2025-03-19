import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { format, addMinutes, isAfter } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";

const CreateListePresence = () => {
  const [formateur, setFormateur] = useState("");
  const [heureDebut, setHeureDebut] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEleves();
  }, []);

  useEffect(() => {
    if (heureDebut) {
      // Initialiser les présences avec l'heure de début
      const newPresences = {};
      eleves.forEach((eleve) => {
        newPresences[eleve.id] = {
          statut: "present",
          heureArrivee: heureDebut,
        };
      });
      setPresences(newPresences);
    }
  }, [heureDebut, eleves]);

  const fetchEleves = async () => {
    try {
      const response = await axios.get("http://localhost:3000/eleves");
      setEleves(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves:", error);
      toast.error("Erreur lors de la récupération des élèves");
    }
  };

  const handleHeureArriveeChange = (eleveId, nouvelleHeure) => {
    if (!heureDebut || !nouvelleHeure) return;

    // Créer des objets Date avec la même date mais des heures différentes
    const dateBase = new Date();
    const heureDebutDate = new Date(
      dateBase.setHours(heureDebut.getHours(), heureDebut.getMinutes(), 0, 0)
    );
    const heureLimiteRetard = addMinutes(heureDebutDate, 10);
    const nouvelleHeureDate = new Date(
      dateBase.setHours(
        nouvelleHeure.getHours(),
        nouvelleHeure.getMinutes(),
        0,
        0
      )
    );

    let nouveauStatut = "present";

    if (isAfter(nouvelleHeureDate, heureLimiteRetard)) {
      nouveauStatut = "absent";
    } else if (isAfter(nouvelleHeureDate, heureDebutDate)) {
      nouveauStatut = "en_retard";
    }

    setPresences((prev) => ({
      ...prev,
      [eleveId]: {
        statut: nouveauStatut,
        heureArrivee: nouvelleHeureDate,
      },
    }));
  };

  const handleStatutChange = (eleveId, nouveauStatut) => {
    setPresences((prev) => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        statut: nouveauStatut,
        heureArrivee:
          nouveauStatut === "absent" ? null : prev[eleveId].heureArrivee,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formateur) {
      toast.error("Veuillez entrer le nom du formateur");
      return;
    }
    if (!heureDebut) {
      toast.error("Veuillez sélectionner l'heure de début du cours");
      return;
    }

    setLoading(true);
    try {
      // Créer une date de base pour aujourd'hui
      const dateBase = new Date();
      // Configurer l'heure de début avec la date d'aujourd'hui
      const heureDebutComplete = new Date(
        dateBase.setHours(heureDebut.getHours(), heureDebut.getMinutes(), 0, 0)
      );

      const listeData = {
        formateur,
        heureDebut: heureDebutComplete.toISOString(),
        presences: Object.entries(presences).map(([eleveId, presence]) => ({
          eleveId: parseInt(eleveId),
          statut: presence.statut,
          heureArrivee: presence.heureArrivee
            ? presence.heureArrivee.toISOString()
            : null,
        })),
      };

      console.log("Données envoyées:", listeData); // Pour le débogage

      await axios.post("http://localhost:3000/listes-presence", listeData);
      toast.success("Liste de présence créée avec succès !");
      setFormateur("");
      setHeureDebut(null);
      setPresences({});
    } catch (error) {
      console.error("Erreur lors de la création de la liste:", error);
      toast.error("Erreur lors de la création de la liste");
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "present":
        return "success";
      case "en_retard":
        return "warning";
      case "absent":
        return "error";
      default:
        return "default";
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case "present":
        return "Présent";
      case "en_retard":
        return "En retard";
      case "absent":
        return "Absent";
      default:
        return statut;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer une Liste de Présence
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Date du jour :{" "}
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nom du formateur"
            value={formateur}
            onChange={(e) => setFormateur(e.target.value)}
            margin="normal"
            required
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TimePicker
              label="Heure de début du cours"
              value={heureDebut}
              onChange={setHeureDebut}
              sx={{ mt: 2, width: "100%" }}
              slotProps={{
                textField: {
                  required: true,
                  helperText:
                    "Les élèves arrivant 10 minutes après cette heure seront marqués en retard",
                },
              }}
            />
          </LocalizationProvider>

          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Heure d'arrivée</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eleves.map((eleve) => (
                  <TableRow key={eleve.id}>
                    <TableCell>{eleve.nom}</TableCell>
                    <TableCell>{eleve.prenom}</TableCell>
                    <TableCell>
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={fr}
                      >
                        <TimePicker
                          value={presences[eleve.id]?.heureArrivee || null}
                          onChange={(newValue) =>
                            handleHeureArriveeChange(eleve.id, newValue)
                          }
                          disabled={
                            !heureDebut ||
                            presences[eleve.id]?.statut === "absent"
                          }
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <RadioGroup
                          row
                          value={presences[eleve.id]?.statut || "present"}
                          onChange={(e) =>
                            handleStatutChange(eleve.id, e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="present"
                            control={<Radio color="success" />}
                            label="Présent"
                          />
                          <FormControlLabel
                            value="en_retard"
                            control={<Radio color="warning" />}
                            label="En retard"
                          />
                          <FormControlLabel
                            value="absent"
                            control={<Radio color="error" />}
                            label="Absent"
                          />
                        </RadioGroup>
                      </FormControl>
                      <Chip
                        label={getStatutLabel(presences[eleve.id]?.statut)}
                        color={getStatutColor(presences[eleve.id]?.statut)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Création en cours..." : "Créer la liste"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateListePresence;
