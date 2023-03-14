// DIAWADOH Locman-Njim 5IW3
import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  Task,
  UpdateTaskRequest,
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto, toJs } from './dto/create-task.dto';
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
  async DeleteTask(req: DeleteTaskRequest): Promise<Task> {
    try {
      const t = await this.tasksService.findByName(req.name);
      if (!t) {
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      await this.tasksService.remove(t.id);
      return { ...t } as any;
    } catch (err) {
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(req: UpdateTaskRequest): Promise<Task> {
    try {
      const t = await this.tasksService.findOne(req.task.id);
      if (!t) {
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      const updatedTask = await this.tasksService.update(
        req.task.id,
        toJs(req.task),
      );
      return {
        ...updatedTask,
        dueDate: updatedTask.dueDate.toISOString(),
      } as any;
    } catch (err) {
      if (err.code === 'P2009') {
        throw new RpcException({ message: 'Invalid entry data', code: 3 });
      }
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(req: GetTaskRequest): Promise<Task> {
    try {
      const t = await this.tasksService.findByName(req.name);
      if (!t) {
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      return { ...t } as any;
    } catch (err) {
      throw new RpcException(err);
    }
  }
}
