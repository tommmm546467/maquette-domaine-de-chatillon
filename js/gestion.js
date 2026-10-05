/* ============================================================
   DOMAINE DE CHÂTILLON : espace de gestion de l'agenda (démonstration)
   Le domaine ajoute, modifie ou retire un événement ; la page
   Événements et l'accueil l'affichent aussitôt.
   Dans la maquette, l'enregistrement se fait dans ce navigateur
   (localStorage) : rien ne part sur Internet. Dans la version
   livrée, l'espace est protégé par un mot de passe et publie le
   fichier data/evenements.js pour tous les visiteurs.
   ============================================================ */
(function (window, document) {
  'use strict';
  var DC = window.DC;
  var form = document.getElementById('form-ev');
  var liste = document.getElementById('liste-ev');
  var toast = document.getElementById('toast');
  var titreForm = document.getElementById('titre-form');
  var annuler = document.getElementById('annuler-edition');
  var enEdition = null;

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function montrerToast(t) {
    toast.textContent = t;
    toast.classList.add('est-visible');
    window.clearTimeout(montrerToast.m);
    montrerToast.m = window.setTimeout(function () { toast.classList.remove('est-visible'); }, 3200);
  }

  function rendreListe() {
    var t = DC.trierAgenda(DC.agenda());
    var tout = t.avenir.concat(t.passes);
    liste.innerHTML = tout.length ? tout.map(function (ev) {
      var etat = { 'a-venir': 'À venir', 'en-cours': 'En ce moment', 'passe': 'Passé' }[DC.etat(ev)];
      return '<div class="ligne-ev" data-id="' + esc(ev.id) + '"><img src="' + DC.photo(ev.photo) + '" alt="">' +
        '<div><strong>' + esc(ev.titre) + '</strong><small>' + esc(DC.periode(ev)) + ' · ' + etat + '</small></div>' +
        '<div class="ligne-ev__actions"><button type="button" class="modifier">Modifier</button><button type="button" class="supprimer">Retirer</button></div></div>';
    }).join('') : '<p class="gestion__aide">Aucun événement pour le moment.</p>';
    document.getElementById('etat-agenda').textContent = DC.agendaDemo() ?
      'Agenda modifié dans cette démonstration.' : 'Agenda d\'origine du site.';
  }

  function remplir(ev) {
    ['titre', 'debut', 'fin', 'horaires', 'lieu', 'texte', 'tarif', 'reservation'].forEach(function (k) { form.elements[k].value = ev ? (ev[k] || '') : ''; });
    var photo = ev && ev.photo ? ev.photo : 'vue-vercors';
    var r = form.querySelector('input[name="photo"][value="' + photo + '"]') || form.querySelector('input[name="photo"]');
    r.checked = true;
  }

  liste.addEventListener('click', function (e) {
    var ligne = e.target.closest('.ligne-ev');
    if (!ligne) return;
    var id = ligne.getAttribute('data-id');
    var tout = DC.agenda();
    var ev = tout.filter(function (x) { return x.id === id; })[0];
    if (e.target.classList.contains('modifier')) {
      enEdition = id;
      remplir(ev);
      titreForm.textContent = 'Modifier l\'événement';
      annuler.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.elements.titre.focus({ preventScroll: true });
    }
    if (e.target.classList.contains('supprimer')) {
      if (!window.confirm('Retirer « ' + ev.titre + ' » de l\'agenda ?')) return;
      DC.enregistrerAgenda(tout.filter(function (x) { return x.id !== id; }));
      rendreListe();
      montrerToast('Événement retiré de l\'agenda');
    }
  });

  annuler.addEventListener('click', function () {
    enEdition = null; remplir(null); titreForm.textContent = 'Ajouter un événement'; annuler.hidden = true;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var erreurs = document.getElementById('erreurs-ev');
    var manque = [];
    [f.titre, f.debut].forEach(function (c) { c.removeAttribute('aria-invalid'); if (!c.value.trim()) { c.setAttribute('aria-invalid', 'true'); manque.push(c === f.titre ? 'le titre' : 'la date'); } });
    if (f.fin.value && f.debut.value && f.fin.value < f.debut.value) { f.fin.setAttribute('aria-invalid', 'true'); manque.push('une date de fin après la date de début'); }
    if (manque.length) { erreurs.textContent = 'Il manque ' + manque.join(' et ') + '.'; erreurs.hidden = false; return; }
    erreurs.hidden = true;
    var ev = {
      id: enEdition || ('ev-' + Date.now().toString(36)),
      titre: f.titre.value.trim(), debut: f.debut.value, fin: f.fin.value || f.debut.value,
      horaires: f.horaires.value.trim(), lieu: f.lieu.value.trim(), texte: f.texte.value.trim(),
      tarif: f.tarif.value.trim(), reservation: f.reservation.value.trim(),
      photo: (form.querySelector('input[name="photo"]:checked') || {}).value || 'vue-vercors',
      affiche: '', lien: '', lienTexte: ''
    };
    var tout = DC.agenda();
    if (enEdition) {
      tout = tout.map(function (x) { return x.id === enEdition ? Object.assign({}, x, ev, { affiche: x.affiche, lien: x.lien, lienTexte: x.lienTexte }) : x; });
    } else tout.push(ev);
    if (!DC.enregistrerAgenda(tout)) { erreurs.textContent = 'Ce navigateur refuse l\'enregistrement (navigation privée ?).'; erreurs.hidden = false; return; }
    montrerToast(enEdition ? 'Modification publiée sur la page Événements' : 'Événement publié sur la page Événements');
    enEdition = null; remplir(null); titreForm.textContent = 'Ajouter un événement'; annuler.hidden = true;
    rendreListe();
  });

  document.getElementById('revenir-origine').addEventListener('click', function () {
    if (!window.confirm('Revenir à l\'agenda d\'origine et effacer les modifications de cette démonstration ?')) return;
    DC.oublierAgenda(); rendreListe(); montrerToast('Agenda d\'origine rétabli');
  });

  remplir(null);
  rendreListe();
})(window, document);
