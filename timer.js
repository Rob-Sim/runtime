//Global variables
let min = sec = mili = 0
//Stores all of the runners and statistics for each
let runners = {}

//New runner name submitted. Create obj with name as reference
function submitted(){
    let runnerName = document.getElementById("runner__form").name.value
    runners[runnerName] = {
        name: runnerName,
        averageTime: {},
        lapCount: 0,
        fastestLap: {min: 10000, sec: 10000, ms: 10000},
        recentLap: [{min: undefined, sec: undefined, ms: undefined}],
        totalTime: {min: 0, sec: 0, ms: 0}
    }

    createEle(runnerName)
    //Remove the inner value of input once submitted
    document.getElementById("runner__form").name.value = " "
}

//Create the inputted runner's HTML element
function createEle(runnerName){
    //HTML markup. Passes in runner name for ids and name 
    let table = document.getElementById("lap-time__container")
    let cont = document.createElement("tr")

    //Name header
    let runnerTitle = document.createElement("button");
    runnerTitle.id = "runner--" + runnerName
    runnerTitle.innerText = runnerName
    runnerTitle.onclick = function(){lapBtn(runnerName)}
    cont.appendChild(runnerTitle)

    //Total time
    let headerTotal = document.createElement("td");
    headerTotal.id = runnerName + "__total-time"
    cont.appendChild(headerTotal)

    //Fastest Lap
    let headerFastest = document.createElement("td");
    headerFastest.id = runnerName + "__fastest-lap"
    cont.appendChild(headerFastest)

    //Recent lap
    let headerRecent = document.createElement("td");
    headerRecent.id = runnerName + "__recent-lap"
    cont.appendChild(headerRecent)

    //Average lap
    let headerAverage = document.createElement("td");
    headerAverage.id = runnerName + "__average-lap"
    cont.appendChild(headerAverage)

    table.appendChild(cont)
}

const displayMin = document.getElementById("timer__min")
const displaySec = document.getElementById("timer__sec")
const displayMili = document.getElementById("timer__mili")
//Using a var counting style timer with setInterval()
//When ms gets to 100 (1000ms), add to sec. When sec gets to 60, add to min. Reset to 0 on each uptick
//Run on the click event on startTimer btn
function startTimer(){
    //Creates a global setInterval() with name 'timer' run every 10ms
    window.timer = setInterval(function(){
        mili++
        if(mili == 100){
            mili = 0
            sec++
    
            if(sec == 60){
                sec = 0
                min++
                //If the item is single diget, show on display a 0 before it
                displayMin.innerText = min < 10 ? "0" + min : min;
            }
            displaySec.innerText = sec < 10 ? "0" + sec : sec;
        }
        displayMili.innerText = mili < 10 ? "0" + mili : mili;
    }, 10)
}

//Compare 2 laps
function compareLap(comp1, comp2){
    // Check if min is less than. if so, it is the fastest
    if(comp1.min < comp2.min){return true}
    //If the mins are the same
    if(comp1.min == comp2.min){
        //and the seconds are less, it is the fastest
        if(comp1.sec < comp2.sec){return true}
        //if the seconds are the same
        if(comp1.sec == comp2.sec){
            // and the ms are less, it is the fastest
            if(comp1.ms < comp2.ms){return true}
        }
    }
}

function timeString(timeObj){
    return `${timeObj.min}:${timeObj.sec}.${timeObj.ms}`
}

//Run on each runner's lap btn
function lapBtn(runnerName){
    //current min sec ms saved as recentLap
    let recentLap = {min: min, sec: sec, ms: mili}
    //Get their elapsed run time so far
    let totalTimeObj = runners[runnerName].totalTime

    //Their actual lap time itself is (the current time - their total time elapsed)
    recentLap.min -= totalTimeObj.min
    recentLap.sec -= totalTimeObj.sec
    recentLap.ms -= totalTimeObj.ms
    checkNums(recentLap)

    //That settles the lap time itself. Now we need to add this new lap time to the total time run
    totalTimeObj.min += recentLap.min
    totalTimeObj.sec += recentLap.sec
    totalTimeObj.ms += recentLap.ms
    checkNums(totalTimeObj)

    //Push the new time to their recent lap times objArr and display it
    runners[runnerName].recentLap.push(recentLap)
    document.getElementById(runnerName + "__recent-lap").innerText = timeString(recentLap)

    runners[runnerName].lapCount++

    //Check if the recent lap was faster than their stored fastest lap
    let compare = compareLap(recentLap, runners[runnerName].fastestLap)
    //If so, change it
    if(compare){
        runners[runnerName].fastestLap = recentLap
        document.getElementById(runnerName + "__fastest-lap").innerText = timeString(runners[runnerName].fastestLap)
    }
    findAvg(runners[runnerName], runnerName)
}

//Fail safe. When we add or take away, their may be issues with the time number where we end up with negative numbers or over 60 in seconds for example later down the line, just check their isnt any issue, if there is, correct them
function checkNums(toCheck){
    //if there are more than 60 seconds, add to the min count, take 60 away from sec
    while(toCheck.sec >= 60){
        toCheck.min += 1
        toCheck.sec -= 60
    }
    // if there are negative seconds, take from the min count, add 60 to sec
    while(toCheck.sec < 0){
        toCheck.min -= 1
        toCheck.sec += 60
    }
    //Same as above for ms
    while(toCheck.ms >= 100){
        toCheck.sec += 1
        toCheck.ms -= 100
    }
    while(toCheck.ms < 0){
        toCheck.sec -= 1
        toCheck.ms += 100
    }
    return toCheck
}

//Finds the average lap time for given runner
function findAvg(runner, runnerName){
    averageTime = (
        //convert total time elapsed to seconds (sec.ms)
        (
            (runner.totalTime.min * 60) + 
            (runner.totalTime.sec) + 
            (runner.totalTime.ms / 100)
        )
        //Make that an average
        / runner.lapCount
    )
    //Get average to two decimal places
    averageTime = averageTime.toFixed(2)

    //convert into string for split method to get the sec/ms seperate
    let avgString = averageTime.toString();
    //before the dot is sec. after is ms
    let avgArray = avgString.split('.');

    //the + transforms the string into a number again
    runner.averageTime = {
        min: 0,
        sec: +avgArray[0], 
        ms: +avgArray[1]
    }
    //If the average time seconds are over 60, thats a min.
    while(runner.averageTime.sec > 60){
        runner.averageTime.min++
        runner.averageTime.sec -= 60
    }
    //Display
    document.getElementById(runnerName + "__average-lap").innerText = timeString(runner.averageTime)

    document.getElementById(`${runnerName}__total-time`).innerText = timeString(runner.totalTime)
}
//Run on end race btn
function endRace(){
    //Stop the global interval of timer
    clearInterval(timer)
    //Store stats from race
    let recordObj = {
        lowestOvr: {
            name: undefined,
            record: {min: 10000, sec:10000, ms:10000}
        },
        fastestLap: {
            name: undefined,
            record: {min: 10000, sec:10000, ms:10000}
        }
    }
    //Use these shortcuts for comparisons
    let lowestOvr = recordObj.lowestOvr.record
    let fastestLapTime = recordObj.fastestLap.record

    //For each runner within the runners object
    for (const runner in runners) {

        //Check if their overall time is less than the current found lowest
        let runnerOvr = runners[runner].totalTime
        if(compareLap(runnerOvr, lowestOvr)){
            lowestOvr = runnerOvr
            recordObj.lowestOvr.name = runners[runner].name
        }

        //check if their fastest lap time is faster than the current fastest time found
        let runnerFastest = runners[runner].fastestLap
        if(compareLap(runnerFastest, fastestLapTime)){
            fastestLapTime = runnerFastest
            recordObj.fastestLap.name = runners[runner].name
        }
    }

    //Remerge obj with shortcuts
    recordObj.lowestOvr.record = lowestOvr
    recordObj.fastestLap.record = fastestLapTime

    //Display the stats found
    displayEnd(recordObj)
}

//Update record visuals for the end of the race
function displayEnd(recordObj){
    document.getElementById("raceEnd__lowestOvr--name").innerText = recordObj.lowestOvr.name
    document.getElementById("raceEnd__lowestOvr--time").innerText = timeString(recordObj.lowestOvr.record)

    document.getElementById("raceEnd__fastestLap--name").innerText = recordObj.fastestLap.name
    document.getElementById("raceEnd__fastestLap--time").innerText = timeString(recordObj.fastestLap.record)
}