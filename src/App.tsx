/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Coffee, 
  PartyPopper, 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Sparkles,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  Heart
} from 'lucide-react';
import { getOutfitSuggestions, generateOutfitImage, OutfitSuggestion } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: Coffee, color: 'bg-blue-50 text-blue-600' },
  { id: 'office', label: 'Office', icon: Briefcase, color: 'bg-stone-100 text-stone-600' },
  { id: 'party', label: 'Party', icon: PartyPopper, color: 'bg-purple-50 text-purple-600' },
  { id: 'date', label: 'Date Night', icon: Sparkles, color: 'bg-rose-50 text-rose-600' },
];

export default function App() {
  const [occasion, setOccasion] = useState<string>('');
  const [weather, setWeather] = useState<string>('Sunny, 22°C');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (selectedOccasion: string) => {
    setOccasion(selectedOccasion);
    setLoading(true);
    setGeneratedImage(null);
    setError(null);
    try {
      const result = await getOutfitSuggestions(selectedOccasion, weather);
      setSuggestion(result);
      
      // Generate image in background
      setImageLoading(true);
      try {
        const imageUrl = await generateOutfitImage(result);
        setGeneratedImage(imageUrl);
      } catch (imgErr) {
        console.error("Image generation failed", imgErr);
      } finally {
        setImageLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        setWeather("Breezy, 18°C (Detected)");
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-olive/20">
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-12 px-6 pb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="serif text-5xl md:text-7xl font-medium tracking-tight mb-4"
        >
          StyleGenie
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-brand-ink/60 uppercase tracking-widest text-xs font-semibold"
        >
          Your AI Personal Stylist
        </motion.p>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        {/* Weather Input */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="serif text-2xl font-medium">Today's Vibe</h2>
            <button 
              onClick={handleLocationWeather}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-olive hover:opacity-70 transition-opacity"
            >
              <MapPin size={14} />
              Use Location
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="e.g. Sunny, 25°C"
              className="w-full bg-white border-none rounded-2xl px-6 py-4 text-lg card-shadow focus:ring-2 focus:ring-brand-olive/20 transition-all outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/30">
              <Thermometer size={20} />
            </div>
          </div>
        </section>

        {/* Occasion Selection */}
        <section className="mb-12">
          <h2 className="serif text-2xl font-medium mb-6">Where are you heading?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.id}
                onClick={() => handleGenerate(occ.id)}
                disabled={loading}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 card-shadow group",
                  occasion === occ.id ? "bg-brand-olive text-white scale-95" : "bg-white hover:scale-105",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl mb-3 transition-colors",
                  occasion === occ.id ? "bg-white/20" : occ.color
                )}>
                  <occ.icon size={24} />
                </div>
                <span className="font-medium">{occ.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="animate-spin text-brand-olive mb-4" size={40} />
              <p className="serif text-xl italic opacity-60">Curating your perfect look...</p>
            </motion.div>
          ) : suggestion ? (
            <motion.div
              key="suggestion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2rem] p-8 md:p-12 card-shadow">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h3 className="serif text-4xl font-medium mb-2">{suggestion.title}</h3>
                    <p className="text-brand-ink/60 leading-relaxed max-w-2xl">
                      {suggestion.description}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleGenerate(occasion)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-cream rounded-full text-sm font-semibold hover:bg-stone-200 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Regenerate
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="uppercase tracking-widest text-xs font-bold text-brand-ink/40">The Essentials</h4>
                    <div className="space-y-4">
                      {suggestion.items.map((item, idx) => (
                        <div key={idx} className="group">
                          <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-brand-cream transition-colors">
                            <div className="w-10 h-10 rounded-full bg-brand-olive/10 flex items-center justify-center text-brand-olive shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-brand-olive text-sm uppercase tracking-wide mb-1">{item.category}</p>
                              <p className="font-medium text-lg mb-1">{item.name}</p>
                              <p className="text-sm text-brand-ink/60 italic">{item.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="uppercase tracking-widest text-xs font-bold text-brand-ink/40">Stylist Tips</h4>
                    <div className="space-y-4">
                      {suggestion.styleTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <ChevronRight className="text-brand-olive shrink-0 mt-1" size={16} />
                          <p className="text-brand-ink/80 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-8">
                      <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative group bg-brand-cream flex items-center justify-center">
                        {imageLoading ? (
                          <div className="flex flex-col items-center gap-3 opacity-40">
                            <Loader2 className="animate-spin" size={32} />
                            <p className="text-xs font-bold uppercase tracking-widest">Generating Visual...</p>
                          </div>
                        ) : generatedImage ? (
                          <img 
                            src={generatedImage}
                            alt="AI Generated Style Inspiration"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <img 
                            src={`https://picsum.photos/seed/${occasion}-style/800/1000`}
                            alt="Style Inspiration"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 pointer-events-none">
                          <p className="text-white/80 text-sm italic">
                            {generatedImage ? "AI Generated Visualization" : "Visual inspiration for your look"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => handleGenerate(occasion)}
                className="px-6 py-2 bg-brand-olive text-white rounded-full"
              >
                Try Again
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border-2 border-dashed border-brand-ink/10 rounded-[2rem]"
            >
              <p className="serif text-2xl opacity-40">Select an occasion to see your curated outfit</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-brand-ink/5 text-center">
        <p className="text-xs text-brand-ink/40 uppercase tracking-widest">
          StyleGenie &copy; 2026 • Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}

