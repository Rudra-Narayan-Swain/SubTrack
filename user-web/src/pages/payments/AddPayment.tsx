import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { addPayment } from '../../services/paymentService';
import { useStore } from '../../store/useStore';
import type { PaymentMethod } from '../../types';

export const AddPayment = () => {
    const { subId } = useParams();
    const navigate = useNavigate();
    const { user, subscriptions } = useStore();
    const subscription = subscriptions.find(s => s.id === subId);

    const [amount, setAmount] = useState(subscription?.price.toString() || '');
    const [method, setMethod] = useState<PaymentMethod>('credit_card');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    if (!subscription) return <div className="p-8 text-white">Subscription not found</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !user) return;
        setLoading(true);
        try {
            await addPayment({
                userId: user.uid,
                subscriptionId: subscription.id,
                subscriptionName: subscription.name,
                amount: parseFloat(amount),
                currency: subscription.currency,
                date,
                method,
                status: 'completed'
            }, subscription, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()); // simple 1 month assumed
            navigate('/payments');
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-6 md:p-10 max-w-2xl mx-auto pb-24 animate-fade-in">
            <Link to="/subscriptions" className="inline-flex items-center text-white/50 hover:text-white mb-6 text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subscriptions
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Record Payment</h1>
            <p className="text-white/50 mb-8">Recording payment for <strong className="text-primary">{subscription.name}</strong></p>

            <form onSubmit={handleSubmit} className="glass-panel space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Amount ({subscription.currency})</label>
                        <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="label">Payment Date</label>
                        <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
                    </div>
                </div>

                <div>
                    <label className="label">Payment Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="input-field appearance-none">
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="crypto">Crypto</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="pt-6 border-t border-white/5 mt-8 flex justify-end">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Payment</>}
                    </button>
                </div>
            </form>
        </div>
    );
};
