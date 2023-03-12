import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  Task,
  DeleteTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  UpdateTaskRequest,
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { status } from '@grpc/grpc-js';

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
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    try {
      const tasks = await this.tasksService.findAll(
        request.pageSize,
        request.pageToken,
      );

      return {
        tasks: tasks.map((task) => ({
          ...task,
          dueDate: task.dueDate.toISOString(),
        })),
      } as any;
    } catch (error) {
      console.log({ error });
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.update(
        request.task.name,
        new UpdateTaskDto(request.task),
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
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.remove(request.name);

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      console.log({ error });
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findOne(request.name);

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      console.log({ error });
      throw new RpcException(error);
    }
  }
}
