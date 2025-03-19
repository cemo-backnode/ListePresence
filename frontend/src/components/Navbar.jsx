import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gestion des Présences
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Tableau de bord">
            <IconButton color="inherit" component={RouterLink} to="/">
              <DashboardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Liste des élèves">
            <IconButton color="inherit" component={RouterLink} to="/eleves">
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Créer une liste">
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/creer-liste"
            >
              <AssignmentIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
