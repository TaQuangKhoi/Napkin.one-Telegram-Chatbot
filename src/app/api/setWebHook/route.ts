import { NextResponse } from 'next/server';

export async function GET() {
    const token = process.env.TELEGRAM_TOKEN;
    // Vercel provides this out of the box
    const vercelUrl = process.env.VERCEL_URL;

    if (!token) {
        return new NextResponse('TELEGRAM_TOKEN is not set', { status: 500 });
    }

    if (!vercelUrl) {
        return new NextResponse('VERCEL_URL is not set. Are you running on Vercel?', { status: 500 });
    }

    const webhookUrl = `https://${vercelUrl}/api/webhook`;

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ message: 'Failed to set webhook', details: data }, { status: response.status });
        }

        return NextResponse.json({ message: 'Webhook set successfully!', url: webhookUrl, details: data });
    } catch (error) {
        console.error('Error setting webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}