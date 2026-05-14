import bcrypt from "bcrypt";

const saltRounds = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, saltRounds);
}

export function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}
