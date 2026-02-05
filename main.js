document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const homeBtn = document.getElementById('home-btn');
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const adminBtn = document.getElementById('admin-btn');
    const adminScreen = document.getElementById('admin-screen');
    const postForm = document.getElementById('post-form');
    const postContent = document.getElementById('post-content');
    
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    const levelDisplay = document.getElementById('level-display');
    const timerDisplay = document.getElementById('timer-display');
    const staffContainer = document.getElementById('staff-container');
    const answerOptions = document.getElementById('answer-options');
    const feedback = document.getElementById('feedback');

    // --- Game State ---
    let currentDifficulty = null;
    let currentNote = null; // For single notes and chord roots
    let currentChord = null; // For advanced level
    let score = 0;
    let timer;
    let timeLeft = 10;
    let isChecking = false;

    // --- Note & Chord Data ---
    const notes = {
        C4: { p: -2 }, D4: { p: -1 }, E4: { p: 0 }, F4: { p: 1 }, G4: { p: 2 }, A4: { p: 3 }, B4: { p: 4 },
        C5: { p: 5 }, D5: { p: 6 }, E5: { p: 7 }, F5: { p: 8 }, G5: { p: 9 }, A5: { p: 10 }, B5: { p: 11 }, C6: { p: 12 },
        C2: { p: -4 }, D2: { p: -3 }, E2: { p: -2 }, F2: { p: -1 }, G2: { p: 0 }, A2: { p: 1 }, B2: { p: 2 },
        C3: { p: 3 }, D3: { p: 4 }, E3: { p: 5 }, F3: { p: 6 }, G3: { p: 7 }, A3: { p: 8 }, B3: { p: 9 },
        C4_bass: { p: 10 }, D4_bass: { p: 11 }, E4_bass: { p: 12 },
        A3_T: { p: -4 }, G3_T: { p: -5 },
        B1: { p: -5 },
        G4_bass: { p: 14 }, A4_bass: { p: 15 }
    };
    Object.keys(notes).forEach(key => {
        const noteName = key.replace('_bass', '').slice(0, 1);
        const englishMap = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B' };
        notes[key].name = key;
        notes[key].english = englishMap[noteName];
    });

    const chords = {
        treble: {
            C4: ['C4', 'E4', 'G4'], G4: ['G4', 'B4', 'D5'], F4: ['F4', 'A4', 'C5']
        },
        bass: {
            C3: ['C3', 'E3', 'G3'], G2: ['G2', 'B2', 'D3'], F2: ['F2', 'A2', 'C3']
        }
    };
    
    const solfegeMap = { C: 'DO', D: 'RE', E: 'MI', F: 'FA', G: 'SOL', A: 'LA', B: 'SI' };
    const englishNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => ({
        english: note,
        solfege: solfegeMap[note]
    }));

    const levelOrder = ['beginner_treble', 'beginner_bass', 'intermediate_1', 'intermediate_2', 'advanced'];

    const difficultySettings = {
        beginner_treble: {
            clef: 'treble',
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
            displayText: "Beginner (Treble Clef)"
        },
        beginner_bass: {
            clef: 'bass',
            notes: ['C4_bass', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'],
            displayText: "Beginner (Bass Clef)"
        },
        intermediate_1: {
            clef: 'random',
            trebleNotes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
            bassNotes: ['C4_bass', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'],
            displayText: "Intermediate 1 (Random Clef)"
        },
        intermediate_2: {
            clef: 'random',
            trebleNotesAll: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'],
            bassNotesAll: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4_bass', 'D4_bass', 'E4_bass'],
            trebleNotesTwoLedger: ['C6', 'A3_T', 'G3_T'],
            trebleNotesOneLedgerOrLess: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'],
            bassNotesTwoLedger: ['C2', 'E4_bass', 'B1', 'G4_bass', 'A4_bass'],
            bassNotesOneLedgerOrLess: ['D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4_bass', 'D4_bass'],
            displayText: "Intermediate 2 (Random Clef)"
        },
        advanced: {
            clef: 'random',
            chordRootsTreble: Object.keys(chords.treble),
            chordRootsBass: Object.keys(chords.bass),
            displayText: "Advanced (Chords)"
        }
    };

    // --- Core Logic ---
    function startGame(difficulty) {
        currentDifficulty = difficulty;
        score = 0; // Reset score for the new level
        levelDisplay.textContent = difficultySettings[difficulty].displayText;
        showScreen('game-screen');
        nextQuestion();
    }

    function nextQuestion() {
        isChecking = false;
        currentChord = null;
        clearInterval(timer);
        feedback.textContent = '';
        
        const level = difficultySettings[currentDifficulty];
        const clef = level.clef === 'random' ? (Math.random() < 0.5 ? 'treble' : 'bass') : level.clef;

        let noteToRender;
        let noteLeftPosition = '45%'; // Default for single notes

        if (currentDifficulty === 'advanced') {
            const rootNotes = clef === 'treble' ? level.chordRootsTreble : level.chordRootsBass;
            const rootNoteName = rootNotes[Math.floor(Math.random() * rootNotes.length)];
            currentNote = notes[rootNoteName]; // currentNote is the root of the chord for answer checking
            currentChord = chords[clef][rootNoteName].map(noteName => notes[noteName]);
            renderChord(currentChord, clef);
        } else if (currentDifficulty === 'intermediate_2') {
            let selectedNoteList;
            if (Math.random() < 0.4) { // 40% chance for two ledger lines
                selectedNoteList = clef === 'treble' ? level.trebleNotesTwoLedger : level.bassNotesTwoLedger;
            } else {
                selectedNoteList = clef === 'treble' ? level.trebleNotesOneLedgerOrLess : level.bassNotesOneLedgerOrLess;
            }
            const randomNoteName = selectedNoteList[Math.floor(Math.random() * selectedNoteList.length)];
            currentNote = notes[randomNoteName];
            renderSingleNote(currentNote, clef);
        } else {
            const noteNames = clef === 'treble' ? (level.trebleNotes || level.notes) : (level.bassNotes || level.notes);
            const randomNoteName = noteNames[Math.floor(Math.random() * noteNames.length)];
            currentNote = notes[randomNoteName];
            renderSingleNote(currentNote, clef);
        }
        
        generateAnswers(currentNote);
        startTimer();
    }

    // --- Rendering ---
    function renderSingleNote(note, clef, left = '45%') {
        staffContainer.innerHTML = '';
        drawStaff(clef);
        drawNote(note, left);
        drawLedgerLines(note, left);
    }
    
    function renderChord(chordNotes, clef) {
        staffContainer.innerHTML = '';
        drawStaff(clef);
        
        chordNotes.sort((a, b) => a.p - b.p);
        let lastPosition = -100;
        let alternateSide = false;

        chordNotes.forEach(note => {
            let left = '48%';
            if (Math.abs(note.p - lastPosition) <= 1) {
                alternateSide = !alternateSide;
                left = alternateSide ? '42%' : '54%';
            } else {
                alternateSide = false;
            }
            drawNote(note, left);
            drawLedgerLines(note, left);
            lastPosition = note.p;
        });
    }

    function drawStaff(clef) {
        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'staff-line';
            line.style.top = `${30 + i * 20}px`;
            staffContainer.appendChild(line);
        }
        const clefEl = document.createElement('div');
        clefEl.className = 'clef';
        clefEl.innerHTML = clef === 'treble' ? '&#x1D11E;' : '&#x1D122;';
        clefEl.style.top = clef === 'treble' ? '25px' : '45px';
        staffContainer.appendChild(clefEl);
    }

    function drawNote(note, left) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        const basePosition = 100;
        noteEl.style.top = `${basePosition - note.p * 10}px`;
        noteEl.style.left = left;
        staffContainer.appendChild(noteEl);
    }

    function drawLedgerLines(note, noteLeft) {
        const basePosition = 100;
        // Notes below staff
        if (note.p <= -2) {
            for (let p = -2; p >= note.p; p -= 2) {
                const ledger = document.createElement('div');
                ledger.className = 'ledger-line';
                ledger.style.left = `calc(${noteLeft} + 10px - 15px)`;
                ledger.style.top = `${(basePosition - p * 10) + 9}px`;
                staffContainer.appendChild(ledger);
            }
        }
        // Notes above staff
        if (note.p >= 10) {
            for (let p = 10; p <= note.p; p += 2) {
                const ledger = document.createElement('div');
                ledger.className = 'ledger-line';
                ledger.style.left = `calc(${noteLeft} + 10px - 15px)`;
                ledger.style.top = `${(basePosition - p * 10) + 9}px`;
                staffContainer.appendChild(ledger);
            }
        }
    }

    // --- UI & Timers ---
    function generateAnswers(correctNote) {
        answerOptions.innerHTML = '';
        const correctNoteInfo = {
            english: correctNote.english,
            solfege: solfegeMap[correctNote.english]
        };

        let options = new Map([[correctNoteInfo.english, correctNoteInfo]]);
        const isMobile = window.innerWidth <= 600;
        const numOptions = isMobile ? 4 : 5;
        
        while (options.size < numOptions) {
            const randomNote = englishNotes[Math.floor(Math.random() * englishNotes.length)];
            options.set(randomNote.english, randomNote);
        }

        const shuffledOptions = Array.from(options.values()).sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.innerHTML = `${opt.english}<br><span class="solfege">(${opt.solfege})</span>`;
            btn.dataset.noteName = opt.english;
            btn.addEventListener('click', () => checkAnswer(opt.english));
            answerOptions.appendChild(btn);
        });
    }

    function checkAnswer(selectedAnswer) {
        if (isChecking) return;
        isChecking = true;
        clearInterval(timer);

        if (selectedAnswer === currentNote.english) { 
            score++;
            feedback.textContent = `Correct! (${score}/30)`;
            feedback.className = 'correct';

            if (score >= 30) {
                const currentLevelIndex = levelOrder.indexOf(currentDifficulty);
                if (currentLevelIndex < levelOrder.length - 1) {
                    const nextLevel = levelOrder[currentLevelIndex + 1];
                    feedback.textContent = "Moving to the next level!";
                    feedback.className = 'correct';
                    setTimeout(() => startGame(nextLevel), 2000);
                } else {
                    feedback.textContent = "All levels completed! Congratulations!";
                    setTimeout(goHome, 2000);
                }
                return;
            }
        } else {
            feedback.textContent = 'Incorrect!';
            feedback.className = 'incorrect';
        }
        
        setTimeout(nextQuestion, 1000);
    }

    function startTimer() {
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
        timerDisplay.style.color = '';
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft < 4) {
                timerDisplay.style.color = document.body.classList.contains('dark-mode') ? 'var(--incorrect-color-dark)' : 'var(--incorrect-color-light)';
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (isChecking) return;
                isChecking = true;
                feedback.textContent = "Time's up!"; // Translate feedback
                feedback.className = 'incorrect';
                setTimeout(nextQuestion, 1000);
            }
        }, 1000);
    }
    
    function setInitialTheme() {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.add('light-mode');
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

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    // Placeholder for admin check
    function isAdmin() {
        // In a real application, this would involve proper authentication (e.g., checking a token,
        // querying a backend, or a more sophisticated client-side check).
        // For now, we'll return true to allow access.
        return true; 
    }

    function goHome() {
        clearInterval(timer);
        showScreen('home-screen');
    }

    themeToggleBtn.addEventListener('click', toggleTheme);
    homeBtn.addEventListener('click', goHome);
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
    });

    adminBtn.addEventListener('click', () => {
        if (isAdmin()) {
            showScreen('admin-screen');
        } else {
            alert('You do not have administrative privileges.');
        }
    });

    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const content = postContent.value;
        if (content.trim()) {
            console.log('New Post Content:', content);
            alert('Post submitted! (Check console for content)');
            postContent.value = ''; // Clear the textarea
        } else {
            alert('Post content cannot be empty.');
        }
    });

    setInitialTheme();
    goHome();
});