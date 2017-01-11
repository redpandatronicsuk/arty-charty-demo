import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ART,
  TouchableOpacity,
  StatusBar
} from 'react-native';
const {Group, Shape} = ART;
import {Spring} from '../../timing-functions';
import {lightenColor} from '.';

const SELCTED_MARKER_ANIMATION_DURATION = 1000;
const SELCTED_MARKER_ANIMATION_DELAY_1 = SELCTED_MARKER_ANIMATION_DURATION * .2;
const SELCTED_MARKER_ANIMATION_DELAY_2 = SELCTED_MARKER_ANIMATION_DURATION * .3;
const UNSELCTED_MARKER_ANIMATION_DURATION = 500;
const UNSELCTED_MARKER_ANIMATION_DELAY_1 = UNSELCTED_MARKER_ANIMATION_DURATION * .2;
const UNSELCTED_MARKER_ANIMATION_DELAY_2 = UNSELCTED_MARKER_ANIMATION_DURATION * .3;
const MARKER_RADIUS = 15;
const MARKER_RADIUS_2 = MARKER_RADIUS * .75;
const MARKER_RADIUS_3 = MARKER_RADIUS * .5;
const MARKER_RADIUS_SQUARED = Math.pow(MARKER_RADIUS, 2);
const START_ANIMATION_DURATION = 750;

const spring1 = new Spring({friction: 300, frequency: 500});
const spring2 = new Spring({friction: 300, frequency: 400});
const spring3 = new Spring({friction: 300, frequency: 600});

function makeCircle(cx, cy, r) {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
}

class AmimatedCirclesMarker extends Component {
  constructor(props) {
    super(props);
    this.state = {
        r1: 0,
        r2: 0,
        r3: 0
    };
    this.active = this.props.active;
    // If active, start animation....
  }

  componentDidMount() {
    this.startAnimationPlaying = true;
    this._playStartAnimation(Date.now() + START_ANIMATION_DURATION);
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.active !== this.active) {
        this.active = nextProps.active;
          nextProps.active ? this._playActiveAnimation(Date.now() + SELCTED_MARKER_ANIMATION_DURATION) : this._playInactiveAnimation(Date.now() + UNSELCTED_MARKER_ANIMATION_DURATION);
      }
  }

  _playStartAnimation(endTime) {
    requestAnimationFrame((timestamp) => {
        let timeLeft = endTime - timestamp;
        let progress = 1 - (timeLeft / START_ANIMATION_DURATION);
      if (progress < 1 && this.startAnimationPlaying) {
          this.setState({
              r1: spring2.interpolate(progress),
              r2: 0,
              r3: 0
          });
          this._playStartAnimation(endTime);
      } else if (this.startAnimationPlaying) {
        this.startAnimationPlaying = false;
        this.setState({
              r1: 1,
              r2: 0,
              r3: 0
          });
      }
    });
  }

  _playActiveAnimation(endTime) {
    requestAnimationFrame((timestamp) => {
        let timeLeft = endTime - timestamp;
        let progressLongest = 1 - (timeLeft / SELCTED_MARKER_ANIMATION_DURATION);
      if (progressLongest < 1 && this.active) {
          this.setState({
              r1: spring1.interpolate(progressLongest),
              r2: spring2.interpolate(1 - (timeLeft / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_1))),
              r3: spring3.interpolate(1 - (timeLeft / (SELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_2)))
          });
          this._playActiveAnimation(endTime);
      } else {
        this.setState({
              r1: 1,
              r2: 1,
              r3: 1
          });
      }
    })
  }

  _playInactiveAnimation(endTime) {
    requestAnimationFrame((timestamp) => {
        let timeLeft = endTime - timestamp;
        let progressLongest = timeLeft / UNSELCTED_MARKER_ANIMATION_DURATION;
      if (progressLongest > 0 && !this.active) {
          this.setState({
              r1: spring1.interpolate(progressLongest),
              r2: spring2.interpolate(timeLeft / (UNSELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_1)),
              r3: spring3.interpolate(timeLeft / (UNSELCTED_MARKER_ANIMATION_DURATION - SELCTED_MARKER_ANIMATION_DELAY_2))
          });
          this._playInactiveAnimation(endTime);
      } else {
        this.setState({
              r1: 1,
              r2: 0,
              r3: 0
          });
      }
    })
  }

  _makeMarker(cx, cy) {
    return (
      <Group>
        <Shape d={makeCircle(cx, cy, this.state.r3 * MARKER_RADIUS)} fill={lightenColor(this.props.baseColor, .3) || 'rgba(0,255,0,.75)'}/>
        <Shape style={styles.circle2} d={makeCircle(cx, cy, this.state.r2 * MARKER_RADIUS_2)} fill={lightenColor(this.props.baseColor, .1) || 'rgba(0,0,255,.75)'}/>
        <Shape style={styles.circle3} d={makeCircle(cx, cy, this.state.r1 * MARKER_RADIUS_3)} fill={this.props.baseColor || 'rgba(255,0,0,.75)'}/>
      </Group>
    );
  }

  render() {
      return this._makeMarker(this.props.cx, this.props.cy);
  }

  componentWillUnmount() {
    this.startAnimationPlaying = false;
    this.active= false;
  }
}

const styles = StyleSheet.create({
  circle2: {
    opacity: .5
  },
  circle3: {
    opacity: .25
  }
});

export default AmimatedCirclesMarker;
