const submitOtp = async () => {
  const userOtp = Number(document.getElementById("entered_otp").value);
  const email = document.getElementById("email").value.trim();
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
    const data = await response.json();
    const id = data._id;
    if (id) {
      document.getElementById("otp_alert").innerHTML = `<div class="alert alert-success" role="alert">User verified! Redirecting to password reset...</div>`;
      setTimeout(() => {
        window.location.href = `/user/updatePass/${id}`;
      }, 1000);
    } else {
      document.getElementById(
        "otp_alert"
      ).innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>${
          typeof data === "string" ? data : "User verification failed"
        }</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    }
    // window.location.href = '/myacc';
    return data;
  } else {
    document.getElementById(
      "otp_alert"
    ).innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Wrong OTP</strong> Enter correct otp.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
  }
}