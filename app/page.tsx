import EmployeeList from '@/components/EmployeeList/EmployeeList';
import ProjectColumns from '@/components/ProjectColumns/ProjectColumns';

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 flex-col md:flex-row">
      {/* Left Sidebar - Employee List */}
      <aside className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden h-1/2 md:h-full">
        <EmployeeList />
      </aside>

      {/* Right Main Area - Project Columns */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden h-1/2 md:h-full">
        <ProjectColumns />
      </main>
    </div>
  );
}
