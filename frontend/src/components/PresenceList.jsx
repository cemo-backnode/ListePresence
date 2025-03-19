import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PresenceList = () => {
  const [presences, setPresences] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    enRetard: 0,
  });

  useEffect(() => {
    fetchPresences();
  }, [selectedDate]);

  const fetchPresences = async () => {
    try {
      const response = await axios.get("http://localhost:3000/presences");
      const filteredPresences = response.data.filter(
        (presence) =>
          format(new Date(presence.date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
      );
      setPresences(filteredPresences);

      // Calcul des statistiques
      const total = filteredPresences.length;
      const present = filteredPresences.filter(
        (p) => p.statut === "present"
      ).length;
      const absent = filteredPresences.filter(
        (p) => p.statut === "absent"
      ).length;
      const enRetard = filteredPresences.filter(
        (p) => p.statut === "en_retard"
      ).length;

      setStats({
        total,
        present,
        absent,
        enRetard,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des présences:", error);
    }
  };

  const filteredPresences = presences.filter(
    (presence) =>
      presence.eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presence.eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // TODO: Implémenter l'export en Excel
    console.log("Export en cours...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Liste des Présences
        </Typography>
        <Box>
          <Tooltip title="Exporter en Excel">
            <IconButton onClick={handleExport} sx={{ mr: 1 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimer">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Sélectionner une date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              sx={{ width: "100%" }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total des élèves
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Présents
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.present}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {((stats.present / stats.total) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absents
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.absent}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {((stats.absent / stats.total) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                En retard
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.enRetard}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {((stats.enRetard / stats.total) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Heure d'arrivée</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPresences.map((presence) => (
              <TableRow key={presence.id}>
                <TableCell>{presence.eleve.nom}</TableCell>
                <TableCell>{presence.eleve.prenom}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      presence.statut === "present"
                        ? "Présent"
                        : presence.statut === "absent"
                        ? "Absent"
                        : "En retard"
                    }
                    color={
                      presence.statut === "present"
                        ? "success"
                        : presence.statut === "absent"
                        ? "error"
                        : "warning"
                    }
                  />
                </TableCell>
                <TableCell>
                  {presence.heureArrivee
                    ? format(new Date(presence.heureArrivee), "HH:mm")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PresenceList;
