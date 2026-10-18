import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import type { Employee } from '../types';
import { Card, Avatar, Badge } from '../components/ui';
import { Search, ChevronRight, Flame, Users, Calendar, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../utils/time';
import { NightRestaurantAnimation } from '../components/NightRestaurantAnimation';

interface SelectEmployeeScreenProps {
  onSelectEmployee: (emp: Employee) => void;
  onGoToLiveBoard: () => void;
}

export const SelectEmployeeScreen: React.FC<SelectEmployeeScreenProps> = ({
  onSelectEmployee,
  onGoToLiveBoard,
}) => {
  const { employees, recentEmployeeIds, shifts, isNightMode } = useStore();
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter employees by search term
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.role.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // Separate recent vs other employees
  const recentEmployees = useMemo(() => {
    if (searchTerm) return [];
    return recentEmployeeIds
      .map((id) => employees.find((e) => e.id === id))
      .filter((e): e is Employee => Boolean(e));
  }, [employees, recentEmployeeIds, searchTerm]);

  // Helper to get today's shift status of an employee
  const getEmployeeStatus = (empId: string) => {
    const todayShift = shifts.find((s) => s.employeeId === empId);
    if (!todayShift) return null;
    return todayShift.status;
  };

  return (
    <div className={`w-full max-w-lg mx-auto pb-12 pt-4 px-4 sm:px-6 transition-colors duration-1000 ${
      isNightMode ? 'text-slate-100' : 'text-slate-900'
    }`}>
      {/* Brand Header */}
      <div className="text-center mb-6 pt-2">
        {!isNightMode && (
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/80 text-orange-700 text-xs font-semibold mb-3 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600 animate-pulse" />
            <span>{t('appSubtitle')}</span>
          </div>
        )}
        
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
          isNightMode ? 'text-white' : 'text-[#0F172A]'
        }`}>
          {t('restaurantName')}
          {language === 'zh' && (
            <span className="block text-xs font-semibold text-slate-400 mt-0.5">
              Cát Hưng Xiên Nướng
            </span>
          )}
        </h1>
        <p className={`text-sm mt-1 flex items-center justify-center gap-1.5 ${
          isNightMode ? 'text-slate-400' : 'text-[#64748B]'
        }`}>
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{formatDisplayDate(language)}</span>
        </p>
      </div>

      {/* BANNER HOẠT HÌNH MÀN ĐÊM KHI CHƯA AI VÀO CA HOẶC ĐÃ TAN CA HẾT */}
      {isNightMode && (
        <div className="mb-5">
          <NightRestaurantAnimation
            onStartNewShift={() => {}}
            completedCount={shifts.filter((s) => s.status === 'completed').length}
            totalHoursFormatted=""
          />
        </div>
      )}

      {/* Quick Access to Live Board banner */}
      <button
        type="button"
        onClick={onGoToLiveBoard}
        className={`w-full mb-5 p-3.5 rounded-[18px] flex items-center justify-between text-left transition-all active:scale-[0.99] shadow-sm ${
          isNightMode
            ? 'bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-100'
            : 'bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            isNightMode ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              {t('viewLiveBoardBtn')}
            </h4>
            <p className={`text-xs ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('viewLiveBoardDesc')}
            </p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isNightMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-600'
        }`}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* Search Input */}
      <div className="relative mb-5">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchEmployeePlaceholder')}
          className={`w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-[16px] text-sm placeholder:text-slate-400 focus:outline-none transition-all shadow-sm ${
            isNightMode
              ? 'bg-slate-900/90 border border-slate-800 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
              : 'bg-white border border-[#E2E8F0] text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded-full ${
              isNightMode ? 'text-slate-300 bg-slate-800' : 'text-slate-400 bg-slate-100'
            }`}
          >
            {t('clearText')}
          </button>
        )}
      </div>

      {/* Recent Employees section if no search */}
      {recentEmployees.length > 0 && !searchTerm && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isNightMode ? 'text-amber-300' : 'text-slate-500'
            }`}>
              <span>★</span>
              <span>{t('recentLabel')}</span>
            </span>
            <span className="text-xs text-slate-400">{t('quickSelectLabel')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {recentEmployees.slice(0, 2).map((emp) => {
              const status = getEmployeeStatus(emp.id);
              return (
                <button
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  type="button"
                  className={`p-3 rounded-[18px] text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-2.5 ${
                    isNightMode
                      ? 'bg-slate-900/85 hover:bg-slate-800 border border-slate-800 text-slate-100'
                      : 'bg-white hover:bg-slate-50 border border-indigo-100/90 text-slate-900'
                  }`}
                >
                  <Avatar name={emp.name} color={emp.color} size="sm" isWorking={status === 'working'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{emp.name}</p>
                    <p className={`text-[11px] truncate ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>{emp.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Employee List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('employeeListLabel')} ({filteredEmployees.length})
          </span>
          <span className="text-xs text-slate-400">{t('tapToSelectShift')}</span>
        </div>

        <div className="space-y-2.5">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.id);
            return (
              <Card
                key={emp.id}
                interactive
                padding="sm"
                onClick={() => onSelectEmployee(emp)}
                className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[18px] transition-all ${
                  isNightMode
                    ? 'bg-slate-900/85 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50 text-slate-100 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-indigo-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={emp.name}
                    color={emp.color}
                    size="md"
                    isWorking={status === 'working'}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm truncate ${
                        isNightMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {emp.name}
                      </h3>
                      {emp.isAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          {t('adminBadge')}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${
                      isNightMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {emp.role} • {emp.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {status === 'working' ? (
                    <Badge variant="working" size="sm">
                      {t('statusWorking')}
                    </Badge>
                  ) : status ? (
                    <Badge variant="completed" size="sm">
                      {t('statusCompleted')}
                    </Badge>
                  ) : (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isNightMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {t('statusNotStarted')}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Card>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className={`p-8 text-center rounded-[20px] border ${
              isNightMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <p className="text-sm">{t('noEmployeeFound')}</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-amber-400 font-bold mt-2"
              >
                {t('clearSearch')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
