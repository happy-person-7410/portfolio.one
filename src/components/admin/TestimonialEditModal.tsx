import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Testimonial } from '../../types';
import { saveTestimonial } from '../../services/portfolioService';
import { ImageUploader } from './ImageUploader';

interface TestimonialEditModalProps {
  testimonial?: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const TestimonialEditModal: React.FC<TestimonialEditModalProps> = ({
  testimonial,
  isOpen,
  onClose,
  onSaved
}) => {
  const isEditing = Boolean(testimonial);

  const [id] = useState(testimonial?.id || `test-${Date.now().toString(36)}`);
  const [name, setName] = useState(testimonial?.name || '');
  const [role, setRole] = useState(testimonial?.role || 'Founder & CEO');
  const [businessType, setBusinessType] = useState(testimonial?.businessType || 'Local Business');
  const [rating, setRating] = useState(testimonial?.rating || 5);
  const [quote, setQuote] = useState(testimonial?.quote || '');
  const [avatar, setAvatar] = useState(testimonial?.avatar || '/images/brand/happy-person-mascot.webp');
  const [location, setLocation] = useState(testimonial?.location || 'Remote Client');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !quote.trim()) {
      setError('Please provide client name and testimonial quote.');
      return;
    }

    setSaving(true);
    try {
      await saveTestimonial({
        id,
        name: name.trim(),
        role: role.trim(),
        businessType: businessType.trim(),
        rating: Number(rating),
        quote: quote.trim(),
        avatar: avatar.trim(),
        location: location.trim(),
        order: testimonial?.order || 1
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold">
            {isEditing ? `Edit Review: ${testimonial?.name}` : 'Add New Client Review'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Client Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Star Rating (1-5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                <option value={3}>⭐⭐⭐ (3 Stars)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Clinic Director"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Business Type</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="Healthcare Practice"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Client Quote</label>
            <textarea
              required
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Happy Person completely transformed our online presence..."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <ImageUploader
            value={avatar}
            onChange={setAvatar}
            folder="testimonials"
            label="Client Avatar Photo"
            description="Stored in repository /public/images/testimonials/ folder. Square crop."
            aspectRatio="square"
            recommendedDimensions="400 × 400px"
            presetChoices={[
              { label: 'Happy Mascot', url: '/images/brand/happy-person-mascot.webp' },
              { label: 'Studio Badge', url: '/images/creative/logo-brand-01.webp' }
            ]}
          />

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
