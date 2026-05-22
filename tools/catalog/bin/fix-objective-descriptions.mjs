/**
 * Rewrites remaining wiki-style quirk descriptions (character names, lore).
 * Run: node tools/catalog/bin/fix-objective-descriptions.mjs
 * Then: node tools/catalog/bin/build-catalog.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manualPath = join(__dirname, '../data/sources/manual-copy.json')

const PATCHES = {
  vibrate: {
    en: 'Generates vibrations and shockwaves that travel through solids, liquids, and air. The user can shake objects they touch with their hands to destabilize structures or opponents.',
    pt: 'Gera vibrações e ondas de choque que atravessam sólidos, líquidos e ar. O usuário pode agitar objetos que toca com as mãos para desestabilizar estruturas ou oponentes.',
  },
  barrier: {
    en: 'Creates a telekinetic dome barrier around the user. The field can be raised quickly and used to block attacks or slow fast-moving targets that strike it.',
    pt: 'Cria uma barreira telecinética em forma de cúpula ao redor do usuário. O campo pode ser erguido rapidamente para bloquear ataques ou desacelerar alvos em movimento rápido.',
  },
  'big-fist': {
    en: 'Enlarges one or both hands to enormous size almost instantly. The expanded limbs greatly increase striking mass and reach in melee combat.',
    pt: 'Amplia uma ou ambas as mãos a tamanho enorme quase instantaneamente. Os membros expandidos aumentam muito a massa de impacto e o alcance no combate corpo a corpo.',
  },
  'big-horn': {
    en: 'Grants a pair of bull-like horns on the head. The horns can be detached and used to transmit signals or as sturdy striking tools.',
    pt: 'Concede um par de chifres semelhantes aos de um touro na cabeça. Os chifres podem ser destacados e usados para transmitir sinais ou como ferramentas de impacto resistentes.',
  },
  'blazing-hair': {
    en: 'Controls flames growing from the user\'s head. Chunks of burning hair can be thrown as fireballs or shaped into short-lived blade-like weapons.',
    pt: 'Controla chamas que crescem na cabeça do usuário. Pedaços de cabelo em chamas podem ser arremessados como bolas de fogo ou moldados em armas curtas semelhantes a lâminas.',
  },
  chart: {
    en: 'Creates a holographic tracking display that locates and monitors targets. The user can observe a tracked subject\'s position and movements in real time.',
    pt: 'Cria uma interface holográfica de rastreamento que localiza e monitora alvos. O usuário pode observar a posição e os movimentos do alvo rastreado em tempo real.',
  },
  'control-horn': {
    en: 'Lets the user mind-control cattle within range. Hundreds of animals can be directed at once for stampedes or coordinated movement.',
    pt: 'Permite controlar mentalmente gado ao alcance. Centenas de animais podem ser dirigidos de uma vez para investidas ou movimentos coordenados.',
  },
  double: {
    en: 'Creates up to two duplicates of anything touched, including people and objects. The copies can fight or assist until dismissed or destroyed.',
    pt: 'Cria até duas cópias de qualquer coisa tocada, incluindo pessoas e objetos. As duplicatas podem lutar ou ajudar até serem dispensadas ou destruídas.',
  },
  dust: {
    en: 'Produces ash-like dust from the body. The cloud can blind and irritate foes when thrown at the eyes, nose, and mouth.',
    pt: 'Produz poeira semelhante a cinzas a partir do corpo. A nuvem pode cegar e irritar inimigos quando lançada nos olhos, nariz e boca.',
  },
  'electric-charge': {
    en: 'Collects and manipulates ambient electrical current. Stored electricity can be discharged in attacks or used to jam nearby electronic signals.',
    pt: 'Coleta e manipula corrente elétrica do ambiente. A eletricidade armazenada pode ser descarregada em ataques ou usada para interferir em sinais eletrônicos próximos.',
  },
  gatling: {
    en: 'Forms gun-like organs in the arms that fire keratin claw projectiles. The shots are suited for rapid, close-to-mid-range offense.',
    pt: 'Forma órgãos semelhantes a armas nos braços que disparam projéteis de queratina em forma de garra. Os disparos servem para ataque rápido de curto a médio alcance.',
  },
  gecko: {
    en: 'Grants a reptilian body and powerful wall-clinging adhesion. The user can stay attached to sheer surfaces and moving vehicles without slipping.',
    pt: 'Concede corpo reptiliano e aderência forte em paredes. O usuário pode permanecer preso a superfícies verticais e veículos em movimento sem escorregar.',
  },
  'hair-control': {
    en: 'Manipulates the user\'s hair for offense, defense, and fine control. Strands can extend, harden, and be fired like bullets.',
    pt: 'Manipula o cabelo do usuário para ataque, defesa e controle fino. Fios podem se estender, endurecer e ser disparados como projéteis.',
  },
  'horn-cannon': {
    en: 'Detaches and launches the horns as regenerating projectiles. Multiple horns can be fired in succession before a new set regrows on the head.',
    pt: 'Destaca e lança os chifres como projéteis regenerativos. Vários chifres podem ser disparados em sequência antes que um novo conjunto brote na cabeça.',
  },
  ignition: {
    en: 'Produces fire abilities with a small flame maintained on top of the head. The user can exhale powerful flares from the mouth for ranged attacks.',
    pt: 'Produz habilidades de fogo com uma pequena chama mantida no topo da cabeça. O usuário pode exalar labaredas potentes pela boca para ataques à distância.',
  },
  'lizard-tail-splitter': {
    en: 'Splits the body into telekinetically controlled pieces. Detached segments can move independently for scouting, restraint, or multi-angle attacks.',
    pt: 'Divide o corpo em partes controladas por telecinese. Segmentos destacados podem se mover de forma independente para reconhecimento, contenção ou ataques em vários ângulos.',
  },
  dog: {
    en: 'Greatly enhances hearing and smell. The user can detect distant sounds and estimate how many people are present in a large area such as a forest.',
    pt: 'Amplia muito a audição e o olfato. O usuário pode detectar sons distantes e estimar quantas pessoas estão presentes numa área ampla, como uma floresta.',
  },
  elasticity: {
    en: 'Makes any touched object rubbery and elastic. The user can stretch, bounce, and redirect items for traps, mobility, or improvised weapons.',
    pt: 'Torna qualquer objeto tocado elástico e borrachudo. O usuário pode esticar, fazer quicar e redirecionar itens para armadilhas, mobilidade ou armas improvisadas.',
  },
  'navel-laser': {
    en: 'Fires bright laser beams from the navel. The rays are precise, flashy, and suited for sustained ranged offense.',
    pt: 'Dispara feixes de laser brilhantes a partir do umbigo. Os raios são precisos, chamativos e adequados para ataque à distância sustentado.',
  },
  'poison-gas': {
    en: 'Generates a toxic fog that sickens anyone who breathes it. If not vented regularly, the gas builds up inside the user\'s body.',
    pt: 'Gera uma névoa tóxica que adoece quem a respira. Se não for liberada regularmente, o gás se acumula dentro do corpo do usuário.',
  },
  'razor-sharp': {
    en: 'Produces large blades from anywhere on the body. Blade shape, size, and angle can be varied for slashing or piercing attacks.',
    pt: 'Produz grandes lâminas em qualquer parte do corpo. Forma, tamanho e ângulo das lâminas podem variar para cortes ou perfurações.',
  },
  stock: {
    en: 'Absorbs incoming attacks and stores their energy for later release. Absorbed power appears as a growing mass on the user\'s back until discharged.',
    pt: 'Absorve ataques recebidos e armazena sua energia para liberar depois. O poder absorvido aparece como uma massa crescente nas costas do usuário até ser descarregada.',
  },
  tail: {
    en: 'Grants a long, prehensile tail from the lower back. The appendage is bulky and can grab, balance, or strike like an extra limb.',
    pt: 'Concede uma cauda longa e preênsil na parte inferior das costas. O apêndice é volumoso e pode agarrar, equilibrar ou golpear como um membro extra.',
  },
  telekinesis: {
    en: 'Moves inanimate objects through telekinesis. When amplified by a compatible booster quirk, the number of objects controlled at once rises sharply.',
    pt: 'Move objetos inanimados por telecinese. Quando amplificada por uma individualidade de reforço compatível, a quantidade de objetos controlados de uma vez aumenta bastante.',
  },
  'hardflame-fan': {
    en: 'Generates layered walls of fire for defense over parts of the body. The flames can also manifest as a viscous, glowing green liquid in some uses.',
    pt: 'Gera camadas de paredes de fogo para defesa sobre partes do corpo. As chamas também podem se manifestar como um líquido viscoso verde brilhante em alguns usos.',
  },
  scalemail: {
    en: 'Covers the body with sharp armored scales that boost strength and defense. The scales are typically dark red and act as both armor and cutting surfaces.',
    pt: 'Cobre o corpo com escamas armadas e afiadas que aumentam força e defesa. As escamas são em geral vermelho escuro e funcionam como armadura e superfícies cortantes.',
  },
  'earphone-jack': {
    en: 'Extends long, controllable earlobes that function like audio cables. The tips can plug into objects or surfaces to transmit sound, vibration, or shock.',
    pt: 'Estende orelhas longas e controláveis que funcionam como cabos de áudio. As pontas podem se conectar a objetos ou superfícies para transmitir som, vibração ou choque.',
  },
  gigantification: {
    en: 'Drastically increases the user\'s body size to gigantic levels. In this state the user gains overwhelming mass and reach against smaller opponents.',
    pt: 'Aumenta drasticamente o tamanho do corpo do usuário a níveis gigantescos. Nesse estado o usuário ganha massa e alcance esmagadores contra oponentes menores.',
  },
  gyrate: {
    en: 'Spins any body part at extreme speed, turning limbs into drill-like weapons. The rotation greatly boosts piercing power in close combat.',
    pt: 'Gira qualquer parte do corpo em velocidade extrema, transformando membros em armas semelhantes a brocas. A rotação aumenta muito o poder de perfuração em combate próximo.',
  },
  pliabody: {
    en: 'Stretches and flattens the user\'s body at will for extreme flexibility. Useful for slipping through narrow gaps and rescue extraction.',
    pt: 'Estica e achata o corpo do usuário à vontade para flexibilidade extrema. Útil para passar por frestas estreitas e resgates em espaços apertados.',
  },
  soul: {
    en: 'Manifests a small pink bird-like companion linked to the user\'s soul. The companion is always active and reveals the user\'s true thoughts through its behavior.',
    pt: 'Manifesta um pequeno companheiro semelhante a um pássaro rosa ligado à alma do usuário. O companheiro está sempre ativo e revela os pensamentos verdadeiros do usuário por seu comportamento.',
  },
  'beams-from-his-eyes': {
    en: 'Fires concentrated laser beams from the eyes when a visor switch is activated. The user must engage the switch to release a blast at whatever they are looking at.',
    pt: 'Dispara feixes de laser concentrados dos olhos quando um interruptor na viseira é acionado. O usuário precisa ativar o interruptor para liberar um disparo no alvo em que está olhando.',
  },
  telepath: {
    en: 'Grants telepathic communication and instruction through thought. The user can send clear messages to one or multiple people at once.',
    pt: 'Concede comunicação e instrução telepática por pensamento. O usuário pode enviar mensagens claras a uma ou várias pessoas ao mesmo tempo.',
  },
  anivoice: {
    en: 'Lets the user speak with and command animals. The mutation also produces a rock-like head and horns that extend vocal commands over longer distances.',
    pt: 'Permite ao usuário falar com animais e comandá-los. A mutação também produz cabeça semelhante a rocha e chifres que estendem comandos vocais a longas distâncias.',
  },
  chronostasis: {
    en: 'Grants arrow-shaped hair that extends in straight lines to cut targets and slow them on contact. A forward hair cluster acts as the primary striking point above the forehead.',
    pt: 'Concede pêlos em forma de flecha que se estendem em linhas retas para cortar alvos e reduzir sua velocidade ao atingir. Um aglomerado frontal de pêlos funciona como o principal ponto de ataque acima da testa.',
  },
  magnetism: {
    en: 'Magnetizes people within about 4.5 meters of the user. The effect can target the whole body or specific limbs and torso sections.',
    pt: 'Magnetiza pessoas em um raio de cerca de 4,5 metros do usuário. O efeito pode atingir o corpo inteiro ou partes específicas dos membros e do tronco.',
  },
  'hair-raiser': {
    en: 'Extends and hardens strands of the user\'s hair for melee use. Torn-off locks can be wielded as rigid blades or short spears.',
    pt: 'Estende e endurece mechas do cabelo do usuário para combate corpo a corpo. Fios arrancados podem ser usados como lâminas rígidas ou lanças curtas.',
  },
  magic: {
    en: 'Creates energy rings from the wrist that can capture and move people or objects. While a target remains inside a ring, the user can change its orbital speed at will.',
    pt: 'Cria anéis de energia no pulso que podem capturar e mover pessoas ou objetos. Enquanto um alvo permanece dentro do anel, o usuário pode alterar sua velocidade orbital à vontade.',
  },
  'dragon-breath': {
    en: 'Expels fire from the mouth for ranged attacks. Fueling the flames requires consuming alcohol shortly before use.',
    pt: 'Expulsa fogo pela boca para ataques à distância. Alimentar as chamas exige consumir álcool pouco antes do uso.',
  },
  gas: {
    en: 'Generates poisonous, sleep-inducing gas from the body. The user can release enough purple fog to blanket a large outdoor area.',
    pt: 'Gera gás venenoso e indutor de sono a partir do corpo. O usuário pode liberar névoa roxa suficiente para cobrir uma grande área aberta.',
  },
  incite: {
    en: 'Infuses the user\'s voice with an electromagnetic pulse. Listeners who accept the user as a leader gain a significant boost to physical and mental performance.',
    pt: 'Infunde a voz do usuário com um pulso eletromagnético. Ouvintes que aceitam o usuário como líder recebem um aumento significativo de desempenho físico e mental.',
  },
  landmine: {
    en: 'Bestows explosive properties on anything the user touches. Detonations can be triggered at will after the charge is set.',
    pt: 'Confere propriedades explosivas a qualquer coisa que o usuário toque. As detonações podem ser acionadas à vontade depois que a carga é aplicada.',
  },
  'fa-jin': {
    en: 'Builds kinetic energy through repetitive movement, visible as red glowing power that can be stored and released in bursts.',
    pt: 'Acumula energia cinética com movimentos repetitivos, visível como energia vermelha brilhante que pode ser armazenada e liberada em rajadas.',
  },
}

const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
let count = 0

for (const [id, { en, pt }] of Object.entries(PATCHES)) {
  if (manual.en[id] && en) {
    manual.en[id].description = en
    count++
  }
  if (manual['pt-BR'][id] && pt) {
    manual['pt-BR'][id].description = pt
    count++
  }
}

writeFileSync(manualPath, JSON.stringify(manual, null, 2) + '\n', 'utf8')
console.log(`Updated ${count} descriptions in manual-copy.json`)
