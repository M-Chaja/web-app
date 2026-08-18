import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { TransactionRow } from "./WalletScreen";
import { dayKey, isToday, isYesterday } from "../lib/format";
import { useTransactions } from "../lib/mockApi";
import type { WalletTransaction } from "../lib/models";
import { useT } from "../lib/i18n";

interface TransactionGroup {
  key: number;
  label: string;
  items: WalletTransaction[];
}

/**
 * Ported from TransactionHistoryView.swift / TransactionHistoryScreen.kt —
 * see spec §5. Unlike Wallet, native scrolls this whole screen as one page
 * (back button and title included) rather than pinning a header — spec §7
 * rule 2 only names Wallet and Rental History for scroll isolation, and this
 * screen's own native source confirms it isn't one of them.
 */
export function TransactionHistoryScreen() {
  const t = useT();
  const navigate = useNavigate();
  const transactions = useTransactions();

  const groups = useMemo<TransactionGroup[]>(() => {
    const byDay = new Map<number, WalletTransaction[]>();
    for (const tx of transactions) {
      const key = dayKey(tx.createdAt);
      const existing = byDay.get(key);
      if (existing) existing.push(tx);
      else byDay.set(key, [tx]);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => b - a)
      .map(([key, items]) => {
        const label = isToday(items[0].createdAt) ? t("wallet.today") : isYesterday(items[0].createdAt) ? t("wallet.yesterday") : new Date(items[0].createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
        return {
          key,
          label,
          items: [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        };
      });
  }, [transactions, t]);

  return (
    <div className="flex h-full min-h-dvh flex-col overflow-y-auto bg-background px-5 pb-24 pt-4">
      <BackButton onClick={() => navigate(-1)} />
      <h1 className="pb-4 pt-3 text-[26px] font-bold text-text-primary">{t("wallet.history")}</h1>

      {transactions.length === 0 ? (
        <p className="text-text-secondary">{t("wallet.noTransactionsYet")}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2.5">
              <p className="text-[13px] font-semibold text-text-secondary">{group.label}</p>
              <div className="flex flex-col gap-2.5">
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
