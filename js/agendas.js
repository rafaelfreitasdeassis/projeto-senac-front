const formAgendamento = document.getElementById('form-agendamento');

const agendamentoId = document.getElementById('agendamento-id');
const agendamentoPet = document.getElementById('agendamento-pet');
const agendamentoServico = document.getElementById('agendamento-servico');
const agendamentoData = document.getElementById('agendamento-data');
const agendamentoHora = document.getElementById('agendamento-hora');

const listaAgendamentosCards = document.getElementById('lista-agendamentos-cards');
const listaAgendamentosTabela = document.getElementById('lista-agendamentos-tabela');

const btnNovoAgendamento = document.getElementById('btn-novo-agendamento');
const btnExcluirAgendamento = document.getElementById('btn-excluir-agendamento');
const tituloModal = document.getElementById('titulo-modal');

let pets = [];
let servicos = [];
let agendamentos = [];

function limparFormularioAgendamento() {
    agendamentoId.value = '';
    agendamentoPet.value = '';
    agendamentoServico.value = '';
    agendamentoData.value = '';
    agendamentoHora.value = '';

    if (tituloModal) {
        tituloModal.textContent = 'Novo Agendamento';
    }

    btnExcluirAgendamento?.classList.add('d-none');
}

function preencherFormularioAgendamento(agendamento) {
    agendamentoId.value = agendamento.id || '';

    agendamentoPet.value =
        agendamento.idPet ||
        agendamento.petId ||
        agendamento.pet_id ||
        '';

    agendamentoServico.value =
        agendamento.idServico ||
        agendamento.servicoId ||
        agendamento.servico_id ||
        '';

    agendamentoData.value =
        agendamento.data ||
        agendamento.dataAgendamento ||
        '';

    agendamentoHora.value =
        agendamento.hora ||
        agendamento.horaAgendamento ||
        '';

    if (tituloModal) {
        tituloModal.textContent = 'Editar Agendamento';
    }

    btnExcluirAgendamento?.classList.remove('d-none');

    const modal = document.getElementById('agendamentoModal');
    bootstrap.Modal.getOrCreateInstance(modal).show();
}

function nomePet(id) {
    const pet = pets.find((item) => Number(item.id) === Number(id));
    return pet ? pet.nome : '—';
}

function nomeServico(id) {
    const servico = servicos.find((item) => Number(item.id) === Number(id));
    return servico ? servico.nome : '—';
}

function getPetId(agendamento) {
    return agendamento.idPet || agendamento.petId || agendamento.pet_id;
}

function getServicoId(agendamento) {
    return agendamento.idServico || agendamento.servicoId || agendamento.servico_id;
}

function renderizarAgendamentos() {
    if (listaAgendamentosCards) {
        listaAgendamentosCards.innerHTML = agendamentos.length
            ? agendamentos.map((agendamento) => `
                <div class="card task-card mb-3">
                    <div class="card-body">
                        <h5>🐾 ${nomePet(getPetId(agendamento))}</h5>

                        <p>
                            <strong>Serviço:</strong>
                            ${nomeServico(getServicoId(agendamento))}
                        </p>

                        <p>
                            <strong>Data:</strong>
                            ${agendamento.data || agendamento.dataAgendamento || '—'}
                        </p>

                        <p>
                            <strong>Horário:</strong>
                            ${agendamento.hora || agendamento.horaAgendamento || '—'}
                        </p>

                        <button class="btn btn-outline-success btn-sm"
                            onclick="editarAgendamento(${agendamento.id})">
                            Editar
                        </button>

                        <button class="btn btn-outline-danger btn-sm"
                            onclick="excluirAgendamento(${agendamento.id})">
                            Excluir
                        </button>
                    </div>
                </div>
            `).join('')
            : `<p class="text-muted">Nenhum agendamento cadastrado.</p>`;
    }

    if (listaAgendamentosTabela) {
        listaAgendamentosTabela.innerHTML = agendamentos.length
            ? agendamentos.map((agendamento) => `
                <tr>
                    <td>${agendamento.id}</td>
                    <td>${nomePet(getPetId(agendamento))}</td>
                    <td>${nomeServico(getServicoId(agendamento))}</td>
                    <td>${agendamento.data || agendamento.dataAgendamento || '—'}</td>
                    <td>${agendamento.hora || agendamento.horaAgendamento || '—'}</td>
                    <td>
                        <button class="btn btn-outline-success btn-sm"
                            onclick="editarAgendamento(${agendamento.id})">
                            Editar
                        </button>

                        <button class="btn btn-outline-danger btn-sm"
                            onclick="excluirAgendamento(${agendamento.id})">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Nenhum agendamento cadastrado.
                    </td>
                </tr>
            `;
    }
}

async function carregarPetsSelect() {
    pets = await apiRequest('/pets');

    agendamentoPet.innerHTML = `
        <option value="">Selecione um pet</option>
        ${pets.map((pet) => `
            <option value="${pet.id}">
                ${pet.nome}
            </option>
        `).join('')}
    `;
}

async function carregarServicosSelect() {
    servicos = await apiRequest('/servicos');

    agendamentoServico.innerHTML = `
        <option value="">Selecione um serviço</option>
        ${servicos.map((servico) => `
            <option value="${servico.id}">
                ${servico.nome}
            </option>
        `).join('')}
    `;
}

async function carregarAgendamentos() {
    try {
        agendamentos = await apiRequest('/agendamentos');
        renderizarAgendamentos();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar agendamentos: ${erro.message}`, 'error');
    }
}

function editarAgendamento(id) {
    const agendamento = agendamentos.find((item) => item.id === id);

    if (!agendamento) {
        mostrarResultado('Agendamento não encontrado.', 'error');
        return;
    }

    preencherFormularioAgendamento(agendamento);
}

async function salvarAgendamento(event) {
    event.preventDefault();

    const id = agendamentoId.value;

    const payload = {
        idPet: Number(agendamentoPet.value),
        idServico: Number(agendamentoServico.value),
        data: agendamentoData.value,
        hora: agendamentoHora.value
    };

    try {
        if (id) {
            await apiRequest(`/agendamentos/${id}`, {
                method: 'PUT',
                body: payload
            });

            mostrarResultado('Agendamento atualizado com sucesso.');
        } else {
            await apiRequest('/agendamentos', {
                method: 'POST',
                body: payload
            });

            mostrarResultado('Agendamento criado com sucesso.');
        }

        const modal = document.getElementById('agendamentoModal');
        bootstrap.Modal.getOrCreateInstance(modal).hide();

        limparFormularioAgendamento();
        await carregarAgendamentos();

    } catch (erro) {
        mostrarResultado(`Erro ao salvar agendamento: ${erro.message}`, 'error');
    }
}

async function excluirAgendamento(id = null) {
    const agendamentoParaExcluir = id || agendamentoId.value;

    if (!agendamentoParaExcluir) return;

    const confirmar = await Swal.fire({
        icon: 'warning',
        title: 'Excluir agendamento?',
        text: 'Essa ação não poderá ser desfeita.',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626'
    });

    if (!confirmar.isConfirmed) return;

    try {
        await apiRequest(`/agendamentos/${agendamentoParaExcluir}`, {
            method: 'DELETE'
        });

        mostrarResultado('Agendamento excluído com sucesso.');

        const modal = document.getElementById('agendamentoModal');
        bootstrap.Modal.getOrCreateInstance(modal).hide();

        limparFormularioAgendamento();
        await carregarAgendamentos();

    } catch (erro) {
        mostrarResultado(`Erro ao excluir agendamento: ${erro.message}`, 'error');
    }
}

if (btnNovoAgendamento) {
    btnNovoAgendamento.addEventListener('click', limparFormularioAgendamento);
}

if (formAgendamento) {
    formAgendamento.addEventListener('submit', salvarAgendamento);
}

if (btnExcluirAgendamento) {
    btnExcluirAgendamento.addEventListener('click', () => excluirAgendamento());
}

window.addEventListener('DOMContentLoaded', async () => {
    protegerPagina();

    btnExcluirAgendamento?.classList.add('d-none');

    try {
        await carregarPetsSelect();
        await carregarServicosSelect();
        await carregarAgendamentos();
    } catch (erro) {
        mostrarResultado(`Erro ao iniciar agenda: ${erro.message}`, 'error');
    }
});
