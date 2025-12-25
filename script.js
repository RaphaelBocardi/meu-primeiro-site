// ===== VALIDATION FUNCTIONS =====

// Validate CPF (Brazilian tax ID)
function validateCPF(cpf) {
    // Remove all non-digits
    cpf = cpf.replace(/\D/g, '');
    
    // Check if has 11 digits
    if (cpf.length !== 11) {
        return false;
    }
    
    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) {
        return false;
    }
    
    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(10))) {
        return false;
    }
    
    return true;
}

// Validate Credit Card using Luhn Algorithm
function validateCreditCard(cardNumber) {
    // Remove all non-digits
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Check if has between 13 and 19 digits
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    // Luhn Algorithm
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

// Detect card brand
function detectCardBrand(cardNumber) {
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(cardNumber)) {
        return 'Visa';
    }
    // Mastercard
    if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) {
        return 'Mastercard';
    }
    // American Express
    if (/^3[47]/.test(cardNumber)) {
        return 'American Express';
    }
    // Discover
    if (/^6(?:011|5)/.test(cardNumber)) {
        return 'Discover';
    }
    // Diners Club
    if (/^3(?:0[0-5]|[68])/.test(cardNumber)) {
        return 'Diners Club';
    }
    // JCB
    if (/^(?:2131|1800|35)/.test(cardNumber)) {
        return 'JCB';
    }
    // Elo (Brazilian)
    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(cardNumber)) {
        return 'Elo';
    }
    // Hipercard (Brazilian)
    if (/^(606282|3841)/.test(cardNumber)) {
        return 'Hipercard';
    }
    
    return 'Desconhecido';
}

// Validate CVV
function validateCVV(cvv, cardBrand) {
    cvv = cvv.replace(/\D/g, '');
    
    // American Express uses 4 digits, others use 3
    if (cardBrand === 'American Express') {
        return cvv.length === 4;
    }
    
    return cvv.length === 3;
}

// Validate expiry date
function validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 0-indexed
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    // Check if month is valid
    if (expMonth < 1 || expMonth > 12) {
        return false;
    }
    
    // Check if card is expired
    if (expYear < currentYear) {
        return false;
    }
    
    if (expYear === currentYear && expMonth < currentMonth) {
        return false;
    }
    
    return true;
}

// Validate CEP (Brazilian postal code)
async function validateCEP(cep) {
    // Remove all non-digits
    cep = cep.replace(/\D/g, '');
    
    // Check if has 8 digits
    if (cep.length !== 8) {
        return { valid: false, message: 'CEP deve ter 8 dígitos' };
    }
    
    // Check if is not all zeros
    if (cep === '00000000') {
        return { valid: false, message: 'CEP inválido' };
    }
    
    // Validate format using ViaCEP API
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            return { valid: false, message: 'CEP não encontrado na base dos Correios' };
        }
        
        return { 
            valid: true, 
            data: data,
            message: 'CEP válido' 
        };
    } catch (error) {
        return { 
            valid: false, 
            message: 'Erro ao validar CEP. Verifique sua conexão.' 
        };
    }
}

// Shopping Cart
let cart = [];

// Favorites
let favorites = [];

// Pagination
let currentPage = 1;
const itemsPerPage = 12;
let allFilteredProducts = [];

// Debounce timer
let searchDebounceTimer = null;

// Current sort option
let currentSort = 'name-asc'; // Default A-Z

// Current category filter
let currentFilter = 'all';

// Função para obter taxa de juros (Mercado Pago - Recebimento na Hora)
function getInterestRate(installments) {
    // Tabela oficial de taxas do Mercado Pago (Recebimento na Hora)
    const rates = {
        1: 4.98,   // 1x à vista
        2: 9.90,   // 2x
        3: 11.28,  // 3x
        4: 12.64,  // 4x
        5: 13.97,  // 5x
        6: 15.27,  // 6x
        7: 16.55,  // 7x
        8: 17.81,  // 8x
        9: 19.04,  // 9x
        10: 20.24, // 10x
        11: 21.43, // 11x
        12: 22.59  // 12x
    };
    return rates[installments] || 4.98;
}

// Função para calcular valor da parcela com juros
function calculateInstallment(price, installments = 3, maxNoInterest = 3) {
    if (installments <= maxNoInterest) {
        // Sem juros
        return {
            value: price / installments,
            total: price,
            hasInterest: false
        };
    } else {
        // Com juros do Mercado Pago (taxa total sobre o valor)
        const taxRate = getInterestRate(installments) / 100;
        const totalWithInterest = price * (1 + taxRate);
        const installmentValue = totalWithInterest / installments;
        return {
            value: installmentValue,
            total: totalWithInterest,
            hasInterest: true
        };
    }
}

// Função para formatar texto de parcelas
function getInstallmentText(price) {
    const calc = calculateInstallment(price, 3); // Mostrar 3x sem juros por padrão
    return `ou 3x de R$ ${calc.value.toFixed(2)} sem juros`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Show landing page (Home) on load
    showLandingPage();
    
    // Set Home button as active
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === 'home') {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Buscar produtos da API
    if (typeof fetchProductsFromAPI === 'function') {
        const apiProducts = await fetchProductsFromAPI();
        if (apiProducts && apiProducts.length > 0) {
            // Substituir produtos locais por produtos da API
            window.products = apiProducts;
        }
    }
    
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
    loadFavoritesFromStorage();
    setupBottomNav();
    updateCartBadge();
    setupVerificationModals(); // Initialize verification system
});

// Load products into the grid
function loadProducts(filter = 'all', resetPage = true) {
    if (resetPage) {
        currentPage = 1;
    }
    
    // Save current filter
    currentFilter = filter;

    const productsGrid = document.getElementById('productsGrid');
    let filteredProducts = products;

    // Filter by category
    if (filter !== 'all') {
        filteredProducts = products.filter(p => p.category === filter);
    }

    // Apply search filter
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply current sort
    if (currentSort === 'name-asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === 'name-desc') {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (currentSort === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    allFilteredProducts = filteredProducts;

    // Pagination
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const displayProducts = filteredProducts.slice(startIndex, endIndex);

    // Render products
    productsGrid.innerHTML = displayProducts.map(product => {
        const isFavorited = favorites.includes(product.id);
        
        // Render variants if product has them
        let variantsHTML = '';
        if (product.variants && product.variants.length > 0) {
            variantsHTML = `
                <div class="product-variants">
                    ${product.variants.map((variant, index) => `
                        <div class="variant-option ${index === 0 ? 'active' : ''}" 
                             onclick="changeProductVariant(${product.id}, ${index}, event)"
                             style="background-image: url('${variant.image}')"
                             title="${variant.color}">
                            <img src="${variant.image}" alt="${variant.color}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" onclick="openProductDetail(${product.id})">
                <button type="button" class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})" aria-label="Favoritar ${product.name}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" data-product-img="${product.id}">
                <span style="display:none;">${product.icon}</span>
            </div>
            <div class="product-info" onclick="openProductDetail(${product.id})">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-installment">${getInstallmentText(product.price)}</div>
                <button type="button" class="product-btn" onclick="event.stopPropagation(); addToCart(${product.id})" aria-label="Adicionar ${product.name} ao carrinho">
                    <i class="fas fa-shopping-cart"></i> ADICIONAR
                </button>
            </div>
            ${variantsHTML}
        </div>
    `}).join('');

    // Show/hide load more button
    updateLoadMoreButton(filteredProducts.length, endIndex);
}

// Get category display name
function getCategoryName(category) {
    const names = {
        'camisas': 'Camisas',
        'tenis': 'Tênis',
        'chuteiras': 'Chuteiras',
        'jaquetas': 'Jaquetas'
    };
    return names[category] || category;
}

// Update load more button
function updateLoadMoreButton(totalProducts, displayedProducts) {
    let loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (!loadMoreBtn) {
        // Create button if it doesn't exist
        loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.type = 'button';
        loadMoreBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Carregar Mais Produtos';
        loadMoreBtn.onclick = loadMoreProducts;
        document.getElementById('productsGrid').parentElement.appendChild(loadMoreBtn);
    }

    if (displayedProducts < totalProducts) {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.innerHTML = `<i class="fas fa-arrow-down"></i> Carregar Mais (${totalProducts - displayedProducts} produtos)`;
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Load more products
function loadMoreProducts() {
    currentPage++;
    const activeCategory = document.querySelector('nav a.active').getAttribute('data-category');
    loadProducts(activeCategory, false);
    showToast('Mais produtos carregados!', 'info');
}

// Change product variant (color)
function changeProductVariant(productId, variantIndex, event) {
    event.stopPropagation();
    
    const product = products.find(p => p.id === productId);
    if (!product || !product.variants) return;
    
    const variant = product.variants[variantIndex];
    
    // Update image in all places (grid, carousel, favorites)
    const productCards = document.querySelectorAll(`[data-product-id="${productId}"]`);
    productCards.forEach(card => {
        const img = card.querySelector('img[data-product-img]');
        if (img) {
            img.src = variant.image;
        }
        
        // Update active variant
        const variantOptions = card.querySelectorAll('.variant-option');
        variantOptions.forEach((option, index) => {
            if (index === variantIndex) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Filter button - opens sort modal
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            showSortModal();
        });
    }

    // Voice search button
    const voiceSearchBtn = document.querySelector('.voice-search-btn');
    if (voiceSearchBtn) {
        voiceSearchBtn.addEventListener('click', () => {
            showToast('Busca por voz em desenvolvimento', 'info');
        });
    }

    // Search with debouncing
    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            loadProducts('all');
        }, 300);
    });

    // Filters
    document.getElementById('sortSelect').addEventListener('change', () => {
        loadProducts('all');
    });

    // Cart overlay - just close cart without navigation
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Back button - just close cart without navigation
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', closeCart);
    }

    // Empty cart button
    const emptyCartBtn = document.getElementById('emptyCartBtn');
    if (emptyCartBtn) {
        emptyCartBtn.addEventListener('click', emptyCart);
    }

    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    saveCartToStorage();
    
    // Show feedback with toast
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
    if (product) {
        showToast(`${product.name} removido do carrinho`, 'info');
    }
}

// Empty entire cart
function emptyCart() {
    if (cart.length === 0) {
        showToast('Carrinho já está vazio', 'info');
        return;
    }
    
    // Show confirmation modal
    showEmptyCartModal();
}

// Show empty cart confirmation modal
function showEmptyCartModal() {
    const modal = document.getElementById('emptyCartModal');
    modal.classList.add('active');
}

// Close empty cart modal
function closeEmptyCartModal() {
    const modal = document.getElementById('emptyCartModal');
    modal.classList.remove('active');
}

// Confirm empty cart
function confirmEmptyCart() {
    cart = [];
    selectedInstallmentCount = 12; // Reset to 12x when emptying cart
    updateCart();
    saveCartToStorage();
    closeEmptyCartModal();
    showToast('Carrinho esvaziado', 'success');
    
    // Close cart
    closeCart();
    
    // Navigate to home and activate home button
    navigateToSection('home');
}

// Update product quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const installmentValue = document.getElementById('installmentValue');
    const selectedInstallments = document.getElementById('selectedInstallments');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update badge in bottom nav
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        if (totalItems === 0) {
            cartBadge.style.display = 'none';
        } else {
            cartBadge.style.display = 'flex';
        }
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    
    // Update installment display with selected count
    if (installmentValue && selectedInstallments) {
        const perInstallment = total / selectedInstallmentCount;
        installmentValue.textContent = `R$ ${perInstallment.toFixed(2)}`;
        selectedInstallments.textContent = `${selectedInstallmentCount}x`;
    }

    // Update items
    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">Seu carrinho está vazio</p>`;
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span style="display:none;">${item.icon}</span>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Diminuir quantidade">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Aumentar quantidade">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button type="button" class="remove-item-btn" onclick="removeFromCart(${item.id})" aria-label="Remover item">
                            <i class="fas fa-trash"></i> EXCLUIR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }
    
    // Update cart icon (empty/full)
    updateCartBadge();
}

// Update cart badge
function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    const cartIconFull = document.getElementById('cartIconFull');
    const cartIconEmpty = document.getElementById('cartIconEmpty');
    
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        
        if (totalItems === 0) {
            cartBadge.style.display = 'none';
            // Show empty cart icon
            if (cartIconFull) cartIconFull.style.display = 'none';
            if (cartIconEmpty) cartIconEmpty.style.display = 'block';
        } else {
            cartBadge.style.display = 'flex';
            // Show full cart icon
            if (cartIconFull) cartIconFull.style.display = 'block';
            if (cartIconEmpty) cartIconEmpty.style.display = 'none';
        }
    }
}

// Setup bottom navigation
function setupBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            
            // Handle navigation
            switch(page) {
                case 'favoritos':
                    // Remove active from all items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    // Add active to clicked item
                    item.classList.add('active');
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showFavoritesPage();
                    break;
                case 'categorias':
                    // Remove active from all items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    // Add active to clicked item
                    item.classList.add('active');
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    toggleCategories();
                    break;
                case 'home':
                    // Remove active from all items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    // Add active to clicked item
                    item.classList.add('active');
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showLandingPage();
                    break;
                case 'carrinho':
                    // Don't change active state, just open cart
                    toggleCart();
                    break;
                case 'perfil':
                    // Don't change active state, just open profile
                    toggleProfile();
                    break;
            }
        });
    });
    
    setupCategoriesSidebar();
    setupInstallmentSelector();
    setupProfileSidebar();
    setupContactSidebar();
    setupProfilePages();
    setupAuthPages();
}

// Setup categories sidebar
function setupCategoriesSidebar() {
    const categoriesOverlay = document.getElementById('categoriesOverlay');
    const categoriesClose = document.getElementById('categoriesClose');
    const categoryItems = document.querySelectorAll('.category-item');
    
    if (categoriesOverlay) {
        categoriesOverlay.addEventListener('click', toggleCategories);
    }
    if (categoriesClose) {
        categoriesClose.addEventListener('click', toggleCategories);
    }
    
    // Category filter
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Hide landing page and show products section
            const landingPage = document.getElementById('landingPage');
            const productsSection = document.getElementById('produtos');
            const sectionHeader = document.querySelector('.section-header h2');
            const filtersInline = document.querySelector('.filters-inline');
            
            if (landingPage && productsSection) {
                landingPage.style.display = 'none';
                productsSection.style.display = 'block';
            }
            
            // Hide title and filters in all category pages
            if (sectionHeader) {
                sectionHeader.style.display = 'none';
            }
            if (filtersInline) {
                filtersInline.style.display = 'none';
            }
            
            if (category === 'todos') {
                loadProducts('all');
                showToast('Mostrando todos os produtos', 'success');
            } else {
                loadProducts(category);
                showToast(`Categoria: ${item.querySelector('span').textContent}`, 'success');
            }
            
            toggleCategories();
        });
    });
}

// Toggle categories sidebar
function toggleCategories() {
    const categoriesSidebar = document.getElementById('categoriesSidebar');
    const categoriesOverlay = document.getElementById('categoriesOverlay');
    
    categoriesSidebar.classList.toggle('active');
    categoriesOverlay.classList.toggle('active');
}

// Setup installment selector
let selectedInstallmentCount = 12; // Padrão 12x

function setupInstallmentSelector() {
    const installmentSelectorBtn = document.getElementById('installmentSelectorBtn');
    const installmentSelectorModal = document.getElementById('installmentSelectorModal');
    
    if (installmentSelectorBtn) {
        installmentSelectorBtn.addEventListener('click', showInstallmentSelector);
    }
    
    // Close modal when clicking outside
    if (installmentSelectorModal) {
        installmentSelectorModal.addEventListener('click', (e) => {
            if (e.target === installmentSelectorModal) {
                closeInstallmentSelector();
            }
        });
    }
    
    // Empty cart modal buttons
    const cancelEmptyBtn = document.getElementById('cancelEmptyBtn');
    const confirmEmptyBtn = document.getElementById('confirmEmptyBtn');
    const emptyCartModal = document.getElementById('emptyCartModal');
    
    if (cancelEmptyBtn) {
        cancelEmptyBtn.addEventListener('click', closeEmptyCartModal);
    }
    
    if (confirmEmptyBtn) {
        confirmEmptyBtn.addEventListener('click', confirmEmptyCart);
    }
    
    if (emptyCartModal) {
        emptyCartModal.addEventListener('click', (e) => {
            if (e.target === emptyCartModal) {
                closeEmptyCartModal();
            }
        });
    }
}

// Show installment selector
function showInstallmentSelector() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (total === 0) {
        showToast('Adicione produtos ao carrinho primeiro', 'error');
        return;
    }
    
    // Keep the current selected installment (don't reset)
    
    const modal = document.getElementById('installmentSelectorModal');
    const optionsContainer = document.getElementById('installmentOptions');
    
    // Generate installment options
    let optionsHTML = '';
    for (let i = 1; i <= 12; i++) {
        const installmentValue = total / i;
        const isSelected = i === selectedInstallmentCount;
        
        optionsHTML += `
            <div class="installment-option ${isSelected ? 'selected' : ''}" data-installments="${i}">
                <div class="installment-option-left">
                    <div class="installment-option-times">${i}x de</div>
                    <div class="installment-option-value">R$ ${installmentValue.toFixed(2)}</div>
                </div>
                <div class="installment-option-badge">SEM JUROS</div>
            </div>
        `;
    }
    
    optionsContainer.innerHTML = optionsHTML;
    
    // Add click handlers to options
    const options = optionsContainer.querySelectorAll('.installment-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const installments = parseInt(option.getAttribute('data-installments'));
            selectInstallment(installments);
            closeInstallmentSelector();
        });
    });
    
    modal.classList.add('active');
    
    // Scroll to show the currently selected option
    setTimeout(() => {
        const selectedOption = optionsContainer.querySelector('.installment-option.selected');
        if (selectedOption) {
            selectedOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 0);
}

// Select installment
function selectInstallment(count) {
    selectedInstallmentCount = count;
    updateCart();
    showToast(`Parcelamento em ${count}x selecionado`, 'success');
}

// Close installment selector
function closeInstallmentSelector() {
    const modal = document.getElementById('installmentSelectorModal');
    modal.classList.remove('active');
}

// Navigate to a section and update nav
function navigateToSection(section) {
    const navItems = document.querySelectorAll('.nav-item');
    
    // Remove active from all nav items
    navItems.forEach(nav => nav.classList.remove('active'));
    
    // Add active to the target section
    const targetNav = document.querySelector(`.nav-item[data-page="${section}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
    
    // Navigate to the section
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    switch(section) {
        case 'home':
            showLandingPage();
            break;
        case 'favoritos':
            showFavoritesPage();
            break;
        case 'categorias':
            toggleCategories();
            break;
        // Add more cases as needed
    }
}

// Close cart without navigation (for back button)
function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
}

// Toggle cart modal (for cart icon)
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!', 'info');
        return;
    }

    // Salvar carrinho no localStorage antes de redirecionar
    saveCartToStorage();
    
    // Redirecionar para página de checkout
    window.location.href = 'checkout.html';
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('sportshop_cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('sportshop_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create or get toast container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999; display: flex; flex-direction: column; align-items: center; pointer-events: none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    // Inline styles to ensure it appears at the top
    toast.style.cssText = `
        position: relative;
        background: white;
        color: #333;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border-left: 3px solid;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 280px;
        max-width: 90vw;
        margin-bottom: 8px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        pointer-events: auto;
    `;
    
    // Set border color based on type
    const borderColors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#000000',
        warning: '#D4AF37'
    };
    toast.style.borderLeftColor = borderColors[type] || borderColors.info;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Contact form handler (newsletter)
function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#contactEmail').value.trim();
    
    // Validation
    if (!email) {
        showToast('Por favor, insira seu e-mail!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Por favor, insira um e-mail válido!', 'error');
        return;
    }
    
    // Simulate sending (in real app, would send to backend)
    showToast('E-mail cadastrado com sucesso! Você receberá nossas novidades.', 'success');
    form.reset();
}

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Scroll to products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Add animation styles
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .cart-count-pulse {
            animation: pulse 0.3s ease;
        }
        
        .toast {
            position: fixed;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: var(--secondary-color);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border-left: 3px solid;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 280px;
            max-width: 90%;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            top: 20px;
        }
        
        .toast-success {
            border-left-color: #28a745;
        }
        
        .toast-success i {
            color: #28a745;
        }
        
        .toast-error {
            border-left-color: #dc3545;
        }
        
        .toast-error i {
            color: #dc3545;
        }
        
        .toast-info {
            border-left-color: #000000;
        }
        
        .toast-info i {
            color: #000000;
        }
        
        .toast-warning {
            border-left-color: #D4AF37;
        }
        
        .toast-warning i {
            color: #D4AF37;
        }
        
        .toast i {
            font-size: 1.1rem;
        }
        
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .checkout-modal.active {
            opacity: 1;
        }
        
        .checkout-modal-content {
            background: white;
            border-radius: 0;
            max-width: 480px;
            width: 90%;
            overflow: hidden;
            transform: scale(0.95);
            transition: transform 0.3s ease;
        }
        
        .checkout-modal.active .checkout-modal-content {
            transform: scale(1);
        }
        
        .checkout-modal-header {
            background: var(--primary-color);
            color: white;
            padding: 2.5rem;
            text-align: center;
        }
        
        .checkout-modal-header i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .checkout-modal-header h2 {
            margin: 0;
            font-size: 1.4rem;
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .checkout-modal-body {
            padding: 2rem;
            text-align: center;
        }
        
        .checkout-modal-body p {
            margin: 0.75rem 0;
            font-size: 1rem;
            color: var(--secondary-color);
        }
        
        .checkout-modal-footer {
            padding: 1rem 2rem 2rem;
            text-align: center;
        }
        
        .checkout-modal-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.9rem 2.5rem;
            border-radius: 0;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: background 0.3s;
        }
        
        .checkout-modal-btn:hover {
            background: var(--secondary-color);
        }
        
        .load-more-btn {
            display: block;
            margin: 3rem auto;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.9rem 2.5rem;
            border-radius: 0;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.3s;
        }
        
        .load-more-btn:hover {
            background: var(--secondary-color);
        }
        
        .load-more-btn i {
            margin-right: 0.5rem;
        }
    `;
    document.head.appendChild(style);
}

// Sidebar functions
function setupSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
}

function openSidebar() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    if (sidebar) sidebar.classList.add('active');
}

function closeSidebar() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    if (sidebar) sidebar.classList.remove('active');
}

// Auth functions
function checkAuthState() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    }
}

function getCurrentUser() {
    const userJSON = localStorage.getItem('sportshop_current_user');
    return userJSON ? JSON.parse(userJSON) : null;
}

function updateUIForLoggedInUser(user) {
    const userIconDefault = document.getElementById('userIconDefault');
    const userAvatar = document.getElementById('userAvatar');
    const sidebarLogin = document.getElementById('sidebarLogin');
    const sidebarRegister = document.getElementById('sidebarRegister');
    const sidebarLogout = document.getElementById('sidebarLogout');
    
    if (userIconDefault && userAvatar && user.photo) {
        userIconDefault.style.display = 'none';
        userAvatar.src = user.photo;
        userAvatar.alt = user.name;
        userAvatar.style.display = 'block';
    }
    
    if (sidebarLogin) sidebarLogin.style.display = 'none';
    if (sidebarRegister) sidebarRegister.style.display = 'none';
    if (sidebarLogout) sidebarLogout.style.display = 'block';
}

function handleUserIconClick() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // User is logged in, open sidebar to show profile options
        openSidebar();
    } else {
        // User is not logged in, redirect to login
        window.location.href = 'login.html';
    }
}

function handleLogout() {
    localStorage.removeItem('sportshop_current_user');
    localStorage.removeItem('sportshop_remember');
    showToast('Logout realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// ===== FAVORITES FUNCTIONS =====

// Toggle favorite
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        showToast('Removido dos favoritos', 'info');
    } else {
        // Add to favorites
        favorites.push(productId);
        showToast('Adicionado aos favoritos ❤️', 'success');
    }
    
    saveFavoritesToStorage();
    
    // Update only the heart icons without reloading everything
    updateFavoriteButtons();
}

// Update favorite buttons without reloading the page
function updateFavoriteButtons() {
    // Update all favorite buttons in the DOM
    const allFavoriteBtns = document.querySelectorAll('.favorite-btn');
    allFavoriteBtns.forEach(btn => {
        // Get product ID from onclick attribute
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/toggleFavorite\((\d+)\)/);
            if (match) {
                const productId = parseInt(match[1]);
                const isFavorited = favorites.includes(productId);
                
                // Update button appearance
                if (isFavorited) {
                    btn.classList.add('favorited');
                    btn.querySelector('i').className = 'fas fa-heart';
                } else {
                    btn.classList.remove('favorited');
                    btn.querySelector('i').className = 'far fa-heart';
                }
            }
        }
    });
}

// Load favorites from localStorage
function loadFavoritesFromStorage() {
    const favoritesJSON = localStorage.getItem('sportshop_favorites');
    if (favoritesJSON) {
        favorites = JSON.parse(favoritesJSON);
    }
}

// Save favorites to localStorage
function saveFavoritesToStorage() {
    localStorage.setItem('sportshop_favorites', JSON.stringify(favorites));
}

// Show favorites page
function showFavoritesPage() {
    const productsGrid = document.getElementById('productsGrid');
    const sectionHeader = document.querySelector('.section-header h2');
    const filtersInline = document.querySelector('.filters-inline');
    const landingPage = document.getElementById('landingPage');
    const productsSection = document.getElementById('produtos');
    
    // Hide landing page and show products section
    if (landingPage && productsSection) {
        landingPage.style.display = 'none';
        productsSection.style.display = 'block';
    }
    
    // Hide title and filters in favorites page
    if (sectionHeader) {
        sectionHeader.style.display = 'none';
    }
    if (filtersInline) {
        filtersInline.style.display = 'none';
    }
    
    if (favorites.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="far fa-heart" style="font-size: 80px; color: var(--color-gray); margin-bottom: 20px;"></i>
                <h3 style="font-size: 20px; color: var(--color-text); margin-bottom: 10px;">Nenhum favorito ainda</h3>
                <p style="color: var(--color-gray-dark);">Adicione produtos aos favoritos clicando no coração ❤️</p>
            </div>
        `;
        return;
    }
    
    const favoriteProducts = products.filter(p => favorites.includes(p.id));
    
    productsGrid.innerHTML = favoriteProducts.map(product => {
        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <button type="button" class="favorite-btn favorited" onclick="toggleFavorite(${product.id})" aria-label="Remover dos favoritos">
                    <i class="fas fa-heart"></i>
                </button>
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span style="display:none;">${product.icon}</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <button type="button" class="product-btn" onclick="addToCart(${product.id})" aria-label="Adicionar ${product.name} ao carrinho">
                    <i class="fas fa-shopping-cart"></i> ADICIONAR
                </button>
            </div>
        </div>
    `}).join('');
    
    showToast(`${favorites.length} produto(s) nos favoritos`, 'success');
}

// Show landing page
function showLandingPage() {
    const landingPage = document.getElementById('landingPage');
    const productsSection = document.getElementById('produtos');
    
    if (landingPage && productsSection) {
        landingPage.style.display = 'block';
        productsSection.style.display = 'none';
        
        // Load home sections
        loadHomeSections();
        
        // Start carousel autoplay
        startCarouselAutoplay();
    }
}

// Filter by category from landing page
function filterByCategory(category) {
    const landingPage = document.getElementById('landingPage');
    const productsSection = document.getElementById('produtos');
    const sectionHeader = document.querySelector('.section-header h2');
    const filtersInline = document.querySelector('.filters-inline');
    
    if (landingPage && productsSection) {
        landingPage.style.display = 'none';
        productsSection.style.display = 'block';
        
        // Stop carousel when leaving landing page
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    }
    
    // Hide title and filters in all category pages
    if (sectionHeader) {
        sectionHeader.style.display = 'none';
    }
    if (filtersInline) {
        filtersInline.style.display = 'none';
    }
    
    loadProducts(category);
    showToast('Produtos carregados!', 'success');
}

// Show sort modal
function showSortModal() {
    const modal = document.getElementById('sortModal');
    const sortOptions = document.querySelectorAll('.sort-option');
    
    // Add click handlers to options
    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            const sortType = option.getAttribute('data-sort');
            applySorting(sortType);
            closeSortModal();
        });
    });
    
    modal.classList.add('active');
}

// Close sort modal
function closeSortModal() {
    const modal = document.getElementById('sortModal');
    modal.classList.remove('active');
}

// Apply sorting
function applySorting(sortType) {
    currentSort = sortType;
    
    const sortNames = {
        'name-asc': 'Nome: A → Z',
        'name-desc': 'Nome: Z → A',
        'price-asc': 'Menor preço',
        'price-desc': 'Maior preço'
    };
    
    // Reload products with new sort
    const landingPage = document.getElementById('landingPage');
    if (landingPage && landingPage.style.display !== 'none') {
        // Don't reload if on landing page
        showToast(`Ordenação: ${sortNames[sortType]}`, 'success');
        return;
    }
    
    // Reload with current filter (maintain the category selection)
    loadProducts(currentFilter);
    showToast(`Ordenação: ${sortNames[sortType]}`, 'success');
}

// Close sort modal when clicking outside
document.addEventListener('click', (e) => {
    const sortModal = document.getElementById('sortModal');
    if (sortModal && e.target === sortModal) {
        closeSortModal();
    }
});

// ===== BANNER CAROUSEL =====
let currentSlide = 0;
let carouselInterval = null;

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (!slides.length) return;
    
    // Loop around
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    
    // Update slides
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentSlide);
    });
    
    // Update indicators
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetCarouselInterval();
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetCarouselInterval();
}

function goToSlide(index) {
    showSlide(index);
    resetCarouselInterval();
}

function startCarouselAutoplay() {
    carouselInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

function resetCarouselInterval() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    startCarouselAutoplay();
}

// ===== LOAD HOME SECTIONS =====
function loadHomeSections() {
    loadDestaquesSection();
    loadOfertasSection();
    loadLancamentosSection();
}

function loadDestaquesSection() {
    const container = document.getElementById('destaquesCarousel');
    if (!container) return;
    
    // Pega os primeiros 6 produtos
    const destaques = products.slice(0, 6);
    
    container.innerHTML = destaques.map(product => {
        const isFavorited = favorites.includes(product.id);
        
        // Render variants if product has them
        let variantsHTML = '';
        if (product.variants && product.variants.length > 0) {
            variantsHTML = `
                <div class="product-variants">
                    ${product.variants.map((variant, index) => `
                        <div class="variant-option ${index === 0 ? 'active' : ''}" 
                             onclick="changeProductVariant(${product.id}, ${index}, event)"
                             style="background-image: url('${variant.image}')"
                             title="${variant.color}">
                            <img src="${variant.image}" alt="${variant.color}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="carousel-product-card" data-product-id="${product.id}">
                <div class="carousel-product-image">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <img src="${product.image}" alt="${product.name}" data-product-img="${product.id}">
                </div>
                <div class="carousel-product-info">
                    <div class="carousel-product-name">${product.name}</div>
                    <div class="carousel-product-price">R$ ${product.price.toFixed(2)}</div>
                    <button class="product-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> ADICIONAR
                    </button>
                </div>
                ${variantsHTML}
            </div>
        `;
    }).join('');
}

function loadOfertasSection() {
    const container = document.getElementById('ofertasCarousel');
    if (!container) return;
    
    // Pega produtos de 6-12
    const ofertas = products.slice(6, 12);
    
    container.innerHTML = ofertas.map(product => {
        const isFavorited = favorites.includes(product.id);
        
        // Render variants if product has them
        let variantsHTML = '';
        if (product.variants && product.variants.length > 0) {
            variantsHTML = `
                <div class="product-variants">
                    ${product.variants.map((variant, index) => `
                        <div class="variant-option ${index === 0 ? 'active' : ''}" 
                             onclick="changeProductVariant(${product.id}, ${index}, event)"
                             style="background-image: url('${variant.image}')"
                             title="${variant.color}">
                            <img src="${variant.image}" alt="${variant.color}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="carousel-product-card" data-product-id="${product.id}">
                <div class="carousel-product-image">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <img src="${product.image}" alt="${product.name}" data-product-img="${product.id}">
                </div>
                <div class="carousel-product-info">
                    <div class="carousel-product-name">${product.name}</div>
                    <div class="carousel-product-price">R$ ${product.price.toFixed(2)}</div>
                    <div class="carousel-product-installment">${getInstallmentText(product.price)}</div>
                    <button class="product-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> ADICIONAR
                    </button>
                </div>
                ${variantsHTML}
            </div>
        `;
    }).join('');
}

function loadLancamentosSection() {
    const container = document.getElementById('lancamentosCarousel');
    if (!container) return;
    
    // Pega produtos de 12-18
    const lancamentos = products.slice(12, 18);
    
    container.innerHTML = lancamentos.map(product => {
        const isFavorited = favorites.includes(product.id);
        
        // Render variants if product has them
        let variantsHTML = '';
        if (product.variants && product.variants.length > 0) {
            variantsHTML = `
                <div class="product-variants">
                    ${product.variants.map((variant, index) => `
                        <div class="variant-option ${index === 0 ? 'active' : ''}" 
                             onclick="changeProductVariant(${product.id}, ${index}, event)"
                             style="background-image: url('${variant.image}')"
                             title="${variant.color}">
                            <img src="${variant.image}" alt="${variant.color}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        return `
            <div class="carousel-product-card" data-product-id="${product.id}">
                <div class="carousel-product-image">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" onclick="event.stopPropagation(); toggleFavorite(${product.id})">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <img src="${product.image}" alt="${product.name}" data-product-img="${product.id}">
                </div>
                <div class="carousel-product-info">
                    <div class="carousel-product-name">${product.name}</div>
                    <div class="carousel-product-price">R$ ${product.price.toFixed(2)}</div>
                    <div class="carousel-product-installment">${getInstallmentText(product.price)}</div>
                    <button class="product-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> ADICIONAR
                    </button>
                </div>
                ${variantsHTML}
            </div>
        `;
    }).join('');
}

// ===== PROFILE SIDEBAR =====
function setupProfileSidebar() {
    const profileOverlay = document.getElementById('profileOverlay');
    const profileLoginBtn = document.getElementById('profileLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    const menuItems = document.querySelectorAll('.profile-menu-item');
    
    // Close profile when clicking overlay
    if (profileOverlay) {
        profileOverlay.addEventListener('click', closeProfile);
    }
    
    // Login button
    if (profileLoginBtn) {
        profileLoginBtn.addEventListener('click', () => {
            closeProfile();
            setTimeout(() => openPage('login'), 300);
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    // Edit photo button
    if (editPhotoBtn) {
        const sidebarPhotoInput = document.getElementById('sidebarPhotoInput');
        
        editPhotoBtn.addEventListener('click', () => {
            if (sidebarPhotoInput) {
                sidebarPhotoInput.click();
            }
        });
        
        if (sidebarPhotoInput) {
            sidebarPhotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        showToast('Por favor, selecione uma imagem', 'error');
                        return;
                    }
                    
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('A imagem deve ter no máximo 5MB', 'error');
                        return;
                    }
                    
                    // Read and save photo
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imageUrl = event.target.result;
                        
                        // Update sidebar avatar
                        const avatarImg = document.getElementById('profileAvatarImg');
                        const avatarIcon = document.getElementById('profileAvatarIcon');
                        if (avatarImg && avatarIcon) {
                            avatarImg.src = imageUrl;
                            avatarImg.style.display = 'block';
                            avatarIcon.style.display = 'none';
                        }
                        
                        // Save to localStorage
                        if (saveUserPhoto(imageUrl)) {
                            showToast('Foto atualizada com sucesso!', 'success');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    // Menu items
    menuItems.forEach(item => {
        if (!item.classList.contains('logout-btn')) {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                handleProfileMenuAction(action);
            });
        }
    });
    
    // Load user profile on init
    loadUserProfile();
    
    // Update profile UI based on login state
    updateProfileUI();
}

function toggleProfile() {
    const profileSidebar = document.getElementById('profileSidebar');
    const profileOverlay = document.getElementById('profileOverlay');
    
    if (profileSidebar && profileOverlay) {
        profileSidebar.classList.toggle('active');
        profileOverlay.classList.toggle('active');
    }
}

function closeProfile() {
    const profileSidebar = document.getElementById('profileSidebar');
    const profileOverlay = document.getElementById('profileOverlay');
    
    if (profileSidebar && profileOverlay) {
        profileSidebar.classList.remove('active');
        profileOverlay.classList.remove('active');
    }
}

function loadUserProfile() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('sportshop_current_user');
    
    const profileUserInfo = document.getElementById('profileUserInfo');
    const profileLoginSection = document.getElementById('profileLoginSection');
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser) {
        const session = JSON.parse(currentUser);
        
        // Get full user data from users array
        const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
        const user = users.find(u => u.id === session.userId);
        
        // Show user info
        if (profileUserInfo) {
            profileUserInfo.style.display = 'block';
            document.getElementById('profileUserName').textContent = session.nome || user?.nome || 'Usuário';
            document.getElementById('profileUserId').textContent = session.userId || '230497235';
        }
        
        // Hide login section
        if (profileLoginSection) {
            profileLoginSection.style.display = 'none';
        }
        
        // Show edit photo button
        if (editPhotoBtn) {
            editPhotoBtn.style.display = 'flex';
        }
        
        // Show logout button
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
        
        // Show notifications button
        const notificationsBtnInline = document.getElementById('notificationsBtn');
        if (notificationsBtnInline) {
            notificationsBtnInline.style.display = 'flex';
        }
        
        // Load photo if exists
        if (user && user.photo) {
            const avatarImg = document.getElementById('profileAvatarImg');
            const avatarIcon = document.getElementById('profileAvatarIcon');
            if (avatarImg && avatarIcon) {
                avatarImg.src = user.photo;
                avatarImg.style.display = 'block';
                avatarIcon.style.display = 'none';
            }
        }
    } else {
        // Not logged in - show login button
        if (profileUserInfo) profileUserInfo.style.display = 'none';
        if (profileLoginSection) profileLoginSection.style.display = 'block';
        if (editPhotoBtn) editPhotoBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Hide notifications button
        const notificationsBtnInline = document.getElementById('notificationsBtn');
        if (notificationsBtnInline) {
            notificationsBtnInline.style.display = 'none';
        }
    }
}

function handleProfileMenuAction(action) {
    closeProfile();
    
    switch(action) {
        case 'notificacoes':
            openPage('notificacoes');
            break;
        case 'meus-dados':
            openPage('meusDados');
            break;
        case 'metodos-pagamento':
            openPage('metodosPagamento');
            break;
        case 'meus-pedidos':
            openPage('meusPedidos');
            break;
        case 'suporte':
            openContactSidebar();
            break;
        case 'configuracoes':
            openPage('configuracoes');
            break;
        case 'sobre':
            openPage('sobre');
            break;
    }
}

// ===== PROFILE PAGES =====
function openPage(pageName) {
    const page = document.getElementById(`${pageName}Page`);
    const overlay = document.getElementById(`${pageName}Overlay`);
    
    if (page && overlay) {
        // Quick transition
        setTimeout(() => {
            page.classList.add('active');
            overlay.classList.add('active');
            
            // Load data when opening specific pages
            if (pageName === 'meusDados') {
                loadMeusDadosData();
            } else if (pageName === 'notificacoes') {
                loadNotifications();
            }
        }, 100);
    }
}

function closePage(pageName, openProfile = false) {
    const page = document.getElementById(`${pageName}Page`);
    const overlay = document.getElementById(`${pageName}Overlay`);
    
    if (page && overlay) {
        page.classList.remove('active');
        overlay.classList.remove('active');
        
        if (openProfile) {
            setTimeout(() => {
                toggleProfile();
            }, 100);
        }
    }
}

function setupProfilePages() {
    const pages = ['meuPerfil', 'meusDados', 'metodosPagamento', 'meusPedidos', 'notificacoes', 'configuracoes', 'sobre'];
    
    pages.forEach(pageName => {
        const overlay = document.getElementById(`${pageName}Overlay`);
        const backBtn = document.getElementById(`${pageName}BackBtn`);
        
        // Close when clicking overlay
        if (overlay) {
            overlay.addEventListener('click', () => closePage(pageName, true));
        }
        
        // Back button
        if (backBtn) {
            backBtn.addEventListener('click', () => closePage(pageName, true));
        }
    });
    
    // Setup Meus Dados
    setupMeusDadosPage();
    
    // Setup Configurações
    setupConfiguracoesPage();
    
    // Setup Notificações
    setupNotificationsPage();
}

// ===== BUSCAR ENDEREÇO POR CEP (CADASTRO) =====
async function buscarEnderecoPorCEP(cep) {
    // Validar CEP
    if (!cep || cep.length !== 8) {
        return;
    }
    
    try {
        // Mostrar loading
        const cepInput = document.getElementById('profileCEP');
        if (cepInput) {
            cepInput.style.borderColor = '#28a745';
        }
        
        // Buscar na API ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        // Verificar se encontrou
        if (data.erro) {
            showToast('CEP não encontrado', 'error');
            return;
        }
        
        // Preencher campos
        const enderecoInput = document.getElementById('profileEndereco');
        const bairroInput = document.getElementById('profileBairro');
        const cidadeInput = document.getElementById('profileCidade');
        const estadoInput = document.getElementById('profileEstado');
        
        if (enderecoInput && data.logradouro) {
            enderecoInput.value = data.logradouro;
        }
        
        if (bairroInput && data.bairro) {
            bairroInput.value = data.bairro;
        }
        
        if (cidadeInput && data.localidade) {
            cidadeInput.value = data.localidade;
        }
        
        if (estadoInput && data.uf) {
            estadoInput.value = data.uf;
        }
        
        // Focar no número
        const numeroInput = document.getElementById('profileNumero');
        if (numeroInput) {
            numeroInput.focus();
        }
        
        showToast('Endereço encontrado!', 'success');
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        showToast('Erro ao buscar CEP. Tente novamente.', 'error');
    }
}

// ===== CONTACT SIDEBAR (Fale Conosco) =====
function openContactSidebar() {
    const contactSidebar = document.getElementById('contactSidebar');
    const contactOverlay = document.getElementById('contactOverlay');
    
    if (contactSidebar && contactOverlay) {
        contactSidebar.classList.add('active');
        contactOverlay.classList.add('active');
    }
}

function closeContactSidebar(openProfile = false) {
    const contactSidebar = document.getElementById('contactSidebar');
    const contactOverlay = document.getElementById('contactOverlay');
    
    if (contactSidebar && contactOverlay) {
        if (openProfile) {
            // Quick transition: close contact and immediately open profile
            const profileSidebar = document.getElementById('profileSidebar');
            const profileOverlay = document.getElementById('profileOverlay');
            
            // Close contact instantly
            contactSidebar.classList.remove('active');
            
            // Open profile immediately without delay
            if (profileSidebar && profileOverlay) {
                profileSidebar.classList.add('active');
                profileOverlay.classList.add('active');
            }
            
            // Close contact overlay after profile is open
            setTimeout(() => {
                contactOverlay.classList.remove('active');
            }, 100);
        } else {
            contactSidebar.classList.remove('active');
            contactOverlay.classList.remove('active');
        }
    }
}

function setupContactSidebar() {
    const contactOverlay = document.getElementById('contactOverlay');
    const contactCloseBtn = document.getElementById('contactCloseBtn');
    const chatbotBtn = document.getElementById('chatbotBtn');
    
    // Close when clicking overlay - go back to profile
    if (contactOverlay) {
        contactOverlay.addEventListener('click', () => closeContactSidebar(true));
    }
    
    // Close button - go back to profile
    if (contactCloseBtn) {
        contactCloseBtn.addEventListener('click', () => closeContactSidebar(true));
    }
    
    // Chatbot button
    if (chatbotBtn) {
        chatbotBtn.addEventListener('click', () => {
            closeContactSidebar();
            showToast('ChatBot em desenvolvimento', 'info');
        });
    }
}

// ===== AUTHENTICATION SYSTEM =====
function setupAuthPages() {
    const loginForm = document.getElementById('loginForm');
    const cadastroForm = document.getElementById('cadastroForm');
    const goToCadastroBtn = document.getElementById('goToCadastroBtn');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const loginBackBtn = document.querySelector('#loginPage .page-back-btn');
    const cadastroBackBtn = document.querySelector('#cadastroPage .page-back-btn');
    
    // Setup cadastro photo
    setupCadastroPhoto();
    
    // Setup cadastro masks
    setupCadastroMasks();
    
    // Setup CEP autocomplete in cadastro
    setupCadastroCEP();
    
    // Login form submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const senha = document.getElementById('loginSenha').value;
            
            if (!email || !senha) {
                showToast('Preencha todos os campos', 'error');
                return;
            }
            
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
            
            // Find user
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
            
            if (user) {
                // Create session
                const session = {
                    userId: user.id,
                    email: user.email,
                    nome: user.nome
                };
                localStorage.setItem('sportshop_current_user', JSON.stringify(session));
                
                showToast('Login realizado com sucesso!', 'success');
                closePage('login');
                updateProfileUI();
            } else {
                showToast('Email ou senha incorretos', 'error');
            }
        });
    }
    
    // Cadastro form submit
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get all form data
            const formData = {
                nome: document.getElementById('cadastroNome').value.trim(),
                email: document.getElementById('cadastroEmail').value.trim(),
                celular: document.getElementById('cadastroCelular').value.trim(),
                cpf: document.getElementById('cadastroCpf').value.trim(),
                dataNascimento: document.getElementById('cadastroDataNascimento').value,
                genero: document.getElementById('cadastroGenero').value,
                cep: document.getElementById('cadastroCep').value.trim(),
                endereco: document.getElementById('cadastroEndereco').value.trim(),
                numero: document.getElementById('cadastroNumero').value.trim(),
                complemento: document.getElementById('cadastroComplemento').value.trim(),
                bairro: document.getElementById('cadastroBairro').value.trim(),
                cidade: document.getElementById('cadastroCidade').value.trim(),
                estado: document.getElementById('cadastroEstado').value,
                senha: document.getElementById('cadastroSenha').value,
                confirmaSenha: document.getElementById('cadastroConfirmaSenha').value
            };
            
            // Validations
            const requiredFields = ['nome', 'email', 'celular', 'cpf', 'dataNascimento', 'genero', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'senha', 'confirmaSenha'];
            
            for (let field of requiredFields) {
                if (!formData[field]) {
                    showToast('Preencha todos os campos obrigatórios', 'error');
                    return;
                }
            }
            
            // Validate CPF
            if (!validateCPF(formData.cpf)) {
                showToast('CPF inválido! Por favor, digite um CPF válido.', 'error');
                return;
            }
            
            // Validate CEP
            const cepValidation = await validateCEP(formData.cep);
            if (!cepValidation.valid) {
                showToast(cepValidation.message, 'error');
                document.getElementById('cadastroCep').focus();
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showToast('Email inválido', 'error');
                return;
            }
            
            if (formData.senha.length < 6) {
                showToast('A senha deve ter no mínimo 6 caracteres', 'error');
                return;
            }
            
            if (formData.senha !== formData.confirmaSenha) {
                showToast('As senhas não coincidem', 'error');
                return;
            }
            
            // Get existing users
            const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
            
            // Check if email already exists
            if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
                showToast('Este email já está cadastrado', 'error');
                return;
            }
            
            // Get photo
            const cadastroPhotoImg = document.getElementById('cadastroPhotoImg');
            const photo = cadastroPhotoImg.style.display !== 'none' ? cadastroPhotoImg.src : null;
            
            // Create new user with all data
            const newUser = {
                id: Date.now().toString(),
                nome: formData.nome,
                email: formData.email,
                celular: formData.celular,
                senha: formData.senha,
                photo: photo,
                emailVerified: false, // Email needs verification
                celularVerified: false, // Phone needs verification
                profileData: {
                    nome: formData.nome,
                    email: formData.email,
                    celular: formData.celular,
                    cpf: formData.cpf,
                    dataNascimento: formData.dataNascimento,
                    genero: formData.genero,
                    cep: formData.cep,
                    endereco: formData.endereco,
                    numero: formData.numero,
                    complemento: formData.complemento,
                    bairro: formData.bairro,
                    cidade: formData.cidade,
                    estado: formData.estado
                },
                createdAt: new Date().toISOString()
            };
            
            // Add to users array
            users.push(newUser);
            localStorage.setItem('sportshop_users', JSON.stringify(users));
            
            // Auto login
            const session = {
                userId: newUser.id,
                email: newUser.email,
                nome: newUser.nome
            };
            localStorage.setItem('sportshop_current_user', JSON.stringify(session));
            
            showToast('Cadastro realizado com sucesso!', 'success');
            
            // Clear form
            cadastroForm.reset();
            
            // Reset photo
            const cadastroPhotoIcon = document.getElementById('cadastroPhotoIcon');
            if (cadastroPhotoImg) {
                cadastroPhotoImg.style.display = 'none';
                cadastroPhotoImg.src = '';
            }
            if (cadastroPhotoIcon) {
                cadastroPhotoIcon.style.display = 'block';
            }
            
            // Close cadastro page and update profile UI
            closePage('cadastro');
            updateProfileUI();
            
            // Start verification process after a short delay
            setTimeout(() => {
                showToast('Por favor, verifique seu email e celular', 'info');
                setTimeout(() => openEmailVerification(formData.email), 800);
            }, 1000);
        });
    }
    
    // Navigation between login and cadastro
    if (goToCadastroBtn) {
        goToCadastroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closePage('login');
            setTimeout(() => openPage('cadastro'), 300);
        });
    }
    
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closePage('cadastro');
            setTimeout(() => openPage('login'), 300);
        });
    }
    
    // Back buttons
    if (loginBackBtn) {
        loginBackBtn.addEventListener('click', () => closePage('login'));
    }
    
    if (cadastroBackBtn) {
        cadastroBackBtn.addEventListener('click', () => closePage('cadastro'));
    }
}

function setupCadastroPhoto() {
    const changePhotoBtn = document.getElementById('cadastroChangePhotoBtn');
    const removePhotoBtn = document.getElementById('cadastroRemovePhotoBtn');
    const photoInput = document.getElementById('cadastroPhotoInput');
    const photoIcon = document.getElementById('cadastroPhotoIcon');
    const photoImg = document.getElementById('cadastroPhotoImg');
    
    if (changePhotoBtn && photoInput) {
        changePhotoBtn.addEventListener('click', () => {
            photoInput.click();
        });
        
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate image
                if (!file.type.startsWith('image/')) {
                    showToast('Por favor, selecione uma imagem válida', 'error');
                    return;
                }
                
                // Validate size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showToast('A imagem deve ter no máximo 5MB', 'error');
                    return;
                }
                
                // Read and display image
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    
                    if (photoImg) {
                        photoImg.src = imageUrl;
                        photoImg.style.display = 'block';
                    }
                    if (photoIcon) {
                        photoIcon.style.display = 'none';
                    }
                    if (removePhotoBtn) {
                        removePhotoBtn.style.display = 'flex';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', () => {
            if (photoImg) {
                photoImg.src = '';
                photoImg.style.display = 'none';
            }
            if (photoIcon) {
                photoIcon.style.display = 'block';
            }
            if (removePhotoBtn) {
                removePhotoBtn.style.display = 'none';
            }
            if (photoInput) {
                photoInput.value = '';
            }
        });
    }
}

function setupCadastroMasks() {
    const celularInput = document.getElementById('cadastroCelular');
    const cpfInput = document.getElementById('cadastroCpf');
    const cepInput = document.getElementById('cadastroCep');
    
    // Celular mask
    if (celularInput) {
        celularInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                let formatted = '(' + value.substring(0, 2);
                if (value.length >= 3) {
                    formatted += ') ' + value.substring(2, 7);
                }
                if (value.length >= 8) {
                    formatted += '-' + value.substring(7, 11);
                }
                e.target.value = formatted;
            }
        });
    }
    
    // CPF mask with validation
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length > 0) {
                let formatted = value.substring(0, 3);
                if (value.length >= 4) {
                    formatted += '.' + value.substring(3, 6);
                }
                if (value.length >= 7) {
                    formatted += '.' + value.substring(6, 9);
                }
                if (value.length >= 10) {
                    formatted += '-' + value.substring(9, 11);
                }
                e.target.value = formatted;
            }
            
            // Validate CPF in real-time when complete
            if (value.length === 11) {
                if (validateCPF(value)) {
                    e.target.style.borderColor = '#28a745';
                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                } else {
                    e.target.style.borderColor = '#dc3545';
                    e.target.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                }
            } else {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }
        });
        
        // Reset border on focus
        cpfInput.addEventListener('focus', (e) => {
            if (e.target.value.replace(/\D/g, '').length !== 11) {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }
        });
    }
    
    // CEP mask with validation
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            if (value.length > 5) {
                e.target.value = value.substring(0, 5) + '-' + value.substring(5, 8);
            } else {
                e.target.value = value;
            }
            
            // Reset validation styles while typing
            if (value.length < 8) {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }
        });
        
        // Validate CEP on blur (when user leaves the field)
        cepInput.addEventListener('blur', async (e) => {
            const value = e.target.value.replace(/\D/g, '');
            
            if (value.length === 8) {
                // Show loading state
                e.target.style.borderColor = '#ffc107';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                
                const cepValidation = await validateCEP(value);
                
                if (cepValidation.valid) {
                    e.target.style.borderColor = '#28a745';
                    e.target.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                } else {
                    e.target.style.borderColor = '#dc3545';
                    e.target.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                    showToast(cepValidation.message, 'error');
                }
            }
        });
        
        // Reset border on focus
        cepInput.addEventListener('focus', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length !== 8) {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
            }
        });
    }
}

function setupCadastroCEP() {
    const cepInput = document.getElementById('cadastroCep');
    
    if (cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                // Show loading state
                cepInput.style.borderColor = '#ffc107';
                cepInput.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.1)';
                
                try {
                    const cepValidation = await validateCEP(cep);
                    
                    if (cepValidation.valid) {
                        // CEP válido - preencher campos
                        const data = cepValidation.data;
                        
                        document.getElementById('cadastroEndereco').value = data.logradouro || '';
                        document.getElementById('cadastroBairro').value = data.bairro || '';
                        document.getElementById('cadastroCidade').value = data.localidade || '';
                        document.getElementById('cadastroEstado').value = data.uf || '';
                        
                        // Visual feedback - sucesso
                        cepInput.style.borderColor = '#28a745';
                        cepInput.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                        
                        showToast('CEP válido! Endereço preenchido automaticamente.', 'success');
                        
                        // Focar no campo número
                        document.getElementById('cadastroNumero').focus();
                    } else {
                        // CEP inválido
                        cepInput.style.borderColor = '#dc3545';
                        cepInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                        showToast(cepValidation.message, 'error');
                        
                        // Limpar campos de endereço
                        document.getElementById('cadastroEndereco').value = '';
                        document.getElementById('cadastroBairro').value = '';
                        document.getElementById('cadastroCidade').value = '';
                        document.getElementById('cadastroEstado').value = '';
                    }
                } catch (error) {
                    cepInput.style.borderColor = '#dc3545';
                    cepInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                    showToast('Erro ao buscar CEP. Verifique sua conexão.', 'error');
                }
            }
        });
        
        // Reset border on focus
        cepInput.addEventListener('focus', () => {
            const value = cepInput.value.replace(/\D/g, '');
            if (value.length !== 8) {
                cepInput.style.borderColor = '';
                cepInput.style.boxShadow = '';
            }
        });
    }
}

function updateProfileUI() {
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    const profileLoginSection = document.querySelector('.profile-login-section');
    const profileUserInfo = document.querySelector('.profile-user-info');
    const profileUserName = document.getElementById('profileUserName');
    const profileUserEmail = document.getElementById('profileUserEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const loggedOnlyItems = document.querySelectorAll('.profile-menu-logged-only');
    const logoutBtn = document.getElementById('logoutBtn');
    const notificationsBtn = document.getElementById('notificationsBtn');
    
    if (session) {
        // User is logged in
        const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
        const user = users.find(u => u.id === session.userId);
        
        if (user) {
            // Hide login button, show user info
            if (profileLoginSection) profileLoginSection.style.display = 'none';
            if (profileUserInfo) profileUserInfo.style.display = 'block';
            
            // Show logged-only menu items
            loggedOnlyItems.forEach(item => {
                item.style.display = 'flex';
            });
            
            // Show logout button
            if (logoutBtn) logoutBtn.style.display = 'flex';
            
            // Show notifications button
            if (notificationsBtn) notificationsBtn.style.display = 'flex';
            
            // Update user info
            if (profileUserName) profileUserName.textContent = user.nome;
            if (profileUserEmail) profileUserEmail.textContent = user.email;
            
            // Update avatar
            if (profileAvatar && user.photo) {
                profileAvatar.src = user.photo;
            } else if (profileAvatar) {
                profileAvatar.src = 'https://via.placeholder.com/80/28a745/ffffff?text=' + user.nome.charAt(0).toUpperCase();
            }
            
            // Load user's profile data into form if on Meu Perfil page
            loadUserProfileData();
        }
    } else {
        // User is not logged in
        if (profileLoginSection) profileLoginSection.style.display = 'block';
        if (profileUserInfo) profileUserInfo.style.display = 'none';
        
        // Hide logged-only menu items
        loggedOnlyItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Hide logout button
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Hide notifications button
        if (notificationsBtn) notificationsBtn.style.display = 'none';
    }
}

function loadUserProfileData() {
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    if (!session) return;
    
    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
    const user = users.find(u => u.id === session.userId);
    if (!user) return;
    
    // Load profile data into form fields
    const fields = ['nome', 'email', 'celular', 'cpf', 'dataNascimento', 'genero', 'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
    
    fields.forEach(field => {
        const input = document.getElementById('perfil' + field.charAt(0).toUpperCase() + field.slice(1));
        if (input && user.profileData && user.profileData[field]) {
            input.value = user.profileData[field];
        } else if (input && field === 'nome' && user.nome) {
            input.value = user.nome;
        } else if (input && field === 'email' && user.email) {
            input.value = user.email;
        } else if (input && field === 'celular' && user.celular) {
            input.value = user.celular;
        }
    });
    
    // Load profile photo
    const profilePhoto = document.getElementById('profilePhoto');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    if (user.photo) {
        if (profilePhoto) profilePhoto.src = user.photo;
        if (removePhotoBtn) removePhotoBtn.style.display = 'block';
    } else {
        if (profilePhoto) profilePhoto.src = 'https://via.placeholder.com/120/28a745/ffffff?text=' + user.nome.charAt(0).toUpperCase();
        if (removePhotoBtn) removePhotoBtn.style.display = 'none';
    }
}

function saveUserProfileData(data) {
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    if (!session) {
        showToast('Você precisa estar logado para salvar os dados', 'error');
        return false;
    }
    
    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
        showToast('Erro ao salvar dados', 'error');
        return false;
    }
    
    // Update user data
    users[userIndex].profileData = data;
    users[userIndex].nome = data.nome || users[userIndex].nome;
    users[userIndex].email = data.email || users[userIndex].email;
    users[userIndex].celular = data.celular || users[userIndex].celular;
    
    localStorage.setItem('sportshop_users', JSON.stringify(users));
    
    // Update session if name or email changed
    const updatedSession = {
        userId: session.userId,
        email: users[userIndex].email,
        nome: users[userIndex].nome
    };
    localStorage.setItem('sportshop_current_user', JSON.stringify(updatedSession));
    
    return true;
}

function saveUserPhoto(photoData) {
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    if (!session) {
        showToast('Você precisa estar logado para alterar a foto', 'error');
        return false;
    }
    
    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
        showToast('Erro ao salvar foto', 'error');
        return false;
    }
    
    users[userIndex].photo = photoData;
    localStorage.setItem('sportshop_users', JSON.stringify(users));
    
    return true;
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('sportshop_current_user');
        showToast('Logout realizado com sucesso', 'success');
        updateProfileUI();
        closeProfile();
    }
}

// ===== CONFIGURAÇÕES PAGE =====
// ===== MEUS DADOS PAGE =====
function setupMeusDadosPage() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteAccountOverlay = document.getElementById('deleteAccountOverlay');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const deleteAccountCloseBtn = document.getElementById('deleteAccountCloseBtn');
    const deleteAccountCancelBtn = document.getElementById('deleteAccountCancelBtn');
    const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
    const deleteConfirmPassword = document.getElementById('deleteConfirmPassword');
    
    // Load user data
    loadMeusDadosData();
    
    // Open delete modal
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (deleteAccountModal && deleteAccountOverlay) {
                deleteAccountModal.classList.add('active');
                deleteAccountOverlay.classList.add('active');
                if (deleteConfirmPassword) deleteConfirmPassword.value = '';
            }
        });
    }
    
    // Close delete modal
    function closeDeleteModal() {
        if (deleteAccountModal && deleteAccountOverlay) {
            deleteAccountModal.classList.remove('active');
            deleteAccountOverlay.classList.remove('active');
            if (deleteConfirmPassword) deleteConfirmPassword.value = '';
        }
    }
    
    if (deleteAccountCloseBtn) {
        deleteAccountCloseBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteAccountCancelBtn) {
        deleteAccountCancelBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteAccountOverlay) {
        deleteAccountOverlay.addEventListener('click', closeDeleteModal);
    }
    
    // Confirm delete account
    if (confirmDeleteAccountBtn) {
        confirmDeleteAccountBtn.addEventListener('click', () => {
            const password = deleteConfirmPassword ? deleteConfirmPassword.value : '';
            
            if (!password) {
                showToast('Digite sua senha para confirmar', 'error');
                return;
            }
            
            const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
            if (!session) {
                showToast('Você precisa estar logado', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
            const user = users.find(u => u.id === session.userId);
            
            if (!user) {
                showToast('Usuário não encontrado', 'error');
                return;
            }
            
            // Verify password
            if (user.senha !== password) {
                showToast('Senha incorreta', 'error');
                return;
            }
            
            // Confirm one more time
            if (!confirm('TEM CERTEZA? Esta ação é IRREVERSÍVEL!')) {
                return;
            }
            
            // Delete user from array
            const updatedUsers = users.filter(u => u.id !== session.userId);
            localStorage.setItem('sportshop_users', JSON.stringify(updatedUsers));
            
            // Logout
            localStorage.removeItem('sportshop_current_user');
            
            closeDeleteModal();
            closePage('meusDados');
            
            showToast('Conta excluída com sucesso', 'success');
            
            // Update UI
            setTimeout(() => {
                updateProfileUI();
            }, 500);
        });
    }
}

function loadMeusDadosData() {
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    if (!session) return;
    
    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
    const user = users.find(u => u.id === session.userId);
    
    if (!user) return;
    
    const profileData = user.profileData || {};
    
    // Update data display - Campos editáveis
    const dadosNome = document.getElementById('dadosNome');
    const dadosEmail = document.getElementById('dadosEmail');
    const dadosCelular = document.getElementById('dadosCelular');
    
    if (dadosNome) dadosNome.textContent = user.nome || '-';
    if (dadosEmail) dadosEmail.textContent = user.email || '-';
    if (dadosCelular) dadosCelular.textContent = profileData.celular || '-';
    
    // Update input values for editing
    const inputNome = document.getElementById('inputNome');
    const inputEmail = document.getElementById('inputEmail');
    const inputCelular = document.getElementById('inputCelular');
    const inputDataNascimento = document.getElementById('inputDataNascimento');
    const inputGenero = document.getElementById('inputGenero');
    
    if (inputNome) inputNome.value = user.nome || '';
    if (inputEmail) inputEmail.value = user.email || '';
    if (inputCelular) inputCelular.value = profileData.celular || '';
    if (inputDataNascimento) inputDataNascimento.value = profileData.dataNascimento || '';
    if (inputGenero) inputGenero.value = profileData.genero || '';
    
    // Show verification badges
    const emailBadge = document.getElementById('emailVerificationBadge');
    const celularBadge = document.getElementById('celularVerificationBadge');
    
    if (emailBadge) {
        if (user.emailVerified) {
            emailBadge.className = 'verification-badge verified';
            emailBadge.textContent = 'Verificado';
        } else {
            emailBadge.className = 'verification-badge not-verified';
            emailBadge.textContent = 'Não Verificado';
            emailBadge.onclick = () => openEmailVerification(user.email);
        }
    }
    
    if (celularBadge) {
        if (user.celularVerified) {
            celularBadge.className = 'verification-badge verified';
            celularBadge.textContent = 'Verificado';
        } else {
            celularBadge.className = 'verification-badge not-verified';
            celularBadge.textContent = 'Não Verificado';
            celularBadge.onclick = () => openPhoneVerification(profileData.celular);
        }
    }
    
    // Campos não editáveis (só CPF agora)
    const dadosCPF = document.getElementById('dadosCPF');
    const dadosDataNascimento = document.getElementById('dadosDataNascimento');
    const dadosGenero = document.getElementById('dadosGenero');
    const dadosEndereco = document.getElementById('dadosEndereco');
    
    if (dadosCPF) dadosCPF.textContent = profileData.cpf || '-';
    
    if (dadosDataNascimento && profileData.dataNascimento) {
        const date = new Date(profileData.dataNascimento + 'T00:00:00');
        dadosDataNascimento.textContent = date.toLocaleDateString('pt-BR');
    } else if (dadosDataNascimento) {
        dadosDataNascimento.textContent = '-';
    }
    
    if (dadosGenero) {
        const generoMap = {
            'masculino': 'Masculino',
            'feminino': 'Feminino',
            'outro': 'Outro',
            'nao-informar': 'Prefiro não informar'
        };
        dadosGenero.textContent = generoMap[profileData.genero] || '-';
    }
    
    if (dadosEndereco) {
        let endereco = '';
        // Check if there's a saved complete address first
        if (profileData.enderecoCompleto) {
            endereco = profileData.enderecoCompleto;
        } else if (profileData.endereco) {
            // Build from individual fields if no complete address saved
            endereco = profileData.endereco;
            if (profileData.numero) endereco += ', ' + profileData.numero;
            if (profileData.complemento) endereco += ' - ' + profileData.complemento;
            if (profileData.bairro) endereco += '\n' + profileData.bairro;
            if (profileData.cidade && profileData.estado) {
                endereco += '\n' + profileData.cidade + ' - ' + profileData.estado;
            }
            if (profileData.cep) endereco += '\nCEP: ' + profileData.cep;
        }
        dadosEndereco.textContent = endereco || '-';
        dadosEndereco.style.whiteSpace = 'pre-line';
        
        // Update input value
        const inputEndereco = document.getElementById('inputEndereco');
        if (inputEndereco) {
            inputEndereco.value = endereco || '';
        }
    }
    
    // Setup inline edit functionality
    setupInlineEdit();
}

function setupInlineEdit() {
    const editButtons = document.querySelectorAll('.edit-btn');
    const saveButtons = document.querySelectorAll('.save-btn');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    
    // Add phone mask to celular input
    const inputCelular = document.getElementById('inputCelular');
    if (inputCelular) {
        inputCelular.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                e.target.value = value;
            }
        });
    }
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.getAttribute('data-field');
            startEdit(field);
        });
    });
    
    saveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.getAttribute('data-field');
            saveEdit(field);
        });
    });
    
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.getAttribute('data-field');
            cancelEdit(field);
        });
    });
}

function startEdit(field) {
    const dataItem = document.querySelector(`.data-item[data-field="${field}"]`);
    if (!dataItem) return;
    
    const valueSpan = dataItem.querySelector('.data-value');
    const input = dataItem.querySelector('.data-input');
    const editBtn = dataItem.querySelector('.edit-btn');
    const editActions = dataItem.querySelector('.edit-actions');
    
    if (valueSpan && input && editBtn && editActions) {
        valueSpan.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        editBtn.style.display = 'none';
        editActions.style.display = 'flex';
        dataItem.classList.add('editing');
    }
}

function cancelEdit(field) {
    const dataItem = document.querySelector(`.data-item[data-field="${field}"]`);
    if (!dataItem) return;
    
    const valueSpan = dataItem.querySelector('.data-value');
    const input = dataItem.querySelector('.data-input');
    const editBtn = dataItem.querySelector('.edit-btn');
    const editActions = dataItem.querySelector('.edit-actions');
    
    if (valueSpan && input && editBtn && editActions) {
        // Restore original value
        input.value = valueSpan.textContent !== '-' ? valueSpan.textContent : '';
        
        valueSpan.style.display = 'block';
        input.style.display = 'none';
        editBtn.style.display = 'flex';
        editActions.style.display = 'none';
        dataItem.classList.remove('editing');
    }
}

function saveEdit(field) {
    const dataItem = document.querySelector(`.data-item[data-field="${field}"]`);
    if (!dataItem) return;
    
    const input = dataItem.querySelector('.data-input');
    if (!input) return;
    
    const newValue = input.value.trim();
    
    if (!newValue) {
        showToast('Campo não pode ficar vazio', 'error');
        return;
    }
    
    // Validações específicas
    if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue)) {
            showToast('Email inválido', 'error');
            return;
        }
    }
    
    if (field === 'celular') {
        const celularClean = newValue.replace(/\D/g, '');
        if (celularClean.length !== 11) {
            showToast('Celular inválido. Use o formato (00) 00000-0000', 'error');
            return;
        }
    }
    
    // Save to localStorage
    const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
    if (!session) {
        showToast('Você precisa estar logado', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
        showToast('Erro ao salvar', 'error');
        return;
    }
    
    // Update user data
    if (field === 'nome') {
        users[userIndex].nome = newValue;
        // Update session too
        session.nome = newValue;
        localStorage.setItem('sportshop_current_user', JSON.stringify(session));
    } else if (field === 'email') {
        // Check if email already exists
        const emailExists = users.some((u, idx) => idx !== userIndex && u.email.toLowerCase() === newValue.toLowerCase());
        if (emailExists) {
            showToast('Este email já está em uso', 'error');
            return;
        }
        users[userIndex].email = newValue;
        // Mark email as not verified since it changed
        users[userIndex].emailVerified = false;
        // Update session too
        session.email = newValue;
        localStorage.setItem('sportshop_current_user', JSON.stringify(session));
        // Open verification modal
        setTimeout(() => openEmailVerification(newValue), 500);
    } else if (field === 'celular') {
        if (!users[userIndex].profileData) users[userIndex].profileData = {};
        users[userIndex].profileData.celular = newValue;
        // Mark celular as not verified since it changed
        users[userIndex].celularVerified = false;
        // Open verification modal
        setTimeout(() => openPhoneVerification(newValue), 500);
    } else if (field === 'endereco') {
        if (!users[userIndex].profileData) users[userIndex].profileData = {};
        users[userIndex].profileData.enderecoCompleto = newValue;
    } else if (field === 'dataNascimento') {
        if (!users[userIndex].profileData) users[userIndex].profileData = {};
        users[userIndex].profileData.dataNascimento = newValue;
    } else if (field === 'genero') {
        if (!users[userIndex].profileData) users[userIndex].profileData = {};
        users[userIndex].profileData.genero = newValue;
    }
    
    localStorage.setItem('sportshop_users', JSON.stringify(users));
    
    // Update display
    const valueSpan = dataItem.querySelector('.data-value');
    if (valueSpan) {
        // Format display based on field type
        let displayValue = newValue;
        
        if (field === 'dataNascimento') {
            const date = new Date(newValue + 'T00:00:00');
            displayValue = date.toLocaleDateString('pt-BR');
        } else if (field === 'genero') {
            const generoMap = {
                'masculino': 'Masculino',
                'feminino': 'Feminino',
                'outro': 'Outro',
                'nao-informar': 'Prefiro não informar'
            };
            displayValue = generoMap[newValue] || newValue;
        }
        
        valueSpan.textContent = displayValue;
        // Keep whitespace formatting for address
        if (field === 'endereco') {
            valueSpan.style.whiteSpace = 'pre-line';
        }
    }
    
    // Exit edit mode
    cancelEdit(field);
    
    // Update profile UI if name changed
    if (field === 'nome') {
        updateProfileUI();
    }
    
    // Reload badges if email or celular changed
    if (field === 'email' || field === 'celular') {
        loadMeusDadosData();
    }
    
    showToast('Atualizado com sucesso!', 'success');
}

// ===== EMAIL & PHONE VERIFICATION =====
function openEmailVerification(email) {
    const modal = document.getElementById('emailVerificationModal');
    const overlay = document.getElementById('emailVerificationOverlay');
    const targetElement = document.getElementById('emailVerificationTarget');
    const codeInput = document.getElementById('emailVerificationCode');
    
    if (modal && overlay && targetElement) {
        targetElement.textContent = email;
        if (codeInput) codeInput.value = '';
        
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Simulate sending verification code
        const verificationCode = generateVerificationCode();
        console.log(`[SIMULADO] Código de verificação de email enviado para ${email}: ${verificationCode}`);
        showToast(`Código enviado para ${email}`, 'info');
        
        // Store the code temporarily
        window.currentEmailVerificationCode = verificationCode;
        window.currentEmailToVerify = email;
        
        // Start countdown for resend
        startResendCountdown('email', 60);
    }
}

function openPhoneVerification(phone) {
    const modal = document.getElementById('phoneVerificationModal');
    const overlay = document.getElementById('phoneVerificationOverlay');
    const targetElement = document.getElementById('phoneVerificationTarget');
    const codeInput = document.getElementById('phoneVerificationCode');
    
    if (modal && overlay && targetElement) {
        targetElement.textContent = phone;
        if (codeInput) codeInput.value = '';
        
        modal.classList.add('active');
        overlay.classList.add('active');
        
        // Simulate sending verification code
        const verificationCode = generateVerificationCode();
        console.log(`[SIMULADO] Código de verificação SMS/WhatsApp enviado para ${phone}: ${verificationCode}`);
        showToast(`Código enviado para ${phone}`, 'info');
        
        // Store the code temporarily
        window.currentPhoneVerificationCode = verificationCode;
        window.currentPhoneToVerify = phone;
        
        // Start countdown for resend
        startResendCountdown('phone', 60);
    }
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function startResendCountdown(type, seconds) {
    const countdownElement = document.getElementById(type === 'email' ? 'emailCountdown' : 'phoneCountdown');
    const resendBtn = document.getElementById(type === 'email' ? 'resendEmailCodeBtn' : 'resendPhoneCodeBtn');
    
    if (!countdownElement || !resendBtn) return;
    
    let remaining = seconds;
    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        remaining--;
        countdownElement.textContent = `(${remaining}s)`;
        
        if (remaining <= 0) {
            clearInterval(interval);
            countdownElement.textContent = '';
            resendBtn.disabled = false;
        }
    }, 1000);
}

function setupVerificationModals() {
    // Email verification modal
    const emailModal = document.getElementById('emailVerificationModal');
    const emailOverlay = document.getElementById('emailVerificationOverlay');
    const emailCloseBtn = document.getElementById('emailVerificationCloseBtn');
    const emailCancelBtn = document.getElementById('emailVerificationCancelBtn');
    const confirmEmailBtn = document.getElementById('confirmEmailVerificationBtn');
    const emailCodeInput = document.getElementById('emailVerificationCode');
    const resendEmailBtn = document.getElementById('resendEmailCodeBtn');
    
    function closeEmailModal() {
        if (emailModal && emailOverlay) {
            emailModal.classList.remove('active');
            emailOverlay.classList.remove('active');
        }
    }
    
    if (emailCloseBtn) emailCloseBtn.addEventListener('click', closeEmailModal);
    if (emailCancelBtn) emailCancelBtn.addEventListener('click', closeEmailModal);
    if (emailOverlay) emailOverlay.addEventListener('click', closeEmailModal);
    
    if (confirmEmailBtn && emailCodeInput) {
        confirmEmailBtn.addEventListener('click', () => {
            const enteredCode = emailCodeInput.value.trim();
            
            if (enteredCode === window.currentEmailVerificationCode) {
                // Mark email as verified
                const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
                if (session) {
                    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
                    const userIndex = users.findIndex(u => u.id === session.userId);
                    
                    if (userIndex !== -1) {
                        users[userIndex].emailVerified = true;
                        localStorage.setItem('sportshop_users', JSON.stringify(users));
                        
                        showToast('Email verificado com sucesso!', 'success');
                        closeEmailModal();
                        loadMeusDadosData(); // Reload to update badge
                    }
                }
            } else {
                showToast('Código incorreto. Tente novamente.', 'error');
                emailCodeInput.value = '';
            }
        });
    }
    
    if (resendEmailBtn) {
        resendEmailBtn.addEventListener('click', () => {
            if (!resendEmailBtn.disabled && window.currentEmailToVerify) {
                openEmailVerification(window.currentEmailToVerify);
            }
        });
    }
    
    // Phone verification modal
    const phoneModal = document.getElementById('phoneVerificationModal');
    const phoneOverlay = document.getElementById('phoneVerificationOverlay');
    const phoneCloseBtn = document.getElementById('phoneVerificationCloseBtn');
    const phoneCancelBtn = document.getElementById('phoneVerificationCancelBtn');
    const confirmPhoneBtn = document.getElementById('confirmPhoneVerificationBtn');
    const phoneCodeInput = document.getElementById('phoneVerificationCode');
    const resendPhoneBtn = document.getElementById('resendPhoneCodeBtn');
    
    function closePhoneModal() {
        if (phoneModal && phoneOverlay) {
            phoneModal.classList.remove('active');
            phoneOverlay.classList.remove('active');
        }
    }
    
    if (phoneCloseBtn) phoneCloseBtn.addEventListener('click', closePhoneModal);
    if (phoneCancelBtn) phoneCancelBtn.addEventListener('click', closePhoneModal);
    if (phoneOverlay) phoneOverlay.addEventListener('click', closePhoneModal);
    
    if (confirmPhoneBtn && phoneCodeInput) {
        confirmPhoneBtn.addEventListener('click', () => {
            const enteredCode = phoneCodeInput.value.trim();
            
            if (enteredCode === window.currentPhoneVerificationCode) {
                // Mark phone as verified
                const session = JSON.parse(localStorage.getItem('sportshop_current_user') || 'null');
                if (session) {
                    const users = JSON.parse(localStorage.getItem('sportshop_users') || '[]');
                    const userIndex = users.findIndex(u => u.id === session.userId);
                    
                    if (userIndex !== -1) {
                        users[userIndex].celularVerified = true;
                        localStorage.setItem('sportshop_users', JSON.stringify(users));
                        
                        showToast('Celular verificado com sucesso!', 'success');
                        closePhoneModal();
                        loadMeusDadosData(); // Reload to update badge
                    }
                }
            } else {
                showToast('Código incorreto. Tente novamente.', 'error');
                phoneCodeInput.value = '';
            }
        });
    }
    
    if (resendPhoneBtn) {
        resendPhoneBtn.addEventListener('click', () => {
            if (!resendPhoneBtn.disabled && window.currentPhoneToVerify) {
                openPhoneVerification(window.currentPhoneToVerify);
            }
        });
    }
    
    // Allow only numbers in code inputs
    if (emailCodeInput) {
        emailCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
        });
    }
    
    if (phoneCodeInput) {
        phoneCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
        });
    }
}

// ===== CONFIGURAÇÕES PAGE =====
function setupConfiguracoesPage() {
    const notificationsToggle = document.getElementById('notificationsToggle');
    const themeLight = document.getElementById('themeLight');
    const themeDark = document.getElementById('themeDark');
    const themeAuto = document.getElementById('themeAuto');
    
    // Load saved settings
    loadSettings();
    
    // Notifications toggle
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('sportshop_notifications', enabled ? 'enabled' : 'disabled');
            
            if (enabled) {
                showToast('Notificações ativadas', 'success');
            } else {
                showToast('Notificações desativadas', 'info');
            }
        });
    }
    
    // Theme selection
    const themeInputs = [themeLight, themeDark, themeAuto];
    themeInputs.forEach(input => {
        if (input) {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const theme = e.target.value;
                    applyTheme(theme);
                    localStorage.setItem('sportshop_theme', theme);
                    
                    const themeNames = {
                        'light': 'Tema Claro',
                        'dark': 'Tema Escuro',
                        'auto': 'Tema Automático'
                    };
                    
                    showToast(`${themeNames[theme]} ativado`, 'success');
                }
            });
        }
    });
}

function loadSettings() {
    // Load notifications setting
    const notifications = localStorage.getItem('sportshop_notifications');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (notificationsToggle) {
        notificationsToggle.checked = notifications === 'enabled';
    }
    
    // Load theme setting
    const savedTheme = localStorage.getItem('sportshop_theme') || 'auto';
    const themeInput = document.getElementById('theme' + savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1));
    
    if (themeInput) {
        themeInput.checked = true;
    }
    
    // Apply theme
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        html.setAttribute('data-theme', 'light');
    } else {
        // Auto - detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

// Watch for system theme changes when in auto mode
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const savedTheme = localStorage.getItem('sportshop_theme') || 'auto';
        if (savedTheme === 'auto') {
            applyTheme('auto');
        }
    });
}

// ===== NOTIFICATIONS SYSTEM =====
let notificationsData = [];

function setupNotificationsPage() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    // Open notifications page from floating button
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeProfile();
            setTimeout(() => {
                openPage('notificacoes');
            }, 100);
        });
    }
    
    // Mark all as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            markAllNotificationsAsRead();
        });
    }
    
    // Initialize notifications
    initializeNotifications();
}

function initializeNotifications() {
    // Sample notifications data
    notificationsData = [
        {
            id: 1,
            type: 'promo',
            icon: 'fa-tag',
            title: 'Promoção Relâmpago! ⚡',
            message: 'Tênis Nike Air Max com 40% OFF. Válido por 24h!',
            time: 'Há 2 horas',
            read: false,
            action: { type: 'category', category: 'tenis' }
        },
        {
            id: 2,
            type: 'price-alert',
            icon: 'fa-arrow-down',
            title: 'Preço Baixou!',
            message: 'Chuteira Nike Mercurial que você favoritou está R$ 150 mais barata.',
            time: 'Há 5 horas',
            read: false,
            action: { type: 'category', category: 'chuteiras' }
        },
        {
            id: 3,
            type: 'order',
            icon: 'fa-truck',
            title: 'Pedido em Trânsito',
            message: 'Seu pedido #230497 saiu para entrega. Previsão: hoje até 18h.',
            time: 'Há 8 horas',
            read: false,
            action: { type: 'page', page: 'meusPedidos' }
        },
        {
            id: 4,
            type: 'favorite',
            icon: 'fa-heart',
            title: 'Produto de Volta ao Estoque!',
            message: 'Camisa do Flamengo 2025 que você favoritou voltou ao estoque.',
            time: 'Ontem',
            read: true,
            action: { type: 'category', category: 'camisas' }
        },
        {
            id: 5,
            type: 'promo',
            icon: 'fa-gift',
            title: 'Cupom Especial para Você',
            message: 'Use o cupom SPORT20 e ganhe 20% de desconto na próxima compra.',
            time: '2 dias atrás',
            read: true,
            action: { type: 'category', category: 'all' }
        }
    ];
    
    // Load from localStorage if exists
    const saved = localStorage.getItem('sportshop_notifications');
    if (saved) {
        try {
            notificationsData = JSON.parse(saved);
        } catch(e) {
            console.error('Error loading notifications:', e);
        }
    }
    
    updateNotificationsBadge();
}

function loadNotifications() {
    const notificationsContent = document.getElementById('notificationsContent');
    if (!notificationsContent) return;
    
    notificationsContent.innerHTML = '';
    
    if (notificationsData.length === 0) {
        notificationsContent.innerHTML = `
            <div class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <h3>Nenhuma notificação</h3>
                <p>Você não tem notificações no momento.<br>Fique atento às novidades!</p>
            </div>
        `;
        return;
    }
    
    notificationsData.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationEl.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="fas ${notification.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${notification.time}</div>
            </div>
            ${!notification.read ? '<div class="notification-badge-dot"></div>' : ''}
        `;
        
        notificationEl.addEventListener('click', () => {
            markNotificationAsRead(notification.id);
            handleNotificationAction(notification);
        });
        
        notificationsContent.appendChild(notificationEl);
    });
}

function updateNotificationsBadge() {
    const unreadCount = notificationsData.filter(n => !n.read).length;
    const badge = document.getElementById('notificationsBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function markNotificationAsRead(notificationId) {
    const notification = notificationsData.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        saveNotifications();
        updateNotificationsBadge();
        loadNotifications();
    }
}

function handleNotificationAction(notification) {
    if (!notification.action) return;
    
    // Close notifications page
    closePage('notificacoes', false);
    
    setTimeout(() => {
        switch(notification.action.type) {
            case 'category':
                // Navigate to category
                if (notification.action.category === 'all') {
                    loadProducts('all');
                } else {
                    filterByCategory(notification.action.category);
                }
                // Switch to products page
                switchPage('produtos');
                break;
                
            case 'page':
                // Open specific page (e.g., Meus Pedidos)
                openPage(notification.action.page);
                break;
                
            case 'product':
                // If we have a specific product ID in the future
                if (notification.action.productId) {
                    // For now, just go to the category
                    if (notification.action.category) {
                        filterByCategory(notification.action.category);
                    }
                    switchPage('produtos');
                }
                break;
                
            default:
                break;
        }
    }, 300);
}

function markAllNotificationsAsRead() {
    let hasUnread = false;
    notificationsData.forEach(notification => {
        if (!notification.read) {
            notification.read = true;
            hasUnread = true;
        }
    });
    
    if (hasUnread) {
        saveNotifications();
        updateNotificationsBadge();
        loadNotifications();
        showToast('Todas as notificações foram marcadas como lidas', 'success');
    }
}

function saveNotifications() {
    localStorage.setItem('sportshop_notifications', JSON.stringify(notificationsData));
}

function addNotification(type, icon, title, message, action = null) {
    const newNotification = {
        id: Date.now(),
        type: type,
        icon: icon,
        title: title,
        message: message,
        time: 'Agora',
        read: false,
        action: action
    };
    
    notificationsData.unshift(newNotification);
    saveNotifications();
    updateNotificationsBadge();
    
    // Show browser notification if enabled
    const notificationsEnabled = localStorage.getItem('sportshop_notifications_enabled');
    if (notificationsEnabled === 'enabled' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>⚽</text></svg>'
        });
    }
}

// ===== PRODUCT DETAIL PAGE =====
let currentProduct = null;
let selectedVariant = null;
let selectedSize = null;
let productQuantity = 1;

function setupProductDetailPage() {
    const pages = ['productDetail'];
    
    pages.forEach(pageName => {
        const overlay = document.getElementById(`${pageName}Overlay`);
        const backBtn = document.getElementById(`${pageName}BackBtn`);
        
        if (overlay) {
            overlay.addEventListener('click', () => closePage(pageName, false));
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => closePage(pageName, false));
        }
    });
    
    const shareBtn = document.getElementById('productShareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareProduct);
    }
}

function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    selectedVariant = product.variants ? product.variants[0] : null;
    selectedSize = null;
    productQuantity = 1;
    
    renderProductDetail();
    openPage('productDetail');
}

function renderProductDetail() {
    const content = document.getElementById('productDetailContent');
    if (!content || !currentProduct) return;
    
    const images = [];
    if (currentProduct.variants && currentProduct.variants.length > 0) {
        currentProduct.variants.forEach(variant => {
            images.push(variant.image);
        });
    } else {
        images.push(currentProduct.image);
    }
    
    const currentImage = selectedVariant ? selectedVariant.image : currentProduct.image;
    
    let variantsHTML = '';
    if (currentProduct.variants && currentProduct.variants.length > 1) {
        variantsHTML = `
            <div class="product-variants">
                <span class="variant-label">Cor: ${selectedVariant ? selectedVariant.color : ''}</span>
                <div class="variant-colors">
                    ${currentProduct.variants.map((variant, index) => `
                        <div class="color-option ${selectedVariant === variant ? 'active' : ''}" 
                             style="background-color: ${variant.colorCode}"
                             onclick="selectVariant(${index})"
                             title="${variant.color}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Add sizes if product is clothing
    let sizesHTML = '';
    if (['camisas', 'jaquetas', 'calcoes'].includes(currentProduct.category)) {
        const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
        sizesHTML = `
            <div class="product-variants">
                <span class="variant-label">Tamanho:</span>
                <div class="variant-sizes">
                    ${sizes.map(size => `
                        <button class="size-option ${selectedSize === size ? 'active' : ''}"
                                onclick="selectSize('${size}')">
                            ${size}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (['tenis', 'chuteiras'].includes(currentProduct.category)) {
        const sizes = ['37', '38', '39', '40', '41', '42', '43', '44'];
        sizesHTML = `
            <div class="product-variants">
                <span class="variant-label">Tamanho:</span>
                <div class="variant-sizes">
                    ${sizes.map(size => `
                        <button class="size-option ${selectedSize === size ? 'active' : ''}"
                                onclick="selectSize('${size}')">
                            ${size}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="product-detail-images">
            <img src="${currentImage}" alt="${currentProduct.name}" class="product-main-image">
            ${images.length > 1 ? `
                <div class="product-image-indicators">
                    ${images.map((img, index) => `
                        <div class="image-indicator ${img === currentImage ? 'active' : ''}"
                             onclick="changeProductImage(${index})"></div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="product-detail-info">
            <h1 class="product-detail-title">${currentProduct.name}</h1>
            <div class="product-detail-price">R$ ${currentProduct.price.toFixed(2)}</div>
            <p class="product-detail-description">${currentProduct.description}</p>
            
            ${variantsHTML}
            ${sizesHTML}
            
            <div class="product-quantity">
                <span class="variant-label">Quantidade:</span>
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="decreaseQuantity()">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value" id="productQuantityValue">${productQuantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity()">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="product-actions">
            <button class="btn-add-to-cart" onclick="addToCartFromDetail()">
                <i class="fas fa-cart-plus"></i>
                Adicionar ao Carrinho
            </button>
            <button class="btn-buy-now" onclick="buyNowFromDetail()">
                <i class="fas fa-bolt"></i>
                Comprar Agora
            </button>
        </div>
    `;
}

function selectVariant(index) {
    if (currentProduct.variants) {
        selectedVariant = currentProduct.variants[index];
        renderProductDetail();
    }
}

function selectSize(size) {
    selectedSize = size;
    renderProductDetail();
}

function changeProductImage(index) {
    if (currentProduct.variants && currentProduct.variants[index]) {
        selectedVariant = currentProduct.variants[index];
        renderProductDetail();
    }
}

function increaseQuantity() {
    productQuantity++;
    document.getElementById('productQuantityValue').textContent = productQuantity;
}

function decreaseQuantity() {
    if (productQuantity > 1) {
        productQuantity--;
        document.getElementById('productQuantityValue').textContent = productQuantity;
    }
}

function addToCartFromDetail() {
    if (!currentProduct) return;
    
    // Validate size selection for clothing/shoes
    if (['camisas', 'jaquetas', 'calcoes', 'tenis', 'chuteiras'].includes(currentProduct.category)) {
        if (!selectedSize) {
            showToast('Por favor, selecione um tamanho', 'error');
            return;
        }
    }
    
    // Add to cart with selected options
    for (let i = 0; i < productQuantity; i++) {
        addToCart(currentProduct.id);
    }
    
    showToast(`${productQuantity}x ${currentProduct.name} adicionado ao carrinho!`, 'success');
    closePage('productDetail', false);
}

function buyNowFromDetail() {
    if (!currentProduct) return;
    
    // Validate size selection
    if (['camisas', 'jaquetas', 'calcoes', 'tenis', 'chuteiras'].includes(currentProduct.category)) {
        if (!selectedSize) {
            showToast('Por favor, selecione um tamanho', 'error');
            return;
        }
    }
    
    // Add to cart
    for (let i = 0; i < productQuantity; i++) {
        addToCart(currentProduct.id);
    }
    
    // Close detail and go to checkout
    closePage('productDetail', false);
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 300);
}

function shareProduct() {
    if (!currentProduct) return;
    
    if (navigator.share) {
        navigator.share({
            title: currentProduct.name,
            text: `Confira: ${currentProduct.name} - R$ ${currentProduct.price.toFixed(2)}`,
            url: window.location.href
        }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
        // Fallback: copy link
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado!', 'success');
    }
}

// Call setup when page loads
setupProductDetailPage();
