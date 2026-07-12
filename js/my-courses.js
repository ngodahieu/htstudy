const myCourses = [

{

subject:"Hóa học 12",

course:"XPS",

description:
"Lộ trình XPS chinh phục 9+ THPT.",

image:"images/hoahoc12.jpg"

},

{

subject:"Hóa học 11",

course:"Nền tảng",

description:
"Ôn tập toàn bộ Hóa 11.",

image:"images/hoahoc11.jpg"

}

];


const referenceCourses=[

{

subject:"Hóa học 12",

course:"Về Đích",

image:"images/hoahoc12.jpg"

},

{

subject:"Hóa học 12",

course:"THPT Quốc Gia",

image:"images/hoahoc12.jpg"

},

{

subject:"Hóa học 12",

course:"Cấp tốc",

image:"images/hoahoc12.jpg"

},

{

subject:"Hóa học 12",

course:"HSG",

image:"images/hoahoc12.jpg"

},

{

subject:"Hóa học 10",

course:"Nền tảng",

image:"images/hoahoc10.jpg"

}

];
const myList=
document.getElementById("myCourseList");

const refList=
document.getElementById("referenceCourseList");
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
myCourses.forEach(course=>{

myList.innerHTML+=
createCard(course);

});

referenceCourses.forEach(course=>{

refList.innerHTML+=
createCard(course,true);

});
