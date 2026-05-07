// Gift Wrap
async function toggleGiftWrapText_1() {
    // let texts = document.querySelectorAll(".gift-wrap-text-1");
    let checkbox = document.getElementById("gift-wrap-1");
    console.log("Box: ", checkbox);

        if (checkbox.checked) {
            const response = await fetch("/user/gift-wrap", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "addon": 25
                })
            });
            const data = await response.json();
            console.log("Data: ", data);
            location.reload();
        } else {
            const response = await fetch("/user/gift-wrap", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "addon": -25
                })
            });
            const data = await response.json();
            console.log("Data: ", data);
            location.reload();
        }
}

async function toggleGiftWrapText_2() {
    let checkbox = document.getElementById("gift-wrap-2");
    console.log("Box: ", checkbox);

        if (checkbox.checked) {
            const response = await fetch("/user/gift-wrap", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "addon": 25
                })
            });
            const data = await response.json();
            console.log("Data: ", data);
            location.reload();
        } else {
            const response = await fetch("/user/gift-wrap", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "addon": -25
                })
            });
            const data = await response.json();
            console.log("Data: ", data);
            location.reload();
        }
}



document.addEventListener("DOMContentLoaded", function () {
    const temp = document.querySelectorAll(".quantity");
    const minus = document.querySelectorAll(".quantity__minus");
    const plus = document.querySelectorAll(".quantity__plus");
    const input = document.querySelectorAll(".quantity__input");

    for (let i = 0; i < temp.length; i++) {
        minus[i].addEventListener("click", function (e) {
            e.preventDefault();
            var value = input[i].value;
            if (value > 1) {
                value--;
            }
            input[i].value = value;
        });

        plus[i].addEventListener("click", function (e) {
            e.preventDefault();
            var value = input[i].value;
            value++;
            input[i].value = value;
        });
    }
});

wishlistBtn = document.querySelectorAll(".w-btn");
//console.log(wishlistBtn.length);
for (let i = 0; i < wishlistBtn.length; i++) {
    wishlistBtn[i].addEventListener("click", () => {
        document.querySelectorAll(".w-btn")[i].textContent = "Added";
    })
}


var addOpt=document.querySelectorAll(".form-check");
var newAddForm = document.querySelector(".new-add-form");
var addressForm=document.querySelector(".address-form")

addOpt.forEach(function(element, index) {
    element.addEventListener("click", function() {
        this.classList.add("selected");
        addOpt.forEach(function(otherElement, otherIndex) {
            if (otherIndex !== index && otherElement.classList.contains("selected")) {
                otherElement.classList.remove("selected");
            }
        });
        //console.log("clicked");
    });
});

// Apply Coupon
const applyCoupon = async (uId) => {
    const coupon1 = document.getElementById('couponName1');
    const coupon2 = document.getElementById('couponName2');
    let coupon = "";
    document.querySelectorAll('.apply-btn').forEach((btn) => {
        btn.innerHTML = `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;">
            <span class="visually-hidden">Loading...</span>
            </div>`;
    });

    // Add event listener to each input
    if (coupon1.value.trim() !== '') {
        coupon = coupon1.value.trim();
    } else if(coupon2.value.trim() !== '') {
        coupon = coupon2.value.trim();
    }

    console.log("Coupon: ", coupon);
    try {
        const response = await fetch('/user/cart/applycoupon', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'id': uId,
                'coupon': coupon
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        console.log("Discount: ", data);

        // Restore button labels
        document.querySelectorAll('.apply-btn').forEach((btn) => {
            btn.innerHTML = "Apply Coupon";
        });

        // Update summary UI without full page reload if helper is available
        if (typeof updateCartSummaryUI === "function" && data) {
            updateCartSummaryUI({
                totalAmount: data.totalAmount,
                cartTotal: data.cartTotal,
                deliveryCharge: data.deliveryCharge,
                couponDiscount: data.couponDiscount,
            });
        }

        // Show or hide "Remove Coupon" buttons based on whether a coupon is active
        const hasDiscount = Number(data.couponDiscount) > 0;
        document.querySelectorAll('.remove-coupon-btn').forEach((btn) => {
            btn.style.display = hasDiscount ? 'inline-block' : 'none';
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
    }
};

// Clear applied coupon via button
const removeCoupon = async (uId) => {
    const coupon1 = document.getElementById('couponName1');
    const coupon2 = document.getElementById('couponName2');
    if (coupon1) coupon1.value = "";
    if (coupon2) coupon2.value = "";

    // Reuse applyCoupon with empty code, backend will reset discount to 0
    await applyCoupon(uId);
};


// Coupon modal: fetch and show all available coupons
const openCouponModal = async () => {
    const modal = document.getElementById("couponModal");
    const listContainer = document.getElementById("couponList");
    if (!modal || !listContainer) return;

    modal.style.display = "block";
    listContainer.innerHTML = `<p>Loading coupons...</p>`;

    try {
        const response = await fetch("/coupon/all_coupons");
        if (!response.ok) {
            throw new Error("Failed to fetch coupons");
        }
        const coupons = await response.json();

        if (!Array.isArray(coupons) || coupons.length === 0) {
            listContainer.innerHTML = `<p>No coupons available at the moment.</p>`;
            return;
        }

        listContainer.innerHTML = coupons
            .map((coupon) => {
                const expiry = coupon.expiry
                    ? new Date(coupon.expiry).toLocaleDateString()
                    : "N/A";
                return `
          <div class="coupon-item" style="border:1px solid #ddd; border-radius:4px; padding:8px; margin-bottom:8px;">
            <div class="coupon-header" style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <strong>${coupon.name}</strong>
              <span>${coupon.discount}% OFF</span>
            </div>
            <div class="coupon-body" style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
              <span>Valid till: ${expiry}</span>
              <button type="button" class="btn btn-sm btn-primary" data-coupon="${coupon.name}">Apply</button>
            </div>
          </div>
        `;
            })
            .join("");
    } catch (error) {
        console.error("Error fetching coupons:", error);
        listContainer.innerHTML = `<p>Failed to load coupons. Please try again.</p>`;
    }
};

const closeCouponModal = () => {
    const modal = document.getElementById("couponModal");
    if (modal) {
        modal.style.display = "none";
    }
};

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    const modal = document.getElementById("couponModal");
    if (modal && event.target === modal) {
        closeCouponModal();
    }
});

// Ensure coupon modal is hidden on initial load or when returning via browser Back/Forward cache
window.addEventListener("pageshow", () => {
    const modal = document.getElementById("couponModal");
    if (modal) {
        modal.style.display = "none";
    }
});

// Delegate clicks on "Apply" buttons inside coupon list
document.addEventListener("click", (event) => {
    if (
        event.target &&
        event.target.matches("#couponList button[data-coupon]")
    ) {
        const code = event.target.getAttribute("data-coupon");
        const input1 = document.getElementById("couponName1");
        const input2 = document.getElementById("couponName2");

        if (input1) input1.value = code;
        if (input2) input2.value = code;

        const userId = window.CART_USER_ID;
        if (typeof applyCoupon === "function" && userId) {
            applyCoupon(userId);
        }
        closeCouponModal();
    }
});


// Create Order
const checkout = async (cartID, userId) => {
    //console.log("CartID: ", cartID);
    try {
        const response = await fetch('/user/cart/create_order', {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'id': cartID,
                'uId': userId,
            })
        });
        

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        //console.log("Order: ", data);
        if(data.message === 'success'){
            window.location.href = `/user/checkout/${userId}`;
        }
    } catch (error) {
        console.error('Error creating order:', error);
    }
};

let checkoutCart = document.querySelectorAll(".cart_checkout");
    for (let i = 0; i < checkoutCart.length; i++) {
        checkoutCart[i].addEventListener("click", function () {
    this.innerHTML = `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;>
    <span class="visually-hidden"></span>
    </div>`;
    });
}