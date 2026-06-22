const formTarefa = document.getElementById('form-agendamento');
const inputId = document.getElementById('tarefa-id');
const inputTitulo = document.getElementById('tarefa-titulo');
const inputDescricao = document.getElementById('tarefa-descricao');
const inputStatus = document.getElementById('tarefa-status');
const modalTitle = document.getElementById('tarefaModalTitle');
const btnNovaTarefa = document.getElementById('btn-nova-tarefa');
const btnModalSalvar = document.getElementById('btn-modal-salvar');
const btnModalEditar = document.getElementById('btn-modal-editar');
const btnModalExcluir = document.getElementById('btn-modal-excluir');

const listaCards = document.getElementById('lista-tarefas-cards');
const listaTabela = document.getElementById('lista-tarefas-tabela');

const cardsWrapper = document.getElementById('tarefas-cards-wrapper');
const tabelaWrapper = document.getElementById('tarefas-tabela-wrapper');

const btnViewCards = document.getElementById('view-cards');
const btnViewTable = document.getElementById('view-table');
const tarefaModalEl = document.getElementById('tarefaModal');

const tarefaModal = tarefaModalEl && window.bootstrap
    ? bootstrap.Modal.getOrCreateInstance(tarefaModalEl)
    : null;

const STATUS_LABEL = {
    novo: 'Novo',
    andamento: 'Em andamento',
    concluida: 'Concluída',
};

let agendas = [];
let viewMode = 'cards';
let tarefaSelecionadaId = null;
let modalMode = 'create';

function normalizarStatus(tarefa) {
    const bruto = String(tarefa?.status || '').toLowerCase();

    if (bruto.includes('and')) return 'andamento';
    if (bruto.includes('concl')) return 'concluida';
    if (tarefa?.concluida) return 'concluida';

    return 'novo';
}

function aplicarViewMode() {
    cardsWrapper.classList.toggle('is-hidden', viewMode !== 'cards');
    tabelaWrapper.classList.toggle('is-hidden', viewMode !== 'table');

    btnViewCards.classList.toggle('active', viewMode === 'cards');
    btnViewTable.classList.toggle('active', viewMode === 'table');
}

function criarBadgeStatus(status) {
    return `<span class="status-pill ${status}">${STATUS_LABEL[status] || 'Novo'}</span>`;
}

function criarCardHtml(agenda) {
    const status = normalizarStatus(agenda);
    const descricao = agenda.descricao || '';
    return `
        <div class="agenda-card ${status}">
            <div class="agenda-card-title"><b>#${agenda.id}</b> ${agenda.titulo}</div>
            ${descricao ? `<div class="agenda-card-desc">${descricao}</div>` : ''}
            <div>${criarBadgeStatus(status)}</div>
        </div>
    `;
}


function renderCards() {
    listaCards.innerHTML = '';

    if (!agendas.length) {
        listaCards.innerHTML = '<div class="empty-state"><p>Nenhuma tarefa encontrada.</p></div>';
        return;
    }

    agendas.forEach((agendas) => {
        const card = document.createElement('div');
        card.innerHTML = criarCardHtml(agendas);
        const item = card.firstElementChild;
        item.addEventListener('click', () => {
            verTarefa(agendas.id);
        });
        listaCards.appendChild(item);
    });
}

function renderAgenda() {
    listaTabela.innerHTML = '';

    if (!agendas.length) {
        listaTabela.innerHTML = '<tr><td colspan="5">Nenhuma tarefa encontrada.</td></tr>';
        return;
    }

    agendas.forEach((agenda) => {
        const status = normalizarStatus(agenda);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${agenda.id}</td>
            <td>${agenda.titulo}</td>
            <td>${agenda.descricao || '-'}</td>
            <td>${criarBadgeStatus(status)}</td>
            <td class="table-actions">
                <button type="button" class="small" onclick="verTarefa(${agenda.id})">Ver</button>
                <button type="button" class="small" onclick="editarTarefa(${agenda.id})">Editar</button>
                <button type="button" class="small danger" onclick="excluirTarefa(${agenda.id})">Excluir</button>
            </td>
        `;
        listaTabela.appendChild(linha);
    });
}


function renderTudo() {
    renderCards();
    renderTabela();
    aplicarViewMode();
}

async function carregarTarefas() {
    try {
        const resposta = await apiRequest('/tarefas');

        if (Array.isArray(resposta)) {
            agendas = resposta;
        } else if (Array.isArray(resposta?.tarefas)) {
            agendas = resposta.tarefas;
        } else if (Array.isArray(resposta?.data)) {
            agendas = resposta.data;
        } else {
            agendas = [];
        }

        renderTudo();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar tarefas: ${erro.message}`, 'error');
    }
}

async function atualizarStatusApi(tarefa, novoStatus) {
    const payload = {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        status: novoStatus,
        concluida: novoStatus === 'concluida',
    };

    await apiRequest(`/tarefas/${tarefa.id}`, {
        method: 'PUT',
        body: payload,
    });
}

async function  moverTarefa(id, novoStatus) {
    const tarefa = agendas.find((item) => String(item.id) === String(id));
    if (!tarefa) return;

    try {
        await atualizarStatusApi(tarefa, novoStatus);

        tarefa.status = novoStatus;
        tarefa.concluida = novoStatus === 'concluida';

        renderTudo();
        mostrarResultado(`Status atualizado para ${STATUS_LABEL[novoStatus]}.`);
    } catch (erro) {
        mostrarResultado(`Erro ao atualizar status: ${erro.message}`, 'error');
    }
}

function configurarDrop(coluna, statusDestino) {
    coluna.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    coluna.addEventListener('drop', async (event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain');
        await moverTarefa(id, statusDestino);
    });
}

function getTarefaById(id) {
    return agendas.find((item) => String(item.id) === String(id));
}

function setCamposSomenteLeitura(somenteLeitura) {
    inputTitulo.readOnly = somenteLeitura;
    inputDescricao.readOnly = somenteLeitura;
    inputStatus.disabled = somenteLeitura;
}

function preencherModal(tarefa) {
    inputId.value = tarefa?.id || '';
    inputTitulo.value = tarefa?.titulo || '';
    inputDescricao.value = tarefa?.descricao || '';
    inputStatus.value = normalizarStatus(tarefa || {});
}

function aplicarModoModal() {
    const isCreate = modalMode === 'create';
    const isView = modalMode === 'view';

    setCamposSomenteLeitura(isView);

    btnModalSalvar.classList.toggle('is-hidden', isView);
    btnModalEditar.classList.toggle('is-hidden', !isView);
    btnModalExcluir.classList.toggle('is-hidden', isCreate);

    if (isCreate) {
        modalTitle.textContent = 'Nova tarefa';
        btnModalSalvar.textContent = 'Salvar';
    } else if (isView) {
        modalTitle.textContent = 'Detalhes da tarefa';
    } else {
        modalTitle.textContent = 'Editar tarefa';
        btnModalSalvar.textContent = 'Salvar alterações';
    }
}

function abrirNovaTarefa() {
    tarefaSelecionadaId = null;
    modalMode = 'create';
    preencherModal({ id: '', titulo: '', descricao: '', status: 'novo' });
    aplicarModoModal();
}

function verTarefa(id) {
    const tarefa = getTarefaById(id);
    if (!tarefa) return;

    tarefaSelecionadaId = tarefa.id;
    modalMode = 'view';
    preencherModal(tarefa);
    aplicarModoModal();
    tarefaModal?.show();
}

function editarTarefa(id = null) {
    const tarefa = getTarefaById(id || tarefaSelecionadaId);
    if (!tarefa) return;

    tarefaSelecionadaId = tarefa.id;
    modalMode = 'edit';
    preencherModal(tarefa);
    aplicarModoModal();
    tarefaModal?.show();
}

async function excluirTarefa(id = null) {
    const tarefa = getTarefaById(id || tarefaSelecionadaId);
    if (!tarefa) return;

    const confirmar = window.Swal
        ? await Swal.fire({
            icon: 'warning',
            text: `Excluir a tarefa "${tarefa.titulo}"?`,
            showCancelButton: true,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        })
        : { isConfirmed: confirm('Excluir esta tarefa?') };

    if (!confirmar.isConfirmed) return;

    try {
        await apiRequest(`/tarefas/${tarefa.id}`, { method: 'DELETE' });
        agendas = agendas.filter((item) => String(item.id) !== String(tarefa.id));
        tarefaModal?.hide();
        renderTudo();
        mostrarResultado('Tarefa excluída com sucesso.');
    } catch (erro) {
        mostrarResultado(`Erro ao excluir tarefa: ${erro.message}`, 'error');
    }
}

async function criarTarefa(event) {
    event.preventDefault();

    const id = inputId.value;
    const titulo = inputTitulo.value.trim();
    const descricao = inputDescricao.value.trim();
    const status = inputStatus.value;

    if (!titulo) return;

    try {
        if (modalMode === 'edit' && id) {
            const payload = { titulo, descricao, status, concluida: status === 'concluida' };
            const resposta = await apiRequest(`/tarefas/${id}`, {
                method: 'PUT',
                body: payload,
            });

            const index = agendas.findIndex((item) => String(item.id) === String(id));
            if (index >= 0) {
                agendas[index] = {
                    ...agendas[index],
                    ...payload,
                    ...(typeof resposta === 'object' ? resposta : {}),
                };
            }

            mostrarResultado('Tarefa atualizada com sucesso.');
        } else {
            const nova = await apiRequest('/tarefas', {
                method: 'POST',
                body: { titulo, descricao, status, concluida: status === 'concluida' },
            });

            if (nova && nova.id) {
                agendas.push({ ...nova, descricao, status, concluida: status === 'concluida' });
            } else {
                await carregarTarefas();
            }

            mostrarResultado('Tarefa criada com sucesso.');
        }

        renderTudo();
        if (tarefaModal) tarefaModal.hide();
        formTarefa.reset();
        inputStatus.value = 'novo';
        modalMode = 'create';
        tarefaSelecionadaId = null;
    } catch (erro) {
        mostrarResultado(`Erro ao salvar tarefa: ${erro.message}`, 'error');
    }
}

btnViewCards.addEventListener('click', () => {
    viewMode = 'cards';
    aplicarViewMode();
});

btnViewTable.addEventListener('click', () => {
    viewMode = 'table';
    aplicarViewMode();
});

formTarefa.addEventListener('submit', criarTarefa);

btnNovaTarefa.addEventListener('click', abrirNovaTarefa);
btnModalEditar.addEventListener('click', () => editarTarefa());
btnModalExcluir.addEventListener('click', () => excluirTarefa());

window.verTarefa = verTarefa;
window.editarTarefa = editarTarefa;
window.excluirTarefa = excluirTarefa;

configurarDrop(colunaNovo, 'novo');
configurarDrop(colunaAndamento, 'andamento');
configurarDrop(colunaConcluida, 'concluida');

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    await ListarPets();
});

async function ListarPets() {
    try {
        const perfil = await apiRequest('/usuarios/perfil');

        const pets = await apiRequest('/pets/usuario/' + perfil.id, {
            method: 'GET'
        });

        const selectPet = document.getElementById('agendamento-pet');

        // Limpa opções existentes
        selectPet.innerHTML = '<option value="">Selecione um pet</option>';

        // Adiciona os pets retornados pela API
        pets.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id;      // Armazena o ID
            option.textContent = pet.nome; // Exibe o nome
            selectPet.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao listar pets:', error);
    }
}
