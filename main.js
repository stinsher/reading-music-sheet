document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const homeBtn = document.getElementById('home-btn');
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    const levelDisplay = document.getElementById('level-display');
    const timerDisplay = document.getElementById('timer-display');
    const staffContainer = document.getElementById('staff-container');
    const answerOptions = document.getElementById('answer-options');
    const feedback = document.getElementById('feedback');

    // --- Game State ---
    let currentDifficulty = null;
    let currentNote = null;
    let timer;
    let timeLeft = 10;
    let isChecking = false; // Prevent multiple clicks

    // --- Note Data & Definitions (with corrected positions) ---
    const notes = {
        // Treble Clef Notes
        C4: { name: 'C4', korean: '도', position: -2 },
        D4: { name: 'D4', korean: '레', position: -1 },
        E4: { name: 'E4', korean: '미', position: 0 },
        F4: { name: 'F4', korean: '파', position: 1 },
        G4: { name: 'G4', korean: '솔', position: 2 },
        A4: { name: 'A4', korean: '라', position: 3 },
        B4: { name: 'B4', korean: '시', position: 4 },
        C5: { name: 'C5', korean: '도', position: 5 },
        D5: { name: 'D5', korean: '레', position: 6 },
        E5: { name: 'E5', korean: '미', position: 7 },
        F5: { name: 'F5', korean: '파', position: 8 },
        G5: { name: 'G5', korean: '솔', position: 9 },
        A5: { name: 'A5', korean: '라', position: 10 },

        // Bass Clef Notes
        G2: { name: 'G2', korean: '솔', position: 0 },
        A2: { name: 'A2', korean: '라', position: 1 },
        B2: { name: 'B2', korean: '시', position: 2 },
        C3: { name: 'C3', korean: '도', position: 3 },
        D3: { name: 'D3', korean: '레', position: 4 },
        E3: { name: 'E3', korean: '미', position: 5 },
        F3: { name: 'F3', korean: '파', position: 6 },
        G3: { name: 'G3', korean: '솔', position: 7 },
        A3: { name: 'A3', korean: '라', position: 8 },
        B3: { name: 'B3', korean: '시', position: 9 },
        C4_bass: { name: 'C4', korean: '도', position: 10 }, // Keyed for uniqueness
    };

    const koreanNotes = ['도', '레', '미', '파', '솔', '라', '시'];

    const difficultySettings = {
        beginner: { clef: 'treble', notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
        intermediate: { clef: 'treble', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
        advanced: { clef: 'bass', notes: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4_bass'] },
    };
    
    // --- Theme (Dark/Light Mode) ---
    function setInitialTheme() {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (localStorage.getItem('theme') === 'dark' || (localStorage.getItem('theme') === null && prefersDark)) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
    }

    function toggleTheme() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '🌙';
        } else {
            document.body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '☀️';
        }
    }

    // --- Screen Navigation ---
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    function goHome() {
        clearInterval(timer);
        showScreen('home-screen');
    }

    // --- Game Logic ---
    function startGame(difficulty) {
        currentDifficulty = difficulty;
        const levelName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        const clefType = difficultySettings[difficulty].clef === 'treble' ? '높은음자리표' : '낮은음자리표';
        levelDisplay.textContent = `${levelName} / ${clefType}`;
        showScreen('game-screen');
        nextQuestion();
    }
    
    function nextQuestion() {
        isChecking = false;
        clearInterval(timer);
        feedback.textContent = '';
        
        const levelNotes = difficultySettings[currentDifficulty].notes;
        const randomNoteName = levelNotes[Math.floor(Math.random() * levelNotes.length)];
        currentNote = notes[randomNoteName];
        
        renderNote(currentNote, difficultySettings[currentDifficulty].clef);
        generateAnswers(currentNote);
        startTimer();
    }

    function renderNote(note, clef) {
        staffContainer.innerHTML = '';
        const isTreble = clef === 'treble';
        
        // Draw 5 staff lines
        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'staff-line';
            line.style.top = `${30 + i * 20}px`;
            staffContainer.appendChild(line);
        }

        // Draw Clef
        const clefEl = document.createElement('div');
        clefEl.className = 'clef';
        clefEl.innerHTML = isTreble ? '&#x1D11E;' : '&#x1D122;'; // Treble and Bass clef unicode
        clefEl.style.top = isTreble ? '25px' : '45px';
        staffContainer.appendChild(clefEl);

        // Draw Note
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        const basePosition = 110; // Base position for Treble E4 or Bass G2 (bottom line of staff)
        const notePosition = basePosition - note.position * 10;
        noteEl.style.top = `${notePosition}px`;
        staffContainer.appendChild(noteEl);

        // Draw Ledger Lines based on position
        if (note.position <= -2) { // Treble C4
             const ledger = document.createElement('div');
             ledger.className = 'ledger-line';
             ledger.style.top = `${basePosition - -2 * 10 + 8}px`;
             staffContainer.appendChild(ledger);
        }
        if (note.position >= 10) { // Treble A5 or Bass C4
             const ledger = document.createElement('div');
             ledger.className = 'ledger-line';
             ledger.style.top = `${basePosition - 10 * 10 + 8}px`;
             staffContainer.appendChild(ledger);
        }
    }
    
    function generateAnswers(correctNote) {
        answerOptions.innerHTML = '';
        
        let options = new Set();
        options.add(correctNote.korean);
        
        while (options.size < 5) {
            const randomKoreanNote = koreanNotes[Math.floor(Math.random() * koreanNotes.length)];
            options.add(randomKoreanNote);
        }
        
        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => checkAnswer(opt));
            answerOptions.appendChild(btn);
        });
    }

    function checkAnswer(selectedAnswer) {
        if (isChecking) return;
        isChecking = true;
        clearInterval(timer);

        if (selectedAnswer === currentNote.korean) {
            feedback.textContent = '정답!';
            feedback.className = 'correct';
            setTimeout(nextQuestion, 1000);
        } else {
            feedback.textContent = '오답!';
            feedback.className = 'incorrect';
            setTimeout(() => {
                feedback.textContent = '';
                isChecking = false;
                startTimer(); // Restart timer for the same question
            }, 1500);
        }
    }

    function startTimer() {
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
        timerDisplay.style.color = '';

        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft < 4) {
                timerDisplay.style.color = document.body.classList.contains('dark-mode') ? 
                    'var(--incorrect-color-dark)' : 'var(--incorrect-color-light)';
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (!isChecking) { // Ensure checkAnswer hasn't already been triggered
                    isChecking = true;
                    feedback.textContent = "시간 초과!";
                    feedback.className = 'incorrect';
                    setTimeout(() => {
                        feedback.textContent = '';
                        isChecking = false;
                        startTimer(); // Restart timer for the same question
                    }, 1500);
                }
            }
        }, 1000);
    }

    // --- Event Listeners ---
    themeToggleBtn.addEventListener('click', toggleTheme);
    homeBtn.addEventListener('click', goHome);
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            startGame(btn.dataset.difficulty);
        });
    });

    // --- Initialize ---
    setInitialTheme();
    showScreen('home-screen');
});