export interface CompanyInfo {
  id: number;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  photo?: string;
}

export interface Supply {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  min_stock: number;
  initial_quantity: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  unit_cost: number;
  color?: string;
  photo?: string;
}

export interface Operation {
  id: number;
  code: string;
  description: string;
  status: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

export interface ProductionOrder {
  id: number;
  code: string;
  product_id: number;
  product_name?: string;
  quantity: number;
  entry_date: string;
  delivery_date: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'Planejado' | 'Em Produção' | 'Finalizado';
}

export interface ProductionLog {
  id: number;
  order_id: number;
  order_code?: string;
  product_name?: string;
  operator_id: number;
  operator_name?: string;
  operation_id: number;
  operation_name?: string;
  start_time: string;
  end_time?: string;
  status: string;
}

export interface DashboardData {
  activeOrders: number;
  lowStockAlerts: number;
  totalProduced: number;
  efficiency: number;
}
