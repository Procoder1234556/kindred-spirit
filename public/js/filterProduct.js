// Filter Banner
function setDynamicBannerFilter() {
    const navLoc = document.getElementById('filter_nav_loc');
    const element = document.querySelector('#filter-banner img');
    if (!navLoc || !element) return;

    const style = navLoc.innerHTML.trim();
    const windowWidth = window.innerWidth;
  
    if (windowWidth <= 575.98) {
        element.setAttribute('src', `/images/Banner/${style}/mob.webp`);
    } else {
        element.setAttribute('src', `/images/Banner/${style}/pc.webp`);
    }
}
  
setDynamicBannerFilter();
window.addEventListener('resize', setDynamicBannerFilter);