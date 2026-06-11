import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">

            {/* Animated background orbs */}
            <div className="bg-orbs">
                <div className="bg-orb animate-float" style={{
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, #6366f1, #4338ca)',
                    top: '-150px', left: '-100px',
                }} />
                <div className="bg-orb animate-float-slow" style={{
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, #8b5cf6, #6366f1)',
                    bottom: '-100px', right: '-80px',
                }} />
                <div className="bg-orb animate-float-delayed" style={{
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, #22d3ee, #6366f1)',
                    top: '40%', left: '55%',
                    opacity: 0.15,
                }} />
            </div>

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
            }} />

            {/* Content */}
            <div className="w-full max-w-md relative z-10 animate-slide-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-5">
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-2xl animate-pulse-glow" style={{ borderRadius: '16px' }} />
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}>
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2"
                        style={{ background: 'linear-gradient(135deg, #fff 30%, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Subtrack
                    </h1>
                    <p className="text-white/40 text-center text-sm px-6">
                        Manage all your subscriptions in one beautiful place
                    </p>
                </div>

                {/* Form Card */}
                <div className="glass-panel">
                    <Outlet />
                </div>

                {/* Footer */}
                <p className="text-center text-white/20 text-xs mt-6">
                    © 2025 Subtrack · All rights reserved
                </p>
            </div>
        </div>
    );
};
