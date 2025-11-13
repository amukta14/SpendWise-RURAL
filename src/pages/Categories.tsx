import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';

export default function Categories() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('type', { ascending: true });

    setCategories(cats || []);

    // Fetch spending per category (simplified - you can enhance this)
    const { data: expenses } = await supabase
      .from('expenses')
      .select('category_id, amount');

    const statsMap = new Map<string, number>();
    expenses?.forEach((exp) => {
      const current = statsMap.get(exp.category_id) || 0;
      statsMap.set(exp.category_id, current + Number(exp.amount));
    });

    setCategoryStats(statsMap);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="h-8 w-8" /> : <Icons.Circle className="h-8 w-8" />;
  };

  const groupedCategories: Record<string, any[]> = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('categories')}</h1>

        {Object.entries(groupedCategories).map(([type, cats]) => (
          <div key={type} className="space-y-3">
            <h2 className="text-xl font-semibold capitalize">{type}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cats.map((cat) => (
                <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {getIcon(cat.icon)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          {cat[`name_${language}`]}
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          ₹{(categoryStats.get(cat.id) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
