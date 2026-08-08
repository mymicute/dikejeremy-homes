CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_distinct_parties CHECK (buyer_id <> vendor_id)
);

CREATE UNIQUE INDEX conversations_unique_pair ON public.conversations (buyer_id, vendor_id, COALESCE(property_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX conversations_buyer_idx ON public.conversations (buyer_id, last_message_at DESC);
CREATE INDEX conversations_vendor_idx ON public.conversations (vendor_id, last_message_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = vendor_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Buyer starts conversation" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = vendor_id);
CREATE POLICY "Participants update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);
CREATE POLICY "Admins delete conversations" ON public.conversations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = _conversation_id AND (c.buyer_id = _user_id OR c.vendor_id = _user_id))
$$;

CREATE POLICY "Participants view messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Participants mark read" ON public.messages FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Senders and admins delete messages" ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
    SET last_message = LEFT(NEW.body, 200), last_message_at = NEW.created_at, updated_at = now()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_touch_conversation AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;