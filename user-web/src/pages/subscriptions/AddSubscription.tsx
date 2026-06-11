import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { addSubscription } from '../../services/subscriptionService';
import { useStore } from '../../store/useStore';
import type { BillingCycle } from '../../types';

export const AddSubscription = () => {
    const navigate = useNavigate();
    const user = useStore(s => s.user);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [cycle, setCycle] = useState<BillingCycle>('monthly');
    const [category, setCategory] = useState('entertainment');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !user) return;
        setLoading(true);
        try {
            await addSubscription({
                userId: user.uid,
                name,
                price: parseFloat(price),
                currency: 'USD',
                billingCycle: cycle,
                category,
                startDate,
                nextBillingDate: startDate, // Calculate properly in prod
                status: 'active'
            });
            navigate('/subscriptions');
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-6 md:p-10 max-w-2xl mx-auto pb-24 animate-fade-in">
            <Link to="/subscriptions" className="inline-flex items-center text-white/50 hover:text-white mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subscriptions
            </Link>

            <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Add Subscription</h1>

            <form onSubmit={handleSubmit} className="glass-panel space-y-5">
                <div>
                    <label className="label">Service Name</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Netflix, Spotify..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Price (USD)</label>
                        <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="input-field" placeholder="9.99" />
                    </div>
                    <div>
                        <label className="label">Billing Cycle</label>
                        <select value={cycle} onChange={e => setCycle(e.target.value as BillingCycle)} className="input-field appearance-none">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="input-field appearance-none">
                            <option value="entertainment">Entertainment</option>
                            <option value="software">Software</option>
                            <option value="utilities">Utilities</option>
                            <option value="health">Health & Fitness</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Start Date</label>
                        <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 mt-8 flex justify-end">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Subscription</>}
                    </button>
                </div>
            </form>
        </div>
    );
};
