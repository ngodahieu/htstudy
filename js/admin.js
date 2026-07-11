//==============================
// FIREBASE
//==============================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
    ref,
    get,
    set,
    update,
    remove,
    push
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
//==============================
// DOM
//==============================

const menuHome = document.getElementById("menuHome");
const menuAccounts = document.getElementById("menuAccounts");
const menuStudents = document.getElementById("menuStudents");
const menuTeachers = document.getElementById("menuTeachers");
const menuCourses = document.getElementById("menuCourses");
const menuVideos = document.getElementById("menuVideos");
const menuDocuments = document.getElementById("menuDocuments");
const menuTests = document.getElementById("menuTests");
const menuNotifications = document.getElementById("menuNotifications");
const menuPending = document.getElementById("menuPending");

const logoutBtn = document.getElementById("logoutBtn");
const pages = {

    home: document.getElementById("homePage"),

    account: document.getElementById("accountPage"),

    student: document.getElementById("studentPage"),

    teacher: document.getElementById("teacherPage"),

    course: document.getElementById("coursePage"),

    video: document.getElementById("videoPage"),

    document: document.getElementById("documentPage"),

    test: document.getElementById("testPage"),

    notification: document.getElementById("notificationPage"),

    pending: document.getElementById("pendingPage")

};
const menuButtons = document.querySelectorAll(".menu-item");
function hideAllPages() {

    Object.values(pages).forEach(page => {

        page.style.display = "none";

    });

}
function openPage(pageName, button) {
if(pages[pageName].style.display==="block") return;
    hideAllPages();

    pages[pageName].style.display = "block";
    window.scrollTo({
    top:0,
    behavior:"smooth"
});

    menuButtons.forEach(btn => {

        btn.classList.remove("active");

    });

    button.classList.add("active");

}
menuHome.onclick = () => openPage("home", menuHome);

menuAccounts.onclick = () => openPage("account", menuAccounts);

menuStudents.onclick = () => openPage("student", menuStudents);

menuTeachers.onclick = () => openPage("teacher", menuTeachers);

menuCourses.onclick = () => openPage("course", menuCourses);

menuVideos.onclick = () => openPage("video", menuVideos);

menuDocuments.onclick = () => openPage("document", menuDocuments);

menuTests.onclick = () => openPage("test", menuTests);

menuNotifications.onclick = () => openPage("notification", menuNotifications);

menuPending.onclick = () => openPage("pending", menuPending);
logoutBtn.onclick = async () => {

    if (!confirm("Bạn muốn đăng xuất?")) return;

    await signOut(auth);

    location.href = "../index.html";

};
hideAllPages();

pages.home.style.display = "block";
//==============================
// LOADING
//==============================

const loading = document.getElementById("loading");

function showLoading() {
    loading.style.display = "flex";
}

function hideLoading() {
    loading.style.display = "none";
}
//==============================
// ADMIN INFO
//==============================

const adminAvatar = document.getElementById("adminAvatar");
const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="../login.html";
        return;

    }

    showLoading();

    try{

        const snapshot = await get(ref(db,"users/"+user.uid));

        if(snapshot.exists()){

            const data = snapshot.val();
            if(data.role!=="admin"){

    alert("Bạn không có quyền truy cập.");

    location.href="../index.html";

    return;

}
            adminName.textContent=data.name||"Admin";

            adminAvatar.src=data.avatar||"../assets/avatars/default.jpg";

            adminRole.textContent=data.role||"Admin";
            const welcomeName=document.getElementById("welcomeName");

welcomeName.textContent=data.name||"Admin";
            await loadDashboard();

        }

    }catch(err){

        console.log(err);

    }

    hideLoading();

});
//==============================
// DASHBOARD COUNT
//==============================

const studentCount=document.getElementById("studentCount");
const teacherCount=document.getElementById("teacherCount");
const courseCount=document.getElementById("courseCount");

const videoCount=document.getElementById("videoCount");
async function loadDashboard(){

    try{
showLoading();
        const usersSnapshot=await get(ref(db,"users"));

        let students=0;
        let teachers=0;

        if(usersSnapshot.exists()){

            usersSnapshot.forEach(item=>{

                const user=item.val();

                if(user.role==="student") students++;

                if(user.role==="teacher") teachers++;

            });

        }

        studentCount.textContent=students;

        teacherCount.textContent=teachers;

    }catch(err){

        console.log(err);

    }
hideLoading();
}

