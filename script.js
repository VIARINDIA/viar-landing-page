// Navbar shrink on scroll
let lastScrollTop = 0;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Hero parallax effect
const hero = document.querySelector(".hero-content");

window.addEventListener("scroll", () => {
  let offset = window.scrollY;
  hero.style.transform = `translateY(${30 - offset * 0.1}px)`;
  hero.style.opacity = 1 - offset * 0.0015;
});

// FAQ accordion toggle
const faqButtons = document.querySelectorAll(".faq-question");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    item.classList.toggle("active");

    // Close other open answers
    faqButtons.forEach((btn) => {
      if (btn !== button) {
        btn.parentElement.classList.remove("active");
      }
    });
  });
});


