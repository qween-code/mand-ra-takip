"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCalves } from "@/lib/services/calves";
import type { Calf } from "@/types/calf";
import { Plus, Search, Milk } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function CalvesPage() {
  const [calves, setCalves] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getCalves();
      setCalves(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredCalves = calves.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ear_tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Buzağı Yönetimi</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/calves/feeding">
              <Milk className="mr-2 h-4 w-4" /> Süt Tüketimi
            </Link>
          </Button>
          <Button asChild>
            <Link href="/calves/new">
              <Plus className="mr-2 h-4 w-4" /> Yeni Buzağı
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="İsim veya Küpe No ile ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCalves.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.ear_tag}
                </CardTitle>
                <div
                  className={`h-2 w-2 rounded-full ${
                    item.status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.name}</div>
                <p className="text-xs text-muted-foreground">
                   {formatDate(item.birth_date)} • {item.gender === 'female' ? 'Dişi' : 'Erkek'}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Anne</span>
                    <span className="font-medium">
                      {item.cattle?.name || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-muted-foreground">Durum</span>
                    <span className="font-medium">
                        {item.is_weaned ? 'Sütten Kesildi' : 'Süt Emziriliyor'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
