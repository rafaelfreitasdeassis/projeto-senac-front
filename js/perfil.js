const btnLogout = document.getElementById('btn-logout');

const perfilForm = document.getElementById('perfil-form');

const perfilAvatar = document.getElementById('perfil-avatar');
const perfilAvatarPreview = document.getElementById('perfil-avatar-preview');
const perfilFoto = document.getElementById('perfil-foto');

const perfilNome = document.getElementById('perfil-nome');
const perfilEmail = document.getElementById('perfil-email');
const perfilTelefone = document.getElementById('perfil-telefone');
const perfilSenha = document.getElementById('perfil-senha');

const infoNome = document.getElementById('info-nome');
const infoEmail = document.getElementById('info-email');
const infoTelefone = document.getElementById('info-telefone');
const infoTipo = document.getElementById('info-tipo');

const listaPets = document.getElementById('lista-pets');
const totalPets = document.getElementById('total-pets');
const totalAgendamentos = document.getElementById('total-agendamentos');

const IMAGEM_PADRAO = 'https://ui-avatars.com/api/?name=PetService';

let usuarioAtual = {};
let fotoSelecionada = null;

function atualizarAvatar(src) {
    const foto = src || IMAGEM_PADRAO;

    if (perfilAvatar) {
        perfilAvatar.src = foto;
    }

    if (perfilAvatarPreview) {
        perfilAvatarPreview.src = foto;
    }
}

function preencherDadosUsuario(usuario) {
    usuarioAtual = usuario || {};

    if (infoNome) infoNome.textContent = usuarioAtual.nome || '—';
    if (infoEmail) infoEmail.textContent = usuarioAtual.email || '—';
    if (infoTelefone) infoTelefone.textContent = usuarioAtual.telefone || '—';
    if (infoTipo) infoTipo.textContent = usuarioAtual.tipoUsuario || 'Cliente';

    if (perfilNome) perfilNome.value = usuarioAtual.nome || '';
    if (perfilEmail) perfilEmail.value = usuarioAtual.email || '';
    if (perfilTelefone) perfilTelefone.value = usuarioAtual.telefone || '';
    if (perfilSenha) perfilSenha.value = '';

    atualizarAvatar(usuarioAtual.foto || '');
}

function renderizarPets(pets) {
    if (totalPets) {
        totalPets.textContent = pets.length;
    }

    if (!listaPets) return;

    if (!pets.length) {
        listaPets.innerHTML = `
            <div class="col-12">
                <p class="text-muted mb-0">
                    Nenhum pet cadastrado ainda.
                </p>
            </div>
        `;
        return;
    }

    listaPets.innerHTML = pets.map((pet) => `
        <div class="col-md-4">
            <div class="border rounded p-3 h-100">
                <h5>🐾 ${pet.nome || 'Pet'}</h5>

                <p class="mb-1">
                    <strong>Raça:</strong> ${pet.raca || '—'}
                </p>

                <p class="mb-1">
                    <strong>Porte:</strong> ${pet.porte || '—'}
                </p>

                <p class="mb-0">
                    <strong>Peso:</strong> ${pet.peso || '—'} kg
                </p>
            </div>
        </div>
    `).join('');
}

async function carregarUsuario() {
    try {
        const usuario = await apiRequest('/usuarios/perfil');

        preencherDadosUsuario(usuario);

        if (usuario) {
            setUsuario(usuario);
        }

    } catch (erro) {
        mostrarResultado(`Falha ao carregar usuário: ${erro.message}`, 'error');
        logout(true);
    }
}

async function carregarPets() {
    try {
        const pets = await apiRequest('/pets');

        renderizarPets(Array.isArray(pets) ? pets : []);

    } catch (erro) {
        renderizarPets([]);
    }
}

async function carregarAgendamentos() {
    try {
        const agendamentos = await apiRequest('/agendamentos');

        if (totalAgendamentos) {
            totalAgendamentos.textContent =
                Array.isArray(agendamentos) ? agendamentos.length : 0;
        }

    } catch (erro) {
        if (totalAgendamentos) {
            totalAgendamentos.textContent = '0';
        }
    }
}

function selecionarFoto(event) {
    const arquivo = event.target.files && event.target.files[0];

    if (!arquivo) {
        fotoSelecionada = null;
        atualizarAvatar(usuarioAtual.foto || '');
        return;
    }

    fotoSelecionada = arquivo;
    atualizarAvatar(URL.createObjectURL(arquivo));
}

async function salvarUsuario(event) {
    event.preventDefault();

    const senha = perfilSenha?.value.trim();

    const formData = new FormData();

    formData.append('nome', perfilNome?.value.trim() || '');
    formData.append('email', perfilEmail?.value.trim() || '');
    formData.append('telefone', perfilTelefone?.value.trim() || '');

    if (usuarioAtual.tipoUsuario) {
        formData.append('tipoUsuario', usuarioAtual.tipoUsuario);
    }

    if (senha) {
        formData.append('senha', senha);
    }

    if (fotoSelecionada) {
        formData.append('foto', fotoSelecionada);
    }

    try {
        await apiRequest(`/usuarios/${usuarioAtual.id}`, {
            method: 'PUT',
            body: formData
        });

        fotoSelecionada = null;

        await carregarUsuario();

        mostrarResultado('Perfil atualizado com sucesso.');

        const modal = document.getElementById('perfilModal');

        if (modal && window.bootstrap) {
            bootstrap.Modal.getOrCreateInstance(modal).hide();
        }

    } catch (erro) {
        mostrarResultado(`Falha ao atualizar perfil: ${erro.message}`, 'error');
    }
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => logout(true));
}

if (perfilFoto) {
    perfilFoto.addEventListener('change', selecionarFoto);
}

if (perfilForm) {
    perfilForm.addEventListener('submit', salvarUsuario);
}

window.addEventListener('DOMContentLoaded', async () => {
    protegerPagina();

    atualizarAvatar('');

    await carregarUsuario();
    await carregarPets();
    await carregarAgendamentos();
});
