var announcementBarMsg = [
  {
    msg: "Flat 15% off on orders above ₹1499. USE 'SAHII15'",
  },
  {
    msg: "Flat 25% off on orders above ₹1999. USE 'SAHII25'",
  },
  {
    msg: "Unlock 10% Off Sitewide: Use code SAHII10",
  },
  {
    msg: "FREE SHIPPING on orders above ₹599",
  },
];

//popup
document.addEventListener("DOMContentLoaded", () => {
  var homePopUp = document.querySelector(".popup-section");
  var popUpCongratsBtn = document.querySelector(".popup-btn");
  popUpCongratsBtn.addEventListener("click", () => {
    homePopUp.style.display = "none";
  });
  var homePopUpClose = document.querySelector(".popup-close");
  homePopUpClose.addEventListener("click", () => {
    homePopUp.style.display = "none";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var announcementBar1 = document.querySelectorAll(".announcement-bar")[0];
  var i = 0;

  function displayMessage() {
    announcementBar1.style.opacity = 0; // Fade out the announcement bar
    setTimeout(function () {
      announcementBar1.innerText = announcementBarMsg[i].msg;
      // //console.log(announcementBar1.innerText);
      announcementBar1.style.opacity = 1; // Fade in the announcement bar
      i = (i + 1) % announcementBarMsg.length; // Wrap around the index
      setTimeout(displayMessage, 3000); // 3000 milliseconds = 3 seconds
    }, 500); // Add a slight delay for smoother transition
  }

  displayMessage(); // Call displayMessage function after DOMContentLoaded
});

document.addEventListener("DOMContentLoaded", function () {
  var announcementBar2 = document.querySelectorAll(".announcement-bar")[1];
  var i = 0;

  function displayMessage() {
    announcementBar2.style.opacity = 0; // Fade out the announcement bar
    setTimeout(function () {
      announcementBar2.innerText = announcementBarMsg[i].msg;
      announcementBar2.style.opacity = 1; // Fade in the announcement bar
      i = (i + 1) % announcementBarMsg.length; // Wrap around the index
      setTimeout(displayMessage, 3000); // 3000 milliseconds = 3 seconds
    }, 500); // Add a slight delay for smoother transition
  }

  displayMessage(); // Call displayMessage function after DOMContentLoaded
});

// var lastScroll=0;
document.addEventListener("DOMContentLoaded", () => {
  var navbar = document.querySelector("#header .fixed-top");
  // navbar.style.height="3.5rem"
  window.addEventListener("scroll", () => {
    var scrollTop = document.documentElement.scrollTop;
    // //console.log(scrollTop);
    if (scrollTop > 10) {
      navbar.classList.add("expandedp");
    } else if (scrollTop < 10) {
      navbar.classList.remove("expandedp");
    }

    if (scrollTop > 40) {
      navbar.classList.add("expandedpp");
    } else if (scrollTop < 40) {
      navbar.classList.remove("expandedpp");
    }

    if (scrollTop > 70) {
      navbar.classList.remove("expandedpp");
      navbar.classList.remove("expandedp");
      navbar.classList.remove("expanded");
      if (dropDown) {
        dropDown.classList.remove("md");
      }
      document.querySelectorAll(".top-bar")[1].style.height = "0";
    } else if (scrollTop < 145) {
      navbar.classList.add("expanded");
      document.querySelectorAll(".top-bar")[1].style.height = "2rem";

      // navbar.classList.remove("expandedp")
    }
    lastScroll = scrollTop;
  });
});

var navbtn = document.querySelector("#header .nav-right-btn button");
var mdheader = document.querySelector(".fixed-top");
// //console.log(navbtn);
navbtn.addEventListener("click", () => {
  if (navbar) {
    navbar.classList.add("expanded");
  }
  // mdheader.style.height="auto";
});

var dropDownBtn = document.querySelector(
  ".product-dropdown .product-dropdown-btn",
);
var dropDown = document.querySelector(
  "#header .navbar-nav .nav-item .drop-down",
);
dropDownBtn.addEventListener("click", () => {
  // //console.log("clicked");
  dropDown.classList.toggle("md");

  //arrow rotation of dropdown
  if (window.matchMedia("(max-width: 992px)").matches) {
    var rightArrow1 = document.querySelector(".product-dropdown-btn >i");
    rightArrow1.classList.toggle("rotate");
  }
});

// ============= DESKTOP NAVIGATION (lg and above) =============
if (window.matchMedia("(min-width: 992px)").matches) {
  // Spare Parts - Desktop
  setupDesktopBrandMenu("brand-oneplus-lg", "drop-down-model-oneplus-lg");
  setupDesktopBrandMenu("brand-samsung-lg", "drop-down-model-samsung-lg");
  setupDesktopBrandMenu("brand-poco-lg", "drop-down-model-poco-lg");
  setupDesktopBrandMenu("brand-xiaomi-lg", "drop-down-model-xiaomi-lg");
  setupDesktopBrandMenu("brand-apple-lg", "drop-down-model-apple-lg");
  setupDesktopBrandMenu("brand-oppo-lg", "drop-down-model-oppo-lg");
  setupDesktopBrandMenu("brand-realme-lg", "drop-down-model-realme-lg");
  setupDesktopBrandMenu("brand-iqoo-lg", "drop-down-model-iqoo-lg");
  setupDesktopBrandMenu("brand-vivo-lg", "drop-down-model-vivo-lg");
  setupDesktopBrandMenu("brand-motorola-lg", "drop-down-model-motorola-lg");

  // Accessories - Desktop
  setupDesktopBrandMenu(
    "brand-oneplus-acc-lg",
    "drop-down-model-oneplus-acc-lg",
  );
  setupDesktopBrandMenu(
    "brand-samsung-acc-lg",
    "drop-down-model-samsung-acc-lg",
  );
  setupDesktopBrandMenu("brand-poco-acc-lg", "drop-down-model-poco-acc-lg");
  setupDesktopBrandMenu("brand-xiaomi-acc-lg", "drop-down-model-xiaomi-acc-lg");
  setupDesktopBrandMenu("brand-apple-acc-lg", "drop-down-model-apple-acc-lg");
  setupDesktopBrandMenu("brand-oppo-acc-lg", "drop-down-model-oppo-acc-lg");
  setupDesktopBrandMenu("brand-realme-acc-lg", "drop-down-model-realme-acc-lg");
  setupDesktopBrandMenu("brand-iqoo-acc-lg", "drop-down-model-iqoo-acc-lg");
  setupDesktopBrandMenu("brand-vivo-acc-lg", "drop-down-model-vivo-acc-lg");
  setupDesktopBrandMenu(
    "brand-motorola-acc-lg",
    "drop-down-model-motorola-acc-lg",
  );

  // Function to setup desktop hover menus
  function setupDesktopBrandMenu(brandClass, modelClass) {
    var brandOpt = document.querySelector("." + brandClass);
    var modelMenu = document.querySelector("." + modelClass);

    if (brandOpt && modelMenu) {
      brandOpt.addEventListener("mouseover", function () {
        modelMenu.style.maxWidth = "10rem";
      });

      modelMenu.addEventListener("mouseover", function () {
        modelMenu.style.maxWidth = "10rem";
      });

      brandOpt.addEventListener("mouseout", function () {
        modelMenu.style.maxWidth = "0rem";
      });

      modelMenu.addEventListener("mouseout", function () {
        modelMenu.style.maxWidth = "0rem";
      });
    }
  }

  // Setup Category (Spare Parts, Accessories) hover menus
  var necklaceOpt = document.querySelector(".drop-down .necklace");
  var earringOpt = document.querySelector(".drop-down .earring");
  var ringOpt = document.querySelector(".drop-down .ring");

  var necklaceMenu = document.querySelectorAll(".drop-down-necklace")[1];
  var earringMenu = document.querySelectorAll(".drop-down-earring")[1];

  // Spare Parts hover
  if (necklaceOpt && necklaceMenu) {
    necklaceMenu.addEventListener("mouseover", function () {
      necklaceMenu.style.maxWidth = "10rem";
    });
    necklaceOpt.addEventListener("mouseover", function () {
      necklaceMenu.style.maxWidth = "10rem";
    });
    necklaceMenu.addEventListener("mouseout", function () {
      necklaceMenu.style.maxWidth = "0rem";
    });
    necklaceOpt.addEventListener("mouseout", function () {
      necklaceMenu.style.maxWidth = "0rem";
    });
  }

  // Accessories hover
  if (earringOpt && earringMenu) {
    earringMenu.addEventListener("mouseover", function () {
      earringMenu.style.maxWidth = "10rem";
    });
    earringOpt.addEventListener("mouseover", function () {
      earringMenu.style.maxWidth = "10rem";
    });
    earringMenu.addEventListener("mouseout", function () {
      earringMenu.style.maxWidth = "0rem";
    });
    earringOpt.addEventListener("mouseout", function () {
      earringMenu.style.maxWidth = "0rem";
    });
  }
}

// ============= MOBILE NAVIGATION (below lg) =============
if (window.matchMedia("(max-width: 992.98px)").matches) {
  var mdNecklaceOpt = document.querySelector(".drop-down .necklace");
  var mdEarringOpt = document.querySelector(".drop-down .earring");
  var mdRingOpt = document.querySelector(".drop-down .ring");

  var mdNecklaceSubDrop = document.querySelector(".drop-down-necklace");
  var mdEarringSubDrop = document.querySelector(".drop-down-earring");
  var mdRingSubDrop = document.querySelector(".drop-down-ring");

  var mdDropDown = document.querySelector(".drop-down");

  var rightArrow2 = document.querySelector(".necklace i");
  var rightArrow3 = document.querySelector(".earring i");
  var rightArrow4 = document.querySelector(".ring i");

  // Function to handle category toggle
  function setupCategoryClick(
    categoryOpt,
    categorySubDrop,
    categoryArrow,
    otherDrops,
    otherArrows,
  ) {
    if (!categoryOpt || !categorySubDrop) return;

    categoryOpt.addEventListener("click", function (e) {
      e.preventDefault();
      var currentHeight = categorySubDrop.clientHeight;

      if (currentHeight === 0) {
        // Close other categories
        otherDrops.forEach((drop) => {
          if (drop) drop.style.height = "0";
        });
        otherArrows.forEach((arrow) => {
          if (arrow) arrow.classList.remove("rotate");
        });

        // Open this category
        if (categoryArrow) categoryArrow.classList.add("rotate");
        categorySubDrop.style.height = "auto";
        if (mdDropDown) mdDropDown.classList.add("active");
      } else {
        // Close this category
        if (categoryArrow) categoryArrow.classList.remove("rotate");
        categorySubDrop.style.height = "0";
        if (mdDropDown) mdDropDown.classList.remove("active");
      }
    });
  }

  // Setup Spare Parts category
  setupCategoryClick(
    mdNecklaceOpt,
    mdNecklaceSubDrop,
    rightArrow2,
    [mdEarringSubDrop, mdRingSubDrop],
    [rightArrow3, rightArrow4],
  );

  // Setup Accessories category
  setupCategoryClick(
    mdEarringOpt,
    mdEarringSubDrop,
    rightArrow3,
    [mdNecklaceSubDrop, mdRingSubDrop],
    [rightArrow2, rightArrow4],
  );

  // Setup Tools category
  setupCategoryClick(
    mdRingOpt,
    mdRingSubDrop,
    rightArrow4,
    [mdNecklaceSubDrop, mdEarringSubDrop],
    [rightArrow2, rightArrow3],
  );

  // Setup brand click for mobile - expand to show models
  setupMobileBrandMenu("brand-oneplus");
  setupMobileBrandMenu("brand-samsung");
  setupMobileBrandMenu("brand-poco");
  setupMobileBrandMenu("brand-xiaomi");
  setupMobileBrandMenu("brand-apple");
  setupMobileBrandMenu("brand-oppo");
  setupMobileBrandMenu("brand-realme");
  setupMobileBrandMenu("brand-iqoo");
  setupMobileBrandMenu("brand-vivo");
  setupMobileBrandMenu("brand-motorola");

  // Setup accessories brands for mobile
  setupMobileBrandMenu("brand-oneplus-acc");
  setupMobileBrandMenu("brand-samsung-acc");
  setupMobileBrandMenu("brand-poco-acc");
  setupMobileBrandMenu("brand-xiaomi-acc");
  setupMobileBrandMenu("brand-apple-acc");
  setupMobileBrandMenu("brand-oppo-acc");
  setupMobileBrandMenu("brand-realme-acc");
  setupMobileBrandMenu("brand-iqoo-acc");
  setupMobileBrandMenu("brand-vivo-acc");
  setupMobileBrandMenu("brand-motorola-acc");

  // Function to setup mobile brand menus
  function setupMobileBrandMenu(brandClass) {
    var brandItems = document.querySelectorAll("." + brandClass);

    brandItems.forEach((brandItem) => {
      var modelDrop = brandItem.nextElementSibling;

      if (modelDrop && modelDrop.classList.contains("model-drop")) {
        brandItem.addEventListener("click", function (e) {
          e.preventDefault();

          var currentHeight = modelDrop.clientHeight;
          var brandArrow = brandItem.querySelector("i");

          if (currentHeight === 0) {
            // Open this brand's models
            if (brandArrow) brandArrow.classList.add("rotate");
            modelDrop.style.height = "auto";
          } else {
            // Close this brand's models
            if (brandArrow) brandArrow.classList.remove("rotate");
            modelDrop.style.height = "0";
          }
        });
      }
    });
  }
}

// Offer Banner
function setDynamicBannerOffer() {
  const windowWidth = window.innerWidth;
  let imageUrl = document.querySelector(".off-banner img");
  if (imageUrl) {
    if (windowWidth <= 575.98) {
      imageUrl.setAttribute(
        "src",
        "/images/Banner/Offer-banner/top-offer-mob.webp",
      );
    } else {
      imageUrl.setAttribute(
        "src",
        "/images/Banner/Offer-banner/top-offer.webp",
      );
    }
  }
}

setDynamicBannerOffer();
window.addEventListener("resize", setDynamicBannerOffer);
