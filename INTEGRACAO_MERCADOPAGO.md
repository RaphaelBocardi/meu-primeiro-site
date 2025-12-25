# 🔗 Como Integrar o Checkout Pro do Mercado Pago

## O que é o Checkout Pro?

O **Checkout Pro** é a solução completa de pagamento do Mercado Pago, igual ao usado na Nuvemshop. Ele funciona como um **processador de pagamentos** onde o Mercado Pago cuida de:

- ✅ Processamento de cartões
- ✅ PIX instantâneo
- ✅ Boleto bancário
- ✅ Validações de segurança
- ✅ Detecção de fraudes
- ✅ Interface responsiva e confiável

## Diferenças: Modo Atual vs Checkout Pro

### **Modo Atual (Demonstração)**
- ❌ Não processa pagamentos reais
- ❌ Apenas simulação visual
- ❌ Sem integração bancária
- ✅ Ótimo para testar layout

### **Checkout Pro (Produção)**
- ✅ Pagamentos reais processados
- ✅ Integração completa com bancos
- ✅ Gateway de pagamento profissional
- ✅ Webhooks para notificações
- ✅ Dashboard de vendas

---

## 📋 Passo a Passo para Integração

### **1. Criar Conta no Mercado Pago**

1. Acesse: https://www.mercadopago.com.br/developers
2. Crie sua conta de desenvolvedor
3. Acesse o Dashboard de Desenvolvedores

### **2. Obter Credenciais**

No painel do Mercado Pago:
- Vá em **Credenciais**
- Copie sua **Public Key** (começa com `APP_USR-...`)
- Copie seu **Access Token** (começa com `APP_USR-...`)

**⚠️ IMPORTANTE:** Use as credenciais de **PRODUÇÃO** para pagamentos reais!

### **3. Instalar SDK do Mercado Pago**

Já está instalado no seu `checkout.html`:
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### **4. Configurar no Backend**

Você precisará criar endpoints no seu backend (`backend/src/`) para:

#### **a) Criar Preferência de Pagamento**

Crie o arquivo: `backend/src/controllers/mercadopagoController.js`

```javascript
const mercadopago = require('mercadopago');

// Configurar credenciais
mercadopago.configure({
  access_token: 'SEU_ACCESS_TOKEN_AQUI'
});

// Criar preferência de pagamento
async function createPaymentPreference(req, res) {
  try {
    const { items, payer } = req.body;

    const preference = {
      items: items.map(item => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'BRL'
      })),
      payer: {
        name: payer.name,
        email: payer.email,
        identification: {
          type: 'CPF',
          number: payer.cpf
        }
      },
      back_urls: {
        success: 'https://seusite.com/pagamento-aprovado',
        failure: 'https://seusite.com/pagamento-falhou',
        pending: 'https://seusite.com/pagamento-pendente'
      },
      auto_return: 'approved',
      notification_url: 'https://seusite.com/api/mercadopago/webhook'
    };

    const response = await mercadopago.preferences.create(preference);
    
    res.json({
      id: response.body.id,
      init_point: response.body.init_point
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
}

module.exports = { createPaymentPreference };
```

#### **b) Criar Rota no Backend**

Em `backend/src/routes/mercadopago.js`:

```javascript
const express = require('express');
const router = express.Router();
const { createPaymentPreference } = require('../controllers/mercadopagoController');

router.post('/create-preference', createPaymentPreference);

module.exports = router;
```

Adicione em `backend/src/server.js`:
```javascript
const mercadopagoRoutes = require('./routes/mercadopago');
app.use('/api/mercadopago', mercadopagoRoutes);
```

### **5. Atualizar Frontend (checkout.html)**

Substitua a função `processPayment()`:

```javascript
async function processPayment() {
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerCPF = document.getElementById('customerCPF').value;
    const customerPhone = document.getElementById('customerPhone').value;
    
    if (!customerName || !customerEmail || !customerCPF || !customerPhone) {
        alert('⚠️ Por favor, preencha todos os dados pessoais.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Validar endereço
    const cep = document.getElementById('cep').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;

    if (!cep || !street || !number || !neighborhood || !city || !state) {
        alert('⚠️ Por favor, preencha todos os dados de endereço.');
        document.getElementById('cep').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Obter carrinho
    const savedCart = localStorage.getItem('sportshop_cart');
    const cart = JSON.parse(savedCart);

    // Criar preferência no backend
    try {
        const response = await fetch('http://localhost:3000/api/mercadopago/create-preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                payer: {
                    name: customerName,
                    email: customerEmail,
                    cpf: customerCPF.replace(/\D/g, ''),
                    phone: customerPhone
                }
            })
        });

        const data = await response.json();

        // Redirecionar para o Checkout Pro do Mercado Pago
        window.location.href = data.init_point;
        
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('❌ Erro ao processar pagamento. Tente novamente.');
    }
}
```

### **6. Configurar Webhooks (Notificações)**

Crie `backend/src/controllers/webhookController.js`:

```javascript
async function handleMercadoPagoWebhook(req, res) {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar detalhes do pagamento
            const payment = await mercadopago.payment.findById(paymentId);
            
            // Atualizar pedido no banco de dados
            if (payment.body.status === 'approved') {
                // Pedido aprovado - enviar email, atualizar estoque, etc.
                console.log('✅ Pagamento aprovado:', paymentId);
            } else if (payment.body.status === 'rejected') {
                // Pedido rejeitado
                console.log('❌ Pagamento rejeitado:', paymentId);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Erro');
    }
}

module.exports = { handleMercadoPagoWebhook };
```

Configure a rota do webhook:
```javascript
router.post('/webhook', handleMercadoPagoWebhook);
```

### **7. Configurar URL do Webhook no Mercado Pago**

No painel do Mercado Pago:
1. Vá em **Webhooks**
2. Adicione a URL: `https://seusite.com/api/mercadopago/webhook`
3. Selecione eventos: **Pagamentos**

---

## 🚀 Fluxo Completo de Pagamento

```
1. Cliente adiciona produtos ao carrinho
   ↓
2. Cliente preenche dados no checkout
   ↓
3. Frontend envia dados para o backend
   ↓
4. Backend cria preferência no Mercado Pago
   ↓
5. Backend retorna link do Checkout Pro
   ↓
6. Cliente é redirecionado para o Checkout Pro
   ↓
7. Cliente escolhe forma de pagamento (PIX/Cartão/Boleto)
   ↓
8. Mercado Pago processa o pagamento
   ↓
9. Webhook notifica o backend sobre o status
   ↓
10. Backend atualiza pedido e envia email
   ↓
11. Cliente retorna para página de sucesso
```

---

## 💡 Vantagens do Checkout Pro

- ✅ **Zero fraudes**: Mercado Pago cuida da segurança
- ✅ **Mobile otimizado**: Interface adaptada para celular
- ✅ **Múltiplas bandeiras**: Todas as bandeiras de cartão
- ✅ **PIX instantâneo**: Confirmação em segundos
- ✅ **Boleto automático**: Geração e envio por email
- ✅ **Parcelamento**: Até 12x automático
- ✅ **Dashboard completo**: Acompanhe todas as vendas
- ✅ **Certificação PCI**: Segurança bancária

---

## 📊 Custos do Mercado Pago

### Taxas por Transação:
- **PIX**: 0,99%
- **Boleto**: R$ 3,49 por transação
- **Cartão de Crédito**: 4,99% + parcelas (conforme tabela)
- **Débito**: 3,99%

### Recebimento:
- **Na hora**: Taxas da tabela que você enviou
- **Em 14 dias**: Taxas menores
- **Em 30 dias**: Taxas ainda menores

---

## 🔒 Segurança

O Checkout Pro é **certificado PCI DSS**, o mais alto padrão de segurança em pagamentos. Isso significa:

- ✅ Dados do cartão **nunca** passam pelo seu servidor
- ✅ Criptografia de ponta a ponta
- ✅ Tokenização de dados sensíveis
- ✅ Proteção contra fraudes com IA
- ✅ 3D Secure para cartões

---

## 📞 Próximos Passos

1. **Criar conta no Mercado Pago Developers**
2. **Obter credenciais (Public Key e Access Token)**
3. **Instalar SDK no backend**: `npm install mercadopago`
4. **Implementar os endpoints acima**
5. **Testar com credenciais de teste**
6. **Ativar credenciais de produção**
7. **Configurar webhooks**
8. **Fazer primeira venda! 🎉**

---

## 🆘 Suporte

- **Documentação oficial**: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing
- **Suporte Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Community**: https://www.mercadopago.com.br/developers/pt/community

---

## ⚠️ Nota Importante

Para usar em **produção**, você precisa:
1. Ter uma conta verificada no Mercado Pago
2. Fornecer documentos da empresa
3. Aguardar aprovação do Mercado Pago
4. Usar credenciais de produção (não de teste)

O processo de aprovação leva de 1 a 3 dias úteis.
