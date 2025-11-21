import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router";

interface Evento {
  id: number;
  nome_evento: string;
  data_evento: string;
  contratante_nome: string;
  status_evento: string;
  valor_total_receber: number;
}

type ViewMode = "monthly" | "weekly";

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch("/api/eventos");
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const eventsByDate = useMemo(() => {
    return eventos.reduce<Record<string, Evento[]>>((acc, evento) => {
      const dateKey = new Date(evento.data_evento).toISOString().split("T")[0];
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(evento);
      return acc;
    }, {});
  }, [eventos]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const daysArray = useMemo(() => {
    const days: Array<{ date: Date; label: number; isCurrentMonth: boolean }> = [];
    if (viewMode === "monthly") {
      // previous month fillers
      for (let i = 0; i < startDay; i++) {
        const date = new Date(startOfMonth);
        date.setDate(date.getDate() - (startDay - i));
        days.push({ date, label: date.getDate(), isCurrentMonth: false });
      }
      // current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        days.push({ date, label: day, isCurrentMonth: true });
      }
      // next month fillers
      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(endOfMonth);
        date.setDate(date.getDate() + i);
        days.push({ date, label: date.getDate(), isCurrentMonth: false });
      }
    } else {
      const startOfWeek = new Date(currentDate);
      const weekday = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - weekday);
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push({ date, label: date.getDate(), isCurrentMonth: date.getMonth() === currentDate.getMonth() });
      }
    }
    return days;
  }, [currentDate, daysInMonth, startDay, startOfMonth, endOfMonth, viewMode]);

  const moveMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const moveWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const formattedMonth = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendário</h1>
            <p className="text-slate-500">Visualize eventos no formato mensal ou semanal.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-4 py-2 text-sm font-medium ${viewMode === "monthly" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-4 py-2 text-sm font-medium ${viewMode === "weekly" ? "bg-slate-900 text-white" : "text-slate-600"}`}
              >
                Semanal
              </button>
            </div>
            <Link
              to="/eventos/novo"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30"
            >
              <Calendar className="w-5 h-5" />
              Novo Evento
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (viewMode === "monthly" ? moveMonth(-1) : moveWeek(-1))}
                className="p-2 rounded-lg hover:bg-slate-50 border border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50"
              >
                Hoje
              </button>
              <button
                onClick={() => (viewMode === "monthly" ? moveMonth(1) : moveWeek(1))}
                className="p-2 rounded-lg hover:bg-slate-50 border border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 capitalize">{formattedMonth}</h2>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
              <div key={dia} className="px-4 py-3 text-center">
                {dia}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className={`grid ${viewMode === "weekly" ? "grid-cols-7" : "grid-cols-7"} gap-px bg-slate-100`}>
              {daysArray.map((day) => {
                const key = day.date.toISOString().split("T")[0];
                const dayEvents = eventsByDate[key] || [];
                return (
                  <div
                    key={key}
                    className={`min-h-[130px] bg-white p-3 flex flex-col ${day.isCurrentMonth ? "" : "bg-slate-50 text-slate-400"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${day.isCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>
                        {day.label}
                      </span>
                      {day.date.toDateString() === new Date().toDateString() && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Hoje</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 3).map((evento) => (
                        <Link
                          to={`/eventos/${evento.id}`}
                          key={evento.id}
                          className="block rounded-xl border border-slate-200 px-3 py-2 hover:border-amber-400 transition"
                        >
                          <p className="text-xs font-semibold text-slate-900 truncate">{evento.nome_evento}</p>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {evento.contratante_nome || "Cliente não definido"}
                          </p>
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <Link
                          to={`/eventos?date=${key}`}
                          className="text-[11px] font-medium text-amber-600 hover:text-amber-700"
                        >
                          +{dayEvents.length - 3} eventos
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Eventos por Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {["Planejamento", "Confirmado", "Concluído", "Cancelado"].map((status) => {
                const total = eventos.filter((evento) => evento.status_evento === status).length;
                return (
                  <div key={status} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-500">{status}</p>
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Próximos Eventos</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {eventos
                .filter((evento) => new Date(evento.data_evento) >= new Date())
                .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
                .slice(0, 5)
                .map((evento) => (
                  <Link
                    key={evento.id}
                    to={`/eventos/${evento.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-amber-400 transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{evento.nome_evento}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {evento.contratante_nome || "Cliente não definido"}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-amber-600">
                      {new Date(evento.data_evento).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}



