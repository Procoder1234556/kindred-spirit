var announcementBarMsg = [
  {
    msg: "Flat 15% off on orders above ₹1500. USE ‘SAHII15’",
  },
  {
    msg: "Flat 20% off on orders above ₹2500. USE ‘SAHII20’",
  },
  {
    msg: "Unlock 10% Off Sitewide: Use code SAHII10",
  },
];

//popup
document.addEventListener("DOMContentLoaded", () => {
  var homePopUp = document.querySelector(".popup-section");
  var popUpCongratsBtn = document.querySelector(".popup-btn");
  if (popUpCongratsBtn && homePopUp) {
    popUpCongratsBtn.addEventListener("click", () => {
      homePopUp.style.display = "none";
    });
  }
  var homePopUpClose = document.querySelector(".popup-close");
  if (homePopUpClose && homePopUp) {
    homePopUpClose.addEventListener("click", () => {
      homePopUp.style.display = "none";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var announcementBar1 = document.querySelectorAll(".announcement-bar")[0];
  if (!announcementBar1) return;
  var i = 0;

  function displayMessage() {
    announcementBar1.style.opacity = 0; // Fade out
    setTimeout(function () {
      announcementBar1.innerText = announcementBarMsg[i].msg;
      announcementBar1.style.opacity = 1; // Fade in
      i = (i + 1) % announcementBarMsg.length;
      setTimeout(displayMessage, 3000);
    }, 500);
  }

  displayMessage();
});

document.addEventListener("DOMContentLoaded", function () {
  var announcementBar2 = document.querySelectorAll(".announcement-bar")[1];
  if (!announcementBar2) return;
  var i = 0;

  function displayMessage() {
    announcementBar2.style.opacity = 0; // Fade out
    setTimeout(function () {
      announcementBar2.innerText = announcementBarMsg[i].msg;
      announcementBar2.style.opacity = 1; // Fade in
      i = (i + 1) % announcementBarMsg.length;
      setTimeout(displayMessage, 3000);
    }, 500);
  }

  displayMessage();
});

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("#header .fixed-top");
  const dropDown = document.querySelector("#header .navbar-nav .nav-item .drop-down");
  const topBar2 = document.querySelectorAll(".top-bar")[1];

  if (!navbar) return;

  // Scroll logic — but never collapse while the mobile menu is open
  const isMenuOpen = () => {
    const nav = document.querySelector("#navbarNav");
    return !!(nav && (nav.classList.contains("show") || nav.classList.contains("collapsing")));
  };
  window.addEventListener("scroll", () => {
    if (isMenuOpen()) return; // freeze nav state while menu open
    const scrollTop = document.documentElement.scrollTop;

    if (scrollTop > 10) navbar.classList.add("expandedp");
    else navbar.classList.remove("expandedp");

    if (scrollTop > 40) navbar.classList.add("expandedpp");
    else navbar.classList.remove("expandedpp");

    if (scrollTop > 70) {
      navbar.classList.remove("expandedpp", "expandedp", "expanded");
      if (dropDown) dropDown.classList.remove("md");
      if (topBar2) topBar2.style.height = "0";
    } else if (scrollTop < 145) {
      navbar.classList.add("expanded");
      if (topBar2) topBar2.style.height = "2rem";
    }
  });

  // Mobile Toggler logic
  const navbtn = document.querySelector("#header .nav-right-btn button");
  const navBarNav = document.querySelector("#navbarNav");

  if (navBarNav && navbar) {
    navBarNav.addEventListener("show.bs.collapse", () => {
      navbar.classList.add("expanded");
    });
    navBarNav.addEventListener("hidden.bs.collapse", () => {
      if (document.documentElement.scrollTop > 70) {
        navbar.classList.remove("expanded");
      }
    });
  }

  // Dropdown logic
  const dropDownBtn = document.querySelector(".product-dropdown .product-dropdown-btn");
  if (dropDownBtn && dropDown) {
    dropDownBtn.addEventListener("click", (e) => {
      if (window.matchMedia("(max-width: 992px)").matches) {
        e.preventDefault();
        dropDown.classList.toggle("md");
        const rightArrow1 = dropDownBtn.querySelector("i");
        if (rightArrow1) rightArrow1.classList.toggle("rotate");
      }
    });
  }
});

// Sub-dropdown logic for categories
if (window.matchMedia("(min-width: 992px)").matches) {
  const sparePartsOpt = document.querySelector(".drop-down .cat-spare-parts");
  const accessoriesOpt = document.querySelector(".drop-down .cat-accessories");
  const toolsOpt = document.querySelector(".drop-down .cat-tools");
  const extraOpt = document.querySelector(".drop-down .cat-extra");

  const sparePartsMenu = document.querySelectorAll(".flyout-spare-parts")[1];
  const accessoriesMenu = document.querySelectorAll(".flyout-accessories")[1];
  const toolsMenu = document.querySelectorAll(".flyout-tools")[1];
  const extraMenu = document.querySelectorAll(".flyout-extra")[1];

  if (sparePartsOpt && sparePartsMenu) {
    [sparePartsOpt, sparePartsMenu].forEach(el => {
      el.addEventListener("mouseover", () => sparePartsMenu.style.maxWidth = "10rem");
      el.addEventListener("mouseout", () => sparePartsMenu.style.maxWidth = "0rem");
    });
  }

  if (accessoriesOpt && accessoriesMenu) {
    [accessoriesOpt, accessoriesMenu].forEach(el => {
      el.addEventListener("mouseover", () => accessoriesMenu.style.maxWidth = "10rem");
      el.addEventListener("mouseout", () => accessoriesMenu.style.maxWidth = "0rem");
    });
  }

  if (toolsOpt && toolsMenu) {
    [toolsOpt, toolsMenu].forEach(el => {
      el.addEventListener("mouseover", () => toolsMenu.style.maxWidth = "10rem");
      el.addEventListener("mouseout", () => toolsMenu.style.maxWidth = "0rem");
    });
  }

  if (extraOpt && extraMenu) {
    [extraOpt, extraMenu].forEach(el => {
      el.addEventListener("mouseover", () => extraMenu.style.maxWidth = "10rem");
      el.addEventListener("mouseout", () => extraMenu.style.maxWidth = "0rem");
    });
  }
}

// Mobile sub-dropdown logic
if (window.matchMedia("(max-width: 992.98px)").matches) {
  const mdSparePartsOpt = document.querySelector(".drop-down .cat-spare-parts");
  const mdAccessoriesOpt = document.querySelector(".drop-down .cat-accessories");
  const mdToolsOpt = document.querySelector(".drop-down .cat-tools");
  const mdExtraOpt = document.querySelector(".drop-down .cat-extra");

  const mdSparePartsSub = document.querySelector(".flyout-spare-parts");
  const mdAccessoriesSub = document.querySelector(".flyout-accessories");
  const mdToolsSub = document.querySelector(".flyout-tools");
  const mdExtraSub = document.querySelector(".flyout-extra");

  const mdDropDown = document.querySelector(".drop-down");

  const arrow1 = document.querySelector(".cat-spare-parts i");
  const arrow2 = document.querySelector(".cat-accessories i");
  const arrow3 = document.querySelector(".cat-tools i");
  const arrow4 = document.querySelector(".cat-extra i");

  const closeAll = () => {
    [mdSparePartsSub, mdAccessoriesSub, mdToolsSub, mdExtraSub].forEach(el => { if (el) el.style.height = "0"; });
    [arrow1, arrow2, arrow3, arrow4].forEach(el => { if (el) el.classList.remove("rotate"); });
    if (mdDropDown) mdDropDown.classList.remove("active");
  };

  if (mdSparePartsOpt && mdSparePartsSub) {
    mdSparePartsOpt.addEventListener("click", () => {
      const isOpen = mdSparePartsSub.clientHeight > 0;
      closeAll();
      if (!isOpen) {
        mdSparePartsSub.style.height = "22rem";
        if (arrow1) arrow1.classList.add("rotate");
        if (mdDropDown) mdDropDown.classList.add("active");
      }
    });
  }

  if (mdAccessoriesOpt && mdAccessoriesSub) {
    mdAccessoriesOpt.addEventListener("click", () => {
      const isOpen = mdAccessoriesSub.clientHeight > 0;
      closeAll();
      if (!isOpen) {
        mdAccessoriesSub.style.height = "22rem";
        if (arrow2) arrow2.classList.add("rotate");
        if (mdDropDown) mdDropDown.classList.add("active");
      }
    });
  }

  if (mdToolsOpt && mdToolsSub) {
    mdToolsOpt.addEventListener("click", () => {
      const isOpen = mdToolsSub.clientHeight > 0;
      closeAll();
      if (!isOpen) {
        mdToolsSub.style.height = "22rem";
        if (arrow3) arrow3.classList.add("rotate");
        if (mdDropDown) mdDropDown.classList.add("active");
      }
    });
  }

  if (mdExtraOpt && mdExtraSub) {
    mdExtraOpt.addEventListener("click", () => {
      const isOpen = mdExtraSub.clientHeight > 0;
      closeAll();
      if (!isOpen) {
        mdExtraSub.style.height = "22rem";
        if (arrow4) arrow4.classList.add("rotate");
        if (mdDropDown) mdDropDown.classList.add("active");
      }
    });
  }
}


// Offer Banner
function setDynamicBannerOffer() {
  const windowWidth = window.innerWidth;
  const imageUrl = document.querySelector(".off-banner img");
  if (!imageUrl) return;
  
  if (windowWidth <= 575.98) {
    imageUrl.setAttribute("src", "/images/Banner/Offer-banner/top-offer-mob.webp");
  } else {
    imageUrl.setAttribute("src", "/images/Banner/Offer-banner/top-offer.webp");
  }
}

setDynamicBannerOffer();
window.addEventListener("resize", setDynamicBannerOffer);

/**
 * --- Global Search Autocomplete Logic ---
 */
$(document).ready(function() {
    const searchInputs = ['#searchInputDesktop', '#searchInputMobile'];
    const suggestionContainers = ['#suggestionsDesktop', '#suggestionsMobile'];

    searchInputs.forEach((selector, index) => {
        const $input = $(selector);
        const $suggestions = $(suggestionContainers[index]);

        if (!$input.length) return;

        let debounceTimer;
        $input.on('input', function() {
            const query = $(this).val().trim();
            console.log('Search query:', query);
            
            clearTimeout(debounceTimer);
            if (query.length < 2) {
                $suggestions.addClass('d-none').empty();
                return;
            }

            debounceTimer = setTimeout(() => {
                console.log('Fetching suggestions for:', query);
                fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log('Suggestions received:', data);
                        if (data && data.length > 0) {
                            renderSuggestions(data, $suggestions);
                        } else {
                            $suggestions.addClass('d-none').empty();
                        }
                    })
                    .catch(err => {
                        console.error('Search error:', err);
                        $suggestions.addClass('d-none').empty();
                    });
            }, 300);
        });

        // Hide suggestions when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.position-relative').length) {
                $suggestions.addClass('d-none');
            }
        });
    });

    function renderSuggestions(products, $container) {
        let html = '';
        products.forEach(product => {
            const image = (product.images && product.images.length > 0) 
                ? product.images[0].url 
                : '/images/placeholder.jpg';
            
            html += `
                <a href="/product/${product.slug}" class="suggestion-item">
                    <img src="${image}" class="suggestion-img" alt="${product.title}">
                    <div class="suggestion-info">
                        <span class="suggestion-title">${product.title}</span>
                        <div class="suggestion-meta">
                            <span class="suggestion-category">${product.category || 'Spare Part'}</span>
                        </div>
                    </div>
                    <span class="suggestion-price">₹${product.sellingPrice || product.price}</span>
                </a>
            `;
        });
        
        $container.html(html).removeClass('d-none');
    }
});
