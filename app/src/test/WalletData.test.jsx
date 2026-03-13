import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WalletData from '../WalletData'

describe('WalletData', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the component with default form values', () => {
    render(<WalletData />)
    expect(screen.getByText('Wallet Data')).toBeInTheDocument()
    expect(screen.getByLabelText('Host:')).toHaveValue('localhost')
    expect(screen.getByLabelText('Port:')).toHaveValue(8332)
    expect(screen.getByText('Fetch Wallet Data')).toBeInTheDocument()
  })

  it('shows loading state while fetching', async () => {
    fetch.mockImplementation(() => new Promise(() => {}))

    render(<WalletData />)
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    expect(screen.getByText('Fetching...')).toBeInTheDocument()
  })

  it('displays wallet info on successful fetch', async () => {
    const walletInfoResponse = {
      result: {
        walletname: 'test-wallet',
        txcount: 42,
        unconfirmed_balance: 0.001,
        immature_balance: 0,
      },
      error: null,
    }
    const balanceResponse = { result: 1.5, error: null }
    const addressesResponse = {
      result: {
        'bc1qtest1': { purpose: 'receive' },
        'bc1qtest2': { purpose: 'receive' },
      },
      error: null,
    }

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => walletInfoResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => balanceResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => addressesResponse,
      })

    render(<WalletData />)
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    await waitFor(() => {
      expect(screen.getByText('test-wallet')).toBeInTheDocument()
      expect(screen.getByText('1.5 BTC')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('bc1qtest1')).toBeInTheDocument()
    })
  })

  it('displays an error message when RPC call fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    })

    render(<WalletData />)
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch wallet data/i)
      ).toBeInTheDocument()
    })
  })

  it('displays an error when the RPC returns an error field', async () => {
    const errorResponse = { result: null, error: { message: 'Wallet not found' } }
    fetch.mockResolvedValue({
      ok: true,
      json: async () => errorResponse,
    })

    render(<WalletData />)
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    await waitFor(() => {
      expect(
        screen.getByText(/Wallet not found/i)
      ).toBeInTheDocument()
    })
  })

  it('uses custom wallet name in RPC URL', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: null, error: { message: 'error' } }),
    })

    render(<WalletData />)
    fireEvent.change(screen.getByLabelText('Wallet Name (optional):'), {
      target: { value: 'mywallet' },
    })
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/wallet/mywallet'),
        expect.any(Object)
      )
    })
  })

  it('includes Basic auth header when credentials are provided', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: null, error: { message: 'error' } }),
    })

    render(<WalletData />)
    fireEvent.change(screen.getByLabelText('RPC Username:'), {
      target: { value: 'alice' },
    })
    fireEvent.change(screen.getByLabelText('RPC Password:'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByText('Fetch Wallet Data'))

    await waitFor(() => {
      const callOptions = fetch.mock.calls[0][1]
      expect(callOptions.headers['Authorization']).toContain('Basic ')
    })
  })
})
