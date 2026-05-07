const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const Order = require("../models/orderModel");
const User = require("../models/userModel");

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


// const renderProductPage = async(req,res)=>{

//     try {
        
//         res.render('product');

//     } catch (error) {
//         //console.log(error.message);
//     }

// }

const createOrder = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const user = await User.findOne({ refreshToken });
        const orderDoc = await Order.findOne({ orderby: user._id });

        const paymentMethod = req.body.paymentMethod; // 'COD' or 'ONLINE'
        let amount = Number(req.body.amount);          // advance (COD) or discounted full (ONLINE)

        // ── COD advance validation ──────────────────────────────────────────
        // Formula: max(150, floor(orderTotal * 0.05))
        // Client sends codAdvanceAmount; we recompute server-side and use ours.
        let codAdvanceAmount = null;
        if (paymentMethod === 'COD') {
            const orderTotal = orderDoc.paymentIntent.amount || 0;
            const computedAdvance = Math.max(150, Math.round(orderTotal * 0.05));

            // Clamp to computed value — never trust the client blindly
            codAdvanceAmount = computedAdvance;
            amount = computedAdvance; // override whatever client sent
        }
        // ────────────────────────────────────────────────────────────────────

        let razorpayAmount = amount * 100; // Razorpay expects paise

        const options = {
            amount: razorpayAmount,
            currency: "INR",
            receipt: `order_${user._id}`,
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (err) {
                console.log("Razorpay Error:", err);
                console.log("Req Body:", req.body);
                return res.status(400).send({ success: false, msg: "Razorpay error" });
            }

            // Save payment details onto the order document
            orderDoc.paymentIntent.razorpayOrderId  = order.id;
            orderDoc.paymentIntent.advancePaid       = amount;
            orderDoc.paymentIntent.remainingAmount   =
                paymentMethod === "COD"
                    ? (orderDoc.paymentIntent.amount - amount)
                    : 0;

            // Store the COD advance amount explicitly
            if (paymentMethod === 'COD') {
                orderDoc.paymentIntent.codAdvanceAmount = codAdvanceAmount;
            }

            orderDoc.paymentMethod  = paymentMethod;
            orderDoc.paymentStatus  = paymentMethod === "COD" ? "PARTIAL_PAID" : "PAID";
            orderDoc.orderStatus    = paymentMethod === "COD" ? "Cash on Delivery" : "Processing";

            await orderDoc.save();

            return res.status(200).send({
                success: true,
                msg: "Order Created",
                key_id: RAZORPAY_ID_KEY,
                order_id: order.id,
                amount: amount,
                order: orderDoc,
                product_name: req.body.name,
                description: `Order for ${user.firstname}`,
                name: user.firstname + " " + user.lastname,
                contact: user.mobile,
                email: ""
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, msg: "Server error" });
    }
};


module.exports = {
    // renderProductPage,
    createOrder
}