
import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, FolderOpen, Radio } from 'lucide-react';
import { AudioTrack } from '../types';

interface Props {
    isCompact?: boolean;
}

// Placeholder tracks using reliable external sources or placeholders
const DEFAULT_TRACKS: AudioTrack[] = [
    { id: 'rain', name: 'Chuva Suave', url: 'https://actions.google.com/sounds/v1/weather/light_rain.ogg', volume: 0.5, loop: true, isPlaying: false, category: 'ambience' },
    { id: 'fire', name: 'Fogueira', url: 'https://actions.google.com/sounds/v1/ambiences/fire.ogg', volume: 0.5, loop: true, isPlaying: false, category: 'ambience' },
    { id: 'wind', name: 'Vento Uivante', url: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg', volume: 0.4, loop: true, isPlaying: false, category: 'ambience' },
    { id: 'dungeon', name: 'Caverna', url: 'https://actions.google.com/sounds/v1/ambiences/cave_atmosphere.ogg', volume: 0.6, loop: true, isPlaying: false, category: 'ambience' },
    { id: 'battle_sfx', name: 'Impacto Metal', url: 'https://actions.google.com/sounds/v1/foley/metal_latch.ogg', volume: 0.8, loop: false, isPlaying: false, category: 'sfx' },
];

export const SoundController: React.FC<Props> = ({ isCompact }) => {
    const [tracks, setTracks] = useState<AudioTrack[]>(DEFAULT_TRACKS);
    const [isOpen, setIsOpen] = useState(false);
    const [globalMute, setGlobalMute] = useState(false);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        // Initialize audio objects
        tracks.forEach(track => {
            if (!audioRefs.current[track.id]) {
                const audio = new Audio(track.url);
                audio.loop = track.loop;
                audioRefs.current[track.id] = audio;
            }
            
            const audio = audioRefs.current[track.id];
            audio.volume = globalMute ? 0 : track.volume;
            
            if (track.isPlaying && audio.paused) {
                audio.play().catch(e => console.error("Audio play failed", e));
            } else if (!track.isPlaying && !audio.paused) {
                audio.pause();
                if (!track.loop) audio.currentTime = 0; // Reset SFX
            }
        });
    }, [tracks, globalMute]);

    const togglePlay = (id: string) => {
        setTracks(prev => prev.map(t => {
            if (t.id === id) return { ...t, isPlaying: !t.isPlaying };
            // If category is music, allows only one? For now, allowing multi-track mixing
            return t;
        }));
    };

    const updateVolume = (id: string, vol: number) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, volume: vol } : t));
    };

    return (
        <div className={`fixed bottom-24 right-4 z-[90] flex flex-col items-end pointer-events-none`}>
            {isOpen && (
                <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700 p-4 rounded-xl shadow-2xl mb-2 w-72 pointer-events-auto animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between items-center mb-3 border-b border-stone-700 pb-2">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2"><Music size={14}/> SoundScape</span>
                        <button onClick={() => setGlobalMute(!globalMute)} className={`p-1 rounded hover:bg-stone-800 ${globalMute ? 'text-red-500' : 'text-stone-400'}`}>
                            {globalMute ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                        </button>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {tracks.map(track => (
                            <div key={track.id} className="bg-stone-950/50 p-2 rounded-lg border border-stone-800">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-stone-300 flex items-center gap-1">
                                        {track.category === 'sfx' ? <Radio size={10}/> : <FolderOpen size={10}/>}
                                        {track.name}
                                    </span>
                                    <button onClick={() => togglePlay(track.id)} className={`p-1 rounded-full ${track.isPlaying ? 'text-amber-500 bg-amber-900/20' : 'text-stone-500 hover:text-stone-300'}`}>
                                        {track.isPlaying ? <Pause size={12}/> : <Play size={12}/>}
                                    </button>
                                </div>
                                <input 
                                    type="range" min="0" max="1" step="0.05" 
                                    value={track.volume} 
                                    onChange={(e) => updateVolume(track.id, parseFloat(e.target.value))}
                                    className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 border border-stone-700 ${isOpen ? 'bg-amber-600 text-white' : 'bg-stone-900 text-stone-400 hover:text-amber-500'}`}
                title="Controle de Áudio"
            >
                <Music size={20}/>
            </button>
        </div>
    );
};
