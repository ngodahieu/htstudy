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
    
    if (test.part1?.questions) {
        test.part1.questions.forEach((q, idx) => {
            result.push({
                ...q,
                part: 1,
                points: q.points ?? test.part1.points ?? 0.5, // Lấy điểm chuẩn của Phần I
                partQuestionIndex: idx + 1
            });
        });
    }

    if (test.part2?.questions) {
        test.part2.questions.forEach((q, idx) => {
            result.push({
                ...q,
                part: 2,
                scores: test.part2.scores,
                partQuestionIndex: idx + 1
            });
        });
    }

    if (test.part3?.questions) {
        test.part3.questions.forEach((q, idx) => {
            result.push({
                ...q,
                part: 3,
                points: q.points ?? test.part3.points ?? 0.5,
                partQuestionIndex: idx + 1
            });
        });
    }

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
    if (!answerContainer) return;
    answerContainer.innerHTML = "";

    // PHẦN I: Trắc nghiệm A, B, C, D
    if (question.part === 1) {
        const options = getQuestionOptions(question);
        options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const wrapper = document.createElement("label");
            wrapper.className = "answer-option";
            const checked = answers[currentQuestionIndex] === letter ? "checked" : "";
            if (checked) wrapper.classList.add("selected");

            wrapper.innerHTML = `
                <input type="radio" name="part1-ans" value="${letter}" ${checked}>
                <span class="answer-letter">${letter}</span>
                <span class="answer-text">${formatQuestionText(option)}</span>
            `;

            wrapper.querySelector("input").addEventListener("change", () => {
                answers[currentQuestionIndex] = letter;
                saveAnswers();
                renderQuestion();
            });
            answerContainer.appendChild(wrapper);
        });
    }

    // PHẦN II: Đúng / Sai (4 mệnh đề a, b, c, d)
    else if (question.part === 2) {
        if (!answers[currentQuestionIndex]) {
            answers[currentQuestionIndex] = [null, null, null, null];
        }
        const statements = question.statements || [];
        statements.forEach((stmt, sIdx) => {
            const row = document.createElement("div");
            row.className = "tf-answer-row";
            const currentVal = answers[currentQuestionIndex][sIdx];

            row.innerHTML = `
                <div class="tf-stmt-text"><b>${String.fromCharCode(97 + sIdx)}.</b> ${formatQuestionText(stmt)}</div>
                <div class="tf-btn-group">
                    <button type="button" class="btn-tf ${currentVal === true ? 'active-true' : ''}" data-val="true">Đúng</button>
                    <button type="button" class="btn-tf ${currentVal === false ? 'active-false' : ''}" data-val="false">Sai</button>
                </div>
            `;

            row.querySelectorAll(".btn-tf").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const val = e.target.dataset.val === "true";
                    answers[currentQuestionIndex][sIdx] = val;
                    saveAnswers();
                    renderQuestion();
                });
            });
            answerContainer.appendChild(row);
        });
    }

    // PHẦN III: Trả lời ngắn / Điền số
    else if (question.part === 3) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "short-answer-input";
        input.placeholder = "Nhập đáp án (ví dụ: 0,25)...";
        input.value = answers[currentQuestionIndex] || "";

        input.addEventListener("input", (e) => {
            answers[currentQuestionIndex] = e.target.value.trim();
            saveAnswers();
            updateQuestionGrid();
        });
        answerContainer.appendChild(input);
    }
}
/*==================================================
            LẤY ĐÁP ÁN
==================================================*/
function getQuestionOptions(question) {
    if (question.part === 1 && Array.isArray(question.options)) {
        return question.options;
    }
    return [];
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
const resultQuestions = questions.map((question, index) => {
    return {
        question: question.question || "",
        options: question.options || [],
        statements: question.statements || [],
        correctAnswer: question.correctAnswer ?? question.answer ?? question.answers ?? "",
        userAnswer: answers[index] ?? null,
        part: question.part || 1,
        partQuestionIndex: question.partQuestionIndex || 1
    };
});
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
    let totalScore = 0;
    let totalCorrectCount = 0;

    questions.forEach((q, idx) => {
        const userAns = answers[idx];

        if (q.part === 1) {
            const correctLetter = normalizeAnswer(q.correctAnswer);
            if (userAns && userAns === correctLetter) {
                totalScore += Number(currentTest.part1?.points || 0.25);
                totalCorrectCount++;
            }
        } 
        else if (q.part === 2) {
            if (Array.isArray(userAns)) {
                let matchCount = 0;
                q.answers.forEach((correctVal, sIdx) => {
                    if (userAns[sIdx] === correctVal) matchCount++;
                });

                const scores = currentTest.part2?.scores || { one: 0.1, two: 0.25, three: 0.5, four: 1.0 };
                if (matchCount === 1) totalScore += Number(scores.one || 0.1);
                else if (matchCount === 2) totalScore += Number(scores.two || 0.25);
                else if (matchCount === 3) totalScore += Number(scores.three || 0.5);
                else if (matchCount === 4) {
                    totalScore += Number(scores.four || 1.0);
                    totalCorrectCount++;
                }
            }
        } 
        else if (q.part === 3) {
            const correctText = String(q.answer || "").trim().replace(",", ".");
            const userText = String(userAns || "").trim().replace(",", ".");
            if (userText !== "" && userText === correctText) {
                totalScore += Number(currentTest.part3?.points || 0.25);
                totalCorrectCount++;
            }
        }
    });

    return {
        score: Math.round(totalScore * 100) / 100,
        correct: totalCorrectCount
    };
}
/*==================================================
            NORMALIZE ANSWER
==================================================*/

function normalizeAnswer(value) {
    if (value === undefined || value === null) return "";
    const str = String(value).trim();
    
    // Nếu đáp án dạng số chỉ số mảng ("0", "1", "2", "3") -> Đổi thành ('A', 'B', 'C', 'D')
    if (!isNaN(str) && str !== "") {
        return String.fromCharCode(65 + parseInt(str, 10));
    }
    
    return str.toUpperCase();
}
/*==================================================
        FORMAT QUESTION / ANSWER
        TỰ ĐỘNG NHẬN DIỆN CÔNG THỨC HÓA / TOÁN
==================================================*/

function formatQuestionText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    let text = String(value);

    /* Nếu chuỗi đã chứa mã LaTeX/MathJax chuẩn thì giữ nguyên */
    if (
        text.includes("\\(") ||
        text.includes("\\[") ||
        text.includes("$$")
    ) {
        return text;
    }

    /* Escape HTML bảo mật */
    text = escapeHTML(text);

    /* Chuyển đổi công thức hóa học (CnH2nO2, Ca(OH)2,...) */
    text = convertChemicalFormulas(text);

    /* Chuyển đổi công thức toán học/vật lý (lũy thừa, dấu so sánh,...) */
    text = convertMathFormulas(text);

    /* Xử lý xuống dòng */
    text = text.replace(/\n/g, "<br>");

    return text;
}


/*==================================================
        CHUYỂN CÔNG THỨC HÓA HỌC
==================================================*/

function convertChemicalFormulas(text) {
    if (!text) return "";

    /* 1. Chuẩn hóa ký hiệu so sánh & mũi tên (xử lý cả dạng đã bị escapeHTML) */
    text = text
        .replace(/&gt;=/g, "≥")
        .replace(/&lt;=/g, "≤")
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        .replace(/&amp;/g, "&")
        .replace(/>=/g, "≥")
        .replace(/<=/g, "≤")
        .replace(/!=|&ne;/g, "≠")
        .replace(/-&gt;|->/g, "→")
        .replace(/&lt;=&gt;|<=>/g, "⇄");

    /* 2. Danh sách nguyên tố hóa học phổ biến trong THPT */
    const chemElements = [
        "He","Li","Be","Ne","Na","Mg","Al","Si","Ar","Ca","Sc","Ti","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr","Rb","Sr","Zr","Nb","Mo","Ag","Cd","In","Sn","Sb","Te","Xe","Ba","La","Ce","Pt","Au","Hg","Pb","Bi","Rn","Ra","U","Cl",
        "C","H","O","N","S","P","F","I","K","B","V"
    ];

    const elementPattern = "(?:" + chemElements.join("|") + "|\\))";

    /* Pattern nhận diện chỉ số dưới: 2n+2, 2n-2, 2n+1, 2n-6, 2n, n, m, x, y, các số thuần túy... */
    const subscriptPattern = "(?:2n[+-]\\d+|n[+-]\\d+|\\d+n|2n|[nmxykab]|[0-9]+)";

    /* Regex khớp: Nguyên tố/Ngoặc đóng + chỉ số (không theo sau bởi chữ cái viết thường) */
    const chemRegex = new RegExp(
        `(${elementPattern})(${subscriptPattern})(?![a-z])`,
        "g"
    );

    /* Lặp thay thế để bọc <sub> cho các công thức liên tiếp như CnH2nO2 */
    let previous;
    do {
        previous = text;
        text = text.replace(chemRegex, (match, elem, sub) => {
            if (sub.includes("<sub") || elem.includes("sub>")) return match;
            return `${elem}<sub class="chemical-subscript">${sub}</sub>`;
        });
    } while (text !== previous);

    return text;
}


/*==================================================
        CHUYỂN CÔNG THỨC TOÁN / VẬT LÝ
==================================================*/

function convertMathFormulas(text) {
    if (!text) return "";

    /* Xử lý số mũ / lũy thừa x^2, x^(2n), 10^-3, a^n */
    text = text.replace(/(?<![A-Za-z0-9\\])([A-Za-z0-9]+)\^([A-Za-z0-9+\-]+)/g, "$1<sup>$2</sup>");

    /* Ký hiệu cộng trừ ± */
    text = text.replace(/\+-|\+\/-/g, "±");

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
