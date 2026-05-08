// Login-Reg Page
let login_otp = Math.floor(Math.random() * 10000 + 1);
let login_mobile = "";

var loginBtn = document.querySelector(".sign-in");
var regBtn = document.querySelector(".sign-up");
var choose = document.querySelector(".choose-way");
var regHere = document.querySelectorAll(".reg-here");

function setActiveButton(activeBtn) {
    const liItems = document.querySelectorAll('.choose-way ul li');
    if (liItems) {
        liItems.forEach((li) => {
            li.classList.remove('active');
        });
    }
    if (activeBtn) activeBtn.classList.add('active');
}

if (loginBtn && choose) {
    loginBtn.addEventListener("click", () => {
        if (!choose.classList.contains("s-login")) {
            choose.classList.add("s-login");
            choose.classList.remove("s-reg");
            const loginEmail = document.getElementById("login-email");
            if (loginEmail) loginEmail.style.display = "block";
        }
        setActiveButton(loginBtn);
    });
}

if (regBtn && choose) {
    regBtn.addEventListener("click", () => {
        if (!choose.classList.contains("s-reg")) {
            choose.classList.add("s-reg");
            choose.classList.remove("s-login");
            const loginEmail = document.getElementById("login-email");
            const loginNum = document.getElementById("login-number");
            if (loginEmail) loginEmail.style.display = "none";
            if (loginNum) loginNum.style.display = "none";
        }
        setActiveButton(regBtn);
    });
}

if (regHere && choose) {
    regHere.forEach((btn) => {
        btn.addEventListener("click", () => {
            choose.classList.add("s-reg");
            choose.classList.remove("s-login");
            const loginEmail = document.getElementById("login-email");
            const loginNum = document.getElementById("login-number");
            if (loginEmail) loginEmail.style.display = "none";
            if (loginNum) loginNum.style.display = "none";
            setActiveButton(regBtn);
        });
    });
}

const loginNumLink = document.getElementById("login-number-link");
if (loginNumLink) {
    loginNumLink.addEventListener("click", function () {
        const loginEmail = document.getElementById("login-email");
        const loginNum = document.getElementById("login-number");
        if (loginEmail) loginEmail.style.display = "none";
        if (loginNum) loginNum.style.display = "block";
    });
}

const loginEmailLink = document.getElementById("login-email-link");
if (loginEmailLink) {
    loginEmailLink.addEventListener("click", function () {
        const loginEmail = document.getElementById("login-email");
        const loginNum = document.getElementById("login-number");
        if (loginNum) loginNum.style.display = "none";
        if (loginEmail) loginEmail.style.display = "block";
    });
}

const sendLoginOtp = async () => {
    const verifyNumLogin = document.getElementById('verifyNum-login');
    const mobileNoLogin = document.getElementById('mobile_no-login');
    if (!verifyNumLogin || !mobileNoLogin) return;

    verifyNumLogin.innerHTML = `<div class="spinner-grow" role="status" style="--bs-spinner-width: 1rem;--bs-spinner-height: 1rem;">
    <span class="visually-hidden"></span>
  </div>`;
    login_mobile = mobileNoLogin.value;
    console.log("OTP: ", login_otp, " Mobile-no.: ", login_mobile);
    verifyNumLogin.innerHTML = "Resend OTP..";

    try {
        const response = await fetch("/user/reg_otp", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "otp": login_otp, "mobile": login_mobile })
        });
        const data = await response.json();
        console.log("Data: ", data);
        verifyNumLogin.innerHTML = 'Verify';
        if (data.return === true) {
            const inputOtpLogin = document.getElementById('input-OTP-login');
            const submitOtpLogin = document.getElementById('submit-otp-login');
            if (inputOtpLogin) inputOtpLogin.style.display = 'block';
            if (submitOtpLogin) submitOtpLogin.disabled = false;
        } else {
            const otpMsgLogin = document.getElementById('otp-msg-login');
            if (otpMsgLogin) otpMsgLogin.innerHTML = data;
        }
    } catch (err) {
        console.error("Error sending OTP:", err);
        verifyNumLogin.innerHTML = 'Verify';
    }
}

const checkLoginOtp = async () => {
    const otpMsgLogin = document.getElementById('otp-msg-login');
    const enteredOtpLogin = document.getElementById('entered-otp-login');
    if (!otpMsgLogin || !enteredOtpLogin) return;

    otpMsgLogin.innerHTML = "";
    const userOtp = (Number)(enteredOtpLogin.value);
    console.log("Sent OTP: ", login_otp, " User OTP:", userOtp);
    if (login_otp == userOtp) {
        otpMsgLogin.innerHTML = " ";
        const loginField = document.getElementById('login-field');
        const loginBtnEl = document.getElementById('login-btn');
        if (loginField) loginField.style.opacity = 1;
        if (loginBtnEl) loginBtnEl.disabled = false;
    } else {
        otpMsgLogin.innerHTML = "Wrong OTP";
    }
}