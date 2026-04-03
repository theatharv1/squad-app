import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { toast } from "sonner";
import type { AdminStats, Report } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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

  return (
    <MobileFrame>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background pb-8">
        {/* Glass Header */}
        <div className="sticky top-0 z-30 glass-strong px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}><ArrowLeft size={20} /></motion.button>
            <h1 className="font-heading text-lg font-bold">Admin Dashboard</h1>
            <span className="ml-auto text-xs gradient-primary-subtle text-primary px-2.5 py-0.5 rounded-full font-semibold">{user?.role}</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-3" />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 px-4 mt-4">
          {["stats", "users", "reports"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pill flex-1 py-2 text-sm font-medium capitalize ${tab === t ? "pill-active" : "pill-inactive"}`}
            >{t}</button>
          ))}
        </div>

        <div className="px-4 mt-4">
          {/* Stats Tab */}
          {tab === "stats" && stats && (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users },
                { label: "Total Pools", value: stats.totalPools, icon: BarChart3 },
                { label: "Active Pools", value: stats.activePools, icon: BarChart3 },
                { label: "Pending Reports", value: stats.pendingReports, icon: Shield },
                { label: "Messages", value: stats.totalMessages, icon: BarChart3 },
              ].map(s => (
                <motion.div key={s.label} variants={item} className="card-premium p-4">
                  <s.icon size={16} className="text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                className="input-premium w-full" placeholder="Search users..." />
              {usersData?.users?.map((u: any) => (
                <motion.div key={u.id} variants={item} className="card-premium p-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatarUrl || ""} className="w-10 h-10 rounded-full avatar-ring" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username} · {u.city}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "gradient-primary-subtle text-primary" : u.role === "moderator" ? "bg-blue-500/20 text-blue-400" : "bg-secondary text-muted-foreground"}`}>{u.role}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
                  <div className="flex gap-2">
                    <select value={u.role} onChange={e => updateRole.mutate({ id: u.id, role: e.target.value })}
                      className="input-premium rounded-lg px-2 py-1 text-xs">
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => toggleBan.mutate({ id: u.id, banned: !u.isBanned })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${u.isBanned ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Reports Tab */}
          {tab === "reports" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {reports.length > 0 ? reports.map((r: any) => (
                <motion.div key={r.id} variants={item} className="card-premium p-3">
                  <p className="text-sm">{r.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent my-2" />
                  <div className="flex gap-2">
                    <button onClick={() => resolveReport.mutate({ id: r.id, status: "resolved" })}
                      className="btn-primary px-3 py-1 rounded-lg text-xs">Resolve</button>
                    <button onClick={() => resolveReport.mutate({ id: r.id, status: "dismissed" })}
                      className="btn-secondary px-3 py-1 rounded-lg text-xs">Dismiss</button>
                  </div>
                </motion.div>
              )) : <p className="text-muted-foreground text-center py-8 text-sm">No pending reports</p>}
            </motion.div>
          )}
        </div>
      </motion.div>
    </MobileFrame>
  );
};

export default AdminDashboard;
