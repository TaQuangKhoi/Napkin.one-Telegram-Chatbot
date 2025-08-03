import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

type NotificationHistory = {
    id: string;
    message: string;
    timestamp: string;
    sentTo: number;
};

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const limitParam = url.searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : 50;

        // Validate limit parameter
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return Response.json({ 
                error: 'Invalid limit parameter. Must be a number between 1 and 100' 
            }, { status: 400 });
        }

        // Get notification history from Redis
        const historyData = await redis.lrange('notifications:history', 0, limit - 1);
        
        if (!historyData || historyData.length === 0) {
            return Response.json({
                success: true,
                message: 'No notification history found',
                notifications: [],
                count: 0
            });
        }

        // Parse the JSON strings back to objects
        const notifications: NotificationHistory[] = [];
        for (const item of historyData) {
            try {
                if (typeof item === 'string') {
                    const parsed = JSON.parse(item);
                    notifications.push(parsed);
                } else {
                    // Handle case where item is already an object
                    notifications.push(item as NotificationHistory);
                }
            } catch (parseError) {
                console.error('Error parsing notification history item:', parseError);
                // Skip invalid entries
            }
        }

        return Response.json({
            success: true,
            message: 'Notification history retrieved successfully',
            notifications,
            count: notifications.length,
            limit
        });

    } catch (error) {
        console.error('Error retrieving notification history:', error);
        return Response.json({ 
            error: 'Failed to retrieve notification history',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}