"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Çıkış yapıldı");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-sm font-medium">Email</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>

          <div className="pt-4">
            <Button variant="destructive" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl opacity-50">
         <CardHeader>
            <CardTitle>Bildirim Ayarları (Yakında)</CardTitle>
         </CardHeader>
         <CardContent>
            <p className="text-sm text-muted-foreground">Bu özellik bir sonraki güncellemede aktif olacaktır.</p>
         </CardContent>
      </Card>
    </div>
  );
}
