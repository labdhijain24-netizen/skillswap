import React, { useState } from 'react';
import { UploadCloud, Image, Check, AlertCircle, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { uploadAvatar } from '../../services/profileService';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

export default function AvatarUploadModal({ isOpen, onClose, currentAvatar, onAvatarUpdated }) {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || AVATAR_PRESETS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be under 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      let finalAvatarUrl = previewUrl;

      // If user picked a local file, upload to Supabase Storage
      if (activeTab === 'upload' && selectedFile) {
        finalAvatarUrl = await uploadAvatar(user.id, selectedFile);
      } else if (activeTab === 'url' && customUrl.trim()) {
        finalAvatarUrl = customUrl.trim();
      }

      // Update in public.profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      onAvatarUpdated && onAvatarUpdated(finalAvatarUrl);
      toast.success('Picture Updated! 📸', 'Your profile picture has been saved.');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Profile Picture"
      subtitle="Upload a personal photo or select from curated creative personas."
      withTape={true}
      tapeColor="bg-butter/85"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={loading}
          >
            Save Picture
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-xs text-charcoal">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Preview */}
        <div className="flex items-center space-x-4 p-4 rounded-3xl bg-ivory border-2 border-charcoal/15">
          <img
            src={previewUrl}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-charcoal shadow-pop-sm flex-shrink-0"
          />
          <div>
            <span className="text-xs font-bold text-charcoal font-serif block">
              Active Avatar Preview
            </span>
            <span className="text-[11px] text-charcoal-muted">
              Visible on your skill cards and community exchanges.
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-ivory p-1 border border-charcoal/15">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'upload' ? 'bg-charcoal text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'presets' ? 'bg-charcoal text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Aesthetic Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'url' ? 'bg-charcoal text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Image Link
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-charcoal/30 hover:border-charcoal rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-white group">
              <UploadCloud className="w-8 h-8 text-dusty group-hover:scale-110 transition mb-2" />
              <span className="font-bold text-xs text-charcoal">
                {selectedFile ? selectedFile.name : 'Click to browse image from your computer'}
              </span>
              <span className="text-[11px] text-charcoal-muted mt-1">
                PNG, JPG or WebP (max 5MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab 2: Curated Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPreviewUrl(preset);
                    setSelectedFile(null);
                  }}
                  className={`rounded-2xl overflow-hidden border-2 transition p-0.5 relative ${
                    previewUrl === preset
                      ? 'border-charcoal ring-2 ring-dusty shadow-pop-sm scale-105'
                      : 'border-charcoal/20 hover:border-charcoal opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-14 object-cover rounded-xl" />
                  {previewUrl === preset && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-butter rounded-full border border-charcoal flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <Input
              label="Paste Direct Image URL"
              placeholder="https://images.unsplash.com/..."
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                if (e.target.value.startsWith('http')) {
                  setPreviewUrl(e.target.value);
                }
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
