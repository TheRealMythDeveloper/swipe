const React = {
    container: null,
    onComplete: null,
    active: false,
    waiting: false,
    startTime: 0,
    timeout: null,
    hits: 0,
    required: 5,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;
        this.waiting = false;

        container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:25px;color:#54d6e8">
                <h2>WAIT FOR THE SIGNAL</h2>
                <button class="react-button" style="width:150px;height:150px;border-radius:50%;border:3px solid #54d6e8;background:#202533;color:#54d6e8;font-size:20px;cursor:pointer">
                    WAIT
                </button>
                <p class="react-progress">REACTIONS: 0 / ${this.required}</p>
                <p class="react-message">CLICK ONLY WHEN IT TURNS GREEN</p>
            </div>
        `;

        this.button = container.querySelector(".react-button");

        this.click = () => {
            if (!this.active) return;

            if (!this.waiting) {
                this.button.textContent = "TOO EARLY!";
                this.button.style.background = "#ff4268";
                this.scheduleSignal(1000);
                return;
            }

            const reaction = performance.now() - this.startTime;

            if (reaction > 1000) {
                this.button.textContent = "TOO SLOW!";
                this.scheduleSignal(1000);
                return;
            }

            this.hits++;
            this.waiting = false;

            this.container.querySelector(".react-progress").textContent =
                `REACTIONS: ${this.hits} / ${this.required}`;

            if (this.hits >= this.required) {
                this.active = false;
                this.onComplete?.();
                return;
            }

            this.button.textContent = "WAIT";
            this.button.style.background = "#202533";
            this.button.style.borderColor = "#54d6e8";

            this.scheduleSignal(800);
        };

        this.button.addEventListener("click", this.click);
        this.scheduleSignal(1200);
    },

    scheduleSignal(delay) {
        clearTimeout(this.timeout);

        this.waiting = false;

        this.button.textContent = "WAIT";
        this.button.style.background = "#202533";
        this.button.style.borderColor = "#54d6e8";

        this.timeout = setTimeout(() => {
            if (!this.active) return;

            this.waiting = true;
            this.startTime = performance.now();

            this.button.textContent = "CLICK!";
            this.button.style.background = "#35c978";
            this.button.style.borderColor = "#35c978";
        }, delay + Math.random() * 1200);
    },

    cleanup() {
        clearTimeout(this.timeout);

        if (this.button && this.click) {
            this.button.removeEventListener("click", this.click);
        }

        this.active = false;
        this.waiting = false;
        this.container = null;
        this.button = null;
    }
};