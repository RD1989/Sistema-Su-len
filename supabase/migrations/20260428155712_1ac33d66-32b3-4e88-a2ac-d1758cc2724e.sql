-- Enum para papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'broker');

-- Tabela de papéis (separada do perfil para evitar privilege escalation)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para checar role sem recursão de RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper para checar se é staff (admin OR broker)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'broker')
  )
$$;

-- Policies para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  cidade text NOT NULL,
  momento_compra text NOT NULL,
  veiculo_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  uso_veiculo text NOT NULL,
  status text NOT NULL DEFAULT 'novo',
  estimativa_plano text,
  estimativa_valor numeric,
  observacoes text,
  broker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leads_set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Validação de domínios via trigger (CHECK constraints podem causar problemas, usamos trigger)
CREATE OR REPLACE FUNCTION public.validate_lead()
RETURNS trigger
LANGUAGE plpgsql
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

CREATE TRIGGER leads_validate
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead();

-- RLS leads: INSERT público (qualquer um pode criar lead via funil)
CREATE POLICY "Anyone can create a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT/UPDATE/DELETE apenas para staff
CREATE POLICY "Staff can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Índices úteis
CREATE INDEX leads_status_idx ON public.leads(status);
CREATE INDEX leads_created_at_idx ON public.leads(created_at DESC);
CREATE INDEX leads_broker_id_idx ON public.leads(broker_id);