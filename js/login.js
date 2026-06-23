const formLogin = document.getElementById('form-login');

setupValidation(formLogin);

async function loginUsuario(event) {
    event.preventDefault();

    const payload = {
        email: document.getElementById('login-email').value.trim(),
        senha: document.getElementById('login-senha').value
    };

    try {
        const dados = await apiRequest('/usuarios/login', {
            method: 'POST',
            body: payload,
            auth: false
        });

        const token = dados.token || dados.accessToken;

        if (!token) {
            throw new Error('Token não retornado pela API.');
        }

        setToken(token);

        if (dados.usuario) {
            setUsuario(dados.usuario);
        }

        mostrarResultado('Login realizado com sucesso. Redirecionando...');

        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 600);

    } catch (erro) {
        mostrarResultado(`Falha no login: ${erro.message}`, 'error');
    }
}

if (formLogin) {
    formLogin.addEventListener('submit', loginUsuario);
}
