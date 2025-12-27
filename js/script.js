 const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.navlinks');
    const header = document.querySelector('header');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();

        navLinks.classList.toggle('active');
        header.classList.toggle('menu-open');
    });

    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            navLinks.classList.remove('active');
            header.classList.remove('menu-open');
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            header.classList.remove('menu-open');
        });
    });

    const track = document.getElementById("track");
let speed = 0.4;
let pos = 0;

// ننسخ العناصر لحد ما نغطي الشاشة
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

const header1 = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header1.classList.add("scrolled");
    } else {
        header1.classList.remove("scrolled");
    }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target); // عشان يطلع مرة وحدة
    }
  });
}, {
  threshold: 0.14
});

document.querySelectorAll(".autoshow").forEach(el => {
  observer.observe(el);
});