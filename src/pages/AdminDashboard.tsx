import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, Activity, MessageSquare, AlertTriangle, Search, Check, X, Ban } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";
import type { AdminStats, Report } from "@/types";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState("stats");
  const [userSearch, setUserSearch] = useState("");

  const { data: stats } = useQuery<AdminStats>({ queryKey: ["admin-stats"], queryFn: () => api("/api/admin/stats") });
  const { data: usersData } = useQuery<{ users: any[]; total: number }>({
    queryKey: ["admin-users", userSearch],
    queryFn: () => api(`/api/admin/users?search=${userSearch}`),
  });
  const { data: reports = [] } = useQuery<Report[]>({ queryKey: ["admin-reports"], queryFn: () => api("/api/reports?status=pending") });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated"); },
  });

  const toggleBan = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => api(`/api/admin/users/${id}/ban`, { method: "PUT", body: JSON.stringify({ banned }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Ban status updated"); },
  });

  const resolveReport = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api(`/api/reports/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reports"] }); toast.success("Report resolved"); },
  });

  const statCards = stats ? [
    { label: "Total users", value: stats.totalUsers, icon: Users, color: "text-primary", glow: "hsla(73, 100%, 50%, 0.2)" },
    { label: "Total pools", value: stats.totalPools, icon: Activity, color: "text-cyan-300", glow: "hsla(180, 100%, 60%, 0.2)" },
    { label: "Active pools", value: stats.activePools, icon: Activity, color: "text-magenta-400", glow: "hsla(320, 100%, 60%, 0.2)" },
    { label: "Pending", value: stats.pendingReports, icon: AlertTriangle, color: "text-warning", glow: "hsla(35, 100%, 55%, 0.2)" },
    { label: "Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-foreground", glow: "hsla(0, 0%, 100%, 0.1)" },
  ] : [];

  return (
    <MobileFrame>
      <div className="min-h-screen pb-12">
        {/* Header */}
        <div className="sticky top-0 z-30 glass-strong px-5 pt-5 pb-4">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </motion.button>
            <div className="flex-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">// Control room</div>
              <h1 className="font-display font-bold text-xl mt-0.5">Admin</h1>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full flex items-center gap-1">
              <Shield size={10} strokeWidth={3} />
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mt-5"
        >
          <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
            {[
              { id: "stats", label: "Stats" },
              { id: "users", label: "Users" },
              { id: "reports", label: "Reports" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="px-5 mt-6">
          {/* Stats tab */}
          {tab === "stats" && stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3"
            >
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="card-stage p-4 relative overflow-hidden"
                >
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl"
                    style={{ background: s.glow }}
                  />
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3 ${s.color}`}>
                      <s.icon size={16} strokeWidth={2.5} />
                    </div>
                    <p className={`font-display font-bold text-3xl num ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Users tab */}
          {tab === "users" && (
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="input-stage pl-11"
                  placeholder="Search users..."
                />
              </motion.div>

              {usersData?.users?.map((u: any, i: number) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-stage p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar-ring shrink-0">
                      <div className="w-11 h-11 rounded-full bg-card overflow-hidden">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm">{u.name?.[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm truncate">{u.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">@{u.username} · {u.city}</p>
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      u.role === "admin"
                        ? "bg-primary text-primary-foreground"
                        : u.role === "moderator"
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                        : "bg-white/[0.04] border border-white/10 text-foreground/60"
                    }`}>{u.role}</span>
                  </div>
                  <div className="h-px bg-white/5 my-3" />
                  <div className="flex gap-2">
                    <select
                      value={u.role}
                      onChange={e => updateRole.mutate({ id: u.id, role: e.target.value })}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => toggleBan.mutate({ id: u.id, banned: !u.isBanned })}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                        u.isBanned
                          ? "bg-primary/15 border border-primary/30 text-primary"
                          : "bg-destructive/15 border border-destructive/30 text-destructive"
                      }`}
                    >
                      <Ban size={10} strokeWidth={3} />
                      {u.isBanned ? "Unban" : "Ban"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {(!usersData?.users || usersData.users.length === 0) && (
                <div className="card-stage flex flex-col items-center justify-center py-14">
                  <Users size={22} className="text-muted-foreground mb-3" strokeWidth={2} />
                  <p className="text-[11px] font-mono text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Reports tab */}
          {tab === "reports" && (
            <div className="space-y-3">
              {reports.length > 0 ? (
                reports.map((r: any, i: number) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card-stage p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
                        <AlertTriangle size={15} className="text-warning" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.reason}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                          by {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5 my-3" />
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => resolveReport.mutate({ id: r.id, status: "resolved" })}
                        className="flex-1 px-3 py-2 rounded-full bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5"
                      >
                        <Check size={11} strokeWidth={3} />
                        Resolve
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => resolveReport.mutate({ id: r.id, status: "dismissed" })}
                        className="flex-1 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 text-foreground/70 text-[10px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5"
                      >
                        <X size={11} strokeWidth={3} />
                        Dismiss
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="card-stage flex flex-col items-center justify-center py-14">
                  <Shield size={22} className="text-muted-foreground mb-3" strokeWidth={2} />
                  <p className="font-display font-bold text-sm">All clear</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">No pending reports</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileFrame>
  );
};

export default AdminDashboard;
