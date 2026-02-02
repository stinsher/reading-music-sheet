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
    let currentClef = 'treble'; // To store the randomly selected clef for the current question

    // --- Note Data & Definitions (expanded and corrected positions) ---
    // position: 0 corresponds to E4 (treble) or G2 (bass) - the bottom line of the staff.
    const notes = {
        // Treble Clef Notes (E4 at pos 0)
        C4: { name: 'C4', korean: '도', position: -2 }, // Two ledger lines below
        D4: { name: 'D4', korean: '레', position: -1 }, // One ledger line below
        E4: { name: 'E4', korean: '미', position: 0 },   // Bottom line
        F4: { name: 'F4', korean: '파', position: 1 },   // First space
        G4: { name: 'G4', korean: '솔', position: 2 },   // Second line
        A4: { name: 'A4', korean: '라', position: 3 },   // Second space
        B4: { name: 'B4', korean: '시', position: 4 },   // Third line
        C5: { name: 'C5', korean: '도', position: 5 },   // Third space
        D5: { name: 'D5', korean: '레', position: 6 },   // Fourth line
        E5: { name: 'E5', korean: '미', position: 7 },   // Fourth space
        F5: { name: 'F5', korean: '파', position: 8 },   // Top line
        G5: { name: 'G5', korean: '솔', position: 9 },   // One ledger line above
        A5: { name: 'A5', korean: '라', position: 10 },  // Two ledger lines above
        B5: { name: 'B5', korean: '시', position: 11 },  // Two ledger lines above
        C6: { name: 'C6', korean: '도', position: 12 },  // Three ledger lines above

        // Bass Clef Notes (G2 at pos 0)
        C2: { name: 'C2', korean: '도', position: -4 },  // Two ledger lines below
        D2: { name: 'D2', korean: '레', position: -3 },  // Two ledger lines below
        E2: { name: 'E2', korean: '미', position: -2 },  // One ledger line below
        F2: { name: 'F2', korean: '파', position: -1 },  // One ledger line below
        G2: { name: 'G2', korean: '솔', position: 0 },   // Bottom line
        A2: { name: 'A2', korean: '라', position: 1 },   // First space
        B2: { name: 'B2', korean: '시', position: 2 },   // Second line
        C3: { name: 'C3', korean: '도', position: 3 },   // Second space
        D3: { name: 'D3', korean: '레', position: 4 },   // Third line
        E3: { name: 'E3', korean: '미', position: 5 },   // Third space
        F3: { name: 'F3', korean: '파', position: 6 },   // Fourth line
        G3: { name: 'G3', korean: '솔', position: 7 },   // Fourth space
        A3: { name: 'A3', korean: '라', position: 8 },   // Top line
        B3: { name: 'B3', korean: '시', position: 9 },   // One ledger line above
        C4_bass: { name: 'C4 (Bass)', korean: '도', position: 10 }, // Two ledger lines above
        D4_bass: { name: 'D4 (Bass)', korean: '레', position: 11 }, // Two ledger lines above
        E4_bass: { name: 'E4 (Bass)', korean: '미', position: 12 }, // Three ledger lines above
    };

    const koreanNotes = ['도', '레', '미', '파', '솔', '라', '시'];

    // Updated difficulty settings
    const difficultySettings = {
        beginner: {
            trebleNotes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'], // No ledger lines
            bassNotes: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'],   // No ledger lines
            clefDisplay: '높은/낮은음자리표 (랜덤)'
        },
        intermediate: {
            trebleNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], // Up to 2 ledger lines (C4, A5)
            bassNotes: ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4_bass'], // Up to 2 ledger lines (E2, C4)
            clefDisplay: '높은/낮은음자리표 (랜덤)'
        },
        advanced: {
            trebleNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'], // Up to 3 ledger lines
            bassNotes: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4_bass', 'D4_bass', 'E4_bass'], // Up to 3 ledger lines
            clefDisplay: '높은/낮은음자리표 (랜덤)'
        },
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
        levelDisplay.textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} / ${difficultySettings[difficulty].clefDisplay}`;
        showScreen('game-screen');
        nextQuestion();
    }
    
    function nextQuestion() {
        isChecking = false;
        clearInterval(timer);
        feedback.textContent = '';
        
        currentClef = Math.random() < 0.5 ? 'treble' : 'bass'; // Randomly select clef for the question

        const levelNoteNames = currentClef === 'treble' ? difficultySettings[currentDifficulty].trebleNotes : difficultySettings[currentDifficulty].bassNotes;
        
        const randomNoteName = levelNoteNames[Math.floor(Math.random() * levelNoteNames.length)];
        currentNote = notes[randomNoteName];
        
        renderNote(currentNote, currentClef);
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
        const basePosition = 100; // Corrected base position for centering 20px notes on lines.
        const notePosition = basePosition - note.position * 10;
        noteEl.style.top = `${notePosition}px`;
        staffContainer.appendChild(noteEl);

        // Draw Ledger Lines based on position
        // Notes below the staff (position < 0)
        if (note.position < 0) {
            for (let i = 0; i >= note.position; i -= 2) {
                const ledger = document.createElement('div');
                ledger.className = 'ledger-line';
                // Ledger lines at 110px, 130px, 150px etc.
                ledger.style.top = `${basePosition - i * 10 + 10}px`; // +10 to center on note
                staffContainer.appendChild(ledger);
            }
        }
        // Notes above the staff (position > 8, where 8 is the top staff line F5/A3)
        if (note.position > 8) {
            for (let i = 8; i <= note.position; i += 2) {
                const ledger = document.createElement('div');
                ledger.className = 'ledger-line';
                // Ledger lines at 30px, 10px, -10px etc.
                ledger.style.top = `${basePosition - i * 10 + 10}px`; // +10 to center on note
                staffContainer.appendChild(ledger);
            }
        }
    }
    
    function generateAnswers(correctNote) {
        answerOptions.innerHTML = '';
        
        let options = new Set();
        options.add(correctNote.korean);
        
        // Ensure 5 unique options
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