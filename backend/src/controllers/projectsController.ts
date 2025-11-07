import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const list = async (req: Request, res: Response) => {
  // mostrar proyectos donde user es miembro o owner
  //@ts-ignore
  const userId = (req as any).user.userId;
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: { owner: true }
  });
  res.json(projects);
};

export const create = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  //@ts-ignore
  const userId = (req as any).user.userId;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: {
        create: { userId, role: 'OWNER' }
      },
      columns: {
        create: [
          { title: 'Backlog', orderIndex: 0 },
          { title: 'To Do', orderIndex: 1 },
          { title: 'Doing', orderIndex: 2 },
          { title: 'Done', orderIndex: 3 }
        ]
      }
    },
    include: { columns: true }
  });
  res.status(201).json(project);
};

export const getOne = async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { columns: { include: { tasks: true } }, members: { include: { user: true } } }
  });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};
