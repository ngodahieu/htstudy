import { auth, db } from "./firebase.js";
import { formatChemicalFormula, formatChemistryText } from "./chemistry.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    addDoc,
    serverTimestamp,
    orderBy,
    deleteDoc,
    updateDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

function updateChemistryPreview(input, preview) {
    if (!input || !preview) return;
    preview.innerHTML = formatChemistryText(input.value);
}

// ====================================
//        LẤY CÁC THÀNH PHẦN HTML
// ====================================

const teacherName = document.getElementById("teacherName");
const teacherRole = document.getElementById("teacherRole");
const teacherAvatar = document.getElementById("teacherAvatar");
const logoutBtn = document.getElementById("logoutBtn");

const studentIdInput = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const createStudentBtn = document.getElementById("createStudentBtn");

const menuStudents = document.getElementById("menuStudents");
const menuHome = document.getElementById("menuHome");
const menuNotifications = document.getElementById("menuNotifications");
const menuTests = document.getElementById("menuTests");
const menuCourses = document.getElementById("menuCourses");

const testPage = document.getElementById("testPage");
const testList = document.getElementById("testList");
const testModal = document.getElementById("testModal");
const createTestBtn = document.getElementById("createTestBtn");
const cancelTest = document.getElementById("cancelTest");
const saveTest = document.getElementById("saveTest");

const testCourse = document.getElementById("testCourse");
const testChapter = document.getElementById("testChapter");
const testLesson = document.getElementById("testLesson");
const testTitle = document.getElementById("testTitle");
const testType = document.getElementById("testType");
const testDescription = document.getElementById("testDescription");

const part1Point = document.getElementById("part1Point");
const part2Score1 = document.getElementById("part2Score1");
const part2Score2 = document.getElementById("part2Score2");
const part2Score3 = document.getElementById("part2Score3");
const part2Score4 = document.getElementById("part2Score4");
const part3Point = document.getElementById("part3Point");

const part1Questions = document.getElementById("part1Questions");
const part2Questions = document.getElementById("part2Questions");
const part3Questions = document.getElementById("part3Questions");

const addPart1QuestionBtn = document.getElementById("addPart1QuestionBtn");
const addPart2QuestionBtn = document.getElementById("addPart2QuestionBtn");
const addPart3QuestionBtn = document.getElementById("addPart3QuestionBtn");

const testQuestionTotal = document.getElementById("testQuestionTotal");
const testTotalPoint = document.getElementById("testTotalPoint");

// ====================================
//        STUDENT MANAGEMENT ELEMENTS
// ====================================
const studentPage = document.getElementById("studentPage");
const studentSubjectView = document.getElementById("studentSubjectView");
const studentCourseView = document.getElementById("studentCourseView");
const studentAccountView = document.getElementById("studentAccountView");

const studentSubjectList = document.getElementById("studentSubjectList");
const studentCourseList = document.getElementById("studentCourseList");
const studentAccountList = document.getElementById("studentAccountList");

const studentSubjectTitle = document.getElementById("studentSubjectTitle");
const studentCourseTitle = document.getElementById("studentCourseTitle");

const studentBackToSubjectBtn = document.getElementById("studentBackToSubjectBtn");
const studentBackToCourseBtn = document.getElementById("studentBackToCourseBtn");

const searchStudentAccount = document.getElementById("searchStudentAccount");

// ====================================
//        TEST NAVIGATION
// ====================================
const testSubjectView = document.getElementById("testSubjectView");
const testCourseView = document.getElementById("testCourseView");
const testChapterView = document.getElementById("testChapterView");
const testLessonView = document.getElementById("testLessonView");
const testListView = document.getElementById("testListView");

const testSubjectList = document.getElementById("testSubjectList");
const testCourseList = document.getElementById("testCourseList");
const testChapterList = document.getElementById("testChapterList");
const testLessonList = document.getElementById("testLessonList");

const testCourseViewTitle = document.getElementById("testCourseViewTitle");
const testChapterViewTitle = document.getElementById("testChapterViewTitle");
const testLessonViewTitle = document.getElementById("testLessonViewTitle");
const testListViewTitle = document.getElementById("testListViewTitle");

const testBreadcrumbContent = document.getElementById("testBreadcrumbContent");
const testBackBtn = document.getElementById("testBackBtn");

// ====================================
//        COURSE & LESSON ELEMENTS
// ====================================
const coursePage = document.getElementById("coursePage");
const teacherCourseList = document.getElementById("teacherCourseList");
const courseManagePage = document.getElementById("courseManagePage");
const manageCourseTitle = document.getElementById("manageCourseTitle");
const backToCoursesBtn = document.getElementById("backToCoursesBtn");
const createChapterBtn = document.getElementById("createChapterBtn");
const chapterList = document.getElementById("chapterList");
const lessonPage = document.getElementById("lessonPage");
const lessonPageTitle = document.getElementById("lessonPageTitle");
const lessonList = document.getElementById("lessonList");
const backToChapterBtn = document.getElementById("backToChapterBtn");
const createLessonBtn = document.getElementById("createLessonBtn");

const lessonModal = document.getElementById("lessonModal");
const lessonTitle = document.getElementById("lessonTitle");
const lessonDescription = document.getElementById("lessonDescription");
const lessonOrder = document.getElementById("lessonOrder");

const pdfFile = document.getElementById("pdfFile");
const imageFile = document.getElementById("imageFile");
const documentFile = document.getElementById("documentFile");
const changePdfBtn = document.getElementById("changePdfBtn");
const uploadVideoBtn = document.getElementById("uploadVideoBtn");

const videoFile = document.getElementById("videoFile");
const videoResult = document.getElementById("videoResult");
const pdfResult = document.getElementById("pdfResult");
const saveLesson = document.getElementById("saveLesson");
const cancelLesson = document.getElementById("cancelLesson");

const chapterModal = document.getElementById("chapterModal");
const chapterTitle = document.getElementById("chapterTitle");
const chapterDescription = document.getElementById("chapterDescription");
const chapterOrder = document.getElementById("chapterOrder");
const saveChapter = document.getElementById("saveChapter");
const cancelChapter = document.getElementById("cancelChapter");

const notificationPage = document.getElementById("notificationPage");
const notificationType = document.getElementById("notificationType");
const notificationCourse = document.getElementById("notificationCourse");
const notificationContentLink = document.getElementById("notificationContentLink");
const notificationTitle = document.getElementById("notificationTitle");
const notificationContent = document.getElementById("notificationContent");
const createNotificationBtn = document.getElementById("createNotificationBtn");
const notificationList = document.getElementById("notificationList");

const dashboardHeader = document.getElementById("mainDashboardHeader");
const dashboardCards = document.querySelector(".dashboard-cards");
const menuItems = document.querySelectorAll(".menu-item");

// ====================================
//        GLOBAL STATE VARIABLES
// ====================================
let currentTeacherId = "";
let currentTeacherName = "";
let currentStudentCourseId = "";
let currentStudentAccounts = [];
let currentSelectedStudent = null; 
let testResultNavStep = 1;         
let selectedChapterForTest = null;
let selectedLessonForTest = null;
let selectedTestObj = null;

let testCurrentSubject = null;
let testCurrentCourseId = "";
let testCurrentChapterId = "";
let testCurrentLessonId = "";

let editingTestId = "";
let editingTestCourseId = "";

let currentChapterId = "";
let editingLessonId = "";
let currentCourseId = "";
let editingChapterId = "";

let part1QuestionData = [];
let part2QuestionData = [];
let part3QuestionData = [];

let uploadedPdfLink = "";
let uploadedVideoLink = "";
/*==================================================
        HÀM TRÍCH XUẤT VÀ TÍNH ĐIỂM (BỔ SUNG)
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

function normalizeAnswer(ans) {
    if (ans === undefined || ans === null) return "";
    const str = String(ans).trim();
    if (!isNaN(str) && str !== "") {
        return String.fromCharCode(65 + parseInt(str, 10));
    }
    return str.toUpperCase();
}

function normalizeTextAnswer(ans) {
    if (ans === undefined || ans === null) return "";
    return String(ans).trim().replace(',', '.').toLowerCase();
}
// ====================================
//        HELPER FUNCTIONS
// ====================================
function setActiveMenu(activeButton) {
    menuItems.forEach((item) => item.classList.remove("active"));
    if (activeButton) activeButton.classList.add("active");
}

function hideAllPages() {
    if (dashboardHeader) dashboardHeader.style.display = "none";
    if (dashboardCards) dashboardCards.style.display = "none";
    if (studentPage) studentPage.style.display = "none";
    if (coursePage) coursePage.style.display = "none";
    if (courseManagePage) courseManagePage.style.display = "none";
    if (lessonPage) lessonPage.style.display = "none";
    if (notificationPage) notificationPage.style.display = "none";
    if (testPage) testPage.style.display = "none";
}

function escapeHtmlTeacher(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ====================================
//        SINH MÃ HỌC SINH & DASHBOARD
// ====================================
async function generateMemberId() {
    const snapshot = await getDocs(collection(db, "users"));
    let max = 0;
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.memberId) return;
        const number = parseInt(data.memberId.replace("HT27", ""), 10);
        if (!isNaN(number) && number > max) {
            max = number;
        }
    });
    return "HT27" + String(max + 1).padStart(4, "0");
}

async function loadDashboard() {
    const snapshot = await getDocs(collection(db, "users"));
    let student = 0;
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role === "Học sinh") student++;
    });
    const studentCountEl = document.getElementById("studentCount");
    if (studentCountEl) studentCountEl.textContent = student;
}

// ====================================
//        KIỂM TRA ĐĂNG NHẬP
// ====================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Bạn cần đăng nhập.");
        window.location.href = "../index.html";
        return;
    }

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        alert("Không tìm thấy tài khoản.");
        await signOut(auth);
        window.location.href = "../index.html";
        return;
    }

    const data = docSnap.data();
    currentTeacherId = user.uid;
    currentTeacherName = data.name;

    if (data.role !== "Giáo viên") {
        alert("Bạn không có quyền truy cập.");
        window.location.href = "../index.html";
        return;
    }

    if (teacherName) teacherName.textContent = data.name;
    if (teacherRole) teacherRole.textContent = data.role;
    if (teacherAvatar) {
        teacherAvatar.src = data.avatar && data.avatar.trim() !== ""
            ? data.avatar
            : "../assets/avatars/default.jpg";
    }

    if (studentIdInput) studentIdInput.value = await generateMemberId();
    await loadDashboard();
});

// ====================================
//        MENU EVENT LISTENERS
// ====================================
if (menuHome) {
    menuHome.addEventListener("click", () => {
        setActiveMenu(menuHome);
        hideAllPages();
        if (dashboardHeader) dashboardHeader.style.display = "block";
        if (dashboardCards) dashboardCards.style.display = "grid";
    });
}

if (menuStudents) {
    menuStudents.addEventListener("click", async () => {
        setActiveMenu(menuStudents);
        hideAllPages();
        if (studentPage) studentPage.style.display = "block";
        resetStudentViews();
        await loadStudentSubjects();
    });
}

if (menuCourses) {
    menuCourses.addEventListener("click", async () => {
        setActiveMenu(menuCourses);
        hideAllPages();
        if (coursePage) coursePage.style.display = "block";
        await loadMyCourses();
    });
}

if (menuNotifications) {
    menuNotifications.addEventListener("click", async () => {
        setActiveMenu(menuNotifications);
        hideAllPages();
        if (notificationPage) notificationPage.style.display = "block";
        await loadNotificationCourses();
        await loadNotifications();
    });
}

if (menuTests) {
    menuTests.addEventListener("click", async () => {
        setActiveMenu(menuTests);
        hideAllPages();
        if (testPage) testPage.style.display = "block";
        resetTestNavigation();
        await loadTestSubjects();
    });
}

// ====================================
//    LOGIC QUẢN LÝ HỌC SINH (STUDENTS)
// ====================================
function hideStudentViews() {
    if (studentSubjectView) studentSubjectView.style.display = "none";
    if (studentCourseView) studentCourseView.style.display = "none";
    if (studentAccountView) studentAccountView.style.display = "none";
}

function resetStudentViews() {
    hideStudentViews();
    if (studentSubjectView) studentSubjectView.style.display = "block";
}

async function loadStudentSubjects() {
    hideStudentViews();
    if (studentSubjectView) studentSubjectView.style.display = "block";
    if (studentSubjectList) {
        studentSubjectList.innerHTML = `<div class="empty">Đang tải môn học...</div>`;
    }

    try {
        const q = query(collection(db, "courses"), where("teacherId", "==", currentTeacherId));
        const snapshot = await getDocs(q);
        const subjects = new Map();

        snapshot.forEach((courseDoc) => {
            const data = courseDoc.data();
            const subject = data.subjectName || data.subject || "Chưa xác định";
            if (!subjects.has(subject)) subjects.set(subject, []);
            subjects.get(subject).push({ id: courseDoc.id, ...data });
        });

        if (!subjects.size) {
            if (studentSubjectList) {
                studentSubjectList.innerHTML = `
                    <div class="empty">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <h3>Chưa có môn học</h3>
                        <p>Bạn chưa được phân công môn học nào.</p>
                    </div>`;
            }
            return;
        }

        if (studentSubjectList) studentSubjectList.innerHTML = "";

        for (const [subject, courses] of subjects) {
            const card = document.createElement("div");
            card.className = "test-card";
            card.innerHTML = `
                <div class="test-card-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                <div class="test-card-content">
                    <h3>${escapeHtmlTeacher(subject)}</h3>
                    <p>${courses.length} khóa học</p>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => openStudentSubject(subject, courses));
            if (studentSubjectList) studentSubjectList.appendChild(card);
        }
    } catch (error) {
        console.error("Lỗi khi tải môn học học sinh:", error);
        if (studentSubjectList) {
            studentSubjectList.innerHTML = `<div class="empty">Không thể tải danh sách môn học.</div>`;
        }
    }
}

function openStudentSubject(subject, courses) {
    hideStudentViews();
    if (studentCourseView) studentCourseView.style.display = "block";
    if (studentSubjectTitle) studentSubjectTitle.textContent = subject;

    courses.sort((a, b) => Number(a.grade || 0) - Number(b.grade || 0));

    if (studentCourseList) {
        studentCourseList.innerHTML = "";
        if (!courses.length) {
            studentCourseList.innerHTML = `<div class="empty">Chưa có khóa học nào.</div>`;
            return;
        }

        courses.forEach((course) => {
            const card = document.createElement("div");
            card.className = "test-card";
            card.innerHTML = `
                <div class="test-card-icon"><i class="fa-solid fa-book"></i></div>
                <div class="test-card-content">
                    <h3>
                        ${escapeHtmlTeacher(course.grade ? `Lớp ${course.grade}` : "")}
                        ${escapeHtmlTeacher(course.name || "")}
                    </h3>
                    <p>${escapeHtmlTeacher(course.description || "Khóa học do bạn quản lý")}</p>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => {
                openStudentAccountsView(course.id, course.name || `Lớp ${course.grade || ""}`);
            });
            studentCourseList.appendChild(card);
        });
    }
}

async function openStudentAccountsView(courseId, courseName) {
    currentStudentCourseId = courseId;
    hideStudentViews();
    if (studentAccountView) studentAccountView.style.display = "block";
    if (studentCourseTitle) studentCourseTitle.textContent = courseName;
    if (searchStudentAccount) searchStudentAccount.value = "";

    await loadStudentAccountsForCourse(courseId);
}

async function loadStudentAccountsForCourse(courseId) {
    if (studentAccountList) {
        studentAccountList.innerHTML = `<div class="empty">Đang tải danh sách học sinh...</div>`;
    }

    try {
        const q = query(collection(db, "users"), where("role", "==", "Học sinh"));
        const snapshot = await getDocs(q);
        let validAccounts = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const uid = docSnap.id;
            
            const userEnrollRef = doc(db, "enrollments", uid);
            const userEnrollSnap = await getDoc(userEnrollRef);
            
            let isEnrolled = false;
            if (userEnrollSnap.exists()) {
                const enrollData = userEnrollSnap.data();
                if (Array.isArray(enrollData.courses) && enrollData.courses.includes(courseId)) {
                    isEnrolled = true;
                }
            }
            
            if (isEnrolled || (Array.isArray(data.courses) && data.courses.includes(courseId)) || data.courseId === courseId) {
                validAccounts.push({ id: uid, ...data });
            }
        }

        currentStudentAccounts = validAccounts;
        renderStudentAccountList(currentStudentAccounts);
    } catch (error) {
        console.error("Lỗi khi tải danh sách học sinh:", error);
        if (studentAccountList) {
            studentAccountList.innerHTML = `<div class="empty">Không thể tải danh sách học sinh.</div>`;
        }
    }
}

function renderStudentAccountList(accounts) {
    if (!studentAccountList) return;

    if (!accounts.length) {
        studentAccountList.innerHTML = `
            <div class="empty">
                <i class="fa-solid fa-user-slash"></i>
                <h3>Chưa có học sinh nào</h3>
                <p>Khóa học này chưa được cấp tài khoản cho học sinh nào.</p>
            </div>`;
        return;
    }

    studentAccountList.innerHTML = "";
    accounts.forEach((acc) => {
        const card = document.createElement("div");
        card.className = "chapter-card student-account-card";
        card.style.display = "flex";
        card.style.justifyContent = "space-between";
        card.style.alignItems = "center";

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${acc.avatar && acc.avatar.trim() !== "" ? acc.avatar : "../assets/avatars/default.jpg"}" 
                     style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" alt="Avatar">
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem;">
                        ${escapeHtmlTeacher(acc.name || "Chưa đặt tên")} 
                        <span style="font-size: 0.85rem; color: #007bff; font-weight: normal;">(${escapeHtmlTeacher(acc.memberId || "Chưa có Mã")})</span>
                    </h3>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 0.9rem;">
                        📧 ${escapeHtmlTeacher(acc.email || "Không có email")}
                    </p>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="primary-btn detail-student-btn" data-id="${acc.id}" style="padding: 6px 12px; font-size: 0.9rem;">
                    <i class="fa-solid fa-circle-info"></i> Chi tiết
                </button>
                <button class="primary-btn test-result-btn" data-id="${acc.id}" style="padding: 6px 12px; font-size: 0.9rem; background-color: #28a745;">
                    <i class="fa-solid fa-square-poll-vertical"></i> Kết quả kiểm tra
                </button>
            </div>
        `;

        card.querySelector(".detail-student-btn").addEventListener("click", () => openStudentDetailModal(acc));
        card.querySelector(".test-result-btn").addEventListener("click", () => {
            currentSelectedStudent = acc;
            openStudentTestChapters(currentStudentCourseId);
        });

        studentAccountList.appendChild(card);
    });
}

if (studentBackToSubjectBtn) {
    studentBackToSubjectBtn.addEventListener("click", () => {
        hideStudentViews();
        if (studentSubjectView) studentSubjectView.style.display = "block";
    });
}

if (studentBackToCourseBtn) {
    studentBackToCourseBtn.addEventListener("click", () => {
        hideStudentViews();
        if (studentCourseView) studentCourseView.style.display = "block";
    });
}

if (searchStudentAccount) {
    searchStudentAccount.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderStudentAccountList(currentStudentAccounts);
            return;
        }

        const filtered = currentStudentAccounts.filter((acc) => {
            const nameMatch = (acc.name || "").toLowerCase().includes(term);
            const idMatch = (acc.memberId || "").toLowerCase().includes(term);
            const emailMatch = (acc.email || "").toLowerCase().includes(term);
            return nameMatch || idMatch || emailMatch;
        });

        renderStudentAccountList(filtered);
    });
}

// ====================================
//        MODAL CHI TIẾT HỌC SINH
// ====================================
const studentDetailModal = document.getElementById("studentDetailModal");
const studentDetailBody = document.getElementById("studentDetailBody");
const closeStudentDetailBtn = document.getElementById("closeStudentDetailBtn");

function openStudentDetailModal(acc) {
    if (!studentDetailModal || !studentDetailBody) return;
    const avatarSrc = acc.avatar && acc.avatar.trim() !== "" ? acc.avatar : "../assets/avatars/default.jpg";

    studentDetailBody.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <img src="${avatarSrc}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;" alt="Avatar">
            <div style="text-align: left; width: 100%; padding: 0 20px;">
                <p><strong>Họ và tên:</strong> ${escapeHtmlTeacher(acc.name || "Chưa cập nhật")}</p>
                <p><strong>Mã học sinh:</strong> ${escapeHtmlTeacher(acc.memberId || "Chưa có")}</p>
                <p><strong>Email / Tài khoản:</strong> ${escapeHtmlTeacher(acc.email || "Không có")}</p>
            </div>
        </div>
    `;
    studentDetailModal.style.display = "flex";
}

if (closeStudentDetailBtn) {
    closeStudentDetailBtn.addEventListener("click", () => {
        if (studentDetailModal) studentDetailModal.style.display = "none";
    });
}

window.addEventListener("click", (event) => {
    if (event.target === studentDetailModal) {
        studentDetailModal.style.display = "none";
    }
});

// ====================================
//        TEST NAVIGATION UTILS
// ====================================
function hideTestViews() {
    if (testSubjectView) testSubjectView.style.display = "none";
    if (testCourseView) testCourseView.style.display = "none";
    if (testChapterView) testChapterView.style.display = "none";
    if (testLessonView) testLessonView.style.display = "none";
    if (testListView) testListView.style.display = "none";
}

function resetTestNavigation() {
    testCurrentSubject = null;
    testCurrentCourseId = "";
    testCurrentChapterId = "";
    testCurrentLessonId = "";

    hideTestViews();
    if (testSubjectView) testSubjectView.style.display = "block";
    if (testBackBtn) testBackBtn.style.display = "none";
    if (testBreadcrumbContent) {
        testBreadcrumbContent.innerHTML = `<span class="breadcrumb-current">Tất cả môn học</span>`;
    }
}

function updateTestBreadcrumb() {
    let html = `<span class="breadcrumb-item" data-level="subject">${escapeHtmlTeacher(testCurrentSubject || "Môn học")}</span>`;

    if (testCurrentCourseId) {
        html += `<span class="breadcrumb-separator">/</span><span class="breadcrumb-item" data-level="course">Khóa học</span>`;
    }
    if (testCurrentChapterId) {
        html += `<span class="breadcrumb-separator">/</span><span class="breadcrumb-item" data-level="chapter">Chương</span>`;
    }
    if (testCurrentLessonId) {
        html += `<span class="breadcrumb-separator">/</span><span class="breadcrumb-item">Bài học</span>`;
    }

    if (testBreadcrumbContent) testBreadcrumbContent.innerHTML = html;
    if (testBackBtn) testBackBtn.style.display = testCurrentSubject ? "flex" : "none";
}

async function loadTestSubjects() {
    hideTestViews();
    if (testSubjectView) testSubjectView.style.display = "block";
    if (testSubjectList) testSubjectList.innerHTML = `<div class="empty">Đang tải môn học...</div>`;
    if (testBackBtn) testBackBtn.style.display = "none";

    try {
        const q = query(collection(db, "courses"), where("teacherId", "==", currentTeacherId));
        const snapshot = await getDocs(q);
        const subjects = new Map();

        snapshot.forEach((courseDoc) => {
            const data = courseDoc.data();
            const subject = data.subjectName || data.subject || "Chưa xác định";
            if (!subjects.has(subject)) subjects.set(subject, []);
            subjects.get(subject).push({ id: courseDoc.id, ...data });
        });

        if (!subjects.size) {
            if (testSubjectList) {
                testSubjectList.innerHTML = `
                    <div class="empty">
                        <i class="fa-solid fa-book-open"></i>
                        <h3>Chưa có môn học</h3>
                        <p>Bạn chưa được phân công khóa học nào.</p>
                    </div>`;
            }
            return;
        }

        if (testSubjectList) testSubjectList.innerHTML = "";

        for (const [subject, courses] of subjects) {
            const card = document.createElement("div");
            card.className = "test-card";
            card.innerHTML = `
                <div class="test-card-icon"><i class="fa-solid fa-book-open"></i></div>
                <div class="test-card-content">
                    <h3>${escapeHtmlTeacher(subject)}</h3>
                    <p>${courses.length} khóa học</p>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => openTestSubject(subject, courses));
            if (testSubjectList) testSubjectList.appendChild(card);
        }
    } catch (error) {
        console.error(error);
        if (testSubjectList) {
            testSubjectList.innerHTML = `<div class="empty">Không thể tải danh sách môn học.</div>`;
        }
    }
}

async function openTestSubject(subject, courses) {
    testCurrentSubject = subject;
    testCurrentCourseId = "";
    testCurrentChapterId = "";
    testCurrentLessonId = "";

    hideTestViews();
    if (testCourseView) testCourseView.style.display = "block";
    if (testCourseViewTitle) testCourseViewTitle.textContent = subject;

    updateTestBreadcrumb();
    if (testCourseList) testCourseList.innerHTML = "";

    courses.sort((a, b) => Number(a.grade || 0) - Number(b.grade || 0));

    if (!courses.length) {
        if (testCourseList) testCourseList.innerHTML = `<div class="empty">Chưa có khóa học.</div>`;
        return;
    }

    courses.forEach((course) => {
        const card = document.createElement("div");
        card.className = "test-card";
        card.innerHTML = `
            <div class="test-card-icon"><i class="fa-solid fa-book"></i></div>
            <div class="test-card-content">
                <h3>
                    ${escapeHtmlTeacher(course.grade ? `Lớp ${course.grade}` : "")}
                    ${escapeHtmlTeacher(course.name || "")}
                </h3>
                <p>${escapeHtmlTeacher(course.description || "Khóa học do bạn quản lý")}</p>
            </div>
            <i class="fa-solid fa-chevron-right"></i>
        `;
        card.addEventListener("click", () => openTestCourse(course.id, course.name || `Lớp ${course.grade || ""}`));
        if (testCourseList) testCourseList.appendChild(card);
    });
}

async function openTestCourse(courseId, courseName) {
    testCurrentCourseId = courseId;
    testCurrentChapterId = "";
    testCurrentLessonId = "";

    hideTestViews();
    if (testChapterView) testChapterView.style.display = "block";
    if (testChapterViewTitle) testChapterViewTitle.textContent = courseName || "Chương";

    updateTestBreadcrumb();
    if (testChapterList) testChapterList.innerHTML = `<div class="empty">Đang tải chương...</div>`;

    try {
        const snapshot = await getDocs(collection(db, "courses", courseId, "chapters"));
        const chapters = [];
        snapshot.forEach((chapterDoc) => {
            chapters.push({ id: chapterDoc.id, ...chapterDoc.data() });
        });

        chapters.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        if (!chapters.length) {
            if (testChapterList) {
                testChapterList.innerHTML = `
                    <div class="empty">
                        <i class="fa-solid fa-folder-open"></i>
                        <h3>Chưa có chương</h3>
                    </div>`;
            }
            return;
        }

        if (testChapterList) testChapterList.innerHTML = "";

        chapters.forEach((chapter) => {
            const card = document.createElement("div");
            card.className = "chapter-card test-navigation-card";
            card.innerHTML = `
                <div>
                    <h3>Chương ${escapeHtmlTeacher(chapter.order || "")} - ${escapeHtmlTeacher(chapter.title || "")}</h3>
                    <p>${escapeHtmlTeacher(chapter.description || "")}</p>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => openTestChapter(chapter.id, chapter.title));
            if (testChapterList) testChapterList.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        if (testChapterList) testChapterList.innerHTML = `<div class="empty">Không thể tải chương.</div>`;
    }
}

async function openTestChapter(chapterId, chapterTitle) {
    testCurrentChapterId = chapterId;
    testCurrentLessonId = "";

    hideTestViews();
    if (testLessonView) testLessonView.style.display = "block";
    if (testLessonViewTitle) testLessonViewTitle.textContent = chapterTitle || "Bài học";

    updateTestBreadcrumb();
    if (testLessonList) testLessonList.innerHTML = `<div class="empty">Đang tải bài học...</div>`;

    try {
        const snapshot = await getDocs(collection(db, "courses", testCurrentCourseId, "chapters", chapterId, "lessons"));
        const lessons = [];
        snapshot.forEach((lessonDoc) => {
            lessons.push({ id: lessonDoc.id, ...lessonDoc.data() });
        });

        lessons.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        if (!lessons.length) {
            if (testLessonList) {
                testLessonList.innerHTML = `
                    <div class="empty">
                        <i class="fa-solid fa-book-open"></i>
                        <h3>Chưa có bài học</h3>
                    </div>`;
            }
            return;
        }

        if (testLessonList) testLessonList.innerHTML = "";

        lessons.forEach((lesson) => {
            const card = document.createElement("div");
            card.className = "chapter-card test-navigation-card";
            card.innerHTML = `
                <div>
                    <h3>Bài ${escapeHtmlTeacher(lesson.order || "")} - ${escapeHtmlTeacher(lesson.title || "")}</h3>
                    <p>${escapeHtmlTeacher(lesson.description || "")}</p>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => openTestLesson(lesson.id, lesson.title));
            if (testLessonList) testLessonList.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        if (testLessonList) testLessonList.innerHTML = `<div class="empty">Không thể tải bài học.</div>`;
    }
}

async function openTestLesson(lessonId, lessonTitle) {
    testCurrentLessonId = lessonId;
    hideTestViews();
    if (testListView) testListView.style.display = "block";
    if (testListViewTitle) testListViewTitle.textContent = lessonTitle || "Bài kiểm tra";

    updateTestBreadcrumb();
    await loadTestsForLesson();
}

async function loadTestsForLesson() {
    if (testList) testList.innerHTML = `<div class="empty">Đang tải bài kiểm tra...</div>`;

    try {
        const snapshot = await getDocs(collection(db, "courses", testCurrentCourseId, "tests"));
        const tests = [];
        snapshot.forEach((testDoc) => {
            const data = testDoc.data();
            if (data.chapterId === testCurrentChapterId && data.lessonId === testCurrentLessonId) {
                tests.push({ id: testDoc.id, ...data });
            }
        });

        tests.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        if (!tests.length) {
            if (testList) {
                testList.innerHTML = `
                    <div class="empty">
                        <i class="fa-solid fa-file-circle-xmark"></i>
                        <h3>Chưa có bài kiểm tra</h3>
                        <p>Hãy bấm Tạo bài kiểm tra để tạo bài đầu tiên cho bài học này.</p>
                    </div>`;
            }
            return;
        }

        if (testList) testList.innerHTML = "";

        tests.forEach((test) => {
            const card = document.createElement("div");
            card.className = "chapter-card test-item";
            card.innerHTML = `
                <div>
                    <h3>
                        <i class="fa-solid fa-file-circle-check"></i>
                        ${escapeHtmlTeacher(test.title || "Bài kiểm tra")}
                    </h3>
                    <p>
                        ⏱ ${Number(test.duration || 0)} phút &nbsp;&nbsp;
                        📝 ${Number(test.questionCount || 0)} câu &nbsp;&nbsp;
                        ⭐ ${Number(test.totalPoints || 0)} điểm
                    </p>
                    <p>${test.description ? escapeHtmlTeacher(test.description) : "Không có mô tả."}</p>
                </div>
                <div class="chapter-actions">
                    <button class="chapter-edit" data-test-id="${test.id}">
                        <i class="fa-solid fa-pen"></i> Sửa
                    </button>
                    <button class="chapter-delete" data-test-id="${test.id}">
                        <i class="fa-solid fa-trash"></i> Xóa
                    </button>
                </div>
            `;

            card.querySelector(".chapter-edit").addEventListener("click", () => editTeacherTest(test.id, testCurrentCourseId));
            card.querySelector(".chapter-delete").addEventListener("click", () => deleteTeacherTest(testCurrentCourseId, test.id));

            if (testList) testList.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        if (testList) testList.innerHTML = `<div class="empty">Không thể tải bài kiểm tra.</div>`;
    }
}

if (testBackBtn) {
    testBackBtn.addEventListener("click", async () => {
        if (!testCurrentSubject) return;

        if (testCurrentLessonId) {
            testCurrentLessonId = "";
            hideTestViews();
            if (testLessonView) testLessonView.style.display = "block";
            updateTestBreadcrumb();
            return;
        }

        if (testCurrentChapterId) {
            testCurrentChapterId = "";
            hideTestViews();
            if (testChapterView) testChapterView.style.display = "block";
            updateTestBreadcrumb();
            return;
        }

        if (testCurrentCourseId) {
            testCurrentCourseId = "";
            hideTestViews();
            if (testCourseView) testCourseView.style.display = "block";
            updateTestBreadcrumb();
            return;
        }

        testCurrentSubject = null;
        resetTestNavigation();
        await loadTestSubjects();
    });
}

// ====================================
//        XÓA & SỬA BÀI KIỂM TRA
// ====================================
window.deleteTeacherTest = async function (courseId, testId) {
    if (!confirm("Bạn có chắc muốn xóa bài kiểm tra này?\nHành động này không thể hoàn tác.")) return;

    try {
        await deleteDoc(doc(db, "courses", courseId, "tests", testId));
        alert("Đã xóa bài kiểm tra.");
        if (testCurrentLessonId && testCurrentChapterId && testCurrentCourseId) {
            await loadTestsForLesson();
        }
    } catch (error) {
        console.error(error);
        alert("Không thể xóa bài kiểm tra: " + error.message);
    }
};

async function editTeacherTest(testId, courseId) {
    try {
        const testRef = doc(db, "courses", courseId, "tests", testId);
        const snap = await getDoc(testRef);

        if (!snap.exists()) {
            alert("Không tìm thấy bài kiểm tra.");
            return;
        }

        const data = snap.data();
        editingTestId = testId;
        editingTestCourseId = courseId;

        if (testTitle) testTitle.value = data.title || "";
        if (testDescription) testDescription.value = data.description || "";
        if (testType) testType.value = data.type || `${data.duration || 15}p`;

        if (part1Point) part1Point.value = data.part1?.points ?? 0.5;
        if (part2Score1) part2Score1.value = data.part2?.scores?.one ?? 0.1;
        if (part2Score2) part2Score2.value = data.part2?.scores?.two ?? 0.25;
        if (part2Score3) part2Score3.value = data.part2?.scores?.three ?? 0.5;
        if (part2Score4) part2Score4.value = data.part2?.scores?.four ?? 1;
        if (part3Point) part3Point.value = data.part3?.points ?? 0.5;

        part1QuestionData = JSON.parse(JSON.stringify(data.part1?.questions || []));
        part2QuestionData = JSON.parse(JSON.stringify(data.part2?.questions || []));
        part3QuestionData = JSON.parse(JSON.stringify(data.part3?.questions || []));

        part1QuestionData.forEach(q => {
            if (typeof q.correctAnswer === 'string') {
                const upper = q.correctAnswer.trim().toUpperCase();
                q.correctAnswer = ['A', 'B', 'C', 'D'].includes(upper) ? upper.charCodeAt(0) - 65 : parseInt(q.correctAnswer, 10) || 0;
            }
        });

        part2QuestionData.forEach(q => {
            q.answers = Array.isArray(q.answers) ? q.answers.map(ans => String(ans) === "true" || ans === true) : [true, false, false, false];
        });

        await loadTestCourses();

        if (testCourse) {
            testCourse.value = data.courseId || courseId;
            testCourse.dispatchEvent(new Event("change"));
        }

        await new Promise((resolve) => setTimeout(resolve, 150));

        if (testChapter) {
            testChapter.value = data.chapterId || "";
            testChapter.dispatchEvent(new Event("change"));
        }

        await new Promise((resolve) => setTimeout(resolve, 150));

        if (testLesson) testLesson.value = data.lessonId || "";

        renderPart1Questions();
        renderPart2Questions();
        renderPart3Questions();
        updateTestTotal();

        const modalTitle = testModal ? testModal.querySelector("h2") : null;
        if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen"></i> Chỉnh sửa bài kiểm tra`;
        if (saveTest) saveTest.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi`;

        if (testModal) testModal.style.display = "flex";
    } catch (error) {
        console.error(error);
        alert("Không thể tải bài kiểm tra: " + error.message);
    }
}

if (createTestBtn) {
    createTestBtn.addEventListener("click", async () => {
        editingTestId = "";
        editingTestCourseId = "";

        resetTestBuilder();
        await loadTestCourses();

        const modalTitle = testModal ? testModal.querySelector("h2") : null;
        if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-file-circle-check"></i> Tạo bài kiểm tra`;
        if (saveTest) saveTest.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Lưu bài kiểm tra`;

        if (testCurrentCourseId && testCurrentChapterId && testCurrentLessonId) {
            if (testCourse) {
                testCourse.value = testCurrentCourseId;
                testCourse.dispatchEvent(new Event("change"));
            }
            setTimeout(() => {
                if (testChapter) {
                    testChapter.value = testCurrentChapterId;
                    testChapter.dispatchEvent(new Event("change"));
                }
                setTimeout(() => {
                    if (testLesson) testLesson.value = testCurrentLessonId;
                }, 150);
            }, 150);
        }

        if (testModal) testModal.style.display = "flex";
    });
}

if (cancelTest) {
    cancelTest.addEventListener("click", () => {
        if (testModal) testModal.style.display = "none";
    });
}

async function loadTestCourses() {
    if (!testCourse) return;
    testCourse.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    const q = query(collection(db, "courses"), where("teacherId", "==", currentTeacherId));
    const snapshot = await getDocs(q);
    snapshot.forEach((courseDoc) => {
        const data = courseDoc.data();
        testCourse.innerHTML += `
            <option value="${courseDoc.id}">
                ${escapeHtmlTeacher(data.subjectName || data.subject || "")}
                ${escapeHtmlTeacher(data.grade || "")} - 
                ${escapeHtmlTeacher(data.name || "")}
            </option>
        `;
    });
}

if (testCourse) {
    testCourse.addEventListener("change", async () => {
        const courseId = testCourse.value;
        if (!testChapter || !testLesson) return;

        testChapter.innerHTML = `<option value="">-- Chọn chương --</option>`;
        testLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
        testChapter.disabled = true;
        testLesson.disabled = true;

        if (!courseId) return;

        const snapshot = await getDocs(collection(db, "courses", courseId, "chapters"));
        const chapters = [];
        snapshot.forEach((chapterDoc) => chapters.push({ id: chapterDoc.id, ...chapterDoc.data() }));
        chapters.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        chapters.forEach((chapter) => {
            testChapter.innerHTML += `
                <option value="${chapter.id}">
                    Chương ${escapeHtmlTeacher(chapter.order || "")} - ${escapeHtmlTeacher(chapter.title || "")}
                </option>
            `;
        });

        testChapter.disabled = chapters.length === 0;
    });
}

if (testChapter) {
    testChapter.addEventListener("change", async () => {
        const courseId = testCourse.value;
        const chapterId = testChapter.value;
        if (!testLesson) return;

        testLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
        testLesson.disabled = true;

        if (!courseId || !chapterId) return;

        const snapshot = await getDocs(collection(db, "courses", courseId, "chapters", chapterId, "lessons"));
        const lessons = [];
        snapshot.forEach((lessonDoc) => lessons.push({ id: lessonDoc.id, ...lessonDoc.data() }));
        lessons.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        lessons.forEach((lesson) => {
            testLesson.innerHTML += `
                <option value="${lesson.id}">
                    Bài ${escapeHtmlTeacher(lesson.order || "")} - ${escapeHtmlTeacher(lesson.title || "")}
                </option>
            `;
        });

        testLesson.disabled = lessons.length === 0;
    });
}

// ====================================
//        XỬ LÝ XEM TRƯỚC CÔNG THỨC & RENDER CÂU HỎI
// ====================================
function updateFormulaPreview(inputEl, previewEl) {
    if (!inputEl || !previewEl) return;
    const val = inputEl.value;
    if (!val || !val.trim()) {
        previewEl.innerHTML = `<span class="preview-placeholder">Xem trước: <i>(Trống)</i></span>`;
        return;
    }
    
    let formatted = formatChemistryText(val);
    if (window.katex) {
        try {
            formatted = formatted.replace(/\$(.*?)\$/g, (match, formula) => katex.renderToString(formula, { throwOnError: false }));
        } catch (e) {
            console.error("Lỗi render KaTeX:", e);
        }
    }
    formatted = formatted.replace(/\r\n|\r|\n/g, "<br>");
    previewEl.innerHTML = `<span class="preview-label">Xem trước:</span> <span class="preview-content" style="white-space: pre-wrap; display: inline-block; width: 100%;">${formatted}</span>`;
}

// --- Phần I ---
if (addPart1QuestionBtn) {
    addPart1QuestionBtn.addEventListener("click", () => {
        part1QuestionData.push({ question: "", image: "", options: ["", "", "", ""], correctAnswer: 0 });
        renderPart1Questions();
        updateTestTotal();
    });
}

function renderPart1Questions() {
    if (!part1Questions) return;
    if (!part1QuestionData.length) {
        part1Questions.innerHTML = `<div class="question-empty">Chưa có câu hỏi nào.</div>`;
        return;
    }

    part1Questions.innerHTML = "";
    part1QuestionData.forEach((question, index) => {
        let selectedAnswer = question.correctAnswer;
        if (typeof selectedAnswer === 'string') {
            const upper = selectedAnswer.trim().toUpperCase();
            selectedAnswer = ['A', 'B', 'C', 'D'].includes(upper) ? upper.charCodeAt(0) - 65 : parseInt(selectedAnswer, 10) || 0;
        }

        const box = document.createElement("div");
        box.className = "teacher-question";
        box.innerHTML = `
            <div class="question-builder-top">
                <h4>Câu ${index + 1}</h4>
                <button type="button" class="remove-question" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="form-group">
                <label>Nội dung câu hỏi</label>
                <textarea class="part1-question" data-index="${index}" rows="4">${escapeHtmlTeacher(question.question)}</textarea>
                <div class="formula-preview part1-q-preview-${index}"></div>
            </div>
            <div class="question-image-box">
                <label>Hình ảnh câu hỏi</label>
                <input type="file" class="part1-image" data-index="${index}" accept="image/*">
                <div class="image-preview">${question.image ? `<img src="${question.image}" class="question-image-preview">` : `<span>Chưa có hình ảnh</span>`}</div>
            </div>
            <div class="options-builder">
                ${question.options.map((option, optionIndex) => `
                    <div class="option-row-wrapper">
                        <div class="option-row">
                            <input type="radio" name="part1Correct${index}" value="${optionIndex}" ${Number(selectedAnswer) === optionIndex ? "checked" : ""}>
                            <input type="text" class="part1-option" data-index="${index}" data-option="${optionIndex}" value="${escapeHtmlTeacher(option)}" placeholder="Đáp án ${String.fromCharCode(65 + optionIndex)}">
                        </div>
                        <div class="formula-preview part1-opt-preview-${index}-${optionIndex} opt-preview"></div>
                    </div>`).join("")}
            </div>
        `;
        part1Questions.appendChild(box);

        updateFormulaPreview(box.querySelector(`.part1-question`), box.querySelector(`.part1-q-preview-${index}`));
        question.options.forEach((_, optIdx) => {
            updateFormulaPreview(box.querySelector(`.part1-option[data-option="${optIdx}"]`), box.querySelector(`.part1-opt-preview-${index}-${optIdx}`));
        });
    });

    part1Questions.querySelectorAll(".part1-question").forEach((input) => {
        input.addEventListener("input", (e) => {
            part1QuestionData[Number(e.target.dataset.index)].question = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".form-group").querySelector(".formula-preview"));
        });
    });

    part1Questions.querySelectorAll(".part1-option").forEach((input) => {
        input.addEventListener("input", (e) => {
            part1QuestionData[Number(e.target.dataset.index)].options[Number(e.target.dataset.option)] = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".option-row-wrapper").querySelector(".formula-preview"));
        });
    });

    part1Questions.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.addEventListener("change", (e) => {
            const box = e.target.closest(".teacher-question");
            const idx = Number(box.querySelector(".part1-question").dataset.index);
            part1QuestionData[idx].correctAnswer = Number(e.target.value);
        });
    });

    part1Questions.querySelectorAll(".remove-question").forEach((button) => {
        button.addEventListener("click", () => {
            part1QuestionData.splice(Number(button.dataset.index), 1);
            renderPart1Questions();
            updateTestTotal();
        });
    });

    part1Questions.querySelectorAll(".part1-image").forEach((input) => {
        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const url = await uploadTestImage(file);
            if (url) {
                part1QuestionData[Number(e.target.dataset.index)].image = url;
                renderPart1Questions();
            }
        });
    });
}

// --- Phần II ---
if (addPart2QuestionBtn) {
    addPart2QuestionBtn.addEventListener("click", () => {
        part2QuestionData.push({ question: "", image: "", statements: ["", "", "", ""], answers: [true, false, false, false] });
        renderPart2Questions();
        updateTestTotal();
    });
}

function renderPart2Questions() {
    if (!part2Questions) return;
    if (!part2QuestionData.length) {
        part2Questions.innerHTML = `<div class="question-empty">Chưa có câu hỏi nào.</div>`;
        return;
    }

    part2Questions.innerHTML = "";
    part2QuestionData.forEach((question, index) => {
        const box = document.createElement("div");
        box.className = "teacher-question";
        box.innerHTML = `
            <div class="question-builder-top">
                <h4>Câu ${index + 1}</h4>
                <button type="button" class="remove-question" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="form-group">
                <label>Nội dung câu hỏi</label>
                <textarea class="part2-question" data-index="${index}" rows="4">${escapeHtmlTeacher(question.question)}</textarea>
                <div class="formula-preview part2-q-preview-${index}"></div>
            </div>
            <div class="question-image-box">
                <label>Hình ảnh câu hỏi</label>
                <input type="file" class="part2-image" data-index="${index}" accept="image/*">
                <div class="image-preview">${question.image ? `<img src="${question.image}" class="question-image-preview">` : `<span>Chưa có hình ảnh</span>`}</div>
            </div>
            <div class="true-false-builder">
                ${question.statements.map((statement, statementIndex) => `
                    <div class="tf-row-wrapper">
                        <div class="tf-row">
                            <div class="tf-label">${String.fromCharCode(97 + statementIndex)}.</div>
                            <input type="text" class="part2-statement" data-index="${index}" data-statement="${statementIndex}" value="${escapeHtmlTeacher(statement)}">
                            <select class="part2-answer" data-index="${index}" data-statement="${statementIndex}">
                                <option value="true" ${question.answers[statementIndex] === true ? "selected" : ""}>Đúng</option>
                                <option value="false" ${question.answers[statementIndex] === false ? "selected" : ""}>Sai</option>
                            </select>
                        </div>
                        <div class="formula-preview part2-st-preview-${index}-${statementIndex} opt-preview"></div>
                    </div>`).join("")}
            </div>
        `;
        part2Questions.appendChild(box);

        updateFormulaPreview(box.querySelector(`.part2-question`), box.querySelector(`.part2-q-preview-${index}`));
        question.statements.forEach((_, stIdx) => {
            updateFormulaPreview(box.querySelector(`.part2-statement[data-statement="${stIdx}"]`), box.querySelector(`.part2-st-preview-${index}-${stIdx}`));
        });
    });

    part2Questions.querySelectorAll(".part2-question").forEach((input) => {
        input.addEventListener("input", (e) => {
            part2QuestionData[Number(e.target.dataset.index)].question = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".form-group").querySelector(".formula-preview"));
        });
    });

    part2Questions.querySelectorAll(".part2-statement").forEach((input) => {
        input.addEventListener("input", (e) => {
            part2QuestionData[Number(e.target.dataset.index)].statements[Number(e.target.dataset.statement)] = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".tf-row-wrapper").querySelector(".formula-preview"));
        });
    });

    part2Questions.querySelectorAll(".part2-answer").forEach((select) => {
        select.addEventListener("change", (e) => {
            part2QuestionData[Number(e.target.dataset.index)].answers[Number(e.target.dataset.statement)] = e.target.value === "true";
        });
    });

    part2Questions.querySelectorAll(".remove-question").forEach((button) => {
        button.addEventListener("click", () => {
            part2QuestionData.splice(Number(button.dataset.index), 1);
            renderPart2Questions();
            updateTestTotal();
        });
    });

    part2Questions.querySelectorAll(".part2-image").forEach((input) => {
        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const url = await uploadTestImage(file);
            if (url) {
                part2QuestionData[Number(e.target.dataset.index)].image = url;
                renderPart2Questions();
            }
        });
    });
}

// --- Phần III ---
if (addPart3QuestionBtn) {
    addPart3QuestionBtn.addEventListener("click", () => {
        part3QuestionData.push({ question: "", image: "", answer: "" });
        renderPart3Questions();
        updateTestTotal();
    });
}

function renderPart3Questions() {
    if (!part3Questions) return;
    if (!part3QuestionData.length) {
        part3Questions.innerHTML = `<div class="question-empty">Chưa có câu hỏi nào.</div>`;
        return;
    }

    part3Questions.innerHTML = "";
    part3QuestionData.forEach((question, index) => {
        const box = document.createElement("div");
        box.className = "teacher-question";
        box.innerHTML = `
            <div class="question-builder-top">
                <h4>Câu ${index + 1}</h4>
                <button type="button" class="remove-question" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="form-group">
                <label>Nội dung câu hỏi</label>
                <textarea class="part3-question" data-index="${index}" rows="4">${escapeHtmlTeacher(question.question)}</textarea>
                <div class="formula-preview part3-q-preview-${index}"></div>
            </div>
            <div class="question-image-box">
                <label>Hình ảnh câu hỏi</label>
                <input type="file" class="part3-image" data-index="${index}" accept="image/*">
                <div class="image-preview">${question.image ? `<img src="${question.image}" class="question-image-preview">` : `<span>Chưa có hình ảnh</span>`}</div>
            </div>
            <div class="form-group">
                <label>Đáp án đúng</label>
                <input type="text" class="part3-answer" data-index="${index}" value="${escapeHtmlTeacher(question.answer)}">
                <div class="formula-preview part3-ans-preview-${index} opt-preview"></div>
            </div>
        `;
        part3Questions.appendChild(box);

        updateFormulaPreview(box.querySelector(`.part3-question`), box.querySelector(`.part3-q-preview-${index}`));
        updateFormulaPreview(box.querySelector(`.part3-answer`), box.querySelector(`.part3-ans-preview-${index}`));
    });

    part3Questions.querySelectorAll(".part3-question").forEach((input) => {
        input.addEventListener("input", (e) => {
            part3QuestionData[Number(e.target.dataset.index)].question = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".form-group").querySelector(".formula-preview"));
        });
    });

    part3Questions.querySelectorAll(".part3-answer").forEach((input) => {
        input.addEventListener("input", (e) => {
            part3QuestionData[Number(e.target.dataset.index)].answer = e.target.value;
            updateFormulaPreview(e.target, e.target.closest(".form-group").querySelector(".formula-preview"));
        });
    });

    part3Questions.querySelectorAll(".remove-question").forEach((button) => {
        button.addEventListener("click", () => {
            part3QuestionData.splice(Number(button.dataset.index), 1);
            renderPart3Questions();
            updateTestTotal();
        });
    });

    part3Questions.querySelectorAll(".part3-image").forEach((input) => {
        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const url = await uploadTestImage(file);
            if (url) {
                part3QuestionData[Number(e.target.dataset.index)].image = url;
                renderPart3Questions();
            }
        });
    });
}

function updateTestTotal() {
    const totalQuestions = part1QuestionData.length + part2QuestionData.length + part3QuestionData.length;
    const totalPoint = (part1QuestionData.length * Number(part1Point?.value || 0)) +
                       (part2QuestionData.length * Number(part2Score4?.value || 0)) +
                       (part3QuestionData.length * Number(part3Point?.value || 0));

    if (testQuestionTotal) testQuestionTotal.textContent = totalQuestions;
    if (testTotalPoint) testTotalPoint.textContent = totalPoint.toFixed(2).replace(/\.00$/, "");
}

function resetTestBuilder() {
    part1QuestionData = [];
    part2QuestionData = [];
    part3QuestionData = [];
    editingTestId = "";
    editingTestCourseId = "";

    if (testTitle) testTitle.value = "";
    if (testDescription) testDescription.value = "";
    if (testType) testType.value = "15p";
    if (testCourse) testCourse.value = "";

    if (testChapter) {
        testChapter.innerHTML = `<option value="">-- Chọn chương --</option>`;
        testChapter.disabled = true;
    }
    if (testLesson) {
        testLesson.innerHTML = `<option value="">-- Chọn bài học --</option>`;
        testLesson.disabled = true;
    }

    renderPart1Questions();
    renderPart2Questions();
    renderPart3Questions();
    updateTestTotal();
}

[part1Point, part2Score1, part2Score2, part2Score3, part2Score4, part3Point].forEach((input) => {
    if (input) input.addEventListener("input", updateTestTotal);
});

// ====================================
//        UPLOAD CLOUDINARY
// ====================================
const CLOUD_NAME = "xhljajy6";
const UPLOAD_PRESET = "htstudy";

async function uploadTestImage(file) {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "image");

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const data = await response.json();
        if (data.secure_url) return data.secure_url;
        alert("Upload hình ảnh thất bại.");
        return "";
    } catch (error) {
        console.error(error);
        alert("Có lỗi khi upload hình ảnh.");
        return "";
    }
}

if (saveTest) {
    saveTest.addEventListener("click", async () => {
        try {
            const courseId = testCourse.value;
            const chapterId = testChapter.value;
            const lessonId = testLesson.value;
            const title = testTitle.value.trim();
            const description = testDescription.value.trim();
            const duration = Number(testType.value.replace("p", ""));

            if (!courseId) return alert("Vui lòng chọn khóa học.");
            if (!chapterId) return alert("Vui lòng chọn chương.");
            if (!lessonId) return alert("Vui lòng chọn bài học.");
            if (!title) return alert("Vui lòng nhập tên bài kiểm tra.");

            if (!part1QuestionData.length && !part2QuestionData.length && !part3QuestionData.length) {
                return alert("Bài kiểm tra chưa có câu hỏi.");
            }

            const testData = {
                title,
                description,
                type: testType.value,
                duration,
                courseId,
                chapterId,
                lessonId,
                teacherId: currentTeacherId,
                teacherName: currentTeacherName,
                part1: {
                    points: Number(part1Point.value || 0),
                    questions: part1QuestionData.map(q => ({
                        ...q,
                        points: Number(part1Point.value || 0),
                        correctAnswer: String.fromCharCode(65 + Number(q.correctAnswer))
                    }))
                },
                part2: {
                    scores: {
                        one: Number(part2Score1.value || 0),
                        two: Number(part2Score2.value || 0),
                        three: Number(part2Score3.value || 0),
                        four: Number(part2Score4.value || 0)
                    },
                    questions: part2QuestionData
                },
                part3: {
                    points: Number(part3Point.value || 0),
                    questions: part3QuestionData.map(q => ({ ...q, points: Number(part3Point.value || 0) }))
                },
                questionCount: part1QuestionData.length + part2QuestionData.length + part3QuestionData.length,
                totalPoints: (part1QuestionData.length * Number(part1Point.value || 0)) +
                             (part2QuestionData.length * Number(part2Score4.value || 0)) +
                             (part3QuestionData.length * Number(part3Point.value || 0)),
                updatedAt: serverTimestamp()
            };

            if (editingTestId) {
                if (editingTestCourseId === courseId) {
                    await updateDoc(doc(db, "courses", editingTestCourseId, "tests", editingTestId), testData);
                } else {
                    await addDoc(collection(db, "courses", courseId, "tests"), { ...testData, createdAt: serverTimestamp() });
                    await deleteDoc(doc(db, "courses", editingTestCourseId, "tests", editingTestId));
                }
                alert("Đã cập nhật bài kiểm tra.");
            } else {
                await addDoc(collection(db, "courses", courseId, "tests"), { ...testData, createdAt: serverTimestamp() });
                alert("Đã tạo bài kiểm tra thành công.");
            }

            editingTestId = "";
            editingTestCourseId = "";
            if (testModal) testModal.style.display = "none";
            resetTestBuilder();

            if (testCurrentCourseId && testCurrentChapterId && testCurrentLessonId) {
                await loadTestsForLesson();
            }
        } catch (error) {
            console.error(error);
            alert("Không thể lưu bài kiểm tra: " + error.message);
        }
    });
}

// ====================================
//        TẠO HỌC SINH (PENDING STUDENTS)
// ====================================
async function createStudentAccount() {
    const name = studentName.value.trim();
    const email = studentEmail.value.trim().toLowerCase();
    const memberId = studentIdInput.value;

    if (!name || !email) return alert("Vui lòng nhập đầy đủ thông tin.");
    if (!email.includes("@")) return alert("Email không hợp lệ.");

    await addDoc(collection(db, "pendingStudents"), {
        name,
        email,
        memberId,
        teacherId: currentTeacherId,
        teacherName: currentTeacherName,
        status: "pending",
        createdAt: serverTimestamp()
    });

    alert("Đã gửi yêu cầu tạo tài khoản.\nVui lòng chờ Admin phê duyệt.");
    studentName.value = "";
    studentEmail.value = "";
    studentIdInput.value = await generateMemberId();
}

if (createStudentBtn) {
    createStudentBtn.addEventListener("click", createStudentAccount);
}

// ====================================
//        QUẢN LÝ THÔNG BÁO & KHÓA HỌC
// ====================================
async function loadNotificationCourses() {
    if (!notificationCourse) return;
    notificationCourse.innerHTML = `<option value="">-- Chọn khóa học --</option>`;

    const q = query(collection(db, "courses"), where("teacherId", "==", currentTeacherId));
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notificationCourse.innerHTML += `<option value="${docSnap.id}">${data.subjectName || data.subject} ${data.grade} - Khóa ${data.name}</option>`;
    });
}

if (notificationType) notificationType.addEventListener("change", loadContentList);
if (notificationCourse) notificationCourse.addEventListener("change", loadContentList);

async function loadContentList() {
    if (!notificationContentLink || !notificationCourse) return;
    notificationContentLink.innerHTML = "";

    const courseId = notificationCourse.value;
    if (!courseId) {
        notificationContentLink.innerHTML = `<option value="">Chọn khóa học trước</option>`;
        return;
    }

    if (notificationType.value === "general") {
        notificationContentLink.innerHTML = `<option value="">Không cần chọn</option>`;
        notificationContentLink.disabled = true;
        return;
    }

    notificationContentLink.disabled = false;
    const collectionName = notificationType.value === "test" ? "tests" : "lessons";
    const snapshot = await getDocs(collection(db, "courses", courseId, collectionName));

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notificationContentLink.innerHTML += `<option value="${docSnap.id}">${data.title}</option>`;
    });
}

if (createNotificationBtn) {
    createNotificationBtn.addEventListener("click", async () => {
        try {
            const type = notificationType.value;
            const courseId = notificationCourse.value;
            const courseName = notificationCourse.options[notificationCourse.selectedIndex].text;
            const title = notificationTitle.value.trim();
            const content = notificationContent.value.trim();
            const contentId = notificationContentLink.value;

            if (!courseId) return alert("Vui lòng chọn khóa học.");
            if (!title) return alert("Nhập tiêu đề.");
            if (!content) return alert("Nhập nội dung.");

            await addDoc(collection(db, "notifications"), {
                type,
                courseId,
                courseName,
                title,
                content,
                contentId,
                active: true,
                read: false,
                createdAt: serverTimestamp()
            });

            alert("Đã gửi thông báo.");
            notificationTitle.value = "";
            notificationContent.value = "";
            await loadNotifications();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
}

async function loadNotifications() {
    if (!notificationList) return;
    notificationList.innerHTML = "Đang tải...";

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    notificationList.innerHTML = "";

    snapshot.forEach((docItem) => {
        const data = docItem.data();
        notificationList.innerHTML += `
            <div class="course-item">
                <h3>${escapeHtmlTeacher(data.title)}</h3>
                <p><b>${escapeHtmlTeacher(data.courseName)}</b></p>
                <p>${escapeHtmlTeacher(data.content)}</p>
                <button onclick="deleteNotification('${docItem.id}')">Xóa</button>
            </div>
        `;
    });
}

window.deleteNotification = async function (id) {
    if (!confirm("Xóa thông báo này?")) return;
    await deleteDoc(doc(db, "notifications", id));
    await loadNotifications();
};

async function loadMyCourses() {
    if (!teacherCourseList) return;
    teacherCourseList.innerHTML = "Đang tải...";

    const q = query(collection(db, "courses"), where("teacherId", "==", currentTeacherId));
    const snapshot = await getDocs(q);
    teacherCourseList.innerHTML = "";

    if (snapshot.empty) {
        teacherCourseList.innerHTML = `<div class="empty">Bạn chưa được phân công khóa học nào.</div>`;
        return;
    }

    snapshot.forEach((courseDoc) => {
        const course = courseDoc.data();
        teacherCourseList.innerHTML += `
            <div class="course-item">
                <h3>${escapeHtmlTeacher(course.name)}</h3>
                <p>📚 ${escapeHtmlTeacher(course.subject)}</p>
                <p>🎓 Lớp ${escapeHtmlTeacher(course.grade)}</p>
                <button onclick="openCourse('${courseDoc.id}')">Quản lý khóa học</button>
            </div>
        `;
    });
}

window.openCourse = async function (courseId) {
    currentCourseId = courseId;
    const snap = await getDoc(doc(db, "courses", courseId));
    if (!snap.exists()) return alert("Không tìm thấy khóa học.");

    const data = snap.data();
    hideAllPages();
    if (courseManagePage) courseManagePage.style.display = "block";
    if (manageCourseTitle) {
        manageCourseTitle.textContent = `${data.subjectName || data.subject} ${data.grade} - ${data.name}`;
    }
    await loadChapters();
};

window.openChapter = async function (chapterId, title) {
    currentChapterId = chapterId;
    hideAllPages();
    if (lessonPage) lessonPage.style.display = "block";
    if (lessonPageTitle) lessonPageTitle.textContent = "Bài học - " + title;
    await loadLessons();
};

if (backToChapterBtn) {
    backToChapterBtn.addEventListener("click", async () => {
        hideAllPages();
        if (courseManagePage) courseManagePage.style.display = "block";
        await loadChapters();
    });
}

if (createLessonBtn) {
    createLessonBtn.addEventListener("click", () => {
        editingLessonId = "";
        if (lessonTitle) lessonTitle.value = "";
        if (lessonDescription) lessonDescription.value = "";
        if (lessonOrder) lessonOrder.value = "";
        if (lessonModal) lessonModal.style.display = "flex";
    });
}

if (cancelLesson) {
    cancelLesson.addEventListener("click", () => {
        if (lessonModal) lessonModal.style.display = "none";
    });
}

if (saveLesson) {
    saveLesson.addEventListener("click", async () => {
        const title = lessonTitle.value.trim();
        const description = lessonDescription.value.trim();
        const order = Number(lessonOrder.value);

        if (!title) return alert("Nhập tên bài học.");
        if (order <= 0) return alert("Thứ tự không hợp lệ.");

        if (editingLessonId) {
            const lessonRef = doc(db, "courses", currentCourseId, "chapters", currentChapterId, "lessons", editingLessonId);
            const snap = await getDoc(lessonRef);
            const oldData = snap.data();

            if (pdfFile.files.length) await uploadPdf();
            if (videoFile.files.length) await uploadVideo();

            await updateDoc(lessonRef, {
                title,
                description,
                order,
                video: uploadedVideoLink || oldData.video || "",
                pdf: uploadedPdfLink || oldData.pdf || ""
            });
        } else {
            const lessonId = "lesson_" + Date.now();
            if (videoFile.files.length) await uploadVideo();
            if (!uploadedVideoLink) return alert("Chưa upload video.");

            if (pdfFile.files.length) await uploadPdf();
            if (!uploadedPdfLink) return alert("Chưa có file PDF.");

            await setDoc(doc(db, "courses", currentCourseId, "chapters", currentChapterId, "lessons", lessonId), {
                title,
                description,
                order,
                video: uploadedVideoLink,
                pdf: uploadedPdfLink,
                createdAt: serverTimestamp()
            });
        }

        editingLessonId = "";
        lessonTitle.value = "";
        lessonDescription.value = "";
        lessonOrder.value = "";
        videoResult.textContent = "";
        uploadedVideoLink = "";
        videoFile.value = "";
        pdfFile.value = "";
        pdfResult.textContent = "";
        uploadedPdfLink = "";

        lessonModal.style.display = "none";
        await loadLessons();
    });
}

async function loadLessons() {
    if (!lessonList) return;
    lessonList.innerHTML = "Đang tải...";

    const q = query(collection(db, "courses", currentCourseId, "chapters", currentChapterId, "lessons"), orderBy("order"));
    const snapshot = await getDocs(q);
    lessonList.innerHTML = "";

    if (snapshot.empty) {
        lessonList.innerHTML = `<p class="empty">Chưa có bài học nào.</p>`;
        return;
    }

    snapshot.forEach((lesson) => {
        const data = lesson.data();
        lessonList.innerHTML += `
            <div class="chapter-card">
                <h3>${data.order}. ${escapeHtmlTeacher(data.title)}</h3>
                <p>${escapeHtmlTeacher(data.description || "")}</p>
                <div class="chapter-actions">
                    <button class="chapter-edit" onclick="editLesson('${lesson.id}')">Sửa</button>
                    <button class="chapter-delete" onclick="deleteLesson('${lesson.id}')">Xóa</button>
                </div>
            </div>
        `;
    });
}

window.deleteLesson = async function (lessonId) {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    await deleteDoc(doc(db, "courses", currentCourseId, "chapters", currentChapterId, "lessons", lessonId));
    await loadLessons();
};

window.editChapter = async function (chapterId) {
    editingChapterId = chapterId;
    const snap = await getDoc(doc(db, "courses", currentCourseId, "chapters", chapterId));
    if (!snap.exists()) return alert("Không tìm thấy chương.");

    const data = snap.data();
    chapterTitle.value = data.title;
    chapterDescription.value = data.description || "";
    chapterOrder.value = data.order || 1;
    chapterModal.style.display = "flex";
};

window.deleteChapter = async function (chapterId) {
    if (!confirm("Bạn có chắc muốn xóa chương này?")) return;

    const lessonSnapshot = await getDocs(collection(db, "courses", currentCourseId, "chapters", chapterId, "lessons"));
    if (!lessonSnapshot.empty) {
        alert("Chương vẫn còn bài học.\nHãy xóa hết bài học trước.");
        return;
    }

    await deleteDoc(doc(db, "courses", currentCourseId, "chapters", chapterId));
    await loadChapters();
};

window.editLesson = async function (lessonId) {
    editingLessonId = lessonId;
    const snap = await getDoc(doc(db, "courses", currentCourseId, "chapters", currentChapterId, "lessons", lessonId));
    if (!snap.exists()) return alert("Không tìm thấy bài học.");

    const data = snap.data();
    lessonTitle.value = data.title;
    lessonDescription.value = data.description || "";
    lessonOrder.value = data.order;
    lessonModal.style.display = "flex";

    uploadedVideoLink = data.video || "";
    uploadedPdfLink = data.pdf || "";

    videoResult.innerHTML = data.video ? `<a href="${data.video}" target="_blank">🎥 Video hiện tại</a>` : "";
    pdfResult.innerHTML = data.pdf ? `<a href="${data.pdf}" target="_blank">📄 PDF hiện tại</a>` : "";
};

if (backToCoursesBtn) {
    backToCoursesBtn.addEventListener("click", async () => {
        hideAllPages();
        if (coursePage) coursePage.style.display = "block";
        await loadMyCourses();
    });
}

if (createChapterBtn) {
    createChapterBtn.addEventListener("click", () => {
        editingChapterId = "";
        chapterTitle.value = "";
        chapterDescription.value = "";
        chapterOrder.value = "";
        chapterModal.style.display = "flex";
    });
}

if (cancelChapter) {
    cancelChapter.addEventListener("click", () => {
        chapterModal.style.display = "none";
    });
}

if (saveChapter) {
    saveChapter.addEventListener("click", async () => {
        const title = chapterTitle.value.trim();
        const description = chapterDescription.value.trim();
        const order = Number(chapterOrder.value);

        if (!title) return alert("Nhập tên chương.");
        if (order <= 0) return alert("Thứ tự chương không hợp lệ.");

        if (editingChapterId) {
            await updateDoc(doc(db, "courses", currentCourseId, "chapters", editingChapterId), { title, description, order });
        } else {
            const id = "chapter_" + Date.now();
            await setDoc(doc(db, "courses", currentCourseId, "chapters", id), {
                title,
                description,
                order,
                createdAt: serverTimestamp()
            });
        }

        chapterTitle.value = "";
        chapterDescription.value = "";
        chapterOrder.value = "";
        editingChapterId = "";
        chapterModal.style.display = "none";
        await loadChapters();
    });
}

async function loadChapters() {
    if (!chapterList) return;
    chapterList.innerHTML = "Đang tải...";

    const q = query(collection(db, "courses", currentCourseId, "chapters"), orderBy("order"));
    const snapshot = await getDocs(q);
    chapterList.innerHTML = "";

    if (snapshot.empty) {
        chapterList.innerHTML = `<p class="empty">Chưa có chương nào.</p>`;
        return;
    }

    snapshot.forEach((chapter) => {
        const data = chapter.data();
        chapterList.innerHTML += `
            <div class="chapter-card">
                <h3>${escapeHtmlTeacher(data.title)}</h3>
                <p>${escapeHtmlTeacher(data.description)}</p>
                <div class="chapter-actions">
                    <button class="chapter-edit" onclick="openChapter('${chapter.id}','${escapeHtmlTeacher(data.title)}')">Quản lý bài học</button>
                    <button class="chapter-edit" onclick="editChapter('${chapter.id}')">Sửa</button>
                    <button class="chapter-delete" onclick="deleteChapter('${chapter.id}')">Xóa</button>
                </div>
            </div>
        `;
    });
}

// ====================================
//        ĐĂNG XUẤT (LOGOUT)
// ====================================
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "../index.html";
    });
}

// ====================================
//        CLOUDINARY FILE UPLOADS
// ====================================
if (changePdfBtn) {
    changePdfBtn.addEventListener("click", () => pdfFile.click());
}

if (pdfFile) {
    pdfFile.addEventListener("change", () => {
        if (!pdfFile.files.length) return;
        const file = pdfFile.files[0];
        pdfResult.innerHTML = `
            <div class="file-preview">
                📄 <b>${file.name}</b><br>
                Dung lượng ${(file.size / (1024 * 1024)).toFixed(2)} MB<br>
                <span style="color:#ff9800">● Sẽ upload khi bấm Lưu</span>
            </div>
        `;
    });
}

if (uploadVideoBtn) {
    uploadVideoBtn.addEventListener("click", () => videoFile.click());
}

if (videoFile) {
    videoFile.addEventListener("change", () => {
        if (!videoFile.files.length) return;
        const file = videoFile.files[0];
        videoResult.innerHTML = `
            <div class="file-preview">
                🎥 <b>${file.name}</b><br>
                Dung lượng ${(file.size / (1024 * 1024)).toFixed(2)} MB<br>
                <span style="color:#ff9800">● Sẽ upload khi bấm Lưu</span>
            </div>
        `;
    });
}

async function uploadPdf() {
    const file = pdfFile.files[0];
    if (!file) return alert("Vui lòng chọn file PDF.");

    pdfResult.textContent = "Đang upload...";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "raw");

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, { method: "POST", body: formData });
        const data = await response.json();
        if (data.secure_url) {
            uploadedPdfLink = data.secure_url;
            pdfResult.innerHTML = `✅ Upload thành công<br><br><a href="${uploadedPdfLink}" target="_blank">📄 Xem PDF</a>`;
        } else {
            alert("Upload thất bại.");
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi khi upload.");
    }
}

async function uploadVideo() {
    const file = videoFile.files[0];
    if (!file) return alert("Vui lòng chọn video.");

    videoResult.textContent = "Đang upload...";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "video");

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: "POST", body: formData });
        const data = await response.json();
        if (data.secure_url) {
            uploadedVideoLink = data.secure_url;
            videoResult.innerHTML = `✅ Upload thành công<br><br><a href="${uploadedVideoLink}" target="_blank">🎥 Xem video</a>`;
        } else {
            alert("Upload video thất bại.");
        }
    } catch (err) {
        console.error(err);
        alert("Có lỗi upload video.");
    }
}

// ====================================
//        QUẢN LÝ KẾT QUẢ KIỂM TRA HỌC SINH
// ====================================
const studentTestResultModal = document.getElementById("studentTestResultModal");
const studentTestResultBody = document.getElementById("studentTestResultBody");
const closeStudentTestResultBtn = document.getElementById("closeStudentTestResultBtn");
const backTestResultBtn = document.getElementById("backTestResultBtn");

const studentSingleResultDetailModal = document.getElementById("studentSingleResultDetailModal");
const singleResultDetailBody = document.getElementById("singleResultDetailBody");
const closeSingleResultModal = document.getElementById("closeSingleResultModal");

async function openStudentTestChapters(courseId) {
    if (!studentTestResultModal || !studentTestResultBody) return;
    testResultNavStep = 1;
    if (backTestResultBtn) backTestResultBtn.style.display = "none";
    if (studentTestResultModal) studentTestResultModal.style.display = "flex";
    if (studentTestResultBody) studentTestResultBody.innerHTML = `<div class="empty">Đang tải danh sách chương...</div>`;

    try {
        const snapshot = await getDocs(collection(db, "courses", courseId, "chapters"));
        const chapters = [];
        snapshot.forEach((docSnap) => chapters.push({ id: docSnap.id, ...docSnap.data() }));
        chapters.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        if (!chapters.length) {
            studentTestResultBody.innerHTML = `<div class="empty">Khóa học này chưa có chương nào.</div>`;
            return;
        }

        let html = `<h4 style="margin-bottom: 12px;">Học sinh: ${escapeHtmlTeacher(currentSelectedStudent.name)}</h4>`;
        html += `<p style="margin-bottom: 15px; color: #666;">Chọn chương để tiếp tục:</p>`;
        chapters.forEach(ch => {
            html += `
                <div class="chapter-card select-chapter-item" data-id="${ch.id}" data-title="${escapeHtmlTeacher(ch.title)}" style="cursor: pointer; padding: 12px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px;">
                    <strong>Chương ${ch.order || ""}: ${escapeHtmlTeacher(ch.title)}</strong>
                </div>
            `;
        });
        studentTestResultBody.innerHTML = html;

        studentTestResultBody.querySelectorAll(".select-chapter-item").forEach(item => {
            item.addEventListener("click", () => {
                selectedChapterForTest = { id: item.dataset.id, title: item.dataset.title };
                openStudentTestLessons(courseId, selectedChapterForTest.id);
            });
        });
    } catch (error) {
        console.error(error);
        studentTestResultBody.innerHTML = `<div class="empty">Lỗi tải dữ liệu chương.</div>`;
    }
}

async function openStudentTestLessons(courseId, chapterId) {
    testResultNavStep = 2;
    if (backTestResultBtn) backTestResultBtn.style.display = "block";
    studentTestResultBody.innerHTML = `<div class="empty">Đang tải danh sách bài học...</div>`;

    try {
        const snapshot = await getDocs(collection(db, "courses", courseId, "chapters", chapterId, "lessons"));
        let lessons = [];
        snapshot.forEach(docSnap => lessons.push({ id: docSnap.id, ...docSnap.data() }));
        lessons.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        if (!lessons.length) {
            studentTestResultBody.innerHTML = `<div class="empty">Chương này chưa có bài học nào.</div>`;
            return;
        }

        let html = `<h4 style="margin-bottom: 12px;">Chương: ${selectedChapterForTest.title}</h4>`;
        html += `<p style="margin-bottom: 15px; color: #666;">Chọn bài học:</p>`;
        lessons.forEach(ls => {
            html += `
                <div class="chapter-card select-lesson-item" data-id="${ls.id}" data-title="${escapeHtmlTeacher(ls.title)}" style="cursor: pointer; padding: 12px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px;">
                    <strong>Bài ${ls.order || ""}: ${escapeHtmlTeacher(ls.title)}</strong>
                </div>
            `;
        });
        studentTestResultBody.innerHTML = html;

        studentTestResultBody.querySelectorAll(".select-lesson-item").forEach(item => {
            item.addEventListener("click", () => {
                selectedLessonForTest = { id: item.dataset.id, title: item.dataset.title };
                openStudentTestsList(courseId, chapterId, selectedLessonForTest.id);
            });
        });
    } catch (error) {
        console.error(error);
        studentTestResultBody.innerHTML = `<div class="empty">Lỗi tải dữ liệu bài học.</div>`;
    }
}

async function openStudentTestsList(courseId, chapterId, lessonId) {
    testResultNavStep = 3;
    studentTestResultBody.innerHTML = `<div class="empty">Đang tải bài kiểm tra...</div>`;

    try {
        const q = query(
            collection(db, "courses", courseId, "tests"),
            where("chapterId", "==", chapterId),
            where("lessonId", "==", lessonId)
        );
        const snapshot = await getDocs(q);
        let tests = [];
        snapshot.forEach(docSnap => {
            tests.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (!tests.length) {
            studentTestResultBody.innerHTML = `<div class="empty">Bài học này chưa có bài kiểm tra nào.</div>`;
            return;
        }

        let html = `<h4 style="margin-bottom: 12px;">Bài: ${selectedLessonForTest.title}</h4>`;
        html += `<p style="margin-bottom: 15px; color: #666;">Chọn bài kiểm tra để xem kết quả:</p>`;
        tests.forEach(t => {
            html += `
                <div class="chapter-card select-test-item" data-id="${t.id}" data-title="${escapeHtmlTeacher(t.title)}" style="cursor: pointer; padding: 12px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px;">
                    <strong><i class="fa-solid fa-file-circle-check"></i> ${escapeHtmlTeacher(t.title)}</strong>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #555;">Thời gian: ${t.duration || 15} phút | Tổng điểm: ${t.totalPoints || 0}</p>
                </div>
            `;
        });
        studentTestResultBody.innerHTML = html;

        studentTestResultBody.querySelectorAll(".select-test-item").forEach(item => {
            item.addEventListener("click", () => {
                selectedTestObj = { id: item.dataset.id, title: item.dataset.title };
                openStudentSubmissionsList(courseId, selectedTestObj.id, currentSelectedStudent.id);
            });
        });
    } catch (error) {
        console.error(error);
        studentTestResultBody.innerHTML = `<div class="empty">Lỗi tải danh sách bài kiểm tra.</div>`;
    }
}
async function openStudentSubmissionsList(courseId, testId, userId) {
    testResultNavStep = 4;
    studentTestResultBody.innerHTML = `<div class="empty">Đang tải kết quả làm bài...</div>`;

    try {
        // Lấy thông tin đề thi để chuẩn hóa số câu hỏi
        const testRef = doc(db, "courses", courseId, "tests", testId);
        const testSnap = await getDoc(testRef);
        const testData = testSnap.exists() ? { id: testSnap.id, ...testSnap.data() } : {};
        const questions = extractQuestions(testData);

        // Truy vấn kết quả (hỗ trợ tìm theo collection results hoặc subcollection tùy thiết kế)
        const resultsRef = collection(db, "results");
        const qResults = query(resultsRef, where("courseId", "==", courseId), where("testId", "==", testId), where("userId", "==", userId));
        const resultsSnap = await getDocs(qResults);

        let submissions = [];
        resultsSnap.forEach(docSnap => {
            submissions.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (!submissions.length) {
            studentTestResultBody.innerHTML = `
                <h4 style="margin-bottom: 12px;">Bài kiểm tra: ${selectedTestObj.title}</h4>
                <div class="empty">Học sinh này chưa làm bài kiểm tra này lần nào.</div>`;
            return;
        }

        let html = `<h4 style="margin-bottom: 12px;">Kết quả bài kiểm tra: ${selectedTestObj.title}</h4>`;
        html += `<p style="margin-bottom: 15px; color: #666;">Danh sách các lần làm bài:</p>`;
        
        submissions.forEach((sub, idx) => {
            const score = sub.score !== undefined ? sub.score : (sub.totalScore || 0);
            const isAllowedView = sub.allowStudentView === true;
            const timeStr = sub.submittedAt?.toDate ? sub.submittedAt.toDate().toLocaleString('vi-VN') : "Vừa xong";

            html += `
                <div style="padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; background: #f9f9f9;">
                    <div>
                        <strong>Lần làm #${idx + 1}</strong> - Điểm: <span style="color: #d9534f; font-weight: bold;">${score} điểm</span>
                        <br><small style="color: #666;"><i class="fa-regular fa-clock"></i> Nộp lúc: ${timeStr}</small>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="primary-btn view-sub-detail" data-sub-id="${sub.id}" style="padding: 6px 12px; font-size: 0.85rem;"><i class="fa-solid fa-eye"></i> Xem chi tiết</button>
                    </div>
                </div>
            `;
        });
        
        studentTestResultBody.innerHTML = html;

        studentTestResultBody.querySelectorAll(".view-sub-detail").forEach(btn => {
            btn.addEventListener("click", () => {
                const subData = submissions.find(s => s.id === btn.dataset.subId);
                showSingleSubmissionDetail(subData);
            });
        });

    } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
        studentTestResultBody.innerHTML = `<div class="empty">Không thể tải kết quả.</div>`;
    }
}
// ==========================================================
// HÀM QUAN TRỌNG: HIỂN THỊ ĐẦY ĐỦ CÂU HỎI VÀ ĐÁP ÁN KHI ẤN XEM CHI TIẾT
// ==========================================================
async function openSingleResultDetailModal(resultId) {
    if (!studentSingleResultDetailModal || !singleResultDetailBody) return;
    singleResultDetailBody.innerHTML = `<div class="empty">Đang tải chi tiết bài làm...</div>`;
    studentSingleResultDetailModal.style.display = "flex";

    try {
        const resDoc = await getDoc(doc(db, "examResults", resultId));
        if (!resDoc.exists()) {
            singleResultDetailBody.innerHTML = `<div class="empty">Không tìm thấy dữ liệu bài làm.</div>`;
            return;
        }
        const resData = resDoc.data();
        
        // Lấy thông tin chi tiết bài kiểm tra gốc để có danh sách câu hỏi chuẩn
        const testDoc = await getDoc(doc(db, "courses", resData.courseId, "tests", resData.testId));
        if (!testDoc.exists()) {
            singleResultDetailBody.innerHTML = `<div class="empty">Không tìm thấy thông tin bài kiểm tra gốc.</div>`;
            return;
        }
        const testData = testDoc.data();
        const questions = extractQuestions(testData); // Trích xuất tất cả câu hỏi Phần I, II, III
        const studentAnswers = resData.answers || {}; // Đáp án học sinh đã chọn theo từng câu/index

        let html = `
            <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0;">${escapeHtmlTeacher(testData.title)}</h3>
                <p style="margin: 0; color: #555;">Học sinh: <b>${escapeHtmlTeacher(resData.studentName || currentSelectedStudent?.name || "")}</b></p>
                <p style="margin: 4px 0 0 0;">Điểm số: <b style="color: #28a745; font-size: 1.1rem;">${resData.score ?? 0}</b> / ${testData.totalPoints ?? 0}</p>
            </div>
            <div class="detailed-questions-list" style="display: flex; flexDirection: column; gap: 15px;">
        `;

        questions.forEach((q, idx) => {
            const qKey = `q_${idx}`;
            const studentAns = studentAnswers[qKey] !== undefined ? studentAnswers[qKey] : studentAnswers[idx];
            
            html += `<div style="background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #e0e0e0;">`;
            html += `<p style="font-weight: bold; margin-top: 0;">Câu ${idx + 1} (Phần ${q.part}): ${formatChemistryText(q.question || "")}</p>`;
            
            if (q.image) {
                html += `<div style="margin: 8px 0;"><img src="${q.image}" style="max-width: 100%; max-height: 200px; border-radius: 4px;"></div>`;
            }

            // Hiển thị chi tiết tùy theo từng phần câu hỏi
            if (q.part === 1) {
                const options = q.options || [];
                html += `<div style="margin-left: 10px; display: flex; flex-direction: column; gap: 4px;">`;
                options.forEach((opt, optIdx) => {
                    const optLetter = String.fromCharCode(65 + optIdx);
                    let isStudentChoice = (String(studentAns).toUpperCase() === optLetter) || (Number(studentAns) === optIdx);
                    let isCorrect = (String(q.correctAnswer).toUpperCase() === optLetter) || (Number(q.correctAnswer) === optIdx);

                    let style = "padding: 4px 8px; border-radius: 4px;";
                    if (isCorrect) style += " background-color: #d4edda; color: #155724; font-weight: bold;";
                    if (isStudentChoice && !isCorrect) style += " background-color: #f8d7da; color: #721c24; text-decoration: line-through;";

                    html += `<div style="${style}">${optLetter}. ${formatChemistryText(opt)} ${isStudentChoice ? ' 👈 (Học sinh chọn)' : ''} ${isCorrect ? ' ✔ (Đáp án đúng)' : ''}</div>`;
                });
                html += `</div>`;
            } else if (q.part === 2) {
                const statements = q.statements || [];
                const correctAnsArr = q.answers || [];
                const studentAnsArr = Array.isArray(studentAns) ? studentAns : [];

                html += `<div style="margin-left: 10px; display: flex; flexDirection: column; gap: 4px;">`;
                statements.forEach((st, stIdx) => {
                    const stLetter = String.fromCharCode(97 + stIdx);
                    const sAns = studentAnsArr[stIdx];
                    const cAns = correctAnsArr[stIdx];
                    const isMatch = sAns === cAns;

                    html += `
                        <div style="padding: 4px 8px; border-radius: 4px; background: ${isMatch ? '#e2f0d9' : '#fce4d6'};">
                            <b>${stLetter})</b> ${formatChemistryText(st)} <br>
                            <span style="font-size: 0.85rem; color: #555;">
                                Học sinh chọn: <b>${sAns === true ? 'Đúng' : sAns === false ? 'Sai' : 'Chưa chọn'}</b> | 
                                Đáp án đúng: <b>${cAns === true ? 'Đúng' : 'Sai'}</b>
                            </span>
                        </div>
                    `;
                });
                html += `</div>`;
            } else if (q.part === 3) {
                html += `
                    <div style="margin-left: 10px; font-size: 0.95rem;">
                        <p style="margin: 4px 0;">Học sinh trả lời: <b>${escapeHtmlTeacher(String(studentAns || "(Trống)"))}</b></p>
                        <p style="margin: 4px 0; color: #28a745;">Đáp án chuẩn: <b>${escapeHtmlTeacher(String(q.answer || ""))}</b></p>
                    </div>
                `;
            }

            html += `</div>`;
        });

        html += `</div>`;
        singleResultDetailBody.innerHTML = html;
    } catch (error) {
        console.error("Lỗi khi tải chi tiết bài làm:", error);
        singleResultDetailBody.innerHTML = `<div class="empty">Không thể tải nội dung chi tiết bài làm.</div>`;
    }
}

if (backTestResultBtn) {
    backTestResultBtn.addEventListener("click", () => {
        if (testResultNavStep === 4) {
            testResultNavStep = 3;
            if (selectedChapterForTest && selectedLessonForTest) {
                openStudentTestLessons(currentStudentCourseId, selectedChapterForTest.id);
            }
        } else if (testResultNavStep === 3) {
            testResultNavStep = 2;
            openStudentTestChapters(currentStudentCourseId);
            backTestResultBtn.style.display = "none";
        } else if (testResultNavStep === 2) {
            testResultNavStep = 1;
            openStudentTestChapters(currentStudentCourseId);
            backTestResultBtn.style.display = "none";
        }
    });
}

if (closeStudentTestResultBtn) {
    closeStudentTestResultBtn.addEventListener("click", () => {
        if (studentTestResultModal) studentTestResultModal.style.display = "none";
    });
}
function showSingleSubmissionDetail(subData) {
    if (!studentSingleResultDetailModal || !singleResultDetailBody) return;
    
    const timeStr = subData.submittedAt?.toDate ? subData.submittedAt.toDate().toLocaleString('vi-VN') : "N/A";
    const answersObj = subData.answers || {};
    
    // Lấy danh sách câu hỏi từ bài kiểm tra hiện tại nếu có, để hiển thị nội dung trực quan hơn
    let answersHtml = `<div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">`;
    
    // Duyệt qua danh sách câu trả lời của học sinh
    let index = 1;
    for (const [qKey, ans] of Object.entries(answersObj)) {
        let displayAns = ans;
        
        // Nếu là Phần II (mảng đúng sai), chuyển đổi thành dạng dễ đọc a, b, c, d
        if (Array.isArray(ans)) {
            displayAns = ans.map((val, idx) => `Ý ${String.fromCharCode(97 + idx)}: <b>${val ? "Đúng" : "Sai"}</b>`).join(" | ");
        }

        answersHtml += `
            <div style="padding: 10px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fff;">
                <p style="margin: 0 0 4px 0; font-weight: bold; color: #333;">Câu ${index++} (ID: ${qKey})</p>
                <p style="margin: 0; color: #555;">Học sinh chọn: <span style="color: #007bff; font-weight: bold;">${Array.isArray(ans) ? displayAns : escapeHtmlTeacher(String(ans))}</span></p>
            </div>
        `;
    }
    answersHtml += `</div>`;

    singleResultDetailBody.innerHTML = `
        <div style="text-align: left;">
            <p><strong>Tổng điểm:</strong> <span style="color: #d9534f; font-weight: bold; font-size: 1.1rem;">${subData.score || subData.totalScore || 0} điểm</span></p>
            <p><strong>Thời gian nộp:</strong> ${timeStr}</p>
            <hr style="margin: 12px 0;">
            <p style="font-weight: bold; margin-bottom: 8px;">Chi tiết đáp án học sinh đã làm:</p>
            ${answersHtml}
        </div>
    `;
    studentSingleResultDetailModal.style.display = "flex";
}
if (closeSingleResultModal) {
    closeSingleResultModal.addEventListener("click", () => {
        if (studentSingleResultDetailModal) studentSingleResultDetailModal.style.display = "none";
    });
}
