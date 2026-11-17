
const Combo = {
    container: null,
    onComplete: null,
    difficulty: 1,
    sequence: [],
    current: 0,
    active: false,
    startPoint: null,
    prompt: null,
    button: null,

    start(container, onComplete, difficulty = 1) {
        this.container = container;
        this.onComplete = onComplete;
        this.difficulty = difficulty;
        this.current = 0;
        this.active = true;

        const actions = ["UP", "DOWN", "LEFT", "RIGHT", "TAP"];
        const length = 5 + Math.floor(difficulty);

        this.sequence = Array.from({ length }, () =>
            actions[Math.floor(Math.random() * actions.length)]
        );

        container.innerHTML = `
            <div style="text-align:center;color:white;padding:12px;">
                <h2>COMBO</h2>
                <p>Complete the sequence!</p>
                <h1 id="combo-prompt" style="
                    font-size:48px;
                    color:#45b9ff;
                    margin:25px;
                ">${this.sequence[0]}</h1>
                <p id="combo-progress">1 / ${length}</p>
                <button id="combo-tap" style="
                    padding:15px 35px;
                    background:#292b35;
                    color:white;
                    border:2px solid #45b9ff;
                    border-radius:10px;
                    cursor:pointer;
                    font-size:18px;
                ">TAP</button>
                <p style="margin-top:18px;font-size:13px;color:#aaa;">
                    Swipe in the prompted direction, or press TAP.
                </p>
            </div>
        `;

        this.prompt = container.querySelector("#combo-prompt");
        this.button = container.querySelector("#combo-tap");

        this.button.addEventListener("pointerdown", this.handleTap);
        container.addEventListener("pointerdown", this.handleDown);
        container.addEventListener("pointerup", this.handleUp);
    },

    handleTap: (event) => {
        event.stopPropagation();

        if (!Combo.active) return;

        if (Combo.sequence[Combo.current] === "TAP") {
            Combo.advance();
        } else {
            Combo.wrong();
        }
    },

    handleDown: (event) => {
        if (!Combo.active) return;
        if (event.target.closest("#combo-tap")) return;

        Combo.startPoint = {
            x: event.clientX,
            y: event.clientY
        };
    },

    handleUp: (event) => {
        if (!Combo.active || !Combo.startPoint) return;

        const dx = event.clientX - Combo.startPoint.x;
        const dy = event.clientY - Combo.startPoint.y;

        Combo.startPoint = null;

        if (Math.hypot(dx, dy) < 30) return;

        let direction;

        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "RIGHT" : "LEFT";
        } else {
            direction = dy > 0 ? "DOWN" : "UP";
        }

        if (Combo.sequence[Combo.current] === direction) {
            Combo.advance();
        } else {
            Combo.wrong();
        }
    },

    advance() {
        this.current++;

        if (this.current >= this.sequence.length) {
            this.finish(true);
            return;
        }

        this.prompt.textContent = this.sequence[this.current];

        this.container.querySelector("#combo-progress").textContent =
            `${this.current + 1} / ${this.sequence.length}`;
    },

    wrong() {
        this.prompt.textContent = "WRONG!";
        this.prompt.style.color = "#ff405c";

        setTimeout(() => {
            if (!this.active) return;

            this.prompt.textContent = this.sequence[this.current];
            this.prompt.style.color = "#45b9ff";
        }, 400);
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;

        if (success) this.onComplete(true);
    },

    cleanup() {
        this.active = false;

        this.button?.removeEventListener("pointerdown", this.handleTap);
        this.container?.removeEventListener("pointerdown", this.handleDown);
        this.container?.removeEventListener("pointerup", this.handleUp);

        this.startPoint = null;
    }
};
