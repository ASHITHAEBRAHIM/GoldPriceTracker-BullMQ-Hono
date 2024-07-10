import { Hono } from 'hono'
import { startJob, stopJob } from './queue'
import { serve } from '@hono/node-server'

const app = new Hono()
console.log('Starting application...');

app.post('/start', async (c) => {
  console.log('Received request to start job');
  await startJob()
  console.log('Job started successfully');
  return c.json({ message: 'Job started' })
})

app.post('/stop', async (c) => {
 console.log('Received request to stop job');
  await stopJob()
  console.log('Job stopped successfully');
  return c.json({ message: 'Job stopped' })
})

console.log('Application setup complete. Waiting for requests...');

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app