# 💳 Sistema de Pagamentos - SportShop

## 🎯 Fluxo de Pagamento Completo

### 1️⃣ Checkout Inicial (`checkout.html`)
O cliente preenche seus dados pessoais e de endereço, escolhe o método de pagamento:
- 💚 **PIX** (5% de desconto)
- 💳 **Cartão de Crédito** (1x a 12x com juros)
- 🧾 **Boleto Bancário**

### 2️⃣ Páginas de Pagamento Dedicadas

#### 💚 PIX (`pagamento-pix.html`)
**Funcionalidades:**
- ✅ QR Code visual gerado automaticamente
- 📋 Código PIX Copia e Cola
- ⏱️ Timer de 5 minutos para expiração
- 🔄 Verificação automática de pagamento a cada 5 segundos
- ✓ Botão para confirmar pagamento manualmente
- 🏠 Opção de voltar ao início

**Comportamento:**
1. Cliente preenche dados e clica em "Confirmar"
2. É redirecionado para página dedicada do PIX
3. QR Code e código são exibidos
4. Sistema verifica pagamento automaticamente em background
5. Quando PIX é pago, redireciona automaticamente para página de sucesso
6. Não precisa esperar os 5 minutos se pagar antes
7. Não precisa clicar em confirmar se o sistema detectar o pagamento

**Verificação Automática:**
```javascript
// Verifica a cada 5 segundos
checkInterval = setInterval(autoCheckPayment, 5000);

// Quando pagamento detectado, redireciona instantaneamente
if (result.paid) {
    window.location.href = 'pagamento-sucesso.html';
}
```

#### 🧾 Boleto (`pagamento-boleto.html`)
**Funcionalidades:**
- ✅ Confirmação de envio por e-mail
- 📊 Código de barras para pagamento
- 📋 Botão para copiar código
- 🖨️ Opção de imprimir boleto
- 📧 E-mail automático com o boleto
- 🏠 Opção de voltar ao início

**Comportamento:**
1. Cliente escolhe boleto e clica em "Confirmar"
2. É redirecionado para página dedicada do boleto
3. Boleto é exibido com código de barras
4. E-mail é enviado automaticamente com o PDF
5. Cliente pode copiar código ou imprimir
6. Vencimento em 3 dias úteis
7. Confirmação do pagamento em até 2 dias após pagamento

**Envio de E-mail:**
```javascript
// Backend envia e-mail automaticamente
POST /api/payments/send-boleto-email
{
    email: "cliente@email.com",
    customerName: "Nome do Cliente",
    orderId: "123456",
    amount: 299.90,
    barcode: "23793.38128...",
    dueDate: "27/12/2024"
}
```

#### 💳 Cartão de Crédito
**Funcionalidades:**
- 💳 Formulário de cartão integrado
- 💰 Parcelamento de 1x a 12x
- ⏳ Processamento em tempo real
- ✅ Confirmação instantânea
- 🔒 Dados seguros (PCI Compliance)

**Comportamento:**
1. Cliente preenche dados do cartão
2. Seleciona número de parcelas
3. Clica em "Confirmar"
4. Sistema processa pagamento (3 segundos)
5. Se aprovado: redireciona para página de sucesso
6. Se recusado: exibe mensagem de erro e mantém na página
7. **SOMENTE** redireciona quando pagamento for confirmado pelo sistema

**Validações:**
```javascript
// Verifica status do pagamento antes de prosseguir
if (result.approved) {
    window.location.href = 'pagamento-sucesso.html';
} else {
    alert('❌ Pagamento recusado');
    // Mantém na página para nova tentativa
}
```

### 3️⃣ Página de Sucesso (`pagamento-sucesso.html`)
**Exibido apenas quando:**
- ✅ PIX foi confirmado pelo sistema
- ✅ Cartão foi aprovado pelo processador
- ✅ Status mudou para "PAGAMENTO CONFIRMADO"

**Funcionalidades:**
- 🎉 Animação de confetes
- ✅ Confirmação visual do pedido
- 📧 Notificação de e-mail enviado
- 📦 Número do pedido
- 💰 Valor total e método de pagamento
- 🏠 Botão para continuar comprando
- 📦 Link para acompanhar pedidos

## 🔄 Verificação Automática de Pagamentos

### PIX - Verificação em Background
```javascript
// Verificação silenciosa a cada 5 segundos
async function autoCheckPayment() {
    const response = await fetch('/api/payments/check-pix', {
        method: 'POST',
        body: JSON.stringify({
            pixCode: sessionStorage.getItem('pix_code'),
            orderId: paymentData.orderId
        })
    });

    const result = await response.json();

    // Redireciona automaticamente quando detectado
    if (result.paid) {
        clearInterval(checkInterval);
        clearInterval(timerInterval);
        window.location.href = 'pagamento-sucesso.html';
    }
}
```

### Cartão - Verificação Instantânea
```javascript
// Processa e aguarda resposta do gateway
const response = await fetch('/api/payments/process-card', {
    method: 'POST',
    body: JSON.stringify(paymentData)
});

const result = await response.json();

// Só prossegue se aprovado
if (result.approved) {
    window.location.href = 'pagamento-sucesso.html';
}
```

## 📧 Sistema de E-mails

### Boleto
**Enviado para:** E-mail informado no checkout
**Conteúdo:**
- PDF do boleto anexado
- Código de barras no corpo do e-mail
- Data de vencimento
- Instruções de pagamento
- Link para visualizar online

### Confirmação de Pagamento
**Enviado para:** E-mail informado no checkout
**Quando:** Após pagamento confirmado
**Conteúdo:**
- Número do pedido
- Itens comprados
- Valor total pago
- Método de pagamento
- Prazo de entrega
- Código de rastreamento (quando disponível)

## 🔐 Segurança

### Dados Sensíveis
- ✅ Cartões processados pelo Mercado Pago (PCI Compliance)
- ✅ Dados criptografados em trânsito (HTTPS)
- ✅ Nenhum dado de cartão armazenado no servidor
- ✅ Tokens temporários para PIX

### Validações
- ✅ CPF validado no backend
- ✅ CEP validado via ViaCEP
- ✅ E-mail validado com regex
- ✅ Valores calculados no servidor (não confia no frontend)

## 🎨 Experiência do Usuário

### Design
- 📱 Totalmente responsivo (mobile-first)
- 🎨 Cores específicas por método (Verde=PIX, Laranja=Boleto, Azul=Cartão)
- ✨ Animações suaves e feedback visual
- ⚡ Carregamento rápido com spinners
- 🎉 Confetes na confirmação

### Feedback Visual
- ✓ Estados de loading claros
- ✓ Mensagens de sucesso/erro
- ✓ Progresso do pagamento
- ✓ Timer visível (PIX)
- ✓ Botões com estados (loading, disabled, success)

## 🚀 Integração Backend

### Endpoints Necessários

#### 1. Verificar PIX
```
POST /api/payments/check-pix
Body: { pixCode, orderId }
Response: { paid: boolean, orderId: string }
```

#### 2. Processar Cartão
```
POST /api/payments/process-card
Body: { paymentData, cardData }
Response: { approved: boolean, transactionId: string }
```

#### 3. Enviar E-mail Boleto
```
POST /api/payments/send-boleto-email
Body: { email, customerName, orderId, amount, barcode, dueDate }
Response: { success: boolean, email: string }
```

#### 4. Webhook Mercado Pago
```
POST /api/payments/mercadopago-webhook
Body: { type: 'payment', data: { id: paymentId } }
Response: 200 OK
```

### Exemplo de Implementação

Ver arquivo: `backend/src/routes/payments.js`

## 📝 Próximos Passos

### Para Produção:
1. ✅ Integrar Mercado Pago real (credenciais de produção)
2. ✅ Configurar serviço de e-mail (SendGrid, AWS SES)
3. ✅ Implementar webhooks para notificações
4. ✅ Adicionar logs de auditoria
5. ✅ Configurar monitoramento de erros
6. ✅ Implementar retry logic para pagamentos
7. ✅ Adicionar página de acompanhamento de pedidos

### Melhorias Futuras:
- 🔔 Notificações push quando pagamento confirmado
- 📱 App mobile nativo
- 💬 Chat de suporte durante pagamento
- 🎁 Cupons de desconto
- 💰 Cashback em compras
- 🔄 Assinatura recorrente
- 🌎 Pagamento internacional

## 🎯 Resumo do Fluxo

```
CHECKOUT → ESCOLHE MÉTODO → PÁGINA DEDICADA → VERIFICA PAGAMENTO → SUCESSO
    ↓                            ↓                      ↓              ↓
Dados      PIX/Boleto/Cartão   QR/Boleto/Form    Auto ou Manual    Confetes
Pessoais                                                            + E-mail
Endereço                                                            + Carrinho
Método                                                              Limpo
```

**Características principais:**
- ✅ Cada método tem sua própria página
- ✅ Verificação automática em background (PIX)
- ✅ Confirmação manual disponível
- ✅ E-mails automáticos
- ✅ Só redireciona quando pagamento CONFIRMADO
- ✅ Design profissional tipo Diogo305/Nuvemshop
- ✅ Timer de 5min (PIX não precisa esperar)
- ✅ Boleto enviado por e-mail automaticamente

---

✨ **Sistema completo e profissional de pagamentos implementado!**
