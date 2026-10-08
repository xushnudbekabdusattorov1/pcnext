import React, { useState, useRef } from 'react';
import { 
  Clapperboard, 
  Upload, 
  Sparkles, 
  Play, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Film
} from 'lucide-react';
import { Language } from '../types/hardware';

interface VideoAnimatorModalProps {
  onClose: () => void;
  language: Language;
}

export const VideoAnimatorModal: React.FC<VideoAnimatorModalProps> = ({ onClose }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState<string>(
    'Cinematic 3D camera pan across high-end RGB gaming PC setup with glowing neon reflections and crystal clear glass panel'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      setError('Please upload a photo of your PC build or battlestation first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatusMessage('Submitting to Veo video generation engine...');

    try {
      // 1. Start generation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBase64,
          mimeType,
          aspectRatio,
        }),
      });

      if (!startRes.ok) {
        const errJson = await startRes.json();
        throw new Error(errJson.error || 'Failed to start video generation');
      }

      const { operationName } = await startRes.json();
      setStatusMessage('Veo is rendering your cinematic video (this may take 1-2 minutes)...');

      // 2. Poll for completion
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (!isDone && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.done) {
            isDone = true;
            break;
          }
          setStatusMessage(`Rendering in progress... (${attempts * 5}s elapsed)`);
        }
      }

      if (!isDone) {
        throw new Error('Video generation timed out. Please try again.');
      }

      // 3. Download / Stream video
      setStatusMessage('Rendering finished! Fetching video stream...');
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Failed to retrieve rendered video stream.');
      }

      const blob = await downloadRes.blob();
      const createdUrl = URL.createObjectURL(blob);
      setVideoUrl(createdUrl);
      setStatusMessage('Your cinematic PC video is ready!');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Video generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Animate PC Setup (Veo Video)</span>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-mono text-purple-300 border border-purple-500/30">
                  AI Veo
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Transform any photo of your PC build or battlestation into an animated cinematic video
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

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold">Generation Notice:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              1. Upload Photo of PC / Setup *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-neutral-700 aspect-video max-h-56 bg-neutral-950 group">
                <img
                  src={imagePreview}
                  alt="PC Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-white hover:bg-neutral-700"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageBase64(null);
                    }}
                    className="rounded-lg bg-red-950/80 text-red-300 border border-red-500/30 px-3 py-1.5 text-xs hover:bg-red-900"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-neutral-800 hover:border-purple-500/60 rounded-xl p-8 text-center bg-neutral-950/50 hover:bg-neutral-950 transition-all group"
              >
                <Upload className="h-8 w-8 text-neutral-500 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-semibold text-neutral-300 group-hover:text-white">
                  Click to upload your PC photo
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Supports PNG, JPEG, WEBP up to 20MB
                </p>
              </div>
            )}
          </div>

          {/* Aspect Ratio Toggle (16:9 landscape vs 9:16 portrait) */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              2. Video Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>Landscape (16:9 Desktop/YouTube)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>Portrait (9:16 TikTok/Reels)</span>
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              3. Animation Style Prompt
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cinematic rotating camera sweep across RGB liquid cooler and fans"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Generated Video Output */}
          {videoUrl && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Generated Video Result:
                </span>
                <a
                  href={videoUrl}
                  download="animated-pc-setup.mp4"
                  className="flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Download MP4</span>
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-700 bg-black aspect-video max-h-72">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Loading status */}
          {isGenerating && (
            <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 p-4 text-center space-y-2">
              <RefreshCw className="h-6 w-6 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-purple-200">{statusMessage}</p>
              <p className="text-[11px] text-neutral-400">
                Veo model: <code>veo-3.1-fast-generate-preview</code> ({aspectRatio})
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/90 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !imageBase64}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Video...' : 'Generate Veo Video'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
