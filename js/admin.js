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
    serverTimestamp,
    setDoc,
    arrayUnion,
    updateDoc,
    writeBatch,
    Timestamp
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
const accountList =
document.getElementById("accountList");

const searchAccount =
document.getElementById("searchAccount");
let allStudents = [];
const filterRole =
document.getElementById("filterRole");

const totalAccounts =
document.getElementById("totalAccounts");

const studentAccounts =
document.getElementById("studentAccounts");

const teacherAccounts =
document.getElementById("teacherAccounts");

const adminAccounts =
document.getElementById("adminAccounts");
const accountDetailModal =
document.getElementById("accountDetailModal");

const detailContent =
document.getElementById("detailContent");

const closeDetailBtn =
document.getElementById("closeDetailBtn");
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
const pendingList =
document.getElementById("pendingList");
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
/*==============================
    THÔNG BÁO
==============================*/

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

    // Đếm tài khoản
    const userSnapshot = await getDocs(collection(db,"users"));

    let student = 0;
    let teacher = 0;

    userSnapshot.forEach((doc)=>{

        const data = doc.data();

        if(data.role === "Học sinh"){
            student++;
        }

        if(data.role === "Giáo viên"){
            teacher++;
        }

    });

    // Đếm khóa học
    const courseSnapshot =
    await getDocs(collection(db,"courses"));

    // Đếm video (chưa có collection nên tạm = 0)
    let video = 0;

    document.getElementById("studentCount").textContent = student;
    document.getElementById("teacherCount").textContent = teacher;
    document.getElementById("courseCount").textContent = courseSnapshot.size;
    document.getElementById("videoCount").textContent = video;

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
menuAccounts.addEventListener("click",async()=>{

    setActiveMenu(menuAccounts);

    hideAllPages();

    accountPage.style.display="block";

    await loadAccounts();

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

menuNotifications.addEventListener("click", async ()=>{

    setActiveMenu(menuNotifications);

    hideAllPages();

    notificationPage.style.display="block";

    await loadNotificationCourses();

    await loadNotifications();

});

menuPending.addEventListener("click",async()=>{

    setActiveMenu(menuPending);

    hideAllPages();

    pendingPage.style.display="block";

    await loadPendingStudents();

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
        const subjectName =
courseSubject.options[
courseSubject.selectedIndex
].text;
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

    subjectName,

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

    snapshot.forEach(courseDoc=>{

    const data = courseDoc.data();

    courseList.innerHTML += `

    <div class="course-item">

        <h3>${data.name}</h3>

        <p>Môn học : ${data.subjectName || data.subject}</p>

        <p>Lớp : ${data.grade}</p>

        <p>${data.description}</p>

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

        enrollmentCourse.innerHTML += `
<option value="${doc.id}">
    ${(data.subjectName || data.subject)}
    | Lớp ${data.grade || ""}
    | ${data.name}
</option>
`;

    });

}
/*====================================
        CẤP QUYỀN KHÓA HỌC
====================================*/

async function assignCourse(){

    const studentId = enrollmentStudent.value;
    const courseId = enrollmentCourse.value;

    if(studentId==="" || courseId===""){

        alert("Vui lòng chọn học sinh và khóa học.");

        return;

    }

    try{

        await setDoc(

            doc(db,"enrollments",studentId),

            {

                courses: arrayUnion(courseId)

            },

            {

                merge:true

            }

        );

        alert("Đã cấp quyền thành công.");

    }

    catch(err){

        console.log(err);

        alert(err.message);

    }

}
/*====================================
      LOAD KHÓA HỌC CHO THÔNG BÁO
====================================*/

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
async function loadPendingStudents(){

    pendingPage.querySelector(".dashboard-form").innerHTML="Đang tải...";

    const snapshot=await getDocs(collection(db,"pendingStudents"));

    let html="";

    snapshot.forEach(docItem=>{

        const data=docItem.data();

        html+=`

        <div class="account-card">

            <h3>${data.name}</h3>

            <p>${data.memberId}</p>

            <p>${data.email}</p>

            <p>

                Giáo viên tạo:

                <b>${data.teacherName}</b>

            </p>

            <button
            onclick="approveStudent('${docItem.id}')">

                ✅ Duyệt

            </button>

            <button
            onclick="rejectStudent('${docItem.id}')">

                ❌ Từ chối

            </button>

        </div>

        `;

    });

    if(html===""){

        html="<p>Không có tài khoản chờ duyệt.</p>";

    }

    pendingPage.querySelector(".dashboard-form").innerHTML=html;

}
/*====================================
        XÓA THÔNG BÁO
====================================*/

window.deleteNotification=async function(id){

    if(!confirm("Xóa thông báo?")) return;

    await deleteDoc(doc(db,"notifications",id));

    loadNotifications();

}
async function loadAccounts(){

    accountList.innerHTML="Đang tải...";

    const snapshot =
await getDocs(

    query(
        collection(db,"users"),
        where("role","==","Học sinh"),
        orderBy("memberId")
    )

);

    accountList.innerHTML="";
allStudents = snapshot.docs;
    for(const userDoc of snapshot.docs){

        const user=userDoc.data();

        let htmlCourses="";

        const enrollRef=
        await getDoc(doc(db,"enrollments",userDoc.id));

        if(enrollRef.exists()){

            const ids=enrollRef.data().courses || [];

            for(const id of ids){

                const courseSnap=
                await getDoc(doc(db,"courses",id));

                if(courseSnap.exists()){

                    const c=courseSnap.data();

                    htmlCourses+=`

                    <div class="course-line">

                        <span>

                        📘 ${c.subjectName || c.subject || "Chưa xác định"} - ${c.name}

                        </span>

                        <button
                        onclick="removeCourse('${userDoc.id}','${id}')">

                        Gỡ

                        </button>

                    </div>

                    `;

                }

            }

        }

        if(htmlCourses===""){

            htmlCourses="<i>Chưa có khóa học.</i>";

        }

        accountList.innerHTML += `

<div class="account-card">

    <div>

        <h3>${user.name}</h3>

        <p>${user.memberId}</p>

    </div>

    <button
        class="detail-account"
        onclick="showAccountDetail('${userDoc.id}')">

        <i class="fa-solid fa-eye"></i>

        Xem chi tiết

    </button>

</div>

`;

    }

}
window.removeCourse =
async function(userId,courseId){

    if(!confirm("Gỡ quyền khóa học này?")) return;

    const ref=
    doc(db,"enrollments",userId);

    const snap=
    await getDoc(ref);

    if(!snap.exists()) return;

    let list=snap.data().courses || [];

    list=list.filter(id=>id!==courseId);

    await updateDoc(ref,{

        courses:list

    });

    loadAccounts();

}
window.deleteStudent =
async function(uid){

    if(!confirm("Xóa tài khoản học sinh?")) return;

    await deleteDoc(doc(db,"users",uid));

    const enroll=
    doc(db,"enrollments",uid);

    const snap=
    await getDoc(enroll);

    if(snap.exists()){

        await deleteDoc(enroll);

    }

    loadAccounts();

    loadDashboard();

}
window.showAccountDetail = async function(uid){

    const userSnap = await getDoc(doc(db,"users",uid));

    if(!userSnap.exists()) return;

    const user = userSnap.data();

    let htmlCourses = "";

    const enrollSnap =
    await getDoc(doc(db,"enrollments",uid));

    if(enrollSnap.exists()){

        const ids = enrollSnap.data().courses || [];

        for(const id of ids){

            const courseSnap =
            await getDoc(doc(db,"courses",id));

            if(courseSnap.exists()){

                const c = courseSnap.data();

                htmlCourses += `

<div class="course-line">

<div>

<b>

${c.subjectName || c.subject}

</b>

<br>

Lớp ${c.grade}

<br>

${c.name}

</div>

<button
onclick="removeCourse('${uid}','${id}')">

Xóa

</button>

</div>

`;
            }
        }
    }

    if(htmlCourses===""){

        htmlCourses="<li>Chưa có khóa học.</li>";

    }

    detailContent.innerHTML = `

<img
class="detail-avatar"
src="${user.avatar && user.avatar.trim()!=="" ? user.avatar : "../assets/avatars/default.jpg"}">

<div class="detail-name">

${user.name}

</div>

<div class="detail-role">

${user.memberId}

</div>

<div class="info-grid">

<div class="info-item">

<label>Email</label>

<span>${user.email}</span>

</div>

<div class="info-item">

<label>Mã học sinh</label>

<span>${user.memberId}</span>

</div>

</div>

<h3>

Khóa học đã cấp

</h3>

${htmlCourses}

<button
class="delete-btn"
onclick="deleteStudent('${uid}')">

<i class="fa-solid fa-trash"></i>

Xóa tài khoản

</button>

`;
    accountDetailModal.style.display="flex";

};
closeDetailBtn.addEventListener("click",()=>{

    accountDetailModal.style.display="none";

});
async function loadPendingStudents(){

    pendingList.innerHTML = "Đang tải...";

    const snapshot =
    await getDocs(collection(db,"pendingStudents"));

    pendingList.innerHTML = "";

    if(snapshot.empty){

        pendingList.innerHTML = `
        <p class="empty">
            Không có yêu cầu nào.
        </p>
        `;

        return;

    }

    snapshot.forEach(docItem=>{

        const data = docItem.data();

        pendingList.innerHTML += `

        <div class="account-card">

            <h3>${data.name}</h3>

            <p>${data.memberId}</p>

            <p>${data.email}</p>

            <p>

                <b>Giáo viên tạo:</b>

                ${data.teacherName}

            </p>

            <div class="account-actions">

                <button
                class="edit-btn"
                onclick="approveStudent('${docItem.id}')">

                    ✔ Duyệt

                </button>

                <button
                class="delete-btn"
                onclick="rejectStudent('${docItem.id}')">

                    ✖ Từ chối

                </button>

            </div>

        </div>

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
assignCourseBtn.addEventListener(
    "click",
    assignCourse
);
createNotificationBtn.addEventListener(

    "click",

    createNotification

);
searchAccount.addEventListener("input", () => {

    const keyword = searchAccount.value.trim().toLowerCase();

    const cards = document.querySelectorAll(".account-card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if(text.includes(keyword)){

            card.style.display = "";

        }else{

            card.style.display = "none";

        }

    });

});
logoutBtn.addEventListener("click",async()=>{

    await signOut(auth);

    window.location.href="../index.html";

});
