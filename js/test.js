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

let currentRole = "";

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
        LƯU TRẠNG THÁI BÀI KIỂM TRA
==================================================*/

let testStorageKey = null;
let testTimerKey = null;
let testAnswerKey = null;
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
        STORAGE KEY
==================================================*/

function initializeStorageKeys() {

    if (!currentUser) {
        return;
    }

    const userId =
        currentUser.uid;

    testStorageKey =
        `htstudy_test_${userId}_${currentCourseId}_${currentTestId}`;

    testTimerKey =
        `${testStorageKey}_timer`;

    testAnswerKey =
        `${testStorageKey}_answers`;
}
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
const headerTestTimer =
    document.getElementById("headerTestTimer");

const headerSubmitTestBtn =
    document.getElementById("headerSubmitTestBtn");

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
                HEADER / USER DOM
==================================================*/

const userBox =
    document.getElementById("userBox");

const userMenuList =
    document.getElementById("userMenuList");

const userAvatar =
    document.getElementById("userAvatar");

const userStudentId =
    document.getElementById("userStudentId");

const userRole =
    document.getElementById("userRole");

const myCoursesBtn =
    document.getElementById("myCoursesBtn");

const manageBtn =
    document.getElementById("manageBtn");
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


        const headerUserName =
    document.getElementById("headerUserName");

if (headerUserName) {

    headerUserName.textContent =
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
            SAVE ANSWERS
==================================================*/

function saveAnswers() {

    if (!testAnswerKey) {
        return;
    }

    try {

        localStorage.setItem(
            testAnswerKey,
            JSON.stringify(answers)
        );

    }

    catch (error) {

        console.error(
            "Không thể lưu đáp án:",
            error
        );

    }

}


/*==================================================
            LOAD ANSWERS
==================================================*/

function loadAnswers() {

    if (!testAnswerKey) {
        return {};
    }

    try {

        const savedAnswers =
            localStorage.getItem(
                testAnswerKey
            );

        if (!savedAnswers) {
            return {};
        }

        const parsed =
            JSON.parse(
                savedAnswers
            );

        if (
            parsed &&
            typeof parsed === "object"
        ) {

            return parsed;

        }

    }

    catch (error) {

        console.error(
            "Không thể tải đáp án đã lưu:",
            error
        );

    }

    return {};

}
/*==================================================
        SAVE CURRENT QUESTION
==================================================*/

function saveCurrentQuestion() {

    if (!testStorageKey) {
        return;
    }

    try {

        localStorage.setItem(
            `${testStorageKey}_currentQuestion`,
            String(currentQuestionIndex)
        );

    }

    catch (error) {

        console.error(
            "Không thể lưu câu hiện tại:",
            error
        );

    }

}


/*==================================================
        LOAD CURRENT QUESTION
==================================================*/

function loadCurrentQuestion() {

    if (!testStorageKey) {
        return 0;
    }

    try {

        const savedIndex =
            localStorage.getItem(
                `${testStorageKey}_currentQuestion`
            );

        if (savedIndex === null) {
            return 0;
        }

        const index =
            Number(savedIndex);

        if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < questions.length
        ) {

            return index;

        }

    }

    catch (error) {

        console.error(
            "Không thể tải câu hiện tại:",
            error
        );

    }

    return 0;

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
        KHỞI TẠO TRẠNG THÁI
------------------------------------------*/

initializeStorageKeys();

/*
    Nếu reload trang:
    - Lấy lại đáp án
    - Lấy lại câu đang làm
*/

answers =
    loadAnswers();

currentQuestionIndex =
    loadCurrentQuestion();

submitted =
    false;


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

        saveCurrentQuestion();

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

            const isCurrent =
                index === currentQuestionIndex;

            const hasAnswer =
                answers[index] !== undefined &&
                answers[index] !== null &&
                String(
                    answers[index]
                ).trim() !== "";


            /*----------------------------------
                XÓA TRẠNG THÁI CŨ
            ----------------------------------*/

            button.classList.remove(
                "current",
                "answered"
            );


            /*----------------------------------
                ƯU TIÊN ANSWERED
            ----------------------------------*/

            if (hasAnswer) {

                button.classList.add(
                    "answered"
                );

            }

            else if (isCurrent) {

                button.classList.add(
                    "current"
                );

            }

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

/*------------------------------------------
    RENDER CÔNG THỨC TOÁN / HÓA
------------------------------------------*/

renderMath();
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

        /*----------------------------------
            LƯU ĐÁP ÁN NGAY LẬP TỨC
        ----------------------------------*/

        saveAnswers();


        /*----------------------------------
            HIỂN THỊ OPTION ĐANG CHỌN
        ----------------------------------*/

        answerContainer
            .querySelectorAll(".answer-option")
            .forEach(option => {

                option.classList.remove(
                    "selected"
                );

            });


        wrapper.classList.add(
            "selected"
        );


        /*----------------------------------
            CẬP NHẬT DANH SÁCH CÂU HỎI
        ----------------------------------*/

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


        saveAnswers();


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

saveCurrentQuestion();

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

saveCurrentQuestion();

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


    /*------------------------------------------
        KHÔNG GIỚI HẠN THỜI GIAN
    ------------------------------------------*/

    if (duration <= 0) {

        if (testTimer) {

            testTimer.textContent =
                "Không giới hạn";

        }

        if (headerTestTimer) {

            headerTestTimer.textContent =
                "Không giới hạn";

        }

        return;

    }


    /*------------------------------------------
        LẤY THỜI ĐIỂM KẾT THÚC ĐÃ LƯU
    ------------------------------------------*/

    let endTime =
        null;


    try {

        const savedEndTime =
            localStorage.getItem(
                testTimerKey
            );


        if (savedEndTime) {

            endTime =
                Number(
                    savedEndTime
                );

        }

    }

    catch (error) {

        console.error(
            "Không thể đọc timer:",
            error
        );

    }


    /*------------------------------------------
        NẾU CHƯA CÓ TIMER
        → TẠO TIMER MỚI
    ------------------------------------------*/

    if (
        !endTime ||
        !Number.isFinite(endTime)
    ) {

        endTime =
            Date.now() +
            duration * 60 * 1000;


        try {

            localStorage.setItem(
                testTimerKey,
                String(endTime)
            );

        }

        catch (error) {

            console.error(
                "Không thể lưu timer:",
                error
            );

        }

    }


    /*------------------------------------------
        UPDATE NGAY
    ------------------------------------------*/

    updateRemainingTime(
        endTime
    );


    /*------------------------------------------
        CHẠY ĐỒNG HỒ
    ------------------------------------------*/

    timerInterval =
        setInterval(
            () => {

                updateRemainingTime(
                    endTime
                );

            },
            1000
        );

}
/*==================================================
        UPDATE REMAINING TIME
==================================================*/

function updateRemainingTime(endTime) {

    const now =
        Date.now();


    const difference =
        endTime - now;


    remainingSeconds =
        Math.max(
            0,
            Math.ceil(
                difference / 1000
            )
        );


    updateTimer();


    /*------------------------------------------
        HẾT GIỜ
    ------------------------------------------*/

    if (
        remainingSeconds <= 0
    ) {

        clearInterval(
            timerInterval
        );


        /*--------------------------------------
            XÓA TIMER CŨ
        --------------------------------------*/

        try {

            localStorage.removeItem(
                testTimerKey
            );

        }

        catch (error) {

            console.error(
                "Không thể xóa timer:",
                error
            );

        }


        autoSubmit();

    }

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

    if (headerTestTimer) {

        headerTestTimer.textContent =
            "00:00";

    }

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


    let timerText = "";

if (hours > 0) {

    timerText =
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

}

else {

    timerText =
        `${pad(minutes)}:${pad(seconds)}`;

}


testTimer.textContent =
    timerText;


if (headerTestTimer) {

    headerTestTimer.textContent =
        timerText;

}


    const timerStat =
    document.querySelector(".timer-stat");

if (
    remainingSeconds <= 60
) {

    testTimer.classList.add("danger");
if (headerTestTimer) {

    headerTestTimer.classList.add("danger");

}

    if (timerStat) {
        timerStat.classList.add("danger");
    }

}

else {

    testTimer.classList.remove("danger");
if (headerTestTimer) {

    headerTestTimer.classList.remove("danger");

}

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
if (headerSubmitTestBtn) {

    headerSubmitTestBtn.addEventListener(
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
        CLEAR TEST STORAGE
==================================================*/

function clearTestStorage() {

    if (!testStorageKey) {
        return;
    }


    try {

        localStorage.removeItem(
            testAnswerKey
        );

        localStorage.removeItem(
            testTimerKey
        );

        localStorage.removeItem(
            `${testStorageKey}_currentQuestion`
        );

    }

    catch (error) {

        console.error(
            "Không thể xóa dữ liệu bài kiểm tra:",
            error
        );

    }

}
/*==================================================
                FINISH TEST
==================================================*/
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

    if (headerSubmitTestBtn) {

        headerSubmitTestBtn.disabled =
            true;

    }

    try {

        /*==========================================
                TÍNH ĐIỂM
        ==========================================*/

        const scoreData =
            calculateScore();


        /*==========================================
                PHÂN TÍCH CÂU ĐÚNG / SAI / BỎ TRỐNG
        ==========================================*/

        let wrong = 0;

        let unanswered = 0;


        questions.forEach(
            (question, index) => {

                const userAnswer =
                    answers[index];


                /*------------------------------
                    CHƯA TRẢ LỜI
                ------------------------------*/

                if (
                    userAnswer === undefined ||
                    userAnswer === null ||
                    String(userAnswer).trim() === ""
                ) {

                    unanswered++;

                    return;

                }


                /*------------------------------
                    ĐÁP ÁN ĐÚNG
                ------------------------------*/

                const correctAnswer =
                    normalizeAnswer(
                        question.correctAnswer ||
                        question.answer ||
                        question.correct ||
                        ""
                    );


                /*------------------------------
                    ĐÁP ÁN SAI
                ------------------------------*/

                if (
                    normalizeAnswer(
                        userAnswer
                    ) !== correctAnswer
                ) {

                    wrong++;

                }

            }
        );


        /*==========================================
                LƯU THÔNG TIN CÂU HỎI
        ==========================================*/

        const resultQuestions =
            questions.map(
                (question, index) => {

                    const correctAnswer =
                        normalizeAnswer(
                            question.correctAnswer ||
                            question.answer ||
                            question.correct ||
                            ""
                        );

                    const userAnswer =
                        answers[index] || "";


                    return {

                        question:
                            question.question ||
                            question.content ||
                            question.text ||
                            "",

                        options:
                            getQuestionOptions(
                                question
                            ),

                        correctAnswer:
                            correctAnswer,

                        userAnswer:
                            userAnswer,

                        isCorrect:
                            userAnswer !== "" &&
                            normalizeAnswer(
                                userAnswer
                            ) === correctAnswer,

                        part:
                            question.part || 1,

                        partQuestionIndex:
                            question.partQuestionIndex || 1

                    };

                }
            );


        /*==========================================
                DỮ LIỆU KẾT QUẢ
        ==========================================*/

        const resultData = {

            userId:
                currentUser.uid,

            courseId:
                currentCourseId,

            testId:
                currentTestId,

            testTitle:
                currentTest.title ||
                "Bài kiểm tra",

            answers:
                answers,

            questions:
                resultQuestions,

            score:
                scoreData.score,

            correct:
                scoreData.correct,

            wrong:
                wrong,

            unanswered:
                unanswered,

            total:
                questions.length,

            submittedAt:
                serverTimestamp()

        };


        console.log(
            "RESULT DATA:",
            resultData
        );


        /*==========================================
                LƯU FIRESTORE
        ==========================================*/

        await addDoc(
            collection(
                db,
                "results"
            ),
            resultData
        );


        /*==========================================
                XÓA TRẠNG THÁI BÀI ĐANG LÀM
        ==========================================*/

        clearTestStorage();


        /*==========================================
                QUAY VỀ TRANG CHỦ
        ==========================================*/

        window.location.href =
            "index.html";

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


        if (headerSubmitTestBtn) {

            headerSubmitTestBtn.disabled =
                false;

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
        FORMAT QUESTION / ANSWER
        TỰ ĐỘNG NHẬN DIỆN CÔNG THỨC
==================================================*/

function formatQuestionText(value) {

    console.log("FORMAT INPUT:", value);


    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    let text =
        String(value);


    /*
        Nếu nội dung đã là MathJax / LaTeX
        thì giữ nguyên.
    */

    if (
        text.includes("\\(") ||
        text.includes("\\[") ||
        text.includes("$$")
    ) {

        return text;

    }


    /*
        Escape HTML
    */

    text =
        escapeHTML(text);


    /*
        ==============================
        CÔNG THỨC HÓA HỌC
        ==============================

        CH3COOH
        →
        CH₃COOH

        H2SO4
        →
        H₂SO₄

        C6H12O6
        →
        C₆H₁₂O₆
    */

    text =
        convertChemicalFormulas(text);


    /*
        ==============================
        CÔNG THỨC TOÁN / VẬT LÝ
        ==============================
    */

    text =
        convertMathFormulas(text);


    /*
        Xuống dòng
    */

    text =
        text.replace(
            /\n/g,
            "<br>"
        );


    return text;

}
/*==================================================
        CHUYỂN CÔNG THỨC HÓA HỌC
==================================================*/

function convertChemicalFormulas(text) {

function makeChemicalSubscript(digit) {

    return `<sub class="chemical-subscript">${digit}</sub>`;

}

    /*
        Danh sách ký hiệu nguyên tố
    */

    const elements = new Set([

        "H", "He",
        "Li", "Be", "B", "C", "N", "O", "F", "Ne",

        "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",

        "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe",
        "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se",
        "Br", "Kr",

        "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru",
        "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te",
        "I", "Xe",

        "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm",
        "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
        "Lu",

        "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au",
        "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn",

        "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu",
        "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No",
        "Lr",

        "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg",
        "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"

    ]);


    /*
        Hàm chuyển số thành chỉ số dưới
    */

    /*
        Nhận diện một công thức hóa học.

        Ví dụ:

        H2O
        CO2
        H2SO4
        CH3COOH
        CH3COCH3
        CH3COOCH3
        C6H12O6
        Ca(OH)2
        Al2(SO4)3
        Fe(NO3)3
    */

    const formulaRegex =
        /(?<![A-Za-z])(?:[A-Z][a-z]?(?:\d+)?|\((?:[A-Z][a-z]?(?:\d+)?)+\)(?:\d+)?)+(?![A-Za-z])/g;


    return text.replace(
        formulaRegex,
        match => {

            /*
                Tách từng thành phần:

                CH3COOH

                C
                H3
                C
                O
                O
                H
            */

            const tokens =
                match.match(
                    /[A-Z][a-z]?(?:\d+)?|\((?:[A-Z][a-z]?(?:\d+)?)+\)(?:\d+)?/g
                );


            if (!tokens) {
                return match;
            }


            /*
                Kiểm tra xem có thật sự là
                công thức hóa học hay không.
            */

            for (const token of tokens) {

                /*
                    Trường hợp:

                    Ca2
                    Fe3
                    H2
                */

                if (!token.startsWith("(")) {

                    const elementMatch =
                        token.match(
                            /^([A-Z][a-z]?)(\d+)?$/
                        );


                    if (!elementMatch) {
                        return match;
                    }


                    const element =
                        elementMatch[1];


                    if (!elements.has(element)) {
                        return match;
                    }

                }

                /*
                    Trường hợp:

                    (OH)2
                    (SO4)3
                    (NO3)2
                */

                else {

                    const inside =
                        token.match(
                            /^\((.*)\)(\d+)?$/
                        );


                    if (!inside) {
                        return match;
                    }


                    const content =
                        inside[1];


                    const innerElements =
                        content.match(
                            /[A-Z][a-z]?/g
                        );


                    if (!innerElements) {
                        return match;
                    }


                    const valid =
                        innerElements.every(
                            element =>
                                elements.has(element)
                        );


                    if (!valid) {
                        return match;
                    }

                }

            }


            /*
                Đã xác định chắc chắn đây là
                công thức hóa học.

                Chuyển toàn bộ số thành
                chỉ số dưới.
            */

            return match.replace(
    /\d+/g,
    number =>
        `<sub class="chemical-subscript">${number}</sub>`
);

        }
    );

}
/*==================================================
        NHẬN DIỆN CÔNG THỨC TOÁN / VẬT LÝ
==================================================*/

function convertMathFormulas(text) {

    /*
        ==============================
        LŨY THỪA DẠNG x^2
        ==============================

        x^2
        x^3
        a^2
        m^2
    */

    text =
        text.replace(
            /(?<![A-Za-z0-9\\])([A-Za-z])\^(\d+)(?![A-Za-z0-9])/g,
            "\\($1^{$2}\\)"
        );


    /*
        ==============================
        LŨY THỪA DẠNG x2
        ==============================

        x2
        x3
        a2
        m2

        Không áp dụng nếu phía trước
        là chữ cái viết hoa kiểu H2SO4
        vì công thức Hóa đã được xử lý trước.
    */

    text =
        text.replace(
            /(?<![A-Za-z])([a-z])(\d+)(?![A-Za-z])/g,
            "\\($1^{$2}\\)"
        );


    /*
        ==============================
        PHÂN SỐ ĐƠN GIẢN
        ==============================

        a/b
        x/y
        m/t

        Chỉ xử lý dạng rất đơn giản
        để tránh ảnh hưởng text bình thường.
    */

    text =
        text.replace(
            /(?<![A-Za-z0-9\\])([a-zA-Z])\/([a-zA-Z])(?![A-Za-z0-9])/g,
            "\\(\\frac{$1}{$2}\\)"
        );


    /*
        ==============================
        CÔNG THỨC VẬT LÝ / TOÁN
        ==============================

        Ví dụ:

        F = ma
        F=ma

        v = s/t
        E = mc2
        P = Fv
    */

    text =
        text.replace(
            /(?<![A-Za-z0-9\\])([A-Za-z])\s*=\s*([A-Za-z0-9]+(?:[*/.][A-Za-z0-9]+)*)(?![A-Za-z0-9])/g,
            (match, left, right) => {

                /*
                    Nếu đã nằm trong MathJax
                    thì không xử lý lại.
                */

                if (
                    match.includes("\\(")
                ) {

                    return match;

                }

                let formula =
                    right;

                /*
                    Chuyển dấu . thành
                    phép nhân.
                */

                formula =
                    formula.replace(
                        /\./g,
                        "\\cdot "
                    );

                /*
                    Chuyển dạng a/b
                    thành phân số.
                */

                const fractionMatch =
                    formula.match(
                        /^([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/
                    );

                if (fractionMatch) {

                    formula =
                        `\\frac{${fractionMatch[1]}}{${fractionMatch[2]}}`;

                }

                /*
                    Xử lý số mũ ở dạng:

                    mc2
                    x2
                */

                formula =
                    formula.replace(
                        /([A-Za-z])(\d+)/g,
                        "$1^{$2}"
                    );

                return `\\(${left} = ${formula}\\)`;

            }
        );


    return text;

}
/*==================================================
            RENDER MATHJAX
==================================================*/

function renderMath() {

    if (
        typeof MathJax === "undefined"
    ) {

        return;

    }

    if (
        typeof MathJax.typesetPromise !== "function"
    ) {

        return;

    }

    MathJax.typesetPromise([
        questionContent,
        answerContainer
    ])
    .catch(error => {

        console.error(
            "Lỗi render MathJax:",
            error
        );

    });

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
