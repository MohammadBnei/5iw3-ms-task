import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({ data: createTaskDto });
    return task;
  }

  async findByName(name: string) {
    return this.prisma.task.findUnique({ where: { name } });
  }

  // findAll() {
  //   return this.taskRepository.findAll();
  // }

  async findAll(page: string = '1', limit: number = 5) {
    if (!page || page == '0' || isNaN(parseInt(page))) page = '1';
    if (!limit || limit <= 0 || isNaN(limit)) limit = 5;
    return this.prisma.task.findMany({ skip: (parseInt(page) - 1) * limit, take: limit });
  }

  // findOne(id: number) {
  //   return this.taskRepository.findOne(id);
  // }

  async findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  // async update(id: number, updateTaskDto: UpdateTaskDto) {
  //   let task = await this.taskRepository.findOne(id);
  //   task = await this.taskRepository.assign(task, updateTaskDto);
  //   await this.taskRepository.flush();
  //   return task;
  // }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({ where: { id }, data: updateTaskDto });
  }

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

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
