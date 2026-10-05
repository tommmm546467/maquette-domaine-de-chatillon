/* ============================================================
   DOMAINE DE CHÂTILLON : comportements communs aux pages
   1. En-tête (transparent sur la vidéo ou la photo d'en-tête, blanc ensuite) et menu mobile
   2. Vidéo du hero de l'accueil (boucle muette, repartie du début quand le rideau se lève)
   3. Visionneuse plein écran (vignettes, galeries, affiches)
   4. Film YouTube chargé au clic (youtube-nocookie), dans une fenêtre ou dans son cadre
   5. Formulaires de demande : vérification, puis e-mail préparé
   6. Apparitions au défilement, barre d'appel mobile, sous-navigation active
   7. Carrousel des hébergements de l'accueil (flèches, barre de progression)
   Aucun framework, aucune dépendance.
   ============================================================ */
(function (window, document) {
  'use strict';
  var DC = window.DC = window.DC || {};
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  DC.$ = $; DC.$$ = $$;

  /* ---------- 1. En-tête et menu mobile ---------- */
  var entete = $('#entete');
  var tete = $('.hero') || $('.bandeau');
  function majEntete() {
    if (!entete) return;
    if (!tete) { entete.setAttribute('data-etat', 'plein'); return; }
    var seuil = tete.offsetHeight - entete.offsetHeight - 40;
    var menuOuvert = document.body.classList.contains('menu-ouvert');
    entete.setAttribute('data-etat', (window.scrollY > seuil || menuOuvert) ? 'plein' : 'transparent');
  }
  window.addEventListener('scroll', majEntete, { passive: true });
  window.addEventListener('resize', majEntete);
  majEntete();

  var burger = $('#burger');
  var navMobile = $('#nav-mobile');
  function basculerMenu(ouvrir) {
    if (!burger || !navMobile) return;
    var o = typeof ouvrir === 'boolean' ? ouvrir : burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
    navMobile.classList.toggle('est-ouvert', o);
    document.body.classList.toggle('menu-ouvert', o);
    document.body.style.overflow = o ? 'hidden' : '';
    majEntete();
  }
  if (burger) burger.addEventListener('click', function () { basculerMenu(); });
  $$('#nav-mobile a').forEach(function (a) { a.addEventListener('click', function () { basculerMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') basculerMenu(false); });

  /* ---------- 2. Vidéo du hero ---------- */
  // La boucle joue d'elle-même (autoplay, muted, playsinline). Elle repart du premier plan quand le
  // rideau de l'écran d'entrée se lève ; elle reste sur son affiche si le système demande moins
  // d'animations, et se met en pause quand l'onglet est caché.
  var video = $('.hero__video');
  if (video) {
    if (reduit) { video.removeAttribute('autoplay'); video.pause(); }
    else {
      var relancer = function () { try { video.currentTime = 0; } catch (e) { } var p = video.play(); if (p && p.catch) p.catch(function () { }); };
      if (!DC.rideauParti) document.addEventListener('dc:rideau-sortie', relancer, { once: true });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) video.pause();
        else { var p = video.play(); if (p && p.catch) p.catch(function () { }); }
      });
    }
  }

  /* ---------- 3. Visionneuse ---------- */
  var vis = $('#visionneuse');
  var visImg = vis && $('.visionneuse__scene img', vis);
  var visLeg = vis && $('.visionneuse__legende', vis);
  var visCpt = vis && $('.visionneuse__compteur', vis);
  var serie = [], pos = 0;
  function afficher(i) {
    pos = (i + serie.length) % serie.length;
    var el = serie[pos];
    visImg.src = el.getAttribute('data-grand');
    visImg.alt = el.getAttribute('data-alt') || '';
    visLeg.textContent = el.getAttribute('data-legende') || '';
    visCpt.textContent = serie.length > 1 ? (pos + 1) + ' / ' + serie.length : '';
    $('.visionneuse__prec', vis).hidden = $('.visionneuse__suiv', vis).hidden = serie.length < 2;
  }
  DC.ouvrirVisionneuse = function (el) {
    if (!vis || typeof vis.showModal !== 'function') return;
    var groupe = el.getAttribute('data-serie');
    serie = groupe ? $$('[data-grand][data-serie="' + groupe + '"]') : [el];
    afficher(Math.max(0, serie.indexOf(el)));
    vis.showModal();
    document.body.style.overflow = 'hidden';
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-grand]');
    if (!el) return;
    e.preventDefault();
    DC.ouvrirVisionneuse(el);
  });
  if (vis) {
    $('.visionneuse__prec', vis).addEventListener('click', function () { afficher(pos - 1); });
    $('.visionneuse__suiv', vis).addEventListener('click', function () { afficher(pos + 1); });
    $('.visionneuse__fermer', vis).addEventListener('click', function () { vis.close(); });
    vis.addEventListener('close', function () { document.body.style.overflow = ''; });
    vis.addEventListener('click', function (e) { if (e.target === vis || e.target.classList.contains('visionneuse__scene')) vis.close(); });
    vis.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') afficher(pos - 1);
      if (e.key === 'ArrowRight') afficher(pos + 1);
    });
    var x0 = null;
    vis.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    vis.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) afficher(pos + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- 4. Film YouTube ---------- */
  var film = $('#film');
  function iframeFilm(b) {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-video') + '?autoplay=1&rel=0&modestbranding=1';
    f.title = b.getAttribute('data-titre') || 'Vidéo';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    return f;
  }
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cadre = b.closest('.video__cadre');
      if (cadre) { cadre.appendChild(iframeFilm(b)); b.remove(); return; }
      if (!film || typeof film.showModal !== 'function') { window.open('https://www.youtube.com/watch?v=' + b.getAttribute('data-video'), '_blank', 'noopener'); return; }
      $('.film__cadre', film).appendChild(iframeFilm(b));
      if (video) video.pause();
      film.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  if (film) {
    $('.film__fermer', film).addEventListener('click', function () { film.close(); });
    film.addEventListener('click', function (e) { if (e.target === film) film.close(); });
    film.addEventListener('close', function () {
      $('.film__cadre', film).innerHTML = '';
      document.body.style.overflow = '';
      if (video && !reduit) { var p = video.play(); if (p && p.catch) p.catch(function () { }); }
    });
  }

  /* ---------- 5. Formulaires de demande ---------- */
  // Une adresse peut préremplir le formulaire : contact.html?hebergement=douglas, evenements.html?type=mariage#demande
  var params = new URLSearchParams(window.location.search);
  params.forEach(function (valeur, cle) {
    $$('form[data-formulaire] [name="' + cle + '"]').forEach(function (c) {
      if (c.type === 'checkbox' || c.type === 'radio') { if (c.value === valeur) c.checked = true; }
      else c.value = valeur;
    });
  });
  $$('[data-prerempli]').forEach(function (a) {
    a.addEventListener('click', function () {
      var p = a.getAttribute('data-prerempli').split('=');
      $$('form[data-formulaire] [name="' + p[0] + '"]').forEach(function (c) {
        if (c.type === 'checkbox' || c.type === 'radio') { if (c.value === p[1]) c.checked = true; } else c.value = p[1];
      });
    });
  });
  $$('input[type="date"]').forEach(function (c) {
    var d = new Date(); d.setDate(d.getDate() + 1);
    if (!c.min) c.min = d.toISOString().slice(0, 10);
  });

  function libelle(champ) {
    var l = champ.getAttribute('data-libelle');
    if (l) return l;
    var lab = champ.id && $('label[for="' + champ.id + '"]');
    return lab ? lab.textContent.replace(/\s+/g, ' ').replace(/\(.*?\)/g, '').trim() : champ.name;
  }

  $$('form[data-formulaire]').forEach(function (form) {
    var erreurs = $('.formulaire__erreurs', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var manque = [];
      $$('.champ', form).forEach(function (c) { c.removeAttribute('aria-invalid'); });
      $$('[required]', form).forEach(function (c) {
        if (!c.value.trim() || !c.checkValidity()) { c.setAttribute('aria-invalid', 'true'); manque.push(c.getAttribute('data-manque') || libelle(c).toLowerCase()); }
      });
      var tel = $('[name="telephone"]', form);
      if (tel && tel.value.trim() && !/^[0-9 +().-]{8,}$/.test(tel.value.trim())) { tel.setAttribute('aria-invalid', 'true'); manque.push('un téléphone valide'); }
      var nb = $('[name="personnes"]', form);
      if (nb && nb.value && (+nb.value < 1 || +nb.value > 400)) { nb.setAttribute('aria-invalid', 'true'); manque.push('un nombre de personnes entre 1 et 400'); }
      if (manque.length) {
        var liste = manque.length > 1 ? manque.slice(0, -1).join(', ') + ' et ' + manque[manque.length - 1] : manque[0];
        erreurs.textContent = 'Il manque ' + liste + ' pour que le domaine puisse vous répondre.';
        erreurs.hidden = false;
        var premier = $('[aria-invalid="true"]', form); if (premier) premier.focus();
        return;
      }
      erreurs.hidden = true;
      // Aucun service d'envoi n'est branché sur la maquette : on prépare l'e-mail.
      var lignes = [], vus = {};
      $$('input, select, textarea', form).forEach(function (c) {
        if (!c.name || vus[c.name] || c.type === 'submit') return;
        var valeur;
        if (c.type === 'checkbox' || c.type === 'radio') {
          vus[c.name] = true;
          valeur = $$('[name="' + c.name + '"]:checked', form).map(function (x) { return x.getAttribute('data-libelle') || x.value; }).join(', ');
          if (valeur) lignes.push((form.querySelector('[data-groupe="' + c.name + '"]') || {}).textContent + ' : ' + valeur);
          return;
        }
        valeur = c.tagName === 'SELECT' ? (c.value ? c.options[c.selectedIndex].text : '') : c.value.trim();
        if (c.type === 'date' && valeur) valeur = new Date(valeur + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        if (valeur && c.name !== 'message') lignes.push(libelle(c) + ' : ' + valeur);
      });
      var message = $('[name="message"]', form);
      var corps = 'Bonjour,\n\n' + (message && message.value.trim() ? message.value.trim() + '\n\n' : '') + lignes.join('\n');
      var sujet = form.getAttribute('data-sujet') || 'Demande depuis le site';
      var precision = $('[data-dans-sujet]', form);
      if (precision && precision.value) sujet += ' : ' + (precision.tagName === 'SELECT' ? precision.options[precision.selectedIndex].text : precision.value);
      window.location.href = 'mailto:' + form.getAttribute('data-destinataire') + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
      form.hidden = true;
      var merci = document.getElementById(form.getAttribute('data-merci'));
      if (merci) merci.hidden = false;
    });
  });

  /* ---------- 6. Apparitions, barre d'appel, sous-navigation ---------- */
  var aVoir = $$('.apparait');
  if ('IntersectionObserver' in window && !reduit) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('est-vu'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });
    aVoir.forEach(function (el) { io.observe(el); });
  } else {
    aVoir.forEach(function (el) { el.classList.add('est-vu'); });
  }

  var barre = $('#barre-appel');
  var zoneContact = $('[data-sans-barre]');
  function majBarre() {
    if (!barre) return;
    var apres = window.scrollY > (tete ? tete.offsetHeight * .6 : 300);
    var r = zoneContact && zoneContact.getBoundingClientRect();
    var dans = r && r.top < window.innerHeight * .6 && r.bottom > 0;
    barre.classList.toggle('est-visible', apres && !dans);
  }
  window.addEventListener('scroll', majBarre, { passive: true });
  majBarre();

  var liens = $$('.sous-nav a[href^="#"]');
  var cibles = liens.map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); });
  function majSousNav() {
    var y = window.scrollY + window.innerHeight * .3, actif = -1;
    cibles.forEach(function (s, i) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) actif = i; });
    liens.forEach(function (l, i) {
      if (i === actif) {
        if (l.getAttribute('aria-current') !== 'true') { l.setAttribute('aria-current', 'true'); if (l.scrollIntoView && window.innerWidth < 900) l.parentNode.parentNode.scrollLeft = l.offsetLeft - 16; }
      } else l.removeAttribute('aria-current');
    });
  }
  if (liens.length) { window.addEventListener('scroll', majSousNav, { passive: true }); majSousNav(); }

  /* ---------- 7. Carrousel des hébergements ---------- */
  // Une ligne de cartes qui défile (défilement natif et aimanté) ; les flèches avancent d'une carte.
  $$('.carrousel__piste').forEach(function (piste) {
    var boutons = $$('[data-carrousel][aria-controls="' + piste.id + '"]');
    var barre = $('.carrousel__progression span', piste.parentNode);
    function pas() {
      var carte = piste.firstElementChild;
      var ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
      return carte ? carte.getBoundingClientRect().width + ecart : piste.clientWidth;
    }
    function maj() {
      var max = piste.scrollWidth - piste.clientWidth;
      boutons.forEach(function (b) {
        b.disabled = b.getAttribute('data-carrousel') === 'prec' ? piste.scrollLeft <= 2 : piste.scrollLeft >= max - 2;
      });
      if (barre && piste.scrollWidth) {
        barre.style.setProperty('--part', (piste.clientWidth / piste.scrollWidth * 100) + '%');
        barre.style.setProperty('--decalage', (piste.scrollLeft / piste.scrollWidth * 100) + '%');
      }
    }
    boutons.forEach(function (b) {
      b.addEventListener('click', function () {
        piste.scrollBy({ left: (b.getAttribute('data-carrousel') === 'prec' ? -1 : 1) * pas(), behavior: reduit ? 'auto' : 'smooth' });
      });
    });
    piste.addEventListener('scroll', maj, { passive: true });
    window.addEventListener('resize', maj);
    piste.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); piste.scrollBy({ left: (e.key === 'ArrowLeft' ? -1 : 1) * pas() }); }
    });
    maj();
  });
})(window, document);
