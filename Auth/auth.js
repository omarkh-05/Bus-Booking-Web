// auth.js
//export let accessToken = null;

export const UrlBase = "https://professionally-overjocular-chelsie.ngrok-free.dev/api/";

const getCommonHeaders = () => ({
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // تخطي صفحة تحذير ngrok
});
const getCommonHeadersForUpdate = () => ({
    "ngrok-skip-browser-warning": "true" // تخطي صفحة تحذير ngrok
});
// ----------------------
// Register function
// ----------------------
export async function registerHelper(regInfoObject) {
  try {
    const response = await fetch(`${UrlBase}Auth/Register`, {
      method: "POST",
      headers: getCommonHeaders(), // تم إضافة التعديل هنا
      body: JSON.stringify(regInfoObject)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Register failed");
    }

    return data;

  } catch (error) {
    console.error(error.message);
    return null;
  }
}

// ----------------------
// Login function
// ----------------------
export async function loginHelper(Credentials) {
  try {
    const response = await fetch(`${UrlBase}Auth/Login`, {
      method: "POST",
      headers: getCommonHeaders(), // تم إضافة التعديل هنا
      credentials: "include", // مهم للكوكي HttpOnly
      body: JSON.stringify(Credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    sessionStorage.setItem("accessToken", data.accessToken);
    document.cookie = `phoneNumber=${Credentials.PhoneNumber}; max-age=604800; path=/; secure`; 
    
    return data;

  } catch (error) {
    console.error(error.message);
    return null;
  }
}
// ----------------------
// Refresh token
// ----------------------
export async function refreshAccessToken(phoneNumber) {
  try {
    const response = await fetch(`${UrlBase}Auth/Refresh`, {
      method: "POST",
      credentials: "include",
       headers: getCommonHeaders(), // تم إضافة التعديل هنا
       body: JSON.stringify({ PhoneNumber: phoneNumber })
    });

    if (!response.ok) {
      sessionStorage.removeItem("accessToken");
      throw new Error("Refresh token expired");
    }

    const data = await response.json();
   sessionStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;

  } catch (error) {
    console.error(error.message);
    document.cookie = "phoneNumber=; max-age=0; path=/";
    sessionStorage.removeItem("accessToken");
    return null;
  }
}

export async function checkAuth(page) {
  try {
    const res = await apiFetch(`BusBookingRest/MyProfile`, {
      method: "GET"
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error:", errorText);
      if(page)
   showGuestUI(page)

   return null;
    }
    const customer = await res.json();
    if(page)
    showUserUI(page,customer);
    return customer;
  } catch (err) {
    if(page)
    showGuestUI(page)
    console.error(err);
    return null;
  }
}

export async function Logout() {
  setLoading(true,"Logging Out...");
    try {
        const phoneNumber = getCookie("phoneNumber");

        await apiFetch("Auth/Logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber })
        });

    } catch (err) {
      setLoading(false);
        console.error("Logout request failed", err);
    }

    forceLogout();
}

// ----------------------
// API wrapper to include access token and handle refresh بدل ما نسوي اللوجيك كل مرة في كل مكان نستخدم فيه الفيتش
// ----------------------
export async function apiFetch(url, options = {}) {
  try{
    options.headers = {
      ...getCommonHeaders(),
      ...options.headers
    };
    options.credentials = "include";
    
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }
    let response = await fetch(`${UrlBase}${url}`, options);

    if (response.status === 401) {
        log("Access token expired → attempting refresh");
        const phoneNumber = getCookie("phoneNumber");
        if (!phoneNumber) {
            log("Refresh aborted → phoneNumber cookie missing");
            forceLogout();
            return response;
        }
        const newToken = await refreshAccessToken(phoneNumber);
        if (!newToken) {
            log("Refresh failed → user logged out");
            forceLogout();
            return response;
        }
        log("Refresh succeeded → retrying request");
        options.headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(`${UrlBase}${url}`, options);
    }

    return response;
  }catch(ex)
  {
    console.error(ex);
    return null;
  }
}
export async function apiFetchForUpdateCustomer(url, options = {}) {
  try{
    options.headers = {
      ...getCommonHeadersForUpdate(),
      ...options.headers
    };
    options.credentials = "include";
    
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }
    let response = await fetch(`${UrlBase}${url}`, options);

    if (response.status === 401) {
        log("Access token expired → attempting refresh");
        const phoneNumber = getCookie("phoneNumber");
        if (!phoneNumber) {
            log("Refresh aborted → phoneNumber cookie missing");
            forceLogout();
            return response;
        }
        const newToken = await refreshAccessToken(phoneNumber);
        if (!newToken) {
            log("Refresh failed → user logged out");
            forceLogout();
            return response;
        }
        log("Refresh succeeded → retrying request");
        options.headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(`${UrlBase}${url}`, options);
    }

    return response;
  }catch(ex)
  {
    console.error(ex);
    return null;
  }
}

// ----------------------
// Helper to get cookie
// ----------------------
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}
function showUserUI(page, customer) {
  // فحص هل نحن في مجلد html أم لا
  const isSubPage = window.location.pathname.includes("/html/");

  const accountLink = document.getElementById("myAccountLink");
  if (accountLink) {
    accountLink.textContent = getFirstWord(customer.fullName);
    
    accountLink.href = isSubPage ? "./profile.html" : "html/profile.html";
  }

  if (page === "home") {
    const btnLoginHerolink = document.getElementById("btnLoginHero-link");
    const btnLoginHerotext = document.getElementById("btnLoginHero-text");
    
    if (btnLoginHerolink && btnLoginHerotext) {
      // بما أن الـ page هو home، فنحن بالتأكيد في index.html
      btnLoginHerolink.href = "html/profile.html"; 
      btnLoginHerotext.textContent = "My Account";
    }
  }
}

function showGuestUI(page) {
  const isSubPage = window.location.pathname.includes("/html/");
  
  const accountLink = document.getElementById("myAccountLink");
  accountLink.textContent = "MyAccount";
  accountLink.href = isSubPage ? "login.html" : "html/login.html";

  if(page === "home"){
    const btnLoginHerolink = document.getElementById("btnLoginHero-link");
    const btnLoginHerotext = document.getElementById("btnLoginHero-text");
    btnLoginHerolink.href = "html/login.html";
    btnLoginHerotext.textContent = "Login";
  }
}
function getFirstWord(str) {
  if (!str) return null;
  const index = str.indexOf(" ");
  return index === -1 ? str : str.slice(0, index);
}
function log(message, data = null) {
    const time = new Date().toISOString();
    console.log(`[API ${time}] ${message}`, data || "");
}
function forceLogout() {
    sessionStorage.removeItem("accessToken");
    document.cookie = "phoneNumber=; max-age=0; path=/";
    // تحديد المسار بناءً على مكانك الحالي
    const isSubPage = window.location.pathname.includes("/html/");
    window.location.href = isSubPage ? "../index.html" : "index.html";
}
export function setLoading(isLoading,message) {
const loading = document.getElementById("loading");
const editbtn = document.getElementById("btnEditProfil");
const loding_message = document.getElementById("loading-Message")

  if(isLoading){
  loading.style.display ="flex";
  loding_message.textContent = message;
  editbtn.disabled = true;
  }else{
    loading.style.display ="none";
    editbtn.disabled = false;
}
}