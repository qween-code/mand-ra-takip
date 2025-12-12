import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Milk,
  Beef,
  Factory,
  Truck,
  ShoppingCart,
  Undo2,
  Stethoscope,
  BarChart3,
  Settings,
  Baby,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Panel",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "İnekler",
    href: "/cattle",
    icon: Beef,
  },
  {
    title: "Buzağılar",
    href: "/calves",
    icon: Baby,
  },
  {
    title: "Süt Takibi",
    href: "/milk/production", // Direct link to production for better UX
    icon: Milk,
  },
    {
    title: "Süt Deposu",
    href: "/milk/inventory",
    icon: Milk,
  },
  {
    title: "Üretim",
    href: "/production",
    icon: Factory,
  },
  {
    title: "Dağıtım",
    href: "/distribution",
    icon: Truck,
  },
  {
    title: "Satış",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "İadeler",
    href: "/returns",
    icon: Undo2,
  },
  {
    title: "Sağlık",
    href: "/health",
    icon: Stethoscope,
  },
  {
    title: "Raporlar",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-14 items-center border-b px-4 font-bold text-lg text-primary">
        Mandra Asistanı
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                "transition-colors"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
