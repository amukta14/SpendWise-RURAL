import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, TrendingUp, Wallet } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSpent: 0,
    remainingBudget: 0,
    topCategory: '',
    recentExpenses: [] as any[],
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch current month's expenses
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: false });

      // Fetch current budget
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .single();

      const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const remainingBudget = budgets ? Number(budgets.amount) - totalSpent : 0;

      // Category breakdown
      const categoryMap = new Map();
      expenses?.forEach((exp) => {
        const catName = exp.categories[`name_${language}`];
        const current = categoryMap.get(catName) || 0;
        categoryMap.set(catName, current + Number(exp.amount));
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setStats({
        totalSpent,
        remainingBudget,
        topCategory: categoryBreakdown[0]?.name || '-',
        recentExpenses: expenses?.slice(0, 5) || [],
      });

      setCategoryData(categoryBreakdown.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
          <p className="text-muted-foreground mt-1">Overview of your spending and budget</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{t('totalSpent')}</CardTitle>
              <ArrowDown className="h-6 w-6 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{t('remainingBudget')}</CardTitle>
              <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{stats.remainingBudget.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{t('topCategory')}</CardTitle>
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topCategory}</div>
              <p className="text-xs text-muted-foreground mt-1">Highest spending category</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('categoryBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">{t('noData')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ₹${entry.value.toFixed(2)}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('recentExpenses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentExpenses.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">{t('noData')}</p>
                  </div>
                ) : (
                  stats.recentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {expense.categories[`name_${language}`]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-primary">₹{Number(expense.amount).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
