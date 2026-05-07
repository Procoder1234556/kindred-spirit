// Parse the URL to check for success or error query parameter
const urlParams = new URLSearchParams(window.location.search);
const success = urlParams.get("success");
const error = urlParams.get("error");
const message = urlParams.get("message");
// Display appropriate alert based on the query parameter and message

if (success) {
  document.getElementById("content").innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </symbol>
  </svg>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>
      ${message}
    <button onclick="redirectToAdmin()" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
} else if (error) {
  document.getElementById("content").innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </symbol>
  </svg>
  <div class="alert alert-danger d-flex align-items-center alert-dismissible fade show" role="alert">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
      ${message}
    <button onclick="redirectToAdmin()" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
function openRoute(route) {
  if (route === "addProduct") {
    document.getElementById("content").innerHTML = `
    <h2>Add Product</h2>
    
    <form id="addProductForm" action="/product/" method="post" enctype="multipart/form-data">
      
      <label>Title:</label>
      <input type="text" name="title">

      <label>Description:</label>
      <textarea name="description" rows="4" cols="50"></textarea>

      <label>Selling Price:</label>
      <input type="number" name="sellingPrice">

      <label>Markup Price:</label>
      <input type="number" name="price">

      <label>Discount:</label>
      <input type="number" name="discount">

      <label>Quantity:</label>
      <input type="number" name="quantity">

      <label>Weight:</label>
      <input type="text" name="weight">

      <label>Dimension:</label>
      <input type="text" name="dimension">

      <div style="display: flex; justify-content: left; align-items: center; gap: 10px;">
      <label style="margin-bottom: 0;">Popular Product:</label>
      <input type="checkbox" name="featured" value="true">
      </div>

      <div style="display: flex; justify-content: left; align-items: center; gap: 10px; margin-top: 10px; margin-bottom: 10px;">
      <label style="margin-bottom: 0;">Mark as Original Part:</label>
      <input type="checkbox" name="isOriginal" value="true">
      </div>

      <label>Category:</label>
      <select id="category" name="category">
        <option value="1">Spare Parts</option>
        <option value="2">Accessories</option>
        <option value="3">Tools</option>
      </select>

      <!-- ✅ Brand dropdown -->
      <label>Brand:</label>
      <select id="brandSelect" name="brand">
        <option value="">Select Brand</option>
      </select>

      <!-- ✅ Model dropdown (depends on Brand) -->
      <label>Model:</label>
      <select id="modelSelect" name="model">
        <option value="">Select Model</option>
      </select>

      <label>subCategory:</label>
      <input type="text" name="subCategory">

      <label>Color: (Input HEX)</label>
      <input type="text" name="color">

      <!-- ✅ Thumbnail Upload -->
      <label>Thumbnail (single image):</label>
      <input type="file" name="thumbnail" accept="image/*">

      <!-- ✅ Multiple Images Upload -->
      <label>Product Images (multiple):</label>
      <input type="file" name="images" accept="image/*" multiple>

      <button type="submit">Add Product</button>
    </form>
  `;

    setTimeout(loadBrands, 50); // 🎯 Auto-load brands from backend
    setupBrandListener(); // 🎯 Load models on brand selection
  } else if (route === "addBrand") {
    document.getElementById("content").innerHTML = `
      <h2>Add Brand</h2>
      <form id="addBrandForm" action="/brand/add" method="post" enctype="multipart/form-data">
        <label for="name">Brand Name:</label>
        <input type="text" id="name" name="name">

        <label for="brandImage">Brand Image:</label>
        <input type="file" id="brandImage" name="brandImage" accept="image/*">

        <button type="submit">Add Brand</button>
      </form>`;
  } else if (route === "addModels") {
    document.getElementById("content").innerHTML = `
    <h2>Add Model</h2>
    <form id="addModelForm" action="/brand/addModel" method="post" enctype="multipart/form-data">
      <label>Brand:</label>
      <select id="brandSelect" name="brand">
        <option value="">Select Brand</option>
      </select>

      <label>Model Name:</label>
      <input type="text" id="model" name="model" required>
      
      <label for="modelImage">Model Image:</label>
      <input type="file" id="modelImage" name="modelImage" accept="image/*">

      <button type="submit">Add Model</button>
    </form>
  `;

    setTimeout(loadBrands, 50);
  } else if (route === "updateImages") {
    // Update the Images
    document.getElementById("content").innerHTML = `
      <h2>Update Images</h2>
      <form id="getProductSlug">
        <label for="productSlug">Product slug:</label>
        <input type="text" id="productSlug" name="productSlug" value="" required>
        <button type="button" onclick="updateImages(document.getElementById('productSlug').value)">Update</button>
      </form>`;
  } else if (route === "updateProduct") {
    // Update the product
    document.getElementById("content").innerHTML = `
      <h2>Update Product</h2>
      <form id="updateProductForm">
        
        <label>Product Slug (to identify product):</label>
        <input type="text" id="slug" name="slug" placeholder="Enter product slug to update">

        <label>Title:</label>
        <input type="text" id="title" name="title">

        <label>Description:</label>
        <textarea id="description" name="description" rows="4" cols="50"></textarea>

        <label>Selling Price:</label>
        <input type="number" id="sellingPrice" name="sellingPrice">

        <label>Dummy Price:</label>
        <input type="number" id="price" name="price">

        <label>Discount:</label>
        <input type="number" id="discount" name="discount">

        <label>Quantity:</label>
        <input type="number" id="quantity" name="quantity">

        <label>Dimension:</label>
        <input type="text" id="dimension" name="dimension">

        <label>Weight:</label>
        <input type="text" id="weight" name="weight">

        <label>Material:</label>
        <input type="text" id="material" name="material">

        <div style="display: flex; justify-content: left; align-items: center; gap: 10px;">
        <label style="margin-bottom: 0;">Popular Product:</label>
        <input type="checkbox" id="featured" name="featured" value="true">
        </div>

        <div style="display: flex; justify-content: left; align-items: center; gap: 10px; margin-top: 10px; margin-bottom: 10px;">
        <label style="margin-bottom: 0;">Mark as Original Part:</label>
        <input type="checkbox" id="isOriginal" name="isOriginal" value="true">
        </div>

        <label>Category:</label>
        <select id="category" name="category">
          <option value="1">Spare Parts</option>
          <option value="2">Accessories</option>
          <option value="3">Tools</option>
        </select>

        <!-- ✅ Brand dropdown -->
        <label>Brand:</label>
        <select id="brandSelect" name="brand">
          <option value="">Select Brand</option>
        </select>

        <!-- ✅ Model dropdown (depends on Brand) -->
        <label>Model:</label>
        <select id="modelSelect" name="model">
          <option value="">Select Model</option>
        </select>

        <label>Color: (Input HEX)</label>
        <input type="text" id="color" name="color">
        
        <!-- Field for productLabel was missing in form but present in submit, adding for consistency if needed or ignoring if not in request -->
        <!-- <input type="hidden" id="productLabel" name="productLabel"> -->

        <button type="button" onclick="submitUpdateProduct()">Update Product</button>
      </form>`;

    setTimeout(loadBrands, 50); // 🎯 Auto-load brands from backend
    setupBrandListener(); // 🎯 Load models on brand selection
  } else if (route === "getProductById") {
    // Display the get product by ID form
    document.getElementById("content").innerHTML = `
      <h2>Get Product by ID</h2>
      <form id="getProductByIdForm" action="/product/getproductById" method="post">
        <label for="productId">Product ID:</label>
        <input type="text" id="productId" name="productId" required>

        <button type="submit" onclick="getProductById()">Get Product</button>
      </form>`;
  }
  // Set Style
  else if (route === "setStyle") {
    document.getElementById("content").innerHTML = `
      <h2>Set Style</h2>
      <form id="setStyleForm" action="/product/setStyle" method="post">
        <label for="styleType">Style Type: </label>
        <input type="text" id="styleType" name="styleType" required>
        <label for="prodId">Product Id: </label>
        <input type="text" id="prodId" name="prodId" required>
        <button onclick="handleStyleSubmit()">Set</button>
      </form>`;
  } else if (route === "blockUser") {
    // Block User
    document.getElementById("content").innerHTML = `
      <h2>Block User</h2>
      <form id="blockUserForm">
        <label for="userId">User id:</label>
        <input type="text" id="blockUserId" name="UserId" required>
        <button type="button" onclick="submit_block_user()">Block</button>
      </form>`;
  } else if (route === "unblockUser") {
    // unblock User
    document.getElementById("content").innerHTML = `
      <h2>Unblock User</h2>
      <form id="unblockUserForm">
        <label for="userId">User id:</label>
        <input type="text" id="unblockUserId" name="UserId" required>
        <button type="button" onclick="submit_unblock_user()">Unblock</button>
      </form>`;
  } else if (route === "makeAdmin") {
    // Make Admin
    document.getElementById("content").innerHTML = `
      <h2>Make Admin</h2>
      <form id="makeAdminForm">
        <label for="makeAdminUserId">User id:</label>
        <input type="text" id="makeAdminUserId" name="UserId" required>
        <button type="button" onclick="submit_make_admin()">Promote</button>
      </form>`;
  }
  // else if (route === 'createBlog') {
  //   // Create Blog
  //   document.getElementById('content').innerHTML = `
  //   <form action="/save" method="post">
  //   <textarea id="editor" name="content"></textarea>
  //   <button id="submit">Create</button>
  //   </form>
  //   <script>
  //       ClassicEditor
  //           .create( document.querySelector( '#editor' ), {
  //               ckbox: {
  //                   tokenUrl: 'https://108126.cke-cs.com/token/dev/LiKxR2xEW8opQewRr142RHmdFNXCQgamEYmf?limit=10',
  //                   theme: 'lark'
  //               },
  //               toolbar: [
  //                   'ckbox', 'imageUpload', '|', 'heading', '|', 'undo', 'redo', '|', 'bold', 'italic', '|',
  //                   'blockQuote', 'indent', 'link', '|', 'bulletedList', 'numberedList'
  //               ],
  //           } )
  //           .catch( error => {
  //               console.error( error );
  //           } );
  //   </script>`
  // }
  else if (route === "updateBlog") {
    // Update Blog
    document.getElementById("content").innerHTML = `
      <h2>Update Blog</h2>
      <form id="updateBlogForm" action="/blog/update" method="post">
        <label for="title">Title:</label>
        <input type="text" id="updatedBlogTitle" name="title" required>
        <label for="category">Category:</label>
        <input type="text" id="updatedBlogcategory" name="category" required>
        <label for="description">Description:</label>
        <textarea id="editor" name="description"></textarea>
        <button id="saveBtn" type="submit" onclick="submit_update_Blog()">Update</button>
      </form>`;
  } else if (route === "getBlog") {
    // Get Blog
    document.getElementById("content").innerHTML = `
      <h2>Get Blog</h2>
      <form id="getBlogForm">
        <label for="blogId">Blog id:</label>
        <input type="text" id="getBlogId" name="blogId" required>
        <button type="submit" onclick="submit_get_Blog()">Get</button>
      </form>`;
  }
  // Order start
  else if (route === "getOrders") {
    // Get Orders
    submit_get_Orders();
  }

  // Update Order Status
  else if (route === "updateOrderStatus") {
    // unblock User
    document.getElementById("content").innerHTML = `
      <h2>Update Order Status</h2>
      <form id="updateOrderForm">
        <label for="orderId">Order id:</label>
        <input type="text" id="orderId" name="orderId" required>
        <label for="setStatus">Set Status:</label>
        <input type="text" id="setStatus" name="setStatus" required>
        <button type="button" onclick="submit_order_status()">Update</button>
      </form>`;
  }

  // Order end
  else if (route === "createCoupon") {
    document.getElementById("content").innerHTML = `
    <h2>Create Coupon</h2>
    <form id="create_coupon_form" action="/coupon" method="POST">
      <label for="coupon_name">Name:</label>
      <input type="text" id="coupon_name" name="name" required>
      <label for="coupon_expiry">Expires At:</label>
      <input type="date" id="coupon_expiry" name="expiry" required>
      <label for="coupon_discount">Discount:</label>
      <input type="text" id="coupon_discount" name="discount" required>

      <label for="coupon_min_value">Minimum Order Value (optional):</label>
      <input type="number" id="coupon_min_value" name="minValue" min="0" step="1" placeholder="e.g. 500">

      <label for="coupon_max_value">Maximum Order Value (optional):</label>
      <input type="number" id="coupon_max_value" name="maxValue" min="0" step="1" placeholder="e.g. 5000">

      <button type="submit" onclick="submit_create_coupon()">Create</button>
    </form>`;
  } else if (route === "getAllCoupon") {
    fetchCouponData();
  } else if (route === "deleteCoupon") {
    document.getElementById("content").innerHTML = `
    <h2>Delete Coupon</h2>
    <form id="create_coupon_form" action="/coupon/delete" method="post">
      <label for="coupon_name">Coupon name:</label>
      <input type="text" id="coupon_name" name="name" required>
      <button type="submit" onclick="submit_delete_coupon()">Delete</button>
    </form>`;
  } else if (route === "userTracking") {
    // Get All Users
    document.getElementById("content").innerHTML =
      `<h2>All Users</h2><div id="usersTable" class="table-responsive">Loading...</div>`;

    fetch("/user/all-user")
      .then((res) => res.json())
      .then((users) => {
        let rows = users
          .map(
            (u) => `
          <tr>
            <td>${u._id}</td>
            <td>${u.firstname} ${u.lastname}</td>
            <td>${u.email}</td>
            <td>${u.mobile}</td>
            <td>${u.role}</td>
            <td><span class="badge ${
              u.isBlocked ? "bg-danger" : "bg-success"
            }">${u.isBlocked ? "Blocked" : "Active"}</span></td>
          </tr>
        `,
          )
          .join("");

        document.getElementById("usersTable").innerHTML = `
          <table class="table table-striped table-hover">
            <thead class="table-dark">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      })
      .catch((err) => {
        document.getElementById("usersTable").innerHTML =
          `<p class="text-danger">Error loading users.</p>`;
        console.error(err);
      });
  } else if (route === "productTracking") {
    document.getElementById("content").innerHTML =
      `<h2>Product Tracking</h2><div id="productTrackingTable" class="table-responsive">Loading...</div><div id="adminPagination" class="d-flex justify-content-center mt-3"></div>`;

    // Get page from URL query param if present, else default to 1 (passed to changeAdminPage)
    // Actually admin.js runs in browser, let's keep internal state or just pass page 1 initially
    changeAdminPage(1);
  } else if (route === "analytics") {
    const lookerUrl =
      (typeof window !== "undefined" && window.LOOKER_STUDIO_URL) ||
      "https://lookerstudio.google.com/embed/reporting/b4632d43-2884-498d-9561-e86aa75a9a25/page/kIV1C";

    // Open Looker Studio in the current tab so it feels like part of the app.
    window.location.href = lookerUrl;
  } else if (route === "removeProduct") {
    document.getElementById("content").innerHTML = `
        <h2>Delete Product</h2>
        <form id="deleteProductForm">
          <label>Enter Product Slug to Delete:</label>
          <input type="text" id="deleteProdSlug" required placeholder="example: ultra-smart-watch">
          <button type="button" class="btn btn-danger" onclick="submitDeleteProduct()">Delete</button>
        </form>
       `;
  } else if (route === "deleteBrand") {
    document.getElementById("content").innerHTML =
      `<h2>Delete Brand</h2><div id="brandList">Loading...</div>`;

    fetch("/brand/getBrands")
      .then((res) => res.json())
      .then((brands) => {
        let html = `<ul class="list-group">`;
        brands.forEach((b) => {
          html += `
                 <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${b.name} <img src="${b.image}" style="width:30px;height:30px;object-fit:cover;margin-left:10px;"></span>
                    <button class="btn btn-danger btn-sm" onclick="submitDeleteBrand('${b._id}')">Delete</button>
                 </li>`;
        });
        html += `</ul>`;
        document.getElementById("brandList").innerHTML = html;
      });
  } else if (route === "deleteModel") {
    document.getElementById("content").innerHTML = `<h2>Delete Model</h2>
        <label>Select Brand:</label>
        <select id="brandForModelDel" class="form-select mb-3" onchange="loadModelsForDelete(this.value)">
            <option value="">Select Brand</option>
        </select>
        <div id="modelListForDel"></div>
      `;

    // Load brands
    fetch("/brand/getBrands")
      .then((res) => res.json())
      .then((brands) => {
        let sel = document.getElementById("brandForModelDel");
        brands.forEach((b) => {
          sel.innerHTML += `<option value="${b._id}" data-name="${b.name}">${b.name}</option>`; // Use Name for fetching models api?
          // The API getModelsByBrand uses query param ?brand=name
          // So we need brand Name.
        });

        // Store map or just use option text
        sel.addEventListener("change", function () {
          const brandName = this.options[this.selectedIndex].text;
          loadModelsForDelete(this.value, brandName);
        });
      });
  } else {
    // You can handle other routes similarly
    document.getElementById("content").innerHTML =
      `<p>${route} route content will go here.</p>`;
  }
}

// Admin Pagination Function
window.changeAdminPage = function (page) {
  fetch(`/product/admin/all-products?page=${page}`)
    .then((res) => res.json())
    // The response is now { products: [], currentPage: 1, totalPages: 10, totalProducts: 100 }
    .then((data) => {
      const products = data.products;
      const currentPage = data.currentPage;
      const totalPages = data.totalPages;

      let rows = products
        .map(
          (p) => `
                 <tr>
                    <td><img src="${p.thumbnail}" style="width:50px;height:50px;object-fit:cover;"></td>
                    <td>${p.title}</td>
                    <td>${p.slug}</td>
                    <td>${p.price}</td>
                    <td>${p.brand}</td>
                    <td>${p.quantity}</td>
                    <td>${p.sold}</td>
                 </tr>
             `,
        )
        .join("");

      document.getElementById("productTrackingTable").innerHTML = `
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Price</th>
                    <th>Brand</th>
                    <th>Quantity</th>
                    <th>Sold</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
             `;

      // Check if pagination div exists, if not create/select it (should exist from productTracking init)
      let paginationDiv = document.getElementById("adminPagination");
      if (paginationDiv) {
        let paginationHTML = "";

        if (currentPage > 1) {
          paginationHTML += `<button class="btn btn-outline-primary btn-sm mx-1" onclick="changeAdminPage(${
            currentPage - 1
          })">Prev</button>`;
        }

        // Simple pagination logic: show current, prev, next, first, last
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
          paginationHTML += `<button class="btn btn-outline-primary btn-sm mx-1" onclick="changeAdminPage(1)">1</button>`;
          if (startPage > 2)
            paginationHTML += `<span class="align-self-center mx-1">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
          paginationHTML += `<button class="btn ${
            i === currentPage ? "btn-primary" : "btn-outline-primary"
          } btn-sm mx-1" onclick="changeAdminPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
          if (endPage < totalPages - 1)
            paginationHTML += `<span class="align-self-center mx-1">...</span>`;
          paginationHTML += `<button class="btn btn-outline-primary btn-sm mx-1" onclick="changeAdminPage(${totalPages})">${totalPages}</button>`;
        }

        if (currentPage < totalPages) {
          paginationHTML += `<button class="btn btn-outline-primary btn-sm mx-1" onclick="changeAdminPage(${
            currentPage + 1
          })">Next</button>`;
        }

        paginationDiv.innerHTML = paginationHTML;
      }
    })
    .catch((err) => {
      document.getElementById("productTrackingTable").innerHTML =
        `<p class="text-danger">Error loading products.</p>`;
      console.error(err);
    });
};
function submitDeleteProduct() {
  const id = document.getElementById("deleteProdSlug").value;
  if (!confirm(`Are you sure you want to delete product with slug: ${id}?`))
    return;

  fetch(`/product/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert("Product Deleted");
      openRoute("removeProduct"); // Refresh
    })
    .catch((e) => alert("Error deleting product"));
}

function submitDeleteBrand(id) {
  if (!confirm("Are you sure? This will delete the brand.")) return;
  fetch(`/brand/delete/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      openRoute("deleteBrand");
    });
}

function loadModelsForDelete(brandId, brandName) {
  if (!brandName || brandName === "Select Brand") {
    document.getElementById("modelListForDel").innerHTML = "";
    return;
  }

  // We need backend to give models JSON.
  // /brand/models?brand=name renders a page. We need JSON.
  // Let's just fetch all brands again? No, getModelsByBrand renders.
  // I need to update getModelsByBrand to return JSON if requested, OR just use the getAllBrands which returns models array inside brand objects!
  // brandCtrl.js getAllBrands returns `brandData` which is full list.

  fetch("/brand/getBrands")
    .then((res) => res.json())
    .then((brands) => {
      const brand = brands.find((b) => b.name === brandName);
      if (brand && brand.models) {
        let html = `<ul class="list-group mt-2">`;
        brand.models.forEach((m) => {
          html += `
                 <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${m.name}</span>
                    <button class="btn btn-danger btn-sm" onclick="submitDeleteModel('${brandId}', '${m.name}')">Delete</button>
                 </li>`;
        });
        html += `</ul>`;
        document.getElementById("modelListForDel").innerHTML = html;
      } else {
        document.getElementById("modelListForDel").innerHTML =
          "No models found.";
      }
    });
}

function submitDeleteModel(brandId, modelName) {
  if (!confirm(`Delete model ${modelName}?`)) return;

  fetch("/brand/deleteModel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandId, modelName }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.message);
      // Refresh models list - need to trigger change or just reload.
      // We know the brand name is likely selected.
      const sel = document.getElementById("brandForModelDel");
      const brandName = sel.options[sel.selectedIndex].text;
      loadModelsForDelete(brandId, brandName);
    });
}

function submitProduct() {
  // Implement logic to submit the product form
  // For simplicity, this example just displays an alert
  alert("Product added successfully!");
}

// const handleStyleSubmit = async () => {
//   try {
//     const styleType = document.getElementById('styleType').value.toLowerCase();
//     const prodId = document.getElementById('prodId').value;

//     const options = {
//       method: 'POST',
//       headers: {
//         'Content-type': 'application/json'
//       },
//       body: JSON.stringify({
//         "type": styleType,
//         "id": prodId
//       })
//     };

//     const response = await fetch('/product/style', options);
//     if (!response.ok) {
//       throw new Error('Network response was not ok.');
//     }

//     const data = await response.json();
//     //console.log("Style status: ", data);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

function updateImages(slug) {
  document.getElementById("content").innerHTML = `
  
  <h2>Update Images: </h2>
  <form id="updateImagesForm" action="/product/updateImages" method="post">
  <input type="text" name="slug" value="${slug}" readonly style="border: none;" />
  <label for="thumbnail">Thumbnail: </label>
  <input type="text" id="thumbnail" name="thumbnail" />
  <label for="img1">Image: </label>
  <input type="text" id="img1" name="img1" />
  <label for="img2">Image: </label>
  <input type="text" id="img2" name="img2" />
  <label for="img3">Image: </label>
  <input type="text" id="img3" name="img3" />
  <label for="img4">Image: </label>
  <input type="text" id="img4" name="img4" />
  <label for="img5">Image: </label>
  <input type="text" id="img5" name="img5" />
  <button type="submit">Submit</button>
  `;
}

function submitUpdateProduct() {
  const slug = document.getElementById("slug").value || "";
  const title = document.getElementById("title")?.value || null;
  const description = document.getElementById("description")?.value || null;
  const sellingPrice = document.getElementById("sellingPrice")?.value || null;
  const price = document.getElementById("price")?.value || null;
  const discount = document.getElementById("discount")?.value || null;
  const quantity = document.getElementById("quantity")?.value || null;
  const weight = document.getElementById("weight")?.value || null;
  const material = document.getElementById("material")?.value || null;
  const dimension = document.getElementById("dimension")?.value || null;
  const category = document.getElementById("category")?.value || null;
  const color = document.getElementById("color")?.value || null;
  // const productLabel = document.getElementById('productLabel').value;

  const brand = document.getElementById("brandSelect").value || null;
  const model = document.getElementById("modelSelect").value || null;

  const featured = document.getElementById("featured").checked
    ? "true"
    : "false";

  const isOriginal = document.getElementById("isOriginal").checked
    ? "true"
    : "false";

  fetch("/product/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      slug,
      description,
      sellingPrice,
      price,
      discount,
      quantity,
      weight,
      material,
      dimension,
      category,
      color,
      // productLabel,
      featured,
      isOriginal,
      brand,
      model,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product: " + data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

async function submit_block_user() {
  let userId = document.getElementById("blockUserId").value;
  const response = await fetch(`/user/block-user${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log(data.message);
}

async function submit_unblock_user() {
  let userId = document.getElementById("unblockUserId").value;
  const response = await fetch(`/user/unblock-user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  //console.log(data.message);
}

async function submit_make_admin() {
  let userId = document.getElementById("makeAdminUserId").value;
  if (!userId) return alert("Please enter User ID");

  try {
    const response = await fetch(`/user/make-admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      alert("Error: " + (data.message || data.error || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Request failed");
  }
}

async function submit_get_Blog() {
  let blogId = document.getElementById("blogId").value;
  const response = await fetch(`blog/getBlog/${blogId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  //console.log("Blog Data: ", data);
}

async function submit_get_Orders() {
  const response = await fetch(`/user/get-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  // Table
  console.log("Orders Data: ", data);
  document.getElementById("content").innerHTML = `
  <h2>Get Orders</h2>
  <div id="orderTable">
    <table id="orderTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Order ID</th>
          <th>Email</th>
          <th>Contact Number</th>
          <th>Address</th>
          <th>Order</th>
          <th>Total Amount</th>
          <th>Remaining Amount</th>
          <th>Order Status</th>
        </tr>
      </thead>
      <tbody>
        ${
          Array.isArray(data)
            ? data
                .map(
                  (item) => `
            <tr>
              <td>${item?.user?.firstname} ${item?.user?.lastname}</td>
              <td>${item?._id}</td>
              <td>${item?.user?.email}</td>
              <td>${item?.user?.mobile}</td>
              <td>
                      <div id="order_Prod_Table">
                      <table>
                      <thead>
                      <tr>
                      <th>Receiver Name</th>
                      <th>Address Type</th>
                      <th>Address</th>
                      <th>PinCode</th>
                      <th>Contact</th>
                      </tr>
                      </thead>
                      <tbody>
                      
                        <tr>
                        <td>${item?.address?.firstname} ${
                          item?.address?.lastname
                        }</td>
                        <td>${item?.address?.title}</td>
                        <td>${item?.address?.address}</td>
                        <td>${item?.address?.pin_code}</td>
                        <td>${item?.address?.phone_number}</td>
                        </tr>
                        
                      </tbody>
                      </table>
                    </div>

              </td>
              <td>
                <div id="order_Prod_Table">
                <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Color</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    Array.isArray(item.orders)
                      ? item.orders
                          .map(
                            (order) => `
                      <tr>
                        <td>${order.title}</td>
                        <td>${order._id}</td>
                        <td>${order.count}</td>
                        <td>${order.color}</td>
                      </tr>
                    `,
                          )
                          .join("")
                      : ""
                  }
                </tbody>
              </table>
                </div>
              </td>
              <td>${item?.totalAmount}</td>
              <td>${item?.paymentIntent?.remainingAmount}</td>
              <td>${item?.orderStatus}</td>
            </tr>
          `,
                )
                .join("")
            : '<tr><td colspan="8">No data available</td></tr>'
        }
      </tbody>
    </table>
  </div>
`;
}

async function fetchCouponData() {
  try {
    const response = await fetch("/coupon/all_coupons", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch coupons");
    }

    const data = await response.json();
    //console.log('Data: ', data);

    const couponsHTML = data
      .map((coupon) => {
        // Extracting just the date from the expiry timestamp
        const expiryDate = new Date(coupon.expiry).toLocaleDateString();

        return `
        <div class="coupon">
          <div class="coupon-header">
            <h2>${coupon.name}</h2>
            <span class="expiry">Expires: ${expiryDate}</span>
          </div>
          <div class="coupon-content">
            <span class="discount">${coupon.discount}% OFF</span>
            ${
              typeof coupon.minValue === "number"
                ? `<span class="range">Min: ₹${coupon.minValue}</span>`
                : ""
            }
            ${
              typeof coupon.maxValue === "number"
                ? `<span class="range">Max: ₹${coupon.maxValue}</span>`
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");

    document.getElementById("content").innerHTML = couponsHTML;
  } catch (error) {
    console.error("Error fetching coupons:", error);
  }
}

function redirectToAdmin() {
  window.location = "/admin";
}

async function submit_order_status() {
  let orderId = document.getElementById("orderId").value;
  let orderStatus = document.getElementById("setStatus").value;
  const response = await fetch(`/user/order/update-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId: orderId,
      orderStatus: orderStatus,
    }),
  });

  const data = await response.json();
  // console.log("Order Data: ", data);
  window.location.href = "/admin";
}

// Load brands from API
async function loadBrands() {
  const response = await fetch("/brand/getBrands");
  const brands = await response.json();

  const brandSelect = document.getElementById("brandSelect");

  brandSelect.innerHTML = `<option value="">Select Brand</option>`; // reset

  brands.forEach((b) => {
    brandSelect.innerHTML += `
      <option value="${b.name}">${b.name}</option>
    `;
  });
}

// When brand is selected load models
function setupBrandListener() {
  const brandSelect = document.getElementById("brandSelect");
  const modelSelect = document.getElementById("modelSelect");

  brandSelect.addEventListener("change", async () => {
    const brandName = brandSelect.value;

    // Clear model options
    modelSelect.innerHTML = `<option value="">Select Model</option>`;

    if (!brandName) return;

    const response = await fetch(`/brand/getBrands`);
    const brands = await response.json();

    const selectedBrand = brands.find((b) => b.name === brandName);

    if (selectedBrand && selectedBrand.models.length > 0) {
      selectedBrand.models.forEach((m) => {
        modelSelect.innerHTML += `
          <option value="${m.name}">${m.name}</option>
        `;
      });
    }
  });
}
