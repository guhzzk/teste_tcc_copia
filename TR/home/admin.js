// admin.js — painel de gerenciamento de livros (admin e bibliotecario)

let usuarioAtual = null;

document.addEventListener('DOMContentLoaded', async function () {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        window.location.href = '../login/index.html';
        return;
    }

    usuarioAtual = JSON.parse(usuarioLogado);

    // Somente admin e bibliotecario podem acessar esta pagina
    if (usuarioAtual.tipo !== 'admin' && usuarioAtual.tipo !== 'bibliotecario') {
        alert('Acesso negado. Você precisa ser admin ou bibliotecário.');
        window.location.href = 'home.html';
        return;
    }

    // Ajusta badge e titulo conforme o papel
    const badge = document.querySelector('.admin-badge');
    if (badge) {
        badge.textContent = usuarioAtual.tipo === 'admin' ? 'Admin' : 'Bibliotecário';
    }
    const roleBadge = document.querySelector('h1 span:last-child');
    if (roleBadge) {
        roleBadge.textContent = usuarioAtual.tipo === 'admin' ? 'Administrador' : 'Bibliotecário';
    }

    // Esconde o botao de excluir para bibliotecario (só admin pode excluir)
    // (tratado dinamicamente no renderLivros())

    await carregarLivros();

    // Listener do formulario
    const form = document.getElementById('form-adicionar-livro');
    if (form) {
        form.addEventListener('submit', cadastrarLivro);
    }
});

async function cadastrarLivro(event) {
    event.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    const editora = document.getElementById('editora').value.trim();
    const ano = document.getElementById('ano').value.trim();
    const categoria = document.getElementById('categoria').value;
    const quantidade_total = parseInt(document.getElementById('quantidade_total').value) || 1;
    const capa_url = document.getElementById('capa_url').value.trim();

    if (!titulo || !autor) {
        showToast('Título e Autor são obrigatórios!', 'error');
        return;
    }

    try {
        const response = await fetch('/livros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': usuarioAtual.id   // <-- autenticação necessária
            },
            body: JSON.stringify({
                titulo,
                autor,
                isbn: isbn || null,
                editora: editora || null,
                ano: ano ? parseInt(ano) : null,
                categoria: categoria || null,
                quantidade_total,
                capa_url: capa_url || null
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Livro cadastrado com sucesso!', 'success');
            limparFormulario();
            await carregarLivros();
        } else {
            showToast(data.error || 'Erro ao cadastrar livro', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro de conexão com o servidor', 'error');
    }
}

async function carregarLivros() {
    const lista = document.getElementById('lista-livros-admin');
    const totalEl = document.getElementById('total-livros');
    if (!lista) return;

    lista.innerHTML = '<div class="loading">Carregando livros...</div>';

    try {
        const response = await fetch('/livros');
        const livros = await response.json();

        if (totalEl) {
            totalEl.textContent = `${livros.length} livro(s)`;
        }

        if (!livros || livros.length === 0) {
            lista.innerHTML = '<p style="text-align:center; padding:20px;">📭 Nenhum livro cadastrado ainda.</p>';
            return;
        }

        const isAdmin = usuarioAtual.tipo === 'admin';

        lista.innerHTML = livros.map(livro => `
            <div class="livro-card-admin">
                ${livro.capa_url
                    ? `<img src="${livro.capa_url}" alt="Capa" class="livro-capa-admin" onerror="this.style.display='none'">`
                    : '<div class="livro-sem-capa">📖</div>'}
                <div class="livro-info-admin">
                    <strong>${livro.titulo}</strong>
                    <span>${livro.autor}</span>
                    ${livro.categoria ? `<span>📂 ${livro.categoria}</span>` : ''}
                    <span>Qtd: ${livro.quantidade_disponivel}/${livro.quantidade_total} disponíveis</span>
                </div>
                <div class="livro-acoes-admin">
                    ${isAdmin
                        ? `<button class="btn-danger" onclick="excluirLivro(${livro.id})">🗑️ Excluir</button>`
                        : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        lista.innerHTML = '<p style="text-align:center;">❌ Erro ao carregar livros.</p>';
    }
}

window.excluirLivro = async function (livroId) {
    if (!confirm('Tem certeza que deseja excluir este livro permanentemente?')) return;

    try {
        const response = await fetch(`/livros/${livroId}`, {
            method: 'DELETE',
            headers: { 'usuario-id': usuarioAtual.id }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Livro excluído com sucesso!', 'success');
            await carregarLivros();
        } else {
            showToast(data.error || 'Erro ao excluir livro', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro de conexão com o servidor', 'error');
    }
};

function limparFormulario() {
    const form = document.getElementById('form-adicionar-livro');
    if (form) form.reset();
}
