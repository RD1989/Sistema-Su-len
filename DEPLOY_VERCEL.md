# 🚀 Guia de Implantação: Nexus CRM na Vercel

Este documento orienta sobre como realizar o deploy profissional da aplicação utilizando o repositório GitHub e a plataforma Vercel.

## 1. Preparação do Repositório
- Certifique-se de que todos os arquivos foram salvos.
- O arquivo `.env` está protegido pelo `.gitignore` e **não** será enviado ao GitHub (isso é uma medida de segurança).

## 2. Passo a Passo na Vercel

1. **Conectar GitHub:**
   - Acesse [vercel.com](https://vercel.com) e clique em **"Add New"** > **"Project"**.
   - Importe o repositório que você criou no GitHub.

2. **Configurações de Build:**
   - O **Framework Preset** será detectado automaticamente como **Vite**.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Variáveis de Ambiente (CRÍTICO):**
   - No campo **"Environment Variables"**, adicione as seguintes chaves do seu arquivo `.env`:
     - `VITE_SUPABASE_URL`: (Sua URL do Supabase)
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: (Sua Chave Anon/Public do Supabase)
   - Clique em **Add** para cada uma.

4. **Deploy:**
   - Clique em **"Deploy"**. A Vercel levará cerca de 1-2 minutos para concluir a build.

## 3. Vantagens desta Configuração
- **Certificado SSL Automático:** Seu site terá HTTPS por padrão.
- **CDN Global:** Carregamento ultra rápido em qualquer lugar do mundo.
- **Continuous Deployment:** Toda vez que você fizer um `git push`, a Vercel atualizará o site automaticamente.

---
*Configurado profissionalmente por Antigravity.*
