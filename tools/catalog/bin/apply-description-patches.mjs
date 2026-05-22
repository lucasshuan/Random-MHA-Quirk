/**
 * One-off patches for description cleanup. Run from repo root:
 * node tools/catalog/bin/apply-description-patches.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const manualPath = join(__dirname, '../data/sources/manual-copy.json')

/** @type {Record<string, { en?: { description: string }, 'pt-BR'?: { description: string } }>} */
export const PATCHES = {
  'absorption-and-release': {
    en: {
      description:
        'Absorbs energy-based emitter attacks that strike the user, stores them briefly, and releases the same force back toward the attacker. Works against directed energy assaults; physical strikes are not absorbed.',
    },
    'pt-BR': {
      description:
        'Absorve ataques de emissores baseados em energia que atingem o usuário, armazena-os brevemente e devolve a mesma força ao atacante. Funciona contra assaltos de energia direcionada; golpes físicos não são absorvidos.',
    },
  },
  'air-walk': {
    en: {
      description:
        'Lets the user stand on and steer pockets of air, achieving levitation and midair repositioning. Improves mobility for evasion and ranged attacks by freeing the user from ground contact.',
    },
    'pt-BR': {
      description:
        'Permite ao usuário apoiar-se e dirigir bolsões de ar, alcançando levitação e reposicionamento no ar. Melhora a mobilidade para esquiva e ataques à distância ao liberar o usuário do contato com o solo.',
    },
  },
  alchemy: {
    en: {
      description:
        'Transmutes the matter of any non-living object the user touches into different materials or finished items. The user can produce simple projectiles or complex constructs such as fully operational drones, limited by available source matter.',
    },
    'pt-BR': {
      description:
        'Transmuta a matéria de qualquer objeto inanimado que o usuário toque em outros materiais ou itens prontos. O usuário pode produzir projéteis simples ou construtos complexos, como drones totalmente operacionais, limitado pela matéria disponível.',
    },
  },
  'all-for-one': {
    en: {
      description:
        'Allows the user to steal other quirks for personal use or transfer stolen quirks to another person. The user can wield multiple stolen quirks at the same time, stacking their effects.',
    },
    'pt-BR': {
      description:
        'Permite ao usuário roubar outras individualidades para uso próprio ou transferir individualidades roubadas a outra pessoa. O usuário pode empunhar várias individualidades roubadas ao mesmo tempo, acumulando seus efeitos.',
    },
  },
  arbor: {
    en: {
      description:
        'Generates and controls wooden tendrils from any part of the body. The wood can sprout, extend over long distances, and be shaped for restraint, defense, or structural support.',
    },
    'pt-BR': {
      description:
        'Gera e controla gavinhas de madeira a partir de qualquer parte do corpo. A madeira pode brotar, estender-se por longas distâncias e ser moldada para contenção, defesa ou suporte estrutural.',
    },
  },
  'attraction-of-small-objects': {
    en: {
      description:
        'Exerts a telekinesis-like pull that draws small objects toward the user. The maximum mass or size limit is unclear, but lightweight metal items and similarly small objects can be yanked from a distance.',
    },
    'pt-BR': {
      description:
        'Exerce um puxão semelhante à telecinese que atrai pequenos objetos em direção ao usuário. O limite exato de massa ou tamanho é incerto, mas itens metálicos leves e objetos pequenos semelhantes podem ser puxados à distância.',
    },
  },
  beast: {
    en: {
      description:
        'Transforms the user into a large, feral beast with oversized fangs, heavy fur, and greatly increased size. In this form the user gains raw strength and animalistic fighting traits.',
    },
    'pt-BR': {
      description:
        'Transforma o usuário em uma fera grande, com presas enormes, pelagem densa e tamanho muito aumentado. Nessa forma o usuário ganha força bruta e traços de combate animalescos.',
    },
  },
  'big-monkey': {
    en: {
      description:
        'Under external enhancement, the user can transform into a giant ape-like form with immense size and strength. Its ordinary effect without amplification has not been clearly shown.',
    },
    'pt-BR': {
      description:
        'Sob amplificação externa, o usuário pode se transformar em uma forma gigante semelhante a um macaco, com tamanho e força imensos. O efeito ordinário sem amplificação não foi claramente demonstrado.',
    },
  },
  blast: {
    en: {
      description:
        'Fires rapid, continuous blasts of energy from the limbs. The user can channel the output through hands and legs, and specialized gear can help focus the discharges for aimed strikes.',
    },
    'pt-BR': {
      description:
        'Dispara explosões contínuas e rápidas de energia pelos membros. O usuário pode canalizar o efeito pelas mãos e pernas, e equipamentos especializados ajudam a focar os disparos para ataques precisos.',
    },
  },
  'blood-control': {
    en: {
      description:
        'Manipulates the user\'s own blood after it leaves the body, directing its flow in the open air. The blood can be hardened into rigid structures to bind or immobilize targets.',
    },
    'pt-BR': {
      description:
        'Manipula o próprio sangue do usuário depois que ele sai do corpo, controlando seu fluxo no ar. O sangue pode ser endurecido em estruturas rígidas para prender ou imobilizar alvos.',
    },
  },
  bloodlet: {
    en: {
      description:
        'Expels the user\'s blood outward and can later reabsorb it. The user tolerates blood loss that would normally be fatal and can shape expelled blood into weapons or tools.',
    },
    'pt-BR': {
      description:
        'Expulsa o sangue do usuário para fora do corpo e pode reabsorvê-lo depois. O usuário suporta perda sanguínea que normalmente seria fatal e pode moldar o sangue expelido em armas ou ferramentas.',
    },
  },
  bombify: {
    en: {
      description:
        'Mutates parts of the body to grow explosive charges of varying size. The quirk behaves like an artificial augmentation tied to implanted bomber cells within the user.',
    },
    'pt-BR': {
      description:
        'Muta partes do corpo para gerar cargas explosivas de vários tamanhos. A individualidade se comporta como um aprimoramento artificial ligado a células explosivas implantadas no usuário.',
    },
  },
  'brawn-boost': {
    en: {
      description:
        'Raises the user\'s physical strength for a temporary boost. Multiple copies of the same quirk stacked on one user multiply the strength increase further.',
    },
    'pt-BR': {
      description:
        'Aumenta temporariamente a força física do usuário. Várias cópias da mesma individualidade acumuladas em um único usuário multiplicam ainda mais o ganho de força.',
    },
  },
  chameleon: {
    en: {
      description:
        'Grants chameleon-like traits including wall climbing, independently rotating eyes, and camouflage coloring. The user can blend into surroundings and strike from concealed positions.',
    },
    'pt-BR': {
      description:
        'Concede traços de camaleão, incluindo escalada de paredes, olhos que giram de forma independente e coloração de camuflagem. O usuário pode se misturar ao ambiente e atacar de posições ocultas.',
    },
  },
  clones: {
    en: {
      description:
        'Creates clones of the user from a glowing viscous fluid released from the mouth. Dozens of copies can exist at once, though they typically dissipate after taking damage or after a short time.',
    },
    'pt-BR': {
      description:
        'Cria clones do usuário a partir de um fluido viscoso brilhante liberado pela boca. Dezenas de cópias podem existir ao mesmo tempo, embora em geral se dissipem ao sofrer dano ou após pouco tempo.',
    },
  },
  confession: {
    en: {
      description:
        'After the user asks a question, the target is compelled to answer truthfully. The effect reveals thoughts, secrets, and intentions the victim would otherwise conceal.',
    },
    'pt-BR': {
      description:
        'Depois que o usuário faz uma pergunta, o alvo é obrigado a responder com sinceridade. O efeito revela pensamentos, segredos e intenções que a vítima tentaria esconder.',
    },
  },
  'control-glass': {
    en: {
      description:
        'Controls and reshapes large amounts of glass in the surrounding area. The user can shift glass between solid and liquid states and form blades or barriers from it.',
    },
    'pt-BR': {
      description:
        'Controla e remodela grandes quantidades de vidro na área ao redor. O usuário pode alternar o vidro entre estado sólido e líquido e formar lâminas ou barreiras com ele.',
    },
  },
  'dark-ball': {
    en: {
      description:
        'Releases clusters of black spheres outlined in purple that emit destructive dark energy. The orbs can be launched as ranged attacks and combined with other emitter effects.',
    },
    'pt-BR': {
      description:
        'Libera aglomerados de esferas pretas com contorno roxo que emitem energia sombria destrutiva. As esferas podem ser lançadas como ataques à distância e combinadas com outros efeitos de emissão.',
    },
  },
  darkness: {
    en: {
      description:
        'Manifests a misty dark purple fluid from the fingers and soles that spreads across terrain. Anything coated by the fluid breaks down and collapses into decayed matter.',
    },
    'pt-BR': {
      description:
        'Manifesta um fluido roxo escuro e enevoado pelos dedos e solas dos pés, que se espalha pelo terreno. Qualquer coisa coberta pelo fluido se decompõe e desmorona em matéria deteriorada.',
    },
  },
  'delay-spot': {
    en: {
      description:
        'Creates a semi-spherical bubble that slows everything inside to a crawl, including people and projectiles. Bullets lose most of their speed while trapped in the field.',
    },
    'pt-BR': {
      description:
        'Cria uma bolha semiesférica que desacelera tudo em seu interior, incluindo pessoas e projéteis. Balas perdem quase toda a velocidade enquanto presas no campo.',
    },
  },
  eagle: {
    en: {
      description:
        'Grants an eagle-like body plan and presumably avian senses and mobility. The full combat capabilities of the transformation have not been fully documented.',
    },
    'pt-BR': {
      description:
        'Concede um corpo semelhante ao de uma águia e, presumivelmente, sentidos e mobilidade aviários. As capacidades de combate completas da transformação não foram totalmente documentadas.',
    },
  },
  'earth-flow': {
    en: {
      description:
        'Manipulates nearby earth and stone, molding it into walls, pillars, or other shapes. Large-scale constructs can be raised quickly for offense, defense, or terrain control.',
    },
    'pt-BR': {
      description:
        'Manipula terra e pedra próximas, moldando-as em muros, pilares ou outras formas. Construtos em grande escala podem ser erguidos rapidamente para ataque, defesa ou controle do terreno.',
    },
  },
  eel: {
    en: {
      description:
        'Lets the user transform into a medium-sized eel suited to aquatic movement. When amplified externally, the form can swell into a huge eel-like body with extremely slick skin.',
    },
    'pt-BR': {
      description:
        'Permite ao usuário se transformar em uma enguia de tamanho médio, adequada ao movimento aquático. Sob amplificação externa, a forma pode crescer até um corpo enorme semelhante a uma enguia com pele muito escorregadia.',
    },
  },
  'electric-eel': {
    en: {
      description:
        'An evolved form of an eel-type transformation that adds powerful electrical discharge to the aquatic body. The user can attack with high-voltage shocks while in the altered shape.',
    },
    'pt-BR': {
      description:
        'Uma forma evoluída de transformação tipo enguia que adiciona descargas elétricas potentes ao corpo aquático. O usuário pode atacar com choques de alta voltagem enquanto estiver na forma alterada.',
    },
  },
  'electricity-generation': {
    en: {
      description:
        'Produces and manipulates electricity, firing it as aimed lightning bolts rather than only through direct contact. Unlike simple contact shocks, the user can strike distant targets with concentrated arcs.',
    },
    'pt-BR': {
      description:
        'Produz e manipula eletricidade, disparando-a como raios direcionados em vez de apenas por contato. Diferente de choques por toque, o usuário pode atingir alvos distantes com arcos concentrados.',
    },
  },
  'electromagnetic-bullets': {
    en: {
      description:
        'Generates an electromagnetic field that boosts the force and impact of thrown objects. Any projectile launched while the field is active hits with amplified power.',
    },
    'pt-BR': {
      description:
        'Gera um campo eletromagnético que aumenta a força e o impacto de objetos arremessados. Qualquer projétil lançado enquanto o campo está ativo atinge com potência amplificada.',
    },
  },
  'extend-o-hair': {
    en: {
      description:
        'Controls the length, shape, and movement of all body hair. The hair is extremely tough and effectively indestructible, allowing binding, defense, and striking uses.',
    },
    'pt-BR': {
      description:
        'Controla o comprimento, a forma e o movimento de todos os pelos do corpo. O cabelo é extremamente resistente e praticamente indestrutível, permitindo contenção, defesa e golpes.',
    },
  },
  'fierce-gains': {
    en: {
      description:
        'Hardens the user\'s muscles to exceptionally dense, armor-like levels. Works well with other durability effects and pain suppression to sustain prolonged melee combat.',
    },
    'pt-BR': {
      description:
        'Endurece os músculos do usuário a níveis excepcionalmente densos, semelhantes a armadura. Combina bem com outros efeitos de resistência e supressão de dor para sustentar combate corpo a corpo prolongado.',
    },
  },
  'fire-cracker': {
    en: {
      description:
        'Lets the user tear off portions of their hair and detonate them like firecrackers. The bursts are strong enough to damage structures and stagger nearby targets.',
    },
    'pt-BR': {
      description:
        'Permite arrancar partes do próprio cabelo e detoná-las como fogos de artifício. As explosões são fortes o bastante para danificar estruturas e desestabilizar alvos próximos.',
    },
  },
  'flash-bang-sweat': {
    en: {
      description:
        'Secretes a sweat that flashes brightly and produces a loud detonation on impact. The substance can fill projectiles or gear to create ranged flash-bang effects.',
    },
    'pt-BR': {
      description:
        'Secreção de um suor que emite clarão intenso e estouro sonoro ao impactar. A substância pode encher projéteis ou equipamentos para criar efeitos de granada de luz e som à distância.',
    },
  },
  flight: {
    en: {
      description:
        'Grants high-speed flight and levitation. An aerodynamic barrier can extend over anything in contact with the user, shielding passengers from heat, cold, and physical hazards.',
    },
    'pt-BR': {
      description:
        'Concede voo e levitação em alta velocidade. Uma barreira aerodinâmica pode se estender sobre tudo em contato com o usuário, protegendo passageiros de calor, frio e riscos físicos.',
    },
  },
  float: {
    en: {
      description:
        'Lets the user levitate and hover in midair. When combined with a large stockpile of borrowed power, the effect becomes true high-speed flight rather than simple hovering.',
    },
    'pt-BR': {
      description:
        'Permite ao usuário levitar e pairar no ar. Quando combinada com um grande reservatório de poder emprestado, o efeito se torna voo em alta velocidade em vez de simples sustentação.',
    },
  },
  'fly-swatter': {
    en: {
      description:
        'Projects concussive energy waves beyond normal arm reach. The user typically swings an arm at high speed to launch the wave toward a distant target.',
    },
    'pt-BR': {
      description:
        'Projeta ondas de energia concussiva além do alcance normal do braço. O usuário em geral balança o braço em alta velocidade para lançar a onda contra um alvo distante.',
    },
  },
  'flying-squirrel': {
    en: {
      description:
        'Glides through the air using wing-like membranes on the arms. The user can carry roughly one additional person\'s weight on their back while gliding.',
    },
    'pt-BR': {
      description:
        'Planada pelo ar usando membranas semelhantes a asas nos braços. O usuário pode carregar aproximadamente o peso de mais uma pessoa nas costas durante o voo planado.',
    },
  },
  food: {
    en: {
      description:
        'Allows the user to bite, chew, and digest virtually any material they can touch. Hard or hazardous objects can be consumed with little resistance from the material itself.',
    },
    'pt-BR': {
      description:
        'Permite morder, mastigar e digerir praticamente qualquer material que o usuário consiga tocar. Objetos duros ou perigosos podem ser consumidos com pouca resistência do próprio material.',
    },
  },
  'free-walker': {
    en: {
      description:
        'The exact limits are undocumented, but the quirk appears to let the user move their legs continuously without fatigue. It primarily enhances sustained running or marching endurance.',
    },
    'pt-BR': {
      description:
        'Os limites exatos não estão documentados, mas a individualidade parece permitir movimento contínuo das pernas sem fadiga. Melhora principalmente a resistência para corrida ou marcha prolongada.',
    },
  },
  'gale-gale': {
    en: {
      description:
        'Manipulates wind and wraps it around the body for flight and offense. Concentrated gusts around the user can repel attacks and throw targets off balance despite a harmless appearance.',
    },
    'pt-BR': {
      description:
        'Manipula o vento e o envolve ao redor do corpo para voo e ataque. Rajadas concentradas ao redor do usuário podem repelir ataques e desequilibrar alvos apesar de uma aparência inofensiva.',
    },
  },
  'gigantic-spinning-flying-turtle': {
    en: {
      description:
        'Appears to grant turtle-like flight and spinning movement, though its full limits are unclear. It may force exaggerated size or constant rotation when active.',
    },
    'pt-BR': {
      description:
        'Parece conceder voo e movimento giratório semelhantes aos de uma tartaruga, embora os limites completos sejam incertos. Pode impor tamanho exagerado ou rotação constante quando ativa.',
    },
  },
  glamour: {
    en: {
      description:
        'Creates short-lived visual and auditory illusions. The user releases a mist from the mouth that shapes into false scenery, voices, or disguises.',
    },
    'pt-BR': {
      description:
        'Cria ilusões visuais e sonoras de curta duração. O usuário libera uma névoa pela boca que se molda em cenários falsos, vozes ou disfarces.',
    },
  },
  'glide-and-slide': {
    en: {
      description:
        'Lets the user skate rapidly along solid surfaces by emitting repulsive force from the palms and soles. Several limb contact points are needed to stay balanced; pushing gestures similar to roller skating build speed.',
    },
    'pt-BR': {
      description:
        'Permite ao usuário deslizar rapidamente em superfícies sólidas emitindo força repulsiva das palmas e solas. Vários pontos de contato nos membros são necessários para equilíbrio; gestos de impulso semelhantes aos de patinação aumentam a velocidade.',
    },
  },
  glycerin: {
    en: {
      description:
        'Secretes a smooth, moisturizing liquid through the skin. The effect keeps skin supple and can maintain a youthful appearance regardless of age.',
    },
    'pt-BR': {
      description:
        'Secreção de um líquido suave e hidratante pela pele. O efeito mantém a pele macia e pode preservar uma aparência jovem independentemente da idade.',
    },
  },
  'good-ear': {
    en: {
      description:
        'Extends hearing into ultrasonic ranges beyond normal human perception. The user can pick up distant signals, covert transmissions, and approximate how many people are nearby from sound alone.',
    },
    'pt-BR': {
      description:
        'Amplia a audição para faixas ultrassônicas além da percepção humana normal. O usuário capta sinais distantes, transmissões discretas e pode estimar quantas pessoas estão por perto apenas pelo som.',
    },
  },
  hologram: {
    en: {
      description:
        'Projects holographic images of anything the user imagines, including enormous constructs visible from far away. The illusions are visual only unless paired with other effects.',
    },
    'pt-BR': {
      description:
        'Projeta imagens holográficas de qualquer coisa que o usuário imagine, incluindo construtos enormes visíveis de longe. As ilusões são apenas visuais, salvo se combinadas com outros efeitos.',
    },
  },
  hypertrophy: {
    en: {
      description:
        'Enlarges parts of the body, most commonly an arm, to massive proportions on demand. The growth sharply increases reach and striking mass for melee attacks.',
    },
    'pt-BR': {
      description:
        'Aumenta partes do corpo, em geral um braço, a proporções enormes sob comando. O crescimento aumenta bastante o alcance e a massa de impacto em ataques corpo a corpo.',
    },
  },
  'impure-beam': {
    en: {
      description:
        'Fires a wide, destructive beam of light capable of leveling large areas in a single shot. One of the most devastating long-range emitter attacks when fully charged.',
    },
    'pt-BR': {
      description:
        'Dispara um feixe largo e destrutivo de luz capaz de arrasar grandes áreas em um único disparo. Um dos ataques de emissão à distância mais devastadores quando totalmente carregado.',
    },
  },
  infrared: {
    en: {
      description:
        'Grants infrared perception that maps heat across the surroundings. The user can sense people, machines, and environmental changes without normal line of sight.',
    },
    'pt-BR': {
      description:
        'Concede percepção infravermelha que mapeia calor ao redor. O usuário pode detectar pessoas, máquinas e mudanças no ambiente sem depender da visão comum.',
    },
  },
  'iron-ball': {
    en: {
      description:
        'Produces and launches iron spheres from the knuckles. The user can vary each ball\'s mass from small shot to boulder-sized projectiles.',
    },
    'pt-BR': {
      description:
        'Produz e lança esferas de ferro a partir dos nós dos dedos. O usuário pode variar a massa de cada esfera, de projéteis pequenos até blocos maiores que pedras.',
    },
  },
  'iron-claws': {
    en: {
      description:
        'Turns the fingertips into metal claws suited for digging and tearing. The claws can burrow through soil and rip through tough materials in close combat.',
    },
    'pt-BR': {
      description:
        'Transforma as pontas dos dedos em garras metálicas adequadas para escavação e dilaceração. As garras podem cavar solo e rasgar materiais resistentes em combate próximo.',
    },
  },
  'iron-club': {
    en: {
      description:
        'Transforms the arms into spiked iron clubs. The clubs can crush stone and deliver heavy blunt force blows.',
    },
    'pt-BR': {
      description:
        'Transforma os braços em clavas de ferro com espinhos. As clavas podem esmagar pedra e desferir golpes contundentes de grande força.',
    },
  },
  kaiju: {
    en: {
      description:
        'Its ordinary effect is poorly documented, but under external amplification the user becomes a colossal dinosaur-like creature with immense destructive power.',
    },
    'pt-BR': {
      description:
        'O efeito ordinário é pouco documentado, mas sob amplificação externa o usuário se torna uma criatura colossal semelhante a um dinossauro com poder destrutivo imenso.',
    },
  },
  'kinetic-booster': {
    en: {
      description:
        'Increases the kinetic energy the user generates and releases in movement and strikes. Stacking multiple copies of the quirk multiplies the boost further.',
    },
    'pt-BR': {
      description:
        'Aumenta a energia cinética que o usuário gera e libera em movimentos e golpes. Acumular várias cópias da individualidade multiplica ainda mais o impulso.',
    },
  },
  'king-slam': {
    en: {
      description:
        'Materializes a large hammer from nowhere and swings or throws it at targets. The weapon appears fully formed and ready to strike without preparation.',
    },
    'pt-BR': {
      description:
        'Materializa um martelo grande do nada e o usa em golpes diretos ou arremessos. A arma surge totalmente formada e pronta para atacar sem preparação.',
    },
  },
  leap: {
    en: {
      description:
        'Propels the user in enormous jumps across great height and distance. It is not true flight; the user still needs a surface to launch from.',
    },
    'pt-BR': {
      description:
        'Impulsiona o usuário em saltos enormes, cobrindo grande altura e distância. Não é voo verdadeiro; o usuário ainda precisa de uma superfície para impulsionar-se.',
    },
  },
  lion: {
    en: {
      description:
        'Grants lion-like strength, speed, and reflexes. The user can unleash a powerful roar that disrupts certain sound-based attacks.',
    },
    'pt-BR': {
      description:
        'Concede força, velocidade e reflexos semelhantes aos de um leão. O usuário pode soltar um rugido potente que interfere em certos ataques baseados em som.',
    },
  },
  'lock-down': {
    en: {
      description:
        'Anchors anything touched to a fixed point in space, effectively freezing it in place. Activated through contact points on the user\'s fingers.',
    },
    'pt-BR': {
      description:
        'Fixa qualquer coisa tocada a um ponto no espaço, imobilizando-a no lugar. Ativada por pontos de contato nos dedos do usuário.',
    },
  },
  longbow: {
    en: {
      description:
        'Transforms the thumb and pinky of one hand into a bow that can launch virtually any small object with precise aim. Ammunition can be improvised from nearby items.',
    },
    'pt-BR': {
      description:
        'Transforma o polegar e o mindinho de uma mão em um arco capaz de lançar praticamente qualquer objeto pequeno com mira precisa. A munição pode ser improvisada com itens próximos.',
    },
  },
  luminescence: {
    en: {
      description:
        'Emits bright light from the body, even from infancy. The output typically grows stronger as the user matures.',
    },
    'pt-BR': {
      description:
        'Emite luz intensa a partir do corpo, inclusive desde a infância. A intensidade em geral aumenta conforme o usuário amadurece.',
    },
  },
  mantis: {
    en: {
      description:
        'Grants mantis-like limbs and combat traits, including bladed forearms and agile striking. Under amplification the form becomes larger and more monstrous.',
    },
    'pt-BR': {
      description:
        'Concede membros e traços de combate semelhantes aos de um louva-a-deus, incluindo antebraços cortantes e golpes ágeis. Sob amplificação a forma fica maior e mais monstruosa.',
    },
  },
  'metal-manipulation': {
    en: {
      description:
        'Controls existing metal the user touches, reshaping it into barriers, weapons, or entangling structures. The effect applies to metal already present in the environment.',
    },
    'pt-BR': {
      description:
        'Controla metal já existente que o usuário toque, remodelando-o em barreiras, armas ou estruturas de aprisionamento. O efeito se aplica ao metal presente no ambiente.',
    },
  },
  'mind-reaper': {
    en: {
      description:
        'On touch, forces the target to blurt out secrets, shameful memories, or thoughts they want hidden. The revelations continue until the contact ends or the victim collapses.',
    },
    'pt-BR': {
      description:
        'Ao toque, obriga o alvo a revelar segredos, memórias vergonhosas ou pensamentos que desejava esconder. As revelações continuam até o contato cessar ou a vítima desmoronar.',
    },
  },
  'monster-summon': {
    en: {
      description:
        'Creates multiple monsters resembling dungeon-game enemies, usually blob-shaped bodies with large mouths and varied designs. The summons can attack independently under the user\'s direction.',
    },
    'pt-BR': {
      description:
        'Cria vários monstros semelhantes a inimigos de jogos de masmorra, em geral com corpos em massa, bocas grandes e designs variados. As invocações atacam de forma independente sob o comando do usuário.',
    },
  },
  multiplier: {
    en: {
      description:
        'Grows additional arms from the torso, multiplying close-range striking options. Each limb can act independently in combat.',
    },
    'pt-BR': {
      description:
        'Faz brotar braços extras do tronco, multiplicando opções de ataque corpo a corpo. Cada membro pode agir de forma independente no combate.',
    },
  },
  mummification: {
    en: {
      description:
        'Controls the red bandages wrapped around the user to ensnare objects and wrap them into humanoid mummy puppets. The created mummies can be commanded to fight or move.',
    },
    'pt-BR': {
      description:
        'Controla as bandagens vermelhas envoltas ao usuário para prender objetos e envolvê-los em marionetes mumificadas humanoides. As múmias criadas podem ser comandadas a lutar ou se mover.',
    },
  },
  'muscle-augmentation': {
    en: {
      description:
        'Amplifies and reshapes muscle tissue inside or outside the body for immense strength, speed, and durability. The user can bulk up selectively for offense or defense.',
    },
    'pt-BR': {
      description:
        'Amplifica e remodela tecido muscular dentro ou fora do corpo para força, velocidade e resistência imensas. O usuário pode aumentar massa muscular de forma seletiva para ataque ou defesa.',
    },
  },
  neutralization: {
    en: {
      description:
        'Temporarily nullifies another person\'s quirk through touch from the user\'s right arm. The suppression lasts while contact is maintained or for a short period afterward.',
    },
    'pt-BR': {
      description:
        'Anula temporariamente a individualidade de outra pessoa por toque com o braço direito do usuário. A supressão dura enquanto o contato se mantém ou por um curto período depois.',
    },
  },
  'one-for-all': {
    en: {
      description:
        'Stockpiles power across generations and can be passed to a chosen successor. Grants overwhelming strength, speed, and energy output, but full mastery demands long training and bodily adaptation.',
    },
    'pt-BR': {
      description:
        'Acumula poder entre gerações e pode ser passada a um sucessor escolhido. Concede força, velocidade e energia esmagadoras, mas o domínio pleno exige longo treino e adaptação do corpo.',
    },
  },
  outburst: {
    en: {
      description:
        'Forces people nearby into intense, uncontrollable laughter that leaves them helpless. The effect spreads to anyone within range who hears the induced laughter.',
    },
    'pt-BR': {
      description:
        'Obriga pessoas próximas a entrar em riso intenso e incontrolável que as deixa indefesas. O efeito se espalha a quem estiver ao alcance e ouvir a risada induzida.',
    },
  },
  overclock: {
    en: {
      description:
        'Accelerates the user to supersonic speed where the world appears frozen. Perception and reaction keep pace with the movement, enabling rapid strikes and rescues.',
    },
    'pt-BR': {
      description:
        'Acelera o usuário a velocidade supersônica, fazendo o mundo parecer parado. Percepção e reação acompanham o movimento, permitindo golpes e resgates extremamente rápidos.',
    },
  },
  overhaul: {
    en: {
      description:
        'Disassembles and reassembles matter touched with bare hands at a near-molecular level. The user can destroy targets, restore them, or reconfigure them into new shapes and weapons.',
    },
    'pt-BR': {
      description:
        'Desmonta e remonta matéria tocada com as mãos em nível quase molecular. O usuário pode destruir alvos, restaurá-los ou reconfigurá-los em novas formas e armas.',
    },
  },
  overmodification: {
    en: {
      description:
        'Boosts a compatible person\'s quirk beyond its normal limits and may add new sub-abilities. The amplification depends on how well the target\'s quirk aligns with the user.',
    },
    'pt-BR': {
      description:
        'Potencializa a individualidade de uma pessoa compatível além dos limites normais e pode acrescentar novas sub-habilidades. A amplificação depende de quão bem a individualidade do alvo se alinha ao usuário.',
    },
  },
  'pain-blocker': {
    en: {
      description:
        'Prevents the user from feeling internal or external pain. Combined with high endurance, this allows continued fighting despite severe injury.',
    },
    'pt-BR': {
      description:
        'Impede o usuário de sentir dor interna ou externa. Combinada com alta resistência, permite continuar lutando apesar de ferimentos graves.',
    },
  },
  papyrus: {
    en: {
      description:
        'Flattens the user\'s body into a thin, flexible sheet like paper. The user can stretch and fold limbs for reach, slipping through narrow gaps.',
    },
    'pt-BR': {
      description:
        'Achata o corpo do usuário em uma lâmina fina e flexível como papel. O usuário pode esticar e dobrar os membros para alcançar distâncias e passar por frestas estreitas.',
    },
  },
  'physical-enhancement': {
    en: {
      description:
        'Raises overall physical ability when activated, often shown as a green flame-like aura around the body. Strength, speed, and toughness increase for a limited time.',
    },
    'pt-BR': {
      description:
        'Eleva a capacidade física geral quando ativada, muitas vezes com uma aura esverdeada semelhante a chamas ao redor do corpo. Força, velocidade e resistência aumentam por tempo limitado.',
    },
  },
  playtime: {
    en: {
      description:
        'Its normal function is unclear, but under external amplification the user swells to gigantic size while gaining toy-like or distorted body traits similar to gigantification.',
    },
    'pt-BR': {
      description:
        'A função normal é incerta, mas sob amplificação externa o usuário cresce a proporções gigantescas enquanto ganha traços corporais distorcidos semelhantes à gigantificação.',
    },
  },
  pointer: {
    en: {
      description:
        'After spinning in place, the user\'s limbs involuntarily point toward a sought person, place, or object. The quirk acts like a living compass until the target is found.',
    },
    'pt-BR': {
      description:
        'Após girar no lugar, os membros do usuário apontam involuntariamente para uma pessoa, local ou objeto procurado. A individualidade funciona como uma bússola viva até o alvo ser encontrado.',
    },
  },
  poltergeist: {
    en: {
      description:
        'Telekinetically moves nearby objects and people without direct contact. Large groups of debris can be lifted and hurled as barrages.',
    },
    'pt-BR': {
      description:
        'Move telecineticamente objetos e pessoas próximos sem contato direto. Grandes quantidades de detritos podem ser erguidas e arremessadas em salvas.',
    },
  },
  propagation: {
    en: {
      description:
        'Duplicates and grows extra body parts across the user\'s surface, multiplying strength with each copy. More duplicates mean greater combined power.',
    },
    'pt-BR': {
      description:
        'Duplica e faz crescer partes extras do corpo pela superfície do usuário, multiplicando a força a cada cópia. Mais duplicatas significam poder combinado maior.',
    },
  },
  'quad-arms': {
    en: {
      description:
        'Adds a second pair of functional arms. The extra limbs improve multitasking, grappling, and hand-to-hand combinations.',
    },
    'pt-BR': {
      description:
        'Acrescenta um segundo par de braços funcionais. Os membros extras melhoram multitarefa, agarrões e combinações de luta corpo a corpo.',
    },
  },
  'queen-bee': {
    en: {
      description:
        'Centers on a parasitic bee that can invade a host through the eye socket and take control of the body. The swollen abdomen houses the controlling organism.',
    },
    'pt-BR': {
      description:
        'Centra-se em uma abelha parasita que pode invadir um hospedeiro pela órbita ocular e assumir o controle do corpo. O abdômen inchado abriga o organismo controlador.',
    },
  },
  'radio-waves-bombers': {
    en: {
      description:
        'Emits electromagnetic pulses strong enough to disrupt electronics and communications across an area. Power grids and radio gear fail while the pulse persists.',
    },
    'pt-BR': {
      description:
        'Emite pulsos eletromagnéticos capazes de interferir em eletrônicos e comunicações numa área. Redes de energia e equipamentos de rádio falham enquanto o pulso durar.',
    },
  },
  rifle: {
    en: {
      description:
        'Extends a functional rifle barrel from the right elbow cavity. The user folds the arm to open the port and fire ballistic shots with normal gun mechanics.',
    },
    'pt-BR': {
      description:
        'Estende um cano de rifle funcional a partir de uma cavidade no cotovelo direito. O usuário dobra o braço para abrir a abertura e disparar projéteis com mecânica de arma de fogo.',
    },
  },
  rivet: {
    en: {
      description:
        'Generates rivet-like metal growths from the arms that can be launched or used in melee. The exact size and number of rivets can vary between users.',
    },
    'pt-BR': {
      description:
        'Gera crescimentos metálicos semelhantes a rebites nos braços, que podem ser lançados ou usados em combate próximo. O tamanho e a quantidade podem variar entre usuários.',
    },
  },
  'rivet-stab': {
    en: {
      description:
        'Produces black tendrils with red fractured lines from the fingers and other body surfaces. The tendrils pierce, bind, and whip targets at range or in melee.',
    },
    'pt-BR': {
      description:
        'Produz tentáculos negros com linhas vermelhas rachadas a partir dos dedos e de outras partes do corpo. Os tentáculos perfuram, prendem e chicoteiam alvos à distância ou de perto.',
    },
  },
  sandstorm: {
    en: {
      description:
        'Transforms the upper body into manipulable sand. The user can reshape the sand mass into weapons, shields, or flowing attacks.',
    },
    'pt-BR': {
      description:
        'Transforma a parte superior do corpo em areia manipulável. O usuário pode remodelar a massa de areia em armas, escudos ou ataques fluidos.',
    },
  },
  shame: {
    en: {
      description:
        'Grows stronger as the user becomes more embarrassed, converting humiliation into physical power. Deliberate exposure or ridicule can spike output dramatically.',
    },
    'pt-BR': {
      description:
        'Fica mais forte conforme o usuário se sente mais envergonhado, convertendo humilhação em poder físico. Exposição ou ridicularização deliberada pode aumentar muito a potência.',
    },
  },
  'shock-absorption': {
    en: {
      description:
        'Dampens the force of physical impacts that hit the user, canceling or weakening many blunt attacks. Does not stop cutting or piercing unless paired with other defenses.',
    },
    'pt-BR': {
      description:
        'Amortece a força de impactos físicos que atingem o usuário, cancelando ou enfraquecendo muitos golpes contundentes. Não impede cortes ou perfurações sem outras defesas combinadas.',
    },
  },
  'shoulder-mounted-jets': {
    en: {
      description:
        'Deploys four retractable jet boosters on the upper back for burst flight and rapid repositioning. The thrusters fold away when not in use.',
    },
    'pt-BR': {
      description:
        'Aciona quatro propulsores retráteis nas costas para voo em impulsos e reposicionamento rápido. Os jatos se recolhem quando não estão em uso.',
    },
  },
  size: {
    en: {
      description:
        'Changes the size of objects the user touches, shrinking or enlarging them. Activation requires pressing all five fingertips against the target at once.',
    },
    'pt-BR': {
      description:
        'Altera o tamanho de objetos que o usuário toca, encolhendo ou ampliando-os. A ativação exige pressionar as cinco pontas dos dedos contra o alvo ao mesmo tempo.',
    },
  },
  slice: {
    en: {
      description:
        'Hardens and sharpens the user\'s hair for cutting attacks. Strands can be wielded like blades or fired as needle-like projectiles with high penetration.',
    },
    'pt-BR': {
      description:
        'Endurece e afia o cabelo do usuário para ataques cortantes. Fios podem ser usados como lâminas ou disparados como agulhas com alta penetração.',
    },
  },
  smile: {
    en: {
      description:
        'Forces victims who see the user\'s exposed teeth to laugh uncontrollably for about two hours. Works through direct sight or reflections of the teeth.',
    },
    'pt-BR': {
      description:
        'Obriga vítimas que veem os dentes expostos do usuário a rir incontrolavelmente por cerca de duas horas. Funciona por visão direta ou reflexos dos dentes.',
    },
  },
  'solid-air': {
    en: {
      description:
        'Solidifies exhaled air into platforms, walls, or barriers that float in place. Constructs can support the user and allies without collapsing downward.',
    },
    'pt-BR': {
      description:
        'Solidifica o ar exalado em plataformas, muros ou barreiras que permanecem flutuando. As construções podem sustentar o usuário e aliados sem desabar.',
    },
  },
  somnambulist: {
    en: {
      description:
        'Releases a sleep-inducing aroma from the skin that knocks targets unconscious. The effect is stronger against males than females.',
    },
    'pt-BR': {
      description:
        'Libera um aroma indutor de sono pela pele que deixa alvos inconscientes. O efeito é mais forte contra homens do que contra mulheres.',
    },
  },
  'spear-hand-missiles': {
    en: {
      description:
        'Fires the small reloadable missile segments that form the user\'s fingers. Shots are fast but the flight path is erratic and often misses without correction.',
    },
    'pt-BR': {
      description:
        'Dispara os pequenos segmentos recarregáveis em forma de míssil que compõem os dedos do usuário. Os tiros são rápidos, mas a trajetória é instável e muitas vezes erra sem correção.',
    },
  },
  'spotted-seal': {
    en: {
      description:
        'Combines spotted-seal traits with enhanced strength and agility on land and in water. The user can perform seal-like swimming and powerful physical strikes.',
    },
    'pt-BR': {
      description:
        'Combina traços de foca-malhada com força e agilidade aumentadas em terra e na água. O usuário pode nadar como uma foca e desferir golpes físicos potentes.',
    },
  },
  spring: {
    en: {
      description:
        'Makes anything the user touches extremely bouncy. Objects and surfaces rebound with exaggerated elasticity until the effect ends.',
    },
    'pt-BR': {
      description:
        'Torna extremamente elástico qualquer objeto que o usuário toque. Superfícies e itens ricocheteiam com elasticidade exagerada até o efeito acabar.',
    },
  },
  'springlike-limbs': {
    en: {
      description:
        'Coils the user\'s muscles like springs to store and release force in explosive strikes. When fully unleashed, the discharge can produce visible energy sparks.',
    },
    'pt-BR': {
      description:
        'Enrosca os músculos do usuário como molas para armazenar e liberar força em golpes explosivos. Quando totalmente liberada, a descarga pode produzir faíscas de energia visíveis.',
    },
  },
  steel: {
    en: {
      description:
        'Turns the entire body into steel for extreme durability. The metal skin resists bullets, blades, and heavy impacts, though weight increases.',
    },
    'pt-BR': {
      description:
        'Transforma todo o corpo em aço para durabilidade extrema. A pele metálica resiste a balas, lâminas e impactos pesados, embora o peso aumente.',
    },
  },
  stiffening: {
    en: {
      description:
        'Hardens any object kneaded between both hands, up to concrete-like rigidity. Rubber or soft materials can become tough barriers or weapons.',
    },
    'pt-BR': {
      description:
        'Endurece qualquer objeto amassado entre as duas mãos até rigidez semelhante à do concreto. Borracha ou materiais macios podem virar barreiras ou armas resistentes.',
    },
  },
  storage: {
    en: {
      description:
        'Stores objects and even living beings inside the user\'s body, carrying them discreetly. Stored items can be released intact on command.',
    },
    'pt-BR': {
      description:
        'Armazena objetos e até seres vivos dentro do corpo do usuário, transportando-os de forma discreta. Itens guardados podem ser liberados intactos sob comando.',
    },
  },
  'suicide-bomb': {
    en: {
      description:
        'Little is documented beyond its name, but it appears to trigger massive explosions centered on the user that devastate the surrounding area.',
    },
    'pt-BR': {
      description:
        'Pouco foi documentado além do nome, mas parece provocar explosões massivas centradas no usuário que devastam a área ao redor.',
    },
  },
  'tank-engine': {
    en: {
      description:
        'Transforms the head and upper torso into the front of a steam locomotive, including functional smokestack and train mass. The user moves with the momentum of a rail engine.',
    },
    'pt-BR': {
      description:
        'Transforma a cabeça e o tronco superior na frente de uma locomotiva a vapor, com chaminé funcional e massa de trem. O usuário se desloca com o ímpeto de um trem.',
    },
  },
  'tidal-bore': {
    en: {
      description:
        'Expels large volumes of water from the mouth for torrent attacks or lifting heavy objects. The stream can be shaped into pressurized blasts.',
    },
    'pt-BR': {
      description:
        'Expulsa grandes volumes de água pela boca para torrentes de ataque ou para erguer objetos pesados. O jato pode ser moldado em explosões pressurizadas.',
    },
  },
  'tongue-tank': {
    en: {
      description:
        'Transforms the tongue into an extendable tank cannon that fires rock-like shells when the mouth opens. The barrel stretches outward for ranged bombardment.',
    },
    'pt-BR': {
      description:
        'Transforma a língua em um canhão de tanque extensível que dispara projéteis semelhantes a rochas quando a boca se abre. O cano se estende para bombardeio à distância.',
    },
  },
  'tool-arms': {
    en: {
      description:
        'Manifests limbs embedded with tools and weapons such as chainsaws, hammers, and drills. Each arm can carry a different built-in implement.',
    },
    'pt-BR': {
      description:
        'Manifesta membros com ferramentas e armas embutidas, como motosserras, martelos e furadeiras. Cada braço pode carregar um implemento diferente.',
    },
  },
  transform: {
    en: {
      description:
        'After consuming a target\'s blood, the user can assume their exact appearance and voice. The disguise copies physical details precisely but requires fresh blood to sustain.',
    },
    'pt-BR': {
      description:
        'Após consumir o sangue de um alvo, o usuário pode assumir a aparência e a voz exatas dessa pessoa. O disfarce copia detalhes físicos com precisão, mas exige sangue fresco para se manter.',
    },
  },
  'tree-frog': {
    en: {
      description:
        'Extends the tongue outward with limited extra reach compared to stronger tongue quirks. The tongue curls back when not in use and supports basic capture or probing.',
    },
    'pt-BR': {
      description:
        'Estende a língua para fora com alcance limitado em comparação a individualidades de língua mais potentes. A língua se recolhe quando inativa e serve para captura básica ou sondagem.',
    },
  },
  'vibration-detection': {
    en: {
      description:
        'Senses subtle vibrations in the environment similar to echolocation. The user can map nearby movement and obstacles without relying on sight.',
    },
    'pt-BR': {
      description:
        'Detecta vibrações sutis no ambiente, semelhante à ecolocalização. O usuário pode mapear movimento e obstáculos próximos sem depender da visão.',
    },
  },
  'viral-cosmos': {
    en: {
      description:
        'Launches bursts of petals generated from flowers on the head as cutting projectiles. The petals swarm toward enemies and slice on contact.',
    },
    'pt-BR': {
      description:
        'Lança salvas de pétalas geradas por flores na cabeça como projéteis cortantes. As pétalas avançam em enxame contra inimigos e cortam ao contato.',
    },
  },
  voyance: {
    en: {
      description:
        'Sees through solid objects within line of sight, excluding living organisms. The user narrows vision through a finger-frame aperture to focus the effect.',
    },
    'pt-BR': {
      description:
        'Enxerga através de objetos sólidos à vista, exceto organismos vivos. O usuário restringe a visão por uma abertura formada com os dedos para focar o efeito.',
    },
  },
  'warp-gate': {
    en: {
      description:
        'Creates dark fog portals that teleport anything touched to another nearby point. Multiple gates can link different locations in quick succession.',
    },
    'pt-BR': {
      description:
        'Cria portais de névoa escura que teleportam qualquer coisa tocada para outro ponto próximo. Vários portais podem ligar locais diferentes em sequência rápida.',
    },
  },
  warping: {
    en: {
      description:
        'Produces black ooze from a victim\'s mouth that coats them and acts as a warp gate, vanishing them to another location. The user can target others remotely once the fluid takes hold.',
    },
    'pt-BR': {
      description:
        'Produz gosma negra na boca de uma vítima que a envolve e funciona como portal, fazendo-a desaparecer para outro local. O usuário pode mirar em outros à distância depois que o fluido se fixa.',
    },
  },
  'water-control': {
    en: {
      description:
        'Manipulates existing water into claws, waves, or pressurized jets. The user can reshape large bodies of water for offense and mobility.',
    },
    'pt-BR': {
      description:
        'Manipula água existente em garras, ondas ou jatos pressurizados. O usuário pode remodelar grandes volumes de água para ataque e mobilidade.',
    },
  },
  'water-pump': {
    en: {
      description:
        'Generates water from hose-like spigots in place of the hands. The streams can be shaped into barriers, blasts, or sustained floods with fine control.',
    },
    'pt-BR': {
      description:
        'Gera água a partir de bicos semelhantes a mangueiras no lugar das mãos. Os jatos podem ser moldados em barreiras, explosões ou inundações contínuas com controle fino.',
    },
  },
  'weather-manipulation': {
    en: {
      description:
        'Controls weather on a large scale, summoning storm clouds, lightning, typhoons, and other atmospheric phenomena. Entire islands can be engulfed by generated storms.',
    },
    'pt-BR': {
      description:
        'Controla o clima em grande escala, convocando nuvens de tempestade, raios, tufões e outros fenômenos atmosféricos. Ilhas inteiras podem ser envolvidas por tempestades geradas.',
    },
  },
  weld: {
    en: {
      description:
        'Fuses organic and inorganic matter together at a subatomic level on touch. Two contacted objects become physically joined into one structure.',
    },
    'pt-BR': {
      description:
        'Funde matéria orgânica e inorgânica em nível subatômico ao toque. Dois objetos em contato passam a formar uma única estrutura unida.',
    },
  },
  whale: {
    en: {
      description:
        'Transforms part or all of the body into a sperm-whale form with immense mass. In full whale shape the user can expel powerful water jets from the mouth.',
    },
    'pt-BR': {
      description:
        'Transforma parte ou todo o corpo em forma de cachalote com massa imensa. Na forma completa o usuário pode expelir jatos potentes de água pela boca.',
    },
  },
  whirlwind: {
    en: {
      description:
        'Controls surrounding air with minimal body movement, creating gales, updrafts, and precise wind blades. The user can fly and repel projectiles using pressure alone.',
    },
    'pt-BR': {
      description:
        'Controla o ar ao redor com pouco movimento corporal, criando vendavais, correntes ascendentes e lâminas de vento precisas. O usuário pode voar e repelir projéteis apenas com pressão.',
    },
  },
  whiteline: {
    en: {
      description:
        'Animates painted road lane lines into tendrils for binding, lifting, or throwing objects. Any nearby marked pavement becomes an extension of the user\'s reach.',
    },
    'pt-BR': {
      description:
        'Anima linhas de faixa pintadas na via em tentáculos para prender, erguer ou arremessar objetos. Qualquer pavimento marcado próximo se torna uma extensão do alcance do usuário.',
    },
  },
  wing: {
    en: {
      description:
        'Sprouts large black wings that enable free flight at very high speed. Maneuverability in the air is strong, though stamina limits are not fully known.',
    },
    'pt-BR': {
      description:
        'Faz brotar grandes asas negras que permitem voo livre em velocidade muito alta. A manobrabilidade no ar é forte, embora os limites de resistência não sejam totalmente conhecidos.',
    },
  },
  zoom: {
    en: {
      description:
        'Magnifies distant vision when the user focuses on a point, clearly seeing targets several kilometers away. Works like a biological telescopic lens.',
    },
    'pt-BR': {
      description:
        'Amplia a visão distante quando o usuário foca em um ponto, enxergando claramente alvos a vários quilômetros. Funciona como uma lente telescópica biológica.',
    },
  },
}

const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
let count = 0

for (const [id, patch] of Object.entries(PATCHES)) {
  if (patch.en?.description && manual.en[id]) {
    manual.en[id].description = patch.en.description
    count++
  }
  if (patch['pt-BR']?.description && manual['pt-BR'][id]) {
    manual['pt-BR'][id].description = patch['pt-BR'].description
    count++
  }
}

writeFileSync(manualPath, JSON.stringify(manual, null, 2) + '\n', 'utf8')
console.log(`Applied ${count} description updates to manual-copy.json`)
