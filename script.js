const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

toggle.addEventListener("click", () => {
  const open = toggle.classList.toggle("active");
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  toggle.classList.remove("active");
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");

const closeLightbox = () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
};

// Event-Delegation: funktioniert auch fuer Bilder, die das CMS
// nachtraeglich dynamisch in die Galerie einfuegt.
document.addEventListener("click", (event) => {
  const item = event.target.closest(".gallery-item");
  if (!item) return;
  const thumbnail = item.querySelector("img");
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = thumbnail ? thumbnail.alt : "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

const normalizeSponsorLogo = (image) => {
  const canvas = document.createElement("canvas");
  const maximum = 700;
  const scale = Math.min(1, maximum / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width;
  let top = canvas.height;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      const visible = pixels[index + 3] > 20;
      const notWhite = pixels[index] < 242 || pixels[index + 1] < 242 || pixels[index + 2] < 242;
      if (visible && notWhite) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right <= left || bottom <= top) return;
  const buffer = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.015));
  const insetTop = Math.max(0, top - buffer) / canvas.height * 100;
  const insetRight = Math.max(0, canvas.width - right - buffer) / canvas.width * 100;
  const insetBottom = Math.max(0, canvas.height - bottom - buffer) / canvas.height * 100;
  const insetLeft = Math.max(0, left - buffer) / canvas.width * 100;
  image.style.setProperty("--logo-view-box", `inset(${insetTop}% ${insetRight}% ${insetBottom}% ${insetLeft}%)`);
};

document.querySelectorAll(".sponsor-grid img").forEach((image) => {
  if (image.complete) normalizeSponsorLogo(image);
  else image.addEventListener("load", () => normalizeSponsorLogo(image), { once: true });
});
