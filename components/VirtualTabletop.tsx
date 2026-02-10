
import React, { useEffect, useRef, useState } from 'react';
import { Token, Character, Monster, MapConfig } from '../types';
import { Pencil, Eraser, PaintBucket, Ruler, Undo2, Redo2, Trash2, Download, Swords, Plus, Users, Minus, Upload, Eye, EyeOff, Edit, Copy, Shield, X, Hand, Target, Circle, Triangle, Palette, Loader2, Save, Scaling, ArrowRightLeft, RotateCw, CheckCircle2, Flame, PencilRuler, LayoutGrid, Snowflake, CloudFog, Zap, Filter, Sun, CloudRain, Box, ChevronRight, ChevronLeft, Map as MapIcon, Move, Maximize, AlertTriangle, Square, RotateCcw, ChevronsUp, ChevronsDown } from 'lucide-react';

interface Props {
  mapGrid: string[][];
  setMapGrid: (grid: string[][]) => void;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  characters: Character[];
  monsters: Monster[];
  fogGrid: boolean[][];
  setFogGrid: (fog: boolean[][]) => void;
  mapConfig?: MapConfig;
  setMapConfig?: React.Dispatch<React.SetStateAction<MapConfig>>;
  activeTokenIds?: number[];
}

interface CustomAsset {
    id: string;
    url: string;
    name: string;
    type?: 'upload' | 'edited';
}

type WeatherType = 'none' | 'rain' | 'snow' | 'ember' | 'fog';

const convertDriveLink = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url; // Base64 check
    try {
        let id = '';
        const patterns = [/\/file\/d\/([^/]+)/, /id=([^&]+)/, /\/d\/([^/]+)/];
        for (const p of patterns) {
            const match = url.match(p);
            if (match && match[1]) { id = match[1]; break; }
        }
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=s3000`;
    } catch (e) { console.error("Erro ao converter link", e); }
    return url;
};

const parseTileData = (cellData: string) => {
    if (!cellData) return { url: '', r: 0, fx: false, fy: false };
    const parts = cellData.split('$');
    const url = parts[0];
    let r = 0, fx = false, fy = false;
    
    for (let i = 1; i < parts.length; i++) {
        if (parts[i].startsWith('r=')) r = parseInt(parts[i].substring(2)) || 0;
        if (parts[i].startsWith('fx=')) fx = parts[i].substring(3) === '1';
        if (parts[i].startsWith('fy=')) fy = parts[i].substring(3) === '1';
    }
    return { url, r, fx, fy };
};

// --- ASSET LIBRARIES ---

const TEXTURE_LINKS = {
    base: convertDriveLink('https://drive.google.com/file/d/1RvGSubwbY7aDnlWs4SCbL0NimIXt85KX/view?usp=drive_link'),
    wall: convertDriveLink('https://drive.google.com/file/d/1ctEqP1sEnMYM_Ksij2x5rPv0oC7MvjXW/view?usp=drive_link'),
    water: convertDriveLink('https://drive.google.com/file/d/1poluq_9UPff3VZnnv4mvWaZgHJIliHN2/view?usp=drive_link'),
    grass: convertDriveLink('https://drive.google.com/file/d/16s7bUlV6lGGOHyuka3mxzSWO96Aj7p6-/view?usp=drive_link'),
    wood: convertDriveLink('https://drive.google.com/file/d/1MUolSL8ntxAMPSnfuxS5qeb6Fmyd-8AW/view?usp=drive_link'),
    stone: convertDriveLink('https://drive.google.com/file/d/1zniemBGbdoKUUk71DHvyBqr_1odIffl6/view?usp=drive_link')
};

const LIST_FLOORS = [
    'https://drive.google.com/file/d/1yG9prBlEFYd7oIBXNZuDIwGM4wk4O0FU/view?usp=drive_link', 'https://drive.google.com/file/d/1HNz3dAJOeTdobi-b9xIt5yYj_tlnivrp/view?usp=drive_link', 'https://drive.google.com/file/d/1adfSWf_NUJG-k6plRsPeNloNcAa4B83i/view?usp=drive_link',
    'https://drive.google.com/file/d/1JCo2EkynAsld7ekD3f-v-nRpOutDrtVs/view?usp=drive_link', 'https://drive.google.com/file/d/10dL8ga4lOMILVOm6izO7c4qtytRL34k5/view?usp=drive_link', 'https://drive.google.com/file/d/145r_7v3CTP-vzOl1bPtZ1w7LBDqrbUdv/view?usp=drive_link',
    'https://drive.google.com/file/d/1-mIpVdTTyiwKg0DmQdpTMNnr31appvFx/view?usp=drive_link', 'https://drive.google.com/file/d/1Lda7MgJKwBSjNTQHpKZ5gT45JpjQSRGf/view?usp=drive_link', 'https://drive.google.com/file/d/1g7OEoPcvFpsDAUZWsvmA_wBGyNh5MkRD/view?usp=drive_link',
    'https://drive.google.com/file/d/1wdqT7aURB0ZBM0NpzfLnwcWn6tkormbR/view?usp=drive_link', 'https://drive.google.com/file/d/1uPZrAFQYnvryyEHSmMqwxe-KZd7OQFld/view?usp=drive_link', 'https://drive.google.com/file/d/1ehX92xYJ5Nqfc3c3uQDMd8KFRp2fJHzW/view?usp=drive_link',
    'https://drive.google.com/file/d/1a9g-bW1-0sw-dTgqP3lPRknZ7arqHd3d/view?usp=drive_link', 'https://drive.google.com/file/d/1dh5xUJS4g1o1_avyxFbDlWzFHxf69FGl/view?usp=drive_link', 'https://drive.google.com/file/d/1K4KFVnvpzZdPWkoxcGPVdwNiupJb9hxb/view?usp=drive_link',
    'https://drive.google.com/file/d/1GEdbfoVyiz5An3disV_OjNuZt4I7P0pp/view?usp=drive_link', 'https://drive.google.com/file/d/1v_Z6qu7lT-34NkWdscV2mcRhH54D8whX/view?usp=drive_link', 'https://drive.google.com/file/d/1qbtdzL1B1jCZJ6XyBW1dSmk0xFEVbKiC/view?usp=drive_link',
    'https://drive.google.com/file/d/1kyzNyJ1QSl7LFEv_zFGAMTAtP6-X6swt/view?usp=drive_link', 'https://drive.google.com/file/d/1cu8gmMz78gnuEriiK7diGOEpyyQwXLVw/view?usp=drive_link', 'https://drive.google.com/file/d/1Tt1T68es0iQCDs88D0aqdUaTYKw6tqND/view?usp=drive_link',
    'https://drive.google.com/file/d/1SKusYB09QYiZQ_p3xtqlB3uYT87bnXsZ/view?usp=drive_link', 'https://drive.google.com/file/d/1GgZdSqo5_gvl3OiZzbKbn0lfKI1K80Su/view?usp=drive_link', 'https://drive.google.com/file/d/140bQQqxJXA6TKTK9ZtY9Hr5nyJhj9tL_/view?usp=drive_link',
    'https://drive.google.com/file/d/1kSLRTNf3wXCurBxjtts2RQeFbOB_tc66/view?usp=drive_link', 'https://drive.google.com/file/d/1xVzcv5V15IeoLHycKgPVjhOLusaqNsW1/view?usp=drive_link', 'https://drive.google.com/file/d/16RTIw74t78nNhnLA6FLLRUdWk_YzGmaq/view?usp=drive_link',
    'https://drive.google.com/file/d/1RvGSubwbY7aDnlWs4SCbL0NimIXt85KX/view?usp=drive_link', 'https://drive.google.com/file/d/1ctEqP1sEnMYM_Ksij2x5rPv0oC7MvjXW/view?usp=drive_link', 'https://drive.google.com/file/d/1poluq_9UPff3VZnnv4mvWaZgHJIliHN2/view?usp=drive_link',
    'https://drive.google.com/file/d/16s7bUlV6lGGOHyuka3mxzSWO96Aj7p6-/view?usp=drive_link', 'https://drive.google.com/file/d/1zniemBGbdoKUUk71DHvyBqr_1odIffl6/view?usp=drive_link', 'https://drive.google.com/file/d/17BuRpKR5L55ap11IEeJWGWOHsbAOHr1x/view?usp=drive_link',
    'https://drive.google.com/file/d/1bP5vpuQ5Ifv4HDmC6AzXCj3urPh3b3IJ/view?usp=drive_link', 'https://drive.google.com/file/d/1G9ZhwZ6cfHNiN1HYcVR97whTMt3XXnPL/view?usp=drive_link', 'https://drive.google.com/file/d/1z4Bggrb8VKxB4RgnFzjqgEvkwWJbQLmz/view?usp=drive_link',
    'https://drive.google.com/file/d/1pcZTgCK223xzAEBKEr3bOLP5-Ev6P7bj/view?usp=drive_link', 'https://drive.google.com/file/d/1xuZX3xrV6MlYsjKnKimm_xg6NCk_spOJ/view?usp=drive_link', 'https://drive.google.com/file/d/1DlmOnVCKurqBdPjrDIkIl01Mgm_zdBYf/view?usp=drive_link',
    'https://drive.google.com/file/d/1domgLutcRcO1GIbyN2oyxjqk001F774z/view?usp=drive_link', 'https://drive.google.com/file/d/1wW1RNK8fWA1DBWSAub3T_6Nd7YkQv89y/view?usp=drive_link', 'https://drive.google.com/file/d/1fdUHnw1Ho3a8a4kA6YSYhr3gIxx6w-uC/view?usp=drive_link',
    'https://drive.google.com/file/d/1p5aNeoO_OuxxH-FE2HARVct77PTn6aSK/view?usp=drive_link', 'https://drive.google.com/file/d/1n-wxgpjytlU-2ofq0XP8w-9XOc2u3umt/view?usp=drive_link', 'https://drive.google.com/file/d/1J5hbiIbBrvCIIxc71DF_OMyM-Hep0Xmr/view?usp=drive_link',
    'https://drive.google.com/file/d/1MUolSL8ntxAMPSnfuxS5qeb6Fmyd-8AW/view?usp=drive_link', 'https://drive.google.com/file/d/1CdC0cLbCWvgDY_BIRe075mjvjJKznri5/view?usp=drive_link', 'https://drive.google.com/file/d/1udR23AMUwX1Dr1YNMYDHWkvyp9jsHgLP/view?usp=drive_link'
];

const LIST_WALLS = [
    'https://drive.google.com/open?id=1eQO_jF0GBK_FACz3MnqV14nJvfgCc8P0', 'https://drive.google.com/open?id=1S6-xVi37VPHPpfokAu6VRCvLgpt6xgcA', 'https://drive.google.com/open?id=1xJal9EoezMkI9ysp0W0aX-e49kP8KWap',
    'https://drive.google.com/open?id=1-Bde6F9trcacg37dDElhOK843cQTNjqS', 'https://drive.google.com/open?id=1aSdfsmlZ8lFQuVhf4Puv3GO6yBaqAtOL', 'https://drive.google.com/open?id=1pjiSTmd6ib03I2i4WhUs7zJbyXop1s3g',
    'https://drive.google.com/open?id=1ouPmYHSg670PY_arpHaa93yAl5tdmdSL', 'https://drive.google.com/open?id=1fEkjvDTgsCue0DP38EVnJNml1dcrvDt0', 'https://drive.google.com/open?id=1aBFC4V6tRB-eMuvrcNum1gvbe9Iyy3fb',
    'https://drive.google.com/open?id=1jOu63dqxYO3g-bZxPDIoRLT2yUYP7oLT', 'https://drive.google.com/open?id=1R8MMPRSAe-bA1sC2M-b4bvj1wORxo_dJ', 'https://drive.google.com/open?id=1KqSMZzneWE_-nkKXILQhDP1VBggvGein',
    'https://drive.google.com/file/d/1frLi8C6HN9QEL64BPvk3LaEyDV7QHpYJ/view?usp=drive_link', 'https://drive.google.com/file/d/1e44PDQWVlPMOtRx7mMeC_JwS66GeQHnu/view?usp=drive_link', 'https://drive.google.com/file/d/12U-pFEmE15qlAgbgJIMcNx1229SeNgox/view?usp=drive_link',
    'https://drive.google.com/file/d/1PyK8whMDX1jeG5YQQndf4FMr8wapag7-/view?usp=drive_link', 'https://drive.google.com/file/d/1aSBty1TYBn_LKa4wH_MN3F5g_1YMLLVd/view?usp=drive_link', 'https://drive.google.com/file/d/1vIn2JQ39zbbduUCBRdpj-9sK1iNrjsdn/view?usp=drive_link',
    'https://drive.google.com/file/d/1qy3bmOENt6HQfBPZb2ileIlIomqrN_wm/view?usp=drive_link', 'https://drive.google.com/file/d/1eQO_jF0GBK_FACz3MnqV14nJvfgCc8P0/view?usp=drive_link'
];

const LIST_BUILDINGS = [
    'https://drive.google.com/file/d/1N5A6F37tV7lr_3mCzypCU-NZCdPTKNrw/view?usp=drive_link', 'https://drive.google.com/file/d/1tJhKk6o6jI3VNHWBwTiNMKS73k8zU5Xx/view?usp=drive_link', 'https://drive.google.com/file/d/1fdD3dM4VFHpTON016FnfC5OqPSgNhK0A/view?usp=drive_link',
    'https://drive.google.com/file/d/1fSn7OZL-H_XsIqBXjkFGajiMDlPuJwhT/view?usp=drive_link', 'https://drive.google.com/file/d/1naxjar7A0cZgMveMTPNdOCZM_EOs2NUK/view?usp=drive_link', 'https://drive.google.com/file/d/1T6_gfF4kiIhd70Rrc2USu2Z0thMV4elg/view?usp=drive_link',
    'https://drive.google.com/file/d/1Mf0lUyrx58nRMkrmcxJ1n5n31nvA0p39/view?usp=drive_link', 'https://drive.google.com/file/d/1JdJ5SsmYLlHYxRtJniGyS7KUaEqzVSLv/view?usp=drive_link', 'https://drive.google.com/file/d/1XahZ_x1BcB6WWNbV81QwvCAP_NLtYMFK/view?usp=drive_link',
    'https://drive.google.com/file/d/1jp9ZcruzOFc8vMcL7Kdx3EBLOJwS-6kr/view?usp=drive_link', 'https://drive.google.com/file/d/1I8jm2yhskVvUdReX9c932YT0opMc0cV_/view?usp=drive_link', 'https://drive.google.com/file/d/1trm2YDmTeLbufKKMoTljXvym5wNDA1cN/view?usp=drive_link'
];

const LIST_NATURE = [
    'https://drive.google.com/file/d/1zb0s6nxSG5y7vVV7W_5PN01v-BXOycVv/view?usp=drive_link', 'https://drive.google.com/file/d/1Q5AWEw93pQa8mc5ohqF_IeoIF8D1NRBz/view?usp=drive_link', 'https://drive.google.com/file/d/1OVAzJyS087ZHv7e1Jb7rWVbawMfICK6p/view?usp=drive_link',
    'https://drive.google.com/file/d/1rC6oN8Lnt9tmj9Ika_uBe71GsuVOlp0j/view?usp=drive_link', 'https://drive.google.com/file/d/16ZzMaAUTWUHU0HQ63X5LnsBAOFJe9dzf/view?usp=drive_link', 'https://drive.google.com/file/d/1wX2KKoi_wyM3Mp9axYLUzIVmn0UGU1Sa/view?usp=drive_link',
    'https://drive.google.com/file/d/1bpibaBo9QJZaeIpA7IEU4tGdgq6qx1ez/view?usp=drive_link', 'https://drive.google.com/file/d/1MpokFiXfCFy4Mus_1ZHc1vBqwGJ9kuWo/view?usp=drive_link', 'https://drive.google.com/file/d/1iSpnc-mfRpa-RI_Osvtba5tfAiyw_Kxi/view?usp=drive_link',
    'https://drive.google.com/file/d/1VBwlTZPydLRxKHPwnQOsYLOZGOhGFIcI/view?usp=drive_link', 'https://drive.google.com/file/d/1KTirMyOC7N6MZrCkmXimqE88CLuN9Yu5/view?usp=drive_link', 'https://drive.google.com/file/d/1okGbMibtorTKozUQ_eWwRmtC7hen90ND/view?usp=drive_link',
    'https://drive.google.com/file/d/1XylzNe0A0tjPxyO1SjI1Of5dmmJYG-Jd/view?usp=drive_link', 'https://drive.google.com/file/d/1vJ_7vpog3TWOeva9bZK_XJBgPqbVbh1I/view?usp=drive_link', 'https://drive.google.com/file/d/113hL7pB4SKK1QPs6_N9SE7Cf2wXeHIPF/view?usp=drive_link',
    'https://drive.google.com/file/d/1_SkIMjbmhMXFYmlbJp6uNDa0B2RcGMu0/view?usp=drive_link', 'https://drive.google.com/file/d/1m7-l9rK4ID3TjeToi2pnn9MTehT11zJD/view?usp=drive_link', 'https://drive.google.com/file/d/1vO2Yn9ZHvKvchVH6Htx9dWde71zOY-5G/view?usp=drive_link'
];

const LIST_MAPS = [
    'https://drive.google.com/file/d/1BUaI_x0bWCgsmwoiYZDnXUWUn3XS6Rf0/view?usp=drive_link',
    'https://drive.google.com/file/d/1T2KkK8Q-n4vLSpTiaFrXNIx8r0TBfY05/view?usp=drive_link',
    'https://drive.google.com/file/d/1wgPbVkWglt7R00F_pLzrU4Xc3LIWP7m3/view?usp=drive_link',
    'https://drive.google.com/file/d/1zMZKNDaNFw7DNrsAKiGrh4SAu4H2wszl/view?usp=drive_link',
    'https://drive.google.com/file/d/1wu3acfuQh4Cn9mszHWjBEaFyEE-uKvIk/view?usp=drive_link',
    'https://drive.google.com/file/d/1KihAokJygTVlAgoBly7c18tX9HHPpl9-/view?usp=drive_link',
    'https://drive.google.com/file/d/1T3o1Y_wq5nIb0FfttEal9HJhJG1chKGs/view?usp=drive_link'
];

const PALETTES: Record<string, {c: string, n: string}[]> = {
    "Básicos": [
        {c: TEXTURE_LINKS.base, n: 'Base'}, {c: TEXTURE_LINKS.wall, n: 'Parede'},
        {c: TEXTURE_LINKS.water, n: 'Água'}, {c: TEXTURE_LINKS.grass, n: 'Grama'},
        {c: TEXTURE_LINKS.wood, n: 'Madeira'}, {c: TEXTURE_LINKS.stone, n: 'Pedra'}
    ],
    "Pisos e Chão": LIST_FLOORS.map((url, i) => ({ c: convertDriveLink(url), n: `Piso ${i+1}` })),
    "Paredes e Muros": LIST_WALLS.map((url, i) => ({ c: convertDriveLink(url), n: `Parede ${i+1}` })),
    "Estruturas": LIST_BUILDINGS.map((url, i) => ({ c: convertDriveLink(url), n: `Construção ${i+1}` })),
    "Natureza": LIST_NATURE.map((url, i) => ({ c: convertDriveLink(url), n: `Flora ${i+1}` })),
    "Mapas Prontos": LIST_MAPS.map((url, i) => ({ c: convertDriveLink(url), n: `Mapa ${i+1}` })),
};

const MARKER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#000000'];

export const VirtualTabletop: React.FC<Props> = ({ mapGrid, setMapGrid, tokens, setTokens, characters, monsters, fogGrid, setFogGrid, mapConfig: propMapConfig, setMapConfig: propSetMapConfig, activeTokenIds }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const particlesRef = useRef<any[]>([]);
  
  const gridW = mapGrid[0]?.length || 50;
  const gridH = mapGrid.length || 50;

  // Initialize tileSize from prop if available, else default to 32
  const [tileSize, setTileSize] = useState(propMapConfig?.tileSize || 32); 
  const [gridScale, setGridScale] = useState(propMapConfig?.scale || 1.5); 
  const [gridUnit, setGridUnit] = useState(propMapConfig?.unit || 'm'); 
  const [bgProps, setBgProps] = useState({ x: propMapConfig?.bgX || 0, y: propMapConfig?.bgY || 0, scale: propMapConfig?.bgScale || 1.0 });
  const [history, setHistory] = useState<string[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'tools' | 'assets' | 'map' | 'tokens' | 'weather'>('tools');
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill' | 'ruler' | 'move' | 'rect' | 'line' | 'fog-hide' | 'fog-reveal' | 'hand' | 'measure-circle' | 'measure-cone' | 'measure-cube'>('pencil');
  const [selectedTile, setSelectedTile] = useState(TEXTURE_LINKS.base);
  const [assetTab, setAssetTab] = useState<'standard' | 'upload' | 'edited'>('standard');
  const [assetDims, setAssetDims] = useState({ w: 1, h: 1 });
  const [assetTransform, setAssetTransform] = useState({ r: 0, fx: false, fy: false });
  const [placeMode, setPlaceMode] = useState<'tile' | 'object'>('tile'); 
  const [tokenBench, setTokenBench] = useState<Token[]>([]);
  const [brushSize, setBrushSize] = useState(1);
  
  // Palette State
  const [activePalette, setActivePalette] = useState('Básicos');

  // Editor State
  const [editingTexture, setEditingTexture] = useState<{id: string, url: string, name: string} | null>(null);
  const [editorImage, setEditorImage] = useState<HTMLImageElement | null>(null); 
  const [textureParams, setTextureParams] = useState({
      hue: 0, saturation: 100, brightness: 100, contrast: 100, opacity: 100, blur: 0, sepia: 0, grayscale: 0, invert: 0, widthTiles: 1, heightTiles: 1, pixelated: true
  });
  const [isTaintedSource, setIsTaintedSource] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [editorMouse, setEditorMouse] = useState<{start: {x:number, y:number}|null, current: {x:number, y:number}|null}>({start: null, current: null});
  const [editorTab, setEditorTab] = useState<'color' | 'crop'>('color');
  const [cropAspect, setCropAspect] = useState<number | null>(null);
  
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [contextMenu, setContextMenu] = useState<{x:number, y:number, tokenId?: number, assetUrl?: string, benchId?: number} | null>(null);
  const [activeLayer, setActiveLayer] = useState<0 | 1 | 2>(0);
  const [showFog, setShowFog] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [gridStyle, setGridStyle] = useState<'line' | 'dot'>(propMapConfig?.gridStyle || 'line');
  const [gridOpacity, setGridOpacity] = useState(propMapConfig?.gridOpacity || 0.15); 
  const [gridColor, setGridColor] = useState(propMapConfig?.gridColor || '#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(propMapConfig?.bgUrl || null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isGameMode, setIsGameMode] = useState(false);
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>([]);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const failedImages = useRef<Set<string>>(new Set());
  const taintedImages = useRef<Set<string>>(new Set()); 
  const [tick, setTick] = useState(0); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{x:number, y:number} | null>(null); 
  const [mousePos, setMousePos] = useState<{x:number, y:number} | null>(null);
  const [ping, setPing] = useState<{x: number, y: number, t: number} | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherType>(propMapConfig?.weather || 'none');

  // Sync Logic
  const hasSyncedInitial = useRef(false);

  useEffect(() => {
      if (propMapConfig) {
          if (!hasSyncedInitial.current || propMapConfig.weather !== weather) setWeather(propMapConfig.weather || 'none');
          if (!hasSyncedInitial.current || propMapConfig.scale !== gridScale) setGridScale(propMapConfig.scale);
          if (!hasSyncedInitial.current || propMapConfig.unit !== gridUnit) setGridUnit(propMapConfig.unit);
          if (!hasSyncedInitial.current || propMapConfig.gridColor !== gridColor) setGridColor(propMapConfig.gridColor);
          if (!hasSyncedInitial.current || propMapConfig.gridOpacity !== gridOpacity) setGridOpacity(propMapConfig.gridOpacity);
          if (!hasSyncedInitial.current || propMapConfig.gridStyle !== gridStyle) setGridStyle(propMapConfig.gridStyle);
          if (!hasSyncedInitial.current || propMapConfig.tileSize !== tileSize) setTileSize(propMapConfig.tileSize || 32);
          if (!hasSyncedInitial.current || propMapConfig.bgUrl !== backgroundImage) setBackgroundImage(propMapConfig.bgUrl);
          if (!hasSyncedInitial.current || propMapConfig.bgX !== bgProps.x || propMapConfig.bgY !== bgProps.y || propMapConfig.bgScale !== bgProps.scale) {
              setBgProps({ x: propMapConfig.bgX, y: propMapConfig.bgY, scale: propMapConfig.bgScale });
          }
          hasSyncedInitial.current = true;
      }
  }, [propMapConfig]);

  // Push changes to App (debounce could be added for performance)
  useEffect(() => {
      if (propSetMapConfig && hasSyncedInitial.current) {
          const timeout = setTimeout(() => {
              propSetMapConfig(prev => ({
                  ...prev,
                  scale: gridScale,
                  unit: gridUnit,
                  gridColor,
                  gridOpacity,
                  gridStyle,
                  tileSize, // Include tileSize in sync
                  bgUrl: backgroundImage,
                  bgX: bgProps.x,
                  bgY: bgProps.y,
                  bgScale: bgProps.scale,
                  weather
              }));
          }, 500); // 500ms debounce
          return () => clearTimeout(timeout);
      }
  }, [gridScale, gridUnit, gridColor, gridOpacity, gridStyle, backgroundImage, bgProps, weather, tileSize]);

  // Animation Loop
  useEffect(() => {
      let animId: number;
      const animate = () => {
          setTick(t => t + 1);
          if (ping && Date.now() - ping.t > 2000) setPing(null);
          animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animId);
  }, [ping]);

  const resizeMap = (w: number, h: number) => {
      const newW = Math.max(10, w);
      const newH = Math.max(10, h);
      const newGrid = Array(newH).fill(null).map((_, y) => Array(newW).fill(null).map((_, x) => (y < gridH && x < gridW) ? mapGrid[y][x] : '⬜||'));
      const newFog = Array(newH).fill(null).map((_, y) => Array(newW).fill(null).map((_, x) => (y < gridH && x < gridW) ? fogGrid[y][x] : true));
      setMapGrid(newGrid);
      setFogGrid(newFog);
  };

  const clearLayer = (layerIndex: number) => {
        if(!window.confirm(`Tem certeza que deseja limpar toda a Camada?`)) return;
        const newGrid = mapGrid.map(row => row.map(cell => {
            const parts = cell.split('|');
            while(parts.length <= layerIndex) parts.push('');
            if (layerIndex === 0) parts[0] = '⬜';
            else parts[layerIndex] = '';
            return parts.join('|');
        }));
        setMapGrid(newGrid);
        saveToHistory(newGrid);
  };

  useEffect(() => {
      const savedAssets = localStorage.getItem('nexus_custom_assets');
      if (savedAssets) {
          try { 
              const parsed = JSON.parse(savedAssets);
              if (Array.isArray(parsed)) setCustomAssets(parsed);
          } catch (e) { console.error("Erro ao carregar assets", e); }
      }
      Object.values(TEXTURE_LINKS).forEach(url => preloadImage(url));
      // Preload current palette
      if (PALETTES[activePalette]) {
          PALETTES[activePalette].forEach(p => { if (p.c.startsWith('http')) preloadImage(p.c); });
      }
  }, [activePalette]);

  const mergeCell = (currentData: string, newUrl: string, layer: number) => {
      const parts = (currentData || '').split('|');
      while (parts.length <= layer) parts.push('');
      if (!newUrl) {
          parts[layer] = '';
      } else {
          let transformStr = '';
          if (assetTransform.r !== 0) transformStr += `$r=${assetTransform.r}`;
          if (assetTransform.fx) transformStr += `$fx=1`;
          if (assetTransform.fy) transformStr += `$fy=1`;
          parts[layer] = `${newUrl}${transformStr}`;
      }
      return parts.join('|');
  };

  const drawTile = (x: number, y: number) => {
      if (x < 0 || x >= gridW || y < 0 || y >= gridH) return;
      const newGrid = [...mapGrid];
      const newUrl = tool === 'eraser' ? '' : selectedTile;
      
      let changed = false;
      for (let i = 0; i < brushSize; i++) {
          for (let j = 0; j < brushSize; j++) {
              const tx = x + i;
              const ty = y + j;
              if (tx < gridW && ty < gridH) {
                  const currentCell = newGrid[ty][tx];
                  const newCell = mergeCell(currentCell, newUrl, activeLayer);
                  if (newCell !== currentCell) {
                      if (!changed) { newGrid[ty] = [...newGrid[ty]]; changed = true; } 
                      newGrid[ty][tx] = newCell;
                  }
              }
          }
      }
      
      if (changed) setMapGrid(newGrid);
  };

  const floodFill = (startX: number, startY: number, targetVal: string, replacementUrl: string, layer: number) => {
      let replacementStr = '';
      if (replacementUrl) {
          let transformStr = '';
          if (assetTransform.r !== 0) transformStr += `$r=${assetTransform.r}`;
          if (assetTransform.fx) transformStr += `$fx=1`;
          if (assetTransform.fy) transformStr += `$fy=1`;
          replacementStr = `${replacementUrl}${transformStr}`;
      }
      if (targetVal === replacementStr) return;
      const newGrid = JSON.parse(JSON.stringify(mapGrid));
      const stack = [{x: startX, y: startY}];
      while (stack.length > 0) {
          const {x, y} = stack.pop()!;
          if (x < 0 || x >= gridW || y < 0 || y >= gridH) continue;
          const parts = (newGrid[y][x] || '').split('|');
          while (parts.length <= layer) parts.push('');
          if (parts[layer] === targetVal) {
              parts[layer] = replacementStr;
              newGrid[y][x] = parts.join('|');
              stack.push({x: x+1, y: y});
              stack.push({x: x-1, y: y});
              stack.push({x: x, y: y+1});
              stack.push({x: x, y: y-1});
          }
      }
      setMapGrid(newGrid);
      saveToHistory(newGrid);
  };

  const openTextureEditor = (asset: { id?: string, url: string, name?: string } | string) => {
      let targetAsset;
      if (typeof asset === 'string') {
          targetAsset = { id: 'temp', url: asset, name: 'Texture' };
      } else {
          targetAsset = asset;
      }
      setEditingTexture({ id: targetAsset.id || 'temp', url: targetAsset.url, name: targetAsset.name || 'Texture' });
      // Reset params
      setTextureParams({ hue: 0, saturation: 100, brightness: 100, contrast: 100, opacity: 100, blur: 0, sepia: 0, grayscale: 0, invert: 0, widthTiles: 1, heightTiles: 1, pixelated: true });
      setCropRect(null);
      setIsTaintedSource(false);
      setSaveSuccess(false);
      setEditorImage(null); 
  };

  useEffect(() => {
      if (editingTexture) {
          let active = true;
          let objectUrl: string | null = null;

          const load = async () => {
              try {
                  const resp = await fetch(editingTexture.url, { mode: 'cors' });
                  if (resp.ok) {
                      const blob = await resp.blob();
                      if (!active) return;
                      objectUrl = URL.createObjectURL(blob);
                      const img = new Image();
                      img.src = objectUrl;
                      img.onload = () => { if (active) { setEditorImage(img); setIsTaintedSource(false); } };
                      return; 
                  }
              } catch (e) { /* ignore, fallback */ }

              const img = new Image();
              img.crossOrigin = "Anonymous";
              const sep = editingTexture.url.includes('?') ? '&' : '?';
              img.src = `${editingTexture.url}${sep}t=${Date.now()}`;
              
              img.onload = () => { if (active) { setEditorImage(img); setIsTaintedSource(false); } };
              img.onerror = () => {
                  console.warn("CORS failed, loading tainted.");
                  const taintedImg = new Image();
                  taintedImg.src = editingTexture.url;
                  taintedImg.onload = () => { if (active) { setEditorImage(taintedImg); setIsTaintedSource(true); } };
              };
          };

          load();
          return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
      }
  }, [editingTexture]);

  useEffect(() => {
      const canvas = editCanvasRef.current;
      if (!canvas || !editorImage) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawW = editorImage.naturalWidth;
      const drawH = editorImage.naturalHeight;

      if (canvas.width !== drawW || canvas.height !== drawH) {
          canvas.width = drawW;
          canvas.height = drawH;
      }

      ctx.clearRect(0, 0, drawW, drawH);
      ctx.filter = `hue-rotate(${textureParams.hue}deg) saturate(${textureParams.saturation}%) brightness(${textureParams.brightness}%) contrast(${textureParams.contrast}%) blur(${textureParams.blur}px) sepia(${textureParams.sepia}%) grayscale(${textureParams.grayscale}%) invert(${textureParams.invert}%)`;
      ctx.globalAlpha = textureParams.opacity / 100;
      ctx.imageSmoothingEnabled = !textureParams.pixelated;
      
      try { ctx.drawImage(editorImage, 0, 0, drawW, drawH); } catch (e) { console.error(e); }
      
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;

      if (editorTab === 'crop' && cropRect && cropRect.w > 0 && cropRect.h > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(0, 0, drawW, cropRect.y);
          ctx.fillRect(0, cropRect.y + cropRect.h, drawW, drawH - (cropRect.y + cropRect.h));
          ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);
          ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, drawW - (cropRect.x + cropRect.w), cropRect.h);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = Math.max(2, drawW / 200);
          ctx.setLineDash([Math.max(5, drawW/100), Math.max(5, drawW/100)]);
          ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      }
  }, [editorImage, textureParams, cropRect, editorTab, tick]);

  const saveEditedTexture = async (overwrite: boolean) => {
      if (!editCanvasRef.current || !editingTexture || isTaintedSource) return;
      setIsSaving(true);
      try {
          let finalDataUrl = '';
          if (cropRect && cropRect.w > 0 && cropRect.h > 0) {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = cropRect.w;
              tempCanvas.height = cropRect.h;
              const ctx = tempCanvas.getContext('2d');
              if (ctx) {
                  ctx.drawImage(editCanvasRef.current, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h);
                  finalDataUrl = tempCanvas.toDataURL('image/png');
              }
          } else {
              finalDataUrl = editCanvasRef.current.toDataURL('image/png');
          }
          if (finalDataUrl) {
              addCustomAsset(finalDataUrl, `${editingTexture.name} (Edit)`, 'edited');
              setSaveSuccess(true);
              setTimeout(() => { setSaveSuccess(false); setEditingTexture(null); }, 1500);
          }
      } catch (e) { 
          console.error("Failed to save texture", e); 
          alert("Não foi possível salvar a imagem. Ela está protegida contra edição (CORS) e o método de recuperação falhou."); 
      }
      setIsSaving(false);
  };

  const getEditorMousePos = (e: React.MouseEvent) => {
      if (!editCanvasRef.current) return { x: 0, y: 0 };
      const canvas = editCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)), y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)) };
  };

  const handleEditorMouseDown = (e: React.MouseEvent) => {
      if (editorTab !== 'crop') return;
      const {x, y} = getEditorMousePos(e);
      setIsCropping(true);
      setEditorMouse({ start: {x, y}, current: {x, y} });
      setCropRect({ x, y, w: 0, h: 0 });
  };

  const handleEditorMouseMove = (e: React.MouseEvent) => {
      if (!isCropping || !editorMouse.start || !editCanvasRef.current) return;
      const {x, y} = getEditorMousePos(e);
      let w = x - editorMouse.start.x;
      let h = y - editorMouse.start.y;
      if (cropAspect) {
          if (Math.abs(w / h) > cropAspect) {
              w = h * cropAspect * (w < 0 ? -1 : 1) * (h < 0 ? 1 : -1); 
              const signY = h < 0 ? -1 : 1;
              h = Math.abs(w) / cropAspect * signY;
          } else {
              w = Math.abs(h) * cropAspect * (w < 0 ? -1 : 1);
          }
      }
      setCropRect({ x: w < 0 ? editorMouse.start.x + w : editorMouse.start.x, y: h < 0 ? editorMouse.start.y + h : editorMouse.start.y, w: Math.abs(w), h: Math.abs(h) });
  };

  const handleEditorMouseUp = () => { setIsCropping(false); };

  const preloadImage = (url: string, attempt = 0) => {
      const cleanUrl = url.split('$')[0];
      if (!cleanUrl || cleanUrl === 'VOID' || cleanUrl === '⬜') return;
      if (imageCache.current[cleanUrl]?.complete && imageCache.current[cleanUrl]?.naturalWidth > 0) return;
      if (failedImages.current.has(cleanUrl) && attempt > 1) return;
      
      const img = new Image();
      if (attempt === 0) img.crossOrigin = "Anonymous";
      else img.removeAttribute('crossOrigin');
      
      img.src = cleanUrl;
      img.onload = () => {
          failedImages.current.delete(cleanUrl);
          imageCache.current[cleanUrl] = img;
          if (attempt === 1) taintedImages.current.add(cleanUrl);
      };
      img.onerror = () => {
          if (attempt === 0) preloadImage(cleanUrl, 1);
          else { failedImages.current.add(cleanUrl); }
      };
      if (attempt === 0) imageCache.current[cleanUrl] = img;
  };

  useEffect(() => {
      mapGrid.forEach(row => {
          row.forEach(cell => {
              if (cell) {
                  const parts = cell.split('|');
                  parts.forEach(p => {
                      const { url } = parseTileData(p);
                      if (url && (url.startsWith('http') || url.startsWith('data:'))) preloadImage(url);
                  });
              }
          });
      });
      tokens.forEach((t: Token) => { if (t.image) preloadImage(t.image); });
      tokenBench.forEach((t: Token) => { if (t.image) preloadImage(t.image); });
      if (backgroundImage) preloadImage(backgroundImage);
  }, [mapGrid, tokens, backgroundImage, tokenBench]);

  const getGridPos = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / (tileSize * zoom));
    const y = Math.floor((e.clientY - rect.top - pan.y) / (tileSize * zoom));
    return { x: Math.min(Math.max(0, x), gridW - 1), y: Math.min(Math.max(0, y), gridH - 1) };
  };

  const getExactGridPos = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / (tileSize * zoom);
    const y = (e.clientY - rect.top - pan.y) / (tileSize * zoom);
    return { x, y };
  };

  const saveToHistory = (newGrid: string[][]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newGrid)));
      if (newHistory.length > 20) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setMapGrid(newGrid);
  };

  const undo = () => { if (historyIndex > 0) { const i = historyIndex - 1; setHistoryIndex(i); setMapGrid(history[i]); } };
  const redo = () => { if (historyIndex < history.length - 1) { const i = historyIndex + 1; setHistoryIndex(i); setMapGrid(history[i]); } };
  
  const clearMap = () => { 
      if (window.confirm("Limpar todo o mapa para Branco?")) { 
          const g = Array(gridH).fill(null).map(()=>Array(gridW).fill('⬜||')); 
          saveToHistory(g); 
      } 
  };

  const clearToBackground = () => {
    if (window.confirm("Limpar todos os tiles desenhados (mantendo fundo)?")) {
        const g = Array(gridH).fill(null).map(() => Array(gridW).fill('⬜||'));
        setMapGrid(g);
        saveToHistory(g);
    }
  };

  const setBgFromPreset = (url: string) => {
      const directLink = convertDriveLink(url);
      setBackgroundImage(directLink);
      
      const load = (attemptCors: boolean) => {
          const img = new Image();
          if (attemptCors) img.crossOrigin = "Anonymous";
          img.src = directLink;
          
          img.onload = () => {
              if (img.naturalWidth > 0) {
                  const gridPixelW = gridW * tileSize;
                  const scale = gridPixelW / img.naturalWidth;
                  setBgProps({ x: 0, y: 0, scale: Number.isFinite(scale) ? scale : 1 });
                  imageCache.current[directLink] = img;
                  if (!attemptCors) taintedImages.current.add(directLink);
              }
          };
          
          img.onerror = () => {
              if (attemptCors) load(false); 
              else console.error("Failed to load background preset");
          };
      }
      
      load(true);
  };

  const fitBackgroundToGrid = () => {
    if (backgroundImage && imageCache.current[backgroundImage]) {
        const img = imageCache.current[backgroundImage];
        if (img.naturalWidth > 0) {
            const gridPixelW = gridW * tileSize;
            const scale = gridPixelW / img.naturalWidth;
            setBgProps(prev => ({ ...prev, scale: Number.isFinite(scale) ? scale : 1, x: 0, y: 0 }));
        }
    }
  };

  const exportMap = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridW * tileSize;
    tempCanvas.height = gridH * tileSize;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
        renderScene(ctx, tempCanvas.width, tempCanvas.height, true);
        try {
            const dataUrl = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `mapa-rpgnep-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            alert("Não foi possível exportar o mapa devido a restrições de segurança (imagens externas protegidas/CORS).");
            console.error(e);
        }
    }
  };

  const fillFog = (visible: boolean) => setFogGrid(Array(gridH).fill(null).map(() => Array(gridW).fill(!visible)));

  const addCustomAsset = (url: string, name: string = 'Custom', type: 'upload' | 'edited' = 'upload') => {
      if (!url) return;
      const directLink = url.startsWith('data:') ? url : convertDriveLink(url);
      const newAsset: CustomAsset = { id: Date.now().toString(), url: directLink, name: `${name}`, type: type };
      const updated = [...customAssets, newAsset];
      setCustomAssets(updated);
      localStorage.setItem('nexus_custom_assets', JSON.stringify(updated));
      setSelectedTile(directLink);
      preloadImage(directLink);
      setTool('pencil');
      if (type === 'edited') setAssetTab('edited'); else setAssetTab('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => { if (ev.target?.result) addCustomAsset(ev.target.result as string, file.name.split('.')[0], 'upload'); };
          reader.readAsDataURL(file);
      }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => { 
              if (ev.target?.result) {
                  const dataUrl = ev.target.result as string;
                  setBackgroundImage(dataUrl);
                  const img = new Image();
                  img.src = dataUrl;
                  img.onload = () => {
                      const gridPixelW = gridW * tileSize;
                      const scale = gridPixelW / img.naturalWidth;
                      setBgProps({ x: 0, y: 0, scale: Number.isFinite(scale) ? scale : 1 });
                      imageCache.current[dataUrl] = img;
                  }
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const toggleFogArea = (start: {x:number, y:number}, end: {x:number, y:number}, val: boolean) => {
    const x1 = Math.min(start.x, end.x);
    const y1 = Math.min(start.y, end.y);
    const x2 = Math.max(start.x, end.x);
    const y2 = Math.max(start.y, end.y);
    const newFog = JSON.parse(JSON.stringify(fogGrid));
    for(let y=y1; y<=y2; y++) for(let x=x1; x<=x2; x++) newFog[y][x] = val;
    setFogGrid(newFog);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (contextMenu) setContextMenu(null);
      if (tool === 'hand' || e.button === 1 || e.button === 2) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          return;
      }
      if (e.button !== 0) return;
      if(e.altKey) { setPing({ ...getGridPos(e), t: Date.now() }); return; }
      
      const p = getGridPos(e);
      if(tool==='move') { 
          const t = [...tokens].reverse().find(tk => {
              const w = tk.width || tk.size || 1;
              const h = tk.height || tk.size || 1;
              return p.x >= tk.x && p.x < tk.x + w && p.y >= tk.y && p.y < tk.y + h;
          });
          if(t) { setSelectedTokenId(t.id); setIsDraggingToken(true); } else { setSelectedTokenId(null); }
          return;
      }
      if (tool === 'pencil' && placeMode === 'object' && selectedTile) {
          const newToken: Token = {
              id: Date.now(),
              x: p.x, y: p.y, icon: '', image: selectedTile, hp: 10, max: 10, color: 'transparent',
              size: Math.max(assetDims.w, assetDims.h), width: assetDims.w, height: assetDims.h,
              name: 'Objeto', isProp: true, rotation: assetTransform.r, flipX: assetTransform.fx, flipY: assetTransform.fy
          };
          setTokens(prev => [...prev, newToken]);
          return; 
      }
      setIsDrawing(true); setStartPos(p);
      if(tool==='pencil'||tool==='eraser') drawTile(p.x, p.y);
      else if(tool==='fill') { 
          const parts = mapGrid[p.y][p.x].split('|'); 
          floodFill(p.x, p.y, parts[activeLayer]||'', selectedTile, activeLayer); 
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const p = getExactGridPos(e); setMousePos(p);
      if(isPanning) { 
          const dx = e.clientX - panStart.x;
          const dy = e.clientY - panStart.y;
          setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
          setPanStart({ x: e.clientX, y: e.clientY });
          return; 
      }
      if (isDraggingToken && selectedTokenId !== null && tool === 'move') {
          setTokens(prev => prev.map((t: Token) => {
              if (t.id === selectedTokenId) return { ...t, x: Math.floor(p.x), y: Math.floor(p.y) };
              return t;
          }));
          return;
      }
      if(!isDrawing) return;
      if(tool === 'pencil' && placeMode === 'object') return;
      if(tool==='pencil'||tool==='eraser') drawTile(Math.floor(p.x), Math.floor(p.y));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if(isPanning) { setIsPanning(false); return; }
      if(isDraggingToken) { setIsDraggingToken(false); return; }
      if(!isDrawing) return;
      setIsDrawing(false);
      const end = getGridPos(e);
      if(startPos) {
          if(tool==='rect'||tool==='line') { 
              const nG = JSON.parse(JSON.stringify(mapGrid));
              const x1=Math.min(startPos.x, end.x), x2=Math.max(startPos.x, end.x);
              const y1=Math.min(startPos.y, end.y), y2=Math.max(startPos.y, end.y);
              if (tool==='rect') {
                  for(let y=y1; y<=y2; y++) for(let x=x1; x<=x2; x++) nG[y][x] = mergeCell(nG[y][x], selectedTile, activeLayer);
              } else {
                  let x0=startPos.x, y0=startPos.y, dx=Math.abs(end.x-x0), dy=Math.abs(end.y-y0), sx=x0<end.x?1:-1, sy=y0<end.y?1:-1, err=dx-dy;
                  while(true){ nG[y0][x0]=mergeCell(nG[y0][x0], selectedTile, activeLayer); if(x0===end.x && y0===end.y)break; const e2=2*err; if(e2>-dy){err-=dy;x0+=sx;} if(e2<dx){err+=dx;y0+=sy;} }
              }
              setMapGrid(nG); saveToHistory(nG);
          }
          if(tool==='fog-hide') toggleFogArea(startPos, end, true);
          if(tool==='fog-reveal') toggleFogArea(startPos, end, false);
      }
      setStartPos(null);
  };

  // ... (Other handlers like handleContextMenu, handleBenchDragStart etc remain) ...
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      const p = getGridPos(e);
      const t = [...tokens].reverse().find(tk => {
          const w = tk.width || tk.size || 1;
          const h = tk.height || tk.size || 1;
          return p.x >= tk.x && p.x < tk.x + w && p.y >= tk.y && p.y < tk.y + h;
      });
      if (t) setContextMenu({ x: e.clientX, y: e.clientY, tokenId: t.id });
      else setContextMenu(null);
  };

  const handleBenchContextMenu = (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, benchId: id });
  };

  const handleAssetContextMenu = (e: React.MouseEvent, assetUrl: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, assetUrl });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      const p = getGridPos(e);
      const t = [...tokens].reverse().find(tk => {
          const w = tk.width || tk.size || 1;
          const h = tk.height || tk.size || 1;
          return p.x >= tk.x && p.x < tk.x + w && p.y >= tk.y && p.y < tk.y + h;
      });
      if (t) openTokenEditor(t.id);
      else setSelectedTokenId(null);
  };

  const handleBenchDragStart = (e: React.DragEvent, token: Token) => {
      e.dataTransfer.setData('tokenData', JSON.stringify(token));
      e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const tokenDataStr = e.dataTransfer.getData('tokenData');
      if (tokenDataStr) {
          const tokenTemplate = JSON.parse(tokenDataStr) as Token;
          if (!canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left - pan.x) / (tileSize * zoom));
          const y = Math.floor((e.clientY - rect.top - pan.y) / (tileSize * zoom));
          const newToken: Token = { ...tokenTemplate, id: Date.now(), x: Math.min(Math.max(0, x), gridW - 1), y: Math.min(Math.max(0, y), gridH - 1) };
          setTokens(prev => [...prev, newToken]);
      }
  };

  // ... (handleWheel, fitToScreen, centerMap, drawWeather, renderScene) ...
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); 
    if (!containerRef.current) return;
    const isPinch = e.ctrlKey;
    const isTrackpad = Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) < 40;
    if (isPinch) {
        const rect = containerRef.current.getBoundingClientRect();
        const zoomFactor = -e.deltaY * 0.01;
        const newZoom = Math.max(0.1, Math.min(5.0, zoom * (1 + zoomFactor)));
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;
        const newPanX = mouseX - (worldX * newZoom);
        const newPanY = mouseY - (worldY * newZoom);
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    } else if (isTrackpad) {
        setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    } else {
        const rect = containerRef.current.getBoundingClientRect();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(5.0, zoom + delta));
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - pan.x) / zoom;
        const worldY = (mouseY - pan.y) / zoom;
        const newPanX = mouseX - (worldX * newZoom);
        const newPanY = mouseY - (worldY * newZoom);
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    }
  };

  const fitToScreen = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const mapW = gridW * tileSize;
      const mapH = gridH * tileSize;
      const scaleX = containerW / mapW;
      const scaleY = containerH / mapH;
      const scale = Math.min(scaleX, scaleY) * 0.95; 
      const centerX = (containerW - mapW * scale) / 2;
      const centerY = (containerH - mapH * scale) / 2;
      setZoom(Number.isFinite(scale) ? scale : 1);
      setPan({ x: Number.isFinite(centerX) ? centerX : 0, y: Number.isFinite(centerY) ? centerY : 0 });
  };

  const centerMap = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const drawWeather = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (weather === 'none') return;
      
      const time = Date.now() / 1000;
      const targetCount = weather === 'fog' ? 30 : 100;
      if (particlesRef.current.length !== targetCount) {
          particlesRef.current = Array.from({length: targetCount}).map(() => ({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: (Math.random() - 0.5) * 50,
              vy: Math.random() * 100 + 50,
              size: Math.random() * 3 + 1,
              life: Math.random(),
              offset: Math.random() * 100
          }));
      }

      ctx.save();
      particlesRef.current.forEach(p => {
          if (weather === 'rain') {
              p.y += (p.vy / 20); p.x += (p.vx / 20);
              if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
              ctx.strokeStyle = 'rgba(150, 180, 255, 0.6)';
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx/10, p.y + p.vy/5); ctx.stroke();
          } else if (weather === 'snow') {
              p.y += (p.vy / 60); p.x += Math.sin(time + p.offset) * 0.5;
              if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          } else if (weather === 'ember') {
              p.y -= (p.vy / 40); p.x += (p.vx / 30);
              if (p.y < 0) { p.y = height + 10; p.x = Math.random() * width; }
              ctx.fillStyle = `rgba(255, ${100 + Math.random()*100}, 0, ${Math.random()})`;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill();
          } else if (weather === 'fog') {
              p.x += (p.vx / 100);
              if (p.x > width) p.x = -100;
              ctx.fillStyle = `rgba(200, 200, 220, 0.1)`;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 30, 0, Math.PI * 2); ctx.fill();
          }
      });
      ctx.restore();
  };

  const renderScene = (ctx: CanvasRenderingContext2D, width: number, height: number, isExport: boolean = false) => {
      if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return;

      ctx.fillStyle = '#0a0a10'; 
      ctx.fillRect(0,0, width, height);
      
      if (!isExport) { 
          ctx.save(); 
          const safeZoom = Number.isFinite(zoom) ? zoom : 1;
          const safePanX = Number.isFinite(pan.x) ? pan.x : 0;
          const safePanY = Number.isFinite(pan.y) ? pan.y : 0;
          ctx.translate(safePanX, safePanY);
          ctx.scale(safeZoom, safeZoom); 
      }
      
      let bgDrawn = false;
      if (backgroundImage) {
          const img = imageCache.current[backgroundImage];
          const isTainted = taintedImages.current.has(backgroundImage.split('$')[0]);
          if (img && img.complete && img.naturalWidth > 0 && (!isExport || !isTainted)) {
              const s = Number.isFinite(bgProps.scale) ? bgProps.scale : 1;
              const bgX = Number.isFinite(bgProps.x) ? bgProps.x : 0;
              const bgY = Number.isFinite(bgProps.y) ? bgProps.y : 0;
              try {
                  ctx.drawImage(img, bgX, bgY, img.naturalWidth * s, img.naturalHeight * s);
                  bgDrawn = true;
              } catch (e) { console.error("Error drawing BG", e); }
          } else if (isExport && isTainted) { bgDrawn = false; }
      }

      for(let y=0; y<gridH; y++) for(let x=0; x<gridW; x++) {
          if (!mapGrid[y]) continue;
          const parts = (mapGrid[y][x] || '').split('|');
          parts.forEach((p, layerIndex) => {
              const { url, r, fx, fy } = parseTileData(p);
              if(!url || url ==='VOID') return;
              if(url ==='⬜') { 
                  if (!bgDrawn) {
                      ctx.fillStyle='#2a2a35'; ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize); 
                      ctx.strokeStyle='#333'; ctx.strokeRect(x*tileSize,y*tileSize,tileSize,tileSize); 
                  }
                  return; 
              }
              const img = imageCache.current[url];
              const isTainted = taintedImages.current.has(url);
              if(img && img.complete && img.naturalWidth > 0 && (!isExport || !isTainted)) {
                  ctx.save();
                  ctx.translate(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);
                  if (r) ctx.rotate((r * Math.PI) / 180);
                  if (fx || fy) ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
                  try { ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize); } catch (e) {}
                  ctx.restore();
              } else if (isExport && isTainted) { 
                  if (layerIndex === 0) ctx.fillStyle = '#3d3d3d'; 
                  else if (layerIndex === 1) ctx.fillStyle = '#854d0e'; 
                  else ctx.fillStyle = '#57534e'; 
                  ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize); 
              } else { 
                  ctx.fillStyle = '#222'; ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize); 
              }
          });
          if(showFog && fogGrid[y] && fogGrid[y][x]) { ctx.fillStyle='rgba(0,0,0,0.95)'; ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize); }
      }
      
      if(showGrid) {
          ctx.strokeStyle=gridColor; ctx.globalAlpha=gridOpacity; ctx.lineWidth=1; ctx.beginPath();
          if(gridStyle === 'line') {
              for(let x=0;x<=gridW;x++){ctx.moveTo(x*tileSize,0);ctx.lineTo(x*tileSize,gridH*tileSize);}
              for(let y=0;y<=gridH;y++){ctx.moveTo(0,y*tileSize);ctx.lineTo(gridW*tileSize,y*tileSize);}
              ctx.stroke();
          } else {
              ctx.fillStyle = gridColor;
              for(let y=0; y<=gridH; y++) for(let x=0; x<=gridW; x++) { ctx.beginPath(); ctx.arc(x*tileSize, y*tileSize, 1, 0, 2*Math.PI); ctx.fill(); }
          }
          ctx.globalAlpha=1;

          // Draw Grid Coordinates
          if(!isExport) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              for(let x=0; x<gridW; x++) {
                  let label = '';
                  let n = x;
                  do {
                      label = String.fromCharCode(65 + (n % 26)) + label;
                      n = Math.floor(n / 26) - 1;
                  } while (n >= 0);
                  ctx.fillText(label, x * tileSize + tileSize / 2, -10);
              }
              for(let y=0; y<gridH; y++) {
                  ctx.fillText((y + 1).toString(), -15, y * tileSize + tileSize / 2);
              }
          }
      }

      // ... (Tokens, Auras, Selection Ring, HP Bars, Drawings, Pings etc - same as before) ...
      tokens.forEach((t: Token) => {
          if (!t.auraRadius || (showFog && fogGrid[Math.min(gridH-1,t.y)] && fogGrid[Math.min(gridH-1,t.y)][Math.min(gridW-1,t.x)])) return;
          const tx = t.x * tileSize + (t.width || 1) * tileSize / 2;
          const ty = t.y * tileSize + (t.height || 1) * tileSize / 2;
          const radiusPixels = (t.auraRadius / gridScale) * tileSize;
          ctx.beginPath(); ctx.arc(tx, ty, radiusPixels, 0, Math.PI * 2);
          ctx.fillStyle = t.auraColor || 'rgba(255, 200, 0, 0.2)'; ctx.fill();
          ctx.strokeStyle = t.auraColor?.replace(/[\d.]+\)$/g, '0.5)') || 'rgba(255, 200, 0, 0.5)'; ctx.lineWidth = 1; ctx.stroke();
      });

      tokens.forEach((t: Token) => {
          if(showFog && fogGrid[Math.min(gridH-1,t.y)] && fogGrid[Math.min(gridH-1,t.y)][Math.min(gridW-1,t.x)]) return;
          const tx = t.x*tileSize, ty = t.y*tileSize;
          const w = (t.width || t.size || 1) * tileSize;
          const h = (t.height || t.size || 1) * tileSize;
          
          if(selectedTokenId===t.id && !isExport) { 
              ctx.strokeStyle='#f59e0b'; ctx.lineWidth=3; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 10;
              ctx.strokeRect(tx-3,ty-3,w+6,h+6); ctx.shadowBlur = 0;
          }

          if (activeTokenIds && activeTokenIds.includes(t.id) && !isExport) {
              const time = Date.now() / 1000;
              ctx.save(); ctx.translate(tx + w/2, ty + h/2); ctx.rotate(time);
              ctx.beginPath(); const radius = Math.max(w, h) * 0.7 + Math.sin(time * 5) * 4;
              ctx.arc(0, 0, radius, 0, Math.PI * 2);
              ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 3; ctx.setLineDash([15, 10]); ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 15; ctx.stroke();
              ctx.restore();
          }

          const isTainted = t.image ? taintedImages.current.has(t.image.split('$')[0]) : false;
          if(t.image && imageCache.current[t.image]?.complete && (!isExport || !isTainted)) {
              ctx.save();
              const cx = tx + w/2; const cy = ty + h/2;
              ctx.translate(cx, cy);
              if (t.rotation) ctx.rotate((t.rotation * Math.PI) / 180);
              if (t.flipX || t.flipY) ctx.scale(t.flipX ? -1 : 1, t.flipY ? -1 : 1);
              if(!t.isProp) { ctx.beginPath(); const r = Math.min(w, h)/2; ctx.arc(0, 0, r, 0, 2*Math.PI); ctx.clip(); }
              try { ctx.drawImage(imageCache.current[t.image], -w/2, -h/2, w, h); } catch(e) {}
              ctx.restore();
          } else { 
              if(!t.isProp) { ctx.fillStyle=t.color; ctx.beginPath(); const cx = tx + w/2; const cy = ty + h/2; const r = Math.min(w, h)/2; ctx.arc(cx, cy, r, 0, 2*Math.PI); ctx.fill(); }
              ctx.fillStyle='#fff'; ctx.font=`${Math.min(w,h)/2}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(t.icon, tx+w/2, ty+h/2);
          }
          if (t.markers && t.markers.length > 0) {
            t.markers.forEach((m: string, i: number) => { ctx.fillStyle = m; ctx.beginPath(); ctx.arc(tx + w - 4 - (i*6), ty + 4, 3, 0, 2*Math.PI); ctx.fill(); });
          }

          if (!t.isProp && !isExport) {
              const barW = w * 0.8; const barH = 6; const barX = tx + (w - barW) / 2; const barY = ty - 10;
              if (t.max > 0) {
                  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(barX, barY, barW, barH);
                  const pct = Math.max(0, Math.min(1, t.hp / t.max));
                  ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
                  ctx.fillRect(barX+1, barY+1, (barW-2) * pct, barH-2);
              }
              ctx.font = 'bold 10px sans-serif'; ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.shadowColor = 'black'; ctx.shadowBlur = 3;
              ctx.fillText(t.name || '', tx + w/2, barY - 2); ctx.shadowBlur = 0;
          }
      });

      if (!isExport && mousePos && tool === 'pencil' && selectedTile) {
          const img = imageCache.current[selectedTile];
          if (img && img.complete) {
              const gw = placeMode === 'object' ? assetDims.w : 1;
              const gh = placeMode === 'object' ? assetDims.h : 1;
              const px = Math.floor(mousePos.x) * tileSize;
              const py = Math.floor(mousePos.y) * tileSize;
              
              ctx.save();
              ctx.globalAlpha = 0.5;
              ctx.translate(px + (gw*tileSize)/2, py + (gh*tileSize)/2);
              if (assetTransform.r) ctx.rotate((assetTransform.r * Math.PI) / 180);
              if (assetTransform.fx || assetTransform.fy) ctx.scale(assetTransform.fx ? -1 : 1, assetTransform.fy ? -1 : 1);
              try { ctx.drawImage(img, -(gw*tileSize)/2, -(gh*tileSize)/2, gw*tileSize, gh*tileSize); } catch(e) {}
              ctx.restore();
              ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.setLineDash([4, 2]);
              ctx.strokeRect(px, py, gw*tileSize, gh*tileSize); ctx.setLineDash([]);
          }
      }

      if (!isExport && mousePos && isDrawing && startPos) {
          ctx.strokeStyle='#3b82f6'; ctx.lineWidth=2;
          const sx=startPos.x*tileSize+tileSize/2, sy=startPos.y*tileSize+tileSize/2;
          const ex=(Math.floor(mousePos.x)*tileSize)+tileSize/2, ey=(Math.floor(mousePos.y)*tileSize)+tileSize/2;
          
          if(tool==='line' || tool==='ruler'){ 
              ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke(); 
              if(tool==='ruler') {
                  const dist = Math.sqrt(Math.pow(ex-sx, 2) + Math.pow(ey-sy, 2)) / tileSize * gridScale;
                  const mx = (sx+ex)/2, my = (sy+ey)/2 - 15;
                  const text = `${dist.toFixed(1)}${gridUnit}`;
                  ctx.font='bold 14px sans-serif'; const metrics = ctx.measureText(text);
                  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(mx - metrics.width/2 - 6, my - 14, metrics.width + 12, 20);
                  ctx.fillStyle = '#60a5fa'; ctx.textAlign = 'center'; ctx.fillText(text, mx, my);
              }
          }
          else if (tool==='rect' || tool==='fog-hide' || tool==='fog-reveal') { 
              const w=(Math.floor(mousePos.x)-startPos.x)*tileSize, h=(Math.floor(mousePos.y)-startPos.y)*tileSize; 
              ctx.strokeRect(sx-tileSize/2, sy-tileSize/2, w+(w>=0?tileSize:-tileSize), h+(h>=0?tileSize:-tileSize)); 
          }
          else if (tool==='measure-circle') {
              const radius = Math.sqrt(Math.pow(ex-sx, 2) + Math.pow(ey-sy, 2));
              ctx.beginPath(); ctx.arc(sx, sy, radius, 0, 2*Math.PI); ctx.stroke(); ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; ctx.fill();
          }
          else if (tool==='measure-cone') {
              ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); 
              const angle = Math.atan2(ey-sy, ex-sx); const len = Math.sqrt(Math.pow(ex-sx, 2) + Math.pow(ey-sy, 2));
              ctx.lineTo(sx + len * Math.cos(angle + 0.5), sy + len * Math.sin(angle + 0.5));
              ctx.lineTo(sx + len * Math.cos(angle - 0.5), sy + len * Math.sin(angle - 0.5));
              ctx.closePath(); ctx.stroke(); ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; ctx.fill();
          }
          else if (tool==='measure-cube') {
              const w=(Math.floor(mousePos.x)-startPos.x)*tileSize, h=(Math.floor(mousePos.y)-startPos.y)*tileSize;
              const rw = w+(w>=0?tileSize:-tileSize); const rh = h+(h>=0?tileSize:-tileSize);
              ctx.strokeRect(sx-tileSize/2, sy-tileSize/2, rw, rh); ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; ctx.fillRect(sx-tileSize/2, sy-tileSize/2, rw, rh);
          }
      }

      if (!isExport) {
          drawWeather(ctx, gridW * tileSize, gridH * tileSize);
      }

      if (!isExport && ping) {
          const px = ping.x * tileSize + tileSize/2; const py = ping.y * tileSize + tileSize/2; const age = Date.now() - ping.t;
          if (age < 2000) {
              const r = (age / 2000) * 100; const alpha = 1 - (age / 2000);
              ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255, 50, 50, ${alpha})`; ctx.lineWidth = 4; ctx.stroke();
              ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`; ctx.fill();
          }
      }

      if (!isExport) ctx.restore();
  };

  useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if(ctx) renderScene(ctx, gridW * tileSize, gridH * tileSize, false);
  }, [mapGrid, zoom, pan, tokens, selectedTokenId, tool, mousePos, startPos, showGrid, gridColor, gridOpacity, gridStyle, showFog, fogGrid, tick, backgroundImage, isDraggingToken, tokenBench, assetDims, placeMode, tileSize, gridScale, gridUnit, bgProps, gridW, gridH, assetTransform, weather, ping, activeTokenIds]);

  const deleteToken = (id: number) => { setTokens(prev=>prev.filter(t=>t.id!==id)); setContextMenu(null); };
  const updateTokenSize = (id:number, delta:number) => setTokens(prev=>prev.map(t=>t.id===id ? {...t, size: Math.max(0.5, (t.size||1) + delta), width: Math.max(0.5, (t.width||1) + delta), height: Math.max(0.5, (t.height||1) + delta)} : t));
  const rotateToken = (id: number, deg: number) => setTokens(prev=>prev.map(t=>t.id===id ? {...t, rotation: ((t.rotation||0)+deg+360)%360} : t));
  const flipToken = (id: number, axis: 'x'|'y') => setTokens(prev=>prev.map(t=>t.id===id ? (axis==='x' ? {...t, flipX: !t.flipX} : {...t, flipY: !t.flipY}) : t));
  const openTokenEditor = (id:number) => { const t = tokens.find(tk=>tk.id===id); if(t) setEditingToken(t); setContextMenu(null); };
  const duplicateToken = (id:number) => { const t = tokens.find(tk=>tk.id===id); if(t) setTokens([...tokens, {...t, id:Date.now(), x:t.x+1, y:t.y+1}]); setContextMenu(null); };
  const toggleTokenMarker = (id:number, color:string) => setTokens(prev => prev.map(t => t.id === id ? { ...t, markers: t.markers?.includes(color) ? t.markers.filter(c=>c!==color) : [...(t.markers||[]), color] } : t));
  const saveTokenChanges = () => { 
      if(editingToken) { 
          if (tokenBench.some(t => t.id === editingToken.id)) {
              setTokenBench(prev => prev.map(t => t.id === editingToken.id ? editingToken : t));
          } else {
              setTokens(prev=>prev.map(t=>t.id===editingToken.id?editingToken:t)); 
          }
          setEditingToken(null); 
      }
  };
  const handleTokenImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file && editingToken) { const r = new FileReader(); r.onload = (ev) => { if (ev.target?.result) setEditingToken({ ...editingToken, image: ev.target.result as string }); }; r.readAsDataURL(file); }};
  const addTokenToBench = (isProp: boolean = false) => { setTokenBench([...tokenBench, {id: Date.now(), x: 0, y: 0, icon: isProp ? '' : '💀', hp: isProp ? 0 : 10, max: isProp ? 0 : 10, color: isProp ? 'transparent' : '#ef4444', size: 1, width: 1, height: 1, name: isProp ? 'Objeto' : 'Monstro', isProp }]); };
  const handleAddPropFromSelection = () => { if (!selectedTile) return; setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '', image: selectedTile, hp: 10, max: 10, color: 'transparent', size: Math.max(assetDims.w, assetDims.h), width: assetDims.w, height: assetDims.h, name: 'Objeto', isProp: true, rotation: assetTransform.r, flipX: assetTransform.fx, flipY: assetTransform.fy }]); };
  const importCharacterToBench = (char: Character) => { setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '👤', hp: char.hp.current, max: char.hp.max, ac: char.ac, color: '#3b82f6', size: 1, width: 1, height: 1, name: char.name, isProp: false, linkedId: char.id, linkedType: 'character' }]); };
  const importMonsterToBench = (mon: Monster) => { setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '💀', hp: mon.hp, max: mon.hp, ac: mon.ac, color: '#ef4444', size: 1, width: 1, height: 1, name: mon.name, isProp: false, linkedId: mon.id, linkedType: 'monster' }]); };
  const removeTokenFromBench = (id: number) => { setTokenBench(prev => prev.filter(t => t.id !== id)); setContextMenu(null); };
  
  const handleLinkChange = (type: 'character' | 'monster', id: string) => { 
      if (!editingToken) return; 
      let name = editingToken.name || ''; 
      let hp = editingToken.hp; 
      let max = editingToken.max; 
      let ac = editingToken.ac; 
      if (type === 'character') { 
          const c = characters.find(char => char.id === id); 
          if (c) { name = c.name; hp = c.hp.current; max = c.hp.max; ac = c.ac; } 
      } else { 
          const m = monsters.find(mon => mon.id === Number(id)); 
          if (m) { name = m.name; hp = m.hp; max = m.hp; ac = m.ac; } 
      } 
      setEditingToken({ ...editingToken, linkedType: type, linkedId: id, name, hp, max, ac: ac || 10 }); 
  };
  
  const rotateAsset = (deg: number) => setAssetTransform(prev => ({...prev, r: (prev.r + deg + 360) % 360 }));
  const resetTransform = () => { setAssetTransform({ r: 0, fx: false, fy: false }); setAssetDims({w: 1, h: 1}); };

  // Calculate HUD Position
  const getSelectedTokenHUD = () => {
      if (!selectedTokenId || !canvasRef.current) return null;
      const token = tokens.find(t => t.id === selectedTokenId);
      if (!token) return null;

      const screenX = (token.x * tileSize + pan.x) * zoom;
      const screenY = (token.y * tileSize + pan.y) * zoom;
      const w = (token.width || 1) * tileSize * zoom;
      
      return (
          <div 
            className="absolute z-40 bg-[#1a1a24] border border-[#333] rounded-lg shadow-xl p-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2"
            style={{ left: screenX + w / 2, top: screenY - 50, transform: 'translateX(-50%)' }}
          >
              <button onClick={() => rotateToken(token.id, -45)} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Girar -45°"><RotateCcw size={14}/></button>
              <button onClick={() => rotateToken(token.id, 45)} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Girar +45°"><RotateCw size={14}/></button>
              <div className="w-px bg-[#333] mx-0.5"></div>
              <button onClick={() => flipToken(token.id, 'x')} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Espelhar Horiz"><ArrowRightLeft size={14}/></button>
              <div className="w-px bg-[#333] mx-0.5"></div>
              <button onClick={() => updateTokenSize(token.id, -0.5)} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Diminuir"><ChevronsDown size={14}/></button>
              <button onClick={() => updateTokenSize(token.id, 0.5)} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Aumentar"><ChevronsUp size={14}/></button>
              <div className="w-px bg-[#333] mx-0.5"></div>
              <button onClick={() => duplicateToken(token.id)} className="p-1.5 hover:bg-[#333] rounded text-stone-400 hover:text-white" title="Duplicar"><Copy size={14}/></button>
              <button onClick={() => deleteToken(token.id)} className="p-1.5 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300" title="Excluir"><Trash2 size={14}/></button>
          </div>
      );
  };

  return (
    <div className="flex h-full bg-[#0a0a10] text-[#e8e8ff] font-lato overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
        {!sidebarOpen && ( <button onClick={() => setSidebarOpen(true)} className="absolute top-2 left-2 md:top-4 md:left-4 z-30 p-2 bg-[#181822] border border-[#444] rounded-lg text-[#ffb74d] hover:bg-[#252535] shadow-lg opacity-80 hover:opacity-100"><ChevronRight size={20} /></button> )}
        
        {/* RESPONSIVE SIDEBAR: Drawer on Mobile, Sidebar on Desktop */}
        <div className={`fixed inset-0 z-50 md:static md:z-20 bg-[#181822] md:bg-transparent md:flex md:flex-col md:border-r-[3px] md:border-[#2a2a3a] md:shadow-2xl md:shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 w-full md:w-[300px]' : '-translate-x-full w-0 md:opacity-0 md:overflow-hidden'}`}>
            <div className="flex items-center justify-between p-3 border-b border-[#2a2a3a] bg-[#181822]"><h1 className="font-cinzel text-[#ffb74d] text-base tracking-[2px] truncate">FERRAMENTAS</h1><button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-500 hover:text-white"><ChevronLeft size={18} /></button></div>
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[#181822]">
                {/* ... (Sidebar buttons logic remains same until Map Tab) ... */}
                <button onClick={() => { setIsGameMode(!isGameMode); setTool(isGameMode ? 'pencil' : 'move'); }} className={`w-full py-2 mb-3 rounded font-bold border transition-all flex items-center justify-center gap-2 text-xs ${isGameMode ? 'bg-green-700 border-green-500 text-white' : 'bg-[#252535] border-[#444]'}`}>{isGameMode ? <><Swords size={14}/> MODO JOGO</> : <><Pencil size={14}/> MODO EDIÇÃO</>}</button>
                
                <div className="flex gap-1 mb-3 bg-[#1a1a24] p-1 rounded border border-[#333]">
                    {!isGameMode && <button onClick={() => setSidebarTab('tools')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'tools' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Ferramentas"><PencilRuler size={16}/></button>}
                    {!isGameMode && <button onClick={() => setSidebarTab('assets')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'assets' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Ativos"><LayoutGrid size={16}/></button>}
                    {!isGameMode && <button onClick={() => setSidebarTab('map')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'map' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Mapa"><MapIcon size={16}/></button>}
                    <button onClick={() => setSidebarTab('tokens')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'tokens' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Tokens"><Users size={16}/></button>
                    {!isGameMode && <button onClick={() => setSidebarTab('weather')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'weather' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Efeitos"><CloudRain size={16}/></button>}
                </div>

                {sidebarTab === 'tools' && !isGameMode && (
                    <div className="space-y-4">
                        <div className="flex overflow-x-auto gap-2 p-1 md:grid md:grid-cols-4 md:gap-1">
                            {[
                                { id: 'pencil', icon: Pencil, title: 'Lápis' }, { id: 'eraser', icon: Eraser, title: 'Borracha' },
                                { id: 'fill', icon: PaintBucket, title: 'Balde' }, { id: 'move', icon: Move, title: 'Mover' },
                                { id: 'rect', icon: Square, title: 'Retângulo' }, { id: 'line', icon: Minus, title: 'Linha' },
                                { id: 'fog-hide', icon: EyeOff, title: 'Esconder (Névoa)' }, { id: 'fog-reveal', icon: Eye, title: 'Revelar (Névoa)' },
                                { id: 'ruler', icon: Ruler, title: 'Régua' }, { id: 'hand', icon: Hand, title: 'Panorâmica' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setTool(t.id as any)} className={`p-2 rounded border flex items-center justify-center transition-all shrink-0 min-w-[40px] md:min-w-0 ${tool === t.id ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`} title={t.title}>
                                    <t.icon size={18} />
                                </button>
                            ))}
                        </div>
                        <div className="bg-[#1a1a24] p-2 rounded border border-[#333]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] uppercase font-bold text-stone-500">Tamanho Pincel</span>
                                <span className="text-[10px] text-[#ffb74d] font-bold">{brushSize}x{brushSize}</span>
                            </div>
                            <input type="range" min="1" max="5" step="1" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#ffb74d]"/>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <button onClick={() => setTool('measure-circle')} className={`p-2 rounded border flex items-center justify-center ${tool==='measure-circle'?'bg-blue-600 text-white':'bg-[#252535] border-[#333] text-stone-400'}`} title="Área Circular"><Circle size={16}/></button>
                            <button onClick={() => setTool('measure-cone')} className={`p-2 rounded border flex items-center justify-center ${tool==='measure-cone'?'bg-blue-600 text-white':'bg-[#252535] border-[#333] text-stone-400'}`} title="Cone"><Triangle size={16}/></button>
                            <button onClick={() => setTool('measure-cube')} className={`p-2 rounded border flex items-center justify-center ${tool==='measure-cube'?'bg-blue-600 text-white':'bg-[#252535] border-[#333] text-stone-400'}`} title="Cubo"><Box size={16}/></button>
                        </div>
                        <div className="bg-[#1a1a24] p-2 rounded border border-[#333]">
                            <div className="text-[10px] uppercase font-bold text-stone-500 mb-2">Camadas</div>
                            <div className="flex gap-1">
                                {[0,1,2].map(l => (
                                    <button key={l} onClick={() => setActiveLayer(l as any)} className={`flex-1 py-1 text-xs font-bold rounded transition-all ${activeLayer === l ? 'bg-[#ffb74d] text-black' : 'bg-[#252535] text-stone-400'}`}>
                                        {l === 0 ? 'Base' : l === 1 ? 'Obj' : 'Topo'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 mt-2">
                                <button onClick={() => fillFog(true)} className="flex-1 text-[10px] bg-[#252535] hover:bg-[#333] text-stone-400 py-1 rounded" title="Cobrir Tudo">Névoa Total</button>
                                <button onClick={() => fillFog(false)} className="flex-1 text-[10px] bg-[#252535] hover:bg-[#333] text-stone-400 py-1 rounded" title="Revelar Tudo">Sem Névoa</button>
                            </div>
                            <button onClick={() => clearLayer(activeLayer)} className="w-full mt-2 text-[10px] text-red-400 hover:bg-red-900/20 p-1 rounded flex items-center justify-center gap-1"><Trash2 size={12}/> Limpar Camada</button>
                        </div>
                    </div>
                )}

                {sidebarTab === 'assets' && !isGameMode && (
                    <div className="space-y-4">
                        <div className="flex border-b border-[#333]">
                            <button onClick={() => setAssetTab('standard')} className={`flex-1 pb-2 text-xs font-bold ${assetTab === 'standard' ? 'text-[#ffb74d] border-b-2 border-[#ffb74d]' : 'text-stone-500'}`}>Padrão</button>
                            <button onClick={() => setAssetTab('upload')} className={`flex-1 pb-2 text-xs font-bold ${assetTab === 'upload' ? 'text-[#ffb74d] border-b-2 border-[#ffb74d]' : 'text-stone-500'}`}>Meus Assets</button>
                            <button onClick={() => setAssetTab('edited')} className={`flex-1 pb-2 text-xs font-bold ${assetTab === 'edited' ? 'text-[#ffb74d] border-b-2 border-[#ffb74d]' : 'text-stone-500'}`}>Editados</button>
                        </div>
                        {/* Asset UI contents... (Asset Dims, Rotation, etc - keeping same) */}
                        <div className="bg-[#1a1a24] p-3 rounded-lg border border-[#333] space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1"><Scaling size={12}/> Tamanho (Grid)</span>
                                <div className="flex items-center gap-1 bg-[#252535] rounded p-0.5 border border-[#444]">
                                    <input type="number" className="w-8 bg-transparent text-center text-xs font-bold outline-none" value={assetDims.w} onChange={e => setAssetDims({...assetDims, w: Math.max(1, parseInt(e.target.value)||1)})} />
                                    <span className="text-stone-500 text-[10px]">x</span>
                                    <input type="number" className="w-8 bg-transparent text-center text-xs font-bold outline-none" value={assetDims.h} onChange={e => setAssetDims({...assetDims, h: Math.max(1, parseInt(e.target.value)||1)})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1"><ArrowRightLeft size={12}/> Espelhar</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => setAssetTransform(p => ({...p, fx: !p.fx}))} className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${assetTransform.fx ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#252535] border-[#444] text-stone-400'}`}>H</button>
                                        <button onClick={() => setAssetTransform(p => ({...p, fy: !p.fy}))} className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${assetTransform.fy ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#252535] border-[#444] text-stone-400'}`}>V</button>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1"><RotateCw size={12}/> Rotação</span>
                                        <span className="text-[10px] font-mono text-amber-500">{assetTransform.r}°</span>
                                    </div>
                                    <input type="range" min="0" max="360" step="45" value={assetTransform.r} onChange={e => setAssetTransform(p => ({...p, r: parseInt(e.target.value)}))} className="w-full accent-amber-500 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer" />
                                    <div className="flex justify-between mt-1">
                                        <button onClick={() => resetTransform()} className="text-[9px] text-red-400 hover:text-red-300">Resetar</button>
                                        <div className="flex gap-1">
                                            <button onClick={() => rotateAsset(-45)} className="text-[9px] bg-[#333] px-1.5 rounded hover:text-white">-45°</button>
                                            <button onClick={() => rotateAsset(45)} className="text-[9px] bg-[#333] px-1.5 rounded hover:text-white">+45°</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-[#333] flex gap-2">
                                <button onClick={() => setPlaceMode('tile')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${placeMode === 'tile' ? 'bg-[#ffb74d] text-black shadow' : 'bg-[#252535] text-stone-400 hover:bg-[#333]'}`}>Pintar</button>
                                <button onClick={() => setPlaceMode('object')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${placeMode === 'object' ? 'bg-[#ffb74d] text-black shadow' : 'bg-[#252535] text-stone-400 hover:bg-[#333]'}`}>Objeto</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                            {/* ... Asset List Render ... */}
                            {assetTab === 'standard' && (
                                <div className="col-span-4 space-y-2">
                                    <div className="relative">
                                        <select value={activePalette} onChange={(e) => setActivePalette(e.target.value)} className="w-full bg-[#252535] text-xs p-2 rounded border border-[#333] focus:border-[#ffb74d] outline-none appearance-none">
                                            {Object.keys(PALETTES).map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-2 pointer-events-none text-stone-500"><Filter size={14}/></div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(PALETTES[activePalette] || PALETTES['Básicos']).map((t, i) => (
                                            <div key={i} onClick={() => { setSelectedTile(t.c); setTool('pencil'); }} onContextMenu={(e) => handleAssetContextMenu(e, t.c)} className={`aspect-square rounded border cursor-pointer overflow-hidden relative group ${selectedTile === t.c ? 'border-[#ffb74d] ring-2 ring-[#ffb74d]/50' : 'border-[#444] hover:border-white'}`} title={t.n}>
                                                <img src={t.c} className="w-full h-full object-cover" loading="lazy" />
                                                <button onClick={(e) => { e.stopPropagation(); openTextureEditor(t.c); }} className="absolute top-0 right-0 bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600"><Edit size={10}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(assetTab === 'upload' || assetTab === 'edited') && (
                                <>
                                    <label className="aspect-square rounded border border-dashed border-[#444] hover:border-[#ffb74d] flex flex-col items-center justify-center cursor-pointer text-stone-500 hover:text-[#ffb74d]">
                                        <Upload size={20}/>
                                        <span className="text-[9px] font-bold mt-1">Upload</span>
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                    {customAssets.filter(a => assetTab === 'upload' ? a.type !== 'edited' : a.type === 'edited').map((a) => (
                                        <div key={a.id} onClick={() => { setSelectedTile(a.url); setTool('pencil'); }} onContextMenu={(e) => handleAssetContextMenu(e, a.url)} className={`aspect-square rounded border cursor-pointer overflow-hidden relative group ${selectedTile === a.url ? 'border-[#ffb74d] ring-2 ring-[#ffb74d]/50' : 'border-[#444] hover:border-white'}`}>
                                            <img src={a.url} className="w-full h-full object-cover" />
                                            <button onClick={(e) => { e.stopPropagation(); openTextureEditor(a); }} className="absolute top-0 right-0 bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600"><Edit size={10}/></button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {sidebarTab === 'weather' && !isGameMode && (
                    <div className="space-y-4">
                        {/* Weather UI contents... */}
                        <div className="text-xs text-stone-400 mb-2 p-2 bg-[#1a1a24] rounded border border-[#333]">
                            Adicione efeitos visuais sobre o mapa.
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setWeather('none')} className={`p-3 rounded border flex flex-col items-center gap-2 ${weather === 'none' ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400'}`}><Sun size={24}/> <span>Limpo</span></button>
                            <button onClick={() => setWeather('rain')} className={`p-3 rounded border flex flex-col items-center gap-2 ${weather === 'rain' ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400'}`}><CloudRain size={24}/> <span>Chuva</span></button>
                            <button onClick={() => setWeather('snow')} className={`p-3 rounded border flex flex-col items-center gap-2 ${weather === 'snow' ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400'}`}><Snowflake size={24}/> <span>Neve</span></button>
                            <button onClick={() => setWeather('fog')} className={`p-3 rounded border flex flex-col items-center gap-2 ${weather === 'fog' ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400'}`}><CloudFog size={24}/> <span>Névoa</span></button>
                            <button onClick={() => setWeather('ember')} className={`p-3 rounded border flex flex-col items-center gap-2 ${weather === 'ember' ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400'}`}><Flame size={24}/> <span>Cinzas</span></button>
                        </div>
                    </div>
                )}

                {sidebarTab === 'map' && !isGameMode && (
                    <div className="space-y-4 text-xs">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400 font-bold">Mostrar Grid</span>
                                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="accent-[#ffb74d]"/>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400 font-bold">Estilo Grid</span>
                                <select className="bg-[#252535] border border-[#333] rounded px-1" value={gridStyle} onChange={(e) => setGridStyle(e.target.value as any)}>
                                    <option value="line">Linhas</option>
                                    <option value="dot">Pontos</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400">Opacidade</span>
                                <input type="range" min="0.05" max="1" step="0.05" value={gridOpacity} onChange={e => setGridOpacity(parseFloat(e.target.value))} className="w-20 accent-[#ffb74d]"/>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-stone-400">Cor</span>
                                <input type="color" value={gridColor} onChange={e => setGridColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"/>
                            </div>
                            {/* NOVA INTERFACE DE RESOLUÇÃO */}
                            <div className="flex items-center justify-between border-t border-[#333] pt-2 mt-2">
                                <span className="text-stone-400 font-bold text-[#ffb74d]">Resolução (Px)</span>
                                <div className="flex items-center gap-2">
                                    <input type="range" min="16" max="128" value={tileSize} onChange={e => setTileSize(parseInt(e.target.value))} className="w-20 accent-[#ffb74d]" />
                                    <input type="number" className="w-12 bg-[#252535] border border-[#333] rounded px-1 text-center font-bold" value={tileSize} onChange={e => setTileSize(parseInt(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#333] pt-2 space-y-2">
                            <span className="block font-bold text-[#ffb74d] uppercase mb-1">Dimensões & Escala</span>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[9px] text-stone-500 uppercase">Largura</label>
                                    <input type="number" className="w-full bg-[#252535] rounded p-1 text-center" value={gridW} onChange={e => resizeMap(parseInt(e.target.value), gridH)} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] text-stone-500 uppercase">Altura</label>
                                    <input type="number" className="w-full bg-[#252535] rounded p-1 text-center" value={gridH} onChange={e => resizeMap(gridW, parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[9px] text-stone-500 uppercase">Escala ({gridUnit})</label>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setGridScale(s => Math.max(0.1, parseFloat((s - 0.5).toFixed(1))))} className="bg-[#333] p-1 rounded hover:text-white"><Minus size={12}/></button>
                                        <input type="number" step="0.5" className="w-full bg-[#252535] rounded p-1 text-center" value={gridScale} onChange={e => setGridScale(parseFloat(e.target.value))} />
                                        <button onClick={() => setGridScale(s => parseFloat((s + 0.5).toFixed(1)))} className="bg-[#333] p-1 rounded hover:text-white"><Plus size={12}/></button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] text-stone-500 uppercase">Unidade</label>
                                    <input type="text" className="w-full bg-[#252535] rounded p-1 text-center" value={gridUnit} onChange={e => setGridUnit(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#333] pt-2 space-y-2">
                            <span className="block font-bold text-[#ffb74d] uppercase mb-1">Imagem de Fundo</span>
                            <div className="flex gap-2">
                                <label className="flex-1 bg-[#252535] hover:bg-[#333] text-center p-2 rounded cursor-pointer border border-[#333] hover:text-white transition-colors">
                                    <Upload size={16} className="mx-auto mb-1"/> Upload
                                    <input type="file" hidden accept="image/*" onChange={handleBgUpload} ref={bgInputRef} />
                                </label>
                                <button onClick={() => setBackgroundImage(null)} className="flex-1 bg-[#252535] hover:bg-red-900/30 text-center p-2 rounded border border-[#333] hover:text-red-400 transition-colors">
                                    <Trash2 size={16} className="mx-auto mb-1"/> Remover
                                </button>
                            </div>
                            
                            <div className="mt-2">
                                <span className="text-[9px] text-stone-500 font-bold uppercase mb-1 block">Mapas Prontos</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {LIST_MAPS.map((url, i) => (
                                        <div key={i} className="aspect-video bg-stone-800 border border-stone-600 rounded cursor-pointer hover:border-amber-500 relative group overflow-hidden" onClick={() => setBgFromPreset(url)}>
                                            <img src={convertDriveLink(url)} className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">Usar</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {backgroundImage && (
                                <div className="space-y-2 mt-2 bg-[#1a1a24] p-2 rounded border border-[#333]">
                                    <button onClick={fitBackgroundToGrid} className="w-full bg-blue-900/30 text-blue-400 text-[10px] py-1 rounded border border-blue-900/50 hover:bg-blue-900/50">Ajustar ao Grid</button>
                                    <div className="flex items-center justify-between">
                                        <span>Escala BG</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setBgProps(p => ({...p, scale: Math.max(0.01, parseFloat((p.scale - 0.05).toFixed(2)))}))} className="bg-[#333] p-1 rounded hover:text-white"><Minus size={10}/></button>
                                            <input type="number" step="0.01" className="w-14 bg-[#000] p-1 rounded text-right text-xs" value={bgProps.scale} onChange={e => setBgProps({...bgProps, scale: parseFloat(e.target.value)})} />
                                            <button onClick={() => setBgProps(p => ({...p, scale: parseFloat((p.scale + 0.05).toFixed(2))}))} className="bg-[#333] p-1 rounded hover:text-white"><Plus size={10}/></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pos X</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setBgProps(p => ({...p, x: p.x - tileSize}))} className="bg-[#333] p-1 rounded hover:text-white"><ChevronLeft size={10}/></button>
                                            <input type="number" className="w-14 bg-[#000] p-1 rounded text-right text-xs" value={bgProps.x} onChange={e => setBgProps({...bgProps, x: parseInt(e.target.value)})} />
                                            <button onClick={() => setBgProps(p => ({...p, x: p.x + tileSize}))} className="bg-[#333] p-1 rounded hover:text-white"><ChevronRight size={10}/></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pos Y</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setBgProps(p => ({...p, y: p.y - tileSize}))} className="bg-[#333] p-1 rounded hover:text-white"><ChevronsUp size={10}/></button>
                                            <input type="number" className="w-14 bg-[#000] p-1 rounded text-right text-xs" value={bgProps.y} onChange={e => setBgProps({...bgProps, y: parseInt(e.target.value)})} />
                                            <button onClick={() => setBgProps(p => ({...p, y: p.y + tileSize}))} className="bg-[#333] p-1 rounded hover:text-white"><ChevronsDown size={10}/></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[#333] pt-2">
                            <button onClick={clearMap} className="w-full py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 rounded flex items-center justify-center gap-2 font-bold mb-2">
                                <Trash2 size={16}/> Limpar Tudo
                            </button>
                            <button onClick={clearToBackground} className="w-full py-2 bg-stone-800 text-stone-400 hover:bg-stone-700 rounded flex items-center justify-center gap-2 font-bold">
                                <Eraser size={16}/> Limpar Tiles (Manter Fundo)
                            </button>
                        </div>
                    </div>
                )}

                {sidebarTab === 'tokens' && (
                    <div className="space-y-2">
                        {/* Token list content... */}
                        <div className="text-xs text-stone-500 text-center mb-2">Arraste para o mapa ou clique para adicionar</div>
                        {characters.map(char => (
                            <div key={char.id} onClick={() => importCharacterToBench(char)} className="bg-[#222] p-2 rounded border border-[#333] flex justify-between items-center cursor-pointer hover:bg-[#333]">
                                <span className="font-bold text-blue-400 text-xs">{char.name}</span>
                                <Plus size={14} className="text-stone-500"/>
                            </div>
                        ))}
                        <div className="border-t border-[#333] my-2"></div>
                        {monsters.map(mon => (
                            <div key={mon.id} onClick={() => importMonsterToBench(mon)} className="bg-[#222] p-2 rounded border border-[#333] flex justify-between items-center cursor-pointer hover:bg-[#333]">
                                <span className="font-bold text-red-400 text-xs">{mon.name}</span>
                                <Plus size={14} className="text-stone-500"/>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-[#2a2a3a] bg-[#1a1a24]">
                <button onClick={exportMap} className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded flex items-center justify-center gap-2 font-bold text-xs"><Download size={14}/> EXPORTAR MAPA</button>
            </div>
        </div>
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a10]" ref={containerRef} onWheel={handleWheel}>
            {getSelectedTokenHUD()}
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
                onDoubleClick={handleDoubleClick}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
                width={gridW * tileSize}
                height={gridH * tileSize}
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'top left',
                    cursor: tool === 'hand' || isPanning ? 'grab' : (tool === 'move' ? 'move' : 'crosshair')
                }}
            />
            {/* ... Rest of Canvas UI ... */}
            <div className="absolute top-16 right-2 md:top-4 md:right-4 flex flex-col gap-2 scale-75 md:scale-100 origin-top-right">
                <button onClick={centerMap} className="bg-[#181822] p-2 rounded-full border border-[#444] text-white hover:bg-[#252535] shadow-lg" title="Resetar Vista"><Target size={20}/></button>
                <button onClick={fitToScreen} className="bg-[#181822] p-2 rounded-full border border-[#444] text-white hover:bg-[#252535] shadow-lg" title="Ajustar à Tela"><Maximize size={20}/></button>
                <div className="bg-[#181822] rounded-full border border-[#444] flex flex-col overflow-hidden shadow-lg mt-2">
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:bg-[#252535] text-white"><Plus size={16}/></button>
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-[#252535] text-white"><Minus size={16}/></button>
                </div>
                <button onClick={exportMap} className="bg-[#181822] p-2 rounded-full border border-[#444] text-green-400 hover:bg-[#252535] shadow-lg mt-2" title="Exportar Imagem"><Download size={20}/></button>
                <button onClick={() => setShowFog(!showFog)} className={`p-2 rounded-full border shadow-lg mt-2 ${showFog ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#181822] border-[#444] text-stone-400'}`} title="Alternar Névoa"><CloudRain size={20}/></button>
            </div>

            <div className="absolute top-16 left-2 md:top-auto md:bottom-24 md:left-4 flex gap-2 scale-75 md:scale-100 origin-top-left">
                <button onClick={undo} disabled={historyIndex <= 0} className="bg-[#181822] p-2 rounded-full border border-[#444] text-white disabled:opacity-50 hover:bg-[#252535] shadow-lg"><Undo2 size={20}/></button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="bg-[#181822] p-2 rounded-full border border-[#444] text-white disabled:opacity-50 hover:bg-[#252535] shadow-lg"><Redo2 size={20}/></button>
            </div>

            {contextMenu && (
                <div 
                    className="fixed z-50 bg-[#181822] border border-[#444] rounded shadow-xl py-1 w-40 text-sm"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.tokenId ? (
                        <>
                            <button onClick={() => openTokenEditor(contextMenu.tokenId!)} className="w-full text-left px-4 py-2 hover:bg-[#252535] text-stone-200 flex items-center gap-2"><Edit size={14}/> Editar</button>
                            <button onClick={() => duplicateToken(contextMenu.tokenId!)} className="w-full text-left px-4 py-2 hover:bg-[#252535] text-stone-200 flex items-center gap-2"><Copy size={14}/> Duplicar</button>
                            <div className="border-t border-[#333] my-1"></div>
                            <div className="px-2 py-1 flex gap-1 justify-center flex-wrap">
                                {MARKER_COLORS.map(c => (
                                    <button key={c} onClick={() => toggleTokenMarker(contextMenu.tokenId!, c)} className="w-4 h-4 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                            <div className="border-t border-[#333] my-1"></div>
                            <button onClick={() => deleteToken(contextMenu.tokenId!)} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-2"><Trash2 size={14}/> Excluir</button>
                        </>
                    ) : contextMenu.benchId ? (
                        <>
                            <button onClick={() => {
                                const t = tokenBench.find(tb => tb.id === contextMenu.benchId);
                                if (t) { setEditingToken(t); setContextMenu(null); }
                            }} className="w-full text-left px-4 py-2 hover:bg-[#252535] text-stone-200 flex items-center gap-2"><Edit size={14}/> Editar Token Salvo</button>
                            <button onClick={() => removeTokenFromBench(contextMenu.benchId!)} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-2"><Trash2 size={14}/> Excluir da Barra</button>
                        </>
                    ) : contextMenu.assetUrl ? (
                        <>
                            <button onClick={() => openTextureEditor(contextMenu.assetUrl!)} className="w-full text-left px-4 py-2 hover:bg-[#252535] text-stone-200 flex items-center gap-2"><Edit size={14}/> Editar Imagem</button>
                            <button onClick={() => {
                                const newAssets = customAssets.filter(a => a.url !== contextMenu.assetUrl);
                                setCustomAssets(newAssets);
                                localStorage.setItem('nexus_custom_assets', JSON.stringify(newAssets));
                                setContextMenu(null);
                            }} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-2"><Trash2 size={14}/> Remover Asset</button>
                        </>
                    ) : (
                        <div className="px-4 py-2 text-stone-500 italic text-center">Nada aqui</div>
                    )}
                </div>
            )}

            {/* Token Editor Modal */}
            {editingToken && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setEditingToken(null)}>
                    <div className="bg-[#1a1a1d] border border-[#333] rounded-xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                            <h3 className="font-bold text-[#ffb74d] text-lg">Editar Token</h3>
                            <button onClick={() => setEditingToken(null)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="flex gap-4 mb-4">
                            <div className="w-24 h-24 bg-[#000] rounded-lg border border-[#333] flex items-center justify-center overflow-hidden relative group shrink-0">
                                {editingToken.image ? <img src={editingToken.image} className="w-full h-full object-cover"/> : <span className="text-4xl">{editingToken.icon}</span>}
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <Upload size={24} className="text-white"/>
                                    <input type="file" hidden onChange={handleTokenImageUpload} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <label className="block text-[10px] text-stone-500 uppercase font-bold">Nome</label>
                                    <input className="w-full bg-[#252535] border border-[#333] rounded p-1.5 text-sm" value={editingToken.name} onChange={e => setEditingToken({...editingToken, name: e.target.value})} />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-stone-500 uppercase font-bold">Tamanho</label>
                                        <input type="number" step="0.5" className="w-full bg-[#252535] border border-[#333] rounded p-1.5 text-sm" value={editingToken.size} onChange={e => setEditingToken({...editingToken, size: parseFloat(e.target.value), width: parseFloat(e.target.value), height: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-stone-500 uppercase font-bold">Cor</label>
                                        <input type="color" className="w-full h-8 bg-transparent cursor-pointer" value={editingToken.color} onChange={e => setEditingToken({...editingToken, color: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 bg-[#222] p-2 rounded border border-[#333]">
                            <div>
                                <label className="block text-[10px] text-stone-500 uppercase font-bold">PV Atual</label>
                                <input type="number" className="w-full bg-[#151518] text-center border border-[#333] rounded p-1 text-sm text-green-400" value={editingToken.hp} onChange={e => setEditingToken({...editingToken, hp: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-[10px] text-stone-500 uppercase font-bold">PV Max</label>
                                <input type="number" className="w-full bg-[#151518] text-center border border-[#333] rounded p-1 text-sm" value={editingToken.max} onChange={e => setEditingToken({...editingToken, max: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-[10px] text-stone-500 uppercase font-bold">CA</label>
                                <input type="number" className="w-full bg-[#151518] text-center border border-[#333] rounded p-1 text-sm text-blue-400" value={editingToken.ac || 10} onChange={e => setEditingToken({...editingToken, ac: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <div className="mb-4 bg-[#222] p-2 rounded border border-[#333]">
                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-2 flex items-center gap-1"><Zap size={10}/> Aura (Raio / Cor)</label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input 
                                        type="number" 
                                        className="w-full bg-[#151518] border border-[#333] rounded p-1.5 pl-8 text-sm"
                                        placeholder="0m"
                                        value={editingToken.auraRadius || ''}
                                        onChange={e => setEditingToken({...editingToken, auraRadius: parseFloat(e.target.value) || 0})}
                                    />
                                    <span className="absolute left-2 top-2 text-xs text-stone-500">R:</span>
                                </div>
                                <input 
                                    type="color" 
                                    className="w-10 h-8 bg-transparent cursor-pointer self-center"
                                    value={editingToken.auraColor || '#FFC800'}
                                    onChange={e => setEditingToken({...editingToken, auraColor: e.target.value})}
                                />
                            </div>
                            <div className="text-[9px] text-stone-500 mt-1">Defina o raio em metros (ex: 3 para 3m/1.5m = 2 quadrados)</div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-1">Vincular Ficha (Auto-Atualizar)</label>
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 bg-[#252535] border border-[#333] rounded p-1.5 text-xs"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if(!val) return;
                                        const [type, id] = val.split(':');
                                        handleLinkChange(type as 'character'|'monster', id);
                                    }}
                                    value={editingToken.linkedId ? `${editingToken.linkedType}:${editingToken.linkedId}` : ''}
                                >
                                    <option value="">Sem Vínculo</option>
                                    <optgroup label="Personagens">
                                        {characters.map(c => <option key={c.id} value={`character:${c.id}`}>{c.name}</option>)}
                                    </optgroup>
                                    <optgroup label="Monstros">
                                        {monsters.map(m => <option key={m.id} value={`monster:${m.id}`}>{m.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingToken(null)} className="px-4 py-2 text-stone-500 hover:text-stone-300">Cancelar</button>
                            <button onClick={saveTokenChanges} className="px-6 py-2 bg-[#ffb74d] hover:bg-amber-500 text-black font-bold rounded shadow-lg">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Texture Editor Modal */}
            {editingTexture && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setEditingTexture(null)}>
                    <div className="bg-[#1a1a1d] border border-[#333] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b border-[#333] bg-[#222]">
                            <h3 className="font-bold text-stone-200 flex items-center gap-2"><Palette size={18}/> Editor de Textura: {editingTexture.name}</h3>
                            <button onClick={() => setEditingTexture(null)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-64 bg-[#151518] border-r border-[#333] p-4 overflow-y-auto space-y-4">
                                <div className="flex bg-[#252535] rounded p-1 mb-4">
                                    <button onClick={() => setEditorTab('color')} className={`flex-1 text-xs py-1 rounded ${editorTab === 'color' ? 'bg-[#ffb74d] text-black' : 'text-stone-400'}`}>Cor/Filtros</button>
                                    <button onClick={() => setEditorTab('crop')} className={`flex-1 text-xs py-1 rounded ${editorTab === 'crop' ? 'bg-[#ffb74d] text-black' : 'text-stone-400'}`}>Recorte</button>
                                </div>

                                {editorTab === 'color' ? (
                                    <>
                                        {[
                                            { l: 'Brilho', k: 'brightness', min: 0, max: 200 },
                                            { l: 'Contraste', k: 'contrast', min: 0, max: 200 },
                                            { l: 'Saturação', k: 'saturation', min: 0, max: 200 },
                                            { l: 'Matiz', k: 'hue', min: 0, max: 360 },
                                            { l: 'Blur', k: 'blur', min: 0, max: 20 },
                                            { l: 'Sepia', k: 'sepia', min: 0, max: 100 },
                                            { l: 'P/B', k: 'grayscale', min: 0, max: 100 },
                                            { l: 'Inverter', k: 'invert', min: 0, max: 100 },
                                            { l: 'Opacidade', k: 'opacity', min: 0, max: 100 },
                                        ].map(setting => (
                                            <div key={setting.k}>
                                                <div className="flex justify-between text-[10px] text-stone-500 uppercase font-bold mb-1">
                                                    <span>{setting.l}</span>
                                                    {/* @ts-ignore */}
                                                    <span>{textureParams[setting.k]}</span>
                                                </div>
                                                {/* @ts-ignore */}
                                                <input type="range" min={setting.min} max={setting.max} value={textureParams[setting.k]} onChange={e => setTextureParams({...textureParams, [setting.k]: parseInt(e.target.value)})} className="w-full accent-[#ffb74d] h-2 bg-[#333] rounded-lg appearance-none"/>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-[#333]">
                                            <label className="flex items-center gap-2 text-xs text-stone-400">
                                                <input type="checkbox" checked={!textureParams.pixelated} onChange={e => setTextureParams({...textureParams, pixelated: !e.target.checked})} />
                                                Suavizar Pixels (Anti-aliasing)
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-xs text-stone-400 mb-2">Selecione uma área na imagem para recortar.</div>
                                        <div>
                                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-1">Proporção Fixa</label>
                                            <div className="grid grid-cols-3 gap-1">
                                                {[
                                                    {l: 'Livre', v: null}, {l: '1:1', v: 1}, {l: '16:9', v: 16/9},
                                                    {l: '4:3', v: 4/3}, {l: '3:4', v: 3/4}, {l: '9:16', v: 9/16}
                                                ].map(r => (
                                                    <button key={r.l} onClick={() => setCropAspect(r.v)} className={`text-xs py-1 rounded border ${cropAspect === r.v ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'border-[#333] text-stone-400'}`}>{r.l}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {cropRect && cropRect.w > 0 && (
                                            <div className="bg-[#222] p-2 rounded text-[10px] text-stone-400">
                                                Selecionado: {Math.round(cropRect.w)} x {Math.round(cropRect.h)} px
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 bg-[#0a0a0a] relative flex items-center justify-center p-8 overflow-hidden checkerboard-bg" onMouseDown={handleEditorMouseDown} onMouseMove={handleEditorMouseMove} onMouseUp={handleEditorMouseUp}>
                                {!editorImage && !isTaintedSource && <div className="flex items-center gap-2 text-stone-500"><Loader2 className="animate-spin"/> Carregando imagem...</div>}
                                <canvas ref={editCanvasRef} className="max-w-full max-h-full shadow-2xl border border-[#333]" />
                            </div>
                        </div>

                        <div className="p-4 border-t border-[#333] bg-[#222] flex justify-between items-center">
                            <div className="text-xs text-red-400 flex items-center gap-2">
                                {isTaintedSource && <><AlertTriangle size={14}/> Imagem externa protegida (CORS). Edição permitida apenas para visualização. Salvar desabilitado.</>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingTexture(null)} className="px-4 py-2 rounded text-stone-400 hover:text-white">Cancelar</button>
                                <button onClick={() => saveEditedTexture(false)} disabled={isSaving || isTaintedSource} className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : saveSuccess ? <CheckCircle2 size={16}/> : <Save size={16}/>}
                                    {saveSuccess ? 'Salvo!' : 'Salvar como Novo Asset'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Token Bench */}
        <div className="absolute bottom-0 left-0 w-full h-16 md:h-20 bg-[#181822] border-t border-[#333] z-20 flex items-center px-4 gap-4 overflow-x-auto custom-scrollbar">
            {!isGameMode && (
                <>
                    <button onClick={() => addTokenToBench(false)} className="flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded border border-dashed border-[#444] text-stone-500 hover:text-[#ffb74d] hover:border-[#ffb74d] shrink-0">
                        <Plus size={20}/>
                        <span className="text-[9px] font-bold mt-1">NPC</span>
                    </button>
                    <button onClick={() => handleAddPropFromSelection()} className="flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded border border-dashed border-[#444] text-stone-500 hover:text-blue-400 hover:border-blue-400 shrink-0">
                        <Plus size={20}/>
                        <span className="text-[9px] font-bold mt-1">Objeto</span>
                    </button>
                    <div className="w-[1px] h-10 bg-[#333] mx-2"></div>
                </>
            )}
            {tokenBench.map(token => (
                <div 
                    key={token.id} 
                    draggable
                    onDragStart={(e) => handleBenchDragStart(e, token)}
                    onContextMenu={(e) => handleBenchContextMenu(e, token.id)}
                    className="relative w-12 h-12 md:w-14 md:h-14 bg-[#222] rounded-full border-2 border-[#444] hover:border-[#ffb74d] cursor-grab active:cursor-grabbing flex items-center justify-center shrink-0 group transition-all"
                >
                    {token.image ? (
                        <img src={token.image} className="w-full h-full object-cover rounded-full pointer-events-none" />
                    ) : (
                        <span className="text-xl">{token.icon || (token.isProp ? '📦' : '♟️')}</span>
                    )}
                    {!isGameMode && <button onClick={() => removeTokenFromBench(token.id)} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>}
                    <div className="absolute -bottom-5 text-[9px] bg-black/80 px-1 rounded text-stone-300 truncate max-w-full">{token.name}</div>
                </div>
            ))}
        </div>
    </div>
  );
}
