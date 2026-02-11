document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const homeBtn = document.getElementById('home-btn');
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');

    const adminPostBtn = document.getElementById('admin-post-btn');
    const adminPostScreen = document.getElementById('admin-post-screen');
    const passwordFormContainer = document.getElementById('password-form-container');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminPasswordForm = document.getElementById('admin-password-form');
    const passwordFeedback = document.getElementById('password-feedback');
    const postCreationContainer = document.getElementById('post-creation-container');
    const newPostForm = document.getElementById('new-post-form');
    const postTitleInput = document.getElementById('post-title');
    const postContentEditor = document.getElementById('post-content-editor');

    const postDetailScreen = document.getElementById('post-detail-screen');
    const postDetailTitle = document.getElementById('post-detail-title');
    const postDetailContent = document.getElementById('post-detail-content');
    const backToHomeFromPostBtn = document.getElementById('back-to-home-from-post');
    const postTitlesList = document.getElementById('post-titles-list');

    

    
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



    function goHome() {
        clearInterval(timer);
        showScreen('home-screen');
        updateMetaTags('Music Sheet Reading Practice - Sight Reading Game', '온라인 악보 읽기 연습 게임으로 계이름과 음표를 쉽고 재미있게 배워보세요. 초급부터 고급, 화음 연습까지 다양한 난이도를 제공합니다.', 'music reading, sight reading, music training, note identification, music theory, music game, treble clef, bass clef');
        displayPostTitles(); // Display posts on home screen
    }

    // --- Admin & Blog Logic ---
    const ADMIN_PASSWORD = 'sysy1121**'; 



    let blogPosts = [];

    function loadBlogPosts() {
        const storedPosts = localStorage.getItem('blogPosts');
        if (storedPosts) {
            blogPosts = JSON.parse(storedPosts);
        } else {
            blogPosts = []; // Initialize empty if nothing stored
        }

        const defaultPosts = [
            {
                id: '1',
                title: '첫 번째 블로그 게시물 (First Blog Post)',
                content: '<p>이것은 첫 번째 샘플 블로그 게시물입니다. 여기에 내용을 추가할 수 있습니다.</p><p>Welcome to your first sample blog post! You can add your content here.</p>',
                timestamp: new Date().toLocaleString(),
                description: '이것은 첫 번째 샘블 블로그 게시물입니다...',
                keywords: '첫 번째, 블로그, 샘플, 게시물',
                published: true // Explicitly mark as published
            },
            {
                id: '2',
                title: '음악 이론 학습 팁 (Music Theory Learning Tips)',
                content: '<p>음악 이론은 처음에는 어려울 수 있지만, 몇 가지 팁으로 더 쉽게 접근할 수 있습니다.</p><ul><li>매일 조금씩 연습하세요.</li><li>시창 연습을 꾸준히 하세요.</li><li>좋아하는 음악에 이론을 적용해 보세요.</li></ul><p>Music theory can be challenging at first, but a few tips can make it more accessible.</p><ul><li>Practice a little every day.</li><li>Consistently practice sight-singing.</li><li>Apply theory to your favorite music.</li></ul>',
                timestamp: new Date(Date.now() - 86400000).toLocaleString(), // One day ago
                description: '음악 이론은 처음에는 어려울 수 있지만, 몇 가지 팁으로 더 쉽게 접근할 수 있습니다...',
                keywords: '음악 이론, 학습, 팁, 연습, 시창',
                published: true // Explicitly mark as published
            }
        ];

        // Add default posts if they don't already exist
        defaultPosts.forEach(defaultPost => {
            if (!blogPosts.some(post => post.id === defaultPost.id)) {
                blogPosts.push(defaultPost);
            }
        });
        
        // Sort posts by ID in descending order (assuming ID represents creation order)
        blogPosts.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        saveBlogPosts(); // Always save to ensure defaults are persisted and displayed
    }

    function saveBlogPosts() {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    }

    function displayPostTitles() {
        postTitlesList.innerHTML = ''; // Clear existing titles
        
        // Filter to only show published posts
        const publishedPosts = blogPosts.filter(post => post.published);

        if (publishedPosts.length === 0) {
            postTitlesList.innerHTML = '<li>게시글이 없습니다. (No posts yet.)</li>';
            return;
        }

        publishedPosts.forEach(post => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.dataset.postId = post.id;
            link.textContent = post.title;
            listItem.appendChild(link);
            postTitlesList.appendChild(listItem);
        });
    }

    function renderBlogPost(postId) {
        const post = blogPosts.find(p => p.id === postId);
        if (post) {
            postDetailTitle.textContent = post.title;
            postDetailContent.innerHTML = post.content;
            showScreen('post-detail-screen');
            updateMetaTags(post.title, post.description, post.keywords);
        } else {
            alert('게시글을 찾을 수 없습니다. (Post not found.)');
            goHome();
        }
    }

    themeToggleBtn.addEventListener('click', toggleTheme);
    homeBtn.addEventListener('click', goHome);
    adminPostBtn.addEventListener('click', () => {
        showScreen('admin-post-screen');
        passwordFeedback.textContent = '';
        adminPasswordInput.value = '';
    });

    adminPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        if (adminPasswordInput.value === ADMIN_PASSWORD) {
            passwordFormContainer.style.display = 'none';
            postCreationContainer.style.display = 'block';
            passwordFeedback.textContent = '';
        } else {
            passwordFeedback.textContent = '잘못된 비밀번호입니다. (Incorrect password.)';
        }
    });

    newPostForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = postTitleInput.value;
        const content = postContentEditor.value;

        if (title.trim() && content.trim()) {
            const newPost = {
                id: Date.now().toString(), // Simple unique ID
                title: title,
                content: content,
                timestamp: new Date().toLocaleString(),
                description: content.substring(0, 150) + '...', // First 150 chars as description
                keywords: title.split(' ').join(', '),
                published: true // Explicitly mark as published
            };
            blogPosts.unshift(newPost); // Add to the beginning
            saveBlogPosts();
            displayPostTitles();
            alert('게시글이 성공적으로 작성되었습니다! (Post created successfully!)');
            postTitleInput.value = '';
            postContentEditor.value = '';
            goHome(); // Go back to home after posting
        } else {
            alert('제목과 내용을 모두 입력해주세요. (Please enter both title and content.)');
        }
    });

    postTitlesList.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.dataset.postId) {
            event.preventDefault();
            renderBlogPost(event.target.dataset.postId);
        }
    });

    backToHomeFromPostBtn.addEventListener('click', goHome);

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
    });

    loadBlogPosts(); // Load posts on initial page load
    goHome();
});