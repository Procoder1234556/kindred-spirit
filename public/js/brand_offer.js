// Brand data embedded directly to avoid errors
const sampleData = [
  {
    name: "Brand A",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
  {
    name: "Brand B",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
  {
    name: "Brand C",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
  {
    name: "Brand D",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
  {
    name: "Brand E",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
  {
    name: "Brand F",
    image: "https://banner2.cleanpng.com/20180330/zsq/avigvl844.webp",
  },
];

let brandData = sampleData;

// Load dynamic brands
async function loadBrandData() {
  try {
    const res = await fetch("/brand/getBrands");
    const data = await res.json();
    console.log("Fetched Brand Offer Data: ", data);
    brandData = data.length ? data : sampleData;
  } catch (err) {
    brandData = sampleData;
  }

  loadBrandOffers();
}

// Render brand boxes
function loadBrandOffers() {
  const desktop = document.getElementById("brand-offers");
  const mobile = document.getElementById("brand-offers-mobile");

  const isMobile = window.innerWidth <= 768;
  const container = isMobile ? mobile : desktop;
  if (!container) return;

  container.innerHTML = "";

  brandData.forEach((brand, index) => {
    const div = document.createElement("div");
    div.className =
      (isMobile ? "col-6" : "col-12 col-md-6") + " offer-box-wrapper";

    div.innerHTML = `
      <a href="/brand/models/?brand=${brand.name}" class="offer-box-link">
        <div class="offer-box">
            <img src="${brand.image}" alt="${brand.name}" style="width: 100%; height: 100%; object-fit: contain;" loading="lazy">
        </div>
      </a>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", loadBrandData);
window.addEventListener("resize", loadBrandOffers);
