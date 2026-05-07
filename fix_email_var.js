const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

// We have two 'const email = ...'.
// One is likely in sendRegOtp (line 315) and one in sendOtp (line 360).
// If they are separate functions, `const` should be block scoped and fine.
// UNLESS they are in the global scope?
// Or maybe I broke the closing brace of the previous function?

// Let's check if the previous function was closed properly.
// But first, to fix the symptom efficiently: rename the one in sendOtp.

// Context for sendOtp one:
const sendOtpDecl = 'const email = document.getElementById("email").value;';
// We want to verify it's the one inside sendOtp.
// We can use a more specific replace.

// Let's replace the one in sendOtp to use `forgotEmail` variable name.
const target = `const sendOtp = async () => {
  const email = document.getElementById("email").value;
  console.log("OTP: ", otp, " Email: ", email);`;

const replacement = `const sendOtp = async () => {
  const forgotEmail = document.getElementById("email").value;
  console.log("OTP: ", otp, " Email: ", forgotEmail);`;

// And we need to update the body usage too.
const targetBody = `body: JSON.stringify({
      otp: otp,
      email: email,
    }),`;
const replacementBody = `body: JSON.stringify({
      otp: otp,
      email: forgotEmail,
    }),`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  // Now replace the body part too - doing it broadly in the file might be risky if existing sendRegOtp has same structure.
  // sendRegOtp likely has "email: email" too?
  // Let's look at sendRegOtp body context.
  // It's safer to only replace the next occurrence after sendOtp start.
  const sendOtpIdx = content.indexOf("const sentOtp = async"); // Wait, typo in my thought? No "sendOtp".
  // I already replaced the start. Now I search for body AFTER that point.
  // Actually, I can do it in one regex replace if I construct it well.
  // Or just use the fact I have the full string in my previous "fix" script logic.

  // Let's do a scoped replace.
  const regex =
    /const sendOtp = async \(\) => \{[\s\S]*?email: email,[\s\S]*\}\);/m;
  const match = content.match(regex);
  if (match) {
    let block = match[0];
    block = block.replace("const email =", "const forgotEmail =");
    block = block.replace('Email: ", email', 'Email: ", forgotEmail');
    block = block.replace("email: email", "email: forgotEmail");
    content = content.replace(match[0], block);
    console.log("Fixed sendOtp variable name.");
  } else {
    console.log("Could not match sendOtp block for fixing.");
  }

  fs.writeFileSync(path, content);
} else {
  // Maybe whitespace mismatch again
  console.log("Could not find sendOtp start block exactly.");
  // Flexible fallback
  const startRegex =
    /const sendOtp = async \(\) => \{\s*const email = document/m;
  if (startRegex.test(content)) {
    // proceed with similar logic
    const regex =
      /const sendOtp = async \(\) => \{[\s\S]*?email: email,[\s\S]*\}\);/m;
    const match = content.match(regex);
    if (match) {
      let block = match[0];
      block = block.replace(/const email\s*=/, "const forgotEmail =");
      block = block.replace(/Email: ",\s*email/, 'Email: ", forgotEmail');
      block = block.replace(/email:\s*email/, "email: forgotEmail");
      content = content.replace(match[0], block);
      console.log("Fixed sendOtp variable name (flexible).");
      fs.writeFileSync(path, content);
    }
  }
}
