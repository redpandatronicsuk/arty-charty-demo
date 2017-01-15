import React, {Component} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ART,
  TouchableOpacity
} from 'react-native';
const {Surface, Group, Shape, LinearGradient} = ART;
import {Tweener, AmimatedCirclesMarker, makeBarsChartPath, makeAreaChartPath, makeLineChartPath, makeSplineChartPath, inerpolateColorsFixedAlpha, makeSpline, computeSplineControlPoints, makeCircle, getMinMaxValues, findRectangleIndexContainingPoint, findClosestPointIndexWithinRadius} from '.';
import {Spring,Bounce,EasingFunctions} from '../../timing-functions';

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

const PAD_LEFT = 10;

const SHOW_CLICKS = false;

const CHART_GROW_ANIMATION_DURATION = 2000;
const CLICK_FEDDBACK_ANIMATION_DURATION = 500;

const POINTS_ON_SCREEN = 8;

const CHART_HEIGHT = 250;
const CHART_HEIGHT_OFFSET = CHART_HEIGHT / 2;

const DEFAULT_LINE_COLOR = 'rgba(255,255,255,.5)';

class ArtyCharty extends Component {
  constructor(props) {
    super(props);
    this.resetState();
  }

  resetState () {
    this.state = {
      trX: 0,
      t: 0,
      gradientStops: {},
      activeMarker: {},
      clickFeedback: {
        x: 0,
        y: 0,
        o: 0,
        r: 0
      }
    };
    this.maxScroll = 0;
    this.stopAnimateClickFeedback = false;
  }

  componentWillMount() {
    // Compute constants for all charts, such as maxValues:
    this.animateChartSpring = new Spring({friction: 150, frequency: 500});
    this.animateChartSpring2 = new Spring({friction: 150, frequency: 550, anticipationSize: 50});
    this.computeChartConstants();
    //this.yAxis = this.makeYaxis(5, this.minValue, this.maxValue);
    this.yAxis = this.makeYaxis(5, 0, this.maxValue);
    this.initChartGrowAnimations();
    this.initPanHandler();
    this.animateClickFeedbackTweener = new Tweener(CLICK_FEDDBACK_ANIMATION_DURATION, t => {
          this.setState(Object.assign(this.state, 
              Object.assign(this.state.clickFeedback, {
                o: 1 - t,
                r: 300 * t
              })
        ));
    }, EasingFunctions.easeInCubic, false);
    this.animateChartTweener = new Tweener(CHART_GROW_ANIMATION_DURATION, t => {
          this.setState(Object.assign(this.state, {t}));
    }, EasingFunctions.linear, false);
  }

  componentDidMount() {
    this.animateChart();
  }

  computeChartConstants() {
    this.maxValue = Number.MIN_VALUE;
    this.minValue = Number.MAX_VALUE;
    this.props.data.forEach(d => {
      let val = getMinMaxValues(d.data);
      d.maxValue = val.maxValue;
      d.minValue = val.minValue;
      this.maxValue = Math.max(this.maxValue, val.maxValue);
      this.minValue = Math.min(this.minValue, val.minValue);
    });
  }

  initChartGrowAnimations() {
    let ts = [];
    this.props.data.forEach(d => {
      if (d.timingFunctions) {
        return;
      }
      // Depending on type and props, select approtaley here...
      let timeingFunction;
      switch (d.chartGrowAnimation) {
        case 'linear':
        case 'easeInQuad':
        case 'easeOutQuad':
        case 'easeInOutQuad':
        case 'easeInCubic':
        case 'easeOutCubic':
        case 'easeInOutCubic':
        case 'easeInQuart':
        case 'easeOutQuart':
        case 'easeInOutQuart':
        case 'easeInQuint':
        case 'easeOutQuint':
        case 'easeInOutQuint':
        case 'bounce':
          d.timingFunctions = [
            (t) => {
            return EasingFunctions[d.chartGrowAnimation](t);
            }
          ];
          break;
        case 'spring':
        default:
          d.timingFunctions = [
            (t) => {
            return this.animateChartSpring.interpolate(t);
            },
            (t) => {
            return this.animateChartSpring2.interpolate(t);
            }
          ];
      }
      });
  }

  /**
   * Initialise the pan handler used for horizontal scrolling
   * and click handling.
   */
  initPanHandler() {
    let sX;
    let moved = false;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: this.props.noScroll ? ()=>{} : (evt, gestureState) => {
        sX = this.state.trX;
        moved = false;
      },
      onPanResponderMove: this.props.noScroll ? ()=>{} : (evt, gestureState) => {
        // console.log(Math.min(20, Math.max(sX + gestureState.dx, -this.maxScroll - 20)), 'ms', this.maxScroll);
        this.setState(Object.assign(this.state, {
          trX: Math.min(20, Math.max(sX + gestureState.dx, -this.maxScroll - 20))
        }));
        moved = true;
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        let tmpX = gestureState.x0;
        let tmpY = gestureState.y0;
        if (!moved) {
          this
            .refs
            .chart
            .measure((fx, fy, width, height, px, py) => {
              this.animateClickFeedback(tmpX - px, tmpY - py + CHART_HEIGHT / 2);
              this.props.data.some((d, idx) => {
                if (d.type === 'area' || d.type === 'line' || d.type.substr(0, 6) === 'spline') {
                  let closestMarker = findClosestPointIndexWithinRadius(d.markerCords, tmpX - px, tmpY - py + CHART_HEIGHT / 2, MARKER_RADIUS_SQUARED);
                  if (closestMarker !== undefined) {
                    this.onMarkerClick(idx, closestMarker);
                    return true;
                  }
                } else if (d.type === 'bars') {
                  let clickedBar = findRectangleIndexContainingPoint(d.barCords, tmpX - px, tmpY - py + CHART_HEIGHT / 2);
                  if (clickedBar !== undefined) {
                    this.onMarkerClick(idx, clickedBar);
                    // Only return true if this is the last chart, there might be line charts infront..
                    if (idx === this.props.data.length-1) {
                      return true;
                    }
                  }
                }
              });
            });
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {},
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      }
    });
  }

componentWillReceiveProps(nextProps) {
  if (this.props.data !== nextProps.data || this.props.pointsOnScreen !== nextProps.pointsOnScreen) {
    this.props = nextProps;
    this.resetState();
    this.computeChartConstants();
    this.yAxis = this.makeYaxis(5, 0, this.maxValue);
    this.initChartGrowAnimations();
    this.initPanHandler();
    // Uncoment if statement to only restart animation
    // if it isn't already playing when switching charts
    // if (!this.animateChartTweener.isPlaying()) {
      this.animateChart();
    // }
  }
}

  componentWillUnmount() {
    this.animateClickFeedbackTweener.stop();
    this.animateChartTweener.stop();
  }

  onMarkerClick(chartIdx, pointIdx) {
    if (chartIdx !== this.state.activeMarker.chartIdx || pointIdx !== this.state.activeMarker.pointIdx) {
        this.setState(Object.assign(this.state, {activeMarker: {chartIdx, pointIdx}}));
        this.props.onMarkerClick(chartIdx, pointIdx);
    }
  }

  makeGradStops(maxValue, chartIdx) {
    let gradStops = {};
    this.props
      .data[chartIdx].data
      .forEach((d, idx) => {
        let color = inerpolateColorsFixedAlpha(this.props.data[chartIdx].highCol || this.props.data[chartIdx].lineColor, this.props.data[chartIdx].lowCol || this.props.data[chartIdx].lineColor, d.value/maxValue, this.state.activeMarker.chartIdx === chartIdx && this.state.activeMarker.pointIdx === idx ? 1 : .5);
        gradStops[(idx / this.props.data[chartIdx].data.length) + (.5 / this.props.data[chartIdx].data.length)] = 
        color;
      });
      return gradStops;
  }

makeMarkersCoords(chart, width, t) {
  let markerCords = [];
  let xCord;
  let yCord;
  let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/this.maxValue;
  let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
  let fullWidth = xSpacing*(chart.data.length-1);
  chart.data.forEach((d,idx) => {
    let spacing = idx*xSpacing;
    if (spacing > fullWidth * t && chart.drawChart) {
          return true;
        }
    if (chart.stretchChart) {
      xCord = t * (spacing + MARKER_RADIUS); 
    } else {
      xCord = spacing + MARKER_RADIUS;
    }
    yCord = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t)
    markerCords.push({x: xCord, y: yCord});
  });
  return markerCords;
}

makeMarkers(markerCords, chartIdx) {
  return markerCords.map((d, idx) => {
    return this.makeMarker(d.x, d.y, chartIdx, idx);
  });
}

makeMarker(cx, cy, chartIdx, pointIdx) {
    return (
      <AmimatedCirclesMarker key={pointIdx} cx={cx} cy={cy} baseColor={this.props.data[chartIdx].lineColor}
       active={this.state.activeMarker.chartIdx === chartIdx && this.state.activeMarker.pointIdx === pointIdx} />
    );
  }

makeYaxis(num, minVal, maxVal) {
  let topY = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - this.maxValue * ((CHART_HEIGHT-MARKER_RADIUS)/this.maxValue);
  let bottomY = CHART_HEIGHT+CHART_HEIGHT/2;
  let i;
  let interval = (bottomY - topY) / num;
  let lineVal = this.maxValue;
  let lineDecrement = (maxVal - minVal) / num;
  let lines = [];
  for (i = 0 ; i <= num; i++) {
    lines.push(<Shape key={i} strokeDash={[0, 0, 4, 6]} stroke="black" strokeWidth={.5}  d={`M 0 ${topY + interval * i} H ${Dimensions.get('window').width}`} />);
    lines.push(<ART.Text key={1000+i} fill="black" stroke="white" strokeWidth={1} x={0} y={(topY + interval * i) - 22} font="20px Arial">{lineVal.toFixed(2)}</ART.Text>);
    lineVal -= lineDecrement;
  }
  return lines;
}

animateChart(endTime) {
  this.animateChartTweener.resetAndPlay();
}

animateClickFeedback(x, y) {
  this.animateClickFeedbackTweener.stop();
  this.setState(Object.assign(this.state, {
      clickFeedback: {
        x: x,
        y: y,
        o: 0,
        r: 0
      }
  }));
  this.animateClickFeedbackTweener.resetAndPlay();
}

makeLinearGradientForAreaChart(chart, idx, width) {
  return new LinearGradient(this.makeGradStops(chart.maxValue, idx), 0, 0, width, 0);
}

  render() {
    let width = Dimensions.get('window').width;
     let charts = this.props.data.map((chart, idx) =>  {
       let chartData;
       let charts = [];
       let markerCords;
       let makeMarkers = true;
       switch (chart.type) {
         case 'area':
            chartData = makeAreaChartPath(chart, width, this.state.t, this.maxValue, CHART_HEIGHT, CHART_HEIGHT_OFFSET, MARKER_RADIUS,
           this.props.pointsOnScreen || POINTS_ON_SCREEN);
            // Max assumes chart doesn't shrink subsequently. If that is the case,weneed to
            // recomputmax for all!!
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            // this.maxScroll = chartData.maxScroll;
            charts.push(<Shape key={idx} d={chartData.path}
              fill={this.makeLinearGradientForAreaChart(chart, idx, chartData.width)}
            />);
            if (chart.hideLine) {
              break;
            }
          case 'line':
            chartData = makeLineChartPath(chart, width, this.state.t, this.maxValue, CHART_HEIGHT, CHART_HEIGHT_OFFSET, MARKER_RADIUS,
           this.props.pointsOnScreen || POINTS_ON_SCREEN);
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 10000} 
                  d={chartData.path}
                  stroke={chart.lineColor || DEFAULT_LINE_COLOR}
                  strokeWidth={3} />);
            // Make marker coords:
            markerCords = this.makeMarkersCoords(chart, width, this.state.t);
            chart.markerCords = markerCords;
            charts.push(this.makeMarkers(markerCords, idx));
            break;
          case 'spline-area':
            //chartData = this.makeSplineChartPath(chart, width, this.state.t, true);
            chartData = makeSplineChartPath(chart, width, this.state.t, this.maxValue, CHART_HEIGHT, CHART_HEIGHT_OFFSET, MARKER_RADIUS,
            this.props.pointsOnScreen || POINTS_ON_SCREEN, true);
              charts.push(<Shape
                  key={idx + 30000} 
                  d={chartData.path}
                  stroke={chart.lineColor || DEFAULT_LINE_COLOR}
                  strokeWidth={0}
                  fill={this.makeLinearGradientForAreaChart(chart, idx, chartData.width)} />);
            //charts.push(this.makeMarkers(markerCords, idx));
            if (chart.hideLine) {
              // Make marker coords:
              markerCords = this.makeMarkersCoords(chart, width, this.state.t);
              chart.markerCords = markerCords;
              charts.push(this.makeMarkers(markerCords, idx));
              makeMarkers = false;
              break;
            }
          case 'spline':
            // chartData = this.makeSplineChartPath(chart, width, this.state.t, false);
            chartData = makeSplineChartPath(chart, width, this.state.t, this.maxValue, CHART_HEIGHT, CHART_HEIGHT_OFFSET, MARKER_RADIUS,
            this.props.pointsOnScreen || POINTS_ON_SCREEN, false);
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 10000} 
                  d={chartData.path}
                  stroke={chart.lineColor || DEFAULT_LINE_COLOR}
                  strokeWidth={3}
                   />);
            // Make marker coords:
            if (makeMarkers) {
              markerCords = this.makeMarkersCoords(chart, width, this.state.t);
              chart.markerCords = markerCords;
              charts.push(this.makeMarkers(markerCords, idx));
            }
            break;
          case 'bars':
          chartData = makeBarsChartPath(chart, width, this.state.t, this.maxValue, CHART_HEIGHT, CHART_HEIGHT_OFFSET, MARKER_RADIUS,
           this.props.pointsOnScreen || POINTS_ON_SCREEN, PAD_LEFT);
            chart.barCords = chartData.barCords;
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 20000} 
                  d={chartData.path}
                  stroke={chart.lineColor || DEFAULT_LINE_COLOR}
                  strokeWidth={3}
                  fill={this.makeLinearGradientForAreaChart(chart, idx, chartData.width)} />);
       }
       return charts;
     });
    return (
      <View>
        <View style={[styles.container, {
          transform: [{translateX: this.state.trX}],
          width: width
        }]}
        ref="chart" >
          <Surface width={this.maxScroll + width} height={CHART_HEIGHT+CHART_HEIGHT/2}
          style={{
            backgroundColor: 'rgba(0,0,0,0)', overflow: 'visible', marginTop: -CHART_HEIGHT/2}}>
          {charts}
          <Shape d={makeCircle(this.state.clickFeedback.x, this.state.clickFeedback.y, this.state.clickFeedback.r)} fill={`rgba(255,255,255, ${this.state.clickFeedback.o})`} />
        </Surface>
        </View>
        <View {...this._panResponder.panHandlers} style={{
          position: 'absolute',
          top: 10,
          left: 0
        }}>
          <Surface width={this.maxScroll + width} height={CHART_HEIGHT+CHART_HEIGHT/2}
          style={{backgroundColor: 'rgba(0,0,0,0)', overflow: 'visible', marginTop: -CHART_HEIGHT/2}}>
           {this.yAxis}
        </Surface>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
          overflow: 'visible',
          marginTop: 10,
          marginBottom: 10
  }
});

export default ArtyCharty;
