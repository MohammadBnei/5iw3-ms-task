// NOM : MOUTAROU Mouhammed Moufid Afolabi
// Class: 5iw4-janv

import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  GetTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  Task,
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { status } from '@grpc/grpc-js';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    try {
      const tasks = await this.tasksService.findAll();
      return ListTasksResponse.create(
        { task: tasks.map(this.tasksService.taskToGrpc) },
        // task: tasks.map(function (currentTask) {
        //   return { ...currentTask, dueDate: currentTask.dueDate.toISOString() };
        // })
      );
    } catch (error) {
      throw new RpcException((error as RpcException).message || error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findByName(request.name);
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'This task (' + request.name + ') does not exist.',
        });
      }
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      if (!request.name) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Name is required',
        });
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      let task = await this.tasksService.findByName(request.task.name);
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'This task (' + request.task.name + ') does not exist.',
        });
      }
      task = await this.tasksService.update(
        request.task.id,
        new UpdateTaskDto(request.task),
      );
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: request.task.name + ' is already taken',
        });
      }

      if (error?.code === 'P2013') {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Missing argument(s)',
        });
      }

      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async RemoveTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      let task = await this.tasksService.findByName(request.name);
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'This task (' + request.name + ') does not exist.',
        });
      }
      task = await this.tasksService.remove(task.id);
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // private async taskToGrpc(val, index, arr){
  //   return {
  //     ...val,
  //     dueDate: val.dueDate.toISOString(),
  //   };
  // }
}
