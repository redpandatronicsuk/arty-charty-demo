import React, {Component} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Responder,
  StyleSheet,
  Text,
  View,
  ART,
  TouchableOpacity,
  Easing
} from 'react-native';
const {Surface, Group, Shape, LinearGradient} = ART;
import {Spring,EasingFunctions} from '../../timing-functions';
import {makeArc} from '.';

const CHART_GROW_ANIMATION_DURATION = 3000;
const SELECTED_SLICE_ANIMATION_DURATION = 750;

class ArtyChartyPie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      t: 0,
      t2: 0,
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0),
      selectedSlice: null,
      previousSelectedSlice: null
    };
    this.spring = new Spring({friction: 5, frequency: 200});
    this.spring2 = new Spring({friction: 5, frequency: 100});
  }

  componentWillMount() {
    this.props.max ? this.sum = this.props.max : this.sum = this._computeSum();
    this.slices = [];
    let startAngle = 0;
    this.props.data.data.forEach((d, idx) => {
      let arcLength = d.value/this.sum*360;
      let endAngle = startAngle + arcLength;
      let rad = (startAngle + arcLength/2) * Math.PI / 180;
      let vector = {x: Math.sin(rad), y: -Math.cos(rad)};
      this.slices.push({
          startAngle: startAngle,
          arcLength: arcLength,
          vector: vector
      });
      startAngle = endAngle;
    });
    Animated.parallel([
      Animated.timing(
      this.state.rotation,
      {
        toValue: 360,
        duration: 2000
      }
    ),
    Animated.timing(
      this.state.scale,
      {
        toValue: 1,
        duration: 3000,
        easing: Easing.bounce
      }
    )
    ]).start();;
  }

  componentDidMount() {
    this._animateChart(Date.now() + CHART_GROW_ANIMATION_DURATION);
    this._initPanHandler();
  }

  componentWillReceiveProps(nextProps) {
  }

  _onLayout(layout) {
    this.layout = layout.nativeEvent.layout;
    this.elementCenter = {
      x: layout.nativeEvent.layout.width / 2,
      y: layout.nativeEvent.layout.height / 2
    };
  }

  _initPanHandler() {
    this._responder = 
      {
      onStartShouldSetResponderCapture: (evt) => true,
      onResponderRelease: (evt) => {
        let deltaY = this.elementCenter.y - evt.nativeEvent.locationY;
        let deltaX = this.elementCenter.x - evt.nativeEvent.locationX;
        let angle = Math.atan2(deltaX, deltaY) * 180 / Math.PI;
        angle < 0 ? angle = Math.abs(angle) : angle = 360 - angle;
        let clickedSlice;
        this.slices.some((d, idx) => {
          if (d.startAngle <= angle && angle <= d.startAngle + d.arcLength) {
            clickedSlice = idx;
            return true;
          }
        });
        this.setState(Object.assign(this.state, {
          selectedSlice: clickedSlice,
          previousSelectedSlice: this.state.selectedSlice
        }));
        this._animateActiveSlice(Date.now() + SELECTED_SLICE_ANIMATION_DURATION);
        if (this.props.onSliceClick) {
          this.props.onSliceClick(clickedSlice);
        }
      }
    }
  }

  _computeSum() {
    return this.props.data.data.reduce((a,b) => { 
      return a + b.value;
    },0);
  }

  _animateChart(endTime) {
    requestAnimationFrame(timestamp => {
    if (timestamp >= endTime) {
      this.animating = false;
      return this.setState(Object.assign(this.state, {
        t: 1
      }));
    } else {
      this.setState(Object.assign(this.state, {
        t: 1 - (endTime - timestamp) / CHART_GROW_ANIMATION_DURATION
      }));
      this._animateChart(endTime);
    }
  });
  }

  _animateActiveSlice(endTime) {
    requestAnimationFrame(timestamp => {
    if (timestamp >= endTime) {
      return this.setState(Object.assign(this.state, {
        t2: 1
      }));
    } else {
      this.setState(Object.assign(this.state, {
        t2: 1 - (endTime - timestamp) / SELECTED_SLICE_ANIMATION_DURATION
      }));
      this._animateActiveSlice(endTime);
    }
  });
  }

  render() {
    let size = this.props.size || Dimensions.get('window').width;
    let r = size * .5;
    let pieSlices = [];
    this.slices.forEach((d, idx) => {
      let cx = this.state.selectedSlice === idx ? r + d.vector.x * this.spring.interpolate(this.state.t2) * 10 : this.state.previousSelectedSlice === idx ? r + d.vector.x * this.spring2.interpolate(1-this.state.t2) * 10 : r;
      let cy = this.state.selectedSlice === idx ? r + d.vector.y * this.spring.interpolate(this.state.t2) * 10 : this.state.previousSelectedSlice === idx ? r + d.vector.y * this.spring2.interpolate(1-this.state.t2) * 10 : r;
      pieSlices.push(<Shape key={idx}
          d={makeArc(cx, cy,r * .9, d.startAngle, d.startAngle + EasingFunctions.bounce(this.state.t) * (d.arcLength-1e-12), true)}
          fill={this.props.data.data[idx].color}
          stroke="rgba(255,255,255,.5)"
          strokeWidth={this.state.selectedSlice === idx ? 5 : 0}
           />);
    });
    return(
      <Animated.View
      onLayout={this._onLayout.bind(this)}
      ref="piechart"
      {...this._responder}
       style={[{
        transform: [{rotate: this.state.rotation.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          })}, {scale: this.state.scale}]
      },this.props.style]}>
        <Surface width={size} height={size} >
          {pieSlices}
        </Surface>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
});

export default ArtyChartyPie;
