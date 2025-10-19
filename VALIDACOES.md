# 📋 Guia de Validações Implementadas

## ✅ Validação de CPF

### Como Funciona
O sistema valida CPF usando o algoritmo oficial brasileiro com verificação de dígitos verificadores.

### Validações Aplicadas
- ✓ Deve ter exatamente 11 dígitos
- ✓ Não pode ter todos os dígitos iguais (ex: 111.111.111-11)
- ✓ Valida os dois dígitos verificadores

### Feedback Visual
- 🟢 **Borda Verde**: CPF válido
- 🔴 **Borda Vermelha**: CPF inválido
- ⚪ **Sem cor**: Ainda digitando

### Onde está aplicado
- Formulário de Cadastro
- Página "Meu Perfil"

### Exemplos de CPF Válidos para Teste
```
123.456.789-09 (válido)
111.444.777-35 (válido)
```

---

## 💳 Validação de Cartão de Crédito

### Funções Disponíveis

#### 1. `validateCreditCard(cardNumber)`
Valida o número do cartão usando o **Algoritmo de Luhn** (padrão internacional).

**Exemplo de uso:**
```javascript
// No seu código, ao adicionar um cartão:
const numeroCartao = document.getElementById('numeroCartao').value;

if (!validateCreditCard(numeroCartao)) {
    showToast('Número de cartão inválido!', 'error');
    return;
}
```

#### 2. `detectCardBrand(cardNumber)`
Detecta a bandeira do cartão automaticamente.

**Bandeiras Suportadas:**
- Visa
- Mastercard
- American Express
- Elo (Brasil)
- Hipercard (Brasil)
- Diners Club
- Discover
- JCB

**Exemplo de uso:**
```javascript
const numeroCartao = '4111111111111111';
const bandeira = detectCardBrand(numeroCartao);
console.log(bandeira); // "Visa"
```

#### 3. `validateCVV(cvv, cardBrand)`
Valida o código de segurança (CVV/CVC).

**Regras:**
- American Express: 4 dígitos
- Outras bandeiras: 3 dígitos

**Exemplo de uso:**
```javascript
const cvv = '123';
const bandeira = 'Visa';

if (!validateCVV(cvv, bandeira)) {
    showToast('CVV inválido!', 'error');
    return;
}
```

#### 4. `validateExpiryDate(month, year)`
Valida a data de validade do cartão.

**Regras:**
- Mês deve estar entre 1 e 12
- Cartão não pode estar vencido

**Exemplo de uso:**
```javascript
const mes = '12';
const ano = '25'; // 2025

if (!validateExpiryDate(mes, ano)) {
    showToast('Cartão vencido ou data inválida!', 'error');
    return;
}
```

---

## 🎯 Exemplo Completo: Formulário de Pagamento

```html
<!-- Adicione este HTML na página de Métodos de Pagamento -->
<div class="form-group">
    <label>Número do Cartão</label>
    <input type="text" id="numeroCartao" placeholder="0000 0000 0000 0000" maxlength="19">
    <small id="bandeira" style="color: #28a745; font-weight: 600;"></small>
</div>

<div class="form-row">
    <div class="form-group">
        <label>Validade (Mês)</label>
        <input type="text" id="mesValidade" placeholder="MM" maxlength="2">
    </div>
    <div class="form-group">
        <label>Validade (Ano)</label>
        <input type="text" id="anoValidade" placeholder="AA" maxlength="2">
    </div>
    <div class="form-group">
        <label>CVV</label>
        <input type="text" id="cvv" placeholder="123" maxlength="4">
    </div>
</div>

<button onclick="adicionarCartao()">Adicionar Cartão</button>
```

```javascript
// Adicione este JavaScript
function adicionarCartao() {
    const numeroCartao = document.getElementById('numeroCartao').value;
    const mesValidade = document.getElementById('mesValidade').value;
    const anoValidade = document.getElementById('anoValidade').value;
    const cvv = document.getElementById('cvv').value;
    
    // Validar número do cartão
    if (!validateCreditCard(numeroCartao)) {
        showToast('Número de cartão inválido!', 'error');
        return;
    }
    
    // Detectar bandeira
    const bandeira = detectCardBrand(numeroCartao);
    if (bandeira === 'Desconhecido') {
        showToast('Bandeira de cartão não reconhecida!', 'error');
        return;
    }
    
    // Validar data de validade
    if (!validateExpiryDate(mesValidade, anoValidade)) {
        showToast('Cartão vencido ou data de validade inválida!', 'error');
        return;
    }
    
    // Validar CVV
    if (!validateCVV(cvv, bandeira)) {
        showToast('CVV inválido para esta bandeira!', 'error');
        return;
    }
    
    // Tudo válido! Salvar o cartão
    const cartao = {
        numero: numeroCartao.slice(-4), // Salvar apenas os 4 últimos dígitos
        bandeira: bandeira,
        validade: `${mesValidade}/${anoValidade}`
    };
    
    showToast(`Cartão ${bandeira} adicionado com sucesso!`, 'success');
}

// Feedback em tempo real da bandeira
document.getElementById('numeroCartao').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Formatar número do cartão (0000 0000 0000 0000)
    if (value.length > 0) {
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formatted;
    }
    
    // Detectar e mostrar bandeira
    if (value.length >= 4) {
        const bandeira = detectCardBrand(value);
        document.getElementById('bandeira').textContent = bandeira;
    } else {
        document.getElementById('bandeira').textContent = '';
    }
    
    // Validação visual quando completo
    if (value.length >= 13) {
        if (validateCreditCard(value)) {
            e.target.style.borderColor = '#28a745';
        } else {
            e.target.style.borderColor = '#dc3545';
        }
    } else {
        e.target.style.borderColor = '';
    }
});
```

---

## 🧪 Números de Cartão para Teste

### Válidos (Algoritmo de Luhn)
```
Visa: 4111111111111111
Mastercard: 5555555555554444
American Express: 378282246310005
Elo: 4011111111111112
```

### Inválidos
```
1234567890123456 (não passa no Luhn)
0000000000000000 (inválido)
```

---

## ⚠️ Segurança

**IMPORTANTE:** 
- ❌ **NUNCA** salve o número completo do cartão
- ❌ **NUNCA** salve o CVV
- ✅ Salve apenas os 4 últimos dígitos
- ✅ Use HTTPS em produção
- ✅ Considere usar serviços de pagamento como Stripe, PagSeguro, Mercado Pago

---

## 📞 Suporte

Todas as funções de validação estão no arquivo `script.js` no início do código.

Para dúvidas ou problemas, verifique o console do navegador (F12).
