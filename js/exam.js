import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/*==================================================
        BIẾN NGƯỜI DÙNG
==================================================*/

let currentUser = null;
let currentRole = "";

let authChecked = false;


/*==================================================
        ELEMENTS
==================================================*/

const notificationBtn =
    document.querySelector(".notification-btn");

const notificationPanel =
    document.getElementById("notificationPanel");

const closeNotification =
    document.getElementById("closeNotification");

const notificationBadge =
    document.getElementById("notificationBadge");

const notificationList =
    document.getElementById("notificationList");


const avatar =
    document.querySelector(".avatar");

const userMenu =
    document.getElementById("userMenu");

const userBox =
    document.getElementById("userBox");

const userMenuList =
    document.getElementById("userMenuList");

const userName =
    document.getElementById("userName");

const userStudentId =
    document.getElementById("userStudentId");

const userRole =
    document.getElementById("userRole");

const userAvatar =
    document.getElementById("userAvatar");

const logoutBtn =
    document.getElementById("logoutBtn");

const myCoursesBtn =
    document.getElementById("myCoursesBtn");

const manageBtn =
    document.getElementById("manageBtn");

const userGuide =
    document.getElementById("userGuide");


/*==================================================
        KIỂM TRA ELEMENT
==================================================*/

function elementExists(element) {
    return element !== null && element !== undefined;
}


/*==================================================
        NOTIFICATION PANEL
==================================================*/

if (elementExists(notificationBtn)) {

    notificationBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        /*
        Không yêu cầu đăng nhập lại.
        Firebase Auth đã giữ phiên đăng nhập.
        */

        if (!currentUser) {

            alert("Bạn cần đăng nhập để xem thông báo.");

            return;
        }

        if (elementExists(notificationPanel)) {

            notificationPanel.classList.toggle("active");

            if (
                notificationPanel.classList.contains("active")
            ) {

                markAllNotificationsAsRead();

            }

        }

    });

}


if (elementExists(closeNotification)) {

    closeNotification.addEventListener("click", () => {

        if (elementExists(notificationPanel)) {

            notificationPanel.classList.remove("active");

        }

    });

}


/*==================================================
        ĐÓNG NOTIFICATION KHI CLICK RA NGOÀI
==================================================*/

document.addEventListener("click", (e) => {

    if (!elementExists(notificationPanel)) return;
    if (!elementExists(notificationBtn)) return;

    if (
        !notificationPanel.contains(e.target) &&
        !notificationBtn.contains(e.target)
    ) {

        notificationPanel.classList.remove("active");

    }

});


/*==================================================
        USER MENU
==================================================*/

if (elementExists(avatar)) {

    avatar.addEventListener("click", (e) => {

        e.stopPropagation();

        if (elementExists(userMenu)) {

            userMenu.classList.toggle("active");

        }

    });

}


document.addEventListener("click", (e) => {

    if (!elementExists(userMenu)) return;
    if (!elementExists(avatar)) return;

    if (
        !userMenu.contains(e.target) &&
        !avatar.contains(e.target)
    ) {

        userMenu.classList.remove("active");

    }

});


/*==================================================
        LOAD USER
==================================================*/

async function loadUser(uid) {

    try {

        const userRef =
            doc(db, "users", uid);

        const userSnap =
            await getDoc(userRef);


        /*
        Nếu tài khoản không tồn tại trong Firestore
        thì chỉ đăng xuất.
        KHÔNG chuyển trang ngay.
        */

        if (!userSnap.exists()) {

            console.warn(
                "Không tìm thấy thông tin người dùng."
            );

            await signOut(auth);

            return;

        }


        const user =
            userSnap.data();


        /*------------------------------------------
                HIỆN USER MENU
        ------------------------------------------*/

        if (elementExists(userBox)) {

            userBox.style.display = "block";

        }


        if (elementExists(userMenuList)) {

            userMenuList.style.display = "block";

        }


        /*------------------------------------------
                AVATAR
        ------------------------------------------*/

        const avatarUrl =
            user.avatar &&
            typeof user.avatar === "string" &&
            user.avatar.trim() !== ""

                ? user.avatar

                : "assets/avatars/default.jpg";


        if (elementExists(avatar)) {

            const avatarImg =
                avatar.querySelector("img");

            if (avatarImg) {

                avatarImg.src = avatarUrl;

            }

        }


        if (elementExists(userAvatar)) {

            userAvatar.src = avatarUrl;

        }


        /*------------------------------------------
                THÔNG TIN
        ------------------------------------------*/

        if (elementExists(userName)) {

            userName.textContent =
                user.name || "Người dùng";

        }


        if (elementExists(userStudentId)) {

            userStudentId.textContent =
                user.memberId || "---";

        }


        if (elementExists(userRole)) {

            userRole.textContent =
                user.role || "Học sinh";

        }


        currentRole =
            user.role || "Học sinh";


        currentUser =
            auth.currentUser;


        /*------------------------------------------
                PHÂN QUYỀN
        ------------------------------------------*/

        if (currentRole === "Học sinh") {

            if (elementExists(myCoursesBtn)) {

                myCoursesBtn.style.display = "flex";

            }

            if (elementExists(manageBtn)) {

                manageBtn.style.display = "none";

            }

        }


        else if (currentRole === "Giáo viên") {

            if (elementExists(myCoursesBtn)) {

                myCoursesBtn.style.display = "none";

            }

            if (elementExists(manageBtn)) {

                manageBtn.style.display = "flex";

            }

        }


        else if (currentRole === "Admin") {

            if (elementExists(myCoursesBtn)) {

                myCoursesBtn.style.display = "none";

            }

            if (elementExists(manageBtn)) {

                manageBtn.style.display = "flex";

            }

        }


    }

    catch (error) {

        console.error(
            "Lỗi loadUser:",
            error
        );

    }

}


/*==================================================
        ĐĂNG XUẤT
==================================================*/

if (elementExists(logoutBtn)) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                /*
                Sau khi đăng xuất mới quay về trang chủ.
                */

                window.location.replace(
                    "index.html"
                );

            }

            catch (error) {

                console.error(
                    "Lỗi đăng xuất:",
                    error
                );

                alert(
                    "Không thể đăng xuất. Vui lòng thử lại."
                );

            }

        }
    );

}


/*==================================================
        KHÓA HỌC CỦA TÔI
==================================================*/

if (elementExists(myCoursesBtn)) {

    myCoursesBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-courses.html";

        }
    );

}


/*==================================================
        QUẢN LÍ
==================================================*/

if (elementExists(manageBtn)) {

    manageBtn.addEventListener(
        "click",
        () => {

            if (currentRole === "Admin") {

                window.location.href =
                    "dashboard/admin.html";

            }

            else if (currentRole === "Giáo viên") {

                window.location.href =
                    "dashboard/teacher.html";

            }

        }
    );

}


/*==================================================
        HƯỚNG DẪN
==================================================*/

if (elementExists(userGuide)) {

    userGuide.addEventListener(
        "click",
        () => {

            alert(
                "Chức năng hướng dẫn đang được cập nhật."
            );

        }
    );

}


/*==================================================
        NOTIFICATION BADGE
==================================================*/

function showNotificationBadge(number) {

    if (!elementExists(notificationBadge)) {
        return;
    }


    if (number <= 0) {

        notificationBadge.style.display =
            "none";

        return;

    }


    notificationBadge.style.display =
        "flex";

    notificationBadge.textContent =
        number;

}


/*==================================================
        FORMAT TIME
==================================================*/

function formatTime(timestamp) {

    if (!timestamp) {

        return "Vừa xong";

    }


    let date;


    try {

        date =
            timestamp.toDate();

    }

    catch {

        return "Vừa xong";

    }


    const now =
        new Date();


    const diff =
        Math.floor(
            (now - date) / 1000
        );


    if (diff < 60) {

        return "Vừa xong";

    }


    if (diff < 3600) {

        return (
            Math.floor(diff / 60) +
            " phút trước"
        );

    }


    if (diff < 86400) {

        return (
            Math.floor(diff / 3600) +
            " giờ trước"
        );

    }


    if (diff < 172800) {

        return "Hôm qua";

    }


    if (diff < 604800) {

        return (
            Math.floor(diff / 86400) +
            " ngày trước"
        );

    }


    return date.toLocaleDateString(
        "vi-VN"
    );

}


/*==================================================
        RENDER NOTIFICATIONS
==================================================*/

function renderNotifications(list) {

    if (!elementExists(notificationList)) {
        return;
    }


    if (list.length === 0) {

        notificationList.innerHTML = `

            <div class="notification-empty">

                <i class="fa-regular fa-bell-slash"></i>

                <p>
                    Chưa có thông báo nào.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    list.forEach(item => {

        let icon =
            "fa-solid fa-bullhorn";


        switch (item.type) {

            case "lesson":

                icon =
                    "fa-solid fa-book-open";

                break;


            case "test":

                icon =
                    "fa-solid fa-file-pen";

                break;

        }


        html += `

            <div class="notification-item">

                <div class="notification-icon">

                    <i class="${icon}"></i>

                </div>


                <div class="notification-content">

                    <h4>
                        ${item.title || "Thông báo"}
                    </h4>

                    <p>
                        ${item.content || ""}
                    </p>

                    <span>
                        ${formatTime(item.createdAt)}
                    </span>

                </div>

            </div>

        `;

    });


    notificationList.innerHTML =
        html;

}


/*==================================================
        LOAD NOTIFICATIONS
==================================================*/

function loadNotifications() {

    const q =
        query(
            collection(
                db,
                "notifications"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        q,
        (snapshot) => {

            const notifications = [];

            let unreadCount = 0;


            snapshot.forEach(
                notificationDoc => {

                    const data =
                        notificationDoc.data();


                    notifications.push(
                        {
                            id:
                                notificationDoc.id,

                            ...data
                        }
                    );


                    if (
                        !data.read
                    ) {

                        unreadCount++;

                    }

                }
            );


            renderNotifications(
                notifications
            );


            showNotificationBadge(
                unreadCount
            );

        },

        (error) => {

            console.error(
                "Lỗi load notifications:",
                error
            );

        }
    );

}


/*==================================================
        MARK NOTIFICATIONS AS READ
==================================================*/

async function markAllNotificationsAsRead() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "notifications"
                )
            );


        const promises = [];


        snapshot.forEach(
            notificationDoc => {

                const data =
                    notificationDoc.data();


                if (!data.read) {

                    promises.push(

                        updateDoc(

                            doc(
                                db,
                                "notifications",
                                notificationDoc.id
                            ),

                            {
                                read: true
                            }

                        )

                    );

                }

            }
        );


        await Promise.all(
            promises
        );

    }

    catch (error) {

        console.error(
            "Lỗi đánh dấu thông báo:",
            error
        );

    }

}


/*==================================================
        FIREBASE AUTH
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        /*
        Đây là phần QUAN TRỌNG NHẤT.

        Firebase sẽ khôi phục session từ trang chủ.
        Không tự chuyển sang index.html trong lúc
        Firebase chưa xác định xong trạng thái.
        */


        authChecked = true;


        if (user) {

            /*
            Người dùng đã đăng nhập từ trước.
            Không cần đăng nhập lại.
            */

            currentUser =
                user;


            console.log(
                "Đã khôi phục đăng nhập:",
                user.email
            );


            await loadUser(
                user.uid
            );


            /*
            Load thông báo sau khi xác định
            tài khoản.
            */

            loadNotifications();


            /*
            Nếu sau này exam.js có phần
            load đề thi thì đặt ở đây.
            */

            if (
                typeof loadExam ===
                "function"
            ) {

                await loadExam();

            }

        }

        else {

            /*
            CHỈ khi thực sự không có tài khoản
            mới quay về trang chủ.

            Reload bình thường sẽ KHÔNG chạy
            nhánh này nếu Firebase khôi phục
            được phiên đăng nhập.
            */

            console.log(
                "Chưa đăng nhập."
            );


            /*
            Vì trang Thi thử yêu cầu tài khoản,
            người chưa đăng nhập mới được đưa
            về trang chủ.
            */

            window.location.replace(
                "index.html"
            );

        }

    }
);
