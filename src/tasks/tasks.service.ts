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

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = this.prisma.task.update({ where: { id }, data: updateTaskDto });
    return task;
  }

  async remove(name: string) {
    const task = this.prisma.task.delete({ where: { name } });
    return task;
  }

  async changeStatus(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    return this.prisma.task.update({
      where: { id },
      data: { done: !task.done },
    });
  }

  async findAll(page: number, limit: string) {
    const tasks = await this.prisma.task.findMany({
      skip: (page - 1) * Number(limit),
      take: Number(limit),
    });
    return tasks;
  }

  async findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.task.findUnique({ where: { name } });
  }

  async findMany(ids: number[]) {
    const tasks = this.prisma.task.findMany({ where: { id: { in: ids } } });
    return tasks;
  }

  async findManyByName(names: string[]) {
    const tasks = this.prisma.task.findMany({ where: { name: { in: names } } });
    return tasks;
  }

  async findManyByStatus(done: boolean) {
    const tasks = this.prisma.task.findMany({ where: { done } });
    return tasks;
  }

  async findManyByDate(dueDate: Date) {
    const tasks = this.prisma.task.findMany({ where: { dueDate } });
    return tasks;
  }

  async findManyByDateRange(dueDate: Date, dueDate2: Date) {
    const tasks = this.prisma.task.findMany({
      where: { dueDate: { gte: dueDate, lte: dueDate2 } },
    });
    return tasks;
  }

  async findManyByStatusAndDate(done: boolean, dueDate: Date) {
    const tasks = this.prisma.task.findMany({
      where: { done, dueDate },
    });
    return tasks;
  }

  async findManyByStatusAndDateRange(done: boolean, dueDate: Date, dueDate2: Date) {
    const tasks = this.prisma.task.findMany({
      where: { done, dueDate: { gte: dueDate, lte: dueDate2 } },
    });
    return tasks;
  }

  async findManyByStatusAndName(done: boolean, name: string) {
    const tasks = this.prisma.task.findMany({
      where: { done, name },
    });
    return tasks;
  }

  async findManyByStatusAndNameAndDate(
    done: boolean,
    name: string,
    dueDate: Date,
  ) {
    const tasks = this.prisma.task.findMany({
      where: { done, name, dueDate },
    });
    return tasks;
  }

  async findManyByStatusAndNameAndDateRange(
    done: boolean,
    name: string,
    dueDate: Date,
    dueDate2: Date,
  ) {
    const tasks = this.prisma.task.findMany({
      where: { done, name, dueDate: { gte: dueDate, lte: dueDate2 } },
    });
    return tasks;
  }

  async deleteAll() {
    return this.prisma.task.deleteMany();
  }

}
