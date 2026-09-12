/* Veloso Solar — interações do site */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Reveal ao rolar ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-in'); }, (i % 4) * 90);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores ---------- */
  var counters = document.querySelectorAll('.count');
  function runCounter(el) {
    var to = parseFloat(el.dataset.to);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = format(to) + suffix; return; }
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(to * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function format(n) { return n.toLocaleString('pt-BR'); }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Simulador de economia ----------
     Premissas (região de São Raimundo Nonato / PI):
       irradiação média 5,8 kWh/m²·dia
       performance ratio 0,78
       módulo de 580 Wp
       custo instalado decrescente por porte
  */
  var form = document.getElementById('sim-form');
  if (form) {
    var contaInput = document.getElementById('conta');
    var range = document.getElementById('conta-range');
    var outMes = document.getElementById('out-mes');
    var outKwp = document.getElementById('out-kwp');
    var outMod = document.getElementById('out-mod');
    var outInv = document.getElementById('out-inv');
    var outPay = document.getElementById('out-pay');
    var out25 = document.getElementById('out-25');
    var cta = document.getElementById('sim-cta');

    var TARIFA = { res: 0.92, com: 0.96, rur: 0.82 };   // R$/kWh médio com tributos
    var MINIMO = { res: 30, com: 100, rur: 30 };        // kWh de custo de disponibilidade
    var IRRAD = 5.8, PR = 0.78, MOD_WP = 580;

    var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

    function tipo() {
      var el = form.querySelector('input[name="tipo"]:checked');
      return el ? el.value : 'res';
    }

    function custoPorKwp(kwp) {
      if (kwp <= 5) return 5400;
      if (kwp <= 15) return 5000;
      if (kwp <= 50) return 4700;
      return 4200;
    }

    function calcular() {
      var t = tipo();
      var conta = parseFloat(contaInput.value);
      if (!isFinite(conta) || conta < 100) conta = 100;

      var tarifa = TARIFA[t];
      var consumo = conta / tarifa;                       // kWh/mês
      var compensavel = Math.max(consumo - MINIMO[t], 0); // kWh que o sistema substitui
      var kwp = compensavel / (IRRAD * 30 * PR);
      kwp = Math.max(Math.round(kwp * 10) / 10, 0.6);

      var modulos = Math.ceil((kwp * 1000) / MOD_WP);
      var investimento = kwp * custoPorKwp(kwp);
      var economiaMes = compensavel * tarifa;
      var payback = investimento / (economiaMes * 12);
      var total25 = economiaMes * 12 * 25;

      outMes.textContent = brl.format(economiaMes);
      outKwp.textContent = kwp.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kWp';
      outMod.textContent = modulos + (modulos === 1 ? ' módulo' : ' módulos');
      outInv.textContent = brl.format(investimento);
      outPay.textContent = payback < 1
        ? 'menos de 1 ano'
        : payback.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' anos';
      out25.textContent = brl.format(total25);

      var rotulo = { res: 'residencial', com: 'comercial', rur: 'rural' }[t];
      var msg = 'Olá! Simulei no site: conta de ' + brl.format(conta) + '/mês (' + rotulo +
        '). O simulador indicou um sistema de ' + outKwp.textContent + '. Quero o orçamento exato.';
      cta.href = 'https://wa.me/5586981789161?text=' + encodeURIComponent(msg);

      // trilha preenchida do slider
      var min = +range.min, max = +range.max;
      var pct = ((Math.min(Math.max(conta, min), max) - min) / (max - min)) * 100;
      range.style.setProperty('--pct', pct + '%');
    }

    contaInput.addEventListener('input', function () {
      if (contaInput.value !== '') range.value = Math.min(Math.max(+contaInput.value, +range.min), +range.max);
      calcular();
    });
    contaInput.addEventListener('blur', function () {
      var v = parseFloat(contaInput.value);
      if (!isFinite(v) || v < 100) contaInput.value = 100;
      calcular();
    });
    range.addEventListener('input', function () {
      contaInput.value = range.value;
      calcular();
    });
    form.querySelectorAll('input[name="tipo"]').forEach(function (r) {
      r.addEventListener('change', calcular);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    calcular();
  }

  /* ---------- FAQ: só um aberto por vez ---------- */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqItems.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });
})();
