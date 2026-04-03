const masterQuestionBank = [
    { q: "ශ්‍රී ලංකාවේ ජාතික ගස කුමක්ද?", options: ["නා", "බෝ", "කොඩොල්", "පොල්"], correct: 0 },
    { q: "ලෝකයේ විශාලතම සාගරය කුමක්ද?", options: ["අත්ලාන්තික්", "ශාන්තිකර", "ඉන්දියන්", "ආක්ටික්"], correct: 1 },
    { q: "ශ්‍රී ලංකාවේ ජාතික සත්වයා කවුද?", options: ["අලියා", "වලහා", "වලිකුකුළා", "කොටියා"], correct: 2 }
];

let shuffled = [], current = 0, score = 0, isAnswered = false, timer, timeLeft = 5, selectedSubj = "";
let difficultyTime = 5, sessionLimit = 100;

window.onload = () => { 
    history.replaceState({ screen: 'menu-screen' }, "", "");
    setTimeout(() => { 
        const start = document.getElementById('start-screen');
        start.style.transition = "opacity 0.5s";
        start.style.opacity = "0";
        setTimeout(() => {
            start.style.display = "none";
            showScreen('menu-screen', true); 
        }, 500);
    }, 4000); 
};

window.onpopstate = function(event) {
    const quizScreen = document.getElementById('quiz-container');
    if (quizScreen.classList.contains('active')) {
        if (confirm("Exit quiz and lose progress?")) {
            showScreen('menu-screen');
        } else {
            history.pushState({ screen: 'quiz-container' }, "", "");
        }
        return;
    }
    if (event.state && event.state.screen) {
        showScreen(event.state.screen, true);
    } else {
        showScreen('menu-screen', true);
    }
};

function handleBackRequest() {
    if (confirm("Exit quiz? Progress will be lost.")) {
        showScreen('term-screen');
    }
}

function showScreen(screenId, isBack = false) {
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(screenId);

    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
            currentScreen.style.display = "none";
            
            targetScreen.style.display = "flex";
            targetScreen.classList.add('active');
        }, 300);
    } else {
        document.querySelectorAll('.screen').forEach(s => {
            s.style.display = "none";
            s.classList.remove('active');
        });
        targetScreen.style.display = "flex";
        targetScreen.classList.add('active');
    }
    
    if (!isBack) history.pushState({ screen: screenId }, "", "");
}

function toggleSettings(show) {
    const overlay = document.getElementById('settings-overlay');
    overlay.style.display = show ? "flex" : "none";
    if (!show) {
        difficultyTime = parseInt(document.getElementById('diff-select').value);
        sessionLimit = parseInt(document.getElementById('limit-select').value);
    }
}

function goHome() { showScreen('menu-screen'); }
function showGrades() { showScreen('grade-screen'); }
function selectGrade() { showScreen('subject-screen'); }
function showTerms(subj) { if(subj) selectedSubj = subj; showScreen('term-screen'); }

function startGame() {
    showScreen('quiz-container');
    document.getElementById('active-subj').innerText = selectedSubj || "Geography";
    let tempShuffled = [...masterQuestionBank].sort(() => Math.random() - 0.5);
    shuffled = tempShuffled.slice(0, sessionLimit); 
    current = 0; score = 0;
    loadQuestion();
}

function loadQuestion() {
    isAnswered = false;
    document.getElementById('main-submit').style.visibility = "visible";
    document.getElementById('feedback').innerText = "";
    const data = shuffled[current];
    document.getElementById('q-idx').innerText = current + 1;
    document.getElementById('q-text').innerText = data.q;
    const labels = document.querySelectorAll('.opt-row');
    const texts = document.querySelectorAll('.yasiru');
    labels.forEach((label, i) => {
        texts[i].innerText = data.options[i];
        texts[i].classList.remove('correct-text', 'wrong-text');
        const radio = document.getElementById(`o${i}`);
        radio.checked = false; radio.disabled = false;
    });
    startTimer();
}

function startTimer() {
    clearInterval(timer); timeLeft = difficultyTime;
    document.getElementById('timer-box').innerText = `Time: ${timeLeft < 10 ? '0' + timeLeft : timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-box').innerText = `Time: ${timeLeft < 10 ? '0' + timeLeft : timeLeft}s`;
        if(timeLeft <= 0) { 
            clearInterval(timer); 
            highlightCorrect(); 
            handleEnd("ඔබගේ කාලය අවසන්!", false); 
        }
    }, 1000);
}

function check() {
    if(isAnswered) return;
    let sel = -1;
    for(let i=0; i<4; i++) if(document.getElementById(`o${i}`).checked) sel = i;
    
    if(sel === -1) {
        const f = document.getElementById('feedback');
        f.innerText = "කරුණාකර පිළිතුරක් තෝරන්න!";
        f.style.color = "var(--error-red)";
        return;
    }

    clearInterval(timer);
    const cor = shuffled[current].correct;
    const texts = document.querySelectorAll('.yasiru');
    if(sel === cor) { 
        score++; 
        texts[sel].classList.add('correct-text'); 
        handleEnd("ඔබගේ පිළිතුර නිවැරදියි!", true); 
    } 
    else { 
        texts[sel].classList.add('wrong-text'); 
        highlightCorrect(); 
        handleEnd("ඔබගේ පිළිතුර වැරදියි!", false); 
    }
}

function highlightCorrect() {
    const cor = shuffled[current].correct;
    document.querySelectorAll('.yasiru')[cor].classList.add('correct-text');
}

function handleEnd(msg, isCorrect) {
    isAnswered = true;
    document.getElementById('main-submit').style.visibility = "hidden";
    for(let i=0; i<4; i++) document.getElementById(`o${i}`).disabled = true;
    const f = document.getElementById('feedback');
    f.innerText = msg; f.style.color = isCorrect ? "var(--success-green)" : "var(--error-red)";
    setTimeout(() => {
        current++;
        if(current < shuffled.length) { 
            loadQuestion(); 
            document.getElementById('live-score').innerText = Math.round((score/shuffled.length)*100) + "%"; 
        } else { 
            showScreen('result-screen'); 
            document.getElementById('final-score').innerText = Math.round((score/shuffled.length)*100) + "%"; 
        }
    }, 2000);
}
