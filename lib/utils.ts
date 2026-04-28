
/**
 * Utility to optimize images by resizing and compressing them.
 * Useful for reducing the size of images stored in the database.
 */
export const optimizeImage = (
  base64: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (err) => reject(err);
  });
};

/**
 * Debounce function to limit the rate at which a function can fire.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retorna o círculo máximo de magia para uma classe e nível seguindo as regras do D&D 5e.
 */
export function getMaxSpellCircle(type: 'full' | 'half' | 'half-up' | 'pact' | 'third' | null | undefined, level: number): number {
  if (!type) return 0;
  switch (type) {
    case 'full': return Math.min(9, Math.ceil(level / 2));
    case 'half': return level < 2 ? 0 : Math.min(5, Math.ceil(level / 4));
    case 'half-up': return Math.min(5, Math.ceil(level / 4)); 
    case 'third': return level < 3 ? 0 : Math.min(4, Math.ceil(level / 6 + 0.1)); // 1st at 3, 2nd at 7, 3rd at 13, 4th at 19
    case 'pact': 
      if (level < 3) return 1;
      if (level < 5) return 2;
      if (level < 7) return 3;
      if (level < 9) return 4;
      if (level < 11) return 5;
      if (level < 13) return 6;
      if (level < 15) return 7;
      if (level < 17) return 8;
      return 9;
    default: return 0;
  }
}

/**
 * Retorna o limite de magias conhecidas e truques para uma classe e nível (D&D 5e Oficial).
 */
export function getSpellsLimit(className: string, level: number): { spells: number, cantrips: number } {
  const c = className.toLowerCase();
  
  if (c === 'bardo') {
    const cantrips = level < 4 ? 2 : level < 10 ? 3 : 4;
    const spellsTable = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]; // Including Secrets
    return { spells: spellsTable[level] || level + 3, cantrips };
  }
  if (c === 'feiticeiro') {
    const cantrips = level < 4 ? 4 : level < 10 ? 5 : 6;
    const spellsTable = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
    return { spells: spellsTable[level] || level + 1, cantrips };
  }
  if (c === 'bruxo') {
    const cantrips = level < 4 ? 2 : level < 10 ? 3 : 4;
    const spellsTable = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
    return { spells: spellsTable[level] || level + 1, cantrips };
  }
  if (c === 'mago') {
    const cantrips = level < 4 ? 3 : level < 10 ? 4 : 5;
    // Wizard: 6 at level 1, +2 per level in book.
    return { spells: 4 + (level * 2), cantrips };
  }
  if (c === 'guerreiro' || c === 'ladino') {
    // Only third casters (handled by UI but the utility should handle the possibility)
    const cantrips = level < 10 ? 2 : 3;
    const spellsTable = [0, 0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
    return { spells: spellsTable[level] || 0, cantrips };
  }
  if (c === 'clérigo' || c === 'druida') {
    const cantrips = level < 4 ? 3 : level < 10 ? 4 : 5;
    // Prepared: level + WIS mod. Simplified for the modal.
    return { spells: level + 4, cantrips };
  }
  if (c === 'patrulheiro') {
    if (level < 2) return { spells: 0, cantrips: 0 };
    const spellsTable = [0, 0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
    return { spells: spellsTable[level] || 0, cantrips: 0 };
  }
  if (c === 'paladino') {
    if (level < 2) return { spells: 0, cantrips: 0 };
    return { spells: level + 3, cantrips: 0 }; // Prepared: half level + CHA mod
  }
  if (c === 'artífice') {
    const cantrips = level < 10 ? 2 : level < 14 ? 3 : 4;
    return { spells: Math.floor(level / 2) + 4, cantrips };
  }
  
  // Third Casters (Knight/Trickster) - checked manually during level up if useful
  return { spells: 0, cantrips: 0 };
}
