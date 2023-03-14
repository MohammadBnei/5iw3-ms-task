//BAERT Romain 5IW3
import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateTaskRequest, Task, UpdateTaskRequest, ListTasksRequest, DeleteTaskRequest, ListTasksResponse } from 'stubs/task/v1alpha/task';
import { CreateTaskDto, toJs } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { status } from '@grpc/grpc-js';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

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
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
     try{

      const task = await this.tasksService.findOne(request.task.id);

      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Task not found',
        });
      } 

      const taskUpdate = await this.tasksService.update(
        request.task.id,
        new UpdateTaskDto(request.task),
      );

      return { ...taskUpdate, dueDate: taskUpdate.dueDate.toISOString() } as any;
     }
      catch(error){
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

      const task = await this.tasksService.findByName(request.name);

      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Task not found',
        });
      } 
      const taskDelete = await this.tasksService.remove(request.name);


      return { ...taskDelete, dueDate: taskDelete.dueDate.toISOString() } as any;
    } catch (error) {
      console.log({ error });
      throw new RpcException(error);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: Task): Promise<Task> {
    try {
      const task = await this.tasksService.findOne(request.id);
      
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Task not found',
        });
      }

      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    } catch (error) {
      console.log({ error });
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

      if(tasks.length === 0){
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Tasks not found',
        });
      }

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
  async ChangeStatus(request: Task): Promise<Task> {

    try{

      const task = await this.tasksService.findOne(request.id);
      
      if (!task) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Task not found',
        });
      }
      const taskChange = await this.tasksService.changeStatus(request.id);
      return { ...taskChange, dueDate: taskChange.dueDate.toISOString() } as any;

    }
    catch (error) {
      console.log({ error });
      throw new RpcException(error);
    }
  }

}