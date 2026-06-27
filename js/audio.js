const Audio = {

    init() {
        this.ctx = null;
    },

    type() {

        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = "square";
        osc.frequency.value = 900 + Math.random() * 120;

        gain.gain.value = 0.015;

        osc.start();

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            this.ctx.currentTime + 0.03
        );

        osc.stop(this.ctx.currentTime + 0.03);

    }

};