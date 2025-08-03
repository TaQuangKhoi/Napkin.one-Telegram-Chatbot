import { NextRequest } from 'next/server';
import { Telegraf } from 'telegraf';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

type NotificationHistory = {
    id: string;
    message: string;
    timestamp: string;
    sentTo: number;
};

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        
        if (!message || typeof message !== 'string') {
            return Response.json({ error: 'Message is required and must be a string' }, { status: 400 });
        }

        // Get all users from Redis
        const usersList = await redis.smembers('users:list') as string[];
        
        if (usersList.length === 0) {
            return Response.json({ error: 'No users found to send notifications to' }, { status: 404 });
        }

        let successCount = 0;
        let failureCount = 0;

        // Send notification to all users
        for (const username of usersList) {
            try {
                // Get user data to get their Telegram user ID
                const userData = await redis.get(username);
                if (userData && typeof userData === 'object' && 'user_id' in userData) {
                    await bot.telegram.sendMessage(userData.user_id as number, `📢 Notification:\n\n${message}`);
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error(`Failed to send notification to ${username}:`, error);
                failureCount++;
            }
        }

        // Save notification to history
        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const notification: NotificationHistory = {
            id: notificationId,
            message,
            timestamp: new Date().toISOString(),
            sentTo: successCount
        };

        // Add to history list
        await redis.lpush('notifications:history', JSON.stringify(notification));
        
        // Keep only last 100 notifications in history
        await redis.ltrim('notifications:history', 0, 99);

        return Response.json({
            success: true,
            message: 'Notification sent successfully',
            stats: {
                totalUsers: usersList.length,
                successful: successCount,
                failed: failureCount
            },
            notificationId
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return Response.json({ 
            error: 'Failed to send notification',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}