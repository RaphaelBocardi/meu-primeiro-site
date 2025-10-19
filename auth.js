// Authentication System

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPhotoUpload();
    }
});

// Check authentication state
function checkAuthState() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        updateUIForLoggedInUser(currentUser);
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const userJSON = localStorage.getItem('sportshop_current_user');
    return userJSON ? JSON.parse(userJSON) : null;
}

// Get all users from localStorage
function getAllUsers() {
    const usersJSON = localStorage.getItem('sportshop_users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('sportshop_users', JSON.stringify(users));
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem('sportshop_current_user', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('sportshop_remember', 'true');
        }
        
        showToastMessage('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showToastMessage('Email ou senha incorretos!', 'error');
    }
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validation
    if (!acceptTerms) {
        showToastMessage('Você precisa aceitar os termos de uso!', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToastMessage('As senhas não coincidem!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToastMessage('A senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }
    
    // Check if email already exists
    const users = getAllUsers();
    if (users.some(u => u.email === email)) {
        showToastMessage('Este email já está cadastrado!', 'error');
        return;
    }
    
    // Get photo if uploaded
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const photo = photoPreviewImg && photoPreviewImg.src !== '' ? photoPreviewImg.src : null;
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        photo,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    showToastMessage('Conta criada com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Setup photo upload
function setupPhotoUpload() {
    const photoInput = document.getElementById('profilePhoto');
    const photoPreview = document.getElementById('photoPreview');
    const photoPreviewImg = document.getElementById('photoPreviewImg');
    const removePhotoBtn = document.getElementById('removePhoto');
    
    if (!photoInput) return;
    
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToastMessage('A foto deve ter no máximo 5MB!', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreviewImg.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', () => {
            photoInput.value = '';
            photoPreviewImg.src = '';
            photoPreview.style.display = 'none';
        });
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const userIconDefault = document.getElementById('userIconDefault');
    const userAvatar = document.getElementById('userAvatar');
    const sidebarLogin = document.getElementById('sidebarLogin');
    const sidebarRegister = document.getElementById('sidebarRegister');
    const sidebarLogout = document.getElementById('sidebarLogout');
    
    if (userIconDefault && userAvatar && user.photo) {
        userIconDefault.style.display = 'none';
        userAvatar.src = user.photo;
        userAvatar.style.display = 'block';
    }
    
    if (sidebarLogin) sidebarLogin.style.display = 'none';
    if (sidebarRegister) sidebarRegister.style.display = 'none';
    if (sidebarLogout) {
        sidebarLogout.style.display = 'block';
        sidebarLogout.addEventListener('click', handleLogout);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('sportshop_current_user');
    localStorage.removeItem('sportshop_remember');
    showToastMessage('Logout realizado com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show toast message (simple version for auth pages)
function showToastMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                color: var(--secondary-color);
                padding: 1rem 1.5rem;
                border-radius: 0;
                border-left: 3px solid;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 280px;
            }
            .toast-success { border-left-color: #28a745; }
            .toast-success i { color: #28a745; }
            .toast-error { border-left-color: #dc3545; }
            .toast-error i { color: #dc3545; }
            .toast-info { border-left-color: #000000; }
            .toast-info i { color: #000000; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
