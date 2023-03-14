// Nicolas Perradin 5IW3
import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  CreateTaskRequest, DeleteTaskRequest,
  GetTaskRequest,
  ListTasksRequest,
  ListTasksResponse,
  Task,
  UpdateTaskRequest
} from 'stubs/task/v1alpha/task';
import {CreateTaskDto, toJs} from './dto/create-task.dto';
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
    try{
      let { pageSize, pageToken } = request;
      pageToken = Number.isNaN(parseInt(request.pageToken)) === true || parseInt(request.pageToken) === 0 ? "1" : (parseInt(request.pageToken)).toString();
      const tasks = await this.tasksService.findAll(pageToken, pageSize);
      return ListTasksResponse.create({ task: tasks.map((task)=>({...task,dueDate: task.dueDate.toISOString(),})), nextPageToken:  (parseInt(pageToken) +1).toString() });
    }catch(err){
      throw new RpcException(err);
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
      const task = await this.tasksService.findOne(request.task.id);
      if (!task) {
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      const updatedTask = await this.tasksService.update(
          request.task.id,
          toJs(request.task),
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
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.findByName(request.name);
      if(!task){
        throw new RpcException({ message: 'Task not found', code: 5 });
      }
      await this.tasksService.remove(task.id);
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    }catch(err){
      throw new RpcException(err);
    }
  }
}
