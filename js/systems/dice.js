/**
 * Motor de Dados do RPG Kagegahara
 * Controla rolagens puras (D4-D20) e testes de ação baseados em CD.
 */
export class DiceEngine {
    /**
     * Rola um dado com 'sides' lados e soma um modificador.
     * @param {number} sides - Lados do dado (4, 6, 8, 10, 12, 20)
     * @param {number} modifier - Bônus a ser somado ao resultado
     * @returns {Object} Resultado detalhado da rolagem
     */
    static roll(sides, modifier = 0) {
        if (![4, 6, 8, 10, 12, 20].includes(sides)) {
            throw new Error(`Tipo de dado inválido: D${sides}`);
        }
        
        const naturalRoll = Math.floor(Math.random() * sides) + 1;
        const finalResult = naturalRoll + modifier;
        
        const isCritSuccess = (sides === 20 && naturalRoll === 20);
        const isCritFailure = (sides === 20 && naturalRoll === 1);
        
        return {
            sides,
            naturalRoll,
            modifier,
            finalResult,
            isCritSuccess,
            isCritFailure
        };
    }

    /**
     * Executa um teste de ação e gera uma reação psicológica (NPRE) correspondente.
     * @param {number} sides - Tipo do dado (geralmente 20)
     * @param {number} modifier - Modificador de atributo
     * @param {number} cd - Classe de Dificuldade (CD) para sucesso
     * @param {Object} speakerProfile - Perfil de personalidade do NPC comentando
     * @returns {Object} Detalhes do teste e o texto gerado
     */
    static testActionWithReaction(sides, modifier = 0, cd = 10, speakerProfile = null) {
        const rollResult = this.roll(sides, modifier);
        const success = rollResult.finalResult >= cd;
        
        // Perfil padrão caso não seja fornecido
        const speaker = speakerProfile || {
            name: "Mestre Yusei",
            avatar: "👺",
            personality: { autocontrol: 9, empathy: 7 }
        };

        const reaction = this.generateNprReaction(rollResult, success, cd, speaker);
        
        return {
            roll: rollResult,
            cd,
            success,
            reaction
        };
    }

    /**
     * Gera uma fala adaptativa baseada na rolagem de dados e perfil do NPC (NPRE).
     * @private
     */
    static generateNprReaction(roll, success, cd, speaker) {
        let emotion = "Neutro";
        let text = "";

        if (roll.isCritSuccess) {
            emotion = "Admiração";
            text = speaker.personality.autocontrol > 7 
                ? `"Uma execução esplêndida. Seu fluxo de chakra está em perfeita harmonia com seu corpo. Continue assim."`
                : `"Inacreditável! Que poder magnífico! Esse é o verdadeiro potencial de um shinobi!"`;
        } 
        else if (roll.isCritFailure) {
            emotion = "Frustração";
            text = speaker.personality.empathy > 5
                ? `"Cuidado! Seu chakra entrou em colapso nas suas mãos. Respire fundo e tente reestabelecer o fluxo."`
                : `"Que exibição deplorável. Focar tanta energia e vacilar no último segundo é um erro amador."`;
        } 
        else if (success) {
            emotion = "Alegria";
            if (roll.finalResult - cd >= 5) {
                text = `"Muito bem. A técnica foi limpa e precisa. Você está demonstrando progresso real."`;
            } else {
                text = `"Suficiente para passar. Mas não dependa de rolagens apertadas; a sorte é uma aliada inconstante."`;
            }
        } 
        else {
            emotion = "Desprezo";
            if (cd - roll.finalResult >= 5) {
                text = `"Sua postura está completamente errada. Você dispersou o chakra antes do tempo. Concentre-se!"`;
            } else {
                text = `"Por muito pouco. Faltou um ajuste fino na sua concentração. Repita o movimento."`;
            }
        }

        return {
            speakerName: speaker.name,
            speakerAvatar: speaker.avatar,
            emotion,
            text
        };
    }
}
