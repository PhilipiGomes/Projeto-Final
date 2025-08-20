document.addEventListener('DOMContentLoaded', () => {
  const answers = {
    q1: '1939 a 1945',
    q2: 'Lorem ipsum A',
    q3: 'Lorem ipsum B',
    q4: 'Lorem ipsum C',
    q5: 'Lorem ipsum D',
    q6: 'Lorem ipsum A',
    q7: 'Lorem ipsum B',
    q8: 'Lorem ipsum C',
    q9: 'Lorem ipsum D',
    q10: 'Lorem ipsum A',
    q11: 'Lorem ipsum B',
    q12: 'Lorem ipsum C',
    q13: 'Lorem ipsum D',
    q14: 'Lorem ipsum A',
    q15: 'Lorem ipsum B',
    q16: 'Lorem ipsum C',
    q17: 'Lorem ipsum D',
    q18: 'Lorem ipsum A',
    q19: 'Lorem ipsum B',
    q20: 'Lorem ipsum C'
  };

  const btnTop = document.querySelector('.btn-top') || document.querySelector('.bt');
  const quizSection = document.querySelector('.qz') || document.querySelector('.quiz-section');
  const quizForm = document.getElementById('qf');

  // Timer state
  let startTime = null;
  let intervalId = null;
  let pausedAccumMs = 0;
  let pauseStart = null;

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  }

  function cleanSymbolText(text) {
    return text.replace(/[✔✖]\uFE0F?\s*$/g, '').trim();
  }

  function getElapsedMs() {
    if (!startTime) return 0;
    if (pauseStart) return pauseStart - startTime - pausedAccumMs;
    return Date.now() - startTime - pausedAccumMs;
  }

  function startTimer(timerEl) {
    if (!startTime) startTime = Date.now();
    if (intervalId) clearInterval(intervalId);
    timerEl.textContent = formatTime(getElapsedMs());
    intervalId = setInterval(() => {
      timerEl.textContent = formatTime(getElapsedMs());
    }, 250);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function pauseTimerForAlert() {
    if (pauseStart) return;
    pauseStart = Date.now();
    stopTimer();
  }

  function resumeTimerAfterAlert(timerEl) {
    if (!pauseStart) return;
    const pausedNow = Date.now() - pauseStart;
    pausedAccumMs += pausedNow;
    pauseStart = null;
    startTimer(timerEl);
  }

  // ---------------- Btn-top (mostrar após um scroll menor) ----------------
  const scrollThreshold = 150; // novo valor solicitado
  if (btnTop) {
    btnTop.style.display = 'none';
    window.addEventListener('scroll', () => {
      btnTop.style.display = window.scrollY > scrollThreshold ? 'block' : 'none';
    });
    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------------- Quiz: start, randomizar e timer flutuante ----------------
  if (quizSection && quizForm) {
    quizSection.style.display = 'none';

    const startWrapper = document.createElement('div');
    startWrapper.id = 'start-wrapper';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.id = 'startBtn';
    startBtn.textContent = 'Começar Quiz';
    startBtn.className = 'start-btn';

    // timer flutuante criado aqui — ficará fixo na tela quando visível
    const timerEl = document.createElement('div');
    timerEl.id = 'quiz-timer';
    timerEl.textContent = '00:00';
    // estilo inline para garantir posição fixa sem alterar CSS externo
    Object.assign(timerEl.style, {
      display: 'none',
      position: 'fixed',
      right: '20px',
      bottom: '90px',
      padding: '6px 10px',
      background: '#ffffff',
      border: '1px solid #ddd',
      borderRadius: '6px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
      fontFamily: 'monospace',
      zIndex: 1100,
      fontWeight: '600'
    });

    startWrapper.appendChild(startBtn);
    // insert timer in DOM so it floats independently
    document.body.appendChild(timerEl);
    quizSection.parentNode.insertBefore(startWrapper, quizSection);

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    startBtn.addEventListener('click', () => {
      // randomizar alternativas em cada pergunta
      for (let i = 1; i <= 20; i++) {
        const oEl = document.getElementById(`o${i}`);
        if (!oEl) continue;
        const labels = Array.from(oEl.querySelectorAll('label'));
        if (labels.length <= 1) continue;
        const shuffled = shuffleArray(labels.slice());
        oEl.innerHTML = '';
        shuffled.forEach(l => oEl.appendChild(l));
      }

      // mostrar quiz e iniciar timer flutuante
      startBtn.style.display = 'none';
      timerEl.style.display = 'block';
      quizSection.style.display = 'block';
      quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      startTimer(timerEl);
    });

    // Envio: checagem, pausa durante alert e correção
    const submitBtn = quizForm.querySelector('button[type="submit"]');
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // verificar não respondidas
      const unanswered = [];
      for (let i = 1; i <= 20; i++) {
        const oEl = document.getElementById(`o${i}`);
        if (!oEl) continue;
        const selected = oEl.querySelector('input:checked');
        if (!selected) unanswered.push(i);
      }

      if (unanswered.length > 0) {
        pauseTimerForAlert();
        alert('Você não respondeu as seguintes questões:\n' + unanswered.join(', '));
        resumeTimerAfterAlert(timerEl);
        return;
      }

      // todas respondidas -> avaliar
      stopTimer();
      const elapsed = getElapsedMs();
      const timeStr = formatTime(elapsed);

      const existing = document.getElementById('resultBanner');
      if (existing) existing.remove();

      let score = 0;
      for (let i = 1; i <= 20; i++) {
        const qId = `q${i}`;
        const oEl = document.getElementById(`o${i}`);
        const qEl = document.getElementById(qId);
        if (!oEl || !qEl) continue;

        qEl.classList.remove('correct', 'incorrect');
        qEl.style.background = '';
        const spans = oEl.querySelectorAll('label > span');
        spans.forEach(sp => { sp.textContent = cleanSymbolText(sp.textContent); });

        const correctText = answers[qId];
        const selectedInput = oEl.querySelector('input:checked');
        let userText = null;
        if (selectedInput) {
          const lab = selectedInput.closest('label');
          const sp = lab ? lab.querySelector('span') : null;
          userText = sp ? cleanSymbolText(sp.textContent) : null;
        }

        const isCorrect = (userText !== null && correctText !== undefined && String(userText) === String(correctText));
        if (isCorrect) {
          score++;
          qEl.classList.add('correct');
          qEl.style.background = '#eafaf0';
        } else {
          qEl.classList.add('incorrect');
          qEl.style.background = '#fff1f1';
        }

        const inputs = Array.from(oEl.querySelectorAll('input'));
        inputs.forEach(inp => {
          const lab = inp.closest('label');
          if (!lab) return;
          const sp = lab.querySelector('span');
          if (!sp) return;

          if (correctText !== undefined && String(cleanSymbolText(sp.textContent)) === String(correctText)) {
            sp.textContent = sp.textContent + ' ✔️';
          }
          if (selectedInput && inp === selectedInput && !isCorrect) {
            sp.textContent = sp.textContent + ' ✖️';
          }
          inp.disabled = true;
        });
      }

      const banner = document.createElement('div');
      banner.id = 'resultBanner';
      banner.className = 'result-banner';
      banner.innerHTML = `<strong>Pontuação:</strong> ${score} / 20 &nbsp; — &nbsp; <strong>Tempo:</strong> ${timeStr}`;
      if (submitBtn) submitBtn.parentNode.insertBefore(banner, submitBtn.nextSibling);
      if (submitBtn) submitBtn.disabled = true;
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});
