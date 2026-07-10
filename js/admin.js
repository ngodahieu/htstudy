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
    child,
    set,
    update,
    remove,
    push
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
//==============================
// DOM
//==============================

const pageContainer = document.getElementById("pageContainer");

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

    home: document.querySelector(".dashboard-header").parentElement,

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

    hideAllPages();

    pages[pageName].style.display = "block";

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
