import { supabase } from './supabase';

export const apiFetch = async (url: string, options: any = {}) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    if (body) {
        if ('id' in body) delete body.id;
        // Strip computed frontend properties to avoid "column not found" on INSERT/UPDATE
        delete body.product_name;
        delete body.operator_name;
        delete body.operation_name;
        delete body.order_code;
        delete body.products;
        delete body.team_members;
        delete body.operations;
    }

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

    const errorResponse = (error: any) => {
        console.error('API Error:', error.message || error);
        alert('Erro ao salvar no Banco de Dados:\n' + (error.message || 'Erro desconhecido') + '\n\nDica: Você já executou o supabase-schema.sql no SQL Editor do Supabase? Se não rodou, as tabelas não existem!');
        return { ok: false, json: async () => ({ error: error.message || 'Error executing request' }) };
    };

    try {
        // --- DASHBOARD ---
        if (url === '/api/dashboard' && method === 'GET') {
            const { count: activeOrders, error: e1 } = await supabase.from('production_orders').select('*', { count: 'exact', head: true }).neq('status', 'Finalizado');
            if (e1) return errorResponse(e1);

            const { data: supplies, error: e2 } = await supabase.from('supplies').select('quantity, min_stock');
            if (e2) return errorResponse(e2);
            const lowStockAlerts = supplies?.filter(s => s.quantity <= s.min_stock).length || 0;

            const { data: finished, error: e3 } = await supabase.from('production_orders').select('quantity').eq('status', 'Finalizado');
            if (e3) return errorResponse(e3);
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
            let { data: compData, error: ce } = await supabase.from('company_info').select('*').eq('user_id', userId).limit(1);
            let { data: userData, error: ue } = await supabase.from('user_profile').select('*').eq('user_id', userId).limit(1);

            let company = compData && compData.length > 0 ? compData[0] : null;
            let user = userData && userData.length > 0 ? userData[0] : null;

            if (!company) {
                const { error: insC } = await supabase.from('company_info').insert({ user_id: userId, name: 'Minha Confecção' });
                if (insC) return errorResponse(insC);
                const res = await supabase.from('company_info').select('*').eq('user_id', userId).limit(1);
                company = res.data?.[0];
            }
            if (!user) {
                const { error: insU } = await supabase.from('user_profile').insert({ user_id: userId, name: 'Administrador', role: 'Gerente' });
                if (insU) return errorResponse(insU);
                const res = await supabase.from('user_profile').select('*').eq('user_id', userId).limit(1);
                user = res.data?.[0];
            }
            return jsonResponse({ company, user });
        }

        if (url === '/api/settings/company' && method === 'POST') {
            const { error } = await supabase.from('company_info').update(body).eq('user_id', userId);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        if (url === '/api/settings/profile' && method === 'POST') {
            const { error } = await supabase.from('user_profile').update(body).eq('user_id', userId);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        // --- RESTful RESOURCES Regex ---
        const matchGet = url.match(/^\/api\/(supplies|products|team|operations)$/);
        if (matchGet && method === 'GET') {
            const { data, error } = await supabase.from(matchGet[1]).select('*').order('id', { ascending: true });
            if (error) return errorResponse(error);
            return jsonResponse(data || []);
        }

        const matchPost = url.match(/^\/api\/(supplies|products|team|operations)$/);
        if (matchPost && method === 'POST') {
            const { data, error } = await supabase.from(matchPost[1]).insert({ ...body, user_id: userId }).select('id').single();
            if (error) return errorResponse(error);
            return jsonResponse({ id: data?.id });
        }

        const matchPut = url.match(/^\/api\/(supplies|products|team|operations|orders)\/(\d+)$/);
        if (matchPut && method === 'PUT') {
            const table = matchPut[1] === 'orders' ? 'production_orders' : matchPut[1];
            const { error } = await supabase.from(table).update(body).eq('id', matchPut[2]);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        const matchDel = url.match(/^\/api\/(supplies|products|team|operations|orders|production-logs)\/(\d+)$/);
        if (matchDel && method === 'DELETE') {
            const table = matchDel[1] === 'orders' ? 'production_orders' : (matchDel[1] === 'production-logs' ? 'production_logs' : matchDel[1]);
            const { error } = await supabase.from(table).delete().eq('id', matchDel[2]);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        // --- PRODUCTION ORDERS ---
        if (url === '/api/orders' && method === 'GET') {
            const { data, error } = await supabase.from('production_orders')
                .select(`*, products(name)`)
                .order('id', { ascending: true });
            if (error) return errorResponse(error);

            const mapped = data?.map((d: any) => ({
                ...d,
                product_name: d.products?.name
            })) || [];
            return jsonResponse(mapped);
        }

        if (url === '/api/orders' && method === 'POST') {
            const { data, error } = await supabase.from('production_orders').insert({ ...body, user_id: userId }).select('id').single();
            if (error) return errorResponse(error);
            return jsonResponse({ id: data?.id });
        }

        const matchPatchOrder = url.match(/^\/api\/orders\/(\d+)\/status$/);
        if (matchPatchOrder && method === 'PATCH') {
            const { error } = await supabase.from('production_orders').update({ status: body.status }).eq('id', matchPatchOrder[1]);
            if (error) return errorResponse(error);
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
            if (error) return errorResponse(error);

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
            const { data, error } = await supabase.from('production_logs').insert(insertData).select('id').single();
            if (error) return errorResponse(error);
            return jsonResponse({ id: data?.id });
        }

        if (url === '/api/production-logs/start' && method === 'POST') {
            const start_time = new Date().toISOString();
            const insertData = { ...body, user_id: userId, start_time, status: 'Em Produção' };
            const { data, error } = await supabase.from('production_logs').insert(insertData).select('id').single();
            if (error) return errorResponse(error);

            await supabase.from('production_orders').update({ status: 'Em Produção' }).eq('id', body.order_id).eq('status', 'Planejado');

            return jsonResponse({ id: data?.id });
        }

        const matchPutLog = url.match(/^\/api\/production-logs\/(\d+)$/);
        if (matchPutLog && method === 'PUT') {
            const { error } = await supabase.from('production_logs').update(body).eq('id', matchPutLog[1]);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        const matchPatchLog = url.match(/^\/api\/production-logs\/(\d+)\/status$/);
        if (matchPatchLog && method === 'PATCH') {
            const id = matchPatchLog[1];
            const { status } = body;
            const now = new Date().toISOString();

            if (status === 'Em Produção') {
                const { data: log } = await supabase.from('production_logs').select('start_time, order_id').eq('id', id).single();
                const { error } = await supabase.from('production_logs').update({
                    status,
                    start_time: log?.start_time || now,
                    end_time: null
                }).eq('id', id);
                if (error) return errorResponse(error);

                if (log?.order_id) {
                    await supabase.from('production_orders').update({ status: 'Em Produção' }).eq('id', log.order_id).eq('status', 'Planejado');
                }
            } else if (status === 'Finalizado') {
                const { error } = await supabase.from('production_logs').update({ status, end_time: now }).eq('id', id);
                if (error) return errorResponse(error);
            } else if (status === 'Aguardando') {
                const { error } = await supabase.from('production_logs').update({ status, start_time: null, end_time: null }).eq('id', id);
                if (error) return errorResponse(error);
            } else {
                const { error } = await supabase.from('production_logs').update({ status }).eq('id', id);
                if (error) return errorResponse(error);
            }
            return jsonResponse({ success: true });
        }

        const matchFinishLog = url.match(/^\/api\/production-logs\/(\d+)\/finish$/);
        if (matchFinishLog && method === 'POST') {
            const now = new Date().toISOString();
            const { error } = await supabase.from('production_logs').update({ end_time: now, status: 'Finalizado' }).eq('id', matchFinishLog[1]);
            if (error) return errorResponse(error);
            return jsonResponse({ success: true });
        }

        console.warn('apiFetch: Unhandled route:', method, url);
        return errorResponse({ message: 'Route not found in API proxy' });

    } catch (error) {
        console.error('apiFetch exception:', error);
        return { ok: false, json: async () => ({ error: 'Internal Server Error' }) };
    }
};
