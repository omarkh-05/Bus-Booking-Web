import { checkAuth } from "../Auth/auth.js";

async function loadComponent(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return;

  const response = await fetch(url);
  container.innerHTML = await response.text();
}


const accesstoken = sessionStorage.getItem("accessToken");
async function initLayout() {
  // هذا السطر يحدد اسم المستودع (Repository) إذا كان موجوداً في الرابط
  // لأن GitHub Pages يضع المشروع في مسار فرعي مثل /MrBus-Project/
  const repoName = window.location.hostname.includes("github.io") 
                   ? `/${window.location.pathname.split('/')[1]}` 
                   : "";

  // الآن نبني المسار ليكون دائماً من جذر الموقع
  const headerPath = `${repoName}/components/header.html`;
  const footerPath = `${repoName}/components/footer.html`;

  console.log("Fetching Header from:", headerPath);
  console.log("Fetching Footer from:", footerPath);

  await loadComponent("#header", headerPath);
  await loadComponent("#footer", footerPath);

  // تشغيل باقي الدوال
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