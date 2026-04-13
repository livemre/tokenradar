'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { ArrowDownUp, Wallet, Loader2 } from 'lucide-react';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: Array<{ swapInfo: { label: string } }>;
}

export function SwapWidget({ tokenMint, tokenSymbol }: { tokenMint: string; tokenSymbol: string }) {
  const t = useTranslations('swap');
  const { publicKey, signTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');

  const inputMint = direction === 'buy' ? SOL_MINT : tokenMint;
  const outputMint = direction === 'buy' ? tokenMint : SOL_MINT;
  const inputSymbol = direction === 'buy' ? 'SOL' : tokenSymbol;
  const outputSymbol = direction === 'buy' ? tokenSymbol : 'SOL';

  const fetchQuote = useCallback(async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert to lamports (SOL) or smallest unit
      const decimals = direction === 'buy' ? 9 : 6; // SOL = 9, most tokens = 6
      const amountInSmallest = Math.floor(parseFloat(inputAmount) * 10 ** decimals);

      const res = await fetch(
        `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountInSmallest}&slippageBps=100`
      );

      if (!res.ok) throw new Error('Failed to get quote');

      const data = await res.json();
      setQuote(data);
    } catch {
      setError(t('quoteFailed'));
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [inputMint, outputMint, direction]);

  const executeSwap = async () => {
    if (!publicKey || !signTransaction || !quote) return;

    setSwapping(true);
    setError(null);
    setSuccess(null);

    try {
      // Get swap transaction from Jupiter
      const res = await fetch('https://api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 'auto',
        }),
      });

      if (!res.ok) throw new Error('Failed to create swap transaction');

      const { swapTransaction } = await res.json();
      const txBuf = Buffer.from(swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBuf);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
        maxRetries: 2,
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(sig, 'confirmed');
      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      setSuccess(sig);
      setQuote(null);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  const formatOutput = (outAmount: string) => {
    const decimals = direction === 'buy' ? 6 : 9;
    return (parseInt(outAmount) / 10 ** decimals).toLocaleString(undefined, {
      maximumFractionDigits: direction === 'buy' ? 2 : 6,
    });
  };

  return (
    <div className="space-y-4">
      {/* Buy/Sell toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setDirection('buy'); setQuote(null); setAmount(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all btn-press ${
            direction === 'buy'
              ? 'bg-gradient-to-r from-[#00ff88]/20 to-[#00d4aa]/10 text-[#00ff88] border border-[#00ff88]/30'
              : 'bg-white/5 text-muted hover:text-foreground border border-transparent'
          }`}
        >
          {t('buy')}
        </button>
        <button
          onClick={() => { setDirection('sell'); setQuote(null); setAmount(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all btn-press ${
            direction === 'sell'
              ? 'bg-gradient-to-r from-[#ff3366]/20 to-[#ff1744]/10 text-[#ff3366] border border-[#ff3366]/30'
              : 'bg-white/5 text-muted hover:text-foreground border border-transparent'
          }`}
        >
          {t('sell')}
        </button>
      </div>

      {/* Input */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">{t('youPay')}</span>
          <span className="text-xs text-muted">{inputSymbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              fetchQuote(e.target.value);
            }}
            placeholder="0.0"
            className="flex-1 bg-transparent text-xl font-mono font-semibold outline-none placeholder:text-white/20"
            step="any"
            min="0"
          />
          {direction === 'buy' && (
            <div className="flex gap-1">
              {['0.1', '0.5', '1'].map((v) => (
                <button
                  key={v}
                  onClick={() => { setAmount(v); fetchQuote(v); }}
                  className="px-2.5 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-all btn-press font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <button
          onClick={() => { setDirection(direction === 'buy' ? 'sell' : 'buy'); setQuote(null); setAmount(''); }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all btn-press ring-1 ring-white/10"
        >
          <ArrowDownUp size={16} className="text-muted" />
        </button>
      </div>

      {/* Output */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">{t('youReceive')}</span>
          <span className="text-xs text-muted">{outputSymbol}</span>
        </div>
        <div className="text-xl font-mono font-semibold text-foreground/70">
          {loading ? (
            <span className="text-muted animate-pulse">{t('gettingQuote')}</span>
          ) : quote ? (
            formatOutput(quote.outAmount)
          ) : (
            <span className="text-white/20">0.0</span>
          )}
        </div>
      </div>

      {/* Quote details */}
      {quote && (
        <div className="text-xs text-muted space-y-1.5 px-1 py-2 border-t border-border/50">
          <div className="flex justify-between">
            <span>{t('priceImpact')}</span>
            <span className={parseFloat(quote.priceImpactPct) > 5 ? 'text-danger' : ''}>
              {parseFloat(quote.priceImpactPct).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('route')}</span>
            <span>{quote.routePlan?.map(r => r.swapInfo?.label).join(' → ') || t('direct')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('slippage')}</span>
            <span>1%</span>
          </div>
        </div>
      )}

      {/* Action button */}
      {!connected ? (
        <button
          onClick={() => setVisible(true)}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 transition-all btn-press flex items-center justify-center gap-2"
        >
          <Wallet size={16} />
          {t('connectWallet')}
        </button>
      ) : (
        <button
          onClick={executeSwap}
          disabled={!quote || swapping || loading}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all btn-press flex items-center justify-center gap-2 ${
            direction === 'buy'
              ? 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/30 disabled:text-black/50'
              : 'bg-[#ff3366] text-white hover:bg-[#ff3366]/90 disabled:bg-[#ff3366]/30 disabled:text-white/50'
          }`}
        >
          {swapping ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('swapping')}
            </>
          ) : (
            `${direction === 'buy' ? t('buy') : t('sell')} ${tokenSymbol}`
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs text-danger bg-danger/10 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="text-xs text-safe bg-safe/10 rounded-lg p-2">
          {t('swapSuccessful')}{' '}
          <a
            href={`https://solscan.io/tx/${success}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {t('viewTransaction')}
          </a>
        </div>
      )}
    </div>
  );
}
