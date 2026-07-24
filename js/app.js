/**
 * Kagegahara: Motor de RPG Narrativo Visual Novel Autônomo (HUD-less / Persona 5 / Disco Style)
 * Roteiro 100% Inédito: O Caçador das Sombras (5 Atos Épicos de Fantasia Sombria, Horror e Redenção)
 */

// --- BANCO DE DADOS DE TRADUÇÕES ---
const TRAUMA_MAP = {
    "ansiedade_do_vazio": "Ansiedade do Vazio",
    "peso_do_sangue": "Peso do Sangue",
    "orgulho_cego": "Orgulho Cego",
    "braco_de_pedra": "Braço de Pedra (Maldição)",
    "olhar_quebrado": "Olhar Quebrado (Cegueira parcial)",
    "mente_corrompida": "Mente Corrompida (Loucura)"
};

const CONVICTION_MAP = {
    "caminho_da_clemencia": "Caminho da Clemência",
    "resistencia_de_aco": "Resistência de Aço",
    "preparacao_tatica": "Preparação Tática",
    "luz_de_sayuri": "Luz de Sayuri (Redenção)"
};

const STAT_NAMES = {
    strength: "Força", agility: "Agilidade", vitality: "Vitalidade", intelligence: "Inteligência",
    chakraControl: "Controle de Chakra", resistance: "Resistência", speed: "Velocidade",
    perception: "Percepção", charisma: "Carisma", luck: "Sorte"
};

const ITEM_NAMES = {
    "item_shuriken": "10x Shurikens",
    "item_pula_chakra": "3x Ervas de Restauração",
    "item_iron_tanto": "Tanto de Ferro (Equipado)",
    "item_academy_knife": "Faca de Academia (Equipada)",
    "compasso_da_nevoa": "Bússola de Névoa",
    "pocao_camuflagem": "Poção de Camuflagem de Lodo",
    "coracao_obsidiana": "Coração Flamejante de Veldrak"
};

// --- INTRODUÇÃO CINEMATOGRÁFICA (SLIDES DE HISTÓRIA E LORE) ---
const INTRO_SLIDES = [
    {
        text: "O mundo shinobi sempre foi regido pelo ferro do Soberano ditador. A pobreza assola as fronteiras, e a vida de um caçador criminoso é a única forma de sobrevivência.",
        bg: "starry_mountains"
    },
    {
        text: "Sua esposa, Sayuri, foi a única que aceitou sua essência imperfeita. Mas para salvá-lo da Besta de Obsidiana (uma Quimera Medusa), ela sacrificou-se, transformando-se em uma fria estátua de pedra no templo da aldeia.",
        bg: "sleeping_dragon"
    },
    {
        text: "Para quebrar a maldição, você precisa atravessar as fronteiras proibidas do País do Ferro, caçar bestas ancestrais e roubar a lendária poção do renascimento na Fortaleza de Obsidiana.",
        bg: "swamp_forest"
    }
];

// --- ANÁLISE DE LINGUAGEM NATURAL (KEYWORDS) ---
function cleanText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
        .trim();
}

function matches(cleaned, keywords) {
    const words = cleaned.split(/\s+/);
    return keywords.some(k => words.some(w => w === k || w.startsWith(k)));
}

// --- BASE DE DADOS NARRATIVA (STORY NODES) ---
const STORY_NODES = {
    // ================= ATO I: O CHECKPOINT DE FERRO =================
    "prologue_entry": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A lua escarlate de sangue brilha entre as nuvens de tormenta, derramando uma luz doentia sobre os portões militares da aldeia. Uma chuva ácida e gélida castiga o solo, corroendo lentamente as telhas de ferro. O ar cheira a enxofre e metal queimado. Você sente calafrios violentos percorrendo sua espinha; os dentes batem com o frio implacável.\n\nSendo caçado como um criminoso imundo por toda a aldeia por causa do seu passado de roubos e desonestidade, sua única chance de redenção é cruzar essa muralha e salvar sua esposa petrificada, Sayuri.\n\nMestre Yusei, o receptador de mercado negro, aguarda encostado em uma pilha de caixotes nas sombras.",
        choices: [
            { text: "Conversar com o receptador Yusei sobre a rota de fuga", nextNode: "prologue_start" },
            { text: "Analisar as rotas de patrulha dos guardas sob a chuva", nextNode: "prologue_perception_entry" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return { nextNode: "prologue_entry" };
            if (matches(clean, ["chamar", "falar", "perguntar", "yusei", "mestre", "conversar", "receptador"])) {
                return { nextNode: "prologue_start" };
            }
            if (matches(clean, ["olhar", "observar", "analisar", "nevoa", "redor", "patrulha", "guardas"])) {
                return { nextNode: "prologue_perception_entry" };
            }
            return { nextNode: "prologue_start" };
        }
    },
    "prologue_perception_entry": {
        background: "kaede_gates",
        narrative: "Você foca seu chakra nos olhos, tentando enxergar os contornos dos guardas através da névoa esverdeada.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "perception",
                    cd: 10,
                    successNode: "prologue_perception_success",
                    failureNode: "prologue_perception_fail"
                }
            };
        }
    },
    "prologue_perception_success": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Suas vistas ardem levemente, mas você mapeia o padrão dos guardas da ditadura. Você percebe que o portão leste é guarnecido por apenas um soldado novato e trêmulo, que se encolhe do frio sob a chuva.\n\nYusei sussurra com um sorriso cínico:\n\n— O parasita tem olhos de lince. Mas lembre-se: se te pegarem, eu nunca te vi.",
        choices: [
            { text: "Avançar até o portão leste silenciosamente", nextNode: "prologue_checkpoint_confront" }
        ],
        processAction: (text, player) => {
            player.convictions.push("preparacao_tatica");
            return { nextNode: "prologue_checkpoint_confront" };
        }
    },
    "prologue_perception_fail": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A fumaça ácida queima suas retinas. Você pisca repetidamente, desorientado pelo vento frio. Suas botas rangem contra as pedras molhadas, chamando a atenção de Yusei, que bufa de irritação.",
        choices: [
            { text: "Falar com Yusei para recompor a postura", nextNode: "prologue_start" }
        ],
        processAction: (text, player) => {
            return { nextNode: "prologue_start" };
        }
    },
    "prologue_start": {
        background: "kaede_gates",
        speaker: "Mestre Yusei",
        emotion: "Preocupado",
        dialogue: "Você continua sendo um lixo egoísta, Kenji...\n\nMas o dinheiro de Sayuri ainda tem valor. Para cruzar o portão, você terá que passar por aquele recruta assustado. O que vai fazer?",
        narrative: "Yusei cospe no chão molhado, demonstrando o mesmo asco e preconceito que toda a aldeia tem de você. O jovem soldado bate a armadura de ferro nas sombras do portão.",
        choices: [
            { text: "Emboscar e assassinar o jovem recruta silenciosamente", nextNode: "prologue_recruit_kill" },
            { text: "Usar Jutsu de Substituição (Kawarimi) para cruzar sem ser visto", nextNode: "prologue_recruit_sneak" },
            { text: "Tentar render o soldado sem matá-lo", nextNode: "prologue_recruit_spare" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return { nextNode: "prologue_start" };
            if (matches(clean, ["matar", "assassinar", "executar", "soco", "bater"])) {
                return { nextNode: "prologue_recruit_kill" };
            }
            if (matches(clean, ["substituicao", "kawarimi", "clone", "furtivo"])) {
                return { nextNode: "prologue_recruit_sneak" };
            }
            return { nextNode: "prologue_recruit_spare" };
        }
    },
    "prologue_checkpoint_confront": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você rasteja sob os caixotes de ferro. O jovem recruta da ditadura escuta o som dos seus passos na lama e aponta sua lança nervosamente para a escuridão:\n\n— Quem está aí? Identifique-se ou eu atiro!",
        choices: [
            { text: "Tentar nocauteá-lo com agilidade", nextNode: "prologue_recruit_kill" },
            { text: "Chacotear de seu medo para confundi-lo", nextNode: "prologue_recruit_spare" }
        ],
        processAction: (text, player) => {
            return { nextNode: "prologue_recruit_kill" };
        }
    },
    "prologue_recruit_kill": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sua faca de caçador desliza fria pelo pescoço do jovem soldado antes que ele dê o alarme. O corpo dele desaba sem vida na lama. Yusei observa a cena com escárnio:\n\n— Mais sangue inocente nas suas costas, Kenji. Você nunca mudará.",
        choices: [
            { text: "Fugir para a Floresta Negra dos Vigilantes", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            player.traumas.push("peso_do_sangue");
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_recruit_sneak": {
        background: "kaede_gates",
        narrative: "Você faz uma sequência rápida de selos de mão e usa o Jutsu de Substituição para trocar de lugar com um tronco de bambu no momento em que o recruta se vira.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "prologue_sneak_success",
                    failureNode: "prologue_sneak_fail"
                }
            };
        }
    },
    "prologue_sneak_success": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O recruta chuta o bambu, confuso, enquanto você já rola para fora das paliçadas de ferro do portão, sumindo na escuridão da tempestade.",
        choices: [
            { text: "Entrar na Floresta Negra", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            player.convictions.push("caminho_da_clemencia");
            player.xp += 50;
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_sneak_fail": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu pé prende em um cabo de arame farpado. O recruta dispara um sinal luminoso de chakra que explode no céu. Você toma um golpe de lança de raspão no braço (Perde 20 PV) antes de conseguir pular a cerca nas sombras.",
        choices: [
            { text: "Correr sangrando para a floresta", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 20);
            player.traumas.push("ansiedade_do_vazio");
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_recruit_spare": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você ergue as mãos vazias, usando sua lábia cínica de ladrão. O soldado novato hesita, tremendo sob o frio, e decide aceitar seu suborno de shurikens em silêncio, fingindo não ver sua passagem.\n\n— Vá embora... antes que os oficiais venham — sussurra o rapaz.",
        choices: [
            { text: "Cruzar o portão livre", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            player.convictions.push("caminho_da_clemencia");
            player.xp += 30;
            return { nextNode: "act2_forest_entry" };
        }
    },

    // ================= ATO II: A FLORESTA DOS VIGILANTES =================
    "act2_forest_entry": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você adentra a lendária Floresta Negra dos Vigilantes. Aqui, a luz do sol nunca tocou o solo. O silêncio é sufocante, quebrado apenas por esporos luminosos e tóxicos que flutuam no ar gélido.\n\nNas cascas dos troncos cinzentos, rostos humanos distorcidos em agonia parecem te observar. Um arrepio horripilante toma sua espinha: as árvores parecem se aproximar toda vez que você pisca ou desvia a visão.\n\n(Seu medidor de SANIDADE começou a drenar).",
        choices: [
            { text: "Controlar a respiração e concentrar chakra para focar a mente", nextNode: "act2_forest_meditate" },
            { text: "Rastrear o Mutante de Névoa que ronda a floresta", nextNode: "act2_forest_hunt" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["rastrear", "mutante", "nevoa", "cacada", "bussola"])) {
                return { nextNode: "act2_forest_hunt" };
            }
            return { nextNode: "act2_forest_meditate" };
        }
    },
    "act2_forest_meditate": {
        background: "swamp_forest",
        narrative: "Você fecha os olhos e foca seu fluxo de chakra para criar uma barreira mental contra os esporos de loucura.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act2_meditate_success",
                    failureNode: "act2_meditate_fail"
                }
            };
        }
    },
    "act2_meditate_success": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sua mente se estabiliza. O sussurro dos fantasmas de Sayuri pedindo para você desistir recua em silêncio. Você recupera 20 de Sanidade e 15 de Chakra.",
        choices: [
            { text: "Prosseguir caçando o Mutante da Névoa", nextNode: "act2_forest_hunt" }
        ],
        processAction: (text, player) => {
            player.sanity = Math.min(100, player.sanity + 20);
            player.mp = Math.min(player.maxMp, player.mp + 15);
            return { nextNode: "act2_forest_hunt" };
        }
    },
    "act2_meditate_fail": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Os esporos invadem seus pulmões. Rostos na casca das árvores começam a piscar nos cantos dos seus olhos, zombando de você:\n\n'Sayuri já está morta... você a abandonou para morrer!'\n\n(Você perde 30 de Sanidade e tem alucinações).",
        choices: [
            { text: "Atacar as sombras em pânico em busca de saída", nextNode: "act2_forest_hallucination" }
        ],
        processAction: (text, player) => {
            player.sanity = Math.max(0, player.sanity - 30);
            player.traumas.push("mente_corrompida");
            return { nextNode: "act2_forest_hallucination" };
        }
    },
    "act2_forest_hallucination": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Em seu delírio, você gasta 3 shurikens atacando sombras imaginárias que pareciam garras no escuro. Seus braços estão cortados pelos galhos das árvores que se aproximaram (Perde 10 PV).",
        choices: [
            { text: "Forçar a caminhada até o centro da floresta", nextNode: "act2_forest_hunt" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 10);
            return { nextNode: "act2_forest_hunt" };
        }
    },
    "act2_forest_hunt": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A névoa se condensa em uma gosma fria. Diante de você, ergue-se o Mutante de Névoa — um humanoide deformado de três metros, com a bússola do mapa cravada em seu estômago translúcido. Ele ruge, soltando bafo ácido.\n\nAs árvores com rostos se alinham ao redor, cercando o combate.",
        choices: [
            { text: "Usar Jutsu de Fogo (Katon) nas feridas expostas dele", nextNode: "act2_mutant_katon" },
            { text: "Avançar para desferir cortes rápidos com a Tanto", nextNode: "act2_mutant_tanto" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (matches(clean, ["katon", "fogo", "chama", "jutsu"])) {
                return { nextNode: "act2_mutant_katon" };
            }
            return { nextNode: "act2_mutant_tanto" };
        }
    },
    "act2_mutant_katon": {
        background: "swamp_forest",
        narrative: "Você executa selos de mão e dispara uma bola de fogo focada no estômago do mutante para expor a bússola.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_fail"
                }
            };
        }
    },
    "act2_mutant_tanto": {
        background: "swamp_forest",
        narrative: "Você usa sua agilidade shinobi para escalar as costas do monstro e desferir golpes rápidos.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 13,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_fail"
                }
            };
        }
    },
    "act2_mutant_success": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu golpe arranca o núcleo gélido do monstro, desintegrando seu corpo em cinzas úmidas. Você recupera a **Bússola de Névoa** (Adicionada ao inventário) e ganha 100 XP.",
        choices: [
            { text: "Seguir a bússola até o Pântano da Putrefação (Ato III)", nextNode: "act3_swamp_entry" }
        ],
        processAction: (text, player) => {
            player.inventory.push("compasso_da_nevoa");
            player.xp += 100;
            return { nextNode: "act3_swamp_entry" };
        }
    },
    "act2_mutant_fail": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O mutante te golpeia no peito, arremessando-o contra o tronco de uma árvore que morde seu ombro com seus dentes de casca (Perde 20 PV). Você usa seu último recurso para arrancar a bússola dele, fugindo em pânico da floresta.",
        choices: [
            { text: "Escapar para o Pântano cambaleando", nextNode: "act3_swamp_entry" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 20);
            player.inventory.push("compasso_da_nevoa");
            return { nextNode: "act3_swamp_entry" };
        }
    },

    // ================= ATO III: O PÂNTANO DA PUTREFAÇÃO =================
    "act3_swamp_entry": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você chega ao imenso Pântano das Almas Perdidas. Uma vastidão de lama movediça preta e bolhas de gás venenoso. Sob a superfície lodosa, tentáculos negros de proporções titânicas se movem lentamente: é o Kraken de Lama dos Abismos.\n\nNo centro do lodo, há uma cabana flutuante sustentada por ossos de baleia. Uma Bruxa do Pântano te observa da janela.",
        choices: [
            { text: "Entrar na cabana e propor um Pacto de Sangue com a Bruxa", nextNode: "act3_swamp_witch" },
            { text: "Combater o Kraken diretamente usando seu chakra de Suiton/Doton", nextNode: "act3_swamp_fight" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["lutar", "combater", "kraken", "tentaculo", "bater"])) {
                return { nextNode: "act3_swamp_fight" };
            }
            return { nextNode: "act3_swamp_witch" };
        }
    },
    "act3_swamp_witch": {
        background: "swamp_mud",
        speaker: "Bruxa do Pântano",
        emotion: "Preocupado",
        dialogue: "Você cheira a desonestidade, ladrão...\n\nEu posso esconder sua presença do Kraken. Mas o preço é o seu olho esquerdo ou parte de suas forças.",
        narrative: "A bruxa gargalha, estendendo uma poção verdejante. A fumaça da lareira causa alucinações frias.",
        choices: [
            { text: "Entregar o olho esquerdo (Ganha trauma 'Olhar Quebrado')", nextNode: "act3_witch_eye" },
            { text: "Oferecer 30 de Vitalidade Permanente (Perde 30 de HP máximo)", nextNode: "act3_witch_vitality" }
        ],
        processAction: (text, player) => {
            return { nextNode: "act3_witch_eye" };
        }
    },
    "act3_witch_eye": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A bruxa arranca a visão do seu olho com uma agulha de osso. A dor é excruciante (Perde 10 PV). Você ganha o trauma **'Olhar Quebrado'** e a **Poção de Camuflagem**.",
        choices: [
            { text: "Beber a poção e cruzar o pântano em silêncio", nextNode: "act3_swamp_safe_cross" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 10);
            player.traumas.push("olhar_quebrado");
            player.inventory.push("pocao_camuflagem");
            return { nextNode: "act3_swamp_safe_cross" };
        }
    },
    "act3_witch_vitality": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A bruxa suga suas forças com um beijo de lodo gélido. Suas veias murcham (Seu HP máximo é reduzido para sempre em 30). Você ganha a **Poção de Camuflagem**.",
        choices: [
            { text: "Beber a poção e avançar", nextNode: "act3_swamp_safe_cross" }
        ],
        processAction: (text, player) => {
            player.maxHp = Math.max(50, player.maxHp - 30);
            player.hp = Math.min(player.maxHp, player.hp);
            player.inventory.push("pocao_camuflagem");
            return { nextNode: "act3_swamp_safe_cross" };
        }
    },
    "act3_swamp_safe_cross": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Camuflado pelo lodo da poção, você passa entre os tentáculos do Kraken que emergem da lama sem te notar. Você alcança a entrada das catacumbas do labirinto.",
        choices: [
            { text: "Entrar no Labirinto das Ossadas (Ato IV)", nextNode: "act4_labyrinth_entry" }
        ],
        processAction: (text, player) => {
            return { nextNode: "act4_labyrinth_entry" };
        }
    },
    "act3_swamp_fight": {
        background: "swamp_mud",
        narrative: "Você foca em esquivar dos tentáculos gigantes e golpear o olho do Kraken de Lama.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
                    cd: 14,
                    successNode: "act3_fight_success",
                    failureNode: "act3_fight_fail"
                }
            };
        }
    },
    "act3_fight_success": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Com um golpe brutal revestido de chakra, você arranca três tentáculos do Kraken. O monstro ruge de dor e afunda nas profundezas do lodo, liberando a travessia. Você ganha 150 XP.",
        choices: [
            { text: "Avançar até as escadas do labirinto", nextNode: "act4_labyrinth_entry" }
        ],
        processAction: (text, player) => {
            player.xp += 150;
            return { nextNode: "act4_labyrinth_entry" };
        }
    },
    "act3_fight_fail": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Um tentáculo lamacento te aperta as costelas com força de ferro (Perde 35 PV). Você escapa do abraço cortando as garras dele, mas cai tossindo lodo na margem oposta do pântano, seriamente ferido.",
        choices: [
            { text: "Arrastar-se para o labirinto nas rochas", nextNode: "act4_labyrinth_entry" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 35);
            return { nextNode: "act4_labyrinth_entry" };
        }
    },

    // ================= ATO IV: O LABIRINTO DO DRAGÃO DE OBSIDIANA =================
    "act4_labyrinth_entry": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "As catacumbas revelam o antigo Labirinto das Ossadas. Paredes de rocha negra obsidiana se movem com ruídos mecânicos, mudando o trajeto a cada minuto. O calor é infernal.\n\nNo centro da arena circular, repousa o colossal Dragão de Obsidiana (Veldrak). Seus olhos ardem como carvão e suas escamas gotejam lava avermelhada. Ele ruge, cuspindo chamas de fogo negro que ameaçam queimar sua própria alma.",
        choices: [
            { text: "Usar Jutsu de Água (Suiton) para resfriar as escamas dele", nextNode: "act4_dragon_suiton" },
            { text: "Usar furtividade para golpear o coração de lava sob o peito dele", nextNode: "act4_dragon_stealth" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["suiton", "agua", "gelo", "resfriar", "jutsu"])) {
                return { nextNode: "act4_dragon_suiton" };
            }
            return { nextNode: "act4_dragon_stealth" };
        }
    },
    "act4_dragon_suiton": {
        background: "sleeping_dragon",
        narrative: "Você faz os selos de mão e dispara uma torrente de água fria contra as escamas de lava do dragão.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act4_dragon_success",
                    failureNode: "act4_dragon_fail"
                }
            };
        }
    },
    "act4_dragon_stealth": {
        background: "sleeping_dragon",
        narrative: "Você espera a fumaça das chamas negras subir e tenta escorregar silenciosamente sob a carapaça dele.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 14,
                    successNode: "act4_dragon_success",
                    failureNode: "act4_dragon_fail"
                }
            };
        }
    },
    "act4_dragon_success": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "As escamas térmicas de Veldrak estalam e quebram sob o choque térmico. Com um salto preciso, você enfia sua Tanto de ferro diretamente no coração dele. O dragão desaba, liberando o **Coração Flamejante de Veldrak** (Chave do templo final) e 200 XP.",
        choices: [
            { text: "Entrar no templo da Fortaleza de Obsidiana (Ato V)", nextNode: "act5_fortress_entry" }
        ],
        processAction: (text, player) => {
            player.inventory.push("coracao_obsidiana");
            player.xp += 200;
            return { nextNode: "act5_fortress_entry" };
        }
    },
    "act4_dragon_fail": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "As chamas negras incineram sua defesa. O calor queima sua alma e reduz seus pontos de Chakra (Perde 30 PC e 20 PV). Você consegue arrancar a relíquia dele na base do desespero antes de ser esmagado.",
        choices: [
            { text: "Subir as escadarias da Fortaleza cambaleando", nextNode: "act5_fortress_entry" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 20);
            player.mp = Math.max(0, player.mp - 30);
            player.inventory.push("coracao_obsidiana");
            return { nextNode: "act5_fortress_entry" };
        }
    },

    // ================= ATO V: A FORTALEZA E O CLÍMAX FINAL =================
    "act5_fortress_entry": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A Catedral de Ferro do Templo Central ergue-se com colunas góticas e cristais roxos que brilham nas paredes. No altar, a **Lágrima do Renascimento** flutua sob um invólucro mágico.\n\nO Alto Inquisidor da ditadura surge do trono, desembainhando uma espada de ferro maciço:\n\n— Kenji! O verme imundo que roubou os cofres do Soberano! Aqui jaz Sayuri de pedra, e aqui você virará cinzas!",
        choices: [
            { text: "Atacar usando Clones de Sombra (Kage Bunshin) e Furtividade", nextNode: "act5_inquisitor_clones" },
            { text: "Desperadamente tentar usar a Maldição da Medusa (Braço de Pedra) contra ele", nextNode: "act5_inquisitor_curse" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["curse", "maldicao", "braco", "pedra", "medusa"])) {
                return { nextNode: "act5_inquisitor_curse" };
            }
            return { nextNode: "act5_inquisitor_clones" };
        }
    },
    "act5_inquisitor_clones": {
        background: "temple_interior",
        narrative: "Você divide seu chakra criando três clones de ilusão para confundir os ataques pesados dele.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 12,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_fail"
                }
            };
        }
    },
    "act5_inquisitor_curse": {
        background: "temple_interior",
        narrative: "Você libera as escamas de pedra do seu próprio braço cursado, tentando petrificar a armadura do inquisidor.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 13,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_fail"
                }
            };
        }
    },
    "act5_inquisitor_success": {
        background: "temple_interior",
        speaker: "Alto Inquisidor",
        emotion: "Raiva",
        dialogue: "Não pode ser!...\n\nA força da maldição...",
        narrative: "Seu golpe final corta o peito do inquisidor, jogando-o vencido contra as colunas de ferro. O invólucro do altar se dissolve, liberando a poção cintilante.",
        choices: [
            { text: "Usar a Lágrima em Sayuri (Final)", nextNode: "act5_ending_choice" }
        ],
        processAction: (text, player) => {
            return { nextNode: "act5_ending_choice" };
        }
    },
    "act5_inquisitor_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O inquisidor quebra seus clones com um golpe de vento cortante, arremessando-o contra o chão (Perde 30 PV). Você usa seu último recurso, injetando veneno de pântano na perna dele para paralisá-lo, alcançando o altar sob extrema agonia.",
        choices: [
            { text: "Pegar a poção de renascimento (Final)", nextNode: "act5_ending_choice" }
        ],
        processAction: (text, player) => {
            player.hp = Math.max(1, player.hp - 30);
            return { nextNode: "act5_ending_choice" };
        }
    },
    "act5_ending_choice": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você segura o frasco da Lágrima do Renascimento. Sayuri de pedra jaz fria no altar do templo. O veneno e as feridas do seu corpo estão cobrando o preço final. O que você decide?",
        choices: [
            { text: "Curar Sayuri aceitando a maldição completa (Sacrifício)", nextNode: "ending_stone_sacrifice" },
            { text: "Curar Sayuri mantendo sua vida (Renascimento Puro)", nextNode: "ending_rebirth_pure" },
            { text: "Fugir com a poção para o mercado negro (Caminho Sombrio)", nextNode: "ending_outlaw_dark" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (matches(clean, ["sacrificio", "estatua", "pedra", "morrer"])) {
                return { nextNode: "ending_stone_sacrifice" };
            }
            if (matches(clean, ["fugir", "dinheiro", "reliquia", "sombrio"])) {
                return { nextNode: "ending_outlaw_dark" };
            }
            return { nextNode: "ending_rebirth_pure" };
        }
    },

    // --- FINAIS DO JOGO (BEGINNING, MIDDLE & END) ---
    "ending_rebirth_pure": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você derrama a Lágrima do Renascimento sobre os lábios de pedra de Sayuri. A rocha racha e se dissolve em luz dourada; ela respira novamente e te abraça chorando. Contudo, o preço da maldição consome permanentemente seu braço esquerdo, que permanece petrificado em rocha escura.\n\nSua redenção está completa. Vocês fogem das fronteiras da ditadura em busca de uma vida livre.",
        choices: [
            { text: "Retornar ao Menu Principal", nextNode: "prologue_reset" }
        ],
        processAction: (text, player) => {
            return { nextNode: "prologue_reset" };
        }
    },
    "ending_stone_sacrifice": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Para reverter a petrificação completa sem falhas, você transfere toda a maldição de Sayuri para o seu próprio corpo. Sayuri acorda de seu sono de pedra, assustada, bem a tempo de ver você se transformar em uma estátua eterna de obsidiana com a Tanto erguida.\n\nVocê a salvou, mas seu destino agora é ser pedra. Ela chora ao lado da sua estátua nas ruínas da catedral.",
        choices: [
            { text: "Retornar ao Menu Principal", nextNode: "prologue_reset" }
        ],
        processAction: (text, player) => {
            return { nextNode: "prologue_reset" };
        }
    },
    "ending_outlaw_dark": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu lado egoísta e desonesto prevalece sob o desespero. Você decide vender a poção no mercado negro por uma fortuna imensa para fugir da perseguição dos guardas, abandonando Sayuri no altar de pedra. Você se torna a lenda fora-da-lei mais rica e caçada das fronteiras, mas sua alma permanece fria e vazia como a rocha.",
        choices: [
            { text: "Retornar ao Menu Principal", nextNode: "prologue_reset" }
        ],
        processAction: (text, player) => {
            return { nextNode: "prologue_reset" };
        }
    },

    "prologue_reset": {
        narrative: "Retornando ao menu principal...",
        processAction: (text, player) => {
            localStorage.removeItem("kagegahara_cinematic_save");
            location.reload();
            return { nextNode: "prologue_entry" };
        }
    }
};

// --- CONTROLLER PRINCIPAL ---
class RPGGameController {
    constructor() {
        this.saveKey = "kagegahara_cinematic_save";
        this.player = this.getDefaultPlayer();
        this.currentNodeId = "prologue_entry";
        this.activeRoll = null;
        
        // Ficha e Intro
        this.isDrawerOpen = false;
        this.introSlideIndex = 0;
        this.allocatedStats = {
            strength: 5, agility: 5, vitality: 5, intelligence: 5, chakraControl: 5,
            resistance: 5, speed: 5, perception: 5, charisma: 5, luck: 5
        };
        this.statPool = 10;
    }

    getDefaultPlayer() {
        return {
            name: "",
            clan: "Shinryu",
            element: "Katon",
            background: "sobrevivente",
            level: 1,
            xp: 0,
            nextLevelXp: 150,
            hp: 100, maxHp: 100,
            mp: 75, maxMp: 75,
            sanity: 100, // Sanidade inicial
            attributes: {},
            traumas: [],
            convictions: [],
            inventory: ["item_shuriken", "item_pula_chakra"]
        };
    }

    init() {
        this.setupTitleInterface();
        this.setupIntroInterface();
        this.setupCreatorInterface();
        this.setupGameInterface();
        this.loadGame();
    }

    showNotification(msg, type = "info") {
        const bar = document.getElementById('notification-bar');
        if (!bar) return;
        bar.textContent = msg;
        bar.className = `notification-bar ${type}`;
        bar.style.opacity = '1';
        setTimeout(() => { bar.style.opacity = '0'; }, 3000);
    }

    loadGame() {
        const btnCont = document.getElementById('btn-continue-game');
        try {
            const raw = localStorage.getItem(this.saveKey);
            if (raw) {
                btnCont.removeAttribute('disabled');
            } else {
                btnCont.setAttribute('disabled', 'true');
            }
        } catch (e) {
            console.error("Falha ao checar save:", e);
        }
        this.showScreen("screen-title");
    }

    saveGame() {
        try {
            const data = {
                player: this.player,
                currentNodeId: this.currentNodeId
            };
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            console.error("Falha ao salvar:", e);
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(scr => {
            scr.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
    }

    // --- TELA DE TÍTULO ---
    setupTitleInterface() {
        const btnNew = document.getElementById('btn-new-game');
        const btnCont = document.getElementById('btn-continue-game');

        btnNew.addEventListener('click', () => {
            localStorage.removeItem(this.saveKey);
            this.player = this.getDefaultPlayer();
            this.currentNodeId = "prologue_entry";
            this.introSlideIndex = 0;
            this.showScreen("screen-intro");
            this.renderIntro();
        });

        btnCont.addEventListener('click', () => {
            const raw = localStorage.getItem(this.saveKey);
            if (raw) {
                const data = JSON.parse(raw);
                this.player = data.player;
                this.currentNodeId = data.currentNodeId || "prologue_entry";

                // SISTEMA DE AUTO-REPARO DE SAVE (Compatibilidade com versões antigas)
                if (!this.player) {
                    this.player = this.getDefaultPlayer();
                }
                if (!this.player.attributes) {
                    this.player.attributes = {
                        strength: 5, agility: 5, vitality: 5, intelligence: 5, chakraControl: 5,
                        resistance: 5, speed: 5, perception: 5, charisma: 5, luck: 5
                    };
                }
                if (!this.player.inventory) this.player.inventory = [];
                if (!this.player.traumas) this.player.traumas = [];
                if (!this.player.convictions) this.player.convictions = [];
                if (this.player.sanity === undefined || isNaN(this.player.sanity)) this.player.sanity = 100;
                if (!this.player.hp || isNaN(this.player.hp)) this.player.hp = this.player.maxHp || 100;
                if (!this.player.mp || isNaN(this.player.mp)) this.player.mp = this.player.maxMp || 75;
                if (!this.player.level) this.player.level = 1;
                if (!this.player.xp) this.player.xp = 0;
                if (!this.player.nextLevelXp) this.player.nextLevelXp = 150;

                // Garante que todos os atributos existam
                const defaultStats = {
                    strength: 5, agility: 5, vitality: 5, intelligence: 5, chakraControl: 5,
                    resistance: 5, speed: 5, perception: 5, charisma: 5, luck: 5
                };
                Object.keys(defaultStats).forEach(stat => {
                    if (this.player.attributes[stat] === undefined || isNaN(this.player.attributes[stat])) {
                        // Trata o atributo 'chakra' da versão antiga como 'chakraControl'
                        if (stat === 'chakraControl' && this.player.attributes['chakra'] !== undefined) {
                            this.player.attributes.chakraControl = this.player.attributes['chakra'];
                        } else {
                            this.player.attributes[stat] = defaultStats[stat];
                        }
                    }
                });

                this.showScreen("screen-hud");
                this.transitionToNode(this.currentNodeId);
                this.showNotification("Jornada continuada com sucesso!", "success");
            }
        });
    }

    // --- TELA INTRODUTÓRIA ---
    setupIntroInterface() {
        const screenIntro = document.getElementById('screen-intro');
        screenIntro.addEventListener('click', () => {
            this.advanceIntro();
        });
    }

    advanceIntro() {
        this.introSlideIndex++;
        if (this.introSlideIndex < INTRO_SLIDES.length) {
            this.renderIntro();
        } else {
            this.showScreen("screen-char-creator");
        }
    }

    renderIntro() {
        const slide = INTRO_SLIDES[this.introSlideIndex];
        if (!slide) return;

        const introBg = document.getElementById('intro-bg');
        const introText = document.getElementById('intro-text');

        introBg.style.opacity = '0';
        introText.style.opacity = '0';

        setTimeout(() => {
            let assetName = 'bg_starry_mountains.jpg';
            if (slide.bg === 'sleeping_dragon') assetName = 'bg_sleeping_dragon.jpg';
            else if (slide.bg === 'swamp_forest') assetName = 'bg_swamp_forest.jpg';

            introBg.style.backgroundImage = `url('assets/${assetName}')`;
            introText.innerHTML = slide.text.replace(/\n/g, "<br>");
            
            introBg.style.opacity = '1';
            introText.style.opacity = '1';
        }, 300);
    }

    // --- CRIAÇÃO DE PERSONAGEM ---
    setupCreatorInterface() {
        this.renderAttributesCreatorList();

        document.querySelectorAll('.clan-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.clan-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        document.querySelectorAll('.element-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.element-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        document.querySelectorAll('.psych-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.psych-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });

        document.getElementById('char-name').addEventListener('input', () => this.validateCreatorForm());
        document.getElementById('btn-start-game').addEventListener('click', () => this.createCharacter());
    }

    renderAttributesCreatorList() {
        const container = document.querySelector('.attributes-list');
        if (!container) return;
        container.innerHTML = "";

        Object.keys(this.allocatedStats).forEach(stat => {
            const label = STAT_NAMES[stat];
            const row = document.createElement('div');
            row.className = "attribute-row";
            row.innerHTML = `
                <div class="attr-info">
                    <span class="attr-name">${label}</span>
                </div>
                <div class="attr-controls">
                    <button class="btn btn-secondary btn-circle btn-minus" data-stat="${stat}">-</button>
                    <span class="attr-val" id="val-${stat}">5</span>
                    <button class="btn btn-secondary btn-circle btn-plus" data-stat="${stat}">+</button>
                </div>
            `;
            container.appendChild(row);
        });

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-plus')) {
                this.modifyCreatorStat(e.target.dataset.stat, 1);
            } else if (e.target.classList.contains('btn-minus')) {
                this.modifyCreatorStat(e.target.dataset.stat, -1);
            }
        });
    }

    modifyCreatorStat(stat, delta) {
        if (delta > 0 && this.statPool > 0) {
            this.allocatedStats[stat]++;
            this.statPool--;
        } else if (delta < 0 && this.allocatedStats[stat] > 5) {
            this.allocatedStats[stat]--;
            this.statPool++;
        } else {
            return;
        }

        document.getElementById(`val-${stat}`).textContent = this.allocatedStats[stat];
        document.getElementById('remaining-points').textContent = this.statPool;
        this.validateCreatorForm();
    }

    validateCreatorForm() {
        const name = document.getElementById('char-name').value.trim();
        const btn = document.getElementById('btn-start-game');
        btn.disabled = !(name.length >= 2 && this.statPool === 0);
    }

    createCharacter() {
        const name = document.getElementById('char-name').value.trim();
        const clan = document.querySelector('.clan-card.active').dataset.clan;
        const element = document.querySelector('.element-card.active').dataset.element;
        const bg = document.querySelector('.psych-card.active').dataset.bg;

        this.player.name = name;
        this.player.clan = clan;
        this.player.element = element;
        this.player.background = bg;
        this.player.attributes = { ...this.allocatedStats };

        this.player.maxHp = (this.player.attributes.vitality * 15) + (this.player.attributes.resistance * 5);
        this.player.maxMp = (this.player.attributes.intelligence * 5) + (this.player.attributes.chakraControl * 10);
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        this.player.sanity = 100;

        if (clan === "Kurogane") {
            this.player.inventory.push("item_iron_tanto");
        } else {
            this.player.inventory.push("item_academy_knife");
        }

        if (bg === "sobrevivente") {
            this.player.convictions.push("foco_de_vinganca");
            this.player.traumas.push("ansiedade_do_vazio");
        }

        this.saveGame();
        this.showScreen("screen-hud");
        this.transitionToNode("prologue_entry");
        this.showNotification("Sua jornada cinematográfica começou!", "success");
    }

    // --- GAMEPLAY ---
    setupGameInterface() {
        const btnToggleMenu = document.getElementById('btn-toggle-menu');
        const btnCloseDrawer = document.getElementById('btn-close-drawer');
        const drawer = document.getElementById('hud-sidebar-drawer');

        btnToggleMenu.addEventListener('click', () => {
            this.isDrawerOpen = !this.isDrawerOpen;
            drawer.classList.toggle('open', this.isDrawerOpen);
        });

        btnCloseDrawer.addEventListener('click', () => {
            this.isDrawerOpen = false;
            drawer.classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if (this.isDrawerOpen && 
                !drawer.contains(e.target) && 
                e.target !== btnToggleMenu) {
                this.isDrawerOpen = false;
                drawer.classList.remove('open');
            }
        });

        document.getElementById('btn-cancel-action').addEventListener('click', () => {
            document.getElementById('custom-action-container').classList.add('hidden');
            document.getElementById('choices-panel').style.display = "flex";
            document.getElementById('action-input').value = "";
        });

        const inputAction = document.getElementById('action-input');
        inputAction.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = inputAction.value.trim();
                if (!text) return;
                inputAction.value = "";
                this.handlePlayerAction(text);
            }
        });

        document.addEventListener('keydown', (e) => {
            const activeHud = document.getElementById('screen-hud').classList.contains('active');
            const activeIntro = document.getElementById('screen-intro').classList.contains('active');
            const activeTitle = document.getElementById('screen-title').classList.contains('active');
            
            if (activeTitle) {
                if (e.key === '1') {
                    document.getElementById('btn-new-game').click();
                } else if (e.key === '2' && !document.getElementById('btn-continue-game').hasAttribute('disabled')) {
                    document.getElementById('btn-continue-game').click();
                }
                return;
            }

            if (activeIntro) {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.advanceIntro();
                    e.preventDefault();
                }
                return;
            }

            if (activeHud && document.activeElement !== inputAction) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 5) {
                    const node = STORY_NODES[this.currentNodeId];
                    if (node && node.choices) {
                        const choice = node.choices[num - 1];
                        if (choice) {
                            if (choice.isCustom) {
                                document.getElementById('choices-panel').style.display = "none";
                                document.getElementById('custom-action-container').classList.remove('hidden');
                                inputAction.focus();
                            } else {
                                this.transitionToNode(choice.nextNode);
                            }
                            e.preventDefault();
                        }
                    }
                }
            }
        });

        const btnRollOverlay = document.getElementById('btn-roll-overlay');
        const diceVisual = document.getElementById('roll-dice-visual');

        btnRollOverlay.addEventListener('click', () => {
            try {
                // Alerta inicial de diagnóstico
                alert("Dado clicado! activeRoll: " + (this.activeRoll ? JSON.stringify(this.activeRoll) : "null"));

                if (!this.activeRoll) {
                    alert("Erro: Nenhuma rolagem ativa configurada no controlador!");
                    return;
                }

                btnRollOverlay.disabled = true;
                diceVisual.classList.add('rolling');
                
                setTimeout(() => {
                    try {
                        diceVisual.classList.remove('rolling');
                        const natural = Math.floor(Math.random() * 20) + 1;
                        const result = natural + this.activeRoll.modifier;
                        diceVisual.textContent = result;

                        const success = result >= this.activeRoll.cd;
                        
                        setTimeout(() => {
                            try {
                                document.getElementById('roll-overlay').classList.remove('active');
                                const targetNode = success ? this.activeRoll.successNode : this.activeRoll.failureNode;
                                this.activeRoll = null;
                                this.transitionToNode(targetNode);
                            } catch (errInnerInner) {
                                alert("Erro ao aplicar transição de nó: " + errInnerInner.message + "\nPilha:\n" + errInnerInner.stack);
                            }
                        }, 1500);
                    } catch (errInner) {
                        alert("Erro ao processar dados da rolagem: " + errInner.message + "\nPilha:\n" + errInner.stack);
                    }

                }, 1000);
            } catch (errOuter) {
                alert("Erro catastrófico no clique do D20: " + errOuter.message + "\nPilha:\n" + errOuter.stack);
            }
        });
    }

    triggerRoll(r) {
        try {
            const statVal = (this.player.attributes && this.player.attributes[r.attribute]) || 5;
            const modifier = Math.floor((statVal - 5) / 2);

            this.activeRoll = {
                attribute: r.attribute,
                cd: r.cd,
                modifier: modifier,
                successNode: r.successNode,
                failureNode: r.failureNode
            };

            const overlay = document.getElementById('roll-overlay');
            if (!overlay) {
                this.showNotification("Erro: Elemento #roll-overlay não encontrado!", "error");
                return;
            }
            overlay.classList.add('active');

            const attrName = document.getElementById('roll-attr-name');
            const cdVal = document.getElementById('roll-cd-val');
            const btnRoll = document.getElementById('btn-roll-overlay');
            const diceVisual = document.getElementById('roll-dice-visual');

            if (attrName) attrName.textContent = STAT_NAMES[r.attribute] || r.attribute;
            if (cdVal) cdVal.textContent = r.cd;
            if (btnRoll) {
                btnRoll.disabled = false;
                btnRoll.textContent = "Rolar D20";
            }
            if (diceVisual) diceVisual.textContent = "20";
        } catch (e) {
            this.showNotification("Erro no triggerRoll: " + e.message, "error");
            console.error(e);
        }
    }

    handlePlayerAction(actionText) {
        try {
            const node = STORY_NODES[this.currentNodeId];
            if (!node) return;

            const outcome = node.processAction(actionText, this.player);

            if (outcome) {
                if (outcome.rollRequired) {
                    this.triggerRoll(outcome.rollRequired);
                } else if (outcome.nextNode) {
                    if (outcome.message) this.showNotification(outcome.message, "info");
                    this.transitionToNode(outcome.nextNode);
                }
            }
        } catch (e) {
            this.showNotification("Erro no handlePlayerAction: " + e.message, "error");
            console.error(e);
        }
    }

    triggerCameraEffect(effectClass) {
        const vp = document.getElementById('game-viewport');
        if (vp) {
            vp.classList.add(effectClass);
            setTimeout(() => {
                vp.classList.remove(effectClass);
            }, 1200);
        }
    }

    transitionToNode(nodeId) {
        try {
            this.currentNodeId = nodeId;
            const node = STORY_NODES[nodeId];
            if (!node) {
                this.showNotification("Erro: Nó não encontrado: " + nodeId, "error");
                return;
            }
            
            // Drenagem passiva de Sanidade na Floresta Negra (Ato II)
            if (nodeId.startsWith("act2_forest")) {
                this.player.sanity = Math.max(0, this.player.sanity - 8);
                if (this.player.sanity < 40 && Math.random() < 0.35 && nodeId !== "act2_forest_hallucination") {
                    this.currentNodeId = "act2_forest_hallucination";
                    this.showNotification("A escuridão sussurra mentiras aos seus ouvidos...", "error");
                    this.transitionToNode("act2_forest_hallucination");
                    return;
                }
            }

            // Efeitos cinemáticos nas transições-chave
            if (nodeId === "prologue_yusei_annoyed" || 
                nodeId === "prologue_recruit_kill" || 
                nodeId === "act2_forest_hallucination" ||
                nodeId === "act3_swamp_fight" ||
                nodeId === "act4_dragon_fail" ||
                nodeId === "act5_inquisitor_fail") {
                this.triggerCameraEffect("camera-flash");
                this.triggerCameraEffect("camera-shake");
            }

            this.saveGame();
            this.renderScene();
            this.renderHUD();

            if (node && node.processAction && typeof node.processAction === 'function') {
                const check = node.processAction("", this.player);
                if (check) {
                    if (check.rollRequired) {
                        this.triggerRoll(check.rollRequired);
                    } else if (check.nextNode && check.nextNode !== nodeId) {
                        this.transitionToNode(check.nextNode);
                    }
                }
            }
        } catch (e) {
            this.showNotification("Erro no transitionToNode: " + e.message, "error");
            console.error(e);
        }
    }

    renderScene() {
        const node = STORY_NODES[this.currentNodeId];
        if (!node) return;

        // Fundo
        const bg = document.getElementById('vn-background');
        bg.className = "vn-bg";
        if (node.background) {
            bg.classList.add(node.background);
        }

        // Retrato do Mestre Yusei
        const portrait = document.getElementById('vn-character-portrait');
        const portraitContainer = document.querySelector('.vn-character-container');
        
        if (node.speaker && node.speaker === "Mestre Yusei") {
            portraitContainer.style.display = "flex";
            portrait.style.opacity = '0';
            
            let imgName = 'yusei_neutral.jpg';
            if (node.emotion === 'Raiva') imgName = 'yusei_angry.jpg';
            else if (node.emotion === 'Preocupado' || node.emotion === 'Tristeza') imgName = 'yusei_sad.jpg';
            else if (node.emotion === 'Alegria' || node.emotion === 'Admiração') imgName = 'yusei_pleased.jpg';

            setTimeout(() => {
                portrait.src = `assets/${imgName}`;
                portrait.style.opacity = '1';
            }, 100);
        } else {
            portraitContainer.style.display = "none";
        }

        // Textos da Fita de Diálogo
        document.getElementById('vn-speaker-name').textContent = node.speaker || "Narrador";
        
        const emotion = document.getElementById('vn-speaker-emotion');
        if (node.speaker && node.speaker !== "Narrador" && node.emotion) {
            emotion.style.display = "inline-block";
            emotion.textContent = node.emotion;
            this.setEmotionStyle(emotion, node.emotion);
        } else {
            emotion.style.display = "none";
        }

        const dialogText = document.getElementById('vn-dialogue-text');
        if (node.dialogue) {
            dialogText.style.display = "block";
            dialogText.innerHTML = node.dialogue.replace(/\n/g, "<br>");
        } else {
            dialogText.style.display = "none";
        }

        document.getElementById('vn-narrative-text').textContent = node.narrative || "";

        // Renderizar Escolhas Compactas
        this.renderChoices(node.choices);
    }

    renderChoices(choices) {
        const panel = document.getElementById('choices-panel');
        if (!panel) return;
        panel.innerHTML = "";

        const currentChoices = choices || [];

        currentChoices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = "choice-link-btn";
            if (choice.isCustom) {
                btn.classList.add('btn-custom');
                btn.innerHTML = `<span class="num">[${index + 1}]</span> ✍️ ${choice.text}`;
                btn.addEventListener('click', () => {
                    panel.style.display = "none";
                    const container = document.getElementById('custom-action-container');
                    container.classList.remove('hidden');
                    document.getElementById('action-input').focus();
                });
            } else {
                btn.innerHTML = `<span class="num">[${index + 1}]</span> ${choice.text}`;
                btn.addEventListener('click', () => {
                    this.transitionToNode(choice.nextNode);
                });
            }
            panel.appendChild(btn);
        });

        panel.style.display = "flex";
        document.getElementById('custom-action-container').classList.add('hidden');
    }

    renderHUD() {
        try {
            const p = this.player;
            if (!p) return;

            const nameEl = document.getElementById('hud-player-name');
            const lvlEl = document.getElementById('hud-player-level');
            const clanEl = document.getElementById('hud-player-clan');
            const elemEl = document.getElementById('hud-player-element');

            if (nameEl) nameEl.textContent = p.name || "Kenji";
            if (lvlEl) lvlEl.textContent = `Nível ${p.level || 1}`;
            if (clanEl) clanEl.textContent = `Clã ${p.clan || "Shinryu"}`;
            
            if (elemEl) {
                const element = p.element || "Katon";
                elemEl.innerHTML = (element === "Katon" ? "🔥" : element === "Suiton" ? "💧" : element === "Doton" ? "⛰️" : element === "Futon" ? "💨" : "⚡") + ` ${element}`;
            }

            const maxHpVal = p.maxHp || 100;
            const hpVal = p.hp !== undefined ? p.hp : maxHpVal;
            const hpPercent = Math.max(0, Math.min(100, (hpVal / maxHpVal) * 100));

            const maxMpVal = p.maxMp || 75;
            const mpVal = p.mp !== undefined ? p.mp : maxMpVal;
            const mpPercent = Math.max(0, Math.min(100, (mpVal / maxMpVal) * 100));

            const sanityVal = p.sanity !== undefined ? p.sanity : 100;
            const sanityPercent = Math.max(0, Math.min(100, (sanityVal / 100) * 100));

            const nextXpVal = p.nextLevelXp || 150;
            const xpVal = p.xp || 0;
            const xpPercent = Math.max(0, Math.min(100, (xpVal / nextXpVal) * 100));

            const hpValEl = document.getElementById('val-hp');
            const hpBarEl = document.getElementById('bar-hp-fill');
            const mpValEl = document.getElementById('val-mp');
            const mpBarEl = document.getElementById('bar-mp-fill');
            const sanityValEl = document.getElementById('val-sanity');
            const sanityBarEl = document.getElementById('bar-sanity-fill');
            const xpValEl = document.getElementById('val-xp');
            const xpBarEl = document.getElementById('bar-xp-fill');

            if (hpValEl) hpValEl.textContent = `${hpVal}/${maxHpVal}`;
            if (hpBarEl) hpBarEl.style.width = `${hpPercent}%`;

            if (mpValEl) mpValEl.textContent = `${mpVal}/${maxMpVal}`;
            if (mpBarEl) mpBarEl.style.width = `${mpPercent}%`;

            if (sanityValEl) sanityValEl.textContent = `${sanityVal}/100`;
            if (sanityBarEl) sanityBarEl.style.width = `${sanityPercent}%`;

            if (xpValEl) xpValEl.textContent = `${xpVal}/${nextXpVal}`;
            if (xpBarEl) xpBarEl.style.width = `${xpPercent}%`;

            const grid = document.getElementById('hud-attributes-list');
            if (grid) {
                grid.innerHTML = "";
                const attrs = p.attributes || {};
                Object.keys(attrs).forEach(stat => {
                    const val = attrs[stat];
                    const box = document.createElement('div');
                    box.className = "attr-box";
                    box.innerHTML = `
                        <span>${STAT_NAMES[stat] || stat}</span>
                        <strong>${val}</strong>
                    `;
                    grid.appendChild(box);
                });
            }

            const traumas = document.getElementById('hud-traumas-list');
            if (traumas) {
                traumas.innerHTML = "";
                if (p.traumas && p.traumas.length > 0) {
                    const unique = [...new Set(p.traumas)];
                    unique.forEach(t => {
                        traumas.innerHTML += `<span class="tag tag-red">${TRAUMA_MAP[t] || t.toUpperCase()}</span>`;
                    });
                } else {
                    traumas.innerHTML = `<span class="tag tag-red" style="opacity: 0.5;">Nenhum</span>`;
                }
            }

            const convictions = document.getElementById('hud-convictions-list');
            if (convictions) {
                convictions.innerHTML = "";
                if (p.convictions && p.convictions.length > 0) {
                    const unique = [...new Set(p.convictions)];
                    unique.forEach(c => {
                        convictions.innerHTML += `<span class="tag tag-blue">${CONVICTION_MAP[c] || c.toUpperCase()}</span>`;
                    });
                } else {
                    convictions.innerHTML = `<span class="tag tag-blue" style="opacity: 0.5;">Nenhuma</span>`;
                }
            }

            const inv = document.getElementById('hud-inventory-list');
            if (inv) {
                inv.innerHTML = "";
                if (p.inventory && p.inventory.length > 0) {
                    p.inventory.forEach(itemId => {
                        const name = ITEM_NAMES[itemId] || itemId;
                        inv.innerHTML += `<div class="inventory-item"><span>${name}</span></div>`;
                    });
                } else {
                    inv.innerHTML = `<div class="inventory-item" style="opacity: 0.5;">Inventário Vazio</div>`;
                }
            }
        } catch (e) {
            this.showNotification("Erro no renderHUD: " + e.message, "error");
            console.error(e);
        }
    }

    setEmotionStyle(node, emotion) {
        const success = ["Admiração", "Alegria"];
        if (success.includes(emotion)) {
            node.style.borderColor = "var(--color-success)";
            node.style.color = "var(--color-success)";
            node.style.background = "rgba(51, 204, 102, 0.15)";
        } else {
            node.style.borderColor = "var(--color-secondary)";
            node.style.color = "var(--color-secondary)";
            node.style.background = "rgba(255, 51, 102, 0.15)";
        }
    }
}

// Inicializa
document.addEventListener("DOMContentLoaded", () => {
    const game = new RPGGameController();
    game.init();
});
