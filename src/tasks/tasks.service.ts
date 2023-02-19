import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({ data: createTaskDto });
    return task;
  }

  async findAll(tasksPerPage: number, pageNumber: number) {
    if (isNaN(pageNumber)) throw new Error('Page number must be a number');
    if (isNaN(tasksPerPage)) throw new Error('Tasks per page must be a number');

    const skip = tasksPerPage * (pageNumber - 1);
    const tasks = await this.prisma.task.findMany({
      skip,
      take: tasksPerPage,
    });
    return {
      tasks,
      nextPageToken: tasks.length <= tasksPerPage ? '' : (pageNumber + 1).toString(),
    };
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  findOneByName(name: string) {
    return this.prisma.task.findUnique({ where: { name } });
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  remove(name: string) {
    return this.prisma.task.delete({ where: { name } });
  }

  // findOne(id: number) {
  //   return this.taskRepository.findOne(id);
  // }

  // async update(id: number, updateTaskDto: UpdateTaskDto) {
  //   let task = await this.taskRepository.findOne(id);
  //   task = await this.taskRepository.assign(task, updateTaskDto);
  //   await this.taskRepository.flush();
  //   return task;
  // }

  // async changeStatus(id: number) {
  //   const task = await this.taskRepository.findOne(id);
  //   task.done = !task.done;
  //   await this.taskRepository.flush();
  //   return task;
  // }

  // async remove(id: number) {
  //   const task = await this.taskRepository.findOne(id);
  //   return this.taskRepository.removeAndFlush(task);
  // }
}
