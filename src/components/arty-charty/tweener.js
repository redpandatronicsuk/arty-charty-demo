class Tweener {
    constructor(duration, cb, timingFunction) {
        this.cb = cb;
        this.timingFunction = timingFunction;
        this.setDurationFromNowAndPlay(duration);
    }

    start() {
        this.playing = true;
        this.play();
    }

    play() {
        if (this.playing) {
            requestAnimationFrame(timestamp => {
                if (timestamp < this.endTime) {
                    this.cb(this.timingFunction(1 - (this.endTime - Date.now()) / this.duration));
                    // this.cb(1 - (this.endTime - Date.now()) / this.duration);
                    return this.play();
                } else {
                    this.cb(1);
                }
            });
        }
        // this.playing ? requestAnimationFrame(cb) : null;
    }

    setDurationFromNowAndPlay(duration) {
        this.duration = duration;
        this.endTime = duration + Date.now();
        this.start();
    }

    stop() {
        this.playing = false;
    }
}

export default Tweener;