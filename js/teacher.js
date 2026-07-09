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
    collection,
    query,
    where
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

const studentIdInput =
document.getElementById("studentId");
const studentName =
document.getElementById("studentName");

const studentEmail =
document.getElementById("studentEmail");

const createStudentBtn =
document.getElementById("createStudentBtn");

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
        SINH MÃ HỌC SINH
====================================*/
async function generateStudentId(){

    const snapshot =
    await getDocs(collection(db,"users"));

    let max = 0;

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(data.role !== "Học sinh") return;

        if(!data.studentId) return;

        const number =
        parseInt(data.studentId.replace("HT27",""));

        if(number > max){

            max = number;

        }

    });

    return "HT27"+

    String(max+1).padStart(4,"0");

}
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
    studentIdInput.value =
await generateStudentId();
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
        TẠO HỌC SINH
====================================*/

async function createStudentAccount(){

    const name = studentName.value.trim();

    const email = studentEmail.value.trim().toLowerCase();

    const studentId = studentIdInput.value;

    if(name==="" || email===""){

        alert("Vui lòng nhập đầy đủ thông tin.");

        return;

    }

    if(!email.includes("@")){

        alert("Email không hợp lệ.");

        return;

    }

    const response = await fetch(
        "http://localhost:3000/createStudent",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                name:name,

                email:email,

                password:studentId,

                studentId:studentId

            })

        }
    );

    const result = await response.json();

    if(result.success){

        alert(
`Đã tạo thành công!

Email: ${email}

Mật khẩu: ${studentId}`
        );

        studentName.value="";

        studentEmail.value="";

        studentIdInput.value=
        await generateStudentId();

    }else{

        alert(result.message);

    }

}

createStudentBtn.addEventListener(
    "click",
    createStudentAccount
);
/*====================================
        ĐĂNG XUẤT
====================================*/

logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
