import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@getmocha/users-service/react";
import { ToastProvider } from "@/react-app/context/ToastContext";
import HomePage from "@/react-app/pages/Home";
import PlanosPage from "@/react-app/pages/Planos";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import EventosPage from "@/react-app/pages/Eventos";
import NovoEventoPage from "@/react-app/pages/NovoEvento";
import EventoDetalhePage from "@/react-app/pages/EventoDetalhe";
import ContratantesPage from "@/react-app/pages/Contratantes";
import FornecedoresPage from "@/react-app/pages/Fornecedores";
import RecebiveisPage from "@/react-app/pages/Recebiveis";
import PagaveisPage from "@/react-app/pages/Pagaveis";
import ChecklistsPage from "@/react-app/pages/Checklists";
import CalendarioPage from "@/react-app/pages/Calendario";
import ContratanteDetalhePage from "@/react-app/pages/ContratanteDetalhe";
import FornecedorDetalhePage from "@/react-app/pages/FornecedorDetalhe";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
            <Route path="/eventos/novo" element={<ProtectedRoute><NovoEventoPage /></ProtectedRoute>} />
            <Route path="/eventos/:id" element={<ProtectedRoute><EventoDetalhePage /></ProtectedRoute>} />
            <Route path="/contratantes" element={<ProtectedRoute><ContratantesPage /></ProtectedRoute>} />
            <Route path="/contratantes/:id" element={<ProtectedRoute><ContratanteDetalhePage /></ProtectedRoute>} />
            <Route path="/fornecedores" element={<ProtectedRoute><FornecedoresPage /></ProtectedRoute>} />
            <Route path="/fornecedores/:id" element={<ProtectedRoute><FornecedorDetalhePage /></ProtectedRoute>} />
            <Route path="/recebiveis" element={<ProtectedRoute><RecebiveisPage /></ProtectedRoute>} />
            <Route path="/pagaveis" element={<ProtectedRoute><PagaveisPage /></ProtectedRoute>} />
            <Route path="/checklists" element={<ProtectedRoute><ChecklistsPage /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
