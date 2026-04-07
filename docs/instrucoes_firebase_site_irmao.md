# Guia de Implementação de Notificações Push (Firebase) para o Site Irmão

Este documento contém todas as instruções necessárias para que você (IA Assistente) replique exatamente o sistema de notificações Web Push que construímos no projeto "OER Agenda". Siga a risca os passos abaixo.

## 1. Tratamento do Favicon (Ícone do Push)
- É obrigatório possuir uma imagem PNG de formato quadrado (ex: 192x192 ou 512x512) com fundo sólido (idealmente opaco/branco).
- Insira este arquivo em `assets/img/favicon-final.png`.
- Adicione as seguintes tags no `<head>` do `index.html`:
```html
<link rel="icon" type="image/x-icon" href="./assets/img/favicon-final.png">
<link rel="apple-touch-icon" href="./assets/img/favicon-final.png">
```

## 2. Ajuste de Segurança (Content-Security-Policy)
Para o Firebase funcionar, você precisa atualizar a tag de `<meta http-equiv="Content-Security-Policy">` no `index.html`. Permita conexões externas (script-src e connect-src) com o Google:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://firebasestorage.googleapis.com; frame-src 'self' blob:; object-src 'self'; base-uri 'self'; form-action 'self';">
```

## 3. Configuração do SDK do Firebase (`assets/js/firebase-config.js`)
Crie no projeto o arquivo `assets/js/firebase-config.js` usando exatamente o modelo abaixo. 
**NOTA PARA A OUTRA IA:** Use as chaves abaixo CASO o site irmão vá compartilhar o *mesmo banco Firebase de disparos*. Se for criar um painel Firebase do zero para ele independente, substitua as chaves:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

// SUBSTITUA PELOS DADOS DO FIREBASE SE FOR PROJETO NOVO
export const firebaseConfig = {
  apiKey: "AIzaSyA_exFw1oK-xGsksVaNTr1lAYHKswzYhGM",
  authDomain: "oer-agenda.firebaseapp.com",
  projectId: "oer-agenda",
  storageBucket: "oer-agenda.firebasestorage.app",
  messagingSenderId: "1020948916905",
  appId: "1:1020948916905:web:0fe90eb1fb1b7f183c17b8"
};

// VAPID KEY PÚBLICA GERADA NA ABA CLOUD MESSAGING
const VAPID_KEY = "BBAdQPGa4tQ3tJYodKvQHLqC2T8-J38SV3U4y2HGCDgKCsH6G74Jjk8lKRPXYtZ5AbzCu7baF25rm7045PJszko";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

window.requestFirebaseNotificationPermission = async () => {
    try {
        console.log('[Firebase] Solicitando permissão para notificações...');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('[Firebase] Permissão concedida. Registrando SW e Gerando Token...');
            
            // Registro explícito do Service Worker suportando subdiretórios (ex GitHub Pages)
            const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
                                
            const currentToken = await getToken(messaging, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration 
            });
            
            if (currentToken) {
                console.log('[Firebase] Sucesso! Token gerado:', currentToken);
                alert("🎉 Pronto! Você será avisado sempre que novos cronogramas forem disponibilizados.");
                localStorage.setItem("oer_notification_responded", "true");
                return true;
            } else {
                console.warn('[Firebase] Não foi possível gerar um token.');
            }
        } else {
            localStorage.setItem("oer_notification_declined", "true");
        }
    } catch (err) {
        console.error('[Firebase] Ocorreu um erro ao inscrever dispositivo:', err);
    }
    return false;
}

// Receptor Foreground (Quando site está na aba aberta ativa)
onMessage(messaging, (payload) => {
    alert(`Novo Aviso: ${payload.notification.title}\n\n${payload.notification.body}`);
});
```

Não se esqueça de referenciar este script como 'module' no HTML (`<script type="module" src="./assets/js/firebase-config.js"></script>`).

## 4. O Service Worker Background (`firebase-messaging-sw.js`)
Crie na **RAIZ** do projeto o arquivo `firebase-messaging-sw.js` exatamente como abaixo para garantir que cliques nas notificações reabram o site na aba correta.

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA_exFw1oK-xGsksVaNTr1lAYHKswzYhGM",
  authDomain: "oer-agenda.firebaseapp.com",
  projectId: "oer-agenda",
  storageBucket: "oer-agenda.firebasestorage.app",
  messagingSenderId: "1020948916905",
  appId: "1:1020948916905:web:0fe90eb1fb1b7f183c17b8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'Aviso Agenda';
  const notificationOptions = {
    body: payload.notification.body,
    icon: './assets/img/favicon-final.png', 
    badge: './assets/img/favicon-final.png',
    data: {
      click_action: payload.fcmOptions?.link || payload.notification.click_action || 'https://link-oficial-do-seu-novo-site.com'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data.click_action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('sua-url-aqui') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
```

## 5. Gatilho do Front-End e Restrição do iOS
Esta é a regra de ouro para a interface. No seu script de interface do site (ex `version-tracker.js`):
1. Detecte se é dispositivo iOS usando a checagem no `userAgent` (`/iPad|iPhone|iPod/.test(userAgent)`).
2. Detecte se é PWA usando `window.navigator.standalone`.
3. Ao clicar no botão de aceitar notificação ("Sino -> SIM"):
   - Se for iOS E NÃO FOR Standalone: Abra um Modal Customizado informando que a Apple bloqueia notificações e peça para ele clicar em Compartilhar > Adicionar à Tela de Início.
   - Qualquer outro cenário (Desktop, Android, PWA iOS): Dispare `window.requestFirebaseNotificationPermission()` para subir o prompt nativo.
