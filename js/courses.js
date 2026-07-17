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
/*==========================================
        NOTIFICATION PANEL
==========================================*/

const notificationBtn = document.querySelector(".notification-btn");

const notificationPanel =
document.getElementById("notificationPanel");

const closeNotification =
document.getElementById("closeNotification");

const notificationBadge =
document.querySelector(".badge");

notificationBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    notificationPanel.classList.toggle("active");

    if(notificationPanel.classList.contains("active")){

        notificationBadge.style.opacity="0";
        notificationBadge.style.transform="scale(0)";

    }

});

closeNotification.addEventListener("click",()=>{

    notificationPanel.classList.remove("active");

});

document.addEventListener("click",(e)=>{

    if(

        !notificationPanel.contains(e.target)

        &&

        !notificationBtn.contains(e.target)

    ){

        notificationPanel.classList.remove("active");

    }

});
/*==========================================
        USER MENU
==========================================*/

const avatar =
document.querySelector(".avatar");

const userMenu =
document.getElementById("userMenu");

avatar.addEventListener("click",(e)=>{

    e.stopPropagation();

    userMenu.classList.toggle("active");

});

document.addEventListener("click",(e)=>{

    if(

        !userMenu.contains(e.target)

        &&

        !avatar.contains(e.target)

    ){

        userMenu.classList.remove("active");

    }

});

closeLogin.addEventListener("click",()=>{

    loginOverlay.style.display="none";

});

loginBtn.addEventListener("click",()=>{

    userMenu.classList.remove("active");

    loginOverlay.style.display="flex";

});

loginOverlay.addEventListener("click",(e)=>{

    if(e.target===loginOverlay){

        loginOverlay.style.display="none";

    }

});
const guestBox=document.getElementById("guestBox");

const userBox=document.getElementById("userBox");

const userName=document.getElementById("userName");

const userStudentId=document.getElementById("userStudentId");

const userRole=document.getElementById("userRole");

const userAvatar=document.getElementById("userAvatar");

const logoutBtn=document.getElementById("logoutBtn");

const myCoursesBtn=document.getElementById("myCoursesBtn");

const manageBtn=document.getElementById("manageBtn");

let currentRole="";
async function loadUser(uid){

    const docRef = doc(db, "users", uid);

    const docSnap = await getDoc(docRef);

    if(!docSnap.exists()){

    await signOut(auth);

    return;

}

    const user = docSnap.data();

    guestBox.style.display = "none";
    userBox.style.display = "block";

    document.getElementById("guestMenu").style.display = "none";
    document.getElementById("userMenuList").style.display = "block";

    const avatarUrl =
    user.avatar && user.avatar.trim() !== ""
        ? user.avatar
        : "assets/avatars/default.jpg";

document.querySelector(".avatar img").src = avatarUrl;

userAvatar.src = avatarUrl;
    userName.textContent = user.name;

    userStudentId.textContent = user.memberId;
    
    userRole.textContent = user.role;
    currentRole = user.role;

    if (user.role === "Học sinh") {

    myCoursesBtn.style.display = "flex";

    manageBtn.style.display = "none";

}

else if (user.role === "Giáo viên") {

    myCoursesBtn.style.display = "none";

    manageBtn.style.display = "flex";

}

else if (user.role === "Admin") {

    myCoursesBtn.style.display = "none";

    manageBtn.style.display = "flex";

}
    currentUser = auth.currentUser;
}

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});
onAuthStateChanged(auth, async (user) => {

    currentUser = user;
    
    if (user) {

        await loadUser(user.uid);

    }else{

    window.location.href = "index.html";

}

});
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
