// //const xMin = 598
// //const xMax = 1351
// //const yMin = 161
// //const yMax = 701

// const xMin = 599;
// const xMax = 961;
// const yMin = 72;
// const yMax = 717;

// // first look at the target area

// export function timeToFirstGaze(gazeData) {
//   let cumulativeTime = 0; // This variable tracks the total time that has passed.

//   for (let i = 0; i < gazeData.length; i++) {
//     // Extract x, y coordinates and timestamp (time) from each data point
//     const { x, y, time } = gazeData[i];

//     cumulativeTime += time; // Add the time for each gaze point to the cumulativeTime

//     if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
//       return cumulativeTime; // Return the total time when the gaze enters the target area
//     }
//   }

//   return -1;
// }

// export function countTimesOutsideArea(gazeData) {
//   let isInsideArea = false; // Variable to track if the previous gaze was inside the target area
//   let countOutside = 0; //  // Counter to count how many times the gaze goes outside the target area

//   gazeData.forEach(({ x, y }) => {
//     // Check if the current gaze is inside the target area
//     const insideArea = x >= xMin && x <= xMax && y >= yMin && y <= yMax;

//     if (isInsideArea && !insideArea) {
//       // If the previous gaze was inside the area, but the current gaze is outside, increment the count
//       countOutside++; // Increase the count when moving outside after being inside
//     }

//     isInsideArea = insideArea; // Store the current gaze status for the next iteration
//   });

//   return countOutside; // Return the number of times the gaze moved outside
// }
