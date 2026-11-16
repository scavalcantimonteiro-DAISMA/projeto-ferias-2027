# ✈️ Aplicativo de Monitoramento Autônomo de Férias 2027

Sistema inteligente com IA para monitorar passagens aéreas e aluguel de carros para as férias de **16/04/2027 a 05/05/2027**, comparando os sentidos **Recife ➔ Foz do Iguaçu** e **Recife ➔ Curitiba** com trecho rodoviário passando por **Pomerode (SC)**.

Construído sob medida para uma família de **4 pessoas** (2 adultos + 2 filhos pequenos de 5 e 2,5 anos).

---

## 🌟 Principais Recursos

1. **Monitoramento 100% Autônomo na Nuvem:**
   - Varredura diária automática via **GitHub Actions** (sem custo e sem precisar ligar o PC).
   - Roda 2 vezes ao dia: às **03:00 da madrugada** (para feirões, madrugadões e Black Friday) e às **08:30 da manhã**.
2. **Modo Madrugada Inteligente (Anti-Perturbação do Sono):**
   - Entre 22h e 07h, o robô só envia notificação sonora no celular se for **Super Oferta** ($\ge 25\%$ de desconto). Oscilações normais são salvas silenciosamente para o relatório matinal.
3. **Cálculo do Custo Total Logístico (TCO):**
   - Voos para os 4 passageiros + Aluguel de carro pelo período + Taxa de devolução em outra cidade (*one-way drop-off fee*).
4. **Aluguel de Carro Seguro e Familiar:**
   - **Mobi e Kwid expressamente banidos** (porta-malas e espaço incompatíveis com 4 pessoas, malas e 2 cadeirinhas).
   - Foco em Sedans Médios (Virtus, Onix Plus, Cronos) e SUVs Compactos (Tracker, T-Cross, Creta).
5. **Dica de Ouro de Economia:**
   - Alerta sobre o despacho **gratuito de carrinho e 2 cadeirinhas no voo**, economizando de R$ 800 a R$ 1.000 em relação à locadora.
6. **Roteiro Dia a Dia Interativo com IA:**
   - Paradas a cada 2h na estrada (pernoite estratégico em Guarapuava ou União da Vitória).
   - Atrações acessíveis para carrinho de bebê e crianças pequenas em Foz, Pomerode (Vila Encantada dos dinossauros) e Curitiba (Bosque Alemão, Barigui).
7. **Notificações Push via `ntfy`:**
   - Alertas instantâneos no celular pelo app do ntfy (Android e iOS) de forma 100% gratuita.

---

## 🚀 Como Testar Localmente no seu Computador

1. Instale as dependências (se ainda não o fez):
   ```bash
   npm install
   ```

2. Execute o robô de busca para atualizar as ofertas e disparar o push:
   ```bash
   npm run monitor
   ```

3. Abra o painel no navegador:
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:5173`

---

## 📱 Como Configurar as Notificações no seu Celular (ntfy)

1. No seu celular Android ou iPhone, instale o aplicativo gratuito **ntfy** (da Google Play ou App Store).
2. Abra o app, toque no botão **+** (Inscrever-se no tópico).
3. Digite o nome do tópico: `ferias-recife-sul-2027` (ou outro nome de sua escolha).
4. Pronto! Você já receberá os alertas em tempo real. No painel web, você pode clicar em **"Testar Alerta Push no Celular"** para testar.

---

## 🌐 Passo a Passo Completo para Publicar Gratuitamente

### Passo 1: Subir o Projeto para o seu GitHub
1. Abra o terminal nesta pasta do projeto.
2. Inicialize o Git (caso ainda não tenha inicializado) e faça o primeiro commit:
   ```bash
   git init
   git add .
   git commit -m "feat: monitor de ferias 2027 completo"
   ```
3. Crie um repositório no seu GitHub (ex: `projeto-ferias-2027`).
4. Conecte o repositório remoto e envie o código:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/projeto-ferias-2027.git
   git push -u origin main
   ```

### Passo 2: Ativar as Permissões do GitHub Actions (Para o Robô Rodar Sozinho)
1. No seu repositório no GitHub, clique na aba **Settings** > **Actions** > **General**.
2. Na seção **Workflow permissions**, selecione:
   - ✅ **Read and write permissions** (para permitir que o robô salve os preços atualizados no repositório).
3. Clique em **Save**.
4. (Opcional): Se tiver uma chave do Gemini, em **Settings** > **Secrets and variables** > **Actions**, adicione a secret `GEMINI_API_KEY`.

### Passo 3: Publicar o Site na Vercel (100% Grátis)
1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
2. Clique em **Add New...** > **Project**.
3. Selecione o repositório `projeto-ferias-2027` e clique em **Import**.
4. A Vercel detectará automaticamente as configurações (Vite). Basta clicar em **Deploy**.
5. Em menos de 1 minuto, seu site estará no ar com um link público (ex: `https://projeto-ferias-2027.vercel.app`).

Toda vez que o GitHub Actions rodar e atualizar as ofertas diárias, a Vercel atualizará o site automaticamente!
