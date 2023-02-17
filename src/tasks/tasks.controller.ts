import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateTaskRequest, Task, GetTaskRequest, ListTasksResponse, UpdateTaskRequest, DeleteTaskRequest, ListTasksRequest } from 'stubs/task/v1alpha/task';
import { CreateTaskDto, toJs, toGrpc } from './dto/create-task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService')
  async CreateTask(request: CreateTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.create(
        new CreateTaskDto(request.task),
      );
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    }catch(err){
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async ListTasks(request: ListTasksRequest): Promise<ListTasksResponse> {
    try{
      const tasks = await this.tasksService.findAll();
      return ListTasksResponse.create({ task: tasks.map(toGrpc) });
    }catch(err){
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.findByName(request.name);
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    }catch(err){
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try{
      let task = await this.tasksService.findOne(request.task.id);
      task = await this.tasksService.update(request.task.id, {
        name: request.task.name,
        dueDate: new Date(request.task.dueDate),
        done: request.task.done,
      });
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    }catch(err){
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.findByName(request.name);
      await this.tasksService.remove(task.id);
      return { ...task, dueDate: task.dueDate.toISOString() } as any;
    }catch(err){
      throw new RpcException(err);
    }
  }
}
