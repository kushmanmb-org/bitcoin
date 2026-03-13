import { useState } from 'react'
import './WalletData.css'

const DEFAULT_RPC_HOST = 'localhost'
const DEFAULT_RPC_PORT = '8332'

function WalletData() {
  const [rpcUser, setRpcUser] = useState('')
  const [rpcPassword, setRpcPassword] = useState('')
  const [rpcHost, setRpcHost] = useState(DEFAULT_RPC_HOST)
  const [rpcPort, setRpcPort] = useState(DEFAULT_RPC_PORT)
  const [walletName, setWalletName] = useState('')
  const [walletInfo, setWalletInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buildRpcUrl = () => {
    const host = rpcHost.trim() || DEFAULT_RPC_HOST
    const port = rpcPort.trim() || DEFAULT_RPC_PORT
    const walletPath = walletName.trim() ? `/wallet/${encodeURIComponent(walletName.trim())}` : ''
    return `http://${host}:${port}${walletPath}`
  }

  const callRpc = async (method, params = []) => {
    const url = buildRpcUrl()
    const body = JSON.stringify({
      jsonrpc: '1.0',
      id: 'fetch-wallet-data',
      method,
      params,
    })

    const headers = { 'Content-Type': 'application/json' }
    if (rpcUser.trim()) {
      headers['Authorization'] = 'Basic ' + btoa(`${rpcUser.trim()}:${rpcPassword.trim()}`)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`RPC error ${response.status}: ${text}`)
    }

    const json = await response.json()
    if (json.error) {
      throw new Error(json.error.message || 'Unknown RPC error')
    }
    return json.result
  }

  const fetchWalletData = async () => {
    setLoading(true)
    setError('')
    setWalletInfo(null)

    try {
      const [info, balance, addresses] = await Promise.all([
        callRpc('getwalletinfo'),
        callRpc('getbalance'),
        callRpc('getaddressesbylabel', ['']).catch(() => null),
      ])

      setWalletInfo({
        walletName: info.walletname ?? '',
        balance: balance,
        txCount: info.txcount ?? 0,
        unconfirmedBalance: info.unconfirmed_balance ?? 0,
        immatureBalance: info.immature_balance ?? 0,
        addresses: addresses ? Object.keys(addresses) : [],
      })
    } catch (err) {
      setError('Failed to fetch wallet data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="wallet-data-section">
      <h2>Wallet Data</h2>

      <div className="rpc-config">
        <h3>Bitcoin Core RPC Configuration</h3>
        <div className="config-grid">
          <div className="input-group">
            <label htmlFor="rpcHost">Host:</label>
            <input
              id="rpcHost"
              type="text"
              value={rpcHost}
              onChange={(e) => setRpcHost(e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div className="input-group">
            <label htmlFor="rpcPort">Port:</label>
            <input
              id="rpcPort"
              type="number"
              value={rpcPort}
              onChange={(e) => setRpcPort(e.target.value)}
              placeholder="8332"
              min="1"
              max="65535"
            />
          </div>
          <div className="input-group">
            <label htmlFor="rpcUser">RPC Username:</label>
            <input
              id="rpcUser"
              type="text"
              value={rpcUser}
              onChange={(e) => setRpcUser(e.target.value)}
              placeholder="rpcuser"
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="rpcPassword">RPC Password:</label>
            <input
              id="rpcPassword"
              type="password"
              value={rpcPassword}
              onChange={(e) => setRpcPassword(e.target.value)}
              placeholder="rpcpassword"
              autoComplete="current-password"
            />
          </div>
          <div className="input-group">
            <label htmlFor="walletName">Wallet Name (optional):</label>
            <input
              id="walletName"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Leave empty for default wallet"
            />
          </div>
        </div>
      </div>

      <button
        className="fetch-button"
        onClick={fetchWalletData}
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch Wallet Data'}
      </button>

      {error && <p className="wallet-error">{error}</p>}

      {walletInfo && (
        <div className="wallet-info">
          <h3>Wallet Information</h3>
          <table className="wallet-table">
            <tbody>
              <tr>
                <th>Wallet Name</th>
                <td>{walletInfo.walletName}</td>
              </tr>
              <tr>
                <th>Confirmed Balance</th>
                <td>{walletInfo.balance} BTC</td>
              </tr>
              <tr>
                <th>Unconfirmed Balance</th>
                <td>{walletInfo.unconfirmedBalance} BTC</td>
              </tr>
              <tr>
                <th>Immature Balance</th>
                <td>{walletInfo.immatureBalance} BTC</td>
              </tr>
              <tr>
                <th>Transaction Count</th>
                <td>{walletInfo.txCount}</td>
              </tr>
            </tbody>
          </table>

          {walletInfo.addresses.length > 0 && (
            <div className="wallet-addresses">
              <h4>Wallet Addresses</h4>
              <ul>
                {walletInfo.addresses.map((addr) => (
                  <li key={addr} className="wallet-address">
                    <code>{addr}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default WalletData
