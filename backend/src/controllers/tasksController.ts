import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const create = async (req: Request, res: Response) => {
  const { title, description, projectId, columnId, assigneeId } = req.body;
  //@ts-ignore
  const userId = (req as any).user.userId;
  // compute max orderIndex in column
  const max = await prisma.task.aggregate({
    where: { columnId },
    _max: { orderIndex: true }
  });
  const nextIndex = (max._max.orderIndex ?? -1) + 1;
  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      columnId,
      assigneeId,
      orderIndex: nextIndex,
      createdById: userId
    }
  });
  res.status(201).json(task);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const task = await prisma.task.update({ where: { id }, data });
  res.json(task);
};

export const move = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { toColumnId, toIndex } = req.body;

  await prisma.$transaction(async (prismaTx) => {
    const task = await prismaTx.task.findUnique({ where: { id } });
    if (!task) throw { status: 404, message: 'Task not found' };

    // Decrement indexes in source column for tasks after the removed index
    await prismaTx.task.updateMany({
      where: { columnId: task.columnId, orderIndex: { gt: task.orderIndex } },
      data: { orderIndex: { decrement: 1 } }
    });

    // Increment indexes in destination column for tasks >= toIndex
    await prismaTx.task.updateMany({
      where: { columnId: toColumnId, orderIndex: { gte: toIndex } },
      data: { orderIndex: { increment: 1 } }
    });

    // update moved task
    await prismaTx.task.update({
      where: { id },
      data: { columnId: toColumnId, orderIndex: toIndex }
    });
  });

  return res.json({ ok: true });
};
