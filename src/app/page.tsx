'use client';

import Image from 'next/image';
import axios from 'axios';
import { useState, useEffect } from 'react';

type Status = {
  status: string;
  time: string;
  redis: string;
};

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get('/api/status');
        setStatus(response.data);
      } catch (error) {
        console.error('Error fetching status:', error);
        setStatus({ status: 'error', time: new Date().toISOString(), redis: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const StatusIndicator = ({ service, isOk }: { service: string; isOk: boolean }) => (
    <div className='flex items-center gap-3'>
        <div className={`w-4 h-4 rounded-full ${isOk ? 'bg-green-500' : 'bg-red-500'}`} />
        <p className='font-mono'>{service}: <span className='font-bold'>{isOk ? 'Operational' : 'Error'}</span></p>
    </div>
  );

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8 font-sans'>
      <main className='flex flex-col gap-6 items-center text-center bg-white dark:bg-zinc-900 p-10 rounded-lg shadow-md'>
        <Image
          className='dark:invert'
          src='/next.svg'
          alt='Next.js logo'
          width={180}
          height={38}
          priority
        />
        <h1 className='text-2xl font-bold'>Telegram Bot Template</h1>
        <p className='text-zinc-600 dark:text-zinc-400'>Your bot is up and running. Check the status below.</p>
        
        <div className='mt-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg w-full max-w-sm flex flex-col gap-2'>
            {loading ? (
                <p>Loading status...</p>
            ) : (
                <>
                    <StatusIndicator service="Bot API" isOk={status?.status === 'ok'} />
                    <StatusIndicator service="Redis DB" isOk={status?.redis === 'ok'} />
                </>
            )}
        </div>

        <a
          className='mt-4 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-5'
          href={`/api/setWebHook`}
          target='_blank'
          rel='noopener noreferrer'
        >
          Setup/Update Webhook
        </a>
      </main>
      <footer className='absolute bottom-5 text-zinc-500 text-sm'>
        Powered by Next.js, Vercel, and Telegraf.
      </footer>
    </div>
  );
}
