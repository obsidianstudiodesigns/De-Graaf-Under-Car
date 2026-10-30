(() => {
  'use strict';

  // Where bookings go. WhatsApp bookings reach Quintin (sales); email bookings are relayed by FormSubmit.
  const WHATSAPP_NUMBER = '27836488596';
  const BOOKING_EMAIL = 'sales@degraafundercarpta.co.za';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- hero: video, copy lands when the headlights strike ---------- */
  const hero = $('.hero');
  const video = $('#heroVideo');
  const HEADLIGHTS_ON = 1.0;  // seconds into the clip
  const LOOP_FROM = 1.54;     // the file ends on this frame (ping-pong), so looping here is seamless
  const lightUp = () => hero.classList.add('lit');
  const mobile = matchMedia('(max-width: 640px)').matches;
  if (mobile) video.poster = video.dataset.posterM;
  video.src = mobile ? video.dataset.srcM : video.dataset.src;

  if (reduce) {
    // no motion: park on a frame with the lights on
    video.removeAttribute('autoplay');
    video.preload = 'auto';
    video.addEventListener('loadeddata', () => { video.currentTime = 3; }, { once: true });
    lightUp();
  } else {
    const onTime = () => {
      if (video.currentTime >= HEADLIGHTS_ON) { lightUp(); video.removeEventListener('timeupdate', onTime); }
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('playing', () => hero.classList.add('playing'), { once: true });
    video.addEventListener('ended', () => { video.currentTime = LOOP_FROM; video.play(); });
    const p = video.play();
    if (p && p.catch) p.catch(() => lightUp());   // autoplay blocked (e.g. low-power mode): poster + copy
    setTimeout(lightUp, 2600);                     // never leave the copy hidden on a slow connection
    // pause off-screen to save battery
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { const r = video.play(); if (r && r.catch) r.catch(() => {}); } else video.pause();
    }).observe(hero);
  }

  /* ---------- hero: floating dust caught in the light ---------- */
  const canvas = $('#dust');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, motes = [], running = true;
    const count = () => (innerWidth < 640 ? 34 : 80);
    const spawn = (initial) => {
      const z = Math.random();               // depth: 0 far, 1 near
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 20,
        z,
        r: 0.6 + z * z * 3.2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.06 + Math.random() * 0.22) * (0.4 + z),
        a: 0.15 + Math.random() * 0.5,
        t: Math.random() * Math.PI * 2,
      };
    };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: count() }, () => spawn(true));
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.t += 0.01;
        m.x += m.vx + Math.sin(m.t) * 0.08;
        m.y += m.vy;
        if (m.y < -20 || m.x < -20 || m.x > w + 20) Object.assign(m, spawn(false));
        // brighter where the warm key light sits (upper right of the frame)
        const lit = 0.35 + 0.65 * Math.max(0, 1 - Math.hypot(m.x / w - 0.7, m.y / h - 0.3) * 1.4);
        const alpha = m.a * lit * (0.6 + 0.4 * Math.sin(m.t * 2));
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * (m.z > 0.8 ? 3 : 1.6));
        g.addColorStop(0, `rgba(255, 222, 160, ${alpha})`);
        g.addColorStop(1, 'rgba(255, 222, 160, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (m.z > 0.8 ? 3 : 1.6), 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(hero);
    requestAnimationFrame(draw);
  }

  /* ---------- hero: camera drift with the pointer ---------- */
  if (finePointer && !reduce) {
    const media = $('#heroMedia');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * -18;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -12;
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const loop = () => {
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      media.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- magnetic CTAs ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--bx', `${(e.clientX - r.left - r.width / 2) * 0.18}px`);
        btn.style.setProperty('--by', `${(e.clientY - r.top - r.height / 2) * 0.25}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--bx', '0px');
        btn.style.setProperty('--by', '0px');
      });
    });
  }

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- nav state + WhatsApp button ---------- */
  const nav = $('#nav');
  const wa = $('#waFloat');
  new IntersectionObserver(([e]) => {
    nav.classList.toggle('scrolled', !e.isIntersecting);
    wa.classList.toggle('show', !e.isIntersecting);
  }, { rootMargin: `-${Math.round(innerHeight * 0.2)}px 0px 0px 0px` }).observe($('.hero-content'));

  /* ---------- mobile menu ---------- */
  const menu = $('#mobileMenu');
  const openBtn = $('#menuOpen');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('#menuClose').focus();
  };
  openBtn.addEventListener('click', () => setMenu(true));
  $('#menuClose').addEventListener('click', () => setMenu(false));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

  /* ---------- service tiles: spotlight + book ---------- */
  $$('.tile').forEach((tile) => {
    if (finePointer) {
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
        tile.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }
    tile.addEventListener('click', () => {
      const box = $(`#bookingForm input[name="service"][value="${CSS.escape(tile.dataset.service)}"]`);
      if (box) box.checked = true;
      $('#serviceField').classList.remove('invalid');
      $('#book').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => $('#f-name').focus({ preventScroll: true }), reduce ? 0 : 900);
    });
  });

  /* ---------- symptom finder ---------- */
  const SYMPTOMS = {
    squeal: { icon: 'ph-disc', title: 'Worn brake pads or discs', text: 'That squeal is the wear indicator asking for attention. Caught early, it\'s usually just pads.', service: 'Brakes & clutch', cta: 'Book a brake check' },
    judder: { icon: 'ph-gear-fine', title: 'Warped brake discs', text: 'A shaking pedal usually means the discs have run out of true. Skimming often fixes it without new discs.', service: 'Disc skimming', cta: 'Book disc skimming' },
    pull: { icon: 'ph-steering-wheel', title: 'Wheel alignment is out', text: 'A pothole or kerb knock can throw it off. It also eats the inside of your tyres.', service: 'Wheel alignment', cta: 'Book an alignment' },
    bounce: { icon: 'ph-wrench', title: 'Tired shocks or bushes', text: 'Worn suspension means longer stopping and a car that floats. We\'ll check shocks, bushes and arms.', service: 'Suspension', cta: 'Book a suspension check' },
    rumble: { icon: 'ph-wind', title: 'A blown or rusted exhaust', text: 'A hole or loose joint gets loud fast. We repair, replace or build a free flow system.', service: 'Free flow exhaust', cta: 'Book an exhaust check' },
    start: { icon: 'ph-car-battery', title: 'A battery on its way out', text: 'Slow cranking on cold mornings is the classic sign. We test it and fit a new one if needed.', service: 'Battery', cta: 'Book a battery test' },
    clutch: { icon: 'ph-gear', title: 'A worn clutch', text: 'Revs climb but the car doesn\'t pull? The clutch plate is likely worn. We overhaul or replace it.', service: 'Brakes & clutch', cta: 'Book a clutch check' },
    tyres: { icon: 'ph-tire', title: 'Tyres, alignment or both', text: 'Uneven wear usually points to alignment. We\'ll check both and only replace what\'s needed.', service: 'Tyres', cta: 'Book a tyre check' },
    light: { icon: 'ph-engine', title: 'Time for a service', text: 'Oil, filters, plugs and a proper check-over, done on all makes.', service: 'Service', cta: 'Book a service' },
    other: { icon: 'ph-toolbox', title: 'Bring it in, we\'ll find it', text: 'Odd noise, smell or feeling? Tell us what you notice and we\'ll put it on the hoist.', service: 'Mechanical repair', cta: 'Book a check-up' },
  };
  const symCard = $('.sym-card');
  let symService = 'Brakes & clutch';
  $$('.sym-list button').forEach((b) => b.addEventListener('click', () => {
    const s = SYMPTOMS[b.dataset.sym];
    $$('.sym-list button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    $('#symIcon').innerHTML = `<i class="ph ${s.icon}"></i>`;
    $('#symTitle').textContent = s.title;
    $('#symText').textContent = s.text;
    $('#symBook span').textContent = s.cta;
    symService = s.service;
    symCard.classList.remove('swap'); void symCard.offsetWidth; symCard.classList.add('swap');
  }));
  $('#symBook').addEventListener('click', () => {
    const box = $(`#bookingForm input[name="service"][value="${CSS.escape(symService)}"]`);
    if (box) box.checked = true;
    $('#serviceField').classList.remove('invalid');
    $('#book').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => $('#f-name').focus({ preventScroll: true }), reduce ? 0 : 900);
  });

  /* footer car */
  const road = $('.road');
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { road.classList.add('in'); obs.disconnect(); }
  }, { threshold: 0 }).observe($('.footer'));

  /* ---------- portrait tilt ---------- */
  const card = $('#tilt');
  if (card && finePointer && !reduce) {
    const host = card.parentElement;
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
      card.style.setProperty('--sx', `${px * 100}%`);
      card.style.setProperty('--sy', `${py * 100}%`);
    });
    host.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  /* ---------- scroll-linked camera moves (GSAP) ---------- */
  addEventListener('load', () => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    // the camera pushes in under the car as the section passes
    gsap.fromTo('#underImg', { scale: 1.35, yPercent: -4 }, {
      scale: 1, yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '#workshop', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
    // hero drifts and dims as you leave it
    gsap.to('.hero-content', {
      yPercent: -18, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    // nav tucks away while scrolling down, returns on the way up
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => nav.classList.toggle('hide', self.direction === 1 && self.scroll() > innerHeight && !menu.classList.contains('open')),
    });
  });

  /* ---------- booking form ---------- */
  const form = $('#bookingForm');
  const formCard = $('#formCard');
  const seg = $('#seg');
  const submitBtn = $('#submitBtn');
  const status = $('#formStatus');
  const date = $('#f-date');
  const email = $('#f-email');
  let mode = 'whatsapp';

  const today = new Date();
  date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const setMode = (m) => {
    mode = m;
    formCard.dataset.mode = m;
    seg.dataset.mode = m;
    $$('button', seg).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
    email.required = m === 'email';
    submitBtn.innerHTML = m === 'email'
      ? '<i class="ph ph-paper-plane-tilt"></i><span>Send by email</span>'
      : '<i class="ph ph-whatsapp-logo"></i><span>Send on WhatsApp</span>';
    status.className = 'form-status';
    status.innerHTML = '';
  };
  $$('button', seg).forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

  const fieldOf = (el) => el.closest('.field');
  const services = () => $$('input[name="service"]:checked', form).map((i) => i.value);

  const validate = () => {
    let first = null;
    const mark = (el, bad) => {
      fieldOf(el).classList.toggle('invalid', bad);
      if (bad && !first) first = el;
    };
    mark($('#f-name'), !$('#f-name').value.trim());
    mark($('#f-phone'), $('#f-phone').value.replace(/\D/g, '').length < 9);
    if (mode === 'email') mark(email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    else fieldOf(email).classList.remove('invalid');
    mark($('#f-vehicle'), !$('#f-vehicle').value.trim());
    const noService = services().length === 0;
    $('#serviceField').classList.toggle('invalid', noService);
    if (noService && !first) first = $('#serviceField input');
    mark(date, !date.value);
    if (first) first.focus();
    return !first;
  };
  form.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('invalid')) f.classList.remove('invalid');
  });

  const fmtDate = (v) => {
    const d = new Date(`${v}T00:00:00`);
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const data = () => ({
    name: $('#f-name').value.trim(),
    phone: $('#f-phone').value.trim(),
    email: email.value.trim(),
    vehicle: $('#f-vehicle').value.trim(),
    registration: $('#f-reg').value.trim(),
    services: services().join(', '),
    date: fmtDate(date.value),
    time: $('#f-time').value,
    notes: $('#f-notes').value.trim(),
  });

  const showStatus = (ok, html) => {
    status.className = `form-status ${ok ? 'ok' : 'bad'}`;
    status.innerHTML = `<i class="ph ${ok ? 'ph-check-circle' : 'ph-warning-circle'}"></i><div>${html}</div>`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const d = data();

    if (mode === 'whatsapp') {
      const lines = [
        'Hi Quintin, I would like to book my car in at De Graaf Under-Car.',
        '',
        `*Name:* ${d.name}`,
        `*Phone:* ${d.phone}`,
        `*Vehicle:* ${d.vehicle}`,
        d.registration ? `*Registration:* ${d.registration}` : null,
        `*Needs:* ${d.services}`,
        `*Preferred date:* ${d.date}`,
        `*Preferred time:* ${d.time}`,
        d.notes ? `*Notes:* ${d.notes}` : null,
      ].filter((l) => l !== null);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
      showStatus(true, 'WhatsApp is opening with your booking filled in. Just press send, and we\'ll confirm your time.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ph ph-circle-notch spin"></i><span>Sending</span>';
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${BOOKING_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Booking request: ${d.vehicle} (${d.name})`,
          _template: 'table',
          _captcha: 'false',
          _replyto: d.email,
          Name: d.name,
          Phone: d.phone,
          Email: d.email,
          Vehicle: d.vehicle,
          Registration: d.registration || '-',
          Services: d.services,
          'Preferred date': d.date,
          'Preferred time': d.time,
          Notes: d.notes || '-',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'Request failed');
      form.reset();
      showStatus(true, `Thanks ${d.name.split(' ')[0]}, your booking request is in. We'll call or email you to confirm the time.`);
    } catch (err) {
      showStatus(false, 'That didn\'t go through. Please try WhatsApp instead, or call us on <a href="tel:+27125466660" style="color:inherit;text-decoration:underline">012 546 6660</a>.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i><span>Send by email</span>';
    }
  });
})();
