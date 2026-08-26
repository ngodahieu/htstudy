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

/* LOAD USER & HEADER */
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

        document.getElementById("userBox").style.display = "block";
        document.getElementById("userMenuList").style.display = "block";
        document.getElementById("userName").textContent = user.name || "Học sinh";
        document.getElementById("userStudentId").textContent = user.memberId || "";
        document.getElementById("userRole").textContent = currentRole;
    } catch (err) {
        console.error("Lỗi tải người dùng:", err);
    }
}

/* LẤY KẾT QUẢ THI ĐÃ NỘP & KHÓA HỌC */
async function loadResultsAndCourses() {
    try {
        showLoading();

        // 1. Tải kết quả thi của học sinh từ collection test_results
        const resultsRef = collection(db, "test_results");
        const qResults = query(resultsRef, where("userId", "==", currentUser.uid));
        const resultsSnap = await getDocs(qResults);

        testResultsMap = {};
        resultsSnap.forEach(docSnap => {
            const data = docSnap.data();
            // Lưu lại kết quả mới nhất nếu thi nhiều lần
            if (!testResultsMap[data.testId] || data.createdAt?.seconds > testResultsMap[data.testId].createdAt?.seconds) {
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

/* RENDER KHÓA HỌC */
function renderCourses() {
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

/* OPEN COURSE DETAIL */
async function openCourseDetail(courseId) {
    currentCourseId = courseId;
    courseList.style.display = "none";
    testResultDetail.style.display = "none";
    courseDetail.style.display = "block";

    courseDetailContent.innerHTML = `<div class="exam-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải chương...</div>`;

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

/* RENDER CHƯƠNG & BÀI HỌC */
function renderChapters() {
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

/* LOAD BÀI HỌC VÀ BÀI KIỂM TRA */
async function loadLessons(chapter) {
    const container = document.getElementById(`lesson-list-${chapter.id}`);
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

/* BÀI KIỂM TRA TRONG BÀI HỌC */
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
                                ? `<strong style="color:#4ade80;"><i class="fa-solid fa-circle-check"></i> Đã làm: ${result.score || 0} điểm</strong>` 
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

/* XEM CHI TIẾT KẾT QUẢ & CÂU HỎI TÔ MÀU ĐÚNG/SAI */
function renderTestResultDetail(test, result) {
    courseDetail.style.display = "none";
    testResultDetail.style.display = "block";

    // Trích xuất câu hỏi từ đề
    const questions = extractQuestions(test);
    const userAnswers = result.answers || {}; // Dạng {0: 'A', 1: 'B'}

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        const correctAns = q.correctAnswer || q.answer || q.key;

        if (!userAns) {
            unansweredCount++;
        } else if (userAns === correctAns) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    let html = `
        <div class="result-stats-card">
            <h2>${escapeHTML(test.title)} - Kết Quả Bài Làm</h2>
            <div class="result-summary-grid">
                <div class="stat-box score">
                    <i class="fa-solid fa-award"></i>
                    <div class="stat-info">
                        <span>Điểm số</span>
                        <strong>${result.score || 0} / 10</strong>
                    </div>
                </div>
                <div class="stat-box correct">
                    <i class="fa-solid fa-circle-check"></i>
                    <div class="stat-info">
                        <span>Số câu đúng</span>
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

    // Render danh sách từng câu hỏi và tô màu
    questions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        const correctAns = q.correctAnswer || q.answer || q.key;
        const options = getOptions(q);

        let statusClass = "skipped";
        let statusText = `<i class="fa-solid fa-circle-minus"></i> Bỏ trống`;

        if (userAns) {
            if (userAns === correctAns) {
                statusClass = "correct";
                statusText = `<i class="fa-solid fa-check"></i> Trả lời đúng`;
            } else {
                statusClass = "wrong";
                statusText = `<i class="fa-solid fa-xmark"></i> Trả lời sai`;
            }
        }

        html += `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-question-title">Câu ${idx + 1}</span>
                    <span class="review-status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="review-question-body">${q.question || q.content || ''}</div>
                <div class="review-options">
        `;

        options.forEach((optText, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            let optionClass = "";

            if (userAns === letter) {
                // Thí sinh có chọn đáp án này
                optionClass = (letter === correctAns) ? "is-correct-selected" : "is-wrong-selected";
            } else if (letter === correctAns && userAns !== correctAns) {
                // Đáp án đúng của đề khi thí sinh chọn sai/bỏ trống
                optionClass = "is-target-correct";
            }

            html += `
                <div class="review-option ${optionClass}">
                    <span class="opt-letter">${letter}</span>
                    <span class="opt-text">${optText}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `</div>`;
    resultDetailContent.innerHTML = html;
}

/* CÁC HÀM BỔ TRỢ TRÍCH XUẤT DỮ LIỆU CÂU HỎI */
function extractQuestions(test) {
    const res = [];
    [test.part1, test.part2, test.part3].forEach(part => {
        if (!part) return;
        if (Array.isArray(part)) res.push(...part);
        else if (part.questions && Array.isArray(part.questions)) res.push(...part.questions);
    });
    return res;
}

function getOptions(q) {
    if (Array.isArray(q.options)) return q.options;
    if (Array.isArray(q.answers)) return q.answers;
    const res = [];
    if (q.A !== undefined) res.push(q.A);
    if (q.B !== undefined) res.push(q.B);
    if (q.C !== undefined) res.push(q.C);
    if (q.D !== undefined) res.push(q.D);
    return res;
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* EVENT NAVIGATION BACK */
backToCourses.addEventListener("click", () => {
    courseDetail.style.display = "none";
    courseList.style.display = "block";
});

backToLessons.addEventListener("click", () => {
    testResultDetail.style.display = "none";
    courseDetail.style.display = "block";
});

/* AUTH STATE CHECK */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("index.html");
        return;
    }
    currentUser = user;
    await loadUser(user.uid);
    await loadResultsAndCourses();
});

function showLoading() {
    resultLoading.style.display = "flex";
    courseList.style.display = "none";
}

function hideLoading() {
    resultLoading.style.display = "none";
    courseList.style.display = "block";
}

function showEmpty() {
    resultLoading.style.display = "none";
    courseList.style.display = "none";
    resultEmpty.style.display = "flex";
}
