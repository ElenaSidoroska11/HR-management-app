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
import ProjectColumns from "@/components/ProjectColumns/ProjectColumns";
import {
  createAssignment,
  getAssignmentsByEmployee,
  getAssignmentsByProject,
  updateEmployee,
  updateProject,
  getProject,
} from "@/lib/firebase/firestore";
import { useEmployees } from "@/lib/hooks/useEmployees";
import type { Employee } from "@/types/employee";

export default function Home() {
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const { employees } = useEmployees();

  // Configure sensors to prevent scrolling during drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
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
    setActiveEmployee(null); // Clear active employee

    if (!over) return;

    const employeeId = active.id as string;
    const projectId = over.id as string;

    // Check if employee is already assigned to this project
    const existingAssignments = await getAssignmentsByEmployee(employeeId);
    const alreadyAssigned = existingAssignments.some(
      (assignment) => assignment.projectId === projectId && assignment.status === "Active",
    );

    if (alreadyAssigned) {
      return;
    }

    try {
      // Create new assignment
      await createAssignment({
        employeeId,
        projectId,
        hours: 0, // Default hours
        status: "Active",
      } as any);

      // Update employee's current project
      await updateEmployee(employeeId, {
        currentProjectId: projectId,
      } as any);

      // Update project's total employees count
      const project = await getProject(projectId);
      if (project) {
        const activeAssignments = await getAssignmentsByProject(projectId);
        await updateProject(projectId, {
          totalEmployees: activeAssignments.length,
        } as any);
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="flex h-screen w-full overflow-hidden flex-col md:flex-row"
        style={{ touchAction: activeEmployee ? "none" : "pan-y" }}>
        {/*  Employee List */}
        <aside
          className="w-full md:w-80 border-r border-gray-300  flex flex-col overflow-hidden h-1/2 md:h-full overflow-x-hidden"
          style={{
            touchAction: activeEmployee ? "none" : "pan-y",
            overflowX: activeEmployee ? "hidden" : "hidden",
            overflowY: activeEmployee ? "hidden" : "auto",
          }}>
          <EmployeeList />
        </aside>

        {/* Right Main Area - Project Columns */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden h-1/2 md:h-full">
          <ProjectColumns />
        </main>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeEmployee ? (
          <div className="p-3 border border-gray-200 rounded-lg bg-white shadow-2xl cursor-grabbing opacity-90 w-64">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{activeEmployee.name}</h3>
                  <span className="text-sm text-gray-500">({activeEmployee.assignedHours || 0})</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
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
