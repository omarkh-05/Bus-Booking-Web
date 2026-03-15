import { loginHelper, registerHelper , UrlBase} from "../Auth/auth.js";

const container = document.querySelector(".container"),
  pwShowHide = document.querySelectorAll(".showHidePw"),
  pwFields = document.querySelectorAll(".password"),
  signUp = document.querySelector(".signup-link"),
  login = document.querySelector(".login-link");

// js code to show/hide password and change icon
pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    pwFields.forEach((pwField) => {
      if (pwField.type === "password") {
        pwField.type = "text";
        pwShowHide.forEach((icon) => {
          icon.classList.replace("uil-eye-slash", "uil-eye");
        });
      } else {
        pwField.type = "password";
        pwShowHide.forEach((icon) => {
          icon.classList.replace("uil-eye", "uil-eye-slash");
        });
      }
    });
  });
});


// js code to appear signup and login form
signUp.addEventListener("click", (e) => {
  e.preventDefault();
  container.classList.add("active");
 ClearInputContainer();
});
login.addEventListener("click", (e) => {
  e.preventDefault();
  container.classList.remove("active");
  ClearInputContainer();
});


// Register / Login form Logic
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if(!checkFormFields("registerForm", "Register")) return;
  const confirmPassword = document.getElementById("ConfirmPassword").value.trim();
  const password = document.getElementById("Password").value.trim();
  if(confirmPassword !== password){
    printValidateErrorMessage("Register", "*Passwords do not match.");
    return;
  }
  if(confirmPassword.length < 10){
    printValidateErrorMessage("Register", "*Password must be at least 10 characters long.");
    return;
  }
  setLoading(true);
    const regInfoObject = {
      FullName: document.getElementById("FullName").value.trim(),
      PhoneNumber: document.getElementById("PhoneNumber").value.trim(),
      DateOfBirth: document.getElementById("DateOfBirth").value,
      CountryId: parseInt(document.getElementById("Nationality").value, 10),
      Password: confirmPassword
  };
  if(await registerHelper(regInfoObject)){
    setLoading(false);
    window.location.href = "../html/login.html";
  } else {
    setLoading(false);
    printValidateErrorMessage("Register", " An error occurred during registration. Please try again.");
  }
});
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!checkFormFields("loginForm", "Login")) return;
  setLoading(true);

  const credentials = {
    PhoneNumber: document.getElementById("loginPhoneNumber").value.trim(),
    Password: document.getElementById("loginPassword").value.trim()
  };

  if(await loginHelper(credentials)){
    setLoading(false);
    const urlParams = new URLSearchParams(window.location.search);
    let redirectUrl = urlParams.get("redirect");

    if (!redirectUrl || redirectUrl === "/") {
        // إذا ما في رابط تحويل، أو الرابط هو "/"، رجعه للإندكس بالنسبة لمكانه الحالي
        // بما أننا في مجلد html، فالإندكس هو خطوة لورا
        redirectUrl = "../index.html";
    }

    window.location.href = redirectUrl;
} else {
    setLoading(false);
    printValidateErrorMessage("Login", "Invalid credentials");
  }
});


// Inputs Load Logic
const getCommonHeaders = () => ({
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // تخطي صفحة تحذير ngrok
});
async function loadCountries() {
    const res = await fetch(`${UrlBase}BusBookingRest/GetCountries`, {
        method: "GET",
        headers: getCommonHeaders()
      });
    const data = await res.json();
    const select = document.getElementById("Nationality");
    const fragment = document.createDocumentFragment();

    data.forEach(country => {
        const option = document.createElement("option");
        option.value = country.countryID;
        option.textContent = country.countryName;
        fragment.appendChild(option);
    });

    select.appendChild(fragment);
}
loadCountries();
function setDateRange(dateInputId) {
  const dateInput = document.getElementById(dateInputId);
  if (!dateInput) return;

  const today = new Date();
  const maxDateObj = new Date(today);
  maxDateObj.setFullYear(today.getFullYear() - 18);
  const minDateObj = new Date(today);
  minDateObj.setFullYear(today.getFullYear() - 100);

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  dateInput.setAttribute("min", formatDate(minDateObj)); // 100 سنة
  dateInput.setAttribute("max", formatDate(maxDateObj)); // 18 سنة
  dateInput.value = formatDate(maxDateObj);
}
setDateRange("DateOfBirth");
const phoneInput = document.querySelectorAll(".phoneNumber");
phoneInput.forEach(input => {
  input.addEventListener("input", function () {
    let numbers = this.value.replace(/\D/g, ""); // إزالة أي شيء غير رقم
    let formatted = numbers;
    
    if (numbers.length > 3) {
        formatted =
      "(+" +
      numbers.slice(0, 3) +
      ") " +
      numbers.slice(3, 6) +
      "-" +
      numbers.slice(6, 9) +
      "-" +
      numbers.slice(9, 12);
  }

  this.value = formatted;
})});


// Validation Functions
function checkFormFields(formId, errorDivId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  /*if (!form.checkValidity()) {
    printValidateErrorMessage(errorDivId, "*All fields are required and must be valid.");
    return false;
  }*/
  // or
  // تحقق من inputs و textareas
  const inputs = form.querySelectorAll("input, select");
  for (let input of inputs) {
    if (!input.checkValidity()) {
      printValidateErrorMessage(errorDivId, "*All fields are required and must be valid.");
      return false;
    }
  }
  hideValidateErrorMessage(errorDivId);
  return true;
}
function printValidateErrorMessage(errorDivId, message) {
  const errorDiv = document.getElementById(errorDivId + "_ErrorMessage");
  if (errorDiv) {
    errorDiv.style.display = "block";
    errorDiv.style.color = "red";
    errorDiv.textContent = message;
  }
}
function hideValidateErrorMessage(errorDivId) {
  const errorDiv = document.getElementById(errorDivId + "_ErrorMessage");
  if (errorDiv) {
    errorDiv.style.display = "none";
    errorDiv.textContent = "";
  }
}
function ClearInputContainer() {
const inputs = container.querySelectorAll("input[type='text'], input[type='email'], input[type='password'], input[type='tel']");
  inputs.forEach(input => {
      input.value = "";
  });
  const select = container.querySelector("select");
  if (select) select.selectedIndex = 0;
}


// Helper Functions
function setLoading(isLoading) {
const loading = document.getElementById("loading");
const submitButtons = container.querySelectorAll("input[type='submit']");

  if(isLoading){
  loading.style.display ="flex";
  submitButtons.forEach(button => button.disabled = true);
  }else{
    loading.style.display ="none";
    submitButtons.forEach(button => button.disabled = false);
}}
