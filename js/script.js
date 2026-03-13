import { checkAuth } from "../Auth/auth.js";


document.addEventListener("DOMContentLoaded",async () => {
const accessToken = sessionStorage.getItem("accessToken");
if(accessToken)
    await checkAuth("home"); // إذا مسجل دخول يظهر الاسم بدل MyAccount

const loginbtn = document.getElementById("btnLoginHero-text");
    if(loginbtn)
        loginbtn.addEventListener("click",() => {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `../html/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        });

});
document.querySelector("form").addEventListener("submit" , (e) => {
    e.preventDefault();
});