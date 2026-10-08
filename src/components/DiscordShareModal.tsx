import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  HelpCircle,
  Hash,
  Sparkles,
  Layers,
  Tag
} from 'lucide-react';
import { PCBuild, Currency, Language } from '../types/hardware';
import { calculateTotalPrice, checkCompatibility } from '../utils/compatibility';
import { sendBuildToDiscord, generateBuildShareUrl } from '../utils/discordShare';

interface DiscordShareModalProps {
  build: PCBuild;
  buildName?: string;
  notes?: string;
  tags?: string[];
  currency: Currency;
  language: Language;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const DiscordShareModal: React.FC<DiscordShareModalProps> = ({
  build,
  buildName: initialBuildName = '',
  notes: initialNotes = '',
  tags: initialTags = [],
  currency,
  language,
  onClose,
  onSuccessToast,
}) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('apexpc_discord_webhook') || '';
    } catch {
      return '';
    }
  });
  const [buildName, setBuildName] = useState<string>(initialBuildName || 'Custom ApexPC Build');
  const [customMessage, setCustomMessage] = useState<string>('Check out my new PC build configuration! What do you guys think?');
  const [saveWebhook, setSaveWebhook] = useState<boolean>(true);
  
  const [isSending, setIsSending] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const { usd, uzs } = calculateTotalPrice(build);
  const formattedPrice = currency === 'USD' ? `$${usd.toLocaleString()}` : `${uzs.toLocaleString()} UZS`;
  const compatibility = checkCompatibility(build);
  const selectedCount = Object.values(build).filter(Boolean).length;
  const shareUrl = generateBuildShareUrl(build);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSendToDiscord = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = webhookUrl.trim();
    if (!trimmedUrl) {
      setStatus({ type: 'error', message: 'Please provide a Discord Webhook URL.' });
      return;
    }

    if (!trimmedUrl.startsWith('https://discord.com/api/webhooks/') && !trimmedUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      setStatus({ 
        type: 'error', 
        message: 'Invalid URL. Discord webhooks must start with https://discord.com/api/webhooks/...' 
      });
      return;
    }

    setIsSending(true);
    setStatus({ type: 'idle' });

    try {
      if (saveWebhook) {
        try {
          localStorage.setItem('apexpc_discord_webhook', trimmedUrl);
        } catch (e) {
          console.error(e);
        }
      }

      const result = await sendBuildToDiscord({
        build,
        buildName,
        notes: initialNotes,
        tags: initialTags,
        currency,
        customMessage,
        webhookUrl: trimmedUrl,
      });

      setStatus({ type: 'success', message: result.message });
      if (onSuccessToast) {
        onSuccessToast('PC build posted to Discord channel successfully!');
      }

      // Auto close after brief success delay
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err?.message || 'Failed to dispatch webhook. Check your Discord webhook URL and channel permissions.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <span>Share Build to Discord</span>
                <span className="rounded bg-[#5865F2]/20 px-2 py-0.5 text-[10px] font-mono text-[#5865F2] border border-[#5865F2]/30">
                  Webhook
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Post full component specs, pricing, and live interactive link to your server
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSendToDiscord} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Build Preview Snippet */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Active Configuration Summary</span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">{formattedPrice}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
              <div className="truncate">
                <span className="text-neutral-500 mr-1.5">CPU:</span>
                <strong className="text-white">{build.cpu?.name || 'Not selected'}</strong>
              </div>
              <div className="truncate">
                <span className="text-neutral-500 mr-1.5">GPU:</span>
                <strong className="text-cyan-400">{build.gpu?.name || 'Not selected'}</strong>
              </div>
              <div className="truncate">
                <span className="text-neutral-500 mr-1.5">RAM:</span>
                <strong className="text-white">{build.ram ? `${build.ram.capacityGb}GB ${build.ram.ramType}` : 'Not selected'}</strong>
              </div>
              <div className="truncate">
                <span className="text-neutral-500 mr-1.5">Status:</span>
                <strong className={compatibility.isCompatible ? 'text-emerald-400' : 'text-red-400'}>
                  {compatibility.isCompatible ? '100% Compatible' : 'Check warnings'}
                </strong>
              </div>
            </div>

            {/* Tags preview */}
            {initialTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {initialTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <Tag className="h-2.5 w-2.5" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Discord Webhook URL input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <span>Discord Webhook URL</span>
                <span className="text-red-400">*</span>
              </label>

              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-[11px] text-[#5865F2] hover:underline flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                <span>How to get a Webhook URL?</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="url"
                required
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/1234567890/abcdef..."
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#5865F2] font-mono transition-colors"
              />
            </div>

            {/* Step-by-step guidance box */}
            {showInstructions && (
              <div className="mt-2 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 p-3.5 text-xs text-neutral-300 space-y-2 animate-in fade-in">
                <div className="font-bold text-[#5865F2] flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  <span>How to create a Discord Webhook in 30 seconds:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-300">
                  <li>Open Discord on Desktop or Web.</li>
                  <li>Go to your Discord Server → Click the gear icon next to your desired channel (e.g. <code>#pc-builds</code>).</li>
                  <li>Click <strong>Integrations</strong> on the left sidebar → Select <strong>Webhooks</strong>.</li>
                  <li>Click <strong>New Webhook</strong>, customize name/channel, then click <strong>Copy Webhook URL</strong>.</li>
                  <li>Paste the URL into the input field above.</li>
                </ol>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveWebhook"
                checked={saveWebhook}
                onChange={(e) => setSaveWebhook(e.target.checked)}
                className="rounded border-neutral-700 text-[#5865F2] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="saveWebhook" className="text-xs text-neutral-400 cursor-pointer select-none">
                Remember this webhook URL in this browser for quick future sharing
              </label>
            </div>
          </div>

          {/* Build Name & Custom Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Rig / Configuration Name
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="e.g. Ultimate 1440p BattleStation"
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Sharable Build Link
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-[11px] text-neutral-400 font-mono select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-xl bg-neutral-800 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0"
                  title="Copy link"
                >
                  {copiedUrl ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Message text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Personal Note / Intro Message (shown above Discord embed)
            </label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add your note or question for the Discord server..."
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#5865F2] resize-none transition-colors"
            />
          </div>

          {/* Status Message */}
          {status.type === 'error' && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-3 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{status.message}</span>
            </div>
          )}

          {status.type === 'success' && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending || selectedCount === 0}
              className="flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#5865F2]/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? 'Sending to Discord...' : 'Post to Discord'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
