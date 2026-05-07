const axios = require("axios");

/**
 * Send a WhatsApp message via BhashSMS API.
 *
 * @param {string}   phone    - Recipient mobile number (10-digit Indian number)
 * @param {string[]} params   - Ordered template parameter values
 * @param {object}   [opts]   - Optional overrides
 * @param {string}   [opts.template] - Template name (defaults to BHASH_SMS_WA_TEMPLATE)
 * @param {string}   [opts.stype]    - Send type: "normal" (default) or "auth" for OTP
 */
const sendWhatsApp = async (phone, params = [], opts = {}) => {
  const {
    BHASH_SMS_URL,
    BHASH_SMS_USER,
    BHASH_SMS_PASS,
    BHASH_SMS_SENDER,
    BHASH_SMS_WA_TEMPLATE,
  } = process.env;

  if (!BHASH_SMS_URL || !BHASH_SMS_USER || !BHASH_SMS_PASS) {
    console.warn("BhashSMS env variables missing — skipping WhatsApp message");
    return null;
  }

  const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    console.warn("Invalid phone for WhatsApp:", phone);
    return null;
  }

  const templateName =
    opts.template || BHASH_SMS_WA_TEMPLATE || "order_success_v1";
  const stype = opts.stype || "normal";

  try {
    const { data } = await axios.get(BHASH_SMS_URL, {
      params: {
        user: BHASH_SMS_USER,
        pass: BHASH_SMS_PASS,
        sender: BHASH_SMS_SENDER || "BUZWAP",
        phone: cleanPhone,
        text: templateName,
        priority: "wa",
        stype,
        Params: params.join(","),
      },
    });

    console.log("BhashSMS WhatsApp response:", data);
    return data;
  } catch (err) {
    console.error("BhashSMS WhatsApp error:", err.message);
    return null;
  }
};

module.exports = sendWhatsApp;
