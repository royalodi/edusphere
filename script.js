// Course and Quiz Mock Database
const coursesDb = [
    {
        id: 1,
        title: "Mastering JavaScript ES6+ & Beyond",
        category: "development",
        rating: 4.9,
        instructor: "Dr. Sarah Dev",
        lessons: [
            { id: 101, title: "Modern ES6 Variable Declarations (const/let)", completed: false },
            { id: 102, title: "Arrow Functions & Lexical 'this' scoping", completed: false },
            { id: 103, title: "Deep Dive into Promises & Async/Await", completed: false },
            { id: 104, title: "JavaScript Classes & ES Modules", completed: false }
        ],
        quiz: [
            {
                question: "Which keyword declarations allow block-scoped reassignable variables in JavaScript?",
                options: ["var", "let", "const", "define"],
                answer: 1 // let
            },
            {
                question: "What is the primary benefit of Async/Await patterns over standard Promise chaining?",
                options: ["Faster code execution", "Write clean asynchronous code that looks synchronous", "Bypass the event loop completely", "Allows multiple threads processing"],
                answer: 1 // second option
            }
        ]
    },
    {
        id: 2,
        title: "Advanced UI/UX Glassmorphic Designs",
        category: "design",
        rating: 4.8,
        instructor: "Elena Vance (Creative Director)",
        lessons: [
            { id: 201, title: "Visual Depth & Glassmorphism Blur Styling", completed: false },
            { id: 202, title: "Picking Harmonious HSL Color Gradients", completed: false },
            { id: 203, title: "CSS Keyframes & Micro-Animations", completed: false }
        ],
        quiz: [
            {
                question: "Which CSS property is crucial to create the 'glass' blur background effect?",
                options: ["filter: blur()", "backdrop-filter: blur()", "background-blend-mode: overlay", "box-shadow: inset"],
                answer: 1 // backdrop-filter
            },
            {
                question: "To ensure micro-animations feel sleek and natural, which timing function is recommended?",
                options: ["linear", "ease-in-out", "cubic-bezier() with ease customization", "step-start"],
                answer: 2 // cubic-bezier
            }
        ]
    },
    {
        id: 3,
        title: "Startup Scaling & Venture Management",
        category: "business",
        rating: 4.7,
        instructor: "Marc Cuban (Investor)",
        lessons: [
            { id: 301, title: "Pitch Deck Structural Blueprints", completed: false },
            { id: 302, title: "Estimating Financial Burning Rates", completed: false },
            { id: 303, title: "Scaling Customer Acquisition Channels", completed: false }
        ],
        quiz: [
            {
                question: "What does the term 'burn rate' represent in startup finance?",
                options: ["The rate at which a company spends cash to cover overheads before positive revenue", "The thermal output of local servers", "The speed at which stock shares are sold", "The time required to launch a product"],
                answer: 0 // first option
            }
        ]
    }
];

// App State
let activeCourse = null;
let activeLesson = null;
let userCourseProgress = {}; // Stores { courseId: [completedLessonIds] }
let activeQuizIndex = 0;
let quizScore = 0;

// DOM References
const coursesGridContainer = document.getElementById('coursesGridContainer');
const courseSearchInput = document.getElementById('courseSearchInput');
const learningWorkspace = document.getElementById('learningWorkspace');
const defaultWorkspaceView = document.getElementById('defaultWorkspaceView');
const activeWorkspaceView = document.getElementById('activeWorkspaceView');

const workspaceCategory = document.getElementById('workspaceCategory');
const workspaceTitle = document.getElementById('workspaceTitle');
const workspaceLessonsList = document.getElementById('workspaceLessonsList');
const activeVideoTitle = document.getElementById('activeVideoTitle');

const workspaceProgressWidget = document.getElementById('workspaceProgressWidget');
const workspaceProgressText = document.getElementById('workspaceProgressText');
const workspaceProgressBar = document.getElementById('workspaceProgressBar');

const quizContainer = document.getElementById('quizContainer');

// Init
document.addEventListener("DOMContentLoaded", () => {
    loadProgress();
    renderCourses(coursesDb);
    setupEventHandlers();
});

function setupEventHandlers() {
    // Search listener
    courseSearchInput.addEventListener('input', () => {
        const query = courseSearchInput.value.toLowerCase().trim();
        const filtered = coursesDb.filter(c => 
            c.title.toLowerCase().includes(query) || 
            c.instructor.toLowerCase().includes(query)
        );
        renderCourses(filtered);
    });
}

// Local Storage Sync pipelines
function saveProgress() {
    localStorage.setItem('edu_progress', JSON.stringify(userCourseProgress));
}

function loadProgress() {
    const saved = localStorage.getItem('edu_progress');
    if (saved) {
        userCourseProgress = JSON.parse(saved);
    }
}

// Render Courses Grid
function renderCourses(courses) {
    coursesGridContainer.innerHTML = '';
    
    if(courses.length === 0) {
        coursesGridContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <i class="fa-solid fa-graduation-cap fs-1 text-muted-edu mb-3"></i>
                <p class="text-muted-edu">No courses match your query.</p>
            </div>
        `;
        return;
    }

    courses.forEach(c => {
        // Calculate progress percentage
        const completedLessons = userCourseProgress[c.id] || [];
        const percent = c.lessons.length > 0 ? Math.round((completedLessons.length / c.lessons.length) * 100) : 0;

        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-12 col-xl-6';
        
        // Stars rendering
        let starsHtml = '';
        for(let i = 1; i <= 5; i++) {
            if(i <= Math.floor(c.rating)) starsHtml += '<i class="fa-solid fa-star me-1"></i>';
            else starsHtml += '<i class="fa-regular fa-star me-1"></i>';
        }

        card.innerHTML = `
            <div class="course-card-edu">
                <div>
                    <div class="course-card-header">
                        <span class="badge-edu-tag">${c.category}</span>
                        <div class="stars-row-edu">${starsHtml} <span class="text-muted-edu text-xs ms-1">(${c.rating})</span></div>
                    </div>
                    <h4 class="course-title-edu">${c.title}</h4>
                    <p class="text-muted-edu small mb-3">By ${c.instructor}</p>
                    <div class="course-meta-edu">
                        <span><i class="fa-solid fa-book-open me-1 text-indigo"></i>${c.lessons.length} Lectures</span>
                        <span><i class="fa-solid fa-circle-question me-1 text-indigo"></i>${c.quiz.length} Quizzes</span>
                    </div>
                </div>
                <div>
                    <div class="course-progress-container">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-muted-edu small">Completion:</span>
                            <span class="small fw-semibold text-white">${percent}%</span>
                        </div>
                        <div class="progress progress-edu">
                            <div class="progress-bar bg-success-edu" role="progressbar" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <button class="btn-outline-edu w-100" onclick="launchCourseWorkspace(${c.id})"><i class="fa-solid fa-circle-play"></i> Access Workspace</button>
                </div>
            </div>
        `;
        coursesGridContainer.appendChild(card);
    });
}

// Category Filtering Tabs
function filterCourses(cat) {
    const tabs = document.querySelectorAll('.tab-btn-edu');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    if (cat === 'all') {
        renderCourses(coursesDb);
    } else {
        const filtered = coursesDb.filter(c => c.category === cat);
        renderCourses(filtered);
    }
}

// Access Course Workspace Panel
function launchCourseWorkspace(id) {
    const c = coursesDb.find(item => item.id === id);
    if (!c) return;

    activeCourse = c;
    activeLesson = c.lessons[0]; // Set first lesson as default active
    activeQuizIndex = 0;
    quizScore = 0;

    // Show Workspace view
    defaultWorkspaceView.classList.add('d-none');
    activeWorkspaceView.classList.remove('d-none');
    workspaceProgressWidget.style.display = 'block';

    // Populate metadata
    workspaceCategory.innerText = c.category;
    workspaceTitle.innerText = c.title;
    activeVideoTitle.innerText = activeLesson.title;

    // Switch pill tab back to Lessons playlist
    const lessonsTab = new bootstrap.Tab(document.getElementById('lessons-tab'));
    lessonsTab.show();

    updateWorkspaceProgress();
    renderPlaylistLessons();

    // Smooth scroll workspace into focus for mobile
    learningWorkspace.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeWorkspace() {
    activeCourse = null;
    activeLesson = null;
    defaultWorkspaceView.classList.remove('d-none');
    activeWorkspaceView.classList.add('d-none');
    workspaceProgressWidget.style.display = 'none';
}

function updateWorkspaceProgress() {
    if(!activeCourse) return;

    const completed = userCourseProgress[activeCourse.id] || [];
    const percent = activeCourse.lessons.length > 0 ? Math.round((completed.length / activeCourse.lessons.length) * 100) : 0;

    workspaceProgressText.innerText = `${percent}%`;
    workspaceProgressBar.style.width = `${percent}%`;

    // Re-render course catalog cards to mirror state change
    renderCourses(coursesDb);
}

// Render Playlist lessons lists
function renderPlaylistLessons() {
    if (!activeCourse) return;
    workspaceLessonsList.innerHTML = '';

    const completed = userCourseProgress[activeCourse.id] || [];

    activeCourse.lessons.forEach(less => {
        const isCompleted = completed.includes(less.id);
        const isActive = activeLesson && activeLesson.id === less.id;

        const item = document.createElement('div');
        item.className = `lesson-item-edu ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
        
        item.innerHTML = `
            <div onclick="selectLessonVideo(${less.id})" style="flex-grow: 1;">
                <i class="fa-regular ${isActive ? 'fa-circle-play text-indigo' : 'fa-circle-dot text-muted-edu'} me-3"></i>
                <span>${less.title}</span>
            </div>
            <button class="btn-lesson-check" onclick="toggleLessonCheck(${less.id})">
                <i class="fa-solid ${isCompleted ? 'fa-square-check' : 'fa-square'}"></i>
            </button>
        `;
        workspaceLessonsList.appendChild(item);
    });
}

function selectLessonVideo(id) {
    const less = activeCourse.lessons.find(item => item.id === id);
    if(less) {
        activeLesson = less;
        activeVideoTitle.innerText = less.title;
        renderPlaylistLessons();
    }
}

function toggleLessonCheck(id) {
    if(!userCourseProgress[activeCourse.id]) {
        userCourseProgress[activeCourse.id] = [];
    }

    const idx = userCourseProgress[activeCourse.id].indexOf(id);
    if (idx > -1) {
        // Uncheck
        userCourseProgress[activeCourse.id].splice(idx, 1);
    } else {
        // Complete
        userCourseProgress[activeCourse.id].push(id);
    }

    saveProgress();
    updateWorkspaceProgress();
    renderPlaylistLessons();
}

// Quiz Interactive Widget Controller
function initWorkspaceQuiz() {
    activeQuizIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if(!activeCourse) return;

    quizContainer.innerHTML = '';
    const quizList = activeCourse.quiz;

    if(quizList.length === 0) {
        quizContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fa-solid fa-graduation-cap fs-2 text-muted-edu mb-2"></i>
                <p class="text-muted-edu small">No quizzes are compiled for this syllabus.</p>
            </div>
        `;
        return;
    }

    // Has user completed all questions?
    if (activeQuizIndex >= quizList.length) {
        showQuizResultsCard();
        return;
    }

    const q = quizList[activeQuizIndex];

    const qBox = document.createElement('div');
    qBox.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted-edu tiny font-outfit uppercase">Question ${activeQuizIndex + 1} of ${quizList.length}</span>
            <span class="badge bg-indigo-badge tiny">Score: ${quizScore}/${quizList.length}</span>
        </div>
        <div class="quiz-question-box">${q.question}</div>
        <div class="quiz-options-list" id="optionsBlock"></div>
    `;

    quizContainer.appendChild(qBox);

    const optionsBlock = document.getElementById('optionsBlock');
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerText = opt;
        btn.onclick = () => verifyQuizAnswer(idx, q.answer, btn);
        optionsBlock.appendChild(btn);
    });
}

function verifyQuizAnswer(chosenIdx, correctIdx, btnElement) {
    const buttons = document.querySelectorAll('.quiz-option-btn');
    // Lock buttons
    buttons.forEach(btn => btn.disabled = true);

    if (chosenIdx === correctIdx) {
        btnElement.classList.add('correct');
        quizScore++;
        if (typeof playSound === 'function') playSound(800, 0.15); // Success tone
    } else {
        btnElement.classList.add('incorrect');
        buttons[correctIdx].classList.add('correct'); // Highlight correct answer
        if (typeof playSound === 'function') playSound(300, 0.15); // Error tone
    }

    // Delayed transition to next question
    setTimeout(() => {
        activeQuizIndex++;
        renderQuizQuestion();
    }, 1500);
}

function showQuizResultsCard() {
    quizContainer.innerHTML = '';
    const quizList = activeCourse.quiz;
    const pct = Math.round((quizScore / quizList.length) * 100);

    const scoreCard = document.createElement('div');
    scoreCard.className = 'quiz-score-card';
    scoreCard.innerHTML = `
        <div class="score-circle">
            <div class="score-value">${pct}%</div>
            <div class="score-label">Graded</div>
        </div>
        <h4 class="font-outfit text-white fw-bold mb-2">Quiz Finished!</h4>
        <p class="text-muted-edu small mb-4">You got ${quizScore} out of ${quizList.length} answers correct.</p>
        <button class="btn-outline-edu btn-sm w-100" onclick="initWorkspaceQuiz()"><i class="fa-solid fa-rotate-right me-2"></i>Restart Quiz</button>
    `;
    quizContainer.appendChild(scoreCard);
}
