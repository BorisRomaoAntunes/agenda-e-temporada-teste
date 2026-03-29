# Implementação do OneSignal (Backend e Frontend)

Este documento contém todo o código e as configurações realizadas para o funcionamento do sistema de **Web Push Notifications via OneSignal**. Use este arquivo como referência para reimplementar as notificações futuramente.

---

## 1. Content-Security-Policy (CSP) no `index.html`

No cabeçalho (`<head>`) do arquivo `index.html`, a meta tag da CSP precisa autorizar os domínios do OneSignal (`api`, `cdn` etc.) no `script-src` e `connect-src`. A tag final usada foi:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.onesignal.com https://onesignal.com https://*.onesignal.com; connect-src 'self' https://onesignal.com https://*.onesignal.com https://api.onesignal.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://onesignal.com https://*.onesignal.com; frame-src 'self' blob:; object-src 'self'; base-uri 'self'; form-action 'self';">
```

---

## 2. Injeção do SDK do OneSignal no `index.html`

Ainda no `<head>`, foi inserido o SDK:

```html
<!-- Inicialização do SDK do OneSignal -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "85f27f32-36dc-467f-a07b-0523f7300f45",
    });
  });
</script>
```

---

## 3. Estrutura HTML do Painel (Sininho) no `index.html`

No final do `<body>` (antes do script do `notification.js` e do Botão de Feedback):

```html
<!-- Botão de Notificação Flutuante e Painel -->
<div id="notification-container" class="notification-container">
    <!-- Botão/Sino -->
    <button id="notification-trigger" class="notification-trigger" aria-label="Ativar Notificações">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="notification-badge">1</span>
    </button>

    <!-- Painel de Dúvida / iOS -->
    <div class="notification-panel" id="notification-panel">
        <button class="notification-close" id="notification-close" aria-label="Fechar" title="Fechar painel">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="notification-content">
            <h3>Avisos da Produção</h3>
            
            <p id="notification-question">Deseja receber notificações sobre novos cronogramas de ensaio?</p>

            <!-- Passo-A-Passo iOS Inicialmente Escondido -->
            <div id="notification-ios-guide" class="ios-push-guide" style="display: none;">
                <p>Para ativar no iPhone/iPad, você precisa instalar o visualizador:</p>
                <ol>
                    <li>Toque em "Compartilhar" ou no botão dos três pontinhos (na aba inferior).</li>
                    <li>Selecione <strong>"Adicionar à Tela de Início"</strong> <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></li>
                    <li>Pronto! Tudo certo. Abra-o a partir da Tela de Início!</li>
                </ol>
            </div>

            <div class="notification-actions" id="notification-actions">
                <button class="btn-notify-no" id="btn-notify-no">Agora não</button>
                <button class="btn-notify-yes" id="btn-notify-yes">Eu quero</button>
            </div>
        </div>
    </div>
</div>
```

E no fim do `<body>` foi importado o JS do componente:
```html
<script src="assets/js/notification.js"></script>
```

---

## 4. Estilos (CSS) no `assets/css/style.css`

Os seguintes blocos foram adicionados ao final do `style.css`:

```css
/* ============================================
   SISTEMA DE NOTIFICAÇÃO FLUTUANTE (OneSignal)
   ============================================ */

/* Container geral — canto inferior direito, 5px acima do botão de feedback */
/* feedback desktop: bottom 2rem (32px) + altura 65px = topo em 97px | sino: 97+5 = 102px */
.notification-container {
    position: fixed;
    bottom: 102px;
    right: 2rem;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0; /* sem gap interno — o painel abre acima via CSS */
    transition: opacity 0.5s ease;
}

/* Botão Flutuante (Sino) */
.notification-trigger {
    position: relative;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #8B0000 0%, #A52A2A 100%);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(139, 0, 0, 0.45);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: bell-pulse 3s ease-in-out infinite;
}

.notification-trigger svg {
    width: 30px;
    height: 30px;
    transition: transform 0.3s ease;
}

.notification-trigger:hover {
    transform: scale(1.12);
    box-shadow: 0 8px 28px rgba(255, 215, 0, 0.55);
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #8B0000;
}

.notification-trigger:hover svg {
    transform: rotate(-15deg);
}

/* Bolinha vermelha de alerta */
.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4444;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    animation: badge-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

/* Animação de chacoalhar (shake) do sino */
@keyframes bell-shake {
    0%   { transform: rotate(0deg);   }
    10%  { transform: rotate(-18deg); }
    20%  { transform: rotate(18deg);  }
    30%  { transform: rotate(-14deg); }
    40%  { transform: rotate(14deg);  }
    50%  { transform: rotate(-8deg);  }
    60%  { transform: rotate(8deg);   }
    70%  { transform: rotate(-4deg);  }
    80%  { transform: rotate(4deg);   }
    90%  { transform: rotate(0deg);   }
    100% { transform: rotate(0deg);   }
}

/* Classe aplicada via JS para disparar o shake */
.notification-trigger.shake svg {
    animation: bell-shake 0.7s ease;
}

/* Quando usuário recusou: botão aparece mas sem nenhuma animação */
.notification-trigger.no-anim {
    animation: none;
}
.notification-trigger.no-anim svg {
    animation: none;
}

@keyframes badge-pop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
}

/* Painel de Convite — posicionado acima do botão de sino */
.notification-panel {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0,0,0,0.08);
    width: 300px;
    padding: 1.25rem 1.25rem 1.25rem;
    position: absolute;
    bottom: calc(100% + 10px); /* aparece acima do sino */
    right: 0;
    border-top: 4px solid var(--primary-color);

    /* Estado inicial: escondido e deslocado para baixo */
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px) scale(0.97);
    transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Quando o painel está aberto */
.notification-panel.open {
    opacity: 1;
    pointer-events: all;
    transform: translateY(0) scale(1);
}

/* Botão de fechar (X) */
.notification-close {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    transition: background 0.2s ease, color 0.2s ease;
}

.notification-close:hover {
    background: #f0f0f0;
    color: var(--primary-color);
}

.notification-close svg {
    width: 16px;
    height: 16px;
}

/* Conteúdo interno */
.notification-content h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    padding-right: 1.5rem;
}

.notification-content > p,
.notification-content #notification-question {
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 1rem;
}

/* Botões de Ação */
.notification-actions {
    display: flex;
    gap: 0.6rem;
    justify-content: flex-end;
}

.btn-notify-no {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    font-family: var(--font-family);
    transition: all 0.2s ease;
}

.btn-notify-no:hover {
    background: #f5f5f5;
    border-color: #bbb;
    color: var(--text-primary);
}

.btn-notify-yes {
    padding: 0.5rem 1.1rem;
    border: none;
    background: var(--primary-color);
    color: #fff;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-notify-yes:hover {
    background: #FFD700;
    color: var(--primary-color);
    transform: scale(1.05);
}

/* Guia Passo a Passo para iOS */
.ios-push-guide {
    background: #fff9f0;
    border: 1px solid #ffe0b0;
    border-radius: 10px;
    padding: 0.9rem 1rem;
    margin-bottom: 0.75rem;
}

.ios-push-guide > p {
    font-size: 0.82rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.6rem !important;
}

.ios-push-guide ol {
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.ios-push-guide li {
    font-size: 0.82rem;
    color: var(--text-secondary);
    line-height: 1.45;
}

.ios-push-guide li strong {
    color: var(--primary-color);
}

/* Responsividade Mobile */
/* feedback mobile: bottom 1.5rem (24px) + altura 55px = topo em 79px */
/* sino mobile: bottom = 79px + 5px = 84px */
@media (max-width: 768px) {
    .notification-container {
        bottom: 84px;
        right: 1.5rem; /* idêntico ao right do .btn-feedback mobile */
    }

    .notification-trigger {
        width: 55px;
        height: 55px;
    }

    .notification-trigger svg {
        width: 26px;
        height: 26px;
    }

    .notification-panel {
        width: calc(100vw - 2rem);
        max-width: 320px;
    }
}
```

---

## 5. Lógica Interativa (JavaScript)

Todo o código abaixo estava no arquivo `assets/js/notification.js`:

```javascript
// ── Ocultação imediata (antes do DOMContentLoaded) ────────────────────────
// Garante que o botão some SEM piscar para quem já aceitou.
(function() {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            var responded = window.localStorage.getItem("oer_notification_responded");
            var declined  = window.localStorage.getItem("oer_notification_declined");
            if (responded === "true" && declined !== "true") {
                var style = document.createElement("style");
                style.textContent = "#notification-container { display: none !important; }";
                document.head.appendChild(style);
            }
        }
    } catch(e) { /* Safari file:// pode bloquear localStorage — ignora e mostra o botão */ }
})();

// ── Lógica principal após o DOM estar pronto ───────────────────────────────
document.addEventListener("DOMContentLoaded", function() {

    // Helpers de localStorage à prova de erros
    function lsGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
    function lsSet(key, val) { try { localStorage.setItem(key, val); } catch(e) { /* silent */ } }

    // Referências do DOM
    var container    = document.getElementById("notification-container");
    var trigger      = document.getElementById("notification-trigger");
    var panel        = document.getElementById("notification-panel");
    var closeBtn     = document.getElementById("notification-close");
    var btnSim       = document.getElementById("btn-notify-yes");
    var btnNao       = document.getElementById("btn-notify-no");
    var questionText = document.getElementById("notification-question");
    var iosGuide     = document.getElementById("notification-ios-guide");
    var actionsGroup = document.getElementById("notification-actions");

    // Segurança: sai silenciosamente se algum elemento não existir
    if (!container || !trigger || !panel || !closeBtn || !btnSim || !btnNao) return;

    // Detecção de iOS
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
             || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Estado salvo
    var HAS_RESPONDED = lsGet("oer_notification_responded");
    var USER_DECLINED  = lsGet("oer_notification_declined");

    // Se já aceitou o fluxo completo: esconde tudo (garantia extra)
    if (HAS_RESPONDED && !USER_DECLINED) {
        container.style.display = "none";
        return;
    }

    // Se recusou antes: retira animações
    if (USER_DECLINED) {
        trigger.classList.add("no-anim");
    }

    // ── Animação de shake no sino ──────────────────────────────────────────
    var shakeInterval = null;

    function doShake() {
        trigger.classList.remove("shake");
        void trigger.offsetWidth; // força reflow
        trigger.classList.add("shake");
        setTimeout(function() { trigger.classList.remove("shake"); }, 700);
    }

    function startShakeLoop() {
        doShake();
        shakeInterval = setInterval(doShake, 3000);
    }

    function stopShakeLoop() {
        clearInterval(shakeInterval);
        shakeInterval = null;
    }

    // Inicia animação apenas se ainda não declinou
    if (!USER_DECLINED) {
        startShakeLoop();
    }

    // ── Ocultação permanente (aceitou o fluxo) ─────────────────────────────
    function hidePermanently() {
        stopShakeLoop();
        container.style.opacity = "0";
        setTimeout(function() {
            container.style.display = "none";
            lsSet("oer_notification_responded", "true");
        }, 500);
    }

    // ── Recusa: fecha painel, mantém botão sem animação ────────────────────
    function handleDecline() {
        panel.classList.remove("open");
        stopShakeLoop();
        trigger.classList.add("no-anim");
        lsSet("oer_notification_declined", "true");
    }

    // ── Eventos ────────────────────────────────────────────────────────────
    trigger.addEventListener("click", function() {
        panel.classList.toggle("open");
    });

    closeBtn.addEventListener("click", function() { handleDecline(); });
    btnNao.addEventListener("click",   function() { handleDecline(); });

    btnSim.addEventListener("click", function() {
        stopShakeLoop();

        if (isIOS) {
            if (questionText) questionText.style.display = "none";
            if (actionsGroup) actionsGroup.style.display = "none";
            if (iosGuide)     iosGuide.style.display     = "block";
            lsSet("oer_notification_responded", "true");
        } else {
            panel.classList.remove("open");
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(function(OneSignal) {
                try {
                    OneSignal.Notifications.requestPermission().then(function() {
                        hidePermanently();
                    }).catch(function() {
                        hidePermanently();
                    });
                } catch(e) {
                    console.log("OneSignal:", e);
                    hidePermanently();
                }
            });
        }
    });
});
```

*(Fim do documento)*
