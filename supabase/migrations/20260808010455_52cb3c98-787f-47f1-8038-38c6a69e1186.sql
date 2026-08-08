REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_conversation_on_message() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_conversation_on_message() TO service_role;