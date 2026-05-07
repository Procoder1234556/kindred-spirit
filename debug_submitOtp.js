const submitOtp = async () => {
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
    const data = await response.json();
    const id = data._id;
    if (id) {
      window.location.href = `/user/updatePass/${id}`;
    } else {
      console.log("Data: ", data);
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