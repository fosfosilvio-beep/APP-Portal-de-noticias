import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase-server';

const PushSendSchema = z.object({
  title: z.string().min(1, 'title e obrigatorio').max(100, 'title ate 100 caracteres'),
  body: z.string().min(1, 'body e obrigatorio').max(200, 'body ate 200 caracteres'),
  url: z.string().url('url invalida').optional().or(z.literal('')),
  icon: z.string().url('icon invalido').optional().or(z.literal('')),
});

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

    const body = await req.json();
    const parsed = PushSendSchema.parse(body);

    const { title, body: pushBody, url, icon } = parsed;

    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription');

    if (subError) throw subError;

    const notifications = subscriptions.map((sub) => {
      const payload = JSON.stringify({
        title,
        body: pushBody,
        url: url || '',
        icon: icon || '',
      });

      return webpush.sendNotification(sub.subscription, payload).catch((err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log('Inscricao expirada removida');
        }
        return null;
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    console.error('Erro ao enviar push:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
