/*==================================================
        H&T STUDY - EXAM.JS
        Trang kiểm tra
==================================================*/

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/*==================================================
        BIẾN TOÀN CỤC
==================================================*/

let currentUser = null;
let currentRole = "";


/*==================================================
        DOM - NOTIFICATION
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


/*==================================================
        DOM - USER MENU
==================================================*/

const avatar =
    document.querySelector(".avatar");

const userMenu =
    document.getElementById("userMenu");

const userBox =
    document.getElementById("userBox");

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
        DOM - EXAM
==================================================*/

const examList =
    document.getElementById("examList");

const examEmpty =
    document.getElementById("examEmpty");

const examSearch =
    document.getElementById("examSearch");

const examFilterBtns =
    document.querySelectorAll(".exam-filter-btn");


/*==================================================
        NOTIFICATION PANEL
==================================================*/

if (notificationBtn && notificationPanel) {

    notificationBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        if (!auth.currentUser) {

            alert("Bạn cần đăng nhập để xem thông báo.");

            return;
        }

        notificationPanel.classList.toggle("active");

        if (
            notificationPanel.classList.contains("active")
        ) {

            markAllNotificationsAsRead();

        }

    });

}


if (closeNotification && notificationPanel) {

    closeNotification.addEventListener("click", () => {

        notificationPanel.classList.remove("active");

    });

}


/*==================================================
        CLICK RA NGOÀI
==================================================*/

document.addEventListener("click", (e) => {

    if (
        notificationPanel &&
        notificationBtn &&
        !notificationPanel.contains(e.target) &&
        !notificationBtn.contains(e.target)
    ) {

        notificationPanel.classList.remove("active");

    }

});


/*==================================================
        USER MENU
==================================================*/

if (avatar && userMenu) {

    avatar.addEventListener("click", (e) => {

        e.stopPropagation();

        userMenu.classList.toggle("active");

    });

}


document.addEventListener("click", (e) => {

    if (
        userMenu &&
        avatar &&
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


        /*------------------------------------------
                USER KHÔNG TỒN TẠI
        ------------------------------------------*/

        if (!userSnap.exists()) {

            await signOut(auth);

            return;
        }


        const user =
            userSnap.data();


        currentUser =
            auth.currentUser;


        currentRole =
            user.role || "";


        /*------------------------------------------
                HIỂN THỊ USER BOX
        ------------------------------------------*/

        if (userBox) {

            userBox.style.display = "block";

        }


        const userMenuList =
            document.getElementById("userMenuList");

        if (userMenuList) {

            userMenuList.style.display = "block";

        }


        /*------------------------------------------
                AVATAR
        ------------------------------------------*/

        const avatarUrl =
            user.avatar &&
            user.avatar.trim() !== ""

                ? user.avatar

                : "assets/avatars/default.jpg";


        const headerAvatar =
            document.querySelector(".avatar img");


        if (headerAvatar) {

            headerAvatar.src =
                avatarUrl;

        }


        if (userAvatar) {

            userAvatar.src =
                avatarUrl;

        }


        /*------------------------------------------
                THÔNG TIN
        ------------------------------------------*/

        if (userName) {

            userName.textContent =
                user.name || "Người dùng";

        }


        if (userStudentId) {

            userStudentId.textContent =
                user.memberId || "";

        }


        if (userRole) {

            userRole.textContent =
                user.role || "";

        }


        /*------------------------------------------
                PHÂN QUYỀN
        ------------------------------------------*/

        if (myCoursesBtn) {

            myCoursesBtn.style.display =
                "none";

        }


        if (manageBtn) {

            manageBtn.style.display =
                "none";

        }


        if (user.role === "Học sinh") {

            if (myCoursesBtn) {

                myCoursesBtn.style.display =
                    "flex";

            }

        }


        else if (
            user.role === "Giáo viên"
        ) {

            if (manageBtn) {

                manageBtn.style.display =
                    "flex";

            }

        }


        else if (
            user.role === "Admin"
        ) {

            if (manageBtn) {

                manageBtn.style.display =
                    "flex";

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

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

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

if (myCoursesBtn) {

    myCoursesBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-courses.html";

        }
    );

}


/*==================================================
        QUẢN LÝ
==================================================*/

if (manageBtn) {

    manageBtn.addEventListener(
        "click",
        () => {

            if (
                currentRole === "Admin"
            ) {

                window.location.href =
                    "dashboard/admin.html";

            }

            else if (
                currentRole === "Giáo viên"
            ) {

                window.location.href =
                    "dashboard/teacher.html";

            }

        }
    );

}


/*==================================================
        HƯỚNG DẪN
==================================================*/

if (userGuide) {

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

    if (!notificationBadge) return;


    if (number <= 0) {

        notificationBadge.style.display =
            "none";

        return;

    }


    notificationBadge.style.display =
        "flex";

    notificationBadge.textContent =
        number > 99
            ? "99+"
            : number;

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

        date =
            new Date(timestamp);

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
            Math.floor(diff / 60)
            + " phút trước"
        );

    }


    if (diff < 86400) {

        return (
            Math.floor(diff / 3600)
            + " giờ trước"
        );

    }


    if (diff < 172800) {

        return "Hôm qua";

    }


    if (diff < 604800) {

        return (
            Math.floor(diff / 86400)
            + " ngày trước"
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

    if (!notificationList) return;


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


            case "general":

                icon =
                    "fa-solid fa-bullhorn";

                break;

        }


        html += `

            <div
                class="notification-item
                ${item.read ? "" : "unread"}"
            >

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

    try {

        const notificationQuery =
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
            notificationQuery,
            (snapshot) => {

                const notifications = [];

                let unreadCount = 0;


                snapshot.forEach(
                    notificationDoc => {

                        const data =
                            notificationDoc.data();


                        notifications.push({
                            id: notificationDoc.id,
                            ...data
                        });


                        if (!data.read) {

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

            error => {

                console.error(
                    "Lỗi notification:",
                    error
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Không thể load notification:",
            error
        );

    }

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
        EXAM DATA
==================================================*/

let allExams = [];


/*==================================================
        LOAD EXAMS
==================================================*/

async function loadExams() {

    if (!examList) return;


    try {

        examList.innerHTML = `

            <div class="exam-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <p>
                    Đang tải bài kiểm tra...
                </p>

            </div>

        `;


        const examQuery =
            query(
                collection(
                    db,
                    "tests"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                examQuery
            );


        allExams = [];


        snapshot.forEach(
            examDoc => {

                allExams.push({

                    id: examDoc.id,

                    ...examDoc.data()

                });

            }
        );


        renderExams(
            allExams
        );

    }

    catch (error) {

        console.error(
            "Lỗi tải bài kiểm tra:",
            error
        );


        examList.innerHTML = `

            <div class="exam-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>
                    Không thể tải danh sách bài kiểm tra.
                </p>

            </div>

        `;

    }

}


/*==================================================
        RENDER EXAMS
==================================================*/

function renderExams(exams) {

    if (!examList) return;


    if (exams.length === 0) {

        examList.innerHTML = `

            <div class="exam-empty">

                <i class="fa-regular fa-file-lines"></i>

                <h3>
                    Chưa có bài kiểm tra
                </h3>

                <p>
                    Hiện tại chưa có bài kiểm tra nào được mở.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    exams.forEach(exam => {

        const title =
            exam.title ||
            exam.name ||
            "Bài kiểm tra";


        const description =
            exam.description ||
            "Bài kiểm tra trên H&T STUDY";


        const subject =
            exam.subjectName ||
            exam.subject ||
            "";


        const grade =
            exam.grade ||
            "";


        const duration =
            exam.duration ||
            exam.time ||
            0;


        const questionCount =
            exam.questionCount ||
            exam.questionsCount ||
            (
                Array.isArray(exam.questions)
                    ? exam.questions.length
                    : 0
            );


        const status =
            exam.status ||
            "open";


        html += `

            <div
                class="exam-card"
                data-id="${exam.id}"
                data-subject="${subject}"
                data-grade="${grade}"
                data-status="${status}"
            >

                <div class="exam-card-icon">

                    <i class="fa-solid fa-file-pen"></i>

                </div>


                <div class="exam-card-content">

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        ${description}
                    </p>


                    <div class="exam-info">

                        ${
                            subject
                                ? `
                                <span>
                                    <i class="fa-solid fa-book"></i>
                                    ${subject}
                                </span>
                                `
                                : ""
                        }


                        ${
                            grade
                                ? `
                                <span>
                                    <i class="fa-solid fa-graduation-cap"></i>
                                    Lớp ${grade}
                                </span>
                                `
                                : ""
                        }


                        ${
                            duration
                                ? `
                                <span>
                                    <i class="fa-regular fa-clock"></i>
                                    ${duration} phút
                                </span>
                                `
                                : ""
                        }


                        ${
                            questionCount
                                ? `
                                <span>
                                    <i class="fa-solid fa-list-ol"></i>
                                    ${questionCount} câu
                                </span>
                                `
                                : ""
                        }

                    </div>


                    <button
                        class="exam-start-btn"
                        data-id="${exam.id}"
                    >

                        <span>
                            Làm bài
                        </span>

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            </div>

        `;

    });


    examList.innerHTML =
        html;

}


/*==================================================
        CLICK LÀM BÀI
==================================================*/

if (examList) {

    examList.addEventListener(
        "click",
        e => {

            const button =
                e.target.closest(
                    ".exam-start-btn"
                );


            if (!button) return;


            const examId =
                button.dataset.id;


            if (!examId) return;


            if (!currentUser) {

                alert(
                    "Bạn cần đăng nhập để làm bài."
                );

                return;

            }


            window.location.href =
                `exam-detail.html?id=${examId}`;

        }
    );

}


/*==================================================
        TÌM KIẾM BÀI KIỂM TRA
==================================================*/

if (examSearch) {

    examSearch.addEventListener(
        "input",
        () => {

            const keyword =
                examSearch.value
                    .trim()
                    .toLowerCase();


            const filtered =
                allExams.filter(
                    exam => {

                        const title =
                            (
                                exam.title ||
                                exam.name ||
                                ""
                            )
                            .toLowerCase();


                        const description =
                            (
                                exam.description ||
                                ""
                            )
                            .toLowerCase();


                        const subject =
                            (
                                exam.subjectName ||
                                exam.subject ||
                                ""
                            )
                            .toLowerCase();


                        return (

                            title.includes(keyword)

                            ||

                            description.includes(keyword)

                            ||

                            subject.includes(keyword)

                        );

                    }
                );


            renderExams(
                filtered
            );

        }
    );

}


/*==================================================
        FILTER BÀI KIỂM TRA
==================================================*/

examFilterBtns.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".exam-filter-btn"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                const filter =
                    button.dataset.filter;


                if (
                    !filter ||
                    filter === "all"
                ) {

                    renderExams(
                        allExams
                    );

                    return;

                }


                const filtered =
                    allExams.filter(
                        exam => {

                            const subject =
                                (
                                    exam.subject ||
                                    exam.subjectName ||
                                    ""
                                )
                                .toLowerCase();


                            const grade =
                                String(
                                    exam.grade || ""
                                );


                            if (
                                filter === "hoa"
                            ) {

                                return subject.includes(
                                    "hóa"
                                );

                            }


                            if (
                                filter === "toan"
                            ) {

                                return subject.includes(
                                    "toán"
                                );

                            }


                            if (
                                filter === "ly"
                            ) {

                                return subject.includes(
                                    "vật lý"
                                )
                                ||
                                subject.includes(
                                    "lý"
                                );

                            }


                            if (
                                filter === "10" ||
                                filter === "11" ||
                                filter === "12"
                            ) {

                                return grade === filter;

                            }


                            return true;

                        }
                    );


                renderExams(
                    filtered
                );

            }
        );

    }
);


/*==================================================
        AUTH STATE
==================================================*/

onAuthStateChanged(
    auth,
    async user => {

        currentUser =
            user;


        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        await loadUser(
            user.uid
        );


        loadNotifications();


        loadExams();

    }
);
