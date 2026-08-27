/*==================================================
        H&T STUDY - RESULT.JS (TRANG XEM KẾT QUẢ)
==================================================*/

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* BIẾN TOÀN CỤC */
let currentUser = null;
let currentCourseId = null;
let currentRole = "";

let coursesData = [];
let chaptersData = [];
let lessonsData = [];
let testResultsMap = {}; // Lưu trữ kết quả đã nộp theo testId

/* DOM ELEMENTS */
const resultLoading = document.getElementById("resultLoading");
const resultEmpty = document.getElementById("resultEmpty");
const courseList = document.getElementById("courseList");
const courseResultList = document.getElementById("courseResultList");
const courseDetail = document.getElementById("courseDetail");
const courseDetailContent = document.getElementById("courseDetailContent");
const testResultDetail = document.getElementById("testResultDetail");
const resultDetailContent = document.getElementById("resultDetailContent");

const backToCourses = document.getElementById("backToCourses");
const backToLessons = document.getElementById("backToLessons");

/*==================================================
                LOAD USER & HEADER
==================================================*/
async function loadUser(uid) {
    try {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (!userSnap.exists()) {
            await signOut(auth);
            return;
        }

        const user = userSnap.data();
        currentRole = user.role || "";

        const avatarUrl = user.avatar && user.avatar.trim() !== "" ? user.avatar : "assets/avatars/default.jpg";
        const headerAvatar = document.querySelector(".avatar img");
        if (headerAvatar) headerAvatar.src = avatarUrl;

        const userBox = document.getElementById("userBox");
        if (userBox) userBox.style.display = "block";

        const userMenuList = document.getElementById("userMenuList");
        if (userMenuList) userMenuList.style.display = "block";

        const userName = document.getElementById("userName");
        if (userName) userName.textContent = user.name || "Học sinh";

        const userStudentId = document.getElementById("userStudentId");
        if (userStudentId) userStudentId.textContent = user.memberId || "";

        const userRole = document.getElementById("userRole");
        if (userRole) userRole.textContent = currentRole;
    } catch (err) {
        console.error("Lỗi tải người dùng:", err);
    }
}

/*==================================================
        LẤY KẾT QUẢ THI ĐÃ NỘP & KHÓA HỌC
==================================================*/
async function loadResultsAndCourses() {
    try {
        showLoading();

        // 1. Lấy tất cả bài làm của user từ collection "results"
        const resultsRef = collection(db, "results");
        const qResults = query(resultsRef, where("userId", "==", currentUser.uid));
        const resultsSnap = await getDocs(qResults);

        testResultsMap = {};
        resultsSnap.forEach(docSnap => {
            const data = docSnap.data();
            
            // Lấy kết quả nộp bài mới nhất
            const newTime = data.submittedAt?.seconds || 0;
            const currentTime = testResultsMap[data.testId]?.submittedAt?.seconds || 0;

            if (!testResultsMap[data.testId] || newTime > currentTime) {
                testResultsMap[data.testId] = { id: docSnap.id, ...data };
            }
        });

        // 2. Lấy khóa học được cấp
        const enrollSnap = await getDoc(doc(db, "enrollments", currentUser.uid));
        if (!enrollSnap.exists() || !enrollSnap.data().courses?.length) {
            showEmpty();
            return;
        }

        const courseIds = enrollSnap.data().courses;
        coursesData = [];

        for (const cid of courseIds) {
            const cSnap = await getDoc(doc(db, "courses", cid));
            if (cSnap.exists()) {
                coursesData.push({ id: cSnap.id, ...cSnap.data() });
            }
        }

        if (!coursesData.length) {
            showEmpty();
            return;
        }

        renderCourses();
        hideLoading();
    } catch (error) {
        console.error("Lỗi nạp kết quả:", error);
        showEmpty();
    }
}

/*==================================================
                RENDER KHÓA HỌC
==================================================*/
function renderCourses() {
    if (!courseResultList) return;
    courseResultList.innerHTML = "";
    coursesData.forEach(course => {
        courseResultList.innerHTML += `
            <div class="exam-course-card">
                <div class="exam-course-image">
                    <img src="${course.image || 'assets/images/default-course.jpg'}" alt="${escapeHTML(course.name)}">
                </div>
                <div class="exam-course-info">
                    <span class="exam-course-subject">
                        <i class="fa-solid fa-book"></i> ${escapeHTML(course.subjectName || course.subject || 'Môn học')}
                    </span>
                    <h3>${escapeHTML(course.name)}</h3>
                    <p>${escapeHTML(course.description || 'Xem lại kết quả kiểm tra theo bài học.')}</p>
                    <button class="exam-open-course open-course-btn" data-id="${course.id}">
                        Xem danh sách bài kiểm tra <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    });

    document.querySelectorAll(".open-course-btn").forEach(btn => {
        btn.addEventListener("click", () => openCourseDetail(btn.dataset.id));
    });
}

/*==================================================
            OPEN COURSE DETAIL
==================================================*/
async function openCourseDetail(courseId) {
    currentCourseId = courseId;
    if (courseList) courseList.style.display = "none";
    if (testResultDetail) testResultDetail.style.display = "none";
    if (courseDetail) courseDetail.style.display = "block";

    if (courseDetailContent) {
        courseDetailContent.innerHTML = `<div class="exam-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải chương...</div>`;
    }

    try {
        const chapterSnap = await getDocs(collection(db, "courses", courseId, "chapters"));
        chaptersData = [];
        chapterSnap.forEach(d => chaptersData.push({ id: d.id, ...d.data() }));
        chaptersData.sort((a, b) => Number(a.order) - Number(b.order));

        renderChapters();
    } catch (err) {
        console.error(err);
    }
}

/*==================================================
            RENDER CHƯƠNG & BÀI HỌC
==================================================*/
function renderChapters() {
    if (!courseDetailContent) return;

    let html = `<div class="course-hierarchy">`;
    chaptersData.forEach((chapter, idx) => {
        html += `
            <div class="chapter-block">
                <div class="chapter-header">
                    <div class="chapter-number">${idx + 1}</div>
                    <div>
                        <span>CHƯƠNG ${idx + 1}</span>
                        <h3>${escapeHTML(chapter.title)}</h3>
                    </div>
                </div>
                <div class="lesson-list" id="lesson-list-${chapter.id}">
                    <div class="exam-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bài học...</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    courseDetailContent.innerHTML = html;

    chaptersData.forEach(chapter => loadLessons(chapter));
}

/*==================================================
        LOAD BÀI HỌC VÀ BÀI KIỂM TRA
==================================================*/
async function loadLessons(chapter) {
    const container = document.getElementById(`lesson-list-${chapter.id}`);
    if (!container) return;

    try {
        const lessonSnap = await getDocs(collection(db, "courses", currentCourseId, "chapters", chapter.id, "lessons"));
        lessonsData = [];
        lessonSnap.forEach(d => lessonsData.push({ id: d.id, ...d.data() }));
        lessonsData.sort((a, b) => Number(a.order) - Number(b.order));

        container.innerHTML = "";
        for (let i = 0; i < lessonsData.length; i++) {
            const lesson = lessonsData[i];
            const div = document.createElement("div");
            div.className = "lesson-block";
            div.innerHTML = `
                <div class="lesson-header">
                    <div class="lesson-number">${i + 1}</div>
                    <div class="lesson-title">
                        <span>BÀI ${i + 1}</span>
                        <h4>${escapeHTML(lesson.title)}</h4>
                    </div>
                    <i class="fa-solid fa-chevron-down lesson-arrow"></i>
                </div>
                <div class="lesson-tests" style="display:none;"></div>
            `;

            const lHeader = div.querySelector(".lesson-header");
            const tContainer = div.querySelector(".lesson-tests");

            lHeader.addEventListener("click", async () => {
                const isOpen = tContainer.style.display !== "none";
                tContainer.style.display = isOpen ? "none" : "block";
                div.classList.toggle("open", !isOpen);

                if (!isOpen) {
                    await loadTestsForLesson(lesson.id, tContainer);
                }
            });

            container.appendChild(div);
        }
    } catch (err) {
        console.error(err);
    }
}

/*==================================================
        BÀI KIỂM TRA TRONG BÀI HỌC
==================================================*/
async function loadTestsForLesson(lessonId, container) {
    container.innerHTML = `<div class="exam-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>`;
    try {
        const qTest = query(collection(db, "courses", currentCourseId, "tests"), where("lessonId", "==", lessonId));
        const testSnap = await getDocs(qTest);

        container.innerHTML = "";
        if (testSnap.empty) {
            container.innerHTML = `<div class="test-empty">Bài học này chưa có bài kiểm tra.</div>`;
            return;
        }

        testSnap.forEach(tDoc => {
            const test = { id: tDoc.id, ...tDoc.data() };
            const result = testResultsMap[test.id]; // Lấy kết quả đã làm

            const item = document.createElement("div");
            item.className = "test-item";
            item.innerHTML = `
                <div class="test-icon"><i class="fa-solid fa-file-signature"></i></div>
                <div class="test-info">
                    <h5>${escapeHTML(test.title)}</h5>
                    <div class="test-meta">
                        <span><i class="fa-solid fa-list-ol"></i> ${test.questionCount || 0} câu</span>
                        <span>
                            ${result 
                                ? `<strong style="color:#4ade80;"><i class="fa-solid fa-circle-check"></i> Đã làm: ${result.score ?? 0} điểm</strong>` 
                                : `<span style="color:#facc15;"><i class="fa-solid fa-clock"></i> Chưa làm</span>`}
                        </span>
                    </div>
                </div>
                <button class="open-test-btn" ${!result ? 'disabled style="opacity:0.5;"' : ''}>
                    ${result ? 'Xem kết quả' : 'Chưa có kết quả'}
                </button>
            `;

            if (result) {
                item.querySelector(".open-test-btn").addEventListener("click", () => renderTestResultDetail(test, result));
            }

            container.appendChild(item);
        });
    } catch (err) {
        console.error(err);
    }
}

/*==================================================
    CÁC HÀM XỬ LÝ DỮ LIỆU CÂU HỎI & CHUẨN HÓA (KHỚP TEST.JS)
==================================================*/

// Trích xuất danh sách câu hỏi kèm điểm số đã thiết lập ở Teacher / Test
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

// Chuẩn hóa đáp án trắc nghiệm A, B, C, D (xử lý số index 0, 1, 2, 3 -> 'A', 'B', 'C', 'D')
function normalizeAnswer(ans) {
    if (ans === undefined || ans === null) return "";
    const str = String(ans).trim();
    if (!isNaN(str) && str !== "") {
        return String.fromCharCode(65 + parseInt(str, 10));
    }
    return str.toUpperCase();
}

// Chuẩn hóa đáp án tự luận / điền số
function normalizeTextAnswer(ans) {
    if (ans === undefined || ans === null) return "";
    return String(ans).trim().replace(',', '.').toLowerCase();
}

// Format văn bản câu hỏi / hóa học
function formatQuestionText(value) {
    if (value === null || value === undefined) return "";
    let text = String(value);
    if (typeof formatChemistryText === "function") {
        text = formatChemistryText(text);
    }
    return text;
}

// Tính điểm từng câu hỏi khớp 100% với logic test.js và teacher
function calculateQuestionScore(q, uAns, test) {
    let maxPoint = 0;
    let earnedPoint = 0;
    let isCorrect = false;

    if (q.part === 1) {
        maxPoint = Number(q.points ?? test.part1?.points ?? 0.5);
        const userAns = uAns ? normalizeAnswer(uAns) : "";
        const correctAns = normalizeAnswer(q.correctAnswer ?? q.answer ?? q.correct);
        if (userAns && userAns === correctAns) {
            earnedPoint = maxPoint;
            isCorrect = true;
        }
    } 
    else if (q.part === 2) {
        const scores = q.scores || test.part2?.scores || { one: 0.1, two: 0.25, three: 0.5, four: 1.0 };
        maxPoint = Number(scores.four ?? 1.0);
        
        if (uAns && (typeof uAns === 'object' || Array.isArray(uAns))) {
            let matchCount = 0;
            const correctAnswers = q.answers || [];
            correctAnswers.forEach((correctVal, sIdx) => {
                if (uAns[sIdx] === correctVal) {
                    matchCount++;
                }
            });

            if (matchCount === 1) earnedPoint = Number(scores.one ?? 0.1);
            else if (matchCount === 2) earnedPoint = Number(scores.two ?? 0.25);
            else if (matchCount === 3) earnedPoint = Number(scores.three ?? 0.5);
            else if (matchCount === 4) {
                earnedPoint = Number(scores.four ?? 1.0);
                isCorrect = true;
            }
        }
    } 
    else if (q.part === 3) {
        maxPoint = Number(q.points ?? test.part3?.points ?? 0.5);
        const userAns = normalizeTextAnswer(uAns);
        const correctAns = normalizeTextAnswer(q.answer ?? q.correctAnswer);
        if (userAns !== "" && userAns === correctAns) {
            earnedPoint = maxPoint;
            isCorrect = true;
        }
    }

    return {
        maxPoint,
        earnedPoint: Math.round(earnedPoint * 100) / 100,
        isCorrect
    };
}

/*==================================================
        XEM CHI TIẾT KẾT QUẢ & HIỂN THỊ ĐIỂM
==================================================*/
function renderTestResultDetail(test, result) {
    if (courseDetail) courseDetail.style.display = "none";
    if (testResultDetail) testResultDetail.style.display = "block";

    const questions = extractQuestions(test);
    const userAnswers = result.answers || {};

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let calculatedScore = 0;

    // Thống kê điểm số và số câu đúng/sai/chưa làm
    questions.forEach((q, idx) => {
        const uAns = userAnswers[idx];
        const qScore = calculateQuestionScore(q, uAns, test);
        calculatedScore += qScore.earnedPoint;

        if (q.part === 1) {
            const userAns = uAns ? normalizeAnswer(uAns) : "";
            if (!userAns) unansweredCount++;
            else if (qScore.isCorrect) correctCount++;
            else wrongCount++;
        } 
        else if (q.part === 2) {
            if (!uAns || (typeof uAns !== 'object' && !Array.isArray(uAns))) {
                unansweredCount++;
            } else {
                let hasAnswered = false;
                (q.statements || []).forEach((_, stIdx) => {
                    if (uAns[stIdx] !== undefined && uAns[stIdx] !== null) hasAnswered = true;
                });
                if (!hasAnswered) unansweredCount++;
                else if (qScore.isCorrect) correctCount++;
                else wrongCount++;
            }
        } 
        else if (q.part === 3) {
            const userAns = normalizeTextAnswer(uAns);
            if (!userAns) unansweredCount++;
            else if (qScore.isCorrect) correctCount++;
            else wrongCount++;
        }
    });

    // Lấy điểm hiển thị (ưu tiên lấy từ kết quả Firestore hoặc điểm tự tính toán)
    const finalDisplayScore = result.score !== undefined ? result.score : Math.round(calculatedScore * 100) / 100;

    let html = `
        <div class="result-stats-card">
            <h2>${escapeHTML(test.title)} - Kết Quả Bài Làm</h2>
            <div class="result-summary-grid">
                <div class="stat-box score">
                    <i class="fa-solid fa-award"></i>
                    <div class="stat-info">
                        <span>Điểm số</span>
                        <strong>${finalDisplayScore} / 10</strong>
                    </div>
                </div>
                <div class="stat-box correct">
                    <i class="fa-solid fa-circle-check"></i>
                    <div class="stat-info">
                        <span>Số câu đúng tuyệt đối</span>
                        <strong>${correctCount} câu</strong>
                    </div>
                </div>
                <div class="stat-box wrong">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <div class="stat-info">
                        <span>Số câu sai</span>
                        <strong>${wrongCount} câu</strong>
                    </div>
                </div>
                <div class="stat-box unanswered">
                    <i class="fa-solid fa-circle-minus"></i>
                    <div class="stat-info">
                        <span>Chưa trả lời</span>
                        <strong>${unansweredCount} câu</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="review-container">
    `;

    // Render danh sách chi tiết các câu hỏi
    questions.forEach((q, idx) => {
        const uAns = userAnswers[idx];
        const qScore = calculateQuestionScore(q, uAns, test);

        // RENDER PHẦN I (Trắc nghiệm 4 lựa chọn)
        if (q.part === 1) {
            const userAns = uAns ? normalizeAnswer(uAns) : "";
            const correctAns = normalizeAnswer(q.correctAnswer ?? q.answer ?? q.correct);
            const options = Array.isArray(q.options) ? q.options : [];

            let statusClass = "skipped";
            let statusText = `<i class="fa-solid fa-circle-minus"></i> Bỏ trống (+0/${qScore.maxPoint} đ)`;

            if (userAns) {
                if (qScore.isCorrect) {
                    statusClass = "correct";
                    statusText = `<i class="fa-solid fa-check"></i> Trả lời đúng (+${qScore.earnedPoint}/${qScore.maxPoint} đ)`;
                } else {
                    statusClass = "wrong";
                    statusText = `<i class="fa-solid fa-xmark"></i> Trả lời sai (+0/${qScore.maxPoint} đ)`;
                }
            }

            html += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-question-title">Câu ${idx + 1} (Phần I)</span>
                        <span class="review-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="review-question-body">${formatQuestionText(q.question || '')}</div>
                    <div class="review-options">
            `;

            options.forEach((optText, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                let optionClass = "";

                if (userAns === letter) {
                    optionClass = (letter === correctAns) ? "is-correct-selected" : "is-wrong-selected";
                } else if (letter === correctAns && userAns !== correctAns) {
                    optionClass = "is-target-correct";
                }

                html += `
                    <div class="review-option ${optionClass}">
                        <span class="opt-letter">${letter}</span>
                        <span class="opt-text">${formatQuestionText(optText)}</span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // RENDER PHẦN II (Đúng / Sai)
        else if (q.part === 2) {
            const statements = q.statements || [];
            const correctAnswers = q.answers || [];
            const userSubAns = (typeof uAns === 'object' && uAns !== null) ? uAns : {};

            let statusClass = "wrong";
            let statusText = `<i class="fa-solid fa-xmark"></i> Sai (+0/${qScore.maxPoint} đ)`;

            if (qScore.isCorrect) {
                statusClass = "correct";
                statusText = `<i class="fa-solid fa-check"></i> Đúng hoàn toàn (+${qScore.earnedPoint}/${qScore.maxPoint} đ)`;
            } else if (qScore.earnedPoint > 0) {
                statusClass = "correct";
                statusText = `<i class="fa-solid fa-check-double"></i> Đúng một phần (+${qScore.earnedPoint}/${qScore.maxPoint} đ)`;
            } else {
                let hasAnswered = false;
                statements.forEach((_, stIdx) => {
                    if (userSubAns[stIdx] !== undefined && userSubAns[stIdx] !== null) hasAnswered = true;
                });
                if (!hasAnswered) {
                    statusClass = "skipped";
                    statusText = `<i class="fa-solid fa-circle-minus"></i> Bỏ trống (+0/${qScore.maxPoint} đ)`;
                }
            }

            html += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-question-title">Câu ${idx + 1} (Phần II - Đúng/Sai)</span>
                        <span class="review-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="review-question-body">${formatQuestionText(q.question || '')}</div>
                    <div class="review-tf-list" style="margin-top:10px;">
            `;

            statements.forEach((stText, stIdx) => {
                const label = String.fromCharCode(97 + stIdx); // a, b, c, d
                const userVal = userSubAns[stIdx];
                const correctVal = correctAnswers[stIdx];

                let stStatus = (userVal === undefined || userVal === null) ? "Bỏ trống" : (userVal === correctVal ? "Đúng" : "Sai");
                let colorStyle = userVal === correctVal ? "color:#4ade80;" : ((userVal === undefined || userVal === null) ? "color:#facc15;" : "color:#f87171;");

                html += `
                    <div style="padding: 6px 0; border-bottom: 1px dashed #334155;">
                        <strong>${label}) ${formatQuestionText(stText)}</strong><br>
                        <small>Bạn chọn: <b>${userVal === true ? "Đúng" : userVal === false ? "Sai" : "Chưa chọn"}</b> | Đáp án đúng: <b>${correctVal ? "Đúng" : "Sai"}</b> 
                        (<span style="${colorStyle}">${stStatus}</span>)</small>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // RENDER PHẦN III (Trả lời ngắn)
        else if (q.part === 3) {
            const userAns = normalizeTextAnswer(uAns);
            const correctAnsStr = String(q.answer ?? q.correctAnswer ?? "");
            const isCorrect = qScore.isCorrect;

            let statusClass = "skipped";
            let statusText = `<i class="fa-solid fa-circle-minus"></i> Bỏ trống (+0/${qScore.maxPoint} đ)`;

            if (userAns !== "") {
                if (isCorrect) {
                    statusClass = "correct";
                    statusText = `<i class="fa-solid fa-check"></i> Trả lời đúng (+${qScore.earnedPoint}/${qScore.maxPoint} đ)`;
                } else {
                    statusClass = "wrong";
                    statusText = `<i class="fa-solid fa-xmark"></i> Trả lời sai (+0/${qScore.maxPoint} đ)`;
                }
            }

            html += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-question-title">Câu ${idx + 1} (Phần III - Trả lời ngắn)</span>
                        <span class="review-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="review-question-body">${formatQuestionText(q.question || '')}</div>
                    <div style="margin-top:10px; padding:8px; background:#1e293b; border-radius:6px;">
                        <div>Câu trả lời của bạn: <strong>${escapeHTML(uAns || 'Chưa trả lời')}</strong></div>
                        <div style="color:#4ade80;">Đáp án đúng: <strong>${escapeHTML(correctAnsStr)}</strong></div>
                    </div>
                </div>
            `;
        }
    });

    html += `</div>`;
    if (resultDetailContent) {
        resultDetailContent.innerHTML = html;
        renderMath();
    }
}

/*==================================================
                HÀM BỔ TRỢ & RENDER MATH
==================================================*/
function renderMath() {
    if (window.katex && document.querySelectorAll) {
        try {
            const elements = document.querySelectorAll(".review-question-body, .opt-text");
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

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showLoading() {
    if (resultLoading) resultLoading.style.display = "flex";
    if (courseList) courseList.style.display = "none";
}

function hideLoading() {
    if (resultLoading) resultLoading.style.display = "none";
    if (courseList) courseList.style.display = "block";
}

function showEmpty() {
    if (resultLoading) resultLoading.style.display = "none";
    if (courseList) courseList.style.display = "none";
    if (resultEmpty) resultEmpty.style.display = "flex";
}

/*==================================================
                EVENT NAVIGATION BACK
==================================================*/
if (backToCourses) {
    backToCourses.addEventListener("click", () => {
        if (courseDetail) courseDetail.style.display = "none";
        if (courseList) courseList.style.display = "block";
    });
}

if (backToLessons) {
    backToLessons.addEventListener("click", () => {
        if (testResultDetail) testResultDetail.style.display = "none";
        if (courseDetail) courseDetail.style.display = "block";
    });
}

/*==================================================
                AUTH STATE CHECK
==================================================*/
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("index.html");
        return;
    }
    currentUser = user;
    await loadUser(user.uid);
    await loadResultsAndCourses();
});

/*==================================================
        XỬ LÝ UI: THÔNG BÁO, AVATAR & USER MENU
==================================================*/
const notificationBtn = document.querySelector(".notification-btn");
const notificationPanel = document.getElementById("notificationPanel");
const closeNotification = document.getElementById("closeNotification");

const avatar = document.querySelector(".avatar");
const userMenu = document.getElementById("userMenu");
const userGuide = document.getElementById("userGuide");

if (userGuide) {
    userGuide.addEventListener("click", () => {
        alert("Chọn khóa học → xem danh sách bài kiểm tra → bấm 'Xem kết quả' để xem điểm số và chi tiết câu đúng/sai.");
    });
}

const logoutBtn = document.getElementById("logoutBtn");
const myCoursesBtn = document.getElementById("myCoursesBtn");
const manageBtn = document.getElementById("manageBtn");

// 1. Toggle Thông báo
if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!auth.currentUser) {
            alert("Bạn cần đăng nhập để xem thông báo.");
            return;
        }
        notificationPanel.classList.toggle("active");
    });
}

if (closeNotification && notificationPanel) {
    closeNotification.addEventListener("click", () => {
        notificationPanel.classList.remove("active");
    });
}

// 2. Toggle Menu User
if (avatar && userMenu) {
    avatar.addEventListener("click", (e) => {
        e.stopPropagation();
        userMenu.classList.toggle("active");
    });
}

// 3. Đóng panel khi click ra ngoài
document.addEventListener("click", (e) => {
    if (notificationPanel && !notificationPanel.contains(e.target) && notificationBtn && !notificationBtn.contains(e.target)) {
        notificationPanel.classList.remove("active");
    }
    if (userMenu && !userMenu.contains(e.target) && avatar && !avatar.contains(e.target)) {
        userMenu.classList.remove("active");
    }
});

// 4. Xử lý các nút điều hướng trong User Menu
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "index.html";
    });
}

if (myCoursesBtn) {
    myCoursesBtn.addEventListener("click", () => {
        window.location.href = "my-courses.html";
    });
}

if (manageBtn) {
    manageBtn.addEventListener("click", () => {
        if (currentRole === "Admin") {
            window.location.href = "dashboard/admin.html";
        } else if (currentRole === "Giáo viên") {
            window.location.href = "dashboard/teacher.html";
        }
    });
}
