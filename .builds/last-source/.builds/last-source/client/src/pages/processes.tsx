import { ProcessList } from '@/components/process-list';
import { Navbar } from '@/components/navbar';

export function ProcessesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <ProcessList />
    </div>
  );
}