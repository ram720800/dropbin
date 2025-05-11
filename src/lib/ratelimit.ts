const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const maxAttempte = 10;
  const windowMs = 15 * 60 * 1000;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  const attempt = loginAttempts.get(ip)!;

  if (now > attempt.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempt.count >= maxAttempte) {
    return false;
  }

  attempt.count++;
  loginAttempts.set(ip, attempt);
  return true;
};
