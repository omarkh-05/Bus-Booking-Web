import { checkAuth } from "../Auth/auth.js";

async function loadComponent(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return;

  const response = await fetch(url);
  container.innerHTML = await response.text();
}


const accesstoken = sessionStorage.getItem("accessToken");
async function initLayout() {
  const isSubPage = window.location.pathname.includes("/html/");
  const prefix = isSubPage ? "../" : "./";

  await loadComponent("#header", `${prefix}components/header.html`);
  await loadComponent("#footer", `${prefix}components/footer.html`);

  // --- كود تصحيح الروابط بداخل الهيدر بعد تحميله ---
  const navLinks = document.querySelectorAll("#header a, #footer a");
  navLinks.forEach(link => {
      let href = link.getAttribute("href");
      
      // إذا كنا في الصفحة الرئيسية (index)، نعدل الروابط التي تبدأ بـ ../
      if (!isSubPage && href.startsWith("../")) {
          link.setAttribute("href", href.replace("../", ""));
      }
      
      // إذا كنا في صفحة فرعية (SubPage)، نترك الروابط التي تبدأ بـ ../ كما هي
  });
  // داخل layout.js في دالة initLayout
const loginLink = document.getElementById("myAccountLink");

if (loginLink) {
    // إذا بالصفحة الرئيسية، اللوجن جوا مجلد html
    // إذا بصفحة فرعية، اللوجن معه بنفس المجلد
    loginLink.href = isSubPage ? "login.html" : "html/login.html";
}
      if(accesstoken) {
         try {
            await checkAuth("layout");
         } catch(e) {
            console.error("Auth check failed", e);
         }
      }

  initHeader();
  initTrack();
  initScroll();
  initObserver();
}

initLayout();

/* ================= HEADER ================= */

function initHeader() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".navlinks");
  const header = document.querySelector("header");

  if (!menuToggle || !navLinks || !header) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
    header.classList.toggle("menu-open");
  });

  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !navLinks.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      navLinks.classList.remove("active");
      header.classList.remove("menu-open");
    }
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      header.classList.remove("menu-open");
    });
  });
}

/* ================= TRACK ================= */

function initTrack() {
  const track = document.getElementById("track");
  if (!track) return;

  let speed = 0.4;
  let pos = 0;

  while (track.scrollWidth < window.innerWidth * 2) {
    track.innerHTML += track.innerHTML;
  }

  function animate() {
    pos -= speed;

    if (Math.abs(pos) >= track.scrollWidth / 2) {
      pos = 0;
    }

    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(animate);
  }

  animate();
}

/* ================= SCROLL ================= */

function initScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

/* ================= OBSERVER ================= */

function initObserver() {
  const elements = document.querySelectorAll(".autoshow");
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((el) => observer.observe(el));
}