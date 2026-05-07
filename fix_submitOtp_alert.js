const fs = require("fs");
const path = "public/js/product.js";
let content = fs.readFileSync(path, "utf8");

// The block to fix:
//     if (id) {
//       window.location.href = `/user/updatePass/${id}`;
//     } else {
//       console.log("Data: ", data);
//     }

// The fix:
//     if (id) {
//       window.location.href = `/user/updatePass/${id}`;
//     } else {
//       document.getElementById("otp_alert").innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
//         <strong>${data}</strong>
//         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//       </div>`;
//     }

const target = `    if (id) {
      window.location.href = \`/user/updatePass/\${id}\`;
    } else {
      console.log("Data: ", data);
    }`;

const replacement = `    if (id) {
      window.location.href = \`/user/updatePass/\${id}\`;
    } else {
      document.getElementById("otp_alert").innerHTML = \`<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>\${typeof data === 'string' ? data : 'User verification failed'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>\`;
    }`;

// Try exact replace first
if (content.includes(target)) {
  content = content.replace(target, replacement);
  console.log("Updated submitOtp error handling.");
  fs.writeFileSync(path, content);
} else {
  // Try regex
  console.log("Exact match failed, trying regex.");
  const regex =
    /if \(id\) \{[\s\S]*?\} else \{[\s\S]*?console\.log\("Data: ", data\);[\s\S]*?\}/m;
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    console.log("Updated submitOtp error handling (regex).");
    fs.writeFileSync(path, content);
  } else {
    console.log("Could not find block to update.");
  }
}
