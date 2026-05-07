let otp = Math.floor(Math.random() * 10000 + 1);
// let userOtp = 0;
let mobile = "";
// console.log("Product.js is called");

// document.addEventListener('DOMContentLoaded', function() {
//     const cartCountInput = document.getElementById('cartCountInput');
//     if (cartCountInput) {
//         cartCountInput.value = cartCount;
//     }
// });

let cartHTML = " ";

const add_to_cart = async (
  id,
  slug,
  productName,
  productImg,
  quantity,
  price,
  sellingPrice,
  discount,
  color,
  bearerToken,
) => {
  // If user is not logged in (no valid token), redirect to account/login
  if (!bearerToken || bearerToken === "-1" || bearerToken.trim() === "") {
    window.location.href = "/myacc";
    return;
  }
  let get_count = Number(document.getElementById("s_quantity")?.value);
  if (!get_count) {
    get_count = 1;
  }
  console.log("Count: ", get_count);

  console.log("Get Counts: ", get_count);
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      _id: id,
      slug: slug,
      title: productName,
      image: productImg,
      count: get_count,
      price: Number(price),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount),
      quantity: Number(quantity),
      color: color,
      size: "adjustable",
    }),
  };

  const response = await fetch("/user/cart", options);
  const data = await response.json();
  console.log("Cart: ", data);

  // Update cart count in header if provided by API
  if (data && typeof data.cart_length !== "undefined") {
    const countInput = document.getElementById("cartCountInput");
    if (countInput) {
      countInput.value = data.cart_length;
    }
  }

  // Show a temporary toast for cart add
  showWishlistToast(data.message || "Added to cart");

  return data;
};

const remove_from_cart = async (id, bearerToken) => {
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      _id: id,
    }),
  };

  const data = await fetch("/user/cart-remove", options);
  const response = await data.json();
  console.log("Cart: ", response);

  // Remove corresponding cart row/card from DOM without full reload
  const cartEls = document.querySelectorAll(
    `[data-cart-prod-id="${id}"]`,
  );
  if (cartEls.length > 0) {
    cartEls.forEach((el) => el.remove());
  }

  // Update header cart count if provided
  if (response && typeof response.products !== "undefined") {
    const countInput = document.getElementById("cartCountInput");
    if (countInput) {
      countInput.value = response.products.length;
    }
  }

  // Optionally update summary (product cost, subtotal, etc.) if helper exists
  if (typeof updateCartSummaryUI === "function" && response) {
    updateCartSummaryUI({
      totalAmount: response.totalAmount,
      cartTotal: response.cartTotal,
      deliveryCharge: response.deliveryCharge,
      couponDiscount: response.couponDiscount,
    });
  }

  // Show toast
  showWishlistToast("Removed from cart");

  return response;
};

let removeFromCart = document.querySelectorAll(".remove_cart");
for (let i = 0; i < removeFromCart.length; i++) {
  removeFromCart[i].addEventListener("click", function () {
    this.innerHTML = `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;>
    <span class="visually-hidden"></span>
    </div>`;
  });
}

const buy_now = async (
  id,
  productName,
  productImg,
  quantity,
  price,
  sellingPrice,
  discount,
  color,
  bearerToken,
) => {
  // If user is not logged in (no valid token), redirect to account/login
  if (!bearerToken || bearerToken === "-1" || bearerToken.trim() === "") {
    window.location.href = "/myacc";
    return;
  }
  const get_count = Number(document.getElementById("s_quantity").value);
  console.log("Count:", get_count);
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      _id: id,
      title: productName,
      image: productImg,
      count: get_count,
      price: Number(price),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount),
      quantity: Number(quantity),
      color: color,
    }),
  };

  const response = await fetch("/user/cart", options);
  const data = await response.json();
  console.log("Cart: ", data);
  // if(!Boolean(response.status)){
  window.location.href = "/user/cart";
  // }
  // return response;
};

let buyNow = document.querySelectorAll(".buy_now");
for (let i = 0; i < buyNow.length; i++) {
  buyNow[i].addEventListener("click", function () {
    this.innerHTML = `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;>
    <span class="visually-hidden"></span>
    </div>`;
  });
}

// wishlist button for mobile

let wishHTML = " ";
let wishListButtonMob = document.querySelectorAll(".wishlist-button-small-mob");
for (let i = 0; i < wishListButtonMob.length; i++) {
  wishListButtonMob[i].addEventListener("click", function () {
    wishHTML = wishListButtonMob[i];
    // this.innerHTML = "Added to Wishlist";
    // this.style.backgroundColor = "#38b6ff";
    // this.style.color = "white";
    // this.style.opacity = ".6"
  });
}

let small_wish_button = " ";
//wishlist btn

let wishListButton = document.querySelectorAll(".wishlist-button-small");
for (let i = 0; i < wishListButton.length; i++) {
  wishListButton[i].addEventListener("click", function () {
    small_wish_button = wishListButton[i];
  });
}

const add_to_wishlist = async (prodId, _id) => {
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      // headers: `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      prodId: prodId,
      userId: _id,
    }),
  };

  // If user is not logged in (no valid id), send them to login/account
  if (!_id || _id.trim() === "") {
    window.location.href = "/myacc";
    return;
  } else {
    const data = await fetch("/product/addWishlist", options);
    const response = await data.json();
    console.log("Wishlist:", response);

    // Visually indicate the item is in wishlist
    if (wishHTML && wishHTML !== " ") {
      wishHTML.innerHTML =
        '<i class="fa-solid fa-heart" style="color: #38b6ff;"></i>';
    }
    if (small_wish_button && small_wish_button !== " ") {
      small_wish_button.innerHTML =
        '<i class="fa-solid fa-heart" style="color: #38b6ff;"></i>';
    }

    // Show a temporary toast/message
    showWishlistToast(response.message || "Added to wishlist");

    return response;
  }
};

const remove_from_wishlist = async (prodId, _id) => {
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      // headers: `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      prodId: prodId,
      userId: _id,
    }),
  };

  const data = await fetch("/product/removeWishlist", options);
  const response = await data.json();
  console.log("Wishlist:", response);

  // If we're on the wishlist page, remove the corresponding row/card instead of full reload.
  const wishlistEls = document.querySelectorAll(
    `[data-wishlist-product="${prodId}"]`,
  );
  if (wishlistEls.length > 0) {
    wishlistEls.forEach((el) => el.remove());
  } else {
    // Fallback: try to remove any parent card that has a remove button with this prodId in onclick
    const buttons = document.querySelectorAll(
      'button[onclick*="remove_from_wishlist"]',
    );
    buttons.forEach((btn) => {
      if (btn.getAttribute("onclick").includes(prodId)) {
        const card = btn.closest(".product-card") || btn.closest("tr");
        if (card) card.remove();
      }
    });
  }

  return response;
};

const toggle_quantity = async (cartId, productId, count) => {
  // Show a small spinner next to the quantity being updated
  const quantityInputs = document.querySelectorAll(
    `.quantity__input[data-prod-id="${productId}"]`,
  );
  const affectedSpinners = [];
  quantityInputs.forEach((inputEl) => {
    const container = inputEl.closest(".quantity");
    if (container) {
      const spinnerEl = container.querySelector(".spinner");
      if (spinnerEl) {
        spinnerEl.innerHTML =
          '<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;"><span class="visually-hidden">Loading...</span></div>';
        affectedSpinners.push(spinnerEl);
      }
    }
  });

  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      cartId: cartId,
      productId: productId,
      count: count,
    }),
  };

  try {
    const response = await fetch("/user/toggleQuantity", options);
    const data = await response.json();

    // Clear spinners
    affectedSpinners.forEach((el) => {
      el.innerHTML = "";
    });

    if (!data || typeof data.newCount === "undefined") {
      console.error("Failed to update quantity", data);
      return data;
    }

    const {
      productId: updatedProductId,
      newCount,
      totalAmount,
      cartTotal,
      deliveryCharge,
      couponDiscount,
    } = data;

    // Update quantity inputs (desktop + mobile)
    document
      .querySelectorAll(`.quantity__input[data-prod-id="${updatedProductId}"]`)
      .forEach((el) => {
        el.value = newCount;
      });

    // Clear coupon inputs since the cart changed and coupon was reset
    const c1 = document.getElementById("couponName1");
    const c2 = document.getElementById("couponName2");
    if (c1) c1.value = "";
    if (c2) c2.value = "";

    // Update summary numbers without reloading the page
    updateCartSummaryUI({
      totalAmount,
      cartTotal,
      deliveryCharge,
      couponDiscount,
    });

    return data;
  } catch (err) {
    console.error("Error updating quantity", err);
    // Clear spinners on error as well
    affectedSpinners.forEach((el) => {
      el.innerHTML = "";
    });
  }
};

const updateCartSummaryUI = ({
  totalAmount,
  cartTotal,
  deliveryCharge,
  couponDiscount,
}) => {
  const productCost = Number(totalAmount) || 0;
  const cartTotalNum = Number(cartTotal) || 0;
  const delivery = Number(deliveryCharge) || 0;
  const couponDisc = Number(couponDiscount) || 0;

  const productDiscount = productCost - cartTotalNum;
  const threshold = 599;
  const isFreeDelivery = cartTotalNum - couponDisc >= threshold;
  const effectiveDelivery = isFreeDelivery ? 0 : delivery;
  const subtotal = cartTotalNum + effectiveDelivery - couponDisc;
  const totalSaving =
    productCost + delivery + couponDisc - cartTotalNum;

  // Update Product Cost (summary blocks only)
  document
    .querySelectorAll(".p-cost span#p-cost")
    .forEach((el) => (el.textContent = `₹ ${productCost.toFixed(1)}`));

  // Update Product Discount
  document
    .querySelectorAll(".d-amount span#d-amount")
    .forEach(
      (el) => (el.textContent = `- ₹ ${productDiscount.toFixed(1)}`),
    );

  // Update Coupon Discount
  document
    .querySelectorAll("span#d-cost")
    .forEach((el) => (el.textContent = `- ₹ ${couponDisc.toFixed(1)}`));

  // Update Delivery Charges
  document.querySelectorAll("span#de-cost").forEach((el) => {
    if (isFreeDelivery) {
      el.innerHTML = `₹<del>${delivery.toFixed(1)}</del>`;
    } else {
      el.textContent = `+₹ ${effectiveDelivery.toFixed(1)}`;
    }
  });

  // Update remaining amount for free delivery text (if present)
  const remaining = Math.max(
    0,
    threshold - (cartTotalNum - couponDisc),
  );
  document
    .querySelectorAll("span#remaining-cost")
    .forEach((el) => (el.textContent = `₹ ${remaining.toFixed(1)}`));

  // Update total amounts: mobile total, Subtotal, Total Saving
  document.querySelectorAll("span#total-amount").forEach((span) => {
    const parentText =
      span.parentElement && span.parentElement.textContent
        ? span.parentElement.textContent
        : "";

    if (parentText.includes("Subtotal")) {
      span.textContent = `₹${subtotal.toFixed(1)}`;
    } else if (parentText.includes("Total Saving")) {
      span.textContent = `₹${totalSaving.toFixed(1)}`;
    } else {
      // Mobile "Total" blocks
      span.textContent = ` ₹ ${subtotal.toFixed(1)}`;
    }
  });
};

// Simple toast for wishlist actions
let wishlistToastTimeout;
function showWishlistToast(message) {
  let toast = document.getElementById("wishlist-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "wishlist-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#38b6ff";
    toast.style.color = "#fff";
    toast.style.padding = "8px 16px";
    toast.style.borderRadius = "16px";
    toast.style.fontSize = "0.85rem";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    toast.style.zIndex = "9999";
    toast.style.transition = "opacity 0.3s ease";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  clearTimeout(wishlistToastTimeout);
  wishlistToastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
}

// const toggle_quantity_util = async () => {
//     const options = {
//         method: 'GET',
//         headers: {
//             'Content-type': 'application/json'
//         }
//     };

//     const data = await fetch("http://localhost:3000/user/", options);
//     const res = data.json();
//     console.log(res, "__________________________");
//     return res;
// }

// const checkout = () => {
//     // Redirect to the specified URL
//     window.location.href = "/user/checkout";
// }

const sendRegOtp = async () => {
  document.getElementById("verifyNum").innerHTML =
    `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;>
    <span class="visually-hidden"></span>
  </div>`;
  const email = document.getElementById("mail").value;
  const mobile = document.getElementById("mobile").value;
  console.log("OTP: ", otp, " Email: ", email, " Mobile: ", mobile);
  document.getElementById("verifyNum").innerHTML = "Resend OTP..";
  // const options =  ;
  const response = await fetch("/user/reg_otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      otp: otp,
      email: email,
      mobile: mobile,
    }),
  });
  const data = await response.json();
  console.log("Data: ", data);
  // document.getElementById('entered_otp').style.opacity = 1;
  document.getElementById("verifyNum").innerHTML = "Verify";
  if (data.return === true) {
    document.getElementById("otp_msg").innerText = "Check your whatsApp or mail for OTP";
    document.getElementById("otp_msg").style.color = "green";
    document.getElementById("input_OTP").style.display = "block";
    document.getElementById("submit_otp").disabled = false;
  } else {
    document.getElementById("otp_msg").innerHTML = data.message || data;
  }
};

// Spinners for quantity changes are handled inside toggle_quantity now.

const sendOtp = async () => {
  const forgotEmail = (document.getElementById("email")?.value || "").trim();
  const forgotMobile = (document.getElementById("forgot_mobile")?.value || "").trim();
  const errorEl = document.getElementById("forgot_error");

  if (!forgotEmail && !forgotMobile) {
    if (errorEl) { errorEl.textContent = "Please enter your email or phone number."; errorEl.style.display = "block"; }
    return;
  }
  if (errorEl) errorEl.style.display = "none";

  console.log("OTP:", otp, "Email:", forgotEmail, "Mobile:", forgotMobile);

  const response = await fetch("/user/otp_validation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp, email: forgotEmail, mobile: forgotMobile }),
  });
  const data = await response.json();
  console.log("Data: ", data);

  if (data.return === true) {
    document.getElementById("submit_otp").disabled = false;
    if (errorEl) errorEl.style.display = "none";
  } else {
    if (errorEl) {
      errorEl.textContent = typeof data === "string" ? data : (data.message || "User not found. Check your email or phone number.");
      errorEl.style.display = "block";
    }
  }
};
// userOtp = document.getElementById('entered_otp').value;
// let userOtp = document.getElementById('entered_otp').value;
// if(userOtp !== ""){
//     if(otp == userOtp){
//         document.getElementById('submit_otp').disabled = false;
//     }
//     else{
//         document.getElementById('otp_alert').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
//         <strong>Wrong OTP</strong> Enter correct otp.
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//       </div>`
//     }
// }

const checkOtp = async () => {
  document.getElementById("otp_error_text").innerText = "";
  document.getElementById("otp_msg").innerHTML = "";
  const userOtp = Number(document.getElementById("entered_otp").value);
  console.log("Sent OTP: ", otp, " User OTP:", userOtp);
  if (otp == userOtp) {
    document.getElementById("otp_msg").innerHTML = " ";
    document.getElementById("otp_error_text").innerText = "";
    document.getElementById("register_field").style.opacity = 1;
    document.getElementById("reg_btn").disabled = false;
  } else {
    document.getElementById("otp_error_text").innerText = "Incorrect OTP";
  }
};

const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  const email = (document.getElementById("email")?.value || "").trim();
  const mobile = (document.getElementById("forgot_mobile")?.value || "").trim();
  console.log("Sent OTP: ", otp, " User OTP:", userOtp);
  if (otp == userOtp) {
    console.log("2.Sent OTP: ", typeof otp, " User OTP:", typeof userOtp);
    const response = await fetch("/user/edit-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mobile }),
    });
    const data = await response.json();
    const id = data._id;
    if (id) {
      document.getElementById("otp_alert").innerHTML =
        `<div class="alert alert-success py-2" role="alert" style="font-size:0.9rem;">User verified! Redirecting to password reset...</div>`;
      setTimeout(() => {
        window.location.href = `/user/updatePass/${id}`;
      }, 1000);
    } else {
      document.getElementById("otp_alert").innerHTML =
        `<div class="alert alert-danger alert-dismissible fade show py-2" role="alert" style="font-size:0.9rem;">
        <strong>${
          typeof data === "string" ? data : "User verification failed"
        }</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }
    // window.location.href = '/myacc';
    return data;
  } else {
    document.getElementById("otp_alert").innerHTML =
      `<div class="alert alert-danger alert-dismissible fade show py-2" role="alert" style="font-size:0.9rem;">
        <strong>Wrong OTP</strong> Enter correct OTP.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
  }
};

// const pass1 = document.getElementById('pass1').value;
// const pass2 = document.getElementById('pass2').value;

// if (pass1 !== "" && pass2 !== "") {
//     if (pass1 === pass2) {
//         document.getElementById('updatePassword').disabled = false;
//     } else {
//         document.getElementById('otp_alert').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
//         <strong>Passwords</strong> are not same.
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//         </div>`;
//     }
// }

// const submitUpdatedPassword = async(uId) => {
//     const pass1 = document.getElementById('pass1').value;
//     const pass2 = document.getElementById('pass2').value;

//     if(pass1 == pass2){
//         const response = await fetch(`/user/setUpdate/${uId}`, {
//             method: "POST",
//             headers: {
//                 'Content-type': 'application/json'
//             },
//             body: JSON.stringify({
//                 'pass': pass1,
//                 'id': uId
//             })
//         });

//         const data = await response.json();
//         console.log("Data: ", data);
//     }
//     else{
//         document.getElementById('otp_alert').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
//         <strong>Passwords</strong> are not same.
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//       </div>`
//     }
// }

//
document.getElementById("checkout_securely").addEventListener("click", () => {
  document.getElementById("checkout_securely").innerHTML =
    `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;>
    <span class="visually-hidden">Loading...</span>
  </div>`;
});

// Razorpay
function checkoutSecurely(oID) {
  var form = document.querySelector(".pay-form");
  var formData = new URLSearchParams(new FormData(form)).toString();

  fetch("/checkout/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.success) {
        var options = {
          key: res.key_id,
          amount: res.amount,
          currency: "INR",
          name: res.product_name,
          description: res.description,
          image:
            "https://res.cloudinary.com/deledfivo/image/upload/v1714409157/PRAIZ-LOGO-FULL_owsw5u.jpg",
          order_id: res.order_id,
          handler: function (response) {
            // alert("Payment Succeeded");
            window.location.href = `/thankYou/${oID}`; // Success Page
          },
          prefill: {
            contact: res.contact,
            name: res.name,
            email: res.email,
            newOrder: res.order,
          },
          notes: {
            description: res.description,
          },
          theme: {
            color: "#2300a3",
          },
        };
        var razorpayObject = new Razorpay(options);
        razorpayObject.on("payment.failed", function (response) {
          // alert("Payment Failed"); // Failure Page
          window.location.href = "/error";
        });
        razorpayObject.open();
      } else {
        alert(res.msg);
        window.location.href = "/error";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      window.location.href = "/error";
    });
}

// $(document).ready(function(){
// 	$('.pay-form').submit(function(e){
// 		e.preventDefault();

// 		var formData = $(this).serialize();

// 		$.ajax({
// 			url:"/checkout/createOrder",
// 			type:"POST",
// 			data: formData,
// 			success:function(res){
// 				if(res.success){
// 					var options = {
// 						"key": ""+res.key_id+"",
// 						"amount": ""+res.amount+"",
// 						"currency": "INR",
// 						"name": ""+res.product_name+"",
// 						"description": ""+res.description+"",
// 						"image": "https://res.cloudinary.com/deledfivo/image/upload/v1714409157/PRAIZ-LOGO-FULL_owsw5u.jpg",
// 						"order_id": ""+res.order_id+"",
// 						"handler": function (response){
// 							// alert("Payment Succeeded");
// 							window.location.href = `/thankYou/${res.key_id}`;     //Success Page
// 						},
// 						"prefill": {
// 							"contact":""+res.contact+"",
// 							"name": ""+res.name+"",
// 							"email": ""+res.email+"",
//                             "newOrder": ""+res.order+""
// 						},
// 						"notes" : {
// 							"description":""+res.description+""
// 						},
// 						"theme": {
// 							"color": "#2300a3"
// 						}
// 					};
// 					var razorpayObject = new Razorpay(options);
// 					razorpayObject.on('payment.failed', function (response){
// 						// alert("Payment Failed");            //Failure Page
//                         window.location.href = '/error';
// 					});
// 					razorpayObject.open();
// 				}
// 				else{
// 					alert(res.msg);
//                     // window.location.href = '/thankYou';
//                     window.location.href = '/error';
// 				}
// 			}
// 		})

// 	});
// });

// Define a function to be executed after 10 seconds
// function stopperFunction() {
//     console.log("10 seconds have passed!");
// }

async function handleStyle() {
  const checkboxes = document.querySelectorAll(".checkbox");

  // Empty array to store selected styles
  // const selectedStyles = [];
  let queryString = "";

  // Loop through each checkbox
  checkboxes.forEach((checkbox) => {
    // Check if the checkbox is checked
    if (checkbox.checked) {
      // Add the value of the checkbox to the selectedStyles array
      // selectedStyles.push(checkbox.nextElementSibling.textContent);
      queryString = checkbox.nextElementSibling.textContent;
      // console.log("style= ", checkbox.nextElementSibling.textContent);
    }
  });

  // Display the selected styles array on the console
  // console.log('Selected Styles:', selectedStyles);
  // const queryString = selectedStyles.join(" ");

  // Call setTimeout to execute the stopperFunction after 10 seconds (10000 milliseconds)
  // setTimeout(stopperFunction, 10000);
  if (
    queryString.startsWith("Casual") ||
    queryString.startsWith("Traditional")
  ) {
    queryString = queryString.toLowerCase();
  }
  const currentURL = window.location.href;
  // console.log(`${currentURL}&style=${queryString}`);
  window.location.href = `${currentURL}&style=${queryString}`;
  document.getElementById("prodStyle").innerHTML = `/ ${queryString}`;
}

// Handle color for filtering
function handleColor(choice) {
  console.log("Color choosed: ", choice);
  const currentURL = window.location.href;
  // const match = currentURL.match(/\(([^)]+)\)/); // Extract the URL from parentheses
  // if (match) {
  //     var url = match[1];
  //     console.log(match);
  // }
  console.log("URL: ", currentURL);
  window.location.href = `${currentURL}&color=${choice}`;
  document.getElementById("prodColor").innerHTML = `/ ${choice}`;
}

// Handle Price
const inputElement = document.getElementById("min_input");

// Function to be called when the input value changes
function setPrice() {
  // Get the current value of the input field
  const value = inputElement.value;
  // Print the value in the console
  console.log(value);
}

// Add event listener to listen for changes in the input field
inputElement.addEventListener("change", setPrice);
