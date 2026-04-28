ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS observacoes_cliente TEXT,
  ADD COLUMN IF NOT EXISTS contato_preferencia TEXT,
  ADD COLUMN IF NOT EXISTS contato_horario TEXT;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_observacoes_cliente_len
  CHECK (observacoes_cliente IS NULL OR length(observacoes_cliente) <= 1000);

ALTER TABLE public.leads
  ADD CONSTRAINT leads_contato_preferencia_chk
  CHECK (contato_preferencia IS NULL OR contato_preferencia IN ('whatsapp','ligacao','email'));

ALTER TABLE public.leads
  ADD CONSTRAINT leads_contato_horario_chk
  CHECK (contato_horario IS NULL OR contato_horario IN ('manha','tarde','noite','qualquer'));