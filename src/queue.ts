import { Queue, Worker } from 'bullmq'
import { insertGoldPrice } from './db'
import type { GoldPriceData } from './types';

const QUEUE_NAME = 'goldPriceFetcher'
const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379'),
}

const queue = new Queue(QUEUE_NAME, {
  connection: REDIS_CONNECTION,
})

async function fetchGoldPrice(): Promise<GoldPriceData> {
    console.log('Fetching gold price...');
    const startTime = Date.now();
    const response = await fetch(
      'https://www.malabargoldanddiamonds.com/ae/malabarprice/index/getrates/?country=AE&state=Abu%20Dhabi',
      { method: 'POST' }
    )
    console.log(`API responded in ${Date.now() - startTime}ms`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()
    console.log('Fetched data:', data);
    return data
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      try {
        console.log('Job started:', job.id);
        const data = await fetchGoldPrice()
        await insertGoldPrice(data)
        console.log('Job completed successfully:', job.id);
      } catch (error) {
        console.error('Error processing job:', error);
        throw error;
      }
    },
    { connection: REDIS_CONNECTION }
  )

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed successfully`);
  });
  
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
  });
  

  export async function startJob() {
    console.log('Starting job setup...');
  
    // Remove existing repeatable job if any
    const existingJobs = await queue.getRepeatableJobs();
    for (const job of existingJobs) {
      if (job.name === 'fetchGoldPrice') {
        await queue.removeRepeatableByKey(job.key);
        console.log('Removed existing repeatable job');
      }
    }
  
    // Add new repeatable job
    await queue.add(
      'fetchGoldPrice',
      {},
      {
        repeat: {
          every: 5 * 60 * 1000
        },
        jobId: 'fetchGoldPrice',
      }
    );
    console.log('New recurring job added to queue');
  
    // Add immediate job
    await queue.add('fetchGoldPrice', {}, { jobId: `immediate-fetchGoldPrice-${Date.now()}` });
    console.log('Immediate job added to queue');
  }

  export async function stopJob() {
    const jobs = await queue.getRepeatableJobs()
    for (const job of jobs) {
      await queue.removeRepeatableByKey(job.key)
    }
    console.log('All recurring jobs removed from queue');
  }