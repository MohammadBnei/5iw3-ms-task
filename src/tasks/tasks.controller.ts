import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
  GetTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest
} from 'stubs/task/v1alpha/task';
import { CreateTaskDto, toJs } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Status } from '@grpc/grpc-js/build/src/constants';

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
          code: Status.INVALID_ARGUMENT,
          message: request.task.name + ' is already taken',
        });
      }

      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const tasks = await this.tasksService.findAll();

    return {
      task: tasks.map((task) => {
        return {
          ...task,
          dueDate: task.dueDate.toISOString(),
        };
      }),
      nextPageToken: '',
    };
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findOne(request.name);
      if (!task) {
        throw new RpcException({
          code: Status.NOT_FOUND,
          message: `"${request.name}" not found`,
        });
      }
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.update(request.task.id, new UpdateTaskDto(request.task));
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.remove(request.name);
      if (!task) {
        throw new RpcException({
          code: Status.NOT_FOUND,
          message: `"${request.name}" not found`,
        });
      }
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

}
