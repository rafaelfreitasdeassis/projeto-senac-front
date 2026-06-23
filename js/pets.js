const formPet = document.getElementById('form-pet');

const petId = document.getElementById('pet-id');
const petNome = document.getElementById('pet-nome');
const petRaca = document.getElementById('pet-raca');
const petPorte = document.getElementById('pet-porte');
const petPeso = document.getElementById('pet-peso');

const listaPetsCards = document.getElementById('lista-pets-cards');
const listaPetsTabela = document.getElementById('lista-pets-tabela');

const btnNovoPet = document.getElementById('btn-novo-pet');
const btnExcluirPet = document.getElementById('btn-excluir-pet');
const tituloModalPet = document.getElementById('titulo-modal-pet');

let pets = [];

/* =========================
   FORMULÁRIO
========================= */

function limparFormularioPet() {
    petId.value = '';
    petNome.value = '';
    petRaca.value = '';
    petPorte.value = '';
    petPeso.value = '';

    tituloModalPet.textContent = 'Novo Pet';
    btnExcluirPet?.classList.add('d-none');
}

function preencherFormularioPet(pet) {
    petId.value = pet.id;
    petNome.value = pet.nome || '';
    petRaca.value = pet.raca || '';
    petPorte.value = pet.porte || '';
    petPeso.value = pet.peso || '';

    tituloModalPet.textContent = 'Editar Pet';
    btnExcluirPet?.classList.remove('d-none');

    const modal = document.getElementById('petModal');

    bootstrap
        .Modal
        .getOrCreateInstance(modal)
        .show();
}

/* =========================
   RENDERIZAÇÃO
========================= */

function formatarPeso(peso) {
    return peso
        ? `${peso} kg`
        : '—';
}

function renderizarPets() {

    /* CARDS */

    if (listaPetsCards) {

        listaPetsCards.innerHTML = pets.length
            ? pets.map((pet) => `
                <div class="col-md-4">

                    <div class="card h-100 shadow-sm">

                        <div class="card-body">

                            <h5 class="card-title">
                                🐾 ${pet.nome}
                            </h5>

                            <p class="mb-2">
                                <strong>Raça:</strong>
                                ${pet.raca || '—'}
                            </p>

                            <p class="mb-2">
                                <strong>Porte:</strong>
                                ${pet.porte || '—'}
                            </p>

                            <p class="mb-3">
                                <strong>Peso:</strong>
                                ${formatarPeso(pet.peso)}
                            </p>

                            <button
                                class="btn btn-outline-success btn-sm"
                                onclick="editarPet(${pet.id})">

                                <i class="bi bi-pencil"></i>
                                Editar

                            </button>

                        </div>

                    </div>

                </div>
            `).join('')
            : `
                <div class="col-12">

                    <div class="alert alert-light text-center">

                        Nenhum pet cadastrado.

                    </div>

                </div>
            `;
    }

    /* TABELA */

    if (listaPetsTabela) {

        listaPetsTabela.innerHTML = pets.length
            ? pets.map((pet) => `
                <tr>

                    <td>${pet.id}</td>

                    <td>${pet.nome}</td>

                    <td>${pet.raca || '—'}</td>

                    <td>${pet.porte || '—'}</td>

                    <td>${formatarPeso(pet.peso)}</td>

                    <td>

                        <button
                            class="btn btn-outline-success btn-sm me-1"
                            onclick="editarPet(${pet.id})">

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button
                            class="btn btn-outline-danger btn-sm"
                            onclick="excluirPet(${pet.id})">

                            <i class="bi bi-trash"></i>

                        </button>

                    </td>

                </tr>
            `).join('')
            : `
                <tr>

                    <td
                        colspan="6"
                        class="text-center text-muted py-4">

                        Nenhum pet cadastrado.

                    </td>

                </tr>
            `;
    }
}

/* =========================
   CARREGAR PETS
========================= */

async function carregarPets() {

    try {

        pets = await apiRequest('/pets');

        renderizarPets();

    } catch (erro) {

        mostrarResultado(
            `Erro ao carregar pets: ${erro.message}`,
            'error'
        );
    }
}

/* =========================
   EDITAR
========================= */

function editarPet(id) {

    const pet = pets.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!pet) {

        mostrarResultado(
            'Pet não encontrado.',
            'error'
        );

        return;
    }

    preencherFormularioPet(pet);
}

window.editarPet = editarPet;

/* =========================
   SALVAR
========================= */

async function salvarPet(event) {

    event.preventDefault();

    const id = petId.value;

    const payload = {

        nome: petNome.value.trim(),

        raca: petRaca.value.trim(),

        porte: petPorte.value,

        peso: petPeso.value
            ? Number(petPeso.value)
            : null
    };

    if (!payload.nome) {

        mostrarResultado(
            'Informe o nome do pet.',
            'error'
        );

        return;
    }

    try {

        if (id) {

            await apiRequest(`/pets/${id}`, {
                method: 'PUT',
                body: payload
            });

            mostrarResultado(
                'Pet atualizado com sucesso.'
            );

        } else {

            await apiRequest('/pets', {
                method: 'POST',
                body: payload
            });

            mostrarResultado(
                'Pet cadastrado com sucesso.'
            );
        }

        const modal = document.getElementById('petModal');

        bootstrap
            .Modal
            .getOrCreateInstance(modal)
            .hide();

        limparFormularioPet();

        await carregarPets();

    } catch (erro) {

        mostrarResultado(
            `Erro ao salvar pet: ${erro.message}`,
            'error'
        );
    }
}

/* =========================
   EXCLUIR
========================= */

async function excluirPet(id = null) {

    const petParaExcluir = id || petId.value;

    if (!petParaExcluir) return;

    const confirmar = await Swal.fire({

        icon: 'warning',

        title: 'Excluir pet?',

        text: 'Essa ação não poderá ser desfeita.',

        showCancelButton: true,

        confirmButtonText: 'Sim, excluir',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#dc2626'
    });

    if (!confirmar.isConfirmed) {
        return;
    }

    try {

        await apiRequest(`/pets/${petParaExcluir}`, {
            method: 'DELETE'
        });

        mostrarResultado(
            'Pet excluído com sucesso.'
        );

        const modal = document.getElementById('petModal');

        bootstrap
            .Modal
            .getOrCreateInstance(modal)
            .hide();

        limparFormularioPet();

        await carregarPets();

    } catch (erro) {

        mostrarResultado(
            `Erro ao excluir pet: ${erro.message}`,
            'error'
        );
    }
}

window.excluirPet = excluirPet;

/* =========================
   EVENTOS
========================= */

if (btnNovoPet) {
    btnNovoPet.addEventListener(
        'click',
        limparFormularioPet
    );
}

if (formPet) {
    formPet.addEventListener(
        'submit',
        salvarPet
    );
}

if (btnExcluirPet) {
    btnExcluirPet.addEventListener(
        'click',
        () => excluirPet()
    );
}

/* =========================
   INICIALIZAÇÃO
========================= */

window.addEventListener(
    'DOMContentLoaded',
    async () => {

        protegerPagina();

        btnExcluirPet?.classList.add('d-none');

        await carregarPets();
    }
);

