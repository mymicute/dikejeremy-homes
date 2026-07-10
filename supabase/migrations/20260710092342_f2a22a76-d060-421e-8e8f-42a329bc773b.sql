
CREATE POLICY "Admins delete any property" ON public.properties FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete any status" ON public.status_posts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
