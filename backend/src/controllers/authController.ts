import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const createAccessToken = (userId:string, role:string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
};

const createRefreshTokenString = () => {
  return crypto.randomBytes(64).toString('hex');
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash }
  });

  const accessToken = createAccessToken(user.id, user.role);
  const refreshTokenString = createRefreshTokenString();
  const refreshTokenHash = await hashPassword(refreshTokenString);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30));

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: refreshTokenHash, expiresAt }
  });

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken: refreshTokenString });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = createAccessToken(user.id, user.role);
  const refreshTokenString = createRefreshTokenString();
  const refreshTokenHash = await hashPassword(refreshTokenString);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30));

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: refreshTokenHash, expiresAt }
  });

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken: refreshTokenString });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });

  // Find all tokens for users and compare hashed token (inefficient but fine for demo)
  const tokens = await prisma.refreshToken.findMany({ where: { revoked: false } });
  // compare with bcrypt (hash)
  for (const t of tokens) {
    const match = await comparePassword(refreshToken, t.tokenHash);
    if (match) {
      // check expiry
      if (t.expiresAt < new Date()) return res.status(401).json({ message: 'Refresh token expired' });
      // issue new access + new refresh
      const user = await prisma.user.findUnique({ where: { id: t.userId } });
      if (!user) return res.status(401).json({ message: 'Invalid token' });

      // revoke old
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });

      const newAccess = createAccessToken(user.id, user.role);
      const newRefreshString = createRefreshTokenString();
      const newRefreshHash = await hashPassword(newRefreshString);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30));
      await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: newRefreshHash, expiresAt }});

      return res.json({ accessToken: newAccess, refreshToken: newRefreshString });
    }
  }

  res.status(401).json({ message: 'Invalid refresh token' });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'No refresh token' });

  // revoke matching token(s)
  const tokens = await prisma.refreshToken.findMany({ where: { revoked: false } });
  for (const t of tokens) {
    const match = await comparePassword(refreshToken, t.tokenHash);
    if (match) {
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true }});
    }
  }

  res.json({ ok: true });
};
