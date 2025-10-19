// Shopping Cart
let cart = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
});

// Load products into the grid
function loadProducts(filter = 'all') {
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

    // Apply price filter
    const priceFilter = document.getElementById('priceFilter').value;
    if (priceFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => {
            if (priceFilter === '0-100') return p.price <= 100;
            if (priceFilter === '100-300') return p.price > 100 && p.price <= 300;
            if (priceFilter === '300-500') return p.price > 300 && p.price <= 500;
            if (priceFilter === '500+') return p.price > 500;
            return true;
        });
    }

    // Apply sorting
    const sortOption = document.getElementById('sortSelect').value;
    if (sortOption === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render products
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get category display name
function getCategoryName(category) {
    const names = {
        'camisas': 'Camisas',
        'tenis': 'Tênis',
        'chuteiras': 'Chuteiras'
    };
    return names[category] || category;
}

// Setup event listeners
function setupEventListeners() {
    // Category navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const category = link.getAttribute('data-category');
            loadProducts(category);
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', () => {
        const activeCategory = document.querySelector('nav a.active').getAttribute('data-category');
        loadProducts(activeCategory);
    });

    // Filters
    document.getElementById('sortSelect').addEventListener('change', () => {
        const activeCategory = document.querySelector('nav a.active').getAttribute('data-category');
        loadProducts(activeCategory);
    });

    document.getElementById('priceFilter').addEventListener('change', () => {
        const activeCategory = document.querySelector('nav a.active').getAttribute('data-category');
        loadProducts(activeCategory);
    });

    // Cart modal
    document.getElementById('cartIcon').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', toggleCart);
    
    // Close cart when clicking outside
    document.getElementById('cartModal').addEventListener('click', (e) => {
        if (e.target.id === 'cartModal') {
            toggleCart();
        }
    });

    // Checkout
    document.getElementById('checkoutButton').addEventListener('click', checkout);
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
    
    // Show feedback
    showNotification('Produto adicionado ao carrinho!');
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCartToStorage();
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
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');

    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;

    // Update items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        checkoutButton.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.icon}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        checkoutButton.disabled = false;
    }
}

// Toggle cart modal
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    alert(`Pedido Finalizado!\n\nTotal de itens: ${itemCount}\nValor total: R$ ${total.toFixed(2)}\n\nObrigado pela sua compra!`);
    
    cart = [];
    updateCart();
    saveCartToStorage();
    toggleCart();
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

// Show notification
function showNotification(message) {
    // Simple alert for now - could be enhanced with a toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Scroll to products
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Add animation keyframes
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
`;
document.head.appendChild(style);
