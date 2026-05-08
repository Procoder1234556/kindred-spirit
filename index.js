const express = require("express");
const compression = require("compression");
const app = express();
const ejs = require("ejs");
app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, 'public')));
const bodyParser = require("body-parser");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { fetchBrands } = require("./middlewares/brandMiddleware");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const couponRouter = require("./routes/couponRoute");
const bulkProductRouter = require("./routes/bulkProductRoute");
const paymentRoute = require("./routes/paymentRoute");
const brandRoute = require("./routes/brandRoute");
const seoRoute = require("./routes/seoRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
dbConnect();
const { getAllProduct } = require("./controller/productCtrl");
const User = require("./models/userModel");
const Cart = require("./models/cartModel");
const Order = require("./models/orderModel");
const Product = require("./models/productModel");
const AllOrder = require("./models/allOrderModel");
const Doubt = require("./models/Doubt");
const Review = require("./models/Review");
const Lead = require("./models/leadModel");
const sendEmail = require("./utils/sendEmail");
const sendWhatsApp = require("./utils/sendWhatsApp");
const { isAdmin, checkUser } = require("./middlewares/authMiddleware");
const Fuse = require("fuse.js");
const { updateOrderStatus } = require("./controller/userCtrl");

// ------*******************---------------

app.use(morgan("dev"));
app.use(compression());
app.use(
  express.static("public", {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    etag: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Fetch brands for all views
app.use(fetchBrands);

// Check user for all views
app.use(checkUser);

// User Activity Tracking Middleware (Page Views)
const UserEvent = require('./models/userEventModel');
app.use(async (req, res, next) => {
  if (req.method === 'GET' && req.headers.accept && req.headers.accept.includes('text/html')) {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/admin') && !req.url.includes('.')) {
      try {
        await UserEvent.create({
          eventType: 'page_view',
          userId: req.user ? req.user._id : null,
          url: req.url
        });
      } catch (err) {
        console.error("Tracking Error:", err);
      }
    }
  }
  next();
});

// app.use("/myacc", authMiddleware, (req,res)=>{
//     res.render('myacc');
// });
// app.use("/", (req,res)=>{
//     res.render('home');

//     const id = req.params;
// });

// app.use("/sproduct/:id", getAllProduct, (req, res) => {
//     res.render('sproduct');
// });

app.use("/user", authRouter);
app.use("/product", productRouter);
app.use("/coupon", couponRouter);
app.use("/blog", blogRouter);
app.use("/checkout", paymentRoute);
app.use("/brand", brandRoute);
app.use("/admin/bulk-products", bulkProductRouter);
app.use("/", seoRoute);   // sitemap.xml + robots.txt
// router.post("/product/login", loginUserCtrl);

// app.use(notFound);
// app.use(errorHandler);

// ------*******************---------------

app.get("/", async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  const product = await Product.find({ featured: true }).lean();
  console.log("New user: ", user, "Token: ", token);
  if (user) {
    res.render("index", {
      user: user,
      Products: product,
      pageTitle: "Sahii \u2013 Buy Mobile Spare Parts Online India",
      pageDesc: "Shop genuine OEM-grade mobile spare parts for Samsung, Apple, Xiaomi, OnePlus and more at Sahii. Screens, batteries, charging ports, back panels \u2013 fast delivery across India.",
      pageKeywords: "mobile spare parts online, phone repair parts, OEM spare parts India, buy spare parts, sahii",
      canonicalUrl: "https://sahii.in/",
    });
  } else {
    res.render("index", {
      user: " ",
      Products: product,
      pageTitle: "Sahii \u2013 Buy Mobile Spare Parts Online India",
      pageDesc: "Shop genuine OEM-grade mobile spare parts for Samsung, Apple, Xiaomi, OnePlus and more at Sahii. Screens, batteries, charging ports, back panels \u2013 fast delivery across India.",
      pageKeywords: "mobile spare parts online, phone repair parts, OEM spare parts India, buy spare parts, sahii",
      canonicalUrl: "https://sahii.in/",
    });
  }
});

// Ask Doubt
app.post("/ask-doubt", async (req, res) => {
  const doubtContent = req.body.doubt;
  console.log("Doubt: ", doubtContent);
  const doubt = new Doubt({ content: doubtContent });
  await doubt.save();
  res.json({ message: "Doubt submitted successfully!" });
});

// Submit Review
app.post("/submit-review", async (req, res) => {
  const review = new Review({
    rating: req.body.rating,
    content: req.body.review,
  });
  await review.save();
  res.json({ message: "Review submitted successfully!" });
});

// Capture Lead
app.post("/api/capture-lead", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    const lead = new Lead({ phone });
    await lead.save();
    res.json({ message: "Lead captured successfully!" });
  } catch (error) {
    console.error("Error capturing lead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/admin", isAdmin, (req, res) => {
  res.render("admin");
});

app.get("/admin/activity", isAdmin, async (req, res) => {
   try {
       const today = new Date();
       today.setHours(0,0,0,0);
       const pageViewsToday = await UserEvent.countDocuments({ eventType: 'page_view', createdAt: { $gte: today } });
       const addToCartsToday = await UserEvent.countDocuments({ eventType: 'add_to_cart', createdAt: { $gte: today } });
       
       const topProducts = await UserEvent.aggregate([
          { $match: { eventType: 'product_view' } },
          { $group: { _id: '$productId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
       ]);
    
       let query = {};
       if (req.query.type) { query.eventType = req.query.type; }
       
       const events = await UserEvent.find(query)
           .sort('-createdAt')
           .limit(100)
           .populate('userId', 'email')
           .populate('productId', 'title');
    
       res.render('activity', { 
           events, 
           pageViewsToday, 
           addToCartsToday, 
           topProducts,
           user: req.user
       });
   } catch(err) {
       console.log('Error in admin activity:', err);
       res.send('Error loading activity dashboard');
   }
});

// app.get("/admin", (req,res)=>{
//     res.render('admin');
// });

app.get("/myacc", async (req, res) => {
  const token = req.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  if (user) {
    console.log("User: ", user);
    res.render("register", { user: user, error_msg: "", success_msg: "" });
  } else {
    res.render("register", { user: " ", error_msg: "", success_msg: "" });
  }
});

app.get("/viewAccount", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    const allOrder = await AllOrder.findOne({ orderby: user?._id });
    if (allOrder) {
      // const products = allOrder.map(order => {
      //     if(order.orders) {
      //         return order.orders.map(obj=> {return obj});
      //     }
      // });
      const products = allOrder.orders;
      console.log("Products:", products);
      res.render("myAccount", { user: user, Products: products });
    } else {
      res.render("myAccount", { user: user, Products: "" });
    }
  } else {
    res.redirect("/myacc");
  }
});

app.get("/cart", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    const product = await Cart.find();
    console.log("Cart Products : ", product);
    res.render("cartPage", user);
  } else {
    res.redirect("/myacc");
  }
});

app.get("/sale", async (req, res) => {
  const token = req.cookies?.refreshToken;
  const saleProduct = await Product.find({ isSale: true });
  console.log("Sale: ", saleProduct);
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    res.render("salePage", {
      Products: saleProduct,
      user: user,
      pageTitle: "Sale \u2013 Discounted Mobile Spare Parts | Sahii",
      pageDesc: "Shop discounted mobile spare parts on Sahii Sale. Find reduced prices on screens, batteries, accessories and more for Samsung, iPhone, Xiaomi, OnePlus and other brands.",
      canonicalUrl: "https://sahii.in/sale",
    });
  } else {
    res.render("salePage", {
      Products: saleProduct,
      user: "",
      pageTitle: "Sale \u2013 Discounted Mobile Spare Parts | Sahii",
      pageDesc: "Shop discounted mobile spare parts on Sahii Sale. Find reduced prices on screens, batteries, accessories and more for Samsung, iPhone, Xiaomi, OnePlus and other brands.",
      canonicalUrl: "https://sahii.in/sale",
    });
  }
});

app.get("/thank", (req, res) => {
  res.render("thankYou", { user: " ", order_id: " " });
});

// search
app.get("/search", async (req, res) => {
  const token = req?.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });
  try {
    const search = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const searchWords = search.split(" ").filter((word) => word.trim() !== "");

    // Build the query
    const query = { $and: [] };
    const priceRegex = /^price:\s*(<|<=|>|>=)\s*(\d+(\.\d*)?)$/i;

    if (searchWords.length === 0) {
      // If empty search, maybe return everything or nothing?
      // Keeping it generic, if empty array, MongoDB $and with empty array matches all.
      // But usually we might want to match something.
      // If no words, let's just make it empty object (match all) or handle specifically.
      // The original logic would perform fetches for empty strings if not filtered, but we filtered.
      // If length is 0, let's assuming match all.
      delete query.$and;
    } else {
      for (const word of searchWords) {
        const regexSearch = escapeRegex(word);

        if (priceRegex.test(word)) {
          const match = priceRegex.exec(word);
          const operator = match[1];
          const priceValue = parseFloat(match[2]);

          if (!isNaN(priceValue)) {
            const priceQuery = {};
            if (operator === "<") priceQuery.$lt = priceValue;
            else if (operator === "<=") priceQuery.$lte = priceValue;
            else if (operator === ">") priceQuery.$gt = priceValue;
            else if (operator === ">=") priceQuery.$gte = priceValue;

            query.$and.push({ sellingPrice: priceQuery });
          }
        } else {
          query.$and.push({
            $or: [
              { title: { $regex: regexSearch, $options: "i" } },
              { category: { $regex: regexSearch, $options: "i" } },
              { color: { $regex: regexSearch, $options: "i" } },
              { style: { $regex: regexSearch, $options: "i" } },
            ],
          });
        }
      }
    }

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    let commonResults = await Product.find(query).skip(skip).limit(limit);

    if (commonResults.length === 0 && search && search.trim().length > 0) {
      // Fallback: fuzzy search on product title/category/color/style when no direct matches.
      const allProducts = await Product.find({})
        .select("title category color style price sellingPrice images thumbnail slug discount quantity")
        .lean();

      const fuse = new Fuse(allProducts, {
        keys: ["title", "category", "color", "style"],
        threshold: 0.4,
      });

      const fuzzyResults = fuse.search(search);
      const paged = fuzzyResults.slice(skip, skip + limit);
      commonResults = paged.map((r) => r.item);
    }

    if (commonResults.length > 0) {
      res.render("products", {
        user: user || "",
        Products: commonResults,
        currentPage: page,
        totalPages: totalPages,
        // Pass other potential view variables if needed defaults
      });
    } else {
      // No results at all; keep behavior simple and go home or show empty
      res.redirect("/");
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Search Suggestions API
app.get("/api/search/suggestions", async (req, res) => {
  try {
    const search = req.query.q;
    if (!search || search.trim().length < 2) {
      return res.json([]);
    }

    // Limit to 8 suggestions for performance and UI clarity
    const limit = 8;
    
    // First try exact title matches (starts with)
    const exactMatches = await Product.find({
      title: { $regex: "^" + escapeRegex(search), $options: "i" }
    })
    .select("title category price sellingPrice images slug")
    .limit(limit)
    .lean();

    let results = exactMatches;

    // If we need more, try contains or fuzzy
    if (results.length < limit) {
        const remaining = limit - results.length;
        const otherMatches = await Product.find({
          $and: [
            { _id: { $nin: results.map(r => r._id) } },
            { 
              $or: [
                { title: { $regex: escapeRegex(search), $options: "i" } },
                { category: { $regex: escapeRegex(search), $options: "i" } }
              ]
            }
          ]
        })
        .select("title category price sellingPrice images slug")
        .limit(remaining)
        .lean();
        
        results = [...results, ...otherMatches];
    }

    res.json(results);
  } catch (error) {
    console.error("Suggestions Error:", error);
    res.status(500).json([]);
  }
});

app.get("/aboutUs", (req, res) => {
  res.render("aboutUs", {
    user: req.user ? req.user : " ",
    pageTitle: "About Us \u2013 Sahii Mobile Spare Parts",
    pageDesc: "Learn about Sahii \u2013 India\u2019s trusted online store for mobile and tablet spare parts. Our mission is to make device repair affordable, easy, and accessible for everyone.",
    canonicalUrl: "https://sahii.in/aboutUs",
  });
});

app.get("/returnPolicy", (req, res) => {
  res.render("policyPage", {
    user: req.user ? req.user : " ",
    pageTitle: "Return & Replacement Policy \u2013 Sahii",
    pageDesc: "Read Sahii\u2019s return and replacement policy for mobile spare parts. We support replacements for damaged or missing-component orders within 48 hours of delivery.",
    canonicalUrl: "https://sahii.in/returnPolicy",
  });
});

app.get("/shipping", (req, res) => {
  res.render("shippingPolicy", {
    user: req.user ? req.user : " ",
    pageTitle: "Shipping Policy \u2013 Sahii Mobile Spare Parts",
    pageDesc: "Sahii ships mobile spare parts across India within 3\u20137 business days. Read our full shipping policy including delivery timelines, packaging standards, and courier partners.",
    canonicalUrl: "https://sahii.in/shipping",
  });
});

app.get("/terms&conditions", (req, res) => {
  res.render("terms_and_conditions", {
    user: req.user ? req.user : "",
    pageTitle: "Terms & Conditions \u2013 Sahii",
    pageDesc: "Review the terms and conditions governing your use of Sahii\u2019s mobile spare parts platform, including purchase terms, liability limitations, and user obligations.",
    canonicalUrl: "https://sahii.in/terms&conditions",
  });
});

app.get("/thankYou/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.refreshToken;

    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.redirect("/");

    // Get the current order (exists here)
    const order = await Order.findOne({ _id: id });

    // Save a permanent record in AllOrder
    const newOrder = await AllOrder.create({
      orderby: user._id,
      orders: order.products,
      totalAmount: order.paymentIntent.amount,
      address: order.address,
      paymentIntent: order.paymentIntent,
      paymentMethod: order.paymentMethod, // NEW
      paymentStatus: order.paymentStatus, // NEW
      isGiftWrap: order.isGiftWrap,
      orderStatus: order.orderStatus,
    });

    console.log("New order created:", newOrder);

    // Update product quantities
    for (const p of order.products) {
      const existingProduct = await Product.findOne({ _id: p._id });
      await Product.findOneAndUpdate(
        { _id: p._id },
        {
          $set: {
            quantity: existingProduct.quantity - p.count,
            sold: Number(existingProduct.sold) + p.count,
          },
        },
        { new: true }
      );
    }

    // Delete cart
    await Cart.deleteOne({ orderby: user._id });

    // Mark abandonment job complete
    try {
      const CartAbandonmentJob = require('./models/cartAbandonmentJobModel');
      await CartAbandonmentJob.updateMany(
        { user: user._id, status: 'pending' },
        { status: 'completed' }
      );
    } catch(err) {
      console.log('Error marking cart abandonment job complete', err);
    }

    // Delete active order
    await Order.deleteOne({ _id: order._id });

    // Send order completion email (non-blocking)
    try {
      const orderTotal = (newOrder.totalAmount / 100).toFixed(2); // assuming amount in paise
      const createdAt = new Date().toLocaleString();

      const itemsHtml = (newOrder.orders || [])
        .map(
          (p) => `
            <tr>
              <td style="padding:8px 12px; border-bottom:1px solid #eee;">${p.title || ""}</td>
              <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:center;">${p.count || 1}</td>
              <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right;">₹ ${
                typeof p.sellingPrice === "number"
                  ? p.sellingPrice.toFixed(1)
                  : typeof p.price === "number"
                  ? p.price.toFixed(1)
                  : p.sellingPrice || p.price || 0
              }</td>
            </tr>`,
        )
        .join("");

      const mailHtml = `
        <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;">
          <div style="text-align:center;padding:24px 16px;border-bottom:1px solid #eee;">
            <img src="https://sahii.in/images/logo/logo.png" alt="Sahii" style="height:40px;margin-bottom:8px;" />
            <h2 style="margin:8px 0 0;font-size:22px;">Thank you for your order!</h2>
          </div>

          <div style="padding:20px 16px;">
            <p style="font-size:14px;margin:0 0 8px;">Hi ${user.firstname || "there"},</p>
            <p style="font-size:14px;margin:0 0 16px;">
              Your order <strong>#${newOrder._id}</strong> has been placed successfully on <strong>${createdAt}</strong>.
            </p>

            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;">
              <h3 style="font-size:16px;margin:0 0 12px;">Order summary</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr>
                    <th style="text-align:left;padding:8px 12px;border-bottom:1px solid #eee;">Item</th>
                    <th style="text-align:center;padding:8px 12px;border-bottom:1px solid #eee;">Qty</th>
                    <th style="text-align:right;padding:8px 12px;border-bottom:1px solid #eee;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="margin-top:12px;text-align:right;font-size:14px;">
                <div><span style="opacity:.8;">Order total:</span> <strong>₹ ${orderTotal}</strong></div>
                <div><span style="opacity:.8;">Payment method:</span> <strong>${newOrder.paymentMethod || "Online"}</strong></div>
              </div>
            </div>

            ${
              newOrder.address
                ? `<div style="margin-bottom:16px;">
                    <h3 style="font-size:16px;margin:0 0 8px;">Shipping address</h3>
                    <p style="font-size:13px;margin:0;white-space:pre-line;">${newOrder.address}</p>
                  </div>`
                : ""
            }

            <p style="font-size:13px;margin:0 0 8px;">
              You’ll receive another email when your order is packed and handed over to our delivery partner.
            </p>
            <p style="font-size:13px;margin:0;">
              If you have any questions, just reply to this email or contact us at
              <a href="mailto:sahiportal25@gmail.com" style="color:#2563eb;text-decoration:none;">sahiportal25@gmail.com</a>.
            </p>
          </div>

          <div style="padding:12px 16px;text-align:center;font-size:11px;color:#6b7280;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Sahii. All rights reserved.
          </div>
        </div>
      `;

      const mailData = {
        to: user.email,
        subject: "Your Sahii order is confirmed",
        text: `Hi ${user.firstname || ""}, your Sahii order ${newOrder._id} has been placed successfully.`,
        htm: mailHtml,
      };

      // fire-and-forget; errors logged but don't break thankYou page
      sendEmail(mailData);
    } catch (mailErr) {
      console.error("Error sending order confirmation email:", mailErr);
    }

    // Send WhatsApp order confirmation via BhashSMS (non-blocking)
    try {
      const customerName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Customer";
      const orderIdStr = String(newOrder._id);
      const orderTotal = String(newOrder.totalAmount);
      const payMethod = newOrder.paymentMethod || "Online";

      if (user.mobile) {
        sendWhatsApp(user.mobile, [
          customerName,
          orderIdStr,
          orderTotal,
          payMethod,
          "Sahii",
        ]);
      }
    } catch (waErr) {
      console.error("Error sending WhatsApp confirmation:", waErr);
    }

    // Render BEFORE deleting — already have order data
    res.render("thankYou", {
      user,
      order_id: order._id,
      order: newOrder, // SEND updated order to EJS
    });
  } catch (err) {
    console.error("Error in thankYou route:", err);
    res.redirect("/");
  }
});

// Error Message
app.get("/error", async (req, res) => {
  const token = req?.cookies?.refreshToken;
  const user = await User.findOne({ refreshToken: token });

  if (user) {
    res.render("error", { user: user });
  } else {
    res.render("error", { user: "" });
  }
});

// Verify Certificate
app.get("/verify-certificate/PRAIZ241NT001", (req, res) => {
  res.render("verify-certificate", { user: "" });
});

app.get("/verify-certificate/PRAIZ241NT002", (req, res) => {
  res.render("verify-certificate2", { user: "" });
});

// Start Cart Abandonment Worker
setInterval(async () => {
  try {
    const CartAbandonmentJob = require('./models/cartAbandonmentJobModel');
    const sendWhatsApp = require("./utils/sendWhatsApp");
    
    const now = new Date();
    const pendingJobs = await CartAbandonmentJob.find({ status: 'pending' });
    
    for (let job of pendingJobs) {
      const nextScheduledTime = job.scheduledTimes[job.messagesSent];
      if (nextScheduledTime && nextScheduledTime <= now) {
        // Send WhatsApp Reminder
        await sendWhatsApp(job.phone, [job.name, job.productName, job.cartUrl], { template: 'abandoned_cart_v1' });
        
        job.messagesSent += 1;
        if (job.messagesSent >= job.scheduledTimes.length) {
          job.status = 'completed';
        }
        await job.save();
      }
    }
  } catch (error) {
    console.error("Cart Abandonment Worker Error:", error);
  }
}, 30 * 60 * 1000); // 30 minutes

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server is running at PORT 5000`);
});
