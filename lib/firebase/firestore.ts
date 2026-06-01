import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type { Employee } from '@/types/employee';
import type { Project } from '@/types/project';
import type { Assignment } from '@/types/assignment';
import type { Vacation } from '@/types/vacation';
import type { Supervisor } from '@/types/supervisor';

// ==================== EMPLOYEES ====================

export const employeesCollection = collection(db, 'employees');

export async function getEmployee(id: string): Promise<Employee | null> {
  const docRef = doc(db, 'employees', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Employee;
  }
  return null;
}

export async function getEmployees(): Promise<Employee[]> {
  const querySnapshot = await getDocs(employeesCollection);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function getEmployeesByStatus(status: Employee['status']): Promise<Employee[]> {
  const q = query(employeesCollection, where('status', '==', status));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function getEmployeesByPosition(position: Employee['position']): Promise<Employee[]> {
  const q = query(employeesCollection, where('position', '==', position));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function getEmployeesByCurrentProject(projectId: string): Promise<Employee[]> {
  const q = query(employeesCollection, where('currentProjectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Employee[];
}

export async function createEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(employeesCollection, {
    ...employeeData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt'>>): Promise<void> {
  const docRef = doc(db, 'employees', id);
  
  const cleanUpdates: any = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      cleanUpdates[key] = deleteField();
    } else {
      cleanUpdates[key] = value;
    }
  }
  
  await updateDoc(docRef, {
    ...cleanUpdates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  const activeAssignments = await getAssignmentsByEmployee(id);
  const affectedProjectIds = new Set(activeAssignments.map((a) => a.projectId));

  for (const assignment of activeAssignments) {
    await removeAssignment(assignment.id);
  }

  for (const projectId of affectedProjectIds) {
    const remainingAssignments = await getAssignmentsByProject(projectId);
    await updateProject(projectId, {
      totalEmployees: remainingAssignments.length,
    } as Partial<Project>);
  }

  const docRef = doc(db, 'employees', id);
  await deleteDoc(docRef);
}

export function subscribeToEmployees(
  callback: (employees: Employee[]) => void,
  constraints?: QueryConstraint[]
): () => void {
  const q = constraints
    ? query(employeesCollection, ...constraints)
    : query(employeesCollection, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const employees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];
    callback(employees);
  });
}

// ==================== PROJECTS ====================

export const projectsCollection = collection(db, 'projects');

export async function getProject(id: string): Promise<Project | null> {
  const docRef = doc(db, 'projects', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
}

export async function getProjects(): Promise<Project[]> {
  const querySnapshot = await getDocs(projectsCollection);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

export async function getProjectsBySupervisor(supervisorId: string): Promise<Project[]> {
  const q = query(projectsCollection, where('supervisorId', '==', supervisorId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(projectsCollection, {
    ...projectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  // Get all active assignments for this project
  const assignments = await getAssignmentsByProject(id);
  
  // Get all employees that have this project as their currentProjectId
  // (this covers cases where assignments might be missing or inconsistent)
  const employeesWithThisProject = await getEmployeesByCurrentProject(id);
  
  // Create a set of employee IDs we've already processed
  const processedEmployeeIds = new Set<string>();
  
  // Remove all assignments and update employees that still exist
  for (const assignment of assignments) {
    const employee = await getEmployee(assignment.employeeId);

    // Check if employee has other active assignments (before removing this one)
    const employeeAssignments = await getAssignmentsByEmployee(assignment.employeeId);
    const otherActiveAssignments = employeeAssignments.filter((a) => a.projectId !== id);

    // Remove the assignment (set status to 'Removed')
    await removeAssignment(assignment.id);

    // Mark this employee as processed
    processedEmployeeIds.add(assignment.employeeId);

    if (!employee) {
      continue;
    }

    // Update employee's currentProjectId
    if (otherActiveAssignments.length === 0) {
      await updateEmployee(assignment.employeeId, {
        currentProjectId: undefined,
        status: 'Unassigned',
      } as any);
    } else {
      await updateEmployee(assignment.employeeId, {
        currentProjectId: otherActiveAssignments[0].projectId,
      } as any);
    }
  }
  
  // Handle employees that have this project as currentProjectId but no assignment
  // (data inconsistency case)
  for (const employee of employeesWithThisProject) {
    if (processedEmployeeIds.has(employee.id)) {
      continue;
    }

    const employeeAssignments = await getAssignmentsByEmployee(employee.id);

    if (employeeAssignments.length === 0) {
      await updateEmployee(employee.id, {
        currentProjectId: undefined,
        status: 'Unassigned',
      } as any);
    } else {
      await updateEmployee(employee.id, {
        currentProjectId: employeeAssignments[0].projectId,
      } as any);
    }
  }
  
  // Finally, delete the project document
  const docRef = doc(db, 'projects', id);
  await deleteDoc(docRef);
}

export function subscribeToProjects(
  callback: (projects: Project[]) => void,
  constraints?: QueryConstraint[]
): () => void {
  const q = constraints
    ? query(projectsCollection, ...constraints)
    : query(projectsCollection, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const projects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
    callback(projects);
  });
}

// ==================== ASSIGNMENTS ====================

export const assignmentsCollection = collection(db, 'assignments');

export async function getAssignment(id: string): Promise<Assignment | null> {
  const docRef = doc(db, 'assignments', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Assignment;
  }
  return null;
}

export async function getAssignmentsByEmployee(employeeId: string): Promise<Assignment[]> {
  const q = query(
    assignmentsCollection,
    where('employeeId', '==', employeeId),
    where('status', '==', 'Active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Assignment[];
}

export async function getAssignmentsByProject(projectId: string): Promise<Assignment[]> {
  const q = query(
    assignmentsCollection,
    where('projectId', '==', projectId),
    where('status', '==', 'Active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Assignment[];
}

export async function createAssignment(
  assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'assignedAt'>
): Promise<string> {
  const docRef = await addDoc(assignmentsCollection, {
    ...assignmentData,
    assignedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateAssignment(
  id: string,
  updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'assignments', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function removeAssignment(id: string): Promise<void> {
  const docRef = doc(db, 'assignments', id);
  await updateDoc(docRef, {
    status: 'Removed',
    removedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export type AssignEmployeeResult = 'assigned' | 'transferred' | 'already_assigned';

/** Assigns an employee to exactly one project, removing any existing active assignments. */
export async function assignEmployeeToProject(
  employeeId: string,
  projectId: string
): Promise<AssignEmployeeResult> {
  const existingAssignments = await getAssignmentsByEmployee(employeeId);

  if (existingAssignments.some((assignment) => assignment.projectId === projectId)) {
    return 'already_assigned';
  }

  const isTransfer = existingAssignments.length > 0;
  const affectedProjectIds = new Set(
    existingAssignments.map((assignment) => assignment.projectId)
  );
  affectedProjectIds.add(projectId);

  for (const assignment of existingAssignments) {
    await removeAssignment(assignment.id);
  }

  await createAssignment({
    employeeId,
    projectId,
    hours: 0,
    status: 'Active',
  });

  await updateEmployee(employeeId, {
    currentProjectId: projectId,
  } as Partial<Employee>);

  for (const affectedProjectId of affectedProjectIds) {
    const activeAssignments = await getAssignmentsByProject(affectedProjectId);
    await updateProject(affectedProjectId, {
      totalEmployees: activeAssignments.length,
    } as Partial<Project>);
  }

  return isTransfer ? 'transferred' : 'assigned';
}

export function subscribeToAssignmentsByProject(
  projectId: string,
  callback: (assignments: Assignment[]) => void
): () => void {
  const q = query(
    assignmentsCollection,
    where('projectId', '==', projectId),
    where('status', '==', 'Active')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const assignments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assignment[];
    callback(assignments);
  });
}

export function subscribeToAssignmentsByEmployee(
  employeeId: string,
  callback: (assignments: Assignment[]) => void
): () => void {
  const q = query(
    assignmentsCollection,
    where('employeeId', '==', employeeId),
    where('status', '==', 'Active')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const assignments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assignment[];
    callback(assignments);
  });
}

// ==================== VACATIONS ====================

export const vacationsCollection = collection(db, 'vacations');

export async function getVacation(id: string): Promise<Vacation | null> {
  const docRef = doc(db, 'vacations', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Vacation;
  }
  return null;
}

export async function getVacationsByEmployee(employeeId: string): Promise<Vacation[]> {
  const q = query(vacationsCollection, where('employeeId', '==', employeeId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vacation[];
}

export function subscribeToVacationsByEmployee(
  employeeId: string,
  callback: (vacations: Vacation[]) => void
): () => void {
  const q = query(
    vacationsCollection,
    where('employeeId', '==', employeeId)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const vacations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vacation[];
    callback(vacations);
  });
}

export async function getActiveVacations(): Promise<Vacation[]> {
  const now = Timestamp.now();
  const q = query(
    vacationsCollection,
    where('status', 'in', ['Scheduled', 'Active']),
    where('endDate', '>=', now)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vacation[];
}

export async function createVacation(vacationData: Omit<Vacation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(vacationsCollection, {
    ...vacationData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateVacation(
  id: string,
  updates: Partial<Omit<Vacation, 'id' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'vacations', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteVacation(id: string): Promise<void> {
  const docRef = doc(db, 'vacations', id);
  await deleteDoc(docRef);
}

export function subscribeToVacations(
  callback: (vacations: Vacation[]) => void,
  constraints?: QueryConstraint[]
): () => void {
  const q = constraints
    ? query(vacationsCollection, ...constraints)
    : query(vacationsCollection, orderBy('startDate', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const vacations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vacation[];
    callback(vacations);
  });
}

// ==================== SUPERVISORS ====================

export const supervisorsCollection = collection(db, 'supervisors');

export async function getSupervisor(id: string): Promise<Supervisor | null> {
  const docRef = doc(db, 'supervisors', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Supervisor;
  }
  return null;
}

export async function getSupervisors(): Promise<Supervisor[]> {
  const querySnapshot = await getDocs(supervisorsCollection);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Supervisor[];
}

export async function createSupervisor(
  supervisorData: Omit<Supervisor, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(supervisorsCollection, {
    ...supervisorData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateSupervisor(
  id: string,
  updates: Partial<Pick<Supervisor, 'name' | 'email'>>
): Promise<void> {
  const docRef = doc(db, 'supervisors', id);
  const cleanUpdates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'name' && typeof value === 'string') {
      const trimmedName = value.trim();
      if (trimmedName) {
        cleanUpdates.name = trimmedName;
      }
    } else if (key === 'email') {
      if (value === undefined) {
        continue;
      }
      if (value === '' || value === null) {
        cleanUpdates.email = deleteField();
      } else {
        cleanUpdates.email = String(value).trim();
      }
    }
  }

  if (Object.keys(cleanUpdates).length > 0) {
    await updateDoc(docRef, cleanUpdates);
  }

  if (typeof updates.name === 'string') {
    const trimmed = updates.name.trim();
    if (trimmed) {
      const projects = await getProjectsBySupervisor(id);
      await Promise.all(
        projects.map((p) => updateProject(p.id, { supervisorName: trimmed }))
      );
    }
  }
}

export async function deleteSupervisor(id: string): Promise<void> {
  const projects = await getProjectsBySupervisor(id);
  if (projects.length > 0) {
    throw new Error(
      `This supervisor has ${projects.length} project(s). Remove or reassign those projects before deleting.`
    );
  }
  await deleteDoc(doc(db, 'supervisors', id));
}

export function subscribeToSupervisors(
  callback: (supervisors: Supervisor[]) => void,
  constraints?: QueryConstraint[]
): () => void {
  const q = constraints
    ? query(supervisorsCollection, ...constraints)
    : query(supervisorsCollection, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const supervisors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Supervisor[];

    callback(supervisors);
  });
}
