document.addEventListener('DOMContentLoaded', () => {
  // Respostas corretas do quiz
  const answers = {
      q1: '1939 a 1945',
      q2: 'Itália, Japão e Alemanha',
      q3: 'França, Reino Unido, EUA e URSS',
      q4: 'Invasão alemã da Polônia',
      q5: 'Operação Barbarossa',
      q6: '7 de dezembro de 1941',
      q7: 'Operação Overlord',
      q8: 'Adolf Hitler',
      q9: 'Batalha de Stalingrado',
      q10: 'Kristallnacht',
      q11: 'Hiroshima',
      q12: 'Neville Chamberlain e Winston Churchill',
      q13: 'Verdadeiro',
      q14: 'Conferência de Potsdam',
      q15: 'Polônia',
      q16: 'Verdadeiro',
      q17: 'Batalha do Bulge',
      q18: 'Verdadeiro',
      q19: 'Projeto Manhattan',
      q20: '8 de maio de 1945'
  };

  // Elementos DOM
  const backToTopBtn = document.getElementById('backToTop');
  const quizSection = document.querySelector('.quiz-section');
  const quizForm = document.getElementById('qf');
  const startBtn = document.getElementById('startBtn');
  const quizContent = document.getElementById('quizContent');
  const timerEl = document.getElementById('timer');

  // Timer state
  let startTime = null;
  let intervalId = null;
  let pausedAccumMs = 0;
  let pauseStart = null;

  // Utility functions
  function formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
  }

  function cleanSymbolText(text) {
      return text.replace(/[✓✖]️?\s*$/g, '').trim();
  }

  function getElapsedMs() {
      if (!startTime) return 0;
      if (pauseStart) return pauseStart - startTime - pausedAccumMs;
      return Date.now() - startTime - pausedAccumMs;
  }

  function startTimer() {
      if (!startTime) startTime = Date.now();
      if (intervalId) clearInterval(intervalId);
      
      const updateTimer = () => {
          if (timerEl) {
              timerEl.textContent = formatTime(getElapsedMs());
          }
      };
      
      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
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

  function resumeTimerAfterAlert() {
      if (!pauseStart) return;
      const pausedDuration = Date.now() - pauseStart;
      pausedAccumMs += pausedDuration;
      pauseStart = null;
      startTimer();
  }

  function shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
  }

  // Back to top button functionality
  if (backToTopBtn) {
      const scrollThreshold = 150;
      
      // Initially hide the button
      backToTopBtn.style.display = 'none';
      
      // Show/hide button based on scroll position
      window.addEventListener('scroll', () => {
          if (window.scrollY > scrollThreshold) {
              backToTopBtn.style.display = 'flex';
              backToTopBtn.classList.add('visible');
          } else {
              backToTopBtn.style.display = 'none';
              backToTopBtn.classList.remove('visible');
          }
      });

      // Smooth scroll to top when clicked
      backToTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({ 
              top: 0, 
              behavior: 'smooth' 
          });
      });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });

  // Quiz functionality
  if (quizSection && quizForm && startBtn && timerEl && quizContent) {
      
      // Start quiz button event
      startBtn.addEventListener('click', () => {
          // Shuffle answer options for each question
          for (let i = 1; i <= 20; i++) {
              const optionsContainer = document.getElementById(`o${i}`);
              if (!optionsContainer) continue;
              
              const labels = Array.from(optionsContainer.querySelectorAll('label'));
              if (labels.length <= 1) continue;
              
              const shuffledLabels = shuffleArray(labels);
              
              // Clear container and append shuffled labels
              optionsContainer.innerHTML = '';
              shuffledLabels.forEach(label => optionsContainer.appendChild(label));
          }

          // Show quiz content and start timer
          startBtn.style.display = 'none';
          quizContent.style.display = 'block';
          timerEl.style.display = 'block';
          
          // Scroll to quiz content
          quizContent.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
          });
          
          startTimer();
      });

      // Form submission handler
      quizForm.addEventListener('submit', (e) => {
          e.preventDefault();

          // Check for unanswered questions
          const unanswered = [];
          for (let i = 1; i <= 20; i++) {
              const optionsContainer = document.getElementById(`o${i}`);
              if (!optionsContainer) continue;
              
              const selectedOption = optionsContainer.querySelector('input:checked');
              if (!selectedOption) {
                  unanswered.push(i);
              }
          }

          if (unanswered.length > 0) {
              pauseTimerForAlert();
              alert(`⚠️ Você não respondeu as seguintes questões:\n${unanswered.join(', ')}`);
              resumeTimerAfterAlert();
              return;
          }

          // Stop timer and calculate results
          stopTimer();
          const elapsed = getElapsedMs();
          const timeStr = formatTime(elapsed);

          // Remove existing result banner if any
          const existingBanner = document.getElementById('resultBanner');
          if (existingBanner) {
              existingBanner.remove();
          }

          let score = 0;

          // Evaluate each question
          for (let i = 1; i <= 20; i++) {
              const questionId = `q${i}`;
              const optionsContainer = document.getElementById(`o${i}`);
              const questionContainer = document.getElementById(questionId);
              
              if (!optionsContainer || !questionContainer) continue;

              // Reset previous styling
              questionContainer.classList.remove('correct', 'incorrect');
              
              const spans = optionsContainer.querySelectorAll('label > span');
              spans.forEach(span => {
                  span.textContent = cleanSymbolText(span.textContent);
              });

              const correctAnswer = answers[questionId];
              const selectedInput = optionsContainer.querySelector('input:checked');
              let userAnswer = null;

              if (selectedInput) {
                  const label = selectedInput.closest('label');
                  const span = label ? label.querySelector('span') : null;
                  userAnswer = span ? cleanSymbolText(span.textContent) : null;
              }

              const isCorrect = userAnswer !== null && 
                              correctAnswer !== undefined && 
                              String(userAnswer) === String(correctAnswer);

              if (isCorrect) {
                  score++;
                  questionContainer.classList.add('correct');
              } else {
                  questionContainer.classList.add('incorrect');
              }

              // Mark correct and incorrect answers
              const allInputs = Array.from(optionsContainer.querySelectorAll('input'));
              allInputs.forEach(input => {
                  const label = input.closest('label');
                  if (!label) return;
                  
                  const span = label.querySelector('span');
                  if (!span) return;

                  const answerText = cleanSymbolText(span.textContent);

                  // Mark correct answer with checkmark
                  if (correctAnswer !== undefined && String(answerText) === String(correctAnswer)) {
                      span.textContent = span.textContent + ' ✓';
                  }

                  // Mark incorrect selection with X
                  if (selectedInput && input === selectedInput && !isCorrect) {
                      span.textContent = span.textContent + ' ✖';
                  }

                  // Disable all inputs
                  input.disabled = true;
              });
          }

          // After showing results banner:
        const progressBar = document.getElementById('quiz-progress');
        if (progressBar) {
            progressBar.style.display = 'none'; // hides the bar + text
        }

          // Create and display result banner
          const banner = document.createElement('div');
          banner.id = 'resultBanner';
          banner.className = 'result-banner';

          let performance = '';
          let emoji = '';
          const percentage = Math.round((score / 20) * 100);

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
              <div style="font-size: 1.5rem; margin-bottom: 1rem;">${emoji} <strong>Resultado Final</strong> ${emoji}</div>
              <div style="margin-bottom: 0.5rem;"><strong>Pontuação:</strong> ${score} / 20 (${percentage}%)</div>
              <div style="margin-bottom: 0.5rem;"><strong>Tempo:</strong> ${timeStr}</div>
              <div><strong>Avaliação:</strong> ${performance}</div>
          `;

          // Insert banner after the form
          const submitBtn = quizForm.querySelector('button[type="submit"]');
          if (submitBtn) {
              submitBtn.parentNode.insertBefore(banner, submitBtn.nextSibling);
              submitBtn.disabled = true;
              submitBtn.textContent = 'Quiz Finalizado';
              submitBtn.style.opacity = '0.6';
              submitBtn.style.cursor = 'not-allowed';
          }

          // Scroll to results
          banner.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
          });
      });
  }

  // Add loading animation for timeline iframe
  const timelineIframe = document.querySelector('.timeline-container iframe');
  if (timelineIframe) {
      timelineIframe.addEventListener('load', () => {
          timelineIframe.style.opacity = '1';
      });
      timelineIframe.style.opacity = '0';
      timelineIframe.style.transition = 'opacity 0.5s ease';
  }

  // Add intersection observer for animations
  const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
          }
      });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.stat-card, .qz-q, .footer-section').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s ease';
      observer.observe(el);
  });

  // Enhanced navbar scroll effect
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (navbar) {
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
              // Scrolling down
              navbar.style.transform = 'translateY(-100%)';
          } else {
              // Scrolling up
              navbar.style.transform = 'translateY(0)';
          }
          
          // Add background blur when scrolled
          if (currentScrollY > 50) {
              navbar.style.background = 'rgba(26, 26, 26, 0.98)';
              navbar.style.backdropFilter = 'blur(20px)';
          } else {
              navbar.style.background = 'rgba(26, 26, 26, 0.95)';
              navbar.style.backdropFilter = 'blur(10px)';
          }
      }
      
      lastScrollY = currentScrollY;
  });

  // Add keyboard navigation for quiz
  document.addEventListener('keydown', (e) => {
      // Only work when quiz is active
      if (!quizContent || quizContent.style.display === 'none') return;

      // Number keys 1-4 for selecting answers
      if (e.key >= '1' && e.key <= '4') {
          e.preventDefault();
          
          // Find currently visible question
          const questions = document.querySelectorAll('.qz-q');
          let currentQuestion = null;
          
          questions.forEach(q => {
              const rect = q.getBoundingClientRect();
              if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                  currentQuestion = q;
              }
          });
          
          if (currentQuestion) {
              const options = currentQuestion.querySelectorAll('input[type="radio"]');
              const optionIndex = parseInt(e.key) - 1;
              
              if (options[optionIndex] && !options[optionIndex].disabled) {
                  options[optionIndex].checked = true;
                  
                  // Add visual feedback
                  const label = options[optionIndex].closest('label');
                  if (label) {
                      label.style.background = 'rgba(212, 175, 55, 0.2)';
                      label.style.borderColor = 'var(--accent-gold)';
                      
                      setTimeout(() => {
                          label.style.background = 'rgba(255, 255, 255, 0.03)';
                          label.style.borderColor = 'transparent';
                      }, 300);
                  }
              }
          }
      }

      // Enter key to submit quiz (with confirmation)
      if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          const submitBtn = quizForm.querySelector('button[type="submit"]');
          if (submitBtn && !submitBtn.disabled) {
              if (confirm('Tem certeza que deseja finalizar o quiz?')) {
                  submitBtn.click();
              }
          }
      }
  });

  // Add progress indicator for quiz
  function updateQuizProgress() {
      const totalQuestions = 20;
      let answeredQuestions = 0;
      
      for (let i = 1; i <= totalQuestions; i++) {
          const optionsContainer = document.getElementById(`o${i}`);
          if (optionsContainer && optionsContainer.querySelector('input:checked')) {
              answeredQuestions++;
          }
      }
      
      // Create or update progress bar
      let progressBar = document.getElementById('quiz-progress');
      if (!progressBar) {
          progressBar = document.createElement('div');
          progressBar.id = 'quiz-progress';
          progressBar.innerHTML = `
              <div class="progress-container" style="
                  position: fixed;
                  top: 80px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 300px;
                  height: 6px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 10px;
                  z-index: 999;
                  display: none;
              ">
                  <div class="progress-fill" style="
                      height: 100%;
                      background: linear-gradient(90deg, var(--accent-gold), #f4d03f);
                      border-radius: 10px;
                      width: 0%;
                      transition: width 0.3s ease;
                  "></div>
              </div>
              <div class="progress-text" style="
                  position: fixed;
                  top: 95px;
                  left: 50%;
                  transform: translateX(-50%);
                  color: var(--accent-gold);
                  font-size: 0.9rem;
                  font-weight: bold;
                  z-index: 999;
                  display: none;
              ">0 / 20</div>
          `;
          document.body.appendChild(progressBar);
      }
      
      const progressFill = progressBar.querySelector('.progress-fill');
      const progressText = progressBar.querySelector('.progress-text');
      const progressContainer = progressBar.querySelector('.progress-container');
      
      if (quizContent && quizContent.style.display === 'block') {
          progressContainer.style.display = 'block';
          progressText.style.display = 'block';
          
          const percentage = (answeredQuestions / totalQuestions) * 100;
          progressFill.style.width = `${percentage}%`;
          progressText.textContent = `${answeredQuestions} / ${totalQuestions}`;
      } else {
          progressContainer.style.display = 'none';
          progressText.style.display = 'none';
      }
  }

  // Add event listeners to all quiz inputs for progress tracking
  document.querySelectorAll('.qz-o input[type="radio"]').forEach(input => {
      input.addEventListener('change', updateQuizProgress);
  });

  // Add hover effects to stat cards
  document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-10px) scale(1.05)';
      });
      
      card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
      });
  });

  // Add loading states and error handling
  function addLoadingState(element, text = 'Carregando...') {
      element.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 2rem;">
              <div style="
                  width: 20px;
                  height: 20px;
                  border: 2px solid var(--accent-gold);
                  border-top: 2px solid transparent;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
              "></div>
              <span>${text}</span>
          </div>
      `;
  }

  // Add spin animation to CSS if not already present
  if (!document.querySelector('#spin-animation')) {
      const style = document.createElement('style');
      style.id = 'spin-animation';
      style.textContent = `
          @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
          }
      `;
      document.head.appendChild(style);
  }

  // Enhanced error handling for timeline
  const timelineContainer = document.querySelector('.timeline-container');
  if (timelineContainer && timelineIframe) {
      // Add loading state
      addLoadingState(timelineContainer, 'Carregando linha do tempo...');
      
      timelineIframe.addEventListener('load', () => {
          timelineContainer.innerHTML = '';
          timelineContainer.appendChild(timelineIframe);
          timelineIframe.style.opacity = '1';
      });

      timelineIframe.addEventListener('error', () => {
          timelineContainer.innerHTML = `
              <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-gold);"></i>
                  <h3>Erro ao carregar a linha do tempo</h3>
                  <p>Não foi possível carregar o conteúdo. Verifique sua conexão com a internet.</p>
                  <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                      <i class="fas fa-refresh"></i> Tentar novamente
                  </button>
              </div>
          `;
      });

      // Set timeout for loading
      setTimeout(() => {
          if (timelineIframe.style.opacity !== '1') {
              timelineContainer.innerHTML = `
                  <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                      <i class="fas fa-clock" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-gold);"></i>
                      <h3>Carregamento demorado</h3>
                      <p>A linha do tempo está demorando para carregar. Isso pode ser devido à sua conexão com a internet.</p>
                      <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                          <i class="fas fa-refresh"></i> Recarregar página
                      </button>
                  </div>
              `;
          }
      }, 10000); // 10 seconds timeout
  }

  // Console welcome message
  console.log(`
  🌟 Segunda Guerra Mundial - Quiz Interativo
  ==========================================
  Desenvolvido por: Philipi e Otávio
  Turma: 3º D.S
  
  ⌨️  Atalhos do teclado no quiz:
  • 1-4: Selecionar resposta
  • Ctrl+Enter: Finalizar quiz
  
  📊 Sistema de pontuação:
  • 18-20: Excelente (🏆)
  • 15-17: Muito bom (🥇)
  • 12-14: Bom (🥈)
  • 8-11: Regular (🥉)
  • 0-7: Precisa estudar mais (📚)
  `);

  // Performance monitoring
  if ('performance' in window) {
      window.addEventListener('load', () => {
          setTimeout(() => {
              const perfData = performance.getEntriesByType('navigation')[0];
              console.log(`⚡ Página carregada em ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
          }, 0);
      });
  }

  // Hero background video handling
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
    heroVideo.addEventListener('canplay', () => {
        heroVideo.classList.add('loaded');
    });

    heroVideo.addEventListener('error', () => {
        // Hide video and fallback to default background
        heroVideo.style.display = 'none';
        document.querySelector('.hero').style.background =
            "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%)";
    });
}
});