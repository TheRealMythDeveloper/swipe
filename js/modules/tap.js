const Tap = {
    container: null,
    onComplete: null,
    targets: [],
    sequence: [],
    current: 0,
    required: 5,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.current = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;
        this.targets = [];

        this.sequence = Array.from(
            { length: this.required },
            (_, i) => i + 1
        );

        const shuffled = [...this.sequence].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;color:#54d6e8">
                <div class="tap-instructions" style="position:absolute;top:12px;width:100%;text-align:center">
                    TAP IN ORDER: 1 → ${this.required}
                </div>
                <div class="tap-targets"></div>
                <div class="tap-progress" style="position:absolute;bottom:12px;width:100%;text-align:center">
                    0 / ${this.required}
                </div>
            </div>
        `;

        const layer = container.querySelector(".tap-targets");

        shuffled.forEach(number => {
            const button = document.createElement("button");

            button.textContent = number;

            Object.assign(button.style, {
                position: "absolute",
                left: `${10 + Math.random() * 75}%`,
                top: `${20 + Math.random() * 55}%`,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid #54d6e8",
                background: "#171a24",
                color: "#54d6e8",
                fontSize: "18px",
                cursor: "pointer"
            });

            button.addEventListener("click", () => this.select(number, button));

            layer.appendChild(button);
            this.targets.push(button);
        });
    },

    select(number, button) {
        if (!this.active) return;

        if (number !== this.current + 1) {
            this.current = 0;
            this.container.querySelector(".tap-progress").textContent =
                "WRONG ORDER! START AGAIN";

            this.targets.forEach(target => {
                target.disabled = false;
                target.style.opacity = "1";
            });

            return;
        }

        this.current++;
        button.disabled = true;
        button.style.opacity = "0.25";

        this.container.querySelector(".tap-progress").textContent =
            `${this.current} / ${this.required}`;

        if (this.current >= this.required) {
            this.active = false;
            this.onComplete?.();
        }
    },

    cleanup() {
        this.active = false;
        this.targets = [];
        this.container = null;
    }
};