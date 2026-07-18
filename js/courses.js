import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,

    getDoc,

    getDocs,

    collection

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

const userBox=document.getElementById("userBox");

const userName=document.getElementById("userName");

const userStudentId=document.getElementById("userStudentId");

const userRole=document.getElementById("userRole");

const userAvatar=document.getElementById("userAvatar");

const logoutBtn=document.getElementById("logoutBtn");

const myCoursesBtn=document.getElementById("myCoursesBtn");

const manageBtn=document.getElementById("manageBtn");
const userGuide = document.getElementById("userGuide");
let currentRole="";

let currentUser = null;
async function loadUser(uid){

    const docRef = doc(db, "users", uid);

    const docSnap = await getDoc(docRef);

    if(!docSnap.exists()){

    await signOut(auth);

    return;

}

    const user = docSnap.data();

    userBox.style.display = "block";

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
async function loadSubjectCourses(){
    myRealCourses.innerHTML = "";

referenceCourses.innerHTML = "";
    const enrollSnap =
await getDoc(doc(db,"enrollments",currentUser.uid));

let myCourseIds = [];

if(enrollSnap.exists()){

    myCourseIds = enrollSnap.data().courses || [];

}
    const courseSnapshot =
await getDocs(collection(db,"courses"));
courseSnapshot.forEach(courseDoc=>{

    const course = courseDoc.data();

    if(

        course.subject !== subjectName ||

        course.grade != grade

    ){

        return;

    }

if(myCourseIds.includes(courseDoc.id)){

    myRealCourses.innerHTML +=
    createCard(course,true);

}

else{

    referenceCourses.innerHTML +=
    createCard(course,false);

}

});

}
function createCard(course, owned = false){

    return `

<div class="course-card">

    <img src="${course.image}">

    <div class="course-content">

        <h3>

            ${course.name}

        </h3>

        <p>

            ${course.description || ""}

        </p>

        <div class="course-footer">

<span class="${owned ? "owned-tag":"lock-tag"}">

${owned ? "Đã được cấp":"Chưa được cấp"}

</span>

<button
class="btn-course"
${owned ? "" : "disabled"}>

${owned ? "Vào học":"Chưa mở"}

</button>

</div>

    </div>

</div>

`;

}
logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "index.html";

});
myCoursesBtn.addEventListener("click", () => {

    window.location.href = "my-courses.html";

});
manageBtn.addEventListener("click", () => {

    if(currentRole === "Admin"){

        window.location.href = "dashboard/admin.html";

    }

    else if(currentRole === "Giáo viên"){

        window.location.href = "dashboard/teacher.html";

    }

});
userGuide.addEventListener("click", () => {

    alert("Chức năng hướng dẫn đang được cập nhật.");

});
onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (user) {

        await loadUser(user.uid);

        if(subject && grade){

            await loadSubjectCourses();

        }

    } else {

        window.location.href = "index.html";

    }

});
/*====================================
        LẤY DỮ LIỆU TỪ URL
====================================*/

const params = new URLSearchParams(window.location.search);

const subject = params.get("subject");

const grade = params.get("grade");
const subjectNames = {

    hoa: "Hóa Học",

    toan: "Toán Học",

    ly: "Vật Lý",

    sinh: "Sinh Học",

    van: "Ngữ Văn",

    anh: "Tiếng Anh"

};
const subjectName =
subjectNames[subject] || "Khóa học";
const pageTitle =
document.getElementById("pageTitle");

const pageDescription =
document.getElementById("pageDescription");
const backButton =
document.getElementById("backButton");

const courseFilter =
document.getElementById("courseFilter");

const subjectSection =
document.getElementById("subjectSection");

const realCourseSection =
document.getElementById("realCourseSection");

const myRealCourses =
document.getElementById("myRealCourses");

const referenceCourses =
document.getElementById("referenceCourses");
if(subject && grade){

    pageTitle.textContent =
`${subjectName} ${grade}`;

pageDescription.textContent =
`Các khóa học ${subjectName} lớp ${grade}.`;

pageDescription.textContent =
`Các khóa học ${subjectName} lớp ${grade}.`;

    subjectSection.style.display = "none";

    courseFilter.style.display = "none";

    realCourseSection.style.display = "block";

    backButton.style.display = "inline-flex";
}

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
backButton.addEventListener("click",()=>{

    if(document.referrer){
        history.back();
    }else{
        window.location.href="courses.html";
    }

});
