import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    username?: string;
    authType?: 'local';
  }

  interface Session {
    user: {
      id: string;
      username?: string;
      authType?: 'local';
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    username?: string;
    authType?: 'local';
  }
}
