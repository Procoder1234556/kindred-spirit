# 🛍️ Sahii - E-Commerce Website

Welcome to **Sahii**, a fully functional e-commerce platform built using **Node.js** and **MongoDB** for the backend, and **EJS** for the frontend. This project demonstrates a scalable and modular approach to building an end-to-end online shopping experience.

## 🚀 Features

- **Authentication & accounts**: User registration/login, JWT‑based auth, address management, wishlist
- **Product catalog**: Listing, categorization (spare parts, accessories, tools), brand/model filters, rich product detail page
- **Search**: Typo‑tolerant fuzzy search (Fuse.js) over title/category/color/style + price queries (e.g. `price: < 1000`)
- **Cart & checkout**:
  - Add to cart / remove / quantity update without full‑page reload
  - Coupon support with min/max order value rules and delivery charge handling
  - COD and prepaid flows with clear UX and validation at checkout
  - Order confirmation page and **order confirmation email** to the customer
- **Wishlist**: Add/remove from wishlist with instant UI feedback and dedicated wishlist page
- **Admin panel**:
  - Product CRUD and image management
  - Coupon management (percentage + optional min/max order value)
  - Product tracking and order tools
  - Quick link to Google Analytics dashboard
- **Performance & UX**:
  - Asset compression and static caching
  - Toast messages for key actions (add to cart, wishlist)

## 🧠 Tech Stack

- **Runtime**: Node.js
- **Backend**: Express.js, EJS templates
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + cookie‑based refresh tokens
- **Search**: MongoDB queries + Fuse.js fuzzy search
- **Email**: Nodemailer (order confirmations, OTP flows)
- **Styling**: Bootstrap 5, custom CSS (`main.css`, `responsive.css`)
- **Build tools**: Tailwind/PostCSS pipeline for `styles/style.css`

---

## 📂 Project Structure

```bash
.
├── config/
├── controllers/
├── middlewares/
├── models/
├── public/
├── routes/
├── utils/
├── Views/
├── index.js         # Starting point of the application
└── .env             # Environment variables (Not included for security)

```

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Sahii-1/Sahi.git
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. At minimum you’ll need:

```env
CONN_STR=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=3000
MAIL_ID=<gmail-address-for-sending-mail>
MP=<gmail-app-password>
RAZORPAY_ID_KEY=<razorpay-key>
RAZORPAY_SECRET_KEY=<razorpay-secret>
```

Never commit real secrets to git; use local `.env` and CI/host‑level secrets.

### 4. (Optional) Download sample assets

You can download a zip containing sample images and assets from:

`https://drive.google.com/file/d/1qBo8CC05itovar-dVXjWKgsSI_XtgqlQ/view?usp=sharing`

Extract it and place the `images` and `assets` folders inside your `public` folder to get most of the product and banner images locally.

### 5. Run the server (development)
```bash
node index.js
```

The server should now be running on `http://localhost:3000` (or the port specified in your `.env`).

For production, use a process manager such as **pm2** and the included GitHub Actions workflow (`.github/workflows/deploy.yml`) as a reference.