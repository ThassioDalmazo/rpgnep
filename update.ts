import * as fs from 'fs';

let content = fs.readFileSync('./constants.ts', 'utf8');

const attributesMap: Record<number, any> = {
  100: { str: 2, dex: 14, con: 8, int: 1, wis: 10, cha: 2 },
  101: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  102: { str: 8, dex: 8, con: 8, int: 10, wis: 10, cha: 10 },
  103: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 },
  104: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
  105: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 },
  106: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
  107: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
  108: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  109: { str: 10, dex: 14, con: 12, int: 10, wis: 8, cha: 8 },
  110: { str: 8, dex: 15, con: 10, int: 10, wis: 8, cha: 8 },
  111: { str: 8, dex: 16, con: 10, int: 10, wis: 8, cha: 8 },
  112: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
  113: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
  114: { str: 2, dex: 16, con: 11, int: 1, wis: 10, cha: 3 },
  115: { str: 11, dex: 12, con: 10, int: 10, wis: 13, cha: 14 },
  116: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
  117: { str: 14, dex: 12, con: 15, int: 6, wis: 8, cha: 5 },
  118: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
  119: { str: 14, dex: 12, con: 11, int: 6, wis: 10, cha: 7 },
  120: { str: 13, dex: 14, con: 12, int: 10, wis: 11, cha: 10 },
  121: { str: 13, dex: 14, con: 12, int: 3, wis: 12, cha: 6 },
  122: { str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 9 },
  123: { str: 14, dex: 10, con: 14, int: 10, wis: 10, cha: 10 },
  124: { str: 10, dex: 14, con: 10, int: 12, wis: 10, cha: 12 },
  125: { str: 12, dex: 13, con: 11, int: 2, wis: 10, cha: 3 },
  126: { str: 10, dex: 14, con: 10, int: 1, wis: 10, cha: 3 },
  127: { str: 5, dex: 14, con: 12, int: 1, wis: 7, cha: 3 },
  130: { str: 16, dex: 12, con: 14, int: 10, wis: 11, cha: 10 },
  131: { str: 14, dex: 12, con: 14, int: 10, wis: 13, cha: 12 },
  200: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
  201: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
  202: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 },
  203: { str: 12, dex: 13, con: 12, int: 7, wis: 10, cha: 13 },
  204: { str: 6, dex: 17, con: 13, int: 11, wis: 12, cha: 14 },
  205: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
  206: { str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8 },
  207: { str: 18, dex: 15, con: 16, int: 2, wis: 13, cha: 8 },
  208: { str: 15, dex: 16, con: 14, int: 14, wis: 11, cha: 14 },
  209: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 },
  210: { str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7 },
  211: { str: 15, dex: 6, con: 14, int: 2, wis: 6, cha: 1 },
  212: { str: 18, dex: 12, con: 16, int: 8, wis: 11, cha: 10 },
  213: { str: 11, dex: 14, con: 12, int: 10, wis: 14, cha: 14 },
  214: { str: 18, dex: 12, con: 16, int: 8, wis: 10, cha: 9 },
  215: { str: 11, dex: 16, con: 11, int: 12, wis: 14, cha: 16 },
  216: { str: 16, dex: 10, con: 14, int: 2, wis: 10, cha: 4 },
  220: { str: 14, dex: 15, con: 14, int: 9, wis: 12, cha: 15 },
  221: { str: 21, dex: 8, con: 18, int: 6, wis: 8, cha: 7 },
  222: { str: 16, dex: 6, con: 16, int: 2, wis: 6, cha: 1 },
  300: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 },
  301: { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 10 },
  302: { str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7 },
  303: { str: 17, dex: 16, con: 17, int: 7, wis: 12, cha: 8 },
  304: { str: 16, dex: 14, con: 14, int: 11, wis: 11, cha: 13 },
  305: { str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9 },
  306: { str: 15, dex: 13, con: 15, int: 1, wis: 9, cha: 3 },
  307: { str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17 },
  308: { str: 1, dex: 14, con: 10, int: 12, wis: 11, cha: 17 },
  309: { str: 21, dex: 8, con: 17, int: 6, wis: 10, cha: 8 },
  310: { str: 18, dex: 12, con: 18, int: 11, wis: 11, cha: 16 },
  311: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 12 },
  312: { str: 11, dex: 18, con: 14, int: 13, wis: 11, cha: 10 },
  313: { str: 10, dex: 14, con: 18, int: 3, wis: 8, cha: 5 },
  314: { str: 16, dex: 16, con: 16, int: 11, wis: 10, cha: 12 },
  315: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 },
  316: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 15 },
  317: { str: 20, dex: 8, con: 20, int: 5, wis: 10, cha: 5 },
  318: { str: 21, dex: 10, con: 18, int: 10, wis: 12, cha: 10 },
  319: { str: 23, dex: 8, con: 20, int: 6, wis: 8, cha: 7 },
  320: { str: 19, dex: 11, con: 19, int: 3, wis: 14, cha: 10 },
  321: { str: 9, dex: 14, con: 12, int: 18, wis: 12, cha: 11 },
  322: { str: 18, dex: 16, con: 16, int: 10, wis: 10, cha: 7 },
  323: { str: 16, dex: 18, con: 14, int: 6, wis: 10, cha: 5 },
  330: { str: 18, dex: 8, con: 17, int: 2, wis: 8, cha: 7 },
  331: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 12 },
  332: { str: 19, dex: 16, con: 19, int: 7, wis: 12, cha: 8 },
  333: { str: 19, dex: 12, con: 17, int: 5, wis: 13, cha: 8 },
  400: { str: 11, dex: 12, con: 12, int: 19, wis: 17, cha: 17 },
  401: { str: 10, dex: 14, con: 12, int: 20, wis: 15, cha: 16 },
  402: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
  403: { str: 24, dex: 9, con: 20, int: 3, wis: 11, cha: 1 },
  404: { str: 10, dex: 14, con: 18, int: 17, wis: 15, cha: 17 },
  405: { str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18 },
  406: { str: 29, dex: 14, con: 20, int: 16, wis: 18, cha: 18 },
  407: { str: 23, dex: 14, con: 21, int: 14, wis: 13, cha: 17 },
  408: { str: 28, dex: 7, con: 22, int: 1, wis: 8, cha: 4 },
  409: { str: 20, dex: 11, con: 16, int: 2, wis: 12, cha: 7 },
  410: { str: 16, dex: 16, con: 16, int: 8, wis: 10, cha: 8 },
  500: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 },
  501: { str: 14, dex: 10, con: 14, int: 6, wis: 10, cha: 5 },
  502: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 10 },
  503: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
  504: { str: 10, dex: 16, con: 12, int: 12, wis: 10, cha: 16 },
  505: { str: 10, dex: 14, con: 14, int: 12, wis: 10, cha: 16 },
  506: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 },
  507: { str: 10, dex: 10, con: 14, int: 12, wis: 16, cha: 10 },
  508: { str: 10, dex: 14, con: 12, int: 12, wis: 16, cha: 10 },
  509: { str: 16, dex: 14, con: 14, int: 14, wis: 12, cha: 10 },
  510: { str: 8, dex: 18, con: 12, int: 12, wis: 10, cha: 14 },
  511: { str: 8, dex: 14, con: 12, int: 16, wis: 12, cha: 10 },
  512: { str: 10, dex: 18, con: 14, int: 10, wis: 16, cha: 10 },
  513: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 },
  514: { str: 10, dex: 18, con: 14, int: 10, wis: 16, cha: 10 },
  515: { str: 10, dex: 14, con: 14, int: 10, wis: 10, cha: 18 },
  600: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 },
  601: { str: 26, dex: 15, con: 22, int: 20, wis: 16, cha: 22 },
  602: { str: 30, dex: 11, con: 30, int: 3, wis: 11, cha: 11 },
  603: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
  604: { str: 15, dex: 16, con: 11, int: 2, wis: 12, cha: 6 },
  605: { str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7 },
  606: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 15 },
  607: { str: 15, dex: 6, con: 14, int: 2, wis: 6, cha: 1 },
  608: { str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17 },
  609: { str: 16, dex: 10, con: 14, int: 2, wis: 10, cha: 4 },
  610: { str: 1, dex: 20, con: 10, int: 20, wis: 17, cha: 20 },
  611: { str: 5, dex: 15, con: 10, int: 2, wis: 12, cha: 4 },
};

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('{ id: ')) {
    const match = line.match(/id: (\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      if (attributesMap[id]) {
        // remove any existing attributes: { ... }
        line = line.replace(/, attributes: \{[^}]+\}/g, '');
        // remove trailing comma or newline
        line = line.replace(/ \},$/, ' }');
        line = line.replace(/ \}\r?$/, ' }');
        
        const attrs = attributesMap[id];
        const attrStr = `, attributes: { str: ${attrs.str}, dex: ${attrs.dex}, con: ${attrs.con}, int: ${attrs.int}, wis: ${attrs.wis}, cha: ${attrs.cha} }`;
        
        // insert before the last closing brace
        const lastBraceIndex = line.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            line = line.substring(0, lastBraceIndex) + attrStr + ' },';
        }
        lines[i] = line;
      }
    }
  }
}

// remove trailing comma from the last item
const lastItemIndex = lines.findIndex(l => l.includes('id: 611'));
if (lastItemIndex !== -1) {
    lines[lastItemIndex] = lines[lastItemIndex].replace(/,$/, '');
}

fs.writeFileSync('./constants.ts', lines.join('\n'), 'utf8');
