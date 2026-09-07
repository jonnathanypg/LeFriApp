import { ProcessList } from '@/components/process-list';
import { Navbar } from '@/components/navbar';

export function ProcessesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <ProcessList />
    </div>
  );
}