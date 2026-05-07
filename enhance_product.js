const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

// 1. Trim email usage in submitOtp
// const email = document.getElementById("email").value;
// to
// const email = document.getElementById("email").value.trim();

if (content.includes('const email = document.getElementById("email").value;')) {
  content = content.replace(
    'const email = document.getElementById("email").value;',
    'const email = document.getElementById("email").value.trim();'
  );
  console.log("Updated product.js to trim email.");
}

// 2. Add "Redirecting..." feedback in submitOtp
// window.location.href = `/user/updatePass/${id}`;
// Change to show alert/text then redirect.
// But alert might be annoying. Just nice text in the alert box?
// document.getElementById("otp_alert").innerHTML = ... success ...
// then redirect after small delay or immediately.
// If I redirect immediately, user won't see message.
// User said: "atleast give a message ... that user found".
// So let's show message and wait 1 sec.

const redirectBlock = `if (id) {
      window.location.href = \`/user/updatePass/\${id}\`;
    }`;

const redirectWithFeedback = `if (id) {
      document.getElementById("otp_alert").innerHTML = \`<div class="alert alert-success" role="alert">User verified! Redirecting to password reset...</div>\`;
      setTimeout(() => {
        window.location.href = \`/user/updatePass/\${id}\`;
      }, 1000);
    }`;

// I'll search for the block I put in previously (using fix_submitOtp_alert.js logic)
// It was:
//     if (id) {
//       window.location.href = `/user/updatePass/${id}`;
//     } else {
//       document.getElementById("otp_alert").innerHTML = ...

// I need to be careful with matching the template literal backticks in my search string vs file content.
// The file has: window.location.href = `/user/updatePass/${id}`;
// My previous script generated it.

const regexRedirect =
  /if \(id\) \{\s*window\.location\.href = `\/user\/updatePass\/\$\{id\}`;\s*\}/m;
if (regexRedirect.test(content)) {
  content = content.replace(regexRedirect, redirectWithFeedback);
  console.log("Updated submitOtp to show success feedback.");
} else {
  // Fallback if not found (maybe spacing differs)
  console.log("Redirect block not found for feedback update.");
}

fs.writeFileSync(path, content);
