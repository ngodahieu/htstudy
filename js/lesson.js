import { db } from "./firebase.js";

import {

doc,
getDoc

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

}
loadCourse();
