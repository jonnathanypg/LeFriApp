import { ProcessList } from '@/components/process-list';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export function ProcessesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <ProcessList />
      </div>
      <Footer />
    </div>
  );
}