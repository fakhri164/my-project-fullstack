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
  ChevronDown,
} from "lucide-react";

function App() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [toast, setToast] = useState(null);

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
  });

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:3000/tickets");

      if (!response.ok) {
        throw new Error("Gagal mengambil data ticket");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Gagal mengambil ticket:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const saveEditTicket = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      `http://localhost:3000/tickets/${editTicket.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTicket.title,
          description: editTicket.description,
          status: editTicket.status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gagal mengubah ticket");
    }

    const updatedTicket = await response.json();

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );

    setSelectedTicket(updatedTicket);
    setEditTicket(null);
    showToast("Ticket berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal mengubah ticket:", error);
    showToast("Ticket gagal diubah.");
  }
  };

  const openEditTicket = (ticket) => {
    setEditTicket({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
    });
  };

  const updateTicketStatus = async (id, status) => {
  try {
    const response = await fetch(`http://localhost:3000/tickets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Gagal mengubah status ticket");
    }

    const updatedTicket = await response.json();

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? updatedTicket : ticket
      )
    );

    setSelectedTicket(updatedTicket);
    showToast("Status ticket berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal mengubah status:", error);
    showToast("Status ticket gagal diubah.");
  }
};

  const deleteTicket = async (id) => {
    const yakin = window.confirm("Yakin mau menghapus ticket ini?");

    if (!yakin) return;

    try {
      const response = await fetch(`http://localhost:3000/tickets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus ticket");
      }

      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      setSelectedTicket(null);
      showToast("Ticket berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus ticket:", error);
      showToast("Ticket gagal dihapus.");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      showToast("Judul dan deskripsi wajib diisi.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat ticket");
      }

      const data = await response.json();

      setTickets((prev) => [...prev, data]);
      setNewTicket({
        title: "",
        description: "",
      });
      setShowNewTicket(false);
      showToast("Ticket berhasil dibuat!");
    } catch (error) {
      console.error("Gagal membuat ticket:", error);
      showToast("Ticket gagal dibuat.");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        ticket.title?.toLowerCase().includes(keyword) ||
        ticket.description?.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "all" || ticket.status?.toLowerCase() === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status?.toLowerCase() === "open"
  ).length;

  const progressTickets = tickets.filter(
    (ticket) => ticket.status?.toLowerCase() === "in progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status?.toLowerCase() === "resolved"
  ).length;

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-red-50 text-red-600 border-red-100";

      case "in progress":
        return "bg-amber-50 text-amber-600 border-amber-100";

      case "resolved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Ticket size={21} />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Ticket Tracker
                </h1>

                <p className="text-xs text-slate-500">
                  IT Support Management System
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            New Ticket
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE */}
        <div className="mb-7">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage IT support requests.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={totalTickets}
            icon={<Ticket size={19} />}
          />

          <StatCard
            title="Open"
            value={openTickets}
            icon={<AlertCircle size={19} />}
            iconClass="text-red-500 bg-red-50"
          />

          <StatCard
            title="In Progress"
            value={progressTickets}
            icon={<Clock3 size={19} />}
            iconClass="text-amber-500 bg-amber-50"
          />

          <StatCard
            title="Resolved"
            value={resolvedTickets}
            icon={<CheckCircle2 size={19} />}
            iconClass="text-emerald-500 bg-emerald-50"
          />
        </div>

        {/* TICKET SECTION */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Recent Tickets
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Daftar laporan masalah IT.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:w-64"
                  />
                </div>

                {/* FILTER */}
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TICKETS */}
          <div>
            {filteredTickets.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Ticket size={22} className="text-slate-400" />
                </div>

                <p className="font-medium text-slate-700">
                  Tidak ada ticket
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="group cursor-pointer border-b border-slate-100 px-6 py-5 transition last:border-b-0 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {ticket.title}
                        </h4>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyle(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm text-slate-500">
                        {ticket.description}
                      </p>

                      <p className="mt-3 text-xs font-medium text-slate-400">
                        Ticket #{ticket.id}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTicket(ticket.id);
                      }}
                      className="flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* DETAIL MODAL */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Ticket #{selectedTicket.id}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Ticket Detail
                </h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Title
                </p>

                <p className="font-semibold text-slate-900">
                  {selectedTicket.title}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </p>

                <p className="text-sm leading-6 text-slate-600">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    updateTicketStatus(selectedTicket.id, e.target.value)
                  }
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold outline-none ${statusStyle(
                    selectedTicket.status
                  )}`}
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => openEditTicket(selectedTicket)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Edit Ticket
              </button>

              <button
                onClick={() => deleteTicket(selectedTicket.id)}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                <Trash2 size={16} />
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TICKET MODAL */}
      {editTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setEditTicket(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Ticket #{editTicket.id}
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Edit Ticket
                </h3>
              </div>

              <button
                onClick={() => setEditTicket(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveEditTicket}
              className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Judul
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Deskripsi
                </label>

                <textarea
                  rows="4"
                  value={editTicket.description}
                  onChange={(e) =>
                    setEditTicket({
                      ...editTicket,
                      description: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTicket(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showNewTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setShowNewTicket(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Create New Ticket
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Buat laporan masalah IT baru.
                </p>
              </div>

              <button
                onClick={() => setShowNewTicket(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createTicket} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Judul
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
                  placeholder="Contoh: Printer tidak mencetak"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Deskripsi
                </label>

                <textarea
                  rows="4"
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      description: e.target.value,
                    })
                  }
                  placeholder="Jelaskan masalah yang terjadi..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus size={17} />
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass = "bg-slate-100 text-slate-700",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default App;