/* ============================================================
   main.js — Technical Club Portal
   Handles: theme toggle, mobile nav, events renderer,
            event filter, form validation, scroll reveal,
            toast notifications
   ============================================================ */

"use strict";

/* ── THEME TOGGLE ─────────────────────────────────────────── */
(function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const body = document.body;
  const saved = localStorage.getItem('theme') || 'dark';

  if (saved === 'light') {
    body.classList.add('light');
    if (btn) btn.textContent = '◐ Dark';
  } else {
    if (btn) btn.textContent = '◑ Light';
  }

  if (btn) {
    btn.addEventListener('click', () => {
      body.classList.toggle('light');
      const isLight = body.classList.contains('light');
      btn.textContent = isLight ? '◐ Dark' : '◑ Light';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }
})();

/* ── MOBILE NAV ───────────────────────────────────────────── */
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('nav-drawer');
  if (!hamburger || !drawer) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', drawer.classList.contains('open'));
  });

  // Close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── ACTIVE NAV LINK ──────────────────────────────────────── */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── SCROLL REVEAL ────────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
})();

/* ── EVENTS DATA ──────────────────────────────────────────── */
const eventsData = [
  {
    id: 1,
    title: "Web Dev Bootcamp",
    date: "April 20, 2026",
    description: "A hands-on intensive covering HTML5, CSS3, and JavaScript fundamentals. Build responsive projects from scratch.",
    category: "upcoming",
    tag: "Workshop"
  },
  {
    id: 2,
    title: "Hack-CSE Hackathon 5.0",
    date: "May 10–11, 2026",
    description: "48-hour hackathon. Form teams of 2–4, solve real-world problems, and compete for prizes worth ₹50,000.",
    category: "upcoming",
    tag: "Hackathon"
  },
  {
    id: 3,
    title: "Open Source 101",
    date: "May 28, 2026",
    description: "Learn how to contribute to open source projects. We'll walk through Git workflows, PRs, and issue tracking.",
    category: "upcoming",
    tag: "Workshop"
  },
  {
    id: 4,
    title: "AI/ML Study Circle",
    date: "March 15, 2026",
    description: "Weekly meetup covering neural networks, scikit-learn, and building your first ML pipeline.",
    category: "past",
    tag: "Study Circle"
  },
  {
    id: 5,
    title: "CP Contest — Round 3",
    date: "February 22, 2026",
    description: "Competitive programming contest on Codeforces. Problems ranging from Div 3 to Div 1 difficulty.",
    category: "past",
    tag: "Contest"
  },
  {
    id: 6,
    title: "Tech Talk: System Design",
    date: "January 30, 2026",
    description: "Guest lecture by a Senior SDE from a product company on designing scalable distributed systems.",
    category: "past",
    tag: "Talk"
  }
];

/* ── EVENTS RENDERER ──────────────────────────────────────── */
function renderEvents(filter) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? eventsData
    : eventsData.filter(e => e.category === filter);

  grid.innerHTML = filtered.map(ev => `
    <article class="event-card reveal" data-category="${ev.category}" id="event-${ev.id}">
      <span class="event-date">${ev.date}</span>
      <h3>${ev.title}</h3>
      <p>${ev.description}</p>
      <div class="event-footer">
        <span class="badge">${ev.tag}</span>
        <a href="contact.html" class="btn btn-sm">Register →</a>
      </div>
    </article>
  `).join('');

  // Re-run scroll reveal for newly injected cards
  const newEls = grid.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  newEls.forEach(el => observer.observe(el));
}

/* ── EVENT FILTER ─────────────────────────────────────────── */
(function initEventFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  renderEvents('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEvents(btn.dataset.filter);
    });
  });
})();

/* ── TOAST ────────────────────────────────────────────────── */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── FORM VALIDATION ──────────────────────────────────────── */
(function initFormValidation() {
  const form = document.getElementById('join-form');
  if (!form) return;

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRx = /^\d{10}$/;

  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-err');
    if (field)  field.classList.add('error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById(fieldId + '-err');
    if (field)  field.classList.remove('error');
    if (errEl)  errEl.classList.remove('visible');
  }

  // Real-time validation on blur
  ['full-name', 'email', 'phone', 'year-section'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => clearError(id));
    el.addEventListener('blur',  () => validateField(id));
  });

  function validateField(id) {
    const val = (document.getElementById(id)?.value || '').trim();
    if (id === 'full-name') {
      if (!val) return showError(id, 'Name is required.');
    }
    if (id === 'email') {
      if (!val) return showError(id, 'Email is required.');
      if (!emailRx.test(val)) return showError(id, 'Enter a valid email address.');
    }
    if (id === 'phone') {
      if (!val) return showError(id, 'Phone number is required.');
      if (!phoneRx.test(val)) return showError(id, 'Enter a valid 10-digit phone number.');
    }
    if (id === 'year-section') {
      if (!val) return showError(id, 'Please select your year and section.');
    }
    clearError(id);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;

    // Validate all required text fields
    ['full-name', 'email', 'phone', 'year-section'].forEach(id => {
      const val = (document.getElementById(id)?.value || '').trim();
      let ok = true;
      if (id === 'full-name' && !val) { showError(id, 'Name is required.'); ok = false; }
      if (id === 'email') {
        if (!val) { showError(id, 'Email is required.'); ok = false; }
        else if (!emailRx.test(val)) { showError(id, 'Enter a valid email address.'); ok = false; }
      }
      if (id === 'phone') {
        if (!val) { showError(id, 'Phone number is required.'); ok = false; }
        else if (!phoneRx.test(val)) { showError(id, 'Enter a valid 10-digit phone number.'); ok = false; }
      }
      if (id === 'year-section' && !val) { showError(id, 'Please select your year and section.'); ok = false; }
      if (!ok) valid = false;
    });

    // At least one interest
    const interests = form.querySelectorAll('input[name="interest"]:checked');
    const interestErr = document.getElementById('interest-err');
    if (interests.length === 0) {
      if (interestErr) { interestErr.textContent = 'Select at least one area of interest.'; interestErr.classList.add('visible'); }
      valid = false;
    } else {
      if (interestErr) interestErr.classList.remove('visible');
    }

    if (valid) {
      showToast('✓ Application submitted successfully!');
      form.reset();
    }
  });
})();
