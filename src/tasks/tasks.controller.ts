import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskRequest } from '../stubs/task/v1alpha/task';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService')
  async CreateTask(request: CreateTaskRequest): Promise<Task> {
    const task = await this.tasksService.create(
      new CreateTaskDto(request.task),
    );

    return { ...task, dueDate: task.dueDate.toISOString() };
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const { pageSize, pageToken } = ListTasksRequest.create(request);
    const tasks = await this.tasksService.listTasks(pageSize, +pageToken);
    return {
      task: tasks.task.map((task) => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
      })),
      nextPageToken: tasks.nextPageToken,
    };
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    const task = await this.tasksService.findByName(request.name);
    return { ...task, dueDate: task.dueDate.toISOString() };
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    const { task } = request;
    const updatedTask = await this.tasksService.update(new UpdateTaskDto(task));
    return { ...updatedTask, dueDate: updatedTask.dueDate.toISOString() };
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: GetTaskRequest): Promise<Task> {
    const task = await this.tasksService.deleteByName(request.name);
    return { ...task, dueDate: task.dueDate.toISOString() };
  }
}
