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

    console.log("Current Prefix:", prefix); // للتأكد في الكونسول

    await loadComponent("#header", `${prefix}components/Header.html`);
    await loadComponent("#footer", `${prefix}components/Footer.html`);
  //await loadComponent("#settings", "../components/Settings.html");
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