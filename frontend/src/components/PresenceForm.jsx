import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PresenceForm = () => {
  const [eleves, setEleves] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [presences, setPresences] = useState({});
  const [heuresArrivee, setHeuresArrivee] = useState({});

  useEffect(() => {
    fetchEleves();
  }, []);

  const fetchEleves = async () => {
    try {
      const response = await axios.get("http://localhost:3000/eleves");
      setEleves(response.data);
      // Initialiser les présences pour chaque élève
      const initialPresences = {};
      const initialHeures = {};
      response.data.forEach((eleve) => {
        initialPresences[eleve.id] = "present";
        initialHeures[eleve.id] = new Date();
      });
      setPresences(initialPresences);
      setHeuresArrivee(initialHeures);
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves:", error);
      toast.error("Erreur lors de la récupération des élèves");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const promises = Object.entries(presences).map(([eleveId, statut]) => {
        const heureArrivee =
          statut === "present" ? heuresArrivee[eleveId] : null;
        return axios.post("http://localhost:3000/presences", {
          eleveId: parseInt(eleveId),
          date: selectedDate,
          statut,
          heureArrivee,
        });
      });

      await Promise.all(promises);
      toast.success("Présences enregistrées avec succès !");
      // Réinitialiser le formulaire
      fetchEleves();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des présences:", error);
      toast.error("Erreur lors de l'enregistrement des présences");
    }
  };

  const handleStatutChange = (eleveId, statut) => {
    setPresences((prev) => ({
      ...prev,
      [eleveId]: statut,
    }));
  };

  const handleHeureChange = (eleveId, heure) => {
    setHeuresArrivee((prev) => ({
      ...prev,
      [eleveId]: heure,
    }));
  };

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Marquer les Présences
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            sx={{ mb: 2 }}
          />
        </LocalizationProvider>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {eleves.map((eleve) => (
              <Grid item xs={12} md={6} key={eleve.id}>
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
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {eleve.nom} {eleve.prenom}
                    </Typography>

                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                      <RadioGroup
                        row
                        value={presences[eleve.id] || "present"}
                        onChange={(e) =>
                          handleStatutChange(eleve.id, e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="present"
                          control={<Radio color="success" />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon
                                sx={{ mr: 1, color: "success.main" }}
                              />
                              Présent
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="absent"
                          control={<Radio color="error" />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CancelIcon sx={{ mr: 1, color: "error.main" }} />
                              Absent
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="en_retard"
                          control={<Radio color="warning" />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <AccessTimeIcon
                                sx={{ mr: 1, color: "warning.main" }}
                              />
                              En retard
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>

                    {presences[eleve.id] === "present" && (
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={fr}
                      >
                        <TimePicker
                          label="Heure d'arrivée"
                          value={heuresArrivee[eleve.id]}
                          onChange={(newValue) =>
                            handleHeureChange(eleve.id, newValue)
                          }
                          sx={{ width: "100%" }}
                        />
                      </LocalizationProvider>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 200 }}
            >
              Enregistrer les Présences
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PresenceForm;
