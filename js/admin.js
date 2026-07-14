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
    documentId,
    orderBy,
    addDoc,
    serverTimestamp
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
const menuAccounts =
document.getElementById("menuAccounts");

const menuCourses =
document.getElementById("menuCourses");
const menuEnrollments =
document.getElementById("menuEnrollments");
const menuVideos =
document.getElementById("menuVideos");

const menuDocuments =
document.getElementById("menuDocuments");

const menuTests =
document.getElementById("menuTests");

const menuNotifications =
document.getElementById("menuNotifications");

const menuPending =
document.getElementById("menuPending");
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
const dashboardHeader =
document.querySelector("#homePage .dashboard-header");

const dashboardCards =
document.querySelector("#homePage .dashboard-cards");
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
const enrollmentPage =
document.getElementById("enrollmentPage");
const enrollmentStudent =
document.getElementById("enrollmentStudent");

const enrollmentCourse =
document.getElementById("enrollmentCourse");

const assignCourseBtn =
document.getElementById("assignCourseBtn");
const courseSubject =
document.getElementById("courseSubject");
const courseGrade =
document.getElementById("courseGrade");

const courseName =
document.getElementById("courseName");

const courseDescription =
document.getElementById("courseDescription");

const courseImage =
document.getElementById("courseImage");

const createCourseBtn =
document.getElementById("createCourseBtn");

const courseList =
document.getElementById("courseList");
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

    enrollmentPage.style.display="none";

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

await loadSubjects();

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
menuAccounts.addEventListener("click",()=>{

    setActiveMenu(menuAccounts);

    hideAllPages();

    accountPage.style.display="block";

});

menuCourses.addEventListener("click",async()=>{

    setActiveMenu(menuCourses);

    hideAllPages();

    coursePage.style.display="block";

    await loadCourses();

});

menuVideos.addEventListener("click",()=>{

    setActiveMenu(menuVideos);

    hideAllPages();

    videoPage.style.display="block";

});

menuDocuments.addEventListener("click",()=>{

    setActiveMenu(menuDocuments);

    hideAllPages();

    documentPage.style.display="block";

});

menuTests.addEventListener("click",()=>{

    setActiveMenu(menuTests);

    hideAllPages();

    testPage.style.display="block";

});

menuNotifications.addEventListener("click",()=>{

    setActiveMenu(menuNotifications);

    hideAllPages();

    notificationPage.style.display="block";

});

menuPending.addEventListener("click",()=>{

    setActiveMenu(menuPending);

    hideAllPages();

    pendingPage.style.display="block";

});

menuEnrollments.addEventListener("click", async ()=>{

    setActiveMenu(menuEnrollments);

    hideAllPages();

    enrollmentPage.style.display="block";

    await loadStudentsForEnrollment();

    await loadCoursesForEnrollment();

});
/*====================================
        LOAD DANH SÁCH MÔN HỌC
====================================*/

async function loadSubjects(){

    courseSubject.innerHTML =
    `<option value="">-- Chọn môn --</option>`;

    const q = query(

        collection(db,"subjects"),

        orderBy("order")

    );

    const snapshot = await getDocs(q);

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(data.active){

            courseSubject.innerHTML += `
            <option value="${doc.id}">
                ${data.name}
            </option>
            `;

        }

    });

}
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
        TẠO KHÓA HỌC
====================================*/

async function createCourse(){

    try{

        const subject = courseSubject.value;
        const grade = courseGrade.value;
        const name = courseName.value.trim();
        const description = courseDescription.value.trim();
        const image = courseImage.value.trim();

        if(subject===""){
            alert("Vui lòng chọn môn học.");
            return;
        }

        if(name===""){
            alert("Nhập tên khóa học.");
            return;
        }

        await addDoc(collection(db,"courses"),{

            subject,
            grade,
            name,
            description,
            image,
            active:true,
            createdAt:serverTimestamp()

        });

        alert("Đã tạo khóa học.");

        courseName.value="";
        courseDescription.value="";
        courseImage.value="";

        await loadCourses();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}
/*====================================
        LOAD KHÓA HỌC
====================================*/

async function loadCourses(){

    courseList.innerHTML="Đang tải...";

    const snapshot =
    await getDocs(collection(db,"courses"));

    courseList.innerHTML="";

    snapshot.forEach(doc=>{

        const data=doc.data();

        courseList.innerHTML+=`

        <div class="course-item">

            <h3>${data.name}</h3>

            <p>Môn: ${data.subject}</p>

            <p>Lớp: ${data.grade}</p>

        </div>

        `;

    });

}
async function loadStudentsForEnrollment(){

    enrollmentStudent.innerHTML="";

    const q=query(
        collection(db,"users"),
        where("role","==","Học sinh")
    );

    const snapshot=await getDocs(q);

    snapshot.forEach(doc=>{

        const data=doc.data();

        enrollmentStudent.innerHTML+=`
            <option value="${doc.id}">
                ${data.name}
            </option>
        `;

    });

}
async function loadCoursesForEnrollment(){

    enrollmentCourse.innerHTML="";

    const snapshot=
    await getDocs(collection(db,"courses"));

    snapshot.forEach(doc=>{

        const data=doc.data();

        enrollmentCourse.innerHTML+=`
            <option value="${doc.id}">
                ${data.name}
            </option>
        `;

    });

}
/*====================================
        ĐĂNG XUẤT
====================================*/
createCourseBtn.addEventListener(
    "click",
    createCourse
);
logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
