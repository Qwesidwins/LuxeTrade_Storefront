// 🔑 Supabase credentials
const supabaseUrl = "https://aqcsxwcwnancbfslqlxg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY3N4d2N3bmFuY2Jmc2xxbHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjEzODYsImV4cCI6MjA2NDc5NzM4Nn0.Pe4ms8NCjxNokJMHjfp_XJa-cwVeg7jNJUOjK_KIAqo"; // keep your full key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Ensure DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const searchInput = document.getElementById("searchInput");
  const preorderModal = document.getElementById("preorderModal");
  const preorderForm = document.getElementById("preorder-form");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // --- Dark Mode ---
  function setDarkMode(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
    darkModeToggle.checked = isDark;
    localStorage.setItem("darkMode", isDark ? "true" : "false");
  }

  const saved = localStorage.getItem("darkMode");
  setDarkMode(saved === "true");
  darkModeToggle?.addEventListener("change", () => setDarkMode(darkModeToggle.checked));

  // --- Load Products ---
  let productsCache = [];
  async function loadProducts() {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });

    if (error) {
      productList.innerHTML = `<p class="text-red-600">Error loading products.</p>`;
      return;
    }

    productsCache = data;
    renderProducts(productsCache);
  }

  function renderProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
      productList.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full text-center">No products found.</p>`;
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition flex flex-col";
      card.innerHTML = `
        <img src="${product.image_url}" alt="${product.title}" class="w-full h-48 object-cover rounded-t-2xl" />
        <div class="p-4 flex flex-col flex-grow">
          <h2 class="text-lg font-serif font-bold text-primary-light dark:text-primary-dark">${product.title}</h2>
          <p class="text-sm text-gray-700 dark:text-gray-300 flex-grow">${product.description}</p>
          <p class="mt-2 text-xl font-semibold text-green-600 dark:text-green-400">₵${product.price}</p>
        </div>`;
      productList.appendChild(card);
    });
  }

  // --- Search ---
  searchInput?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = productsCache.filter(p =>
      p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
    renderProducts(filtered);
  });

  // --- Preorder Modal Logic ---
  window.togglePreorderForm = function () {
    preorderModal?.classList.toggle("hidden");
  };

  preorderModal?.addEventListener("click", (e) => {
    if (e.target === preorderModal) togglePreorderForm();
  });

  // --- Handle Preorder Submission ---
  preorderForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = preorderForm.name.value.trim();
    const tel = preorderForm.tel.value.trim(); // ✅ Changed from email to tel
    const message = preorderForm.message.value.trim();

    if (!name || !tel) {
      alert("Please provide your name and WhatsApp number.");
      return;
    }

    const { error } = await supabase.from("preorders").insert([{ name, tel, message }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Successful',
        text: 'Thank you for your preorder! We’ll contact you soon.',
        confirmButtonColor: '#2563eb',
      });
      
      preorderForm.reset();
      togglePreorderForm();
    }
  });

  // Initial Load
  loadProducts();
});
