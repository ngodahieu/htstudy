/*==================================================
            H&T STUDY - TEST.JS
            TRANG LÀM BÀI KIỂM TRA
==================================================*/

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/*==================================================
                BIẾN TOÀN CỤC
==================================================*/

let currentUser = null;

let currentCourseId = null;

let currentTestId = null;

let currentCourse = null;

let currentTest = null;

let questions = [];

let answers = {};

let currentQuestionIndex = 0;

let remainingSeconds = 0;

let timerInterval = null;

let submitted = false;


/*==================================================
                LẤY PARAMETER URL
==================================================*/

const urlParams =
    new URLSearchParams(window.location.search);

currentCourseId =
    urlParams.get("courseId");

currentTestId =
    urlParams.get("testId");


/*==================================================
                DOM
==================================================*/

const testLoading =
    document.getElementById("testLoading");

const testError =
    document.getElementById("testError");

const testContainer =
    document.getElementById("testContainer");

const testTitle =
    document.getElementById("testTitle");

const testDescription =
    document.getElementById("testDescription");

const testQuestionCount =
    document.getElementById("testQuestionCount");

const testTimer =
    document.getElementById("testTimer");

const questionNumber =
    document.getElementById("questionNumber");

const questionContent =
    document.getElementById("questionContent");

const answerContainer =
    document.getElementById("answerContainer");

const questionGrid =
    document.getElementById("questionGrid");

const previousQuestionBtn =
    document.getElementById("previousQuestionBtn");

const nextQuestionBtn =
    document.getElementById("nextQuestionBtn");

const submitTestBtn =
    document.getElementById("submitTestBtn");


/*==================================================
                HEADER USER
==================================================*/

const avatar =
    document.querySelector(".avatar");

const userMenu =
    document.getElementById("userMenu");

const userName =
    document.getElementById("userName");

const userStudentId =
    document.getElementById("userStudentId");

const userRole =
    document.getElementById("userRole");

const userAvatar =
    document.getElementById("userAvatar");

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

let currentRole = "";


/*==================================================
                USER MENU
==================================================*/

if (avatar) {

    avatar.addEventListener("click", (e) => {

        e.stopPropagation();

        if (userMenu) {

            userMenu.classList.toggle("active");

        }

    });

}


document.addEventListener("click", (e) => {

    if (
        userMenu &&
        avatar &&
        !userMenu.contains(e.target) &&
        !avatar.contains(e.target)
    ) {

        userMenu.classList.remove("active");

    }

});


/*==================================================
                LOAD USER
==================================================*/

async function loadUser(uid) {

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
            );


        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            await signOut(auth);

            return;

        }


        const user =
            userSnap.data();


        currentRole =
            user.role || "";


        if (userBox) {

            userBox.style.display =
                "block";

        }


        if (userMenuList) {

            userMenuList.style.display =
                "block";

        }


        const avatarUrl =
            user.avatar &&
            user.avatar.trim() !== ""

                ? user.avatar

                : "assets/avatars/default.jpg";


        const headerAvatar =
            document.querySelector(".avatar img");


        if (headerAvatar) {

            headerAvatar.src =
                avatarUrl;

        }


        if (userAvatar) {

            userAvatar.src =
                avatarUrl;

        }


        if (userName) {

            userName.textContent =
                user.name ||
                "Người dùng";

        }


        if (userStudentId) {

            userStudentId.textContent =
                user.memberId ||
                "";

        }


        if (userRole) {

            userRole.textContent =
                user.role ||
                "";

        }


        if (myCoursesBtn) {

            myCoursesBtn.style.display =
                user.role === "Học sinh"
                    ? "flex"
                    : "none";

        }


        if (manageBtn) {

            manageBtn.style.display =
                (
                    user.role === "Admin" ||
                    user.role === "Giáo viên"
                )
                    ? "flex"
                    : "none";

        }

    }

    catch (error) {

        console.error(
            "Lỗi load user:",
            error
        );

    }

}


/*==================================================
                LOAD TEST
==================================================*/

async function loadTest() {

    try {

        showLoading();


        if (
            !currentCourseId ||
            !currentTestId
        ) {

            showError(
                "Không tìm thấy thông tin bài kiểm tra."
            );

            return;

        }


        /*------------------------------------------
                LOAD COURSE
        ------------------------------------------*/

        const courseRef =
            doc(
                db,
                "courses",
                currentCourseId
            );


        const courseSnap =
            await getDoc(courseRef);


        if (courseSnap.exists()) {

            currentCourse = {

                id:
                    courseSnap.id,

                ...courseSnap.data()

            };

        }


        /*------------------------------------------
                LOAD TEST
        ------------------------------------------*/

        const testRef =
            doc(
                db,
                "courses",
                currentCourseId,
                "tests",
                currentTestId
            );


        const testSnap =
            await getDoc(testRef);


        if (!testSnap.exists()) {

            showError(
                "Bài kiểm tra không tồn tại hoặc đã bị xóa."
            );

            return;

        }


        currentTest = {

            id:
                testSnap.id,

            ...testSnap.data()

        };


        console.log(
            "TEST:",
            currentTest
        );


        /*------------------------------------------
                LOAD QUESTIONS
        ------------------------------------------*/

        questions =
            extractQuestions(
                currentTest
            );


        console.log(
            "QUESTIONS:",
            questions
        );


        if (!questions.length) {

            showError(
                "Bài kiểm tra chưa có câu hỏi."
            );

            return;

        }


        /*------------------------------------------
                INITIALIZE
        ------------------------------------------*/

        answers = {};

        currentQuestionIndex = 0;

        submitted = false;


        renderTestInfo();

        renderQuestionGrid();

        renderQuestion();

        startTimer();


        hideLoading();

    }

    catch (error) {

        console.error(
            "Lỗi load bài kiểm tra:",
            error
        );


        showError(
            "Không thể tải bài kiểm tra. Vui lòng thử lại."
        );

    }

}


/*==================================================
            EXTRACT QUESTIONS
==================================================*/

function extractQuestions(test) {

    const result = [];


    /*
        Hỗ trợ:

        part1: [
            {...},
            {...}
        ]

        part2: [
            {...}
        ]

        part3: [
            {...}
        ]

        hoặc:

        part1: {
            questions: [...]
        }
    */


    const parts = [
        test.part1,
        test.part2,
        test.part3
    ];


    parts.forEach(
        (part, partIndex) => {

            if (!part) {

                return;

            }


            let partQuestions = [];


            if (Array.isArray(part)) {

                partQuestions =
                    part;

            }

            else if (
                typeof part === "object" &&
                Array.isArray(part.questions)
            ) {

                partQuestions =
                    part.questions;

            }


            partQuestions.forEach(
                (question, index) => {

                    result.push({

                        ...question,

                        part:
                            partIndex + 1,

                        partQuestionIndex:
                            index + 1

                    });

                }
            );

        }
    );


    return result;

}


/*==================================================
                RENDER TEST INFO
==================================================*/

function renderTestInfo() {

    if (testTitle) {

        testTitle.textContent =
            currentTest.title ||
            "Bài kiểm tra";

    }


    if (testDescription) {

        testDescription.textContent =
            currentTest.description ||
            "";

    }


    if (testQuestionCount) {

        testQuestionCount.textContent =
            `${questions.length} câu`;

    }


    document.title =
        `${currentTest.title || "Bài kiểm tra"} | H&T STUDY`;

}


/*==================================================
            RENDER QUESTION GRID
==================================================*/

function renderQuestionGrid() {

    if (!questionGrid) {

        return;

    }


    questionGrid.innerHTML = "";


    questions.forEach(
        (question, index) => {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "question-number";


            button.textContent =
                index + 1;


            button.dataset.index =
                index;


            button.addEventListener(
                "click",
                () => {

                    currentQuestionIndex =
                        index;

                    renderQuestion();

                }
            );


            questionGrid.appendChild(
                button
            );

        }
    );


    updateQuestionGrid();

}


/*==================================================
            UPDATE QUESTION GRID
==================================================*/

function updateQuestionGrid() {

    if (!questionGrid) {

        return;

    }


    const buttons =
        questionGrid.querySelectorAll(
            ".question-number"
        );


    buttons.forEach(
        (button, index) => {

            button.classList.toggle(
                "current",
                index === currentQuestionIndex
            );


            button.classList.toggle(
                "answered",
                answers[index] !== undefined
            );

        }
    );

}


/*==================================================
                RENDER QUESTION
==================================================*/

function renderQuestion() {

    const question =
        questions[currentQuestionIndex];


    if (!question) {

        return;

    }


    if (questionNumber) {

        questionNumber.textContent =
            `Câu ${currentQuestionIndex + 1}`;

    }


    if (questionContent) {

        questionContent.innerHTML =
            formatQuestionText(
                question.question ||
                question.content ||
                question.text ||
                ""
            );

    }


    renderAnswers(
        question
    );


    updateQuestionGrid();

    updateNavigation();

}


/*==================================================
                RENDER ANSWERS
==================================================*/

function renderAnswers(question) {

    if (!answerContainer) {

        return;

    }


    answerContainer.innerHTML = "";


    const options =
        getQuestionOptions(
            question
        );


    if (!options.length) {

        renderTextAnswer(
            question
        );

        return;

    }


    options.forEach(
        (option, index) => {

            const wrapper =
                document.createElement("label");


            wrapper.className =
                "answer-option";


            const optionLetter =
                String.fromCharCode(
                    65 + index
                );


            const input =
                document.createElement("input");


            input.type =
                "radio";


            input.name =
                "question-answer";


            input.value =
                optionLetter;


            const savedAnswer =
                answers[currentQuestionIndex];


            if (
    savedAnswer === optionLetter
) {

    input.checked = true;

    wrapper.classList.add("selected");

}


            const letter =
                document.createElement("span");


            letter.className =
                "answer-letter";


            letter.textContent =
                optionLetter;


            const text =
                document.createElement("span");


            text.className =
                "answer-text";


            text.innerHTML =
                formatQuestionText(
                    option
                );


            wrapper.appendChild(
                input
            );


            wrapper.appendChild(
                letter
            );


            wrapper.appendChild(
                text
            );


            input.addEventListener(
    "change",
    () => {

        answers[currentQuestionIndex] =
            optionLetter;

        answerContainer
            .querySelectorAll(".answer-option")
            .forEach(option => {
                option.classList.remove("selected");
            });

        wrapper.classList.add("selected");

        updateQuestionGrid();

    }
);


            answerContainer.appendChild(
                wrapper
            );

        }
    );

}


/*==================================================
            LẤY ĐÁP ÁN
==================================================*/

function getQuestionOptions(question) {

    if (
        Array.isArray(question.options)
    ) {

        return question.options;

    }


    if (
        Array.isArray(question.answers)
    ) {

        return question.answers;

    }


    const result = [];


    if (question.A !== undefined) {

        result.push(
            question.A
        );

    }


    if (question.B !== undefined) {

        result.push(
            question.B
        );

    }


    if (question.C !== undefined) {

        result.push(
            question.C
        );

    }


    if (question.D !== undefined) {

        result.push(
            question.D
        );

    }


    return result;

}


/*==================================================
            CÂU TRẢ LỜI TỰ LUẬN
==================================================*/

function renderTextAnswer(question) {

    const textarea =
        document.createElement("textarea");


    textarea.className =
        "essay-answer";


    textarea.placeholder =
        "Nhập câu trả lời của bạn...";


    textarea.value =
        answers[currentQuestionIndex] || "";


    textarea.addEventListener(
        "input",
        () => {

            answers[
                currentQuestionIndex
            ] =
                textarea.value;


            updateQuestionGrid();

        }
    );


    answerContainer.appendChild(
        textarea
    );

}


/*==================================================
                NAVIGATION
==================================================*/

function updateNavigation() {

    if (previousQuestionBtn) {

        previousQuestionBtn.disabled =
            currentQuestionIndex === 0;

    }


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            currentQuestionIndex ===
            questions.length - 1;

    }

}


/*==================================================
                NEXT
==================================================*/

if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
        "click",
        () => {

            if (
                currentQuestionIndex <
                questions.length - 1
            ) {

                currentQuestionIndex++;

                renderQuestion();

                scrollToQuestion();

            }

        }
    );

}


/*==================================================
                PREVIOUS
==================================================*/

if (previousQuestionBtn) {

    previousQuestionBtn.addEventListener(
        "click",
        () => {

            if (
                currentQuestionIndex > 0
            ) {

                currentQuestionIndex--;

                renderQuestion();

                scrollToQuestion();

            }

        }
    );

}


/*==================================================
                SCROLL
==================================================*/

function scrollToQuestion() {

    const questionArea =
        document.querySelector(
            ".test-question-area"
        );


    if (questionArea) {

        questionArea.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/*==================================================
                TIMER
==================================================*/

function startTimer() {

    clearInterval(
        timerInterval
    );


    const duration =
        Number(
            currentTest.duration
        ) || 0;


    /* Không giới hạn */

    if (duration <= 0) {

        if (testTimer) {

            testTimer.textContent =
                "Không giới hạn";

        }

        return;

    }


    remainingSeconds =
        duration * 60;


    updateTimer();


    timerInterval =
        setInterval(
            () => {

                remainingSeconds--;


                updateTimer();


                if (
                    remainingSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    autoSubmit();

                }

            },
            1000
        );

}


/*==================================================
                UPDATE TIMER
==================================================*/

function updateTimer() {

    if (!testTimer) {

        return;

    }


    if (
        remainingSeconds <= 0
    ) {

        testTimer.textContent =
            "00:00";

        return;

    }


    const hours =
        Math.floor(
            remainingSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                remainingSeconds % 3600
            ) / 60
        );


    const seconds =
        remainingSeconds % 60;


    if (hours > 0) {

        testTimer.textContent =
            `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    }

    else {

        testTimer.textContent =
            `${pad(minutes)}:${pad(seconds)}`;

    }


    const timerStat =
    document.querySelector(".timer-stat");

if (
    remainingSeconds <= 60
) {

    testTimer.classList.add("danger");

    if (timerStat) {
        timerStat.classList.add("danger");
    }

}

else {

    testTimer.classList.remove("danger");

    if (timerStat) {
        timerStat.classList.remove("danger");
    }

}

}


/*==================================================
                PAD NUMBER
==================================================*/

function pad(value) {

    return String(value)
        .padStart(2, "0");

}


/*==================================================
                SUBMIT TEST
==================================================*/

if (submitTestBtn) {

    submitTestBtn.addEventListener(
        "click",
        () => {

            submitTest();

        }
    );

}


/*==================================================
                SUBMIT
==================================================*/

async function submitTest() {

    if (submitted) {

        return;

    }


    const unanswered =
        questions.filter(
            (_, index) =>
                answers[index] === undefined ||
                answers[index] === ""
        ).length;


    let message =
        "Bạn có chắc chắn muốn nộp bài?";


    if (unanswered > 0) {

        message +=
            `\n\nBạn còn ${unanswered} câu chưa trả lời.`;

    }


    const confirmed =
        confirm(message);


    if (!confirmed) {

        return;

    }


    await finishTest();

}


/*==================================================
            AUTO SUBMIT
==================================================*/

async function autoSubmit() {

    if (submitted) {

        return;

    }


    alert(
        "Đã hết thời gian làm bài. Bài làm sẽ được tự động nộp."
    );


    await finishTest();

}


/*==================================================
                FINISH TEST
==================================================*/

async function finishTest() {

    if (submitted) {

        return;

    }
if (!currentUser) {

    alert(
        "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
    );

    window.location.href =
        "index.html";

    return;

}


    submitted = true;


    clearInterval(
        timerInterval
    );


    if (submitTestBtn) {

        submitTestBtn.disabled =
            true;

        submitTestBtn.innerHTML =
            `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Đang nộp bài...
            `;

    }


    try {

        const scoreData =
            calculateScore();


        const resultData = {

            userId:
                currentUser.uid,

            courseId:
                currentCourseId,

            testId:
                currentTestId,

            answers:
                answers,

            score:
                scoreData.score,

            correct:
                scoreData.correct,

            total:
                questions.length,

            submittedAt:
                serverTimestamp()

        };


        /*
            Lưu kết quả:

            results
        */

        await addDoc(
            collection(
                db,
                "results"
            ),
            resultData
        );


        /*
            Chuyển sang trang kết quả
        */

        const params =
            new URLSearchParams({

                courseId:
                    currentCourseId,

                testId:
                    currentTestId

            });


        window.location.href =
            `test-result.html?${params.toString()}`;

    }

    catch (error) {

        console.error(
            "Lỗi nộp bài:",
            error
        );


        submitted = false;


        if (submitTestBtn) {

            submitTestBtn.disabled =
                false;

            submitTestBtn.innerHTML =
                `
                <i class="fa-solid fa-paper-plane"></i>
                Nộp bài
                `;

        }


        alert(
            "Không thể nộp bài. Vui lòng thử lại."
        );

    }

}


/*==================================================
                TÍNH ĐIỂM
==================================================*/

function calculateScore() {

    let correct = 0;


    questions.forEach(
        (question, index) => {

            const userAnswer =
                answers[index];


            const correctAnswer =
                normalizeAnswer(
                    question.correctAnswer ||
                    question.answer ||
                    question.correct ||
                    ""
                );


            if (
                userAnswer &&
                normalizeAnswer(
                    userAnswer
                ) === correctAnswer
            ) {

                correct++;

            }

        }
    );


    const score =
        questions.length > 0

            ? (
                correct /
                questions.length
            ) * 10

            : 0;


    return {

        correct,

        score:
            Math.round(
                score * 100
            ) / 100

    };

}


/*==================================================
            NORMALIZE ANSWER
==================================================*/

function normalizeAnswer(value) {

    return String(
        value || ""
    )
        .trim()
        .toUpperCase();

}


/*==================================================
                FORMAT QUESTION
==================================================*/

function formatQuestionText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value);

}


/*==================================================
                LOADING
==================================================*/

function showLoading() {

    if (testLoading) {

        testLoading.style.display =
            "flex";

    }


    if (testContainer) {

        testContainer.style.display =
            "none";

    }


    if (testError) {

        testError.style.display =
            "none";

    }

}


/*==================================================
                HIDE LOADING
==================================================*/

function hideLoading() {

    if (testLoading) {

        testLoading.style.display =
            "none";

    }


    if (testContainer) {

        testContainer.style.display =
            "block";

    }


    if (testError) {

        testError.style.display =
            "none";

    }

}


/*==================================================
                ERROR
==================================================*/

function showError(message) {

    clearInterval(
        timerInterval
    );


    if (testLoading) {

        testLoading.style.display =
            "none";

    }


    if (testContainer) {

        testContainer.style.display =
            "none";

    }


    if (testError) {

        testError.style.display =
            "flex";


        testError.innerHTML =
            `
            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Không thể tải bài kiểm tra
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                id="backExamBtn"
            >
                <i class="fa-solid fa-arrow-left"></i>
                Quay lại
            </button>
            `;


        const backExamBtn =
            document.getElementById(
                "backExamBtn"
            );


        if (backExamBtn) {

            backExamBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `exam.html`;

                }
            );

        }

    }

}


/*==================================================
                USER BUTTONS
==================================================*/

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            clearInterval(
                timerInterval
            );


            await signOut(
                auth
            );


            window.location.href =
                "index.html";

        }
    );

}


if (myCoursesBtn) {

    myCoursesBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-courses.html";

        }
    );

}


if (manageBtn) {

    manageBtn.addEventListener(
        "click",
        () => {

            if (
                currentRole === "Admin"
            ) {

                window.location.href =
                    "dashboard/admin.html";

            }

            else if (
                currentRole === "Giáo viên"
            ) {

                window.location.href =
                    "dashboard/teacher.html";

            }

        }
    );

}


/*==================================================
                ESCAPE HTML
==================================================*/

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/*==================================================
                AUTH
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser =
            user;


        if (!user) {

            window.location.replace(
                "index.html"
            );

            return;

        }


        await loadUser(
            user.uid
        );


        await loadTest();

    }
);
