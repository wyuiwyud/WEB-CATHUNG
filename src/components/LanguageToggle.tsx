import React from 'react';
import { useTranslation } from '../i18n/translations';
import { useStore } from '../store/useStore';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();
  const { isNightMode } = useStore();

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-full border transition-all duration-300 shadow-sm ${
        isNightMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-700'
      } ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="pl-1.5 pr-0.5 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>

      {/* Button: Tiếng Việt */}
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'vi'
            ? isNightMode
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              : 'bg-indigo-600 text-white shadow-sm'
            : isNightMode
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Tiếng Việt"
      >
        <span className="text-sm leading-none select-none">🇻🇳</span>
        <span>VI</span>
      </button>

      {/* Button: 中文 */}
      <button
        type="button"
        onClick={() => setLanguage('zh')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'zh'
            ? isNightMode
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              : 'bg-indigo-600 text-white shadow-sm'
            : isNightMode
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="中文 (Chinese)"
      >
        <span className="text-sm leading-none select-none">🇨🇳</span>
        <span>中文</span>
      </button>
    </div>
  );
};
