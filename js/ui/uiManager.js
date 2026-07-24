import { DiceEngine } from '../systems/dice.js';

export class UIManager {
    constructor(playerState) {
        this.playerState = playerState;
        this.allocatedStats = {
            strength: 5,
            agility: 5,
            vitality: 5,
            intelligence: 5,
            chakraControl: 5,
            resistance: 5,
            speed: 5,
            perception: 5,
            charisma: 5,
            luck: 5
        };
        this.statPool = 10;
        this.activeDice = 20; // D20 padrão inicial

        this.statLabels = {
            strength: { name: "Força (FOR)", desc: "Dano de Taijutsu e limite de carga" },
            agility: { name: "Agilidade (AGI)", desc: "Taxa de crítico físico e furtividade" },
            vitality: { name: "Vitalidade (VIT)", desc: "Pontos de Vida (PV) e regeneração" },
            intelligence: { name: "Inteligência (INT)", desc: "Dano de Ninjutsu e poder de Genjutsu" },
            chakraControl: { name: "Controle de Chakra (CON)", desc: "Reduz custo de técnicas e aumenta PC" },
            resistance: { name: "Resistência (RES)", desc: "Reduz dano recebido e fadiga" },
            speed: { name: "Velocidade (VEL)", desc: "Ordem do turno e chance de esquiva" },
            perception: { name: "Percepção (PER)", desc: "Detecta inimigos furtivos e segredos" },
            charisma: { name: "Carisma (CAR)", desc: "Preços de mercadores e opções de diálogo" },
            luck: { name: "Sorte (SOR)", desc: "Melhora drop de itens e rolagens críticas" }
        };
    }

    /**
     * Inicializa os ouvintes de evento e monta a interface.
     */
    init() {
        this.renderAttributesCreatorList();
        this.setupCreatorSelectors();
        this.setupDiceRoller();
        this.setupStartButton();
        this.checkExistingSave();
    }

    /**
     * Verifica se já existe um jogo salvo. Se houver, carrega direto na HUD.
     */
    checkExistingSave() {
        if (this.playerState.hasSave()) {
            const loaded = this.playerState.load();
            if (loaded) {
                this.showNotification("Jogo salvo carregado com sucesso!", "success");
                this.showHUD();
            }
        }
    }

    /**
     * Transita entre as telas da aplicação.
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(scr => {
            scr.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    /**
     * Mostra uma notificação flutuante temporária.
     */
    showNotification(msg, type = "info") {
        const bar = document.getElementById('notification-bar');
        if (!bar) return;
        
        bar.textContent = msg;
        bar.className = `notification-bar ${type}`;
        bar.style.opacity = '1';
        
        setTimeout(() => {
            bar.style.opacity = '0';
        }, 3000);
    }

    /**
     * Monta dinamicamente as linhas de distribuição de atributos.
     */
    renderAttributesCreatorList() {
        const container = document.querySelector('.attributes-list');
        if (!container) return;
        
        container.innerHTML = "";

        Object.keys(this.allocatedStats).forEach(stat => {
            const meta = this.statLabels[stat];
            const val = this.allocatedStats[stat];
            
            const row = document.createElement('div');
            row.className = "attribute-row";
            row.innerHTML = `
                <div class="attr-info">
                    <span class="attr-name">${meta.name}</span>
                    <span class="attr-desc">${meta.desc}</span>
                </div>
                <div class="attr-controls">
                    <button class="btn btn-secondary btn-circle btn-minus" data-stat="${stat}">-</button>
                    <span class="attr-val" id="val-${stat}">${val}</span>
                    <button class="btn btn-secondary btn-circle btn-plus" data-stat="${stat}">+</button>
                </div>
            `;
            
            container.appendChild(row);
        });

        // Eventos para botões +/-
        container.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('btn-plus')) {
                this.modifyAttribute(target.dataset.stat, 1);
            } else if (target.classList.contains('btn-minus')) {
                this.modifyAttribute(target.dataset.stat, -1);
            }
        });
    }

    /**
     * Executa o ajuste de atributos respeitando os limites e a reserva de pontos.
     */
    modifyAttribute(stat, delta) {
        if (delta > 0 && this.statPool > 0) {
            this.allocatedStats[stat]++;
            this.statPool--;
        } else if (delta < 0 && this.allocatedStats[stat] > 5) {
            this.allocatedStats[stat]--;
            this.statPool++;
        } else {
            return; // Nenhuma mudança possível
        }

        // Atualiza a visualização
        document.getElementById(`val-${stat}`).textContent = this.allocatedStats[stat];
        document.getElementById('remaining-points').textContent = this.statPool;
        
        this.validateCreatorForm();
    }

    /**
     * Configura seletores visuais de Clã, Elemento e Antecedente.
     */
    setupCreatorSelectors() {
        // Clãs
        document.querySelectorAll('.clan-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.clan-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.validateCreatorForm();
            });
        });

        // Elementos
        document.querySelectorAll('.element-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.element-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.validateCreatorForm();
            });
        });

        // Antecedentes
        document.querySelectorAll('.psych-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.psych-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.validateCreatorForm();
            });
        });

        // Monitor do nome
        document.getElementById('char-name').addEventListener('input', () => {
            this.validateCreatorForm();
        });
    }

    /**
     * Valida os campos da criação de personagem antes de liberar o início do jogo.
     */
    validateCreatorForm() {
        const nameInput = document.getElementById('char-name');
        const nameVal = nameInput ? nameInput.value.trim() : "";
        const isNameValid = nameVal.length >= 2;
        const isPoolEmpty = this.statPool === 0;

        const btn = document.getElementById('btn-start-game');
        if (btn) {
            btn.disabled = !(isNameValid && isPoolEmpty);
        }
    }

    /**
     * Configura o botão de confirmar criação.
     */
    setupStartButton() {
        const btn = document.getElementById('btn-start-game');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const name = document.getElementById('char-name').value.trim();
            const clan = document.querySelector('.clan-card.active').dataset.clan;
            const element = document.querySelector('.element-card.active').dataset.element;
            const bg = document.querySelector('.psych-card.active').dataset.bg;

            this.playerState.initCharacter(name, clan, element, bg, this.allocatedStats);
            this.showNotification("Sua jornada shinobi começou!", "success");
            this.showHUD();
        });
    }

    /**
     * Transita da tela de criação para o painel de HUD do jogador.
     */
    showHUD() {
        const p = this.playerState.state.profile;
        const res = this.playerState.state.resources;
        
        // Atualiza cabeçalho global
        const summary = document.getElementById('player-summary');
        summary.classList.remove('hidden');
        document.getElementById('summary-name').textContent = p.name;
        document.getElementById('summary-clan').textContent = p.clan;
        document.getElementById('summary-level').textContent = `Nível ${p.level}`;

        // Tela HUD específica
        document.getElementById('hud-name').textContent = p.name;
        document.getElementById('hud-clan').textContent = p.clan;
        document.getElementById('hud-element').textContent = p.element;
        document.getElementById('hud-bg').textContent = p.background.toUpperCase();

        // Renderiza lista de atributos estática na ficha
        const attrsView = document.getElementById('hud-attributes-view');
        attrsView.innerHTML = "";
        
        Object.keys(p.attributes).forEach(stat => {
            const meta = this.statLabels[stat];
            const val = p.attributes[stat];
            
            const card = document.createElement('div');
            card.className = "stat-item-view";
            card.innerHTML = `
                <span>${meta.name.split(' ')[0]}</span>
                <strong>${val}</strong>
            `;
            attrsView.appendChild(card);
        });

        // Configura opções de modificadores do rolo de dados
        const select = document.getElementById('roll-stat-modifier');
        select.innerHTML = `<option value="none">Sem Modificador (+0)</option>`;
        Object.keys(p.attributes).forEach(stat => {
            const label = this.statLabels[stat].name.split(' ')[0];
            const val = p.attributes[stat];
            const modVal = Math.floor((val - 5) / 2); // Fórmula de modificador padrão dnd-like ou baseada na escala
            select.innerHTML += `<option value="${stat}">Mod. de ${label} (+${modVal})</option>`;
        });

        this.showScreen('screen-hud');
    }

    /**
     * Gerencia a aba de rolagem de dados e as reações dinâmicas do NPRE.
     */
    setupDiceRoller() {
        const diceBtns = document.querySelectorAll('.dice-btn');
        diceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                diceBtns.forEach(b => b.classList.remove('glass-btn-active'));
                btn.classList.add('glass-btn-active');
                this.activeDice = parseInt(btn.dataset.dice);
            });
        });

        const btnRoll = document.getElementById('btn-roll-dice');
        if (!btnRoll) return;

        btnRoll.addEventListener('click', () => {
            const statSelect = document.getElementById('roll-stat-modifier');
            const selectedStat = statSelect.value;
            
            let modifier = 0;
            if (selectedStat !== 'none') {
                const statVal = this.playerState.state.profile.attributes[selectedStat];
                modifier = Math.floor((statVal - 5) / 2); // Ex: 5=0, 7=+1, 9=+2, etc.
            }

            // Mestre Yusei é o comentador padrão
            const yuseiProfile = {
                name: "Mestre Yusei",
                avatar: "👺",
                personality: { autocontrol: 8, empathy: 6 }
            };

            // Rola contra uma CD aleatória média de 12 para D20, ou puramente
            const cd = 12;
            const result = DiceEngine.testActionWithReaction(this.activeDice, modifier, cd, yuseiProfile);
            
            // Renderiza resultado
            const resultVal = document.getElementById('dice-display-result');
            const resultDetails = document.getElementById('dice-display-details');
            
            resultVal.textContent = result.roll.finalResult;
            resultVal.className = "result-number";
            
            if (result.roll.isCritSuccess) {
                resultVal.classList.add('crit-success');
                resultDetails.className = "result-details crit-success";
                resultDetails.innerHTML = `SUCESSO CRÍTICO!<br>Rolado: <strong>${result.roll.naturalRoll}</strong> + Modificador: <strong>${result.roll.modifier}</strong>`;
            } else if (result.roll.isCritFailure) {
                resultVal.classList.add('crit-failure');
                resultDetails.className = "result-details crit-failure";
                resultDetails.innerHTML = `FALHA CRÍTICA!<br>Rolado: <strong>${result.roll.naturalRoll}</strong> + Modificador: <strong>${result.roll.modifier}</strong>`;
            } else {
                resultDetails.className = "result-details";
                resultDetails.innerHTML = `Resultado: <strong>${result.roll.finalResult}</strong> (D${this.activeDice} Natural: <strong>${result.roll.naturalRoll}</strong> + Mod: <strong>${result.roll.modifier}</strong>)<br>
                Classe de Dificuldade (CD): <strong>${cd}</strong> - ${result.success ? 'APROVADO' : 'FALHOU'}`;
            }

            // Exibe balão NPRE
            document.getElementById('npre-speaker-name').textContent = result.reaction.speakerName;
            document.getElementById('npre-speaker-emotion').textContent = result.reaction.emotion;
            document.getElementById('npre-speaker-text').textContent = result.reaction.text;

            // Altera estilo emocional no balão visual
            const emotionLabel = document.getElementById('npre-speaker-emotion');
            if (result.reaction.emotion === "Admiração" || result.reaction.emotion === "Alegria") {
                emotionLabel.style.borderColor = "var(--color-success)";
                emotionLabel.style.color = "var(--color-success)";
                emotionLabel.style.background = "rgba(51, 204, 102, 0.15)";
            } else if (result.reaction.emotion === "Frustração" || result.reaction.emotion === "Desprezo") {
                emotionLabel.style.borderColor = "var(--color-secondary)";
                emotionLabel.style.color = "var(--color-secondary)";
                emotionLabel.style.background = "rgba(255, 51, 102, 0.15)";
            } else {
                emotionLabel.style.borderColor = "var(--color-primary)";
                emotionLabel.style.color = "var(--color-primary)";
                emotionLabel.style.background = "rgba(0, 210, 196, 0.15)";
            }
        });
    }
}
