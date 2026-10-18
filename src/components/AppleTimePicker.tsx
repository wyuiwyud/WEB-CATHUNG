import React, { useRef, useEffect, useCallback } from 'react';

interface AppleTimePickerProps {
  value: string; // HH:mm
  onChange: (time: string) => void;
}

const ITEM_HEIGHT = 44; // height of each wheel item in px
const VISIBLE_COUNT = 5; // visible items (must be odd so 1 is in center)

export const AppleTimePicker: React.FC<AppleTimePickerProps> = ({ value, onChange }) => {
  const [currentH, currentM] = value.split(':').map((v) => parseInt(v, 10) || 0);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  const isUserScrollingHour = useRef(false);
  const isUserScrollingMinute = useRef(false);

  // Scroll a container to the item
  const scrollToItem = (container: HTMLDivElement | null, index: number, smooth = true) => {
    if (!container) return;
    const targetY = index * ITEM_HEIGHT;
    container.scrollTo({
      top: targetY,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Sync scroll position with props when changed externally
  useEffect(() => {
    if (!isUserScrollingHour.current) {
      scrollToItem(hourScrollRef.current, currentH, false);
    }
  }, [currentH]);

  useEffect(() => {
    if (!isUserScrollingMinute.current) {
      scrollToItem(minuteScrollRef.current, currentM, false);
    }
  }, [currentM]);

  // Handle Hour Scroll
  const handleHourScroll = useCallback(() => {
    if (!hourScrollRef.current) return;
    isUserScrollingHour.current = true;
    const scrollTop = hourScrollRef.current.scrollTop;
    const selectedIdx = Math.round(scrollTop / ITEM_HEIGHT);
    const boundedIdx = Math.max(0, Math.min(23, selectedIdx));

    if (boundedIdx !== currentH) {
      const hStr = boundedIdx.toString().padStart(2, '0');
      const mStr = currentM.toString().padStart(2, '0');
      onChange(`${hStr}:${mStr}`);
    }

    clearTimeout((hourScrollRef.current as any)._timeout);
    (hourScrollRef.current as any)._timeout = setTimeout(() => {
      isUserScrollingHour.current = false;
    }, 150);
  }, [currentH, currentM, onChange]);

  // Handle Minute Scroll
  const handleMinuteScroll = useCallback(() => {
    if (!minuteScrollRef.current) return;
    isUserScrollingMinute.current = true;
    const scrollTop = minuteScrollRef.current.scrollTop;
    const selectedIdx = Math.round(scrollTop / ITEM_HEIGHT);
    const boundedIdx = Math.max(0, Math.min(59, selectedIdx));

    if (boundedIdx !== currentM) {
      const hStr = currentH.toString().padStart(2, '0');
      const mStr = boundedIdx.toString().padStart(2, '0');
      onChange(`${hStr}:${mStr}`);
    }

    clearTimeout((minuteScrollRef.current as any)._timeout);
    (minuteScrollRef.current as any)._timeout = setTimeout(() => {
      isUserScrollingMinute.current = false;
    }, 150);
  }, [currentH, currentM, onChange]);

  const selectHour = (h: number) => {
    const hStr = h.toString().padStart(2, '0');
    const mStr = currentM.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
    scrollToItem(hourScrollRef.current, h, true);
  };

  const selectMinute = (m: number) => {
    const hStr = currentH.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
    scrollToItem(minuteScrollRef.current, m, true);
  };

  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none liquid-glass-dark text-white rounded-[26px] p-3.5 shadow-2xl border border-white/10 overflow-hidden">
      {/* Label on top */}
      <div className="flex justify-around text-[11px] font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-white/10">
        <span className="w-24 text-center">Giờ</span>
        <span className="w-4 text-center text-indigo-400">:</span>
        <span className="w-24 text-center">Phút</span>
      </div>

      <div
        className="relative flex items-center justify-center my-1"
        style={{ height: `${ITEM_HEIGHT * VISIBLE_COUNT}px` }}
      >
        {/* Apple iOS Central Highlight Bar with Liquid Glow */}
        <div
          className="absolute left-2 right-2 rounded-[16px] bg-gradient-to-r from-indigo-500/20 via-indigo-500/30 to-indigo-500/20 border border-indigo-400/50 shadow-[0_0_24px_rgba(99,102,241,0.3)] backdrop-blur-xs pointer-events-none"
          style={{
            top: `${ITEM_HEIGHT * 2}px`,
            height: `${ITEM_HEIGHT}px`,
          }}
        />

        {/* Top Gradient Fade Overlay */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0F172A] via-[#0F172A]/75 to-transparent pointer-events-none z-10" />

        {/* Bottom Gradient Fade Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-transparent pointer-events-none z-10" />

        {/* HOURS WHEEL COLUMN */}
        <div
          ref={hourScrollRef}
          onScroll={handleHourScroll}
          className="w-28 h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory text-center z-0"
          style={{
            paddingTop: `${ITEM_HEIGHT * 2}px`,
            paddingBottom: `${ITEM_HEIGHT * 2}px`,
          }}
        >
          {hoursList.map((h) => {
            const isSelected = h === currentH;
            const diff = Math.abs(h - currentH);
            return (
              <div
                key={h}
                onClick={() => selectHour(h)}
                className={`flex items-center justify-center cursor-pointer snap-center transition-all ${
                  isSelected
                    ? 'text-3xl font-black text-white scale-110'
                    : diff === 1
                    ? 'text-xl font-bold text-slate-400 opacity-70'
                    : 'text-base font-semibold text-slate-600 opacity-40'
                }`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                {h.toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>

        {/* Separator Colon */}
        <div className="w-6 text-center text-2xl font-bold text-indigo-400 animate-pulse pointer-events-none z-0">
          :
        </div>

        {/* MINUTES WHEEL COLUMN */}
        <div
          ref={minuteScrollRef}
          onScroll={handleMinuteScroll}
          className="w-28 h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory text-center z-0"
          style={{
            paddingTop: `${ITEM_HEIGHT * 2}px`,
            paddingBottom: `${ITEM_HEIGHT * 2}px`,
          }}
        >
          {minutesList.map((m) => {
            const isSelected = m === currentM;
            const diff = Math.abs(m - currentM);
            return (
              <div
                key={m}
                onClick={() => selectMinute(m)}
                className={`flex items-center justify-center cursor-pointer snap-center transition-all ${
                  isSelected
                    ? 'text-3xl font-black text-amber-300 scale-110'
                    : diff === 1
                    ? 'text-xl font-bold text-slate-400 opacity-70'
                    : 'text-base font-semibold text-slate-600 opacity-40'
                }`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                {m.toString().padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected time display badge */}
      <div className="text-center pt-1 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-400 font-medium">Giờ đã chọn: </span>
        <span className="text-sm font-black text-amber-300 tabular-nums">{value}</span>
      </div>
    </div>
  );
};
