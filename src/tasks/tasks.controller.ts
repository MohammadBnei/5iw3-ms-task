// PANIC Nikola 5IW3

import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateTaskRequest, Task, GetTaskRequest, ListTasksResponse, UpdateTaskRequest, DeleteTaskRequest, ListTasksRequest } from 'stubs/task/v1alpha/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService')
  async CreateTask(request: CreateTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.create(
        new CreateTaskDto(request.task),
      );
      return {...task, dueDate: task.dueDate.toISOString()};
    }catch(err){
      if (err.code === 'P2009') {
        throw new RpcException({ message: 'Données non valide.', code: 3 });
      }
      if (err.code === 'P2002') {
        throw new RpcException({ message: 'La tâche existe déjà.', code: 6 });
      }
      if(err instanceof RpcException){
        throw err;
      }
      throw new RpcException(err);
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
      if(err instanceof RpcException){
        throw err;
      }
      throw new RpcException(err);
    }
  }


  @GrpcMethod('TaskService')
  async GetTask(request: GetTaskRequest): Promise<Task> {
    try{
      if(request.name == "" || request.name == null){
        throw new RpcException({ message: 'Données non valide.', code: 3 });
      }
      const task = await this.tasksService.findByName(request.name);
      if (!task) {
        throw new RpcException({ message: 'Tâche introuvable.', code: 5 });
      }
      return {...task, dueDate: task.dueDate.toISOString()};
    }catch(err){
      if(err instanceof RpcException){
        throw err;
      }
      throw new RpcException(err.error);
    }
  }

  @GrpcMethod('TaskService')
  async UpdateTask(request: UpdateTaskRequest): Promise<Task> {
    try{
      let task = await this.tasksService.findOne(request.task.id);
      if (!task) {
        throw new RpcException({ message: 'Tâche introuvable.', code: 5 });
      }
      task = await this.tasksService.update(request.task.id, new UpdateTaskDto(request.task));
      return {...task, dueDate: task.dueDate.toISOString()};
    }catch(err){
      if (err.code === 'P2009') {
        throw new RpcException({ message: 'Données non valide.', code: 3 });
      }
      if (err.code === 'P2002') {
        throw new RpcException({ message: 'Le nom existe déjà.', code: 6 });
      }
      if(err instanceof RpcException){
        throw err;
      }
      throw new RpcException(err);
    }
  }

  @GrpcMethod('TaskService')
  async DeleteTask(request: DeleteTaskRequest): Promise<Task> {
    try{
      const task = await this.tasksService.findByName(request.name);
      if(!task){
        throw new RpcException({ message: 'Tâche introuvable.', code: 5 });
      }
      await this.tasksService.remove(task.id);
      return {...task, dueDate: task.dueDate.toISOString()};
    }catch(err){
      if(err instanceof RpcException){
        throw err;
      }
      throw new RpcException(err);
    }
  }
}
