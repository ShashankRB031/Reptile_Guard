
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UI_TEXT as t } from '../constants';
import { Shield, LogOut, UserCircle, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white shadow-2xl sticky top-0 z-50 border-b border-emerald-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => window.location.reload()}>
            <img src="/ReptileGuardLogo.png" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-xl leading-none tracking-tight">{t.appTitle}</span>
              <span className="text-[8px] sm:text-[10px] text-emerald-300 font-bold uppercase tracking-widest opacity-80 mt-0.5 sm:mt-1 hidden xs:block">{t.welcomeSub}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right">
                <p className="text-sm font-black tracking-tight">{user.name}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-300 font-black">
                  {user.role === UserRole.CITIZEN ? (user.isGuest ? t.guest : t.citizen) : t.officerMode}
                </p>
              </div>
              <div className="h-10 w-10 lg:h-11 lg:w-11 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl lg:rounded-2xl flex items-center justify-center border-2 border-emerald-500/50 shadow-lg overflow-hidden">
                 {user.isGuest ? (
                   <UserCircle className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-200" />
                 ) : (
                   <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 h-full w-full flex items-center justify-center font-black text-white">
                     {user.name.charAt(0)}
                   </div>
                 )}
              </div>
              <button 
                onClick={onLogout}
                className="p-2 lg:p-2.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                title={t.logout}
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 lg:p-2.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-emerald-200 hover:text-white transition-colors rounded-xl hover:bg-white/10">
               {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-emerald-800 to-emerald-900 border-t border-emerald-700/50 pb-6 animate-fade-in-down">
           <div className="px-4 py-4 bg-emerald-900/60 border-b border-emerald-700/50 mb-4">
             <div className="flex items-center space-x-3">
                <div className="h-11 w-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-white text-sm">{user.name}</p>
                  <p className="text-[9px] uppercase font-black text-emerald-300 tracking-widest">{user.role}</p>
                </div>
             </div>
           </div>
           
           <div className="px-4">
             <button
               onClick={onLogout}
               className="flex w-full items-center justify-center space-x-3 px-4 py-4 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 hover:from-red-500 hover:to-red-600 hover:text-white border border-red-500/30 rounded-2xl text-xs transition-all font-black uppercase tracking-widest"
             >
               <LogOut className="h-4 w-4" />
               <span>{t.logout}</span>
             </button>
             <button
               onClick={toggleTheme}
               className="mt-3 flex w-full items-center justify-center space-x-3 px-4 py-4 bg-white/10 text-emerald-200 hover:bg-white/20 rounded-2xl text-xs transition-all font-black uppercase tracking-widest"
             >
               {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
               <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
             </button>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
