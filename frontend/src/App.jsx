
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Ticket,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  LogOut,
  Pencil,
  RefreshCw,
  User,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Ban,
  LayoutDashboard,
  Mail,
} from "lucide-react";

import ThemeToggle from "./components/UI/ThemeToggle";
import LoginForm from "./components/auth/LoginForm";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isAdmin = currentUser?.role === "admin";

  // =========================
  // PAGE NAVIGATION
  // =========================

  const [activePage, setActivePage] = useState("dashboard");

  // =========================
  // TICKET STATE
  // =========================

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
  });

  // =========================
  // USER MANAGEMENT STATE
  // =========================

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const [updatingUserId, setUpdatingUserId] = useState(null);

  // =========================
  // NOTIFICATION
  // =========================

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setCurrentUser(null);
    setTickets([]);
    setUsers([]);
    setSelectedTicket(null);
    setActivePage("dashboard");
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (credentials) => {
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Login gagal"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setCurrentUser(data.user);
      setActivePage("dashboard");

      showToast("Login berhasil!");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================
  // FETCH TICKETS
  // =========================

  const fetchTickets = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Gagal mengambil data ticket");
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser) {
      fetchTickets();
    }
  }, [token]);

  // =========================
  // CREATE TICKET
  // =========================

  const createTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.title.trim()) {
      showToast("Judul ticket wajib diisi", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat ticket");
      }

      setNewTicket({
        title: "",
        description: "",
      });

      setShowNewTicket(false);

      await fetchTickets();
      showToast("Ticket berhasil dibuat!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // =========================
  // UPDATE TICKET
  // =========================

  const saveEditTicket = async (e) => {
    e.preventDefault();

    if (!editTicket.title.trim()) {
      showToast("Judul ticket wajib diisi", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tickets/${editTicket.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTicket.title,
            description: editTicket.description,
            status: editTicket.status,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah ticket");
      }

      setEditTicket(null);
      setSelectedTicket(null);

      await fetchTickets();
      showToast("Ticket berhasil diperbarui!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // =========================
  // UPDATE TICKET STATUS
  // =========================

  const updateTicketStatus = async (ticket, status) => {
    try {
      const response = await fetch(
        `${API_URL}/tickets/${ticket.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: ticket.title,
            description: ticket.description || "",
            status,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah status");
      }

      setSelectedTicket({
        ...ticket,
        status,
      });

      await fetchTickets();
      showToast("Status ticket berhasil diperbarui!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // =========================
  // DELETE TICKET
  // =========================

  const deleteTicket = async (id) => {
    if (!isAdmin) {
      showToast(
        "Hanya admin yang bisa menghapus ticket",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Yakin ingin menghapus ticket ini?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus ticket");
      }

      setSelectedTicket(null);

      await fetchTickets();
      showToast("Ticket berhasil dihapus!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {
    if (!token || !isAdmin) return;

    setUsersLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Gagal mengambil data pengguna"
        );
      }

      // Mendukung response berbentuk array atau object { users: [] }
      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setUsers(userList);
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser && isAdmin && activePage === "users") {
      fetchUsers();
    }
  }, [token, activePage, isAdmin]);

  // =========================
  // UPDATE USER STATUS
  // =========================

  const updateUserStatus = async (user, newStatus) => {
    if (!isAdmin) return;

    const actionLabels = {
      active: "mengaktifkan",
      rejected: "menolak",
      disabled: "menonaktifkan",
    };

    const confirmed = window.confirm(
      `Yakin ingin ${actionLabels[newStatus]} akun ${user.username}?`
    );

    if (!confirmed) return;

    setUpdatingUserId(user.id);

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            account_status: newStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Gagal memperbarui status akun"
        );
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? { ...item, account_status: newStatus }
            : item
        )
      );

      const successMessages = {
        active: "Akun berhasil diaktifkan",
        rejected: "Pendaftaran berhasil ditolak",
        disabled: "Akun berhasil dinonaktifkan",
      };

      showToast(successMessages[newStatus]);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // =========================
  // SEARCH & FILTER TICKETS
  // =========================

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        ticket.title?.toLowerCase().includes(keyword) ||
        ticket.description?.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" || ticket.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  // =========================
  // SEARCH & FILTER USERS
  // =========================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = userSearch.toLowerCase();

      const matchesSearch =
        user.full_name?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword);

      const matchesFilter =
        userFilter === "all" ||
        user.account_status === userFilter;

      return matchesSearch && matchesFilter;
    });
  }, [users, userSearch, userFilter]);

  // =========================
  // TICKET STATISTICS
  // =========================

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const progressTickets = tickets.filter(
    (ticket) => ticket.status === "in progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;

  // =========================
  // USER STATISTICS
  // =========================

  const totalUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  const pendingUsers = users.filter(
    (user) => user.account_status === "pending"
  ).length;

  const activeUsers = users.filter(
    (user) => user.account_status === "active" && user.role === "user"
  ).length;

  const inactiveUsers = users.filter(
    (user) =>
      user.account_status === "disabled" ||
      user.account_status === "rejected"
  ).length;

  // =========================
  // LOGIN PAGE
  // =========================

  if (!token || !currentUser) {
    return (
      <LoginForm
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  // =========================
  // MAIN DASHBOARD
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">

      {/* HEADER */}

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Ticket className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Ticket Tracker
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                IT Support Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {currentUser.username}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                {isAdmin ? (
                  <ShieldCheck size={12} />
                ) : (
                  <User size={12} />
                )}
                {currentUser.role}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 hover:border-red-200 px-3 py-2 rounded-xl text-sm transition"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* NAVIGATION */}

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setActivePage("dashboard")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activePage === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300"
            }`}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          {isAdmin && (
            <button
              onClick={() => setActivePage("users")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                activePage === "users"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-300"
              }`}
            >
              <Users size={17} />
              User Management

              {pendingUsers > 0 && (
                <span className={`min-w-5 h-5 px-1 rounded-full text-xs flex items-center justify-center ${
                  activePage === "users"
                    ? "bg-white text-blue-600"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                }`}>
                  {pendingUsers}
                </span>
              )}
            </button>
          )}
        </div>

        {/* =========================
            DASHBOARD PAGE
        ========================= */}

        {activePage === "dashboard" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dashboard
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola dan pantau semua laporan IT support.
                </p>
              </div>

              <button
                onClick={() => setShowNewTicket(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition"
              >
                <Plus size={18} />
                New Ticket
              </button>
            </div>

            {/* TICKET STATISTICS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Total Tickets"
                value={totalTickets}
                icon={<Ticket size={22} />}
                color="blue"
              />

              <StatCard
                title="Open Tickets"
                value={openTickets}
                icon={<AlertCircle size={22} />}
                color="orange"
              />

              <StatCard
                title="In Progress"
                value={progressTickets}
                icon={<Clock3 size={22} />}
                color="purple"
              />

              <StatCard
                title="Resolved"
                value={resolvedTickets}
                icon={<CheckCircle2 size={22} />}
                color="green"
              />
            </div>

            {/* TICKET LIST */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-300">

              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Ticket List
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Daftar seluruh laporan yang masuk.
                    </p>
                  </div>

                  <button
                    onClick={fetchTickets}
                    className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 transition"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mt-5">

                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari ticket..."
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* TICKET TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Ticket</th>
                      <th className="px-6 py-4 font-semibold">Description</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-slate-400">
                          Loading tickets...
                        </td>
                      </tr>
                    ) : filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Ticket
                            size={36}
                            className="mx-auto text-slate-300 mb-3"
                          />

                          <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Tidak ada ticket ditemukan
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            Coba ubah pencarian atau tambahkan ticket baru.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {ticket.title}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              ID #{ticket.id}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                            <p className="truncate">
                              {ticket.description || "-"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge status={ticket.status} />
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {ticket.created_at
                              ? new Date(
                                  ticket.created_at.replace(" ", "T") + "Z"
                                ).toLocaleDateString("id-ID")
                              : "-"}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">

                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-2 rounded-lg text-sm font-medium transition"
                              >
                                Detail
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={() => deleteTicket(ticket.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                                  title="Hapus ticket"
                                >
                                  <Trash2 size={17} />
                                </button>
                              )}

                            </div>
                          </td>
                        </tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-400">
                Menampilkan {filteredTickets.length} dari {tickets.length} ticket
              </div>
            </div>
          </>
        )}

        {/* =========================
            USER MANAGEMENT PAGE
        ========================= */}

        {activePage === "users" && isAdmin && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  User Management
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola akun pengguna dan persetujuan pendaftaran.
                </p>
              </div>

              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 text-slate-600 dark:text-slate-300 px-4 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={usersLoading ? "animate-spin" : ""}
                />
                Refresh Users
              </button>
            </div>

            {/* USER STATISTICS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard
                title="Total Users"
                value={totalUsers}
                icon={<Users size={22} />}
                color="blue"
              />

              <StatCard
                title="Pending Approval"
                value={pendingUsers}
                icon={<Clock3 size={22} />}
                color="orange"
              />

              <StatCard
                title="Active Users"
                value={activeUsers}
                icon={<UserCheck size={22} />}
                color="green"
              />

              <StatCard
                title="Inactive Users"
                value={inactiveUsers}
                icon={<UserX size={22} />}
                color="purple"
              />
            </div>

            {/* USER TABLE */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors duration-300">

              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Registered Users
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Daftar akun yang terdaftar di sistem.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mt-5">

                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Cari nama, username, atau email..."
                      className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {usersLoading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-slate-400">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <Users
                            size={36}
                            className="mx-auto text-slate-300 mb-3"
                          />

                          <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Tidak ada pengguna ditemukan
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            Coba ubah pencarian atau filter status.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                                {(user.full_name || user.username || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {user.full_name || "Belum diisi"}
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <Mail size={14} />
                              {user.email || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {user.role === "admin" ? (
                                <ShieldCheck size={13} />
                              ) : (
                                <User size={13} />
                              )}
                              {user.role}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <UserStatusBadge status={user.account_status} />
                          </td>

                          <td className="px-6 py-4">
                            {user.role === "admin" ? (
                              <span className="text-xs text-slate-400">
                                Protected
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">

                                {user.account_status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateUserStatus(user, "active")
                                      }
                                      disabled={updatingUserId === user.id}
                                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                    >
                                      <CheckCircle2 size={14} />
                                      Approve
                                    </button>

                                    <button
                                      onClick={() =>
                                        updateUserStatus(user, "rejected")
                                      }
                                      disabled={updatingUserId === user.id}
                                      className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                                    >
                                      <X size={14} />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {user.account_status === "active" && (
                                  <button
                                    onClick={() =>
                                      updateUserStatus(user, "disabled")
                                    }
                                    disabled={updatingUserId === user.id}
                                    className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/70 text-orange-600 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                                  >
                                    <Ban size={14} />
                                    Disable
                                  </button>
                                )}

                                {(user.account_status === "disabled" ||
                                  user.account_status === "rejected") && (
                                  <button
                                    onClick={() =>
                                      updateUserStatus(user, "active")
                                    }
                                    disabled={updatingUserId === user.id}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                  >
                                    <UserCheck size={14} />
                                    Activate
                                  </button>
                                )}

                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-400">
                Menampilkan {filteredUsers.length} dari {users.length} akun
              </div>
            </div>
          </>
        )}
      </main>

      {/* =========================
          TICKET DETAIL MODAL
      ========================= */}

      {selectedTicket && (
        <Modal onClose={() => setSelectedTicket(null)}>

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-slate-400">
                Ticket #{selectedTicket.id}
              </p>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedTicket.title}
              </h3>
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">

            <div>
              <p className="text-sm text-slate-400 mb-2">
                Description
              </p>

              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {selectedTicket.description || "Tidak ada deskripsi"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">
                Status
              </p>

              <StatusBadge status={selectedTicket.status} />

              <select
                value={selectedTicket.status}
                onChange={(e) =>
                  updateTicketStatus(selectedTicket, e.target.value)
                }
                className="w-full mt-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">

              <button
                onClick={() => {
                  setEditTicket({ ...selectedTicket });
                  setSelectedTicket(null);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition"
              >
                <Pencil size={16} />
                Edit Ticket
              </button>

              {isAdmin && (
                <button
                  onClick={() => deleteTicket(selectedTicket.id)}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 px-4 py-3 rounded-xl font-medium transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}

            </div>
          </div>
        </Modal>
      )}

      {/* =========================
          CREATE TICKET MODAL
      ========================= */}

      {showNewTicket && (
        <Modal onClose={() => setShowNewTicket(false)}>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Create New Ticket
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Buat laporan IT support Terbaru.
              </p>
            </div>

            <button
              onClick={() => setShowNewTicket(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={createTicket} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    title: e.target.value,
                  })
                }
                placeholder="Contoh: Komputer tidak bisa menyala"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Description
              </label>

              <textarea
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    description: e.target.value,
                  })
                }
                placeholder="Jelaskan masalah yang terjadi..."
                rows="4"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Create Ticket
            </button>

          </form>
        </Modal>
      )}

      {/* =========================
          EDIT TICKET MODAL
      ========================= */}

      {editTicket && (
        <Modal onClose={() => setEditTicket(null)}>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Ticket
            </h3>

            <button
              onClick={() => setEditTicket(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={saveEditTicket} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={editTicket.title}
                onChange={(e) =>
                  setEditTicket({
                    ...editTicket,
                    title: e.target.value,
                  })
                }
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Description
              </label>

              <textarea
                value={editTicket.description || ""}
                onChange={(e) =>
                  setEditTicket({
                    ...editTicket,
                    description: e.target.value,
                  })
                }
                rows="4"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Status
              </label>

              <select
                value={editTicket.status}
                onChange={(e) =>
                  setEditTicket({
                    ...editTicket,
                    status: e.target.value,
                  })
                }
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Save Changes
            </button>

          </form>
        </Modal>
      )}

      {/* =========================
          TOAST NOTIFICATION
      ========================= */}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-lg text-white flex items-center gap-3 ${
            toast.type === "error" ? "bg-red-600" : "bg-slate-900"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          <span className="text-sm font-medium">
            {toast.message}
          </span>
        </div>
      )}

    </div>
  );
}

// =========================
// STAT CARD COMPONENT
// =========================

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ${colors[color]}`}>
          {icon}
        </div>

      </div>
    </div>
  );
}

// =========================
// TICKET STATUS BADGE
// =========================

function StatusBadge({ status }) {
  const styles = {
    open: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    "in progress":
      "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    resolved:
      "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
  };

  const labels = {
    open: "Open",
    "in progress": "In Progress",
    resolved: "Resolved",
  };

  return (
    <span
      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// =========================
// USER STATUS BADGE
// =========================

function UserStatusBadge({ status }) {
  const styles = {
    pending:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    active:
      "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
    rejected:
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    disabled:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  const labels = {
    pending: "Pending",
    active: "Active",
    rejected: "Rejected",
    disabled: "Disabled",
  };

  return (
    <span
      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {labels[status] || status || "Unknown"}
    </span>
  );
}

// =========================
// MODAL COMPONENT
// =========================

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-slate-950/50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default App;