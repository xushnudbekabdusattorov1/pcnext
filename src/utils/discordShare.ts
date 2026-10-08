import { PCBuild, Currency } from '../types/hardware';
import { calculateTotalPrice, checkCompatibility } from './compatibility';

export interface DiscordShareOptions {
  build: PCBuild;
  buildName?: string;
  notes?: string;
  tags?: string[];
  currency: Currency;
  customMessage?: string;
  webhookUrl: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds: Array<{
    title: string;
    description?: string;
    url?: string;
    color: number;
    fields: DiscordEmbedField[];
    footer?: {
      text: string;
      icon_url?: string;
    };
    timestamp?: string;
  }>;
}

/**
 * Generates the sharable URL link for the specified PC configuration
 */
export function generateBuildShareUrl(build: PCBuild): string {
  const ids = Object.values(build)
    .filter(Boolean)
    .map((c) => c?.id)
    .join(',');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://apexpc.builder';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const url = new URL(pathname, origin);
  if (ids) {
    url.searchParams.set('build', ids);
  }
  return url.toString();
}

/**
 * Builds a structured, rich Discord Webhook payload with embed formatting
 */
export function buildDiscordPayload(options: {
  build: PCBuild;
  buildName?: string;
  notes?: string;
  tags?: string[];
  currency: Currency;
  customMessage?: string;
  shareUrl: string;
}): DiscordWebhookPayload {
  const { build, buildName, notes, tags, currency, customMessage, shareUrl } = options;

  const { usd, uzs } = calculateTotalPrice(build);
  const formattedPrice = currency === 'USD' 
    ? `$${usd.toLocaleString()}` 
    : `${uzs.toLocaleString()} UZS (~$${usd.toLocaleString()})`;

  const compatibility = checkCompatibility(build);
  const selectedCount = Object.values(build).filter(Boolean).length;

  const fields: DiscordEmbedField[] = [];

  // Core specs overview
  if (build.cpu) {
    fields.push({
      name: '⚙️ Processor (CPU)',
      value: `**${build.cpu.name}**\n${build.cpu.socket} • ${build.cpu.cores}C/${build.cpu.threads}T • ${build.cpu.tdp}W`,
      inline: true,
    });
  }

  if (build.gpu) {
    fields.push({
      name: '🎮 Graphics (GPU)',
      value: `**${build.gpu.name}**\n${build.gpu.vramGb}GB ${build.gpu.vramType} • ${build.gpu.chipset} • ${build.gpu.tdp}W`,
      inline: true,
    });
  }

  if (build.motherboard) {
    fields.push({
      name: '🎛️ Motherboard',
      value: `**${build.motherboard.name}**\n${build.motherboard.chipset} (${build.motherboard.socket}) • ${build.motherboard.formFactor}`,
      inline: true,
    });
  }

  if (build.ram) {
    fields.push({
      name: '⚡ Memory (RAM)',
      value: `**${build.ram.name}**\n${build.ram.capacityGb}GB ${build.ram.ramType} @ ${build.ram.speedMhz}MHz`,
      inline: true,
    });
  }

  if (build.storage) {
    fields.push({
      name: '💾 Storage (SSD)',
      value: `**${build.storage.name}**\n${build.storage.capacityGb >= 1000 ? `${build.storage.capacityGb / 1000}TB` : `${build.storage.capacityGb}GB`} ${build.storage.type} (${build.storage.interface})`,
      inline: true,
    });
  }

  if (build.psu) {
    fields.push({
      name: '🔌 Power Supply (PSU)',
      value: `**${build.psu.name}**\n${build.psu.wattage}W • ${build.psu.efficiency} • ${build.psu.modular}`,
      inline: true,
    });
  }

  if (build.case) {
    fields.push({
      name: '🖥️ PC Case',
      value: `**${build.case.name}**\n${build.case.formFactorSupport.join('/')} • ${build.case.sidePanel}`,
      inline: true,
    });
  }

  if (build.cooler) {
    fields.push({
      name: '❄️ CPU Cooler',
      value: `**${build.cooler.name}**\n${build.cooler.type} • TDP Rating: ${build.cooler.maxTdpDissipation}W`,
      inline: true,
    });
  }

  // System stats summary field
  fields.push({
    name: '📊 System Metrics',
    value: `• **Est. Peak Draw:** ~${compatibility.totalTdp}W\n• **Rec. PSU:** ${compatibility.recommendedPsu}W+\n• **Synergy:** ${compatibility.isCompatible ? '✅ 100% Compatible' : `⚠️ ${compatibility.issues.length} issue(s) flagged`}`,
    inline: false,
  });

  // Tags if any
  if (tags && tags.length > 0) {
    fields.push({
      name: '🏷️ Tags',
      value: tags.map((t) => `\`${t}\``).join('  '),
      inline: true,
    });
  }

  // Notes if any
  if (notes && notes.trim()) {
    fields.push({
      name: '📝 Builder Notes',
      value: `*${notes.trim()}*`,
      inline: false,
    });
  }

  // Direct clickable link field
  fields.push({
    name: '🔗 Interactive Build Link',
    value: `[**Click here to inspect or edit this PC in ApexPC Builder**](${shareUrl})`,
    inline: false,
  });

  const titleName = buildName?.trim() || 'ApexPC Custom Rig';
  const embedColor = compatibility.isCompatible ? 0x06b6d4 : 0xef4444; // Cyan or Red in hex

  return {
    username: 'ApexPC Bot',
    avatar_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=128&auto=format&fit=crop&q=80',
    content: customMessage?.trim() || `🚀 **${titleName}** — PC Build Configuration Shared!`,
    embeds: [
      {
        title: `🖥️ ${titleName} (${selectedCount}/8 Components)`,
        description: `**Total Est. Cost:** \`${formattedPrice}\`\nHardware configuration assembled using [ApexPC Builder](${shareUrl}).`,
        url: shareUrl,
        color: embedColor,
        fields,
        footer: {
          text: 'ApexPC Builder • AI Hardware Studio & Compatibility Engine',
          icon_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=64&auto=format&fit=crop&q=80',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Sends the PC build to a Discord webhook through our backend proxy
 */
export async function sendBuildToDiscord(options: DiscordShareOptions): Promise<{ success: boolean; message: string }> {
  const shareUrl = generateBuildShareUrl(options.build);
  const payload = buildDiscordPayload({
    build: options.build,
    buildName: options.buildName,
    notes: options.notes,
    tags: options.tags,
    currency: options.currency,
    customMessage: options.customMessage,
    shareUrl,
  });

  const response = await fetch('/api/share/discord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webhookUrl: options.webhookUrl,
      payload,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Failed to send to Discord (HTTP ${response.status})`);
  }

  return {
    success: true,
    message: data?.message || 'Build successfully posted to Discord server!',
  };
}
