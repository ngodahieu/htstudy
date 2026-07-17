import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/*====================================
        LẤY DỮ LIỆU TỪ URL
====================================*/

const params = new URLSearchParams(window.location.search);

const subject = params.get("subject");

const grade = params.get("grade");
const pageTitle =
document.getElementById("pageTitle");

const pageDescription =
document.getElementById("pageDescription");
if(subject && grade){

    pageTitle.textContent =
    `Hóa Học ${grade}`;

    pageDescription.textContent =
    `Các khóa học dành cho Hóa Học lớp ${grade}.`;

}
console.log(subject);

console.log(grade);
/*====================================
        FILTER COURSE
====================================*/

const filterBtns = document.querySelectorAll(".filter-btn");

const courseCards = document.querySelectorAll(".course-card");

filterBtns.forEach(button=>{

button.addEventListener("click",()=>{

document.querySelector(".filter-btn.active")
.classList.remove("active");

button.classList.add("active");

const filter = button.dataset.filter;

courseCards.forEach(card=>{

if(filter==="all"){

card.classList.remove("hide");

return;

}

if(card.dataset.class===filter){

card.classList.remove("hide");

}

else{

card.classList.add("hide");

}

});

});

});
