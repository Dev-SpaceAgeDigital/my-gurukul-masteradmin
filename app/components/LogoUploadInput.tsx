'use client';
import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, Link as LinkIcon } from 'lucide-react';

interface LogoUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

export default function LogoUploadInput({
  label,
  value,
  onChange,
  folder = 'trust-logos',
  placeholder = 'https://... /logo.png or upload below'
}: LogoUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/master/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">{label}</label>

      {/* Preview Box & Upload Action Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Image Thumbnail Preview */}
        {value ? (
          <div className="relative w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 group shadow-xs">
            <img src={value} alt="Logo Preview" className="w-full h-full object-contain p-1" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              title="Remove logo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        {/* Dynamic Controls: File Upload Button & Direct URL Input */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
            
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload File</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && <div className="text-[11px] text-rose-600 font-semibold">{error}</div>}
        </div>
      </div>
    </div>
  );
}
