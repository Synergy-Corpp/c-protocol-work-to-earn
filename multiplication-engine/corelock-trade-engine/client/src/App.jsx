import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Play, 
  Square, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Wallet,
  Bot,
  Zap,
  Target,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import './App.css'

const API_BASE = 'http://localhost:3001/api'

function App() {
  const [profits, setProfits] = useState({ total: 0, transactions: [] })
  const [balance, setBalance] = useState({ sol: 0 })
  const [botStatus, setBotStatus] = useState({})
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001')
    
    ws.onopen = () => {
      setConnected(true)
      console.log('Connected to MEV dashboard')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'profit_update') {
        setProfits(prev => ({
          total: data.total,
          transactions: [data.latest, ...prev.transactions.slice(0, 19)]
        }))
        setLastUpdate(new Date())
      }
      
      if (data.type === 'bot_status') {
        setBotStatus(prev => ({
          ...prev,
          [data.bot]: data.status
        }))
      }
    }
    
    ws.onclose = () => {
      setConnected(false)
      console.log('Disconnected from MEV dashboard')
    }
    
    return () => {
      ws.close()
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    fetchProfits()
    fetchBalance()
    fetchBotStatus()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchProfits()
      fetchBalance()
      fetchBotStatus()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchProfits = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profits`)
      setProfits(response.data)
    } catch (error) {
      console.error('Error fetching profits:', error)
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE}/balance`)
      setBalance(response.data)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const fetchBotStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/bots/status`)
      setBotStatus(response.data)
    } catch (error) {
      console.error('Error fetching bot status:', error)
    }
  }

  const startBot = async (botName) => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/bots/start/${botName}`)
      fetchBotStatus()
    } catch (error) {
      console.error(`Error starting ${botName}:`, error)
    }
    setLoading(false)
  }

  const stopBot = async (botName) => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/bots/stop/${botName}`)
      fetchBotStatus()
    } catch (error) {
      console.error(`Error stopping ${botName}:`, error)
    }
    setLoading(false)
  }

  const startAllBots = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/bots/start-all`)
      fetchBotStatus()
    } catch (error) {
      console.error('Error starting all bots:', error)
    }
    setLoading(false)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Bot className="logo-icon" />
            <h1>CoreLock MEV Dashboard</h1>
          </div>
          <div className="connection-status">
            <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card profit-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <h3>Total MEV Profit</h3>
            </div>
            <div className="stat-value">{profits.total.toFixed(4)} SOL</div>
            <div className="stat-subtitle">≈ ${(profits.total * 180).toFixed(2)} USD</div>
          </div>

          <div className="stat-card balance-card">
            <div className="stat-header">
              <Wallet className="stat-icon" />
              <h3>Current Balance</h3>
            </div>
            <div className="stat-value">{balance.sol.toFixed(4)} SOL</div>
            <div className="stat-subtitle">Main Wallet</div>
          </div>

          <div className="stat-card transactions-card">
            <div className="stat-header">
              <Activity className="stat-icon" />
              <h3>Transactions</h3>
            </div>
            <div className="stat-value">{profits.transactions.length}</div>
            <div className="stat-subtitle">Recent MEV Trades</div>
          </div>

          <div className="stat-card update-card">
            <div className="stat-header">
              <RefreshCw className="stat-icon" />
              <h3>Last Update</h3>
            </div>
            <div className="stat-value">{formatTime(lastUpdate)}</div>
            <div className="stat-subtitle">Real-time Data</div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          <div className="panel-header">
            <h2>MEV Bot Control Center</h2>
            <button 
              className="launch-all-btn"
              onClick={startAllBots}
              disabled={loading}
            >
              <Zap className="btn-icon" />
              {loading ? 'Launching...' : 'Launch All Bots'}
            </button>
          </div>

          <div className="bots-grid">
            {[
              { name: 'arbitrage', label: 'Arbitrage Bot', icon: TrendingUp, description: 'Cross-DEX arbitrage opportunities' },
              { name: 'whale', label: 'Whale Sniper', icon: Target, description: 'Large transaction monitoring' },
              { name: 'liquidation', label: 'Liquidation Monitor', icon: AlertTriangle, description: 'Liquidation opportunity detection' }
            ].map(bot => (
              <div key={bot.name} className="bot-card">
                <div className="bot-header">
                  <bot.icon className="bot-icon" />
                  <div>
                    <h3>{bot.label}</h3>
                    <p>{bot.description}</p>
                  </div>
                </div>
                
                <div className="bot-status">
                  <span className={`status-badge ${botStatus[bot.name] || 'stopped'}`}>
                    {botStatus[bot.name] === 'running' ? '🟢 Running' : '🔴 Stopped'}
                  </span>
                </div>

                <div className="bot-controls">
                  {botStatus[bot.name] === 'running' ? (
                    <button 
                      className="stop-btn"
                      onClick={() => stopBot(bot.name)}
                      disabled={loading}
                    >
                      <Square className="btn-icon" />
                      Stop
                    </button>
                  ) : (
                    <button 
                      className="start-btn"
                      onClick={() => startBot(bot.name)}
                      disabled={loading}
                    >
                      <Play className="btn-icon" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-panel">
          <h2>Recent MEV Transactions</h2>
          <div className="transactions-list">
            {profits.transactions.length === 0 ? (
              <div className="no-transactions">
                <Activity className="empty-icon" />
                <p>No MEV transactions yet. Start the bots to begin earning!</p>
              </div>
            ) : (
              profits.transactions.map((tx, index) => (
                <div key={index} className="transaction-item">
                  <div className="tx-info">
                    <div className="tx-strategy">{tx.source || 'MEV'}</div>
                    <div className="tx-time">{formatTime(tx.timestamp)}</div>
                  </div>
                  <div className="tx-amount">+{parseFloat(tx.amount).toFixed(4)} SOL</div>
                  <div className="tx-hash">
                    <a 
                      href={`https://solscan.io/tx/${tx.txid}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {formatAddress(tx.txid)}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App