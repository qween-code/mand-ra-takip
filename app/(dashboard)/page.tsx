"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Milk, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const [stats, setStats] = useState({
    activeCattle: 0,
    dailyMilk: 0,
    totalSales: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      // Get active cattle count
      const { count: cattleCount } = await supabase
        .from('cattle')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get today's total milk
      const today = new Date().toISOString().split('T')[0];
      const { data: milkData } = await supabase
        .from('daily_milk_production')
        .select('total_amount')
        .eq('production_date', today);

      const dailyMilk = milkData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

      // Get total sales (simple sum for demo)
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount');

      const totalSales = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

      setStats({
        activeCattle: cattleCount || 0,
        dailyMilk: dailyMilk,
        totalSales: totalSales,
        pendingOrders: 0 // Placeholder
      });
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Genel Bakış</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Satış</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Genel toplam</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Süt</CardTitle>
            <Milk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyMilk} L</div>
            <p className="text-xs text-muted-foreground">Bugünkü üretim</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif İnek</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCattle}</div>
            <p className="text-xs text-muted-foreground">Sağmal hayvan sayısı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Randıman</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%98</div>
            <p className="text-xs text-muted-foreground">Ortalama verim</p>
          </CardContent>
        </Card>
      </div>

      {/* ... charts placeholder ... */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Süt Üretim Grafiği</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md">
               <Activity className="h-8 w-8 mr-2" />
               Veri toplandıkça grafik oluşacaktır
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Son Hareketler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <div className="text-sm text-muted-foreground text-center py-8">
                 Henüz işlem kaydı yok
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
