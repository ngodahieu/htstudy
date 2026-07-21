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
    addDoc,
    serverTimestamp
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

const menuNotifications =
document.getElementById("menuNotifications");

const menuItems = document.querySelectorAll(".menu-item");

function setActiveMenu(activeButton){

    menuItems.forEach(item => {

        item.classList.remove("active");

    });

    activeButton.classList.add("active");

}
menuHome.addEventListener("click", () => {

    setActiveMenu(menuHome);

    hideAllPages();

    dashboardHeader.style.display = "block";

    dashboardCards.style.display = "grid";

});
const dashboardHeader =
document.querySelector(".dashboard-header");

const dashboardCards =
document.querySelector(".dashboard-cards");

const studentPage =
document.getElementById("studentPage");
const notificationPage =
document.getElementById("notificationPage");
const notificationType =
document.getElementById("notificationType");

const notificationCourse =
document.getElementById("notificationCourse");

const notificationContentLink =
document.getElementById("notificationContentLink");

const notificationTitle =
document.getElementById("notificationTitle");

const notificationContent =
document.getElementById("notificationContent");

const createNotificationBtn =
document.getElementById("createNotificationBtn");

const notificationList =
document.getElementById("notificationList");
let currentTeacherId = "";

let currentTeacherName = "";
function hideAllPages(){

    dashboardHeader.style.display = "none";

    dashboardCards.style.display = "none";

    studentPage.style.display = "none";

    notificationPage.style.display = "none";

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
        DASHBOARD
====================================*/

async function loadDashboard(){

    const snapshot = await getDocs(collection(db,"users"));

    let student = 0;

    snapshot.forEach((doc)=>{

        const data = doc.data();

        if(data.role === "Học sinh"){

            student++;

        }

    });

    document.getElementById("studentCount").textContent = student;

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
currentTeacherId = user.uid;

currentTeacherName = data.name;
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
await generateMemberId();
    await loadDashboard();
});
/*====================================
        MENU HỌC SINH
====================================*/

menuStudents.addEventListener("click", () => {

    setActiveMenu(menuStudents);

    hideAllPages();

    studentPage.style.display = "block";

});
menuNotifications.addEventListener("click", async () => {

    setActiveMenu(menuNotifications);

    hideAllPages();

    notificationPage.style.display = "block";

    await loadNotificationCourses();

    await loadNotifications();

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

await addDoc(collection(db,"pendingStudents"),{

    name:name,

    email:email,

    memberId:memberId,

    teacherId:currentTeacherId,

    teacherName:currentTeacherName,

    status:"pending",

    createdAt:serverTimestamp()

});

alert("Đã gửi yêu cầu tạo tài khoản.\nVui lòng chờ Admin phê duyệt.");

studentName.value="";

studentEmail.value="";

studentIdInput.value=
await generateMemberId();

}

createStudentBtn.addEventListener(
    "click",
    createStudentAccount
);
async function loadNotificationCourses(){

    notificationCourse.innerHTML=
    `<option value="">-- Chọn khóa học --</option>`;

    const snapshot=
    await getDocs(collection(db,"courses"));

    snapshot.forEach(doc=>{

    const data = doc.data();

    notificationCourse.innerHTML += `
        <option value="${doc.id}">
            ${(data.subjectName || data.subject)} ${data.grade} | Khóa: ${data.name}
        </option>
    `;

});

}
notificationType.addEventListener("change",loadContentList);

notificationCourse.addEventListener("change",loadContentList);
async function loadContentList(){

    notificationContentLink.innerHTML="";

    const courseId=
notificationCourse.value;

const courseName=

notificationCourse.options[
notificationCourse.selectedIndex
].text;
    if(courseId===""){

        notificationContentLink.innerHTML=
        `<option value="">Chọn khóa học trước</option>`;

        return;

    }

    if(notificationType.value==="general"){

        notificationContentLink.innerHTML=
        `<option value="">Không cần chọn</option>`;

        notificationContentLink.disabled=true;

        return;

    }

    notificationContentLink.disabled=false;

    let collectionName="lessons";

    if(notificationType.value==="test"){

        collectionName="tests";

    }

    const snapshot=

    await getDocs(

        collection(

            db,

            "courses",

            courseId,

            collectionName

        )

    );

    notificationContentLink.innerHTML="";

    snapshot.forEach(doc=>{

        const data=doc.data();

        notificationContentLink.innerHTML+=`

        <option value="${doc.id}">

            ${data.title}

        </option>

        `;

    });

}
/*====================================
        GỬI THÔNG BÁO
====================================*/

async function createNotification(){

    try{

        const type = notificationType.value;

        const courseId = notificationCourse.value;
const courseName =
notificationCourse.options[
notificationCourse.selectedIndex
].text;
        const title = notificationTitle.value.trim();

        const content = notificationContent.value.trim();

        const contentId = notificationContentLink.value;

        if(title===""){

            alert("Nhập tiêu đề.");

            return;

        }

        if(content===""){

            alert("Nhập nội dung.");

            return;

        }

await addDoc(collection(db,"notifications"),{

    type,

    courseId,

    courseName,

    title,

    content,

    contentId,

    active:true,

    read:false,

    createdAt:serverTimestamp()

});

        alert("Đã gửi thông báo.");

        notificationTitle.value="";

        notificationContent.value="";

        await loadNotifications();

    }

    catch(err){

        console.log(err);

        alert(err.message);

    }

}
/*====================================
        LOAD THÔNG BÁO
====================================*/

async function loadNotifications(){

    notificationList.innerHTML="Đang tải...";

    const q=query(

        collection(db,"notifications"),

        orderBy("createdAt","desc")

    );

    const snapshot=await getDocs(q);

    notificationList.innerHTML="";

    snapshot.forEach(docItem=>{

        const data=docItem.data();

        notificationList.innerHTML += `

<div class="course-item">

<h3>${data.title}</h3>

<p>

<b>${data.courseName}</b>

</p>

<p>

${data.content}

</p>

<button
onclick="deleteNotification('${docItem.id}')">

Xóa

</button>

</div>

`;

    });

}

/*====================================
        ĐĂNG XUẤT
====================================*/

logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
createNotificationBtn.addEventListener(
    "click",
    createNotification
);
