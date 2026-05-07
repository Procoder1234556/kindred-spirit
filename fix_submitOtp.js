const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

// The submitOtp logic currently fetches `document.getElementById("entered_otp").value`
// and sends `{ mobile: mobile }`.
// `mobile` variable is implicit global (bad!) or undefined if registration didn't run.
// I need it to get `email` from DOM.

// I previously corrected `sendOtp` in `product.js` to:
// `const email = document.getElementById("form2Example29").value;` (wait, that was sendRegOtp)
// `sendOtp` uses `document.getElementById("email").value`.

// So I should grab `email` value again in `submitOtp`.

const target = `const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  console.log("Sent OTP: ", otp, " User OTP:", userOtp);
  if (otp == userOtp) {
    console.log("2.Sent OTP: ", typeof otp, " User OTP:", typeof userOtp);
    const response = await fetch("/user/edit-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: mobile,
      }),
    });
    const data = await response.json();`;

// The replacement:
const replacement = `const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  const email = document.getElementById("email").value;
  console.log("Sent OTP: ", otp, " User OTP:", userOtp);
  if (otp == userOtp) {
    console.log("2.Sent OTP: ", typeof otp, " User OTP:", typeof userOtp);
    const response = await fetch("/user/edit-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    const data = await response.json();`;

if (content.indexOf(target) !== -1) {
  content = content.replace(target, replacement); // exact match might fail due to whitespace in target string
  // I'll try exact match first
  console.log("Matched submitOtp exactly.");
  fs.writeFileSync(path, content);
} else {
  // Try regex-based replacement
  // Need to match from `const submitOtp` down to `body: JSON.stringify({` ... `mobile: mobile`

  // I will try to replace just the body part inside `submitOtp`.
  // But `mobile: mobile` might be common.
  // I need to be sure it's inside `submitOtp`.

  // Let's replace the whole function structure.
  const regex =
    /const submitOtp = async \(\) => \{[\s\S]*?body: JSON\.stringify\(\{[\s\S]*?mobile: mobile,[\s\S]*\}\),[\s\S]*const data = await response/m;
  if (regex.test(content)) {
    const match = content.match(regex);
    let block = match[0];
    // Inject email getting
    block = block.replace(
      /const userOtp = Number\(document\.getElementById\("entered_otp"\)\.value\);/,
      `const userOtp = Number(document.getElementById("entered_otp").value);\n  const email = document.getElementById("email").value;`
    );
    // Replace body
    block = block.replace(/mobile: mobile,/, `email: email,`);

    content = content.replace(match[0], block);
    console.log("Updated submitOtp via regex.");
    fs.writeFileSync(path, content);
  } else {
    console.log("Could not find submitOtp block to update.");
  }
}
