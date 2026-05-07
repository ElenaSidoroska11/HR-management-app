'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import ProjectBoard from '@/components/ProjectColumns/ProjectBoard';
import CreateProjectDialog from '@/components/ProjectColumns/CreateProjectDialog';
import SupervisorManagement from '@/components/Management/SupervisorManagement';
import AddProjectSection from '@/components/Management/AddProjectSection';
import { useProjectColumns } from '@/lib/hooks/useProjectColumns';

export default function MainWorkspace() {
  const {
    supervisors,
    allSupervisors,
    loading,
    error,
    showCreateDialog,
    projectName,
    setProjectName,
    selectedSupervisorId,
    setSelectedSupervisorId,
    isCreating,
    handleCreateProject,
    handleCloseCreateDialog,
  } = useProjectColumns();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs defaultValue="projects" className="flex h-full min-h-0 flex-1 flex-col gap-0 px-4 pb-4 pt-4">
        <div className="mb-4 flex shrink-0 justify-end">
          <TabsList
            className={cn(
              'inline-flex h-auto gap-1 rounded-full border border-gray-200 bg-gray-100/90 p-1 text-gray-700 shadow-sm',
            )}
          >
            <TabsTrigger
              value="projects"
              className="rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-700"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="management"
              className="rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-700"
            >
              Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="projects"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">Loading projects…</p>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-red-600">Error: {error.message}</p>
            </div>
          ) : (
            <ProjectBoard supervisors={supervisors} />
          )}
        </TabsContent>

        <TabsContent
          value="management"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto outline-none data-[state=inactive]:hidden"
        >
          <div className="flex w-full flex-col gap-8 px-4 pt-4 pb-6">
            <SupervisorManagement />
            <AddProjectSection
              onOpenDialog={() => handleCloseCreateDialog(true)}
              disabled={loading}
            />
          </div>
        </TabsContent>
      </Tabs>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={handleCloseCreateDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        selectedSupervisorId={selectedSupervisorId}
        onSupervisorChange={setSelectedSupervisorId}
        allSupervisors={allSupervisors}
        isCreating={isCreating}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
