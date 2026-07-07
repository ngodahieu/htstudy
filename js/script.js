import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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

/* ESC */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        notificationPanel.classList.remove("active");

    }

});

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

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("Đăng nhập thành công!");

    }catch(error){

        alert(error.message);

    }

});
