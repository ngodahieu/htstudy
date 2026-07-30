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

const chapterContainer =
document.getElementById("chapterContainer");
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

    chapterContainer.innerHTML = "";

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

    chapterContainer.innerHTML += `

        <div class="chapter-box">

            <div class="chapter-header">

                <h2>${chapter.title}</h2>

                <span>Đang tải bài học...</span>

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

    lessonSnapshot.forEach((lessonDoc)=>{

        const lesson = lessonDoc.data();

        lessonBox.innerHTML += `

        <div class="lesson-item">

            <div>

                <h3>${lesson.title}</h3>

                <p>${lesson.description || ""}</p>

            </div>

            <button
                class="open-lesson"
                data-video="${lesson.video}"
                data-pdf="${lesson.pdf}"
            >

                Mở bài học

            </button>

        </div>

        `;

    });

}
document.addEventListener("click",(e)=>{

    const btn = e.target.closest(".open-lesson");

    if(!btn) return;

    const video = btn.dataset.video;

    const pdf = btn.dataset.pdf;

    if(video){

        window.open(video,"_blank");

    }

    if(pdf){

        window.open(pdf,"_blank");

    }

});
loadCourse();

