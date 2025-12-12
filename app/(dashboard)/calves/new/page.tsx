"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCalfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      ear_tag: formData.get("ear_tag"),
      name: formData.get("name"),
      birth_date: formData.get("birth_date"),
      gender: formData.get("gender"),
      birth_weight: formData.get("birth_weight"),
      status: "active",
      health_status: "healthy",
      is_weaned: false
    };

    const supabase = createClient();
    const { error } = await supabase.from("calves").insert(data);

    if (error) {
      toast.error("Hata: " + error.message);
    } else {
      toast.success("Buzağı başarıyla eklendi");
      router.push("/calves");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/calves">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Yeni Buzağı Ekle</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Temel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Küpe No</label>
                <Input name="ear_tag" required placeholder="TR-B..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">İsim</label>
                <Input name="name" required placeholder="Minnoş" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium">Cinsiyet</label>
                <select name="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="female">Dişi</option>
                    <option value="male">Erkek</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Doğum Tarihi</label>
                <Input name="birth_date" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Doğum Kilosu (kg)</label>
                <Input name="birth_weight" type="number" step="0.1" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
