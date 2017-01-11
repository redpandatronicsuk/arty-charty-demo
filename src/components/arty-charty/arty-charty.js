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
import {AmimatedCirclesMarker, inerpolateColorsFixedAlpha, makeSpline, computeSplineControlPoints} from '.';
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

const POINTS_ON_SCREEN = 8;

const CHART_HEIGHT = 250;
const CHART_HEIGHT_OFFSET = CHART_HEIGHT / 2;

// TO-DO:
// ARTy Sparky: spark line charts
// Bubble click feedback!!!

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
      activeMarker: {}
    };
    this.maxScroll = 0;
  }

  componentWillMount() {
    //this.initChart();
    // Compute constants for all charts, such as maxValues:
    this.animateChartSpring = new Spring({friction: 150, frequency: 500});
    this.animateChartSpring2 = new Spring({friction: 150, frequency: 550, anticipationSize: 50});
    this.computeChartConstants();
    this.initChartGrowAnimations();
    this.initPanHandler();
  }

  componentDidMount() {
    this.animating = true;
    this.animateChart(Date.now() + CHART_GROW_ANIMATION_DURATION);
  }

  computeChartConstants() {
    this.maxValue = Number.MIN_VALUE;
    this.props.data.forEach(d => {
      let val = this.getMaxValue(d.data);
      d.maxValue = val;
      this.maxValue = Math.max(this.maxValue, val);
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
              this.props.data.some((d, idx) => {
                if (d.type === 'area' || d.type === 'line' || d.type.substr(0, 6) === 'spline') {
                  let closestMarker = this.findClosestMarker(d.markerCords, tmpX - px, tmpY - py + CHART_HEIGHT / 2);
                  if (closestMarker !== undefined) {
                    this.onMarkerClick(idx, closestMarker);
                    return true;
                  }
                } else if (d.type === 'bars') {
                  let clickedBar = this.findClickedBar(d.barCords, tmpX - px, tmpY - py + CHART_HEIGHT / 2);
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
    if (this.props.data !== nextProps.data ||
     this.props.pointsOnScreen !== nextProps.pointsOnScreen) {
      this.props = nextProps;
      //this.initChart();
      //this.computeChartConstants();
      this.resetState();
      this.computeChartConstants();
    this.initChartGrowAnimations();
    this.initPanHandler();
    if (!this.animating) {
      this.animating = true;
      this.animateChart(Date.now() + CHART_GROW_ANIMATION_DURATION);
    }
    }
  }

  findClosestMarker(points, x, y) {
    let closestIdx;
    let closestDist = Number.MAX_VALUE;
    points.forEach((d, idx) => {
      let distSqrd = Math.pow(d.x - x, 2) + Math.pow(d.y - y, 2); // changeto: (d.x - x)**2 + (d.y - y)**2;
      if (distSqrd < closestDist && distSqrd < MARKER_RADIUS_SQUARED) {
        closestIdx = idx;
        closestDist = distSqrd;
      }
    });
    return closestIdx;
  }

  findClickedBar(points, x, y) {
    let closestIdx;
    points.some((d, idx) => {
      if ((d.x1 <= x && x <= d.x2) && (d.y1 <= y && y <= d.y2)) {
        closestIdx = idx;
        return true;
      }
      return false;
    });
    return closestIdx;
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

  getMaxValue(arr) {
    let maxValue = 0
    arr
      .forEach((d) => {
        if (d.value > maxValue) {
          maxValue = d.value;
        }
      });
      return maxValue;
  }

  /**
   * Function to create the SVG paths for the bar chart.
   */
  makePathAndMarkersBar(containerWidth, ts, maxValue) {
    let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/maxValue;
    xSpacing = containerWidth / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let barWidth = xSpacing - PAD_LEFT;
    var width = containerWidth;
    let fullWidth = PAD_LEFT/2 + (PAD_LEFT+barWidth) * (this.props.data.length-1) + barWidth;
    var max = 0,pathStr = [], xCord;
    this.barCords = [];
    // Make bars:
    this.props.data.forEach((d, idx) => {
      let x1 = PAD_LEFT/2 + (PAD_LEFT+barWidth) * idx;
      let y1 = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler * ts[idx % ts.length];
      let y2 = (CHART_HEIGHT+CHART_HEIGHT_OFFSET);
      pathStr.push('M');
      pathStr.push(x1);
      pathStr.push(y2);
      pathStr.push('H');
      pathStr.push(x1 + barWidth);
      pathStr.push('V');
      pathStr.push(y1);
      pathStr.push('H');
      pathStr.push(x1);
      pathStr.push('V');
      pathStr.push(y2);
      this.barCords.push({x1: x1, x2: x1+barWidth, y1: y1, y2: y2});
  });
  // Force render update:
  this.forceUpdate();
    let viewBox = (fullWidth - xSpacing*4) + ' ' + (-CHART_HEIGHT) + ' ' + width + MARKER_RADIUS + ' ' + CHART_HEIGHT;
    return {
      viewBox,
      bars: pathStr.join(' '),
      width: fullWidth,
      height: CHART_HEIGHT,
      maxScroll: fullWidth - containerWidth
    };
  }

  makeBarsChartPath(chart, width, t) {
    let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/this.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let barWidth = xSpacing - PAD_LEFT;
    let fullWidth = PAD_LEFT/2 + (PAD_LEFT+barWidth) * (chart.data.length-1) + barWidth;
    let pathStr = []
    let barCords = [];
    chart.data.some((d, idx) => {
        let x1 = PAD_LEFT/2 + (PAD_LEFT+barWidth) * idx;
        if (x1 > fullWidth * t && chart.drawChart) {
          return true;
        }
        if (chart.stretchChart) {
          x1 = x1 * t;
        }
    let y1 = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler * chart.timingFunctions[idx % chart.timingFunctions.length](t);
        let y2 = (CHART_HEIGHT+CHART_HEIGHT_OFFSET);
        pathStr.push('M');
        pathStr.push(x1);
        pathStr.push(y2);
        pathStr.push('H');
        pathStr.push(x1 + barWidth);
        pathStr.push('V');
        pathStr.push(y1);
        pathStr.push('H');
        pathStr.push(x1);
        pathStr.push('V');
        pathStr.push(y2);
        barCords.push({x1: x1, x2: x1+barWidth, y1: y1, y2: y2});
    });
    return {
      path: pathStr.join(' '),
      width: fullWidth,
      maxScroll: fullWidth - width +300,
      barCords: barCords
    };
  }

  makeAreaChartPath(chart, width, t) {
    let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/this.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let fullWidth = xSpacing*(chart.data.length-1) + MARKER_RADIUS;
    let areaStrArray = ['M' + MARKER_RADIUS, CHART_HEIGHT+CHART_HEIGHT_OFFSET];
    let xCord;
    chart.data.some((d, idx) => {
      let spacing = idx*xSpacing;
      if (spacing > fullWidth * t && chart.drawChart) {
          return true;
        }
        if (chart.drawChart) {
          xCord = Math.min(fullWidth * t, spacing + MARKER_RADIUS);
        } else if (chart.stretchChart) {
          xCord = t * (idx*xSpacing + MARKER_RADIUS);
        } else {
          xCord = idx*xSpacing + MARKER_RADIUS;
        }
    //xCord = (chart.drawChart ? t : 1) * (idx*xSpacing + MARKER_RADIUS);
        // Move line to to next x-coordinate:
        areaStrArray.push('L' + xCord);
        // And y-cordinate:
        let yCord = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t);
        areaStrArray.push(yCord);
    });
    areaStrArray.push('L' + xCord);
    areaStrArray.push(CHART_HEIGHT+CHART_HEIGHT_OFFSET);
    areaStrArray.push('Z');
    return {
      path: areaStrArray.join(' '),
      width: xCord + MARKER_RADIUS,
      maxScroll: xCord - width + MARKER_RADIUS
    };
  }

  makeLineChartPath(chart, width, t) {
    let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/this.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let fullWidth = xSpacing*(chart.data.length-1) + MARKER_RADIUS;
    let lineStrArray = []
    let xCord;
    chart.data.some((d, idx) => {
    //xCord = (chart.drawChart ? t : 1) * (idx*xSpacing + MARKER_RADIUS);
    let spacing = idx*xSpacing;
        if (spacing > fullWidth * t && chart.drawChart) {
          return true;
        }
        if (chart.drawChart) {
          xCord = Math.min(fullWidth * t, spacing + MARKER_RADIUS);
        } else if (chart.stretchChart) {
          xCord = t * (idx*xSpacing + MARKER_RADIUS);
        } else {
          xCord = idx*xSpacing + MARKER_RADIUS;
        }
        lineStrArray.push((idx ? 'L' : 'M') + xCord);
        let yCord = (CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t);
        lineStrArray.push(yCord);
    });
    return {
      path: lineStrArray.join(' '),
      width: xCord + MARKER_RADIUS,
      maxScroll: xCord - width + MARKER_RADIUS
    };
  }

  makeSplineChartPath(chart, width, t, closePath) {
    // Add length parameter which is used as Math.max(maxLength, xCord???)
    let heightScaler = (CHART_HEIGHT-MARKER_RADIUS)/this.maxValue;
    let xSpacing = width / (this.props.pointsOnScreen || POINTS_ON_SCREEN);
    let fullWidth = xSpacing*(chart.data.length-1) + MARKER_RADIUS;
    let xCord;
    let xCords = [];
    let yCords = [];
    chart.data.forEach((d, idx) => {
        let spacing = idx*xSpacing;
        if (spacing > fullWidth * t && chart.drawChart) {
          return true;
        }
        if (chart.drawChart) {
          xCord = Math.min(fullWidth * t, spacing + MARKER_RADIUS);
        } else if (chart.stretchChart) {
          xCord = t * (idx*xSpacing + MARKER_RADIUS);
        } else {
          xCord = idx*xSpacing + MARKER_RADIUS;
        }
        xCords.push(xCord);
        yCords.push((CHART_HEIGHT+CHART_HEIGHT_OFFSET) - d.value * heightScaler  * chart.timingFunctions[idx % chart.timingFunctions.length](t));
    });
    let px = computeSplineControlPoints(xCords);
	  let py = computeSplineControlPoints(yCords);
    let splines = [`M ${xCords[0]} ${yCords[0]}`];
      for (i=0;i<xCords.length-1;i++) {
        splines.push(makeSpline(xCords[i],yCords[i],px.p1[i],py.p1[i],px.p2[i],py.p2[i],xCords[i+1],yCords[i+1]));
      }
      if (closePath) { // close for area spline graph
        splines.push(`V ${CHART_HEIGHT+CHART_HEIGHT_OFFSET} H ${xCords[0]} Z`);
      }
    return {
      path: splines.join(','),
      width: xCords.slice(-1) + MARKER_RADIUS,
      maxScroll: xCords.slice(-1) - width + MARKER_RADIUS
    };
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

animateChart(endTime) {
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
      this.animateChart(endTime);
    }
  });
}

  render() {
    let width = Dimensions.get('window').width;
    // Move currentMonth computation outside of render!
    let currentMonth = this.state.activeMarker.chartIdx !== undefined ?
     new Date(this.props.data[this.state.activeMarker.chartIdx].data[this.state.activeMarker.pointIdx].date).getMonth() :
     null;
     let charts = this.props.data.map((chart, idx) =>  {
       let chartData;
       let charts = [];
       let markerCords;
       let makeMarkers = true;
       switch (chart.type) {
         case 'area':
            chartData = this.makeAreaChartPath(chart, width, this.state.t);
            // Max assumes chart doesn't shrink subsequently. If that is the case,weneed to
            // recomputmax for all!!
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            // this.maxScroll = chartData.maxScroll;
            charts.push(<Shape key={idx} d={chartData.path}
              fill={new LinearGradient(
                  this.makeGradStops(chart.maxValue, idx),
                0,
                0,
                chartData.width,
                0
            )}
            />);
            if (chart.hideLine) {
              break;
            }
          case 'line':
            chartData = this.makeLineChartPath(chart, width, this.state.t);
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 10000} 
                  d={chartData.path}
                  stroke={chart.lineColor || "rgba(255,255,255,.5)"}
                  strokeWidth={3} />);
            // Make marker coords:
            markerCords = this.makeMarkersCoords(chart, width, this.state.t);
            chart.markerCords = markerCords;
            charts.push(this.makeMarkers(markerCords, idx));
            break;
          case 'spline-area':
            chartData = this.makeSplineChartPath(chart, width, this.state.t, true);
              charts.push(<Shape
                  key={idx + 30000} 
                  d={chartData.path}
                  stroke={chart.lineColor || "rgba(255,255,255,.5)"}
                  strokeWidth={0}
                  fill={new LinearGradient(
                  this.makeGradStops(chart.maxValue, idx),
                0,
                0,
                chartData.width,
                0
            )} />);
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
            chartData = this.makeSplineChartPath(chart, width, this.state.t, false);
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 10000} 
                  d={chartData.path}
                  stroke={chart.lineColor || "rgba(255,255,255,.5)"}
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
            chartData = this.makeBarsChartPath(chart, width, this.state.t);
            chart.barCords = chartData.barCords;
            this.maxScroll = Math.max(this.maxScroll, chartData.maxScroll || 0);
            charts.push(<Shape
                  key={idx + 20000} 
                  d={chartData.path}
                  stroke={chart.lineColor || "rgba(255,255,255,.5)"}
                  strokeWidth={3}
                  fill={new LinearGradient(
                  this.makeGradStops(chart.maxValue, idx),
                0,
                0,
                chartData.width,
                0
            )} />);
            // return <Shape
            //       d={this.state.chartData.bars}
            //       stroke="rgba(255,255,255,.5)"
            //       strokeWidth={3}
            //       fill={new LinearGradient(
            //       this.state.gradientStops || {
            //       '0': 'rgba(0,0,255,0.2)',
            //       '0.25':'rgba(125,0,255,.5)',
            //       '0.5':'rgba(255,0,125,.5)',
            //       '1':'rgba(0,0,255,.2)'
            //     },
            //     0,
            //     0,
            //     this.state.chartData.width,
            //     0
            // )} />
       }
       return charts;
     });
    return (
        <View {...this._panResponder.panHandlers} style={[styles.container, {
          transform: [{translateX: this.state.trX}],
          width: width
        }]}
        ref="chart" >
          <Surface width={this.maxScroll + width} height={CHART_HEIGHT+CHART_HEIGHT/2}
          style={{backgroundColor: 'rgba(0,0,0,0)', overflow: 'visible', marginTop: -CHART_HEIGHT/2}}>
          {charts}
        </Surface>
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
