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
      if(error?.code === 'P2009'){
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid argument(s)',
        });
      }
      
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
  async GetAllTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    const { pageSize, pageToken } = request;
    const {tasks, nextPageToken} = await this.tasksService.findAllTasks(pageSize, parseInt(pageToken));

    return {
      task: tasks.map((task) => {
        return {
          ...task,
          dueDate: task.dueDate.toISOString(),
        };
      }),
      nextPageToken,
    };
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.findOneByName(request.name);
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `"${request.name}" not found`,
        });
      }
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      if(error?.code === 'P2002'){
        throw new RpcException({
          code: status.NOT_FOUND,
          message: request.name + ' not found',
        });
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try {
      if(!request.task){
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Task is required',
        });
      }
      const task = await this.tasksService.updateTask(request.task.id, new UpdateTaskDto(request.task));      
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      if(error?.code === 'P2025'){
        throw new RpcException({
          code: status.NOT_FOUND,
          message: request.task.id + ' not found',
        });
      }
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try {
      const task = await this.tasksService.removeTaskByName(request.name);
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `"${request.name}" not found`,
        });
      }
      return {
        ...task,
        dueDate: task.dueDate.toISOString(),
      };
    } catch (error) {
      if(error?.code === 'P2025'){
        throw new RpcException({
          code: status.NOT_FOUND,
          message: request.name + ' not found',
        });
      }
      throw new RpcException(error);
    }
  }

}
  

