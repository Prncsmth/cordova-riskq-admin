import { ReactNode } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar /> 
        
      <div className="lg:pl-72">
        <AdminHeader />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
