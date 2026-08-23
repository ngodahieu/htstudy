/*==================================================
        H&T STUDY - EXAM.JS
        Student Exam System
==================================================*/

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/*==================================================
                    GLOBAL
==================================================*/

let currentUser = null;
let currentUserData = null;

let grantedCourses = [];
let examTests = [];

let currentTest = null;
let currentQuestions = [];

let currentAnswers = {};

let examStarted = false;
let examSubmitted = false;

let timerInterval = null;


/*==================================================
                    DOM
==================================================*/

const body = document.body;


/*==================================================
                INITIAL HTML
==================================================*/

const examMain = document.createElement("main");

examMain.id = "examMain";

examMain.innerHTML = `

    <section class="exam-page">

        <!-- =========================================
                    PAGE HEADER
        ========================================== -->

        <div class="exam-page-header">

            <div>

                <span class="exam-page-label">
                    H&T STUDY
                </span>

                <h1>
                    Thi thử
                </h1>

                <p id="examBreadcrumb">
                    Đang tải dữ liệu...
                </p>

            </div>

            <button
                type="button"
                class="exam-back-btn"
                id="examBackBtn"
            >

                <i class="fa-solid fa-arrow-left"></i>

                Quay lại

            </button>

        </div>


        <!-- =========================================
                    LOADING
        ========================================== -->

        <div
            class="exam-loading"
            id="examLoading"
        >

            <div class="exam-spinner"></div>

            <p>
                Đang tải bài kiểm tra...
            </p>

        </div>


        <!-- =========================================
                    COURSE TREE
        ========================================== -->

        <section
            class="exam-tree"
            id="examTree"
            style="display:none;"
        ></section>


        <!-- =========================================
                    TEST DETAIL
        ========================================== -->

        <section
            class="exam-detail"
            id="examDetail"
            style="display:none;"
        ></section>


        <!-- =========================================
                    EXAM WORKSPACE
        ========================================== -->

        <section
            class="exam-workspace"
            id="examWorkspace"
            style="display:none;"
        >

            <div
                class="exam-timer"
                id="examTimer"
            >

                <i class="fa-regular fa-clock"></i>

                <span id="timerText">
                    00:00
                </span>

            </div>


            <div class="exam-progress-panel">

                <div class="exam-progress-info">

                    <span id="progressText">
                        Đã làm: 0/0 câu
                    </span>

                    <span id="progressPercent">
                        0%
                    </span>

                </div>

                <div class="exam-progress-bar">

                    <div
                        id="progressFill"
                        class="exam-progress-fill"
                    ></div>

                </div>

            </div>


            <div class="exam-content-layout">


                <!-- =================================
                        QUESTION AREA
                ================================== -->

                <div class="exam-question-area">

                    <div
                        id="passageArea"
                        class="exam-passage"
                        style="display:none;"
                    ></div>


                    <div
                        id="quizArea"
                        class="quiz-area"
                    ></div>


                    <div class="exam-submit-area">

                        <button
                            type="button"
                            class="exam-submit-btn"
                            id="submitExamBtn"
                        >

                            <i class="fa-solid fa-paper-plane"></i>

                            Nộp bài

                        </button>

                    </div>

                </div>


                <!-- =================================
                        QUESTION NAVIGATION
                ================================== -->

                <aside class="question-navigation">

                    <div class="question-navigation-header">

                        <h3>
                            Danh sách câu
                        </h3>

                        <span id="navTotal">
                            0 câu
                        </span>

                    </div>


                    <div
                        class="question-nav-grid"
                        id="questionNav"
                    ></div>

                </aside>

            </div>

        </section>

    </section>

`;

body.insertBefore(
    examMain,
    document.querySelector(".footer")
);


/*==================================================
                EXISTING HEADER
==================================================*/

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationPanel =
    document.getElementById("notificationPanel");

const closeNotification =
    document.getElementById("closeNotification");

const avatar =
    document.querySelector(".avatar");

const userMenu =
    document.getElementById("userMenu");

const userBox =
    document.getElementById("userBox");

const userMenuList =
    document.getElementById("userMenuList");

const logoutBtn =
    document.getElementById("logoutBtn");

const myCoursesBtn =
    document.getElementById("myCoursesBtn");

const manageBtn =
    document.getElementById("manageBtn");


/*==================================================
            NOTIFICATION PANEL
==================================================*/

if (notificationBtn && notificationPanel) {

    notificationBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        notificationPanel.classList.toggle("active");

    });

}


if (closeNotification) {

    closeNotification.addEventListener(
        "click",
        () => {

            notificationPanel.classList.remove(
                "active"
            );

        }
    );

}


document.addEventListener("click", (e) => {

    if (
        notificationPanel &&
        !notificationPanel.contains(e.target) &&
        !notificationBtn.contains(e.target)
    ) {

        notificationPanel.classList.remove(
            "active"
        );

    }

});


/*==================================================
                    USER MENU
==================================================*/

if (avatar && userMenu) {

    avatar.addEventListener("click", (e) => {

        e.stopPropagation();

        userMenu.classList.toggle("active");

    });

}


document.addEventListener("click", (e) => {

    if (
        userMenu &&
        !userMenu.contains(e.target) &&
        !avatar.contains(e.target)
    ) {

        userMenu.classList.remove("active");

    }

});


/*==================================================
                LOGOUT
==================================================*/

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Không thể đăng xuất."
                );

            }

        }
    );

}


/*==================================================
                USER DATA
==================================================*/

async function loadCurrentUser(user) {

    if (!user) return;

    currentUser = user;

    try {

        const userRef =
            doc(db, "users", user.uid);

        const userSnap =
            await getDoc(userRef);

        if (userSnap.exists()) {

            currentUserData =
                userSnap.data();

        } else {

            currentUserData = {};

        }

        updateUserMenu();

    } catch (error) {

        console.error(
            "Lỗi tải user:",
            error
        );

    }

}


/*==================================================
                USER MENU UI
==================================================*/

function updateUserMenu() {

    if (!currentUserData) return;

    const data = currentUserData;


    const userName =
        document.getElementById("userName");

    const userStudentId =
        document.getElementById("userStudentId");

    const userRole =
        document.getElementById("userRole");

    const userAvatar =
        document.getElementById("userAvatar");


    if (userName) {

        userName.textContent =
            data.name ||
            data.fullName ||
            data.displayName ||
            currentUser.email ||
            "Học sinh";

    }


    if (userStudentId) {

        userStudentId.textContent =
            data.studentId ||
            data.maHocSinh ||
            "---";

    }


    if (userRole) {

        userRole.textContent =
            data.role ||
            "Học sinh";

    }


    if (
        data.avatar &&
        userAvatar
    ) {

        userAvatar.src =
            data.avatar;

    }


    if (userBox) {

        userBox.style.display =
            "block";

    }


    if (userMenuList) {

        userMenuList.style.display =
            "flex";

    }


    if (
        data.role === "Admin" ||
        data.role === "Giáo viên" ||
        data.role === "teacher" ||
        data.role === "admin"
    ) {

        if (manageBtn) {

            manageBtn.style.display =
                "flex";

        }

    } else {

        if (manageBtn) {

            manageBtn.style.display =
                "none";

        }

    }

}


/*==================================================
            MY COURSES BUTTON
==================================================*/

if (myCoursesBtn) {

    myCoursesBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-courses.html";

        }
    );

}


/*==================================================
                MANAGE BUTTON
==================================================*/

if (manageBtn) {

    manageBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "admin.html";

        }
    );

}


/*==================================================
            GET GRANTED COURSES
==================================================*/

/*
    Hệ thống sẽ kiểm tra quyền truy cập
    của học sinh đối với từng khóa học.

    Hỗ trợ các cấu trúc phổ biến:

    course.studentIds
    course.students
    course.assignedStudents

    hoặc course có studentId.

    Sau này nếu cấu trúc cấp khóa học của
    hệ thống hiện tại đã cố định, chỉ cần
    giữ lại đúng trường đó.
*/

async function loadGrantedCourses() {

    grantedCourses = [];

    const coursesSnap =
        await getDocs(
            collection(db, "courses")
        );


    coursesSnap.forEach((courseDoc) => {

        const course =
            courseDoc.data();

        const courseId =
            courseDoc.id;


        let granted = false;


        /* studentIds */

        if (
            Array.isArray(
                course.studentIds
            ) &&
            course.studentIds.includes(
                currentUser.uid
            )
        ) {

            granted = true;

        }


        /* students */

        if (
            Array.isArray(
                course.students
            ) &&
            course.students.includes(
                currentUser.uid
            )
        ) {

            granted = true;

        }


        /* assignedStudents */

        if (
            Array.isArray(
                course.assignedStudents
            ) &&
            course.assignedStudents.includes(
                currentUser.uid
            )
        ) {

            granted = true;

        }


        /* studentId */

        if (
            course.studentId ===
            currentUser.uid
        ) {

            granted = true;

        }


        if (granted) {

            grantedCourses.push({

                id: courseId,

                ...course

            });

        }

    });


    return grantedCourses;

}


/*==================================================
                LOAD TESTS
==================================================*/

async function loadTests() {

    examTests = [];


    for (
        const course
        of grantedCourses
    ) {

        const testsRef =
            collection(
                db,
                "courses",
                course.id,
                "tests"
            );


        const testsSnap =
            await getDocs(
                testsRef
            );


        testsSnap.forEach(
            (testDoc) => {

                const test =
                    testDoc.data();


                examTests.push({

                    id:
                        testDoc.id,

                    courseId:
                        course.id,

                    courseName:
                        course.name ||
                        course.title ||
                        `${course.subjectName || course.subject || ""} ${course.grade || ""}`,

                    ...test

                });

            }
        );

    }


    return examTests;

}


/*==================================================
            BUILD COURSE TREE
==================================================*/

function renderExamTree() {

    const tree =
        document.getElementById(
            "examTree"
        );

    if (!tree) return;


    tree.innerHTML = "";


    if (
        grantedCourses.length === 0
    ) {

        tree.innerHTML = `

            <div class="exam-empty">

                <i class="fa-solid fa-book-open"></i>

                <h2>
                    Chưa có khóa học được cấp
                </h2>

                <p>
                    Bạn chưa được cấp khóa học nào
                    có bài kiểm tra.
                </p>

            </div>

        `;

        return;

    }


    const grouped = {};


    examTests.forEach((test) => {

        if (!grouped[test.courseId]) {

            grouped[test.courseId] = {};

        }


        const chapterId =
            test.chapterId ||
            "unknown-chapter";


        const lessonId =
            test.lessonId ||
            "unknown-lesson";


        if (
            !grouped[test.courseId][chapterId]
        ) {

            grouped[test.courseId][chapterId] = {

                chapterName:
                    test.chapterName ||
                    "Chương chưa xác định",

                lessons: {}

            };

        }


        if (
            !grouped[test.courseId][chapterId]
                .lessons[lessonId]
        ) {

            grouped[test.courseId][chapterId]
                .lessons[lessonId] = {

                    lessonName:
                        test.lessonName ||
                        "Bài chưa xác định",

                    tests: []

                };

        }


        grouped[test.courseId]
            [chapterId]
            .lessons[lessonId]
            .tests
            .push(test);

    });


    grantedCourses.forEach(
        (course) => {

            const courseTests =
                grouped[course.id];


            if (!courseTests) return;


            const courseBlock =
                document.createElement(
                    "div"
                );

            courseBlock.className =
                "exam-course-block";


            courseBlock.innerHTML = `

                <div class="exam-course-title">

                    <div class="exam-course-icon">

                        <i class="fa-solid fa-book"></i>

                    </div>

                    <div>

                        <span>
                            ${escapeHTML(
                                course.subjectName ||
                                course.subject ||
                                "Môn học"
                            )}
                        </span>

                        <h2>
                            ${escapeHTML(
                                course.name ||
                                course.title ||
                                `${course.subjectName || course.subject || ""} ${course.grade || ""}`
                            )}
                        </h2>

                    </div>

                </div>

                <div class="exam-chapters"></div>

            `;


            const chapterContainer =
                courseBlock.querySelector(
                    ".exam-chapters"
                );


            Object.entries(
                courseTests
            ).forEach(
                ([chapterId, chapter]) => {

                    const chapterBlock =
                        document.createElement(
                            "div"
                        );

                    chapterBlock.className =
                        "exam-chapter";


                    chapterBlock.innerHTML = `

                        <div class="exam-chapter-header">

                            <div>

                                <i class="fa-solid fa-layer-group"></i>

                                <span>
                                    ${escapeHTML(
                                        chapter.chapterName
                                    )}
                                </span>

                            </div>

                            <i class="fa-solid fa-chevron-down"></i>

                        </div>

                        <div class="exam-lessons"></div>

                    `;


                    const lessonsContainer =
                        chapterBlock.querySelector(
                            ".exam-lessons"
                        );


                    Object.entries(
                        chapter.lessons
                    ).forEach(
                        ([lessonId, lesson]) => {

                            const lessonBlock =
                                document.createElement(
                                    "div"
                                );

                            lessonBlock.className =
                                "exam-lesson";


                            lessonBlock.innerHTML = `

                                <div class="exam-lesson-header">

                                    <div>

                                        <i class="fa-solid fa-book-open"></i>

                                        <span>
                                            ${escapeHTML(
                                                lesson.lessonName
                                            )}
                                        </span>

                                    </div>

                                    <span class="test-count">
                                        ${lesson.tests.length} bài kiểm tra
                                    </span>

                                </div>

                                <div class="exam-tests"></div>

                            `;


                            const testsContainer =
                                lessonBlock.querySelector(
                                    ".exam-tests"
                                );


                            lesson.tests.forEach(
                                (test) => {

                                    const testCard =
                                        createTestCard(
                                            test
                                        );

                                    testsContainer.appendChild(
                                        testCard
                                    );

                                }
                            );


                            lessonsContainer.appendChild(
                                lessonBlock
                            );

                        }
                    );


                    chapterContainer.appendChild(
                        chapterBlock
                    );

                }
            );


            tree.appendChild(
                courseBlock
            );

        }
    );


    setupTreeEvents();

}


/*==================================================
                TEST CARD
==================================================*/

function createTestCard(test) {

    const card =
        document.createElement(
            "button"
        );


    card.type = "button";

    card.className =
        "exam-test-card";


    const questionCount =
        getQuestionCount(test);


    const duration =
        Number(
            test.duration ||
            test.timeLimit ||
            test.time ||
            0
        );


    card.innerHTML = `

        <div class="exam-test-icon">

            <i class="fa-solid fa-file-pen"></i>

        </div>

        <div class="exam-test-info">

            <h3>
                ${escapeHTML(
                    test.title ||
                    test.name ||
                    "Bài kiểm tra"
                )}
            </h3>

            <div class="exam-test-meta">

                <span>

                    <i class="fa-regular fa-clock"></i>

                    ${duration > 0
                        ? duration + " phút"
                        : "Không giới hạn"}

                </span>

                <span>

                    <i class="fa-solid fa-list-ol"></i>

                    ${questionCount} câu

                </span>

            </div>

        </div>

        <i class="fa-solid fa-chevron-right"></i>

    `;


    card.addEventListener(
        "click",
        () => {

            openTestDetail(
                test
            );

        }
    );


    return card;

}


/*==================================================
                TEST DETAIL
==================================================*/

function openTestDetail(test) {

    currentTest = test;

    const tree =
        document.getElementById(
            "examTree"
        );

    const detail =
        document.getElementById(
            "examDetail"
        );

    const breadcrumb =
        document.getElementById(
            "examBreadcrumb"
        );


    if (tree) {

        tree.style.display =
            "none";

    }


    if (detail) {

        detail.style.display =
            "block";

        detail.innerHTML =
            renderTestDetail(
                test
            );

    }


    if (breadcrumb) {

        breadcrumb.textContent =
            `${test.subjectName || test.subject || ""} → ` +
            `${test.courseName || ""} → ` +
            `${test.chapterName || "Chương"} → ` +
            `${test.lessonName || "Bài"}`;

    }


    const startBtn =
        document.getElementById(
            "startExamBtn"
        );


    if (startBtn) {

        startBtn.addEventListener(
            "click",
            () => {

                startExam(
                    test
                );

            }
        );

    }

}


/*==================================================
            RENDER TEST DETAIL
==================================================*/

function renderTestDetail(test) {

    const duration =
        Number(
            test.duration ||
            test.timeLimit ||
            test.time ||
            0
        );


    const questionCount =
        getQuestionCount(test);


    const description =
        test.description ||
        "Bài kiểm tra giúp bạn củng cố và đánh giá kiến thức đã học.";


    return `

        <div class="test-detail-card">

            <div class="test-detail-top">

                <div class="test-detail-icon">

                    <i class="fa-solid fa-file-circle-check"></i>

                </div>

                <div>

                    <span class="detail-label">
                        BÀI KIỂM TRA
                    </span>

                    <h1>
                        ${escapeHTML(
                            test.title ||
                            test.name ||
                            "Bài kiểm tra"
                        )}
                    </h1>

                </div>

            </div>


            <p class="test-description">

                ${escapeHTML(
                    description
                )}

            </p>


            <div class="test-detail-info">

                <div>

                    <i class="fa-regular fa-clock"></i>

                    <span>
                        Thời gian
                    </span>

                    <strong>
                        ${
                            duration > 0
                                ? duration + " phút"
                                : "Không giới hạn"
                        }
                    </strong>

                </div>


                <div>

                    <i class="fa-solid fa-list-ol"></i>

                    <span>
                        Số câu
                    </span>

                    <strong>
                        ${questionCount}
                    </strong>

                </div>


                <div>

                    <i class="fa-solid fa-book-open"></i>

                    <span>
                        Bài học
                    </span>

                    <strong>
                        ${escapeHTML(
                            test.lessonName ||
                            "Chưa xác định"
                        )}
                    </strong>

                </div>

            </div>


            <div class="test-warning">

                <i class="fa-solid fa-circle-info"></i>

                <p>
                    Sau khi bắt đầu, thời gian sẽ được tính
                    và không bị đặt lại khi tải lại trang.
                </p>

            </div>


            <button
                type="button"
                id="startExamBtn"
                class="start-exam-btn"
            >

                <i class="fa-solid fa-play"></i>

                Bắt đầu làm bài

            </button>

        </div>

    `;

}


/*==================================================
                START EXAM
==================================================*/

async function startExam(test) {

    if (examStarted) return;


    const testQuestions =
        extractQuestions(test);


    if (
        testQuestions.length === 0
    ) {

        alert(
            "Bài kiểm tra này chưa có câu hỏi."
        );

        return;

    }


    currentQuestions =
        testQuestions;


    currentAnswers = {};


    const storageKey =
        getExamStorageKey(
            test
        );


    const saved =
        loadExamState(
            storageKey
        );


    if (saved && saved.submitted) {

        alert(
            "Bạn đã nộp bài kiểm tra này."
        );

        return;

    }


    examStarted = true;


    if (saved && saved.answers) {

        currentAnswers =
            saved.answers;

    }


    const startTime =
        saved?.startTime ||
        Date.now();


    const duration =
        Number(
            test.duration ||
            test.timeLimit ||
            test.time ||
            0
        );


    const durationSeconds =
        duration > 0
            ? duration * 60
            : null;


    const endTime =
        durationSeconds
            ? (
                saved?.endTime ||
                startTime +
                durationSeconds * 1000
            )
            : null;


    saveExamState(
        storageKey,
        {

            testId:
                test.id,

            startTime,

            endTime,

            answers:
                currentAnswers,

            submitted:
                false

        }
    );


    const detail =
        document.getElementById(
            "examDetail"
        );

    const workspace =
        document.getElementById(
            "examWorkspace"
        );


    if (detail) {

        detail.style.display =
            "none";

    }


    if (workspace) {

        workspace.style.display =
            "block";

    }


    renderQuestions();


    renderQuestionNavigation();


    updateProgress();


    startTimer(
        endTime
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/*==================================================
            EXTRACT QUESTIONS
==================================================*/

function extractQuestions(test) {

    const questions = [];


    /*
        Phần I:
        test.part1
    */

    if (
        Array.isArray(
            test.part1
        )
    ) {

        test.part1.forEach(
            (q) => {

                questions.push({

                    ...q,

                    part:
                        1,

                    type:
                        q.type ||
                        "single"

                });

            }
        );

    }


    /*
        Phần II:
        test.part2
    */

    if (
        Array.isArray(
            test.part2
        )
    ) {

        test.part2.forEach(
            (q) => {

                questions.push({

                    ...q,

                    part:
                        2,

                    type:
                        q.type ||
                        "trueFalse"

                });

            }
        );

    }


    /*
        Phần III:
        test.part3
    */

    if (
        Array.isArray(
            test.part3
        )
    ) {

        test.part3.forEach(
            (q) => {

                questions.push({

                    ...q,

                    part:
                        3,

                    type:
                        q.type ||
                        "short"

                });

            }
        );

    }


    /*
        Nếu sau này giáo viên lưu trực tiếp
        vào questions thì vẫn đọc được.
    */

    if (
        questions.length === 0 &&
        Array.isArray(
            test.questions
        )
    ) {

        test.questions.forEach(
            (q) => {

                questions.push({

                    ...q,

                    type:
                        q.type ||
                        "single"

                });

            }
        );

    }


    return questions;

}


/*==================================================
                RENDER QUESTIONS
==================================================*/

function renderQuestions() {

    const quiz =
        document.getElementById(
            "quizArea"
        );

    if (!quiz) return;


    quiz.innerHTML = "";


    currentQuestions.forEach(
        (question, index) => {

            const wrapper =
                document.createElement(
                    "article"
                );


            wrapper.className =
                "exam-question";


            wrapper.dataset.index =
                index;


            wrapper.innerHTML =
                renderQuestion(
                    question,
                    index
                );


            quiz.appendChild(
                wrapper
            );

        }
    );


    attachQuestionEvents();

}


/*==================================================
                QUESTION HTML
==================================================*/

function renderQuestion(
    question,
    index
) {

    const number =
        index + 1;


    const type =
        question.type;


    let content = "";


    /*========================================
                SINGLE CHOICE
    ========================================*/

    if (
        type === "single" ||
        type === "radio" ||
        type === "multipleChoice"
    ) {

        const selected =
            currentAnswers[index];


        const options =
            Array.isArray(
                question.options
            )
                ? question.options
                : [];


        content = options.map(
            (option, optionIndex) => {

                const checked =
                    String(
                        selected
                    ) ===
                    String(
                        optionIndex
                    );


                return `

                    <label class="answer-option">

                        <input
                            type="radio"
                            name="question-${index}"
                            value="${optionIndex}"
                            ${checked ? "checked" : ""}
                        >

                        <span class="answer-letter">
                            ${String.fromCharCode(
                                65 + optionIndex
                            )}
                        </span>

                        <span class="answer-content">
                            ${option}
                        </span>

                    </label>

                `;

            }
        ).join("");

    }


    /*========================================
                MULTIPLE CHOICE
    ========================================*/

    else if (
        type === "multi" ||
        type === "multiple"
    ) {

        let selected = [];


        if (
            Array.isArray(
                currentAnswers[index]
            )
        ) {

            selected =
                currentAnswers[index];

        }


        const options =
            Array.isArray(
                question.options
            )
                ? question.options
                : [];


        content = options.map(
            (option, optionIndex) => {

                const checked =
                    selected.includes(
                        optionIndex
                    );


                return `

                    <label class="answer-option">

                        <input
                            type="checkbox"
                            value="${optionIndex}"
                            data-question="${index}"
                            ${checked ? "checked" : ""}
                        >

                        <span class="answer-letter">
                            ${String.fromCharCode(
                                65 + optionIndex
                            )}
                        </span>

                        <span class="answer-content">
                            ${option}
                        </span>

                    </label>

                `;

            }
        ).join("");

    }


    /*========================================
                TRUE / FALSE
    ========================================*/

    else if (
        type === "trueFalse"
    ) {

        let selected = [];


        if (
            Array.isArray(
                currentAnswers[index]
            )
        ) {

            selected =
                currentAnswers[index];

        }


        const statements =
            Array.isArray(
                question.statements
            )
                ? question.statements
                : (
                    Array.isArray(
                        question.options
                    )
                        ? question.options
                        : []
                );


        content = statements.map(
            (statement, statementIndex) => {

                const value =
                    selected[
                        statementIndex
                    ];


                return `

                    <div class="true-false-row">

                        <div class="true-false-statement">

                            <strong>
                                ${statementIndex + 1}.
                            </strong>

                            <span>
                                ${statement}
                            </span>

                        </div>


                        <div class="true-false-buttons">

                            <label>

                                <input
                                    type="radio"
                                    name="tf-${index}-${statementIndex}"
                                    value="true"
                                    data-question="${index}"
                                    data-statement="${statementIndex}"
                                    ${value === true ? "checked" : ""}
                                >

                                <span>
                                    Đúng
                                </span>

                            </label>


                            <label>

                                <input
                                    type="radio"
                                    name="tf-${index}-${statementIndex}"
                                    value="false"
                                    data-question="${index}"
                                    data-statement="${statementIndex}"
                                    ${value === false ? "checked" : ""}
                                >

                                <span>
                                    Sai
                                </span>

                            </label>

                        </div>

                    </div>

                `;

            }
        ).join("");

    }


    /*========================================
                    SHORT
    ========================================*/

    else if (
        type === "short" ||
        type === "shortAnswer"
    ) {

        content = `

            <div class="short-answer">

                <input
                    type="text"
                    value="${escapeAttribute(
                        currentAnswers[index] ||
                        ""
                    )}"
                    data-question="${index}"
                    placeholder="Nhập câu trả lời..."
                    autocomplete="off"
                >

            </div>

        `;

    }


    return `

        <div class="question-header">

            <span class="question-number">
                Câu ${number}
            </span>

            <span class="question-part">
                Phần ${getPartName(
                    question.part
                )}
            </span>

        </div>


        <div class="question-content">

            <div class="question-text">

                ${question.question || ""}

            </div>


            ${
                question.image
                    ? `
                        <div class="question-image">

                            <img
                                src="${escapeAttribute(
                                    question.image
                                )}"
                                alt="Hình câu hỏi"
                            >

                        </div>
                    `
                    : ""
            }


            <div class="answers">

                ${content}

            </div>

        </div>

    `;

}


/*==================================================
            ATTACH QUESTION EVENTS
==================================================*/

function attachQuestionEvents() {

    const quiz =
        document.getElementById(
            "quizArea"
        );


    if (!quiz) return;


    /* radio */

    quiz.querySelectorAll(
        'input[type="radio"]'
    ).forEach(
        (input) => {

            input.addEventListener(
                "change",
                () => {

                    const name =
                        input.name;


                    /*
                        true / false
                    */

                    if (
                        name.startsWith(
                            "tf-"
                        )
                    ) {

                        const questionIndex =
                            Number(
                                input.dataset.question
                            );


                        const statementIndex =
                            Number(
                                input.dataset.statement
                            );


                        if (
                            !Array.isArray(
                                currentAnswers[
                                    questionIndex
                                ]
                            )
                        ) {

                            currentAnswers[
                                questionIndex
                            ] = [];

                        }


                        currentAnswers[
                            questionIndex
                        ][
                            statementIndex
                        ] =
                            input.value ===
                            "true";

                    }

                    else {

                        const questionIndex =
                            Number(
                                name.replace(
                                    "question-",
                                    ""
                                )
                            );


                        currentAnswers[
                            questionIndex
                        ] =
                            Number(
                                input.value
                            );

                    }


                    saveCurrentAnswers();

                    updateProgress();

                    updateQuestionNavigation();

                }
            );

        }
    );


    /* checkbox */

    quiz.querySelectorAll(
        'input[type="checkbox"]'
    ).forEach(
        (input) => {

            input.addEventListener(
                "change",
                () => {

                    const questionIndex =
                        Number(
                            input.dataset.question
                        );


                    let selected =
                        Array.isArray(
                            currentAnswers[
                                questionIndex
                            ]
                        )
                            ? currentAnswers[
                                questionIndex
                            ]
                            : [];


                    const value =
                        Number(
                            input.value
                        );


                    if (
                        input.checked
                    ) {

                        if (
                            !selected.includes(
                                value
                            )
                        ) {

                            selected.push(
                                value
                            );

                        }

                    } else {

                        selected =
                            selected.filter(
                                (item) =>
                                    item !== value
                            );

                    }


                    currentAnswers[
                        questionIndex
                    ] =
                        selected;


                    saveCurrentAnswers();

                    updateProgress();

                    updateQuestionNavigation();

                }
            );

        }
    );


    /* short answer */

    quiz.querySelectorAll(
        ".short-answer input"
    ).forEach(
        (input) => {

            input.addEventListener(
                "input",
                () => {

                    const index =
                        Number(
                            input.dataset.question
                        );


                    currentAnswers[
                        index
                    ] =
                        input.value;


                    saveCurrentAnswers();

                    updateProgress();

                    updateQuestionNavigation();

                }
            );

        }
    );

}


/*==================================================
            QUESTION NAVIGATION
==================================================*/

function renderQuestionNavigation() {

    const nav =
        document.getElementById(
            "questionNav"
        );

    const total =
        document.getElementById(
            "navTotal"
        );


    if (!nav) return;


    nav.innerHTML = "";


    currentQuestions.forEach(
        (_, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "question-nav-number";


            button.textContent =
                index + 1;


            button.addEventListener(
                "click",
                () => {

                    const question =
                        document.querySelector(
                            `.exam-question[data-index="${index}"]`
                        );


                    if (question) {

                        question.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "center"

                        });

                    }

                }
            );


            nav.appendChild(
                button
            );

        }
    );


    if (total) {

        total.textContent =
            `${currentQuestions.length} câu`;

    }


    updateQuestionNavigation();

}


/*==================================================
            UPDATE NAVIGATION
==================================================*/

function updateQuestionNavigation() {

    const buttons =
        document.querySelectorAll(
            ".question-nav-number"
        );


    buttons.forEach(
        (button, index) => {

            if (
                isQuestionAnswered(
                    index
                )
            ) {

                button.classList.add(
                    "answered"
                );

            } else {

                button.classList.remove(
                    "answered"
                );

            }

        }
    );

}


/*==================================================
                PROGRESS
==================================================*/

function updateProgress() {

    const total =
        currentQuestions.length;


    let answered = 0;


    currentQuestions.forEach(
        (_, index) => {

            if (
                isQuestionAnswered(
                    index
                )
            ) {

                answered++;

            }

        }
    );


    const percent =
        total > 0
            ? Math.round(
                (
                    answered /
                    total
                ) * 100
            )
            : 0;


    const progressText =
        document.getElementById(
            "progressText"
        );


    const progressPercent =
        document.getElementById(
            "progressPercent"
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressText) {

        progressText.textContent =
            `Đã làm: ${answered}/${total} câu`;

    }


    if (progressPercent) {

        progressPercent.textContent =
            `${percent}%`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percent}%`;

    }

}


/*==================================================
            CHECK ANSWERED
==================================================*/

function isQuestionAnswered(index) {

    const answer =
        currentAnswers[index];


    if (
        answer === undefined ||
        answer === null
    ) {

        return false;

    }


    if (
        typeof answer ===
        "string"
    ) {

        return answer.trim()
            .length > 0;

    }


    if (
        Array.isArray(answer)
    ) {

        return answer.length > 0;

    }


    return true;

}


/*==================================================
                TIMER
==================================================*/

function startTimer(endTime) {

    const timerText =
        document.getElementById(
            "timerText"
        );


    if (!timerText) return;


    if (!endTime) {

        timerText.textContent =
            "∞";

        return;

    }


    clearInterval(
        timerInterval
    );


    function updateTimer() {

        const remaining =
            Math.max(
                0,
                endTime -
                Date.now()
            );


        const totalSeconds =
            Math.floor(
                remaining /
                1000
            );


        const minutes =
            Math.floor(
                totalSeconds /
                60
            );


        const seconds =
            totalSeconds %
            60;


        timerText.textContent =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;


        const timer =
            document.getElementById(
                "examTimer"
            );


        if (
            timer &&
            totalSeconds <= 60
        ) {

            timer.classList.add(
                "danger"
            );

        }


        if (
            totalSeconds <= 0
        ) {

            clearInterval(
                timerInterval
            );


            autoSubmitExam();

        }

    }


    updateTimer();


    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

}


/*==================================================
                SUBMIT EXAM
==================================================*/

async function submitExam(
    auto = false
) {

    if (examSubmitted) return;


    if (!auto) {

        const confirmed =
            confirm(
                "Bạn có chắc chắn muốn nộp bài không?"
            );


        if (!confirmed) return;

    }


    examSubmitted = true;


    clearInterval(
        timerInterval
    );


    const storageKey =
        getExamStorageKey(
            currentTest
        );


    saveExamState(
        storageKey,
        {

            testId:
                currentTest.id,

            startTime:
                loadExamState(
                    storageKey
                )?.startTime ||
                Date.now(),

            endTime:
                loadExamState(
                    storageKey
                )?.endTime ||
                null,

            answers:
                currentAnswers,

            submitted:
                true,

            submittedAt:
                Date.now()

        }
    );


    /*
        Tạm thời CHƯA xử lý kết quả.
        Chỉ lưu trạng thái bài làm.

        Phần chấm điểm + kết quả sẽ làm sau.
    */


    alert(
        auto
            ? "Đã hết giờ. Bài kiểm tra đã được tự động nộp."
            : "Đã nộp bài kiểm tra."
    );


    examStarted =
        false;


    window.location.reload();

}


/*==================================================
                AUTO SUBMIT
==================================================*/

function autoSubmitExam() {

    if (examSubmitted) return;

    submitExam(true);

}


/*==================================================
                SUBMIT BUTTON
==================================================*/

document.addEventListener(
    "click",
    (e) => {

        if (
            e.target.closest(
                "#submitExamBtn"
            )
        ) {

            submitExam(false);

        }

    }
);


/*==================================================
                STORAGE
==================================================*/

function getExamStorageKey(
    test
) {

    return (
        "ht_exam_" +
        currentUser.uid +
        "_" +
        test.courseId +
        "_" +
        test.id
    );

}


function saveCurrentAnswers() {

    if (!currentTest) return;


    const key =
        getExamStorageKey(
            currentTest
        );


    const oldState =
        loadExamState(
            key
        ) || {};


    saveExamState(
        key,
        {

            ...oldState,

            answers:
                currentAnswers

        }
    );

}


function saveExamState(
    key,
    state
) {

    localStorage.setItem(
        key,
        JSON.stringify(
            state
        )
    );

}


function loadExamState(
    key
) {

    try {

        const value =
            localStorage.getItem(
                key
            );


        if (!value) return null;


        return JSON.parse(
            value
        );

    } catch {

        return null;

    }

}


/*==================================================
            BACK BUTTON
==================================================*/

const examBackBtn =
    document.getElementById(
        "examBackBtn"
    );


if (examBackBtn) {

    examBackBtn.addEventListener(
        "click",
        () => {

            if (examStarted) {

                const confirmed =
                    confirm(
                        "Bạn đang làm bài. Nếu rời khỏi trang, bài làm vẫn được lưu. Bạn có muốn rời đi không?"
                    );


                if (!confirmed) return;

            }


            currentTest =
                null;

            examStarted =
                false;


            const detail =
                document.getElementById(
                    "examDetail"
                );

            const workspace =
                document.getElementById(
                    "examWorkspace"
                );

            const tree =
                document.getElementById(
                    "examTree"
                );


            if (workspace) {

                workspace.style.display =
                    "none";

            }


            if (detail) {

                detail.style.display =
                    "none";

            }


            if (tree) {

                tree.style.display =
                    "block";

            }


            document.getElementById(
                "examBreadcrumb"
            ).textContent =
                "Thi thử";

        }
    );

}


/*==================================================
            CHAPTER / LESSON TOGGLE
==================================================*/

function setupTreeEvents() {

    document
        .querySelectorAll(
            ".exam-chapter-header"
        )
        .forEach(
            (header) => {

                header.addEventListener(
                    "click",
                    () => {

                        const chapter =
                            header.parentElement;


                        chapter.classList.toggle(
                            "open"
                        );

                    }
                );

            }
        );

}


/*==================================================
                HELPERS
==================================================*/

function getQuestionCount(test) {

    let count = 0;


    if (
        Array.isArray(
            test.part1
        )
    ) {

        count +=
            test.part1.length;

    }


    if (
        Array.isArray(
            test.part2
        )
    ) {

        count +=
            test.part2.length;

    }


    if (
        Array.isArray(
            test.part3
        )
    ) {

        count +=
            test.part3.length;

    }


    if (
        count === 0 &&
        Array.isArray(
            test.questions
        )
    ) {

        count =
            test.questions.length;

    }


    return count;

}


function getPartName(
    part
) {

    if (part === 1) {

        return "I";

    }

    if (part === 2) {

        return "II";

    }

    if (part === 3) {

        return "III";

    }

    return "I";

}


function escapeHTML(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/*==================================================
            AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        try {

            await loadCurrentUser(
                user
            );


            await loadGrantedCourses();


            await loadTests();


            document.getElementById(
                "examLoading"
            ).style.display =
                "none";


            document.getElementById(
                "examTree"
            ).style.display =
                "block";


            renderExamTree();


        } catch (error) {

            console.error(
                "Exam loading error:",
                error
            );


            document.getElementById(
                "examLoading"
            ).innerHTML = `

                <div class="exam-error">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h2>
                        Không thể tải bài kiểm tra
                    </h2>

                    <p>
                        Đã xảy ra lỗi khi tải dữ liệu.
                    </p>

                </div>

            `;

        }

    }
);
