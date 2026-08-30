/*==================================================
            H&T STUDY - TEST.JS
            TRANG LÀM BÀI KIỂM TRA
==================================================*/

import { auth, db } from "./firebase.js";
import { formatChemicalFormula, formatChemistryText } from "./chemistry.js";
import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    addDoc,
    setDoc,
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

answers =
    loadAnswers();

currentQuestionIndex =
    loadCurrentQuestion();

submitted =
    false;


        renderTestInfo();

        renderQuestionGrid();

        renderAllQuestions();

        startTimer();

        // Đồng bộ trạng thái live ngay khi load đề xong
        syncLiveStatus();

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
                points: Number(q.points ?? test.part1?.points ?? 0.5),
                partQuestionIndex: idx + 1
            });
        });
    }

    if (test.part2?.questions) {
        test.part2.questions.forEach((q, idx) => {
            result.push({
                ...q,
                part: 2,
                scores: test.part2?.scores || { one: 0.1, two: 0.25, three: 0.5, four: 1.0 },
                partQuestionIndex: idx + 1
            });
        });
    }

    if (test.part3?.questions) {
        test.part3.questions.forEach((q, idx) => {
            result.push({
                ...q,
                part: 3,
                points: Number(q.points ?? test.part3?.points ?? 0.5),
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


button.addEventListener("click", () => {
    currentQuestionIndex = index;
    saveCurrentQuestion();
    
    // Cuộn đến câu hỏi tương ứng trong danh sách dài
    const targetCard = document.querySelector(`.question-card[data-index="${index}"]`);
    if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
        targetCard.classList.add("highlighted");
        setTimeout(() => targetCard.classList.remove("highlighted"), 1500);
    }
    
    syncLiveStatus();
});
            questionGrid.appendChild(
                button
            );

        }
    );


    updateQuestionGrid();

}
/*==================================================
        KIỂM TRA CÂU HỎI ĐÃ ĐƯỢC TRẢ LỜI CHƯA
==================================================*/
function isQuestionAnswered(ans) {
    if (ans === undefined || ans === null) return false;
    
    // Đối với Phần II (mảng [dapAnA, dapAnB, dapAnC, dapAnD])
    if (Array.isArray(ans)) {
        return ans.some(val => val === true || val === false);
    }
    
    // Đối với Phần I & III
    return String(ans).trim() !== "";
}

/*==================================================
            UPDATE QUESTION GRID
==================================================*/
function updateQuestionGrid() {
    if (!questionGrid) return;

    const buttons = questionGrid.querySelectorAll(".question-number");

    buttons.forEach((button, index) => {
        const isCurrent = index === currentQuestionIndex;
        const hasAnswer = isQuestionAnswered(answers[index]);

        button.classList.remove("current", "answered");

        if (hasAnswer) {
            button.classList.add("answered");
        } else if (isCurrent) {
            button.classList.add("current");
        }
    });
}
/*==================================================
        RENDER TOÀN BỘ CÂU HỎI RA MỘT TRANG ĐỂ LƯỚT
==================================================*/
function renderAllQuestions() {
    const container = document.getElementById("allQuestionsContainer");
    if (!container) return;
    
    container.innerHTML = "";

    questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.dataset.index = index;

        // Header câu hỏi
        let headerHtml = `
            <div class="question-card-header">
                <div class="question-number">
                    <span>Câu ${index + 1}</span>
                </div>
                <span class="question-status" id="status-${index}">
                    <i class="fa-solid fa-circle-check" style="color: ${isQuestionAnswered(answers[index]) ? '#22c55e' : '#cbd5e1'}"></i>
                    ${isQuestionAnswered(answers[index]) ? 'Đã trả lời' : 'Chưa trả lời'}
                </span>
            </div>
        `;

        // Nội dung câu hỏi
        let contentHtml = `
            <div class="question-content">
                ${formatQuestionText(question.question || question.content || question.text || "")}
            </div>
        `;

        // Hình ảnh minh họa (nếu có)
        let imageHtml = `
            <div class="question-image-container" style="display: ${question.image && question.image.trim() !== "" ? 'block' : 'none'}; text-align: center; margin: 15px 0;">
                <img src="${question.image || ''}" alt="Hình minh họa câu hỏi" style="max-width: 100%; max-height: 400px; border-radius: 10px; border: 1px solid #e2e8f0;" />
            </div>
        `;

        card.innerHTML = headerHtml + contentHtml + imageHtml;

        // Container chứa đáp án riêng cho từng câu
        const answerDiv = document.createElement("div");
        answerDiv.className = "answer-container";
        answerDiv.id = `answer-container-${index}`;
        card.appendChild(answerDiv);

        container.appendChild(card);

        // Render phần chọn đáp án tương ứng vào câu này
        renderAnswersForIndex(question, index, answerDiv);
    });

    updateQuestionGrid();
    renderMath();
}
/*==================================================
        RENDER ĐÁP ÁN CHO TỪNG CÂU HỎI RIÊNG BIỆT
==================================================*/
function renderAnswersForIndex(question, index, container) {
    container.innerHTML = "";

    // PHẦN I: Trắc nghiệm A, B, C, D
    if (question.part === 1) {
        const options = getQuestionOptions(question);
        options.forEach((option, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            const wrapper = document.createElement("label");
            wrapper.className = "answer-option";
            const checked = answers[index] === letter ? "checked" : "";
            if (checked) wrapper.classList.add("selected");

            wrapper.innerHTML = `
                <input type="radio" name="part1-ans-${index}" value="${letter}" ${checked}>
                <span class="answer-letter">${letter}</span>
                <span class="answer-text">${formatQuestionText(option)}</span>
            `;

            wrapper.querySelector("input").addEventListener("change", () => {
                answers[index] = letter;
                saveAnswers();
                updateSingleQuestionStatus(index);
                updateQuestionGrid();
                syncLiveStatus();
            });
            container.appendChild(wrapper);
        });
    }

    // PHẦN II: Đúng / Sai
    else if (question.part === 2) {
        const currentAns = answers[index] || [null, null, null, null];
        const statements = question.statements || [];

        statements.forEach((stmt, sIdx) => {
            const row = document.createElement("div");
            row.className = "tf-answer-row";
            const currentVal = currentAns[sIdx];

            row.innerHTML = `
                <div class="tf-stmt-text"><b>${String.fromCharCode(97 + sIdx)}.</b> ${formatQuestionText(stmt)}</div>
                <div class="tf-btn-group">
                    <button type="button" class="btn-tf ${currentVal === true ? 'active-true' : ''}" data-val="true">Đúng</button>
                    <button type="button" class="btn-tf ${currentVal === false ? 'active-false' : ''}" data-val="false">Sai</button>
                </div>
            `;

            row.querySelectorAll(".btn-tf").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const val = e.currentTarget.dataset.val === "true";
                    
                    if (!answers[index]) {
                        answers[index] = [null, null, null, null];
                    }
                    
                    if (answers[index][sIdx] === val) {
                        answers[index][sIdx] = null;
                    } else {
                        answers[index][sIdx] = val;
                    }

                    if (!answers[index].some(v => v !== null)) {
                        delete answers[index];
                    }

                    saveAnswers();
                    renderAnswersForIndex(question, index, container);
                    updateSingleQuestionStatus(index);
                    updateQuestionGrid();
                    syncLiveStatus();
                });
            });
            container.appendChild(row);
        });
    }

    // PHẦN III: Trả lời ngắn (Phiếu tô 4 ô)
    else if (question.part === 3) {
        const currentAnsStr = answers[index] || "";
        const currentChars = currentAnsStr.split("").slice(0, 4);
        while (currentChars.length < 4) currentChars.push("");

        const sheet = document.createElement("div");
        sheet.className = "short-answer-sheet";

        let previewHtml = `
            <div class="sheet-preview">
                <span class="sheet-preview-title">Đáp án đã chọn:</span>
                <div class="sheet-preview-boxes">
                    ${currentChars.map(ch => `<div class="preview-box">${ch || "&nbsp;"}</div>`).join("")}
                </div>
                <button type="button" class="clear-sheet-btn"><i class="fa-solid fa-rotate-left"></i> Xóa</button>
            </div>
        `;

        const colsOptions = [
            ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            [",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            [",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        ];

        let colsHtml = '<div class="sheet-columns">';
        colsOptions.forEach((opts, colIdx) => {
            colsHtml += `<div class="sheet-column"><span class="col-header">Ô ${colIdx + 1}</span>`;
            opts.forEach(opt => {
                const isSelected = currentChars[colIdx] === opt;
                colsHtml += `<button type="button" class="bubble-btn ${isSelected ? 'selected' : ''}" data-col="${colIdx}" data-val="${opt}">${opt}</button>`;
            });
            colsHtml += `</div>`;
        });
        colsHtml += '</div>';

        sheet.innerHTML = previewHtml + colsHtml;

        sheet.querySelectorAll(".bubble-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const col = parseInt(e.currentTarget.dataset.col, 10);
                const val = e.currentTarget.dataset.val;

                if (currentChars[col] === val) {
                    currentChars[col] = ""; 
                } else {
                    currentChars[col] = val;
                }

                const finalStr = currentChars.join("").trim();
                if (finalStr !== "") {
                    answers[index] = finalStr;
                } else {
                    delete answers[index];
                }

                saveAnswers();
                renderAnswersForIndex(question, index, container);
                updateSingleQuestionStatus(index);
                updateQuestionGrid();
                syncLiveStatus();
            });
        });

        const clearBtn = sheet.querySelector(".clear-sheet-btn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                delete answers[index];
                saveAnswers();
                renderAnswersForIndex(question, index, container);
                updateSingleQuestionStatus(index);
                updateQuestionGrid();
                syncLiveStatus();
            });
        }

        container.appendChild(sheet);
    }
}

function updateSingleQuestionStatus(index) {
    const statusEl = document.getElementById(`status-${index}`);
    if (statusEl) {
        const answered = isQuestionAnswered(answers[index]);
        statusEl.innerHTML = `
            <i class="fa-solid fa-circle-check" style="color: ${answered ? '#22c55e' : '#cbd5e1'}"></i>
            ${answered ? 'Đã trả lời' : 'Chưa trả lời'}
        `;
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

        syncLiveStatus();

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

renderAllQuestions();

scrollToQuestion();

syncLiveStatus();

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

renderAllQuestions();

scrollToQuestion();

syncLiveStatus();

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


    updateRemainingTime(
        endTime
    );


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


    if (
        remainingSeconds <= 0
    ) {

        clearInterval(
            timerInterval
        );


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
async function finishTest() {

    if (submitted) {
        return;
    }

    if (!currentUser) {
        alert(
            "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
        );
        window.location.href = "index.html";
        return;
    }

    submitted = true;

    clearInterval(
        timerInterval
    );

    if (submitTestBtn) {
        submitTestBtn.disabled = true;
        submitTestBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Đang nộp bài...
        `;
    }

    if (headerSubmitTestBtn) {
        headerSubmitTestBtn.disabled = true;
    }

    try {
        // Cập nhật ngay trạng thái đã nộp lên Firestore để trang giáo viên live nhận biết được lập tức
        await setDoc(doc(db, "liveStatus", currentUser.uid), {
            studentId: currentUser.uid,
            studentName: currentUser.displayName || currentUser.email || "Học sinh",
            testId: currentTestId,
            isStarted: true,
            hasStarted: true,
            isSubmitted: true,     // Đánh dấu đã nộp bài thành công
            status: "submitted",
            updatedAt: serverTimestamp()
        }, { merge: true });

        const scoreData =
            calculateScore();

        let wrong = 0;
        let unanswered = 0;

        questions.forEach(
            (question, index) => {
                const userAnswer = answers[index];

                if (
                    userAnswer === undefined ||
                    userAnswer === null ||
                    String(userAnswer).trim() === ""
                ) {
                    unanswered++;
                    return;
                }

                const correctAnswer =
                    normalizeAnswer(
                        question.correctAnswer ||
                        question.answer ||
                        question.correct ||
                        ""
                    );

                if (
                    normalizeAnswer(
                        userAnswer
                    ) !== correctAnswer
                ) {
                    wrong++;
                }
            }
        );

        const resultQuestions = questions.map((question, index) => {
            return {
                question: question.question || "",
                image: question.image || "",
                options: question.options || [],
                statements: question.statements || [],
                correctAnswer: question.correctAnswer ?? question.answer ?? question.answers ?? "",
                userAnswer: answers[index] ?? null,
                part: question.part || 1,
                partQuestionIndex: question.partQuestionIndex || 1
            };
        });

        const resultData = {
            userId: currentUser.uid,
            courseId: currentCourseId,
            userEmail: currentUser.email || "",
            userName: currentUser.displayName || "Học sinh",
            testId: currentTestId,
            testTitle: currentTest?.title || "Bài kiểm tra",
            answers: answers,
            questions: resultQuestions,
            score: scoreData.score,
            correct: scoreData.correct,
            wrong: wrong,
            unanswered: unanswered,
            total: questions.length,
            submittedAt: serverTimestamp()
        };

        console.log("RESULT DATA:", resultData);

        await addDoc(
            collection(
                db,
                "results"
            ),
            resultData
        );

        clearTestStorage();

        window.location.href = "index.html";

    } catch (error) {
        console.error("Lỗi nộp bài:", error);
        submitted = false;

        if (submitTestBtn) {
            submitTestBtn.disabled = false;
            submitTestBtn.innerHTML = `
                <i class="fa-solid fa-paper-plane"></i>
                Nộp bài
            `;
        }

        if (headerSubmitTestBtn) {
            headerSubmitTestBtn.disabled = false;
        }

        alert("Không thể nộp bài. Vui lòng thử lại.");
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
                const point = Number(q.points ?? currentTest.part1?.points ?? 0.5);
                totalScore += point;
                totalCorrectCount++;
            }
        } 
        else if (q.part === 2) {
            if (Array.isArray(userAns)) {
                let matchCount = 0;
                if (Array.isArray(q.answers)) {
                    q.answers.forEach((correctVal, sIdx) => {
                        if (userAns[sIdx] === correctVal) matchCount++;
                    });
                }

                const scores = q.scores || currentTest.part2?.scores || { one: 0.1, two: 0.25, three: 0.5, four: 1.0 };
                if (matchCount === 1) totalScore += Number(scores.one ?? 0.1);
                else if (matchCount === 2) totalScore += Number(scores.two ?? 0.25);
                else if (matchCount === 3) totalScore += Number(scores.three ?? 0.5);
                else if (matchCount === 4) {
                    totalScore += Number(scores.four ?? 1.0);
                    totalCorrectCount++;
                }
            }
        } 
        else if (q.part === 3) {
            const correctText = String(q.answer || "").trim().replace(",", ".");
            const userText = String(userAns || "").trim().replace(",", ".");
            if (userText !== "" && userText === correctText) {
                const point = Number(q.points ?? currentTest.part3?.points ?? 0.5);
                totalScore += point;
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
    
    if (!isNaN(str) && str !== "") {
        return String.fromCharCode(65 + parseInt(str, 10));
    }
    
    return str.toUpperCase();
}

/*==================================================
        FORMAT QUESTION / ANSWER
==================================================*/

function formatQuestionText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    let text = String(value);

    if (typeof formatChemistryText === "function") {
        text = formatChemistryText(text);
    }
    return text;
}

function renderMath() {
    if (window.katex && document.querySelectorAll) {
        try {
            const elements = document.querySelectorAll(".question-content, .answer-text, .tf-stmt-text, .preview-box, .bubble-btn");
            elements.forEach(el => {
                if (el.innerHTML.includes("$")) {
                    el.innerHTML = el.innerHTML.replace(/\$(.*?)\$/g, (match, formula) => {
                        return katex.renderToString(formula, { throwOnError: false });
                    });
                }
            });
        } catch (e) {
            console.error("Lỗi render Math:", e);
        }
    }
}

function showLoading() {
    if (testLoading) testLoading.style.display = "flex";
    if (testContainer) testContainer.style.display = "none";
    if (testError) testError.style.display = "none";
}

function hideLoading() {
    if (testLoading) testLoading.style.display = "none";
    if (testContainer) testContainer.style.display = "block";
    if (testError) testError.style.display = "none";
}

function showError(msg) {
    if (testLoading) testLoading.style.display = "none";
    if (testContainer) testContainer.style.display = "none";
    if (testError) {
        testError.style.display = "block";
        testError.textContent = msg;
    }
}

/*==================================================
            ĐỒNG BỘ TRẠNG THÁI LIVE (SYNC LIVE STATUS)
==================================================*/
async function syncLiveStatus() {
    if (!currentUser || !currentTestId || submitted) return;

    try {
        const currentQ = questions[currentQuestionIndex] || {};
        
        let currentAns = null;
        if (answers[currentQuestionIndex] !== undefined) {
            currentAns = answers[currentQuestionIndex];
        }

        const liveData = {
            studentId: currentUser.uid,
            studentName: currentUser.displayName || currentUser.email || "Học sinh",
            testId: currentTestId,
            testTitle: currentTest?.title || "Bài kiểm tra",
            isStarted: true,     // Đánh dấu học sinh đã bấm vào làm bài
            hasStarted: true,    // Tương thích với các điều kiện kiểm tra
            isSubmitted: false,  // Đang làm bài nên chưa nộp
            currentQuestionIndex: currentQuestionIndex + 1,
            currentPart: currentQ.part || 1,
            currentQuestion: currentQ, 
            currentAnswer: currentAns,
            remainingSeconds: typeof remainingSeconds !== 'undefined' ? remainingSeconds : 0, 
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, "liveStatus", currentUser.uid), liveData);
    } catch (error) {
        console.error("Lỗi đồng bộ live status:", error);
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUser(user.uid);
        loadTest();
    } else {
        window.location.href = "index.html";
    }
});
