import { supabase } from './supabase';

export const apiFetch = async (url: string, options: any = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // We don't rely entirely on the manual x-user-id header anymore; we fetch the real safe session:
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId && !url.includes('/login')) {
        console.warn('apiFetch: No authenticated user session found');
        return { ok: false, json: async () => ({ error: 'Unauthorized' }) };
    }

    const jsonResponse = (data: any) => ({
        ok: true,
        json: async () => data
    });

    try {
        // --- DASHBOARD ---
        if (url === '/api/dashboard' && method === 'GET') {
            const { count: activeOrders } = await supabase.from('production_orders').select('*', { count: 'exact', head: true }).neq('status', 'Finalizado');

            const { data: supplies } = await supabase.from('supplies').select('quantity, min_stock');
            const lowStockAlerts = supplies?.filter(s => s.quantity <= s.min_stock).length || 0;

            const { data: finished } = await supabase.from('production_orders').select('quantity').eq('status', 'Finalizado');
            const totalProduced = finished?.reduce((acc, order) => acc + (order.quantity || 0), 0) || 0;

            return jsonResponse({
                activeOrders: activeOrders || 0,
                lowStockAlerts: lowStockAlerts,
                totalProduced: totalProduced,
                efficiency: 85 // Mocked for now
            });
        }

        // --- SETTINGS ---
        if (url === '/api/settings' && method === 'GET') {
            let { data: company } = await supabase.from('company_info').select('*').single();
            let { data: user } = await supabase.from('user_profile').select('*').single();

            if (!company) {
                await supabase.from('company_info').insert({ user_id: userId, name: 'Minha Confecção' });
                const res = await supabase.from('company_info').select('*').single();
                company = res.data;
            }
            if (!user) {
                await supabase.from('user_profile').insert({ user_id: userId, name: 'Administrador', role: 'Gerente' });
                const res = await supabase.from('user_profile').select('*').single();
                user = res.data;
            }
            return jsonResponse({ company, user });
        }

        if (url === '/api/settings/company' && method === 'POST') {
            await supabase.from('company_info').update(body).eq('user_id', userId);
            return jsonResponse({ success: true });
        }

        if (url === '/api/settings/profile' && method === 'POST') {
            await supabase.from('user_profile').update(body).eq('user_id', userId);
            return jsonResponse({ success: true });
        }

        // --- RESTful RESOURCES Regex ---
        const matchGet = url.match(/^\/api\/(supplies|products|team|operations)$/);
        if (matchGet && method === 'GET') {
            const { data } = await supabase.from(matchGet[1]).select('*').order('id', { ascending: true });
            return jsonResponse(data || []);
        }

        const matchPost = url.match(/^\/api\/(supplies|products|team|operations)$/);
        if (matchPost && method === 'POST') {
            const { data } = await supabase.from(matchPost[1]).insert({ ...body, user_id: userId }).select('id').single();
            return jsonResponse({ id: data?.id });
        }

        const matchPut = url.match(/^\/api\/(supplies|products|team|operations|orders)\/(\d+)$/);
        if (matchPut && method === 'PUT') {
            const table = matchPut[1] === 'orders' ? 'production_orders' : matchPut[1];
            await supabase.from(table).update(body).eq('id', matchPut[2]);
            return jsonResponse({ success: true });
        }

        const matchDel = url.match(/^\/api\/(supplies|products|team|operations|orders|production-logs)\/(\d+)$/);
        if (matchDel && method === 'DELETE') {
            const table = matchDel[1] === 'orders' ? 'production_orders' : (matchDel[1] === 'production-logs' ? 'production_logs' : matchDel[1]);
            await supabase.from(table).delete().eq('id', matchDel[2]);
            return jsonResponse({ success: true });
        }

        // --- PRODUCTION ORDERS ---
        if (url === '/api/orders' && method === 'GET') {
            const { data } = await supabase.from('production_orders')
                .select(`*, products(name)`)
                .order('id', { ascending: true });

            const mapped = data?.map((d: any) => ({
                ...d,
                product_name: d.products?.name
            })) || [];
            return jsonResponse(mapped);
        }

        if (url === '/api/orders' && method === 'POST') {
            const { data } = await supabase.from('production_orders').insert({ ...body, user_id: userId }).select('id').single();
            return jsonResponse({ id: data?.id });
        }

        const matchPatchOrder = url.match(/^\/api\/orders\/(\d+)\/status$/);
        if (matchPatchOrder && method === 'PATCH') {
            await supabase.from('production_orders').update({ status: body.status }).eq('id', matchPatchOrder[1]);
            return jsonResponse({ success: true });
        }

        // --- PRODUCTION LOGS ---
        if (url === '/api/production-logs' && method === 'GET') {
            const { data, error } = await supabase.from('production_logs').select(`
        *,
        production_orders(id, code, products(name)),
        team(name),
        operations(description)
      `).order('id', { ascending: true });

            if (error) console.error("Logs error:", error);

            const mapped = data?.map((d: any) => ({
                ...d,
                order_id: d.production_orders?.id,
                order_code: d.production_orders?.code,
                product_name: d.production_orders?.products?.name,
                operator_name: d.team?.name,
                operation_name: d.operations?.description
            })) || [];

            return jsonResponse(mapped);
        }

        if (url === '/api/production-logs' && method === 'POST') {
            const insertData = { ...body, user_id: userId, status: 'Aguardando' };
            const { data } = await supabase.from('production_logs').insert(insertData).select('id').single();
            return jsonResponse({ id: data?.id });
        }

        if (url === '/api/production-logs/start' && method === 'POST') {
            const start_time = new Date().toISOString();
            const insertData = { ...body, user_id: userId, start_time, status: 'Em Produção' };
            const { data } = await supabase.from('production_logs').insert(insertData).select('id').single();

            await supabase.from('production_orders').update({ status: 'Em Produção' }).eq('id', body.order_id).eq('status', 'Planejado');

            return jsonResponse({ id: data?.id });
        }

        const matchPutLog = url.match(/^\/api\/production-logs\/(\d+)$/);
        if (matchPutLog && method === 'PUT') {
            await supabase.from('production_logs').update(body).eq('id', matchPutLog[1]);
            return jsonResponse({ success: true });
        }

        const matchPatchLog = url.match(/^\/api\/production-logs\/(\d+)\/status$/);
        if (matchPatchLog && method === 'PATCH') {
            const id = matchPatchLog[1];
            const { status } = body;
            const now = new Date().toISOString();

            if (status === 'Em Produção') {
                const { data: log } = await supabase.from('production_logs').select('start_time, order_id').eq('id', id).single();
                await supabase.from('production_logs').update({
                    status,
                    start_time: log?.start_time || now,
                    end_time: null
                }).eq('id', id);

                if (log?.order_id) {
                    await supabase.from('production_orders').update({ status: 'Em Produção' }).eq('id', log.order_id).eq('status', 'Planejado');
                }
            } else if (status === 'Finalizado') {
                await supabase.from('production_logs').update({ status, end_time: now }).eq('id', id);
            } else if (status === 'Aguardando') {
                await supabase.from('production_logs').update({ status, start_time: null, end_time: null }).eq('id', id);
            } else {
                await supabase.from('production_logs').update({ status }).eq('id', id);
            }
            return jsonResponse({ success: true });
        }

        const matchFinishLog = url.match(/^\/api\/production-logs\/(\d+)\/finish$/);
        if (matchFinishLog && method === 'POST') {
            const now = new Date().toISOString();
            await supabase.from('production_logs').update({ end_time: now, status: 'Finalizado' }).eq('id', matchFinishLog[1]);
            return jsonResponse({ success: true });
        }

        console.warn('apiFetch: Unhandled route:', method, url);
        return jsonResponse({ error: 'Route not found in API proxy' });

    } catch (error) {
        console.error('apiFetch error:', error);
        return { ok: false, json: async () => ({ error: 'Internal Server Error' }) };
    }
};
