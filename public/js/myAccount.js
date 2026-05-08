// Address functionality start
// Handling Save Address buttons
const radioButtons = document.querySelectorAll('input[type="radio"]');
if (radioButtons) {
  radioButtons.forEach((radioButton, index) => {
    radioButton.addEventListener('change', () => {
      // Call your save_to_order() function here
      console.log("----------------------------");
      save_to_order(index);
    });
  });
}
// Address functionality End

var sideMenu = document.querySelector(".account-side-menu");
var option1 = document.querySelector(".option-1");
var option3 = document.querySelector(".option-3");
var option4 = document.querySelector(".option-4");

if (option1 && sideMenu) {
  option1.addEventListener("click", () => {
    sideMenu.classList = ["account-side-menu"];
    sideMenu.classList.add("option1");
  })
}

if (option3 && sideMenu) {
  option3.addEventListener("click", () => {
    sideMenu.classList = ["account-side-menu"];
    sideMenu.classList.add("option3");
  })
}

if (option4 && sideMenu) {
  option4.addEventListener("click", () => {
    sideMenu.classList = ["account-side-menu"];
    sideMenu.classList.add("option4");
  })
}

//Address Book
var addressCard = document.querySelector(".address-card");
var card = document.querySelectorAll(".Acard");

if (card && card.length > 0 && addressCard) {
  card[0].addEventListener("click", () => {
    addressCard.classList.add("new-card");
    if (addressCard.classList.contains("new-card") && option3) {
      option3.addEventListener("click", () => {
        addressCard.classList.remove("new-card");
      })
    };
  })
}

var addressName = document.querySelectorAll(".address-name");
if (sideMenu && sideMenu.classList.contains("option3")) {
  //console.log(addressName);
}

var editBtn = document.querySelectorAll(".edit-btn");
var submitBtn = document.querySelectorAll(".submit-btn");
var infoInner = document.querySelectorAll(".info-inner");
if (editBtn) {
  for (let i = 0; i < editBtn.length; i++) {
    editBtn[i].addEventListener("click", () => {
      if (infoInner[i]) infoInner[i].classList.add("editBtn");
    })
  }
}

// New Address Book
var lgAddressCards = document.querySelectorAll(".lg-address-card");
var addressBookLg = document.querySelector(".address-book-lg");
var backBtn = document.querySelectorAll(".address-form .back-btn");

if (lgAddressCards && lgAddressCards.length > 0 && addressBookLg) {
  lgAddressCards[0].addEventListener("click", function () {
    setTimeout(() => {
      addressBookLg.classList.add("active");
    }, 100);
  })
}

if (backBtn && addressBookLg) {
  for (var i = 0; i < backBtn.length; i++) {
    backBtn[i].addEventListener("click", function () {
      addressBookLg.classList.remove("active");
    })
  }
}

// New Address Book for Mob Screen
var xsAddressCards = document.querySelectorAll(".xs-address-card");
var addressBookXs = document.querySelector(".address-book-xs");
var backBtnXs = document.querySelectorAll(".address-form-xs .back-btn");

if (xsAddressCards && xsAddressCards.length > 0 && addressBookXs) {
  xsAddressCards[0].addEventListener("click", function () {
    setTimeout(() => {
      addressBookXs.classList.add("active");
    }, 100);
  })
}

if (backBtnXs && addressBookXs) {
  for (var i = 0; i < backBtnXs.length; i++) {
    backBtnXs[i].addEventListener("click", function () {
      addressBookXs.classList.remove("active");
    })
  }
}

//Mobile MyAccount Menu
var mobMenu = document.querySelector(".mob-account-opt");
var mobOpt1 = document.querySelector(".mob-option-1");
var mobOpt3 = document.querySelector(".mob-option-3");
var mobOpt4 = document.querySelector(".mob-option-4");

if (mobOpt1 && mobMenu) {
  mobOpt1.addEventListener("click", () => {
    mobMenu.className = "mob-account-opt d-block d-sm-none order-history";
  })
}

if (mobOpt3 && mobMenu) {
  mobOpt3.addEventListener("click", () => {
    mobMenu.className = "mob-account-opt d-block d-sm-none address-book";
  })
}

if (mobOpt4 && mobMenu) {
  mobOpt4.addEventListener("click", () => {
    mobMenu.className = "mob-account-opt d-block d-sm-none my-account";
  })
}

// Set Rating
document.addEventListener('DOMContentLoaded', function () {
  const rateBtns = document.querySelectorAll('.rateBtn');
  const closeModalBtnRat = document.querySelector('.close');
  const closeModalBtn2 = document.querySelector('.close2');
  const modal = document.getElementById('ratingModal');
  const modal2 = document.getElementById('ratingModal2');
  const stars = document.querySelectorAll('.star');
  const stars2 = document.querySelectorAll('.star2');
  const submitBtn = document.getElementById('submitBtn');
  const closeBtn = document.getElementById('closeBtn');
  const submitBtn2 = document.getElementById('submitBtn2');
  const closeBtn2 = document.getElementById('closeBtn2');
  const ratingValue = document.getElementById('ratingValue');
  const ratingValue2 = document.getElementById('ratingValue2');

  if (rateBtns) {
    rateBtns.forEach(rateBtn => {
      rateBtn.addEventListener('click', function () {
        if (modal) modal.style.display = 'block';
        if (modal2) modal2.style.display = 'block';
      });
    });
  }

  if (closeModalBtnRat && modal) {
    closeModalBtnRat.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  }

  if (closeModalBtn2 && modal2) {
    closeModalBtn2.addEventListener('click', function () {
      modal2.style.display = 'none';
    });
  }

  if (stars) {
    stars.forEach(star => {
      star.addEventListener('click', function () {
        const rating = parseInt(star.getAttribute('data-rating'));
        stars.forEach((s, index) => {
          if (index < rating) {
            s.classList.remove('far');
            s.classList.add('fas', 'solid');
          } else {
            s.classList.remove('fas', 'solid');
            s.classList.add('far');
          }
        });
        if (ratingValue) ratingValue.value = rating;
      });
    });
  }

  if (stars2) {
    stars2.forEach(star => {
      star.addEventListener('click', function () {
        const rating = parseInt(star.getAttribute('data-rating'));
        stars2.forEach((s, index) => {
          if (index < rating) {
            s.classList.remove('far');
            s.classList.add('fas', 'solid');
          } else {
            s.classList.remove('fas', 'solid');
            s.classList.add('far');
          }
        });
        if (ratingValue2) ratingValue2.value = rating;
      });
    });
  }

  if (submitBtn && modal) {
    submitBtn.addEventListener('click', function () {
      const rating = document.querySelectorAll('.star.fas').length;
      if (rating > 0) {
        modal.style.display = 'none';
      } else {
        alert('Please rate the product.');
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  }

  if (submitBtn2 && modal2) {
    submitBtn2.addEventListener('click', function () {
      const rating = document.querySelectorAll('.star2.fas').length;
      if (rating > 0) {
        modal2.style.display = 'none';
      } else {
        alert('Please rate the product.');
      }
    });
  }

  if (closeBtn2 && modal2) {
    closeBtn2.addEventListener('click', function () {
      modal2.style.display = 'none';
    });
  }

  window.addEventListener('click', function (event) {
    if (event.target === modal && modal) {
      modal.style.display = 'none';
    }
    if (event.target === modal2 && modal2) {
      modal2.style.display = 'none';
    }
  });
});

const setRatings = async(pId) => {
  const rateValueEl = document.getElementById('ratingValue');
  if (!rateValueEl) return;
  const rate = rateValueEl.value;

  const response = await fetch('/product/rating', {
    method: "POST",
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ star: rate, prodId: pId })
  });

  const data = await response.json();
  const modal = document.getElementById('ratingModal');
  const modal2 = document.getElementById('ratingModal2');
  if (modal) modal.style.display = 'none';
  if (modal2) modal2.style.display = 'none';
}

function check_address(uId) {
  const fnEl = document.getElementById('firstname');
  const lnEl = document.getElementById('lastname');
  const a1El = document.getElementById('address1');
  const pcEl = document.getElementById('pin_code');
  const pnEl = document.getElementById('phone_no');
  const tEl = document.getElementById('title');
  const alertEl = document.getElementById('address_alert');

  if (!fnEl || !lnEl || !a1El || !pcEl || !pnEl || !tEl) return false;

  const firstName = fnEl.value;
  const lastName = lnEl.value;
  const address1 = a1El.value;
  const pinCode = pcEl.value;
  const phoneNo = pnEl.value;
  const title = tEl.value;

  if (firstName.trim() === '' || lastName.trim() === '' || address1.trim() === '' || pinCode.trim() === '' || phoneNo.trim() === '' || title.trim() === '') {
      if (alertEl) alertEl.innerHTML = `*Fill all the essential fields before submitting!`;
      return false;
  }

  var phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phoneNo)) {
    if (alertEl) alertEl.innerHTML = '*Please enter a valid 10-digit phone number.';
      return false;
  }

  if (alertEl) alertEl.innerHTML = '';
  const submitBtn = document.getElementById('address_submit');
  if (submitBtn) submitBtn.innerHTML = 'Submitting...';

  save_address(uId);
}

async function save_address(uId){
  const fnEl = document.getElementById('firstname');
  const lnEl = document.getElementById('lastname');
  const a1El = document.getElementById('address1');
  const a2El = document.getElementById('address2');
  const pcEl = document.getElementById('pin_code');
  const pnEl = document.getElementById('phone_no');
  const tEl = document.getElementById('title');

  if (!fnEl || !lnEl || !a1El || !pcEl || !pnEl) return;

  const firstname = fnEl.value;
  const lastname = lnEl.value;
  const address = `${a1El.value || ''} ${a2El?.value || ''}`.trim();
  const pin_code = pcEl.value;
  const phone_number = pnEl.value;
  const title = tEl?.value;

  try {
      const response = await fetch(`/user/save-address/${uId}`, {
          method: "POST",
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ firstname, lastname, address, pin_code, phone_number, title }),
      });

  if (!response.ok) throw new Error('Network response was not ok.');
  window.location.reload();
} catch (error) {
  console.error('Error saving address:', error);
}
};

var addOptions = document.querySelectorAll(".form-check");
if (addOptions) {
  addOptions.forEach(function(element, index) {
    element.addEventListener("click", function() {
        this.classList.add("selected");
        addOptions.forEach(function(otherElement, otherIndex) {
            if (otherIndex !== index && otherElement.classList.contains("selected")) {
                otherElement.classList.remove("selected");
            }
        });
    });
  });
}

async function save_to_order(position) {
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  if(position !== radioButtons.length-1){
      const oIdEl = document.getElementById('order_id');
      if (!oIdEl) return;
      const oId = oIdEl.value;
      
      const fnEls = document.getElementsByClassName('address-firstname');
      const lnEls = document.getElementsByClassName('address-lastname');
      const pcEls = document.getElementsByClassName('address-pin_code');
      const pnEls = document.getElementsByClassName('address-phone_number');
      const tEls = document.getElementsByClassName('address-title');
      const aEls = document.getElementsByClassName('address-content');

      if (!fnEls[position]) return;

      const firstname = fnEls[position].innerHTML;
      const lastname = lnEls[position].innerHTML;
      const pin_code = pcEls[position].innerHTML;
      const phone_number = pnEls[position].innerHTML;
      const title = tEls[position].innerHTML;
      const address = aEls[position].innerHTML;

      try {
          const response = await fetch(`/user/save-address-to-order`, {
              method: "POST",
              headers: { 'Content-type': 'application/json' },
              body: JSON.stringify({ oId, firstname, lastname, address, pin_code, phone_number, title }),
          });
  
      if (!response.ok) throw new Error('Network response was not ok.');
  
      const data = await response.json();
      console.log("Updated Order: ", data);
      const secureBtn = document.getElementById('checkout_securely');
      if (secureBtn) secureBtn.disabled = false;
  } catch (error) {
      console.error('Error updating Order:', error);
  }
  } else {
    const secureBtn = document.getElementById('checkout_securely');
    if (secureBtn) secureBtn.disabled = true;
  }
}
