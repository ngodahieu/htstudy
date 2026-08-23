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
    orderBy

}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/*==================================================
                BIẾN TOÀN CỤC
==================================================*/

let currentUser = null;

let currentCourseId = null;
let currentChapterId = null;
let currentLessonId = null;
let currentTestId = null;

let currentRole = "";

let coursesData = [];

let chaptersData = [];

let lessonsData = [];

let testsData = [];


/*==================================================
                DOM
==================================================*/

const examLoading =
    document.getElementById("examLoading");

const examEmpty =
    document.getElementById("examEmpty");

const courseList =
    document.getElementById("courseList");

const courseExamList =
    document.getElementById("courseExamList");

const courseDetail =
    document.getElementById("courseDetail");

const courseDetailContent =
    document.getElementById("courseDetailContent");

const testDetail =
    document.getElementById("testDetail");

const testDetailContent =
    document.getElementById("testDetailContent");

const backToCourses =
    document.getElementById("backToCourses");

const backToLesson =
    document.getElementById("backToLesson");


/*==================================================
                HEADER - NOTIFICATION
==================================================*/

const notificationBtn =
    document.querySelector(".notification-btn");

const notificationPanel =
    document.getElementById("notificationPanel");

const closeNotification =
    document.getElementById("closeNotification");


if (notificationBtn) {

    notificationBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        if (!auth.currentUser) {

            alert("Bạn cần đăng nhập để xem thông báo.");

            return;

        }

        notificationPanel.classList.toggle("active");

    });

}


if (closeNotification) {

    closeNotification.addEventListener("click", () => {

        notificationPanel.classList.remove("active");

    });

}


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

const avatar =
    document.querySelector(".avatar");

const userMenu =
    document.getElementById("userMenu");


if (avatar) {

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
                USER ELEMENTS
==================================================*/

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
                LOAD USER
==================================================*/

async function loadUser(uid) {

    try {

        const userRef =
            doc(db, "users", uid);

        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            await signOut(auth);

            return;

        }


        const user =
            userSnap.data();


        if (userBox) {

            userBox.style.display = "block";

        }


        const userMenuList =
            document.getElementById("userMenuList");

        if (userMenuList) {

            userMenuList.style.display = "block";

        }


        const avatarUrl =
            user.avatar &&
            user.avatar.trim() !== ""

                ? user.avatar

                : "assets/avatars/default.jpg";


        const headerAvatar =
            document.querySelector(".avatar img");


        if (headerAvatar) {

            headerAvatar.src = avatarUrl;

        }


        if (userAvatar) {

            userAvatar.src = avatarUrl;

        }


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


        currentRole =
            user.role || "";


        /* HỌC SINH */

        if (user.role === "Học sinh") {

            if (myCoursesBtn) {

                myCoursesBtn.style.display = "flex";

            }

            if (manageBtn) {

                manageBtn.style.display = "none";

            }

        }


        /* GIÁO VIÊN */

        else if (user.role === "Giáo viên") {

            if (myCoursesBtn) {

                myCoursesBtn.style.display = "none";

            }

            if (manageBtn) {

                manageBtn.style.display = "flex";

            }

        }


        /* ADMIN */

        else if (user.role === "Admin") {

            if (myCoursesBtn) {

                myCoursesBtn.style.display = "none";

            }

            if (manageBtn) {

                manageBtn.style.display = "flex";

            }

        }


    }

    catch (error) {

        console.error(
            "Lỗi load user:",
            error
        );

    }

}


/*==================================================
        LẤY KHÓA HỌC ĐƯỢC CẤP
==================================================*/

async function loadGrantedCourses() {

    try {

        showLoading();


        const enrollmentRef =
            doc(
                db,
                "enrollments",
                currentUser.uid
            );


        const enrollmentSnap =
            await getDoc(enrollmentRef);


        if (!enrollmentSnap.exists()) {

            showEmpty();

            return;

        }


        const enrollment =
            enrollmentSnap.data();


        const courseIds =
            enrollment.courses || [];


        if (!courseIds.length) {

            showEmpty();

            return;

        }


        coursesData = [];


        for (const courseId of courseIds) {

            try {

                const courseRef =
                    doc(
                        db,
                        "courses",
                        courseId
                    );


                const courseSnap =
                    await getDoc(courseRef);


                if (!courseSnap.exists()) {

                    continue;

                }


                const course =
                    courseSnap.data();


                coursesData.push({

                    id: courseSnap.id,

                    ...course

                });

            }

            catch (error) {

                console.error(
                    "Không thể tải khóa học:",
                    courseId,
                    error
                );

            }

        }


        if (!coursesData.length) {

            showEmpty();

            return;

        }


        sortCourses();


        renderCourses();


        hideLoading();


    }

    catch (error) {

        console.error(
            "Lỗi load khóa học:",
            error
        );

        showEmpty();

    }

}


/*==================================================
                SẮP XẾP KHÓA HỌC
==================================================*/

function sortCourses() {

    coursesData.sort((a, b) => {

        const gradeA =
            Number(a.grade) || 0;

        const gradeB =
            Number(b.grade) || 0;


        if (gradeA !== gradeB) {

            return gradeA - gradeB;

        }


        return (
            (a.name || "")
                .localeCompare(
                    b.name || "",
                    "vi"
                )
        );

    });

}


/*==================================================
                RENDER KHÓA HỌC
==================================================*/

function renderCourses() {

    courseExamList.innerHTML = "";


    coursesData.forEach(course => {

        courseExamList.innerHTML += `

            <div
                class="exam-course-card"
                data-course-id="${course.id}"
            >

                <div class="exam-course-image">

                    <img
                        src="${course.image || "assets/images/default-course.jpg"}"
                        alt="${escapeHTML(course.name || "Khóa học")}"
                    >

                </div>


                <div class="exam-course-info">

                    <span class="exam-course-subject">

                        <i class="fa-solid fa-book"></i>

                        ${escapeHTML(
                            course.subjectName ||
                            course.subject ||
                            "Môn học"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            course.name ||
                            "Khóa học"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            course.description ||
                            "Xem chương, bài học và các bài kiểm tra."
                        )}

                    </p>


                    <div class="exam-course-meta">

                        <span>

                            <i class="fa-solid fa-layer-group"></i>

                            Lớp ${escapeHTML(
                                String(course.grade || "")
                            )}

                        </span>


                        <span>

                            <i class="fa-solid fa-shield-check"></i>

                            Đã được cấp

                        </span>

                    </div>


                    <button
                        class="exam-open-course"
                        data-course-id="${course.id}"
                    >

                        Xem bài kiểm tra

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            </div>

        `;

    });


    document
        .querySelectorAll(".exam-open-course")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openCourse(
                        button.dataset.courseId
                    );

                }
            );

        });

}


/*==================================================
                MỞ KHÓA HỌC
==================================================*/

async function openCourse(courseId) {

    currentCourseId =
        courseId;


    const course =
        coursesData.find(
            item => item.id === courseId
        );


    if (!course) {

        return;

    }


    courseList.style.display =
        "none";

    testDetail.style.display =
        "none";

    courseDetail.style.display =
        "block";


    courseDetailContent.innerHTML = `

        <div class="detail-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Đang tải chương...
            </span>

        </div>

    `;


    try {

        const chaptersRef =
            collection(
                db,
                "courses",
                courseId,
                "chapters"
            );


        const chapterSnapshot =
            await getDocs(chaptersRef);


        chaptersData = [];


        chapterSnapshot.forEach(
            chapterDoc => {

                chaptersData.push({

                    id: chapterDoc.id,

                    ...chapterDoc.data()

                });

            }
        );


        sortChapters();


        await renderCourseDetail(course);

    }

    catch (error) {

        console.error(
            "Lỗi load chapter:",
            error
        );


        courseDetailContent.innerHTML = `

            <div class="exam-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>
                    Không thể tải dữ liệu khóa học.
                </p>

            </div>

        `;

    }

}


/*==================================================
                SẮP XẾP CHƯƠNG
==================================================*/

function sortChapters() {

    chaptersData.sort((a, b) => {

        return (
            Number(a.order) -
            Number(b.order)
        );

    });

}


/*==================================================
                RENDER KHÓA HỌC
==================================================*/

async function renderCourseDetail(course) {

    let html = `

        <div class="course-detail-header">

            <div>

                <span class="detail-badge">

                    <i class="fa-solid fa-book"></i>

                    ${escapeHTML(
                        course.subjectName ||
                        course.subject ||
                        "Môn học"
                    )}

                </span>


                <h2>

                    ${escapeHTML(
                        course.name ||
                        "Khóa học"
                    )}

                </h2>


                <p>

                    ${escapeHTML(
                        course.description || ""
                    )}

                </p>

            </div>

        </div>


        <div class="course-hierarchy">

    `;


    if (!chaptersData.length) {

        html += `

            <div class="exam-empty-small">

                <i class="fa-regular fa-folder-open"></i>

                <p>
                    Khóa học chưa có chương nào.
                </p>

            </div>

        `;

        html += `</div>`;

        courseDetailContent.innerHTML =
            html;

        return;

    }


    for (
        let chapterIndex = 0;
        chapterIndex < chaptersData.length;
        chapterIndex++
    ) {

        const chapter =
            chaptersData[chapterIndex];


        html += `

            <div
                class="chapter-block"
                data-chapter-id="${chapter.id}"
            >

                <div class="chapter-header">

                    <div class="chapter-number">

                        ${chapterIndex + 1}

                    </div>


                    <div>

                        <span>
                            CHƯƠNG ${chapterIndex + 1}
                        </span>

                        <h3>

                            ${escapeHTML(
                                chapter.title ||
                                "Chương chưa đặt tên"
                            )}

                        </h3>

                        ${
                            chapter.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            chapter.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <div
                    class="lesson-list"
                    id="lesson-list-${chapter.id}"
                >

                    <div class="detail-loading">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        Đang tải bài học...

                    </div>

                </div>

            </div>

        `;

    }


    html += `</div>`;


    courseDetailContent.innerHTML =
        html;


    for (const chapter of chaptersData) {

        await loadLessonsForChapter(
            chapter
        );

    }

}


/*==================================================
                LOAD LESSON
==================================================*/

async function loadLessonsForChapter(chapter) {

    const lessonContainer =
        document.getElementById(
            `lesson-list-${chapter.id}`
        );


    if (!lessonContainer) {

        return;

    }


    try {

        const lessonsRef =
            collection(
                db,
                "courses",
                currentCourseId,
                "chapters",
                chapter.id,
                "lessons"
            );


        const lessonSnapshot =
            await getDocs(
                lessonsRef
            );


        lessonsData = [];


        lessonSnapshot.forEach(
            lessonDoc => {

                lessonsData.push({

                    id: lessonDoc.id,

                    chapterId: chapter.id,

                    ...lessonDoc.data()

                });

            }
        );


        lessonsData.sort(
            (a, b) =>
                Number(a.order) -
                Number(b.order)
        );


        if (!lessonsData.length) {

            lessonContainer.innerHTML = `

                <div class="lesson-empty">

                    <i class="fa-regular fa-file"></i>

                    Chương này chưa có bài học.

                </div>

            `;

            return;

        }


        lessonContainer.innerHTML = "";


        for (
            let i = 0;
            i < lessonsData.length;
            i++
        ) {

            const lesson =
                lessonsData[i];


            const lessonElement =
                document.createElement("div");


            lessonElement.className =
                "lesson-block";


            lessonElement.innerHTML = `

                <div class="lesson-header">

                    <div class="lesson-number">

                        ${i + 1}

                    </div>


                    <div class="lesson-title">

                        <span>
                            BÀI ${i + 1}
                        </span>

                        <h4>

                            ${escapeHTML(
                                lesson.title ||
                                "Bài học"
                            )}

                        </h4>

                    </div>


                    <i
                        class="fa-solid fa-chevron-down lesson-arrow"
                    ></i>

                </div>


                <div
                    class="lesson-tests"
                    style="display:none;"
                >

                    <div class="detail-loading">

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        Đang tải bài kiểm tra...

                    </div>

                </div>

            `;


            const lessonHeader =
                lessonElement.querySelector(
                    ".lesson-header"
                );


            const testContainer =
                lessonElement.querySelector(
                    ".lesson-tests"
                );


            lessonHeader.addEventListener(
                "click",
                async () => {

                    const isOpen =
                        testContainer.style.display !== "none";


                    if (isOpen) {

                        testContainer.style.display =
                            "none";


                        lessonElement
                            .classList
                            .remove("open");


                        return;

                    }


                    testContainer.style.display =
                        "block";


                    lessonElement
                        .classList
                        .add("open");


                    await loadTestsForLesson(
                        lesson,
                        testContainer
                    );

                }
            );


            lessonContainer.appendChild(
                lessonElement
            );

        }

    }

    catch (error) {

        console.error(
            "Lỗi load lessons:",
            error
        );


        lessonContainer.innerHTML = `

            <div class="exam-error">

                Không thể tải bài học.

            </div>

        `;

    }

}


/*==================================================
                LOAD TEST
==================================================*/

async function loadTestsForLesson(
    lesson,
    container
) {

    try {

        const testsRef =
            collection(
                db,
                "courses",
                currentCourseId,
                "tests"
            );


        const testQuery =
            query(
                testsRef,
                where(
                    "lessonId",
                    "==",
                    lesson.id
                )
            );


        const testSnapshot =
            await getDocs(testQuery);


        testsData = [];


        testSnapshot.forEach(
            testDoc => {

                testsData.push({

                    id: testDoc.id,

                    ...testDoc.data()

                });

            }
        );


        testsData.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds || 0;

                const bTime =
                    b.createdAt?.seconds || 0;

                return aTime - bTime;

            }
        );


        if (!testsData.length) {

            container.innerHTML = `

                <div class="test-empty">

                    <i class="fa-regular fa-file-circle-xmark"></i>

                    <span>
                        Bài học này chưa có bài kiểm tra.
                    </span>

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        testsData.forEach(
            (test, index) => {

                const testElement =
                    document.createElement("div");


                testElement.className =
                    "test-item";


                testElement.innerHTML = `

                    <div class="test-icon">

                        <i class="fa-solid fa-file-pen"></i>

                    </div>


                    <div class="test-info">

                        <span>
                            BÀI KIỂM TRA ${index + 1}
                        </span>

                        <h5>

                            ${escapeHTML(
                                test.title ||
                                "Bài kiểm tra"
                            )}

                        </h5>


                        <div class="test-meta">

                            <span>

                                <i class="fa-regular fa-clock"></i>

                                ${formatDuration(
                                    test.duration
                                )}

                            </span>


                            <span>

                                <i class="fa-solid fa-list-ol"></i>

                                ${test.questionCount || 0}
                                câu

                            </span>


                            ${
                                test.type
                                    ? `
                                        <span>

                                            <i class="fa-solid fa-tag"></i>

                                            ${escapeHTML(
                                                test.type
                                            )}

                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>


                    <button
                        class="open-test-btn"
                    >

                        Chi tiết

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                `;


                testElement
                    .querySelector(".open-test-btn")
                    .addEventListener(
                        "click",
                        (e) => {

                            e.stopPropagation();

                            openTestDetail(
                                test
                            );

                        }
                    );


                container.appendChild(
                    testElement
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Lỗi load tests:",
            error
        );


        container.innerHTML = `

            <div class="exam-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Không thể tải bài kiểm tra.

            </div>

        `;

    }

}


/*==================================================
            CHI TIẾT BÀI KIỂM TRA
==================================================*/

function openTestDetail(test) {

    currentTestId =
        test.id;


    courseDetail.style.display =
        "none";

    testDetail.style.display =
        "block";


    const questionCount =
        test.questionCount || 0;


    const totalPoints =
        test.totalPoints || 0;


    testDetailContent.innerHTML = `

        <div class="test-detail-card">


            <div class="test-detail-top">

                <div class="test-detail-icon">

                    <i class="fa-solid fa-file-circle-question"></i>

                </div>


                <div>

                    <span class="detail-badge">

                        BÀI KIỂM TRA

                    </span>


                    <h2>

                        ${escapeHTML(
                            test.title ||
                            "Bài kiểm tra"
                        )}

                    </h2>


                    ${
                        test.description
                            ? `
                                <p class="test-description">

                                    ${escapeHTML(
                                        test.description
                                    )}

                                </p>
                              `
                            : ""
                    }

                </div>

            </div>


            <div class="test-stat-grid">


                <div class="test-stat">

                    <i class="fa-regular fa-clock"></i>

                    <div>

                        <span>
                            Thời gian
                        </span>

                        <strong>

                            ${formatDuration(
                                test.duration
                            )}

                        </strong>

                    </div>

                </div>


                <div class="test-stat">

                    <i class="fa-solid fa-list-ol"></i>

                    <div>

                        <span>
                            Số câu hỏi
                        </span>

                        <strong>

                            ${questionCount} câu

                        </strong>

                    </div>

                </div>


                <div class="test-stat">

                    <i class="fa-solid fa-star"></i>

                    <div>

                        <span>
                            Tổng điểm
                        </span>

                        <strong>

                            ${totalPoints}

                        </strong>

                    </div>

                </div>


                <div class="test-stat">

                    <i class="fa-solid fa-layer-group"></i>

                    <div>

                        <span>
                            Loại bài
                        </span>

                        <strong>

                            ${escapeHTML(
                                test.type ||
                                "Thi thử"
                            )}

                        </strong>

                    </div>

                </div>


            </div>


            <div class="test-structure">

                <h3>

                    <i class="fa-solid fa-list-check"></i>

                    Nội dung bài kiểm tra

                </h3>


                <div class="structure-grid">


                    <div class="structure-item">

                        <span>
                            Phần 1
                        </span>

                        <strong>

                            ${getPartCount(
                                test.part1
                            )} câu

                        </strong>

                    </div>


                    <div class="structure-item">

                        <span>
                            Phần 2
                        </span>

                        <strong>

                            ${getPartCount(
                                test.part2
                            )} câu

                        </strong>

                    </div>


                    <div class="structure-item">

                        <span>
                            Phần 3
                        </span>

                        <strong>

                            ${getPartCount(
                                test.part3
                            )} câu

                        </strong>

                    </div>

                </div>

            </div>


            <div class="test-action">

                <button
                    class="start-test-btn"
                    id="startTestBtn"
                >

                    <i class="fa-solid fa-play"></i>

                    Bắt đầu làm bài

                </button>

            </div>


        </div>

    `;


    document
        .getElementById("startTestBtn")
        .addEventListener(
            "click",
            () => {

                startTest(test);

            }
        );

}


/*==================================================
            BẮT ĐẦU BÀI KIỂM TRA
==================================================*/

function startTest(test) {

    /*
        Hiện tại chuyển sang test.html
        và truyền testId + courseId.

        Sau này test.html sẽ dùng hai ID này
        để tải câu hỏi thực tế.
    */

    const params =
        new URLSearchParams({

            courseId:
                currentCourseId,

            testId:
                test.id

        });


    window.location.href =
        `test.html?${params.toString()}`;

}


/*==================================================
                QUAY LẠI
==================================================*/

backToCourses.addEventListener(
    "click",
    () => {

        testDetail.style.display =
            "none";

        courseDetail.style.display =
            "none";

        courseList.style.display =
            "block";

        currentCourseId =
            null;

        currentChapterId =
            null;

        currentLessonId =
            null;

        currentTestId =
            null;

    }
);


backToLesson.addEventListener(
    "click",
    () => {

        testDetail.style.display =
            "none";

        courseDetail.style.display =
            "block";

    }
);


/*==================================================
                USER BUTTONS
==================================================*/

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            /*
                Không chuyển sang trang đăng nhập.
                Sau khi đăng xuất mới về trang chủ.
            */

            window.location.href =
                "index.html";

        }
    );

}


if (myCoursesBtn) {

    myCoursesBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "my-courses.html";

        }
    );

}


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


if (userGuide) {

    userGuide.addEventListener(
        "click",
        () => {

            alert(
                "Chọn khóa học → chương → bài học → bài kiểm tra để xem chi tiết."
            );

        }
    );

}


/*==================================================
                AUTH
==================================================*/

onAuthStateChanged(
    auth,
    async (user) => {

        /*
            Firebase tự khôi phục phiên đăng nhập.

            Vì vậy:

            Trang chủ đăng nhập
                    ↓
            exam.html
                    ↓
            reload
                    ↓
            vẫn giữ user

            Không bắt đăng nhập lại.
        */

        currentUser =
            user;


        if (!user) {

            /*
                Không dùng localStorage để giả đăng nhập.
                Firebase Auth tự quản lý session.
            */

            window.location.replace(
                "index.html"
            );

            return;

        }


        await loadUser(
            user.uid
        );


        await loadGrantedCourses();

    }
);


/*==================================================
                LOADING
==================================================*/

function showLoading() {

    if (examLoading) {

        examLoading.style.display =
            "flex";

    }

    if (examEmpty) {

        examEmpty.style.display =
            "none";

    }

    if (courseList) {

        courseList.style.display =
            "none";

    }

}


function hideLoading() {

    if (examLoading) {

        examLoading.style.display =
            "none";

    }

    if (courseList) {

        courseList.style.display =
            "block";

    }

}


function showEmpty() {

    if (examLoading) {

        examLoading.style.display =
            "none";

    }

    if (courseList) {

        courseList.style.display =
            "none";

    }

    if (courseDetail) {

        courseDetail.style.display =
            "none";

    }

    if (testDetail) {

        testDetail.style.display =
            "none";

    }

    if (examEmpty) {

        examEmpty.style.display =
            "flex";

    }

}


/*==================================================
                FORMAT
==================================================*/

function formatDuration(minutes) {

    const value =
        Number(minutes) || 0;


    if (value <= 0) {

        return "Không giới hạn";

    }


    if (value < 60) {

        return `${value} phút`;

    }


    const hours =
        Math.floor(value / 60);

    const mins =
        value % 60;


    if (mins === 0) {

        return `${hours} giờ`;

    }


    return `${hours} giờ ${mins} phút`;

}


/*==================================================
                ĐẾM CÂU
==================================================*/

function getPartCount(part) {

    if (!part) {

        return 0;

    }


    if (Array.isArray(part)) {

        return part.length;

    }


    if (
        typeof part === "object"
    ) {

        if (
            Array.isArray(part.questions)
        ) {

            return part.questions.length;

        }


        if (
            typeof part.questionCount ===
            "number"
        ) {

            return part.questionCount;

        }

    }


    if (
        typeof part === "number"
    ) {

        return part;

    }


    return 0;

}


/*==================================================
                ESCAPE HTML
==================================================*/

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
