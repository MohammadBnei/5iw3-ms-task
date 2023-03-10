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