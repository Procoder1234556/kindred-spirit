# Sahii E-commerce & Sahii Repairs — System architecture & Changes Log

This document serves as a comprehensive technical log detailing recent architectural enhancements, integrations, error handling procedures, and feature sets deployed on the Sahii platform.

---

## 1. Advanced Product Filtering & Sorting
Redesigned the core mechanism for how users query the product catalog, severely expanding filter granularities and stabilizing backend throughput.

* **Backend Controllers (`controller/productCtrl.js`)**: 
  * Overhauled the logic in the `getAllProduct` method to handle multi-variate and complex query parameters seamlessly.
  * Added distinct indexing for `type` (distinguishing between generic vs categorized parts) and `authenticity` modifiers (checking boolean values for `isOriginal`).
  * Structured robust algorithmic ranges parsing `minPrice` and `maxPrice`, falling back to native defaults if illegal strings are thrown.
  * Expanded Mongoose sorting algorithms natively over MongoDB: Users can now cleanly sort catalogs via `popularity`, `rating`, `price_asc`, and `price_desc`.
* **Frontend Implementations (`views/products.ejs`)**: 
  * Purged the outdated static/legacy sidebar component.
  * Built and deployed a clean, multi-layered HTML `<form id="filter-form" method="GET">` ensuring proper browser history routing (allows users to copy and paste specific filtered URLs to friends).
  * Implemented dual-range interactive price sliders feeding direct visual feedback back to user inputs.
  * Encapsulated EJS pre-filling conditions dynamically maintaining the UI states (checkboxes and radios stay selected after the window reload).

---

## 2. Real-Time Contextual Parts Search
Drastically improved user conversion metrics during brand/model drilldowns utilizing pure DOM node manipulation, eliminating backend latency.

* **Client-Side Initialization (`filterParts()`)**: Developed entirely using vanilla Javascript injected over the `views/products.ejs` templates without demanding extra UI libraries.
* **Algorithmic Structure**: 
  * Data parsing relies on reading uniquely injected parameters inside the card looping sequence: `data-product-name="<%= product.title.toLowerCase() %>"`.
  * Every keystroke queries all nodes natively, toggling CSS `display: none` flags instantly.
* **Debounce Constraints & Failsafes**: 
  * Implemented a custom mathematical 160ms `setTimeout` debounce function avoiding DOM thrashing or memory leaks on low-end devices.
  * Automatically calculates total visible permutations—delivering a "No parts found" sentinel card whenever user queries return flat combinations.

---

## 3. Global User Retention Components (WhatsApp + Toasts)
Injected active behavioral psychology elements and dedicated customer service gateways universally natively inside partials.

* **UI/UX Injection Targets (`views/footer.ejs`)**: Used the universal footer ensuring the code natively compiles on all route instances naturally before the closing `<body/>` tag.
* **WhatsApp Interactive Gateway**:
  * Added a fixed positioning layer (Bottom-Right, overlapping all generic HTML instances safely via Z-Index constraints).
  * Highly responsive layout triggers 64px radius on desktop breakpoints and 56px uniformly over mobile hardware. 
  * Contains a hardcoded CSS infinite-pulse animation driving attention effectively without interrupting UI flow.
  * **Routing Triggers**: Directs traffic through `https://wa.me/91XXXXXXXXXX?text=[url-encoded-welcome-greeting]`.
  * **Regex Path Exclusions**: Integrated JS logic (`window.location.pathname.includes()`) explicitly disabling component rendering if a user is navigating through `/cart`, `/checkout`, or `/thankyou` routes, preventing cart abandonment distractions.
* **Live Social Proof Notifications**: 
  * A scalable asynchronous Class constructor generating simulated "social proof" alerts rendering randomly on the Bottom-Left.
  * The algorithmic array fetches strings off combinations (Examples: "🛒 Rahul from Delhi just ordered...", "👀 23 people are viewing..."). 
  * Implemented cyclic timers matching 8000ms - 12000ms intervals handling the mounting and unmounting completely autonomously natively (CSS transformations handling fading behaviors).

---

## 4. Product Variant Consolidation Architecture
Restructured deep database redundancy resulting from individual SKU documentation simply varying via a hex color code. 

* **MongoDB Aggregation Driver (`scripts/consolidate-variants.js`)**: 
  * Developed a safe-mode local executable connecting via Mongoose modeling directly onto native DB schemas.
  * Algorithmic grouping sorts identical items by iterating across normalized object values belonging to `title` paired alongside `model`. 
  * Executes a deterministic cleanup sequence by identifying a "primary" index ID, mapping all duplicate variant arrays into `[{ color, colorHex, actualPrice, stockQuantity }]`, and dropping the duplicates efficiently via `Product.deleteMany()`.
  * **Safety Protocols**: The script runs entirely dry by default logging detailed execution reports without committing changes. Append `--commit` explicitly executing operations to eliminate database overwrites natively.
* **Frontend UI Implementation (`views/sproduct.ejs`)**: 
  * Rendered custom hex circular 30px interactive buttons iterating off the newly instantiated nested arrays natively beneath the review stars.
  * Triggering physical interaction dynamically binds specific target properties modifying `#dp-selling-price` integer nodes, replacing raw text instantaneously preventing full network roundtrip refreshes just to show a pricing distinction.
  * Live stock pills rendering real-time `In Stock / Out of Stock` UI colors mapped directly off the selected variants properties dynamically.

---

## 5. Bulk Product Management System 
Deployed a dedicated master interface preventing redundant manual catalog uploads via a new scalable admin interface.

* **CSV Ingestion Pipeline (`routes/bulkProductRoute.js` & `views/bulkProductAdmin.ejs`)**: 
  * Leveraged `multer` instances resolving `multipart/form-data` natively over memory buffers resulting in extreme I/O speed.
  * Embedded Node.js synchronicity packages utilizing `csv-parse` iterating across rows efficiently parsing dynamic headers (brand, model, quality, markupPricing).
  * Maps parsed results executing dynamic MongoDB querying logic matching exact product iterations: checking `{ title, model }`. Performs `findByIdAndUpdate` upon exact match mapping eliminating duplications globally whilst logging operation failure states dynamically logging via HTTP 200 arrays. 
* **Dynamic Bulk Editing Computations**: 
  * Allowed raw administrative `POST` signals pushing native MongoDB `updateMany` permutations utilizing powerful internal mathematical algorithms overriding specific indexes easily.
  * Example capability includes multiplying internal string values replacing them securely globally over exact categorization layers (Ex: `increase_price_percent` aggregates multiplying the exact raw `sellingPrice` variables over entire schemas in one single HTTP execution).
* **Security Sub-Layer Integration**: Entire framework mounted into `index.js` routing via `app.use("/admin/bulk-products")` totally isolated behind JWT `isAdmin` middlewares checking server cookies preventing basic users accessing structural core endpoints.

---

## 6. Sahiirepairs.in SEO Integration Hub
Pivoted and decoupled an external standalone Consumer Repair subdomain template set generating optimized XML/HTML properties driving organic SEO traction natively. 

* **Structural Router (`routes/repairsRoute.js`)**: 
  * Handled standard SEO logic deploying a natively generated `/robots.txt` endpoint alongside a live-streaming dynamic `sitemap.xml` structure generating priority rules automatically parsing database arrays cleanly defining deep links explicitly designed pointing across the new `repairs` structure.
* **Microdata Schema Instantiation (`views/repairs/*`)**: 
  * Incorporated distinct metadata tagging natively parsing JSON-LD parameters cleanly formatting schemas directly accepted properly mapped across Google indexing rules.
  * `home.ejs`: Explicitly identifies operations declaring `LocalBusiness`.
  * `guide.ejs`: Configured `Article` markup parsing automated URL locations alongside hardcoded Organization mappings securing proper snippet renderings perfectly mapped upon SERPs natively pointing across dynamic instructions.
* **Decoupled SEO Layout Rendering (`views/repairs/layout.ejs`)**: 
  * A scalable master template header deploying canonical HTML declarations directly verifying `sahiirepairs.in` explicitly preventing duplicated index flagging across Google algorithms. 
  * Render variables capture raw dynamic arguments directly off the controller injecting proper Twitter summary cards and rich structural Facebook Open Graph implementations conditionally across the templates dynamically handling titles universally.
