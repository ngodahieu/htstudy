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
        )

    );

    const chapterSnapshot =
    await getDocs(chapterQuery);

    chapterSnapshot.forEach((chapterDoc)=>{

        const chapter = chapterDoc.data();

        chapterContainer.innerHTML += `

        <div class="chapter-box">

            <div class="chapter-header">

                <h2>

                    ${chapter.title}

                </h2>

                <span>

                    Đang tải bài học...

                </span>

            </div>

            <div
            id="chapter-${chapterDoc.id}"
            class="lesson-list">

            </div>

        </div>

        `;

    });

}
loadCourse();
