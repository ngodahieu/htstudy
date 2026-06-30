// ===============================
// ELEMENTS
// ===============================
const avatarBtn = document.querySelector(".profile");
const profileMenu = document.getElementById("profileMenu");

const notificationBtn = document.querySelector(".notification");
const notificationBox = document.getElementById("notificationBox");

// ===============================
// TOGGLE PROFILE MENU
// ===============================
avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("active");
    notificationBox.classList.remove("active");
});

// ===============================
// TOGGLE NOTIFICATION
// ===============================
notificationBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notificationBox.classList.toggle("active");
    profileMenu.classList.remove("active");
});

// ===============================
// CLICK OUTSIDE TO CLOSE
// ===============================
document.addEventListener("click", () => {
    profileMenu.classList.remove("active");
    notificationBox.classList.remove("active");
});

// ===============================
// USER DATA (fake login demo)
// ===============================
let user = JSON.parse(localStorage.getItem("user")) || null;

// ===============================
// RENDER PROFILE MENU
// ===============================
function renderProfile() {
    const menu = document.getElementById("profileMenu");

    if (!user) {
        menu.innerHTML = `
            <div class="guest-box">
                <button class="login-btn" id="loginBtn">Đăng nhập</button>
            </div>
        `;

        document.getElementById("loginBtn").addEventListener("click", () => {
            fakeLogin();
        });

    } else {
        menu.innerHTML = `
            <div class="user-box">
                <img src="${user.avatar}" id="changeAvatar">
                <h3>${user.name}</h3>
                <p>${user.studentId}</p>

                <button id="uploadBtn">Đổi ảnh đại diện</button>
                <button id="logoutBtn">Đăng xuất</button>

                <input type="file" id="fileInput" accept="image/*" hidden>
            </div>
        `;

        // logout
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("user");
            user = null;
            renderProfile();
        });

        // open file picker
        document.getElementById("uploadBtn").addEventListener("click", () => {
            document.getElementById("fileInput").click();
        });

        // change avatar
        document.getElementById("fileInput").addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    user.avatar = event.target.result;
                    localStorage.setItem("user", JSON.stringify(user));
                    renderProfile();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ===============================
// FAKE LOGIN (demo)
// ===============================
function fakeLogin() {
    user = {
        name: "Nguyễn Văn A",
        studentId: "HS240001",
        avatar: "images/default-avatar.jpg"
    };

    localStorage.setItem("user", JSON.stringify(user));
    renderProfile();
}

// init
renderProfile();
