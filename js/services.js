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

const header1 = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        header1.classList.add("scrolled");
    } else {
        header1.classList.remove("scrolled");
    }
});