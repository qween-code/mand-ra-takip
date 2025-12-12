"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { getCalves } from "@/lib/services/calves";

export default function CalfFeedingPage() {
  const [calves, setCalves] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getCalves();
      // Only unweaned calves
      setCalves(data.filter((c: any) => !c.is_weaned));
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const records = calves.map(calf => {
      const amount = Number(formData.get(`amount_${calf.id}`) || 0);

      if (amount === 0) return null;

      return {
        calf_id: calf.id,
        consumption_date: date,
        amount: amount,
        feeding_session: 'morning', // Simplified for MVP
        milk_type: 'raw'
      };
    }).filter(Boolean);

    if (records.length === 0) {
      toast.error("Lütfen en az bir kayıt girin");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("calf_milk_consumption").insert(records);

    if (error) {
      toast.error("Hata: " + error.message);
    } else {
      toast.success(`${records.length} kayıt başarıyla eklendi`);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Buzağı Süt Tüketimi</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tarih Seçimi</CardTitle>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">Küpe No</th>
                    <th className="h-10 px-4 text-left font-medium">İsim</th>
                    <th className="h-10 px-4 text-left font-medium">Miktar (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {calves.map((calf) => (
                    <tr key={calf.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{calf.ear_tag}</td>
                      <td className="p-4">{calf.name}</td>
                      <td className="p-4">
                        <Input
                          name={`amount_${calf.id}`}
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          className="w-24"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
