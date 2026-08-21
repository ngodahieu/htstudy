import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ==================================================
   DOM
================================================== */

const backBtn =
    document.getElementById("backBtn");

const breadcrumb =
    document.getElementById("breadcrumb");

const pageTitle =
    document.getElementById("pageTitle");

const pageDescription =
    document.getElementById("pageDescription");

const examContent =
    document.getElementById("examContent");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyDescription =
    document.getElementById("emptyDescription");

const examDetail =
    document.getElementById("examDetail");

const examScreen =
    document.getElementById("examScreen");


/* ==================================================
   DETAIL DOM
================================================== */

const detailExamType =
    document.getElementById("detailExamType");

const detailExamTitle =
    document.getElementById("detailExamTitle");

const detailExamDescription =
    document.getElementById("detailExamDescription");

const detailDuration =
    document.getElementById("detailDuration");

const detailQuestionCount =
    document.getElementById("detailQuestionCount");

const detailCourse =
    document.getElementById("detailCourse");

const detailChapter =
    document.getElementById("detailChapter");

const detailLesson =
    document.getElementById("detailLesson");

const startExamBtn =
    document.getElementById("startExamBtn");


/* ==================================================
   MODAL
================================================== */

const startModal =
    document.getElementById("startModal");

const cancelStartBtn =
    document.getElementById("cancelStartBtn");

const confirmStartBtn =
    document.getElementById("confirmStartBtn");


/* ==================================================
   EXAM SCREEN
================================================== */

const testTypeLabel =
    document.getElementById("testTypeLabel");

const testTitle =
    document.getElementById("testTitle");

const timer =
    document.getElementById("timer");

const currentQuestionNumber =
    document.getElementById("currentQuestionNumber");

const totalQuestions =
    document.getElementById("totalQuestions");

const answeredCount =
    document.getElementById("answeredCount");

const progressBar =
    document.getElementById("progressBar");

const questionContainer =
    document.getElementById("questionContainer");

const prevQuestionBtn =
    document.getElementById("prevQuestionBtn");

const nextQuestionBtn =
    document.getElementById("nextQuestionBtn");


/* ==================================================
   STATE
================================================== */

let currentUser = null;

let currentCourse = null;

let currentChapter = null;

let currentLesson = null;

let currentTest = null;

let currentTests = [];

let currentQuestions = [];

let currentQuestionIndex = 0;

let userAnswers = {};

let remainingSeconds = 0;

let timerInterval = null;


/* ==================================================
   AUTH
================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "../index.html";

        return;

    }

    currentUser = user;

    await loadSubjects();

});

// ==================================================
// RESET GIAO DIỆN KHI MỞ TRANG
// ==================================================

function resetExamView() {

    examContent.classList.remove("hidden");

    examDetail.classList.add("hidden");

    examScreen.classList.add("hidden");

    document
        .getElementById("pageHeading")
        .classList.remove("hidden");

    startModal.classList.add("hidden");

    currentCourse = null;
    currentChapter = null;
    currentLesson = null;
    currentTest = null;

    currentTests = [];
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = {};

    clearInterval(timerInterval);

}
/* ==================================================
   BACK BUTTON
================================================== */

backBtn.addEventListener("click", () => {

    history.back();

});


/* ==================================================
   HELPERS
================================================== */

function showLoading() {

    loading.classList.remove("hidden");

    emptyState.classList.add("hidden");

    examContent.classList.add("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

    examContent.classList.remove("hidden");

}


function showEmpty(title, description) {

    loading.classList.add("hidden");

    examContent.classList.add("hidden");

    emptyState.classList.remove("hidden");

    emptyTitle.textContent = title;

    emptyDescription.textContent = description;

}


function hideEmpty() {

    emptyState.classList.add("hidden");

}


function escapeHTML(value = "") {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function setBreadcrumb(items) {

    breadcrumb.innerHTML = "";

    items.forEach((item, index) => {

        const element =
            document.createElement("span");

        element.className =
            "breadcrumb-item";

        if (index === items.length - 1) {

            element.classList.add("active");

        }

        element.innerHTML = `

            <i class="${item.icon}"></i>

            ${escapeHTML(item.name)}

        `;

        breadcrumb.appendChild(element);

    });

}


/* ==================================================
   1. LOAD SUBJECTS
================================================== */

async function loadSubjects() {

    resetExamView();

    showLoading();

    hideEmpty();

    pageTitle.textContent =
        "Chọn môn học";

    pageDescription.textContent =
        "Chọn môn học để xem các khóa học được cấp cho bạn.";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        }
    ]);

    try {

        /*
         * Lấy các khóa học được cấp cho học sinh.
         *
         * Ở đây tạm dùng studentIds chứa UID.
         *
         * Nếu hệ thống cấp khóa học của bạn đang
         * dùng trường khác, chỉ cần sửa query này.
         */

        const q = query(
            collection(db, "courses"),
            where("studentIds", "array-contains", currentUser.uid)
        );

        const snapshot =
            await getDocs(q);

        const courses = [];

        snapshot.forEach(courseDoc => {

            courses.push({

                id: courseDoc.id,

                ...courseDoc.data()

            });

        });


        /*
         * Gom khóa học theo môn.
         */

        const subjects = {};

        courses.forEach(course => {

            const subject =
                course.subjectName ||
                course.subject ||
                "Khác";

            if (!subjects[subject]) {

                subjects[subject] = [];

            }

            subjects[subject].push(course);

        });


        if (!Object.keys(subjects).length) {

            showEmpty(
                "Chưa có khóa học",
                "Bạn chưa được cấp khóa học nào."
            );

            return;

        }


        hideLoading();

        renderSubjects(subjects);

    }

    catch (error) {

        console.error(error);

        showEmpty(
            "Không thể tải dữ liệu",
            "Đã xảy ra lỗi khi tải danh sách môn học."
        );

    }

}


/* ==================================================
   RENDER SUBJECTS
================================================== */

function renderSubjects(subjects) {

    examContent.innerHTML = "";

    examContent.classList.remove("hidden");

    Object.entries(subjects).forEach(
        ([subject, courses]) => {

            const card =
                document.createElement("div");

            card.className =
                "subject-card";

            card.innerHTML = `

                <div class="subject-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>

                <div class="subject-content">

                    <h3>
                        ${escapeHTML(subject)}
                    </h3>

                    <p>
                        ${courses.length}
                        khóa học được cấp
                    </p>

                </div>

                <div class="subject-meta">

                    <span>
                        ${courses.length} khóa học
                    </span>

                    <i class="fa-solid fa-arrow-right"></i>

                </div>

            `;

            card.addEventListener(
                "click",
                () => {

                    loadCourses(
                        subject,
                        courses
                    );

                }
            );

            examContent.appendChild(card);

        }
    );

}


/* ==================================================
   2. LOAD COURSES
================================================== */

function loadCourses(subject, courses) {

    hideEmpty();

    pageTitle.textContent =
        subject;

    pageDescription.textContent =
        "Chọn khóa học để xem các chương.";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        },
        {
            name: subject,
            icon: "fa-solid fa-book"
        }
    ]);

    examContent.innerHTML = "";

    courses.forEach(course => {

        const card =
            document.createElement("div");

        card.className =
    "subject-card";

        card.innerHTML = `

    <div class="subject-icon">

        <i class="fa-solid fa-graduation-cap"></i>

    </div>

    <div class="subject-content">

        <h3>
            ${escapeHTML(
                course.name || "Khóa học"
            )}
        </h3>

        <p>
            ${escapeHTML(
                course.subjectName ||
                course.subject ||
                ""
            )}
        </p>

    </div>

    <div class="subject-meta">

        <span>
            Lớp ${escapeHTML(
                course.grade || "12"
            )}
        </span>

        <i class="fa-solid fa-arrow-right"></i>

    </div>

`;

        card.addEventListener(
            "click",
            () => {

                loadChapters(course);

            }
        );

        examContent.appendChild(card);

    });

}


/* ==================================================
   3. LOAD CHAPTERS
================================================== */

async function loadChapters(course) {

    currentCourse = course;

    showLoading();

    pageTitle.textContent =
        course.name || "Khóa học";

    pageDescription.textContent =
        "Chọn chương để xem các bài học.";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        },
        {
            name:
                course.subjectName ||
                course.subject ||
                "Môn học",
            icon: "fa-solid fa-book"
        },
        {
            name:
                course.name ||
                "Khóa học",
            icon: "fa-solid fa-graduation-cap"
        }
    ]);

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    course.id,
                    "chapters"
                )
            );

        const chapters = [];

        snapshot.forEach(chapterDoc => {

            chapters.push({

                id: chapterDoc.id,

                ...chapterDoc.data()

            });

        });

        chapters.sort(
            (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );


        if (!chapters.length) {

            showEmpty(
                "Chưa có chương",
                "Khóa học này chưa có chương nào."
            );

            return;

        }

        hideLoading();

        renderChapters(chapters);

    }

    catch (error) {

        console.error(error);

        showEmpty(
            "Không thể tải chương",
            "Đã xảy ra lỗi khi tải dữ liệu."
        );

    }

}


/* ==================================================
   RENDER CHAPTERS
================================================== */

function renderChapters(chapters) {

    examContent.innerHTML = "";

    const chapterList =
        document.createElement("div");

    chapterList.className =
        "chapter-list";

    chapters.forEach(chapter => {

        const card =
            document.createElement("div");

        card.className =
            "exam-chapter";

        card.innerHTML = `

            <div class="chapter-main">

                <div class="chapter-left">

                    <div class="chapter-number">

                        ${escapeHTML(
                            chapter.order || ""
                        )}

                    </div>

                    <div class="chapter-info">

                        <h3>
                            ${escapeHTML(
                                chapter.title ||
                                "Chương"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                chapter.description ||
                                "Xem các bài học trong chương."
                            )}
                        </p>

                    </div>

                </div>

                <div class="chapter-arrow">

                    <i class="fa-solid fa-arrow-right"></i>

                </div>

            </div>

        `;

        card.addEventListener(
            "click",
            () => {

                loadLessons(chapter);

            }
        );

        chapterList.appendChild(card);

    });

    examContent.appendChild(chapterList);

}
/* ==================================================
   4. LOAD LESSONS
================================================== */

async function loadLessons(chapter) {

    currentChapter = chapter;

    showLoading();

    pageTitle.textContent =
        chapter.title || "Bài học";

    pageDescription.textContent =
        "Chọn bài học để xem các bài kiểm tra.";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        },
        {
            name:
                currentCourse.name ||
                "Khóa học",
            icon: "fa-solid fa-graduation-cap"
        },
        {
            name:
                chapter.title ||
                "Chương",
            icon: "fa-solid fa-layer-group"
        }
    ]);

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    currentCourse.id,
                    "chapters",
                    chapter.id,
                    "lessons"
                )
            );

        const lessons = [];

        snapshot.forEach(lessonDoc => {

            lessons.push({

                id: lessonDoc.id,

                ...lessonDoc.data()

            });

        });

        lessons.sort(
            (a, b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );


        if (!lessons.length) {

            showEmpty(
                "Chưa có bài học",
                "Chương này chưa có bài học nào."
            );

            return;

        }

        hideLoading();

        renderLessons(lessons);

    }

    catch (error) {

        console.error(error);

        showEmpty(
            "Không thể tải bài học",
            "Đã xảy ra lỗi khi tải dữ liệu."
        );

    }

}


/* ==================================================
   RENDER LESSONS
================================================== */
function renderLessons(lessons) {

    examContent.innerHTML = "";

    const lessonList =
        document.createElement("div");

    lessonList.className =
        "exam-list";

    lessons.forEach(lesson => {

        const card =
            document.createElement("div");

        card.className =
            "exam-card";

        card.innerHTML = `

            <div class="exam-card-left">

                <div class="exam-card-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>

                <div class="exam-card-info">

                    <h3>
                        ${escapeHTML(
                            lesson.title ||
                            "Bài học"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            lesson.description ||
                            "Xem các bài kiểm tra của bài học."
                        )}
                    </p>

                </div>

            </div>

            <div class="exam-meta">

                <span class="exam-tag">

                    <i class="fa-solid fa-book-open"></i>

                    Bài
                    ${escapeHTML(
                        lesson.order || ""
                    )}

                </span>

                <span class="exam-tag">

                    <i class="fa-solid fa-arrow-right"></i>

                    Xem bài kiểm tra

                </span>

            </div>

        `;

        card.addEventListener(
            "click",
            () => {

                loadTests(lesson);

            }
        );

        lessonList.appendChild(card);

    });

    examContent.appendChild(lessonList);

}
/* ==================================================
   5. LOAD TESTS
================================================== */

async function loadTests(lesson) {

    currentLesson = lesson;

    showLoading();

    pageTitle.textContent =
        lesson.title || "Bài kiểm tra";

    pageDescription.textContent =
        "Chọn bài thi để xem thông tin trước khi bắt đầu.";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        },
        {
            name:
                currentCourse.name ||
                "Khóa học",
            icon: "fa-solid fa-graduation-cap"
        },
        {
            name:
                currentChapter.title ||
                "Chương",
            icon: "fa-solid fa-layer-group"
        },
        {
            name:
                lesson.title ||
                "Bài học",
            icon: "fa-solid fa-book-open"
        }
    ]);

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    currentCourse.id,
                    "tests"
                )
            );

        const tests = [];

        snapshot.forEach(testDoc => {

            const data =
                testDoc.data();

            /*
             * Chỉ lấy bài thi thuộc bài học hiện tại.
             */

            if (
                data.lessonId === lesson.id
            ) {

                tests.push({

                    id: testDoc.id,

                    ...data

                });

            }

        });

        currentTests = tests;


        if (!tests.length) {

            showEmpty(
                "Chưa có bài thi",
                "Bài học này hiện chưa có bài kiểm tra."
            );

            return;

        }

        hideLoading();

        renderTests(tests);

    }

    catch (error) {

        console.error(error);

        showEmpty(
            "Không thể tải bài thi",
            "Đã xảy ra lỗi khi tải dữ liệu."
        );

    }

}


/* ==================================================
   RENDER TESTS
================================================== */
function renderTests(tests) {

    examContent.innerHTML = "";

    const examList =
        document.createElement("div");

    examList.className =
        "exam-list";

    tests.forEach(test => {

        const card =
            document.createElement("div");

        card.className =
            "exam-card";

        const type =
            getTestType(test.type);

        card.innerHTML = `

            <div class="exam-card-left">

                <div class="exam-card-icon">

                    <i class="fa-solid fa-file-circle-check"></i>

                </div>

                <div class="exam-card-info">

                    <h3>
                        ${escapeHTML(
                            test.title ||
                            "Bài kiểm tra"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(type)}
                    </p>

                </div>

            </div>

            <div class="exam-meta">

                <span class="exam-tag">

                    <i class="fa-regular fa-clock"></i>

                    ${Number(
                        test.duration || 0
                    )} phút

                </span>

                <span class="exam-tag">

                    <i class="fa-solid fa-list-ol"></i>

                    ${Number(
                        test.questionCount ||
                        (test.questions
                            ? test.questions.length
                            : 0)
                    )} câu

                </span>

                <span class="exam-tag">

                    <i class="fa-solid fa-arrow-right"></i>

                    Xem chi tiết

                </span>

            </div>

        `;

        card.addEventListener(
            "click",
            () => {

                showTestDetail(test);

            }
        );

        examList.appendChild(card);

    });

    examContent.appendChild(examList);

}
/* ==================================================
   TEST TYPE
================================================== */

function getTestType(type) {

    const types = {

        final:
            "Bài thi thử cuối kỳ",

        "15p":
            "Bài kiểm tra 15 phút",

        oral:
            "Bài kiểm tra miệng",

        midterm:
            "Bài kiểm tra giữa kỳ",

        final_exam:
            "Bài kiểm tra cuối kỳ",

        practice:
            "Bài thi thử",

        test:
            "Bài kiểm tra"

    };

    return types[type] || type || "Bài kiểm tra";

}


/* ==================================================
   6. TEST DETAIL
================================================== */

function showTestDetail(test) {

    currentTest = test;

    examContent.classList.add("hidden");

    examDetail.classList.remove("hidden");

    document
        .getElementById("pageHeading")
        .classList.add("hidden");

    pageTitle.textContent =
        test.title || "Bài thi";

    setBreadcrumb([
        {
            name: "Môn học",
            icon: "fa-solid fa-house"
        },
        {
            name:
                currentCourse.name ||
                "Khóa học",
            icon: "fa-solid fa-graduation-cap"
        },
        {
            name:
                currentChapter.title ||
                "Chương",
            icon: "fa-solid fa-layer-group"
        },
        {
            name:
                currentLesson.title ||
                "Bài học",
            icon: "fa-solid fa-book-open"
        },
        {
            name:
                test.title ||
                "Bài thi",
            icon: "fa-solid fa-file-circle-check"
        }
    ]);

    detailExamType.textContent =
        getTestType(test.type);

    detailExamTitle.textContent =
        test.title || "Bài kiểm tra";

    detailExamDescription.textContent =
        test.description ||
        "Kiểm tra kiến thức của bài học.";

    detailDuration.textContent =
        `${Number(test.duration || 0)} phút`;

    detailQuestionCount.textContent =
        `${Number(test.questionCount || 0)} câu`;

    detailCourse.textContent =
        currentCourse.name || "Khóa học";

    detailChapter.textContent =
        currentChapter.title || "Chương";

    detailLesson.textContent =
        currentLesson.title || "Bài học";

}


/* ==================================================
   START BUTTON
================================================== */

startExamBtn.addEventListener(
    "click",
    () => {

        startModal.classList.remove("hidden");

    }
);


cancelStartBtn.addEventListener(
    "click",
    () => {

        startModal.classList.add("hidden");

    }
);


confirmStartBtn.addEventListener(
    "click",
    async () => {

        startModal.classList.add("hidden");

        await startExam();

    }
);


/* ==================================================
   START EXAM
================================================== */

async function startExam() {

    if (!currentTest) return;

    try {

        /*
         * Lấy lại document test để đảm bảo
         * dữ liệu mới nhất.
         */

        const testRef =
            doc(
                db,
                "courses",
                currentCourse.id,
                "tests",
                currentTest.id
            );

        const testSnap =
            await getDoc(testRef);

        if (!testSnap.exists()) {

            alert("Không tìm thấy bài thi.");

            return;

        }

        currentTest = {

            id: testSnap.id,

            ...testSnap.data()

        };


        currentQuestions =
            currentTest.questions || [];

        currentQuestionIndex = 0;

        userAnswers = {};

        remainingSeconds =
            Number(currentTest.duration || 0) * 60;


        examDetail.classList.add("hidden");

        examScreen.classList.remove("hidden");

        document
            .getElementById("pageHeading")
            .classList.add("hidden");


        testTypeLabel.textContent =
            getTestType(currentTest.type);

        testTitle.textContent =
            currentTest.title || "Bài thi";

        totalQuestions.textContent =
            currentQuestions.length;


        renderQuestion();

        startTimer();

    }

    catch (error) {

        console.error(error);

        alert(
            "Không thể bắt đầu bài thi."
        );

    }

}


/* ==================================================
   TIMER
================================================== */

function startTimer() {

    clearInterval(timerInterval);

    updateTimer();

    timerInterval =
        setInterval(() => {

            remainingSeconds--;

            updateTimer();

            if (remainingSeconds <= 0) {

                clearInterval(
                    timerInterval
                );

                alert(
                    "Đã hết thời gian làm bài."
                );

                finishExam();

            }

        }, 1000);

}


function updateTimer() {

    const minutes =
        Math.floor(
            remainingSeconds / 60
        );

    const seconds =
        remainingSeconds % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* ==================================================
   QUESTION
================================================== */

function renderQuestion() {

    if (!currentQuestions.length) {

        questionContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-circle-exclamation"></i>

                </div>

                <h3>
                    Bài thi chưa có câu hỏi
                </h3>

                <p>
                    Giáo viên chưa thêm câu hỏi.
                </p>

            </div>

        `;

        return;

    }

    const question =
        currentQuestions[
            currentQuestionIndex
        ];

    const questionNumber =
        currentQuestionIndex + 1;

    currentQuestionNumber.textContent =
        questionNumber;

    const total =
        currentQuestions.length;

    progressBar.style.width =
        `${(questionNumber / total) * 100}%`;


    const options =
        question.options || [];


    questionContainer.innerHTML = `

        <span class="question-number">

            CÂU ${questionNumber}

        </span>

        <h3 class="question-text">

            ${escapeHTML(
                question.question ||
                question.text ||
                ""
            )}

        </h3>

        <div class="answers">

            ${options.map(
                (option, index) => {

                    const checked =
                        userAnswers[
                            question.id ||
                            questionNumber
                        ] === index
                            ? "checked"
                            : "";

                    return `

                        <label
                            class="answer ${
                                checked
                                    ? "selected"
                                    : ""
                            }"
                        >

                            <input
                                type="radio"
                                name="answer"
                                value="${index}"
                                ${checked}
                            >

                            <span>
                                ${escapeHTML(
                                    option
                                )}
                            </span>

                        </label>

                    `;

                }
            ).join("")}

        </div>

    `;


    questionContainer
        .querySelectorAll(
            'input[name="answer"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    const id =
                        question.id ||
                        questionNumber;

                    userAnswers[id] =
                        Number(
                            input.value
                        );

                    renderQuestion();

                    updateAnsweredCount();

                }
            );

        });


    prevQuestionBtn.disabled =
        currentQuestionIndex === 0;

    nextQuestionBtn.textContent =
        currentQuestionIndex ===
        total - 1
            ? "Nộp bài"
            : "Câu tiếp theo";

}


/* ==================================================
   ANSWER COUNT
================================================== */

function updateAnsweredCount() {

    const count =
        Object.keys(
            userAnswers
        ).length;

    answeredCount.textContent =
        `Đã trả lời: ${count}`;

}


/* ==================================================
   PREVIOUS
================================================== */

prevQuestionBtn.addEventListener(
    "click",
    () => {

        if (
            currentQuestionIndex <= 0
        ) {

            return;

        }

        currentQuestionIndex--;

        renderQuestion();

        updateAnsweredCount();

    }
);


/* ==================================================
   NEXT
================================================== */

nextQuestionBtn.addEventListener(
    "click",
    () => {

        if (
            currentQuestionIndex <
            currentQuestions.length - 1
        ) {

            currentQuestionIndex++;

            renderQuestion();

            updateAnsweredCount();

            return;

        }

        finishExam();

    }
);


/* ==================================================
   FINISH
================================================== */

function finishExam() {

    clearInterval(timerInterval);

    alert(
        "Bài thi đã kết thúc."
    );

}
