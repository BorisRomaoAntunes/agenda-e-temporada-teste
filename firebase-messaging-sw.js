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
    icon: '/assets/img/favicon-final.png', 
    badge: '/assets/img/favicon-final.png' // Ajuda para navegadores Mobile
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
