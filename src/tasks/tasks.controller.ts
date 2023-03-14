// BROYON Jérémy - 5IW3

import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  Task,
  GetTaskRequest,
  ListTasksResponse,
  UpdateTaskRequest,
  DeleteTaskRequest,
  ListTasksRequest,
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
          code: 6,
          message: request.task.name + ' is already taken',
        });
      }
      if (error?.code === 'P2009') {
        throw new RpcException({
          code: 3,
          message: request.task.name + ' not valid',
        });
      }

      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    try {
      let { pageSize, pageToken } = request;
      pageToken =
        Number.isNaN(parseInt(request.pageToken)) === true ||
        parseInt(request.pageToken) === 0
          ? '1'
          : parseInt(request.pageToken).toString();
      const tasks = await this.tasksService.findAll(pageToken, pageSize);

      return ListTasksResponse.create({
        task: tasks.map((task) => ({
          ...task,
          dueDate: task.dueDate.toISOString(),
        })),
        nextPageToken: (parseInt(pageToken) + 1).toString(),
      });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      if (request.name == '' || request.name == null) {
        throw new RpcException({ message: 'Data not valid', code: 3 });
      }
      const task = await this.tasksService.findByName(request.name);
      if (!task) {
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      throw new RpcException(error.error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      let task = await this.tasksService.findOne(request.task.id);

      if (!task) {
        throw new RpcException({ message: 'Task pas trouvée', code: 5 });
      }
      task = await this.tasksService.update(
        request.task.id,
        new UpdateTaskDto(request.task),
      );

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new RpcException({
          code: 6,
          message: request.task.name + ' is already taken',
        });
      }
      if (error.code === 'P2009') {
        throw new RpcException({
          code: 3,
          message: request.task.name + ' not valid',
        });
      }
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findByName(request.name);

      if (!task) {
        throw new RpcException({
          code: 5,
          message: 'Task not found',
        });
      }
      await this.tasksService.remove(task.id);

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(error);
    }
  }
}
