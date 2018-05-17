var lastActiveTab;
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
  getTabInfo(tab.id, function(tabInfo) {
    return callback(tabInfo.playing);
  });
}

function getTabInfo (tabId, callback) {
  chrome.tabs.executeScript(tabId, prepareScript('getTabInfo'), function(results) {
    return callback(results[0]);
  });
}

function findSuitableTab (tabs, callback) {
  return async.detect(tabs, isTabPlaying, function(playingTab) {
     if (playingTab) {
       //update playing tab
       lastActiveTab = playingTab;

       return callback(playingTab);
     } else {
       // if no tab is playing return lastActiveTab
       if (lastActiveTab) {
         return callback(lastActiveTab);
       } else {
         //if all else fails just return first tab found
         var pausedTab = tabs[0];

         // save as lastplaying tab
         lastActiveTab = pausedTab;
         return callback(pausedTab);
       }
     }
  });
}

function findSoundCloundTabId (callback) {
  chrome.tabs.query(queryInfo, function(tabs) {

    if (tabs.length === 0) return callback();

    if (tabs.length === 1) {
      var tab = tabs[0];

      lastActiveTab = tab;
      return callback(tab.id);
    }

    else {
      findSuitableTab(tabs, function(tab) {
        return callback(tab.id);
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
      chrome.tabs.executeScript(playingTabId, prepareScript(parsedCommand), function() {
        emitPageStatus();
      });
    } else if (lastActiveTab) {

      var createProperties = {
        url: lastActiveTab.url,
        active: false
      };
      chrome.tabs.create(createProperties, function(newTab) {

      });
    }
    else {
      console.log('Not tab or lastActiveTab found :(');
    }
  });
}

function emitPageStatus () {
  findSoundCloundTabId(function(tabId) {
    if (tabId) {
      getTabInfo(tabId, function(tabInfo) {
        soundCloudStatus.playing = tabInfo.playing;
        soundCloudStatus.repeating = tabInfo.repeating;
        soundCloudStatus.muted = tabInfo.muted;
        soundCloudStatus.title = tabInfo.title;
        soundCloudStatus.liking = tabInfo.liking;
        soundCloudStatus.image = tabInfo.image;
        soundCloudStatus.artist = tabInfo.artist;

        chrome.runtime.sendMessage(soundCloudStatus);
      });
    }
  });
}

chrome.commands.onCommand.addListener(function(command) {
  executeCommand(command);
});
