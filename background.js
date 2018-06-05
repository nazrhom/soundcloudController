var lastActiveTab;
var queryInfo = {
  url: '*://soundcloud.com/*'
};
var soundCloudStatus = {};

function prepareScript(scriptFile) {
  var scriptDetail = {};
  scriptDetail.file = '/js/' + scriptFile + '.js';

  return scriptDetail;
}

function isTabPlaying(tab, callback) {
  getTabInfo(tab.id, function (tabInfo) {
    return callback(tabInfo.playing);
  });
}

function getTabInfo(tabId, callback) {
  chrome.tabs.executeScript(tabId, prepareScript('getTabInfo'), function (results) {
    return callback(results[0]);
  });
}

function findSuitableTab(tabs, callback) {
  return async.detect(tabs, isTabPlaying, function (playingTab) {
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

function findSoundCloundTab(callback) {
  chrome.tabs.query(queryInfo, function (tabs) {

    if (tabs.length === 0) return callback();

    if (tabs.length === 1) {
      var tab = tabs[0];

      lastActiveTab = tab;
      return callback(tab);
    }

    else {
      findSuitableTab(tabs, function (tab) {
        return callback(tab);
      });
    }

  });
}

function parseCommand(command) {
  return command.split('-').map(function (word, index) {
    if (index !== 0) return word.charAt(0).toUpperCase().concat(word.slice(1));
    return word;
  }).join('');
}

function executeCommandOnTab(tab, command, backoff = 100) {
  if (tab.status === 'loading') {
    var delayed = setTimeout(() => {
      executeCommandOnTab(tab, command, backoff * 2)
      clearTimeout(delayed)
    }, backoff)
  } else {
    runCommand(tab, command)
  }
}

function runCommand(tab, command) {
  chrome.tabs.executeScript(tab.id, prepareScript(command), () => {
    emitPageStatus();
  });
}

function runCommandInEnv(tab, command, env) {
  chrome.tabs.executeScript(tab.id, {
    code: env
  }, function () {
    runCommand(tab, command)
  })
}

function moveTimeline(frac) {
  findSoundCloundTab(function (playingTab) {
    runCommandInEnv(playingTab, 'setTime', `var config = { frac: ${frac} }`)
  })
}

function executeCommand(command) {
  var parsedCommand = parseCommand(command);

  findSoundCloundTab(function (playingTab) {
    if (playingTab) {
      executeCommandOnTab(playingTab, parsedCommand)
    } else if (lastActiveTab) {

      var createProperties = {
        url: lastActiveTab.url,
        active: true
      };
      chrome.tabs.create(createProperties);
    }
    else {
      var createProperties = {
        url: 'https://soundcloud.com/stream',
        active: true
      };
      chrome.tabs.create(createProperties);
    }
  });
}

function emitPageStatus() {
  findSoundCloundTab(function (tab) {
    if (tab) {
      getTabInfo(tab.id, function (tabInfo) {
        soundCloudStatus.playing = tabInfo.playing;
        soundCloudStatus.repeating = tabInfo.repeating;
        soundCloudStatus.muted = tabInfo.muted;
        soundCloudStatus.title = tabInfo.title;
        soundCloudStatus.liking = tabInfo.liking;
        soundCloudStatus.image = tabInfo.image;
        soundCloudStatus.artist = tabInfo.artist;
        soundCloudStatus.songLength = tabInfo.songLength;
        soundCloudStatus.songCurrentTime = tabInfo.songCurrentTime;

        chrome.runtime.sendMessage(soundCloudStatus);
      });
    }
  });
}

function openShortcutsView() {
  var createProperties = {
    url: 'chrome://extensions/shortcuts',
    active: true
  };
  chrome.tabs.create(createProperties, function (newTab) {
    executeCommandOnTab(newTab, parsedCommand)
  });
}


// Add listener for keyboard shortcuts
chrome.commands.onCommand.addListener(function (command) {
  executeCommand(command);
});
