const Combo = {
    timeout: null,
    cleanup() {
        clearTimeout(this.timeout);
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        container.innerHTML = "";
        container.style.position = "relative";

        let round = 0;
        let finished = false;
        let current = null;

        const required = 5 + difficulty;

        const instruction = document.createElement("div");
        instruction.style.cssText = "position:absolute;top:12%;left:0;width:100%;text-align:center;color:white;font-size:24px;font-weight:bold;";
        container.appendChild(instruction);

        const area = document.createElement("div");
        area.style.cssText = "position:absolute;inset:25% 8% 8%;";
        container.appendChild(area);

        const next = () => {
            if (finished) return;

            area.innerHTML = "";
            round++;

            if (round > required) {
                finished = true;
                onComplete(true);
                return;
            }

            const type = Math.floor(Math.random() * 3);
            const button = document.createElement("button");
            button.type = "button";

            button.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:100px;border:2px solid #55d6be;background:#202c32;color:white;font-size:24px;border-radius:8px;cursor:pointer;";

            if (type === 0) {
                current = "CLICK";
                button.textContent = "CLICK";
                button.addEventListener("pointerdown", next, { once: true });
            } else if (type === 1) {
                current = "HOLD";
                button.textContent = "HOLD";
                let held = false;
                button.addEventListener("pointerdown", () => {
                    held = true;
                    button.textContent = "RELEASE";
                    this.timeout = setTimeout(() => {
                        if (held) next();
                    }, 650);
                });
                button.addEventListener("pointerup", () => {
                    held = false;
                    clearTimeout(this.timeout);
                });
                button.addEventListener("pointerleave", () => {
                    held = false;
                    clearTimeout(this.timeout);
                });
            } else {
                current = "DOUBLE";
                button.textContent = "DOUBLE";
                let clicks = 0;
                button.addEventListener("pointerdown", () => {
                    clicks++;
                    if (clicks >= 2) next();
                });
            }

            instruction.textContent = `COMBO ${round} / ${required}  |  ${current}`;
            area.appendChild(button);
        };

        next();

        this.cleanup = () => {
            clearTimeout(this.timeout);
            area.innerHTML = "";
        };
    }
};
