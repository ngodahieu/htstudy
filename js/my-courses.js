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

const studentAvatar =
document.getElementById("studentAvatar");
function createCard(course,locked=false){

    return `

<div class="course-card">

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
onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="index.html";

        return;

    }

    const userSnap =
    await getDoc(doc(db,"users",user.uid));

    if(userSnap.exists()){

        const data=userSnap.data();

        studentAvatar.src =
        data.avatar && data.avatar!==""
        ? data.avatar
        : "assets/avatars/default.jpg";

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
        const myCourseIds = enrollData.courses;

ownedCount.textContent = myCourseIds.length;

myList.innerHTML = "";
        const courseSnapshot =
await getDocs(collection(db,"courses"));
        console.log(courseSnapshot.size);

courseSnapshot.forEach(courseDoc=>{

    console.log(courseDoc.id);
    console.log(courseDoc.data());

});
        courseSnapshot.forEach(courseDoc=>{

    const courseData = courseDoc.data();

    if(myCourseIds.includes(courseDoc.id)){

        myList.innerHTML += createCard({

            subject: courseData.subject,

            course: courseData.name,

            description: courseData.description,

            image: courseData.image

        });

    }

});

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
