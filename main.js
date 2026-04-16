/* ================================================================
   PORTFOLIO — ESTEBAN GALARZA INGA
   main.js — Toda la lógica interactiva
================================================================ */

/* ================================================================
   1. INICIALIZACIÓN DE ÍCONOS LUCIDE
   Reemplaza los elementos <i data-lucide="..."> con SVGs reales
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza todos los íconos Lucide de la página
  if (window.lucide) lucide.createIcons();

  // Arrancar todos los módulos
  initCursor();
  initNavbar();
  initScrollReveal();
  initTypewriter();
  renderProjects();
  initCounters();
  initFilterBtns();
  initModal();
  initBgCanvas();
  initMagneticBtns();
  initHamburger();
});

/* ================================================================
   2. CURSOR PERSONALIZADO
   El punto sigue el ratón con posición exacta.
   El anillo sigue con un pequeño retraso (lerp).
================================================================ */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  // Posición actual del ratón
  let mx = 0, my = 0;
  // Posición del anillo (con lag)
  let rx = 0, ry = 0;

  // Actualizar posición del ratón en tiempo real
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // El punto pequeño sigue exactamente al mouse
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  // Loop de animación: el anillo se mueve con inercia (lerp)
  function animateRing() {
    // Interpolación lineal: mueve el anillo 12% hacia el cursor cada frame
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // El anillo crece al pasar sobre elementos interactivos
  const interactives = 'a, button, [data-hover], .project-card, .social-btn';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

/* ================================================================
   3. NAVBAR — scroll activo + link activo por sección
================================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  // Agrega clase .scrolled cuando se hace scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveLink();
  }, { passive: true });

  // Resaltar el link de la sección actualmente visible
  function highlightActiveLink() {
    let current = '';
    document.querySelectorAll('section[id]').forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  // Scroll suave al hacer clic en los links del nav
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      scrollTo(link.dataset.section);
      // Cerrar menú móvil si está abierto
      closeMobileMenu();
    });
  });
}

/* ================================================================
   4. SCROLL TO — función global usada por botones del hero
================================================================ */
function scrollTo(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================================================================
   5. ANIMACIONES DE ENTRADA (Reveal on Scroll)
   Usa IntersectionObserver para agregar .visible cuando el
   elemento entra en el viewport
================================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // No observar más: la animación solo ocurre una vez
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ================================================================
   6. TYPEWRITER — texto animado en el hero
   Cicla por un arreglo de frases con efecto de escritura y borrado
================================================================ */
function initTypewriter() {
  const el = document.getElementById('typedText');
  if (!el) return;

  // Frases que se van a mostrar en ciclo
  const phrases = [
    'aplicaciones web modernas.',
    'interfaces de usuario.',
    'APIs y backends robustos.',
    'soluciones full stack.',
    'proyectos académicos.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      // Escribiendo: agregar un carácter
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        // Pausa antes de borrar
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 60);
    } else {
      // Borrando: quitar un carácter
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 30);
    }
  }

  setTimeout(tick, 1000);
}

/* ================================================================
   7. DATOS DE PROYECTOS — 16 semanas
   Cada objeto: week, title, desc, techs, cat (para filtros)
   cat puede ser: "frontend" | "backend" | "fullstack"
================================================================ */
const PROJECTS = [
  {
    week: 'Semana 1',
    title: 'Arquitectura de Web',
    desc: 'Landing page estática con HTML y CSS puro, enfocada en presentación personal y diseño responsive.',
    techs: ['HTML', 'CSS', 'JavaScript'],
    cat: 'frontend',
  },
  {
    week: 'Semana 2',
    title: 'Modelado de Datos​',
    desc: '.Es el proceso que se aplica para crear una representación grafica de la visión que tienen los usuarios de los datos​',
    techs: ['DIA', 'MySql'],
    cat: ' ',
  },
  {
    week: 'Semana 3',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 4',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 5',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 6',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 7',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 8',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 9',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 10',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 11',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 12',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 13',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 14',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 15',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
  {
    week: 'Semana 16',
    title: '',
    desc: '.',
    techs: ['', '', ''],
    cat: ' ',
  },
];

/* ================================================================
   8. RENDERIZAR TARJETAS DE PROYECTOS EN EL DOM
================================================================ */
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const grouped = PROJECTS.reduce((acc, p) => {
    const weekNumber = parseInt(p.week.replace(/\D/g, ''), 10);
    const unitNumber = Math.ceil(weekNumber / 4);
    if (!acc[unitNumber]) acc[unitNumber] = [];
    acc[unitNumber].push(p);
    return acc;
  }, {});

  Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(unit => {
      const projectUnit = document.createElement('div');
      projectUnit.className = 'project-unit';

      const unitHeader = document.createElement('div');
      unitHeader.className = 'project-unit-header';
      unitHeader.innerHTML = `
        <div class="unit-title">Unidad ${unit}</div>
        <div class="unit-range">Semanas ${4 * (unit - 1) + 1} - ${4 * unit}</div>
      `;
      projectUnit.appendChild(unitHeader);

      const unitGrid = document.createElement('div');
      unitGrid.className = 'unit-projects';

      grouped[unit].forEach((p, i) => {
        const card = document.createElement('a');
        card.className = 'project-card';
        card.setAttribute('data-cat', p.cat);
        card.setAttribute('data-unit', unit);
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        // Generate GitHub URL
        const weekNum = parseInt(p.week.replace(/\D/g, ''), 10);
        const weekStr = weekNum.toString().padStart(2, '0');
        const githubUrl = `https://github.com/Estebangi11/BaseDeDatosII/tree/148ca589a7b6e51e7ce57ca9c68add1d73aaaf1e/Semana${weekStr}`;
        card.href = githubUrl;

        const catLabels = { frontend: 'Frontend', backend: 'Backend', fullstack: 'Full Stack' };
        const techsHTML = p.techs.map(t => `<span class="tech-chip">${t}</span>`).join('');

        card.innerHTML = `
          <span class="card-cat-label">${catLabels[p.cat] || 'Otro'}</span>
          <div class="card-week">${p.week}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-desc">${p.desc}</div>
          <div class="card-techs">${techsHTML}</div>
          <div class="card-link">
            <i data-lucide="external-link" style="width:14px;height:14px;"></i>
            Ver en GitHub
          </div>
        `;

        unitGrid.appendChild(card);

        setTimeout(() => {
          card.classList.add('card-visible');
          card.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
          card.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        }, i * 60);
      });

      projectUnit.appendChild(unitGrid);
      grid.appendChild(projectUnit);
    });

  // Re-render icons for the new cards
  if (window.lucide) lucide.createIcons();
}

/* ================================================================
   9. FILTROS DE PROYECTOS
   Muestra/oculta tarjetas según la categoría seleccionada
================================================================ */
function initFilterBtns() {
  const btns = document.querySelectorAll('.filter-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Marcar botón activo
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll('.project-card');

      cards.forEach(card => {
        // Mostrar todas o solo las que coincidan con el filtro
        const matches = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hidden', !matches);
      });

      document.querySelectorAll('.project-unit').forEach(section => {
        const cardsInSection = section.querySelectorAll('.project-card');
        const isEmpty = Array.from(cardsInSection).every(card => card.classList.contains('hidden'));
        section.classList.toggle('hidden', isEmpty);
      });
    });
  });
}

/* ================================================================
   10. CONTADORES ANIMADOS (estadísticas del perfil)
   Al entrar en el viewport, anima el número del 0 al valor destino
================================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400; // ms
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: ease-out cuártico
        const eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ================================================================
   11. MODAL DE AUTENTICACIÓN
================================================================ */
function initModal() {
  const modal = document.getElementById('authModal');
  const openBtn = document.getElementById('openAuthBtn');
  const closeBtn = document.getElementById('closeModalBtn');

  // Abrir modal al hacer clic en "Iniciar Sesión"
  openBtn.addEventListener('click', openModal);

  // Cerrar con el botón ×
  closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer clic fuera de la caja del modal
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Indicador de fuerza de contraseña en tiempo real
  const regPass = document.getElementById('regPass');
  if (regPass) {
    regPass.addEventListener('input', updateStrengthBar);
  }
}

function openModal() {
  document.getElementById('authModal').classList.add('active');
  document.body.style.overflow = 'hidden'; // Bloquear scroll del body
  // Re-renderizar íconos Lucide dentro del modal recién abierto
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById('authModal').classList.remove('active');
  document.body.style.overflow = ''; // Restaurar scroll
  setTimeout(resetModal, 350); // Esperar que termine la animación de cierre
}

// Volver el modal a su estado inicial
function resetModal() {
  switchTab('login');
  document.getElementById('authSuccess').classList.add('hidden');
  // Limpiar todos los campos
  ['loginEmail', 'loginPass', 'regName', 'regEmail', 'regPass', 'regPass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Limpiar errores
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-group input').forEach(i => i.classList.remove('invalid'));
  // Resetear barra de fuerza
  const fill = document.getElementById('strengthFill');
  const lbl = document.getElementById('strengthLabel');
  if (fill) fill.style.width = '0%';
  if (lbl) lbl.textContent = '';
}

/* ----------------------------------------------------------------
   CAMBIO DE PESTAÑA (Login ↔ Registro)
---------------------------------------------------------------- */
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
  document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
  document.getElementById('formRegister').classList.toggle('hidden', isLogin);
  document.getElementById('authSuccess').classList.add('hidden');
}

/* ----------------------------------------------------------------
   VALIDACIÓN Y SUBMIT — LOGIN
---------------------------------------------------------------- */
function handleLogin(e) {
  e.preventDefault();
  let valid = true;

  const email = document.getElementById('loginEmail');
  const pass = document.getElementById('loginPass');
  const emailErr = document.getElementById('loginEmailErr');
  const passErr = document.getElementById('loginPassErr');

  // Limpiar errores previos
  [email, pass].forEach(i => i.classList.remove('invalid'));
  emailErr.textContent = '';
  passErr.textContent = '';

  // Validar correo
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('invalid');
    emailErr.textContent = 'Ingresa un correo válido.';
    valid = false;
  }

  // Validar contraseña
  if (!pass.value || pass.value.length < 6) {
    pass.classList.add('invalid');
    passErr.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    valid = false;
  }

  if (!valid) return;

  // Mostrar pantalla de éxito
  document.getElementById('formLogin').classList.add('hidden');
  document.getElementById('successTitle').textContent = '¡Sesión iniciada!';
  document.getElementById('successMsg').textContent =
    `Bienvenido de vuelta, ${email.value}.`;
  showSuccess();
}

/* ----------------------------------------------------------------
   VALIDACIÓN Y SUBMIT — REGISTRO
---------------------------------------------------------------- */
function handleRegister(e) {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById('regName');
  const email = document.getElementById('regEmail');
  const pass = document.getElementById('regPass');
  const pass2 = document.getElementById('regPass2');

  // Limpiar errores previos
  [name, email, pass, pass2].forEach(i => i.classList.remove('invalid'));
  ['regNameErr', 'regEmailErr', 'regPassErr', 'regPass2Err'].forEach(id => {
    document.getElementById(id).textContent = '';
  });

  // Validar nombre
  if (!name.value.trim() || name.value.trim().length < 3) {
    name.classList.add('invalid');
    document.getElementById('regNameErr').textContent = 'Ingresa tu nombre completo.';
    valid = false;
  }

  // Validar correo
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('invalid');
    document.getElementById('regEmailErr').textContent = 'Ingresa un correo válido.';
    valid = false;
  }

  // Validar contraseña (mínimo 8 caracteres)
  if (!pass.value || pass.value.length < 8) {
    pass.classList.add('invalid');
    document.getElementById('regPassErr').textContent = 'Mínimo 8 caracteres.';
    valid = false;
  }

  // Validar que las contraseñas coincidan
  if (pass.value !== pass2.value) {
    pass2.classList.add('invalid');
    document.getElementById('regPass2Err').textContent = 'Las contraseñas no coinciden.';
    valid = false;
  }

  if (!valid) return;

  // Mostrar pantalla de éxito
  document.getElementById('formRegister').classList.add('hidden');
  document.getElementById('successTitle').textContent = '¡Cuenta creada!';
  document.getElementById('successMsg').textContent =
    `Bienvenido, ${name.value.trim()}. Tu cuenta ha sido creada exitosamente.`;
  showSuccess();
}

function showSuccess() {
  const s = document.getElementById('authSuccess');
  s.classList.remove('hidden');
  // Re-renderizar ícono de check
  if (window.lucide) lucide.createIcons();
}

/* ----------------------------------------------------------------
   BARRA DE FUERZA DE CONTRASEÑA
---------------------------------------------------------------- */
function updateStrengthBar() {
  const pass = document.getElementById('regPass').value;
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');

  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  const levels = [
    { w: '0%', bg: 'transparent', txt: '' },
    { w: '25%', bg: '#ff5a5a', txt: 'Muy débil' },
    { w: '50%', bg: '#ffaa44', txt: 'Débil' },
    { w: '75%', bg: '#ffe066', txt: 'Buena' },
    { w: '100%', bg: 'var(--teal)', txt: 'Muy segura ✓' },
  ];

  fill.style.width = levels[score].w;
  fill.style.background = levels[score].bg;
  label.textContent = levels[score].txt;
  label.style.color = levels[score].bg === 'var(--teal)' ? 'var(--teal)' : levels[score].bg;
}

/* ----------------------------------------------------------------
   TOGGLE MOSTRAR/OCULTAR CONTRASEÑA
---------------------------------------------------------------- */
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  // Cambiar el ícono
  btn.innerHTML = isText
    ? '<i data-lucide="eye" style="width:14px;height:14px;"></i>'
    : '<i data-lucide="eye-off" style="width:14px;height:14px;"></i>';
  if (window.lucide) lucide.createIcons();
}

/* ================================================================
   12. FONDO CANVAS — Grid de puntos animados
================================================================ */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots;

  // Inicializar tamaño y puntos
  function setup() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    dots = [];
    const spacing = 60;
    const cols = Math.ceil(W / spacing) + 1;
    const rows = Math.ceil(H / spacing) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * spacing,
          y: r * spacing,
          baseX: c * spacing,
          baseY: r * spacing,
          phase: Math.random() * Math.PI * 2, // Fase aleatoria para la animación
        });
      }
    }
  }

  let mx = W / 2, my = H / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    dots.forEach(dot => {
      // Movimiento suave basado en tiempo
      const wobble = 2 * Math.sin(t * 0.001 + dot.phase);
      const px = dot.baseX + wobble;
      const py = dot.baseY + wobble * 0.5;

      // Distancia al cursor del mouse
      const dx = mx - px;
      const dy = my - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 160;

      // Brillo del punto según distancia al cursor
      const opacity = dist < maxDist
        ? 0.08 + (1 - dist / maxDist) * 0.35
        : 0.05;

      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 192, ${opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  setup();
  window.addEventListener('resize', setup);
  requestAnimationFrame(draw);
}

/* ================================================================
   13. BOTONES MAGNÉTICOS
   Los botones .magnetic se desplazan levemente hacia el cursor
================================================================ */
function initMagneticBtns() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35; // Intensidad del efecto
      const dy = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ================================================================
   14. MENÚ HAMBURGER (móvil)
================================================================ */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    links.classList.toggle('mobile-open');
  });
}

function closeMobileMenu() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  btn.classList.remove('open');
  links.classList.remove('mobile-open');
}
