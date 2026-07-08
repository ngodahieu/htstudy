import { auth, db } from "./firebase.js";

import {
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
        LẤY CÁC THÀNH PHẦN HTML
====================================*/

const teacherName =
document.getElementById("teacherName");

const teacherRole =
document.getElementById("teacherRole");

const teacherAvatar =
document.getElementById("teacherAvatar");

const logoutBtn =
document.getElementById("logoutBtn");

const menuStudents =
document.getElementById("menuStudents");
const menuHome =
document.getElementById("menuHome");
menuHome.addEventListener("click", () => {

    dashboardHeader.style.display = "block";

    dashboardCards.style.display = "grid";

    studentPage.style.display = "none";

});
const dashboardHeader =
document.querySelector(".dashboard-header");

const dashboardCards =
document.querySelector(".dashboard-cards");

const studentPage =
document.getElementById("studentPage");
/*====================================
        KIỂM TRA ĐĂNG NHẬP
====================================*/

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        alert("Bạn cần đăng nhập.");

        window.location.href="../index.html";

        return;

    }

    const docRef =
    doc(db,"users",user.uid);

    const docSnap =
    await getDoc(docRef);

    if(!docSnap.exists()){

        alert("Không tìm thấy tài khoản.");

        await signOut(auth);

        window.location.href="../index.html";

        return;

    }

    const data =
    docSnap.data();

    /*=========================
            KIỂM TRA QUYỀN
    =========================*/

    if(data.role !== "Giáo viên"){

        alert("Bạn không có quyền truy cập.");

        window.location.href="../index.html";

        return;

    }

    /*=========================
        HIỂN THỊ THÔNG TIN
    =========================*/

    teacherName.textContent =
    data.name;

    teacherRole.textContent =
    data.role;

    teacherAvatar.src =
    data.avatar && data.avatar.trim() !== ""

    ? data.avatar

    : "../assets/avatars/default.jpg";

});
/*====================================
        MENU HỌC SINH
====================================*/

menuStudents.addEventListener("click", () => {

    dashboardHeader.style.display = "none";

    dashboardCards.style.display = "none";

    studentPage.style.display = "block";

});
/*====================================
        ĐĂNG XUẤT
====================================*/

logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
