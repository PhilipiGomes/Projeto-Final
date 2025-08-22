document.addEventListener('DOMContentLoaded', () => {
  // Respostas corretas do quiz
  const answers = {
    q1:  '1939 a 1945',
    q2:  'Itália, Japão e Alemanha',
    q3:  'França, Reino Unido, EUA e URSS',
    q4:  'Invasão alemã da Polônia',
    q5:  'Operação Barbarossa',
    q6:  '7 de dezembro de 1941',
    q7:  'Operação Overlord',
    q8:  'Adolf Hitler',
    q9:  'Batalha de Stalingrado',
    q10: 'Kristallnacht',
    q11: 'Hiroshima',
    q12: 'Résistance',
    q13: 'Verdadeiro',
    q14: 'Conferência de Potsdam',
    q15: 'Polônia',
    q16: 'Verdadeiro',
    q17: 'Batalha do Bulge',
    q18: 'Falso',
    q19: 'Projeto Manhattan',
    q20: '8 de maio de 1945'
  };

  const btnTop = document.querySelector('.btn-top');
  const quizSection = document.querySelector('.qz');
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
    return text.replace(/[✔✖]️?\s*$/g, '').trim();
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

  // Back to top button
  const scrollThreshold = 150;
  if (btnTop) {
    btnTop.style.display = 'none';
    window.addEventListener('scroll', () => {
      btnTop.style.display = window.scrollY > scrollThreshold ? 'flex' : 'none';
    });
    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Quiz setup
  if (quizSection && quizForm) {
    quizSection.style.display = 'none';

    const startWrapper = document.createElement('div');
    startWrapper.id = 'start-wrapper';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.id = 'startBtn';
    startBtn.innerHTML = '🚀 Começar Quiz';
    startBtn.className = 'start-btn';

    // Timer flutuante
    const timerEl = document.createElement('div');
    timerEl.id = 'quiz-timer';
    timerEl.innerHTML = '⏱️ 00:00';
    Object.assign(timerEl.style, {
      display: 'none',
      position: 'fixed',
      right: '20px',
      bottom: '90px',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      border: '2px solid #d4af37',
      borderRadius: '8px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
      fontFamily: 'Orbitron, monospace',
      color: '#d4af37',
      fontWeight: '700',
      fontSize: '1.1rem',
      zIndex: '1100'
    });

    startWrapper.appendChild(startBtn);
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
      // Embaralhar alternativas
      for (let i = 1; i <= 20; i++) {
        if (i === 13 || i === 16 || i === 18){
          continue;
        }
        const oEl = document.getElementById(`o${i}`);
        if (!oEl) continue;
        const labels = Array.from(oEl.querySelectorAll('label'));
        if (labels.length <= 1) continue;
        const shuffled = shuffleArray(labels.slice());
        oEl.innerHTML = '';
        shuffled.forEach(l => oEl.appendChild(l));
      }

      // Mostrar quiz e iniciar timer
      startWrapper.style.display = 'none';
      timerEl.style.display = 'block';
      quizSection.style.display = 'block';
      quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      startTimer(timerEl);
    });

    // Submit do quiz
    const submitBtn = quizForm.querySelector('button[type="submit"]');
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Verificar questões não respondidas
      const unanswered = [];
      for (let i = 1; i <= 20; i++) {
        const oEl = document.getElementById(`o${i}`);
        if (!oEl) continue;
        const selected = oEl.querySelector('input:checked');
        if (!selected) unanswered.push(i);
      }

      if (unanswered.length > 0) {
        pauseTimerForAlert();
        alert(`⚠️ Você não respondeu as seguintes questões:\n${unanswered.join(', ')}`);
        resumeTimerAfterAlert(timerEl);
        return;
      }

      // Avaliar respostas
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
        } else {
          qEl.classList.add('incorrect');
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

      // Banner de resultado
      const banner = document.createElement('div');
      banner.id = 'resultBanner';
      banner.className = 'result-banner';
      
      let performance = '';
      let emoji = '';
      if (score >= 18) {
        performance = 'Excelente! Você é um expert em História!';
        emoji = '🏆';
      } else if (score >= 15) {
        performance = 'Muito bem! Ótimo conhecimento histórico!';
        emoji = '🥇';
      } else if (score >= 12) {
        performance = 'Bom trabalho! Continue estudando!';
        emoji = '🥈';
      } else if (score >= 8) {
        performance = 'Regular. Revise alguns tópicos.';
        emoji = '🥉';
      } else {
        performance = 'Precisa estudar mais sobre a Segunda Guerra.';
        emoji = '📚';
      }
      
      banner.innerHTML = `
        ${emoji} <strong>Resultado Final</strong> ${emoji}<br>
        <strong>Pontuação:</strong> ${score} / 20 (${Math.round((score/20)*100)}%)<br>
        <strong>Tempo:</strong> ${timeStr}<br>
        <strong>Avaliação:</strong> ${performance}
      `;
      
      if (submitBtn) submitBtn.parentNode.insertBefore(banner, submitBtn.nextSibling);
      if (submitBtn) submitBtn.disabled = true;
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});