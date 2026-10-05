/* ============================================================
   DOMAINE DE CHÂTILLON : écran d'entrée de l'accueil
   Repris des maquettes d'hébergement d'OBT :
   un calque décoratif, pas un écran de préchargement. Le contenu est
   déjà dans la page derrière lui : aucune pénalité pour le référencement.

   Il s'affiche deux secondes à chaque chargement de l'accueil, puis
   coulisse vers le haut. Il est sauté quand le système demande moins
   d'animations. Si l'adresse porte une ancre (#avis…), on y repositionne
   la page une fois le rideau retiré.
   ============================================================ */
(function (window, document) {
  'use strict';
  var DC = window.DC = window.DC || {};

  var DUREE = 2000;         // durée d'affichage : 2 secondes
  var DUREE_RIDEAU = 1000;  // doit correspondre à --t-rideau

  var racine = document.documentElement;
  var loader = document.getElementById('loader');
  // « hero-pret » lance l'entrée du texte du hero (site.css, section 7)
  if (!loader) { DC.rideauParti = true; racine.classList.add('hero-pret'); return; }

  function retirer() {
    if (!loader || !loader.parentNode) return;
    loader.parentNode.removeChild(loader);
    document.body.classList.remove('est-verrouille');
    loader = null;
    racine.classList.add('hero-pret');
    var id = window.location.hash.slice(1);
    var cible = id && document.getElementById(id);
    if (cible) cible.scrollIntoView({ block: 'start' });
    // Signal de fin pour les scripts qui attendent que le rideau soit retiré.
    DC.rideauParti = true;
    document.dispatchEvent(new CustomEvent('dc:rideau-parti'));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { retirer(); return; }

  document.body.classList.add('est-verrouille');
  var parti = false;
  function sortir() {
    if (parti || !loader) return;
    parti = true;
    loader.setAttribute('data-sortie', '1');
    racine.classList.add('hero-pret');
    // La vidéo du hero attend ce signal pour repartir de son premier plan pendant que le rideau monte.
    document.dispatchEvent(new CustomEvent('dc:rideau-sortie'));
    window.setTimeout(retirer, DUREE_RIDEAU);
  }
  window.setTimeout(sortir, DUREE);
  // Retour arrière servi depuis le cache : le minuteur a pu ne pas repartir.
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) retirer(); });
})(window, document);
