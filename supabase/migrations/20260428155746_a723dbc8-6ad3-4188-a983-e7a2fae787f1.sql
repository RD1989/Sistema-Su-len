-- 1. Corrigir search_path nas funções restantes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.momento_compra NOT IN ('imediato', 'pesquisando', 'sem_pressa') THEN
    RAISE EXCEPTION 'momento_compra inválido: %', NEW.momento_compra;
  END IF;
  IF NEW.status NOT IN ('novo', 'em_atendimento', 'aguardando_cotacao', 'fechado', 'perdido') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  IF NEW.uso_veiculo NOT IN ('particular', 'app', 'comercial') THEN
    RAISE EXCEPTION 'uso_veiculo inválido: %', NEW.uso_veiculo;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Revogar EXECUTE público das funções SECURITY DEFINER (só são usadas dentro de policies / triggers)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;

-- 3. Substituir policy permissiva por check restritivo
DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;

CREATE POLICY "Anyone can create a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'novo'
    AND broker_id IS NULL
    AND length(nome) BETWEEN 2 AND 120
    AND length(email) BETWEEN 5 AND 160
    AND length(telefone) BETWEEN 8 AND 30
    AND length(cidade) BETWEEN 2 AND 80
  );