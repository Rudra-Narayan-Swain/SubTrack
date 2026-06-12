import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, Clock, CheckCircle, TrendingUp, Layers,
    Smartphone, Monitor, ChevronRight, Bell, RefreshCw, 
    X, Check, AlertCircle, PlusCircle, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { subscribeToSubscriptions, addSubscription, updateSubscription } from '../../services/subscriptionService';
import { subscribeToPayments, addPayment } from '../../services/paymentService';
import { formatCurrency, toMonthlyCost } from '../../utils/currencyUtils';
import { formatDate, getDaysUntil, getNextBillingDate } from '../../utils/dateUtils';
import type { Subscription } from '../../types';

const BUDGET_LIMIT = 250; // target monthly budget cap

const CATEGORY_COLORS: Record<string, string> = {
    streaming: '#6366f1',
    utilities: '#22d3ee',
    saas: '#10b981',
    software: '#f59e0b',
    food: '#ec4899',
    other: '#a855f7',
};

const CATEGORY_LABELS: Record<string, string> = {
    streaming: 'Streaming',
    utilities: 'Utilities',
    saas: 'SaaS',
    software: 'Software',
    food: 'Food & Dining',
    other: 'Other',
};

export const Dashboard = () => {
    const { user, subscriptions, payments, setSubscriptions, setPayments } = useStore();

    // View Mode: 'desktop' (Expanded) vs 'mobile' (Simulator Chassis)
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
        return (localStorage.getItem('subtrack_view_mode') as 'desktop' | 'mobile') || 'desktop';
    });

    const handleSetViewMode = (mode: 'desktop' | 'mobile') => {
        setViewMode(mode);
        localStorage.setItem('subtrack_view_mode', mode);
    };

    // Category Filter
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    // Bottom Sheet for adding subscriptions
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [subName, setSubName] = useState('');
    const [subPrice, setSubPrice] = useState('');
    const [subCycle, setSubCycle] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [subCategory, setSubCategory] = useState('streaming');
    const [subCurrency, setSubCurrency] = useState('USD');
    const [subStartDate, setSubStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [subNotes, setSubNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic Island State
    const [islandState, setIslandState] = useState<'idle' | 'alert' | 'expanded'>('idle');
    const [islandText, setIslandText] = useState('');
    const islandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Notifications Center
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; type: 'alert' | 'info' | 'success' }[]>([
        { id: '1', text: 'Spotify payment processed successfully.', time: '2 hours ago', type: 'success' },
        { id: '2', text: 'Amazon Prime due in 2 days ($14.99). Swipe to pay.', time: '1 day ago', type: 'alert' },
        { id: '3', text: 'You are close to 75% of your monthly budget limit.', time: '2 days ago', type: 'info' }
    ]);

    // Swipe-to-Action States for upcoming renewals list
    const [swipeCardId, setSwipeCardId] = useState<string | null>(null);
    const [swipeOffset, setSwipeOffset] = useState<number>(0);
    const dragStartX = useRef<number>(0);
    const isDragging = useRef<boolean>(false);

    // Pull-to-refresh state
    const [pullOffset, setPullOffset] = useState<number>(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pullStartY = useRef<number>(0);
    const isPulling = useRef<boolean>(false);

    useEffect(() => {
        if (!user?.uid) return;
        const unsub1 = subscribeToSubscriptions(user.uid, setSubscriptions);
        const unsub2 = subscribeToPayments(user.uid, setPayments);
        return () => {
            unsub1();
            unsub2();
        };
    }, [user?.uid, setSubscriptions, setPayments]);



    // Derived statistics
    const active = subscriptions.filter((s) => s.status === 'active');
    const monthlySpend = active.reduce((sum, s) => sum + toMonthlyCost(s.price, s.billingCycle), 0);
    const completed = payments.filter((p) => p.status === 'completed');
    const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0);

    // Filtered subscriptions based on category selector
    const filteredSubscriptions = selectedCategory === 'all' 
        ? active 
        : active.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

    const upcoming = [...filteredSubscriptions]
        .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
        .slice(0, 4);

    // Dynamic Island Alert Helper
    const triggerIslandAlert = (text: string) => {
        if (islandTimerRef.current) clearTimeout(islandTimerRef.current);
        setIslandText(text);
        setIslandState('alert');
        islandTimerRef.current = setTimeout(() => {
            setIslandState('idle');
        }, 3500);
    };

    // Confetti generator helper
    const triggerConfetti = (e: React.PointerEvent<any> | { clientX: number; clientY: number }) => {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        const colors = ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'];
        
        for (let i = 0; i < 40; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-particle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            el.style.backgroundColor = color;
            
            // Spawn location
            el.style.left = `${e.clientX}px`;
            el.style.top = `${e.clientY}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 110;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 25; // force weight upwards
            const rot = Math.random() * 360 + 180;
            
            el.style.setProperty('--tx', `${tx}px`);
            el.style.setProperty('--ty', `${ty}px`);
            el.style.setProperty('--rot', `${rot}deg`);
            
            container.appendChild(el);
            setTimeout(() => el.remove(), 1350);
        }
    };

    // Log payment (Mark Paid)
    const handleMarkPaid = async (sub: Subscription, clientX = window.innerWidth / 2, clientY = window.innerHeight / 2) => {
        if (!user?.uid) return;
        try {
            const nextDate = getNextBillingDate(sub.nextBillingDate, sub.billingCycle);
            const paymentData = {
                userId: user.uid,
                subscriptionId: sub.id,
                subscriptionName: sub.name,
                amount: sub.price,
                currency: sub.currency || 'USD',
                date: new Date().toISOString(),
                method: 'credit_card' as const,
                status: 'completed' as const,
                notes: 'Logged via quick action'
            };
            
            await addPayment(paymentData, sub, nextDate);
            
            // Add a mock completed notification
            const newNotif = {
                id: Date.now().toString(),
                text: `Payment of ${formatCurrency(sub.price, sub.currency)} logged for ${sub.name}.`,
                time: 'Just now',
                type: 'success' as const
            };
            setNotifications(prev => [newNotif, ...prev]);

            triggerIslandAlert(`Payment logged for ${sub.name}! 🎉`);
            triggerConfetti({ clientX, clientY });
        } catch (e: any) {
            console.error('Failed to log payment:', e);
            triggerIslandAlert('Failed to log payment ⚠️');
        }
    };

    // Snooze billing date (snooze by 7 days)
    const handleSnooze = async (sub: Subscription) => {
        try {
            const currentNext = new Date(sub.nextBillingDate);
            currentNext.setDate(currentNext.getDate() + 7);
            const newDate = currentNext.toISOString();
            
            await updateSubscription(sub.id, { nextBillingDate: newDate });
            
            const newNotif = {
                id: Date.now().toString(),
                text: `${sub.name} renewal snoozed by 7 days.`,
                time: 'Just now',
                type: 'info' as const
            };
            setNotifications(prev => [newNotif, ...prev]);
            
            triggerIslandAlert(`${sub.name} snoozed ⏰`);
        } catch (e) {
            console.error('Failed to snooze:', e);
            triggerIslandAlert('Snooze failed ⏰');
        }
    };

    // Swipe Card Pointer Gestures
    const handlePointerDownCard = (e: React.PointerEvent, id: string) => {
        dragStartX.current = e.clientX;
        isDragging.current = true;
        setSwipeCardId(id);
        setSwipeOffset(0);
        
        // Disable text selection during drag
        document.body.style.userSelect = 'none';
    };

    const handlePointerMoveCard = (e: React.PointerEvent) => {
        if (!isDragging.current || !swipeCardId) return;
        const diff = e.clientX - dragStartX.current;
        // Limit maximum drag to 150px
        const clampedDiff = Math.max(-145, Math.min(145, diff));
        setSwipeOffset(clampedDiff);
    };

    const handlePointerUpCard = async (e: React.PointerEvent, sub: Subscription) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        document.body.style.userSelect = '';

        const threshold = 95;
        const finalOffset = swipeOffset;
        
        const cardEl = document.getElementById(`swipe-card-${sub.id}`);
        if (cardEl) {
            cardEl.classList.add('animating');
        }

        if (finalOffset >= threshold) {
            // Paid action (swipe right)
            await handleMarkPaid(sub, e.clientX, e.clientY);
            setSwipeOffset(0);
            setTimeout(() => {
                if (cardEl) cardEl.classList.remove('animating');
                setSwipeCardId(null);
            }, 300);
        } else if (finalOffset <= -threshold) {
            // Snooze action (swipe left)
            await handleSnooze(sub);
            setSwipeOffset(0);
            setTimeout(() => {
                if (cardEl) cardEl.classList.remove('animating');
                setSwipeCardId(null);
            }, 300);
        } else {
            // Snap back
            setSwipeOffset(0);
            setTimeout(() => {
                if (cardEl) cardEl.classList.remove('animating');
                setSwipeCardId(null);
            }, 300);
        }
    };

    // Simulated Pull-To-Refresh Gestures
    const handlePointerDownPull = (e: React.PointerEvent) => {
        const viewport = e.currentTarget as HTMLDivElement;
        if (viewport.scrollTop > 0 || isRefreshing) return;
        
        pullStartY.current = e.clientY;
        isPulling.current = true;
    };

    const handlePointerMovePull = (e: React.PointerEvent) => {
        if (!isPulling.current || isRefreshing) return;
        const diff = e.clientY - pullStartY.current;
        if (diff > 0) {
            // Apply rubber banding multiplier
            const rubberOffset = Math.min(80, diff * 0.45);
            setPullOffset(rubberOffset);
        }
    };

    const handlePointerUpPull = () => {
        if (!isPulling.current) return;
        isPulling.current = false;
        
        if (pullOffset >= 50) {
            setIsRefreshing(true);
            setPullOffset(50);
            
            // Mock server sync
            setTimeout(() => {
                setIsRefreshing(false);
                setPullOffset(0);
                triggerIslandAlert('Sync complete! 🔄');
            }, 1200);
        } else {
            setPullOffset(0);
        }
    };

    // Save Subscription (from Bottom Sheet)
    const handleSaveSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid || !subName || !subPrice) return;
        
        setIsSaving(true);
        try {
            const newSub = {
                userId: user.uid,
                name: subName,
                price: parseFloat(subPrice),
                currency: subCurrency,
                category: subCategory,
                billingCycle: subCycle,
                startDate: new Date(subStartDate).toISOString(),
                nextBillingDate: new Date(subStartDate).toISOString(),
                status: 'active' as const,
                notes: subNotes
            };

            await addSubscription(newSub);
            
            // Reset fields
            setSubName('');
            setSubPrice('');
            setSubNotes('');
            
            setIsBottomSheetOpen(false);
            
            triggerIslandAlert(`Added ${subName}! 🚀`);
            
            // Trigger particle effect in center of button/screen
            triggerConfetti({ clientX: window.innerWidth / 2, clientY: window.innerHeight * 0.7 });
        } catch (e) {
            console.error(e);
            triggerIslandAlert('Failed to add subscription ⚠️');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate Donut circle metrics
    const budgetPct = Math.min(100, Math.round((monthlySpend / BUDGET_LIMIT) * 100));
    const radius = 40;
    const circ = 2 * Math.PI * radius; // ~251.3
    const strokeOffset = circ - (budgetPct / 100) * circ;

    const ringColor = budgetPct >= 90 
        ? '#ef4444' // red
        : budgetPct >= 70 
        ? '#f59e0b' // orange/amber
        : '#6366f1'; // indigo/primary

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center p-8 bg-white/2 rounded-2xl border border-white/5 gap-3 text-center my-4">
            <AlertCircle className="w-10 h-10 text-white/20" />
            <div>
                <p className="text-white/60 text-sm font-semibold">No Active Renewals</p>
                <p className="text-white/30 text-xs mt-0.5">Change filters or add a new subscription</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#07080f] select-none selection:bg-primary/20">
            {/* Confetti Container */}
            <div id="confetti-container" className="fixed inset-0 pointer-events-none z-99" />

            {/* Toggle View Bar */}
            <div className="bg-[#0b0c16] border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center font-bold text-sm">
                        S
                    </div>
                    <span className="font-extrabold text-sm tracking-wide text-white">SUBTRACK LABS</span>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => handleSetViewMode('desktop')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === 'desktop' ? 'bg-primary text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        Expanded Web
                    </button>
                    <button 
                        onClick={() => handleSetViewMode('mobile')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === 'mobile' ? 'bg-primary text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        Mobile Simulator
                    </button>
                </div>
            </div>

            {/* Render View Mode content */}
            {viewMode === 'desktop' ? (
                /* ========================================================================= */
                /*                         EXPANDED DESKTOP VIEW                             */
                /* ========================================================================= */
                <div className="p-6 md:p-10 max-w-6xl mx-auto pb-28 animate-fade-in relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">DASHBOARD</p>
                            <h1 className="text-4xl font-extrabold tracking-tight"
                                style={{ background: 'linear-gradient(135deg, #fff 40%, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                            </h1>
                            <p className="text-sm text-white/30 mt-1">Here is a summary of your active subscriptions and budget.</p>
                        </div>
                        <button 
                            onClick={() => setIsBottomSheetOpen(true)}
                            className="btn-primary w-fit text-sm px-5 py-2.5"
                        >
                            <Plus className="w-4 h-4" />
                            Add Subscription
                        </button>
                    </div>

                    {/* Stats & Circular Budget Ring */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Circular Budget Widget */}
                        <div className="card lg:col-span-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                            <div className="absolute top-3 left-4 text-xs font-bold text-white/30 uppercase tracking-wider">Monthly Budget</div>
                            
                            <div className="relative w-36 h-36 flex items-center justify-center mt-4 mb-3">
                                {/* SVG Ring */}
                                <svg className="w-full h-full transform -rotate-90">
                                    {/* Trail */}
                                    <circle cx="72" cy="72" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" className="transform translate-x-[0px] translate-y-[0px] scale-1.5 origin-center" />
                                    {/* Fill Progress */}
                                    <circle 
                                        cx="72" 
                                        cy="72" 
                                        r={radius} 
                                        stroke={ringColor} 
                                        strokeWidth="8" 
                                        fill="transparent" 
                                        strokeDasharray={circ} 
                                        strokeDashoffset={strokeOffset} 
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out transform translate-x-[0px] translate-y-[0px] scale-1.5 origin-center"
                                        style={{ filter: `drop-shadow(0 0 8px ${ringColor}66)` }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">{budgetPct}%</span>
                                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">spent</span>
                                </div>
                            </div>

                            <p className="text-white text-sm font-semibold">{formatCurrency(monthlySpend)} of {formatCurrency(BUDGET_LIMIT)} limit</p>
                            <p className="text-xs text-white/30 mt-0.5">{formatCurrency(Math.max(0, BUDGET_LIMIT - monthlySpend))} remaining</p>
                        </div>

                        {/* Classic Cards */}
                        <div className="card flex flex-col justify-between p-6 relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-1">Active Subscriptions</p>
                                    <p className="text-3xl font-extrabold text-[#22d3ee]">{active.length}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <Layers className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                                <span className="text-white/30">Total registered</span>
                                <span className="text-white font-bold">{subscriptions.length} items</span>
                            </div>
                        </div>

                        <div className="card flex flex-col justify-between p-6 relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-1">Total Paid History</p>
                                    <p className="text-3xl font-extrabold text-[#10b981]">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                                <span className="text-white/30">Payments completed</span>
                                <span className="text-white font-bold">{completed.length} records</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${selectedCategory === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}`}
                        >
                            All Categories
                        </button>
                        {Object.keys(CATEGORY_LABELS).map((catKey) => {
                            const activeInCat = active.filter(s => s.category?.toLowerCase() === catKey);
                            if (activeInCat.length === 0) return null;
                            const isSel = selectedCategory === catKey;
                            const color = CATEGORY_COLORS[catKey];
                            
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedCategory(catKey)}
                                    className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5"
                                    style={{
                                        backgroundColor: isSel ? `${color}22` : 'rgba(255,255,255,0.03)',
                                        borderColor: isSel ? color : 'rgba(255,255,255,0.08)',
                                        color: isSel ? '#fff' : 'rgba(255,255,255,0.5)'
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                    {CATEGORY_LABELS[catKey]} ({activeInCat.length})
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upcoming Renewals */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                                        Upcoming Renewals
                                        <span className="text-xs bg-primary/20 text-primary-light px-2 py-0.5 rounded-full font-bold">
                                            {upcoming.length}
                                        </span>
                                    </h2>
                                    <p className="text-xs text-white/30 mt-0.5">Drag to complete payments, or click action buttons.</p>
                                </div>
                                <Link to="/subscriptions" className="text-xs text-primary/70 hover:text-primary transition-colors">View all →</Link>
                            </div>

                            <div className="space-y-4">
                                {upcoming.length === 0 ? renderEmptyState() : upcoming.map((sub) => {
                                    const days = getDaysUntil(sub.nextBillingDate);
                                    const isOverdue = days < 0;
                                    const isUrgent = days >= 0 && days <= 3;
                                    const badgeColor = isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#10b981';
                                    const badgeBg = isOverdue ? 'rgba(239,68,68,0.12)' : isUrgent ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
                                    const badgeText = isOverdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d`;
                                    
                                    const isSwiped = swipeCardId === sub.id;
                                    
                                    return (
                                        <div key={sub.id} className="swipeable-container">
                                            {/* Swipe backgrounds */}
                                            <div 
                                                className="swipe-background"
                                                style={{
                                                    backgroundColor: isSwiped && swipeOffset > 0 
                                                        ? 'rgba(16, 185, 129, 0.2)' 
                                                        : isSwiped && swipeOffset < 0 
                                                        ? 'rgba(245, 158, 11, 0.2)' 
                                                        : 'rgba(255,255,255,0.01)',
                                                    border: isSwiped 
                                                        ? `1px solid ${swipeOffset > 0 ? '#10b981' : '#f59e0b'}33` 
                                                        : 'none'
                                                }}
                                            >
                                                <div className="flex items-center gap-1 text-emerald-400 font-bold" style={{ opacity: isSwiped && swipeOffset > 30 ? 1 : 0 }}>
                                                    <Check className="w-4 h-4" /> Paid
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-500 font-bold" style={{ opacity: isSwiped && swipeOffset < -30 ? 1 : 0 }}>
                                                    <Clock className="w-4 h-4" /> Snooze
                                                </div>
                                            </div>

                                            {/* Foreground Card */}
                                            <div
                                                id={`swipe-card-${sub.id}`}
                                                onPointerDown={(e) => handlePointerDownCard(e, sub.id)}
                                                onPointerMove={handlePointerMoveCard}
                                                onPointerUp={(e) => handlePointerUpCard(e, sub)}
                                                className="swipe-action-item p-4 bg-[#111221] rounded-2xl border border-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing"
                                                style={{
                                                    transform: isSwiped ? `translate3d(${swipeOffset}px, 0px, 0px)` : 'translate3d(0px, 0px, 0px)',
                                                    borderLeft: `4px solid ${CATEGORY_COLORS[sub.category?.toLowerCase()] || '#6366f1'}`
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                                                        style={{ 
                                                            background: `linear-gradient(135deg, ${CATEGORY_COLORS[sub.category?.toLowerCase()] || '#6366f1'}, ${CATEGORY_COLORS[sub.category?.toLowerCase()] || '#8b5cf6'}bb)`,
                                                            boxShadow: `0 4px 12px ${(CATEGORY_COLORS[sub.category?.toLowerCase()] || '#6366f1')}44` 
                                                        }}>
                                                        {sub.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-white text-sm font-bold truncate max-w-[130px]">{sub.name}</p>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: badgeColor, background: badgeBg }}>
                                                                {badgeText}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-white/30 mt-0.5">{formatDate(sub.nextBillingDate)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <p className="text-white font-bold text-sm">{formatCurrency(sub.price, sub.currency)}</p>
                                                    
                                                    {/* Mouse/Desktop Action Buttons */}
                                                    <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkPaid(sub, e.clientX, e.clientY);
                                                            }}
                                                            className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 flex items-center justify-center text-emerald-400 cursor-pointer"
                                                            title="Mark as Paid"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSnooze(sub);
                                                            }}
                                                            className="w-7 h-7 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 flex items-center justify-center text-amber-400 cursor-pointer"
                                                            title="Snooze 7 Days"
                                                        >
                                                            <Clock className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Payments History */}
                        <div className="card">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    Recent Payment History
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                </h2>
                                <Link to="/payments" className="text-xs text-primary/70 hover:text-primary transition-colors">View all →</Link>
                            </div>
                            
                            <div className="space-y-3">
                                {completed.slice(0, 4).length === 0 ? (
                                    <p className="text-white/30 text-sm text-center py-8">No billing payments logged yet.</p>
                                ) : (
                                    completed.slice(0, 4).map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between p-3.5 bg-white/2 rounded-xl border border-white/5 hover:bg-white/4 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-semibold truncate max-w-[140px]">{payment.subscriptionName}</p>
                                                    <p className="text-xs text-white/30 mt-0.5">{formatDate(payment.date)}</p>
                                                </div>
                                            </div>
                                            <p className="text-white font-extrabold text-sm">{formatCurrency(payment.amount, payment.currency)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ========================================================================= */
                /*                         MOBILE APP SIMULATOR VIEW                         */
                /* ========================================================================= */
                <div className="flex justify-center items-center py-10 z-10 relative">
                    <div className="phone-mockup-container">
                        {/* Physical Phone Frame buttons */}
                        <div className="phone-btn-left-top" />
                        <div className="phone-btn-left-bottom" />
                        <div className="phone-btn-left-extra" />
                        <div className="phone-btn-right" />

                        {/* iPhone Mockup frame */}
                        <div className="phone-mockup">
                            {/* Dynamic Island Notch */}
                            <div className="dynamic-island-container">
                                <div 
                                    className={`dynamic-island ${islandState === 'alert' ? 'expanded alert-active' : islandState === 'expanded' ? 'expanded' : ''}`}
                                    onClick={() => {
                                        if (islandState === 'idle') {
                                            setIslandState('expanded');
                                        } else if (islandState === 'expanded') {
                                            setIslandState('idle');
                                        }
                                    }}
                                >
                                    {islandState === 'alert' && (
                                        <div className="flex items-center gap-2.5 px-3 w-full animate-fade-in text-white">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                            <span className="text-[10px] font-bold text-white/90 truncate flex-1">{islandText}</span>
                                        </div>
                                    )}
                                    {islandState === 'expanded' && (
                                        <div className="flex items-center justify-between px-3 w-full animate-fade-in text-white">
                                            <div className="flex flex-col text-left">
                                                <span className="text-[9px] uppercase font-bold text-white/30 tracking-wider">Subtrack status</span>
                                                <span className="text-[11px] font-bold text-[#6366f1]">{budgetPct}% limit used</span>
                                            </div>
                                            <div className="text-right text-[10px] text-white/60">
                                                {formatCurrency(Math.max(0, BUDGET_LIMIT - monthlySpend))} left
                                            </div>
                                        </div>
                                    )}
                                    {islandState === 'idle' && (
                                        <div className="w-3.5 h-3.5 rounded-full bg-[#111] border border-white/10" />
                                    )}
                                </div>
                            </div>

                            {/* Mobile Viewport Screen */}
                            <div className="mobile-viewport">
                                {/* Top device header bar */}
                                <div className="h-10 pt-3.5 px-6 flex justify-between items-center text-[11px] font-bold text-white/80 bg-gradient-to-b from-black/40 to-transparent z-30 shrink-0">
                                    <span>9:41</span>
                                    <div className="flex items-center gap-1.5">
                                        {/* Carrier bars */}
                                        <div className="flex gap-0.5 items-end h-2.5">
                                            <div className="w-0.5 h-1 bg-white rounded-sm" />
                                            <div className="w-0.5 h-1.5 bg-white rounded-sm" />
                                            <div className="w-0.5 h-2 bg-white rounded-sm" />
                                            <div className="w-0.5 h-2.5 bg-white/40 rounded-sm" />
                                        </div>
                                        {/* Wi-Fi Icon */}
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21l-12-12c5-5 13-5 18 0l-6 12zm0-15c-3 0-6 1-8 3l8 8 8-8c-2-2-5-3-8-3z"/>
                                        </svg>
                                        {/* Battery */}
                                        <div className="w-5 h-2.5 border border-white/50 rounded-sm p-0.5 flex items-center">
                                            <div className="h-full bg-white rounded-xs w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Pull-to-refresh spinner indicator */}
                                <div 
                                    className="absolute left-0 right-0 flex justify-center items-center transition-all duration-200 z-30"
                                    style={{ 
                                        top: `${pullOffset - 35}px`,
                                        opacity: pullOffset > 10 ? 1 : 0
                                    }}
                                >
                                    <RefreshCw className={`w-5 h-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullOffset * 6}deg)` }} />
                                </div>

                                {/* Main mobile scrolling body */}
                                <div 
                                    className="flex-1 overflow-y-auto px-4 pb-20 pt-2 transition-all duration-200"
                                    onPointerDown={handlePointerDownPull}
                                    onPointerMove={handlePointerMovePull}
                                    onPointerUp={handlePointerUpPull}
                                    style={{ 
                                        transform: pullOffset > 0 ? `translate3d(0px, ${pullOffset}px, 0px)` : 'none'
                                    }}
                                >
                                    {/* Mobile Header Greeting */}
                                    <div className="flex justify-between items-center mt-3 mb-5">
                                        <div>
                                            <h2 className="text-[17px] font-black text-white">Hello, {user?.name?.split(' ')[0] || 'there'} 👋</h2>
                                            <p className="text-[11px] text-white/35 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                        </div>

                                        <button 
                                            onClick={() => setNotificationsOpen(true)}
                                            className="w-9 h-9 rounded-full bg-white/4 flex items-center justify-center text-white/70 relative border border-white/5 cursor-pointer active:scale-95 transition-transform"
                                        >
                                            <Bell className="w-4 h-4" />
                                            {notifications.length > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#07080f]" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Mobile Spend Card (Gradient Glows) */}
                                    <div className="bg-[#121324] rounded-2xl p-4 border border-[#6366f1]/15 mb-4 relative overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Monthly Spend</span>
                                                <h3 className="text-2xl font-black text-white mt-0.5">{formatCurrency(monthlySpend)}</h3>
                                                <p className="text-[10px] text-white/45 mt-2 pt-2 border-t border-white/5 font-semibold">
                                                    {active.length} active tracker subscriptions
                                                </p>
                                            </div>
                                            
                                            {/* Circular budget indicator inside the card */}
                                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" fill="transparent" />
                                                    <circle 
                                                        cx="32" 
                                                        cy="32" 
                                                        r="22" 
                                                        stroke={ringColor} 
                                                        strokeWidth="4.5" 
                                                        fill="transparent" 
                                                        strokeDasharray={2 * Math.PI * 22} 
                                                        strokeDashoffset={(2 * Math.PI * 22) - (budgetPct / 100) * (2 * Math.PI * 22)} 
                                                        strokeLinecap="round"
                                                        className="transition-all duration-700 ease-out"
                                                    />
                                                </svg>
                                                <span className="absolute text-[10px] font-black text-white">{budgetPct}%</span>
                                            </div>
                                        </div>

                                        {/* Glow effects inside phone mockup */}
                                        <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[#6366f1]/10 blur-xl pointer-events-none" />
                                        <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
                                    </div>

                                    {/* Mobile Quick Stats */}
                                    <div className="grid grid-cols-3 gap-2.5 mb-5">
                                        <div className="bg-white/3 rounded-xl p-2.5 border border-white/5 text-center flex flex-col items-center">
                                            <Clock className="w-4 h-4 text-amber-400 mb-1" />
                                            <span className="text-base font-extrabold text-white">{upcoming.length}</span>
                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Due</span>
                                        </div>
                                        <div className="bg-white/3 rounded-xl p-2.5 border border-white/5 text-center flex flex-col items-center">
                                            <AlertCircle className="w-4 h-4 text-white/30 mb-1" />
                                            <span className="text-base font-extrabold text-white">{subscriptions.length - active.length}</span>
                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Paused</span>
                                        </div>
                                        <div className="bg-white/3 rounded-xl p-2.5 border border-white/5 text-center flex flex-col items-center">
                                            <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
                                            <span className="text-base font-extrabold text-white">{subscriptions.length}</span>
                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Total</span>
                                        </div>
                                    </div>

                                    {/* Mobile Upcoming section */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3.5">
                                            <span className="text-[13px] font-bold text-white">Upcoming Bills</span>
                                            <button 
                                                onClick={() => triggerIslandAlert('Tap on lists below or swipe.')}
                                                className="text-[10px] text-primary font-bold hover:underline"
                                            >
                                                Swipe Actions
                                            </button>
                                        </div>

                                        <div className="space-y-2.5">
                                            {upcoming.length === 0 ? renderEmptyState() : upcoming.map((sub) => {
                                                const days = getDaysUntil(sub.nextBillingDate);
                                                const isOverdue = days < 0;
                                                const isUrgent = days >= 0 && days <= 3;
                                                const badgeColor = isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#10b981';
                                                const badgeBg = isOverdue ? 'rgba(239,68,68,0.12)' : isUrgent ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
                                                const badgeText = isOverdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d`;
                                                
                                                const isSwiped = swipeCardId === sub.id;

                                                return (
                                                    <div key={sub.id} className="swipeable-container">
                                                        {/* Swipe Background */}
                                                        <div 
                                                            className="swipe-background"
                                                            style={{
                                                                backgroundColor: isSwiped && swipeOffset > 0 
                                                                    ? 'rgba(16, 185, 129, 0.2)' 
                                                                    : isSwiped && swipeOffset < 0 
                                                                    ? 'rgba(245, 158, 11, 0.2)' 
                                                                    : 'transparent',
                                                                border: isSwiped 
                                                                    ? `1px solid ${swipeOffset > 0 ? '#10b981' : '#f59e0b'}33` 
                                                                    : 'none'
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]" style={{ opacity: isSwiped && swipeOffset > 25 ? 1 : 0 }}>
                                                                <Check className="w-3.5 h-3.5" /> PAID
                                                            </div>
                                                            <div className="flex items-center gap-1 text-amber-500 font-bold text-[10px]" style={{ opacity: isSwiped && swipeOffset < -25 ? 1 : 0 }}>
                                                                <Clock className="w-3.5 h-3.5" /> SNOOZE
                                                            </div>
                                                        </div>

                                                        {/* Swiped Card item */}
                                                        <div
                                                            id={`swipe-card-${sub.id}`}
                                                            onPointerDown={(e) => handlePointerDownCard(e, sub.id)}
                                                            onPointerMove={handlePointerMoveCard}
                                                            onPointerUp={(e) => handlePointerUpCard(e, sub)}
                                                            className="swipe-action-item p-3 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing"
                                                            style={{
                                                                transform: isSwiped ? `translate3d(${swipeOffset}px, 0px, 0px)` : 'translate3d(0px, 0px, 0px)',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-[12px] shrink-0"
                                                                    style={{ 
                                                                        background: `linear-gradient(135deg, ${CATEGORY_COLORS[sub.category?.toLowerCase()] || '#6366f1'}, ${CATEGORY_COLORS[sub.category?.toLowerCase()] || '#8b5cf6'}bb)`,
                                                                    }}>
                                                                    {sub.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="text-white text-xs font-bold truncate max-w-[90px]">{sub.name}</p>
                                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ color: badgeColor, background: badgeBg }}>
                                                                            {badgeText}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[9px] text-white/30 mt-0.5">{formatDate(sub.nextBillingDate)}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <p className="text-white font-bold text-xs">{formatCurrency(sub.price, sub.currency)}</p>
                                                                <ChevronRight className="w-3 h-3 text-white/20" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Add Action Button (FAB) */}
                                <button 
                                    onClick={() => setIsBottomSheetOpen(true)}
                                    className="absolute right-4 bottom-20 w-11 h-11 rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-lg shadow-primary/40 flex items-center justify-center text-white cursor-pointer active:scale-90 transition-transform z-30"
                                >
                                    <Plus className="w-5.5 h-5.5" />
                                </button>

                                {/* Mock bottom navbar tabs inside mobile view */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#0c0d1b]/95 border-t border-white/5 flex justify-around items-center px-4 pb-2 z-30">
                                    <div className="flex flex-col items-center text-primary cursor-pointer active:scale-95 transition-transform" onClick={() => triggerIslandAlert('Already on Home Tab 🏠')}>
                                        <Monitor className="w-4 h-4" />
                                        <span className="text-[8px] mt-1 font-bold">Home</span>
                                    </div>
                                    <div className="flex flex-col items-center text-white/40 cursor-pointer active:scale-95 transition-transform" onClick={() => triggerIslandAlert('Navigate via main sidebar 👈')}>
                                        <Layers className="w-4 h-4" />
                                        <span className="text-[8px] mt-1 font-bold">Tracker</span>
                                    </div>
                                    <div className="flex flex-col items-center text-white/40 cursor-pointer active:scale-95 transition-transform" onClick={() => triggerIslandAlert('Use top view toggle to navigate 📱')}>
                                        <PlusCircle className="w-4 h-4" />
                                        <span className="text-[8px] mt-1 font-bold">Quick Add</span>
                                    </div>
                                    <div className="flex flex-col items-center text-white/40 cursor-pointer active:scale-95 transition-transform" onClick={() => triggerIslandAlert('Use main sidebar menu 👈')}>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-[8px] mt-1 font-bold">Analytics</span>
                                    </div>
                                </div>

                                {/* Phone physical home bottom swipe indicator */}
                                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-40 pointer-events-none" />

                                {/* Notifications Center Drawer Overlay */}
                                <div 
                                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-45 transition-opacity duration-300 ${notificationsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                    onClick={() => setNotificationsOpen(false)}
                                />
                                <div 
                                    className={`absolute top-0 bottom-0 right-0 w-3/4 bg-[#0c0e1a] border-l border-white/5 z-50 p-4 transition-transform duration-300 flex flex-col ${notificationsOpen ? 'translate-x-0' : 'translate-x-full'}`}
                                >
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                        <span className="text-[12px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <Bell className="w-3.5 h-3.5 text-primary" /> Notifications
                                        </span>
                                        <button onClick={() => setNotificationsOpen(false)} className="text-white/40 hover:text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2">
                                        {notifications.length === 0 ? (
                                            <p className="text-white/30 text-[10px] text-center mt-10">No new notifications.</p>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className="p-2.5 bg-white/2 rounded-lg border border-white/5 relative group">
                                                    <p className="text-white text-[10px] leading-relaxed pr-3">{notif.text}</p>
                                                    <span className="text-[8px] text-white/25 block mt-1">{notif.time}</span>
                                                    <button 
                                                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                                                        className="absolute top-2 right-2 text-white/10 group-hover:text-white/40"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={() => setNotifications([])}
                                            className="w-full mt-3 py-2 bg-white/4 border border-white/5 text-white/60 rounded-lg text-[10px] font-bold hover:text-white active:scale-95 transition-transform"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */
            /*                      DYNAMIC BOTTOM SHEET MODAL                           */
            /* ========================================================================= */}
            <div 
                className={`bottom-sheet-overlay ${isBottomSheetOpen ? 'active' : ''}`}
                onClick={() => setIsBottomSheetOpen(false)}
                style={{ zIndex: 100 }}
            />
            <div 
                className={`bottom-sheet max-w-md mx-auto ${isBottomSheetOpen ? 'active' : ''}`}
                style={{ 
                    zIndex: 101, 
                    left: '50%',
                    transform: isBottomSheetOpen ? 'translate3d(-50%, 0, 0)' : 'translate3d(-50%, 100%, 0)',
                    width: '100%',
                }}
            >
                {/* Drag handle line */}
                <div className="w-12 h-1 bg-white/15 rounded-full mx-auto my-3 cursor-pointer" onClick={() => setIsBottomSheetOpen(false)} />

                <div className="px-6 pb-8 pt-2">
                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h3 className="text-lg font-black text-white">Add Subscription</h3>
                            <p className="text-xs text-white/30">Instantly tracks and forecasts spend.</p>
                        </div>
                        <button 
                            onClick={() => setIsBottomSheetOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveSubscription} className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Subscription Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Netflix, Spotify, AWS"
                                value={subName}
                                onChange={(e) => setSubName(e.target.value)}
                                className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Price</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="9.99"
                                    value={subPrice}
                                    onChange={(e) => setSubPrice(e.target.value)}
                                    className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Currency</label>
                                <select 
                                    value={subCurrency}
                                    onChange={(e) => setSubCurrency(e.target.value)}
                                    className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Billing Cycle</label>
                                <select 
                                    value={subCycle}
                                    onChange={(e) => setSubCycle(e.target.value as any)}
                                    className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Category</label>
                                <select 
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-all capitalize"
                                >
                                    {Object.keys(CATEGORY_LABELS).map((catKey) => (
                                        <option key={catKey} value={catKey}>{CATEGORY_LABELS[catKey]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Start Date</label>
                            <input 
                                type="date"
                                required
                                value={subStartDate}
                                onChange={(e) => setSubStartDate(e.target.value)}
                                className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider block mb-1">Notes</label>
                            <textarea 
                                placeholder="Optional description or details..."
                                value={subNotes}
                                onChange={(e) => setSubNotes(e.target.value)}
                                rows={2}
                                className="w-full bg-white/3 border border-white/8 rounded-xl px-3.5 py-2 text-white placeholder-white/20 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full py-3.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Creating Tracker...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Save Subscription
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
