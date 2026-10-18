import { Moon, Flame } from 'lucide-react';
import { useTranslation } from '../i18n/translations';

interface NightRestaurantAnimationProps {
  onStartNewShift?: () => void;
  completedCount?: number;
  totalHoursFormatted?: string;
}

export const NightRestaurantAnimation: React.FC<NightRestaurantAnimationProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#060913] via-[#0B1120] to-[#151C35] border border-indigo-500/30 p-6 sm:p-8 text-white text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-1000 animate-fade-in my-3">
      {/* Background Animated Twinkling Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Star 1 */}
        <span className="absolute top-4 left-8 text-amber-200 text-xs animate-pulse opacity-80">
          ✦
        </span>
        {/* Star 2 */}
        <span
          className="absolute top-10 right-12 text-indigo-200 text-sm animate-pulse opacity-90"
          style={{ animationDelay: '700ms' }}
        >
          ★
        </span>
        {/* Star 3 */}
        <span
          className="absolute top-20 left-1/4 text-amber-100 text-xs animate-ping opacity-60"
          style={{ animationDelay: '1200ms', animationDuration: '3s' }}
        >
          ✦
        </span>
        {/* Star 4 */}
        <span
          className="absolute top-8 right-1/3 text-white text-[10px] animate-pulse opacity-75"
          style={{ animationDelay: '400ms' }}
        >
          ★
        </span>
        {/* Star 5 */}
        <span
          className="absolute bottom-16 left-12 text-indigo-300 text-xs animate-pulse opacity-60"
          style={{ animationDelay: '900ms' }}
        >
          ✦
        </span>
        {/* Star 6 */}
        <span
          className="absolute bottom-12 right-16 text-amber-300 text-xs animate-ping opacity-50"
          style={{ animationDelay: '1500ms', animationDuration: '4s' }}
        >
          ★
        </span>
        {/* Ambient night glow orbs */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Illustration: Moon & Sleeping Restaurant */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Crescent Moon & Zzz animation */}
        <div className="relative mb-4">
          {/* Glowing aura */}
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />

          {/* Crescent Moon */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 to-amber-100 flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.35)] text-amber-900 border-2 border-amber-200">
            <Moon className="w-10 h-10 text-amber-900 fill-amber-900/20" />
          </div>

          {/* Animated Sleep Zzz bubbles */}
          <div className="absolute -top-3 -right-6 flex flex-col items-start select-none">
            <span
              className="text-amber-200 font-extrabold text-xs animate-bounce opacity-80"
              style={{ animationDelay: '0ms', animationDuration: '2s' }}
            >
              Z
            </span>
            <span
              className="text-amber-300 font-black text-sm ml-2 animate-bounce opacity-90"
              style={{ animationDelay: '400ms', animationDuration: '2.2s' }}
            >
              z
            </span>
            <span
              className="text-amber-400 font-black text-base ml-4 animate-bounce"
              style={{ animationDelay: '800ms', animationDuration: '2.4s' }}
            >
              z...
            </span>
          </div>
        </div>

        {/* Cartoon Restaurant Storefront (Night closed mode) */}
        <div className="w-full max-w-xs relative bg-slate-900/85 backdrop-blur-md rounded-[22px] border border-indigo-500/30 p-4 mb-5 shadow-inner text-center">
          {/* Hanging Red Lanterns */}
          <div className="absolute -top-3 left-3 text-lg animate-bounce select-none" style={{ animationDuration: '3s' }}>
            🏮
          </div>
          <div className="absolute -top-3 right-3 text-lg animate-bounce select-none" style={{ animationDuration: '3.2s', animationDelay: '500ms' }}>
            🏮
          </div>

          {/* Roof decoration */}
          <div className="flex justify-center gap-1.5 mb-2 opacity-80">
            <span className="w-8 h-2 rounded-full bg-amber-500/40" />
            <span className="w-12 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-8 h-2 rounded-full bg-amber-500/40" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-300 text-xs font-bold mb-1.5 border border-slate-700 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 opacity-80" />
            <span>{t('restaurantName')}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="text-sm select-none">🍢</span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-100 tracking-tight">
              {t('nightClosedTitle')}
            </h3>
            <span className="text-sm select-none">💤</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {t('nightClosedDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
