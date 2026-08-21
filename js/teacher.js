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
const menuTests =
document.getElementById("menuTests");

const testPage =
document.getElementById("testPage");

const testList =
document.getElementById("testList");

const testModal =
document.getElementById("testModal");

const createTestBtn =
document.getElementById("createTestBtn");

const cancelTest =
document.getElementById("cancelTest");

const saveTest =
document.getElementById("saveTest");

const testCourse =
document.getElementById("testCourse");

const testChapter =
document.getElementById("testChapter");

const testLesson =
document.getElementById("testLesson");

const testTitle =
document.getElementById("testTitle");

const testType =
document.getElementById("testType");

const testDescription =
document.getElementById("testDescription");

const part1Point =
document.getElementById("part1Point");

const part2Score1 =
document.getElementById("part2Score1");

const part2Score2 =
document.getElementById("part2Score2");

const part2Score3 =
document.getElementById("part2Score3");

const part2Score4 =
document.getElementById("part2Score4");

const part3Point =
document.getElementById("part3Point");

const part1Questions =
document.getElementById("part1Questions");

const part2Questions =
document.getElementById("part2Questions");

const part3Questions =
document.getElementById("part3Questions");

const addPart1QuestionBtn =
document.getElementById("addPart1QuestionBtn");

const addPart2QuestionBtn =
document.getElementById("addPart2QuestionBtn");

const addPart3QuestionBtn =
document.getElementById("addPart3QuestionBtn");

const testQuestionTotal =
document.getElementById("testQuestionTotal");

const testTotalPoint =
document.getElementById("testTotalPoint");
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
document.getElementById(
    "mainDashboardHeader"
);

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

const pdfFile =
document.getElementById("pdfFile");

const imageFile =
document.getElementById("imageFile");

const documentFile =
document.getElementById("documentFile");

const changePdfBtn =
document.getElementById("changePdfBtn");
const uploadImageBtn =
document.getElementById("uploadImageBtn");

const uploadDocumentBtn =
document.getElementById("uploadDocumentBtn");
const videoFile =
document.getElementById("videoFile");

const uploadVideoBtn =
document.getElementById("uploadVideoBtn");


const videoResult =
document.getElementById("videoResult");
const pdfResult =
document.getElementById("pdfResult");

const imageResult =
document.getElementById("imageResult");

const documentResult =
document.getElementById("documentResult");
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
const chapterOrder =
document.getElementById("chapterOrder");
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
/* ====================================
        TEST BUILDER
==================================== */

let part1QuestionData = [];
let part2QuestionData = [];
let part3QuestionData = [];

let testImageCounter = 0;
function hideAllPages(){

    dashboardHeader.style.display = "none";

    dashboardCards.style.display = "none";

    studentPage.style.display = "none";
    coursePage.style.display = "none";
    courseManagePage.style.display = "none";
    lessonPage.style.display = "none";
    notificationPage.style.display = "none";
    testPage.style.display = "none";
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
// ========================================
// MENU BÀI KIỂM TRA
// ========================================

menuTests.addEventListener("click", async () => {

    setActiveMenu(menuTests);

    hideAllPages();

    testPage.style.display = "block";

    await loadTestCourses();

});
/* ====================================
        LOAD BÀI KIỂM TRA
==================================== */

async function loadTeacherTests(){

    testList.innerHTML = "Đang tải...";

    const q = query(
        collection(db, "courses")
    );

    const snapshot =
        await getDocs(q);

    const tests = [];

    for(const courseDoc of snapshot.docs){

        const course =
            courseDoc.data();

        if(course.teacherId !== currentTeacherId){
            continue;
        }

        const testSnapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    courseDoc.id,
                    "tests"
                )
            );

        for(const testDoc of testSnapshot.docs){

            const test =
                testDoc.data();

            tests.push({

                id: testDoc.id,

                courseId: courseDoc.id,

                courseName:
                    `${course.subjectName || course.subject || ""} ${course.grade || ""} - ${course.name || ""}`,

                ...test

            });

        }

    }

    if(!tests.length){

        testList.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-file-circle-xmark"></i>

                <h3>
                    Chưa có bài kiểm tra nào
                </h3>

                <p>
                    Hãy bấm "Tạo bài kiểm tra" để tạo bài đầu tiên.
                </p>

            </div>

        `;

        return;

    }

    testList.innerHTML = "";

    for(const test of tests){

        let locationText =
            "Chưa xác định vị trí";

        if(test.chapterId && test.lessonId){

            try{

                const chapterSnap =
                    await getDoc(
                        doc(
                            db,
                            "courses",
                            test.courseId,
                            "chapters",
                            test.chapterId
                        )
                    );

                const lessonSnap =
                    await getDoc(
                        doc(
                            db,
                            "courses",
                            test.courseId,
                            "chapters",
                            test.chapterId,
                            "lessons",
                            test.lessonId
                        )
                    );

                const chapter =
                    chapterSnap.exists()
                        ? chapterSnap.data()
                        : {};

                const lesson =
                    lessonSnap.exists()
                        ? lessonSnap.data()
                        : {};

                locationText = `
                    Chương ${chapter.order || ""}
                    ${chapter.title || ""}
                    → Bài ${lesson.order || ""}
                    ${lesson.title || ""}
                `;

            }
            catch(error){

                console.error(error);

            }

        }

        testList.innerHTML += `

            <div class="chapter-card test-item">

                <div>

                    <h3>

                        <i class="fa-solid fa-file-circle-check"></i>

                        ${escapeHtmlTeacher(
                            test.title || "Bài kiểm tra"
                        )}

                    </h3>

                    <p>

                        📚 ${escapeHtmlTeacher(
                            test.courseName
                        )}

                    </p>

                    <p>

                        📍 ${locationText}

                    </p>

                    <p>

                        ⏱ ${Number(test.duration || 0)} phút

                        &nbsp; | &nbsp;

                        📝 ${Number(test.questionCount || 0)} câu

                        &nbsp; | &nbsp;

                        ⭐ ${Number(test.totalPoints || 0)} điểm

                    </p>

                </div>

                <div class="chapter-actions">

                    <button
                        class="chapter-delete"
                        onclick="deleteTeacherTest(
                            '${test.courseId}',
                            '${test.id}'
                        )">

                        Xóa

                    </button>

                </div>

            </div>

        `;

    }

}
function escapeHtmlTeacher(value = ""){

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}
window.deleteTeacherTest =
async function(courseId, testId){

    if(
        !confirm(
            "Bạn có chắc muốn xóa bài kiểm tra này?"
        )
    ){

        return;

    }

    try{

        await deleteDoc(
            doc(
                db,
                "courses",
                courseId,
                "tests",
                testId
            )
        );

        alert(
            "Đã xóa bài kiểm tra."
        );

        await loadTeacherTests();

    }
    catch(error){

        console.error(error);

        alert(
            "Không thể xóa bài kiểm tra."
        );

    }

};
createTestBtn.addEventListener(
    "click",
    async () => {

        resetTestBuilder();

        await loadTestCourses();

        testModal.style.display = "flex";

    }
);
cancelTest.addEventListener(
    "click",
    () => {

        testModal.style.display = "none";

    }
);
async function loadTestCourses(){

    testCourse.innerHTML = `

        <option value="">
            -- Chọn khóa học --
        </option>

    `;

    const q = query(
        collection(db, "courses"),
        where(
            "teacherId",
            "==",
            currentTeacherId
        )
    );

    const snapshot =
        await getDocs(q);

    snapshot.forEach(courseDoc => {

        const data =
            courseDoc.data();

        testCourse.innerHTML += `

            <option value="${courseDoc.id}">

                ${escapeHtmlTeacher(
                    data.subjectName ||
                    data.subject ||
                    ""
                )}
                ${escapeHtmlTeacher(
                    data.grade || ""
                )}
                -
                ${escapeHtmlTeacher(
                    data.name || ""
                )}

            </option>

        `;

    });

}
testCourse.addEventListener(
    "change",
    async () => {

        const courseId =
            testCourse.value;

        testChapter.innerHTML = `

            <option value="">
                -- Chọn chương --
            </option>

        `;

        testLesson.innerHTML = `

            <option value="">
                -- Chọn bài học --
            </option>

        `;

        testChapter.disabled = true;

        testLesson.disabled = true;

        if(!courseId){

            return;

        }

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    courseId,
                    "chapters"
                )
            );

        const chapters = [];

        snapshot.forEach(chapterDoc => {

            chapters.push({

                id: chapterDoc.id,

                ...chapterDoc.data()

            });

        });

        chapters.sort(
            (a,b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );

        chapters.forEach(chapter => {

            testChapter.innerHTML += `

                <option value="${chapter.id}">

                    Chương
                    ${escapeHtmlTeacher(
                        chapter.order || ""
                    )}

                    -
                    ${escapeHtmlTeacher(
                        chapter.title || ""
                    )}

                </option>

            `;

        });

        testChapter.disabled =
            chapters.length === 0;

    }
);
testChapter.addEventListener(
    "change",
    async () => {

        const courseId =
            testCourse.value;

        const chapterId =
            testChapter.value;

        testLesson.innerHTML = `

            <option value="">
                -- Chọn bài học --
            </option>

        `;

        testLesson.disabled = true;

        if(!courseId || !chapterId){

            return;

        }

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "courses",
                    courseId,
                    "chapters",
                    chapterId,
                    "lessons"
                )
            );

        const lessons = [];

        snapshot.forEach(lessonDoc => {

            lessons.push({

                id: lessonDoc.id,

                ...lessonDoc.data()

            });

        });

        lessons.sort(
            (a,b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );

        lessons.forEach(lesson => {

            testLesson.innerHTML += `

                <option value="${lesson.id}">

                    Bài
                    ${escapeHtmlTeacher(
                        lesson.order || ""
                    )}

                    -
                    ${escapeHtmlTeacher(
                        lesson.title || ""
                    )}

                </option>

            `;

        });

        testLesson.disabled =
            lessons.length === 0;

    }
);
addPart1QuestionBtn.addEventListener(
    "click",
    () => {

        const index =
            part1QuestionData.length;

        part1QuestionData.push({

            question: "",

            image: "",

            options: [
                "",
                "",
                "",
                ""
            ],

            correctAnswer: 0

        });

        renderPart1Questions();

        updateTestTotal();

    }
);
function renderPart1Questions(){

    if(!part1QuestionData.length){

        part1Questions.innerHTML = `

            <div class="question-empty">

                Chưa có câu hỏi nào.

            </div>

        `;

        return;

    }

    part1Questions.innerHTML = "";

    part1QuestionData.forEach(
        (question, index) => {

            const box =
                document.createElement("div");

            box.className =
                "teacher-question";

            box.innerHTML = `

                <div class="question-builder-top">

                    <h4>

                        Câu ${index + 1}

                    </h4>

                    <button
                        type="button"
                        class="remove-question"
                        data-index="${index}">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>


                <div class="form-group">

                    <label>
                        Nội dung câu hỏi
                    </label>

                    <textarea
                        class="part1-question"
                        data-index="${index}"
                        rows="4"
                        placeholder="Nhập nội dung câu hỏi...">${escapeHtmlTeacher(
                            question.question
                        )}</textarea>

                </div>


                <div class="question-image-box">

                    <label>
                        Hình ảnh câu hỏi
                        <small>(không bắt buộc)</small>
                    </label>

                    <input
                        type="file"
                        class="part1-image"
                        data-index="${index}"
                        accept="image/*">

                    <div class="image-preview">

                        ${
                            question.image
                            ? `
                                <img
                                    src="${question.image}"
                                    class="question-image-preview">
                              `
                            : `
                                <span>
                                    Chưa có hình ảnh
                                </span>
                              `
                        }

                    </div>

                </div>


                <div class="options-builder">

                    ${question.options.map(
                        (option, optionIndex) => `

                            <div class="option-row">

                                <input
                                    type="radio"
                                    name="part1Correct${index}"
                                    value="${optionIndex}"
                                    ${
                                        Number(
                                            question.correctAnswer
                                        ) === optionIndex
                                            ? "checked"
                                            : ""
                                    }>

                                <input
                                    type="text"
                                    class="part1-option"
                                    data-index="${index}"
                                    data-option="${optionIndex}"
                                    value="${escapeHtmlTeacher(
                                        option
                                    )}"
                                    placeholder="Đáp án ${
                                        String.fromCharCode(
                                            65 + optionIndex
                                        )
                                    }">

                            </div>

                        `
                    ).join("")}

                </div>

                <small class="auto-text">

                    Chọn ● để đánh dấu đáp án đúng.

                </small>

            `;

            part1Questions.appendChild(box);

        }
    );


    part1Questions
        .querySelectorAll(".part1-question")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    part1QuestionData[index].question =
                        event.target.value;

                }
            );

        });


    part1Questions
        .querySelectorAll(".part1-option")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const optionIndex =
                        Number(
                            event.target.dataset.option
                        );

                    part1QuestionData[index]
                        .options[optionIndex] =
                        event.target.value;

                }
            );

        });


    part1Questions
        .querySelectorAll(
            'input[type="radio"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                event => {

                    const box =
                        event.target.closest(
                            ".teacher-question"
                        );

                    const index =
                        Number(
                            box.querySelector(
                                ".part1-question"
                            ).dataset.index
                        );

                    part1QuestionData[index]
                        .correctAnswer =
                        Number(
                            event.target.value
                        );

                }
            );

        });


    part1Questions
        .querySelectorAll(".remove-question")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    part1QuestionData.splice(
                        index,
                        1
                    );

                    renderPart1Questions();

                    updateTestTotal();

                }
            );

        });


    part1Questions
        .querySelectorAll(".part1-image")
        .forEach(input => {

            input.addEventListener(
                "change",
                async event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const file =
                        event.target.files[0];

                    if(!file){

                        return;

                    }

                    const url =
                        await uploadTestImage(file);

                    if(url){

                        part1QuestionData[index]
                            .image = url;

                        renderPart1Questions();

                    }

                }
            );

        });

}
addPart2QuestionBtn.addEventListener(
    "click",
    () => {

        part2QuestionData.push({

            question: "",

            image: "",

            statements: [
                "",
                "",
                "",
                ""
            ],

            answers: [
                true,
                false,
                false,
                false
            ]

        });

        renderPart2Questions();

        updateTestTotal();

    }
);
function renderPart2Questions(){

    if(!part2QuestionData.length){

        part2Questions.innerHTML = `

            <div class="question-empty">

                Chưa có câu hỏi nào.

            </div>

        `;

        return;

    }

    part2Questions.innerHTML = "";

    part2QuestionData.forEach(
        (question, index) => {

            const box =
                document.createElement("div");

            box.className =
                "teacher-question";

            box.innerHTML = `

                <div class="question-builder-top">

                    <h4>
                        Câu ${index + 1}
                    </h4>

                    <button
                        type="button"
                        class="remove-question"
                        data-index="${index}">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>


                <div class="form-group">

                    <label>
                        Nội dung câu hỏi
                    </label>

                    <textarea
                        class="part2-question"
                        data-index="${index}"
                        rows="4"
                        placeholder="Nhập nội dung câu hỏi...">${escapeHtmlTeacher(
                            question.question
                        )}</textarea>

                </div>


                <div class="question-image-box">

                    <label>
                        Hình ảnh câu hỏi
                        <small>(không bắt buộc)</small>
                    </label>

                    <input
                        type="file"
                        class="part2-image"
                        data-index="${index}"
                        accept="image/*">

                    <div class="image-preview">

                        ${
                            question.image
                            ? `
                                <img
                                    src="${question.image}"
                                    class="question-image-preview">
                              `
                            : `
                                <span>
                                    Chưa có hình ảnh
                                </span>
                              `
                        }

                    </div>

                </div>


                <div class="true-false-builder">

                    ${question.statements.map(
                        (statement, statementIndex) => `

                            <div class="tf-row">

                                <div class="tf-label">

                                    ${String.fromCharCode(
                                        97 + statementIndex
                                    )}.

                                </div>

                                <input
                                    type="text"
                                    class="part2-statement"
                                    data-index="${index}"
                                    data-statement="${statementIndex}"
                                    value="${escapeHtmlTeacher(
                                        statement
                                    )}"
                                    placeholder="Nhập ý ${String.fromCharCode(
                                        97 + statementIndex
                                    )}...">

                                <select
                                    class="part2-answer"
                                    data-index="${index}"
                                    data-statement="${statementIndex}">

                                    <option
                                        value="true"
                                        ${
                                            question.answers[
                                                statementIndex
                                            ] === true
                                                ? "selected"
                                                : ""
                                        }>

                                        Đúng

                                    </option>

                                    <option
                                        value="false"
                                        ${
                                            question.answers[
                                                statementIndex
                                            ] === false
                                                ? "selected"
                                                : ""
                                        }>

                                        Sai

                                    </option>

                                </select>

                            </div>

                        `
                    ).join("")}

                </div>

            `;

            part2Questions.appendChild(box);

        }
    );


    part2Questions
        .querySelectorAll(".part2-question")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    part2QuestionData[index]
                        .question =
                        event.target.value;

                }
            );

        });


    part2Questions
        .querySelectorAll(".part2-statement")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const statementIndex =
                        Number(
                            event.target.dataset.statement
                        );

                    part2QuestionData[index]
                        .statements[
                            statementIndex
                        ] =
                        event.target.value;

                }
            );

        });


    part2Questions
        .querySelectorAll(".part2-answer")
        .forEach(select => {

            select.addEventListener(
                "change",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const statementIndex =
                        Number(
                            event.target.dataset.statement
                        );

                    part2QuestionData[index]
                        .answers[
                            statementIndex
                        ] =
                        event.target.value === "true";

                }
            );

        });


    part2Questions
        .querySelectorAll(".remove-question")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    part2QuestionData.splice(
                        index,
                        1
                    );

                    renderPart2Questions();

                    updateTestTotal();

                }
            );

        });


    part2Questions
        .querySelectorAll(".part2-image")
        .forEach(input => {

            input.addEventListener(
                "change",
                async event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const file =
                        event.target.files[0];

                    if(!file){

                        return;

                    }

                    const url =
                        await uploadTestImage(file);

                    if(url){

                        part2QuestionData[index]
                            .image = url;

                        renderPart2Questions();

                    }

                }
            );

        });

}
addPart3QuestionBtn.addEventListener(
    "click",
    () => {

        part3QuestionData.push({

            question: "",

            image: "",

            answer: ""

        });

        renderPart3Questions();

        updateTestTotal();

    }
);
function renderPart3Questions(){

    if(!part3QuestionData.length){

        part3Questions.innerHTML = `

            <div class="question-empty">

                Chưa có câu hỏi nào.

            </div>

        `;

        return;

    }

    part3Questions.innerHTML = "";

    part3QuestionData.forEach(
        (question, index) => {

            const box =
                document.createElement("div");

            box.className =
                "teacher-question";

            box.innerHTML = `

                <div class="question-builder-top">

                    <h4>
                        Câu ${index + 1}
                    </h4>

                    <button
                        type="button"
                        class="remove-question"
                        data-index="${index}">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>


                <div class="form-group">

                    <label>
                        Nội dung câu hỏi
                    </label>

                    <textarea
                        class="part3-question"
                        data-index="${index}"
                        rows="4"
                        placeholder="Nhập nội dung câu hỏi...">${escapeHtmlTeacher(
                            question.question
                        )}</textarea>

                </div>


                <div class="question-image-box">

                    <label>
                        Hình ảnh câu hỏi
                        <small>(không bắt buộc)</small>
                    </label>

                    <input
                        type="file"
                        class="part3-image"
                        data-index="${index}"
                        accept="image/*">

                    <div class="image-preview">

                        ${
                            question.image
                            ? `
                                <img
                                    src="${question.image}"
                                    class="question-image-preview">
                              `
                            : `
                                <span>
                                    Chưa có hình ảnh
                                </span>
                              `
                        }

                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Đáp án đúng
                    </label>

                    <input
                        type="text"
                        class="part3-answer"
                        data-index="${index}"
                        value="${escapeHtmlTeacher(
                            question.answer
                        )}"
                        placeholder="Ví dụ: 0,25">

                </div>

            `;

            part3Questions.appendChild(box);

        }
    );


    part3Questions
        .querySelectorAll(".part3-question")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    part3QuestionData[index]
                        .question =
                        event.target.value;

                }
            );

        });


    part3Questions
        .querySelectorAll(".part3-answer")
        .forEach(input => {

            input.addEventListener(
                "input",
                event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    part3QuestionData[index]
                        .answer =
                        event.target.value;

                }
            );

        });


    part3Questions
        .querySelectorAll(".remove-question")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    part3QuestionData.splice(
                        index,
                        1
                    );

                    renderPart3Questions();

                    updateTestTotal();

                }
            );

        });


    part3Questions
        .querySelectorAll(".part3-image")
        .forEach(input => {

            input.addEventListener(
                "change",
                async event => {

                    const index =
                        Number(
                            event.target.dataset.index
                        );

                    const file =
                        event.target.files[0];

                    if(!file){

                        return;

                    }

                    const url =
                        await uploadTestImage(file);

                    if(url){

                        part3QuestionData[index]
                            .image = url;

                        renderPart3Questions();

                    }

                }
            );

        });

}
function updateTestTotal(){

    const count1 =
        part1QuestionData.length;

    const count2 =
        part2QuestionData.length;

    const count3 =
        part3QuestionData.length;


    const point1 =
        Number(part1Point.value) || 0;


    const score2Max =
        Number(part2Score4.value) || 0;


    const point3 =
        Number(part3Point.value) || 0;


    const totalQuestions =
        count1 +
        count2 +
        count3;


    const totalPoint =
        (count1 * point1) +
        (count2 * score2Max) +
        (count3 * point3);


    testQuestionTotal.textContent =
        totalQuestions;


    testTotalPoint.textContent =
        totalPoint
            .toFixed(2)
            .replace(/\.00$/, "");

}
[
    part1Point,
    part2Score1,
    part2Score2,
    part2Score3,
    part2Score4,
    part3Point
].forEach(input => {

    input.addEventListener(
        "input",
        updateTestTotal
    );

});
async function uploadTestImage(file){

    if(!file){

        return "";

    }

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        UPLOAD_PRESET
    );

    formData.append(
        "resource_type",
        "image"
    );

    try{

        const response =
            await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if(data.secure_url){

            return data.secure_url;

        }

        alert(
            "Upload hình ảnh thất bại."
        );

        return "";

    }
    catch(error){

        console.error(error);

        alert(
            "Có lỗi khi upload hình ảnh."
        );

        return "";

    }

}
saveTest.addEventListener(
    "click",
    saveNewTest
);
async function saveNewTest(){

    try{

        const courseId =
            testCourse.value;

        const chapterId =
            testChapter.value;

        const lessonId =
            testLesson.value;

        const title =
            testTitle.value.trim();

        const description =
            testDescription.value.trim();

        const duration =
            Number(
                testType.value.replace("p","")
            );


        /* =========================
           KIỂM TRA
        ========================== */

        if(!courseId){

            alert(
                "Vui lòng chọn khóa học."
            );

            return;

        }

        if(!chapterId){

            alert(
                "Vui lòng chọn chương."
            );

            return;

        }

        if(!lessonId){

            alert(
                "Vui lòng chọn bài học."
            );

            return;

        }

        if(!title){

            alert(
                "Vui lòng nhập tên bài kiểm tra."
            );

            return;

        }


        if(
            !part1QuestionData.length &&
            !part2QuestionData.length &&
            !part3QuestionData.length
        ){

            alert(
                "Bài kiểm tra chưa có câu hỏi."
            );

            return;

        }


        /* =========================
           VALIDATE PHẦN I
        ========================== */

        for(
            let i = 0;
            i < part1QuestionData.length;
            i++
        ){

            const q =
                part1QuestionData[i];

            if(!q.question.trim()){

                alert(
                    `Phần I - Câu ${i + 1} chưa có nội dung.`
                );

                return;

            }

            if(
                q.options.some(
                    option =>
                        !option.trim()
                )
            ){

                alert(
                    `Phần I - Câu ${i + 1} chưa nhập đủ 4 đáp án.`
                );

                return;

            }

        }


        /* =========================
           VALIDATE PHẦN II
        ========================== */

        for(
            let i = 0;
            i < part2QuestionData.length;
            i++
        ){

            const q =
                part2QuestionData[i];

            if(!q.question.trim()){

                alert(
                    `Phần II - Câu ${i + 1} chưa có nội dung.`
                );

                return;

            }

            if(
                q.statements.some(
                    statement =>
                        !statement.trim()
                )
            ){

                alert(
                    `Phần II - Câu ${i + 1} chưa nhập đủ 4 ý.`
                );

                return;

            }

        }


        /* =========================
           VALIDATE PHẦN III
        ========================== */

        for(
            let i = 0;
            i < part3QuestionData.length;
            i++
        ){

            const q =
                part3QuestionData[i];

            if(!q.question.trim()){

                alert(
                    `Phần III - Câu ${i + 1} chưa có nội dung.`
                );

                return;

            }

            if(!q.answer.trim()){

                alert(
                    `Phần III - Câu ${i + 1} chưa có đáp án.`
                );

                return;

            }

        }


        /* =========================
           TỔNG ĐIỂM
        ========================== */

        const totalPoints =
            (
                part1QuestionData.length *
                Number(part1Point.value || 0)
            )
            +
            (
                part2QuestionData.length *
                Number(part2Score4.value || 0)
            )
            +
            (
                part3QuestionData.length *
                Number(part3Point.value || 0)
            );


        /* =========================
           TỔNG SỐ CÂU
        ========================== */

        const questionCount =
            part1QuestionData.length +
            part2QuestionData.length +
            part3QuestionData.length;


        /* =========================
           TẠO DOCUMENT
        ========================== */

        const testData = {

            title,

            description,

            type:
                testType.value,

            duration,

            courseId,

            chapterId,

            lessonId,

            teacherId:
                currentTeacherId,

            teacherName:
                currentTeacherName,


            part1: {

                points:
                    Number(
                        part1Point.value || 0
                    ),

                questions:
                    part1QuestionData

            },


            part2: {

                scores: {

                    one:
                        Number(
                            part2Score1.value || 0
                        ),

                    two:
                        Number(
                            part2Score2.value || 0
                        ),

                    three:
                        Number(
                            part2Score3.value || 0
                        ),

                    four:
                        Number(
                            part2Score4.value || 0
                        )

                },

                questions:
                    part2QuestionData

            },


            part3: {

                points:
                    Number(
                        part3Point.value || 0
                    ),

                questions:
                    part3QuestionData

            },


            questionCount,

            totalPoints,

            createdAt:
                serverTimestamp()

        };


        /* =========================
           LƯU FIRESTORE
        ========================== */

        await addDoc(

            collection(
                db,
                "courses",
                courseId,
                "tests"
            ),

            testData

        );


        alert(
            "Đã tạo bài kiểm tra thành công."
        );


        testModal.style.display =
            "none";


        resetTestBuilder();


        await loadTeacherTests();

    }
    catch(error){

        console.error(error);

        alert(
            "Không thể tạo bài kiểm tra: " +
            error.message
        );

    }

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
        const lessonRef = doc(
    db,
    "courses",
    currentCourseId,
    "chapters",
    currentChapterId,
    "lessons",
    editingLessonId
);

const snap = await getDoc(lessonRef);

const oldData = snap.data();
        if(pdfFile.files.length){

    await uploadPdf();

}
        if(videoFile.files.length){

    await uploadVideo();

}
        const video = uploadedVideoLink || oldData.video;

const pdf = uploadedPdfLink || oldData.pdf;
        await updateDoc(

    lessonRef,

    {

        title,

        description,

        order,

        video,

        pdf

    }

);
    }

    // ==========================
    // THÊM MỚI
    // ==========================

    else{

        const lessonId = "lesson_" + Date.now();
if(videoFile.files.length){

    await uploadVideo();

}
if(uploadedVideoLink===""){

    alert("Chưa upload video.");

    return;

}

// Nếu đã chọn file nhưng chưa upload
if(pdfFile.files.length){

    await uploadPdf();

}

// Sau khi upload xong vẫn chưa có link
if(uploadedPdfLink===""){

    alert("Chưa có file PDF.");

    return;

}
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
    video: uploadedVideoLink,
    pdf: uploadedPdfLink,
    createdAt: serverTimestamp()
}

        );

    }

    editingLessonId = "";

    lessonTitle.value = "";

    lessonDescription.value = "";

    lessonOrder.value = "";

videoResult.textContent = "";

uploadedVideoLink = "";

videoFile.value = "";

pdfFile.value = "";

pdfResult.textContent = "";

uploadedPdfLink = "";
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
    chapterOrder.value = data.order || 1;

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

uploadedVideoLink = data.video || "";

uploadedPdfLink = data.pdf || "";
    videoResult.innerHTML = data.video
? `<a href="${data.video}" target="_blank">🎥 Video hiện tại</a>`
: "";

pdfResult.innerHTML = data.pdf
? `<a href="${data.pdf}" target="_blank">📄 PDF hiện tại</a>`
: "";
}
backToCoursesBtn.addEventListener("click",async()=>{

    hideAllPages();

    coursePage.style.display="block";

    await loadMyCourses();

});
createChapterBtn.addEventListener("click",()=>{

    editingChapterId = "";

    chapterTitle.value = "";

chapterDescription.value = "";

chapterOrder.value = "";

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

    const order = Number(chapterOrder.value);

    if(title===""){

    alert("Nhập tên chương.");

    return;

}

if(order <= 0){

    alert("Thứ tự chương không hợp lệ.");

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

            description,

            order

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

            order,

            createdAt:serverTimestamp()

        }

    );

}

    chapterTitle.value="";

chapterDescription.value="";

chapterOrder.value="";
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

    orderBy("order")

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

changePdfBtn.addEventListener("click",()=>{

    pdfFile.click();

});
pdfFile.addEventListener("change",()=>{

    if(!pdfFile.files.length) return;

    const file = pdfFile.files[0];

    pdfResult.innerHTML = `
<div class="file-preview">

📄 <b>${file.name}</b>

<br>

Dung lượng:
${(file.size/1024/1024).toFixed(2)} MB

<br>

<span style="color:#ff9800">

● Sẽ upload khi bấm Lưu

</span>

</div>
`;

});
uploadVideoBtn.addEventListener(
    "click",
    () => {

        videoFile.click();

    }
);
videoFile.addEventListener("change",()=>{

    if(!videoFile.files.length) return;

    const file = videoFile.files[0];

    videoResult.innerHTML = `
    <div class="file-preview">
    🎥 <b>${file.name}</b>
    <br>
    Dung lượng:
    ${(file.size/1024/1024).toFixed(2)} MB
    <br>
    <span style="color:#ff9800">
    ● Sẽ upload khi bấm Lưu
    </span>
    </div>
    `;

});
let uploadedPdfLink = "";
let uploadedVideoLink = "";
const CLOUD_NAME = "xhljajy6";
const UPLOAD_PRESET = "htstudy";
async function uploadPdf(){

    const file = pdfFile.files[0];

    if(!file){

        alert("Vui lòng chọn file PDF.");

        return;

    }

    pdfResult.textContent = "Đang upload...";

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    formData.append("resource_type", "raw");

    try{

        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,

            {

                method:"POST",

                body:formData

            }

        );

        const data = await response.json();

        if(data.secure_url){

            uploadedPdfLink = data.secure_url;

            pdfResult.innerHTML = `
✅ Upload thành công

<br><br>

<a href="${uploadedPdfLink}" target="_blank">

📄 Xem PDF

</a>
`;
        }

        else{

            console.log(data);

            alert("Upload thất bại.");

        }

    }

    catch(err){

        console.log(err);

        alert("Có lỗi khi upload.");

    }

}
async function uploadVideo(){

    const file = videoFile.files[0];

    if(!file){

        alert("Vui lòng chọn video.");

        return;

    }

    videoResult.textContent = "Đang upload...";

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    formData.append("resource_type", "video");

    try{

        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
            {
                method:"POST",
                body:formData
            }

        );

        const data = await response.json();

        if(data.secure_url){

            uploadedVideoLink = data.secure_url;

            videoResult.innerHTML = `
            ✅ Upload thành công
            <br><br>
            <a href="${uploadedVideoLink}" target="_blank">
            🎥 Xem video
            </a>
            `;

        }else{

            console.log(data);

            alert("Upload video thất bại.");

        }

    }catch(err){

        console.log(err);

        alert("Có lỗi upload video.");

    }

}
