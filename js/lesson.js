import { db } from "./firebase.js";

import {

doc,
getDoc,
collection,
getDocs,
query,
orderBy

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const params = new URLSearchParams(window.location.search);

const courseId = params.get("id");
const courseTitle =
document.getElementById("courseTitle");

const courseDescription =
document.getElementById("courseDescription");

const chapterMenu =
document.getElementById("chapterMenu");

const lessonTitle =
document.getElementById("lessonTitle");

const lessonDescription =
document.getElementById("lessonDescription");

const lessonContent =
document.getElementById("lessonContent");

const tabButtons =
document.querySelectorAll(".tab-btn");
let chapters = [];

let currentLesson = null;

let currentTab = "video";
async function loadCourse(){

const snap =
await getDoc(doc(db,"courses",courseId));

if(!snap.exists()){

courseTitle.textContent =
"Không tìm thấy khóa học.";

return;

}

const course = snap.data();

courseTitle.textContent =
course.name;

courseDescription.textContent =
course.description || "";
await loadChapters();
}
async function loadChapters(){

    chapterMenu.innerHTML = "";

const chapterQuery = query(
    collection(
        db,
        "courses",
        courseId,
        "chapters"
    ),
    orderBy("order")
);

    const chapterSnapshot =
    await getDocs(chapterQuery);

for (const chapterDoc of chapterSnapshot.docs) {

    const chapter = chapterDoc.data();

    chapterMenu.innerHTML += `

<div class="chapter-folder">

    <div class="folder-title">

        <i class="fa-solid fa-folder-open"></i>

        ${chapter.title}

    </div>

    <div
        id="chapter-${chapterDoc.id}"
        class="lesson-list">

    </div>

</div>

`;

    await loadLessons(chapterDoc.id);

}

}
async function loadLessons(chapterId){

    const lessonBox =
    document.getElementById(`chapter-${chapterId}`);

    const lessonQuery = query(

        collection(
            db,
            "courses",
            courseId,
            "chapters",
            chapterId,
            "lessons"
        ),

        orderBy("order")

    );

    const lessonSnapshot =
    await getDocs(lessonQuery);

    lessonBox.innerHTML = "";
    let firstLesson = null;

    lessonSnapshot.forEach((lessonDoc)=>{

        const lesson = lessonDoc.data();
        lesson.id = lessonDoc.id;
        if(firstLesson === null){

    firstLesson = lesson;

}

        lessonBox.innerHTML += `

<div
    class="lesson-menu-item ${
        currentLesson === null && firstLesson === lesson
        ? "active"
        : ""
    }"
    data-lesson='${JSON.stringify(lesson)}'
    data-title="${lesson.title}"
    data-description="${lesson.description || ""}"
    data-video="${lesson.video || ""}"
    data-pdf="${lesson.pdf || ""}"
>

    <i class="fa-regular fa-file-video"></i>

    ${lesson.order}. ${lesson.title}

</div>

`;

    });

    if(currentLesson === null && firstLesson){

    currentLesson = firstLesson;

    showLesson(firstLesson);

}
}
function showLesson(lesson){

    currentLesson = lesson;

    lessonTitle.textContent =
    lesson.title;

    lessonDescription.textContent =
    lesson.description || "";
    let videoUrl = "";

if(lesson.video){

    if(lesson.video.includes("youtu.be/")){

        const id = lesson.video.split("youtu.be/")[1];

        videoUrl = `https://www.youtube.com/embed/${id}`;

    }

    else if(lesson.video.includes("watch?v=")){

        videoUrl = lesson.video.replace(
            "watch?v=",
            "embed/"
        );

    }

    else{

        videoUrl = lesson.video;

    }

}
    if(currentTab==="video"){

        lessonContent.innerHTML = `

<iframe
    src="${videoUrl}"
    width="100%"
    height="600"
    frameborder="0"
    allowfullscreen>

</iframe>

`;

    }

    else{

        lessonContent.innerHTML = `

<iframe
    src="${lesson.pdf}"
    width="100%"
    height="700">

</iframe>

`;

    }

}
document.addEventListener("click",(e)=>{

    const item = e.target.closest(".lesson-menu-item");

    if(!item) return;

    document
        .querySelectorAll(".lesson-menu-item")
        .forEach(el=>{

            el.classList.remove("active");

        });

    item.classList.add("active");

    const lesson = JSON.parse(item.dataset.lesson);

    showLesson(lesson);

});
tabButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        tabButtons.forEach(tab=>{

            tab.classList.remove("active");

        });

        btn.classList.add("active");

        currentTab = btn.dataset.tab;

        if(currentLesson){

            showLesson(currentLesson);

        }

    });

});
loadCourse();
