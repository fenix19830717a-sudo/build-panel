let tasks = new Map();

async function onLoad(context) {
  context.log('info', 'Data Scraper module loaded', { nodeId: context.nodeId });
}

async function onUnload() {
  console.log('Data Scraper module unloaded');
}

async function scrape(context, data) {
  const { url, selectors, options } = data.body;
  
  const taskId = `task-${Date.now()}`;
  
  tasks.set(taskId, {
    id: taskId,
    url,
    status: 'running',
    progress: 0,
    startTime: new Date().toISOString(),
    result: null
  });
  
  context.log('info', 'Starting scrape task', { taskId, url });
  
  setTimeout(() => {
    const task = tasks.get(taskId);
    if (task) {
      task.status = 'completed';
      task.progress = 100;
      task.result = {
        data: [
          { title: 'Sample Data 1', url: 'https://example.com/1' },
          { title: 'Sample Data 2', url: 'https://example.com/2' }
        ],
        scrapedAt: new Date().toISOString()
      };
    }
  }, 2000);
  
  return { taskId, status: 'started' };
}

async function getTasks(context, data) {
  return Array.from(tasks.values()).map(t => ({
    id: t.id,
    url: t.url,
    status: t.status,
    progress: t.progress
  }));
}

async function getTaskStatus(context, data) {
  const taskId = data.params.id;
  const task = tasks.get(taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }
  
  return task;
}

module.exports = {
  onLoad,
  onUnload,
  scrape,
  getTasks,
  getTaskStatus
};
