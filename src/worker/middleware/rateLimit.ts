import { Context, Next } from 'hono';

/**
 * Rate Limiter Middleware using D1
 * Limits requests based on IP or User ID
 */
export const rateLimit = (options: { limit: number; windowMs: number }) => {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('CF-Connecting-IP') || 'unknown';
        const user = c.get('user');
        const key = user ? `user:${user.id}` : `ip:${ip}`;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        try {
            // Clean up old entries (probabilistic or scheduled, here we do it lazily or just ignore for now to save writes)
            // For robustness, we should delete expired, but let's just check the current one.

            // Check current limit
            const record = await c.env.DB.prepare(
                `SELECT count, expires_at FROM rate_limits WHERE key = ?`
            ).bind(key).first();

            if (record) {
                if (record.expires_at < now) {
                    // Expired, reset
                    await c.env.DB.prepare(
                        `UPDATE rate_limits SET count = 1, expires_at = ? WHERE key = ?`
                    ).bind(now + options.windowMs, key).run();
                } else {
                    // Valid window
                    if (record.count >= options.limit) {
                        return c.json({ error: 'Too Many Requests', retryAfter: Math.ceil((record.expires_at - now) / 1000) }, 429);
                    }
                    // Increment
                    await c.env.DB.prepare(
                        `UPDATE rate_limits SET count = count + 1 WHERE key = ?`
                    ).bind(key).run();
                }
            } else {
                // New record
                await c.env.DB.prepare(
                    `INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)`
                ).bind(key, now + options.windowMs).run();
            }
        } catch (error) {
            console.error('Rate limit error:', error);
            // Fail open if DB fails
        }

        await next();
    };
};
