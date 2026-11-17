const Memory = {
    container: null,
    onComplete: null,
    sequence: [],
    inputIndex: 0,
    active: false,
    showing: false,
    buttons: [],
    timeouts: [],

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.sequence = [];
        this.inputIndex = 0;
        this.active = true;
        this.showing = false;
        this.buttons = [];
        this.timeouts = [];

        const length = 3 + Math.floor(difficulty);

        container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:25px;color:#54d6e8">
                <h2>REMEMBER THE PATTERN</h2>
                <div class="memory-grid" style="display:grid;grid-template-columns:repeat(2,90px);gap:12px"></div>
                <p class="memory-message">WATCH CLOSELY</p>
            </div>
        `;

        const grid = container.querySelector(".memory-grid");

        for (let i = 0; i < 4; i++) {
            const button = document.createElement("button");

            Object.assign(button.style, {
                width: "90px",
                height: "90px",
                borderRadius: "10px",
                border: "2px solid #54d6e8",
                background: "#202533",
                cursor: "pointer"
            });

            button.addEventListener("click", () => this.input(i));

            grid.appendChild(button);
            this.buttons.push(button);
        }

        for (let i = 0; i < length; i++) {
            this.sequence.push(Math.floor(Math.random() * 4));
        }

        this.showSequence();
    },

    showSequence() {
        this.showing = true;

        const message = this.container.querySelector(".memory-message");
        message.textContent = "WATCH...";

        this.sequence.forEach((index, i) => {
            const on = setTimeout(() => {
                this.buttons[index].style.background = "#54d6e8";
            }, i * 650 + 300);

            const off = setTimeout(() => {
                this.buttons[index].style.background = "#202533";
            }, i * 650 + 600);

            this.timeouts.push(on, off);
        });

        const finish = setTimeout(() => {
            this.showing = false;
            message.textContent = "REPEAT THE PATTERN";
        }, this.sequence.length * 650 + 400);

        this.timeouts.push(finish);
    },

    input(index) {
        if (!this.active || this.showing) return;

        if (index !== this.sequence[this.inputIndex]) {
            this.active = false;
            this.container.querySelector(".memory-message").textContent =
                "INCORRECT PATTERN";
            return;
        }

        this.buttons[index].style.background = "#54d6e8";

        const timeout = setTimeout(() => {
            this.buttons[index].style.background = "#202533";
        }, 180);

        this.timeouts.push(timeout);

        this.inputIndex++;

        if (this.inputIndex >= this.sequence.length) {
            this.active = false;
            this.onComplete?.();
        }
    },

    cleanup() {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        this.buttons = [];
        this.sequence = [];
        this.active = false;
        this.showing = false;
        this.container = null;
    }
};