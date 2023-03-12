import {Injectable} from '@nestjs/common';
import {PrismaService} from 'prisma/prisma.service';
import {CreateTaskDto} from './dto/create-task.dto';
import {UpdateTaskDto} from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  async create(createTaskDto: CreateTaskDto) {
    return await this.prisma.task.create({data: createTaskDto});
  }

  async findAll() {
    return await this.prisma.task.findMany();
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return await this.prisma.task.findUnique({ where: { name } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }

  async listTasks(pageSize: number, currentPage: number) {
    const skip = pageSize * (currentPage - 1);
    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        take: pageSize,
        skip: skip,
      }),
      this.prisma.task.count(),
    ]);
    const totalPages = Math.ceil(total / pageSize);
    const nextPageToken =
        currentPage < totalPages ? String(currentPage + 1) : '';
    return {
      task: tasks,
      nextPageToken: nextPageToken,
    };
  }
}
