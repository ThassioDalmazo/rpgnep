import { DEFAULT_MONSTERS } from './constants';
import { Monster } from './types';

export type ItemType = 'potion' | 'weapon' | 'armor';
export type ItemRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário';

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    heal?: number;
    mpHeal?: number;
    atkBonus?: number;
    defBonus?: number;
    price: number;
}

export type HeroClass = 'Guerreiro' | 'Mago' | 'Ladino';

export class Player {
    heroClass: HeroClass = 'Guerreiro';
    hpMax: number = 50;
    hp: number = 50;
    mpMax: number = 20;
    mp: number = 20;
    baseAttack: number = 10;
    baseDefense: number = 5;
    level: number = 1;
    xp: number = 0;
    gold: number = 0;
    inventory: Item[] = [];
    weapon: Item | null = null;
    armor: Item | null = null;

    get attack(): number {
        return this.baseAttack + (this.weapon?.atkBonus || 0);
    }

    get defense(): number {
        return this.baseDefense + (this.armor?.defBonus || 0);
    }

    initClass(c: HeroClass) {
        this.heroClass = c;
        if (c === 'Guerreiro') { this.hpMax = 60; this.hp = 60; this.mpMax = 15; this.mp = 15; this.baseAttack = 8; this.baseDefense = 6; }
        if (c === 'Mago') { this.hpMax = 35; this.hp = 35; this.mpMax = 50; this.mp = 50; this.baseAttack = 12; this.baseDefense = 3; }
        if (c === 'Ladino') { this.hpMax = 45; this.hp = 45; this.mpMax = 25; this.mp = 25; this.baseAttack = 10; this.baseDefense = 4; }
    }

    gainXp(amount: number): boolean {
        this.xp += amount;
        let leveledUp = false;
        while (this.xp >= this.xpNeeded()) {
            this.xp -= this.xpNeeded();
            this.levelUp();
            leveledUp = true;
        }
        return leveledUp;
    }

    xpNeeded(): number {
        return this.level * 25;
    }

    levelUp() {
        this.level++;
        if (this.heroClass === 'Guerreiro') { this.hpMax += 12; this.mpMax += 2; this.baseAttack += 2; this.baseDefense += 2; }
        if (this.heroClass === 'Mago') { this.hpMax += 6; this.mpMax += 8; this.baseAttack += 3; this.baseDefense += 1; }
        if (this.heroClass === 'Ladino') { this.hpMax += 8; this.mpMax += 4; this.baseAttack += 2; this.baseDefense += 1; }
        this.hp = this.hpMax;
        this.mp = this.mpMax;
    }

    heal(amount: number) { this.hp = Math.min(this.hpMax, this.hp + amount); }
    restoreMp(amount: number) { this.mp = Math.min(this.mpMax, this.mp + amount); }

    takeDamage(amount: number, ignoreDef: boolean = false) {
        const def = ignoreDef ? 0 : this.defense;
        const damage = Math.max(1, amount - def);
        this.hp = Math.max(0, this.hp - damage);
        return damage;
    }

    equip(item: Item) {
        if (item.type === 'weapon') {
            if (this.weapon) this.inventory.push(this.weapon);
            this.weapon = item;
        } else if (item.type === 'armor') {
            if (this.armor) this.inventory.push(this.armor);
            this.armor = item;
        }
        this.inventory = this.inventory.filter(i => i.id !== item.id);
    }
}

function parseCR(cr: string): number {
    if (!cr) return 0;
    if (cr.includes('/')) {
        const [num, den] = cr.split('/');
        return parseInt(num) / parseInt(den);
    }
    return parseInt(cr) || 0;
}

export class Enemy {
    monsterDef: Monster;
    name: string;
    hpMax: number;
    hp: number;
    attack: number;
    defense: number;
    xpReward: number;
    goldReward: number;
    isBoss: boolean;
    imageUrl: string;

    constructor(level: number, isBoss: boolean = false) {
        this.isBoss = isBoss;
        
        let possibleMonsters = DEFAULT_MONSTERS;
        if (isBoss) {
            possibleMonsters = DEFAULT_MONSTERS.filter(m => parseCR(m.cr) >= 2 && parseCR(m.cr) <= level + 3);
            if (possibleMonsters.length === 0) possibleMonsters = DEFAULT_MONSTERS.filter(m => parseCR(m.cr) >= 2);
        } else {
            const targetCR = Math.max(0.125, level / 4);
            possibleMonsters = DEFAULT_MONSTERS.filter(m => parseCR(m.cr) <= targetCR + 1 && parseCR(m.cr) >= targetCR - 1);
            if (possibleMonsters.length === 0) possibleMonsters = DEFAULT_MONSTERS.filter(m => parseCR(m.cr) <= 1);
        }

        if (possibleMonsters.length === 0) possibleMonsters = DEFAULT_MONSTERS;

        this.monsterDef = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
        
        this.name = this.monsterDef.name;
        this.imageUrl = this.monsterDef.imageUrl || '';
        
        const multiplier = isBoss ? 2.5 : 1;
        this.hpMax = Math.floor(this.monsterDef.hp * (1 + (level * 0.2)) * multiplier);
        this.hp = this.hpMax;
        
        this.attack = (this.monsterDef.actions[0]?.hit || 2) + Math.floor(level / 3);
        this.defense = this.monsterDef.ac;
        
        this.xpReward = Math.floor((15 + parseCR(this.monsterDef.cr) * 25) * multiplier);
        this.goldReward = Math.floor((10 + parseCR(this.monsterDef.cr) * 15) * multiplier);
    }

    takeDamage(amount: number, ignoreDef: boolean = false) {
        const defReduction = ignoreDef ? 0 : Math.floor(this.defense / 4);
        const damage = Math.max(1, amount - defReduction);
        this.hp = Math.max(0, this.hp - damage);
        return damage;
    }

    performAttack(): { name: string, damage: number } {
        if (!this.monsterDef || !this.monsterDef.actions || this.monsterDef.actions.length === 0) {
            return { name: "Ataque Básico", damage: 2 };
        }
        const action = this.monsterDef.actions[Math.floor(Math.random() * this.monsterDef.actions.length)];
        
        let baseDmg = 0;
        const dmgMatch = action.dmg.match(/(\d+)d(\d+)(?:\+(\d+))?/);
        if (dmgMatch) {
            const diceCount = parseInt(dmgMatch[1]);
            const diceSides = parseInt(dmgMatch[2]);
            const flatBonus = dmgMatch[3] ? parseInt(dmgMatch[3]) : 0;
            
            for (let i = 0; i < diceCount; i++) {
                baseDmg += Math.floor(Math.random() * diceSides) + 1;
            }
            baseDmg += flatBonus;
        } else {
            const flatMatch = action.dmg.match(/(\d+)/);
            baseDmg = flatMatch ? parseInt(flatMatch[1]) : 2;
        }

        return { name: action.n, damage: Math.max(1, baseDmg) };
    }
}

export type GameState = 'start' | 'idle' | 'combat' | 'merchant' | 'event' | 'gameover' | 'victory';

export interface MerchantItem extends Item {
    sold: boolean;
}

export class Game {
    player: Player;
    currentRoom: number = 0;
    currentEnemy: Enemy | null = null;
    merchantItems: MerchantItem[] = [];
    currentEvent: { title: string, desc: string, options: { label: string, action: () => void }[] } | null = null;
    logs: string[] = [];
    state: GameState = 'start';

    constructor() {
        this.player = new Player();
    }

    startGame(heroClass: HeroClass) {
        this.player = new Player();
        this.player.initClass(heroClass);
        this.currentRoom = 1;
        this.logs = [];
        this.log(`Você iniciou sua jornada como ${heroClass}!`);
        this.generateRandomRoom();
    }

    log(msg: string) {
        this.logs.unshift(msg);
        if (this.logs.length > 50) this.logs.pop();
    }

    nextRoom() {
        if (this.state === 'gameover' || this.state === 'victory') return;
        this.currentRoom++;
        
        if (this.currentRoom === 20) {
            this.generateBossRoom("Chefe Final");
        } else if (this.currentRoom % 5 === 0) {
            this.generateBossRoom();
        } else {
            this.generateRandomRoom();
        }
    }

    generateBossRoom(customName?: string) {
        this.state = 'combat';
        this.currentEnemy = new Enemy(this.player.level, true);
        if (customName) this.currentEnemy.name = customName;
        this.log(`⚠️ SALA ${this.currentRoom}: Você encontrou um BOSS! Prepare-se para a batalha contra ${this.currentEnemy.name}.`);
    }

    generateRandomRoom() {
        const rand = Math.random();
        if (rand < 0.45) {
            // 45% Monster
            this.state = 'combat';
            this.currentEnemy = new Enemy(this.player.level);
            this.log(`SALA ${this.currentRoom}: Um ${this.currentEnemy.name} apareceu!`);
        } else if (rand < 0.65) {
            // 20% Treasure
            this.state = 'idle';
            this.currentEnemy = null;
            const gold = Math.floor(Math.random() * 30) + 10 * this.player.level;
            this.player.gold += gold;
            this.log(`SALA ${this.currentRoom}: Você encontrou um baú de tesouro com ${gold} PO!`);
            this.rollItem();
        } else if (rand < 0.80) {
            // 15% Merchant
            this.state = 'merchant';
            this.currentEnemy = null;
            this.generateMerchant();
            this.log(`SALA ${this.currentRoom}: Você encontrou um Mercador viajante.`);
        } else if (rand < 0.95) {
            // 15% Event
            this.state = 'event';
            this.currentEnemy = null;
            this.generateEvent();
        } else {
            // 5% Empty
            this.state = 'idle';
            this.currentEnemy = null;
            this.log(`SALA ${this.currentRoom}: A sala está vazia. Um momento de paz para descansar.`);
            this.player.heal(10);
            this.player.restoreMp(5);
        }
    }

    generateMerchant() {
        this.merchantItems = [];
        for (let i = 0; i < 3; i++) {
            const item = this.createRandomItem(this.player.level + 1);
            this.merchantItems.push({ ...item, sold: false });
        }
    }

    buyItem(index: number) {
        const item = this.merchantItems[index];
        if (!item || item.sold) return;
        if (this.player.gold >= item.price) {
            this.player.gold -= item.price;
            item.sold = true;
            this.player.inventory.push(item);
            this.log(`Você comprou ${item.name} por ${item.price} PO.`);
        } else {
            this.log(`Ouro insuficiente para comprar ${item.name}.`);
        }
    }

    generateEvent() {
        const events = [
            {
                title: "Altar Sombrio",
                desc: "Um altar de obsidiana pulsando com energia mágica. O que você faz?",
                options: [
                    { label: "Orar (Recupera HP, perde MP)", action: () => { this.player.heal(999); this.player.mp = 0; this.log("Você se sente revigorado, mas sua mente está exausta."); this.state = 'idle'; } },
                    { label: "Ignorar", action: () => { this.log("Você passa reto pelo altar."); this.state = 'idle'; } }
                ]
            },
            {
                title: "Fonte Cristalina",
                desc: "Uma fonte de água brilhante. Beber a água parece tentador.",
                options: [
                    { label: "Beber (Recupera MP)", action: () => { this.player.restoreMp(999); this.log("A água restaura toda sua energia mágica!"); this.state = 'idle'; } },
                    { label: "Jogar Moeda (-10 PO, Sorte?)", action: () => { 
                        if (this.player.gold >= 10) {
                            this.player.gold -= 10;
                            if (Math.random() > 0.5) { this.rollItem(); this.log("A fonte brilhou e um item apareceu!"); }
                            else { this.log("Nada aconteceu."); }
                        } else { this.log("Você não tem ouro suficiente."); }
                        this.state = 'idle';
                    }}
                ]
            }
        ];
        this.currentEvent = events[Math.floor(Math.random() * events.length)];
        this.log(`SALA ${this.currentRoom}: Evento - ${this.currentEvent.title}`);
    }

    createRandomItem(level: number): Item {
        const rand = Math.random();
        let rarity: ItemRarity = 'Comum';
        let priceMult = 1;
        
        if (rand < 0.05) { rarity = 'Lendário'; priceMult = 5; }
        else if (rand < 0.2) { rarity = 'Épico'; priceMult = 3; }
        else if (rand < 0.5) { rarity = 'Raro'; priceMult = 1.5; }

        const typeRand = Math.random();
        const id = Math.random().toString(36).substr(2, 9);
        
        if (typeRand < 0.4) {
            // Weapon
            const bonus = Math.floor(level * (priceMult * 1.5));
            return { id, name: `Arma ${rarity}`, type: 'weapon', rarity, atkBonus: bonus, price: 20 * priceMult * level };
        } else if (typeRand < 0.8) {
            // Armor
            const bonus = Math.floor(level * priceMult);
            return { id, name: `Armadura ${rarity}`, type: 'armor', rarity, defBonus: bonus, price: 20 * priceMult * level };
        } else {
            // Potion
            if (Math.random() > 0.5) {
                return { id, name: `Poção de Vida ${rarity}`, type: 'potion', rarity, heal: 20 * priceMult * level, price: 10 * priceMult };
            } else {
                return { id, name: `Poção de Mana ${rarity}`, type: 'potion', rarity, mpHeal: 10 * priceMult * level, price: 10 * priceMult };
            }
        }
    }

    rollItem() {
        const item = this.createRandomItem(this.player.level);
        this.player.inventory.push(item);
        this.log(`Você obteve: ${item.name} (${item.rarity})!`);
    }

    attack() {
        if (this.state !== 'combat' || !this.currentEnemy) return;

        // Player attacks
        const dmgDealt = this.currentEnemy.takeDamage(this.player.attack);
        this.log(`Você atacou o ${this.currentEnemy.name} causando ${dmgDealt} de dano.`);

        this.checkEnemyDeath();
        if (this.state === 'combat') this.enemyTurn();
    }

    useSkill() {
        if (this.state !== 'combat' || !this.currentEnemy) return;

        let skillName = "";
        let mpCost = 0;
        let dmgDealt = 0;

        if (this.player.heroClass === 'Guerreiro') {
            skillName = "Golpe Brutal"; mpCost = 10;
            if (this.player.mp >= mpCost) {
                this.player.mp -= mpCost;
                dmgDealt = this.currentEnemy.takeDamage(Math.floor(this.player.attack * 1.8));
            }
        } else if (this.player.heroClass === 'Mago') {
            skillName = "Bola de Fogo"; mpCost = 15;
            if (this.player.mp >= mpCost) {
                this.player.mp -= mpCost;
                dmgDealt = this.currentEnemy.takeDamage(Math.floor(this.player.attack * 2.5), true); // Ignore def
            }
        } else if (this.player.heroClass === 'Ladino') {
            skillName = "Ataque Furtivo"; mpCost = 8;
            if (this.player.mp >= mpCost) {
                this.player.mp -= mpCost;
                const isCrit = Math.random() > 0.3; // 70% crit
                dmgDealt = this.currentEnemy.takeDamage(isCrit ? Math.floor(this.player.attack * 3) : this.player.attack);
                if (isCrit) skillName += " (CRÍTICO!)";
            }
        }

        if (dmgDealt > 0) {
            this.log(`Você usou [${skillName}] causando ${dmgDealt} de dano!`);
            this.checkEnemyDeath();
            if (this.state === 'combat') this.enemyTurn();
        } else {
            this.log(`MP Insuficiente para usar Habilidade!`);
        }
    }

    checkEnemyDeath() {
        if (this.currentEnemy && this.currentEnemy.hp <= 0) {
            this.log(`Você derrotou o ${this.currentEnemy.name}!`);
            const leveledUp = this.player.gainXp(this.currentEnemy.xpReward);
            this.player.gold += this.currentEnemy.goldReward;
            this.log(`Ganhou ${this.currentEnemy.xpReward} XP e ${this.currentEnemy.goldReward} PO.`);
            
            // Drop chance
            if (Math.random() < 0.3 || this.currentEnemy.isBoss) {
                this.rollItem();
            }

            if (leveledUp) {
                this.log(`🎉 Você subiu para o nível ${this.player.level}! Atributos aumentados. HP e MP restaurados.`);
            }
            
            if (this.currentEnemy.isBoss && this.currentRoom >= 20) {
                this.state = 'victory';
                this.log("🏆 VOCÊ DERROTOU O CHEFE FINAL E VENCEU A MASMORRA!");
                return;
            }

            this.state = 'idle';
            this.currentEnemy = null;
        }
    }

    enemyTurn() {
        if (!this.currentEnemy) return;
        const enemyAtk = this.currentEnemy.performAttack();
        const dmgTaken = this.player.takeDamage(enemyAtk.damage);
        this.log(`O ${this.currentEnemy.name} usou [${enemyAtk.name}] e causou ${dmgTaken} de dano.`);

        if (this.player.hp <= 0) {
            this.state = 'gameover';
            this.log("💀 Você foi derrotado... Fim de jogo.");
        }
    }

    useItem(index: number) {
        if (this.state === 'gameover' || this.state === 'start') return;
        const item = this.player.inventory[index];
        if (!item) return;

        if (item.type === 'potion') {
            if (item.heal) {
                this.player.heal(item.heal);
                this.log(`Você usou ${item.name} e recuperou ${item.heal} HP.`);
            }
            if (item.mpHeal) {
                this.player.restoreMp(item.mpHeal);
                this.log(`Você usou ${item.name} e recuperou ${item.mpHeal} MP.`);
            }
            this.player.inventory.splice(index, 1);
        } else {
            this.player.equip(item);
            this.log(`Você equipou ${item.name}.`);
        }

        // If in combat, using an item takes a turn
        if (this.state === 'combat' && this.currentEnemy) {
            this.enemyTurn();
        }
    }

    flee() {
        if (this.state !== 'combat' || !this.currentEnemy) return;
        
        if (this.currentEnemy.isBoss) {
            this.log("Você não pode fugir de um chefe!");
            return;
        }

        const rand = Math.random();
        if (rand < 0.5) {
            this.log("Você conseguiu fugir para a próxima sala!");
            this.state = 'idle';
            this.currentEnemy = null;
            this.nextRoom();
        } else {
            this.log("Você falhou em fugir!");
            this.enemyTurn();
        }
    }

    save() {
        const data = {
            player: this.player,
            currentRoom: this.currentRoom,
            currentEnemy: this.currentEnemy,
            logs: this.logs,
            state: this.state
        };
        try {
            localStorage.setItem('rpgnep_adventure_save', JSON.stringify(data));
        } catch (e) {
            console.warn("Adventure save failed: Quota exceeded", e);
        }
        this.log("Jogo salvo com sucesso.");
    }

    load() {
        const saved = localStorage.getItem('rpgnep_adventure_save');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(this.player, data.player);
            this.currentRoom = data.currentRoom;
            if (data.currentEnemy) {
                this.currentEnemy = new Enemy(1); // dummy
                Object.assign(this.currentEnemy, data.currentEnemy);
            } else {
                this.currentEnemy = null;
            }
            this.logs = data.logs;
            this.state = data.state;
            this.log("Jogo carregado.");
        }
    }
}
