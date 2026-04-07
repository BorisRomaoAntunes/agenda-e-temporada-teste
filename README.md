# 🚧 Ambiente de Teste - Visualizador de Agenda Digital (OER) 🚧

> **Atenção:** Este repositório é exclusivo para fins de **teste e experimentação**. Contém layouts diferenciados (como a fita zebrada superior) e não possui garantia de informações atualizadas da orquestra.

Este é um ambiente isolado do site de visualização da agenda de ensaios e temporada da **Orquestra Experimental de Repertório (OER)**. Foi criado para testar novas funcionalidades estruturais e visuais de forma totalmente segura e sem afetar a versão de produção.

⚠️ **Acesse o Ambiente de TESTE:** [https://borisromaoantunes.github.io/agenda-e-temporada-teste/](https://borisromaoantunes.github.io/agenda-e-temporada-teste/)

🌐 **Acesse o Site OFICIAL:** [https://borisromaoantunes.github.io/agenda-e-temporada/](https://borisromaoantunes.github.io/agenda-e-temporada/)

---

## ✨ Funcionalidades Principais

-   **Carregamento Dinâmico:** Os arquivos PDF são configurados via JSON, facilitando a troca sem mexer no HTML.
-   **Sistema de Badges Inteligentes (Selo OER):**
    -   Exibe um "selo" de nova versão (v1.2, v2.0, etc) rotacionado em 25º no estilo carimbo.
    -   **Remoção Inteligente (Desktop):** O selo desaparece suavemente ao detectar qualquer movimento do mouse ou clique, limpando a visão para o músico.
    -   **Persistência:** O sistema lembra se o músico já viu aquela versão (usando localStorage), ocultando o badge em acessos futuros.
-   **Design Premium:** Interface limpa, modo escuro elegante e tipografia moderna (Inter).
-   **Responsividade:** Otimizado para visualização em tablets/computadores e acesso rápido via botões no celular.

---

## 🚀 Como Atualizar os PDFs

Para atualizar a temporada ou agenda no site, siga estes passos:

1.  **Prepare o arquivo:** Nomeie o PDF terminando com a versão (ex: `Agenda_v4.2.pdf`).
2.  **Upload:** Coloque o novo arquivo na pasta `assets/files/`.
3.  **Configuração:** Abra `pdf-config.json` e atualize o campo `arquivo` do PDF correspondente:
    ```json
    "agenda": {
        "arquivo": "Agenda_v4.2.pdf",
        "titulo": "Agenda de Ensaios"
    }
    ```
4.  **Publicar:** Faça o **commit** e **push** para o GitHub. O site será atualizado automaticamente!

---

## 🛠 Estrutura Técnica

-   `index.html`: Estrutura base e visualizadores.
-   `pdf-config.json`: "Cérebro" do site, onde se define o que está no ar.
-   `assets/js/version-tracker.js`: Controla a lógica de versões, selos e interações, além da triagem de acesso PWA/iOS.
-   `assets/css/style.css`: Estilização completa e efeitos visuais.

---

## 🔔 Sistema de Notificações Push (Firebase FCM)

O site possui sistema completo de **Web Push Notifications** manual implementado via **Firebase Cloud Messaging**.
*   **Contorno de iOS (Apple):** A estrutura de código possui detecção de aparelho Apple isolando as notificações no Safari. O OER agenda exibe um Popup educando o usuário de iPhone a instalar em **PWA (App de Tela de Início)** para só então conceder o token de Notificação, cumprindo com as exigências da Apple.
*   **Foco Inteligente:** Scripts ajustados para, ao clicar via computador numa notificação recebida externamente, o navegador apenas puxar a aba já aberta em vez de sobrecarregar com janelas desnecessárias.

**Credenciais e Arquivos (Uso Público SDK)**
Os scripts `assets/js/firebase-config.js` e `firebase-messaging-sw.js` carregam a `firebaseConfig` da aplicação Web no Firebase OER, juntamente à `VAPID_KEY` de certificado do navegador. A exposição destas chaves é requerimento normal da tecnologia Web de Firebase Client. Caso copie a arquitetura, tenha ciência de usar novos ID's gerados via Firebase Console.

---
© 2025 Projeto OER. Desenvolvido por Boris Romão Antunes.
