/* ============================================================
   DOMAINE DE CHÂTILLON : affichage de l'agenda
   Lit data/evenements.js (window.DC_AGENDA). Dans la maquette,
   l'espace de gestion enregistre ses modifications dans le
   navigateur (localStorage, clé « dc-agenda-demo ») : si elles
   existent, c'est elles qu'on affiche, avec un bandeau qui le dit.
   Remplit :
     #agenda           la liste de la page Événements (à venir, puis déjà passés)
     #prochain         le prochain rendez-vous sur l'accueil
   ============================================================ */
(function (window, document) {
  'use strict';
  var DC = window.DC = window.DC || {};
  var CLE = 'dc-agenda-demo';
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  DC.racine = document.documentElement.getAttribute('data-racine') || '';

  DC.agendaDemo = function () {
    try {
      var brut = window.localStorage.getItem(CLE);
      if (!brut) return null;
      var d = JSON.parse(brut);
      return d && Array.isArray(d.evenements) ? d : null;
    } catch (e) { return null; }
  };
  DC.agenda = function () {
    var demo = DC.agendaDemo();
    return (demo || window.DC_AGENDA || { evenements: [] }).evenements.slice();
  };
  DC.enregistrerAgenda = function (liste) {
    try {
      window.localStorage.setItem(CLE, JSON.stringify({ maj: new Date().toISOString().slice(0, 10), evenements: liste }));
      return true;
    } catch (e) { return false; }
  };
  DC.oublierAgenda = function () { try { window.localStorage.removeItem(CLE); } catch (e) { /* rien */ } };

  function jour(iso) { return new Date(iso + 'T12:00:00'); }
  function aujourdhui() { var d = new Date(); d.setHours(12, 0, 0, 0); return d; }
  DC.dateLongue = function (iso) {
    return jour(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  DC.periode = function (ev) {
    if (!ev.fin || ev.fin === ev.debut) return DC.dateLongue(ev.debut);
    var a = jour(ev.debut), b = jour(ev.fin);
    var opt = { day: 'numeric', month: 'long' };
    return 'Du ' + a.toLocaleDateString('fr-FR', opt) + (a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : '') +
      ' au ' + b.toLocaleDateString('fr-FR', opt) + ' ' + b.getFullYear();
  };
  DC.etat = function (ev) {
    var t = aujourdhui(), a = jour(ev.debut), b = jour(ev.fin || ev.debut);
    if (b < t) return 'passe';
    if (a <= t) return 'en-cours';
    return 'a-venir';
  };
  DC.photo = function (nom, taille) { return DC.racine + 'assets/img/' + (nom || 'vue-vercors') + '-' + (taille || 800) + '.jpg'; };

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function trier(liste) {
    var avenir = liste.filter(function (e) { return DC.etat(e) !== 'passe'; }).sort(function (a, b) { return a.debut < b.debut ? -1 : 1; });
    var passes = liste.filter(function (e) { return DC.etat(e) === 'passe'; }).sort(function (a, b) { return a.debut < b.debut ? 1 : -1; });
    return { avenir: avenir, passes: passes };
  }
  DC.trierAgenda = trier;

  function carte(ev) {
    var etat = DC.etat(ev);
    var d = jour(ev.debut);
    var etiquette = { 'a-venir': 'À venir', 'en-cours': 'En ce moment', 'passe': 'Déjà passé' }[etat];
    var html = '<article class="rdv' + (etat === 'passe' ? ' rdv--passe' : '') + '" id="ev-' + esc(ev.id) + '">' +
      '<div class="rdv__photo"><img src="' + DC.photo(ev.photo) + '" alt="" loading="lazy" width="800" height="533">' +
      '<p class="rdv__date"><b>' + d.getDate() + '</b><span>' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + '</span></p></div>' +
      '<div class="rdv__corps">' +
      '<span class="rdv__etat' + (etat === 'passe' ? ' rdv__etat--passe' : '') + '">' + etiquette + '</span>' +
      '<h3>' + esc(ev.titre) + '</h3>' +
      '<p class="rdv__infos"><span><svg aria-hidden="true"><use href="#i-calendrier"/></svg>' + esc(DC.periode(ev)) + '</span>' +
      (ev.horaires ? '<span><svg aria-hidden="true"><use href="#i-horloge"/></svg>' + esc(ev.horaires) + '</span>' : '') +
      (ev.lieu ? '<span><svg aria-hidden="true"><use href="#i-repere"/></svg>' + esc(ev.lieu) + '</span>' : '') + '</p>' +
      (ev.texte ? '<p class="rdv__texte">' + esc(ev.texte) + '</p>' : '') +
      (ev.reservation ? '<p class="rdv__infos">' + esc(ev.reservation) + '</p>' : '') +
      '<div class="rdv__pied">' + (ev.tarif ? '<span class="rdv__tarif">' + esc(ev.tarif) + '</span>' : '') +
      (ev.affiche ? '<button type="button" class="lien-fleche" data-grand="' + DC.photo(ev.affiche, 1600) + '" data-legende="Affiche : ' + esc(ev.titre) + '" data-alt="Affiche de l\'événement ' + esc(ev.titre) + '">Voir l\'affiche</button>' : '') +
      (ev.lien && etat !== 'passe' ? '<a class="lien-fleche" href="' + esc(DC.racine + ev.lien) + '">' + esc(ev.lienTexte || 'En savoir plus') + '<svg aria-hidden="true"><use href="#i-fleche"/></svg></a>' : '') +
      '</div></div></article>';
    return html;
  }

  function rendreAgenda(cont) {
    var t = trier(DC.agenda());
    var h = '';
    h += t.avenir.length ? t.avenir.map(carte).join('') :
      '<p class="agenda__vide">Les prochains rendez-vous du domaine seront annoncés ici. En attendant, suivez-nous sur Instagram ou appelez-nous au 06 80 14 18 50.</p>';
    if (t.passes.length) h += '<h3 class="agenda__titre">Déjà passés</h3><div class="agenda">' + t.passes.map(carte).join('') + '</div>';
    cont.innerHTML = h;
    var bandeau = document.getElementById('bandeau-demo');
    if (bandeau) bandeau.hidden = !DC.agendaDemo();
  }

  function rendreProchain(el) {
    var t = trier(DC.agenda());
    var ev = t.avenir[0];
    if (!ev) { el.hidden = true; return; }
    el.querySelector('.prochain__titre').textContent = ev.titre;
    el.querySelector('.prochain__date').textContent = DC.periode(ev) + (ev.horaires ? ' · ' + ev.horaires : '');
    el.querySelector('.prochain__etiquette').textContent = DC.etat(ev) === 'en-cours' ? 'En ce moment au domaine' : 'Prochain rendez-vous';
    el.hidden = false;
  }

  var cont = document.getElementById('agenda');
  if (cont) rendreAgenda(cont);
  var prochain = document.getElementById('prochain');
  if (prochain) rendreProchain(prochain);
  var raz = document.getElementById('agenda-origine');
  if (raz) raz.addEventListener('click', function () { DC.oublierAgenda(); if (cont) rendreAgenda(cont); });
})(window, document);
