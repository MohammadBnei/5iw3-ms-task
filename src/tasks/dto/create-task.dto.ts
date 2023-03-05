import { Task } from 'stubs/task/v1alpha/task';
export class CreateTaskDto {
  /**
   *
   */
  constructor(task: Task) {
    this.name = task.name;
    this.dueDate = new Date(task.dueDate);
  }
  name: string;
  dueDate: Date;
}
export const toJs = (task: Task) => ({
  ...task,
  dueDate: new Date(task.dueDate),
});

export const toGrpc = (task: {
  id: number;
  name: string;
  dueDate: Date;
  done: boolean;
}) => ({
  ...task,
  dueDate: task.dueDate.toISOString(),
});
