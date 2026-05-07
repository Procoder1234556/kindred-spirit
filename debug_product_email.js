const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

const target = `const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  const email = document.getElementById("email").value.trim();
  console.log("Sent OTP: ", otp, " User OTP:", userOtp);`;

const replacement = `const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  const email = document.getElementById("email").value.trim();
  console.log("Sent OTP: ", otp, " User OTP:", userOtp, " Email:", email);
  if (!email) { alert("Email is empty"); return; }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Added email debug log to submitOtp.");
  fs.writeFileSync(path, content);
} else {
  // Try regex if whitespace mismatch
  const regex =
    /const submitOtp = async \(\) => \{\s*const userOtp = Number\(document\.getElementById\("entered_otp"\)\.value\);\s*const email = document\.getElementById\("email"\)\.value\.trim\(\);\s*console\.log\("Sent OTP: ", otp, " User OTP:", userOtp\);/m;
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    console.log("Added email debug log to submitOtp (regex).");
    fs.writeFileSync(path, content);
  } else {
    console.log("Could not find submitOtp header to inject logs.");
  }
}
