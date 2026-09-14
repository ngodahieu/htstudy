import { db } from "./firebase.js";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");

const courseTitle = document.getElementById("courseTitle");
const courseDescription = document.getElementById("courseDescription");
const chapterMenu = document.getElementById("chapterMenu");
const lessonTitle = document.getElementById("lessonTitle");
const lessonDescription = document.getElementById("lessonDescription");
const lessonContent = document.getElementById("lessonContent");
const tabButtons = document.querySelectorAll(".tab-btn");
const subTabButtons = document.querySelectorAll(".sub-tab-btn");
const pdfSubMenu = document.getElementById("pdfSubMenu");

let currentLesson = null;
let currentTab = "video";

async function loadCourse() {
    const snap = await getDoc(doc(db, "courses", courseId));
    if (!snap.exists()) {
        courseTitle.textContent = "Không tìm thấy khóa học.";
        return;
    }
    const course = snap.data();
    courseTitle.textContent = course.name;
    courseDescription.textContent = course.description || "";
    await loadChapters();
}

async function loadChapters() {
    chapterMenu.innerHTML = "";
    const chapterQuery = query(
        collection(db, "courses", courseId, "chapters"),
        orderBy("order")
    );
    const chapterSnapshot = await getDocs(chapterQuery);

    for (const chapterDoc of chapterSnapshot.docs) {
        const chapter = chapterDoc.data();
        chapterMenu.innerHTML += `
        <div class="chapter-folder" id="folder-${chapterDoc.id}">
            <div class="folder-title" onclick="toggleChapter('${chapterDoc.id}')">
                <div class="folder-title-left">
                    <i class="fa-solid fa-folder-open"></i>
                    <span>${chapter.title}</span>
                </div>
                <i class="fa-solid fa-chevron-down toggle-arrow"></i>
            </div>
            <div id="chapter-${chapterDoc.id}" class="lesson-list">
            </div>
        </div>
        `;
        await loadLessons(chapterDoc.id);
    }
}

async function loadLessons(chapterId) {
    const lessonBox = document.getElementById(`chapter-${chapterId}`);
    const lessonQuery = query(
        collection(db, "courses", courseId, "chapters", chapterId, "lessons"),
        orderBy("order")
    );
    const lessonSnapshot = await getDocs(lessonQuery);

    lessonBox.innerHTML = "";
    let firstLesson = null;

    lessonSnapshot.forEach((lessonDoc) => {
        const lesson = lessonDoc.data();
        lesson.id = lessonDoc.id;
        if (firstLesson === null) {
            firstLesson = lesson;
        }

        lessonBox.innerHTML += `
        <div
            class="lesson-menu-item ${currentLesson === null && firstLesson === lesson ? "active" : ""}"
            data-lesson='${JSON.stringify(lesson)}'
        >
            <i class="fa-regular fa-file-video"></i>
            ${lesson.order}. ${lesson.title}
        </div>
        `;
    });

    if (currentLesson === null && firstLesson) {
        currentLesson = firstLesson;
        showLesson(firstLesson);
    }
}

function showLesson(lesson) {
    currentLesson = lesson;
    lessonTitle.textContent = lesson.title;
    lessonDescription.textContent = lesson.description || "";

    if (currentTab === "video") {
        let videoUrl = "";
        if (lesson.video) {
            if (lesson.video.includes("youtu.be/")) {
                const id = lesson.video.split("youtu.be/")[1];
                videoUrl = `https://www.youtube.com/embed/${id}`;
            } else if (lesson.video.includes("watch?v=")) {
                videoUrl = lesson.video.replace("watch?v=", "embed/");
            } else {
                videoUrl = lesson.video;
            }
        }
        lessonContent.innerHTML = `
        <iframe
            src="${videoUrl}"
            width="100%"
            height="600"
            frameborder="0"
            allowfullscreen>
        </iframe>`;
    } else {
        // Xử lý hiển thị tương ứng cho 3 mục PDF con
        let pdfUrl = "";
        if (currentTab === "pdf-lythuyet") pdfUrl = lesson.pdfLyThuyet || lesson.pdf || "";
        if (currentTab === "pdf-baitap") pdfUrl = lesson.pdfBaiTap || "";
        if (currentTab === "pdf-btvn") pdfUrl = lesson.pdfBtvn || "";

        if (pdfUrl) {
            lessonContent.innerHTML = `
            <iframe
                src="${pdfUrl}"
                width="100%"
                height="700">
            </iframe>`;
        } else {
            lessonContent.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #9fb6d8; font-size: 1.1rem;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 10px; color: #3acfff;"></i>
                <p>Chưa có tài liệu cho phần này.</p>
            </div>`;
        }
    }
}
document.addEventListener("click", (e) => {
    const item = e.target.closest(".lesson-menu-item");
    if (!item) return;

    document.querySelectorAll(".lesson-menu-item").forEach(el => {
        el.classList.remove("active");
    });
    item.classList.add("active");

    const lesson = JSON.parse(item.dataset.lesson);
    showLesson(lesson);
});

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(tab => tab.classList.remove("active"));
        btn.classList.add("active");
        
        const tabType = btn.dataset.tab;

        if (tabType === "video") {
            pdfSubMenu.style.display = "none"; // Ẩn menu con PDF đi
            currentTab = "video";
        } else if (tabType === "pdf-parent") {
            pdfSubMenu.style.display = "flex"; // Hiện menu con PDF ra
            // Mặc định chọn mục "Lý thuyết" khi bấm vào Tài liệu PDF lần đầu
            subTabButtons.forEach(sub => sub.classList.remove("active"));
            const defaultSub = document.querySelector('[data-tab="pdf-lythuyet"]');
            if(defaultSub) defaultSub.classList.add("active");
            currentTab = "pdf-lythuyet";
        }

        if (currentLesson) {
            showLesson(currentLesson);
        }
    });
});
// Lắng nghe sự kiện click các nút tab con bên trong Tài liệu PDF (Lý thuyết, Bài tập, BTVN)
subTabButtons.forEach(subBtn => {
    subBtn.addEventListener("click", () => {
        subTabButtons.forEach(sub => sub.classList.remove("active"));
        subBtn.classList.add("active");
        currentTab = subBtn.dataset.tab; // Nhận giá trị: pdf-lythuyet, pdf-baitap, hoặc pdf-btvn

        if (currentLesson) {
            showLesson(currentLesson);
        }
    });
});
loadCourse();

window.toggleChapter = function(chapterId) {
    const folder = document.getElementById(`folder-${chapterId}`);
    folder.classList.toggle("collapsed");
};
