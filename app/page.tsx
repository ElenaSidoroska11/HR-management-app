"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import EmployeeList from "@/components/EmployeeList/EmployeeList";
import MainWorkspace from "@/components/Workspace/MainWorkspace";
import {
  createAssignment,
  getAssignmentsByEmployee,
  getAssignmentsByProject,
  updateEmployee,
  updateProject,
  getProject,
} from "@/lib/firebase/firestore";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { toast } from "sonner";
import type { Employee } from "@/types/employee";

export default function Home() {
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const { employees } = useEmployees();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const employee = employees.find((emp) => emp.id === active.id);
    if (employee) {
      setActiveEmployee(employee);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEmployee(null);

    if (!over) return;

    const employeeId = active.id as string;
    const projectId = over.id as string;

    const existingAssignments = await getAssignmentsByEmployee(employeeId);
    const alreadyAssigned = existingAssignments.some(
      (assignment) => assignment.projectId === projectId && assignment.status === "Active",
    );

    if (alreadyAssigned) {
      return;
    }

    try {
      await createAssignment({
        employeeId,
        projectId,
        hours: 0,
        status: "Active",
      } as any);

      await updateEmployee(employeeId, {
        currentProjectId: projectId,
      } as any);

      const project = await getProject(projectId);
      if (project) {
        const activeAssignments = await getAssignmentsByProject(projectId);
        await updateProject(projectId, {
          totalEmployees: activeAssignments.length,
        } as any);
      }
    } catch {
      toast.error("Error", {
        description: "Failed to assign employee to project. Please try again.",
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="flex h-screen w-full min-h-0 flex-col overflow-hidden bg-white/40 md:flex-row"
        style={{ touchAction: activeEmployee ? "none" : "pan-y" }}>
        <aside
          className="flex h-1/2 w-full shrink-0 flex-col overflow-x-hidden border-r border-gray-300 md:h-full md:w-80"
          style={{
            touchAction: activeEmployee ? "none" : "pan-y",
            overflowX: "hidden",
            overflowY: activeEmployee ? "hidden" : "auto",
          }}>
          <EmployeeList />
        </aside>

        <main className="h-1/2 min-h-0 flex-1 overflow-hidden md:h-full">
          <MainWorkspace />
        </main>
      </div>

      <DragOverlay>
        {activeEmployee ? (
          <div className="w-64 cursor-grabbing rounded-lg border border-gray-200 bg-white p-3 opacity-90 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{activeEmployee.name}</h3>
                  <span className="text-sm text-gray-500">({activeEmployee.assignedHours || 0})</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {activeEmployee.currentProjectId
                    ? `Assigned to Project: ${activeEmployee.currentProjectId}`
                    : "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
