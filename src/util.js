export function makePathAndMarkers(data, yTicksCount, containerWidth) {
  let maxBalance = 0, i;
  let graphHeight = 150;
  let fullWidth;
  data.forEach(function(d) {
    if (d.balance > maxBalance) {
      maxBalance = d.balance;
    }
  });
  var heightScaler = 100/maxBalance;
  xSpacing = containerWidth / 4;
  var width = containerWidth;
  fullWidth = xSpacing*(data.length-1);
  var max = 0, pathStrArray = ['M0', graphHeight], xCord;
  // Make path and coordinates and find max:
  data.forEach(function(d, idx) {
    xCord = idx*xSpacing;
    // Check if we have a new maximum:
    if (d.balance > max) {
        max = d.balance;
      }
      // Move line to to next x-coordinate:
    pathStrArray.push('L' + xCord);
    // And y-cordinate: (NEED TO NORMALISE TO 100)
    pathStrArray.push(graphHeight - d.balance * heightScaler);
    // // Add date label:
    // var dateLabel = document.createElementNS(svgns, "text");
    // dateLabel.setAttributeNS(null, 'x', xCord);
    // dateLabel.setAttributeNS(null, 'y', -2);
    // var textNode = document.createTextNode(moment(d.date).format('DD MMM'));
});
  // Move to bottom right corner:
  pathStrArray.push('L' + (fullWidth));
  pathStrArray.push(graphHeight);
  // Close path:
  pathStrArray.push('Z');
  let viewBox = (fullWidth-xSpacing*4) + ' ' + (-graphHeight) + ' ' + width + ' ' + graphHeight;
  let outPath = pathStrArray.join(' ');
  console.log('outPath', outPath, 'viewBox', viewBox);
  return {
    viewBox,
    path: outPath,
    width: xCord,
    height: graphHeight,
    maxScroll: xCord - width
  };
}