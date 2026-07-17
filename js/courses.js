const params = new URLSearchParams(window.location.search);

const subject = params.get("subject");

const grade = params.get("grade");
/*====================================
        FILTER COURSE
====================================*/

const filterBtns = document.querySelectorAll(".filter-btn");

const courseCards = document.querySelectorAll(".course-card");

filterBtns.forEach(button=>{

button.addEventListener("click",()=>{

document.querySelector(".filter-btn.active")
.classList.remove("active");

button.classList.add("active");

const filter = button.dataset.filter;

courseCards.forEach(card=>{

if(filter==="all"){

card.classList.remove("hide");

return;

}

if(card.dataset.class===filter){

card.classList.remove("hide");

}

else{

card.classList.add("hide");

}

});

});

});
