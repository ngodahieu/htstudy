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
const videoSubMenu = document.getElementById("videoSubMenu");
const mainTabButtons = document.querySelectorAll(".tab-btn");

let currentLesson = null;
let currentTab = "videoTheory";

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

function getEmbedUrl(rawUrl) {
    if (!rawUrl) return "";
    if (rawUrl.includes("youtu.be/")) {
        const id = rawUrl.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
    } else if (rawUrl.includes("watch?v=")) {
        return rawUrl.replace("watch?v=", "embed/").split("&")[0];
    }
    return rawUrl;
}

function showLesson(lesson) {
    currentLesson = lesson;
    lessonTitle.textContent = lesson.title;
    lessonDescription.textContent = lesson.description || "";

    let contentUrl = "";
    let isPdf = false;

    // Kiểm tra dựa theo tab con đang được chọn
    if (currentTab === "videoTheory") {
        contentUrl = getEmbedUrl(lesson.videoLyThuyet || lesson.video || "");
    } else if (currentTab === "videoExercise") {
        contentUrl = getEmbedUrl(lesson.videoBaiTap || "");
    } else if (currentTab === "videoHomework") {
        contentUrl = getEmbedUrl(lesson.videoBtvn || "");
    } else if (currentTab === "pdfTheory") {
        contentUrl = lesson.pdfLyThuyet || lesson.pdf || "";
        isPdf = true;
    } else if (currentTab === "pdfExercise") {
        contentUrl = lesson.pdfBaiTap || "";
        isPdf = true;
    } else if (currentTab === "pdfHomework") {
        contentUrl = lesson.pdfBtvn || "";
        isPdf = true;
    }

    if (contentUrl) {
        if (!isPdf) {
            // Hiển thị khung Video Iframe
            lessonContent.innerHTML = `
            <iframe
                src="${contentUrl}"
                width="100%"
                height="600"
                frameborder="0"
                allowfullscreen>
            </iframe>`;
        } else {
            // Hiển thị khung Tài liệu PDF Iframe
            lessonContent.innerHTML = `
            <iframe
                src="${contentUrl}"
                width="100%"
                height="700">
            </iframe>`;
        }
    } else {
        lessonContent.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #9fb6d8; font-size: 1.1rem;">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 10px; color: #3acfff;"></i>
            <p>Chưa có nội dung cho phần này.</p>
        </div>`;
    }
}

// Bắt sự kiện click chuyển đổi tab chính (Video bài giảng / Tài liệu PDF)
mainTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        mainTabButtons.forEach(tab => tab.classList.remove("active"));
        btn.classList.add("active");
        
        const parentType = btn.dataset.tab;

        if (parentType === "video-parent") {
            videoSubMenu.style.display = "flex";
            pdfSubMenu.style.display = "none";
            // Mặc định chọn mục video lý thuyết khi chuyển về tab video chính
            subTabButtons.forEach(sub => sub.classList.remove("active"));
            const defaultSub = document.querySelector('[data-tab="videoTheory"]');
            if (defaultSub) defaultSub.classList.add("active");
            currentTab = "videoTheory";
        } else if (parentType === "pdf-parent") {
            videoSubMenu.style.display = "none";
            pdfSubMenu.style.display = "flex";
            // Mặc định chọn mục PDF lý thuyết
            subTabButtons.forEach(sub => sub.classList.remove("active"));
            const defaultSub = document.querySelector('[data-tab="pdfTheory"]');
            if (defaultSub) defaultSub.classList.add("active");
            currentTab = "pdfTheory";
        }

        if (currentLesson) {
            showLesson(currentLesson);
        }
    });
});

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

// Lắng nghe sự kiện click các nút tab con bên trong (Lý thuyết, Bài tập, BTVN)
subTabButtons.forEach(subBtn => {
    subBtn.addEventListener("click", () => {
        subTabButtons.forEach(sub => sub.classList.remove("active"));
        subBtn.classList.add("active");
        currentTab = subBtn.dataset.subTab || subBtn.dataset.tab; // Nhận diện loại tab con đang bấm

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
