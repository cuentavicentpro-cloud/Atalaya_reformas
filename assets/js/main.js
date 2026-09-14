document.addEventListener('DOMContentLoaded', () => {
  // 1. NAVEGACIÓN MÓVIL (Menú Hamburguesa)
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    const toggleMenu = (open) => {
      if (open) {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
      }
    };

    mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
    if (mobileMenuCloseBtn) {
      mobileMenuCloseBtn.addEventListener('click', () => toggleMenu(false));
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  // 2. HEADER CON EFECTO DE SCROLL
  const mainHeader = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      mainHeader?.classList.add('shadow-md');
    } else {
      mainHeader?.classList.remove('shadow-md');
    }
  });

  // 3. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const icon = button.querySelector('.faq-icon');
      const isOpen = !content.classList.contains('hidden');

      // Cerrar otros
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-toggle').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const ic = b.querySelector('.faq-icon');
        if (ic) ic.classList.remove('rotate-180');
      });

      if (!isOpen) {
        content.classList.remove('hidden');
        button.setAttribute('aria-expanded', 'true');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });

  // 4. FILTRADO DE PROYECTOS
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        b.classList.add('bg-surface-container', 'text-on-surface');
      });
      btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      btn.classList.remove('bg-surface-container', 'text-on-surface');

      const filter = btn.getAttribute('data-filter');
      projectItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 5. SLIDER INTERACTIVO ANTES Y DESPUÉS
  const sliderRange = document.getElementById('slider-range');
  const beforeWrapper = document.getElementById('before-wrapper');
  const sliderHandle = document.getElementById('slider-handle');
  const sliderContainer = document.getElementById('slider-container');

  if (sliderRange && beforeWrapper && sliderHandle) {
    const updateSlider = (val) => {
      const clamped = Math.max(0, Math.min(100, val));
      beforeWrapper.style.width = `${clamped}%`;
      sliderHandle.style.left = `${clamped}%`;
      sliderRange.value = clamped;
    };

    sliderRange.addEventListener('input', (e) => {
      updateSlider(e.target.value);
    });

    // Soporte para arrastre táctil y con ratón directamente en el contenedor
    let isDragging = false;
    const handleMove = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      updateSlider(percentage);
    };

    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleMove(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleMove(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    sliderContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    }, { passive: true });
    sliderContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    }, { passive: true });
  }

  // 6. ESTIMADOR DE PRESUPUESTOS INTERACTIVO (WIDGET ARQUITECTÓNICO)
  const calcCards = document.querySelectorAll('.calc-type-card');
  const qualityCards = document.querySelectorAll('.calc-quality-card');
  const m2Slider = document.getElementById('calc-m2');
  const m2Display = document.getElementById('calc-m2-display');
  const m2Unit = document.getElementById('calc-m2-unit');
  const totalMinEl = document.getElementById('calc-total-min');
  const totalMaxEl = document.getElementById('calc-total-max');
  const phaseDemolEl = document.getElementById('calc-phase-demol');
  const phaseInstalEl = document.getElementById('calc-phase-instal');
  const phaseRevestEl = document.getElementById('calc-phase-revest');
  const phaseCarpintEl = document.getElementById('calc-phase-carpint');
  const phaseProjectEl = document.getElementById('calc-phase-project');
  const applyCalcBtn = document.getElementById('calc-apply-form');
  const whatsappCalcBtn = document.getElementById('calc-whatsapp-btn');

  let currentType = 'integral';
  let currentQuality = 'premium';

  // Configuración de costes base por m² en Murcia
  const rateMatrix = {
    integral: {
      name: 'Reforma Integral de Vivienda',
      defaultM2: 90,
      minM2: 30,
      maxM2: 250,
      rates: {
        estandar: { min: 480, max: 620 },
        premium: { min: 650, max: 820 },
        lujo: { min: 890, max: 1150 }
      }
    },
    cocina: {
      name: 'Reforma de Cocina',
      defaultM2: 18,
      minM2: 6,
      maxM2: 45,
      rates: {
        estandar: { min: 550, max: 700 },
        premium: { min: 750, max: 950 },
        lujo: { min: 1050, max: 1400 }
      }
    },
    bano: {
      name: 'Reforma de Baño Spa',
      defaultM2: 9,
      minM2: 4,
      maxM2: 25,
      rates: {
        estandar: { min: 580, max: 750 },
        premium: { min: 800, max: 1050 },
        lujo: { min: 1100, max: 1550 }
      }
    },
    local: {
      name: 'Adecuación de Local u Oficina',
      defaultM2: 120,
      minM2: 40,
      maxM2: 400,
      rates: {
        estandar: { min: 420, max: 550 },
        premium: { min: 580, max: 740 },
        lujo: { min: 780, max: 1050 }
      }
    }
  };

  const formatEUR = (num) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
  };

  const recalculateBudget = () => {
    if (!m2Slider) return;
    const config = rateMatrix[currentType];
    const m2 = parseInt(m2Slider.value, 10);
    const rates = config.rates[currentQuality];

    const totalMin = m2 * rates.min;
    const totalMax = m2 * rates.max;
    const avg = (totalMin + totalMax) / 2;

    if (m2Display) m2Display.textContent = `${m2} m²`;
    if (totalMinEl) totalMinEl.textContent = formatEUR(totalMin);
    if (totalMaxEl) totalMaxEl.textContent = formatEUR(totalMax);

    // Desglose por fases arquitectónicas
    if (phaseDemolEl) phaseDemolEl.textContent = formatEUR(avg * 0.14);
    if (phaseInstalEl) phaseInstalEl.textContent = formatEUR(avg * 0.28);
    if (phaseRevestEl) phaseRevestEl.textContent = formatEUR(avg * 0.26);
    if (phaseCarpintEl) phaseCarpintEl.textContent = formatEUR(avg * 0.20);
    if (phaseProjectEl) phaseProjectEl.textContent = formatEUR(avg * 0.12);

    // Actualizar botón WhatsApp del calculador
    if (whatsappCalcBtn) {
      const qNames = { estandar: 'Estándar Confort', premium: 'Calidad Superior (Recomendada)', lujo: 'Alta Gama & Lujo' };
      const msg = encodeURIComponent(`Hola Atalaya Reformas Murcia, he calculado un presupuesto estimado en su web:
- Proyecto: ${config.name}
- Superficie: ${m2} m²
- Calidades: ${qNames[currentQuality]}
- Rango aproximado: ${formatEUR(totalMin)} - ${formatEUR(totalMax)}
¿Podríamos agendar una visita técnica gratuita para medir y afinar el presupuesto en Murcia?`);
      whatsappCalcBtn.href = `https://wa.me/34600123456?text=${msg}`;
    }
  };

  // Click en tipo de reforma
  calcCards.forEach(card => {
    card.addEventListener('click', () => {
      calcCards.forEach(c => c.classList.remove('active', 'border-primary', 'bg-primary/5'));
      card.classList.add('active', 'border-primary', 'bg-primary/5');
      currentType = card.getAttribute('data-type');
      
      // Ajustar límites de m² según el tipo
      const config = rateMatrix[currentType];
      m2Slider.min = config.minM2;
      m2Slider.max = config.maxM2;
      m2Slider.value = config.defaultM2;
      recalculateBudget();
    });
  });

  // Click en calidad
  qualityCards.forEach(card => {
    card.addEventListener('click', () => {
      qualityCards.forEach(c => c.classList.remove('active', 'border-primary', 'bg-primary/5', 'text-primary'));
      card.classList.add('active', 'border-primary', 'bg-primary/5', 'text-primary');
      currentQuality = card.getAttribute('data-quality');
      recalculateBudget();
    });
  });

  // Slider m²
  if (m2Slider) {
    m2Slider.addEventListener('input', recalculateBudget);
  }

  // Botón "Llevar al formulario de contacto"
  if (applyCalcBtn) {
    applyCalcBtn.addEventListener('click', () => {
      const selectReforma = document.getElementById('tipo_reforma');
      const mensajeField = document.getElementById('mensaje');
      const m2 = m2Slider ? m2Slider.value : '';
      const config = rateMatrix[currentType];
      const qNames = { estandar: 'Estándar Confort', premium: 'Calidad Superior', lujo: 'Alta Gama y Lujo' };

      if (selectReforma) {
        selectReforma.value = currentType;
      }
      if (mensajeField) {
        mensajeField.value = `Hola, he realizado una estimación previa en vuestra calculadora web para ${config.name} de ${m2} m² en calidades ${qNames[currentQuality]}. Me gustaría concertar una visita técnica sin compromiso.`;
      }

      // Desplazamiento suave al formulario
      const contactoSection = document.getElementById('contacto');
      if (contactoSection) {
        contactoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          document.getElementById('nombre')?.focus();
        }, 600);
      }
    });
  }

  // Inicializar cálculo inicial
  recalculateBudget();

  // 7. GESTIÓN DEL FORMULARIO DE CONTACTO
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const sendWhatsappDirectBtn = document.getElementById('send-whatsapp-direct');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('opacity-50', 'pointer-events-none');
        submitBtn.innerHTML = '<span>Enviando solicitud...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.add('hidden');
        }
        formSuccess.classList.remove('hidden');
        contactForm.reset();
      }, 700);
    });
  }

  if (sendWhatsappDirectBtn) {
    sendWhatsappDirectBtn.addEventListener('click', () => {
      const nombre = document.getElementById('nombre')?.value || '';
      const tel = document.getElementById('telefono')?.value || '';
      const tipo = document.getElementById('tipo_reforma')?.value || '';
      const msg = document.getElementById('mensaje')?.value || '';

      const text = encodeURIComponent(`Hola Atalaya Reformas, quiero pedir presupuesto:
- Nombre: ${nombre}
- Teléfono: ${tel}
- Tipo de reforma: ${tipo}
- Mensaje: ${msg}`);
      window.open(`https://wa.me/34600123456?text=${text}`, '_blank');
    });
  }
});
