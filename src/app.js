import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ART
} from 'react-native';
import {ArtyCharty, ArtyChartyXY, AmimatedCirclesMarker, ArtyChartyDonut, ArtyChartyPie, ArtySparkyLine, ArtySparkyPie} from './components';
const {Surface} = ART;
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const londonWeatherData = {
  temp: {
    mean: [5, 7, 9,  11, 14, 16, 19, 19, 17, 13, 10, 7],
    high: [6, 7, 10, 13, 17, 20, 22, 21, 19, 14, 10, 7],
    low:  [3, 3, 4,  6,  9,  12, 14, 14, 12, 9,  6,  3]
  },
  rain: {
    mm: [52, 39, 35, 43, 50, 43, 41, 48, 49, 71, 63, 53],
    days: [19, 16, 16, 16, 15, 13, 14, 13, 15, 15, 17,17]
  },
  sunHours: [1, 2, 4, 5, 6, 7, 6, 6, 5, 3, 2, 1],
  sunnyVsCloudyDaylightPercentageMonthly: [
    [17, 83],
    [22, 78],
    [31, 69],
    [36, 64],
    [40, 60],
    [42, 58],
    [40, 60],
    [41, 59],
    [37, 63],
    [30, 70],
    [20, 80],
    [16, 84]
  ],
  sunnyVsCloudyDaylightHoursAnualAverage: [33, 67]
};
londonWeatherData.sunnyyDaylightHoursQuaterly = makeQuaterlyValues(londonWeatherData.sunnyVsCloudyDaylightPercentageMonthly);

const malagaWeatherData = {
  temp: {
    mean: [13, 13, 15, 16, 19, 22, 25, 25, 24, 20, 16, 13],
    high: [17, 18, 20, 21, 24, 28, 31, 31, 28, 24, 20, 18],
    low:  [7, 8, 10, 11, 14, 18, 21, 21, 19, 15, 11, 9]
  },
  rain: {
    mm: [69, 60, 52, 44, 20, 6, 0, 6, 20, 57, 101, 100],
    days: [6, 5, 4, 5, 3, 1, 0, 1, 2, 4, 6, 7]
  },
  sunHours: [5, 7, 8, 9, 8, 10, 11, 10, 8, 7, 6, 5],
  sunnyVsCloudyDaylightPercentageMonthly: [
    [61, 39],
    [60, 40],
    [53, 47],
    [61, 39],
    [69, 31],
    [79, 21],
    [80, 20],
    [79, 21],
    [66, 34],
    [61, 39],
    [51, 49],
    [57, 43]
  ],
  sunnyVsCloudyDaylightHoursAnualAverage: [66, 34]
};
malagaWeatherData.sunnyyDaylightHoursQuaterly = makeQuaterlyValues(malagaWeatherData.sunnyVsCloudyDaylightPercentageMonthly);

const mumbaiWeatherData = {
  temp: {
    mean: [24, 25, 27, 29, 30, 29, 28, 28, 28, 29, 28, 26],
    high: [30, 31, 32, 33, 33, 32, 30, 30, 31, 33, 33, 32],
    low:  [18, 18, 21, 24, 27, 26, 25, 25, 25, 24, 22, 19]
  },
  rain: {
    mm: [10, 10, 10, 10, 10, 560, 640, 520, 320, 90, 20, 10],
    days: [2, 0, 0, 0, 4, 20, 28, 27, 19, 5, 1, 1]
  },
  sunHours: [5, 7, 8, 9, 8, 10, 11, 10, 8, 7, 6, 5],
  sunnyVsCloudyDaylightPercentageMonthly: [
    [82, 18],
    [83, 17],
    [77, 23],
    [75, 25],
    [72, 28],
    [41, 59],
    [17, 83],
    [21, 79],
    [40, 60],
    [69, 31],
    [83, 17],
    [90, 10]
  ],
  sunnyVsCloudyDaylightHoursAnualAverage: [61, 39]
};
mumbaiWeatherData.sunnyyDaylightHoursQuaterly = makeQuaterlyValues(mumbaiWeatherData.sunnyVsCloudyDaylightPercentageMonthly);

const bangkokWeatherData = {
  temp: {
    mean: [27, 28, 30, 31, 30, 30, 30, 30, 29, 29, 28, 26],
    high: [32, 33, 34, 35, 34, 33, 33, 33, 32, 32, 31, 31],
    low:  [21, 23, 25, 26, 26, 26, 26, 26, 25, 25, 24, 21]
  },
  rain: {
    mm: [10, 10, 50, 110, 180, 180, 180, 170, 220, 190, 40, 10],
    days: [2, 2, 5, 8, 17, 18, 19, 21, 22, 16, 5, 2]
  },
  sunHours: [9, 8, 9, 8, 8, 6, 5, 5, 5, 6, 8, 9],
  // Couldn't find data for Bangkok, using Yangon instead
  sunnyVsCloudyDaylightPercentageMonthly: [
    [87, 13],
    [84, 16],
    [79, 21],
    [79, 21],
    [46, 54],
    [21, 79],
    [18, 81],
    [24, 76],
    [27, 73],
    [56, 44],
    [83, 17],
    [84, 16]
  ],
  sunnyVsCloudyDaylightHoursAnualAverage: [56, 44]
};
bangkokWeatherData.sunnyyDaylightHoursQuaterly = makeQuaterlyValues(bangkokWeatherData.sunnyVsCloudyDaylightPercentageMonthly);

const weatherData = {
  London: londonWeatherData,
  Malaga: malagaWeatherData,
  Mumbai: mumbaiWeatherData,
  Bangkok: bangkokWeatherData
};

function makeQuaterlyValues(arr) {
  return [
      (arr[0][0] + arr[1][0] + arr[2][0]) / 3,
      (arr[3][0] + arr[4][0] + arr[5][0]) / 3,
      (arr[6][0] + arr[7][0] + arr[8][0]) / 3,
      (arr[9][0] + arr[10][0] + arr[11][0]) / 3
    ];
}

function formatRawData(arr, txt) {
  return arr.map((d,idx) => {
    return {
      date: new Date(0,idx,1),
      value: d,
      txt: txt(d)
    };
  });
}

function formatDonutData(arr, data) {
  return arr.map((d,idx) => {
    let out = {data: []};
    d.forEach((d2, idx2) => {
      out.data.push({
        label: data[idx2].label,
        value: d2,
        color: data[idx2].color,
      });
    });
    console.log('donut data', out);
    return out;
  });
}

const images = {
  spring: require('../assets/img/spring.jpg'),
  summer: require('../assets/img/summer.jpg'),
  autumn: require('../assets/img/autumn.jpg'),
  winter: require('../assets/img/winter.jpg')
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image0op: new Animated.Value(1),
      image1op: new Animated.Value(0),
      // image0br: new Animated.Value(0),
      // image1br: new Animated.Value(0),
      topText: 'Select month',
      topTextOpacity: new Animated.Value(1),
      bottomText: '',
      bottomTextTrX: new Animated.Value(0),
      bottomTextOpacity: new Animated.Value(1),
      chartType: 'area',
      //pointsOnScreen: 12.2,
      pointsOnScreen: 12,
      activeMarker: {},
      chartName: 'Temperature',
      // chartName: 'Rainfall',
      showMoreCharts: false,
      pieChartText: 'Select quarter',
      donutChartText: 'Select month',
      showSelectCityModal: false,
      selectedCity: 'London'
    };
    this.activeImage = 0;
  }

  componentWillMount() {
    console.log('app starting...');
    this.data = {};
    Object.keys(weatherData).forEach(cityName => {
      this.data[cityName] = { 
        Temperature:
         [
          {
              type: 'spline-area',
              label: 'High temperature',
              lineColor: 'rgba(255,0,0,.5)',
              drawChart: true,
              highCol: 'rgb(255,0,0)',
              lowCol: 'rgb(255,165,0)',
              data: formatRawData(weatherData[cityName].temp.high, (val) => {
                return ('0' + val).slice(-2) + '°';
              })
          },
          {
            type: 'spline',
            label: 'Average temprature',
            lineColor: 'rgba(255,255,0,.5)',
            drawChart: true,
            data: formatRawData(weatherData[cityName].temp.mean, (val) => {
              return ('0' + val).slice(-2) + '°';
            })
        },
        {
            type: 'line',
            label: 'Low temperature',
            lineColor: 'rgba(0,0,255,.5)',
            drawChart: true,
            data: formatRawData(weatherData[cityName].temp.low, (val) => {
              return ('0' + val).slice(-2) + '°';
            })
        }
      ],
      Rainfall: [
        {
            type: 'bars',
            label: 'Average rainfall mm',
            lineColor: 'rgba(0,0,255,.25)',
            chartGrowAnimation: 'bounce',
            highCol: 'rgb(0,0,255)',
            lowCol: 'rgb(0,255,0)',
            drawChart: true,
            stretchChart: true,
            data: formatRawData(weatherData[cityName].rain.mm, (val) => {
              return val + 'mm';
            })
        },
        {
            type: 'spline',
            label: 'Average rainfall days',
            lineColor: 'rgba(0,0,128,.75)',
            drawChart: true,
            chartGrowAnimation: 'easeInOutQuad',
            data: formatRawData(weatherData[cityName].rain.days, (val) => {
              return val + ' days';
            })
        }
      ],
      Sunshine: [
        {
            //type: 'spline-area',
            type: 'area',
            label: 'Sunshine hours',
            lineColor: 'rgba(255,255,0,.5)',
            highCol: 'rgb(255,255,0)',
            lowCol: 'rgb(0,0,0)',
            stretchChart: false,
            data: formatRawData(weatherData[cityName].sunHours, (val) => {
              return val + ' hour' + (val !== 1 ? 's' : '');
            })
        }
      ],
      sunnyVsCloudyDaylightPercentageMonthly: {
        type: 'donut',
        label: 'Sunny (yellow) vs cloudy (grey) daylight hours average per month from January inside to Decemeber outside',
        stackInnerRadius: 50,
        stackOutterRadius: Dimensions.get('window').width,
            gap: 5,
            data: formatDonutData(weatherData[cityName].sunnyVsCloudyDaylightPercentageMonthly,
             [
               {label: 'sunny', color: 'rgba(255,255,0,.75)'},
                {label: 'cloudy', color: 'rgba(50,50,50,.75)'}
              ]
            )
      },
      sunnyHoursQ: {
        type: 'pie',
        label: 'Number of sunny hours per yearly quarter',
        data: [
          {label: 'Q1', color: 'rgba(255,0,0,.75)', value: weatherData[cityName].sunnyyDaylightHoursQuaterly[0]},
          {label: 'Q2', color: 'rgba(0,255,0,.75)', value: weatherData[cityName].sunnyyDaylightHoursQuaterly[1]},
          {label: 'Q3', color: 'rgba(0,0,255,.75)', value: weatherData[cityName].sunnyyDaylightHoursQuaterly[2]},
          {label: 'Q4', color: 'rgba(255,125,255,.75)', value: weatherData[cityName].sunnyyDaylightHoursQuaterly[3]}
        ]
      }
    }
    });
    // this.data = 
    //   { 
    //     Temperature:
    //      [
    //       {
    //           type: 'spline-area',
    //           label: 'High temperature',
    //           lineColor: 'rgba(255,0,0,.5)',
    //           drawChart: true,
    //           highCol: 'rgb(255,0,0)',
    //           lowCol: 'rgb(255,165,0)',
    //           data: formatRawData(londonWeatherData.temp.high, (val) => {
    //             return ('0' + val).slice(-2) + '°';
    //           })
    //       },
    //       {
    //         type: 'spline',
    //         label: 'Average temprature',
    //         lineColor: 'rgba(255,255,0,.5)',
    //         drawChart: true,
    //         data: formatRawData(londonWeatherData.temp.mean, (val) => {
    //           return ('0' + val).slice(-2) + '°';
    //         })
    //     },
    //     {
    //         type: 'spline',
    //         label: 'Low temperature',
    //         lineColor: 'rgba(0,0,255,.5)',
    //         drawChart: true,
    //         data: formatRawData(londonWeatherData.temp.low, (val) => {
    //           return ('0' + val).slice(-2) + '°';
    //         })
    //     }
    //   ],
    //   Rainfall: [
    //     {
    //         type: 'bars',
    //         label: 'Average rainfall mm',
    //         lineColor: 'rgba(0,0,255,.25)',
    //         chartGrowAnimation: 'bounce',
    //         highCol: 'rgb(0,0,255)',
    //         lowCol: 'rgb(0,255,0)',
    //         drawChart: true,
    //         stretchChart: true,
    //         data: formatRawData(londonWeatherData.rain.mm, (val) => {
    //           return val + 'mm';
    //         })
    //     },
    //     {
    //         type: 'line',
    //         label: 'Average rainfall days',
    //         lineColor: 'rgba(0,0,128,.75)',
    //         drawChart: true,
    //         chartGrowAnimation: 'easeInOutQuad',
    //         data: formatRawData(londonWeatherData.rain.days, (val) => {
    //           return val + ' days';
    //         })
    //     }
    //   ],
    //   Sunshine: [
    //     {
    //         type: 'spline-area',
    //         label: 'Sunshine hours',
    //         lineColor: 'rgba(255,255,0,.5)',
    //         highCol: 'rgb(255,255,0)',
    //         lowCol: 'rgb(0,0,0)',
    //         stretchChart: false,
    //         data: formatRawData(londonWeatherData.sunHours, (val) => {
    //           return val + ' hour' + (val !== 1 ? 's' : '');
    //         })
    //     }
    //   ],
    //   sunnyVsCloudyDaylightPercentageMonthly: {
    //     type: 'donut',
    //     label: 'Sunny (yellow) vs cloudy (grey) daylight hours average per month from January inside to Decemeber outside',
    //     stackInnerRadius: 50,
    //     stackOutterRadius: Dimensions.get('window').width,
    //         gap: 5,
    //         data: formatDonutData(londonWeatherData.sunnyVsCloudyDaylightPercentageMonthly,
    //          [
    //            {label: 'sunny', color: 'rgba(255,255,0,.75)'},
    //             {label: 'cloudy', color: 'rgba(50,50,50,.75)'}
    //           ]
    //         )
    //   },
    //   sunnyHoursQ: {
    //     type: 'pie',
    //     label: 'Number of sunny hours per yearly quarter',
    //     data: [
    //       {label: 'Q1', color: 'rgba(255,0,0,.75)', value: londonWeatherData.sunnyyDaylightHoursQuaterly[0]},
    //       {label: 'Q2', color: 'rgba(0,255,0,.75)', value: londonWeatherData.sunnyyDaylightHoursQuaterly[1]},
    //       {label: 'Q3', color: 'rgba(0,0,255,.75)', value: londonWeatherData.sunnyyDaylightHoursQuaterly[2]},
    //       {label: 'Q4', color: 'rgba(255,0,255,.75)', value: londonWeatherData.sunnyyDaylightHoursQuaterly[3]}
    //     ]
    //   }
    // };
    let buttonColors = ['rgba(255,0,0,.3)', 'rgba(0,0,255,.3)', 'rgba(255,255,0,.3)'];
    this.buttons = Object.keys(this.data.London).slice(0,3).map((d, idx) => {
            return <TouchableOpacity key={idx} style={[styles.chartTypeButton, {backgroundColor: buttonColors[idx]}]}
           onPress={()=>{
            this.setState(Object.assign(this.state, {chartName: d, activeMarker: {}, topText: 'Select month',bottomText: ''}));
          }}>
            <Text style={styles.buttonText}>{d}</Text>
          </TouchableOpacity>;
          });
  }

  onMarkerClick(chartIdx, pointIdx) {
    console.log('In call abck', chartIdx, pointIdx);
    if (chartIdx !== this.state.activeMarker.chartIdx
     || pointIdx !== this.state.activeMarker.pointIdx) {
      this.setState(Object.assign(this.state, {activeMarker: {chartIdx, pointIdx}}));
      // Fix next to animations need to run in sequence with funtion call inbetween,
      // might be cleaner to use Animted.sequence, but don't know how to do calbacks
      // between animations!
      const ANIMATION_TIME = 25;
      let currentMonth = new Date(this.data[this.state.selectedCity][this.state.chartName][chartIdx].data[this.state.activeMarker.pointIdx].date).getMonth();
      Animated
        .parallel([Animated.timing(this.state.topTextOpacity, {
          toValue: 0,
          duration: ANIMATION_TIME
        })])
        .start((() => {
          this.setState(Object.assign(this.state, {topText: monthNames[currentMonth]}));
        }));
      setTimeout(() => {
        Animated
          .parallel([Animated.timing(this.state.topTextOpacity, {
            toValue: 1,
            duration: ANIMATION_TIME
          })])
          .start();
      }, ANIMATION_TIME);

      const ANIMATION_TIME_BOTTOM = 250;
      let w = Dimensions
        .get('window')
        .width * .6;
      Animated.parallel([
        Animated.timing(this.state.bottomTextTrX, {
          toValue: w,
          duration: ANIMATION_TIME_BOTTOM
        }),
        Animated.timing(this.state.bottomTextOpacity, {
          toValue: 0,
          duration: ANIMATION_TIME_BOTTOM
        })
      ]).start(() => {
        this.setState(Object.assign(this.state, {
          bottomText: this.data[this.state.selectedCity][this.state.chartName][this.state.activeMarker.chartIdx].data[this.state.activeMarker.pointIdx].txt
        }))
      });
      setTimeout(() => {
        this
          .state
          .bottomTextTrX
          .setValue(-w);
        Animated.parallel([
          Animated.timing(this.state.bottomTextTrX, {
            toValue: 0,
            duration: ANIMATION_TIME_BOTTOM
          }),
          Animated.timing(this.state.bottomTextOpacity, {
            toValue: 1,
            duration: ANIMATION_TIME_BOTTOM
          })
        ]).start();
      }, ANIMATION_TIME_BOTTOM);
    }
  }

  render() {
    let currentMonth = this.state.activeMarker.chartIdx !== undefined
      ? new Date(this.data[this.state.selectedCity][this.state.chartName][this.state.activeMarker.chartIdx].data[this.state.activeMarker.pointIdx].date).getMonth()
      : null;
    let imageSrc;
    if (currentMonth >= 2 && currentMonth <= 4) {
      imageSrc = 'spring';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      imageSrc = 'summer';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      imageSrc = 'autumn';
    } else if (currentMonth >= 11 || currentMonth <= 1) {
      imageSrc = 'winter';
    }
    if (this.lastImagerSrc !== imageSrc) {
      if (this.activeImage === 0) {
        this.imageSrc1 = imageSrc;
        Animated.sequence([
          Animated.parallel([
            Animated.timing(this.state.image1op, {toValue: 1}),
            Animated.timing(this.state.image0op, {toValue: 0})
          ]),
          // Blur radius animation doesn't seem to work
          // Animated.timing(this.state.image0br, {
          //   toValue: 0,
          //   duration: 0
          // }),
          // Animated.delay(1000),   Animated.timing(   this.state.image1br,   {toValue:
          // 10, duration: 5000} )
        ]).start();
        this.activeImage = 1;
      } else {
        this.imageSrc0 = imageSrc;
        Animated.sequence([
          Animated.parallel([
            Animated.timing(this.state.image0op, {toValue: 1}),
            Animated.timing(this.state.image1op, {toValue: 0})
          ]),
          // Blur radius animation doesn't seem to work
          // Animated.timing(this.state.image1br, {
          //   toValue: 0,
          //   duration: 0
          // }),
          // Animated.delay(1000),   Animated.timing(   this.state.image0br,   {toValue:
          // 10, duration: 5000} )
        ]).start();
        this.activeImage = 0;
      }
    }
    this.lastImagerSrc = imageSrc;
    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <Animated.Image
          blurRadius={this.state.image0br}
          source={images[this.imageSrc0]}
          style={[
          styles.backgroundImage, {
            opacity: this.state.image0op
          }
        ]}/>
        <Animated.Image
          blurRadius={this.state.image1br}
          source={images[this.imageSrc1]}
          style={[
          styles.backgroundImage, {
            opacity: this.state.image1op
          }
        ]}/>
        <View style={styles.chartTypeButtonContainer}>
          {this.buttons}
        </View>
        <View style={styles.otherButtonContainer}>
          <TouchableOpacity onPress={()=> {
            this.setState(Object.assign(this.state, {
              showSelectCityModal: true
            }));
          }} style={{
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,0,255,.5)',
              paddingLeft: 5,
              paddingRight: 5,
              height: 50,
              borderBottomRightRadius: 12
            }}>
            <Text style={styles.buttonText}>Change</Text>
            <Text style={[styles.buttonText, {textAlign: 'center'}]}>City</Text>
          </TouchableOpacity>
          <Text style={styles.cityText}>{this.state.selectedCity}</Text>
          <TouchableOpacity onPress={()=> {
            this.setState(Object.assign(this.state, {
              showMoreCharts: true
            }));
          }}>
            <View style={{
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,255,0,.5)',
              paddingLeft: 5,
              paddingRight: 5,
              height: 50,
              borderBottomLeftRadius: 12
            }}>
            <Text style={[styles.buttonText ,{textAlign: 'center'}]}>More</Text>
            <Text style={styles.buttonText}>Charts</Text>
          </View>
          </TouchableOpacity>
        </View>
        <Animated.Text
          style={[
          styles.topText, {
            opacity: this.state.topTextOpacity
          }
        ]}>{this.state.topText}</Animated.Text>
        <ArtyCharty
          data={this.data[this.state.selectedCity][this.state.chartName]}
          pointsOnScreen={this.state.pointsOnScreen}
          noScroll={this.state.pointsOnScreen >= 12}
          clickFeedback={true}
          yAxisLeft={{numberOfTicks: 5}}
          interactive={true}
          animated={true}
          onMarkerClick={this
          .onMarkerClick
          .bind(this)}/>
          {
            this.state.activeMarker.chartIdx > -1 ?
            <View style={styles.bottomTextContainer}>
          <Text style={styles.bottomText}>{this.state.activeMarker.chartIdx !== undefined
              ? this.data[this.state.selectedCity][this.state.chartName][this.state.activeMarker.chartIdx].label + ': '
              : ''}</Text>
          <Animated.Text
            numberOfLines={2}
            style={[
            styles.bottomText, {
              opacity: this.state.bottomTextOpacity,
              transform: [
                {
                  translateX: this.state.bottomTextTrX
                }
              ]
            }
          ]}>
            {this.state.bottomText}
          </Animated.Text>
        </View>
        : null
          }
        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: Dimensions.get('window').width,
          height: 50,
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,.2)'
        }}>
          <TouchableOpacity onPress={()=>{
            this.setState(Object.assign(this.state, {
              pointsOnScreen: this.state.pointsOnScreen-1
            }));
          }}>
          <Text style={[styles.crementButton]}>-</Text>
          </TouchableOpacity>
          <View style={{
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Text style={{fontSize: 16, fontWeight: '700', color: 'white'}}>Points on screen:</Text>
            <Text style={{fontSize: 20, fontWeight: '900', color: 'white'}}>{this.state.pointsOnScreen}</Text>
          </View>
          <TouchableOpacity onPress={()=>{
            this.setState(Object.assign(this.state, {
              pointsOnScreen: this.state.pointsOnScreen+1
            }));
          }}>
          <Text style={[styles.crementButton]}>+</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType={"slide"}
          transparent={true}
          visible={this.state.showMoreCharts}
          onRequestClose={() => {

          }}
          >
         <ScrollView style={{
           paddingTop: 22,
          backgroundColor: 'rgba(255,255,255,.9)'
        }}>
          <View style={{
          flexDirection: 'column',
          alignItems: 'center'
        }}>
            <TouchableOpacity onPress={() => {
              this.setState(Object.assign(this.state, {
                showMoreCharts: false
              }));
            }}>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 10
              }}>Close ❌</Text>
            </TouchableOpacity>
            <Text>{this.data[this.state.selectedCity].sunnyHoursQ.label}</Text>
            <ArtyChartyPie 
         data={this.data[this.state.selectedCity].sunnyHoursQ}
         onSliceClick={(idx) => {
           this.setState(Object.assign(this.state, {
             pieChartText: `${this.data[this.state.selectedCity].sunnyHoursQ.data[idx].label}: ${this.data[this.state.selectedCity].sunnyHoursQ.data[idx].value.toFixed(2)}`
           }));
         }}/>
         <Text>{this.state.pieChartText}</Text>
         {hr}
        <Text>{this.data[this.state.selectedCity].sunnyVsCloudyDaylightPercentageMonthly.label}</Text>
        <ArtyChartyDonut
          data={
            this.data[this.state.selectedCity].sunnyVsCloudyDaylightPercentageMonthly
        }
        onSliceClick={(dataSetIdx, pointIdx) => {
          this.setState(Object.assign(this.state, {
            donutChartText: `${monthNames[dataSetIdx]} avg. sunny hours: ${weatherData[this.state.selectedCity].sunnyVsCloudyDaylightPercentageMonthly[dataSetIdx][0]}, avg. cloudy hours: ${weatherData[this.state.selectedCity].sunnyVsCloudyDaylightPercentageMonthly[dataSetIdx][1]}`,
            donutChartTextShadowColor: pointIdx === 0 ? 'yellow' : 'grey'
          }));
        }}
          />
          <Text style={{
            textShadowRadius: 2,
            padding: 3,
            textShadowOffset: {
              width: 1,
              height: 1
            },
            textShadowColor: this.state.donutChartTextShadowColor
          }}>{this.state.donutChartText}</Text>
          {hr}
          <Text>Scatter</Text>
          <ArtyChartyXY showGrid={true} type="scatter" pointRadius={3} data={Array.from(Array(20)).map(()=> { return {x: Math.random()*20, y: Math.random()* 10} })}/>
          {hr}
          <Text>Bubble</Text>
          <ArtyChartyXY type="bubble" animated={true} pointRadius={3} data={Array.from(Array(20)).map(()=> { return {x: Math.random()*20, y: Math.random()* 10, value: Math.random()* 20, color: `rgba(${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)},${Math.round(Math.random() * 255)}, .5)` }})}/>
          </View>
         </ScrollView>
        </Modal>
        <Modal
          animationType={"fade"}
          transparent={true}
          visible={this.state.showSelectCityModal}
          onRequestClose={() => {
            
          }}
          >
          <View style={{
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 22,
          backgroundColor: 'rgba(255,255,255,.9)'
        }}>
        <TouchableOpacity onPress={() => {
              this.setState(Object.assign(this.state, {
                showSelectCityModal: false
              }));
            }}>
            <Text style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  marginBottom: 10
                }}>Close ❌</Text>
            </TouchableOpacity>
           <Text style={{
             marginBottom: 5,
             fontSize: 28
           }}>Select City:</Text>
           <View style={{
             flexDirection: 'row'
           }}>
             <Text style={{fontWeight: 'bold', width: 80}} >City</Text>
             <Text style={{fontWeight: 'bold', width: 75, textAlign: 'center'}} >Temp</Text>
             <Text style={{fontWeight: 'bold', width: 75, textAlign: 'center'}} >Rain</Text>
             <Text style={{fontWeight: 'bold', width: 75, textAlign: 'center'}} >Sun</Text>
             <Text style={{fontWeight: 'bold', width: 15, textAlign: 'center', lineHeight: 22}} >☀️</Text>
           </View>
           {
             Object.keys(this.data).map(city => {
               return (
                  <TouchableOpacity key={city} onPress={()=> {
                    this.setState(Object.assign(this.state, {
                      selectedCity: city
                    }));
                  }}>
                  <View style={{
                    flexDirection: 'row',
                    marginBottom: 4
                  }}>
                    <Text style={{
                      fontWeight: this.state.selectedCity === city ? 'bold' : 'normal',
                      width: 80
                    }}>{city}</Text>
                    <ArtySparkyLine width={75} height={15} color="red" data={this.data[city].Temperature[0].data} />
                    <ArtySparkyLine width={75} height={15} color="blue" data={this.data[city].Rainfall[0].data} />
                    <ArtySparkyLine width={75} height={15} color="yellow" data={this.data[city].Rainfall[0].data} style={{backgroundColor: 'rgba(0,0,0,.2)'}}/>
                    <ArtySparkyPie style={{marginLeft: 4}} size={15} data={this.data[city].sunnyHoursQ}/>
                  </View>
                  </TouchableOpacity>
                 );
             })
           }
          </View>
        </Modal>
      </View>
    );
  }
}

const hr = <View style={{
    width: Dimensions.get('window').width,
    height: 1,
    backgroundColor: 'grey',
    margin: 3
  }}/>;

const txtShadow = {
  color: 'white',
  textShadowColor: 'black',
  textShadowRadius: 5,
  padding: 15,
  textShadowOffset: {
    width: 1,
    height: 1
  },
  backgroundColor: 'transparent'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  backgroundImage: {
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions
      .get('window')
      .width,
    height: Dimensions
      .get('window')
      .height
  },
  topText: {
    fontSize: 64,
    lineHeight: 60,
    fontWeight: '200',
    ...txtShadow
  },
  bottomText: {
    fontWeight: '100',
    fontSize: 48,
    textAlign: 'center',
    ...txtShadow,
    textShadowRadius: 3,
    padding: 3,
    lineHeight: 48
  },
  bottomTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: 25,
    width: Dimensions.get('window').width * .9
  },
  chartTypeButtonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: 30
  },
  chartTypeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    ...txtShadow,
    padding: 3,
    fontWeight: 'bold'
  },
  otherButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 30,
    left: 0,
    width: Dimensions.get('window').width,
    height: 50
  },
  cityText: {
    color: 'white',
    ...txtShadow,
    fontWeight: 'bold',
    fontSize: 28
  },
  crementButton: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white'
  }
});

export default App;
