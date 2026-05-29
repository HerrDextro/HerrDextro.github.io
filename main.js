/* ═══════════════════════════════════════════════
   main.js — Portfolio JavaScript
   ─────────────────────────────────────────────
   Sections:
   1.  Project data
   2.  Tab switching
   3.  Card rendering
   4.  Modal open / close
   ═══════════════════════════════════════════════ */


/* ─── 1. PROJECT DATA ──────────────────────────────────────────
   Each object here creates one card.

   Fields:
     key      — matches the id="detail-KEY" block in index.html
     tab      — which tab shows this card: 'software' | 'hardware' | 'agentic'
     category — CSS class applied to the category label on the card
                 'software' → orange  |  'hardware' → green  |  'agentic' → amber
     catLabel — text shown as the category label on the card
     title    — project name
     desc     — one-line description shown on the card
     tech     — array of tech tags shown on the card

   To add a new project:
     1. Add an entry here
     2. Add a matching <div class="project-detail" id="detail-YOURKEY" hidden>
        block in the "PROJECT DETAIL BLOCKS" section of index.html
   ─────────────────────────────────────────────────────────────── */

const PROJECTS = [
  // ── SOFTWARE ────────────────────────────────
  {
    key:      's23bucket',
    tab:      'software',
    category: 'software',
    catLabel: 'Built from scratch',
    title:    's23bucket',
    desc:     'A simple containerised file bucketing application built with ASP.NET and optimised for running on a private Raspberry Pi 4 server with SSD and HDD.',
    tech:     ['C#', 'ASP.NET', 'MongoDB', 'Docker']
  },

  // ── HARDWARE ─────────────────────────────────
  {
    key:      'hexacopter',
    tab:      'hardware',
    category: 'hardware',
    catLabel: 'Hardware',
    title:    'Hexacopter Drone development platform',
    desc:     'Modular Hexacopter fpatform for developing drone software/hardware',
    tech:     ['Ardupilot', 'Raspberry Pi', 'Python', 'Linux', 'RF'],
  },

  // ── AGENTIC ──────────────────────────────────
  {
    key:      'nexus-os',
    tab:      'agentic',
    category: 'agentic',
    catLabel: 'Proof of concept',
    title:    'Nexus OS',
    desc:     'A centralised dashboard for managing projects, APIs, and documentation with AI integration.',
    tech:     ['Python', 'LangChain', 'Claude API'],
  },
  {
    key:      'quotli',
    tab:      'agentic',
    category: 'agentic',
    catLabel: 'Proof of concept',
    title:    'quotli.ch',
    desc:     'AI-powered quote creation and sending platform.',
    tech:     ['OpenCode','Supabase', 'Vercel', 'Clerk', 'Tailwind CSS', 'TS'],
  },
];


/* ─── 2. TAB SWITCHING ─────────────────────────── */

const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {

    // Remove active state from all buttons
    tabButtons.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    // Set active state on the clicked button
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Render cards for the selected tab
    renderCards(btn.dataset.tab);
  });
});


/* ─── 3. CARD RENDERING ────────────────────────── */

function renderCards(tab) {
  const grid = document.getElementById('cards-grid');

  // Filter projects to only those matching the selected tab
  const visible = PROJECTS.filter(function (p) {
    return p.tab === tab;
  });

  // Build the HTML for each card
  grid.innerHTML = visible.map(function (project) {
    return (
      '<div class="project-card" data-key="' + project.key + '" ' +
            'role="button" tabindex="0" ' +
            'aria-label="Open ' + project.title + '">' +
        '<span class="card-category ' + project.category + '">' + project.catLabel + '</span>' +
        '<h3 class="card-title">' + project.title + '</h3>' +
        '<p class="card-desc">' + project.desc + '</p>' +
        '<div class="card-tech">' +
          project.tech.map(function (t) {
            return '<span class="tag">' + t + '</span>';
          }).join('') +
        '</div>' +
        '<span class="card-arrow">↗</span>' +
      '</div>'
    );
  }).join('');

  // Attach open-modal handlers to the freshly created cards
  grid.querySelectorAll('.project-card').forEach(function (card) {
    // Click
    card.addEventListener('click', function () {
      openModal(card.dataset.key);
    });
    // Keyboard (Enter or Space) for accessibility
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.key);
      }
    });
  });
}

// Render the default tab on page load
renderCards('software');


/* ─── 4. MODAL ─────────────────────────────────── */

var overlay   = document.getElementById('modal-overlay');
var modalBody = document.getElementById('modal-body');
var closeBtn  = document.getElementById('modal-close');

function openModal(key) {
  // Find the matching hidden detail block by id
  var source = document.getElementById('detail-' + key);

  if (!source) {
    console.warn('openModal: no element found with id "detail-' + key + '"');
    return;
  }

  // Copy its inner HTML into the visible modal body
  modalBody.innerHTML = source.innerHTML;

  // Show the overlay
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden'; // prevent background scroll

  // Move keyboard focus to the close button
  closeBtn.focus();
}

function closeModal() {
  overlay.setAttribute('hidden', '');
  document.body.style.overflow = ''; // restore background scroll
  modalBody.innerHTML = '';          // clear content
}

// Close via the X button
closeBtn.addEventListener('click', closeModal);

// Close by clicking anywhere on the dark overlay (outside the modal box)
overlay.addEventListener('click', function (e) {
  if (e.target === overlay) {
    closeModal();
  }
});

// Close with the Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});
