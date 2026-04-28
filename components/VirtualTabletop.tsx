
import React, { useEffect, useRef, useState } from 'react';
import { compressImage } from '../lib/imageUtils';
import { Token, Character, Monster, MapConfig, CustomAsset } from '../types';
import { Pencil, Eraser, PaintBucket, Ruler, Undo2, Redo2, Trash2, Download, Swords, Plus, Users, Minus, Upload, Eye, EyeOff, Edit, Copy, Shield, X, Hand, Target, Circle, Triangle, Palette, Loader2, Save, Scaling, ArrowRightLeft, RotateCw, CheckCircle2, Flame, PencilRuler, LayoutGrid, Snowflake, CloudFog, Zap, Filter, Sun, CloudRain, Box, ChevronRight, ChevronLeft, Map as MapIcon, Move, Maximize, AlertTriangle, Square, RotateCcw, ChevronsUp, ChevronsDown, Lock, Unlock, Layers, MoreHorizontal, Image as ImageIcon, Frame, ZoomIn, ZoomOut, Heart, HeartOff } from 'lucide-react';

interface Props {
  mapGrid: string[][];
  setMapGrid: (grid: string[][]) => void;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  characters: Character[];
  npcs?: Character[];
  monsters: Monster[];
  fogGrid: boolean[][];
  setFogGrid: (fog: boolean[][]) => void;
  mapConfig?: MapConfig;
  setMapConfig?: React.Dispatch<React.SetStateAction<MapConfig>>;
  activeTokenIds?: number[];
  customAssets?: Record<string, CustomAsset>;
  setCustomAssets?: React.Dispatch<React.SetStateAction<Record<string, CustomAsset>>>;
  onSyncAsset?: (asset: CustomAsset) => void;
  permissions?: {
    canMoveTokens: boolean;
    canEditCharacters: boolean;
    canRollDice: boolean;
  };
  isDM?: boolean;
  setConfirmModal?: (modal: {message: string, onConfirm: () => void, onCancel?: () => void} | null) => void;
}

type WeatherType = 'none' | 'rain' | 'snow' | 'ember' | 'fog';

import {
    LIST_IMG,
    LIST_MURRO,
    LIST_PREDIOS,
    LIST_VEGETACAO,
    LIST_CREATURES,
    LIST_MOBILIA,
    LIST_MAPS,
    LIST_FRAMES,
    TEXTURE_LINKS,
    PALETTES
} from '../assets';

const convertDriveLink = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url; // Base64 check
    if (url.startsWith('/textures')) return url; // Local path check
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

// --- ASSET LIBRARIES LOCAIS ---
// Moved to assets.ts

const MARKER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#000000'];

const CONDITION_ICONS: Record<string, string> = {
    "Agarrado": "⚓", "Amedrontado": "😨", "Atordoado": "😵", "Caído": "🦶", "Cego": "🕶️", 
    "Enfeitiçado": "💖", "Envenenado": "🤢", "Exausto": "💤", "Impedido": "🕸️", 
    "Incapacitado": "🚫", "Inconsciente": "🛌", "Invisível": "👻", "Paralisado": "❄️", 
    "Petrificado": "🗿", "Surdo": "🔇"
};

export const VirtualTabletop: React.FC<Props> = ({ mapGrid, setMapGrid, tokens, setTokens, characters, npcs = [], monsters, fogGrid, setFogGrid, mapConfig: propMapConfig, setMapConfig: propSetMapConfig, activeTokenIds, customAssets: propCustomAssets = {}, setCustomAssets: propSetCustomAssets, onSyncAsset, permissions, isDM = false, setConfirmModal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const particlesRef = useRef<any[]>([]);
  const localAssetsRef = useRef<Record<string, CustomAsset>>({});
  
  // Safe grid dimensions - fallback to 0 if empty
  const gridH = mapGrid?.length || 0;
  const gridW = (gridH > 0 && mapGrid[0]) ? mapGrid[0].length : 0;

  // Local State for Map Dimensions Inputs
  const [mapDimW, setMapDimW] = useState<string>((gridW || 40).toString());
  const [mapDimH, setMapDimH] = useState<string>((gridH || 40).toString());

  // Initialize tileSize from prop if available, else default to 32
  const [tileSize, setTileSize] = useState(propMapConfig?.tileSize || 32); 
  const [gridScale, setGridScale] = useState(propMapConfig?.scale || 1.5); 
  const [gridUnit, setGridUnit] = useState(propMapConfig?.unit || 'm'); 
  const [bgProps, setBgProps] = useState({ x: propMapConfig?.bgX || 0, y: propMapConfig?.bgY || 0, scale: propMapConfig?.bgScale || 1.0 });
  const [history, setHistory] = useState<string[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sidebarOpen, setSidebarOpen] = useState(isDM);
  const [sidebarTab, setSidebarTab] = useState<'tools' | 'assets' | 'map' | 'tokens' | 'weather'>(isDM ? 'tools' : 'tokens');
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill' | 'ruler' | 'move' | 'rect' | 'line' | 'fog-hide' | 'fog-reveal' | 'hand' | 'measure-circle' | 'measure-cone' | 'measure-cube' | 'ping'>('move');
  
  // NEW: Layer Control
  const [editLayer, setEditLayer] = useState<'token' | 'background'>('token');
  
  const [selectedTile, setSelectedTile] = useState(TEXTURE_LINKS.base);
  const [assetTab, setAssetTab] = useState<'standard' | 'upload' | 'edited'>('standard');
  const [assetDims, setAssetDims] = useState({ w: 1, h: 1 });
  const [assetTransform, setAssetTransform] = useState({ r: 0, fx: false, fy: false });
  const [placeMode, setPlaceMode] = useState<'tile' | 'object'>('tile'); 
  const [tokenBench, setTokenBench] = useState<Token[]>([]);
  const [brushSize, setBrushSize] = useState(1);
  
  const latestMapGridRef = useRef(mapGrid);
  useEffect(() => {
      latestMapGridRef.current = mapGrid;
  }, [mapGrid]);

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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
  const [bgBrightness, setBgBrightness] = useState(propMapConfig?.bgBrightness ?? 100);
  const [bgStretch, setBgStretch] = useState(propMapConfig?.bgStretch ?? false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isGameMode, setIsGameMode] = useState(!isDM);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const failedImages = useRef<Set<string>>(new Set());
  const taintedImages = useRef<Set<string>>(new Set()); 
  const [tick, setTick] = useState(0); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{x:number, y:number} | null>(null); 
  const [mousePos, setMousePos] = useState<{x:number, y:number} | null>(null);
  const [measureStart, setMeasureStart] = useState<{x: number, y: number} | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{x: number, y: number} | null>(null);
  const [ping, setPing] = useState<{x: number, y: number, t: number} | null>(null);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [primaryDragTokenId, setPrimaryDragTokenId] = useState<number | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Record<number, {x: number, y: number}>>({});
  const [weather, setWeather] = useState<WeatherType>(propMapConfig?.weather || 'none');
  const [dynamicMaps, setDynamicMaps] = useState<string[]>([]);
  
  // Dynamic Canvas Resizing
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const [showBench, setShowBench] = useState(isDM); // Toggle Bench Visibility
  const [showHpBars, setShowHpBars] = useState(true); // Toggle HP Bars Visibility

  // Dice Roller State
  const [diceCount, setDiceCount] = useState(1);
  const [diceType, setDiceType] = useState(20);
  const [diceMod, setDiceMod] = useState(0);
  const [diceResult, setDiceResult] = useState<string | number>('--');

  // Sync Logic
  const hasSyncedInitial = useRef(false);
  const lastKnownBgUrl = useRef<string | null>(null);

  useEffect(() => {
      if (propMapConfig) {
          if (!hasSyncedInitial.current) {
              setWeather(propMapConfig.weather || 'none');
              setGridScale(propMapConfig.scale || 1.5);
              setGridUnit(propMapConfig.unit || 'm');
              setGridColor(propMapConfig.gridColor || '#cccccc');
              setGridOpacity(propMapConfig.gridOpacity || 0.3);
              setGridStyle(propMapConfig.gridStyle || 'line');
              setTileSize(propMapConfig.tileSize || 32);
              setBackgroundImage(propMapConfig.bgUrl || null);
              lastKnownBgUrl.current = propMapConfig.bgUrl || null;
              if (propMapConfig.bgX !== undefined) {
                  setBgProps({ x: propMapConfig.bgX, y: propMapConfig.bgY || 0, scale: propMapConfig.bgScale || 1 });
              }
              setBgStretch(propMapConfig.bgStretch ?? false);
              hasSyncedInitial.current = true;
          } else {
              if (propMapConfig.weather !== weather) setWeather(propMapConfig.weather || 'none');
              if (propMapConfig.scale !== gridScale) setGridScale(propMapConfig.scale);
              if (propMapConfig.unit !== gridUnit) setGridUnit(propMapConfig.unit);
              if (propMapConfig.gridColor !== gridColor) setGridColor(propMapConfig.gridColor);
              if (propMapConfig.gridOpacity !== gridOpacity) setGridOpacity(propMapConfig.gridOpacity);
              if (propMapConfig.gridStyle !== gridStyle) setGridStyle(propMapConfig.gridStyle);
              if (propMapConfig.tileSize !== tileSize) setTileSize(propMapConfig.tileSize || 32);
              
              if (propMapConfig.bgUrl !== lastKnownBgUrl.current) {
                  setBackgroundImage(propMapConfig.bgUrl);
                  lastKnownBgUrl.current = propMapConfig.bgUrl;
              }

              if (propMapConfig.bgX !== bgProps.x || propMapConfig.bgY !== bgProps.y || propMapConfig.bgScale !== bgProps.scale) {
                  setBgProps({ x: propMapConfig.bgX, y: propMapConfig.bgY, scale: propMapConfig.bgScale });
              }
              if (propMapConfig.bgStretch !== bgStretch) setBgStretch(propMapConfig.bgStretch ?? false);
          }
      }
  }, [propMapConfig]);

  // Sync Local Grid Dimensions state with prop
  useEffect(() => {
    setMapDimW(gridW.toString());
    setMapDimH(gridH.toString());
  }, [gridW, gridH]);

  // Fetch dynamic maps from server
  useEffect(() => {
    const fetchDynamicMaps = async () => {
      try {
        const response = await fetch('/api/assets/maps');
        if (response.ok) {
          const data = await response.json();
          setDynamicMaps(data);
        }
      } catch (error) {
        console.error("Erro ao buscar mapas dinâmicos:", error);
      }
    };
    fetchDynamicMaps();
  }, []);

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
                  bgBrightness,
                  bgStretch,
                  weather
              }));
          }, 500); // 500ms debounce
          return () => clearTimeout(timeout);
      }
  }, [gridScale, gridUnit, gridColor, gridOpacity, gridStyle, backgroundImage, bgProps, weather, tileSize, bgBrightness, bgStretch]);

  // Resize Observer for Canvas
  useEffect(() => {
      if (!containerRef.current) return;
      const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
              setCanvasSize({ w: entry.contentRect.width, h: entry.contentRect.height });
          }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
  }, []);

  // Animation Loop
  useEffect(() => {
      if (weather === 'none' && !ping) return;
      
      let animId: number;
      const animate = () => {
          setTick(t => t + 1);
          if (ping && Date.now() - ping.t > 2000) setPing(null);
          animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animId);
  }, [ping, weather]);

  const resizeMap = (w: number, h: number) => {
      const newW = Math.max(10, w);
      const newH = Math.max(10, h);
      const newGrid = Array(newH).fill(null).map((_, y) => Array(newW).fill(null).map((_, x) => (y < gridH && x < gridW) ? mapGrid[y][x] : '⬜||'));
      const newFog = Array(newH).fill(null).map((_, y) => Array(newW).fill(null).map((_, x) => (y < gridH && x < gridW) ? fogGrid[y][x] : true));
      setMapGrid(newGrid);
      setFogGrid(newFog);
  };

  const handleApplyDimensions = () => {
      const w = parseInt(mapDimW) || 10;
      const h = parseInt(mapDimH) || 10;
      resizeMap(w, h);
  };

  const clearLayer = (layerIndex: number) => {
        if (setConfirmModal) {
            setConfirmModal({
                message: `Tem certeza que deseja limpar toda a Camada?`,
                onConfirm: () => {
                    const newGrid = mapGrid.map(row => row.map(cell => {
                        const parts = cell.split('|');
                        while(parts.length <= layerIndex) parts.push('');
                        if (layerIndex === 0) parts[0] = '⬜';
                        else parts[layerIndex] = '';
                        return parts.join('|');
                    }));
                    setMapGrid(newGrid);
                    saveToHistory(newGrid);
                }
            });
        } else {
            const newGrid = mapGrid.map(row => row.map(cell => {
                const parts = cell.split('|');
                while(parts.length <= layerIndex) parts.push('');
                if (layerIndex === 0) parts[0] = '⬜';
                else parts[layerIndex] = '';
                return parts.join('|');
            }));
            setMapGrid(newGrid);
            saveToHistory(newGrid);
        }
  };

  useEffect(() => {
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

          // Optimization: Use asset ID if it's a custom asset to save space in the grid
          let finalUrl = newUrl;
          const asset = Object.values(propCustomAssets).find(a => a.url === newUrl);
          if (asset) {
              finalUrl = `asset:${asset.id}`;
          }

          parts[layer] = `${finalUrl}${transformStr}`;
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
          console.warn("Não foi possível salvar a imagem. Ela está protegida contra edição (CORS) e o método de recuperação falhou."); 
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

  const resolveUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('asset:')) {
          const id = url.substring(6);
          const asset = propCustomAssets[id] || localAssetsRef.current[id];
          return asset ? asset.url : '';
      }
      return url;
  };

  const preloadImage = (url: string, attempt = 0) => {
      const resolved = resolveUrl(url);
      const cleanUrl = resolved;
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
          if (attempt === 0) preloadImage(url, 1);
          else failedImages.current.add(cleanUrl);
      };
      if (attempt === 0) imageCache.current[cleanUrl] = img;
  };

  useEffect(() => {
      mapGrid?.forEach(row => {
          row.forEach(cell => {
              if (cell) {
                  const parts = cell.split('|');
                  parts.forEach(p => {
                      const { url } = parseTileData(p);
                      if (url && url !== '⬜' && url !== 'VOID') preloadImage(url);
                  });
              }
          });
      });
      tokens.forEach((t: Token) => { 
          if (t.image) preloadImage(t.image); 
          if (t.frame) preloadImage(t.frame); // Preload Frames
      });
      tokenBench.forEach((t: Token) => { 
          if (t.image) preloadImage(t.image); 
          if (t.frame) preloadImage(t.frame); // Preload Frames
      });
      LIST_FRAMES.forEach(f => preloadImage(f)); // Preload All Frames on Mount
      if (backgroundImage) preloadImage(backgroundImage);
  }, [mapGrid, tokens, backgroundImage, tokenBench, propCustomAssets]);

  const getGridPos = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / zoom / tileSize);
    const y = Math.floor((e.clientY - rect.top - pan.y) / zoom / tileSize);
    return { x: Math.min(Math.max(0, x), gridW - 1), y: Math.min(Math.max(0, y), gridH - 1) };
  };

  const getExactGridPos = (e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom / tileSize;
    const y = (e.clientY - rect.top - pan.y) / zoom / tileSize;
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
      if (setConfirmModal) {
          setConfirmModal({
              message: "Limpar todo o mapa para Branco?",
              onConfirm: () => {
                  const g = Array(gridH).fill(null).map(()=>Array(gridW).fill('⬜||')); 
                  saveToHistory(g); 
              }
          });
      } else {
          const g = Array(gridH).fill(null).map(()=>Array(gridW).fill('⬜||')); 
          saveToHistory(g); 
      }
  };

  const clearToBackground = () => {
      if (setConfirmModal) {
          setConfirmModal({
              message: "Limpar todos os tiles desenhados (mantendo fundo)?",
              onConfirm: () => {
                  const g = Array(gridH).fill(null).map(() => Array(gridW).fill('⬜||'));
                  setMapGrid(g);
                  saveToHistory(g);
              }
          });
      } else {
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
            const newW = Math.ceil(img.naturalWidth / tileSize);
            const newH = Math.ceil(img.naturalHeight / tileSize);
            setMapDimW(newW.toString());
            setMapDimH(newH.toString());
            resizeMap(newW, newH);
            setBgProps(prev => ({ ...prev, scale: 1, x: 0, y: 0 }));
            setBgStretch(true);
        }
    }
  };

  const fillFog = (visible: boolean) => setFogGrid(Array(gridH).fill(null).map(() => Array(gridW).fill(!visible)));

  const registerCustomAsset = (url: string, name: string = 'Custom', type: 'upload' | 'edited' = 'upload') => {
      if (!url) return '';
      const directLink = url.startsWith('data:') ? url : convertDriveLink(url);
      const assetId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
      const newAsset: CustomAsset = { id: assetId, url: directLink, name: `${name}`, type: type };
      
      console.log("Registrando asset:", assetId, "Tipo:", type);
      
      // Armazena localmente para uso imediato antes da sincronização
      localAssetsRef.current[assetId] = newAsset;

      if (propSetCustomAssets) {
          propSetCustomAssets(prev => ({ ...prev, [assetId]: newAsset }));
      }
      if (onSyncAsset) {
          onSyncAsset(newAsset);
      }

      const assetToken = `asset:${assetId}`;
      
      // Forçamos a entrada no cache imediatamente usando o directLink (Base64)
      if (directLink.startsWith('data:')) {
          const img = new Image();
          img.onload = () => {
              imageCache.current[directLink] = img;
              console.log("Asset pré-carregado no cache com sucesso.");
          };
          img.src = directLink;
      } else {
          preloadImage(assetToken);
      }
      
      return assetToken;
  };

  const addCustomAsset = (url: string, name: string = 'Custom', type: 'upload' | 'edited' = 'upload') => {
      const assetToken = registerCustomAsset(url, name, type);
      if (!assetToken) return '';
      setSelectedTile(assetToken);
      setTool('pencil');
      if (type === 'edited') setAssetTab('edited'); else setAssetTab('upload');
      return assetToken;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingImage(true);
      console.log("Iniciando upload de ativo:", file.name);
      
      const reader = new FileReader();
      reader.onload = async (ev) => { 
          const result = ev.target?.result as string;
          if (!result) {
              console.error("Erro: Leitor de ativo retornou vazio.");
              setIsUploadingImage(false);
              return;
          }
          try {
              console.log("Processando ativo (sem compressão)...");
              addCustomAsset(result, file.name.split('.')[0], 'upload'); 
          } catch (err) {
              console.error("Erro no processamento do ativo:", err);
          } finally {
              setIsUploadingImage(false);
          }
      };
      reader.onerror = () => {
          console.error("Erro no FileReader (Ativo)");
          setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("Iniciando upload de mapa:", file.name);
    setIsUploadingImage(true);
    const reader = new FileReader();
    
    reader.onload = async (ev) => { 
      const result = ev.target?.result as string;
      if (!result) {
        console.error("Erro: Leitor de mapa retornou vazio.");
        setIsUploadingImage(false);
        return;
      }
      try {
        console.log("Mantendo mapa original (sem compressão)...");
        const dataUrl = result;
        
        // Registramos o asset mas NÃO selecionamos como pincel (usamos register e não add)
        const assetToken = registerCustomAsset(dataUrl, 'Background', 'upload');
        setBackgroundImage(assetToken);
        lastKnownBgUrl.current = assetToken; // Blindagem contra reversão de estado
        
        const img = new Image();
        img.onload = () => {
          const gridPixelW = gridW * tileSize;
          const scale = gridPixelW / img.naturalWidth;
          setBgProps({ x: 0, y: 0, scale: Number.isFinite(scale) ? scale : 1 });
          imageCache.current[dataUrl] = img;
          setIsUploadingImage(false);
          console.log("Mapa carregado com sucesso.");
        };
        img.onerror = () => {
          console.error("Erro ao carregar render do mapa.");
          setIsUploadingImage(false);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error("Erro crítico no processamento do mapa:", err);
        setIsUploadingImage(false);
      }
    };
    reader.onerror = () => {
      console.error("Erro no FileReader (Mapa)");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
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

  // --- TOKEN FUNCTIONS (Hoisted) ---
  const deleteToken = (id: number) => { setTokens(prev=>prev.filter(t=>t.id!==id)); setContextMenu(null); };
  const updateTokenSize = (id:number, delta:number) => setTokens(prev=>prev.map(t=>t.id===id ? {...t, size: Math.max(0.5, (t.size||1) + delta), width: Math.max(0.5, (t.width||1) + delta), height: Math.max(0.5, (t.height||1) + delta)} : t));
  const rotateToken = (id: number, deg: number) => setTokens(prev=>prev.map(t=>t.id===id ? {...t, rotation: ((t.rotation||0)+deg+360)%360} : t));
  const flipToken = (id: number, axis: 'x'|'y') => setTokens(prev=>prev.map(t=>t.id===id ? (axis==='x' ? {...t, flipX: !t.flipX} : {...t, flipY: !t.flipY}) : t));
  const openTokenEditor = (id:number) => { const t = tokens.find(tk=>tk.id===id); if(t) setEditingToken(t); setContextMenu(null); };
  const duplicateToken = (id:number) => { const t = tokens.find(tk=>tk.id===id); if(t) setTokens([...tokens, {...t, id:Date.now(), x:t.x+1, y:t.y+1}]); setContextMenu(null); };
  const toggleTokenMarker = (id:number, color:string) => setTokens(prev => prev.map(t => t.id === id ? { ...t, markers: t.markers?.includes(color) ? t.markers.filter(c=>c!==color) : [...(t.markers||[]), color] } : t));
  const toggleTokenLock = (id: number) => setTokens(prev => prev.map(t => t.id === id ? { ...t, locked: !t.locked } : t));
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
  const handleTokenImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
      const file = e.target.files?.[0]; 
      if (file && editingToken) { 
          const r = new FileReader(); 
          r.onload = async (ev) => { 
              if (ev.target?.result) {
                  const result = ev.target.result as string;
                  console.log("Adicionando imagem do token (sem compressão)...");
                  const assetToken = addCustomAsset(result, 'Token', 'upload');
                  setEditingToken({ ...editingToken, image: assetToken }); 
              }
          }; 
          r.readAsDataURL(file); 
      }
  };
  const addTokenToBench = (isProp: boolean = false) => { setTokenBench([...tokenBench, {id: Date.now(), x: 0, y: 0, icon: isProp ? '' : '💀', hp: isProp ? 0 : 10, max: isProp ? 0 : 10, color: isProp ? 'transparent' : '#ef4444', size: isProp ? 1 : 2, width: isProp ? 1 : 2, height: isProp ? 1 : 2, name: isProp ? 'Objeto' : 'Monstro', isProp }]); setShowBench(true); };
  const handleAddPropFromSelection = () => { if (!selectedTile) return; setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '', image: selectedTile, hp: 10, max: 10, color: 'transparent', size: Math.max(assetDims.w, assetDims.h), width: assetDims.w, height: assetDims.h, name: 'Objeto', isProp: true, rotation: assetTransform.r, flipX: assetTransform.fx, flipY: assetTransform.fy }]); setShowBench(true); };
  
  const importCharacterToBench = (char: Character) => { 
      let finalImg = char.imageUrl;
      if (finalImg && finalImg.startsWith('data:')) {
          finalImg = registerCustomAsset(finalImg, char.name, 'upload');
      }
      setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '👤', image: finalImg, hp: char.hp.current, max: char.hp.max, ac: char.ac, color: '#3b82f6', size: 2, width: 2, height: 2, name: char.name, isProp: false, linkedId: char.id, linkedType: 'character' }]); 
      setShowBench(true);
  };
  const importMonsterToBench = (mon: Monster) => { 
      let finalImg = mon.imageUrl;
      if (finalImg && finalImg.startsWith('data:')) {
          finalImg = registerCustomAsset(finalImg, mon.name, 'upload');
      }
      setTokenBench([...tokenBench, { id: Date.now(), x: 0, y: 0, icon: '💀', image: finalImg, hp: mon.hp, max: mon.hp, ac: mon.ac, color: '#ef4444', size: 2, width: 2, height: 2, name: mon.name, isProp: false, linkedId: mon.id, linkedType: 'monster' }]); 
      setShowBench(true);
  };
  
  const removeTokenFromBench = (id: number) => { setTokenBench(prev => prev.filter(t => t.id !== id)); setContextMenu(null); };
  
  const saveTokenBench = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tokenBench));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "token_bench.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const loadTokenBench = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const loaded = JSON.parse(event.target?.result as string);
              if (Array.isArray(loaded)) {
                  setTokenBench(loaded);
              }
          } catch (err) {
              console.error("Failed to parse token bench JSON", err);
              console.warn("Arquivo de tokens inválido.");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
  };

  const handleLinkChange = (type: 'character' | 'monster', id: string) => { 
      if (!editingToken) return; 
      let name = editingToken.name || ''; 
      let hp = editingToken.hp; 
      let max = editingToken.max; 
      let ac = editingToken.ac; 
      let image = editingToken.image;

      if (type === 'character') { 
          const c = characters.find(char => char.id === id); 
          if (c) { 
              name = c.name; hp = c.hp.current; max = c.hp.max; ac = c.ac; 
              if (c.imageUrl) image = c.imageUrl;
          } 
      } else { 
          const m = monsters.find(mon => mon.id === Number(id)); 
          if (m) { 
              name = m.name; hp = m.hp; max = m.hp; ac = m.ac; 
              if (m.imageUrl) image = m.imageUrl;
          } 
      } 
      setEditingToken({ ...editingToken, linkedType: type, linkedId: id, name, hp, max, ac: ac || 10, image }); 
  };
  
  const rotateAsset = (deg: number) => setAssetTransform(prev => ({...prev, r: (prev.r + deg + 360) % 360 }));
  const resetTransform = () => { setAssetTransform({ r: 0, fx: false, fy: false }); setAssetDims({w: 1, h: 1}); };

  // --- DRAW FUNCTIONS ---

  const drawToken = (ctx: CanvasRenderingContext2D, token: Token) => {
      const tx = token.x * tileSize;
      const ty = token.y * tileSize;
      const tw = (token.width || token.size || 1) * tileSize;
      const th = (token.height || token.size || 1) * tileSize;
      
      ctx.save();
      ctx.translate(tx + tw/2, ty + th/2);
      ctx.rotate((token.rotation || 0) * Math.PI / 180);
      ctx.scale(token.flipX ? -1 : 1, token.flipY ? -1 : 1);
      
      const tokenImageUrl = token.image ? resolveUrl(token.image) : '';
      
      if (tokenImageUrl) {
          if (imageCache.current[tokenImageUrl] && imageCache.current[tokenImageUrl].complete && imageCache.current[tokenImageUrl].naturalWidth > 0) {
              // Exibir imagem completa com suporte a imageConfig
              const config = token.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 };
              ctx.save();
              // Clipping mask for the token area
              ctx.beginPath();
              if (!token.isProp) {
                  ctx.arc(0, 0, Math.min(tw, th)/2, 0, Math.PI*2);
              } else {
                  ctx.rect(-tw/2, -th/2, tw, th);
              }
              ctx.clip();

              const img = imageCache.current[tokenImageUrl];
              const imgW = img.naturalWidth;
              const imgH = img.naturalHeight;
              const imgRatio = imgW / imgH;
              const tokenRatio = tw / th;

              let drawW = tw;
              let drawH = th;
              let offsetX = -tw/2;
              let offsetY = -th/2;

              // Only apply framing transformations if it's a prop
              // For characters/monsters, the user wants the "whole" image to appear in the token
              if (token.isProp) {
                  ctx.translate(config.x * tw / 100, config.y * th / 100);
                  ctx.scale(config.scale, config.scale);
                  ctx.rotate((config.rotation || 0) * Math.PI / 180);
              } else {
                  // For characters, ensure the whole image fits inside the token area (contain)
                  if (imgRatio > tokenRatio) {
                      drawH = tw / imgRatio;
                      offsetY = -drawH / 2;
                  } else {
                      drawW = th * imgRatio;
                      offsetX = -drawW / 2;
                  }
              }

              ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
              ctx.restore();
          } else if (failedImages.current.has(tokenImageUrl)) {
              // Missing texture placeholder
              ctx.fillStyle = '#ff00ff';
              ctx.fillRect(-tw/2, -th/2, tw/2, th/2);
              ctx.fillRect(0, 0, tw/2, th/2);
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, -th/2, tw/2, th/2);
              ctx.fillRect(-tw/2, 0, tw/2, th/2);
          } else {
              ctx.fillStyle = token.color || '#ccc';
              if (!token.isProp) {
                  ctx.beginPath(); ctx.arc(0, 0, Math.min(tw, th)/2, 0, Math.PI*2); ctx.fill();
              } else {
                  ctx.fillRect(-tw/2, -th/2, tw, th);
              }
          }
      } else {
          ctx.fillStyle = token.color;
          if (!token.isProp) {
              ctx.beginPath(); ctx.arc(0, 0, Math.min(tw, th)/2, 0, Math.PI*2); ctx.fill();
          } else {
              ctx.fillRect(-tw/2, -th/2, tw, th);
          }
          ctx.fillStyle = '#fff';
          ctx.font = `${Math.min(tw, th)/2}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(token.icon || token.name?.substring(0,1) || '?', 0, 0);
      }
      
      // Draw Frame over Token if exists
      if (token.frame) {
          if (imageCache.current[token.frame]) {
              // Draw frame slightly larger to encompass the token
              const fw = tw * 1.3;
              const fh = th * 1.3;
              ctx.drawImage(imageCache.current[token.frame], -fw/2, -fh/2, fw, fh);
          }
      }

      ctx.restore();

      if (selectedTokenIds.includes(token.id)) {
          ctx.strokeStyle = '#ffb74d';
          ctx.lineWidth = 2;
          ctx.strokeRect(tx, ty, tw, th);
      }

      // ACTIVE TURN INDICATOR
      if (activeTokenIds && activeTokenIds.includes(token.id)) {
          const time = Date.now() / 500;
          const pulsing = 3 + Math.sin(time) * 1.5;
          
          ctx.beginPath();
          // Retângulo pulsante ao redor do token quadrado
          ctx.rect(tx, ty, tw, th);
          ctx.strokeStyle = '#22c55e'; // Green
          ctx.lineWidth = pulsing;
          ctx.stroke();
      }
      
      if (token.auraRadius && token.auraRadius > 0) {
          ctx.beginPath();
          const radiusPixels = (token.auraRadius / gridScale) * tileSize;
          ctx.arc(tx + tw/2, ty + th/2, radiusPixels, 0, Math.PI*2);
          ctx.fillStyle = (token.auraColor || '#FFC800') + '33';
          ctx.fill();
          ctx.strokeStyle = (token.auraColor || '#FFC800') + '88';
          ctx.lineWidth = 1;
          ctx.stroke();
      }
      
      if (token.markers && token.markers.length > 0) {
          token.markers.forEach((m, i) => {
              ctx.beginPath();
              ctx.arc(tx + tw - 5 - (i*8), ty + 5, 3, 0, Math.PI*2);
              ctx.fillStyle = m;
              ctx.fill();
          });
      }

      // DRAW CONDITIONS
      if (token.conditions && token.conditions.length > 0) {
          ctx.font = `${Math.max(10, tileSize * 0.4)}px Arial`;
          ctx.textAlign = 'right';
          token.conditions.forEach((cond, i) => {
              const icon = CONDITION_ICONS[cond] || '🔹';
              ctx.fillText(icon, tx + tw - 2, ty + th - 2 - (i * (tileSize * 0.45)));
          });
      }

      // DRAW INSPIRATION
      if (token.inspiration) {
          ctx.fillStyle = '#facc15'; // Yellow
          ctx.font = `${Math.max(12, tileSize * 0.5)}px Arial`;
          ctx.textAlign = 'left';
          ctx.fillText('⭐', tx + 2, ty + th - 2);
      }

      // DRAW HP BAR
      if (showHpBars && !token.isProp && token.hp !== undefined && token.max > 0) {
          const hpRoll = Math.min(1, Math.max(0, token.hp / token.max));
          const barW = tw * 0.8;
          const barH = Math.max(4, tileSize * 0.15);
          const barX = tx + (tw - barW) / 2;
          const barY = ty + th + 2;

          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(barX, barY, barW, barH);
          
          ctx.fillStyle = hpRoll > 0.5 ? '#22c55e' : hpRoll > 0.2 ? '#eab308' : '#ef4444';
          ctx.fillRect(barX, barY, barW * hpRoll, barH);
          
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.strokeRect(barX, barY, barW, barH);
      }
  };

  const drawWeather = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (weather === 'none') return;
      
      if (particlesRef.current.length === 0 || particlesRef.current[0].type !== weather) {
          particlesRef.current = [];
          for(let i=0; i<100; i++) {
              particlesRef.current.push({
                  x: Math.random() * width,
                  y: Math.random() * height,
                  speed: Math.random() * 2 + 1,
                  size: Math.random() * 2 + 1,
                  type: weather
              });
          }
      }

      ctx.save();
      // Reset transform to draw weather in screen space (overlay)
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      
      particlesRef.current.forEach(p => {
          p.y += p.speed;
          if (p.y > height) p.y = 0;
          
          if (weather === 'rain') {
              ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - 1, p.y + 5);
              ctx.stroke();
          } else if (weather === 'snow') {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
              ctx.fill();
          } else if (weather === 'ember') {
              ctx.fillStyle = `rgba(255, ${Math.random()*100}, 0, ${Math.random()})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
              ctx.fill();
          }
      });
      ctx.restore();
  };

  const renderScene = (ctx: CanvasRenderingContext2D, width: number, height: number, exportMode: boolean = false) => {
      // 1. Reset Transform & Clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // 2. Draw Background (Dark)
      ctx.fillStyle = '#0a0a10';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // 3. Apply Camera Transform
      if (exportMode) {
          // For export, we draw exactly 1:1 of the map size without zoom/pan
      } else {
          ctx.translate(pan.x, pan.y);
          ctx.scale(zoom, zoom);
      }

      // 4. Draw Custom Background Image
      const bgUrl = backgroundImage ? resolveUrl(backgroundImage) : '';
      if (bgUrl && imageCache.current[bgUrl]) {
          const img = imageCache.current[bgUrl];
          if (img.naturalWidth > 0) {
             ctx.save();
             // Apply Brightness Filter
             if (bgBrightness !== 100) {
                 ctx.filter = `brightness(${bgBrightness}%)`;
             }
             
             if (bgStretch) {
                 // Stretch to fit the entire grid exactly
                 ctx.drawImage(img, 0, 0, gridW * tileSize, gridH * tileSize);
             } else {
                 // Free transform mode
                 const dw = img.naturalWidth * bgProps.scale;
                 const dh = img.naturalHeight * bgProps.scale;
                 ctx.drawImage(img, bgProps.x, bgProps.y, dw, dh);
             }
             ctx.restore();
          }
      }

      const drawTileAt = (c: number, r: number, cellData: string) => {
          if (!cellData) return;
          const parts = cellData.split('|');
          parts.forEach((part, layerIndex) => {
              if (!part) return;
              const { url: rawUrl, r: rotation, fx, fy } = parseTileData(part);
              const url = resolveUrl(rawUrl);
              
              // REMOVED: White Fill Logic for VOID/Square
              if (url === '⬜' || url === 'VOID') {
                  return; 
              }

              const cx = c * tileSize + tileSize / 2;
              const cy = r * tileSize + tileSize / 2;

              if (imageCache.current[url]) {
                  const img = imageCache.current[url];
                  ctx.save();
                  ctx.translate(cx, cy);
                  ctx.rotate((rotation * Math.PI) / 180);
                  ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
                  
                  if (img.complete && img.naturalWidth > 0) {
                      ctx.drawImage(img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                  } else if (failedImages.current.has(url)) {
                      // Missing texture placeholder
                      ctx.fillStyle = '#ff00ff';
                      ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize / 2, tileSize / 2);
                      ctx.fillRect(0, 0, tileSize / 2, tileSize / 2);
                      ctx.fillStyle = '#000000';
                      ctx.fillRect(0, -tileSize / 2, tileSize / 2, tileSize / 2);
                      ctx.fillRect(-tileSize / 2, 0, tileSize / 2, tileSize / 2);
                  }
                  ctx.restore();
              } else if (failedImages.current.has(url)) {
                  ctx.save();
                  ctx.translate(cx, cy);
                  ctx.rotate((rotation * Math.PI) / 180);
                  ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
                  ctx.fillStyle = '#ff00ff';
                  ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize / 2, tileSize / 2);
                  ctx.fillRect(0, 0, tileSize / 2, tileSize / 2);
                  ctx.fillStyle = '#000000';
                  ctx.fillRect(0, -tileSize / 2, tileSize / 2, tileSize / 2);
                  ctx.fillRect(-tileSize / 2, 0, tileSize / 2, tileSize / 2);
                  ctx.restore();
              }
          });
      };

      // Viewport culling for performance
      let startX = 0, endX = gridW - 1;
      let startY = 0, endY = gridH - 1;
      
      if (!exportMode) {
          startX = Math.max(0, Math.floor(-pan.x / (zoom * tileSize)));
          endX = Math.min(gridW - 1, Math.ceil((width / zoom - pan.x / zoom) / tileSize));
          startY = Math.max(0, Math.floor(-pan.y / (zoom * tileSize)));
          endY = Math.min(gridH - 1, Math.ceil((height / zoom - pan.y / zoom) / tileSize));
      }

      for (let y = startY; y <= endY; y++) {
          if (!mapGrid[y]) continue; 
          for (let x = startX; x <= endX; x++) {
              drawTileAt(x, y, mapGrid[y][x]);
          }
      }

      if (showGrid) {
          ctx.strokeStyle = gridColor;
          ctx.globalAlpha = gridOpacity;
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (gridStyle === 'line') {
              for (let x = startX; x <= endX + 1; x++) { 
                  if (x <= gridW) {
                      ctx.moveTo(x * tileSize, startY * tileSize); 
                      ctx.lineTo(x * tileSize, Math.min(gridH, endY + 1) * tileSize); 
                  }
              }
              for (let y = startY; y <= endY + 1; y++) { 
                  if (y <= gridH) {
                      ctx.moveTo(startX * tileSize, y * tileSize); 
                      ctx.lineTo(Math.min(gridW, endX + 1) * tileSize, y * tileSize); 
                  }
              }
          } else {
              for (let y = startY; y <= endY + 1; y++) {
                  if (y <= gridH) {
                      for (let x = startX; x <= endX + 1; x++) { 
                          if (x <= gridW) {
                              ctx.rect(x*tileSize-1, y*tileSize-1, 2, 2); 
                          }
                      }
                  }
              }
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0;
      }

      tokens.filter(t => t.isBackground).forEach(token => drawToken(ctx, token));
      tokens.filter(t => !t.isBackground).forEach(token => drawToken(ctx, token));

      if (measureStart && measureEnd && (tool === 'ruler' || tool === 'measure-circle' || tool === 'measure-cone' || tool === 'measure-cube') && !exportMode) {
          const sx = measureStart.x * tileSize;
          const sy = measureStart.y * tileSize;
          const ex = measureEnd.x * tileSize;
          const ey = measureEnd.y * tileSize;
          const dx = measureEnd.x - measureStart.x;
          const dy = measureEnd.y - measureStart.y;
          const distanceSquares = Math.round(Math.hypot(dx, dy) * 10) / 10;
          const distanceMeters = (distanceSquares * 1.5).toFixed(1);

          ctx.save();
          ctx.strokeStyle = '#3b82f6';
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.lineWidth = 4 / zoom;

          if (tool === 'ruler') {
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(ex, ey);
              ctx.stroke();
          } else if (tool === 'measure-circle') {
              const radius = Math.hypot(ex - sx, ey - sy);
              ctx.beginPath();
              ctx.arc(sx, sy, radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(ex, ey);
              ctx.stroke();
          } else if (tool === 'measure-cone') {
              const angle = Math.atan2(ey - sy, ex - sx);
              const radius = Math.hypot(ex - sx, ey - sy);
              const coneAngle = Math.PI / 3; // 60 degrees
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.arc(sx, sy, radius, angle - coneAngle / 2, angle + coneAngle / 2);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
          } else if (tool === 'measure-cube') {
              const width = Math.abs(ex - sx);
              const height = Math.abs(ey - sy);
              const minX = Math.min(sx, ex);
              const minY = Math.min(sy, ey);
              ctx.beginPath();
              ctx.rect(minX, minY, width, height);
              ctx.fill();
              ctx.stroke();
          }

          ctx.translate(ex + (15/zoom), ey - (15/zoom));
          ctx.scale(1/zoom, 1/zoom); 
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(0, -24, 110, 32);
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(`${distanceSquares} Q | ${distanceMeters}m`, 8, -4);
          ctx.restore();
      }

      if (showFog && !exportMode) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
          for (let y = startY; y <= endY; y++) {
              if (y < gridH) {
                  for (let x = startX; x <= endX; x++) {
                      if (x < gridW && fogGrid[y] && fogGrid[y][x]) {
                          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                      }
                  }
              }
          }
      }
      
      if (ping && !exportMode) {
          const px = ping.x * tileSize;
          const py = ping.y * tileSize;
          ctx.beginPath();
          ctx.arc(px, py, 20 + Math.sin(Date.now() / 100) * 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 3;
          ctx.stroke();
      }

      if (weather !== 'none' && !exportMode) {
          // Weather draws in screen space, handled inside function
          drawWeather(ctx, ctx.canvas.width, ctx.canvas.height);
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
            console.warn("Não foi possível exportar o mapa devido a restrições de segurança (imagens externas protegidas/CORS).");
            console.error(e);
        }
    }
  };

  // --- HANDLERS ---

  const handleMouseDown = (e: React.MouseEvent) => {
      if (contextMenu) setContextMenu(null);
      if (tool === 'hand' || e.button === 1 || e.button === 2) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          return;
      }
      if (e.button !== 0) return;
      if(e.altKey || tool === 'ping') { setPing({ ...getExactGridPos(e), t: Date.now() }); return; }
      
      const p = getGridPos(e);
      const exactP = getExactGridPos(e);
      if(tool==='move') { 
          if (permissions && !permissions.canMoveTokens) return; // Permissions check
          const targetTokens = tokens.filter(t => editLayer === 'background' ? t.isBackground : !t.isBackground);
          const t = [...targetTokens].reverse().find(tk => {
              const w = tk.width || tk.size || 1;
              const h = tk.height || tk.size || 1;
              return exactP.x >= tk.x && exactP.x < tk.x + w && exactP.y >= tk.y && exactP.y < tk.y + h;
          });
          if(t) { 
              let newSelection = selectedTokenIds;
              if (e.shiftKey || e.ctrlKey) {
                  if (selectedTokenIds.includes(t.id)) {
                      newSelection = selectedTokenIds.filter(id => id !== t.id);
                  } else {
                      newSelection = [...selectedTokenIds, t.id];
                  }
              } else {
                  if (!selectedTokenIds.includes(t.id)) {
                      newSelection = [t.id];
                  }
              }
              setSelectedTokenIds(newSelection); 
              setPrimaryDragTokenId(t.id);
              setIsDraggingToken(true); 
              setDragOffset({ x: exactP.x - t.x, y: exactP.y - t.y });
              
              const startPos: Record<number, {x: number, y: number}> = {};
              tokens.forEach(tk => {
                  if (newSelection.includes(tk.id)) {
                      startPos[tk.id] = { x: tk.x, y: tk.y };
                  }
              });
              setDragStartPositions(startPos);
          } else { 
              if (!e.shiftKey && !e.ctrlKey) {
                  setSelectedTokenIds([]); 
                  setPrimaryDragTokenId(null);
              }
          }
          return;
      }
      if (tool === 'pencil' && placeMode === 'object' && selectedTile) {
          const w = assetDims.w;
          const h = assetDims.h;
          const newToken: Token = {
              id: Date.now(),
              x: exactP.x - w / 2, y: exactP.y - h / 2, icon: '', image: selectedTile, hp: 10, max: 10, color: 'transparent',
              size: Math.max(assetDims.w, assetDims.h), width: assetDims.w, height: assetDims.h,
              name: 'Objeto', isProp: true, rotation: assetTransform.r, flipX: assetTransform.fx, flipY: assetTransform.fy,
              isBackground: editLayer === 'background'
          };
          setTokens(prev => [...prev, newToken]);
          return; 
      }
      if (tool === 'ruler' || tool === 'measure-circle' || tool === 'measure-cone' || tool === 'measure-cube') {
          setMeasureStart(exactP);
          setMeasureEnd(exactP);
          setIsDrawing(true);
          return;
      }
      setIsDrawing(true); setStartPos(p);
      if(tool==='pencil'||tool==='eraser') drawTile(p.x, p.y);
      else if(tool==='fill') { 
          const parts = mapGrid[p.y]?.[p.x]?.split('|') || ['']; 
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
      if (isDraggingToken && primaryDragTokenId !== null && tool === 'move') {
          if (permissions && !permissions.canMoveTokens) return; // Permissions check
          const primaryStart = dragStartPositions[primaryDragTokenId];
          if (!primaryStart) return;
          const newPrimaryX = p.x - dragOffset.x;
          const newPrimaryY = p.y - dragOffset.y;
          const dx = newPrimaryX - primaryStart.x;
          const dy = newPrimaryY - primaryStart.y;

          setTokens(prev => prev.map((t: Token) => {
              if (selectedTokenIds.includes(t.id) && dragStartPositions[t.id]) {
                  return { ...t, x: dragStartPositions[t.id].x + dx, y: dragStartPositions[t.id].y + dy };
              }
              return t;
          }));
          return;
      }
      if (isDrawing && (tool === 'ruler' || tool === 'measure-circle' || tool === 'measure-cone' || tool === 'measure-cube')) {
          setMeasureEnd(p);
          return;
      }
      if(!isDrawing) return;
      if(tool === 'pencil' && placeMode === 'object') return;
      if(tool==='pencil'||tool==='eraser') drawTile(Math.floor(p.x), Math.floor(p.y));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
      if(isPanning) { setIsPanning(false); return; }
      if(isDraggingToken) { 
          if (permissions && !permissions.canMoveTokens) {
              setIsDraggingToken(false);
              return;
          }
          setIsDraggingToken(false); 
          return; 
      }
      if(!isDrawing) return;
      if (tool === 'ruler' || tool === 'measure-circle' || tool === 'measure-cone' || tool === 'measure-cube') {
          setIsDrawing(false);
          setMeasureStart(null);
          setMeasureEnd(null);
          return;
      }
      setIsDrawing(false);
      const end = getGridPos(e);
      if(startPos) {
          if(tool==='rect'||tool==='line') { 
              const nG = JSON.parse(JSON.stringify(mapGrid));
              const x1=Math.min(startPos.x, end.x), x2=Math.max(startPos.x, end.x);
              const y1=Math.min(startPos.y, end.y), y2=Math.max(startPos.y, end.y);
              if (tool==='rect') {
                  for(let y=y1; y<=y2; y++) for(let x=x1; x<=x2; x++) if(nG[y] && nG[y][x]) nG[y][x] = mergeCell(nG[y][x], selectedTile, activeLayer);
              } else {
                  let x0=startPos.x, y0=startPos.y, dx=Math.abs(end.x-x0), dy=Math.abs(end.y-y0), sx=x0<end.x?1:-1, sy=y0<end.y?1:-1, err=dx-dy;
                  while(true){ if(nG[y0] && nG[y0][x0]) nG[y0][x0]=mergeCell(nG[y0][x0], selectedTile, activeLayer); if(x0===end.x && y0===end.y)break; const e2=2*err; if(e2>-dy){err-=dy;x0+=sx;} if(e2<dx){err+=dx;y0+=sy;} }
              }
              setMapGrid(nG); saveToHistory(nG);
          } else if (tool === 'pencil' || tool === 'eraser') {
              saveToHistory(latestMapGridRef.current);
          }
          if(tool==='fog-hide') toggleFogArea(startPos, end, true);
          if(tool==='fog-reveal') toggleFogArea(startPos, end, false);
      }
      setStartPos(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (permissions && !permissions.canEditCharacters) return; // Permissions check
      const p = getGridPos(e);
      const targetTokens = tokens.filter(t => editLayer === 'background' ? t.isBackground : !t.isBackground);
      const t = [...targetTokens].reverse().find(tk => {
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
      if (permissions && !permissions.canEditCharacters) return; // Permissions check
      const exactP = getExactGridPos(e);
      const targetTokens = tokens.filter(t => editLayer === 'background' ? t.isBackground : !t.isBackground);
      const t = [...targetTokens].reverse().find(tk => {
          const w = tk.width || tk.size || 1;
          const h = tk.height || tk.size || 1;
          return exactP.x >= tk.x && exactP.x < tk.x + w && exactP.y >= tk.y && exactP.y < tk.y + h;
      });
      if (t) {
          openTokenEditor(t.id);
      } else {
          setSelectedTokenIds([]);
          setPrimaryDragTokenId(null);
          if (tool === 'hand' || isGameMode) {
              setPing({ ...exactP, t: Date.now() });
          }
      }
  };

  const handleBenchDragStart = (e: React.DragEvent, token: Token) => {
      e.dataTransfer.setData('tokenData', JSON.stringify(token));
      e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (permissions && !permissions.canEditCharacters) {
          e.dataTransfer.dropEffect = 'none';
          return;
      }
      e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (permissions && !permissions.canEditCharacters) return; // Permissions check
      
      // Handle combatant drop from DMTools
      const combatantData = e.dataTransfer.getData('application/x-rpg-combatant');
      if (combatantData) {
          try {
              const participant = JSON.parse(combatantData);
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              
              const exactX = (e.clientX - rect.left - pan.x) / zoom / tileSize;
              const exactY = (e.clientY - rect.top - pan.y) / zoom / tileSize;
              
              const newToken: Token = {
                  id: Date.now(),
                  x: Math.floor(exactX),
                  y: Math.floor(exactY),
                  icon: '',
                  image: participant.imageUrl || '',
                  hp: participant.hpCurrent,
                  max: participant.hpMax,
                  color: 'transparent',
                  size: 1,
                  width: 1,
                  height: 1,
                  name: participant.name,
                  linkedId: participant.uid,
                  isProp: false
              };
              
              setTokens([...tokens, newToken]);
              return;
          } catch (err) {
              console.error("Erro ao processar drop de combatente:", err);
          }
      }
      
      // Handle image file drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = async (ev) => {
                  if (ev.target?.result) {
                      const compressed = ev.target.result as string;
                      const assetToken = addCustomAsset(compressed, file.name, 'upload');
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      const exactX = (e.clientX - rect.left - pan.x) / zoom / tileSize;
                      const exactY = (e.clientY - rect.top - pan.y) / zoom / tileSize;
                      
                      // Ask user if they want to add as token or background
                      if (setConfirmModal) {
                          setConfirmModal({
                              message: "Deseja adicionar esta imagem como Token ou Fundo do Mapa?",
                              onConfirm: () => {
                                  setTokens([...tokens, {
                                      id: Date.now(),
                                      x: exactX - 1,
                                      y: exactY - 1,
                                      icon: '',
                                      image: assetToken,
                                      hp: 10,
                                      max: 10,
                                      color: 'transparent',
                                      size: 2,
                                      width: 2,
                                      height: 2,
                                      name: file.name.split('.')[0],
                                      isProp: true,
                                      isBackground: editLayer === 'background'
                                  }]);
                              },
                              onCancel: () => {
                                  setBackgroundImage(assetToken);
                              }
                          });
                      }
                  }
              };
              reader.readAsDataURL(file);
              return;
          }
      }

      const tokenDataStr = e.dataTransfer.getData('tokenData');
      if (tokenDataStr) {
          const tokenTemplate = JSON.parse(tokenDataStr) as Token;
          if (!canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const exactX = (e.clientX - rect.left - pan.x) / zoom / tileSize;
          const exactY = (e.clientY - rect.top - pan.y) / zoom / tileSize;
          
          const w = tokenTemplate.width || tokenTemplate.size || 1;
          const h = tokenTemplate.height || tokenTemplate.size || 1;
          
          const newToken: Token = { 
              ...tokenTemplate, 
              id: Date.now(), 
              x: exactX - w / 2, 
              y: exactY - h / 2,
              isBackground: editLayer === 'background'
          };
          setTokens(prev => [...prev, newToken]);
      }
  };

  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheelNative = (e: WheelEvent) => {
          e.preventDefault();
          const isPinch = e.ctrlKey;
          const isTrackpad = Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) < 40;
          if (isPinch) {
              const rect = container.getBoundingClientRect();
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
              const rect = container.getBoundingClientRect();
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

      container.addEventListener('wheel', handleWheelNative, { passive: false });
      return () => container.removeEventListener('wheel', handleWheelNative);
  }, [zoom, pan]);

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

  const getSelectedTokenHUD = () => {
      if (selectedTokenIds.length === 0 || !canvasRef.current) return null;
      
      if (selectedTokenIds.length === 1) {
          const token = tokens.find(t => t.id === selectedTokenIds[0]);
          if (!token) return null;
          if (editLayer === 'token' && token.isBackground) return null;
          if (editLayer === 'background' && !token.isBackground) return null;

          const screenX = (token.x * tileSize * zoom) + pan.x;
          const screenY = (token.y * tileSize * zoom) + pan.y;
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
      } else {
          const firstToken = tokens.find(t => t.id === selectedTokenIds[0]);
          if (!firstToken) return null;
          const screenX = (firstToken.x * tileSize * zoom) + pan.x;
          const screenY = (firstToken.y * tileSize * zoom) + pan.y;
          const w = (firstToken.width || 1) * tileSize * zoom;
          
          return (
              <div 
                className="absolute z-40 bg-[#1a1a24] border border-[#333] rounded-lg shadow-xl p-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2"
                style={{ left: screenX + w / 2, top: screenY - 50, transform: 'translateX(-50%)' }}
              >
                  <span className="px-2 py-1 text-xs text-stone-400 font-bold">{selectedTokenIds.length} selecionados</span>
                  <div className="w-px bg-[#333] mx-0.5"></div>
                  <button onClick={() => {
                      setTokens(prev => prev.filter(t => !selectedTokenIds.includes(t.id)));
                      setSelectedTokenIds([]);
                  }} className="p-1.5 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300 flex items-center gap-1" title="Excluir Todos"><Trash2 size={14}/> Excluir</button>
              </div>
          );
      }
  };

  useEffect(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if(ctx && canvasRef.current) renderScene(ctx, canvasRef.current.width, canvasRef.current.height, false);
  }, [mapGrid, zoom, pan, tokens, selectedTokenIds, tool, mousePos, startPos, showGrid, gridColor, gridOpacity, gridStyle, showFog, fogGrid, tick, backgroundImage, isDraggingToken, tokenBench, assetDims, placeMode, tileSize, gridScale, gridUnit, bgProps, gridW, gridH, assetTransform, weather, ping, activeTokenIds, editLayer]);

  // Viewport resize handling
  useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;
      const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
              if (canvasRef.current) {
                  canvasRef.current.width = entry.contentRect.width;
                  canvasRef.current.height = entry.contentRect.height;
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) renderScene(ctx, entry.contentRect.width, entry.contentRect.height, false);
              }
          }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
  }, [containerRef]);

  return (
    <div className="flex h-full bg-[#0a0a10] text-[#e8e8ff] font-lato overflow-hidden relative" onContextMenu={e => e.preventDefault()}>
        {isDM && !sidebarOpen && ( <button onClick={() => setSidebarOpen(true)} className="absolute top-4 right-4 z-30 p-2 bg-[#181822] border border-[#444] rounded-lg text-[#ffb74d] hover:bg-[#252535] shadow-lg opacity-80 hover:opacity-100"><ChevronLeft size={20} /></button> )}
        
        <div className="flex-1 relative overflow-hidden bg-[#0a0a10]" ref={containerRef}>
            {getSelectedTokenHUD()}
            
            {/* FLOATING VTT HUD (PC/MOBILE) */}
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 animate-in slide-in-from-left duration-300 pointer-events-none md:top-6 md:left-6">
                <div className="bg-[#1a1a1d]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto p-1.5 gap-1 w-12 md:w-14">
                    <button onClick={exportMap} className="p-2 md:p-2.5 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300 transition-colors rounded-xl" title="Exportar Mapa / Salvar">
                        <Download size={20}/>
                    </button>
                    <button onClick={() => setShowHpBars(!showHpBars)} className={`p-2 md:p-2.5 rounded-xl transition-all ${showHpBars ? 'text-red-500 hover:bg-red-950/20 shadow-md' : 'text-stone-500 hover:text-white hover:bg-white/5'}`} title={showHpBars ? "Ocultar Barras de Vida" : "Mostrar Barras de Vida"}>
                        {showHpBars ? <Heart size={20} fill="currentColor" /> : <HeartOff size={20} />}
                    </button>
                    <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
                    
                    {/* Player Tools (Always visible) */}
                    <button onClick={() => setTool('move')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'move' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Mover Tokens">
                        <Move size={20}/>
                    </button>
                    <button onClick={() => setTool('hand')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'hand' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Mover Mapa (Pan)">
                        <Hand size={20}/>
                    </button>
                    <button onClick={() => setTool('ping')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'ping' ? 'bg-red-500 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Ping (Sinalizar)">
                        <Target size={20}/>
                    </button>
                    <button onClick={() => setTool('ruler')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'ruler' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Medir Distância">
                        <Ruler size={20}/>
                    </button>
                    <button onClick={() => setTool('measure-circle')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'measure-circle' ? 'bg-blue-500 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Medir Área (Círculo)">
                        <Circle size={20}/>
                    </button>
                    <button onClick={() => setTool('measure-cone')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'measure-cone' ? 'bg-blue-500 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Medir Área (Cone)">
                        <Triangle size={20}/>
                    </button>
                    <button onClick={() => setTool('measure-cube')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'measure-cube' ? 'bg-blue-500 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Medir Área (Cubo)">
                        <Box size={20}/>
                    </button>

                    <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
                    <button onClick={() => setZoom(z => Math.min(5, z * 1.2))} className="p-2 md:p-2.5 text-stone-400 hover:text-white hover:bg-white/5 transition-colors rounded-xl" title="Aproximar (Zoom In)">
                        <ZoomIn size={20}/>
                    </button>
                    <button onClick={() => setZoom(z => Math.max(0.1, z / 1.2))} className="p-2 md:p-2.5 text-stone-400 hover:text-white hover:bg-white/5 transition-colors rounded-xl" title="Afastar (Zoom Out)">
                        <ZoomOut size={20}/>
                    </button>
                    <button onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }} className="p-2 md:p-2.5 text-stone-400 hover:text-white hover:bg-white/5 transition-colors rounded-xl" title="Centralizar Mapa">
                        <Maximize size={20}/>
                    </button>

                    {!isGameMode && (
                        <>
                            <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
                            <button onClick={() => setTool('pencil')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'pencil' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Lápis">
                                <Pencil size={20}/>
                            </button>
                            <button onClick={() => setTool('eraser')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'eraser' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Borracha">
                                <Eraser size={20}/>
                            </button>
                            <button onClick={() => setTool('fill')} className={`p-2 md:p-2.5 rounded-xl transition-all ${tool === 'fill' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} title="Preencher">
                                <PaintBucket size={20}/>
                            </button>
                        </>
                    )}
                </div>

                {!isGameMode && (
                    <div className="bg-[#1a1a1d]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto p-1.5 w-12 md:w-14 mt-1 md:mt-2">
                         <button 
                            onClick={() => setEditLayer(editLayer === 'token' ? 'background' : 'token')} 
                            className={`p-2 md:p-2.5 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${editLayer === 'background' ? 'bg-purple-600 text-white shadow-md' : 'text-stone-400 hover:text-white hover:bg-white/5'}`} 
                            title={`Editando: ${editLayer === 'token' ? 'Tokens' : 'Fundo'}`}
                        >
                            <Layers size={18} className="md:w-5 md:h-5"/>
                            <span className="text-[6px] md:text-[7px] font-bold uppercase tracking-tighter leading-none">{editLayer === 'token' ? 'TOK' : 'BG'}</span>
                        </button>
                    </div>
                )}

                <div className="bg-[#1a1a1d]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col pointer-events-auto p-1.5 gap-1 w-12 md:w-14 mt-1 md:mt-2">
                    <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 md:p-2.5 text-stone-300 hover:bg-white/10 hover:text-white transition-colors rounded-xl"><Plus size={20}/></button>
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 md:p-2.5 text-stone-300 hover:bg-white/10 hover:text-white transition-colors rounded-xl"><Minus size={20}/></button>
                    <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
                    <button onClick={centerMap} className="p-2 md:p-2.5 text-stone-300 hover:bg-white/10 hover:text-white transition-colors rounded-xl" title="Centralizar"><Target size={20}/></button>
                    <button onClick={fitToScreen} className="p-2 md:p-2.5 text-stone-300 hover:bg-white/10 hover:text-white transition-colors rounded-xl" title="Ajustar à Tela"><Maximize size={20}/></button>
                </div>
                
                <button onClick={() => setShowFog(!showFog)} className={`p-2.5 md:p-3 rounded-2xl border shadow-xl pointer-events-auto transition-all w-12 md:w-14 mt-1 md:mt-2 flex justify-center items-center ${showFog ? 'bg-amber-500 text-stone-950 border-amber-400' : 'bg-[#1a1a1d]/90 backdrop-blur-md border-white/10 text-stone-400 hover:text-white hover:bg-white/10'}`} title="Alternar Névoa"><CloudRain size={20}/></button>
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleContextMenu}
                onDoubleClick={handleDoubleClick}
                onDragOver={handleCanvasDragOver}
                onDrop={handleCanvasDrop}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    cursor: tool === 'hand' || isPanning ? 'grab' : (tool === 'move' ? 'move' : 'crosshair')
                }}
            />

            <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none md:bottom-6 md:left-8">
                <button onClick={undo} disabled={historyIndex <= 0} className="bg-[#1a1a1d]/90 backdrop-blur-md p-3 rounded-full border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 shadow-lg pointer-events-auto transition-all"><Undo2 size={20}/></button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="bg-[#1a1a1d]/90 backdrop-blur-md p-3 rounded-full border border-white/10 text-white disabled:opacity-50 hover:bg-white/10 shadow-lg pointer-events-auto transition-all"><Redo2 size={20}/></button>
            </div>
            
            {/* Context Menu and Editing Panels (omitted for brevity as they remain unchanged) */}
            {contextMenu && (
                <div 
                    className="fixed z-50 bg-[#181822] border border-[#444] rounded shadow-xl py-1 w-40 text-sm"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.tokenId ? (
                        <>
                            {(() => {
                                const t = tokens.find(tk => tk.id === contextMenu.tokenId);
                                return (
                                    <button 
                                        onClick={() => { toggleTokenLock(contextMenu.tokenId!); setContextMenu(null); }} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[#252535] flex items-center gap-2 ${t?.locked ? 'text-green-400' : 'text-stone-200'}`}
                                    >
                                        {t?.locked ? <><Unlock size={14}/> Destravar</> : <><Lock size={14}/> Travar</>}
                                    </button>
                                )
                            })()}
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
                                if (propSetCustomAssets) {
                                    const assetToDelete = Object.values(propCustomAssets).find(a => a.url === contextMenu.assetUrl);
                                    if (assetToDelete) {
                                        const next = { ...propCustomAssets };
                                        delete next[assetToDelete.id];
                                        propSetCustomAssets(next);
                                    }
                                }
                                setContextMenu(null);
                            }} className="w-full text-left px-4 py-2 hover:bg-red-900/30 text-red-400 flex items-center gap-2"><Trash2 size={14}/> Remover Asset</button>
                        </>
                    ) : (
                        <div className="px-4 py-2 text-stone-500 italic text-center">Nada aqui</div>
                    )}
                </div>
            )}

            {editingToken && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setEditingToken(null)}>
                    <div className="bg-[#1a1a1d] border border-[#333] rounded-xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-2">
                            <h3 className="font-bold text-[#ffb74d] text-lg">Editar Token</h3>
                            <button onClick={() => setEditingToken(null)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                        </div>
                        
                        <div className="flex gap-4 mb-4">
                            <div className="w-24 h-24 bg-[#000] rounded-lg border border-[#333] flex items-center justify-center overflow-hidden relative group shrink-0">
                                {editingToken.image ? <img src={editingToken.image} className="w-full h-full object-contain"/> : <span className="text-4xl">{editingToken.icon}</span>}
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
                                        <label className="block text-[10px] text-stone-500 uppercase font-bold">Largura</label>
                                        <input type="number" step="0.5" className="w-full bg-[#252535] border border-[#333] rounded p-1.5 text-sm" value={editingToken.width || editingToken.size || 1} onChange={e => setEditingToken({...editingToken, width: parseFloat(e.target.value) || 1, size: Math.max(parseFloat(e.target.value), editingToken.height || 1)})} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-stone-500 uppercase font-bold">Altura</label>
                                        <input type="number" step="0.5" className="w-full bg-[#252535] border border-[#333] rounded p-1.5 text-sm" value={editingToken.height || editingToken.size || 1} onChange={e => setEditingToken({...editingToken, height: parseFloat(e.target.value) || 1, size: Math.max(editingToken.width || 1, parseFloat(e.target.value))})} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-stone-500 uppercase font-bold">Cor</label>
                                        <input type="color" className="w-full h-8 bg-transparent cursor-pointer" value={editingToken.color} onChange={e => setEditingToken({...editingToken, color: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* SELETOR DE MOLDURAS (FRAMES) */}
                        <div className="mb-4 bg-[#222] p-2 rounded border border-[#333]">
                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-2 flex items-center gap-1"><Frame size={10}/> Moldura (Frame)</label>
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                <button 
                                    onClick={() => setEditingToken({...editingToken, frame: undefined})}
                                    className={`w-10 h-10 shrink-0 border-2 rounded flex items-center justify-center bg-black ${!editingToken.frame ? 'border-[#ffb74d]' : 'border-[#444]'}`}
                                    title="Sem Moldura"
                                >
                                    <X size={14} className="text-stone-500"/>
                                </button>
                                {LIST_FRAMES.map((frame, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setEditingToken({...editingToken, frame})}
                                        className={`w-10 h-10 shrink-0 border-2 rounded flex items-center justify-center bg-black overflow-hidden relative ${editingToken.frame === frame ? 'border-[#ffb74d]' : 'border-[#444]'}`}
                                    >
                                        {/* Preview com o token dentro */}
                                        <div className="absolute inset-0 flex items-center justify-center p-0.5">
                                             {editingToken.image ? <img src={editingToken.image} className="w-full h-full object-contain opacity-50"/> : <div className="w-full h-full bg-stone-800"/>}
                                        </div>
                                        <img src={frame} className="absolute inset-0 w-full h-full object-contain z-10"/>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer bg-[#222] p-2 rounded border border-[#333] hover:bg-[#333]">
                                <input type="checkbox" checked={editingToken.locked || false} onChange={e => setEditingToken({...editingToken, locked: e.target.checked})} className="accent-[#ffb74d]"/>
                                {editingToken.locked ? <><Lock size={14}/> Objeto Travado (Cenário)</> : <><Unlock size={14}/> Destravado (Móvel)</>}
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-stone-300 cursor-pointer bg-[#222] p-2 rounded border border-[#333] hover:bg-[#333]">
                                <input type="checkbox" checked={editingToken.isBackground || false} onChange={e => setEditingToken({...editingToken, isBackground: e.target.checked})} className="accent-[#ffb74d]"/>
                                {editingToken.isBackground ? <><Layers size={14} className="text-purple-500"/> Camada de Fundo (Abaixo do Grid)</> : <><Layers size={14}/> Camada de Tokens (Acima do Grid)</>}
                            </label>
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
                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-1">Vincular a Ficha</label>
                            <select 
                                className="w-full bg-[#252535] border border-[#333] rounded p-2 text-sm text-stone-300 outline-none"
                                value={editingToken.linkedId || ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    if(!selectedId) {
                                        setEditingToken({...editingToken, linkedId: undefined, linkedType: undefined});
                                    } else {
                                        const type = characters.some(c => c.id === selectedId) ? 'character' : 'monster';
                                        handleLinkChange(type, selectedId);
                                    }
                                }}
                            >
                                <option value="">Sem Vínculo</option>
                                <optgroup label="Personagens">
                                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </optgroup>
                                <optgroup label="Monstros">
                                    {monsters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </optgroup>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#333]">
                            <button onClick={() => setEditingToken(null)} className="px-4 py-2 text-stone-400 hover:text-white text-sm font-bold">Cancelar</button>
                            <button onClick={saveTokenChanges} className="px-6 py-2 bg-[#ffb74d] hover:bg-amber-600 text-black font-bold rounded shadow-lg text-sm">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isUploadingImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl">
                        <Loader2 size={48} className="text-amber-500 animate-spin" />
                        <div className="text-xl font-cinzel font-bold text-stone-100 uppercase tracking-widest">Processando Imagem...</div>
                        <div className="text-stone-400 text-sm text-center max-w-xs px-4">Otimizando arquivo para garantir performance e sincronização total.</div>
                    </div>
                </div>
            )}
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

        {/* RESPONSIVE SIDEBAR: Drawer on Mobile, Sidebar on Desktop */}
        <div className={`fixed inset-0 md:static z-50 md:z-20 bg-[#181822] md:bg-transparent md:flex md:flex-col md:border-l-[3px] md:border-[#2a2a3a] md:shadow-2xl md:shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0 w-full md:w-[300px]' : 'translate-x-full w-0 md:opacity-0 md:overflow-hidden'}`}>
            <div className="flex items-center justify-between p-3 border-b border-[#2a2a3a] bg-[#181822]">
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-500 hover:text-white"><ChevronRight size={18} /></button>
                <h1 className="font-cinzel text-[#ffb74d] text-base tracking-[2px] truncate">FERRAMENTAS</h1>
            </div>
            {/* ... Rest of Sidebar content unchanged ... */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[#181822]">
                {isDM && (
                    <button onClick={() => { setIsGameMode(!isGameMode); setTool(isGameMode ? 'pencil' : 'move'); }} className={`w-full py-2 mb-3 rounded font-bold border transition-all flex items-center justify-center gap-2 text-xs ${isGameMode ? 'bg-green-700 border-green-500 text-white' : 'bg-[#252535] border-[#444]'}`}>{isGameMode ? <><Swords size={14}/> MODO JOGO</> : <><Pencil size={14}/> MODO EDIÇÃO</>}</button>
                )}
                
                <div className="flex gap-1 mb-3 bg-[#1a1a24] p-1 rounded border border-[#333]">
                    {!isGameMode && <button onClick={() => setSidebarTab('tools')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'tools' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Ferramentas"><PencilRuler size={16}/></button>}
                    {!isGameMode && <button onClick={() => setSidebarTab('assets')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'assets' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Ativos"><LayoutGrid size={16}/></button>}
                    {!isGameMode && <button onClick={() => setSidebarTab('map')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'map' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Mapa"><MapIcon size={16}/></button>}
                    <button onClick={() => setSidebarTab('tokens')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'tokens' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Tokens"><Users size={16}/></button>
                    {!isGameMode && <button onClick={() => setSidebarTab('weather')} className={`flex-1 p-1.5 rounded flex items-center justify-center ${sidebarTab === 'weather' ? 'bg-[#ffb74d] text-black shadow' : 'text-stone-500 hover:text-stone-300'}`} title="Efeitos"><CloudRain size={16}/></button>}
                </div>
                
                {/* ... (Conteúdo das tabs mantido, omitido por brevidade pois já está no código original e não precisa de alterações) ... */}
                {/* ... O código interno das tabs já está presente no arquivo original e não foi modificado. ... */}
                {sidebarTab === 'tokens' && (
                    <div className="space-y-2">
                        <div className="text-xs text-stone-500 text-center mb-2">Arraste para o mapa ou clique para adicionar</div>
                        {characters.map(char => (
                            <div key={char.id} onClick={() => importCharacterToBench(char)} className="bg-[#222] p-2 rounded border border-[#333] flex justify-between items-center cursor-pointer hover:bg-[#333]">
                                <span className="font-bold text-blue-400 text-xs">{char.name}</span>
                                <Plus size={14} className="text-stone-500"/>
                            </div>
                        ))}
                        {npcs && npcs.map(npc => (
                            <div key={npc.id} onClick={() => importCharacterToBench(npc)} className="bg-[#222] p-2 rounded border border-[#333] flex justify-between items-center cursor-pointer hover:bg-[#333]">
                                <span className="font-bold text-green-400 text-xs">{npc.name}</span>
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
                {/* ... (Outras tabs mantidas implicitamente) ... */}
                 {sidebarTab === 'tools' && !isGameMode && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-1">
                             {[
                                { id: 'pencil', icon: Pencil, title: 'Lápis' }, { id: 'eraser', icon: Eraser, title: 'Borracha' },
                                { id: 'fill', icon: PaintBucket, title: 'Balde' }, { id: 'move', icon: Move, title: 'Mover' },
                                { id: 'rect', icon: Square, title: 'Retângulo' }, { id: 'line', icon: Minus, title: 'Linha' },
                                { id: 'fog-hide', icon: EyeOff, title: 'Esconder (Névoa)' }, { id: 'fog-reveal', icon: Eye, title: 'Revelar (Névoa)' },
                                { id: 'ruler', icon: Ruler, title: 'Régua' }, { id: 'hand', icon: Hand, title: 'Panorâmica' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setTool(t.id as any)} className={`p-2 rounded border flex items-center justify-center transition-all ${tool === t.id ? 'bg-[#ffb74d] text-black border-[#ffb74d]' : 'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`} title={t.title}>
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
                            <div className="pt-2 border-t border-[#333] flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <button onClick={() => setPlaceMode('tile')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${placeMode === 'tile' ? 'bg-[#ffb74d] text-black shadow' : 'bg-[#252535] text-stone-400 hover:bg-[#333]'}`}>Pintar</button>
                                    <button onClick={() => setPlaceMode('object')} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${placeMode === 'object' ? 'bg-[#ffb74d] text-black shadow' : 'bg-[#252535] text-stone-400 hover:bg-[#333]'}`}>Objeto</button>
                                </div>
                                {placeMode === 'object' && (
                                    <div className="flex bg-[#252535] p-1 rounded border border-[#444]">
                                        <button onClick={() => setEditLayer('token')} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-colors ${editLayer === 'token' ? 'bg-[#ffb74d] text-black' : 'text-stone-400'}`}>Token (Topo)</button>
                                        <button onClick={() => setEditLayer('background')} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-colors ${editLayer === 'background' ? 'bg-[#ffb74d] text-black' : 'text-stone-400'}`}>Fundo (Baixo)</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
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
                                                <img src={t.c} className="w-full h-full object-contain" loading="lazy" />
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
                                    {Object.values(propCustomAssets).filter(a => assetTab === 'upload' ? a.type !== 'edited' : a.type === 'edited').map((a) => (
                                        <div key={a.id} onClick={() => { setSelectedTile(`asset:${a.id}`); setTool('pencil'); }} onContextMenu={(e) => handleAssetContextMenu(e, `asset:${a.id}`)} className={`aspect-square rounded border cursor-pointer overflow-hidden relative group ${selectedTile === `asset:${a.id}` ? 'border-[#ffb74d] ring-2 ring-[#ffb74d]/50' : 'border-[#444] hover:border-white'}`}>
                                            <img src={a.url} className="w-full h-full object-contain" />
                                            <button onClick={(e) => { e.stopPropagation(); openTextureEditor(a.url); }} className="absolute top-0 right-0 bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600"><Edit size={10}/></button>
                                        </div>
                                    ))}
                                </>
                            )}
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
                             <div className="flex items-center justify-between">
                                 <span className="text-stone-400 font-bold">Barras de Vida</span>
                                 <input type="checkbox" checked={showHpBars} onChange={e => setShowHpBars(e.target.checked)} className="accent-[#ffb74d]"/>
                             </div>
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
                                    <input type="number" className="w-full bg-[#252535] rounded p-1 text-center" value={mapDimW} onChange={e => setMapDimW(e.target.value)} onBlur={handleApplyDimensions} onKeyDown={e => e.key === 'Enter' && handleApplyDimensions()}/>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] text-stone-500 uppercase">Altura</label>
                                    <input type="number" className="w-full bg-[#252535] rounded p-1 text-center" value={mapDimH} onChange={e => setMapDimH(e.target.value)} onBlur={handleApplyDimensions} onKeyDown={e => e.key === 'Enter' && handleApplyDimensions()}/>
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
                                    {[...LIST_MAPS, ...dynamicMaps.filter(dm => !LIST_MAPS.includes(dm))].map((url, i) => (
                                        <div key={i} className="aspect-video bg-stone-800 border border-stone-600 rounded cursor-pointer hover:border-amber-500 relative group overflow-hidden" onClick={() => setBgFromPreset(url)}>
                                            <img src={convertDriveLink(url)} className="w-full h-full object-contain" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">Usar</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {backgroundImage && (
                                <div className="space-y-2 mt-2 bg-[#1a1a24] p-2 rounded border border-[#333]">
                                    <button onClick={fitBackgroundToGrid} className="w-full bg-blue-900/30 text-blue-400 text-[10px] py-1 rounded border border-blue-900/50 hover:bg-blue-900/50">Ajustar Grid ao Fundo Atual</button>
                                    
                                    <label className="flex items-center gap-2 text-xs text-stone-400 mt-2">
                                        <input type="checkbox" checked={bgStretch} onChange={e => setBgStretch(e.target.checked)} className="accent-[#ffb74d]"/>
                                        Esticar para preencher o Grid
                                    </label>

                                    <div className="flex items-center justify-between">
                                        <span>Brilho</span>
                                        <input type="range" min="10" max="200" value={bgBrightness} onChange={e => setBgBrightness(parseInt(e.target.value))} className="w-20 accent-[#ffb74d]"/>
                                    </div>

                                    {!bgStretch && (
                                        <>
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
                                        </>
                                    )}
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
                 {sidebarTab === 'weather' && !isGameMode && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setWeather('none')} className={`p-2 rounded border flex flex-col items-center justify-center ${weather==='none'?'bg-[#ffb74d] text-black border-[#ffb74d]':'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`}>
                                <Sun size={20}/>
                                <span className="text-[10px] font-bold mt-1">Limpo</span>
                            </button>
                            <button onClick={() => setWeather('rain')} className={`p-2 rounded border flex flex-col items-center justify-center ${weather==='rain'?'bg-[#ffb74d] text-black border-[#ffb74d]':'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`}>
                                <CloudRain size={20}/>
                                <span className="text-[10px] font-bold mt-1">Chuva</span>
                            </button>
                            <button onClick={() => setWeather('snow')} className={`p-2 rounded border flex flex-col items-center justify-center ${weather==='snow'?'bg-[#ffb74d] text-black border-[#ffb74d]':'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`}>
                                <Snowflake size={20}/>
                                <span className="text-[10px] font-bold mt-1">Neve</span>
                            </button>
                            <button onClick={() => setWeather('fog')} className={`p-2 rounded border flex flex-col items-center justify-center ${weather==='fog'?'bg-[#ffb74d] text-black border-[#ffb74d]':'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`}>
                                <CloudFog size={20}/>
                                <span className="text-[10px] font-bold mt-1">Neblina</span>
                            </button>
                            <button onClick={() => setWeather('ember')} className={`p-2 rounded border flex flex-col items-center justify-center ${weather==='ember'?'bg-[#ffb74d] text-black border-[#ffb74d]':'bg-[#252535] border-[#333] text-stone-400 hover:text-white'}`}>
                                <Flame size={20}/>
                                <span className="text-[10px] font-bold mt-1">Brasas</span>
                            </button>
                        </div>
                     </div>
                 )}
            </div>
            
            <div className="p-3 border-t border-[#2a2a3a] bg-[#1a1a24]">
                <button onClick={exportMap} className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded flex items-center justify-center gap-2 font-bold text-xs"><Download size={14}/> EXPORTAR MAPA</button>
            </div>
        </div>
        
        {/* Token Bench - REFACTORED TO FLOATING DOCK */}
        <div className="absolute bottom-[20px] md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            {/* Toggle Button */}
            <button 
                onClick={() => setShowBench(!showBench)}
                className="bg-[#1a1a1d]/90 backdrop-blur-md border border-white/10 rounded-full p-2 mb-2 pointer-events-auto text-stone-400 hover:text-white shadow-lg"
            >
                <MoreHorizontal size={20} />
            </button>

            {showBench && (
                <div className="bg-[#1a1a1d]/90 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl pointer-events-auto max-w-[90vw] overflow-x-auto custom-scrollbar ring-1 ring-white/5 animate-in slide-in-from-bottom-2">
                    {!isGameMode && (
                        <>
                            <label className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-stone-800/50 border border-dashed border-[#ffb74d] text-[#ffb74d] hover:bg-[#ffb74d] hover:text-black cursor-pointer shrink-0 transition-colors shadow-lg" title="Upload Token">
                                <Upload size={16}/>
                                <span className="text-[8px] font-bold mt-0.5">Upload</span>
                                <input type="file" hidden accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            const result = ev.target?.result;
                                            if (result) {
                                                setTokenBench(prev => [{
                                                    id: Date.now(), x: 0, y: 0, icon: '', image: result as string, hp: 10, max: 10, color: 'transparent', size: 2, width: 2, height: 2, name: 'Novo Token', isProp: false
                                                }, ...prev]);
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                    e.target.value = '';
                                }} />
                            </label>
                            <button onClick={() => addTokenToBench(false)} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-stone-800/50 border border-dashed border-stone-600 text-stone-500 hover:text-[#ffb74d] hover:border-[#ffb74d] shrink-0 transition-colors">
                                <Plus size={16}/>
                                <span className="text-[8px] font-bold mt-0.5">NPC</span>
                            </button>
                            <button onClick={() => handleAddPropFromSelection()} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-stone-800/50 border border-dashed border-stone-600 text-stone-500 hover:text-blue-400 hover:border-blue-400 shrink-0 transition-colors">
                                <Plus size={16}/>
                                <span className="text-[8px] font-bold mt-0.5">OBJ</span>
                            </button>
                            <div className="w-[1px] h-8 bg-white/10 mx-1"></div>
                        </>
                    )}
                    {tokenBench.map(token => (
                        <div 
                            key={token.id} 
                            draggable
                            onDragStart={(e) => handleBenchDragStart(e, token)}
                            onContextMenu={(e) => handleBenchContextMenu(e, token.id)}
                            className="relative w-12 h-12 bg-black rounded-xl border border-stone-700 hover:border-[#ffb74d] cursor-grab active:cursor-grabbing flex items-center justify-center shrink-0 group transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            {token.image ? (
                                <img src={token.image} className="w-full h-full object-contain rounded-xl pointer-events-none" />
                            ) : (
                                <span className="text-lg">{token.icon || (token.isProp ? '📦' : '♟️')}</span>
                            )}
                            {/* RENDERIZAR MOLDURA NA BANCA DE TOKENS TAMBÉM */}
                            {token.frame && <img src={token.frame} className="absolute inset-[-4px] w-[130%] h-[130%] object-contain pointer-events-none z-10" />}

                            {!isGameMode && <button onClick={() => removeTokenFromBench(token.id)} className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"><X size={10}/></button>}
                            <div className="absolute -bottom-6 text-[9px] bg-black/80 px-2 py-0.5 rounded-full text-stone-300 truncate max-w-[80px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none z-20">{token.name}</div>
                        </div>
                    ))}
                    {tokenBench.length === 0 && !isGameMode && <div className="text-[10px] text-stone-500 px-2 italic">Arraste ou crie tokens</div>}
                    {!isGameMode && (
                        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                            <button onClick={saveTokenBench} className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-400 hover:text-white transition-colors" title="Salvar Tokens">
                                <Save size={14} />
                            </button>
                            <label className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-400 hover:text-white transition-colors cursor-pointer" title="Carregar Tokens">
                                <Upload size={14} />
                                <input type="file" accept=".json" className="hidden" onChange={loadTokenBench} />
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}
