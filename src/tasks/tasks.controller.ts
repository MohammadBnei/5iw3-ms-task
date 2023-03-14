import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from 'stubs/task/v1alpha/task';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService')
  async CreateTask(request: CreateTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.create(
        new CreateTaskDto(request.task),
      );

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      console.log({ error });
      if (error?.code === 'P2002') {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: request.task.name + ' is already taken',
        });
      }

      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async getTasks(): Promise<{ tasks: Task[] }> {
    const tasks = await this.tasksService.findAll();
    return {
      tasks: tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate.toISOString(),
      })),
    };
  }

  @GrpcMethod('TaskService')
  async getTaskById(request: { taskId: string }): Promise<Task> {
    const task = await this.tasksService.findOne(Number(request.taskId));
    if (!task) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Task with ID ${request.taskId} not found`,
      });
    }
    return { ...task, dueDate: task.dueDate.toISOString() } as any;
  }

  @GrpcMethod('TaskService')
  async updateTask(request: {
    taskId: string;
    task: UpdateTaskRequest;
  }): Promise<Task> {
    const task = await this.tasksService.update(
      Number(request.taskId),
      new UpdateTaskDto(request.task),
    );
    if (!task) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Task with ID ${request.taskId} not found`,
      });
    }
    return { ...task, dueDate: task.dueDate.toISOString() } as any;
  }

  @GrpcMethod('TaskService')
  async changeTaskStatus(request: { taskId: string }): Promise<Task> {
    const task = await this.tasksService.changeStatus(Number(request.taskId));
    if (!task) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Task with ID ${request.taskId} not found`,
      });
    }
    return { ...task, dueDate: task.dueDate.toISOString() } as any;
  }

  @GrpcMethod('TaskService')
  async deleteTask(request: { taskId: string }): Promise<{ success: boolean }> {
    const task = await this.tasksService.remove(Number(request.taskId));
    if (!task) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Task with ID ${request.taskId} not found`,
      });
    }
    return { success: true };
  }
}
