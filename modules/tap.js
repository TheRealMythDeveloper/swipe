
const Tap = {
    interval: null,
    timeout: null,

    cleanup() {
        clearInterval(this.interval);
        clearTimeout(this.timeout);
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        container.innerHTML = "";
        container.style.position = "relative";
        container.style.overflow = "hidden";

        let hits = 0;
        let target = null;
        let finished = false;
        const required = 7 + difficulty;

        const label = document.createElement("div");
        label.style.cssText = "position:absolute;top:14px;left:50%;transform:translateX(-50%);font-size:18px;color:white;z-index:2;";
        label.textContent = `TARGETS: 0 / ${required}`;
        container.appendChild(label);

        const spawn = () => {
            if (finished) return;

            if (target) target.remove();

            const size = Math.max(34, 62 - difficulty * 4);
            target = document.createElement("button");
            target.type = "button";
            target.textContent = String(hits + 1);
            target.style.cssText = `
                position:absolute;
                width:${size}px;
                height:${size}px;
                border:2px solid #55d6be;
                border-radius:50%;
                background:#182c32;
                color:white;
                font-size:20px;
                cursor:pointer;
                transform:translate(-50%,-50%);
            `;

            const x = 8 + Math.random() * 84;
            const y = 15 + Math.random() * 75;

            target.style.left = x + "%";
            target.style.top = y + "%";

            target.addEventListener("pointerdown", event => {
                event.stopPropagation();
                if (finished) return;

                hits++;
                label.textContent = `TARGETS: ${hits} / ${required}`;
                target.remove();
                target = null;

                if (hits >= required) {
                    finished = true;
                    onComplete(true);
                } else {
                    this.timeout = setTimeout(spawn, 150);
                }
            });

            container.appendChild(target);

            this.timeout = setTimeout(() => {
                if (finished) return;
                if (target) target.remove();
                target = null;
                spawn();
            }, Math.max(900, 1800 - difficulty * 150));
        };

        spawn();

        this.cleanup = () => {
            clearTimeout(this.timeout);
            clearInterval(this.interval);
            if (target) target.remove();
        };
    }
};
