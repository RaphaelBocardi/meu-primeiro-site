# SportShop - Loja Online de Artigos Esportivos

Uma loja online moderna e responsiva para venda de camisas, tênis e chuteiras esportivas.

## 🚀 Funcionalidades

### Catálogo de Produtos
- **24 produtos** divididos em 3 categorias:
  - 6 Camisas esportivas (R$ 119,90 - R$ 199,90)
  - 8 Tênis de corrida e casual (R$ 349,90 - R$ 999,90)
  - 10 Chuteiras de futebol (R$ 449,90 - R$ 1.199,90)

### Recursos Principais
- ✅ **Navegação por categorias** - Filtre produtos por Camisas, Tênis ou Chuteiras
- ✅ **Busca em tempo real** - Procure produtos por nome ou descrição
- ✅ **Filtros de preço** - 4 faixas de preço disponíveis
- ✅ **Ordenação** - Ordene por preço (menor/maior) ou nome
- ✅ **Carrinho de compras** - Adicione, remova e ajuste quantidades
- ✅ **Persistência** - Carrinho salvo automaticamente no navegador
- ✅ **Design responsivo** - Funciona perfeitamente em desktop e mobile
- ✅ **Notificações** - Feedback visual ao adicionar produtos

## 📁 Estrutura do Projeto

```
Meu site/
├── index.html       # Página principal
├── styles.css       # Estilos e design responsivo
├── script.js        # Funcionalidades do carrinho e interações
├── products.js      # Base de dados dos produtos
└── README.md        # Esta documentação
```

## 🎯 Como Usar

### Opção 1: Abrir diretamente no navegador
1. Navegue até a pasta `Meu site`
2. Clique duas vezes no arquivo `index.html`
3. O site abrirá no seu navegador padrão

### Opção 2: Usar um servidor local (recomendado)
Para melhor experiência, use um servidor local:

**Com Python:**
```bash
cd "C:\Users\Raphael\Desktop\Meu site"
python -m http.server 8000
```
Depois acesse: http://localhost:8000

**Com VS Code:**
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

## 🛒 Funcionalidades do Carrinho

### Adicionar Produtos
- Clique no botão de carrinho em qualquer produto
- Uma notificação verde confirmará a adição

### Gerenciar Carrinho
1. Clique no ícone do carrinho no topo da página
2. Use os botões **+** e **-** para ajustar quantidades
3. Clique no ícone de lixeira para remover itens
4. O total é calculado automaticamente

### Finalizar Compra
1. Clique em "Finalizar Compra" no carrinho
2. Um resumo do pedido será exibido
3. O carrinho será limpo após confirmação

## 🎨 Personalização

### Alterar Cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
    --primary-color: #2563eb;    /* Cor principal */
    --secondary-color: #1e40af;  /* Cor secundária */
    --success-color: #10b981;    /* Cor de sucesso */
    --danger-color: #ef4444;     /* Cor de perigo */
}
```

### Adicionar Produtos
Edite o arquivo `products.js` e adicione novos produtos:
```javascript
{
    id: 25,
    name: "Nome do Produto",
    category: "camisas", // ou "tenis" ou "chuteiras"
    price: 199.90,
    description: "Descrição do produto",
    icon: "👕" // ou "👟" ou "⚽"
}
```

### Adicionar Imagens Reais
Substitua os ícones por imagens:
1. Crie uma pasta `images` no projeto
2. Adicione suas imagens de produtos
3. Em `products.js`, substitua `icon` por `image`:
   ```javascript
   image: "images/produto1.jpg"
   ```
4. Em `script.js`, altere onde aparece `${product.icon}` por:
   ```javascript
   <img src="${product.image}" alt="${product.name}">
   ```

## 🌟 Recursos Técnicos

- **HTML5 Semântico** - Estrutura clara e acessível
- **CSS3 Moderno** - Flexbox, Grid, variáveis CSS
- **JavaScript ES6+** - Arrow functions, template literals, spread operator
- **LocalStorage API** - Persistência de dados do carrinho
- **Responsive Design** - Media queries para diferentes tamanhos de tela
- **Font Awesome** - Ícones profissionais

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Dispositivos móveis (iOS/Android)

## 🔧 Próximas Melhorias Sugeridas

1. **Backend Integration** - Conectar a um servidor real
2. **Sistema de Pagamento** - Integrar Stripe, PayPal ou MercadoPago
3. **Autenticação** - Login e cadastro de usuários
4. **Gerenciamento de Estoque** - Controle de quantidade disponível
5. **Avaliações** - Sistema de reviews e ratings
6. **Wishlist** - Lista de desejos
7. **Cupons de Desconto** - Sistema promocional
8. **Múltiplas Imagens** - Galeria de fotos por produto
9. **Rastreamento** - Acompanhamento de pedidos
10. **E-mail Marketing** - Newsletter e confirmações

## 💡 Dicas de Uso

- **Pesquisa Rápida**: Use a barra de busca para encontrar produtos específicos
- **Comparação**: Navegue entre categorias para comparar preços
- **Mobile**: O site é totalmente responsivo - teste no celular!
- **Carrinho Persistente**: Seu carrinho é salvo mesmo se fechar o navegador
- **Filtros Combinados**: Use busca + filtro de preço + ordenação juntos

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.

## 🤝 Suporte

Para dúvidas ou sugestões, entre em contato através do e-mail: contato@sportshop.com

---

**Desenvolvido com ❤️ para SportShop** 
*Versão 1.0 - Outubro 2025*
