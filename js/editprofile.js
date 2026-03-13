import { checkAuth , apiFetch } from "../Auth/auth.js";

document.addEventListener("DOMContentLoaded", async function () {

    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");

    const profileForm = document.getElementById("profileForm");

    const nameInput = document.getElementById("userName");
    const phoneInput = document.getElementById("userPhone");
    const emailInput = document.getElementById("userEmail");
    const description = document.getElementById("userDescription");

    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    const successModal = document.getElementById("successModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    let originalData = {};

    // ======================
    // Authentication
    // ======================
    const customer = await checkAuth();
    if (!customer) {
       const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `../html/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
    }

    // ======================
    // Fill form with user data
    // ======================
    function fillForm(customer) {
        nameInput.value = customer.fullName || "";
        phoneInput.value = customer.phoneNumber || "";
        emailInput.value = customer.email || "";
        description.value = customer.discription || "";

        const API_BASE = "https://professionally-overjocular-chelsie.ngrok-free.dev";

        if (customer.imgUrl) {
         avatarPreview.src = API_BASE + customer.imgUrl;
        }
        originalData = {
            name: nameInput.value,
            phone: phoneInput.value,
            email: emailInput.value,
            description: description.value,
            image: avatarPreview.src
        };

        saveBtn.disabled = true;
    }
    fillForm(customer);

    // ======================
    // Detect changes
    // ======================
    function checkIfChanged() {
        const changed =
            nameInput.value !== originalData.name ||
            phoneInput.value !== originalData.phone ||
            emailInput.value !== originalData.email ||
            description.value !== originalData.description ||
            avatarPreview.src !== originalData.image;

        saveBtn.disabled = !changed;
    }

    nameInput.addEventListener("input", checkIfChanged);
    phoneInput.addEventListener("input", checkIfChanged);
    emailInput.addEventListener("input", checkIfChanged);
    description.addEventListener("input", checkIfChanged);

    // ======================
    // Image preview
    // ======================
    avatarInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            avatarPreview.src = e.target.result;
            checkIfChanged();
        };
        reader.readAsDataURL(file);
    });

    // ======================
    // Cancel changes
    // ======================
    cancelBtn.addEventListener("click", function () {
        nameInput.value = originalData.name;
        phoneInput.value = originalData.phone;
        emailInput.value = originalData.email;
        description.value = originalData.description;
        avatarPreview.src = originalData.image;

        saveBtn.disabled = true;
    });

    // ======================
    // Close modal
    // ======================
    function closeModal() {
        successModal.classList.add("hidden");
        window.location.href = "../html/profile.html";
    }
    closeModalBtn.addEventListener("click", closeModal);
    successModal.addEventListener("click", closeModal);

    // ======================
    // Phone format
    // ======================
    phoneInput.addEventListener("input", function () {
        let numbers = this.value.replace(/\D/g, "");
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
        checkIfChanged();
    });

    // ======================
    // Form submit
    // ======================
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        let isValid = true;

        document.querySelectorAll('[id$="Error"]').forEach(el => el.classList.add("hidden"));

        if (nameInput.value.trim().length < 3) {
            document.getElementById("nameError").classList.remove("hidden");
            isValid = false;
        }

        if (description.value.trim().length < 20) {
            document.getElementById("descriptionError").classList.remove("hidden");
            isValid = false;
        }

        if (!phoneInput.value.trim()) {
            document.getElementById("phoneError").classList.remove("hidden");
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            document.getElementById("emailError").classList.remove("hidden");
            isValid = false;
        }

        if (!isValid) return;
        saveBtn.disabled = true;
        cancelBtn.disabled = true;
        saveBtn.innerHTML = "Saving...";

        const CustomerDTO = {
            FullName: nameInput.value,
            PhoneNumber: phoneInput.value,
            Email: emailInput.value,
            Description: description.value
        };

        const updatedCustomer = await FetchUpdateProfile(CustomerDTO,avatarInput);
        if(!updatedCustomer)
            console.log("error");
        else
        {
        successModal.classList.remove("hidden");
        fillForm(updatedCustomer);
        }
    });

});


// ============= Api Fetch Helpers =============
async function FetchUpdateProfile(customerDTO, fileInput) {
    try {
        // FormData يسمح بدمج الملفات والحقول
        const formData = new FormData(); // لأن الـDTO اللي عندك يحتوي على صورة (IFormFile) وحقول نصية، وJSON لا يمكنه حمل ملفات. 
        formData.append("FullName", customerDTO.FullName);
        formData.append("PhoneNumber", customerDTO.PhoneNumber);
        formData.append("Email", customerDTO.Email);
        formData.append("Description", customerDTO.Description);

        if (fileInput.files[0]) {
            formData.append("Image", fileInput.files[0]);
        }

        const response = await apiFetch(`BusBookingRest/UpdateProfile`, {
            method: "PUT",
            body: formData // المتصفح يضبط Content-Type على multipart/form-data تلقائياً، مع إضافة حدود (boundaries) لتفريق الحقول عن الملفات.
        });

        if (!response.ok) {
            console.error(response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}
