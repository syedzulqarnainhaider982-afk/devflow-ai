import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen relative flex bg-[#050505]">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-10">
        <DashboardSidebar />
      </div>
      <main className="md:pl-72 w-full h-full flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 overflow-auto bg-[url('/grid.svg')] bg-center bg-fixed">
          {children}
        </div>
      </main>
    </div>
  );
}
