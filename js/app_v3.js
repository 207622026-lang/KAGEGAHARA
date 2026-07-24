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
            const clean = cleanText(text);
            if (clean === "") {
                player.convictions.push("caminho_da_clemencia");
                player.xp += 50;
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_sneak_fail": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu pé prende em um cabo de arame farpado. O som metálico alerta o recruta novato, que entra em pânico e dispara um sinal de chakra no céu. Antes que você consiga se levantar, três soldados veteranos saem da guarita das sombras e caem sobre você com golpes de cacetete e cabos de lança.\n\nVocê luta bravamente, mas um golpe forte na cabeça te faz apagar na lama (Perde 30 PV e ganha trauma 'Ansiedade do Vazio').",
        choices: [
            { text: "Acordar aprisionado na cela de segurança", nextNode: "prologue_dungeon_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 30);
                player.traumas.push("ansiedade_do_vazio");
                return null;
            }
            return { nextNode: "prologue_dungeon_entry" };
        }
    },
    "prologue_recruit_spare": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você ergue as mãos vazias e tenta subornar o recruta novato com shurikens e moedas de mercado negro, usando sua lábia cínica de criminoso.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "charisma",
                    cd: 12,
                    successNode: "prologue_spare_success",
                    failureNode: "prologue_spare_fail"
                }
            };
        }
    },
    "prologue_spare_success": {
        background: "kaede_gates",
        speaker: "Mestre Yusei",
        dialogue: "Vá embora... antes que a patrulha passe.",
        narrative: "O soldado novato hesita, tremendo sob a chuva ácida. Ele olha para os lados e recolhe o suborno em silêncio, destrancando a grade de ferro para você passar.",
        choices: [
            { text: "Cruzar o portão livre", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.convictions.push("caminho_da_clemencia");
                player.xp += 30;
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_spare_fail": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O jovem soldado se assusta com a sua aproximação. O pânico fala mais alto e ele grita: 'INVASOR!' disparando sua lança contra seu braço (Perde 15 PV) antes que outros guardas te cerquem e te espanquem com cacetetes até desmaiar.",
        choices: [
            { text: "Acordar na cela de aprisionamento", nextNode: "prologue_dungeon_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 15);
                return null;
            }
            return { nextNode: "prologue_dungeon_entry" };
        }
    },
    "prologue_dungeon_entry": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você acorda com dor de cabeça e os pulsos algemados em uma cela úmida de ferro sob o portão Kaede. O cheiro de mofo é sufocante. Do lado de fora da grade, um guarda sonolento está lendo relatórios. Seus pertences estão sobre a mesa dele.\n\nVocê precisa escapar antes do amanhecer, quando virão te buscar para execução!",
        choices: [
            { text: "Tentar destravar as algemas com um grampo metálico (Agilidade CD 12)", nextNode: "prologue_dungeon_lockpick" },
            { text: "Mentir fingindo uma convulsão para atrair o guarda (Inteligência CD 11)", nextNode: "prologue_dungeon_provoke" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "prologue_dungeon_lockpick": {
        background: "temple_interior",
        narrative: "Você desloca seu polegar dolorosamente (Perde 10 PV) e usa um gancho de ferro que escondeu na sola da bota para destravar a fechadura nas sombras.",
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 10);
            }
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 12,
                    successNode: "prologue_dungeon_escape_success",
                    failureNode: "prologue_dungeon_escape_fail"
                }
            };
        }
    },
    "prologue_dungeon_provoke": {
        background: "temple_interior",
        narrative: "Você começa a tossir sangue falso e fingir que está morrendo de frio, afirmando que escondeu o ouro roubado perto da grade da guarita.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "intelligence",
                    cd: 11,
                    successNode: "prologue_dungeon_trick_success",
                    failureNode: "prologue_dungeon_trick_fail"
                }
            };
        }
    },
    "prologue_dungeon_escape_success": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sucesso! As algemas clicam e se abrem. Você desliza silenciosamente até a grade, passa o braço pelas barras e sufoca o guarda distraído até ele apagar. Você recupera seu equipamento e foge pelos dutos de escoamento de chuva para a Floresta Negra.",
        choices: [
            { text: "Correr para a Floresta Negra", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.xp += 60;
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_dungeon_escape_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O grampo se deforma na fechadura com um som metálico. O guarda percebe seu movimento, levanta-se bufando e atinge seus dedos através das grades com um bastão de ferro (Perde 15 PV).\n\nCom as mãos feridas, seu tempo está acabando. Você precisa usar outra estratégia!",
        choices: [
            { text: "Tentar ludibriar o guarda (Inteligência CD 11)", nextNode: "prologue_dungeon_provoke" },
            { text: "Puxar a corrente da parede com força física bruta (Força CD 13)", nextNode: "prologue_dungeon_strength_break" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 15);
                return null;
            }
            return null;
        }
    },
    "prologue_dungeon_trick_success": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A ganância fala mais alto. O guarda abre a cela com as chaves para verificar seu corpo. No instante em que ele se aproxima, você arrebenta as algemas em seu rosto, bate a cabeça dele contra a parede e o nocauteia. Você se equipa e escapa pelas sombras.",
        choices: [
            { text: "Fugir para a Floresta Negra", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.xp += 50;
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_dungeon_trick_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O guarda ri de escárnio: 'Eu conheço sua fama de ladrão mentiroso, Kenji!' Ele se aproxima com a lança e desfere uma descarga elétrica em suas costelas (Perde 20 PV). \n\nSem tempo, sob o som de passos no corredor, você tenta a força física para arrebentar as correntes!",
        choices: [
            { text: "Arrebentar as correntes na força bruta (Força CD 13)", nextNode: "prologue_dungeon_strength_break" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                return null;
            }
            return null;
        }
    },
    "prologue_dungeon_strength_break": {
        background: "temple_interior",
        narrative: "Você apoia as pernas na parede úmida de rocha, segura os elos e puxa as correntes aplicando toda a força física bruta dos seus braços.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
                    cd: 13,
                    successNode: "prologue_dungeon_escape_brute",
                    failureNode: "prologue_dungeon_death_gate"
                }
            };
        }
    },
    "prologue_dungeon_escape_brute": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Com um grito de raiva, você arranca o pino da rocha! O guarda corre assustado, mas você o enforca com a própria corrente solta. Você recolhe suas coisas e pula pela janela alta de grades soltas direto no rio caudaloso lá fora, nadando até as margens da floresta.",
        choices: [
            { text: "Entrar na Floresta Negra", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.xp += 70;
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "prologue_dungeon_death_gate": {
        background: "kaede_gates",
        speaker: "Narrador",
        dialogue: "",
        narrative: "As correntes não cedem. Dois inquisidores da ditadura entram na cela, rendem você e o arrastam ferido para o pátio de execução.\n\nContudo, em um último momento, Mestre Yusei surge no telhado e arremessa bombas explosivas de chakra nas caldeiras. O pátio explode! Na confusão de fogo, você corta suas amarras, se joga da muralha e corre sangrando muito para a floresta negra (Perde 30 PV, ganha trauma 'Peso do Sangue').",
        choices: [
            { text: "Correr sangrando para a floresta negra", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 30);
                player.traumas.push("peso_do_sangue");
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.sanity = Math.min(100, player.sanity + 20);
                player.mp = Math.min(player.maxMp, player.mp + 15);
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.sanity = Math.max(0, player.sanity - 30);
                player.traumas.push("mente_corrompida");
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 10);
                return null;
            }
            return { nextNode: "act2_forest_hunt" };
        }
    },
    "act2_forest_hunt": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A névoa se condensa em uma gosma fria. Diante de você, ergue-se o Mutante de Névoa — um humanoide deformado de três metros com a bússola cravada no estômago translúcido. Ele ruge, exalando um vapor ácido que dissolve as folhas ao redor.\n\nAs árvores Vigilantes fecham o círculo, impedindo sua fuga direta. A criatura se prepara para saltar sobre você!",
        choices: [
            { text: "Usar Jutsu de Fogo (Katon) para dissipar a névoa e expor o monstro", nextNode: "act2_mutant_katon" },
            { text: "Correr pelos troncos das árvores usando acrobacias para flanqueá-lo", nextNode: "act2_mutant_tanto" },
            { text: "Recuar desesperadamente de volta para a entrada da floresta (Fugir)", nextNode: "act2_mutant_retreat" },
            { text: "Arriscar tudo: Avançar em ataque suicida de frente contra as mandíbulas (Sorte CD 17)", nextNode: "act2_mutant_gamble" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["katon", "fogo", "chama", "jutsu"])) {
                return { nextNode: "act2_mutant_katon" };
            }
            if (matches(clean, ["fugir", "recuar", "correr", "escapar"])) {
                return { nextNode: "act2_mutant_retreat" };
            }
            if (matches(clean, ["arriscar", "suicida", "tudo", "sorte", "gamble"])) {
                return { nextNode: "act2_mutant_gamble" };
            }
            return { nextNode: "act2_mutant_tanto" };
        }
    },
    "act2_mutant_retreat": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O medo de morrer fala mais alto. Você dá as costas ao Mutante de Névoa e corre desesperadamente por entre os galhos espinhosos. O monstro dispara um jato de vapor ácido nas suas costas enquanto você foge (Perde 20 PV e 15 de Sanidade).\n\nVocê consegue escapar de volta para as clareiras da floresta, ofegante e humilhado.",
        choices: [
            { text: "Tentar se recuperar e voltar para caçar o Mutante", nextNode: "act2_forest_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                player.sanity = Math.max(0, player.sanity - 15);
                return null;
            }
            return { nextNode: "act2_forest_entry" };
        }
    },
    "act2_mutant_gamble": {
        background: "swamp_forest",
        narrative: "Ignorando qualquer cautela shinobi, você corre de frente contra as mandíbulas ácidas do monstro, confiando apenas no instinto e na sorte pura para cravar a Tanto no estômago dele.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "luck",
                    cd: 17,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_gamble_fail"
                }
            };
        }
    },
    "act2_mutant_gamble_fail": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sua audácia foi sua ruína! O mutante te agarra no ar e te arremessa com força brutal contra uma rocha de ferro, esmagando suas costelas (Perde 50 PV). Você cai incapacitado e o monstro se prepara para te finalizar!",
        choices: [
            { text: "Tentar um contra-ataque desesperado no chão (Agilidade CD 14)", nextNode: "act2_mutant_strike_agility_hard" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 50);
                return null;
            }
            return null;
        }
    },
    "act2_mutant_katon": {
        background: "swamp_forest",
        narrative: "Você canaliza chakra nos pulmões e dispara uma bola de fogo focada. O calor evapora a névoa ácida ao redor do mutante, forçando-o a erguer os braços para proteger os olhos.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 11,
                    successNode: "act2_mutant_p1_success",
                    failureNode: "act2_mutant_p1_fail"
                }
            };
        }
    },
    "act2_mutant_tanto": {
        background: "swamp_forest",
        narrative: "Você salta velozmente de galho em galho. O monstro tenta te acompanhar com os olhos foscos, mas a sua velocidade o confunde temporariamente.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 12,
                    successNode: "act2_mutant_p1_success",
                    failureNode: "act2_mutant_p1_fail"
                }
            };
        }
    },
    "act2_mutant_p1_success": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu plano funciona! O mutante é desestabilizado e a névoa que o protegia desaparece, revelando seu núcleo azul brilhante pulsar no estômago gélido.\n\nContudo, sentindo o perigo, a criatura endurece a pele ao redor do tórax e tenta um contra-ataque desesperado com garras de gelo!",
        choices: [
            { text: "Desferir um golpe cirúrgico com a Tanto no núcleo (Agilidade CD 11)", nextNode: "act2_mutant_strike_agility_easy" },
            { text: "Concentrar chakra na lâmina e desferir um corte explosivo (Controle de Chakra CD 11)", nextNode: "act2_mutant_strike_will_easy" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act2_mutant_p1_fail": {
        background: "swamp_forest",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seu ataque falha! O mutante antecipa seu movimento e te atinge com um sopro de vapor ácido (Perde 15 PV e 10 de Sanidade). Você rola no lodo, tossindo.\n\nEnfurecido e ciente da sua presença, o monstro avança rugindo com a carapaça blindada de gelo espesso!",
        choices: [
            { text: "Desferir um golpe desesperado com a Tanto no núcleo (Agilidade CD 14)", nextNode: "act2_mutant_strike_agility_hard" },
            { text: "Forçar um corte de chakra bruto contra a blindagem (Controle de Chakra CD 14)", nextNode: "act2_mutant_strike_will_hard" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 15);
                player.sanity = Math.max(0, player.sanity - 10);
                return null;
            }
            return null;
        }
    },
    "act2_mutant_strike_agility_easy": {
        background: "swamp_forest",
        narrative: "Com o monstro exposto, você busca a abertura em suas garras para cravar a Tanto.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_fail"
                }
            };
        }
    },
    "act2_mutant_strike_will_easy": {
        background: "swamp_forest",
        narrative: "Você canaliza energia espiralada na ponta da Tanto para perfurar a carapaça enfraquecida.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 11,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_fail"
                }
            };
        }
    },
    "act2_mutant_strike_agility_hard": {
        background: "swamp_forest",
        narrative: "Sob a investida furiosa e blindada do mutante, você tenta escorregar por debaixo das pernas dele e golpear por trás.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 14,
                    successNode: "act2_mutant_success",
                    failureNode: "act2_mutant_fail"
                }
            };
        }
    },
    "act2_mutant_strike_will_hard": {
        background: "swamp_forest",
        narrative: "Em uma colisão direta, você tenta romper a blindagem de gelo do mutante usando chakra bruto acumulado.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 14,
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
            const clean = cleanText(text);
            if (clean === "") {
                player.inventory.push("compasso_da_nevoa");
                player.xp += 100;
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                player.inventory.push("compasso_da_nevoa");
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") return null;
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 10);
                player.traumas.push("olhar_quebrado");
                player.inventory.push("pocao_camuflagem");
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.maxHp = Math.max(50, player.maxHp - 30);
                player.hp = Math.min(player.maxHp, player.hp);
                player.inventory.push("pocao_camuflagem");
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") return null;
            return { nextNode: "act4_labyrinth_entry" };
        }
    },
    "act3_swamp_fight": {
        background: "swamp_mud",
        narrative: "O Kraken de Lama emerge por completo do lodo movediço. Três tentáculos titânicos cobertos de espinhos ósseos começam a chicotear a água em sua direção com força devastadora.",
        choices: [
            { text: "Usar Jutsu de Terra (Doton) para erguer uma barreira e bloquear a força", nextNode: "act3_kraken_doton" },
            { text: "Saltar entre os troncos submersos para se esquivar de forma acrobática", nextNode: "act3_kraken_dodge" },
            { text: "Recuar de volta para as margens seguras e contornar (Fugir)", nextNode: "act3_kraken_retreat" },
            { text: "Arriscar tudo: Se atirar sob a lama movediça para tentar cortar os tentáculos por baixo (Sorte CD 18)", nextNode: "act3_kraken_gamble" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["fugir", "recuar", "correr", "escapar"])) {
                return { nextNode: "act3_kraken_retreat" };
            }
            if (matches(clean, ["arriscar", "suicida", "tudo", "sorte", "gamble"])) {
                return { nextNode: "act3_kraken_gamble" };
            }
            return null;
        }
    },
    "act3_kraken_retreat": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você desiste do combate direto. Ao tentar recuar correndo pelas margens lamacentas, um tentáculo do Kraken chicoteia suas costas, rasgando suas vestes e roubando parte de sua energia (Perde 20 PV e 20 PC).\n\nVocê consegue escapar de volta para as cabanas seguras do pântano.",
        choices: [
            { text: "Recuperar-se e tentar abordar o pântano novamente", nextNode: "act3_swamp_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                player.mp = Math.max(0, player.mp - 20);
                return null;
            }
            return { nextNode: "act3_swamp_entry" };
        }
    },
    "act3_kraken_gamble": {
        background: "swamp_mud",
        narrative: "Em um mergulho insano e cego na lama movediça, você afunda deliberadamente sob o lodo ácido, guiando-se apenas pela vibração do chakra para cortar os tendões centrais da criatura.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "luck",
                    cd: 18,
                    successNode: "act3_fight_success",
                    failureNode: "act3_kraken_gamble_fail"
                }
            };
        }
    },
    "act3_kraken_gamble_fail": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sua jogada foi um desastre! A lama ácida preenche seus pulmões e você começa a se afogar, sendo violentamente esmagado pelos tentáculos sob a água turva (Perde 55 PV). Você é cuspido quase inconsciente na margem lamacenta, com o Kraken avançando!",
        choices: [
            { text: "Tentar uma estocada desesperada com a Tanto na força pura (Força CD 15)", nextNode: "act3_kraken_strike_hard_str" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 55);
                return null;
            }
            return null;
        }
    },
    "act3_kraken_doton": {
        background: "swamp_mud",
        narrative: "Você canaliza chakra de terra nas solas dos pés e ergue uma parede compacta de lama endurecida para absorver o impacto dos tentáculos.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act3_kraken_p1_success",
                    failureNode: "act3_kraken_p1_fail"
                }
            };
        }
    },
    "act3_kraken_dodge": {
        background: "swamp_mud",
        narrative: "Você usa reflexos shinobis puros, saltando de raiz em raiz sobre o lodo movediço no momento exato do impacto das chicotadas.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 13,
                    successNode: "act3_kraken_p1_success",
                    failureNode: "act3_kraken_p1_fail"
                }
            };
        }
    },
    "act3_kraken_p1_success": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Defesa perfeita! Os tentáculos colidem contra o obstáculo levantando lama ácida. Sob a água turva, você avista o imenso olho central dourado do Kraken exposto e indefeso.\n\nÉ a sua chance de atacá-lo antes que ele se oculte novamente!",
        choices: [
            { text: "Imbuir Raiton (Raio) na Tanto e perfurar o olho central (Controle de Chakra CD 12)", nextNode: "act3_kraken_strike_easy_will" },
            { text: "Executar um corte de força brutal na base dos tentáculos (Força CD 12)", nextNode: "act3_kraken_strike_easy_str" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act3_kraken_p1_fail": {
        background: "swamp_mud",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você é atingido! Um tentáculo arrebenta sua posição e o arremessa na lama movediça (Perde 20 PV). O Kraken ruge e cobre o próprio corpo sob uma densa couraça de lama ácida espessa.\n\nMesmo ferido e sob forte pressão, você tenta desferir um golpe desesperado para escapar!",
        choices: [
            { text: "Perfurar a couraça de lama usando chakra acumulado na Tanto (Controle de Chakra CD 15)", nextNode: "act3_kraken_strike_hard_will" },
            { text: "Romper a couraça usando força física e determinação pura (Força CD 15)", nextNode: "act3_kraken_strike_hard_str" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                return null;
            }
            return null;
        }
    },
    "act3_kraken_strike_easy_will": {
        background: "swamp_mud",
        narrative: "Você energiza sua Tanto de ferro com descargas elétricas e salta em direção ao olho central exposto da besta.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act3_fight_success",
                    failureNode: "act3_fight_fail"
                }
            };
        }
    },
    "act3_kraken_strike_easy_str": {
        background: "swamp_mud",
        narrative: "Você segura a lâmina com as duas mãos e descarrega um golpe de força física pura nos tendões dos tentáculos da besta.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
                    cd: 12,
                    successNode: "act3_fight_success",
                    failureNode: "act3_fight_fail"
                }
            };
        }
    },
    "act3_kraken_strike_hard_will": {
        background: "swamp_mud",
        narrative: "Coberto de lama ácida e com a visão truvar, você tenta focar sua mente para explodir o chakra da Tanto diretamente na couraça do monstro.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 15,
                    successNode: "act3_fight_success",
                    failureNode: "act3_fight_fail"
                }
            };
        }
    },
    "act3_kraken_strike_hard_str": {
        background: "swamp_mud",
        narrative: "Com os pulmões queimando e sob o abraço viscoso da lama movediça, você tenta desferir um corte de força absoluta contra a couraça.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
                    cd: 15,
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
            const clean = cleanText(text);
            if (clean === "") {
                player.xp += 150;
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 35);
                return null;
            }
            return { nextNode: "act4_labyrinth_entry" };
        }
    },

    // ================= ATO IV: O LABIRINTO DO DRAGÃO DE OBSIDIANA =================
    "act4_labyrinth_entry": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "As catacumbas revelam o antigo Labirinto das Ossadas. Paredes de rocha negra obsidiana se movem com ruídos mecânicos, mudando o trajeto a cada minuto. O calor é infernal.\n\nNo centro da arena circular, repousa o colossal Dragão de Obsidiana (Veldrak). Seus olhos ardem como carvão e suas escamas gotejam lava avermelhada. Ele ruge, cuspindo chamas de fogo negro que ameaçam queimar sua própria alma. A criatura está totalmente revestida por um escudo de magma fervente!",
        choices: [
            { text: "Usar Jutsu de Água (Suiton) para resfriar a armadura de lava dele", nextNode: "act4_dragon_suiton" },
            { text: "Lançar shurikens explosivas na garganta dele quando ele abrir a boca", nextNode: "act4_dragon_shuriken" },
            { text: "Fugir correndo de volta para os túneis estreitos do labirinto (Recuar)", nextNode: "act4_dragon_retreat" },
            { text: "Arriscar tudo: Saltar do teto do labirinto em queda livre na Tanto diretamente sobre a cabeça do dragão (Sorte CD 18)", nextNode: "act4_dragon_gamble" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["suiton", "agua", "gelo", "resfriar", "jutsu"])) {
                return { nextNode: "act4_dragon_suiton" };
            }
            if (matches(clean, ["fugir", "recuar", "correr", "escapar"])) {
                return { nextNode: "act4_dragon_retreat" };
            }
            if (matches(clean, ["arriscar", "suicida", "tudo", "sorte", "gamble"])) {
                return { nextNode: "act4_dragon_gamble" };
            }
            return { nextNode: "act4_dragon_shuriken" };
        }
    },
    "act4_dragon_retreat": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você decide que não está pronto. Ao dar as costas e disparar em direção aos túneis, Veldrak solta um rugido e bate sua cauda espinhosa contra a entrada. Pedras de obsidiana caem e te atingem nas costas (Perde 30 PV).\n\nVocê consegue escapar de volta para as passagens externas do labirinto, seriamente machucado.",
        choices: [
            { text: "Recuperar o fôlego e voltar para a arena do dragão", nextNode: "act4_labyrinth_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 30);
                return null;
            }
            return { nextNode: "act4_labyrinth_entry" };
        }
    },
    "act4_dragon_gamble": {
        background: "sleeping_dragon",
        narrative: "Com coragem insana, você escala as colunas de obsidiana até o teto abobadado e se lança em queda livre de cabeça para baixo, apontando a Tanto diretamente para as narinas incandescentes do dragão.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "luck",
                    cd: 18,
                    successNode: "act4_dragon_success",
                    failureNode: "act4_dragon_gamble_fail"
                }
            };
        }
    },
    "act4_dragon_gamble_fail": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Tentativa trágica! O dragão percebe sua sombra caindo, gira e te atinge no ar com uma patada massiva que te joga contra o chão de rocha (Perde 60 PV). Suas costelas estalam e você mal consegue se mexer sob as garras dele!",
        choices: [
            { text: "Tentar desferir um golpe desesperado na força física pura (Força CD 14)", nextNode: "act4_dragon_strike_hard_str" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 60);
                return null;
            }
            return null;
        }
    },
    "act4_dragon_suiton": {
        background: "sleeping_dragon",
        narrative: "Você executa selos de mão e dispara uma torrente de água fria contra as escamas de lava do dragão para provocar um choque térmico.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 11,
                    successNode: "act4_dragon_p1_success",
                    failureNode: "act4_dragon_p1_fail"
                }
            };
        }
    },
    "act4_dragon_shuriken": {
        background: "sleeping_dragon",
        narrative: "Você espera Veldrak acumular fogo negro na boca e arremessa duas shurikens com selos explosivos diretamente na garganta exposta.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "perception",
                    cd: 12,
                    successNode: "act4_dragon_p1_success",
                    failureNode: "act4_dragon_p1_fail"
                }
            };
        }
    },
    "act4_dragon_p1_success": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sucesso! A armadura de lava de Veldrak estala e solidifica em rocha quebradiça, deixando as asas expostas. O monstro solta um guincho de dor.\n\nEnfurecido pelo resfriamento, o dragão bate as asas gigantes e decola, iniciando um voo rasante para varrer a arena com chamas negras!",
        choices: [
            { text: "Usar Jutsu de Substituição (Kawarimi) nos destroços de obsidiana (Agilidade CD 11)", nextNode: "act4_dragon_p2_dodge_easy" },
            { text: "Ocultar seu calor corporal e chakra sob uma fenda na rocha (Controle de Chakra CD 11)", nextNode: "act4_dragon_p2_hide_easy" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act4_dragon_p1_fail": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O ataque falha! O calor de Veldrak evapora as shurikens/água antes de tocarem a pele dele. Uma onda de choque térmico te atinge (Perde 15 PV).\n\nO dragão ruge e ergue voo com a couraça de magma ainda ativa, mergulhando na sua direção para te esmagar com as garras incandescentes!",
        choices: [
            { text: "Usar Jutsu de Substituição em desespero absoluto (Agilidade CD 14)", nextNode: "act4_dragon_p2_dodge_hard" },
            { text: "Criar uma barreira de chakra de emergência para conter o mergulho (Controle de Chakra CD 14)", nextNode: "act4_dragon_p2_hide_hard" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 15);
                return null;
            }
            return null;
        }
    },
    "act4_dragon_p2_dodge_easy": {
        background: "sleeping_dragon",
        narrative: "Você faz uma troca rápida com uma estátua de rocha quebrada enquanto o sopro de fogo passa carbonizando tudo.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "act4_dragon_p2_success",
                    failureNode: "act4_dragon_p2_fail"
                }
            };
        }
    },
    "act4_dragon_p2_hide_easy": {
        background: "sleeping_dragon",
        narrative: "Você suprime seus batimentos e chakra sob as pedras frias, fazendo o dragão errar o alvo da varredura.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 11,
                    successNode: "act4_dragon_p2_success",
                    failureNode: "act4_dragon_p2_fail"
                }
            };
        }
    },
    "act4_dragon_p2_dodge_hard": {
        background: "sleeping_dragon",
        narrative: "Sob o mergulho pesado e escaldante do dragão, você tenta rolar no limite do reflexo para evitar ser esmagado.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 14,
                    successNode: "act4_dragon_p2_success",
                    failureNode: "act4_dragon_p2_fail"
                }
            };
        }
    },
    "act4_dragon_p2_hide_hard": {
        background: "sleeping_dragon",
        narrative: "Com as chamas vindo direto na sua direção, você canaliza todo o chakra para criar um casulo de resistência pura.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 14,
                    successNode: "act4_dragon_p2_success",
                    failureNode: "act4_dragon_p2_fail"
                }
            };
        }
    },
    "act4_dragon_p2_success": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Evitação limpa! O dragão pousa pesadamente no centro, bufando fumaça cinzenta pelas narinas. Ele está temporariamente lento e vulnerável, com o núcleo de magma do peito exposto e brilhando.\n\nÉ o momento de desferir o golpe decisivo!",
        choices: [
            { text: "Correr e enfiar a Tanto diretamente no núcleo de lava (Agilidade CD 11)", nextNode: "act4_dragon_strike_easy_agi" },
            { text: "Canalizar um golpe de força física bruta para perfurar o peito (Força CD 11)", nextNode: "act4_dragon_strike_easy_str" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act4_dragon_p2_fail": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você sofre graves queimaduras de fogo negro! (Perde 20 PV e 15 de Sanidade). Suas vestes queimam e você cai de joelhos.\n\nO dragão aterrissa na sua frente, com as mandíbulas abertas prontas para te devorar. Você precisa desferir um golpe de vida ou morte!",
        choices: [
            { text: "Atacar o peito da besta no limite do seu reflexo (Agilidade CD 14)", nextNode: "act4_dragon_strike_hard_agi" },
            { text: "Reunir todas as suas forças para resistir e golpear (Força CD 14)", nextNode: "act4_dragon_strike_hard_str" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                player.sanity = Math.max(0, player.sanity - 15);
                return null;
            }
            return null;
        }
    },
    "act4_dragon_strike_easy_agi": {
        background: "sleeping_dragon",
        narrative: "Você corre com velocidade, saltando sobre as rochas para enterrar a Tanto no coração do dragão.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "act4_dragon_success",
                    failureNode: "act4_dragon_fail"
                }
            };
        }
    },
    "act4_dragon_strike_easy_str": {
        background: "sleeping_dragon",
        narrative: "Você empunha a lâmina de ferro e desfere um golpe vertical para quebrar o peito enfraquecido do dragão.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
                    cd: 11,
                    successNode: "act4_dragon_success",
                    failureNode: "act4_dragon_fail"
                }
            };
        }
    },
    "act4_dragon_strike_hard_agi": {
        background: "sleeping_dragon",
        narrative: "Sob o olhar de morte de Veldrak, você tenta rolar entre os dentes dele e cravar a faca no peito blindado.",
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
    "act4_dragon_strike_hard_str": {
        background: "sleeping_dragon",
        narrative: "Ignorando as chamas que queimam sua pele, você avança como um martelo físico para quebrar a carapaça de obsidiana.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "strength",
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
            const clean = cleanText(text);
            if (clean === "") {
                player.inventory.push("coracao_obsidiana");
                player.xp += 200;
                return null;
            }
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                player.mp = Math.max(0, player.mp - 30);
                player.inventory.push("coracao_obsidiana");
                return null;
            }
            return { nextNode: "act5_fortress_entry" };
        }
    },

    // ================= ATO V: A FORTALEZA E O CLÍMAX FINAL =================
    "act5_fortress_entry": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "A Catedral de Ferro do Templo Central ergue-se com colunas góticas e cristais roxos que brilham nas paredes. No altar, a **Lágrima do Renascimento** flutua sob um invólucro mágico.\n\nO Alto Inquisidor da ditadura surge do trono, desembainhando uma espada de ferro maciço:\n\n— Kenji! O verme imundo que roubou os cofres do Soberano! Aqui jaz Sayuri de pedra, e aqui você virará cinzas! O Inquisidor ataca desferindo um corte de vento cortante devastador!",
        choices: [
            { text: "Dividir seu chakra em Clones de Sombra (Kage Bunshin) para flanqueá-lo", nextNode: "act5_inquisitor_clones" },
            { text: "Erguer um escudo de chakra puro (Chakra Shield) para absorver o corte", nextNode: "act5_inquisitor_shield" },
            { text: "Recuar correndo pelas escadarias para se reorganizar (Fugir)", nextNode: "act5_inquisitor_retreat" },
            { text: "Arriscar tudo: Entregar-se voluntariamente à espada dele para desferir um golpe fatal (Sorte CD 17)", nextNode: "act5_inquisitor_gamble" },
            { text: "Outra resposta...", isCustom: true }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
            if (matches(clean, ["curse", "maldicao", "braco", "pedra", "medusa"])) {
                return { nextNode: "act5_inquisitor_curse" };
            }
            if (matches(clean, ["fugir", "recuar", "correr", "escapar"])) {
                return { nextNode: "act5_inquisitor_retreat" };
            }
            if (matches(clean, ["arriscar", "suicida", "tudo", "sorte", "gamble"])) {
                return { nextNode: "act5_inquisitor_gamble" };
            }
            return { nextNode: "act5_inquisitor_clones" };
        }
    },
    "act5_inquisitor_retreat": {
        background: "temple_interior",
        speaker: "Alto Inquisidor",
        emotion: "Raiva",
        dialogue: "Fugir agora, Kenji? Não há escapatória deste santuário!",
        narrative: "Ao tentar correr em direção às portas de ferro da catedral, o Inquisidor ergue a mão e dispara estacas de ferro mágico em suas costas (Perde 30 PV e 20 PC). Você desaba nas escadas da entrada da Fortaleza, forçado a lutar novamente.",
        choices: [
            { text: "Levantar-se e confrontá-lo novamente", nextNode: "act5_fortress_entry" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 30);
                player.mp = Math.max(0, player.mp - 20);
                return null;
            }
            return { nextNode: "act5_fortress_entry" };
        }
    },
    "act5_inquisitor_gamble": {
        background: "temple_interior",
        narrative: "Em um ato de loucura deliberada, você abaixa completamente sua guarda e avança de peito aberto contra o corte de ferro dele, apostando na sorte pura de que o golpe dele não atinja nenhum órgão vital antes que você o trespasse.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "luck",
                    cd: 17,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_gamble_fail"
                }
            };
        }
    },
    "act5_inquisitor_gamble_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sua aposta falha terrivelmente! A grande espada de ferro do inquisidor atravessa seu estômago com violência (Perde 65 PV). Você cai de joelhos cuspindo sangue, com o inquisidor puxando a lâmina para te decepar!",
        choices: [
            { text: "Tentar uma estocada cega com o resto do seu chakra (Controle de Chakra CD 14)", nextNode: "act5_inquisitor_finish_hard_will" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 65);
                return null;
            }
            return null;
        }
    },
    "act5_inquisitor_clones": {
        background: "temple_interior",
        narrative: "Você projeta três ilusões idênticas que correm em direções opostas pelas colunas de ferro, tentando confundir os ataques pesados dele.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "act5_inquisitor_p1_success",
                    failureNode: "act5_inquisitor_p1_fail"
                }
            };
        }
    },
    "act5_inquisitor_shield": {
        background: "temple_interior",
        narrative: "Você firma os pés no chão gótico e projeta uma barreira translúcida de chakra comprimido para parar a lâmina do inquisidor.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act5_inquisitor_p1_success",
                    failureNode: "act5_inquisitor_p1_fail"
                }
            };
        }
    },
    "act5_inquisitor_p1_success": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Defesa perfeita! O Inquisidor atinge o clone/barreira deixando a guarda exposta por um curto período. Suas colunas góticas estremecem.\n\nPercebendo a brecha, ele recua rapidamente e envolve sua grande espada em raios de chakra elétrico escuro que drenam energia espiritual!",
        choices: [
            { text: "Usar a maldição de pedra do seu braço (Braço de Pedra) para parar a lâmina (Controle de Chakra CD 12)", nextNode: "act5_inquisitor_p2_curse_easy" },
            { text: "Efetuar esquivas acrobatas em zigue-zague para driblar o corte (Agilidade CD 12)", nextNode: "act5_inquisitor_p2_dodge_easy" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act5_inquisitor_p1_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Você é atingido! O golpe pesado de vento corta seu ombro (Perde 20 PV). Você cai no chão de pedra, sangrando.\n\nO Inquisidor não te dá tempo de respirar e ergue a grande lâmina carregada de chakra elétrico roxo para desferir um corte decapante!",
        choices: [
            { text: "Aparar a lâmina usando o braço amaldiçoado petrificado (Controle de Chakra CD 15)", nextNode: "act5_inquisitor_p2_curse_hard" },
            { text: "Rolar no chão em desespero absoluto para evitar o corte (Agilidade CD 15)", nextNode: "act5_inquisitor_p2_dodge_hard" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 20);
                return null;
            }
            return null;
        }
    },
    "act5_inquisitor_p2_curse_easy": {
        background: "temple_interior",
        narrative: "Você endurece seu braço esquerdo em pedra negra de obsidiana e bloqueia o corte elétrico com faíscas roxas estridentes.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 12,
                    successNode: "act5_inquisitor_p2_success",
                    failureNode: "act5_inquisitor_p2_fail"
                }
            };
        }
    },
    "act5_inquisitor_p2_dodge_easy": {
        background: "temple_interior",
        narrative: "Você salta rente ao chão usando a agilidade shinobi para deslizar por baixo da trajetória da lâmina elétrica.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 12,
                    successNode: "act5_inquisitor_p2_success",
                    failureNode: "act5_inquisitor_p2_fail"
                }
            };
        }
    },
    "act5_inquisitor_p2_curse_hard": {
        background: "temple_interior",
        narrative: "Ferido e sem forças, você tenta concentrar o resto da maldição no seu braço para parar o golpe fulminante diretamente.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 15,
                    successNode: "act5_inquisitor_p2_success",
                    failureNode: "act5_inquisitor_p2_fail"
                }
            };
        }
    },
    "act5_inquisitor_p2_dodge_hard": {
        background: "temple_interior",
        narrative: "Sob a iminência da lâmina, você tenta girar o corpo no lodo de sangue e rolar para fora da trajetória do corte.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 15,
                    successNode: "act5_inquisitor_p2_success",
                    failureNode: "act5_inquisitor_p2_fail"
                }
            };
        }
    },
    "act5_inquisitor_p2_success": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Sucesso! O Inquisidor está exausto e cambaleia para trás, ofegante. O canal de chakra elétrico dele se quebra, deixando seu coração desprotegido.\n\nÉ o golpe final da sua redenção shinobi!",
        choices: [
            { text: "Canalizar toda a sua determinação e chakra na Tanto para um contra-ataque de perfuração (Controle de Chakra CD 11)", nextNode: "act5_inquisitor_finish_easy_will" },
            { text: "Executar uma investida rápida de corte no pescoço (Agilidade CD 11)", nextNode: "act5_inquisitor_finish_easy_agi" }
        ],
        processAction: (text, player) => {
            return null;
        }
    },
    "act5_inquisitor_p2_fail": {
        background: "temple_interior",
        speaker: "Narrador",
        dialogue: "",
        narrative: "O corte te atinge e consome suas energias espirituais! (Perde 25 PC e 15 PV). Suas veias ardem de dor.\n\nO Inquisidor avança para finalizar o combate, rindo com escárnio. Você precisa tentar um último contra-ataque desesperado!",
        choices: [
            { text: "Focar seu último fôlego de chakra para uma investida de perfuração (Controle de Chakra CD 14)", nextNode: "act5_inquisitor_finish_hard_will" },
            { text: "Tentar atingi-lo jogando uma bomba de fumaça e veneno para golpear por trás (Agilidade CD 14)", nextNode: "act5_inquisitor_finish_hard_agi" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 15);
                player.mp = Math.max(0, player.mp - 25);
                return null;
            }
            return null;
        }
    },
    "act5_inquisitor_finish_easy_will": {
        background: "temple_interior",
        narrative: "Você projeta uma lâmina de chakra azul na ponta da Tanto e corre contra o Inquisidor.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 11,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_fail"
                }
            };
        }
    },
    "act5_inquisitor_finish_easy_agi": {
        background: "temple_interior",
        narrative: "Você corre furtivamente pelas sombras das colunas e ataca com cortes precisos pelas costas dele.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 11,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_fail"
                }
            };
        }
    },
    "act5_inquisitor_finish_hard_will": {
        background: "temple_interior",
        narrative: "Sob extrema dor e quase sem forças, você foca todo o seu ser na lâmina para atravessar a armadura do inquisidor.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "chakraControl",
                    cd: 14,
                    successNode: "act5_inquisitor_success",
                    failureNode: "act5_inquisitor_fail"
                }
            };
        }
    },
    "act5_inquisitor_finish_hard_agi": {
        background: "temple_interior",
        narrative: "Com a visão escurecendo, você joga a bomba de fumaça ácida no rosto dele e avança para um último corte cego.",
        processAction: (text, player) => {
            return {
                rollRequired: {
                    attribute: "agility",
                    cd: 14,
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
            const clean = cleanText(text);
            if (clean === "") return null;
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
            const clean = cleanText(text);
            if (clean === "") {
                player.hp = Math.max(0, player.hp - 30);
                return null;
            }
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
            if (clean === "") return null;
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
            const clean = cleanText(text);
            if (clean === "") return null;
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
            const clean = cleanText(text);
            if (clean === "") return null;
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
            const clean = cleanText(text);
            if (clean === "") return null;
            return { nextNode: "prologue_reset" };
        }
    },

    "game_over_death": {
        background: "sleeping_dragon",
        speaker: "Narrador",
        dialogue: "",
        narrative: "Seus ferimentos foram fatais. Suas vistas escurecem e o frio da morte consome seu último sopro de vida. A imagem de Sayuri de pedra desaparece sob seus olhos turvos...\n\nSua jornada shinobi terminou precocemente nas sombras de Kagegahara.",
        choices: [
            { text: "Reiniciar Jornada (Menu Principal)", nextNode: "prologue_reset" }
        ],
        processAction: (text, player) => {
            const clean = cleanText(text);
            if (clean === "") return null;
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
                if (!this.activeRoll) {
                    console.error("Erro: Nenhuma rolagem ativa configurada no controlador!");
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
                                console.error("Erro ao aplicar transição de nó:", errInnerInner);
                            }
                        }, 1500);
                    } catch (errInner) {
                        console.error("Erro ao processar dados da rolagem:", errInner);
                    }

                }, 1000);
            } catch (errOuter) {
                console.error("Erro catastrófico no clique do D20:", errOuter);
            }
        });

        document.addEventListener('mousemove', (e) => {
            const overlay = document.getElementById('flashlight-overlay');
            if (overlay && overlay.style.display !== 'none') {
                const x = e.clientX;
                const y = e.clientY;
                overlay.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, transparent 0%, rgba(5, 2, 8, 0.96) 100%)`;
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
            if (this.player.hp <= 0 && nodeId !== "game_over_death" && nodeId !== "prologue_reset") {
                nodeId = "game_over_death";
            }
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

            // Toggle do Efeito Lanterna e Contador de Pânico
            const overlay = document.getElementById('flashlight-overlay');
            if (overlay) {
                const isDarkArea = nodeId.startsWith("act2_forest") || nodeId.startsWith("act4_labyrinth") || this.player.sanity < 40;
                if (isDarkArea && nodeId !== "prologue_entry" && nodeId !== "game_over_death" && nodeId !== "prologue_reset") {
                    overlay.style.display = "block";
                } else {
                    overlay.style.display = "none";
                }
            }

            const panicBar = document.getElementById('kagegahara-panic-bar');
            if (panicBar) {
                const isEclipse = nodeId.startsWith("act4") || nodeId.startsWith("act5") || this.player.sanity < 50;
                if (isEclipse && nodeId !== "prologue_entry" && nodeId !== "game_over_death" && nodeId !== "prologue_reset") {
                    panicBar.style.display = "block";
                    const panicVal = 100 - this.player.sanity;
                    document.getElementById('panic-percent').textContent = panicVal;
                } else {
                    panicBar.style.display = "none";
                }
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

        let narrative = node.narrative || "";
        if (this.player.sanity < 45 && this.currentNodeId !== "prologue_entry") {
            const words = narrative.split(" ");
            const corruptCount = Math.floor(words.length * 0.15);
            for (let i = 0; i < corruptCount; i++) {
                const idx = Math.floor(Math.random() * words.length);
                if (words[idx] && !words[idx].includes("<span") && words[idx].length > 1) {
                    words[idx] = `<span class="glitch-corrupt">${words[idx]}</span>`;
                }
            }
            narrative = words.join(" ");
        }
        document.getElementById('vn-narrative-text').innerHTML = narrative;

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

