const API_BASE = 'https://petservice-api.vercel.app';
// const API_BASE = 'http://localhost:3000';

const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
}

function setUsuario(usuario) {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

function getUsuario() {
    const usuario = localStorage.getItem(USUARIO_KEY);

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch (erro) {
        return null;
    }
}

function setupTopbarAuth() {
    const token = getToken();

    const linksUsuario = document.querySelectorAll('.usuario');
    const linksVisitante = document.querySelectorAll('.visitante');

    linksUsuario.forEach((link) => {
        link.classList.toggle('is-hidden', !token);
        link.classList.toggle('d-none', !token);
    });

    linksVisitante.forEach((link) => {
        link.classList.toggle('is-hidden', !!token);
        link.classList.toggle('d-none', !!token);
    });

    const topbarLogout = document.getElementById('topbar-logout');
    const btnLogout = document.getElementById('btn-logout');

    [topbarLogout, btnLogout].forEach((botao) => {
        if (!botao) return;

        botao.classList.toggle('is-hidden', !token);
        botao.classList.toggle('d-none', !token);
    });
}

function getResultadoArea() {
    return document.getElementById('resultado');
}

function mostrarResultado(texto, tipo = 'success') {
    const resultadoArea = getResultadoArea();
    const isSuccess = tipo === 'success';

    if (window.Swal) {
        Swal.fire({
            icon: isSuccess ? 'success' : 'error',
            text: texto,
            confirmButtonColor: '#15803d'
        });
    }

    if (resultadoArea) {
        resultadoArea.className =
            `alert alert-${isSuccess ? 'success' : 'danger'} mt-3 mb-0`;

        resultadoArea.textContent = texto;
    } else if (!window.Swal) {
        console.log(texto);
    }
}

function setupValidation(form) {
    if (!form) return;
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (options.auth !== false && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const normalizedPath = path.replace(/^\/+/, '');
    const url = /^https?:\/\//i.test(path)
        ? path
        : `${API_BASE.replace(/\/+$/, '')}/${normalizedPath}`;

    const resposta = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body
            ? isFormData
                ? options.body
                : JSON.stringify(options.body)
            : undefined
    });

    const textoResposta = await resposta.text();

    let dados;

    try {
        dados = textoResposta ? JSON.parse(textoResposta) : {};
    } catch (erro) {
        dados = {
            mensagem: textoResposta
        };
    }

    if (!resposta.ok) {
        const mensagem =
            dados.mensagem ||
            dados.message ||
            dados.erro ||
            `Erro ${resposta.status}`;

        throw new Error(mensagem);
    }

    return dados;
}

function logout(redirect = true) {
    clearToken();
    setupTopbarAuth();

    if (redirect) {
        window.location.href = 'login.html';
    }
}

function protegerPagina() {
    const token = getToken();

    if (!token) {
        window.location.href = 'login.html';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setupTopbarAuth();

    const topbarLogout = document.getElementById('topbar-logout');
    const btnLogout = document.getElementById('btn-logout');

    [topbarLogout, btnLogout].forEach((botao) => {
        if (!botao) return;

        botao.addEventListener('click', (event) => {
            event.preventDefault();
            logout(true);
        });
    });
});
