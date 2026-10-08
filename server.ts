import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { COMPONENTS_CATALOG } from './src/data/components';
import { CpuComponent, MotherboardComponent } from './src/types/hardware';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google Gemini AI SDK on the server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. API: Get all hardware components
app.get('/api/components', (_req: Request, res: Response) => {
  res.json({ components: COMPONENTS_CATALOG });
});

// 1.1 API: Relay Discord Webhook Share
app.post('/api/share/discord', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, payload } = req.body;

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({ error: 'Valid Discord webhook URL is required.' });
    }

    // Verify webhook URL format for Discord
    const discordWebhookRegex = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;
    if (!discordWebhookRegex.test(webhookUrl.trim())) {
      return res.status(400).json({ error: 'Invalid Discord webhook URL format. Expected: https://discord.com/api/webhooks/{id}/{token}' });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Payload object is required.' });
    }

    const discordResponse = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return res.status(discordResponse.status).json({
        error: `Discord responded with HTTP ${discordResponse.status}: ${errorText || discordResponse.statusText}`,
      });
    }

    return res.json({ success: true, message: 'Build successfully shared to Discord server!' });
  } catch (error: any) {
    console.error('Error forwarding webhook to Discord:', error);
    return res.status(500).json({ error: error?.message || 'Failed to dispatch webhook to Discord.' });
  }
});

// 2. API: AI Auto-Build (Budget PC Configurator)
app.post('/api/ai/auto-build', async (req: Request, res: Response) => {
  try {
    const { budget, currency = 'USD', purpose = 'gaming', wishes = '', language = 'en' } = req.body;
    const numericBudget = Number(budget) || 1000;
    const budgetInUsd = currency === 'UZS' ? Math.round(numericBudget / 12800) : numericBudget;

    // Condensed catalog summary for the LLM to choose authentic parts
    const catalogSummary = COMPONENTS_CATALOG.map((c) => ({
      id: c.id,
      cat: c.category,
      name: c.name,
      priceUsd: c.priceUsd,
      priceUzs: c.priceUzs,
      tdp: c.tdp,
    }));

    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a world-class PC hardware engineering expert and master builder.
User Request:
- Target Budget: ${numericBudget} ${currency} (~$${budgetInUsd} USD)
- Primary Purpose: ${purpose} (e.g. gaming, office, programming, video_editing, rendering_3d, streaming)
- Special Wishes: ${wishes || 'None'}
- Response Language: ${language} (MUST provide explanations, summaries, pros, and cons in this language: 'en' for English, 'uz' for Uzbek, 'ru' for Russian)

Hardware Catalog available:
${JSON.stringify(catalogSummary)}

Task:
Generate 3 distinct, 100% compatible PC build configurations:
1. "Budget" (maximum cost-efficiency, strictly staying within or under budget)
2. "Balanced" (sweet spot performance-to-dollar ratio)
3. "High-End" (premium components, slightly higher budget ceiling or maximum headroom for future upgrades)

CRITICAL Hardware Compatibility Rules:
- CPU socket (AM4, AM5, LGA1700) MUST match Motherboard socket.
- RAM type (DDR4 or DDR5) MUST match Motherboard and CPU RAM type.
- Case must fit the Motherboard form factor.
- PSU wattage must comfortably power CPU + GPU + system overhead (e.g., at least 650W for RTX 4070/RX 7800XT, 750W-850W for 4080/4090).
- Cooler must match CPU socket and handle CPU TDP.

If the budget is genuinely too tight for the user's ambitious goal (e.g., $300 for 4K ray tracing), set isBudgetTight to true and provide clear, empathetic advice on compromises (like APU integrated graphics, saving an extra $100, or prioritizing GPU first).

Return purely JSON matching this exact structure:
{
  "purpose": "${purpose}",
  "budgetTarget": ${numericBudget},
  "currency": "${currency}",
  "isBudgetTight": boolean,
  "advice": "string in ${language}",
  "tiers": [
    {
      "tierName": "Budget",
      "totalPriceUsd": number,
      "totalPriceUzs": number,
      "summary": "Short 1-2 sentence tier description in ${language}",
      "components": [
        {
          "category": "cpu" | "motherboard" | "ram" | "gpu" | "storage" | "psu" | "case" | "cooler",
          "componentId": "matching catalog id if possible or realistic fallback",
          "name": "full component name",
          "priceUsd": number,
          "priceUzs": number,
          "reason": "1 concise sentence why this component was chosen for this budget & purpose"
        }
      ],
      "pros": ["bullet 1 in ${language}", "bullet 2 in ${language}"],
      "cons": ["bullet 1 in ${language}", "bullet 2 in ${language}"],
      "fpsEstimate": [
        { "game": "Counter-Strike 2", "fps1080p": 240, "fps1440p": 180 },
        { "game": "Cyberpunk 2077", "fps1080p": 75, "fps1440p": 55 }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const rawText = response.text || '{}';
      const parsedData = JSON.parse(rawText);
      return res.json(parsedData);
    }

    // Algorithmic Fallback if no API key is available
    return res.json(generateRuleBasedBuild(budgetInUsd, numericBudget, currency, purpose, language));
  } catch (error: any) {
    console.error('Error in AI Auto-Build:', error);
    // Return graceful fallback build
    const numericBudget = Number(req.body.budget) || 1000;
    const currency = req.body.currency || 'USD';
    const budgetInUsd = currency === 'UZS' ? Math.round(numericBudget / 12800) : numericBudget;
    return res.json(generateRuleBasedBuild(budgetInUsd, numericBudget, currency, req.body.purpose || 'gaming', req.body.language || 'en'));
  }
});

// 3. API: AI Hardware Chat Assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, currentBuild = {}, language = 'en' } = req.body;

    const buildDetails = Object.entries(currentBuild)
      .filter(([_, comp]) => Boolean(comp))
      .map(([cat, comp]: [string, any]) => `${cat.toUpperCase()}: ${comp.name} ($${comp.priceUsd})`)
      .join('\n');

    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are "ApexAI", an elite PC hardware specialist, overclocker, and hardware engineer.
The user is asking: "${message}"

User's Currently Selected PC Build:
${buildDetails || 'No components selected yet in workbench.'}

Instructions:
- Provide an insightful, highly accurate hardware response.
- Answer in language: ${language} ('en' = English, 'uz' = Uzbek, 'ru' = Russian).
- Highlight compatibility, bottleneck ratios, power requirements, or value-for-money upgrades when relevant.
- Keep the tone enthusiastic, professional, gamer-friendly, and concise (2-4 paragraphs or formatted bullet points).
- If they ask for game FPS, give realistic estimates.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ reply: response.text || 'Unable to generate response at this time.' });
    }

    // Default intelligent response if offline
    let reply = `Great question! Looking at your current build configuration:\n\n`;
    if (buildDetails) {
      reply += `Active build components:\n${buildDetails}\n\n`;
    }
    reply += `To maximize your performance per dollar, always ensure your CPU socket matches your motherboard (e.g. AM5 for Ryzen 7000, LGA1700 for Intel 13th/14th Gen) and your power supply wattage leaves at least a 25-30% buffer over system TDP.`;
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in AI Chat:', error);
    res.status(500).json({ error: 'Failed to process AI chat inquiry' });
  }
});

// 4. API: AI Build Analysis (Strengths, Weaknesses, and Upgrade Paths)
app.post('/api/ai/analyze-build', async (req: Request, res: Response) => {
  try {
    const { build = {}, currency = 'USD', language = 'en' } = req.body;

    const componentsList: string[] = [];
    let totalUsd = 0;
    let totalUzs = 0;
    let totalTdp = 0;

    Object.entries(build).forEach(([cat, comp]: [string, any]) => {
      if (comp) {
        componentsList.push(`${cat.toUpperCase()}: ${comp.name} ($${comp.priceUsd} / ${comp.priceUzs?.toLocaleString()} UZS) - ${comp.tdp || 0}W TDP`);
        totalUsd += comp.priceUsd || 0;
        totalUzs += comp.priceUzs || 0;
        totalTdp += comp.tdp || 0;
      }
    });

    if (componentsList.length === 0) {
      return res.status(400).json({ error: 'No components in build to analyze.' });
    }

    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a world-leading PC hardware systems architect, hardware engineer, and senior hardware reviewer.
Perform a thorough, expert-level hardware diagnostic and architectural analysis on this user PC configuration:

Current System Components:
${componentsList.join('\n')}

Total Calculated Hardware Cost: $${totalUsd} USD (~${totalUzs.toLocaleString()} UZS)
Total Raw Component TDP: ~${totalTdp}W

Language: "${language}" ('en' for English, 'uz' for Uzbek, 'ru' for Russian).
CRITICAL: Every title, description, summary, and recommendation in your response MUST be translated into "${language}".

Analyze:
1. Overall build synergy & architecture
2. Specific hardware strengths (e.g. AM5 platform longevity, thermal efficiency, memory speed/latency, GPU VRAM headroom, NVMe PCIe speeds)
3. Specific weaknesses, trade-offs, or potential bottlenecks (e.g. limited PSU wattage buffer, DDR4 memory ceiling, case clearance, lack of iGPU, cooling limits)
4. Concrete, actionable upgrade paths (3 sequential stages with predicted real-world benefit)

Return ONLY valid JSON matching this schema:
{
  "overallScore": number (e.g. 8.5),
  "tierLabel": "string in ${language}",
  "summary": "2-3 sentences in ${language}",
  "strengths": [
    {
      "title": "short title in ${language}",
      "description": "1-2 sentences explanation in ${language}"
    }
  ],
  "weaknesses": [
    {
      "title": "short title in ${language}",
      "description": "1-2 sentences explanation in ${language}",
      "severity": "low" | "medium" | "high"
    }
  ],
  "upgradeRoadmap": [
    {
      "phase": "string in ${language} (e.g. Phase 1: Near-term / Immediate)",
      "targetComponent": "category or component name",
      "recommendation": "1-2 sentences in ${language}",
      "estimatedImpact": "e.g. +20% 1440p FPS or +40% faster rendering"
    }
  ],
  "longevityYears": "string (e.g. 4-5 years)",
  "primaryUseVerdict": "string in ${language}"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const raw = response.text || '{}';
      return res.json(JSON.parse(raw));
    }

    // Algorithmic Fallback if offline
    return res.json(generateFallbackAnalysis(build, totalUsd, language));
  } catch (error: any) {
    console.error('Error in AI Build Analysis:', error);
    return res.json(generateFallbackAnalysis(req.body.build || {}, 1200, req.body.language || 'en'));
  }
});

// 4. API: Veo Video Generation (Animate PC battlestation photo into cinematic video)
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/jpeg', aspectRatio = '16:9' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const videoConfig: any = {
      numberOfVideos: 1,
      aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
    };

    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Cinematic rotating 3D camera pan across high-end RGB gaming PC setup with glowing neon reflections and crystal clear glass panel',
      config: videoConfig,
    };

    if (imageBase64) {
      const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      payload.image = {
        imageBytes: cleanedBase64,
        mimeType: mimeType || 'image/jpeg',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({ error: error?.message || 'Failed to initialize video generation' });
  }
});

app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Missing operationName' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: Boolean(updated.done) });
  } catch (error: any) {
    console.error('Error checking video status:', error);
    res.status(500).json({ error: error?.message || 'Failed to check video status' });
  }
});

app.post('/api/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Missing operationName' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or video generation incomplete' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(502).json({ error: 'Failed to download video stream from upstream source' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch video file' });
  }
});

// Helper for offline / fallback builds
function generateRuleBasedBuild(budgetInUsd: number, rawBudget: number, currency: string, purpose: string, language: string) {
  const isBudgetTier = budgetInUsd < 850;
  
  // Pick curated components
  const cpu = (isBudgetTier
    ? COMPONENTS_CATALOG.find((c) => c.id === 'cpu-r5-5600x')
    : budgetInUsd > 1800
    ? COMPONENTS_CATALOG.find((c) => c.id === 'cpu-r7-7800x3d')
    : COMPONENTS_CATALOG.find((c) => c.id === 'cpu-r5-7600')) as CpuComponent;

  const mobo = (cpu.socket === 'AM4'
    ? COMPONENTS_CATALOG.find((c) => c.id === 'mobo-asrock-b450m-hdv')
    : COMPONENTS_CATALOG.find((c) => c.id === 'mobo-msi-b650m-a-wifi')) as MotherboardComponent;

  const ram = mobo.ramType === 'DDR4'
    ? COMPONENTS_CATALOG.find((c) => c.id === 'ram-corsair-lpx-16-d4')!
    : COMPONENTS_CATALOG.find((c) => c.id === 'ram-corsair-vengeance-32-d5')!;

  const gpu = budgetInUsd > 1800
    ? COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rtx-4080-super-16g')!
    : budgetInUsd > 1100
    ? COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rtx-4070-super-12g')!
    : isBudgetTier
    ? COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rx-6600-8g')!
    : COMPONENTS_CATALOG.find((c) => c.id === 'gpu-rtx-4060-8g')!;

  const storage = COMPONENTS_CATALOG.find((c) => c.id === 'ssd-crucial-p3-plus-1tb')!;
  const psu = budgetInUsd > 1500
    ? COMPONENTS_CATALOG.find((c) => c.id === 'psu-bequiet-pure-power-850')!
    : COMPONENTS_CATALOG.find((c) => c.id === 'psu-corsair-cv650')!;
  const pcCase = COMPONENTS_CATALOG.find((c) => c.id === 'case-montech-air903-max')!;
  const cooler = COMPONENTS_CATALOG.find((c) => c.id === 'cooler-thermalright-peerless-120')!;

  const parts = [cpu, mobo, ram, gpu, storage, psu, pcCase, cooler];
  const totalUsd = parts.reduce((sum, p) => sum + p.priceUsd, 0);
  const totalUzs = parts.reduce((sum, p) => sum + p.priceUzs, 0);

  return {
    purpose,
    budgetTarget: rawBudget,
    currency,
    isBudgetTight: budgetInUsd < 500,
    advice: language === 'uz'
      ? 'Optimal komponentlar tanlandi. Har bir detal to\'liq moslik tekshiruvidan o\'tgan.'
      : language === 'ru'
      ? 'Подобраны сбалансированные компоненты. Все детали на 100% совместимы.'
      : 'Optimal components curated with guaranteed 100% hardware synergy and airflow.',
    tiers: [
      {
        tierName: 'Balanced',
        totalPriceUsd: totalUsd,
        totalPriceUzs: totalUzs,
        summary: language === 'uz'
          ? 'Narx va unumdorlik bo\'yicha eng yaxshi tanlov'
          : language === 'ru'
          ? 'Лучшее соотношение цены и мощности'
          : 'Best price-to-performance ratio for smooth 1080p/1440p gaming and workloads',
        components: parts.map((p) => ({
          category: p.category,
          componentId: p.id,
          name: p.name,
          priceUsd: p.priceUsd,
          priceUzs: p.priceUzs,
          reason: `High reliability and performance standard in the ${p.brand} ecosystem.`,
        })),
        pros: ['Guaranteed socket and RAM synergy', 'High efficiency power supply', 'Excellent airflow case'],
        cons: ['Standard air cooling', '1TB initial storage'],
        fpsEstimate: [
          { game: 'Counter-Strike 2', fps1080p: 280, fps1440p: 210 },
          { game: 'Cyberpunk 2077', fps1080p: 85, fps1440p: 62 },
        ],
      },
    ],
  };
}

// Fallback AI Analysis generator
function generateFallbackAnalysis(build: any, totalUsd: number, language: string) {
  const cpu = build.cpu;
  const gpu = build.gpu;
  const ram = build.ram;
  const mobo = build.motherboard;

  const isHighEnd = totalUsd > 1800;
  const isBudget = totalUsd < 800;
  const score = isHighEnd ? 9.2 : isBudget ? 7.6 : 8.5;

  return {
    overallScore: score,
    tierLabel: language === 'uz'
      ? (isHighEnd ? "Yuqori toifadagi Flagman Tizim" : isBudget ? "Boshlang'ich Byudjet Tizimi" : "Muvozanatli O'rta-Yuqori Segment")
      : language === 'ru'
      ? (isHighEnd ? "Флагманская Конфигурация для 4K и Pro-Задач" : isBudget ? "Доступная Базовая Сборка" : "Сбалансированный Средне-Высокий Уровень")
      : (isHighEnd ? "Flagship 4K & Workstation Powerhouse" : isBudget ? "Entry Value Starter PC" : "Balanced High-FPS Sweet Spot"),
    summary: language === 'uz'
      ? `Ushbu konfiguratsiya ${cpu ? cpu.name : 'zamonaviy protsessor'} va ${gpu ? gpu.name : 'grafika'} bilan yaxshi uyg'unlashgan. Kompyuter 1080p va 1440p o'yinlar hamda og'ir yuklamalarni samarali bajaradi.`
      : language === 'ru'
      ? `Конфигурация грамотно сбалансирована вокруг связки ${cpu ? cpu.name : 'процессора'} и ${gpu ? gpu.name : 'видеокарты'}. Обеспечивает отличную производительность в современных играх и рабочих программах.`
      : `This setup strikes an impressive architectural balance featuring ${cpu ? cpu.name : 'a capable processor'} alongside ${gpu ? gpu.name : 'graphics hardware'}. It delivers dependable 1080p/1440p high-refresh gaming and multi-threaded throughput.`,
    strengths: [
      {
        title: language === 'uz' ? "Platforma va arxitektura mustahkamligi" : language === 'ru' ? "Надежная платформа и сокет" : "Platform Longevity & Architecture",
        description: mobo?.socket === 'AM5'
          ? "AM5 platformasi 2027-yilgacha bo'lajak protsessorlar uchun to'liq mos keladi va kelajakdagi yangilanishlarga tayyor."
          : "Zamonaviy PCIe 4.0/5.0 shinasi va yuqori tezlikdagi xotira kontrolleri."
      },
      {
        title: language === 'uz' ? "Grafik quvvat va VRAM zaxirasi" : language === 'ru' ? "Графическая производительность" : "Graphics Efficiency & VRAM",
        description: gpu
          ? `${gpu.name} o'yinlarda yuqori kadrlarni va zamonaviy drayver qo'llab-quvvatlashini ta'minlaydi.`
          : "Tizim barqaror va samarali quvvat iste'moliga ega."
      },
      {
        title: language === 'uz' ? "Sovutish va havo oqimi" : language === 'ru' ? "Охлаждение и акустика" : "Thermal Dissipation Margin",
        description: "Optimal issiqlik chiqarish tufayli protsessor va videokarta uzoq vaqt maksimal chastotada ishlaydi."
      }
    ],
    weaknesses: [
      {
        title: language === 'uz' ? "Xotira va saqlash chegaralari" : language === 'ru' ? "Потенциал расширения памяти" : "Memory Bandwidth Ceiling",
        description: ram?.capacityGb <= 16
          ? "Kelgusida 32GB ga oshirish og'ir o'yinlar va videoni qayta ishlash uchun tavsiya etiladi."
          : "Tezkor M.2 SSD qo'shimcha slotlariga e'tibor qaratish kerak.",
        severity: "medium"
      },
      {
        title: language === 'uz' ? "Quvvat zaxirasi chegarasi" : language === 'ru' ? "Запас мощности блока питания" : "Power Supply Headroom",
        description: "Kelajakda kuchliroq flagman videokartaga o'tish uchun blok pitaniya quvvatini oshirish talab qilinishi mumkin.",
        severity: "low"
      }
    ],
    upgradeRoadmap: [
      {
        phase: language === 'uz' ? "1-Bosqich: Yaqin oradagi modernizatsiya" : language === 'ru' ? "Этап 1: Ближайший апгрейд" : "Phase 1: Near-Term Optimization",
        targetComponent: "RAM / Memory",
        recommendation: "Qo'shimcha RAM modullari yoki tezroq DDR5 to'plamiga o'tish.",
        estimatedImpact: "+10-15% minimum 1% lows FPS"
      },
      {
        phase: language === 'uz' ? "2-Bosqich: O'rta muddatli saqlash" : language === 'ru' ? "Этап 2: Расширение накопителей" : "Phase 2: High-Speed Storage",
        targetComponent: "Storage (NVMe SSD)",
        recommendation: "Yana bitta 2TB PCIe 4.0 NVMe SSD qo'shish.",
        estimatedImpact: "Instant asset loading"
      },
      {
        phase: language === 'uz' ? "3-Bosqich: Uzoq muddatli GPU almashinuvi" : language === 'ru' ? "Этап 3: Долгосрочный апгрейд GPU" : "Phase 3: Long-Term GPU Upgrade",
        targetComponent: "GPU (Graphics Card)",
        recommendation: "Keyingi avlod videokartasiga o'tish bilan birga 850W PSU o'rnatish.",
        estimatedImpact: "+40-60% 4K Ultra ray tracing"
      }
    ],
    longevityYears: isHighEnd ? "4-6 years" : "3-4 years",
    primaryUseVerdict: language === 'uz'
      ? "Kibersport, 1440p AAA o'yinlar va dasturlash uchun a'lo darajadagi kompyuter."
      : language === 'ru'
      ? "Превосходно подходит для киберспорта, 1440p AAA-гейминга и программирования."
      : "Excellent balance for competitive esports, 1440p high-refresh gaming, and programming."
  };
}

// Full-Stack Server Integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexPC Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
