import { PCBuild } from '../types/hardware';

export interface ToolRequirement {
  id: string;
  name: string;
  category: 'essential' | 'recommended' | 'optional';
  description: string;
  iconName: string; // e.g., 'screwdriver', 'paste', 'ties', 'flashlight', 'mat'
}

export interface CableTip {
  title: string;
  description: string;
  cablesInvolved: string[];
  importance: 'critical' | 'pro-tip' | 'cleanliness';
}

export interface AssemblyStep {
  id: number;
  phase: 'prep' | 'core_bench' | 'chassis_prep' | 'mounting' | 'cabling' | 'first_boot';
  title: string;
  shortTitle: string;
  componentKey?: keyof PCBuild;
  componentName?: string;
  estimatedMinutes: number;
  difficulty: 'Easy' | 'Moderate' | 'Careful';
  toolsNeeded: string[];
  summary: string;
  instructions: string[];
  proTips: string[];
  warnings: string[];
  cableNotes?: string[];
  thermalPasteGuide?: {
    method: string;
    amount: string;
    pattern: string;
    notes: string;
  };
}

export interface AssemblyPlan {
  totalEstimatedMinutes: number;
  tools: ToolRequirement[];
  steps: AssemblyStep[];
  generalCableManagementTips: CableTip[];
  firstBootChecklist: string[];
}

export function generateAssemblyPlan(build: PCBuild): AssemblyPlan {
  const steps: AssemblyStep[] = [];
  const tools: ToolRequirement[] = [
    {
      id: 'screwdriver_ph2',
      name: 'Phillips #2 Screwdriver',
      category: 'essential',
      description: 'Standard magnetic cross-head screwdriver used for chassis screws, motherboard standoffs, and power supply mounting.',
      iconName: 'wrench'
    },
    {
      id: 'screwdriver_ph1',
      name: 'Phillips #1 / #0 Screwdriver',
      category: 'essential',
      description: 'Precision screwdriver required for delicate M.2 NVMe SSD tiny standoff and retention screws.',
      iconName: 'wrench'
    },
  ];

  // Check if thermal paste is needed
  const cooler = build.cooler;
  const cpu = build.cpu;

  tools.push({
    id: 'thermal_paste',
    name: 'Thermal Interface Material (Paste)',
    category: cooler ? 'essential' : 'recommended',
    description: cooler?.type.includes('AIO') 
      ? 'High-performance thermal compound (AIO cold plates frequently have pre-applied paste, but keeping a tube handy is recommended in case of reseating).' 
      : 'Thermal paste (e.g. Arctic MX-4/6 or Noctua NT-H1). Crucial for filling microscopic air pockets between CPU heat spreader and cooler heatsink.',
    iconName: 'paste'
  });

  tools.push({
    id: 'isopropyl_alcohol',
    name: '99% Isopropyl Alcohol & Lint-free Wipes',
    category: 'recommended',
    description: 'For cleaning the CPU Integrated Heat Spreader (IHS) and cooler cold plate surface prior to paste application.',
    iconName: 'sparkles'
  });

  tools.push({
    id: 'zip_ties',
    name: 'Zip Ties / Velcro Straps & Snips',
    category: 'essential',
    description: 'Fasteners for routing power cables securely through back chassis grommets and behind motherboards.',
    iconName: 'ties'
  });

  tools.push({
    id: 'anti_static_mat',
    name: 'Anti-Static Work Surface',
    category: 'recommended',
    description: 'Use the motherboard box cardboard top as your test bench. Avoid carpet and static-prone clothing.',
    iconName: 'shield'
  });

  let stepCounter = 1;

  // Step 1: Workspace & Anti-static Preparation
  steps.push({
    id: stepCounter++,
    phase: 'prep',
    title: 'Workspace Preparation & Unboxing Strategy',
    shortTitle: 'Workspace Prep',
    estimatedMinutes: 10,
    difficulty: 'Easy',
    toolsNeeded: ['Anti-Static Work Surface', 'Phillips #2 Screwdriver'],
    summary: 'Clear a flat, non-carpeted table. Unbox the motherboard first and place its cardboard packaging flat to serve as your clean, static-safe assembly bench.',
    instructions: [
      'Find a well-lit, non-carpeted workspace (wooden or laminated desk is ideal).',
      'Unbox the Motherboard and place its cardboard box on the table. NEVER place the motherboard on top of the conductive silver antistatic bag!',
      'Rest the motherboard directly on the smooth cardboard box top.',
      'Touch a grounded metal object (like a plugged-in power supply housing in OFF mode) periodically to discharge static electricity.',
      'Organize all screws, standoff adaptors, and brackets into small cups or trays to prevent loss.'
    ],
    proTips: [
      'Building outside the PC case on the motherboard box first is standard enthusiast protocol — it gives 360° unobstructed access to RAM, CPU, and M.2 slots.',
      'Keep component boxes and warranty barcodes intact for warranty or RMA coverage.'
    ],
    warnings: [
      'Do NOT place components on top of the antistatic bag exterior; the exterior layer can be mildly conductive.',
      'Do not wear wool socks or build on deep-pile carpets.'
    ]
  });

  // Step 2: CPU Installation
  const cpuSocket = build.cpu?.socket || build.motherboard?.socket || 'Modern Socket';
  const isLGA = cpuSocket.startsWith('LGA') || cpuSocket === 'AM5'; // AM5 and LGA are Land Grid Array with pins in motherboard
  
  steps.push({
    id: stepCounter++,
    phase: 'core_bench',
    title: build.cpu ? `Install CPU: ${build.cpu.name}` : 'Install Processor (CPU) into Motherboard',
    shortTitle: 'Install CPU',
    componentKey: 'cpu',
    componentName: build.cpu?.name || 'Processor',
    estimatedMinutes: 5,
    difficulty: 'Careful',
    toolsNeeded: [],
    summary: `Safely seat the ${build.cpu?.name || 'CPU'} into the ${cpuSocket} socket without applying downward pressure.`,
    instructions: [
      `Locate the ${cpuSocket} socket lever on the motherboard.`,
      isLGA 
        ? 'Press down on the metal retention lever, slide it outwards slightly, and lift the socket load plate up. Leave the plastic protective socket cover in place for now.'
        : 'Lift the metal retention lever up 90 degrees until fully vertical.',
      'Pick up the CPU by its PCB edges strictly. Never touch the gold contacts on the bottom or the socket pins on the board.',
      'Align the golden triangle indicator on corner of the CPU with the corresponding triangle mark stamped on the motherboard socket.',
      'Gently lower the CPU straight down into the socket. It will drop in with ZERO force (Zero Insertion Force). Do NOT press down or slide it around!',
      isLGA 
        ? 'Lower the metal load plate over the CPU ears, push down the retention lever, and lock it under the hook. The plastic black socket cover will automatically pop off — keep it for warranty returns!'
        : 'Lower the retention lever and lock it under the retaining hook.'
    ],
    proTips: [
      'Double-check alignment twice before lowering the lever. If it doesn’t sit completely flush effortlessly, do not force the lever.',
      'Keep the black socket protective plastic cap in your motherboard box.'
    ],
    warnings: [
      'Socket pins are extremely fragile. A single bent pin can ruin the entire motherboard memory channels or PCI lanes!',
      'Zero force: Never press down on the CPU die.'
    ]
  });

  // Step 3: M.2 NVMe Storage Installation
  steps.push({
    id: stepCounter++,
    phase: 'core_bench',
    title: build.storage ? `Install NVMe Storage: ${build.storage.name}` : 'Install M.2 High-Speed NVMe Storage',
    shortTitle: 'Install NVMe SSD',
    componentKey: 'storage',
    componentName: build.storage?.name || 'M.2 NVMe SSD',
    estimatedMinutes: 5,
    difficulty: 'Easy',
    toolsNeeded: ['Phillips #1 / #0 Screwdriver'],
    summary: 'Install the solid-state drive into the primary M.2 slot directly wired to the CPU PCIe lanes, underneath the heatsink.',
    instructions: [
      'Locate the primary M.2 slot on the motherboard (usually the topmost slot closest to the CPU socket, equipped with a metal heatsink shield).',
      'Unscrew the motherboard M.2 shield heatsink using a Phillips #1 screwdriver and set screws aside.',
      'Peel off the blue or clear plastic protective film from the pre-applied thermal pad underneath the heatsink (vital step!).',
      'Insert the M.2 NVMe SSD into the keyway slot at a 30-degree angle until firmly seated.',
      'Gently push the SSD down flat against the standoff and lock it using either the motherboard EZ-Latch or the tiny M.2 screw.',
      'Re-install the motherboard thermal heatsink over the SSD and tighten the mounting screw evenly.'
    ],
    proTips: [
      'Using the topmost M.2 slot gives direct PCIe lanes to the CPU with zero chipset latency.',
      'Remember to remove the plastic protective foil from the heatsink thermal pad, otherwise thermal pad cannot transfer heat.'
    ],
    warnings: [
      'Do not forget to peel off the plastic film covering thermal pads on the heatsink! Leaving it on will bake the drive and cause thermal throttling.',
      'Do not over-torque tiny M.2 screws as they strip easily.'
    ]
  });

  // Step 4: RAM Installation
  const ramType = build.ram?.ramType || build.motherboard?.ramType || 'DDR5';
  steps.push({
    id: stepCounter++,
    phase: 'core_bench',
    title: build.ram ? `Install Memory: ${build.ram.name}` : `Install ${ramType} Memory Modules`,
    shortTitle: 'Install RAM',
    componentKey: 'ram',
    componentName: build.ram?.name || `${ramType} RAM`,
    estimatedMinutes: 5,
    difficulty: 'Easy',
    toolsNeeded: [],
    summary: `Seat the memory modules in Dual-Channel configuration (Slots A2 and B2) until latches audibly click.`,
    instructions: [
      'Open the retention clips at the ends of RAM slots A2 and B2 (typically slots 2 and 4 counting from the CPU socket outwards).',
      `Align the off-center notch on the bottom edge of the ${ramType} module with the key in the motherboard slot.`,
      'Place the module evenly across the slot.',
      'Using both thumbs on opposite outer corners of the stick, press firmly downwards with steady pressure until the latches click shut on both sides automatically.',
      'Verify that both side clips have snapped completely into their locked vertical notches.'
    ],
    proTips: [
      'For dual-channel memory kits with 2 sticks on a 4-slot board, always use slots 2 and 4 (A2 & B2) for signal integrity and XMP/EXPO stability.',
      ramType === 'DDR5' ? 'DDR5 slots require slightly more firm pressure than older DDR4 sticks. Press until you hear a distinct solid click.' : 'Ensure both ends click simultaneously.'
    ],
    warnings: [
      'Never insert RAM backwards; the keyed notch is asymmetrical.',
      'Do not power on if the side latches are partially open.'
    ]
  });

  // Step 5: CPU Cooler & Thermal Paste Application
  const isAio = build.cooler?.type.includes('AIO');
  const coolerName = build.cooler?.name || 'CPU Cooler';
  const coolerTypeDesc = isAio ? 'All-in-One Liquid Cooler (AIO)' : 'High-Performance Air Cooler';
  
  const thermalPasteMethod = cpuSocket.includes('AM5') 
    ? {
        method: 'Five-Dot (Pea + 4 Corners)',
        amount: '1 pea-sized dot (~4mm) in center + 4 tiny pinhead dots near corners',
        pattern: 'Dice 5 pattern',
        notes: 'AMD AM5 IHS has heat concentrated slightly south-center due to chiplet layout. The 5-dot spread ensures uniform corner coverage across the octopus IHS.'
      }
    : cpuSocket.includes('LGA1700') || cpuSocket.includes('LGA1851')
    ? {
        method: 'Vertical Line or 5-Dot Pattern',
        amount: 'A vertical stripe (~1.5cm long, 2mm wide) along the die spine',
        pattern: 'Elongated line pattern',
        notes: 'Intel LGA1700/1851 dies are rectangular. An elongated vertical stripe naturally squashes across the full rectangular heatspreader.'
      }
    : {
        method: 'Standard Pea / Grain of Rice',
        amount: 'Single central drop (~4-5mm diameter, size of a green pea)',
        pattern: 'Central dot pattern',
        notes: 'Mounting pressure will evenly spread the compound into a uniform thin wafer.'
      };

  steps.push({
    id: stepCounter++,
    phase: 'core_bench',
    title: `Mount CPU Cooler (${coolerTypeDesc}): ${coolerName}`,
    shortTitle: 'Cooler & Thermal Paste',
    componentKey: 'cooler',
    componentName: coolerName,
    estimatedMinutes: 15,
    difficulty: 'Moderate',
    toolsNeeded: ['Phillips #2 Screwdriver', 'Thermal Interface Material (Paste)', '99% Isopropyl Alcohol'],
    summary: `Apply thermal paste accurately and mount the ${coolerName}. For AIOs, install pump block bracket now while leaving radiator free for case mounting.`,
    instructions: [
      'Install the appropriate mounting brackets and backplate for your socket onto the motherboard.',
      'CRUCIAL: Inspect the bottom cold plate of the cooler. If there is a CLEAR PLASTIC WARNING STICKER ("Warning: Remove Before Installation"), peel it off immediately!',
      'Check if cooler has factory pre-applied paste. If yes, you do not need additional paste. If bare copper or nickel, proceed to apply paste:',
      `Thermal Paste Application: Apply a ${thermalPasteMethod.amount} directly on top of the CPU heat spreader. Do not manually spread with a spatula unless using liquid metal!`,
      isAio
        ? 'Lower the AIO pump block gently straight down onto the CPU. Tighten thumbscrews in a diagonal cross pattern (X-pattern) 1-2 turns at a time until hand-snug.'
        : 'Mount the heatsink tower straight down on the CPU. Tighten the spring-loaded screws in alternating cross (X) pattern evenly to distribute pressure.',
      'Connect the CPU Cooler fan/pump cable to the "CPU_FAN" header on the motherboard (or "AIO_PUMP" / "W_PUMP" header for liquid pump).'
    ],
    proTips: [
      'The #1 cause of 100°C thermal throttling on newly built PCs is leaving the transparent peel sticker on the cooler bottom. Always verify it is removed!',
      'Tighten cooler screws in an X-pattern (top-left, bottom-right, top-right, bottom-left) in gradual steps to prevent uneven paste squeezing.'
    ],
    warnings: [
      'NEVER overtighten cooler screws with extreme leverage — tighten until firm spring tension stops them.',
      'Do not twist or lift the cooler after touching the paste, as air bubbles will be trapped.'
    ],
    thermalPasteGuide: thermalPasteMethod
  });

  // Step 6: Case Preparation & Standoffs
  const caseName = build.case?.name || 'PC Chassis';
  const moboFormFactor = build.motherboard?.formFactor || 'ATX';
  steps.push({
    id: stepCounter++,
    phase: 'chassis_prep',
    title: `Chassis Preparation & Standoff Verification: ${caseName}`,
    shortTitle: 'Chassis Standoffs',
    componentKey: 'case',
    componentName: caseName,
    estimatedMinutes: 10,
    difficulty: 'Easy',
    toolsNeeded: ['Phillips #2 Screwdriver'],
    summary: `Prepare the ${caseName} interior. Ensure motherboard standoffs match your ${moboFormFactor} board layout precisely.`,
    instructions: [
      'Remove both side panels of the case (tempered glass panel and back cable compartment panel) and set glass safely on a soft towel.',
      'Inspect the motherboard tray standoffs inside the case. Confirm standoffs are installed ONLY where your motherboard has screw holes.',
      'Check the rear I/O shield: Modern motherboards have integrated I/O shields pre-attached. If yours is loose in the box, snap it into the rear case cutout with firm perimeter pressure until it clicks into all 4 corners.',
      'Identify cable routing holes (grommets) around where the motherboard edges will sit.',
      'If your case has a removable top radiator bracket or power supply shroud, prepare them now for ease of access.'
    ],
    proTips: [
      'Count your motherboard screw holes (usually 9 for ATX, 8 for mATX, 4 for ITX) and count standoffs. They must match 1:1.',
      'An extra standoff in an unused spot can short-circuit contacts on the back of the motherboard!'
    ],
    warnings: [
      'Never install a standoff where there is no corresponding hole on the motherboard; it will create a direct electrical short behind the motherboard circuits!'
    ]
  });

  // Step 7: Power Supply (PSU) Installation & Pre-Routing
  const psuName = build.psu?.name || 'Power Supply (PSU)';
  const isModular = build.psu?.modular?.includes('Modular') ?? true;
  steps.push({
    id: stepCounter++,
    phase: 'mounting',
    title: `Mount Power Supply & Cable Staging: ${psuName}`,
    shortTitle: 'Power Supply (PSU)',
    componentKey: 'psu',
    componentName: psuName,
    estimatedMinutes: 12,
    difficulty: 'Easy',
    toolsNeeded: ['Phillips #2 Screwdriver', 'Zip Ties / Velcro Straps'],
    summary: `Install the ${psuName} with the fan facing downwards into the bottom air filter intake. Plug needed modular cables BEFORE sliding unit in.`,
    instructions: [
      isModular
        ? 'Modular PSU Strategy: Plug in only the required modular cables into the PSU power supply block BEFORE mounting it inside the cramped chassis chamber:\n  • 24-Pin ATX Main Motherboard Cable\n  • 8-Pin (or 2x 8-Pin) EPS CPU Power Cable\n  • PCIe 8-pin or 12V-2x6 / 12VHPWR GPU Power Cable\n  • SATA Power Cable (if using SATA SSDs or RGB hubs)'
        : 'Untangle the attached cable bundle and group cables by destination.',
      'Orientation: Orient the PSU with its intake fan pointing DOWNWARDS toward the bottom dust filter vent of the case (unless the case has a solid floor, in which case fan faces upward).',
      'Slide the PSU into the bottom basement chamber from the rear or side.',
      'Align the 4 rear mounting holes and secure with the 4 standard coarse-thread hex screws using your #2 Phillips screwdriver.',
      'Pre-route the EPS 8-pin CPU power cable through the top-rear cutout BEFORE dropping the motherboard in!'
    ],
    proTips: [
      'Pre-routing the top 8-pin CPU power cable through the upper left corner of the case now saves huge frustration later, especially with large air coolers or top fans in the way.',
      'Keep unused modular cables stored in the PSU pouch for future GPU or drive upgrades.'
    ],
    warnings: [
      'NEVER mix modular PSU cables from different power supply brands or models! The pinouts on the power supply side are NOT standardized and will fry hardware instantly.'
    ],
    cableNotes: [
      'Pre-route EPS 8-pin CPU power cable to top-left grommet',
      'Pre-route 24-Pin ATX power cable to right-side grommet',
      'Keep PCIe / 12VHPWR cable accessible through the bottom PSU shroud cutout'
    ]
  });

  // Step 8: Motherboard Chassis Installation
  const moboName = build.motherboard?.name || 'Motherboard';
  steps.push({
    id: stepCounter++,
    phase: 'mounting',
    title: `Mount Motherboard Assembly into Chassis: ${moboName}`,
    shortTitle: 'Mount Motherboard',
    componentKey: 'motherboard',
    componentName: moboName,
    estimatedMinutes: 10,
    difficulty: 'Careful',
    toolsNeeded: ['Phillips #2 Screwdriver'],
    summary: `Lower the motherboard assembly into the case, align the rear I/O ports with the cutout, and fasten all standoff screws.`,
    instructions: [
      'Lay the PC chassis flat on its back on your assembly table.',
      'Gently hold the motherboard by the cooler heatsink and lower edge (avoid touching solder points or delicate SMD resistors).',
      'Angle the rear I/O connectors into the rear I/O shield aperture, sliding it backwards until it aligns over the center guide standoff.',
      'Once resting flat on all standoffs, install the center screw first loosely to hold position.',
      'Install remaining standoff screws with your Phillips #2 screwdriver. Tighten each until snug — do not overtighten and crack the motherboard fiberglass substrate!'
    ],
    proTips: [
      'Most modern chassis have a center standoff with a raised alignment peg rather than a screw hole. Seat the motherboard over this peg first.',
      'Check rear ports: ensure no little metal spring ground tabs from the I/O shield are sticking INSIDE the USB or HDMI ports!'
    ],
    warnings: [
      'Use the correct fine-thread motherboard screws (usually 6-32 or M3 provided with the chassis). Never force coarse PSU screws into standoffs.'
    ]
  });

  // Step 9: AIO Radiator Mounting (if liquid cooled)
  if (isAio) {
    steps.push({
      id: stepCounter++,
      phase: 'mounting',
      title: `Mount Liquid Cooler Radiator & Exhaust Fans: ${coolerName}`,
      shortTitle: 'Mount Radiator',
      componentKey: 'cooler',
      componentName: coolerName,
      estimatedMinutes: 10,
      difficulty: 'Moderate',
      toolsNeeded: ['Phillips #2 Screwdriver'],
      summary: `Mount the ${cooler?.type || 'AIO'} radiator securely to the top (preferred exhaust) or front of the case.`,
      instructions: [
        'Top Exhaust Mount (Recommended): Mount the radiator to the top ceiling rails of the case with fans blowing upward/outward as exhaust.',
        'If top clearance is blocked by RAM, mount radiator in the front bracket with hoses entering at the bottom if possible to avoid air cavitation noise.',
        'Fasten the long radiator fan screws through the case frame and fans into the radiator channel with steady hand torque.',
        'Daisy-chain radiator fan PWM cables and connect to CPU_OPT or SYS_FAN header.'
      ],
      proTips: [
        'Top mounting is the optimal orientation: air pockets naturally rise to the highest point in the loop (the top radiator tank), keeping the pump block completely submerged and silent.',
        'Never position the pump block as the highest physical point in the cooling loop.'
      ],
      warnings: [
        'Be careful not to pierce radiator water fins with screws that are too long.'
      ]
    });
  }

  // Step 10: Front Panel & Main Power Cabling
  steps.push({
    id: stepCounter++,
    phase: 'cabling',
    title: 'Connect Front Panel Header & Primary Power Cables',
    shortTitle: 'Front Panel & Cables',
    estimatedMinutes: 15,
    difficulty: 'Moderate',
    toolsNeeded: ['Phillips #2 Screwdriver', 'Flashlight / Phone Light'],
    summary: 'Connect Front Panel switches, Front USB 3.0 / USB-C, HD Audio, and the massive 24-Pin ATX main power cord.',
    instructions: [
      'Connect the 24-Pin ATX Main Motherboard Power cable firmly until the latch snaps over the connector tab.',
      'Connect the 8-Pin (or 4+4) EPS CPU Power connector at the top left corner of the motherboard.',
      'Front Panel Header: Connect the small individual 1-pin/2-pin case wires (Power Switch, Reset Switch, Power LED, HDD LED) onto the JFP1 header according to the motherboard pin diagram (+/- polarity matters for LEDs, not for Power/Reset switches).',
      'Connect Front USB 3.0 Header (blue 19-pin cable): Be extremely gentle aligning the keyed notch — the pins bend very easily!',
      'Connect Front USB Type-C Key-A internal cable if provided by case.',
      'Connect Front HD Audio (9-pin with single blocked pin) onto the AAFP header at the bottom left audio corner of the motherboard.'
    ],
    proTips: [
      'If you have large hands, use needle-nose tweezers or take a close-up photo of the JFP1 front-panel pins with your smartphone flashlight to see positive (+) markings.',
      'Modern cases often have a unified single front-panel block (F_PANEL) that plugs in with one easy motion.'
    ],
    warnings: [
      'USB 3.0 front header pins bend under minimal force. Align the key slot straight before pushing!'
    ],
    cableNotes: [
      'Bundle front panel wires together with zip ties behind motherboard tray',
      'Ensure no loose cables are dangling into case fan blades'
    ]
  });

  // Step 11: GPU Installation
  const gpuName = build.gpu?.name || 'Dedicated Graphics Card (GPU)';
  const gpuTdp = build.gpu?.tdp || 200;
  const isHighPowerGpu = gpuTdp >= 250;
  steps.push({
    id: stepCounter++,
    phase: 'mounting',
    title: build.gpu ? `Install Graphics Card: ${gpuName}` : 'Install Dedicated Graphics Card (GPU)',
    shortTitle: 'Install GPU',
    componentKey: 'gpu',
    componentName: gpuName,
    estimatedMinutes: 8,
    difficulty: 'Careful',
    toolsNeeded: ['Phillips #2 Screwdriver'],
    summary: `Insert the ${gpuName} into the topmost PCIe 5.0/4.0 x16 slot and connect dedicated power feeds.`,
    instructions: [
      'Identify the topmost PCIe x16 slot (nearest to the CPU) — this slot has direct 16-lane CPU interconnect bandwidth.',
      'Remove the 2 or 3 metal PCIe slot expansion covers from the back of the case aligned with that slot.',
      'Unlock the PCIe retention latch at the right edge of the slot (press latch down/outward).',
      'Align the GPU golden fingers with the slot and press straight down firmly until the latch snaps shut with a crisp click.',
      'Fasten the GPU bracket to the rear case frame with 2 coarse-thread screws.',
      isHighPowerGpu
        ? 'GPU Power Connection: If your GPU uses the new 12V-2x6 / 12VHPWR 16-pin connector, insert it completely until ZERO gap is visible between the plug and socket housing (audible click required to avoid melting). If using standard 8-pin PCIe cables, use separate individual cables from PSU rather than daisy-chained pigtails!'
        : 'Connect PCIe 6+2 pin power cables firmly until latched.'
    ],
    proTips: [
      isHighPowerGpu 
        ? 'CRITICAL FOR 12VHPWR: Ensure the 16-pin power connector is seated 100% flush with no visible gaps. Do not aggressively bend the cable within 35mm of the connector head!'
        : 'Avoid daisy-chaining a single split cable for high-power GPUs. Run two independent cables straight from the PSU for stable 12V voltage delivery.',
      'If your GPU includes an anti-sag support bracket, install it now under the far right corner of the GPU card.'
    ],
    warnings: [
      'Failure to fully seat 12VHPWR connectors can lead to localized pin resistance and thermal damage. Check all 4 sides with a flashlight for zero gap!'
    ],
    cableNotes: [
      'Route GPU power cable cleanly upwards from PSU basement grommet',
      'Avoid cable tension pulling down on the PCIe slot'
    ]
  });

  // Step 12: Cable Management & Tidying
  steps.push({
    id: stepCounter++,
    phase: 'cabling',
    title: 'Professional Cable Management & Clean Routing',
    shortTitle: 'Cable Management',
    estimatedMinutes: 15,
    difficulty: 'Easy',
    toolsNeeded: ['Zip Ties / Velcro Straps & Snips'],
    summary: 'Organize the back cable compartment using Velcro tie-downs and channel routing for clean airflow and easy panel closure.',
    instructions: [
      'Group thick cables (24-pin ATX, EPS CPU, GPU) along the main center spine or routing channel of the chassis.',
      'Use the case built-in Velcro straps to secure the primary trunk bundle first.',
      'Run thinner cables (front panel, fan PWM, ARGB headers, front audio) through secondary perimeter channels.',
      'Keep the bottom PSU basement clear enough for excess modular slack, leaving room for PSU intake and hard drive cages.',
      'Gently compress the harness and ensure the rear steel/mesh side panel can slide shut effortlessly without bulging.'
    ],
    proTips: [
      'Start tying from top to bottom. Pull zip ties snug, but not so tight that they crimp the wire insulation.',
      'Always snip zip-tie tails flush with flush-cutters so no sharp plastic dagger edges remain to scratch your knuckles later.'
    ],
    warnings: [
      'Ensure no loose cables touch rotating case fan blades or the back of the GPU heatsink.',
      'Do not force the rear side panel shut over a thick bulge; redistribute the harness.'
    ]
  });

  // Step 13: First Boot, POST & BIOS Configuration
  steps.push({
    id: stepCounter++,
    phase: 'first_boot',
    title: 'First Power-On (POST), BIOS & Driver Checklist',
    shortTitle: 'First Boot & POST',
    estimatedMinutes: 10,
    difficulty: 'Easy',
    toolsNeeded: [],
    summary: 'Perform the initial power-on, verify Power-On Self Test (POST), enter BIOS, and enable memory overclock profile (XMP/EXPO).',
    instructions: [
      'PLUG MONITOR INTO GPU: Connect your DisplayPort or HDMI cable directly into the dedicated GPU output, NOT the motherboard I/O ports!',
      'Flip the PSU rocker switch from O (Off) to I (On). Motherboard RGB/standby LEDs should illuminate.',
      'Press the case Power button.',
      'Memory Training Note: On modern AM5 and DDR5 platforms, the first boot can take 45 to 90 seconds while the motherboard trains the high-frequency memory timings (fans will spin, screen may remain black temporarily — DO NOT panic or power off!).',
      'Once display appears, tap DEL or F2 repeatedly to enter the BIOS Setup screen.',
      'Verify: Check that CPU model, all RAM sticks (correct capacity and channel count), and your M.2 NVMe SSD are detected in BIOS.',
      'Enable Memory Profile: Turn on AMD EXPO or Intel XMP to run your RAM at its rated speed instead of base JEDEC 4800MHz.',
      'Set Fan Curve: Ensure CPU cooler fan mode is set to PWM and liquid pump is set to 100% or balanced curve.',
      'Save changes and Reboot (F10) to begin operating system installation.'
    ],
    proTips: [
      'If the screen stays black for over 2 minutes on first boot, check the 4 motherboard EZ Debug LEDs (CPU, DRAM, VGA, BOOT) near the 24-pin header to identify where POST stalled.',
      'Plug your Windows or Linux installation USB thumb drive into a rear USB 3.0 port.'
    ],
    warnings: [
      'Plugging monitor into the motherboard instead of the GPU is the most common beginner mistake, resulting in zero display output or running on weak integrated graphics.'
    ]
  });

  const generalCableManagementTips: CableTip[] = [
    {
      title: 'Separate High-Power Trunks from Sensitive Signal Wires',
      description: 'Route heavy 12V/24V high-current cables along the central chassis spine. Keep delicate front panel audio cables routed along the outer perimeter to prevent EMI buzz in analog headphones.',
      cablesInvolved: ['24-Pin ATX', 'HD Audio', 'Front Panel'],
      importance: 'pro-tip'
    },
    {
      title: 'Direct PCIe Independent Feeds (No Pigtail Daisy Chains)',
      description: 'For gaming graphics cards exceeding 225W, run individual, separate 8-pin PCIe cables directly from the power supply rather than daisy-chaining a single split cable. This prevents PCIe cable heating and transient voltage drops.',
      cablesInvolved: ['PCIe 8-Pin', '12VHPWR', 'GPU Power'],
      importance: 'critical'
    },
    {
      title: 'Top-Left EPS 8-Pin CPU Pre-Routing',
      description: 'Always guide the 8-pin EPS CPU power wire through the top-left chassis cutout BEFORE installing the motherboard and large cooler heatsinks. Reaching that corner after mounting is notoriously tight.',
      cablesInvolved: ['EPS 8-Pin CPU'],
      importance: 'critical'
    },
    {
      title: 'Fan Hub Daisy-Chaining & Slack Tuck',
      description: 'Daisy-chain case fan PWM and 3-pin 5V ARGB connectors along the case rails, tucking the excess slack into bottom chassis grooves before connecting to motherboard headers.',
      cablesInvolved: ['PWM 4-Pin Fans', 'ARGB 3-Pin 5V'],
      importance: 'cleanliness'
    }
  ];

  const firstBootChecklist: string[] = [
    'Monitor cable plugged into GPU port (NOT motherboard video ports)',
    'PSU power rocker switched to "I" (On)',
    'CPU cooler plastic peel sticker removed prior to mounting',
    'RAM clicked into Dual Channel slots A2 & B2 (Slots 2 & 4)',
    '12VHPWR or PCIe power clicked flush into graphics card with zero gap',
    'Front panel Power SW header connected to correct motherboard pins',
    'First boot memory training allowed to complete (~60-90 seconds on DDR5 platforms)',
    'XMP / EXPO memory profile enabled in BIOS'
  ];

  const totalEstimatedMinutes = steps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

  return {
    totalEstimatedMinutes,
    tools,
    steps,
    generalCableManagementTips,
    firstBootChecklist
  };
}
