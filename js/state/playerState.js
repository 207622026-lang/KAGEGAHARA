/**
 * Controlador de Estado e Persistência do Jogador
 * Gerencia a ficha do personagem, atributos, XP e salvamento em localStorage.
 */
export class PlayerState {
    constructor() {
        this.saveKey = "kagegahara_player_save";
        this.state = this.getDefaultState();
    }

    /**
     * Retorna o modelo padrão do estado inicial.
     */
    getDefaultState() {
        return {
            profile: {
                name: "",
                clan: "",
                element: "",
                background: "",
                level: 1,
                xp: 0,
                attributes: {
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
                },
                psychology: {
                    activeTraumas: [],
                    unlockedConvictions: [],
                    confidence: 50
                }
            },
            resources: {
                hp: 100,
                maxHp: 100,
                mp: 75,
                maxMp: 75,
                ryo: 500
            },
            skills: {
                unlocked: [],
                equipped: [null, null, null, null],
                points: 0
            },
            inventory: {
                items: [],
                equipment: {
                    mainHand: null,
                    offHand: null,
                    head: null,
                    body: null,
                    accessory: null
                }
            },
            quests: {
                active: [],
                completed: [],
                choices: {}
            },
            npre_database: {}
        };
    }

    /**
     * Verifica se existe um salvamento anterior no navegador.
     */
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Carrega os dados do localStorage.
     */
    load() {
        try {
            const rawData = localStorage.getItem(this.saveKey);
            if (rawData) {
                this.state = JSON.parse(rawData);
                return true;
            }
        } catch (e) {
            console.error("Falha ao carregar save state:", e);
        }
        return false;
    }

    /**
     * Salva o estado atual no localStorage.
     */
    save() {
        try {
            const dataString = JSON.stringify(this.state);
            localStorage.setItem(this.saveKey, dataString);
            return true;
        } catch (e) {
            console.error("Falha ao salvar jogo:", e);
            return false;
        }
    }

    /**
     * Exclui o arquivo de salvamento.
     */
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        this.state = this.getDefaultState();
    }

    /**
     * Inicializa os dados básicos do personagem criado.
     */
    initCharacter(name, clan, element, background, allocatedAttributes) {
        this.state.profile.name = name;
        this.state.profile.clan = clan;
        this.state.profile.element = element;
        this.state.profile.background = background;
        
        // Copia atributos distribuídos
        Object.keys(allocatedAttributes).forEach(stat => {
            this.state.profile.attributes[stat] = allocatedAttributes[stat];
        });

        // Configura vida e chakra iniciais baseado nos atributos
        this.recalculateResources();
        
        // Configura trauma/convicção inicial baseado no histórico
        if (background === "sobrevivente") {
            this.state.profile.psychology.unlockedConvictions.push("foco_de_vinganca");
            this.state.profile.psychology.activeTraumas.push("ansiedade_do_vazio");
        } else if (background === "prodigio") {
            this.state.profile.psychology.unlockedConvictions.push("perfeccionismo");
        } else if (background === "exilado") {
            this.state.profile.psychology.unlockedConvictions.push("orgulho_ferido");
        }

        // Adiciona itens iniciais dependendo do clã
        this.addInitialItemsByClan(clan);

        this.save();
    }

    /**
     * Recalcula o HP e MP máximo baseado nos atributos.
     */
    recalculateResources() {
        const attrs = this.state.profile.attributes;
        const maxHp = (attrs.vitality * 15) + (attrs.resistance * 5);
        const maxMp = (attrs.intelligence * 5) + (attrs.chakraControl * 10);
        
        this.state.resources.maxHp = maxHp;
        this.state.resources.maxMp = maxMp;
        this.state.resources.hp = maxHp; // Cura completa ao iniciar/recalcular
        this.state.resources.mp = maxMp;
    }

    /**
     * Fornece itens temáticos iniciais baseados no clã.
     */
    addInitialItemsByClan(clan) {
        const items = this.state.inventory.items;
        items.push({ id: "item_shuriken", quantity: 10 });
        items.push({ id: "item_pula_chakra", quantity: 3 });
        
        if (clan === "Kurogane") {
            this.state.inventory.equipment.mainHand = "item_iron_tanto";
        } else {
            this.state.inventory.equipment.mainHand = "item_academy_knife";
        }
    }

    /**
     * Adiciona experiência ao jogador e processa level ups.
     * @param {number} amount - Quantidade de XP ganha
     * @returns {Object} Detalhes de subida de nível
     */
    addXp(amount) {
        this.state.profile.xp += amount;
        let leveledUp = false;
        let pointsEarned = 0;

        while (true) {
            const nextLvlXp = this.getXpRequiredForNextLevel(this.state.profile.level);
            if (this.state.profile.xp >= nextLvlXp) {
                this.state.profile.xp -= nextLvlXp;
                this.state.profile.level++;
                leveledUp = true;
                pointsEarned += 3;
            } else {
                break;
            }
        }

        if (leveledUp) {
            this.recalculateResources();
            this.save();
        }

        return {
            leveledUp,
            currentLevel: this.state.profile.level,
            pointsEarned
        };
    }

    /**
     * Calcula o XP necessário para o próximo nível com base na fórmula do GDD.
     */
    getXpRequiredForNextLevel(level) {
        return Math.round(100 * Math.pow(level, 1.8) + 50 * level);
    }
}
