const http = require('http');
const File  = require('fs');
const Path  = require('path');


// we have to calculate start and end time to calculate latency
// take average of responses and add latency to get more accurate time
const startTime = Date.now();

checkAllServersInParallel('hostnames.txt')
.then(function(data) {
  // console.log('data:', data);

  const avgTime = getAverageTime(data); // avg time of all server times
  const latency = Date.now() - startTime; // add latency to average

  let avgTimePlusLatency = new Date(avgTime + latency);
  console.log(`Date: ${avgTimePlusLatency}.`);
  console.log(`Time in ISO 8601: ${avgTimePlusLatency.toISOString()}`);
})
.catch(error => console.log(error));


function checkAllServersInParallel(filename) {
  const listOfServers =  getListOfServers(filename);
  const promisedServerResponses = listOfServers.map(server => checkServer(server));
  const dateResultsAsync = Promise.all(promisedServerResponses);
  return dateResultsAsync;
}


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
