-- Early capture: marcar leads parciais e qual step alcançaram
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS is_partial boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_step smallint NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_leads_is_partial ON public.leads (is_partial);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);

-- Atualizar a policy de INSERT pública para permitir veiculo_info vazio (early capture)
-- A policy atual já permite, pois veiculo_info default é '{}'. 
-- Precisamos relaxar a obrigatoriedade de uso_veiculo no schema:
ALTER TABLE public.leads ALTER COLUMN uso_veiculo DROP NOT NULL;

-- Validação: se não for parcial, exige uso_veiculo
CREATE OR REPLACE FUNCTION public.validate_lead()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.momento_compra NOT IN ('imediato', 'pesquisando', 'sem_pressa') THEN
    RAISE EXCEPTION 'momento_compra inválido: %', NEW.momento_compra;
  END IF;
  IF NEW.status NOT IN ('novo', 'em_atendimento', 'aguardando_cotacao', 'fechado', 'perdido') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  IF NEW.uso_veiculo IS NOT NULL AND NEW.uso_veiculo NOT IN ('particular', 'app', 'comercial') THEN
    RAISE EXCEPTION 'uso_veiculo inválido: %', NEW.uso_veiculo;
  END IF;
  IF NEW.is_partial = false AND NEW.uso_veiculo IS NULL THEN
    RAISE EXCEPTION 'uso_veiculo obrigatório para leads completos';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_lead_trigger ON public.leads;
CREATE TRIGGER validate_lead_trigger
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.validate_lead();

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();