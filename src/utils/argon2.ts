import * as argon2 from 'argon2';

export async function hash(pass: string): Promise<string> {
  return await argon2.hash(pass);
}

export async function verify(hash: string, pass: string): Promise<boolean> {
  return argon2.verify(hash, pass);
}
