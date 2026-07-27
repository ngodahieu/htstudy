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
    serverTimestamp,
    orderBy,
    deleteDoc,
    getCountFromServer,
    updateDoc,
    setDoc
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
const menuCourses =
document.getElementById("menuCourses");

const coursePage =
document.getElementById("coursePage");

const teacherCourseList =
document.getElementById("teacherCourseList");

const courseManagePage =
document.getElementById("courseManagePage");

const manageCourseTitle =
document.getElementById("manageCourseTitle");

const backToCoursesBtn =
document.getElementById("backToCoursesBtn");

const createChapterBtn =
document.getElementById("createChapterBtn");

const chapterList =
document.getElementById("chapterList");
const lessonPage =
document.getElementById("lessonPage");

const lessonPageTitle =
document.getElementById("lessonPageTitle");

const lessonList =
document.getElementById("lessonList");

const backToChapterBtn =
document.getElementById("backToChapterBtn");

const createLessonBtn =
document.getElementById("createLessonBtn");

const lessonModal =
document.getElementById("lessonModal");

const lessonTitle =
document.getElementById("lessonTitle");

const lessonDescription =
document.getElementById("lessonDescription");

const lessonOrder =
document.getElementById("lessonOrder");

const saveLesson =
document.getElementById("saveLesson");

const cancelLesson =
document.getElementById("cancelLesson");

let currentChapterId = "";
let editingLessonId = "";
const chapterModal =
document.getElementById("chapterModal");

const chapterTitle =
document.getElementById("chapterTitle");

const chapterDescription =
document.getElementById("chapterDescription");

const saveChapter =
document.getElementById("saveChapter");

const cancelChapter =
document.getElementById("cancelChapter");

let currentCourseId = "";
let editingChapterId = "";
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
    coursePage.style.display = "none";
    courseManagePage.style.display = "none";
    notificationPage.style.display = "none";
    lessonPage.style.display = "none";
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
menuCourses.addEventListener("click", async()=>{

    setActiveMenu(menuCourses);

    hideAllPages();

    coursePage.style.display="block";

    await loadMyCourses();

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

    const q = query(

    collection(db,"courses"),

    where("teacherId","==",currentTeacherId)

);

const snapshot = await getDocs(q);

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
        if(courseId===""){

    alert("Vui lòng chọn khóa học.");

    return;

}
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
window.deleteNotification = async function(id){

    if(!confirm("Xóa thông báo?")) return;

    await deleteDoc(doc(db,"notifications",id));

    loadNotifications();

}
/*====================================
        KHÓA HỌC CỦA TÔI
====================================*/

async function loadMyCourses(){

    teacherCourseList.innerHTML = "Đang tải...";

    const q = query(

        collection(db,"courses"),

        where("teacherId","==",currentTeacherId)

    );

    const snapshot = await getDocs(q);

    teacherCourseList.innerHTML = "";

    if(snapshot.empty){

        teacherCourseList.innerHTML = `

        <div class="empty">

            Bạn chưa được phân công khóa học nào.

        </div>

        `;

        return;

    }

    snapshot.forEach(courseDoc=>{

        const course = courseDoc.data();

        teacherCourseList.innerHTML += `

        <div class="course-item">

            <h3>${course.name}</h3>

            <p>

                📚 ${course.subject}

            </p>

            <p>

                🎓 Lớp ${course.grade}

            </p>

            <button
onclick="openCourse('${courseDoc.id}')">

Quản lý khóa học

</button>

        </div>

        `;

    });

}
window.openCourse = async function(courseId){

    currentCourseId = courseId;

    const snap = await getDoc(doc(db,"courses",courseId));
    if(!snap.exists()){

    alert("Không tìm thấy khóa học.");

    return;

}

    const data = snap.data();

    hideAllPages();

    courseManagePage.style.display = "block";

    manageCourseTitle.textContent =
`${data.subjectName || data.subject} ${data.grade} - ${data.name}`;
    await loadChapters();

}
window.openChapter = async function(chapterId,title){

    currentChapterId = chapterId;

    hideAllPages();

    lessonPage.style.display="block";

    lessonPageTitle.textContent =
    "Bài học - " + title;

    await loadLessons();

}
backToChapterBtn.addEventListener("click",async()=>{

    hideAllPages();

    courseManagePage.style.display="block";

    await loadChapters();

});
createLessonBtn.addEventListener("click",()=>{

    editingLessonId = "";

    lessonTitle.value = "";

    lessonDescription.value = "";

    lessonOrder.value = "";

    lessonModal.style.display="flex";

});
cancelLesson.addEventListener("click",()=>{

    lessonModal.style.display="none";

});
saveLesson.addEventListener(
    "click",
    saveNewLesson
);
async function saveNewLesson(){

    const title = lessonTitle.value.trim();

    const description = lessonDescription.value.trim();

    const order = Number(lessonOrder.value);

    if(title===""){

        alert("Nhập tên bài học.");

        return;

    }

    if(order<=0){

        alert("Thứ tự không hợp lệ.");

        return;

    }

    // ==========================
    // ĐANG SỬA
    // ==========================

    if(editingLessonId !== ""){

        await updateDoc(

            doc(

                db,

                "courses",

                currentCourseId,

                "chapters",

                currentChapterId,

                "lessons",

                editingLessonId

            ),

            {

                title,

                description,

                order

            }

        );

    }

    // ==========================
    // THÊM MỚI
    // ==========================

    else{

        const lessonId = "lesson_" + Date.now();

        await setDoc(

            doc(

                db,

                "courses",

                currentCourseId,

                "chapters",

                currentChapterId,

                "lessons",

                lessonId

            ),

            {

                title,

                description,

                order,

                createdAt:serverTimestamp()

            }

        );

    }

    editingLessonId = "";

    lessonTitle.value = "";

    lessonDescription.value = "";

    lessonOrder.value = "";

    lessonModal.style.display = "none";

    await loadLessons();

}
async function loadLessons(){

    lessonList.innerHTML = "Đang tải...";

    const q = query(

        collection(

            db,

            "courses",

            currentCourseId,

            "chapters",

            currentChapterId,

            "lessons"

        ),

        orderBy("order")

    );

    const snapshot = await getDocs(q);

    lessonList.innerHTML = "";

    if(snapshot.empty){

        lessonList.innerHTML = `

        <p class="empty">

            Chưa có bài học nào.

        </p>

        `;

        return;

    }

    snapshot.forEach(lesson=>{

        const data = lesson.data();

        lessonList.innerHTML += `

<div class="chapter-card">

    <h3>

        ${data.order}. ${data.title}

    </h3>

    <p>

        ${data.description || ""}

    </p>

    <div class="chapter-actions">

        <button
        class="chapter-edit"
        onclick="editLesson('${lesson.id}')">

            Sửa

        </button>

        <button
        class="chapter-delete"
        onclick="deleteLesson('${lesson.id}')">

            Xóa

        </button>

    </div>

</div>

`;

    });

}
window.deleteLesson = async function(lessonId){

    if(!confirm("Bạn có chắc muốn xóa bài học này?")){

        return;

    }

    await deleteDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            currentChapterId,

            "lessons",

            lessonId

        )

    );

    await loadLessons();

}
window.editChapter = async function(chapterId){

    editingChapterId = chapterId;

    const snap = await getDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            chapterId

        )

    );

    if(!snap.exists()){

        alert("Không tìm thấy chương.");

        return;

    }

    const data = snap.data();

    chapterTitle.value = data.title;

    chapterDescription.value = data.description || "";

    chapterModal.style.display = "flex";

}
window.deleteChapter = async function(chapterId){

    if(!confirm("Bạn có chắc muốn xóa chương này?")){

        return;

    }

    const lessonSnapshot = await getDocs(

        collection(

            db,

            "courses",

            currentCourseId,

            "chapters",

            chapterId,

            "lessons"

        )

    );

    if(!lessonSnapshot.empty){

        alert("Chương vẫn còn bài học.\nHãy xóa hết bài học trước.");

        return;

    }

    await deleteDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            chapterId

        )

    );

    await loadChapters();

}
window.editLesson = async function(lessonId){

    editingLessonId = lessonId;

    const snap = await getDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            currentChapterId,

            "lessons",

            lessonId

        )

    );

    if(!snap.exists()){

        alert("Không tìm thấy bài học.");

        return;

    }

    const data = snap.data();

    lessonTitle.value = data.title;

    lessonDescription.value = data.description || "";

    lessonOrder.value = data.order;

    lessonModal.style.display = "flex";

}
backToCoursesBtn.addEventListener("click",async()=>{

    hideAllPages();

    coursePage.style.display="block";

    await loadMyCourses();

});
createChapterBtn.addEventListener(()=>{

    editingChapterId = "";

    chapterTitle.value = "";

    chapterDescription.value = "";

    chapterModal.style.display = "flex";

});
cancelChapter.addEventListener("click",()=>{

    chapterModal.style.display="none";

});
async function saveNewChapter(){

    const title =
    chapterTitle.value.trim();

    const description =
    chapterDescription.value.trim();

    if(title===""){

        alert("Nhập tên chương.");

        return;

    }

if(editingChapterId !== ""){

    await updateDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            editingChapterId

        ),

        {

            title,

            description

        }

    );

}
else{

    const id = "chapter_" + Date.now();

    await setDoc(

        doc(

            db,

            "courses",

            currentCourseId,

            "chapters",

            id

        ),

        {

            title,

            description,

            createdAt:serverTimestamp()

        }

    );

}

    chapterTitle.value="";

    chapterDescription.value="";
    editingChapterId = "";

    chapterModal.style.display="none";

    await loadChapters();

}
saveChapter.addEventListener(
    "click",
    saveNewChapter
);
async function loadChapters(){

    chapterList.innerHTML="Đang tải...";

    const q = query(

    collection(

        db,

        "courses",

        currentCourseId,

        "chapters"

    ),

    orderBy("createdAt")

);

const snapshot = await getDocs(q);

    chapterList.innerHTML="";

    if(snapshot.empty){

        chapterList.innerHTML=`

        <p class="empty">

            Chưa có chương nào.

        </p>

        `;

        return;

    }

    snapshot.forEach(chapter=>{

        const data =
        chapter.data();

        chapterList.innerHTML += `

        <div class="chapter-card">

    <h3>${data.title}</h3>

    <p>${data.description}</p>

<div class="chapter-actions">

    <button
    class="chapter-edit"
    onclick="openChapter('${chapter.id}','${data.title}')">

        Quản lý bài học

    </button>

    <button
    class="chapter-edit"
    onclick="editChapter('${chapter.id}')">

        Sửa

    </button>
    <button
class="chapter-delete"
onclick="deleteChapter('${chapter.id}')">

    Xóa

</button>

</div>

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
