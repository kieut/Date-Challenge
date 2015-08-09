const http = require('http');
const File  = require('fs');
const Path  = require('path');


// We make parallel requests to list of servers and calculate the average of
// all server time responses for the current time. We then calculate the
// latency (endTime - startime) and add it to the current time(avg time) in order to
// get a more accurate time. Script prints out the time in ISO 8601
// format to the console

const startTime = Date.now();

checkAllServersInParallel('hostnames.txt')
.then(function(data) {
  const avgTime = getAverageTime(data); // avg time of all server times
  const latency = Date.now() - startTime; // add latency to average
  const avgTimePlusLatency = new Date(avgTime + latency);

  console.log(`Date: ${avgTimePlusLatency}.`);
  console.log(`Time in ISO 8601: ${avgTimePlusLatency.toISOString()}`);
})
.catch(error => console.log(error));


// Returns a promise that resolves when all servers are checked.
function checkAllServersInParallel(filename) {
  const listOfServers =  getListOfServers(filename);
  const promisedServerResponses = listOfServers.map(server => checkServer(server));
  const dateResultsAsync = Promise.all(promisedServerResponses);
  return dateResultsAsync;
}


// Returns a promise
function checkServer(server) {
  return httpGet(server)
  .then(function(res) {
    if(res.headers.date) {
      let d = new Date(res.headers.date); //convert to local time
      // console.log('server and resp date: ', server, res.headers.date);
      let timeInMs = d.getTime(); // get time in ms
      return { timeInMs };
    }
  })
  .catch(function(error) {
    console.log(error);
    return error;
  });
}


function httpGet(server) {
  return new Promise(function(resolve, reject) {
    http.get(server, function(res, error) {
      if (res)
        resolve(res);
      else
        reject(error);
    });
  });
}


// Averages the time in ms from all servers responses.
function getAverageTime(results) {
  let total = 0;
  let validResults = 0;
  results.forEach(function(result) {
    if (result && result.timeInMs){
      total += result.timeInMs;
      validResults++;
    }
  });
  const avgTime = total / validResults;
  return avgTime;
}


function getListOfServers(filename) {

  function notEmpty(line) {
    return line.trim().length > 0;
  }

  function notAComment(line) {
    return line[0] !== '#';
  }

  function dropComment(line) {
    return line.replace(/\s+#.*/, '');
  }

  function fixUrl(line) {
    return `http://${line}`;
  }

  const fullname  = Path.resolve(__dirname, filename);
  return File.readFileSync(fullname, 'utf8')
    .split('\n')
    .filter(notEmpty)
    .filter(notAComment)
    .map(dropComment)
    .map(fixUrl);
}
