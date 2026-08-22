/* =========================================================
   H&T STUDY - EXAM.JS
========================================================= */

import {
    auth,
    db
} from "../firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   DOM
========================================================= */

const examListSection =
    document.getElementById("examListSection");

const examDetailSection =
    document.getElementById("examDetailSection");

const examGrid =
    document.getElementById("examGrid");

const examCount =
    document.getElementById("examCount");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryBtn =
    document.getElementById("retryBtn");

const backBtn =
    document.getElementById("backBtn");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");


/* DETAIL */

const detailTitle =
    document.getElementById("detailTitle");

const detailType =
    document.getElementById("detailType");

const detailTeacher =
    document.getElementById("detailTeacher");

const detailQuestionCount =
    document.getElementById("detailQuestionCount");

const detailTotalPoints =
    document.getElementById("detailTotalPoints");

const detailDuration =
    document.getElementById("detailDuration");

const detailDescription =
    document.getElementById("detailDescription");

const detailCourse =
    document.getElementById("detailCourse");

const detailLesson =
    document.getElementById("detailLesson");

const startExamBtn =
    document.getElementById("startExamBtn");


/* =========================================================
   STATE
========================================================= */

let currentUser = null;

let allExams = [];

let currentExam = null;


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;
    }

    currentUser = user;

    await loadUserInfo();

    await loadExams();

    checkUrlForExam();

});


/* =========================================================
   LOAD USER
========================================================= */

async function loadUserInfo() {

    try {

        const userRef =
            doc(db, "users", currentUser.uid);

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {

            userName.textContent =
                "Học sinh";

            return;
        }

        const data =
            userSnap.data();

        userName.textContent =
            data.name || "Học sinh";

        if (data.avatar) {

            userAvatar.src =
                data.avatar;
        }

    } catch (error) {

        console.error(
            "Lỗi tải thông tin user:",
            error
        );

        userName.textContent =
            "Học sinh";
    }
}


/* =========================================================
   LOAD EXAMS
========================================================= */

async function loadExams() {

    showLoading();

    try {

        /*
         * enrollments/{uid}
         *
         * courses:
         * {
         *    courseId: "..."
         * }
         */

        const enrollmentRef =
            doc(
                db,
                "enrollments",
                currentUser.uid
            );

        const enrollmentSnap =
            await getDoc(enrollmentRef);


        if (!enrollmentSnap.exists()) {

            showEmpty();

            return;
        }


        const enrollmentData =
            enrollmentSnap.data();

        const enrolledCourses =
            enrollmentData.courses || {};


        const courseIds =
            Object.keys(enrolledCourses);


        if (courseIds.length === 0) {

            showEmpty();

            return;
        }


        const exams = [];


        /*
         * Lấy từng khóa học
         */

        for (const courseId of courseIds) {

            try {

                const courseRef =
                    doc(
                        db,
                        "courses",
                        courseId
                    );

                const courseSnap =
                    await getDoc(courseRef);


                if (!courseSnap.exists()) {

                    continue;
                }


                const courseData =
                    courseSnap.data();


                /*
                 * courses/{courseId}/tests
                 */

                const testsRef =
                    collection(
                        db,
                        "courses",
                        courseId,
                        "tests"
                    );

                const testsSnap =
                    await getDocs(testsRef);


                testsSnap.forEach((testDoc) => {

                    const testData =
                        testDoc.data();


                    /*
                     * Chỉ lấy bài đang active
                     */

                    if (
                        testData.active === false
                    ) {

                        return;
                    }


                    exams.push({

                        id: testDoc.id,

                        courseId,

                        courseName:
                            buildCourseName(courseData),

                        courseData,

                        ...testData

                    });

                });

            } catch (courseError) {

                console.error(
                    `Không thể tải course ${courseId}:`,
                    courseError
                );
            }
        }


        /*
         * Sắp xếp bài kiểm tra
         */

        exams.sort((a, b) => {

            const timeA =
                getDateValue(a.createdAt);

            const timeB =
                getDateValue(b.createdAt);

            return timeB - timeA;

        });


        allExams = exams;


        if (allExams.length === 0) {

            showEmpty();

            return;
        }


        renderExams();

    } catch (error) {

        console.error(
            "Lỗi load exams:",
            error
        );

        showError(
            getErrorMessage(error)
        );
    }
}


/* =========================================================
   BUILD COURSE NAME
========================================================= */

function buildCourseName(courseData) {

    const subject =
        courseData.subjectName ||
        courseData.subject ||
        "";

    const grade =
        courseData.grade ||
        "";

    const name =
        courseData.name ||
        "";

    const parts = [];


    if (subject) {

        parts.push(subject);
    }

    if (grade) {

        parts.push(grade);
    }

    if (name) {

        parts.push(
            `- ${name}`
        );
    }


    return parts.join(" ");
}


/* =========================================================
   RENDER EXAMS
========================================================= */

function renderExams() {

    hideAllStates();

    examGrid.innerHTML = "";


    examCount.textContent =
        `${allExams.length} bài`;


    allExams.forEach((exam, index) => {

        const card =
            createExamCard(
                exam,
                index
            );

        examGrid.appendChild(card);

    });


    examGrid.style.display =
        "grid";
}


/* =========================================================
   CREATE EXAM CARD
========================================================= */

function createExamCard(
    exam,
    index
) {

    const card =
        document.createElement("article");

    card.className =
        "exam-card";

    card.style.animationDelay =
        `${index * 0.05}s`;


    const title =
        exam.title ||
        "Bài kiểm tra";

    const type =
        exam.type ||
        "Kiểm tra";

    const questionCount =
        exam.questionCount ??
        countQuestions(exam);

    const totalPoints =
        exam.totalPoints ??
        calculateTotalPoints(exam);

    const duration =
        exam.duration ??
        getDurationFromType(type);

    const description =
        exam.description ||
        "Kiểm tra kiến thức và mức độ nắm bài.";


    card.innerHTML = `

        <div class="card-top">

            <span class="exam-type">

                <i class="fa-solid fa-file-pen"></i>

                ${escapeHTML(type)}

            </span>

            <span class="exam-status">
                Đang mở
            </span>

        </div>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p class="exam-card-description">
            ${escapeHTML(description)}
        </p>


        <div class="exam-meta">

            <div class="meta-item">

                <i class="fa-solid fa-list-ol"></i>

                <span>

                    Câu hỏi

                    <strong>
                        ${questionCount}
                    </strong>

                </span>

            </div>


            <div class="meta-item">

                <i class="fa-solid fa-star"></i>

                <span>

                    Tổng điểm

                    <strong>
                        ${totalPoints}
                    </strong>

                </span>

            </div>


            <div class="meta-item">

                <i class="fa-solid fa-clock"></i>

                <span>

                    Thời gian

                    <strong>
                        ${duration ? duration + " phút" : "—"}
                    </strong>

                </span>

            </div>


            <div class="meta-item">

                <i class="fa-solid fa-user-tie"></i>

                <span>

                    Giáo viên

                    <strong>
                        ${escapeHTML(
                            exam.teacherName || "—"
                        )}
                    </strong>

                </span>

            </div>

        </div>


        <div class="exam-course">

            <i class="fa-solid fa-book-open"></i>

            <span>
                ${escapeHTML(
                    exam.courseName || "Khóa học"
                )}
            </span>

        </div>


        <button
            class="detail-btn"
            data-test-id="${escapeHTML(exam.id)}"
            data-course-id="${escapeHTML(exam.courseId)}"
        >

            <i class="fa-solid fa-arrow-right"></i>

            Xem chi tiết

        </button>

    `;


    const button =
        card.querySelector(".detail-btn");


    button.addEventListener(
        "click",
        () => {

            openExamDetail(exam);

        }
    );


    return card;
}


/* =========================================================
   OPEN DETAIL
========================================================= */

function openExamDetail(exam) {

    currentExam = exam;


    /*
     * Cập nhật URL
     */

    const params =
        new URLSearchParams(
            window.location.search
        );

    params.set(
        "courseId",
        exam.courseId
    );

    params.set(
        "testId",
        exam.id
    );


    window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
    );


    /*
     * Hiển thị dữ liệu
     */

    detailTitle.textContent =
        exam.title ||
        "Bài kiểm tra";

    detailType.textContent =
        exam.type ||
        "BÀI KIỂM TRA";


    detailTeacher.textContent =
        exam.teacherName ||
        "Chưa cập nhật";


    detailQuestionCount.textContent =
        exam.questionCount ??
        countQuestions(exam);


    detailTotalPoints.textContent =
        exam.totalPoints ??
        calculateTotalPoints(exam);


    const duration =
        exam.duration ??
        getDurationFromType(
            exam.type
        );


    detailDuration.textContent =
        duration
            ? `${duration} phút`
            : "Chưa cập nhật";


    detailDescription.textContent =
        exam.description ||
        "Bài kiểm tra kiến thức."


    detailCourse.textContent =
        exam.courseName ||
        "Chưa xác định";


    /*
     * chapterId và lessonId hiện tại
     * đang có trong dữ liệu Firestore.
     *
     * Chưa cần query lesson ở bước này.
     */

    if (exam.lessonId) {

        detailLesson.textContent =
            `Bài học (${exam.lessonId})`;

    } else if (exam.chapterId) {

        detailLesson.textContent =
            `Chương (${exam.chapterId})`;

    } else {

        detailLesson.textContent =
            "Chưa xác định";
    }


    /*
     * Chưa cho bắt đầu làm bài
     */

    startExamBtn.disabled = true;


    /*
     * Chuyển giao diện
     */

    examListSection.style.display =
        "none";

    examDetailSection.style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CHECK URL
========================================================= */

function checkUrlForExam() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const testId =
        params.get("testId");

    const courseId =
        params.get("courseId");


    if (!testId || !courseId) {

        return;
    }


    const exam =
        allExams.find(
            item =>
                item.id === testId &&
                item.courseId === courseId
        );


    if (!exam) {

        return;
    }


    openExamDetail(
        exam
    );
}


/* =========================================================
   BACK
========================================================= */

backBtn.addEventListener(
    "click",
    () => {

        currentExam = null;


        const cleanUrl =
            window.location.pathname;

        window.history.pushState(
            {},
            "",
            cleanUrl
        );


        examDetailSection.style.display =
            "none";

        examListSection.style.display =
            "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   RETRY
========================================================= */

retryBtn.addEventListener(
    "click",
    () => {

        loadExams();

    }
);


/* =========================================================
   LOADING / STATES
========================================================= */

function hideAllStates() {

    loadingState.style.display =
        "none";

    emptyState.style.display =
        "none";

    errorState.style.display =
        "none";

    examGrid.style.display =
        "grid";
}


function showLoading() {

    loadingState.style.display =
        "flex";

    emptyState.style.display =
        "none";

    errorState.style.display =
        "none";

    examGrid.style.display =
        "none";
}


function showEmpty() {

    loadingState.style.display =
        "none";

    emptyState.style.display =
        "block";

    errorState.style.display =
        "none";

    examGrid.style.display =
        "none";

    examCount.textContent =
        "0 bài";
}


function showError(message) {

    loadingState.style.display =
        "none";

    emptyState.style.display =
        "none";

    errorState.style.display =
        "block";

    examGrid.style.display =
        "none";

    errorMessage.textContent =
        message;
}


/* =========================================================
   COUNT QUESTIONS
========================================================= */

function countQuestions(exam) {

    let count = 0;


    /*
     * part1.questions
     */

    if (
        exam.part1 &&
        Array.isArray(
            exam.part1.questions
        )
    ) {

        count +=
            exam.part1.questions.length;
    }


    /*
     * part2.questions
     */

    if (
        exam.part2 &&
        Array.isArray(
            exam.part2.questions
        )
    ) {

        count +=
            exam.part2.questions.length;
    }


    /*
     * part3.questions
     */

    if (
        exam.part3 &&
        Array.isArray(
            exam.part3.questions
        )
    ) {

        count +=
            exam.part3.questions.length;
    }


    return count;
}


/* =========================================================
   CALCULATE POINTS
========================================================= */

function calculateTotalPoints(exam) {

    let total = 0;


    if (
        exam.part1 &&
        typeof exam.part1.points === "number"
    ) {

        total +=
            exam.part1.points;
    }


    if (
        exam.part2 &&
        typeof exam.part2.points === "number"
    ) {

        total +=
            exam.part2.points;
    }


    if (
        exam.part3 &&
        typeof exam.part3.points === "number"
    ) {

        total +=
            exam.part3.points;
    }


    return total || 0;
}


/* =========================================================
   DURATION
========================================================= */

function getDurationFromType(type) {

    if (!type) {

        return null;
    }


    const text =
        String(type).toLowerCase();


    /*
     * "15p"
     */

    const match =
        text.match(/(\d+)\s*p/);


    if (match) {

        return Number(
            match[1]
        );
    }


    return null;
}


/* =========================================================
   DATE
========================================================= */

function getDateValue(value) {

    if (!value) {

        return 0;
    }


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();
    }


    if (
        value instanceof Date
    ) {

        return value.getTime();
    }


    return 0;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(error) {

    if (
        error &&
        error.code ===
        "permission-denied"
    ) {

        return "Bạn không có quyền đọc dữ liệu bài kiểm tra.";
    }


    return error?.message ||
        "Không thể tải dữ liệu bài kiểm tra.";
}
