// Dynamic Banner
// Function to set the background image based on window width
function setDynamicBannerCart() {
  const navLoc = document.getElementById('nav_loc');
  const element = document.getElementById('cat-banner');
  if (!navLoc || !element) return;

  const category = navLoc.innerHTML.trim();
  const windowWidth = window.innerWidth;

  let imageUrl;
  if (windowWidth <= 575.98) {
    imageUrl = `/images/Banner/${category}/mob.webp`;
  } else {
    imageUrl = `/images/Banner/${category}/pc.webp`;
  }

  element.style.backgroundImage = `url("${imageUrl}")`;
}

// Initial call to set the background image on page load
setDynamicBannerCart();

// Add event listener for window resize
window.addEventListener('resize', setDynamicBannerCart);
// Dynamic Banner End

const sprodQuantityEl = document.getElementById("sprod_quantity");
if (sprodQuantityEl) {
  const sprod_quantity = sprodQuantityEl.value;
  console.log("Single Quantity = ", sprod_quantity);
}