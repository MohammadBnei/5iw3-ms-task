import { Task } from 'stubs/task/v1alpha/task';

export const taskToJs = (task: Task) => ({
    ...task,
    dueDate: new Date(task.dueDate),
  });
  
export const taskToGrpc = (task: {
    id: number;
    name: string;
    dueDate: Date;
    done: boolean;
    }) => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
    });