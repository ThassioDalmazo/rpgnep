
import { CLASS_SPELLS, SPELLS_DB } from './constants';

const missingSpells = new Set<string>();
for (const className in CLASS_SPELLS) {
    const spells = CLASS_SPELLS[className];
    spells.forEach(s => {
        if (!SPELLS_DB[s]) missingSpells.add(s);
    });
}

console.log('Missing Spells:', Array.from(missingSpells));
