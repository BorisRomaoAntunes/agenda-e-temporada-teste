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
                    OneSignal.slidedown.promptPush().then(function() {
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
