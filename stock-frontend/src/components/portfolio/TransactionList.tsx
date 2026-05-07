import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteTransaction } from '../../hooks/usePortfolio';
import { useT } from '../../contexts/I18nContext';
import { fmtMoney, fmtPrice } from '../../lib/portfolio';
import { TransactionModal } from './TransactionModal';
import type { Transaction } from '../../lib/supabase';

interface Props {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: Props) {
  const { t } = useT();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const deleteTx = useDeleteTransaction();

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return <p className="text-sm text-[#858ca2] text-center py-4">{t('tx_list_empty')}</p>;
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#2a2b2e', backgroundColor: '#1a1b1e' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-xs font-medium uppercase tracking-wider" style={{ borderColor: '#2a2b2e', color: '#858ca2' }}>
                <th className="px-4 py-3">{t('tx_list_col_date')}</th>
                <th className="px-4 py-3">{t('tx_list_col_symbol')}</th>
                <th className="px-4 py-3">{t('tx_list_col_type')}</th>
                <th className="px-4 py-3 text-right">{t('tx_list_col_qty')}</th>
                <th className="px-4 py-3 text-right">{t('tx_list_col_price')}</th>
                <th className="px-4 py-3 text-right">{t('tx_list_col_fee')}</th>
                <th className="px-4 py-3 text-right">{t('tx_list_col_value')}</th>
                <th className="px-4 py-3 text-right">{t('tx_list_col_note')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b text-sm"
                  style={{ borderColor: '#2a2b2e' }}
                >
                  <td className="px-4 py-2.5 text-[#858ca2]">
                    {`${tx.date.slice(8, 10)}/${tx.date.slice(5, 7)}/${tx.date.slice(0, 4)}`}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-white">{tx.symbol}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: tx.type === 'buy' ? '#16c78420' : '#ea394320',
                        color: tx.type === 'buy' ? '#16c784' : '#ea3943',
                      }}
                    >
                      {tx.type === 'buy' ? t('tx_type_buy') : t('tx_type_sell')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">{tx.quantity.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-white">{fmtPrice(tx.price)}</td>
                  <td className="px-4 py-2.5 text-right text-[#858ca2]">
                    {tx.fee > 0 ? fmtMoney(tx.fee) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">
                    {fmtMoney(tx.quantity * tx.price)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-[#858ca2] max-w-[120px] truncate">
                    {tx.note ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditing(tx)}
                        className="p-1.5 rounded hover:bg-[#22232a] text-[#858ca2] hover:text-white"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('tx_delete_confirm'))) deleteTx.mutate(tx.id);
                        }}
                        className="p-1.5 rounded hover:bg-[#22232a] text-[#858ca2] hover:text-[#ea3943]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <TransactionModal
          editing={editing}
          transactions={transactions}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
