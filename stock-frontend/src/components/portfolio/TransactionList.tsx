import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteTransaction } from '@/hooks/usePortfolio';
import { useT } from '@/contexts/I18nContext';
import { fmtMoney, fmtPrice } from '@/lib/portfolio';
import { TransactionModal } from './TransactionModal';
import type { Transaction } from '@/lib/supabase';
import { txTypeColor, COLOR_NONE, COLOR_BORDER, COLOR_BG_CARD } from '@/lib/colors';

interface Props {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: Props) {
  const { t } = useT();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const deleteTx = useDeleteTransaction();

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return <p className="text-sm text-text-secondary text-center py-4">{t('tx_list_empty')}</p>;
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLOR_BORDER, backgroundColor: COLOR_BG_CARD }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-xs font-medium uppercase tracking-wider" style={{ borderColor: COLOR_BORDER, color: COLOR_NONE }}>
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
                  style={{ borderColor: COLOR_BORDER }}
                >
                  <td className="px-4 py-2.5 text-text-secondary">
                    {`${tx.date.slice(8, 10)}/${tx.date.slice(5, 7)}/${tx.date.slice(0, 4)}`}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-white">{tx.symbol}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: txTypeColor(tx.type) + '20',
                        color: txTypeColor(tx.type),
                      }}
                    >
                      {tx.type === 'buy' ? t('tx_type_buy') : t('tx_type_sell')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">{tx.quantity.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-white">{fmtPrice(tx.price)}</td>
                  <td className="px-4 py-2.5 text-right text-text-secondary">
                    {tx.fee > 0 ? fmtPrice(tx.fee) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-white">
                    {fmtMoney(tx.quantity * tx.price)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-secondary max-w-[120px] truncate">
                    {tx.note ?? '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditing(tx)}
                        className="p-1.5 rounded hover:bg-bg-hover text-text-secondary hover:text-white"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('tx_delete_confirm'))) deleteTx.mutate(tx.id);
                        }}
                        className="p-1.5 rounded hover:bg-bg-hover text-text-secondary hover:text-red-stock"
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
