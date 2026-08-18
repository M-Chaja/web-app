import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MChajaLogo } from "../components/ui/MChajaLogo";
import { MINIMUM_DEPOSIT_TZS } from "../lib/billing";
import { formatTime, isToday } from "../lib/format";
import { MockApi, useTransactions, useWalletBalance } from "../lib/mockApi";
import type { WalletTransaction, WalletTransactionType } from "../lib/models";
import { useT } from "../lib/i18n";

const TOP_UP_AMOUNT_TZS = 5000;
const WITHDRAW_AMOUNT_TZS = 5000;
const TODAY_LIST_LIMIT = 5;

const TRANSACTION_ICON: Record<WalletTransactionType, "up" | "down" | "bolt"> = {
  top_up: "up",
  withdrawal: "down",
  rental_charge: "bolt",
};

/**
 * Ported from WalletView.swift / WalletScreen.kt — see spec §5/§7 rule 2. Only
 * the today's-transactions list scrolls; the title, balance card, and
 * "Transactions" header stay fixed above it, matching native exactly (unlike
 * the full Transaction History screen, which scrolls as one page — see that
 * screen's own comment for why it's different).
 */
export function WalletScreen() {
  const t = useT();
  const navigate = useNavigate();
  const balanceTzs = useWalletBalance();
  const transactions = useTransactions();
  const [busyAction, setBusyAction] = useState<"top_up" | "withdraw" | null>(null);

  const canRent = balanceTzs >= MINIMUM_DEPOSIT_TZS;
  const todaysTransactions = useMemo(
    () => transactions.filter((tx) => isToday(tx.createdAt)).slice(0, TODAY_LIST_LIMIT),
    [transactions],
  );

  async function handleTopUp() {
    setBusyAction("top_up");
    await MockApi.topUp(TOP_UP_AMOUNT_TZS);
    setBusyAction(null);
  }

  async function handleWithdraw() {
    if (balanceTzs <= 0) return;
    setBusyAction("withdraw");
    await MockApi.withdraw(Math.min(balanceTzs, WITHDRAW_AMOUNT_TZS));
    setBusyAction(null);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="px-5 pt-8">
        <h1 className="pb-6 text-[30px] font-bold text-text-primary">{t("wallet.title")}</h1>

        <div className="flex flex-col gap-2 rounded-3xl p-[22px]" style={{ backgroundColor: "var(--color-brand-red)" }}>
          <div className="flex items-start justify-between">
            <p className="text-[15px] font-medium text-white/90">{t("wallet.availableBalance")}</p>
            <div className="flex flex-col items-end gap-0.5">
              <MChajaLogo variant="white" height={22} />
              <p className="text-[10px] font-bold tracking-widest text-white/85">WALLET</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1.5">
            <span className="text-xl font-bold text-white">TZS</span>
            <span className="text-[44px] font-black leading-none text-white">{balanceTzs.toLocaleString()}</span>
          </div>

          {!canRent && (
            <p className="pt-1 text-sm text-white">{t("wallet.minimumDepositNotice", { amount: MINIMUM_DEPOSIT_TZS.toLocaleString() })}</p>
          )}

          <div className="flex gap-2.5 pt-4">
            <WalletActionButton icon="up" label={t("wallet.topUp")} disabled={busyAction !== null} onClick={handleTopUp} />
            <WalletActionButton icon="down" label={t("wallet.withdraw")} disabled={busyAction !== null} onClick={handleWithdraw} />
            <WalletActionButton icon="bolt" label={t("points.chajaPointsLabel")} disabled={busyAction !== null} onClick={() => {}} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <h2 className="text-[19px] font-bold text-text-primary">{t("wallet.transactions")}</h2>
          <button type="button" onClick={() => navigate("/wallet/history")} className="text-sm font-medium text-text-secondary">
            {t("wallet.viewAll")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3">
        {todaysTransactions.length === 0 ? (
          <p className="py-2 text-text-secondary">{t("wallet.noTransactionsToday")}</p>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="pb-1 text-[13px] text-text-secondary">{t("wallet.today")}</p>
            <div className="flex flex-col gap-2.5">
              {todaysTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface WalletActionButtonProps {
  icon: "up" | "down" | "bolt";
  label: string;
  disabled: boolean;
  onClick: () => void;
}

function WalletActionButton({ icon, label, disabled, onClick }: WalletActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 font-bold disabled:opacity-60"
      style={{ backgroundColor: "var(--color-brand-yellow)", color: "var(--color-brand-red)" }}
    >
      <TransactionIcon kind={icon} size={16} />
      <span className="text-[13px]">{label}</span>
    </button>
  );
}

export function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isPositive = transaction.amountTzs >= 0;
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-card p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center" style={{ color: "var(--color-brand-red)" }}>
        <TransactionIcon kind={TRANSACTION_ICON[transaction.type]} size={20} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[15px] font-medium text-text-primary">{transaction.description}</p>
        <p className="text-xs text-text-secondary">Vodacom M-Pesa</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <p className="text-[15px] font-bold" style={{ color: isPositive ? "var(--color-success)" : "var(--color-brand-red)" }}>
          {isPositive ? "+" : ""}
          {transaction.amountTzs.toLocaleString()}
        </p>
        <p className="text-[11px] text-text-secondary">{formatTime(transaction.createdAt)}</p>
      </div>
    </div>
  );
}

function TransactionIcon({ kind, size }: { kind: "up" | "down" | "bolt"; size: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true as const };
  if (kind === "up") {
    return (
      <svg {...props}>
        <path d="M12 4l6 6h-4v9h-4v-9H6l6-6Z" />
      </svg>
    );
  }
  if (kind === "down") {
    return (
      <svg {...props}>
        <path d="M12 20l-6-6h4V5h4v9h4l-6 6Z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M13 2 3 14h6l-1 8 11-13h-6l1-7Z" />
    </svg>
  );
}
