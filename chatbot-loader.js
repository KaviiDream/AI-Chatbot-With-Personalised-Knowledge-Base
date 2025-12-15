(function () {
    const scriptId = "uBz514QKNAzhlYwxpJ_ev";
    const isInitialized = typeof window.chatbase === "function" && window.chatbase("getState") === "initialized";

    if (!isInitialized) {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) {
                window.chatbase.q = [];
            }
            window.chatbase.q.push(args);
        };
        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if (prop === "q") {
                    return target.q;
                }
                return (...args) => target(prop, ...args);
            }
        });
    }

    const loadScript = () => {
        const existing = document.getElementById(scriptId);
        if (existing) {
            existing.setAttribute("data-theme", document.documentElement.dataset.theme || "dark");
            return;
        }
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = scriptId;
        script.domain = "www.chatbase.co";
        script.setAttribute("data-theme", document.documentElement.dataset.theme || "dark");
        document.body.appendChild(script);
    };

    if (document.readyState === "complete") {
        loadScript();
    } else {
        window.addEventListener("load", loadScript);
    }
})();
