var lastPlayingTab;
var queryInfo = {
  url: '*://soundcloud.com/*'
};
var soundCloudStatus = {};

function prepareScript (scriptFile) {
  var scriptDetail = {};
  scriptDetail.file = '/js/' + scriptFile + '.js';

  return scriptDetail;
}

function isTabPlaying (tab, callback) {
  chrome.tabs.executeScript(tab.id, prepareScript('detectPlaying'), function(results) {
    return callback(results[0]);
  });
}

function isTabRepeating (tab, callback) {
  chrome.tabs.executeScript(tab.id, prepareScript('detectRepeating'), function(results) {
    return callback(results[0]);
  });
}

function findSuitableTab (tabs, callback) {
  return async.detect(tabs, isTabPlaying, function(playingTab) {
     if (playingTab) {
       playingTab.playing = true;
       //update playing tab
       lastPlayingTab = playingTab;

       return callback(playingTab);
     } else {
       // if no tab is playing return lastPlayingTab
       if (lastPlayingTab) {
         lastplaying.playing = false;
         return callback(lastPlayingTab);
       } else {
         //if all else fails just return first tab found
         var pausedTab = tabs[0];
         pausedTab.playing = false;

         // save as lastplaying tab
         lastPlayingTab = pausedTab;
         return callback(pausedTab);
       }
     }
  });
}

function findSoundCloundTabId (callback) {
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab;

    if (tabs.length === 0) return callback();

    if (tabs.length === 1) return callback(tabs[0].id);

    else {
      findSuitableTab(tabs, function(playingTab) {
        return callback(playingTab.id);
      });
    }

  });
}

function parseCommand(command) {
  return command.split('-').map(function(word, index) {
    if (index !== 0) return word.charAt(0).toUpperCase().concat(word.slice(1));
    return word;
  }).join('');
}

function executeCommand(command) {
  var parsedCommand = parseCommand(command);

  findSoundCloundTabId(function(playingTabId) {
    if (playingTabId) {
      chrome.tabs.executeScript(playingTabId, prepareScript(parsedCommand));
      chrome.runtime.sendMessage({command: command});
    }
  });
}

function detectPageStatus (callback) {
  chrome.tabs.query(queryInfo, function(tabs) {
    findSuitableTab(tabs, function(tab) {
      soundCloudStatus.playing = tab.playing;

      isTabRepeating(tab, function(result) {
        soundCloudStatus.repeating = result;
        callback(soundCloudStatus);
      });
    });
  });
}

chrome.commands.onCommand.addListener(function(command) {
  executeCommand(command);
});
