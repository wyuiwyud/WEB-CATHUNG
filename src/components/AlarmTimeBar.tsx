import React, { useMemo } from 'react';
import { AlarmClock, Plus, Minus, Clock } from 'lucide-react';
import { parseMinutes, formatMinutesToTime } from '../utils/time';

interface AlarmTimeBarProps {
  label: string;
  value: string; // HH:mm
  onChange: (newTime: string) => void;
  minTime?: string; // HH:mm
  maxTime?: string; // HH:mm
  stepMinutes?: number;
  colorTheme?: 'indigo' | 'emerald' | 'amber';
  description?: string;
}

export const AlarmTimeBar: React.FC<AlarmTimeBarProps> = ({
  label,
  value,
  onChange,
  minTime = '06:00',
  maxTime = '23:45',
  stepMinutes = 15,
  colorTheme = 'indigo',
  description = 'Kéo thanh trượt để chọn giờ như cài báo thức',
}) => {
  const currentMinutes = useMemo(() => parseMinutes(value), [value]);
  const minMinutes = useMemo(() => parseMinutes(minTime), [minTime]);
  const maxMinutes = useMemo(() => parseMinutes(maxTime), [maxTime]);

  const [hoursStr, minutesStr] = useMemo(() => {
    if (!value || !value.includes(':')) return ['08', '00'];
    const [h, m] = value.split(':');
    return [h.padStart(2, '0'), m.padStart(2, '0')];
  }, [value]);

  // Adjust by minutes (+/- 15 or 30 mins)
  const adjustMinutes = (delta: number) => {
    let next = currentMinutes + delta;
    if (next < 0) next += 24 * 60;
    if (next >= 24 * 60) next -= 24 * 60;
    onChange(formatMinutesToTime(next));
  };

  // Set specific minute (00, 15, 30, 45)
  const setMinutePreset = (targetMin: number) => {
    const h = Math.floor(currentMinutes / 60);
    const next = h * 60 + targetMin;
    onChange(formatMinutesToTime(next));
  };

  // Slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(formatMinutesToTime(val));
  };

  // Set to current device time
  const handleSetCurrentTime = () => {
    const now = new Date();
    const h = now.getHours();
    // round to nearest 5 or 15 mins
    const m = Math.round(now.getMinutes() / stepMinutes) * stepMinutes;
    const total = (h * 60 + m) % (24 * 60);
    onChange(formatMinutesToTime(total));
  };

  const themeClasses = {
    indigo: {
      bg: 'bg-indigo-50/60',
      border: 'border-indigo-200/90',
      badge: 'bg-indigo-100 text-indigo-800',
      accent: 'text-indigo-600',
      sliderAccent: 'accent-indigo-600',
      glow: 'shadow-indigo-500/15',
      activeBtn: 'bg-indigo-600 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/90',
      badge: 'bg-emerald-100 text-emerald-800',
      accent: 'text-emerald-600',
      sliderAccent: 'accent-emerald-600',
      glow: 'shadow-emerald-500/15',
      activeBtn: 'bg-emerald-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/90',
      badge: 'bg-amber-100 text-amber-800',
      accent: 'text-amber-600',
      sliderAccent: 'accent-amber-600',
      glow: 'shadow-amber-500/15',
      activeBtn: 'bg-amber-600 text-white',
    },
  }[colorTheme];

  // Quick major hour markers for the slider bar
  const hourMarkers = [
    { label: '06h', mins: 6 * 60 },
    { label: '08h', mins: 8 * 60 },
    { label: '11h', mins: 11 * 60 },
    { label: '14h', mins: 14 * 60 },
    { label: '17h', mins: 17 * 60 },
    { label: '20h', mins: 20 * 60 },
    { label: '23h', mins: 23 * 60 },
  ];

  return (
    <div
      className={`p-4 sm:p-5 rounded-[22px] border ${themeClasses.border} ${themeClasses.bg} shadow-sm transition-all space-y-4`}
    >
      {/* Alarm Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600">
            <AlarmClock className={`w-4 h-4 ${themeClasses.accent} animate-bounce`} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {label}
            </h4>
            <p className="text-[11px] text-slate-500">{description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetCurrentTime}
          className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs active:scale-95 transition-all flex items-center gap-1"
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Bây giờ</span>
        </button>
      </div>

      {/* Alarm Digital Clock Big Display */}
      <div className="bg-slate-900 rounded-[18px] p-3.5 sm:p-4 text-white shadow-inner flex items-center justify-between">
        {/* Minus button */}
        <button
          type="button"
          onClick={() => adjustMinutes(-15)}
          className="w-10 h-10 rounded-[12px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all select-none"
          title="Giảm 15 phút"
          aria-label="Giảm 15 phút"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Central Alarm Numbers */}
        <div className="flex items-baseline justify-center gap-2 select-none">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-wider text-white">
              {hoursStr}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">
              Giờ
            </span>
          </div>

          <span className="text-2xl sm:text-3xl font-bold text-indigo-400 animate-pulse pb-2">
            :
          </span>

          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-wider text-amber-300">
              {minutesStr}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">
              Phút
            </span>
          </div>
        </div>

        {/* Plus button */}
        <button
          type="button"
          onClick={() => adjustMinutes(15)}
          className="w-10 h-10 rounded-[12px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all select-none"
          title="Tăng 15 phút"
          aria-label="Tăng 15 phút"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* THANH BÁO THỨC TRƯỢT CHỌN GIỜ (ALARM TIME SLIDER BAR) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
          <span>Kéo thanh trượt:</span>
          <span className="text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200/80 shadow-2xs tabular-nums">
            {value}
          </span>
        </div>

        {/* Slider Input Bar */}
        <div className="relative py-2 px-1">
          <input
            type="range"
            min={minMinutes}
            max={maxMinutes}
            step={stepMinutes}
            value={currentMinutes}
            onChange={handleSliderChange}
            className={`w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer ${themeClasses.sliderAccent} focus:outline-none transition-all shadow-inner`}
            style={{
              background: `linear-gradient(to right, #4F46E5 0%, #6366F1 ${
                ((currentMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100
              }%, #E2E8F0 ${
                ((currentMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100
              }%, #E2E8F0 100%)`,
            }}
          />
        </div>

        {/* Hour markers underneath slider */}
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1 select-none">
          {hourMarkers.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => onChange(formatMinutesToTime(m.mins))}
              className={`hover:text-indigo-600 transition-colors ${
                Math.abs(currentMinutes - m.mins) < 30 ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Minute Selection Chips (00, 15, 30, 45) */}
      <div className="pt-1 flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
          Phút:
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {[0, 15, 30, 45].map((m) => {
            const isSelected = parseInt(minutesStr, 10) === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMinutePreset(m)}
                className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg border transition-all active:scale-95 tabular-nums ${
                  isSelected
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                :{m.toString().padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
