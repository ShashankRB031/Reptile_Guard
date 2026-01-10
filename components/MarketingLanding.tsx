
import React from 'react';
import { Shield, Zap, Heart, Search, FileText, Users, CheckCircle, ArrowRight, Camera, Smartphone, ShieldCheck } from 'lucide-react';
import { UI_TEXT as t } from '../constants';

interface MarketingLandingProps {
  onGetStarted: () => void;
}

const MarketingLanding: React.FC<MarketingLandingProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 md:pt-48 sm:pb-20 md:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 dark:opacity-20">
          <div className="absolute top-20 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500 rounded-full blur-[80px] sm:blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-stone-400 rounded-full blur-[100px] sm:blur-[120px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Project Statement</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-stone-900 dark:text-stone-100 tracking-tighter mb-6 sm:mb-8 leading-[1.05] sm:leading-[1.0] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Reptile Identification and Management System for Peri-Urban Wildlife Conservation
          </h1>
          <p className="max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-lg text-stone-500 dark:text-stone-400 font-medium leading-relaxed mb-8 sm:mb-12 animate-fade-in-up px-2" style={{ animationDelay: '200ms' }}>
            ReptileGuard leverages modern computer vision to identify species, provide instant safety protocols, and streamline rescue operations in peri-urban areas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up px-2" style={{ animationDelay: '300ms' }}>
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 sm:gap-4"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-6 bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-3 sm:gap-4"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Aims Section */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-stone-900/50 border-y border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="space-y-3 sm:space-y-4 animate-fade-in-up">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">Safety First</h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                Protect residents by providing instant identification and scientific safety precautions during unexpected reptile encounters.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">Wildlife Conservation</h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                Reduce unnecessary animal mortality by educating the public and facilitating professional rescue instead of reactive harm.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4 animate-fade-in-up sm:col-span-2 lg:col-span-1" style={{ animationDelay: '200ms' }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">Data-Driven Insights</h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                Help wildlife departments track species migration and habitat shifts in peri-urban zones using high-quality sighting data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-600 dark:text-emerald-400 mb-3 sm:mb-4">Core Capabilities</h2>
            <p className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">Advanced tools for complex challenges.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard 
              icon={<Camera className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Visual Detection"
              desc="Identify thousands of snake and lizard species instantly with 95%+ accuracy using the Gemini Vision."
              delay={0}
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Threat Assessment"
              desc="Automatic danger level classification (Low to Critical) based on species-specific venom profiles."
              delay={100}
            />
            <FeatureCard 
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="Dispatch System"
              desc="Direct connection between citizens and local wildlife officers for rapid-response rescue operations."
              delay={200}
            />
            <FeatureCard 
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
              title="PDF Archiving"
              desc="Generate professional encounter reports for insurance, administrative records, or research purposes."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-32 bg-stone-900 dark:bg-stone-800 text-white rounded-2xl sm:rounded-[4rem] mx-3 sm:mx-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="space-y-8 sm:space-y-12">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tighter mb-4 sm:mb-6">How to use ReptileGuard.</h2>
                <p className="text-stone-400 text-sm sm:text-base font-medium">Simple steps to manage wildlife encounters safely and efficiently.</p>
              </div>
              
              <div className="space-y-6 sm:space-y-8">
                <Step num="01" title="Capture & Identify" desc="Stay at a safe distance and snap a photo. The system analyzes patterns to confirm the species." />
                <Step num="02" title="Review Safety Steps" desc="The app immediately displays whether the reptile is venomous and lists essential 'Do's and Don'ts'." />
                <Step num="03" title="Report Encounter" desc="Submit your location context. Wildlife officers are alerted based on the risk priority." />
                <Step num="04" title="Field Resolution" desc="Officers update the status from 'Assigned' to 'Rescued' once the situation is handled." />
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="bg-emerald-600/20 absolute -inset-10 blur-[100px] rounded-full animate-pulse"></div>
              <div className="relative bg-stone-800 dark:bg-stone-700 border border-stone-700 dark:border-stone-600 rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl animate-float">
                 <div className="aspect-[4/3] bg-stone-900 dark:bg-stone-800 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 sm:w-24 sm:h-24 text-emerald-500 opacity-20" />
                 </div>
                 <div className="space-y-3 sm:space-y-4">
                    <div className="h-3 sm:h-4 w-1/2 bg-emerald-500/20 rounded-full"></div>
                    <div className="h-3 sm:h-4 w-3/4 bg-stone-700 dark:bg-stone-600 rounded-full"></div>
                    <div className="h-3 sm:h-4 w-2/3 bg-stone-700 dark:bg-stone-600 rounded-full"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
            <div className="p-8 sm:p-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl sm:rounded-[3rem] border border-emerald-100 dark:border-emerald-800 animate-fade-in-up hover:shadow-xl transition-shadow">
               <h3 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-300 mb-4">For Citizens</h3>
               <ul className="space-y-3 sm:space-y-4">
                 <RoleItem text="Instant identification of unknown reptiles." />
                 <RoleItem text="Emergency first-aid and safety protocols." />
                 <RoleItem text="Simple one-tap incident reporting." />
                 <RoleItem text="Real-time tracking of your report status." />
               </ul>
            </div>
            <div className="p-8 sm:p-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl sm:rounded-[3rem] border border-amber-100 dark:border-amber-800 animate-fade-in-up hover:shadow-xl transition-shadow" style={{ animationDelay: '100ms' }}>
               <h3 className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300 mb-4">For Officers</h3>
               <ul className="space-y-3 sm:space-y-4">
                 <RoleItem text="Centralized regional sighting dashboard." />
                 <RoleItem text="Prioritized alerts for venomous species." />
                 <RoleItem text="Field verification with image uploads." />
                 <RoleItem text="Digital record keeping and analytics." />
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-16 sm:py-20 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-800 text-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-6 sm:mb-8 animate-float" />
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mb-4 sm:mb-6 tracking-tight">Ready to safeguard your community?</h2>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 font-medium mb-8 sm:mb-10">Join thousands of citizens and conservationists working together for a safer environment.</p>
          <button 
            onClick={onGetStarted}
            className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-700 dark:to-stone-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95"
          >
            Create Your Account
          </button>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay = 0 }: any) => (
  <div className="p-6 sm:p-10 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl sm:rounded-[2.5rem] hover:shadow-2xl hover:border-emerald-100 dark:hover:border-emerald-800 transition-all group animate-fade-in-up hover:-translate-y-1" style={{ animationDelay: `${delay}ms` }}>
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-50 dark:bg-stone-800 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all mb-6 sm:mb-8 shadow-inner">
      {icon}
    </div>
    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">{title}</h3>
    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }: any) => (
  <div className="flex gap-4 sm:gap-8 animate-fade-in-up">
    <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tighter opacity-50">{num}</span>
    <div>
      <h4 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2">{title}</h4>
      <p className="text-stone-400 text-xs sm:text-sm font-medium">{desc}</p>
    </div>
  </div>
);

const RoleItem = ({ text }: any) => (
  <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" /> {text}
  </li>
);

export default MarketingLanding;
