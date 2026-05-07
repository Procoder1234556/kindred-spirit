const CartReminder = require("../models/cartReminderModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const sendWhatsApp = require("./sendWhatsApp");

const REMINDER_INTERVALS = [
  { type: "2h", hours: 2 },
  { type: "12h", hours: 12 },
  { type: "24h", hours: 24 },
];

const scheduleCartReminders = async (userId, cartId) => {
  if (!userId || !cartId) return;

  const now = Date.now();
  await CartReminder.deleteMany({ userId, status: "pending" });

  const docs = REMINDER_INTERVALS.map((item) => ({
    userId,
    cartId,
    reminderType: item.type,
    sendAt: new Date(now + item.hours * 60 * 60 * 1000),
    status: "pending",
  }));

  await CartReminder.insertMany(docs);
};

const cancelCartReminders = async (userId) => {
  if (!userId) return;
  await CartReminder.updateMany(
    { userId, status: "pending" },
    { $set: { status: "cancelled" } },
  );
};

const processPendingReminders = async () => {
  const now = new Date();
  const reminders = await CartReminder.find({
    status: "pending",
    sendAt: { $lte: now },
  })
    .sort({ sendAt: 1 })
    .limit(20);

  for (const reminder of reminders) {
    try {
      const [cart, user] = await Promise.all([
        Cart.findById(reminder.cartId),
        User.findById(reminder.userId),
      ]);

      if (!cart || !cart.products || cart.products.length === 0 || !user || !user.mobile) {
        reminder.status = "cancelled";
        reminder.lastError = "Cart empty or user unavailable";
        reminder.attempts += 1;
        await reminder.save();
        continue;
      }

      await sendWhatsApp(
        user.mobile,
        [
          user.firstname || "Customer",
          String(cart.products.length),
          String(Number(cart.cartTotal || 0).toFixed(2)),
        ],
        {
          template: process.env.BHASH_SMS_CART_TEMPLATE || "cart_reminder_v1",
          stype: "normal",
        },
      );

      reminder.status = "sent";
      reminder.attempts += 1;
      reminder.lastError = "";
      await reminder.save();
    } catch (error) {
      reminder.status = "failed";
      reminder.attempts += 1;
      reminder.lastError = error.message || "Reminder send failed";
      await reminder.save();
    }
  }
};

const startCartReminderScheduler = () => {
  processPendingReminders().catch((err) =>
    console.error("Cart reminder scheduler startup error:", err.message),
  );

  setInterval(() => {
    processPendingReminders().catch((err) =>
      console.error("Cart reminder scheduler error:", err.message),
    );
  }, 60 * 1000);
};

module.exports = {
  scheduleCartReminders,
  cancelCartReminders,
  startCartReminderScheduler,
};
