//Style Filter

const styleBtn = document.querySelectorAll(".style-btn")[0],
  optionFirst = document.querySelectorAll(".option");

if (styleBtn) {
  styleBtn.addEventListener("click", () => {
    styleBtn.classList.toggle("open");
  });
}

if (optionFirst) {
  optionFirst.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("checked");

      let checked = document.querySelectorAll(".checked"),
        btnText = document.querySelector(".btn-text");

      if (checked && checked.length > 0) {
        if (btnText) btnText.innerText = `${checked.length} Selected`;
      } else {
        if (btnText) btnText.innerText = "Style";
      }
    });
  });
}

// Price Slider js

const rangeInput = document.querySelectorAll(".range-input input"),
  priceInput = document.querySelectorAll(".price-input input"),
  range = document.querySelector(".slider .progress");
let priceGap = 100;

if (priceInput) {
  priceInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let minPrice = parseInt(priceInput[0].value),
        maxPrice = parseInt(priceInput[1].value);

      if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
        if (e.target.className === "input-min") {
          if (rangeInput[0]) rangeInput[0].value = minPrice;
          if (range) range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
        } else {
          if (rangeInput[1]) rangeInput[1].value = maxPrice;
          if (range) range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
        }
      }
    });
  });
}

if (rangeInput) {
  rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
      let minVal = parseInt(rangeInput[0].value),
        maxVal = parseInt(rangeInput[1].value);

      if (maxVal - minVal < priceGap) {
        if (e.target.className === "range-min") {
          rangeInput[0].value = maxVal - priceGap;
        } else {
          rangeInput[1].value = minVal + priceGap;
        }
      } else {
        if (priceInput[0]) priceInput[0].value = minVal;
        if (priceInput[1]) priceInput[1].value = maxVal;
        if (range) {
          range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
          range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
        }
      }
    });
  });
}

const priceBtn = document.querySelectorAll(".style-btn")[2],
  priceSlider = document.querySelectorAll(".price-slider");

if (priceBtn) {
  priceBtn.addEventListener("click", () => {
    priceBtn.classList.toggle("open");
  });
}

//Color Filter

const colorBtn = document.querySelectorAll(".style-btn")[1],
  colorOptions = document.querySelectorAll(".color");

if (colorBtn) {
  colorBtn.addEventListener("click", () => {
    colorBtn.classList.toggle("open");
  });
}

let colorChosen = "none";
let colorText = document.querySelector(".color-btn-text");
if (colorOptions) {
  colorOptions.forEach((item) => {
    item.addEventListener("click", () => {
      colorChosen = item.innerText;
      if (colorChosen != "none" && colorText) {
        colorText.innerText = colorChosen;
      }
    });
  });
}

//Sorting Filter

const sortBtn = document.querySelectorAll(".style-btn")[3],
  sortOptions = document.querySelectorAll(".sort");

if (sortBtn) {
  sortBtn.addEventListener("click", () => {
    sortBtn.classList.toggle("open");
  });
}

let sortChosen = "none";
let sortText = document.querySelector(".sort-btn-text");
if (sortOptions) {
  sortOptions.forEach((item) => {
    item.addEventListener("click", () => {
      sortChosen = item.innerText;
      if (sortChosen != "none" && sortText) {
        sortText.innerText = sortChosen;
      }
    });
  });
}

//Side Menu

var dropdownButtons = document.getElementsByClassName("dropdown-btn");
var i;

if (dropdownButtons) {
  for (i = 0; i < dropdownButtons.length; i++) {
    dropdownButtons[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      if (dropdownContent) {
        if (dropdownContent.style.maxHeight === "15rem") {
          dropdownContent.style.maxHeight = "0";
          this.style.backgroundColor = "white";
        } else {
          dropdownContent.style.maxHeight = "15rem";
          this.style.backgroundColor = "grey";
        }
      }
    });
  }
}

// toggle

var filterMob = document.querySelector(".filter-mob");
var optionList = document.querySelector(".mobileShow-plist");
if (filterMob && optionList) {
  filterMob.addEventListener("click", () => {
    optionList.classList.toggle("f-clicked");
  });
}

var sideMenuCloseBtn = document.querySelector(".close-side-menu");
if (sideMenuCloseBtn && optionList) {
  sideMenuCloseBtn.addEventListener("click", () => {
    optionList.classList.remove("f-clicked");
  });
}

var sortFilterMob = document.querySelector(".sort-mob");
if (sortFilterMob && optionList) {
  sortFilterMob.addEventListener("click", () => {
    optionList.classList.toggle("s-clicked");
  });
}

var midMenuCloseBtn = document.querySelector(".close-mid-menu");
if (midMenuCloseBtn && optionList) {
  midMenuCloseBtn.addEventListener("click", () => {
    optionList.classList.remove("s-clicked");
  });
}

//Filter button arrows

const sideDropdowns = document.querySelectorAll(".dropdown-btn");
const sideArrows = document.querySelectorAll(".dropdown-btn .fa-caret-right");

if (sideDropdowns.length > 0 && sideArrows.length > 0) {
  if (sideDropdowns[0] && sideArrows[0]) {
    sideDropdowns[0].addEventListener("click", function () {
      sideArrows[0].classList.toggle("selected");
    });
  }
  if (sideDropdowns[1] && sideArrows[1]) {
    sideDropdowns[1].addEventListener("click", function () {
      sideArrows[1].classList.toggle("selected");
    });
  }
  if (sideDropdowns[2] && sideArrows[2]) {
    sideDropdowns[2].addEventListener("click", function () {
      sideArrows[2].classList.toggle("selected");
    });
  }
}
