-- CreateTable
CREATE TABLE "liste" (
    "id_liste" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date_du_jour" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formateur" TEXT NOT NULL DEFAULT 'coach wilfrid',
    "nom_prenom" TEXT NOT NULL,
    "heure_arriveer" TEXT NOT NULL,
    "signature" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "liste_signature_key" ON "liste"("signature");
