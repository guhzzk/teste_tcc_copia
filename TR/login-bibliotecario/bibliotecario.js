// Login do bibliotecário — email e senha (mesma rota /login usada pelo aluno)
document.getElementById("form-bibliotecario").addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    if (!email || !senha) {
        showToast('Preencha todos os campos', 'warning');
        return;
    }

    const btn = document.getElementById("btn-login");
    btn.disabled = true;
    btn.textContent = "Entrando...";

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, senha: senha })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
            window.location.href = "../home/home.html";
        } else {
            showToast(data.error || 'Erro ao fazer login', 'error');
            btn.disabled = false;
            btn.textContent = "Entrar";
        }
    } catch (error) {
        console.error("Erro:", error);
        showToast('Erro de conexão com o servidor', 'error');
        btn.disabled = false;
        btn.textContent = "Entrar";
    }
});
