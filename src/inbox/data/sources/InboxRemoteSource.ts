import { supabase } from '@/core/supabase/supabaseConfig';

export class InboxRemoteSource {
  get currentUserId() {
    return (supabase.auth as any).user?.id || '';
  }

  async sendInboxMessage(threadId: string, msg: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;

      await supabase.from('inbox_messages').insert({
        id: msg.id,
        thread_id: threadId,
        sender_id: currentUserId,
        body: msg.body,
        media_url: msg.media_url,
        message_type: msg.message_type || 'text',
        created_at: msg.created_at || new Date().toISOString(),
      });
    } catch (e) {
      console.error('❌ [InboxRemoteSource] sendInboxMessage error:', e);
      throw e;
    }
  }

  streamInboxMessages(threadId: string) {
    // Note: In React Native, streaming is usually handled directly via hooks using supabase.channel()
  }
}

export const inboxRemoteSource = new InboxRemoteSource();
