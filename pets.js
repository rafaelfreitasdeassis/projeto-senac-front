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

function limparFormularioPet() {
    petId.value = '';
    petNome.value = '';
    petRaca.value = '';
    petPorte.value = '';
    petPeso.value = '';

    tituloModalPet.textContent = 'Novo Pet';
    btnExcluirPet.classList.add('d-none');
}

function preencherFormularioPet(pet) {
    petId.value = pet.id;
    petNome.value = pet.nome || '';
    petRaca.value = pet.raca || '';
    petPorte.value = pet.porte || '';
    petPeso.value = pet.peso || '';

    tituloModalPet.textContent = 'Editar Pet';
    btnExcluirPet.classList.remove('d-none');

    const modal = document.getElementById('petModal');
    bootstrap.Modal.getOrCreateInstance(modal).show();
}

function renderizarPets() {
    if (listaPetsCards) {
        listaPetsCards.innerHTML = pets.length
            ? pets.map((pet) => `
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5>🐾 ${pet.nome}</h5>
                            <p><strong>Raça:</strong> ${pet.raca || '—'}</p>
                            <p><strong>Porte:</strong> ${pet.porte || '—'}</p>
                            <p><strong>Peso:</strong> ${pet.peso || '—'} kg</p>

                            <button class="btn btn-outline-success btn-sm"
                                onclick="editarPet(${pet.id})">
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')
            : `<p class="text-muted">Nenhum pet cadastrado.</p>`;
    }

    if (listaPetsTabela) {
        listaPetsTabela.innerHTML = pets.length
            ? pets.map((pet) => `
                <tr>
                    <td>${pet.id}</td>
                    <td>${pet.nome}</td>
                    <td>${pet.raca || '—'}</td>
                    <td>${pet.porte || '—'}</td>
                    <td>${pet.peso || '—'} kg</td>
                    <td>
                        <button class="btn btn-outline-success btn-sm"
                            onclick="editarPet(${pet.id})">
                            Editar
                        </button>

                        <button class="btn btn-outline-danger btn-sm"
                            onclick="excluirPet(${pet.id})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Nenhum pet cadastrado.
                    </td>
                </tr>
            `;
    }
}

async function carregarPets() {
    try {
        pets = await apiRequest('/pets');
        renderizarPets();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar pets: ${erro.message}`, 'error');
    }
}

function editarPet(id) {
    const pet = pets.find((item) => item.id === id);

    if (!pet) {
        mostrarResultado('Pet não encontrado.', 'error');
        return;
    }

    preencherFormularioPet(pet);
}

async function salvarPet(event) {
    event.preventDefault();

    const id = petId.value;

    const payload = {
        nome: petNome.value.trim(),
        raca: petRaca.value.trim(),
        porte: petPorte.value,
        peso: Number(petPeso.value) || null
    };

    try {
        if (id) {
            await apiRequest(`/pets/${id}`, {
                method: 'PUT',
                body: payload
            });

            mostrarResultado('Pet atualizado com sucesso.');
        } else {
            await apiRequest('/pets', {
                method: 'POST',
                body: payload
            });

            mostrarResultado('Pet cadastrado com sucesso.');
        }

        const modal = document.getElementById('petModal');
        bootstrap.Modal.getOrCreateInstance(modal).hide();

        limparFormularioPet();
        await carregarPets();

    } catch (erro) {
        mostrarResultado(`Erro ao salvar pet: ${erro.message}`, 'error');
    }
}

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

    if (!confirmar.isConfirmed) return;

    try {
        await apiRequest(`/pets/${petParaExcluir}`, {
            method: 'DELETE'
        });

        mostrarResultado('Pet excluído com sucesso.');

        const modal = document.getElementById('petModal');
        bootstrap.Modal.getOrCreateInstance(modal).hide();

        limparFormularioPet();
        await carregarPets();

    } catch (erro) {
        mostrarResultado(`Erro ao excluir pet: ${erro.message}`, 'error');
    }
}

if (btnNovoPet) {
    btnNovoPet.addEventListener('click', limparFormularioPet);
}

if (formPet) {
    formPet.addEventListener('submit', salvarPet);
}

if (btnExcluirPet) {
    btnExcluirPet.addEventListener('click', () => excluirPet());
}

window.addEventListener('DOMContentLoaded', async () => {
    protegerPagina();
    btnExcluirPet?.classList.add('d-none');
    await carregarPets();
});