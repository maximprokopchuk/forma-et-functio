"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { setUserRole } from "./actions";

type Row = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  preferredTrack: string | null;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
};

/**
 * Users table — editorial: hairlines, small-caps header, no zebra stripes.
 * Each row has a single role-flip action; demoting self is disabled
 * client-side (and re-checked in the server action).
 */
export function UsersTable({
  rows,
  currentAdminId,
}: {
  rows: Row[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState(rows);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleToggle(user: Row) {
    const nextRole: "USER" | "ADMIN" = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (user.id === currentAdminId && nextRole === "USER") {
      toast.error("Нельзя снять с себя роль ADMIN.");
      return;
    }
    setPendingId(user.id);
    try {
      await setUserRole(user.id, nextRole);
      startTransition(() => {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
        );
      });
      toast.success(
        nextRole === "ADMIN" ? "Пользователь повышен до ADMIN." : "Роль ADMIN снята.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось обновить роль.");
    } finally {
      setPendingId(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="py-16 text-center text-body-s text-ink-muted">
        Пользователей пока нет.
      </p>
    );
  }

  return (
    <div className="relative w-full overflow-x-auto border-t border-rule">
      <table className="w-full border-collapse text-body-s">
        <thead>
          <tr className="border-b border-rule">
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Имя</th>
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Email</th>
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Роль</th>
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Трек</th>
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Серия</th>
            <th className="py-3 pr-4 text-left text-caption text-ink-muted">Регистрация</th>
            <th className="py-3 pl-4 text-right text-caption text-ink-muted">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentAdminId;
            const isAdmin = user.role === "ADMIN";
            const disableDemoteSelf = isSelf && isAdmin;
            const isPending = pendingId === user.id;
            return (
              <tr key={user.id} className="border-b border-rule align-middle">
                <td className="py-3 pr-4 text-ink">{user.name ?? "—"}</td>
                <td className="max-w-[160px] truncate py-3 pr-4 text-ink-muted sm:max-w-none">
                  {user.email}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      isAdmin
                        ? "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-cinnabar/10 text-cinnabar"
                        : "inline-flex items-center px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-paper-hover text-ink-muted"
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 pr-4 text-ink-muted">
                  {user.preferredTrack ? user.preferredTrack.toLowerCase() : "—"}
                </td>
                <td
                  className="py-3 pr-4 text-ink-muted"
                  title={`Длиннейшая серия: ${user.longestStreak}`}
                >
                  {user.currentStreak}
                </td>
                <td className="py-3 pr-4 text-ink-muted">
                  {new Date(user.createdAt).toLocaleDateString("ru")}
                </td>
                <td className="py-3 pl-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleToggle(user)}
                    disabled={disableDemoteSelf || isPending}
                    title={
                      disableDemoteSelf
                        ? "Нельзя снять с себя роль ADMIN"
                        : isAdmin
                          ? "Убрать админа"
                          : "Сделать админом"
                    }
                    className="motion-micro inline-flex items-center gap-1.5 border border-rule bg-paper px-2 py-1 text-caption text-ink hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-rule disabled:hover:text-ink"
                  >
                    {isAdmin ? (
                      <>
                        <ShieldOff className="h-3 w-3" /> Снять админа
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3" /> Сделать админом
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
