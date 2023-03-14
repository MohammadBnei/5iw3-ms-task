import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
  UpdateTaskRequest,
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto, toJs } from './dto/create-task.dto';
import { status } from '@grpc/grpc-js';

// Antoine Lelong - 5IW3
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
      const tasks = await this.tasksService.findAll();
      return ListTasksResponse.create({ task: tasks.map(toJs) });
    } catch (error) {
      if (error.code === 'P2009') {
        throw new RpcException({
          message: 'Invalid entry data',
          code: status.INVALID_ARGUMENT,
        });
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findByName(request.name);
      if (!task) {
        throw new RpcException({
          message: 'Task not found',
          code: status.NOT_FOUND,
        });
      }
      return { ...task } as any;
    } catch (error) {
      if (error.code === 'P2009') {
        throw new RpcException({
          message: 'Invalid entry data',
          code: status.INVALID_ARGUMENT,
        });
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findOne(request.task.id);
      if (!task) {
        throw new RpcException({
          message: 'Task not found',
          code: status.NOT_FOUND,
        });
      }
      const updatedTask = await this.tasksService.update(
        request.task.id,
        toJs(request.task),
      );
      return {
        ...updatedTask,
        dueDate: updatedTask.dueDate.toISOString(),
      } as any;
    } catch (error) {
      if (error.code === 'P2009') {
        throw new RpcException({
          message: 'Invalid entry data',
          code: status.INVALID_ARGUMENT,
        });
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
          message: 'Task not found',
          code: status.NOT_FOUND,
        });
      }
      await this.tasksService.remove(task.id);
      return { ...task } as any;
    } catch (error) {
      if (error.code === 'P2009') {
        throw new RpcException({
          message: 'Invalid entry data',
          code: status.INVALID_ARGUMENT,
        });
      }
      throw new RpcException(error);
    }
  }
}
