const url = "https://fakestoreapi.com/products";
const perPage = 6;


let products = [];
let shown = [];
let cart = [];
let page = 1;

const grid = document.getElementById("product-grid");
const msg = document.getElementById("status-message");
const categorySelect = document.getElementById("category-select");

// 1. Fetch Data
async function getData() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    products = data;
    shown = products;
    msg.hidden = true;
    buildCategories();
    
    showPages();
    showProducts();

  } catch (error) {
    msg.textContent = "Something went wrong, try again";
    msg.hidden = false;
    console.error(error.message);
  }
}

// Categories Function
function buildCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    categorySelect.appendChild(option);
  });
}

// 2. Filters
const search = document.getElementById("search-input");
const minPrice = document.getElementById("min-price");
const maxPrice = document.getElementById("max-price");
const sort = document.getElementById("sort-select");
const applyBtn = document.getElementById("apply-filters");

applyBtn.addEventListener("click", () => { page = 1; filterProducts(); });
search.addEventListener("input", () => { page = 1; filterProducts(); });
sort.addEventListener("change", () => { page = 1; filterProducts(); });
categorySelect.addEventListener("change", () => { page = 1; filterProducts(); });

function filterProducts() {
  const text = search.value.toLowerCase();
  const min = minPrice.value ? Number(minPrice.value) : 0;
  const max = maxPrice.value ? Number(maxPrice.value) : Infinity;

  shown = products.filter(p => {
    return (
      p.title.toLowerCase().includes(text) &&
      (categorySelect.value === "all" || p.category === categorySelect.value) &&
      (p.price >= min && p.price <= max)
    );
  });

  if (sort.value === "Ascending") {
    shown.sort((a, b) => a.price - b.price);
  } else if (sort.value === "Descending") {
    shown.sort((a, b) => b.price - a.price);
  }

  page = 1;
  showPages();
  showProducts();
}

// 3. Product Grid 
function showProducts() {
  grid.innerHTML = "";
  if (shown.length === 0) {
    msg.textContent = "No products found";
    msg.hidden = false;
    return;
  }
  
  msg.hidden = true;
  const start = (page - 1) * perPage;
  const items = shown.slice(start, start + perPage);

  items.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-wrap"><img src="${p.image}" alt="${p.title}" /></div>
      <h3 class="product-title">${p.title}</h3>
      <p class="product-price">$${p.price}</p>
      <div class="card-actions">
        <button class="btn btn-blue add-to-cart" data-id="${p.id}">Add To Cart</button>
        <button class="btn btn-blue view-details" data-id="${p.id}">Details</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 4. Pages
const prev = document.getElementById("prev-page");
const next = document.getElementById("next-page");
const pageNums = document.getElementById("page-numbers");
const pageInfo = document.getElementById("page-info");

function showPages() {
  const total = Math.ceil(shown.length / perPage) || 1;

  pageNums.innerHTML = "";
  for (let i = 1; i <= total; i++) {
    const b = document.createElement("button");
    b.className = `page-btn ${i === page ? "active" : ""}`;
    b.textContent = i;
    b.onclick = () => goTo(i);
    pageNums.appendChild(b);
  }

  prev.disabled = page === 1;
  next.disabled = page === total;
  pageInfo.textContent = `Page ${page} of ${total}`;
}

function goTo(targetPage) {
  page = targetPage;
  showProducts();
  showPages();
}

prev.addEventListener("click", () => {
  if (page > 1) goTo(page - 1);
});

next.addEventListener("click", () => {
  const total = Math.ceil(shown.length / perPage) || 1;
  if (page < total) goTo(page + 1);
});

// 5. Cart 
const cartList = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const totalQty = document.getElementById("total-quantity");
const totalPrice = document.getElementById("total-price");

cartList.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove")) {
    removeFromCart(e.target.dataset.id);
  }
});

function showCart() {
  cartList.innerHTML = "";
  let qty = 0;
  let total = 0;

  cart.forEach(item => {
    qty += item.qty;
    total += item.price * item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span class="cart-item-name">${item.title} - $${item.price}</span>
      <span class="cart-item-qty">${item.qty}</span>
      <button class="btn btn-remove" data-id="${item.id}">Remove</button>
    `;
    cartList.appendChild(li);
  });

  cartEmpty.hidden = cart.length > 0;
  totalQty.textContent = qty;
  totalPrice.textContent = total.toFixed(2);
}

grid.addEventListener("click", e => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("add-to-cart")) {
    addToCart(id);
  }
  if (e.target.classList.contains("view-details")) {
    const p = products.find(x => x.id == id);
    if (p) alert(p.description);
  }
});

function addToCart(id) {
  const p = products.find(x => x.id == id);
  const inCart = cart.find(x => x.id == id);

  if (inCart) {
    inCart.qty++;
  } else {
    cart.push({ id: p.id, title: p.title, price: p.price, qty: 1 });
  }
  showCart();
}

function removeFromCart(id) {
  const item = cart.find(x => x.id == id);
  if (item) {
    item.qty--;
    if (item.qty === 0) {
      cart = cart.filter(x => x.id != id);
    }
  }
  showCart();
}


getData();