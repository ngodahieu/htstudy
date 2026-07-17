import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    collection
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const myList =
document.getElementById("myCourseList");

const refList =
document.getElementById("referenceCourseList");

const ownedCount =
document.getElementById("ownedCount");

const myCourseMenu =
document.getElementById("myCourseMenu");

const referenceMenu =
document.getElementById("referenceMenu");
const courseSidebar =
document.getElementById("courseSidebar");
function createCard(course,locked=false){

    return `

<div
class="course-card"
id="course-${course.id}">

<div class="course-banner">

<img src="${course.image}">

</div>

<div class="course-content">

<div class="course-subject">

${course.subject}

</div>

<h3 class="course-title">

${course.course}

</h3>

<p class="course-desc">

${course.description || "Khóa học tham khảo."}

</p>

<div class="course-footer">

<span class="course-tag ${locked?"lock":""}">

${locked?"Chưa cấp":"Đã cấp"}

</span>

${
locked?

`<button class="enter-btn" disabled>

Chưa mở

</button>`

:

`<button class="enter-btn">

Vào học

</button>`

}

</div>

</div>

</div>

`;

}
function buildMenu(courses, container){

    container.innerHTML = "";

    const tree = {};

    courses.forEach(course=>{

        if(!tree[course.grade]){

            tree[course.grade] = {};

        }

        if(!tree[course.grade][course.subject]){

            tree[course.grade][course.subject] = [];

        }

        tree[course.grade][course.subject].push(course);

    });

    for(const grade in tree){

        const gradeDiv = document.createElement("div");

        gradeDiv.className = "menu-grade";

        gradeDiv.innerHTML = `
<h4 class="grade-title">

<span class="arrow">

▶

</span>

Lớp ${grade}

</h4>
`;
const gradeContent = document.createElement("div");

gradeContent.className = "grade-content";
        for(const subject in tree[grade]){

            const subjectDiv = document.createElement("div");
const subjectTitle =
document.createElement("h5");
const courseContainer =
document.createElement("div");

courseContainer.className =
"course-links";
subjectTitle.className =
"subject-title";

subjectTitle.innerHTML = `

<span class="arrow">

▶

</span>

${subject}

`;

subjectDiv.appendChild(subjectTitle);
            subjectDiv.className = "menu-subject";


            tree[grade][subject].forEach(course=>{

                const a = document.createElement("a");

                a.href = `course.html?id=${course.id}`;

                a.innerHTML =
`📘 ${course.name}`;

                courseContainer.appendChild(a);

            });
subjectDiv.appendChild(courseContainer);
            gradeContent.appendChild(subjectDiv);
subjectTitle.onclick = (e)=>{

    e.stopPropagation();

    subjectDiv.classList.toggle("open");

};

        }

const gradeTitle =
gradeDiv.querySelector(".grade-title");

gradeTitle.onclick = (e)=>{

    e.stopPropagation();

    gradeDiv.classList.toggle("open");

};
        gradeDiv.appendChild(gradeContent);
        container.appendChild(gradeDiv);

    }

}
onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="index.html";

        return;

    }

    const userSnap =
    await getDoc(doc(db,"users",user.uid));

    if(userSnap.exists()){

        const data=userSnap.data();

    }

    await loadMyCourses(user.uid);

});
async function loadMyCourses(uid){

    try{

        const enrollRef =
        doc(db,"enrollments",uid);

        const enrollSnap =
        await getDoc(enrollRef);

        if(!enrollSnap.exists()){

            myList.innerHTML=`
                <p>
                    Bạn chưa được cấp khóa học nào.
                </p>
            `;

            ownedCount.textContent="0";

            return;

        }

        const enrollData =
        enrollSnap.data();

        console.log(enrollData);
        console.log(enrollData.courses);
        const myCourseIds = enrollData.courses || [];
        const myCourses = [];
const referenceCourses = [];

console.log(typeof myCourseIds);
console.log(Array.isArray(myCourseIds));
console.log(myCourseIds);

ownedCount.textContent = myCourseIds.length;
myList.innerHTML = "";

refList.innerHTML = "";

        const courseSnapshot =
await getDocs(collection(db,"courses"));
        console.log(courseSnapshot.size);

courseSnapshot.forEach(courseDoc=>{

    console.log(courseDoc.id);
    console.log(courseDoc.data());

});
courseSnapshot.forEach(courseDoc=>{

    const courseData = courseDoc.data();

    const course = {

        id: courseDoc.id,

        grade: courseData.grade,

        subject: courseData.subject,

        name: courseData.name,

        description: courseData.description,

        image: courseData.image

    };
console.log(course);
    if(myCourseIds.includes(courseDoc.id)){

    myCourses.push(course);

    // Hiển thị bên phải
    myList.innerHTML += createCard({

        id: course.id,

        subject: course.subject,

        course: course.name,

        description: course.description,

        image: course.image

    });

}

else{

    referenceCourses.push(course);

    // Hiển thị khóa học tham khảo
    refList.innerHTML += createCard({

        id: course.id,

        subject: course.subject,

        course: course.name,

        description: course.description,

        image: course.image

    }, true);

}

});
        buildMenu(
    myCourses,
    myCourseMenu
);

buildMenu(
    referenceCourses,
    referenceMenu
);

    }

    catch(err){

        console.log(err);

    }

}
/*======================================
            LOADING
======================================*/

window.addEventListener("load", () => {

    const loading = document.querySelector(".loading-screen");

    if (!loading) return;

    loading.classList.add("hide");

    setTimeout(() => {

        loading.remove();

    }, 500);

});
