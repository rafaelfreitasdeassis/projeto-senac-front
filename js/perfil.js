const perfilInfo = document.getElementById('perfil-info');
const btnLogout = document.getElementById('btn-logout');
const jwtTokenArea = document.getElementById('jwt-token-value');

async function carregarPerfil() {
    try {
        const perfil = await apiRequest('/usuarios/perfil');

        if (perfilInfo) {
            perfilInfo.innerHTML = `
                <div class="perfil-grid">
                    <div class="perfil-item"><div class="pi-label">ID</div><div class="pi-value">${perfil.id}</div></div>
                    <div class="perfil-item"><div class="pi-label">Nome</div><div class="pi-value">${perfil.nome}</div></div>
                    <div class="perfil-item"><div class="pi-label">E-mail</div><div class="pi-value">${perfil.email}</div></div>
                    <div class="perfil-item"><div class="pi-label">Telefone</div><div class="pi-value">${perfil.telefone}</div></div>
                </div>
            `;
        }

        mostrarResultado('Perfil carregado com sucesso.');
    } catch (erro) {
        mostrarResultado(`Falha ao carregar perfil: ${erro.message}`, 'error');
        logout();
    }
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => logout(true));
}

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    if (jwtTokenArea) {
        jwtTokenArea.textContent = getToken() || 'Token nao encontrado';
    }

    await carregarPerfil();
});
