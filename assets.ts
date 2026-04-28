export const getName = (url: string) => {
    const filename = url.split('/').pop() || '';
    return filename.split('.')[0].replace(/[_-]/g, ' ');
};

// --- ASSET LIBRARIES LOCAIS ---

export const LIST_IMG = [
    'cogu1.PNG', 'cogu2.PNG', 'cogu3.PNG', 'cogu4.PNG', 'cogu5.PNG', 'cogu6.PNG',
    'dunge0.PNG', 'dunge1.PNG', 'dunge10.PNG', 'dunge2.PNG', 'dunge3.PNG', 'dunge4.PNG', 'dunge5.PNG', 'dunge6.PNG', 'dunge7.PNG', 'dunge8.PNG', 'dunge9.PNG',
    'flora1.PNG', 'flora2.PNG', 'flora3.PNG', 'flora4.PNG', 'flora5.PNG', 'flora7.PNG', 'flora8.PNG', 'flora9.PNG',
    'g_pantano1.png', 'g_pantano2.png', 'g_pantano3.png', 'g_pantano4.png', 'g_pantano5.png', 'g_pantano6.png', 'g_pantano7.png', 'g_pantano9.png',
    'mesa.png', 'rpgtextura2.JPG', 'rpgtextura3.JPG', 'rpgtextura4.JPG', 'rpgtextura5.JPG', 'rpgtextura6.JPG',
    'textura.PNG', 'textura1.PNG', 'textura2.PNG', 'textura3.PNG'
].map(f => `/textures/img/${f}`);

export const LIST_MURRO = [
    '1.PNG', '2.PNG', '3.PNG', '4.PNG', '5.PNG', '6.PNG', '7.PNG',
    'muro10.PNG', 'muro11.PNG', 'muro12.PNG',
    'murro.PNG', 'murro1.PNG', 'murro3.PNG', 'murro4.PNG', 'murro5.PNG', 'murro6.PNG', 'murro7.PNG', 'murro8.PNG', 'murro9.PNG'
].map(f => `/textures/murro/${f}`);

export const LIST_PREDIOS = [
    '1.PNG', '13.png', '1_2.png', '1_3.png', '1_4.png', '1_6.png', '1_7.png', '1_8.png', '1_9.png', '7_1.png', '7_2.png', '7_3.png'
].map(f => `/textures/predios/${f}`);

export const LIST_VEGETACAO = [
    'arbusto.PNG', 'arbusto_de_flores.png', 'arvore.PNG', 'baga.PNG', 'castor.PNG', 'coelho.PNG', 'cogumelo.PNG', 'cogumelomarron.PNG', 'cogumelomarronp.PNG', 'esquilo.PNG', 'florbranca.PNG', 'furão.PNG', 'java.PNG', 'lobo.PNG', 'ratinhos.PNG', 'raul.PNG', 'teixugo.PNG', 'urso.PNG'
].map(f => `/textures/vegetacao/${f}`);

export const LIST_AVATARS = [
    'aelion.PNG', 'alair.png', 'alex.png', 'artf.PNG', 'askhael.png', 'aslan.PNG', 'carol.PNG', 
    'draconato.png', 'druida_fada.png', 'druida_tortie.PNG', 'duida_elfo.PNG', 'guerreira_githyanki.PNG',
    'jonas.PNG', 'ladino_hafling.PNG', 'mago.PNG', 'clerigo.PNG', 'monge_tabaxi.PNG', 
    'paladino_draconato.PNG', 'paladino_tabaxi.png', 'pedro.PNG', 'saeel.PNG', 'snow.PNG', 
    'webert.PNG', 'barbaro_humano.PNG', 'barbaro_golias.PNG',
    'bardo_kenku.PNG', 'bruxo_tiefling.PNG', 'paladinio_1.PNG', 'lorack.PNG',
    'Búfalo_do_Pântano_ilustracao.png', 'Leão_das_Montanhas_ilustracao.png', 'Mamute_Lanoso_ilustracao.png'
].map(f => `/textures/creatures/${f}`);

export const LIST_CREATURES = [
    'aelion.PNG', 'alair.png', 'alex.png', 'aranha.PNG', 'aranha_menor.PNG', 'aranha_metalica.PNG', 'arquimago.PNG', 'artf.PNG', 'askhael.png', 'aslan.PNG', 'assassino_culto.PNG', 'assassino_vapor.PNG', 'automato.PNG', 'bandido.PNG', 'banshee.PNG', 'barbaro_golias.PNG', 'barbaro_humano.PNG', 'bardo_kenku.PNG', 'basilisco.PNG', 'basilisco_1.PNG', 'beholder.PNG', 'beholder_zumbi.PNG', 'bruxo_tiefling.PNG', 'Bugbear_Assassino_20260407183009.png', 'Bugbear_Bruto_20260407162136.png', 'Bugbear_Chefe_da_Tribo_20260407162331.png', 'Bugbear_Rei_dos_Pesadelos_20260407182344.png', 'Bugbear_Sombrio_20260407164940.png', 'Búfalo_do_Pântano_ilustracao.png', 'capitão_dos_bandidos.PNG', 'carol.PNG', 'centopeia.PNG', 'Cervo_Ancestral_ilustracao.png', 'ChatGPT Image 7 de abr. de 2026, 17_48_24.png', 'ChatGPT Image 7 de abr. de 2026, 17_50_57.png', 'ChatGPT Image 7 de abr. de 2026, 17_54_44.png', 'clerigo.PNG', 'cobra.PNG', 'Cobra_Gigante_ilustracao.png', 'Coruja_Sábia_ilustracao.png', 'Cão_Infernal_ilustracao.png', 'devorador_de_mentes.PNG', 'diabrete.PNG', 'draconato.png', 'dragao.PNG', 'dragao_negro.PNG', 'druida_fada.png', 'druida_tortie.PNG', 'duida_elfo.PNG', 'elemental_da_terra.PNG', 'escorpiao.PNG', 'esfige.PNG', 'esqueleto.PNG', 'esqueleto_guerreiro.PNG', 'esqueleto_ruina.PNG', 'fantasma.PNG', 'fantasma_1.PNG', 'gargula.PNG', 'gargula_lata.PNG', 'Gemini_Generated_Image_kf0bh5kf0bh5kf0b.png', 'Gemini_Generated_Image_rk427frk427frk42_20260407171415.png', 'gigante_da_tempestade.PNG', 'gladiador.PNG', 'gladiador_1.PNG', 'gnoll.PNG', 'gnu.PNG', 'goblin.PNG', 'goblin_1.PNG', 'Goblin_Armadilheiro (1)_20260326114451 (1).png', 'goblin_arqueiro.PNG', 'Goblin_Arqueiro_20260329120529.png', 'Goblin_Berserker.png', 'Goblin_Escravo-1_20260329122440.png', 'Goblin_Guerreiro.png', 'goblin_ladrão.PNG', 'Goblin_Lich_(Espírito_Corrompido)_20260407181819.png', 'Goblin_Montado_(lobo).png', 'Goblin_Mutante_(Ogro)_20260329122036.png', 'Goblin_Rastreador.png', 'Goblin_Xamã.png', 'golem_ferro.PNG', 'gorila.png', 'grifo.PNG', 'Grifo_Ancião_1.png', 'Grifo_Ancião_ilustracao.png', 'guarda_canino.PNG', 'guarda_carcereiro.PNG', 'guarda_carcereiro_2.PNG', 'guarda_gigante.PNG', 'guarda_mago.PNG', 'guarda_real.PNG', 'guarda_recruta.PNG', 'guarda_sargento.PNG', 'guerreira_githyanki.PNG', 'harpia.PNG', 'harpia_1.PNG', 'Hobgoblin_Arqueiro_20260329123110.png', 'Hobgoblin_Campeão_Imortal_20260407181453.png', 'Hobgoblin_Capitão_20260329123636.png', 'Hobgoblin_Cavaleiro_Pesado_20260407180501.png', 'Hobgoblin_Devoto_20260407181128.png', 'Hobgoblin_Mago_de_Guerra_20260407161641.png', 'Hobgoblin_Senhor_da_Guerra_20260407161336.png', 'Hobgoblin_Soldado.png', 'Hobgoblin_Warlord_20260407160919.png', 'Javali_Enfurecido_ilustracao.png', 'jonas.PNG', 'kobold.PNG', 'ladino_hafling.PNG', 'Leão_das_Montanhas_ilustracao.png', 'lich.PNG', 'lich_1.PNG', 'lobisomen.PNG', 'lobisomen_1.PNG', 'lobo.PNG', 'Lobo_Alfa_ilustracao.png', 'lobo_atroz.PNG', 'lorack.PNG', 'mago.PNG', 'mago_negro.PNG', 'Mamute_Lanoso_ilustracao.png', 'manticora.PNG', 'manticora_1.PNG', 'mimic.PNG', 'mimic_1.PNG', 'minotauro.PNG', 'monge_tabaxi.PNG', 'morcego.PNG', 'morcego_1.PNG', 'ogro.PNG', 'ogro_1.PNG', 'ogro_duas_cabeças.PNG', 'ogro_gigante.PNG', 'orc.PNG', 'orc_2.PNG', 'orc_3.PNG', 'orc_cavalheiro.PNG', 'owl.PNG', 'paladinio_1.PNG', 'paladino_draconato.PNG', 'paladino_tabaxi.png', 'Pantera_Negra_ilustracao.png', 'pedro.PNG', 'plebeu.PNG', 'prisioneiro_anão.PNG', 'prisioneiro_bruto.PNG', 'prisioneiro_bruto_2.PNG', 'prisioneiro_criminoso.PNG', 'prisioneiro_cultista.PNG', 'prisioneiro_cultista_2.PNG', 'prisioneiro_elfa.PNG', 'prisioneiro_enfraquecido.PNG', 'prisioneiro_nobre.PNG', 'quimera.PNG', 'rato.PNG', 'Rato_Gigante_20260329124050.png', 'Rato_Gigante_ilustracao.png', 'rei_demonio.PNG', 'saeel.PNG', 'sapo.PNG', 'silime_2.PNG', 'slime.PNG', 'slime_1.PNG', 'snow.PNG', 'tarrasque.PNG', 'touro_metalico.PNG', 'troll.PNG', 'urso.PNG', 'urso_atroz.PNG', 'Urso_Corrompido_ilustracao.png', 'urso_coruja.PNG', 'vampiro.PNG', 'Vampiro_Ancestral_ilustracao.png', 'Vampiro_Arcano_ilustracao.png', 'Vampiro_Bestial_ilustracao.png', 'Vampiro_Cavaleiro_Negro_ilustracao.png', 'vampiro_cria.PNG', 'Vampiro_das_Sombras_ilustracao.png', 'Vampiro_de_Sangue_Puro_ilustracao.png', 'Vampiro_Errante_ilustracao.png', 'Vampiro_Lich_ilustracao.png', 'Vampiro_Nevoento_ilustracao.png', 'Vampiro_Parasita_ilustracao.png', 'Vampiro_Sedutor_ilustracao.png', 'Vampiro_Senhor_da_Noite_ilustracao.png', 'verme.PNG', 'vespa.PNG', 'webert.PNG', 'zumbi.PNG', 'Águia_Gigante_ilustracao (1).png'
].map(f => `/textures/creatures/${f}`);

export const LIST_MOBILIA = [
    'nexus_ai_1770067246865.png', 'nexus_ai_1770068959848.png'
].map(f => `/textures/mobilia/${f}`);

export const LIST_MAPS = [
    'bear_jungle.png', 'blood_wood.png', 'citadel_of_madness.png', 'crypt_of_the_jade_reaper.png', 'dungeon_of_plague_snail.png', 'farfang_catacombs.png',
    'Gemini_Generated_Image_1yp7rs1yp7rs1yp7.png', 'Gemini_Generated_Image_2364ch2364ch2364.png', 'Gemini_Generated_Image_6g2oyn6g2oyn6g2o.png', 'Gemini_Generated_Image_9zi8p69zi8p69zi8.png', 'Gemini_Generated_Image_loa4yqloa4yqloa4.png', 'Gemini_Generated_Image_m6rhf9m6rhf9m6rh.png', 'Gemini_Generated_Image_rx5hpprx5hpprx5h.png', 'Gemini_Generated_Image_tmsd2ttmsd2ttmsd.png', 'Gemini_Generated_Image_vnrd5dvnrd5dvnrd.png', 'Gemini_Generated_Image_wigz7iwigz7iwigz.png', 'Gemini_Generated_Image_y1tpexy1tpexy1tp.png',
    'infected_hold_of_the_vampire_magus.png', 'labyrinth_of_ahrash - Copia.png', 'labyrinth_of_ahrash.png', 'lower_catacombs_of_the_scarlet_witch.png', 'mysterious_manor_by_the_river_gf.png', 'owl_jungle.png', 'owl_maw.png',
    'prison_of_damaia-tari (1).png', 'prison_of_damaia-tari.png', 'secret_labyrinth_of_ghesh - Copia.png', 'secret_labyrinth_of_ghesh.png', 'subterranean_halls_of_bari - Copia.png', 'subterranean_halls_of_bari.png', 'temple_of_barin-theroth - Copia.png', 'temple_of_barin-theroth.png', 'wolf_rise.png'
].map(f => `/textures/mapas/${f}`);

// --- TOKEN FRAMES ---
export const LIST_FRAMES = [
    'm1.PNG', 'm2.PNG', 'm3.PNG', 'm4.PNG', 'm5.PNG', 'm6.PNG', 'm7.PNG', 'm8.PNG'
].map(f => `/textures/molduras/${f}`);

export const TEXTURE_LINKS = {
    base: '/textures/img/textura.PNG',
    wall: '/textures/murro/murro.PNG',
    water: '/textures/img/g_pantano9.png',
    grass: '/textures/img/g_pantano1.png',
    wood: '/textures/img/mesa.png',
    stone: '/textures/img/dunge1.PNG'
};

export const PALETTES: Record<string, {c: string, n: string}[]> = {
    "Básicos": [
        {c: TEXTURE_LINKS.base, n: 'Base'}, {c: TEXTURE_LINKS.wall, n: 'Parede'},
        {c: TEXTURE_LINKS.water, n: 'Água'}, {c: TEXTURE_LINKS.grass, n: 'Grama'},
        {c: TEXTURE_LINKS.wood, n: 'Madeira'}, {c: TEXTURE_LINKS.stone, n: 'Pedra'}
    ],
    "Pisos e Chão": LIST_IMG.map(url => ({ c: url, n: getName(url) })),
    "Paredes e Muros": LIST_MURRO.map(url => ({ c: url, n: getName(url) })),
    "Estruturas": LIST_PREDIOS.map(url => ({ c: url, n: getName(url) })),
    "Natureza": LIST_VEGETACAO.map(url => ({ c: url, n: getName(url) })),
    "Criaturas": LIST_CREATURES.map(url => ({ c: url, n: getName(url) })),
    "Avatares": LIST_AVATARS.map(url => ({ c: url, n: getName(url) })),
    "Mobília": LIST_MOBILIA.map(url => ({ c: url, n: getName(url) })),
    "Molduras": LIST_FRAMES.map(url => ({ c: url, n: getName(url) })),
    "Mapas Prontos": LIST_MAPS.map(url => ({ c: url, n: getName(url) })),
};
