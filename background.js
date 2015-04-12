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
  getTabInfo(tab, function(tabInfo) {
    return callback(tabInfo.playing);
  });
}

function getTabInfo (tab, callback) {
  chrome.tabs.executeScript(tab.id, prepareScript('getTabInfo'), function(results) {
    return callback(results[0]);
  });
}

function findSuitableTab (tabs, callback) {
  return async.detect(tabs, isTabPlaying, function(playingTab) {
     if (playingTab) {
       //update playing tab
       lastPlayingTab = playingTab;

       return callback(playingTab);
     } else {
       // if no tab is playing return lastPlayingTab
       if (lastPlayingTab) {
         return callback(lastPlayingTab);
       } else {
         //if all else fails just return first tab found
         var pausedTab = tabs[0];

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
      emitPageStatus();
    }
  });
}

function emitPageStatus () {
  chrome.tabs.query(queryInfo, function(tabs) {
    findSuitableTab(tabs, function(tab) {

      getTabInfo(tab, function(tabInfo) {
        soundCloudStatus.playing = tabInfo.playing;
        soundCloudStatus.repeating = tabInfo.repeating;
        soundCloudStatus.muted = tabInfo.muted;
        soundCloudStatus.title = tabInfo.title;

        chrome.runtime.sendMessage(soundCloudStatus);
      });
    });
  });
}

chrome.commands.onCommand.addListener(function(command) {
  executeCommand(command);
});
