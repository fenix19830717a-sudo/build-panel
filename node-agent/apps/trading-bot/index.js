let config = {
  maxConcurrentTrades: 5,
  defaultAmount: 100,
  slippageTolerance: 1.5,
  tradingMode: 'paper'
};

let stats = {
  totalTrades: 0,
  successfulTrades: 0,
  failedTrades: 0,
  totalPnL: 0
};

async function onLoad(context) {
  context.log('info', 'Trading Bot module loaded', { nodeId: context.nodeId });
}

async function onUnload() {
  console.log('Trading Bot module unloaded');
}

async function getStatus(context, data) {
  return {
    status: 'running',
    config,
    stats,
    uptime: process.uptime(),
    nodeId: context.nodeId
  };
}

async function executeTrade(context, data) {
  const { marketId, type, amount, price } = data.body;
  
  context.log('info', 'Executing trade', { marketId, type, amount });
  
  stats.totalTrades++;
  
  const tradeResult = {
    id: `trade-${Date.now()}`,
    marketId,
    type,
    amount: amount || config.defaultAmount,
    price,
    status: 'executed',
    timestamp: new Date().toISOString(),
    mode: config.tradingMode
  };
  
  stats.successfulTrades++;
  
  return tradeResult;
}

async function getConfig(context, data) {
  return { config };
}

async function updateConfig(context, data) {
  const updates = data.body;
  
  context.log('info', 'Updating config', { updates });
  
  config = { ...config, ...updates };
  
  return { success: true, config };
}

module.exports = {
  onLoad,
  onUnload,
  getStatus,
  executeTrade,
  getConfig,
  updateConfig
};
