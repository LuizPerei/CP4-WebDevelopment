document.addEventListener('DOMContentLoaded', () => {
    fetch('configuracoes.json')
        .then(response => response.json())
        .then(data => {
            inicializarPagina(data.produtos);
            adicionarEventosSidebar(data.sidebar);
            atualizarCarrinho();
            adicionarEventosFiltro();
        })
        .catch(error => console.error('Erro ao carregar a configuração:', error));

    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', () => {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            mostrarSpinner(); 
            finalizarCompra(carrinho)
                .finally(() => esconderSpinner()); 
        });
    }
});

function mostrarSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

function esconderSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

function criarProduto(nome, preco, imagem) {
    const div = document.createElement('div');
    div.className = 'produto';
    
    const img = document.createElement('img');
    img.src = `img/${imagem}`;
    img.alt = nome;
    
    img.onerror = () => {
        img.src = 'img/default.jpg'; 
        img.alt = 'Imagem não disponível';
    };
    
    div.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = nome;
    div.appendChild(h3);
    
    const p = document.createElement('p');
    p.textContent = `R$ ${preco.toFixed(2)}`;
    div.appendChild(p);
    
    const button = document.createElement('button');
    button.className = 'adicionar';
    button.textContent = 'Adicionar ao Carrinho';
    button.addEventListener('click', () => adicionarAoCarrinho(nome, preco));
    div.appendChild(button);
    
    return div;
}

function adicionarAoCarrinho(nome, preco) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const produto = { nome, preco };

    const produtoExistente = carrinho.find(p => p.nome === nome);
    if (produtoExistente) {
        produtoExistente.preco += preco;
    } else {
        carrinho.push(produto);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const carrinhoDiv = document.getElementById('carrinho');
    carrinhoDiv.innerHTML = ''; 

    if (carrinho.length === 0) {
        carrinhoDiv.innerHTML = 'Carrinho vazio';
        return;
    }

    let total = 0;
    carrinho.forEach((produto, index) => {
        total += produto.preco;

        const produtoDiv = document.createElement('div');
        produtoDiv.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
        
        const removerBtn = document.createElement('button');
        removerBtn.textContent = 'Remover';
        removerBtn.className = 'remover';
        removerBtn.addEventListener('click', () => removerDoCarrinho(index));

        produtoDiv.appendChild(removerBtn);
        carrinhoDiv.appendChild(produtoDiv);
    });

    const totalDiv = document.createElement('div');
    totalDiv.textContent = `Total: R$ ${total.toFixed(2)}`;
    carrinhoDiv.appendChild(totalDiv);
}

function removerDoCarrinho(index) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    carrinho.splice(index, 1);

    localStorage.setItem('carrinho', JSON.stringify(carrinho));

    atualizarCarrinho();
}

function inicializarPagina(produtos) {
    const produtosDiv = document.getElementById('produtos');
    produtosDiv.innerHTML = ''; 

    // Armazenar produtos no localStorage para acesso futuro ao aplicar filtros
    localStorage.setItem('produtos', JSON.stringify(produtos));

    produtos.forEach(produto => {
        produtosDiv.appendChild(criarProduto(produto.nome, produto.preco, produto.imagem));
    });

    atualizarCarrinho(); 
}

function adicionarEventosSidebar(config) {
    const toggleButton = document.getElementById(config.toggleButtonId);
    const sidebar = document.getElementById(config.sidebarId);
    const closeButton = document.getElementById(config.closeButtonId);

    if (toggleButton && sidebar && closeButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        closeButton.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    } else {
        console.error('Elementos do sidebar não encontrados.');
    }
}

function validarDados(carrinho) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (carrinho.length > 0) {
                resolve("Dados validados com sucesso.");
            } else {
                reject("Erro: O carrinho está vazio.");
            }
        }, 1000); 
    });
}

function confirmarPedido(carrinho) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) { 
                resolve("Pedido confirmado com sucesso!");
            } else {
                reject("Erro ao confirmar o pedido. Tente novamente.");
            }
        }, 2000); 
    });
}

function finalizarCompra(carrinho) {
    return validarDados(carrinho)
        .then((validacaoMensagem) => {
            console.log(validacaoMensagem); 
            return confirmarPedido(carrinho); 
        })
        .then((confirmacaoMensagem) => {
            console.log(confirmacaoMensagem); 
            alert('Compra finalizada com sucesso!');
            localStorage.removeItem('carrinho');
            atualizarCarrinho();
        })
        .catch((erroMensagem) => {
            console.error(erroMensagem); 
            alert('Houve um problema ao finalizar a compra. Tente novamente.');
        });
}

function adicionarEventosFiltro() {
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
}

function aplicarFiltros() {
    const ordenarPor = document.getElementById('ordenar-por').value;
    const precoMin = parseFloat(document.getElementById('preco-min').value) || 0;
    const precoMax = parseFloat(document.getElementById('preco-max').value) || Infinity;

    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    let produtosFiltrados = produtos.filter(p => p.preco >= precoMin && p.preco <= precoMax);

    if (ordenarPor === 'nome') {
        produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (ordenarPor === 'preco') {
        produtosFiltrados.sort((a, b) => a.preco - b.preco);
    }

    const produtosDiv = document.getElementById('produtos');
    produtosDiv.innerHTML = '';

    produtosFiltrados.forEach(produto => {
        produtosDiv.appendChild(criarProduto(produto.nome, produto.preco, produto.imagem));
    });
}


