
import fs from 'fs';

const content = fs.readFileSync('constants.ts', 'utf8');

// Simple regex to find keys in SPELLS_DB
const spellsDbMatch = content.match(/export const SPELLS_DB: Record<string,.*?> = {([\s\S]*?)\n};/);

if (spellsDbMatch) {
    const spellsContent = spellsDbMatch[1];
    const keys = [];
    const lines = spellsContent.split('\n');
    for (let line of lines) {
        const keyMatch = line.match(/^\s*"(.*?)"\s*:/) || line.match(/^\s*'(.*?)'\s*:/);
        if (keyMatch) {
            keys.push(keyMatch[1]);
        }
    }

    const duplicates = keys.filter((item, index) => keys.indexOf(item) !== index);
    if (duplicates.length > 0) {
        console.log('Duplicate keys found in SPELLS_DB:');
        console.log(duplicates);
    } else {
        console.log('No duplicate keys found in SPELLS_DB.');
    }
} else {
    console.log('SPELLS_DB not found in constants.ts');
}
