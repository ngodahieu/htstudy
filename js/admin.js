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
    where,
    deleteDoc,
    documentId
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/*====================================
        LẤY CÁC THÀNH PHẦN HTML
====================================*/

const adminName =
document.getElementById("adminName");

const adminRole =
document.getElementById("adminRole");

const adminAvatar =
document.getElementById("adminAvatar");

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
const teacherCreateId =
document.getElementById("teacherCreateId");

const teacherCreateName =
document.getElementById("teacherCreateName");

const teacherCreateEmail =
document.getElementById("teacherCreateEmail");

const createTeacherBtn =
document.getElementById("createTeacherBtn");
const menuStudents =
document.getElementById("menuStudents");
const menuTeachers =
document.getElementById("menuTeachers");
const menuHome =
document.getElementById("menuHome");
const menuItems = document.querySelectorAll(".menu-item");

function setActiveMenu(activeButton){

    menuItems.forEach(item => {

        item.classList.remove("active");

    });

    activeButton.classList.add("active");

}
menuHome.addEventListener("click",()=>{

    setActiveMenu(menuHome);

    hideAllPages();

    homePage.style.display="block";

});
const homePage =
document.getElementById("homePage");

const studentPage =
document.getElementById("studentPage");
const teacherPage =
document.getElementById("teacherPage");
const accountPage =
document.getElementById("accountPage");

const coursePage =
document.getElementById("coursePage");

const videoPage =
document.getElementById("videoPage");

const documentPage =
document.getElementById("documentPage");

const testPage =
document.getElementById("testPage");

const notificationPage =
document.getElementById("notificationPage");

const pendingPage =
document.getElementById("pendingPage");
console.log("dashboardHeader", dashboardHeader);
console.log("dashboardCards", dashboardCards);

console.log("studentPage", studentPage);
console.log("teacherPage", teacherPage);
console.log("accountPage", accountPage);
console.log("coursePage", coursePage);
console.log("videoPage", videoPage);
console.log("documentPage", documentPage);
console.log("testPage", testPage);
console.log("notificationPage", notificationPage);
console.log("pendingPage", pendingPage);
function hideAllPages(){

    homePage.style.display="none";

    studentPage.style.display="none";

    teacherPage.style.display="none";

    accountPage.style.display="none";

    coursePage.style.display="none";

    videoPage.style.display="none";

    documentPage.style.display="none";

    testPage.style.display="none";

    notificationPage.style.display="none";

    pendingPage.style.display="none";

}
/*====================================
        SINH MÃ HỌC SINH
====================================*/
async function generateMemberId(){

    const snapshot =
    await getDocs(collection(db,"users"));

    let max = 0;

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(!data.memberId) return;

        const number =
        parseInt(data.memberId.replace("HT27",""));

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

    if(data.role !== "Admin"){

        alert("Bạn không có quyền truy cập.");

        window.location.href="../index.html";

        return;

    }

    /*=========================
        HIỂN THỊ THÔNG TIN
    =========================*/

    adminName.textContent =
data.name;

adminRole.textContent =
data.role;

adminAvatar.src =
data.avatar && data.avatar.trim()!==""
?data.avatar
:"../assets/avatars/default.jpg";
    document.getElementById("welcomeName").textContent =
data.name;
const id =
await generateMemberId();

studentIdInput.value=id;

teacherCreateId.value=id;
    await loadDashboard();

hideAllPages();

homePage.style.display="block";
});
/*====================================
        DASHBOARD
====================================*/

async function loadDashboard(){

    const snapshot =
    await getDocs(collection(db,"users"));

    let student = 0;
    let teacher = 0;

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(data.role==="Học sinh"){

            student++;

        }

        if(data.role==="Giáo viên"){

            teacher++;

        }

    });

    document.getElementById("studentCount").textContent =
    student;

    document.getElementById("teacherCount").textContent =
    teacher;

}
/*====================================
        MENU HỌC SINH
====================================*/

menuStudents.addEventListener("click",()=>{

    setActiveMenu(menuStudents);

    hideAllPages();

    studentPage.style.display="block";

});
menuTeachers.addEventListener("click",()=>{

    setActiveMenu(menuTeachers);

    hideAllPages();

    teacherPage.style.display="block";

});
/*====================================
        TẠO HỌC SINH
====================================*/

async function createStudentAccount(){

    const name = studentName.value.trim();

    const email = studentEmail.value.trim().toLowerCase();

    const memberId =
studentIdInput.value;

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

                password:memberId,

memberId:memberId

            })

        }
    );

    const result = await response.json();

    if(result.success){

        alert(
`Đã tạo thành công!

Email: ${email}

Mật khẩu: ${memberId}`
        );

        studentName.value="";

        studentEmail.value="";

        const id =
await generateMemberId();

studentIdInput.value=id;

teacherCreateId.value=id;
await loadDashboard();
    }else{

        alert(result.message);

    }

}
async function createTeacherAccount(){

    const name =
    teacherCreateName.value.trim();

    const email =
    teacherCreateEmail.value.trim().toLowerCase();

    const memberId =
    teacherCreateId.value;

    if(name==="" || email===""){

        alert("Vui lòng nhập đầy đủ thông tin.");

        return;

    }

    if(!email.includes("@")){

        alert("Email không hợp lệ.");

        return;

    }

    const response = await fetch(

        "http://localhost:3000/createTeacher",

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                name:name,

                email:email,

                password:memberId,

                memberId:memberId

            })

        }

    );

    const result = await response.json();

    if(result.success){

        alert(

`Đã tạo thành công!

Email: ${email}

Mật khẩu: ${memberId}`

        );

        teacherCreateName.value="";

        teacherCreateEmail.value="";

        const id =
        await generateMemberId();

        teacherCreateId.value=id;

        studentIdInput.value=id;
await loadDashboard();
    }else{

        alert(result.message);

    }

}
createStudentBtn.addEventListener(
    "click",
    createStudentAccount
);
createTeacherBtn.addEventListener(
    "click",
    createTeacherAccount
);
/*====================================
        ĐĂNG XUẤT
====================================*/

logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
