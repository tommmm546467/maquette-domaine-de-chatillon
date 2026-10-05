/* ============================================================
   DOMAINE DE CHÂTILLON : l'agenda des événements du domaine

   C'est le seul fichier à modifier pour annoncer un événement :
   le domaine le remplit depuis son espace de gestion (gestion/),
   et la page Événements comme l'accueil le lisent.

   Champs d'un événement :
     titre, debut et fin (AAAA-MM-JJ), horaires, lieu, texte, tarif,
     reservation, photo (nom d'une photo de assets/img, sans la taille),
     affiche (facultatif : une affiche à ouvrir en grand),
     lien et lienTexte (facultatifs : un bouton vers une autre page).
   Un événement dont la date de fin est passée se range tout seul
   dans « Déjà passés ».
   ============================================================ */
window.DC_AGENDA = {
  maj: "2026-10-05",
  evenements: [
    {
      id: "evg-evjf-2026",
      titre: "Week-ends EVG, EVJF et team building",
      debut: "2026-03-21",
      fin: "2026-10-15",
      horaires: "Tous les week-ends",
      lieu: "Tout le domaine",
      texte: "Activités (paintball, Go Lanta, babyfoot humain, arc tag), repas, happy hour à la guinguette, soirée animée jusqu'à 1 h 30 avec quiz, blind test, karaoké et DJ, nuit sur place, piscine et jacuzzi en accès libre. Trois formules au choix.",
      tarif: "De 169 à 299 € par personne",
      reservation: "",
      photo: "act-sumo",
      affiche: "",
      lien: "evenements.html#formules",
      lienTexte: "Voir les trois formules"
    },
    {
      id: "noel-2025",
      titre: "La fête des vacances de Noël",
      debut: "2025-12-20",
      fin: "2025-12-20",
      horaires: "De 13 h 30 à 18 h 30",
      lieu: "Au domaine, ouvert à tous",
      texte: "Chasse aux trésors dans la forêt aux lutins (départ à 13 h 30), ateliers créatifs de 15 h à 17 h, gellyball, lettres au Père Noël et lectures de contes, buvette avec vin chaud, crêpes et chocolat chaud. Visite du Père Noël à 17 h 15.",
      tarif: "Ateliers : 5 € par enfant, 7 € par adulte. Gellyball : 10 €",
      reservation: "Réservation obligatoire par SMS au 06 80 14 18 50. Paiement sur place, en espèces ou par chèque.",
      photo: "cerisier-neige",
      affiche: "affiche-noel",
      lien: "",
      lienTexte: ""
    }
  ]
};
