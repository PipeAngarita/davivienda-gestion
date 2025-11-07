import prisma from '../prisma/client';
import { hashPassword } from '../utils/hash';

async function main() {
  const pwd = await hashPassword('Demo1234');
  const admin = await prisma.user.create({
    data: { name: 'Admin Demo', email: 'admin@demo.com', passwordHash: pwd, role: 'ADMIN' }
  });

  const user = await prisma.user.create({
    data: { name: 'Felipe', email: 'felipe@demo.com', passwordHash: pwd }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Proyecto Demo',
      description: 'Proyecto para la demo Davivienda',
      ownerId: admin.id,
      members: { create: [{ userId: admin.id, role: 'OWNER' }, { userId: user.id, role: 'EDITOR' }] },
      columns: { create: [{ title: 'Backlog', orderIndex: 0 }, { title: 'To Do', orderIndex: 1 }, { title: 'Doing', orderIndex: 2 }, { title: 'Done', orderIndex: 3 }] }
    },
    include: { columns: true }
  });

  // create sample tasks:
  const backlog = project.columns[0];
  const todo = project.columns[1];

  await prisma.task.createMany({
    data: [
      { title: 'Diseñar login', description: 'Diseñar pantalla login', columnId: backlog.id, projectId: project.id, orderIndex: 0, createdById: admin.id },
      { title: 'API auth', description: 'Implementar endpoints auth', columnId: todo.id, projectId: project.id, orderIndex: 0, createdById: admin.id }
    ]
  });

  console.log('Seed completed');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
