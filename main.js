/* ================================================================
   PORTFOLIO — ESTEBAN GALARZA INGA
   main.js — Toda la lógica interactiva
================================================================ */

import { supabase } from './supabase.js'

/* ================================================================
   1. INICIALIZACIÓN DE ÍCONOS LUCIDE
   Reemplaza los elementos <i data-lucide="..."> con SVGs reales
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza todos los íconos Lucide de la página
  if (window.lucide) lucide.createIcons();

  // Inicializar botón admin: SIEMPRE OCULTO al comienzo
  // Solo se muestra cuando el usuario inicia sesión y es admin
  const adminFab = document.getElementById('adminFab');
  if (adminFab && !adminFab.classList.contains('hidden')) {
    adminFab.classList.add('hidden');
  }

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
      scrollToSection(link.dataset.section);
      // Cerrar menú móvil si está abierto
      closeMobileMenu();
    });
  });
}

/* ================================================================
   4. SCROLL TO — función global usada por botones del hero
================================================================ */
function scrollToSection(sectionId) {
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
   7. DATOS DE PROYECTOS (DEPRECADO)
   Los datos ahora se cargan exclusivamente desde Supabase tabla "semanas"
   Este array se mantiene solo para referencia histórica y será eliminado pronto.
================================================================ */
// PROJECTS array removed - data now loads from Supabase

/* ================================================================
   8. RENDERIZAR TARJETAS DE PROYECTOS EN EL DOM
   Ahora carga desde Supabase tabla "semanas" en lugar del array estático
================================================================ */
async function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // Cargar semanas desde Supabase
  const { data: semanas, error } = await supabase
    .from('semanas')
    .select('id, nombre, descripcion')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error cargando semanas:', error);
    grid.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">Error al cargar las semanas.</p>';
    return;
  }

  if (!semanas || semanas.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">No hay semanas configuradas aún.</p>';
    return;
  }

  // Agrupar por unidad (4 semanas por unidad)
  const grouped = semanas.reduce((acc, s) => {
    // Extraer número de "Semana01" → 1
    const weekNumber = parseInt(s.id.replace(/\D/g, ''), 10);
    const unitNumber = Math.ceil(weekNumber / 4);
    if (!acc[unitNumber]) acc[unitNumber] = [];
    acc[unitNumber].push(s);
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

      grouped[unit].forEach((s, i) => {
        const card = document.createElement('button');
        card.className = 'project-card';
        card.setAttribute('data-unit', unit);

        // Extraer número: "Semana01" → "01"
        const weekNum = parseInt(s.id.replace(/\D/g, ''), 10);
        const weekStr = weekNum.toString().padStart(2, '0');
        const semanaFolder = `Semana${weekStr}`;
        const weekLabel = `Semana ${weekNum}`;

        card.innerHTML = `
          <div class="card-week">${weekLabel}</div>
          <div class="card-title">${s.nombre || '—'}</div>
          <div class="card-desc">${s.descripcion || '—'}</div>
        `;

        // Abrir modal de archivos al hacer clic en la tarjeta
        card.addEventListener('click', () => openFilesModal(semanaFolder, weekLabel));

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
   9. FILTROS DE PROYECTOS (DEPRECADO)
   Esta funcionalidad se desactiva al usar Supabase como fuente única.
   Puede reactivarse si se agregan columnas de categoría a la tabla semanas.
================================================================ */
function initFilterBtns() {
  // Funcionalidad de filtros deshabilitada.
  // Para reactivar: agregar columna 'categoria' a tabla semanas en Supabase
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
async function handleLogin(e) {
  e.preventDefault()
  let valid = true
  const email = document.getElementById('loginEmail')
  const pass = document.getElementById('loginPass')
  const emailErr = document.getElementById('loginEmailErr')
  const passErr = document.getElementById('loginPassErr')

    ;[email, pass].forEach(i => i.classList.remove('invalid'))
  emailErr.textContent = ''
  passErr.textContent = ''

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('invalid')
    emailErr.textContent = 'Ingresa un correo válido.'
    valid = false
  }
  if (!pass.value || pass.value.length < 6) {
    pass.classList.add('invalid')
    passErr.textContent = 'La contraseña debe tener al menos 6 caracteres.'
    valid = false
  }
  if (!valid) return

  const btn = e.target.querySelector('button[type="submit"]')
  btn.textContent = 'Iniciando sesión...'
  btn.disabled = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: pass.value,
  })

  btn.disabled = false
  btn.innerHTML = '<i data-lucide="log-in" style="width:15px;height:15px;"></i> Ingresar'
  if (window.lucide) lucide.createIcons()

  if (error) {
    passErr.textContent = 'Correo o contraseña incorrectos.'
    pass.classList.add('invalid')
    return
  }

  document.getElementById('formLogin').classList.add('hidden')
  document.getElementById('successTitle').textContent = '¡Sesión iniciada!'
  document.getElementById('successMsg').textContent = `Bienvenido, ${data.user.email}`
  showSuccess()
  checkAdminAccess(data.user)
}

/* ----------------------------------------------------------------
   VALIDACIÓN Y SUBMIT — REGISTRO
---------------------------------------------------------------- */
async function handleRegister(e) {
  e.preventDefault()
  let valid = true

  const name = document.getElementById('regName')
  const email = document.getElementById('regEmail')
  const pass = document.getElementById('regPass')
  const pass2 = document.getElementById('regPass2')

    ;[name, email, pass, pass2].forEach(i => i.classList.remove('invalid'))
    ;['regNameErr', 'regEmailErr', 'regPassErr', 'regPass2Err'].forEach(id => {
      document.getElementById(id).textContent = ''
    })

  if (!name.value.trim() || name.value.trim().length < 3) {
    name.classList.add('invalid')
    document.getElementById('regNameErr').textContent = 'Ingresa tu nombre completo.'
    valid = false
  }
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('invalid')
    document.getElementById('regEmailErr').textContent = 'Ingresa un correo válido.'
    valid = false
  }
  if (!pass.value || pass.value.length < 8) {
    pass.classList.add('invalid')
    document.getElementById('regPassErr').textContent = 'Mínimo 8 caracteres.'
    valid = false
  }
  if (pass.value !== pass2.value) {
    pass2.classList.add('invalid')
    document.getElementById('regPass2Err').textContent = 'Las contraseñas no coinciden.'
    valid = false
  }
  if (!valid) return

  const btn = e.target.querySelector('button[type="submit"]')
  btn.textContent = 'Creando cuenta...'
  btn.disabled = true

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: pass.value,
    options: { data: { full_name: name.value.trim() } }
  })

  btn.disabled = false
  btn.innerHTML = '<i data-lucide="user-plus" style="width:15px;height:15px;"></i> Crear cuenta'
  if (window.lucide) lucide.createIcons()

  if (error) {
    document.getElementById('regEmailErr').textContent = 'Error: ' + error.message
    email.classList.add('invalid')
    return
  }

  document.getElementById('formRegister').classList.add('hidden')
  document.getElementById('successTitle').textContent = '¡Cuenta creada!'
  document.getElementById('successMsg').textContent = 'Revisa tu correo para confirmar tu cuenta.'
  showSuccess()
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

/* ================================================================
   15. ACCESO ADMIN — Mostrar botón flotante solo si eres admin
================================================================ */
function checkAdminAccess(user) {
  // Admin email
  const ADMIN_EMAIL = 'estebangalarza110607@gmail.com'
  const fab = document.getElementById('adminFab')
  const openBtn = document.getElementById('openAuthBtn')

  if (!fab) return

  if (user && user.email === ADMIN_EMAIL) {
    // Es admin: mostrar FAB y actualizar botón a "Esteban"
    fab.classList.remove('hidden')
    if (openBtn) {
      openBtn.innerHTML = '<i data-lucide="user" style="width:15px;height:15px;"></i> Esteban'
      if (window.lucide) lucide.createIcons()
    }
    // Abrir modal y renderizar panel admin
    fab.onclick = () => {
      const adminModal = document.getElementById('adminModal')
      if (adminModal) {
        adminModal.classList.add('active')
        renderAdminPanel(true) // Pasar que es admin
      }
    }
  } else {
    // No es admin (sin sesión o usuario diferente): ocultar FAB, botón sigue diciendo "Iniciar Sesión"
    fab.classList.add('hidden')
    if (openBtn) {
      openBtn.innerHTML = '<i data-lucide="log-in" style="width:15px;height:15px;"></i> Iniciar Sesión'
      if (window.lucide) lucide.createIcons()
    }
  }
}

/* ================================================================
   15.1. RENDERIZAR PANEL ADMIN — Carga desde Supabase tabla "semanas"
================================================================ */
async function renderAdminPanel(isAdmin = false) {
  const adminPanel = document.getElementById('adminPanel')
  if (!adminPanel) return

  // Limpiar el panel
  adminPanel.innerHTML = ''

  // Verificar que sea realmente admin antes de renderizar
  if (!isAdmin) {
    adminPanel.innerHTML = '<div class="admin-error">Acceso denegado. Solo administradores pueden acceder.</div>'
    return
  }

  // Container principal con botón cerrar
  const container = document.createElement('div')
  container.className = 'admin-panel-container'

  // Botón cerrar
  const closeBtn = document.createElement('button')
  closeBtn.className = 'admin-panel-close'
  closeBtn.innerHTML = '<i data-lucide="x" style="width:20px;height:20px;"></i>'
  closeBtn.addEventListener('click', () => {
    const modal = document.getElementById('adminModal')
    if (modal) modal.classList.remove('active')
  })
  container.appendChild(closeBtn)

  // Header del panel
  const header = document.createElement('div')
  header.className = 'admin-header'
  header.innerHTML = `
    <h2>📊 Panel de Administración</h2>
    <p>Gestiona las semanas y proyectos del portafolio</p>
    <button onclick="logout()" style="margin-top:12px; padding:8px 18px; background:#e53e3e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;font-family:inherit;">
     Cerrar sesión
    </button>
  `
  container.appendChild(header)

  // Contenedor de tarjetas de semanas
  const weeksContainer = document.createElement('div')
  weeksContainer.className = 'admin-weeks-container'
  container.appendChild(weeksContainer)

  adminPanel.appendChild(container)

  // Cargar semanas desde Supabase
  const { data: weeks, error } = await supabase
    .from('semanas')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error cargando semanas:', error)
    weeksContainer.innerHTML = '<p class="admin-error">Error al cargar las semanas.</p>'
    return
  }

  if (!weeks || weeks.length === 0) {
    weeksContainer.innerHTML = '<p class="admin-empty">No hay semanas configuradas aún.</p>'
    return
  }

  // Renderizar tarjeta para cada semana
  weeks.forEach(week => {
    const card = document.createElement('div')
    card.className = 'admin-week-card'
    const weekNumber = parseInt(week.id.replace(/\D/g, ''), 10)
    card.innerHTML = `
      <span class="admin-week-id">Semana ${weekNumber}</span>
      <button class="btn-admin-edit" data-week-id="${week.id}" title="Editar">
        <i data-lucide="edit-2" style="width:16px;height:16px;"></i>
        Editar
      </button>
    `
    weeksContainer.appendChild(card)

    // Agregar listener al botón editar (solo si es admin, que siempre lo es aquí)
    card.querySelector('.btn-admin-edit').addEventListener('click', () => {
      openEditWeekModal(week)
    })
  })

  if (window.lucide) lucide.createIcons()
}

/* ================================================================
   15.2. MODAL DE EDICIÓN DE SEMANA
================================================================ */
function openEditWeekModal(week) {
  // Eliminar modal previo si existe
  const prev = document.getElementById('editWeekModal')
  if (prev) prev.remove()

  const modal = document.createElement('div')
  modal.className = 'modal-overlay admin-modal-overlay active'
  modal.id = 'editWeekModal'

  const nombre = week.nombre || ''
  const descripcion = week.descripcion || ''

  modal.innerHTML = `
    <div class="modal-box admin-modal-box">
      <button class="modal-close" id="closeEditWeekBtn" aria-label="Cerrar">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>

      <div class="modal-head">
        <h2 class="modal-title">Editar Semana ${parseInt(week.id.replace(/\D/g, ''), 10)}</h2>
      </div>

      <form id="editWeekForm" class="admin-edit-form">
        <div class="form-group">
          <label for="editWeekName">Nombre:</label>
          <input type="text" id="editWeekName" value="${nombre.replace(/"/g, '&quot;')}" placeholder="Ej: Arquitectura de Web" required>
        </div>

        <div class="form-group">
          <label for="editWeekDesc">Descripción:</label>
          <textarea id="editWeekDesc" placeholder="Descripción del proyecto..." rows="4">${descripcion.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>

        <div class="form-group">
          <label for="editWeekFile">Subir archivo (PDF, imagen, etc.):</label>
          <div class="file-input-wrapper">
            <input type="file" id="editWeekFile" accept=".pdf,.doc,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip" />
            <span class="file-input-hint">PDF, documentos, imágenes o comprimidos (10MB máx)</span>
          </div>
        </div>

        <div class="admin-form-actions">
          <button type="submit" class="btn-admin-save">
            <i data-lucide="save" style="width:16px;height:16px;"></i>
            Guardar
          </button>
          <button type="button" class="btn-admin-cancel" id="cancelEditBtn">
            <i data-lucide="x" style="width:16px;height:16px;"></i>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'

  // Event listeners
  const form = document.getElementById('editWeekForm')
  form.addEventListener('submit', (e) => handleSaveWeek(e, week.id))

  document.getElementById('closeEditWeekBtn').addEventListener('click', closeEditWeekModal)
  document.getElementById('cancelEditBtn').addEventListener('click', closeEditWeekModal)

  modal.addEventListener('click', e => {
    if (e.target === modal) closeEditWeekModal()
  })

  document.addEventListener('keydown', handleEditWeekEsc)

  if (window.lucide) lucide.createIcons()
}

function closeEditWeekModal() {
  const modal = document.getElementById('editWeekModal')
  if (modal) {
    modal.classList.add('closing')
    setTimeout(() => modal.remove(), 300)
  }
  document.removeEventListener('keydown', handleEditWeekEsc)
}

function handleEditWeekEsc(e) {
  if (e.key === 'Escape') closeEditWeekModal()
}

/* ================================================================
   15.3. FUNCIÓN DE MODAL NO AUTORIZADO
   Se muestra cuando un usuario intenta ver archivos sin iniciar sesión
================================================================ */
function showUnauthorizedModal(weekTitle = 'Archivos') {
  // Eliminar modal previo si existe
  const prev = document.getElementById('unauthorizedModal')
  if (prev) prev.remove()

  const modal = document.createElement('div')
  modal.className = 'modal-overlay unauthorized-modal-overlay active'
  modal.id = 'unauthorizedModal'

  modal.innerHTML = `
    <div class="modal-box unauthorized-modal-box">
      <button class="modal-close" id="closeUnauthorizedBtn" aria-label="Cerrar">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>

      <div class="modal-head unauthorized-head">
        <div class="unauthorized-icon">
          <i data-lucide="lock" style="width:32px;height:32px;"></i>
        </div>
        <h2 class="modal-title">Acceso Restringido</h2>
        <p class="modal-sub">Para ver los archivos de ${weekTitle}, necesitas iniciar sesión.</p>
      </div>

      <div class="unauthorized-actions">
        <button class="btn-admin-save" id="goToLoginBtn">
          <i data-lucide="log-in" style="width:16px;height:16px;"></i>
          Iniciar Sesión
        </button>
        <button class="btn-admin-cancel" id="closeUnauthorizedBtn2">
          <i data-lucide="x" style="width:16px;height:16px;"></i>
          Cerrar
        </button>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'

  // Event listeners
  document.getElementById('closeUnauthorizedBtn').addEventListener('click', closeUnauthorizedModal)
  document.getElementById('closeUnauthorizedBtn2').addEventListener('click', closeUnauthorizedModal)
  document.getElementById('goToLoginBtn').addEventListener('click', () => {
    closeUnauthorizedModal()
    openModal()
  })

  modal.addEventListener('click', e => {
    if (e.target === modal) closeUnauthorizedModal()
  })

  document.addEventListener('keydown', handleUnauthorizedEsc)

  if (window.lucide) lucide.createIcons()
}

function closeUnauthorizedModal() {
  const modal = document.getElementById('unauthorizedModal')
  if (modal) {
    modal.classList.add('closing')
    setTimeout(() => modal.remove(), 300)
  }
  document.removeEventListener('keydown', handleUnauthorizedEsc)
}

function handleUnauthorizedEsc(e) {
  if (e.key === 'Escape') closeUnauthorizedModal()
}

async function handleSaveWeek(e, weekId) {
  e.preventDefault()

  const nombre = document.getElementById('editWeekName').value.trim()
  const descripcion = document.getElementById('editWeekDesc').value.trim()
  const fileInput = document.getElementById('editWeekFile')
  const file = fileInput?.files?.[0]

  if (!nombre) {
    alert('El nombre no puede estar vacío')
    return
  }

  const btn = e.target.querySelector('button[type="submit"]')
  btn.disabled = true
  btn.textContent = 'Guardando...'

  // Primero actualizar la información de la semana
  const { error } = await supabase
    .from('semanas')
    .update({ nombre, descripcion })
    .eq('id', weekId)

  if (error) {
    console.error('Error guardando semana:', error)
    btn.disabled = false
    btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar'
    alert('Error al guardar. Intenta de nuevo.')
    return
  }

  // Si hay un archivo, subirlo a Storage
  if (file) {
    // Extraer número de semana: "Semana01" → "01"
    const weekNumber = parseInt(weekId.replace(/\D/g, ''), 10)
    const weekStr = weekNumber.toString().padStart(2, '0')
    const semanaFolder = `Semana${weekStr}`
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${semanaFolder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('Semanas')
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError)
      btn.disabled = false
      btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar'
      alert('Semana guardada, pero hubo error al subir el archivo. Intenta de nuevo.')
      return
    }
  }

  btn.disabled = false
  btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar'
  alert('Semana actualizada correctamente' + (file ? ' y archivo subido.' : '.'))
  closeEditWeekModal()
  const { data: { session } } = await supabase.auth.getSession()
  const ADMIN_EMAIL = 'estebangalarza110607@gmail.com'
  const isAdmin = session && session.user.email === ADMIN_EMAIL
  renderAdminPanel(isAdmin)
}

/* ================================================================
   16. MODAL DE ARCHIVOS — Mostrar archivos de la semana desde Storage
   Con validación de autorización: solo admin puede ver archivos
================================================================ */

async function openFilesModal(semanaFolder, weekTitle) {
  // Eliminar modal previo si existe
  const prev = document.getElementById('filesModal')
  if (prev) prev.remove()

  const modal = document.createElement('div')
  modal.className = 'modal-overlay files-modal-overlay active'
  modal.id = 'filesModal'

  modal.innerHTML = `
    <div class="modal-box files-modal-box">
      <button class="modal-close" id="closeFilesBtn" aria-label="Cerrar">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>

      <div class="modal-head">
        <div class="modal-logo"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/></svg></div>
        <h2 class="modal-title">${weekTitle}</h2>
        <p class="modal-sub">Archivos disponibles para esta semana</p>
      </div>

      <div class="files-list" id="filesListContainer">
        <p class="files-empty">Cargando archivos...</p>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'

  // Cerrar al hacer clic fuera
  modal.addEventListener('click', e => { if (e.target === modal) closeFilesModal() })
  document.getElementById('closeFilesBtn').addEventListener('click', closeFilesModal)

  // Cerrar con Escape
  document.addEventListener('keydown', handleFilesEsc)

  if (window.lucide) lucide.createIcons()

  loadFilesFromStorage(semanaFolder)
}

function handleFilesEsc(e) {
  if (e.key === 'Escape') closeFilesModal()
}

async function loadFilesFromStorage(semanaFolder) {
  const container = document.getElementById('filesListContainer')
  if (!container) return

  const { data, error } = await supabase.storage
    .from('Semanas')
    .list(semanaFolder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="files-empty">No hay archivos esta semana aún.</p>'
    return
  }

container.innerHTML = data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => {
    const { data: urlData } = supabase.storage.from('Semanas').getPublicUrl(`${semanaFolder}/${f.name}`)
    const ext = f.name.split('.').pop().toUpperCase()
    const kb = f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) + ' KB' : ''
    const isPDF = ext === 'PDF'
    const isImage = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(ext)

    return `
      <div class="file-item-modal">
        <div class="file-info-modal">
          <div class="file-ext-badge">${ext}</div>
          <div>
            <div class="file-name-modal">${f.name}</div>
            <div class="file-size-modal">${kb}</div>
          </div>
        </div>
        <div class="file-actions-modal">
          <button class="btn-file-action view-btn" onclick="viewFile('${urlData.publicUrl}', '${ext}', '${f.name}')" title="Ver archivo">
            <i data-lucide="eye" style="width:14px;height:14px;"></i>
            Ver
          </button>
          <a href="${urlData.publicUrl}" download="${f.name}" class="btn-file-action download-btn" title="Descargar">
            <i data-lucide="download" style="width:14px;height:14px;"></i>
            Descargar
          </a>
        </div>
      </div>
    `
  }).join('')

  if (window.lucide) lucide.createIcons()
}

function closeFilesModal() {
  const modal = document.getElementById('filesModal')
  if (modal) {
    modal.classList.add('closing')
    setTimeout(() => modal.remove(), 300)
  }
}

/* ================================================================
   Función auxiliar para descargas de archivos con descarga real
   Utiliza fetch + blob para descargar sin abrir nueva pestaña
================================================================ */
async function descargarArchivo(url, nombre, btn = null) {
  try {
    if (btn) {
      btn.textContent = 'Descargando...'
      btn.disabled = true
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Error en la descarga')

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    // Crear un elemento <a> temporal para la descarga
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)

    if (btn) {
      btn.textContent = 'Descargar'
      btn.disabled = false
      if (window.lucide) lucide.createIcons()
    }
  } catch (err) {
    console.error('Error descargando archivo:', err)
    alert('No se pudo descargar el archivo. Intenta de nuevo.')
    if (btn) {
      btn.textContent = 'Descargar'
      btn.disabled = false
    }
  }
}

function viewFile(url, ext, fileName) {
  const viewerModal = document.createElement('div')
  viewerModal.className = 'modal-overlay file-viewer-overlay active'
  viewerModal.id = 'fileViewerModal'

  const isPDF = ext === 'PDF'
  const isImage = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'].includes(ext)

  let content = ''
  if (isPDF) {
    content = `<iframe src="${url}" class="file-viewer-content pdf-viewer" title="${fileName}"></iframe>`
  } else if (isImage) {
    content = `<img src="${url}" class="file-viewer-content image-viewer" alt="${fileName}" />`
  } else {
    content = `<div class="file-viewer-content unsupported-viewer"><p>Vista previa no disponible para archivos ${ext}</p><a href="${url}" download="${fileName}" class="btn-download-fallback">Descargar archivo</a></div>`
  }

  viewerModal.innerHTML = `
    <div class="file-viewer-box">
      <button class="modal-close" onclick="closeFileViewer()" aria-label="Cerrar">
        <i data-lucide="x" style="width:20px;height:20px;"></i>
      </button>
      <div class="file-viewer-header">
        <h3 class="file-viewer-title">${fileName}</h3>
        <span class="file-viewer-type">${ext}</span>
      </div>
      ${content}
    </div>
  `

  document.body.appendChild(viewerModal)
  document.body.style.overflow = 'hidden'

  viewerModal.addEventListener('click', e => {
    if (e.target === viewerModal) closeFileViewer()
  })

  document.addEventListener('keydown', handleViewerEsc)

  if (window.lucide) lucide.createIcons()
}

function closeFileViewer() {
  const modal = document.getElementById('fileViewerModal')
  if (modal) {
    modal.classList.remove('active')
    setTimeout(() => {
      modal.remove()
      document.body.style.overflow = 'auto'
    }, 300)
  }
}

function handleViewerEsc(e) {
  if (e.key === 'Escape') closeFileViewer()
}

/* ================================================================
   17. DETECTAR SESIÓN EXISTENTE AL CARGAR
   Sin necesidad de recargar manualmente la página
================================================================ */
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    checkAdminAccess(session.user)
  }
  // Si no hay sesión, todo permanece en estado inicial
})

/* ================================================================
   18. EXPONER FUNCIONES GLOBALES PARA ONCLICK DEL HTML
   Todas las funciones llamadas desde atributos onclick deben estar
   expuestas en window para que HTML pueda acceder a ellas
================================================================ */

// Autenticación
window.switchTab = switchTab
window.handleLogin = handleLogin
window.handleRegister = handleRegister
window.togglePass = togglePass
window.closeModal = closeModal
window.openModal = openModal
window.checkAdminAccess = checkAdminAccess

// Navegación
window.scrollToSection = scrollToSection

// Gestión de archivos (acceso público)
window.openFilesModal = openFilesModal
window.closeFilesModal = closeFilesModal
window.viewFile = viewFile
window.closeFileViewer = closeFileViewer
window.descargarArchivo = descargarArchivo
window.handleFilesEsc = handleFilesEsc
window.handleViewerEsc = handleViewerEsc

// Panel Admin (ahora integrado en main.js)
window.renderAdminPanel = renderAdminPanel
window.openEditWeekModal = openEditWeekModal
window.closeEditWeekModal = closeEditWeekModal
window.handleSaveWeek = handleSaveWeek
window.handleEditWeekEsc = handleEditWeekEsc
window.showUnauthorizedModal = showUnauthorizedModal
window.closeUnauthorizedModal = closeUnauthorizedModal
window.handleUnauthorizedEsc = handleUnauthorizedEsc

// Cerrar sesión
async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}
window.logout = logout;
