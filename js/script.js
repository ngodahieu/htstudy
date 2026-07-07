import { auth, db } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/*==========================================
        THPT 2027 COUNTDOWN
==========================================*/

// Mốc thời gian đích
// Bạn chỉ cần đổi ngày này khi Bộ GD&ĐT công bố chính thức
const examDate = new Date("June 24, 2027 00:00:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

// Hiệu ứng khi số thay đổi
function animateNumber(element){

    element.classList.remove("number-change");

    void element.offsetWidth;

    element.classList.add("number-change");

}

// Cập nhật đồng hồ
function updateCountdown(){

    const now = new Date().getTime();

    const distance = examDate - now;

    if(distance <= 0){

        daysEl.textContent = "000";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";

        clearInterval(timer);

        return;

    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        / (1000 * 60)
    );

    const seconds = Math.floor(
        (distance % (1000 * 60))
        / 1000
    );

    if(daysEl.textContent != String(days).padStart(3,"0"))
        animateNumber(daysEl);

    if(hoursEl.textContent != String(hours).padStart(2,"0"))
        animateNumber(hoursEl);

    if(minutesEl.textContent != String(minutes).padStart(2,"0"))
        animateNumber(minutesEl);

    if(secondsEl.textContent != String(seconds).padStart(2,"0"))
        animateNumber(secondsEl);

    daysEl.textContent = String(days).padStart(3,"0");
    hoursEl.textContent = String(hours).padStart(2,"0");
    minutesEl.textContent = String(minutes).padStart(2,"0");
    secondsEl.textContent = String(seconds).padStart(2,"0");

}

updateCountdown();

const timer = setInterval(updateCountdown,1000);

/*==========================================
        NOTIFICATION PANEL
==========================================*/

const notificationBtn = document.querySelector(".notification-btn");

const notificationPanel = document.getElementById("notificationPanel");

const closeNotification = document.getElementById("closeNotification");

const notificationBadge = document.querySelector(".badge");

const avatar = document.querySelector(".avatar");

const loginOverlay = document.getElementById("loginOverlay");

const closeLogin = document.getElementById("closeLogin");

/* Mở / Đóng */

notificationBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    notificationPanel.classList.toggle("active");

    // Khi mở thì ẩn badge
    if(notificationPanel.classList.contains("active")){

        notificationBadge.style.opacity="0";

        notificationBadge.style.transform="scale(0)";

    }

});

/* Nút X */

closeNotification.addEventListener("click",()=>{

    notificationPanel.classList.remove("active");

});

/* Click ra ngoài */

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

const userMenu = document.getElementById("userMenu");

const loginBtn = document.getElementById("openLogin");

const guideBtn = document.getElementById("openGuide");

const guestBox = document.getElementById("guestBox");

const userBox = document.getElementById("userBox");

const userName = document.getElementById("userName");

const userStudentId = document.getElementById("userStudentId");

const userRole = document.getElementById("userRole");

const userAvatar = document.getElementById("userAvatar");

const logoutBtn = document.getElementById("logoutBtn");

const coursesLink = document.getElementById("coursesLink");

const examLink = document.getElementById("examLink");

const resultLink = document.getElementById("resultLink");

let currentUser = null;

const myCoursesBtn = document.getElementById("myCoursesBtn");

const manageBtn = document.getElementById("manageBtn");

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

});

/* Mở / Đóng User Menu */

avatar.addEventListener("click", (e) => {

    e.stopPropagation();

    userMenu.classList.toggle("active");

});

/* Click ra ngoài */

document.addEventListener("click", (e) => {

    if (
        !userMenu.contains(e.target) &&
        !avatar.contains(e.target)
    ) {

        userMenu.classList.remove("active");

    }

});


/* ESC */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        notificationPanel.classList.remove("active");

        loginOverlay.style.display="none";

    }

});

/* Nút Đăng nhập */

loginBtn.addEventListener("click", () => {

    userMenu.classList.remove("active");

    loginOverlay.style.display = "flex";

});

/* Hướng dẫn */

guideBtn.addEventListener("click", () => {

    alert("Chức năng đang được cập nhật.");

});
/*==========================================
        LOGIN MODAL
==========================================*/

closeLogin.addEventListener("click",()=>{

    loginOverlay.style.display="none";

});

loginOverlay.addEventListener("click",(e)=>{

    if(e.target===loginOverlay){

        loginOverlay.style.display="none";

    }

});
async function loadUser(uid){

    const docRef = doc(db, "users", uid);

    const docSnap = await getDoc(docRef);

    if(!docSnap.exists()) return;

    const user = docSnap.data();

    guestBox.style.display = "none";
    userBox.style.display = "block";

    document.getElementById("guestMenu").style.display = "none";
    document.getElementById("userMenuList").style.display = "block";

    const avatarUrl =
    user.avatar && user.avatar.trim() !== ""
        ? user.avatar
        : "assets/avatars/default.jpg";

document.querySelector(".avatar img").src = avatarUrl;

userAvatar.src = avatarUrl;
    userName.textContent = user.name;

    userStudentId.textContent = user.studentId;
    
    userRole.textContent = user.role;

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
}
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document
        .getElementById("studentEmail")
        .value
        .trim();

    const password = document
        .getElementById("studentPassword")
        .value;

    try{

const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
);

const uid = userCredential.user.uid;

const docRef = doc(db, "users", uid);

const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

    const userData = docSnap.data();
    await loadUser(uid);

    console.log(userData);

    alert(
        "Xin chào " +
        userData.name +
        "\nVai trò: " +
        userData.role
    );

}
else{

    alert("Không tìm thấy dữ liệu người dùng.");

    return;

}
loginOverlay.style.display = "none";

loginForm.reset();
    }catch(error){

        alert(error.message);

    }

});

/*==========================================
        KIỂM TRA ĐĂNG NHẬP
==========================================*/

function requireLogin(event){

    if(currentUser) return;

    event.preventDefault();

    loginOverlay.style.display = "flex";

    userMenu.classList.remove("active");

    alert("Bạn cần đăng nhập để sử dụng chức năng này.");

}

coursesLink.addEventListener("click", requireLogin);

examLink.addEventListener("click", requireLogin);

resultLink.addEventListener("click", requireLogin);

myCoursesBtn.addEventListener("click", requireLogin);

manageBtn.addEventListener("click", requireLogin);

onAuthStateChanged(auth, async (user) => {

    currentUser = user;
    
    if (user) {

        await loadUser(user.uid);

    } else {

        guestBox.style.display = "block";
        userBox.style.display = "none";

        document.getElementById("guestMenu").style.display = "block";
        document.getElementById("userMenuList").style.display = "none";

        document.querySelector(".avatar img").src =
            "assets/avatars/default.jpg";
        myCoursesBtn.style.display = "none";

manageBtn.style.display = "none";
    }

});
