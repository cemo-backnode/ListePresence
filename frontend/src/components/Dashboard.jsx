import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [listes, setListes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    en_retard: 0,
    absent: 0,
  });
  const [selectedListe, setSelectedListe] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListes();
  }, []);

  const fetchListes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/listes-presence");
      const listesData = response.data;
      setListes(listesData);
      calculateGlobalStats(listesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des listes:", error);
      toast.error("Erreur lors de la récupération des listes");
    }
  };

  const calculateGlobalStats = (listesData) => {
    const globalStats = {
      total: 0,
      present: 0,
      en_retard: 0,
      absent: 0,
    };

    listesData.forEach((liste) => {
      if (liste.presences && Array.isArray(liste.presences)) {
        globalStats.total += liste.presences.length;
        liste.presences.forEach((presence) => {
          if (presence.statut === "present") globalStats.present++;
          else if (presence.statut === "en_retard") globalStats.en_retard++;
          else if (presence.statut === "absent") globalStats.absent++;
        });
      }
    });

    setStats(globalStats);
  };

  const calculateListeStats = (liste) => {
    const listeStats = {
      total: liste.presences.length,
      present: liste.presences.filter((p) => p.statut === "present").length,
      en_retard: liste.presences.filter((p) => p.statut === "en_retard").length,
      absent: liste.presences.filter((p) => p.statut === "absent").length,
    };

    return listeStats;
  };

  const handleExport = (liste) => {
    const content = generatePDF(liste);
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `liste_presence_${format(
      new Date(liste.date),
      "yyyy-MM-dd"
    )}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (liste) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste de Présence - ${format(
            new Date(liste.date),
            "dd/MM/yyyy"
          )}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { margin-bottom: 20px; }
            .stats { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste de Présence</h1>
            <p>Date: ${format(new Date(liste.date), "EEEE d MMMM yyyy", {
              locale: fr,
            })}</p>
            <p>Formateur: ${liste.formateur}</p>
            <p>Heure de début: ${format(
              new Date(liste.heureDebut),
              "HH:mm"
            )}</p>
          </div>
          <div class="stats">
            <p>Présents: ${
              liste.presences.filter((p) => p.statut === "present").length
            }</p>
            <p>En retard: ${
              liste.presences.filter((p) => p.statut === "en_retard").length
            }</p>
            <p>Absents: ${
              liste.presences.filter((p) => p.statut === "absent").length
            }</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Statut</th>
                <th>Heure d'arrivée</th>
              </tr>
            </thead>
            <tbody>
              ${liste.presences
                .map(
                  (presence) => `
                <tr>
                  <td>${presence.eleve.nom}</td>
                  <td>${presence.eleve.prenom}</td>
                  <td>${
                    presence.statut === "present"
                      ? "Présent"
                      : presence.statut === "en_retard"
                      ? "En retard"
                      : "Absent"
                  }</td>
                  <td>${
                    presence.heureArrivee
                      ? format(new Date(presence.heureArrivee), "HH:mm")
                      : "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleViewDetails = (liste) => {
    setSelectedListe(liste);
    setDetailsDialogOpen(true);
  };

  const filteredListes = listes.filter((liste) => {
    const matchesSearch =
      liste.formateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liste.presences.some(
        (p) =>
          p.eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDate = selectedDate
      ? format(new Date(liste.date), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesDate;
  });

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tableau de Bord
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Total des présences : {stats.total}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/creer-liste")}
        >
          Nouvelle Liste
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques Globales
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Présents
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.present}
                    <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                      ({((stats.present / stats.total) * 100).toFixed(1)}%)
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    En retard
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.en_retard}
                    <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                      ({((stats.en_retard / stats.total) * 100).toFixed(1)}%)
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Absents
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.absent}
                    <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                      ({((stats.absent / stats.total) * 100).toFixed(1)}%)
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher une liste..."
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
          <Grid item xs={12} md={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={fr}
            >
              <DatePicker
                label="Filtrer par date"
                value={selectedDate}
                onChange={setSelectedDate}
                sx={{ width: "100%" }}
                slotProps={{
                  textField: {
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredListes.map((liste) => {
          const listeStats = calculateListeStats(liste);
          return (
            <Grid item xs={12} md={6} key={liste.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      {format(new Date(liste.date), "EEEE d MMMM yyyy", {
                        locale: fr,
                      })}
                    </Typography>
                    <Box>
                      <Tooltip title="Voir les détails">
                        <IconButton onClick={() => handleViewDetails(liste)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Exporter en PDF">
                        <IconButton onClick={() => handleExport(liste)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Imprimer">
                        <IconButton onClick={() => handlePrint(liste)}>
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    Formateur: {liste.formateur}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Heure de début:{" "}
                    {format(new Date(liste.heureDebut), "HH:mm")}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Tooltip
                      title={`${(
                        (listeStats.present / listeStats.total) *
                        100
                      ).toFixed(1)}% présents`}
                    >
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`${listeStats.present} présents`}
                        color="success"
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip
                      title={`${(
                        (listeStats.en_retard / listeStats.total) *
                        100
                      ).toFixed(1)}% en retard`}
                    >
                      <Chip
                        icon={<WarningIcon />}
                        label={`${listeStats.en_retard} retards`}
                        color="warning"
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip
                      title={`${(
                        (listeStats.absent / listeStats.total) *
                        100
                      ).toFixed(1)}% absents`}
                    >
                      <Chip
                        icon={<CancelIcon />}
                        label={`${listeStats.absent} absents`}
                        color="error"
                        size="small"
                      />
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedListe && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  Liste de présence du{" "}
                  {format(new Date(selectedListe.date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </Typography>
                <Box>
                  <Tooltip title="Exporter en PDF">
                    <IconButton onClick={() => handleExport(selectedListe)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Imprimer">
                    <IconButton onClick={() => handlePrint(selectedListe)}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Formateur: {selectedListe.formateur}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Heure de début:{" "}
                  {format(new Date(selectedListe.heureDebut), "HH:mm")}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${
                      selectedListe.presences.filter(
                        (p) => p.statut === "present"
                      ).length
                    } présents`}
                    color="success"
                  />
                  <Chip
                    icon={<WarningIcon />}
                    label={`${
                      selectedListe.presences.filter(
                        (p) => p.statut === "en_retard"
                      ).length
                    } en retard`}
                    color="warning"
                  />
                  <Chip
                    icon={<CancelIcon />}
                    label={`${
                      selectedListe.presences.filter(
                        (p) => p.statut === "absent"
                      ).length
                    } absents`}
                    color="error"
                  />
                </Stack>
              </Box>

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
                    {selectedListe.presences.map((presence) => (
                      <TableRow key={presence.id}>
                        <TableCell>{presence.eleve.nom}</TableCell>
                        <TableCell>{presence.eleve.prenom}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              presence.statut === "present"
                                ? "Présent"
                                : presence.statut === "en_retard"
                                ? "En retard"
                                : "Absent"
                            }
                            color={getStatutColor(presence.statut)}
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
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Dashboard;
