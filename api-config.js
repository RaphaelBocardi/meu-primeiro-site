// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Função para buscar produtos da API
async function fetchProductsFromAPI() {
    try {
        const response = await fetch(`${API_URL}/products?active=true`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }
        
        const products = await response.json();
        
        // Transformar produtos da API para o formato esperado pelo site
        return products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            image: product.images && product.images.length > 0 
                ? `http://localhost:3000${product.images[0]}` 
                : product.image || '',
            images: product.images || [product.image],
            icon: getCategoryIcon(product.category),
            variants: product.variants || []
        }));
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        // Se a API falhar, retorna array vazio
        // Você pode descomentar a linha abaixo para usar produtos locais como fallback
        // return products;
        return [];
    }
}

// Função para buscar categorias da API
async function fetchCategoriesFromAPI() {
    try {
        const response = await fetch(`${API_URL}/categories?active=true`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar categorias');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
}

// Mapear emojis para categorias
function getCategoryIcon(category) {
    const icons = {
        'tenis': '👟',
        'camisa': '👕',
        'camisas': '👕',
        'shorts': '🩳',
        'jaqueta': '🧥',
        'jaquetas': '🧥',
        'bone': '🧢',
        'meia': '🧦',
        'acessorio': '🎒',
        'acessorios': '🎒',
        'chuteiras': '⚽',
        'calcoes': '🏃'
    };
    
    return icons[category.toLowerCase()] || '🛍️';
}

// Exportar funções
window.fetchProductsFromAPI = fetchProductsFromAPI;
window.fetchCategoriesFromAPI = fetchCategoriesFromAPI;
