import { auth } from './config';
import { dbReady } from '@/lib/db';
import { userRepository } from '@/lib/db/repositories/user.repository';

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

export async function resolveUser() {
  await dbReady;

  const session = await auth();
  if (!session?.user?.id) return null;

  let user = await userRepository.findById(session.user.id);

  if (!user && session.user.username) {
    user = await userRepository.findByUsername(session.user.username);
  }

  if (!user && session.user.email) {
    user = await userRepository.findByEmail(session.user.email);
  }

  return user;
}
