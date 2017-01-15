class Tweener {
    constructor(duration, cb, timingFunction, autoStart) {
        this.cb = cb;
        this.timingFunction = timingFunction;

        autoStart === false 
        ? 
            this.setDurationFrom(duration)
        :
            this.setDurationFromNowAndPlay(duration)
        ;
    }

    start() {
        this.playing = true;
        this.play();
    }

    play() {
        if (this.playing) {
            this.afid = requestAnimationFrame(timestamp => {
                if (timestamp < this.endTime) {
                    this.cb(this.timingFunction(1 - (this.endTime - Date.now()) / this.duration));
                    this.play();
                } else {
                    this.playing = false;
                    this.cb(1);
                }
            });
        }
    }

     setDurationFrom(duration) {
        this.duration = duration;
        this.endTime = duration + Date.now();
    }

    setDurationFromNowAndPlay(duration) {
        this.setDurationFrom(duration);
        this.start();
    }

    resetAndPlay() {
        this.endTime = this.duration + Date.now();
        this.start();
    }

    stop() {
        cancelAnimationFrame(this.afid);
        this.playing = false;
    }

    isPlaying() {
        return this.playing;
    }
}

export default Tweener;