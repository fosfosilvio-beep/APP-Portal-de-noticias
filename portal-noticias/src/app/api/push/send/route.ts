import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase-server';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@nossawebtv.com.br',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, body, url, icon } = await req.json();

    // Buscar todos os inscritos
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription');

    if (subError) throw subError;

    const notifications = subscriptions.map((sub) => {
      const payload = JSON.stringify({
        title,
        body,
        url,
        icon
      });

      return webpush.sendNotification(sub.subscription, payload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Remover inscrição expirada? Opcional para v1
          console.log('Inscrição expirada removida');
        }
        return null;
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error: any) {
    console.error('Erro ao enviar push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
