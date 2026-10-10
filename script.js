


/* ==========================================
   HUB-SOCIETY // ARG INTERACTIVE SYSTEM
   Version 1.0
   ========================================== */

(() => {
    "use strict";

    const CONFIG = {
        typingSpeed: 22,
        revealDelay: 100,
        glitchChance: 0.025,
        enableSound: true
    };

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // ------------------------------------------
    // 1. SISTEMA DE ESTADO
    // ------------------------------------------

    const state = {
        initialized: false,
        soundEnabled: false,
        audioContext: null,
        bootFinished: false
    };

    // ------------------------------------------
    // 2. AÑADIR CLASES DE ANIMACIÓN
    // ------------------------------------------

    document.documentElement.classList.add("js-enabled");

    // ------------------------------------------
    // 3. RELOJ DIGITAL
    // ------------------------------------------

    function updateClock() {
        const now = new Date();

        const time = now.toLocaleTimeString("es", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        const clock = $("#system-clock");

        if (clock) {
            clock.textContent = time;
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // ------------------------------------------
    // 4. REVELAR ELEMENTOS AL DESPLAZARSE
    // ------------------------------------------

    const revealElements = $$(
        ".section, .project-card, .secret-file, .manifesto"
    );

    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element, index) => {
            element.classList.add("reveal");

            element.style.setProperty(
                "--reveal-delay",
                `${(index % 4) * CONFIG.revealDelay}ms`
            );

            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    }

    // ------------------------------------------
    // 5. EFECTO DE TEXTO ESCRIBIÉNDOSE
    // ------------------------------------------

    function typeText(element, text, speed = CONFIG.typingSpeed) {
        return new Promise((resolve) => {
            if (!element || reduceMotion) {
                if (element) element.textContent = text;
                resolve();
                return;
            }

            element.textContent = "";

            let index = 0;

            const timer = setInterval(() => {
                element.textContent += text.charAt(index);
                index++;

                if (index >= text.length) {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    // ------------------------------------------
    // 6. EFECTO GLITCH EN LOS ENCABEZADOS
    // ------------------------------------------

    const glitchCharacters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&";

    function glitchText(element) {
        if (reduceMotion || element.dataset.glitching === "true") {
            return;
        }

        const original = element.dataset.originalText ||
            element.textContent.trim();

        element.dataset.originalText = original;
        element.dataset.glitching = "true";

        let iterations = 0;

        const interval = setInterval(() => {
            element.textContent = original
                .split("")
                .map((character, index) => {
                    if (index < iterations) return original[index];

                    if (character === " ") return " ";

                    return glitchCharacters[
                        Math.floor(
                            Math.random() * glitchCharacters.length
                        )
                    ];
                })
                .join("");

            iterations += 1;

            if (iterations > original.length) {
                clearInterval(interval);
                element.textContent = original;
                element.dataset.glitching = "false";
            }
        }, 35);
    }

    $$(".hero h1, .section h2, .manifesto h2").forEach((heading) => {
        heading.addEventListener("click", () => {
            glitchText(heading);
        });

        heading.title = "Pulsa para interferir con la señal";
    });

    // ------------------------------------------
    // 7. INTERFERENCIA ALEATORIA
    // ------------------------------------------

    function randomGlitch() {
        if (
            reduceMotion ||
            document.hidden ||
            Math.random() > CONFIG.glitchChance
        ) {
            return;
        }

        document.body.classList.add("signal-interference");

        setTimeout(() => {
            document.body.classList.remove("signal-interference");
        }, 180);
    }

    setInterval(randomGlitch, 1800);

    // ------------------------------------------
    // 8. NAVEGACIÓN ACTIVA
    // ------------------------------------------

    const navigationLinks = $$(
        '.site-header nav a[href^="#"]'
    );

    const sections = navigationLinks
        .map((link) => $(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navigationLinks.forEach((link) => {
                        const active =
                            link.getAttribute("href") ===
                            `#${entry.target.id}`;

                        if (active) {
                            link.setAttribute("aria-current", "location");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-20% 0px -65% 0px"
            }
        );

        sections.forEach((section) => navObserver.observe(section));
    }

    navigationLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = $(link.getAttribute("href"));

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: reduceMotion ? "auto" : "smooth",
                block: "start"
            });

            history.replaceState(
                null,
                "",
                link.getAttribute("href")
            );
        });
    });

    // ------------------------------------------
    // 9. ARCHIVOS SECRETOS
    // ------------------------------------------

    $$(".secret-file").forEach((file, index) => {
        const summary = $("summary", file);
        const content = $$("pre", file);

        file.addEventListener("toggle", () => {
            if (!file.open) return;

            file.classList.add("file-opened");

            if (summary) {
                summary.setAttribute("aria-expanded", "true");
            }

            content.forEach((block) => {
                block.classList.add("decoded-animation");
            });

            showToast(
                `ARCHIVO ${String(index + 5).padStart(3, "0")}: REGISTRO ABIERTO`
            );
        });

        if (summary) {
            summary.setAttribute("aria-expanded", "false");
        }
    });

    // ------------------------------------------
    // 10. COPIAR CÓDIGOS SECRETOS
    // ------------------------------------------

    $$("pre").forEach((block) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "copy-secret";
        button.textContent = "COPIAR CÓDIGO";

        block.insertAdjacentElement("afterend", button);

        button.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);

                button.textContent = "COPIADO ✓";

                showToast("REGISTRO COPIADO AL PORTAPAPELES");
            } catch {
                button.textContent =
                    "NO DISPONIBLE: SELECCIONA EL TEXTO";

                showToast(
                    "Selecciona y copia el código manualmente"
                );
            }

            setTimeout(() => {
                button.textContent = "COPIAR CÓDIGO";
            }, 2200);
        });
    });

    // ------------------------------------------
    // 11. NOTIFICACIONES DEL SISTEMA
    // ------------------------------------------

    let toastTimer;

    function showToast(message) {
        let toast = $("#system-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "system-toast";
            toast.className = "system-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");

            document.body.appendChild(toast);
        }

        toast.textContent = `> ${message}`;
        toast.classList.add("toast-visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("toast-visible");
        }, 3000);
    }

    // ------------------------------------------
    // 12. BOTÓN VOLVER ARRIBA
    // ------------------------------------------

    const backToTop = document.createElement("button");

    backToTop.type = "button";
    backToTop.className = "back-to-top";
    backToTop.textContent = "↑";
    backToTop.setAttribute("aria-label", "Volver al inicio");

    document.body.appendChild(backToTop);

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? "auto" : "smooth"
        });
    });

    window.addEventListener(
        "scroll",
        () => {
            backToTop.classList.toggle(
                "back-to-top-visible",
                window.scrollY > 450
            );
        },
        { passive: true }
    );

    // ------------------------------------------
    // 13. SONIDOS OPCIONALES
    // ------------------------------------------

    function playTone(frequency = 440, duration = 0.06) {
        if (!state.soundEnabled || !CONFIG.enableSound) return;

        try {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return;

            if (!state.audioContext) {
                state.audioContext = new AudioContextClass();
            }

            const context = state.audioContext;

            if (context.state === "suspended") {
                context.resume();
            }

            const oscillator = context.createOscillator();
            const gain = context.createGain();

            oscillator.type = "square";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.025, context.currentTime);

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + duration);
        } catch (error) {
            console.warn("Audio no disponible:", error);
        }
    }

    const soundButton = document.createElement("button");

    soundButton.type = "button";
    soundButton.className = "sound-toggle";
    soundButton.textContent = "SONIDO: OFF";

    soundButton.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;

        soundButton.textContent = state.soundEnabled
            ? "SONIDO: ON"
            : "SONIDO: OFF";

        showToast(
            state.soundEnabled
                ? "SISTEMA DE AUDIO ACTIVADO"
                : "SISTEMA DE AUDIO DESACTIVADO"
        );

        if (state.soundEnabled) {
            playTone(620, 0.1);
        }
    });

    document.body.appendChild(soundButton);

    document.addEventListener("click", (event) => {
        if (event.target.closest("button, a, summary")) {
            playTone(520, 0.035);
        }
    });

    // ------------------------------------------
    // 14. ESTADO DE CONEXIÓN
    // ------------------------------------------

    function updateConnection() {
        let indicator = $("#connection-status");

        if (!indicator) {
            indicator = document.createElement("div");
            indicator.id = "connection-status";
            indicator.className = "connection-status";

            const header = $(".site-header .container") ||
                $(".site-header");

            if (header) {
                header.appendChild(indicator);
            } else {
                document.body.appendChild(indicator);
            }
        }

        indicator.textContent = navigator.onLine
            ? "● CONEXIÓN DISPONIBLE"
            : "● SIN CONEXIÓN";

        indicator.classList.toggle(
            "connection-offline",
            !navigator.onLine
        );
    }

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    updateConnection();

    // ------------------------------------------
    // 15. MENSAJE DE INICIO
    // ------------------------------------------

    async function bootSequence() {
        if (state.bootFinished) return;

        state.bootFinished = true;

        console.info(
            "%cHUB-SOCIETY",
            "color:#39ff88;font-size:24px;font-weight:bold"
        );

        console.info(
            "%cSistema de interfaz iniciado.",
            "color:#39ff88"
        );

        const status = $(".hero .status");

        if (status && !reduceMotion) {
            const original = status.textContent.trim();

            await typeText(status, original, 18);
        }

        document.body.classList.add("system-ready");

        showToast("SISTEMA HUB-SOCIETY INICIADO");
    }

    // ------------------------------------------
    // 16. INICIALIZACIÓN
    // ------------------------------------------

    function initialize() {
        if (state.initialized) return;

        state.initialized = true;

        updateClock();
        bootSequence();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }

})();
