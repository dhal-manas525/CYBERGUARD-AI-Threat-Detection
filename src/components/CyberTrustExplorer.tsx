import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, ShieldCheck, Globe, Tag, Check, AlertCircle } from 'lucide-react';
import { BrandEntity } from '../types';

export const CyberTrustExplorer: React.FC = () => {
  const [brands, setBrands] = useState<BrandEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding custom brand
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formDomains, setFormDomains] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formCategory, setFormCategory] = useState('Banking');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data.brands || []))
      .catch(err => console.error('Failed to load brands:', err));
  };

  const handleAddBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName || !formDomains) return;

    const domainsArray = formDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
    const keywordsArray = formKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId.toLowerCase().trim(),
          name: formName.trim(),
          shortName: formShortName.trim() || formName.trim(),
          official_domains: domainsArray,
          keywords: keywordsArray.length > 0 ? keywordsArray : [formId.toLowerCase()],
          category: formCategory,
          critical_assets: ['Account Login', 'Security Credentials']
        })
      });

      if (res.ok) {
        setFormSuccess(`Registered ${formName} into CyberTrust Engine!`);
        fetchBrands();
        setTimeout(() => {
          setShowAddModal(false);
          setFormSuccess(null);
          setFormId('');
          setFormName('');
          setFormDomains('');
          setFormKeywords('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBrands = brands.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.official_domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="h-4 w-4" />
            <span>CyberTrust Intelligence™ Verified Brand Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Verified Enterprise Domain Knowledge Base
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            CyberGuard verifies digital signatures against trusted enterprise domains. When a suspicious link references
            a brand token without matching its registered domain, CyberTrust triggers an impersonation flag.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Register Brand</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search brands (e.g. SBI, PayPal, Google)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Banking', 'Fintech', 'Technology', 'E-Commerce', 'Cryptocurrency'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map(brand => (
          <div
            key={brand.id}
            className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 hover:border-cyan-500/40 transition-all shadow-md group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {brand.category}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {brand.name}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            </div>

            {/* Official Domains */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Globe className="h-3 w-3 text-cyan-400" />
                Verified Official Domains:
              </span>
              <div className="flex flex-wrap gap-1">
                {brand.official_domains.map(dom => (
                  <span
                    key={dom}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            </div>

            {/* Brand Keywords */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Tag className="h-3 w-3 text-indigo-400" />
                Monitored Brand Keywords:
              </span>
              <div className="flex flex-wrap gap-1">
                {brand.keywords.map(kw => (
                  <span
                    key={kw}
                    className="px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-400 text-[10px]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Critical Protected Assets */}
            {brand.critical_assets && brand.critical_assets.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Protected Assets: </span>
                {brand.critical_assets.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Register Organization to CyberTrust</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add new enterprise brand domains so CyberGuard immediately detects unauthorized look-alikes.
            </p>

            {formSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{formSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleAddBrandSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization ID (Slug):</label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={e => setFormId(e.target.value)}
                    placeholder="e.g. hdfc"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Organization Name:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. HDFC Bank Ltd."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Domains (Comma-separated):</label>
                  <input
                    type="text"
                    required
                    value={formDomains}
                    onChange={e => setFormDomains(e.target.value)}
                    placeholder="e.g. hdfcbank.com, netbanking.hdfcbank.com"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand Keywords (Comma-separated):</label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={e => setFormKeywords(e.target.value)}
                    placeholder="e.g. hdfc, hdfcbank, hdfc-netbanking"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none"
                  >
                    <option value="Banking">Banking</option>
                    <option value="Payments & Fintech">Payments & Fintech</option>
                    <option value="Technology">Technology</option>
                    <option value="E-Commerce & Cloud">E-Commerce & Cloud</option>
                    <option value="Cryptocurrency">Cryptocurrency</option>
                    <option value="Government / Public">Government / Public</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                  >
                    Save Brand
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
