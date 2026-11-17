
const Slice = {
    container: null,
    onComplete: null,
    targets: [],
    hazards: [],
    pointerDown: false,
    hits: 0,
    required: 8,
    finished: false,
    cleanupFunctions: [],

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 8 + Math.floor(difficulty);
        this.finished = false;
        this.pointerDown = false;
        this.targets = [];
        this.hazards = [];
        this.cleanupFunctions = [];

        container.innerHTML = `
            <div class="slice-score">TARGETS: 0 / ${this.required}</div>
            <div class="slice-objects"></div>
        `;

        this.layer = container.querySelector(".slice-objects");
        this.scoreElement = container.querySelector(".slice-score");

        const down = event => {
            this.pointerDown = true;
            this.checkHit(event);
        };

        const move = event => {
            if (this.pointerDown) this.checkHit(event);
        };

        const up = () => this.pointerDown = false;

        container.addEventListener("pointerdown", down);
        container.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);

        this.cleanupFunctions.push(() => {
            container.removeEventListener("pointerdown", down);
            container.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        });

        this.spawnInterval = setInterval(() => this.spawn(), 850);
        this.cleanupFunctions.push(() => clearInterval(this.spawnInterval));

        for (let i = 0; i < 3; i++) this.spawn();
    },

    spawn() {
        if (this.finished || !this.layer) return;

        const hazard = Math.random() < 0.25;
        const object = document.createElement("div");

        object.textContent = hazard ? "✕" : "";
        object.dataset.hazard = hazard;

        Object.assign(object.style, {
            position: "absolute",
            width: hazard ? "38px" : "48px",
            height: hazard ? "38px" : "48px",
            borderRadius: "50%",
            background: hazard ? "#ff4268" : "#54d6e8",
            left: `${Math.random() * 85 + 5}%`,
            top: `${Math.random() * 80 + 10}%`,
            cursor: "crosshair",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: "bold",
            touchAction: "none"
        });

        this.layer.appendChild(object);

        const record = { element: object, hazard };
        this.targets.push(record);

        const timeout = setTimeout(() => {
            object.remove();
            this.targets = this.targets.filter(item => item !== record);
        }, 2200);

        this.cleanupFunctions.push(() => clearTimeout(timeout));
    },

    checkHit(event) {
        const record = this.targets.find(item => {
            const rect = item.element.getBoundingClientRect();
            return event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;
        });

        if (!record) return;

        record.element.remove();
        this.targets = this.targets.filter(item => item !== record);

        if (record.hazard) {
            this.finish(false);
            return;
        }

        this.hits++;
        this.scoreElement.textContent =
            `TARGETS: ${this.hits} / ${this.required}`;

        if (this.hits >= this.required) this.finish(true);
    },

    finish(success) {
        if (this.finished) return;
        this.finished = true;
        if (success) this.onComplete?.();
    },

    cleanup() {
        this.cleanupFunctions.forEach(fn => fn());
        this.cleanupFunctions = [];
        this.targets = [];
        this.finished = true;
        this.container = null;
    }
};
