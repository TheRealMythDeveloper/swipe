
const Precision = {
    container: null,
    onComplete: null,
    difficulty: 1,
    hits: 0,
    required: 5,
    target: null,
    animation: null,
    x: 50,
    y: 50,
    vx: 1.5,
    vy: 1.2,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.container = container;
        this.onComplete = onComplete;
        this.difficulty = difficulty;
        this.hits = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;

        container.innerHTML = `
            <div style="text-align:center;color:white;padding:12px;">
                <h2>PRECISION</h2>
                <p>Hit the moving target!</p>
                <p id="precision-score">0 / ${this.required}</p>
            </div>
            <div id="precision-target" style="
                position:absolute;
                width:42px;height:42px;
                border-radius:50%;
                background:#ff405c;
                border:4px solid white;
                box-shadow:0 0 15px #ff405c;
                transform:translate(-50%,-50%);
                cursor:pointer;
            "></div>
        `;

        this.target = container.querySelector("#precision-target");

        this.target.addEventListener("pointerdown", this.handleHit);

        this.animate();
    },

    handleHit: (event) => {
        event.stopPropagation();

        const game = Precision;
        if (!game.active) return;

        game.hits++;

        const score = game.container.querySelector("#precision-score");
        score.textContent = `${game.hits} / ${game.required}`;

        if (game.hits >= game.required) {
            game.finish(true);
        }
    },

    animate() {
        if (!this.active) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.x += this.vx * (1 + this.difficulty * 0.15);
        this.y += this.vy * (1 + this.difficulty * 0.15);

        if (this.x < 8 || this.x > 92) this.vx *= -1;
        if (this.y < 25 || this.y > 85) this.vy *= -1;

        this.target.style.left = `${this.x}%`;
        this.target.style.top = `${this.y}%`;

        this.animation = requestAnimationFrame(() => this.animate());
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;

        cancelAnimationFrame(this.animation);

        if (success) this.onComplete(true);
    },

    cleanup() {
        this.active = false;
        cancelAnimationFrame(this.animation);
        this.target?.removeEventListener("pointerdown", this.handleHit);
        this.target = null;
    }
};
