// Scripts obrigatórios e compatíveis para rodar o Service Worker em segundo plano
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// ====== CONFIGURAÇÃO DO FIREBASE (DEVEM SER IGUAIS AOS DO firebase-config.js) ======
const firebaseConfig = {
  apiKey: "AIzaSyA_exFw1oK-xGsksVaNTr1lAYHKswzYhGM",
  authDomain: "oer-agenda.firebaseapp.com",
  projectId: "oer-agenda",
  storageBucket: "oer-agenda.firebasestorage.app",
  messagingSenderId: "1020948916905",
  appId: "1:1020948916905:web:0fe90eb1fb1b7f183c17b8"
};

// Inicializa a instância do Firebase para o modo Em Segundo Plano
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Captura as mensagens enviadas através do Console enquanto a aba do site está fechada
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Foi recebida uma notificação Push em background.', payload);

  // Aqui forçamos a Notificação do sistema Operacional a carregar a imagem OER original!
  const notificationTitle = payload.notification.title || 'Aviso OER Agenda';
  const notificationOptions = {
    body: payload.notification.body,
    // Corrigindo para os ícones funcionarem nos repositórios GitHub Pages
    icon: './assets/img/favicon-final.png', 
    badge: './assets/img/favicon-final.png',
    data: {
      // Usaremos o "data" para transferir a URL destino para o evento de clique
      click_action: payload.fcmOptions?.link || payload.notification.click_action || 'https://borisromaoantunes.github.io/agenda-e-temporada/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ====== ROTEAMENTO AO CLICAR NA NOTIFICAÇÃO ======
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Usuário clicou na notificação.');
  event.notification.close();

  // Usa o link de ação preenchido (ou a URL oficial padrão como Fallback)
  const targetUrl = event.notification.data.click_action;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // Se já houver uma aba aberta com esse link exato, apenas traz ela pro foco
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('borisromaoantunes.github.io/agenda-e-temporada') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma aba novinha em folha com o site oficial
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
