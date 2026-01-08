"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Types from the backend
interface TransactionData {
  transaction_id: string;
  is_fraud: boolean;
  confidence: number;
  timestamp: string;
  transaction_data: {
    amount: number;
    [key: string]: any;
  };
}

interface Stats {
  total_transactions: number;
  fraud_count: number;
  fraud_percentage: number;
  daily_stats: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for data every 3 seconds
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [statsRes, transRes] = await Promise.all([
          fetch('http://localhost:8001/stats', { headers }),
          fetch('http://localhost:8001/transactions?limit=20', { headers })
        ]);

        if (statsRes.status === 401 || transRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (statsRes.ok && transRes.ok) {
          const s = await statsRes.json();
          const t = await transRes.json();
          setStats(s);
          setTransactions(t.transactions || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        setError("Connecting to backend...");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Fraud Detection Center
          </h1>
          <p className="text-muted-foreground mt-1">Real-time financial transaction monitoring and analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            System Live
          </div>
          <button className="p-2 bg-secondary rounded-lg border border-border hover:bg-muted transition-colors">
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={stats?.total_transactions.toLocaleString() || '0'}
          icon={<Activity className="w-6 h-6 text-blue-500" />}
          trend="+12% from yesterday"
          trendType="up"
        />
        <StatCard
          title="Fraud Detected"
          value={stats?.fraud_count.toLocaleString() || '0'}
          icon={<AlertTriangle className="w-6 h-6 text-orange-500" />}
          trend="+5% from yesterday"
          trendType="down"
        />
        <StatCard
          title="Detection Rate"
          value={`${stats?.fraud_percentage}%`}
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
          trend="Target: <2.0%"
          trendType="up"
        />
        <StatCard
          title="Avg. Confidence"
          value="97.4%"
          icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
          trend="High Accuracy"
          trendType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 glow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Fraud Trends</h2>
            <div className="text-sm text-muted-foreground">Last 7 Days</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.daily_stats}>
                <defs>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141417', border: '1px solid #27272a', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="fraud_count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorFraud)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-1 glass rounded-2xl p-6 glow flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Live Feed</h2>
            <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Real-time</div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {transactions.map((tx) => (
              <TransactionRow key={tx.transaction_id} tx={tx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendType }: { title: string, value: string, icon: React.ReactNode, trend: string, trendType: 'up' | 'down' }) {
  return (
    <div className="glass rounded-2xl p-6 glow hover:scale-[1.02] transition-transform duration-200">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-background rounded-lg border border-border">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm ${trendType === 'up' ? 'text-green-500' : 'text-orange-500'}`}>
          {trendType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-muted-foreground text-sm font-medium">{title}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: TransactionData }) {
  const amount = tx.transaction_data?.amount || 0;

  return (
    <div className="fraud-row flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/30 hover:bg-background/50 transition-colors">
      <div className="flex items-center gap-3">
        {tx.is_fraud ? (
          <div className="p-2 bg-red-500/10 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
        ) : (
          <div className="p-2 bg-green-500/10 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
        )}
        <div>
          <div className="text-sm font-medium">{tx.transaction_id}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold">${amount.toFixed(2)}</div>
        <div className={`text-xs ${tx.is_fraud ? 'text-red-500' : 'text-green-500'}`}>
          {((tx.confidence || 0) * 100).toFixed(1)}% {tx.is_fraud ? 'Fraud' : 'Safe'}
        </div>
      </div>
    </div>
  );
}
