// Basic game state
let player = {
    className: "",
    hp: 0,
    maxHp: 0,
    gold: 0,
    inventory: []
};

let currentEncounter = null;

const introScreen = document.getElementById('intro');
const gameScreen = document.getElementById('game');
const descriptionEl = document.getElementById('description');
const statusEl = document.getElementById('status');
const optionsEl = document.getElementById('options');

// Class selection
document.querySelectorAll('.class-select').forEach(btn => {
    btn.addEventListener('click', () => {
        const chosenClass = btn.dataset.class;
        setupPlayer(chosenClass);
        startGame();
    });
});

function setupPlayer(chosenClass) {
    player.className = chosenClass;
    switch(chosenClass) {
        case 'Warrior':
            player.hp = player.maxHp = 30;
            player.gold = 10;
            player.inventory = ["Rusty Sword"];
            break;
        case 'Mage':
            player.hp = player.maxHp = 20;
            player.gold = 15;
            player.inventory = ["Old Staff"];
            break;
        case 'Ranger':
            player.hp = player.maxHp = 25;
            player.gold = 12;
            player.inventory = ["Short Bow"];
            break;
    }
}

function startGame() {
    introScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    showEncounter({
        text: "You stand at the edge of a dense forest. The kingdom’s capital lies to the north, and rumors say that a band of goblins has been sighted nearby.",
        options: [
            { text: "Venture into the forest", action: forestEncounter },
            { text: "Head towards the capital", action: cityEncounter }
        ]
    });
}

function showEncounter(encounter) {
    currentEncounter = encounter;
    descriptionEl.textContent = encounter.text;
    updateStatus();

    optionsEl.innerHTML = "";
    encounter.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            opt.action();
        });
        optionsEl.appendChild(btn);
    });
}

function updateStatus() {
    statusEl.textContent = `Class: ${player.className} | HP: ${player.hp}/${player.maxHp} | Gold: ${player.gold}`;
}

// Sample Encounters
function forestEncounter() {
    const monster = generateMonster();
    showEncounter({
        text: `You wander into the forest and suddenly a ${monster.name} appears!`,
        options: [
            { text: "Fight", action: () => combatEncounter(monster) },
            { text: "Try to flee", action: tryFlee }
        ]
    });
}

function cityEncounter() {
    showEncounter({
        text: "You arrive at the capital’s gates. Merchants, guards, and travelers bustle about. A local trader greets you.",
        options: [
            { text: "Visit the trader (Shop)", action: shopEncounter },
            { text: "Return to the forest", action: forestEncounter },
        ]
    });
}

function shopEncounter() {
    showEncounter({
        text: "The trader offers potions for 5 gold that restore 10 HP.",
        options: [
            { text: "Buy potion (5 gold)", action: buyPotion },
            { text: "Leave the shop", action: cityEncounter }
        ]
    });
}

function buyPotion() {
    if (player.gold >= 5) {
        player.gold -= 5;
        player.hp = Math.min(player.maxHp, player.hp + 10);
        showEncounter({
            text: "You drink the potion and feel better.",
            options: [
                { text: "Back to the city", action: cityEncounter }
            ]
        });
    } else {
        showEncounter({
            text: "You don't have enough gold.",
            options: [
                { text: "Back to the city", action: cityEncounter }
            ]
        });
    }
}

// Combat
function combatEncounter(monster) {
    // Player attacks first
    const playerDamage = rollDamage(player.className);
    monster.hp -= playerDamage;

    if (monster.hp <= 0) {
        // Monster defeated
        player.gold += monster.gold;
        showEncounter({
            text: `You dealt ${playerDamage} damage and defeated the ${monster.name}! You found ${monster.gold} gold.`,
            options: [
                { text: "Continue your journey", action: forestEncounter }
            ]
        });
        return;
    }

    // Monster attacks
    const monsterDamage = rollDamage("Monster");
    player.hp -= monsterDamage;

    if (player.hp <= 0) {
        showEncounter({
            text: `The ${monster.name} dealt ${monsterDamage} damage. You have fallen in battle.`,
            options: [
                { text: "Restart", action: () => location.reload() }
            ]
        });
        return;
    }

    // Continue the fight
    showEncounter({
        text: `You dealt ${playerDamage} damage. The ${monster.name} has ${monster.hp} HP left. It hit you back for ${monsterDamage}.`,
        options: [
            { text: "Attack again", action: () => combatEncounter(monster) },
            { text: "Try to flee", action: tryFlee }
        ]
    });
}

function tryFlee() {
    // 50% chance to flee
    if (Math.random() < 0.5) {
        showEncounter({
            text: "You successfully fled back to a safer path.",
            options: [
                { text: "Catch your breath and move on", action: forestEncounter }
            ]
        });
    } else {
        // Monster attacks on failed flee
        const monsterDamage = rollDamage("Monster");
        player.hp -= monsterDamage;

        if (player.hp <= 0) {
            showEncounter({
                text: "You tried to flee but were struck down. Your adventure ends here.",
                options: [
                    { text: "Restart", action: () => location.reload() }
                ]
            });
        } else {
            showEncounter({
                text: `You failed to flee and got hit for ${monsterDamage} damage. Still in danger!`,
                options: [
                    { text: "Attack", action: () => combatEncounter({name:"Angry Beast", hp:10, gold:5}) }, // Dummy monster return, real logic can be improved
                    { text: "Try fleeing again", action: tryFlee }
                ]
            });
        }
    }
}

// Utility
function generateMonster() {
    const monsters = [
        {name: "Goblin", hp: 10, gold: 5},
        {name: "Wild Boar", hp: 8, gold: 3},
        {name: "Giant Spider", hp: 12, gold: 7}
    ];
    const m = monsters[Math.floor(Math.random() * monsters.length)];
    return { ...m };
}

function rollDamage(entity) {
    switch(entity) {
        case "Warrior":
            return Math.floor(Math.random() * 6) + 3; // 3-8
        case "Mage":
            return Math.floor(Math.random() * 8) + 1; // 1-8
        case "Ranger":
            return Math.floor(Math.random() * 5) + 2; // 2-6
        case "Monster":
            return Math.floor(Math.random() * 4) + 1; // 1-4
        default:
            return 1;
    }
}
