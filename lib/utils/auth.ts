import bcrypt from 'bcryptjs';
export * from './jwt';

export const hashPassword = async (plain: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(plain, saltRounds);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

