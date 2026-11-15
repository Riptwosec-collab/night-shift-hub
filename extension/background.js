'use strict';
// Open (and re-focus if already present) the packaged dashboard as a full browser tab.
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());
