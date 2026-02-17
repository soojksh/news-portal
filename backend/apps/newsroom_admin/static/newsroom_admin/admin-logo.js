// Replace Wagtail logo in the sidebar/header if present
document.addEventListener("DOMContentLoaded", () => {
  const logoImg = document.querySelector("img.w-logo, .w-logo img");
  if (logoImg) {
    logoImg.src = "/static/newsroom_admin/brand/admin-logo.svg";
  }
});
