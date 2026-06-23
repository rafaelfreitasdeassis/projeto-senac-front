const formCadastro = document.getElementById('form-cadastro');

setupValidation(formCadastro);

async function cadastrarUsuario(event) {
    event.preventDefault();

    const senha = document.getElementById('cadastro-senha').value;
    const confirmarSenha = document.getElementById('cadastro-confirmar-senha')?.value;

    if (confirmarSenha && senha !== confirmarSenha) {
        mostrarResultado('As senhas não conferem.', 'error');
        return;
    }

    const payload = {
        nome: document.getElementById('cadastro-nome').value.trim(),
        email: document.getElementById('cadastro-email').value.trim(),
        telefone: document.getElementById('cadastro-telefone').value.trim(),
        senha,
        tipoUsuario: document.getElementById('cadastro-tipo')?.value || 'cliente'
    };

    try {
        const usuario = await apiRequest('/usuarios', {
            method: 'POST',
            body: payload,
            auth: false
        });

        mostrarResultado(`Cadastro realizado com sucesso: ${usuario.nome || payload.nome}`);

        formCadastro.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 900);

    } catch (erro) {
        mostrarResultado(`Falha no cadastro: ${erro.message}`, 'error');
    }
}

if (formCadastro) {
    formCadastro.addEventListener('submit', cadastrarUsuario);
}
