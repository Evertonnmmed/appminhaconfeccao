import React, { useState, useEffect } from 'react';
import { apiFetch } from './api';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ClipboardList,
  Settings,
  Factory,
  History,
  Menu,
  X,
  Plus,
  Trash2,
  Settings2,
  Play,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Calendar,
  LogOut,
  Mail,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import {
  DashboardData,
  CompanyInfo,
  UserProfile,
  Supply,
  Product,
  Operation,
  TeamMember,
  ProductionOrder,
  ProductionLog
} from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: { icon: any, label: string, active: boolean, collapsed: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative ${active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
      : 'text-slate-500 hover:bg-slate-100'
      }`}
  >
    <Icon size={20} className="shrink-0" />
    <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
      {label}
    </span>
    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
        {label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
      </div>
    )}
  </button>
);

const Card = ({ children, title, action }: { children: React.ReactNode, title?: string, action?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-rose-100 text-rose-600',
    info: 'bg-indigo-100 text-indigo-600'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// --- Auth Components ---

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <Factory size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FIBRALTEX 4.1</h1>
          <p className="text-slate-500 text-sm">Gerenciamento de Confecção Inteligente</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
    // Close sidebar on mobile by default
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, session]);

  const fetchData = async () => {
    try {
      const [settingsRes, dashboardRes] = await Promise.all([
        apiFetch('/api/settings'),
        apiFetch('/api/dashboard')
      ]);
      const settings = await settingsRes.json();
      const dashboardData = await dashboardRes.json();
      setCompany(settings.company);
      setUser(settings.user);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView dashboard={dashboard} user={user} onUpdate={fetchData} />;
      case 'estoque': return <InventoryView onUpdate={fetchData} />;
      case 'produtos': return <ProductsView onUpdate={fetchData} />;
      case 'equipe': return <TeamView onUpdate={fetchData} />;
      case 'ordens': return <OrdersView onUpdate={fetchData} />;
      case 'relatorios': return <ReportsView />;
      case 'configuracoes': return <SettingsView company={company} user={user} onUpdate={fetchData} />;
      default: return <DashboardView dashboard={dashboard} user={user} onUpdate={fetchData} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-100 transition-all duration-300 flex flex-col h-full
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        <div className="p-5 flex items-center gap-3 h-20 border-b border-slate-50">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            {company?.logo ? (
              <img src={company.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Factory size={22} />
            )}
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'lg:opacity-0 lg:w-0'}`}>
            <h1 className="font-bold text-slate-800 text-base leading-tight">{company?.name || 'Confecção Pro'}</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Gestão Têxtil</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
          <SidebarItem icon={ShoppingCart} label="Estoque" active={activeTab === 'estoque'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('estoque'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
          <SidebarItem icon={Package} label="Produtos" active={activeTab === 'produtos'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('produtos'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
          <SidebarItem icon={Users} label="Equipe" active={activeTab === 'equipe'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('equipe'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
          <SidebarItem icon={ClipboardList} label="Ordens de Produção" active={activeTab === 'ordens'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('ordens'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
          <SidebarItem icon={History} label="Relatórios" active={activeTab === 'relatorios'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('relatorios'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-3 border-t border-slate-50 space-y-1.5">
          <SidebarItem icon={Settings} label="Configurações" active={activeTab === 'configuracoes'} collapsed={!isSidebarOpen} onClick={() => { setActiveTab('configuracoes'); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} />

          <div className={`mt-4 p-3 bg-slate-50 rounded-xl transition-all duration-300 flex items-center gap-3 ${!isSidebarOpen && 'lg:p-1 lg:bg-transparent'}`}>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 overflow-hidden border border-white">
              {user?.photo ? <img src={user.photo} alt="User" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || 'U'}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${!isSidebarOpen && 'lg:w-0 lg:opacity-0'}`}>
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Admin'}</p>
            </div>
          </div>
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
            >
              <LogOut size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
                Sair do Sistema
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 min-w-0 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-bold text-slate-800 lg:hidden truncate max-w-[150px]">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-slate-400">{user?.role || 'Cargo'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-100">
              {user?.photo ? (
                <img src={user.photo} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function DashboardView({ dashboard, user, onUpdate }: { dashboard: DashboardData | null, user: UserProfile | null, onUpdate: () => void }) {
  const [recentLogs, setRecentLogs] = useState<ProductionLog[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Supply[]>([]);
  const [activeOrders, setActiveOrders] = useState<ProductionOrder[]>([]);
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ProductionLog | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const refreshData = () => {
    apiFetch('/api/production-logs').then(res => res.json()).then(data => {
      setRecentLogs(data.slice(-5).reverse());
    });
    apiFetch('/api/supplies').then(res => res.json()).then(data => {
      setLowStockItems(data.filter((s: Supply) => s.quantity <= s.min_stock));
    });
    apiFetch('/api/orders').then(res => res.json()).then(data => {
      setAllOrders(data);
      setActiveOrders(data.slice(-10).reverse());
    });
    apiFetch('/api/products').then(res => res.json()).then(setProducts);
    apiFetch('/api/operations').then(res => res.json()).then(setOperations);
    apiFetch('/api/team').then(res => res.json()).then(setTeam);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Olá, {user?.name || 'Administrador'}! 👋</h2>
        <p className="text-slate-500">Bem-vindo ao painel de controle da sua confecção.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ordens Ativas" value={dashboard?.activeOrders || 0} icon={ClipboardList} color="indigo" />
        <StatCard title="Alertas de Estoque" value={dashboard?.lowStockAlerts || 0} icon={AlertTriangle} color="amber" />
        <StatCard title="Peças Produzidas" value={dashboard?.totalProduced || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Eficiência Média" value={`${dashboard?.efficiency || 0}%`} icon={Factory} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Acompanhamento de Produções">
            <div className="space-y-4">
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    onClick={() => { setEditingOrder(order); setIsOrderModalOpen(true); }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">OP #{order.code || order.id}</h4>
                          <Settings2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-indigo-600 font-medium">{order.product_name}</p>
                      </div>
                      <Badge variant={order.status === 'Finalizado' ? 'success' : order.status === 'Em Produção' ? 'info' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Package size={14} />
                        <span>{order.quantity} peças</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Entrega: {new Date(order.delivery_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: order.status === 'Finalizado' ? '100%' : order.status === 'Em Produção' ? '65%' : '5%'
                        }}
                        className={`h-full ${order.status === 'Finalizado' ? 'bg-emerald-500' : order.status === 'Em Produção' ? 'bg-indigo-500' : 'bg-slate-300'
                          }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 italic">Nenhuma produção em curso no momento.</div>
              )}
            </div>
          </Card>

          <Card title="Totais de Produção por OP">
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 font-semibold text-slate-600">OP</th>
                    <th className="pb-3 font-semibold text-slate-600 text-right">Total Peças</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allOrders.slice().reverse().map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() => { setEditingOrder(order); setIsOrderModalOpen(true); }}
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">#{order.code || order.id}</p>
                          <Settings2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{order.product_name}</p>
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-indigo-600">
                        {order.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Atividades Recentes">
            <div className="space-y-4">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                    onClick={() => { setEditingLog(log); setIsLogModalOpen(true); }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                      {log.status === 'Finalizado' ? <CheckCircle2 size={18} /> : <Play size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">
                          {log.operation_name} {log.status === 'Finalizado' ? 'finalizada' : 'iniciada'} na OP #{log.order_code || log.order_id}
                        </p>
                        <Settings2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-400">
                        Por {log.operator_name} • {log.start_time ? new Date(log.start_time).toLocaleTimeString() : ''}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 italic text-sm">Sem atividades recentes.</div>
              )}
            </div>
          </Card>

          <Card title="Alertas de Insumos">
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-amber-100 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer group"
                    onClick={() => { setEditingSupply(item); setIsSupplyModalOpen(true); }}
                  >
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <Settings2 size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-slate-500">Qtd: {item.quantity} {item.unit} (Mín: {item.min_stock})</p>
                    </div>
                    <Badge variant="warning">Repor</Badge>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 italic text-sm">Estoque em dia.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {isOrderModalOpen && (
        <Modal title="Editar Ordem de Produção" onClose={() => setIsOrderModalOpen(false)}>
          <OrderForm
            order={editingOrder}
            products={products}
            onSuccess={() => { setIsOrderModalOpen(false); refreshData(); onUpdate(); }}
          />
        </Modal>
      )}

      {isSupplyModalOpen && (
        <Modal title="Editar Insumo" onClose={() => setIsSupplyModalOpen(false)}>
          <SupplyForm
            item={editingSupply}
            onSuccess={() => { setIsSupplyModalOpen(false); refreshData(); onUpdate(); }}
          />
        </Modal>
      )}

      {isLogModalOpen && (
        <Modal title="Editar Apontamento" onClose={() => setIsLogModalOpen(false)}>
          <LogForm
            log={editingLog}
            orders={allOrders}
            team={team}
            operations={operations}
            onSuccess={() => { setIsLogModalOpen(false); refreshData(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// --- View Implementations (Simplified for now, will expand) ---

function InventoryView({ onUpdate }: { onUpdate: () => void }) {
  const [items, setItems] = useState<Supply[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supply | null>(null);

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = () => apiFetch('/api/supplies').then(res => res.json()).then(setItems);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
      await apiFetch(`/api/supplies/${id}`, { method: 'DELETE' });
      fetchItems();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Estoque</h2>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Novo Insumo
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600">Insumo</th>
                <th className="pb-4 font-semibold text-slate-600">Quantidade</th>
                <th className="pb-4 font-semibold text-slate-600">Unidade</th>
                <th className="pb-4 font-semibold text-slate-600">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-4 text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-slate-600">{item.unit}</td>
                  <td className="py-4">
                    <Badge variant={item.quantity <= item.min_stock ? 'danger' : 'success'}>
                      {item.quantity <= item.min_stock ? 'Crítico' : 'Normal'}
                    </Badge>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar Insumo"
                    >
                      <Settings2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir Insumo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <Modal
          title={editingItem ? "Editar Insumo" : "Novo Insumo"}
          onClose={() => setIsModalOpen(false)}
        >
          <SupplyForm
            item={editingItem}
            onSuccess={() => { setIsModalOpen(false); fetchItems(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function ProductsView({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = () => apiFetch('/api/products').then(res => res.json()).then(setProducts);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h2>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id}>
            <Card>
              <div className="flex flex-col gap-4">
                <div className="relative group">
                  {product.photo ? (
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-100">
                      <img src={product.photo} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                      <Package size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                      className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm"
                    >
                      <Settings2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 hover:text-rose-600 rounded-lg shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{product.code || 'S/C'}</span>
                    <h3 className="font-bold text-slate-800 text-lg">{product.name}</h3>
                    {product.color && (
                      <div className="flex items-center gap-1 ml-2">
                        <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: product.color }}></div>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">{product.color}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custo Unitário</span>
                  <span className="font-bold text-indigo-600">R$ {product.unit_cost.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          title={editingProduct ? "Editar Produto" : "Novo Produto"}
          onClose={() => setIsModalOpen(false)}
        >
          <ProductForm
            product={editingProduct}
            onSuccess={() => { setIsModalOpen(false); fetchProducts(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function OperationsView({ onUpdate }: { onUpdate: () => void }) {
  const [ops, setOps] = useState<Operation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  useEffect(() => { fetchOps(); }, []);
  const fetchOps = () => apiFetch('/api/operations').then(res => res.json()).then(setOps);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta operação?')) {
      await apiFetch(`/api/operations/${id}`, { method: 'DELETE' });
      fetchOps();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">CADASTRO DE OPs</h2>
        <button
          onClick={() => { setEditingOp(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Nova OP
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600">Número da OP</th>
                <th className="pb-4 font-semibold text-slate-600">Descrição</th>
                <th className="pb-4 font-semibold text-slate-600">Status</th>
                <th className="pb-4 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ops.map(op => (
                <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-mono text-indigo-600 font-medium">{op.code}</td>
                  <td className="py-4 text-slate-800">{op.description}</td>
                  <td className="py-4 text-slate-600">
                    <Badge variant={op.status === 'Finalizado' ? 'success' : op.status === 'Em execução' ? 'info' : 'default'}>
                      {op.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditingOp(op); setIsModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Settings2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(op.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <Modal
          title={editingOp ? "Editar Operação" : "Nova Operação"}
          onClose={() => setIsModalOpen(false)}
        >
          <OperationForm
            op={editingOp}
            onSuccess={() => { setIsModalOpen(false); fetchOps(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function TeamView({ onUpdate }: { onUpdate: () => void }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => { fetchMembers(); }, []);
  const fetchMembers = () => apiFetch('/api/team').then(res => res.json()).then(setMembers);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      await apiFetch(`/api/team/${id}`, { method: 'DELETE' });
      fetchMembers();
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestão da Equipe</h2>
        <button
          onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Novo Colaborador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map(member => (
          <div key={member.id}>
            <Card>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold overflow-hidden border-2 border-slate-50">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
                <h3 className="font-bold text-slate-800">{member.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{member.role}</p>
                <div className="flex gap-2 w-full pt-4 border-t border-slate-50">
                  <button
                    onClick={() => { setEditingMember(member); setIsModalOpen(true); }}
                    className="flex-1 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          title={editingMember ? "Editar Colaborador" : "Novo Colaborador"}
          onClose={() => setIsModalOpen(false)}
        >
          <TeamForm
            member={editingMember}
            onSuccess={() => { setIsModalOpen(false); fetchMembers(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function OrdersView({ onUpdate }: { onUpdate: () => void }) {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    fetchOrders();
    apiFetch('/api/products').then(res => res.json()).then(setProducts);
    apiFetch('/api/operations').then(res => res.json()).then(setOperations);
  }, []);

  const fetchOrders = () => apiFetch('/api/orders').then(res => res.json()).then(setOrders);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta ordem?')) {
      await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
      onUpdate();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'danger'; // Vermelho
      case 'Média': return 'warning'; // Amarelo
      case 'Baixa': return 'success'; // Verde
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Ordens de Produção</h2>
        <button
          onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Nova OP
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {['Planejado', 'Em Produção', 'Finalizado'].map(status => (
          <div key={status} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              {status} <Badge variant="info">{orders.filter(o => o.status === status).length}</Badge>
            </h3>
            <div className="space-y-4">
              {orders.filter(o => o.status === status).map(order => (
                <div key={order.id}>
                  <Card>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        {(() => {
                          const product = products.find(p => p.id === order.product_id);
                          return product?.photo ? (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                              <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm text-slate-300">
                              <Package size={20} />
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="font-bold text-slate-800">OP #{order.code || order.id}</h4>
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{order.product_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Settings2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div>
                        <p className="text-slate-400 uppercase font-semibold mb-1">Quantidade</p>
                        <p className="text-slate-700 font-bold">{order.quantity} peças</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-semibold mb-1">Prioridade</p>
                        <Badge variant={getPriorityColor(order.priority)}>{order.priority}</Badge>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-semibold mb-1">Data de Entrada</p>
                        <p className="text-slate-700">{new Date(order.entry_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase font-semibold mb-1">Previsão de Entrega</p>
                        <p className="text-slate-700 font-bold">{new Date(order.delivery_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {status === 'Finalizado' && (
                        <button
                          onClick={async () => {
                            if (confirm('Reverter OP para Em Produção?')) {
                              await apiFetch(`/api/orders/${order.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Em Produção' })
                              });
                              fetchOrders();
                              onUpdate();
                            }
                          }}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          Reverter para Produção
                        </button>
                      )}

                      {status !== 'Finalizado' && (
                        <div className="grid grid-cols-2 gap-2">
                          {status === 'Em Produção' && (
                            <button
                              onClick={async () => {
                                if (confirm('Reverter OP para Planejado?')) {
                                  await apiFetch(`/api/orders/${order.id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Planejado' })
                                  });
                                  fetchOrders();
                                  onUpdate();
                                }
                              }}
                              className="w-full py-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                              Voltar / Aguardar
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const nextStatus = status === 'Planejado' ? 'Em Produção' : 'Finalizado';
                              await apiFetch(`/api/orders/${order.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: nextStatus })
                              });
                              fetchOrders();
                              onUpdate();
                            }}
                            className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${status === 'Planejado' ? 'col-span-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                              }`}
                          >
                            {status === 'Planejado' ? <Play size={14} /> : <CheckCircle2 size={14} />}
                            {status === 'Planejado' ? 'Iniciar Produção' : 'Finalizar OP'}
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          title={editingOrder ? "Editar Ordem" : "Nova Ordem de Produção"}
          onClose={() => setIsModalOpen(false)}
        >
          <OrderForm
            order={editingOrder}
            products={products}
            onSuccess={() => { setIsModalOpen(false); fetchOrders(); onUpdate(); }}
          />
        </Modal>
      )}
    </div>
  );
}

function ShopFloorView({ onUpdate }: { onUpdate: () => void }) {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [ops, setOps] = useState<Operation[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);

  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');

  useEffect(() => {
    apiFetch('/api/orders').then(res => res.json()).then(data => setOrders(data.filter((o: any) => o.status === 'Em Produção' || o.status === 'Planejado')));
    apiFetch('/api/team').then(res => res.json()).then(setTeam);
    apiFetch('/api/operations').then(res => res.json()).then(setOps);
    fetchLogs();
  }, []);

  const fetchLogs = () => apiFetch('/api/production-logs').then(res => res.json()).then(setLogs);

  const handleAddToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find(o => String(o.id) === selectedOrder);
    const op = ops.find(o => o.code === order?.code);

    if (!op) {
      alert('Esta OP não possui uma Operação (Cadastro de OP) vinculada. Verifique o número da OP.');
      return;
    }

    await apiFetch('/api/production-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: selectedOrder,
        operator_id: selectedOperator,
        operation_id: op.id
      })
    });
    fetchLogs();
    onUpdate();
  };

  const updateStatus = async (id: number, status: string) => {
    await apiFetch(`/api/production-logs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchLogs();
    onUpdate();
  };

  const columns = [
    { id: 'Aguardando', title: 'Entrada', color: 'bg-slate-100 text-slate-600' },
    { id: 'Em Produção', title: 'Em Produção', color: 'bg-indigo-100 text-indigo-600' },
    { id: 'Finalizado', title: 'Finalizado', color: 'bg-emerald-100 text-emerald-600' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Chão de Fábrica</h2>
          <p className="text-slate-500">Acompanhamento de operações em tempo real</p>
        </div>
        <div className="w-full xl:w-auto">
          <Card>
            <form onSubmit={handleAddToQueue} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operador</label>
                <select
                  required
                  value={selectedOperator}
                  onChange={e => setSelectedOperator(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Operador</option>
                  {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">OP</label>
                <select
                  required
                  value={selectedOrder}
                  onChange={e => setSelectedOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">OP</option>
                  {orders.map(o => <option key={o.id} value={o.id}>#{o.code || o.id} - {o.product_name}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar
              </button>
            </form>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className="space-y-4">
            <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-between items-center ${col.color}`}>
              {col.title}
              <span className="bg-white/50 px-2 py-0.5 rounded-full">{logs.filter(l => l.status === col.id).length}</span>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
              {logs.filter(l => l.status === col.id).map(log => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={log.id}
                >
                  <Card>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">OP #{log.order_code || log.order_id}</span>
                        <h4 className="font-bold text-slate-800 leading-tight">{log.operation_name}</h4>
                      </div>
                      <Badge variant={col.id === 'Finalizado' ? 'success' : col.id === 'Em Produção' ? 'info' : 'default'}>
                        {col.id}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={12} />
                        <span>{log.operator_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Package size={12} />
                        <span>{log.product_name}</span>
                      </div>
                    </div>

                    {col.id === 'Aguardando' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async () => {
                            if (confirm('Remover este apontamento da fila?')) {
                              await apiFetch(`/api/production-logs/${log.id}`, { method: 'DELETE' });
                              fetchLogs();
                              onUpdate();
                            }
                          }}
                          className="py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                        <button
                          onClick={() => updateStatus(log.id, 'Em Produção')}
                          className="py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play size={14} /> Iniciar
                        </button>
                      </div>
                    )}

                    {col.id === 'Em Produção' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-indigo-600 uppercase mb-1">
                          <span>Iniciado às</span>
                          <span>{new Date(log.start_time).toLocaleTimeString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateStatus(log.id, 'Aguardando')}
                            className="py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                          >
                            Reverter
                          </button>
                          <button
                            onClick={() => updateStatus(log.id, 'Finalizado')}
                            className="py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={14} /> Finalizar
                          </button>
                        </div>
                      </div>
                    )}

                    {col.id === 'Finalizado' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Concluído em</span>
                          <span>{new Date(log.end_time).toLocaleTimeString()}</span>
                        </div>
                        <button
                          onClick={() => updateStatus(log.id, 'Em Produção')}
                          className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                          Reverter para Produção
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}

              {logs.filter(l => l.status === col.id).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300">
                  <p className="text-sm">Vazio</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsView() {
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiFetch('/api/production-logs').then(res => res.json()).then(setLogs);
    apiFetch('/api/orders').then(res => res.json()).then(setOrders);
    apiFetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Finalizado');
  const finishedOrders = orders.filter(o => o.status === 'Finalizado');

  const totalFinishedPieces = finishedOrders.reduce((acc, o) => acc + o.quantity, 0);
  const totalInProductionPieces = activeOrders.filter(o => o.status === 'Em Produção').reduce((acc, o) => acc + o.quantity, 0);
  const totalPlannedPieces = activeOrders.filter(o => o.status === 'Planejado').reduce((acc, o) => acc + o.quantity, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Relatórios e Indicadores</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peças Finalizadas</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalFinishedPieces}</h3>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <Play size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Em Produção (Peças)</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalInProductionPieces}</h3>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planejado (Peças)</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalPlannedPieces}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Peças Produzidas (Finalizadas)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-semibold text-slate-600">OP</th>
                  <th className="pb-4 font-semibold text-slate-600">Cód. Produto</th>
                  <th className="pb-4 font-semibold text-slate-600">Produto</th>
                  <th className="pb-4 font-semibold text-slate-600 text-right">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {finishedOrders.map(order => {
                  const product = products.find(p => p.id === order.product_id);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-800">#{order.code || order.id}</td>
                      <td className="py-3 font-mono text-indigo-600">{product?.code || '-'}</td>
                      <td className="py-3 text-slate-600">{order.product_name}</td>
                      <td className="py-3 text-right font-bold text-slate-800">{order.quantity}</td>
                    </tr>
                  );
                })}
                {finishedOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">Nenhuma ordem finalizada</td>
                  </tr>
                )}
              </tbody>
              {finishedOrders.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50/50">
                    <td colSpan={3} className="py-3 font-bold text-slate-600 text-right">TOTAL FINALIZADO:</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{totalFinishedPieces}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>

        <Card title="Ordens Ativas">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-semibold text-slate-600">OP</th>
                  <th className="pb-4 font-semibold text-slate-600">Produto</th>
                  <th className="pb-4 font-semibold text-slate-600">Status</th>
                  <th className="pb-4 font-semibold text-slate-600 text-right">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-800">#{order.code || order.id}</td>
                    <td className="py-3 text-slate-600 truncate max-w-[120px]">{order.product_name}</td>
                    <td className="py-3">
                      <Badge variant={order.status === 'Em Produção' ? 'info' : 'default'}>{order.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${order.status === 'Em Produção' ? 'bg-indigo-500 w-1/2' : 'bg-slate-300 w-0'}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {activeOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">Nenhuma ordem ativa</td>
                  </tr>
                )}
              </tbody>
              {activeOrders.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50/50">
                    <td colSpan={3} className="py-3 font-bold text-slate-600 text-right">TOTAL EM ABERTO:</td>
                    <td className="py-3 text-right font-bold text-indigo-600">{activeOrders.reduce((acc, o) => acc + o.quantity, 0)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      </div>

      <Card title="Histórico de Apontamentos">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600">Data</th>
                <th className="pb-4 font-semibold text-slate-600">OP</th>
                <th className="pb-4 font-semibold text-slate-600">Operador</th>
                <th className="pb-4 font-semibold text-slate-600">Operação</th>
                <th className="pb-4 font-semibold text-slate-600 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.slice().reverse().map(log => {
                const getStatusVariant = (status: string) => {
                  switch (status) {
                    case 'Finalizado': return 'success';
                    case 'Em Produção': return 'info';
                    case 'Aguardando': return 'default';
                    default: return 'default';
                  }
                };

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-600">
                      {log.start_time ? new Date(log.start_time).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 font-bold text-slate-800">#{log.order_code || log.order_id}</td>
                    <td className="py-3 text-slate-600">{log.operator_name}</td>
                    <td className="py-3 text-slate-600">{log.operation_name}</td>
                    <td className="py-3 text-right">
                      <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SettingsView({ company, user, onUpdate }: { company: CompanyInfo | null, user: UserProfile | null, onUpdate: () => void }) {
  const [companyForm, setCompanyForm] = useState(company || { name: '', cnpj: '', address: '', phone: '', email: '', logo: '' });
  const [userForm, setUserForm] = useState(user || { name: '', email: '', role: '', photo: '' });

  const saveCompany = async () => {
    await apiFetch('/api/settings/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyForm)
    });
    onUpdate();
    alert('Dados da empresa salvos!');
  };

  const saveProfile = async () => {
    await apiFetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    onUpdate();
    alert('Perfil atualizado!');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyForm({ ...companyForm, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserForm({ ...userForm, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Dados da Empresa">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border-2 border-dashed border-slate-200 shrink-0">
              {companyForm.logo ? (
                <img src={companyForm.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Factory size={32} />
              )}
            </div>
            <div className="text-center sm:text-left">
              <label className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50 transition-colors inline-block">
                Alterar Logomarca
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
              <p className="text-xs text-slate-400 mt-2">PNG ou JPG, máx 2MB</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Nome da Empresa" value={companyForm.name} onChange={v => setCompanyForm({ ...companyForm, name: v })} />
            <Input label="CNPJ" value={companyForm.cnpj} onChange={v => setCompanyForm({ ...companyForm, cnpj: v })} />
            <Input label="Endereço" value={companyForm.address} onChange={v => setCompanyForm({ ...companyForm, address: v })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telefone" value={companyForm.phone} onChange={v => setCompanyForm({ ...companyForm, phone: v })} />
              <Input label="E-mail" value={companyForm.email} onChange={v => setCompanyForm({ ...companyForm, email: v })} />
            </div>
          </div>
          <button onClick={saveCompany} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            Salvar Dados da Empresa
          </button>
        </div>
      </Card>

      <Card title="Perfil do Usuário">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200 shrink-0">
              {userForm.photo ? (
                <img src={userForm.photo} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <Users size={32} />
              )}
            </div>
            <div className="text-center sm:text-left">
              <label className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50 transition-colors inline-block">
                Alterar Foto de Perfil
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
              <p className="text-xs text-slate-400 mt-2">PNG ou JPG, máx 2MB</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Nome Completo" value={userForm.name} onChange={v => setUserForm({ ...userForm, name: v })} />
            <Input label="E-mail" value={userForm.email} onChange={v => setUserForm({ ...userForm, email: v })} />
            <Input label="Cargo / Função" value={userForm.role} onChange={v => setUserForm({ ...userForm, role: v })} />
          </div>
          <button onClick={saveProfile} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            Salvar Perfil
          </button>
        </div>
      </Card>
    </div>
  );
}

// --- Form Components ---

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string, value: any, onChange: (v: any) => void, type?: string, required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      />
    </div>
  );
}

function SupplyForm({ item, onSuccess }: { item: Supply | null, onSuccess: () => void }) {
  const [form, setForm] = useState(item || { name: '', quantity: 0, unit: 'peças', min_stock: 0, initial_quantity: 0 });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = item ? 'PUT' : 'POST';
    const url = item ? `/api/supplies/${item.id}` : '/api/supplies';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome do Insumo" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Quantidade" type="number" value={form.quantity} onChange={v => setForm({ ...form, quantity: Number(v) })} required />
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unidade</label>
          <select
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="peças">Peças</option>
            <option value="metros">Metros</option>
            <option value="kg">KG</option>
            <option value="un">Unidades</option>
          </select>
        </div>
      </div>
      <Input label="Estoque Mínimo" type="number" value={form.min_stock} onChange={v => setForm({ ...form, min_stock: Number(v) })} required />
      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
        {item ? 'Salvar Alterações' : 'Cadastrar Insumo'}
      </button>
    </form>
  );
}

function ProductForm({ product, onSuccess }: { product: Product | null, onSuccess: () => void }) {
  const [form, setForm] = useState(product || { code: '', name: '', description: '', unit_cost: 0, color: '', photo: '' });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = product ? 'PUT' : 'POST';
    const url = product ? `/api/products/${product.id}` : '/api/products';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Mídia do Produto</h4>
        <div className="flex flex-col items-center">
          <label className="relative group cursor-pointer">
            <div className="w-48 h-48 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group-hover:border-indigo-300 transition-all shadow-sm">
              {form.photo ? (
                <img src={form.photo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Adicionar Foto</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG ou WEBP</p>
                </div>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            {form.photo && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                <div className="flex gap-2">
                  <div className="p-2 bg-white text-slate-800 rounded-lg shadow-lg">
                    <Settings2 size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setForm({ ...form, photo: '' }); }}
                    className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Código do Produto" value={form.code} onChange={v => setForm({ ...form, code: v })} required />
          <Input label="Cor" value={form.color || ''} onChange={v => setForm({ ...form, color: v })} />
        </div>
        <Input label="Nome do Produto" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
        <Input label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} />
        <Input label="Custo Unitário (R$)" type="number" value={form.unit_cost} onChange={v => setForm({ ...form, unit_cost: Number(v) })} required />
      </div>

      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
        {product ? 'Salvar Alterações' : 'Cadastrar Produto'}
      </button>
    </form>
  );
}

function OperationForm({ op, onSuccess }: { op: Operation | null, onSuccess: () => void }) {
  const [form, setForm] = useState(op || { code: '', description: '', status: 'Aguardando' });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = op ? 'PUT' : 'POST';
    const url = op ? `/api/operations/${op.id}` : '/api/operations';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Número da OP" value={form.code} onChange={v => setForm({ ...form, code: v })} required />
      <Input label="Descrição" value={form.description} onChange={v => setForm({ ...form, description: v })} required />
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="Aguardando">Aguardando</option>
          <option value="Em execução">Em execução</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>
      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
        {op ? 'Salvar Alterações' : 'Cadastrar OP'}
      </button>
    </form>
  );
}

function TeamForm({ member, onSuccess }: { member: TeamMember | null, onSuccess: () => void }) {
  const [form, setForm] = useState(member || { name: '', role: '', avatar: '' });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = member ? 'PUT' : 'POST';
    const url = member ? `/api/team/${member.id}` : '/api/team';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200">
          {form.avatar ? (
            <img src={form.avatar} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Users size={40} className="text-slate-300" />
          )}
        </div>
        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          {form.avatar ? 'Trocar Foto' : 'Adicionar Foto'}
          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </div>
      <Input label="Nome Completo" value={form.name} onChange={v => setForm({ ...form, name: v })} required />
      <Input label="Função" value={form.role} onChange={v => setForm({ ...form, role: v })} required />
      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
        {member ? 'Salvar Alterações' : 'Cadastrar Membro'}
      </button>
    </form>
  );
}

function OrderForm({ order, products, onSuccess }: { order: ProductionOrder | null, products: Product[], onSuccess: () => void }) {
  const [form, setForm] = useState(order || {
    code: '',
    product_id: products[0]?.id || 0,
    quantity: 0,
    entry_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    priority: 'Média',
    status: 'Planejado'
  });

  const selectedProduct = products.find(p => p.id === form.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = order ? 'PUT' : 'POST';
    const url = order ? `/api/orders/${order.id}` : '/api/orders';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Número da OP" value={form.code} onChange={v => setForm({ ...form, code: v })} required />
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produto</label>
          <select
            required
            value={form.product_id}
            onChange={e => setForm({ ...form, product_id: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Selecionar Produto</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {selectedProduct?.photo && (
          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm">
            <img src={selectedProduct.photo} alt={selectedProduct.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <Input label="Quantidade" type="number" value={form.quantity} onChange={v => setForm({ ...form, quantity: Number(v) })} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Data de Entrada" type="date" value={form.entry_date} onChange={v => setForm({ ...form, entry_date: v })} required />
        <Input label="Previsão de Entrega" type="date" value={form.delivery_date} onChange={v => setForm({ ...form, delivery_date: v })} required />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prioridade</label>
        <select
          value={form.priority}
          onChange={e => setForm({ ...form, priority: e.target.value as any })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="Baixa">Baixa (Verde)</option>
          <option value="Média">Média (Amarelo)</option>
          <option value="Alta">Alta (Vermelho)</option>
        </select>
      </div>
      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
        {order ? 'Salvar Alterações' : 'Criar Ordem de Produção'}
      </button>
    </form>
  );
}

function LogForm({ log, orders, team, operations, onSuccess }: { log: ProductionLog | null, orders: ProductionOrder[], team: TeamMember[], operations: Operation[], onSuccess: () => void }) {
  const [form, setForm] = useState(log || {
    order_id: orders[0]?.id || 0,
    operator_id: team[0]?.id || 0,
    operation_id: operations[0]?.id || 0,
    status: 'Aguardando',
    start_time: new Date().toISOString(),
    end_time: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = log ? 'PUT' : 'POST';
    const url = log ? `/api/production-logs/${log.id}` : '/api/production-logs';
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess();
  };

  const handleDelete = async () => {
    if (!log) return;
    if (confirm('Tem certeza que deseja excluir este apontamento?')) {
      await apiFetch(`/api/production-logs/${log.id}`, { method: 'DELETE' });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ordem de Produção</label>
        <select
          required
          value={form.order_id}
          onChange={e => setForm({ ...form, order_id: Number(e.target.value) })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {orders.map(o => <option key={o.id} value={o.id}>#{o.code || o.id} - {o.product_name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Operador</label>
        <select
          required
          value={form.operator_id}
          onChange={e => setForm({ ...form, operator_id: Number(e.target.value) })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Operação</label>
        <select
          required
          value={form.operation_id}
          onChange={e => setForm({ ...form, operation_id: Number(e.target.value) })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {operations.map(o => <option key={o.id} value={o.id}>{o.description}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="Aguardando">Aguardando</option>
          <option value="Em Produção">Em Produção</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Início" type="datetime-local" value={form.start_time ? new Date(form.start_time).toISOString().slice(0, 16) : ''} onChange={v => setForm({ ...form, start_time: new Date(v).toISOString() })} />
        <Input label="Fim" type="datetime-local" value={form.end_time ? new Date(form.end_time).toISOString().slice(0, 16) : ''} onChange={v => setForm({ ...form, end_time: v ? new Date(v).toISOString() : '' })} />
      </div>
      <div className="flex gap-4 pt-4">
        {log && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors"
          >
            Excluir
          </button>
        )}
        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          {log ? 'Salvar Alterações' : 'Criar Apontamento'}
        </button>
      </div>
    </form>
  );
}
