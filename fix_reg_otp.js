const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

const wrongBlock = `const email = document.getElementById("form2Example29").value;
  const email = document.getElementById("email").value;`;

const correctBlock = `const email = document.getElementById("form2Example29").value;
  const mobile = document.getElementById("mobile_no").value;`;

if (content.includes(wrongBlock)) {
  content = content.replace(wrongBlock, correctBlock);
  console.log("Fixed duplicate email declaration in sendRegOtp.");
} else {
  console.log("Block match failed. Trying flexible regex.");
  // likely spacing/indentation
  const regex =
    /const email = document\.getElementById\("form2Example29"\)\.value;\s*const email = document\.getElementById\("email"\)\.value;/m;
  if (regex.test(content)) {
    content = content.replace(
      regex,
      `const email = document.getElementById("form2Example29").value;
  const mobile = document.getElementById("mobile_no").value;`
    );
    console.log("Fixed duplicate email declaration (regex).");
  } else {
    console.log("Could not find the duplicate block.");
  }
}

// Also check if I broke the body of sendRegOtp.
// It was `mobile: mobile`. If I renamed mobile var to email, but didn't update key, it would be `mobile: mobile` (reference error if mobile var gone).
// Or did my script replace `mobile: mobile` with `email: email`?
// My script `fix_sendOtp_v2.js` did: `content = content.replace(bodyRegex, 'otp: otp,\n      email: email,');`
// `bodyRegex` was `/otp:\s*otp,\s*mobile:\s*mobile,/m;`
// `sendRegOtp` has `otp: otp, mobile: mobile`.
// So I likely changed the BODY of `sendRegOtp` to send `email: email` instead of `mobile: mobile`.
// But user registration API (`createUser`) or `getRegOTP` expects `mobile`?
// `userCtrl.js`: `getRegOTP` -> `const number = String(req.body.mobile);` (Lines 280+)
// AND `const email = req.body.email;`
// It sends email AND SMS.
// So it needs BOTH.
// `sendRegOtp` body should have BOTH `email: email` and `mobile: mobile`.

// Let's check `sendRegOtp` body in `product.js` via script.
// I'll assume I broke it and it now looks like:
// `otp: otp,
//  email: email,`
// And missing `mobile: mobile`.

// I need to Fix `sendRegOtp` body to include mobile.
// And I need to ensure `sendOtp` (forgot pass) uses `email: email`.

fs.writeFileSync(path, content);
