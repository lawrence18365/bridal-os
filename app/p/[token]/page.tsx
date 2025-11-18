"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Calendar, CreditCard, MapPin, ChevronDown, CheckCircle2 } from "lucide-react";
import { useEffect, useState, use } from "react";

export default function PublicPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const bride = useQuery(api.brides.getByToken, { token });
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!bride?.weddingDate) return;

    const calculateDays = () => {
      const weddingDate = new Date(bride.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = weddingDate - now;
      const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    };

    calculateDays();
  }, [bride?.weddingDate]);

  if (bride === undefined) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
           <p className="font-serif text-2xl text-stone-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (bride === null) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-stone-800 mb-4">Access Expired</h1>
          <p className="text-stone-500 font-sans font-light">
            This portal link is no longer active. Please contact the boutique for a new link.
          </p>
        </div>
      </div>
    );
  }

  const remainingBalance = bride.totalPrice - bride.paidAmount;
  const progressPercent = Math.min(100, Math.max(5, (bride.paidAmount / bride.totalPrice) * 100));

  // Status Logic
  const statusSteps = ["Onboarding", "Measurements", "In Progress", "Ready", "Completed"];
  const currentStepIndex = statusSteps.indexOf(bride.status) === -1 ? 0 : statusSteps.indexOf(bride.status);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-rose-200">
      
      {/* MOBILE HERO HEADER */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=2574&auto=format&fit=crop" 
          alt="Bridal Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/60 to-transparent">
           <p className="text-white/90 text-xs tracking-[0.3em] uppercase mb-2 font-medium">Welcome Back</p>
           <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
             {bride.name}
           </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto -mt-8 relative z-30 px-6 pb-20 space-y-6">
        
        {/* COUNTDOWN CARD */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/50">
          <div className="flex justify-between items-end">
            <div>
               <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Time Until I Do</p>
               <p className="text-5xl font-serif text-stone-800">{daysRemaining}</p>
               <p className="text-sm text-stone-400 font-light mt-1">days to go</p>
            </div>
            <div className="text-right">
               <p className="text-xs text-stone-500 font-medium">
                 {new Date(bride.weddingDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
               </p>
            </div>
          </div>
        </div>

        {/* STATUS TRACKER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
           <h2 className="font-serif text-xl mb-6">Dress Status</h2>
           <div className="relative pl-4 border-l border-stone-200 space-y-8 my-2">
              {statusSteps.map((step, index) => {
                 const isCompleted = index <= currentStepIndex;
                 const isCurrent = index === currentStepIndex;
                 
                 return (
                   <div key={step} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-300'}`} />
                      
                      <div className="flex justify-between items-center">
                         <p className={`text-sm ${isCurrent ? 'font-bold text-stone-900' : isCompleted ? 'text-stone-800' : 'text-stone-300'}`}>
                           {step}
                         </p>
                         {isCurrent && <span className="text-[10px] bg-stone-100 px-2 py-1 rounded text-stone-600 uppercase tracking-wider font-bold">Current</span>}
                      </div>
                   </div>
                 )
              })}
           </div>
        </div>

        {/* FINANCIALS */}
        <div className="bg-stone-900 text-white p-8 rounded-xl shadow-lg">
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl">Investment</h2>
              <CreditCard className="w-5 h-5 text-stone-400" />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between text-sm opacity-80">
                 <span>Total</span>
                 <span>${bride.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm opacity-80">
                 <span>Paid</span>
                 <span>${bride.paidAmount.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                 <div className="flex justify-between items-end">
                    <span className="text-xs uppercase tracking-widest opacity-60">Balance Due</span>
                    <span className="text-3xl font-serif">${remainingBalance.toLocaleString()}</span>
                 </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-white/10 h-1 rounded-full mt-2">
                 <div className="bg-white h-1 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>

              {remainingBalance > 0 && bride.stripeLink && (
                 <a 
                   href={bride.stripeLink}
                   className="block w-full bg-white text-black text-center py-4 mt-6 rounded-lg font-medium tracking-wide hover:bg-stone-200 transition-colors"
                 >
                   MAKE PAYMENT
                 </a>
              )}
           </div>
        </div>

        {/* DRESS DETAILS ACCORDION */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
           <button onClick={() => setActiveTab(activeTab === 'details' ? '' : 'details')} className="w-full p-6 flex justify-between items-center">
              <span className="font-serif text-lg">My Dress Details</span>
              <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${activeTab === 'details' ? 'rotate-180' : ''}`} />
           </button>
           
           {activeTab === 'details' && (
              <div className="px-6 pb-6 bg-stone-50/50 border-t border-stone-100 space-y-4 pt-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Contact Email</p>
                       <p className="text-sm">{bride.email}</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Order Date</p>
                       <p className="text-sm">{new Date(bride._creationTime).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <p className="text-center text-[10px] uppercase tracking-widest text-stone-300 pt-8">Powered by Bridal OS</p>

      </div>
    </div>
  );
}