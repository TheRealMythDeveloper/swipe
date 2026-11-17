
const Follow = {
    container: null,
    onComplete: null,
    difficulty: 1,
    target: null,
    progressBar: null,
    animation: null,
    active: false,
    pointerX: -1000,
    pointerY: -1000,
    targetX: 50,
    targetY: 50,
    progress: 0,
    lastTime: 0,

    start(container, onComplete, difficulty = 1) {
        this.container = container;
        this.onComplete = onComplete;
        this.difficulty = difficulty;
        this.progress = 0;
        this.active = true;
        this.lastTime = 0;

        container.innerHTML = `
            <div style="text-align:center;color:white;padding:12px;">
                <h2>FOLLOW</h2>
                <p>Keep your pointer on the moving target!</p>
                <div style="
                    height:10px;
                    background:#292b35;
                    border-radius:10px;
                    margin:12px auto;
                    max-width:300px;
                    overflow:hidden;
                ">
                    <div id="follow-progress" style="
                        height:100%;
                        width:0%;
                        background:#35d9a0;
                    "></div>
                </div>
            </div>
            <div id="follow-target" style="
                position:absolute;
                width:48px;height:48px;
                border-radius:50%;
                background:#35d9a0;
                border:4px solid white;
                box-shadow:0 0 18px #35d9a0;
                transform:translate(-50%,-50%);
                pointer-events:none;
            "></div>
        `;

        this.target = container.querySelector("#follow-target");
        this.progressBar = container.querySelector("#follow-progress");

        container.addEventListener("pointermove", this.handleMove);

        this.animate();
    },

    handleMove: (event) => {
        const game = Follow;
        const rect = game.container.getBoundingClientRect();

        game.pointerX = event.clientX - rect.left;
        game.pointerY = event.clientY - rect.top;
    },

    animate(timestamp) {
        if (!this.active) return;

        if (!this.lastTime) this.lastTime = timestamp;

        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        const time = timestamp / 1000;

        this.targetX = 50 + Math.sin(time * (1.2 + this.difficulty * 0.15)) * 30;
        this.targetY = 50 + Math.cos(time * 1.5) * 25;

        this.target.style.left = `${this.targetX}%`;
        this.target.style.top = `${this.targetY}%`;

        const tx = width * this.targetX / 100;
        const ty = height * this.targetY / 100;

        const distance = Math.hypot(
            this.pointerX - tx,
            this.pointerY - ty
        );

        if (distance < 55) {
            this.progress += delta;
        } else {
            this.progress = Math.max(0, this.progress - delta * 0.5);
        }

        const required = 4 + this.difficulty * 0.5;
        const percentage = Math.min(100, this.progress / required * 100);

        this.progressBar.style.width = `${percentage}%`;

        if (this.progress >= required) {
            this.finish(true);
            return;
        }

        this.animation = requestAnimationFrame((time) => this.animate(time));
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
        this.container?.removeEventListener("pointermove", this.handleMove);
        this.target = null;
        this.progressBar = null;
    }
};
