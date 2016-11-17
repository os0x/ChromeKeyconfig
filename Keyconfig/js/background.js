MainActions = {
  actions: {},
  registerAction: function (name, func) {
    MainActions.actions[name] = func;
  },
  registerActions: function (hash) {
    Object.keys(hash).forEach(function (key) {
      MainActions.registerAction(key, hash[key]);
    });
  }
};
this.Keyconfig = {
  name: 'Chrome Keyconfig',
  version: '',
  normal_actions: {
    "q q": {name: "select left tab", args: []},
    "w w": {name: "select right tab", args: []},
    "t t": {name: "toggle pin tab", args: []},
    "j": {name: "scroll down", args: []},
    "k": {name: "scroll up", args: []},
    "h": {name: "scroll left", args: []},
    "l": {name: "scroll right", args: []},
    "M-j": {name: "scroll down half page", args: []},
    "M-k": {name: "scroll up half page", args: []},
    "M-J": {name: "scroll to bottom", args: []},
    "M-K": {name: "scroll to top", args: []},
    "a a": {name: "focus first text input", args: []},
    "C-d": {name: "navigate form elements forward", args: []},
    "C-u": {name: "navigate form elements backward", args: []},
    "Escape": {name: "limited mode", args: []},
    "c o n f i g": {name: "Keyconfig", args: []}
  },
  limited_actions: {
    "Escape": {name: "normal mode", args: []}
  },
  useTabTitle: false,
  smooth_scroll: false,
  ldrize: false,
  chrome_vim: false,
  antiAutoFocus: false,
  vim_normal_actions: {
    "j": {name: "Down", args: []},
    "k": {name: "Up", args: []},
    "h": {name: "Left", args: []},
    "l": {name: "Right", args: []},
    "^": {name: "Line head", args: []},
    "$": {name: "Line foot", args: []},
    "Escape": {name: "normal mode", args: []},
    "i": {name: "insert mode", args: []}
  },
  vim_insert_actions: {
    "Escape": {name: "normal mode", args: []}
  },
  vim_default_mode: 'insert',
  vim_color_config: {
    normal: {
      background: 'gray',
      text: 'black'
    },
    insert: {
      background: 'white',
      text: 'black'
    }
  }
};
this.SiteStatus = {};
this.default_keyconfig = JSON.parse(JSON.stringify(Keyconfig));
function checkVersion(ver, base_ver) {
  var vers = ver.split('.').map(function (v) {
    return parseInt(v, 10);
  });
  var base_vers = base_ver.split('.').map(function (v) {
    return parseInt(v, 10);
  });
  while (base_vers.length < 4) base_vers.push(0);
  return !base_vers.some(function (bv, i) {
    var v = vers[i];
    if (v > bv) return true;
  });
}
function initializer() {
  if (localStorage.Keyconfig) {
    Keyconfig = JSON.parse(localStorage.Keyconfig);
  } else {
    localStorage.Keyconfig = JSON.stringify(Keyconfig);
  }
  if (localStorage.SiteStatus) {
    SiteStatus = JSON.parse(localStorage.SiteStatus);
  } else {
    localStorage.SiteStatus = JSON.stringify(SiteStatus);
  }
  Object.keys(Keyconfig).forEach(function (k, i) {
    if (!/_actions$/.test(k)) {
    } else {
      config_update(k);
    }
  });
}
get_manifest(function (manifest) {
  this.Manifest = manifest;
  Keyconfig.version = default_keyconfig.version = manifest.version;
  config_save();
});
window.onunload = function () {
  if (!localStorage.Keyconfig) {
    localStorage.Keyconfig = JSON.stringify(Keyconfig);
  }
};
function config_update(prefix) {
  var actions = Keyconfig[prefix + 'actions'] || Keyconfig[prefix], _actions = [];
  Object.keys(actions).forEach(function (k) {
    _actions.push({key: String(k), input: '', length: String(k).split(' ').length, action: actions[k]});
  });
  _actions.sort(function (a, b) {
    return b.length - a.length;
  });
  keyactions[prefix + '_map'] = _actions;
}
function config_save(prefix) {
  localStorage.Keyconfig = JSON.stringify(Keyconfig);
}
var keyactions = {};
this.KC = {
  action_names: [
    {
      group: 'None',
      actions: [
        {name: "no action", args: []},
        {name: "default action", args: []}
      ]
    },
    {
      group: 'Navigations',
      actions: [
        {name: "back", args: []},
        {name: "fastback", args: []},
        {name: "forward", args: []},
        {name: "go to #1", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ]},
        {name: "go to parent dir", args: []}
      ]
    },
    {
      group: 'Tabs',
      actions: [
        {name: "open new tab", args: []},
        {name: "open new tab background", args: [], and: true},
        {name: "open blank tab", args: []},
        {name: "open blank tab background", args: [], and: true},
        {name: "open #1 in new tab", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ]},
        {name: "open #1 in new tab background", args: [
          {type: 'URL'},
          {type: 'NAME'}
        ], and: true},
        {name: "close this tab", args: []},
        {name: "close other tabs", args: [], and: true},
        {name: "close right tabs", args: [], and: true},
        {name: "close left tabs", args: [], and: true},
        {name: "pin tab", args: []},
        {name: "unpin tab", args: []},
        {name: "toggle pin tab", args: []}
      ]
    },
    {
      group: 'Windows',
      actions: [
        {name: "open new window", args: []},
        {name: "close this window", args: []}
      ]
    },
    {
      group: 'TabNavigations',
      actions: [
        {name: "select right tab", args: []},
        {name: "select left tab", args: []},
        {name: "select last tab", args: []},
        {name: "select first tab", args: []},
        {name: "re-open closed tab", args: []},
        {name: "clone tab", args: []}
      ]
    },
    {
      group: 'Scroll',
      actions: [
        {name: "scroll up", args: [], and: true},
        {name: "scroll down", args: [], and: true},
        {name: "scroll right", args: [], and: true},
        {name: "scroll left", args: [], and: true},
        {name: "scroll down half page", args: [], and: true},
        {name: "scroll up half page", args: [], and: true},
        {name: "scroll down full page", args: [], and: true},
        {name: "scroll up full page", args: [], and: true},
        {name: "scroll to top", args: [], and: true},
        {name: "scroll to bottom", args: [], and: true}
      ]
    },
    {
      group: 'Load',
      actions: [
        {name: "reload", args: []},
        {name: "cacheless reload", args: []},
        {name: "reload all tabs", args: []},
        {name: "stop", args: []}
      ]
    },
    {
      group: 'Focus',
      actions: [
        {name: "blur focus", args: [], and: true},
        {name: "focus first text input", args: [], and: true},
        {name: "navigate form elements forward", args: [], and: true},
        {name: "navigate form elements backward", args: [], and: true},
        {name: "hit a hint", args: [], and: true}
      ]
    },
    {
      group: 'QuickMarks',
      actions: [
        {name: "add quickmark", args: []},
        {name: "remove quickmark", args: []},
        {name: "lunch quickmark", args: []},
        {name: "lunch quickmark (open this tab)", args: []},
        {name: "lunch quickmark (open background tab)", args: []}
      ]
    },
    {
      group: 'Clipboard',
      actions: [
        {name: "copy url", args: [], and: true},
        {name: "copy url and title", args: [], and: true},
        {name: "copy url and title as html", args: [], and: true},
        {
          name: "copy url and title by custom tag #1",
          args: [
            {
              type: 'custom tag',
              default_value: '<a href="%URL%" target="_blank">%TITLE%</a>'
            },
            {
              type: 'NAME',
              default_value: 'with target'
            }
          ],
          and: true
        }
      ]
    },
    {
      group: 'Others',
      actions: [
        {name: "Keyconfig", args: []},
        {name: "normal mode", args: [], and: true},
        {name: "limited mode", args: [], and: true}
      ]
    }
  ],
  vim_action_names: [
    {
      group: 'None',
      actions: [
        {name: "no action", args: []}
      ]
    },
    {
      group: 'Navigations',
      actions: [
        {name: "Up", args: []},
        {name: "Down", args: []},
        {name: "Left", args: []},
        {name: "Right", args: []},
        {name: "Line head", args: []},
        {name: "Line foot", args: []}
      ]
    },
    {
      group: 'Others',
      actions: [
        {name: "insert mode", args: []},
        {name: "normal mode", args: []}
      ]
    }
  ]
};
initializer();
KC.action_names_hash = {};
KC.vim_action_names_hash = {};

function ActionRegister(groups, new_group) {
  var actions = KC[groups];
  if (new_group) {
    var new_actions;
    if (actions.some(function (group) {
      if (group.group === new_group.group) {
        new_actions = new_group.actions;
        new_group = group;
        return true;
      }
    })) {
      new_actions.forEach(function (new_action) {
        if (!new_group.actions.some(function (act, i, ary) {
          if (act.name === new_action.name) {
            ary[i] = new_action;
            return true;
          }
        })) {
          new_group.actions.push(new_action);
        }
      });
    } else {
      actions.push(new_group);
    }
    actions = [new_group];
  }
  actions.forEach(function (action_group, i) {
    var group = chrome.i18n.getMessage('action_group_' + action_group.group);
    if (group) action_group.label = group;
    action_group.labels = action_group.actions.map(function (act, i, actions) {
      if (!act.args) {
        act.args = [];
      }
      KC[groups + '_hash'][act.name] = act;
      var action = chrome.i18n.getMessage('action_name_' + act.name.replace(/\W/g, '_'));
      return (action || act.name).replace(/#1/, '...');
    });
  });
}
ActionRegister('action_names');
ActionRegister('vim_action_names');
var TabHistory = {};
var LastTabs = {};
chrome.tabs.onUpdated.addListener(function (tabid, info) {
  if (info.status === 'loading') {
    chrome.tabs.get(tabid, function (tab) {
      TabHistory[tabid] = tab;
    });
  }
});
chrome.tabs.onRemoved.addListener(function (tabid) {
  if (TabHistory[tabid]) {
    var tab = TabHistory[tabid];
    if (LastTabs[tab.windowId]) {
      LastTabs[tab.windowId].push(tab);
    } else {
      LastTabs[tab.windowId] = [tab];
    }
    delete TabHistory[tabid];
  }
});
var clipNode, clipRange;

chrome.runtime.onMessageExternal.addListener(RequestHandler);
chrome.runtime.onMessage.addListener(RequestHandler);

function RequestHandler(message, sender, sendResponse) {
  if (message.group && Array.isArray(message.actions)) {
    try {
      if (message.type === 'vim') {
        ActionRegister('vim_action_names', message);
      } else {
        ActionRegister('action_names', message);
      }
      sendResponse({status: 'success'});
    } catch (e) {
      sendResponse({status: 'error', message: e.message});
    }
    return;
  } else if (message.init) {
    var _message = {actions: keyactions, keyconfig: Keyconfig};
    if (message.location && message.location.host) {
      if (SiteStatus[message.location.host]) {
        _message.default_set = SiteStatus[message.location.host];
      }
    }
    if (Keyconfig.ldrize && LDRize.Siteinfo) {
      var siteinfo = [], href = message.location.href;
      LDRize.Siteinfo.sites.forEach(function (site) {
        if (href.match(site.domain))
          siteinfo.push(site);
      });
      siteinfo.push.apply(siteinfo, LDRize.Siteinfo.xpath);
      siteinfo.push.apply(siteinfo, LDRize.Siteinfo.microformats);
      _message.LDRize = siteinfo;
    }
    sendResponse(_message);
    return;
  } else {
    sendResponse({});
  }
  var tab = sender.tab;
  if (message.action === 'copy') {
    clipNode.value = String(message.message).replace();
    clipNode.select();
    document.execCommand('copy', false, null);
  }
  if (message.actionSet) {
    SiteStatus[message.location.host] = message.actionSet;
    localStorage.SiteStatus = JSON.stringify(SiteStatus);
    return;
  }
  if (message.action === 'open_tab') {
    if (message.links && message.links.length) {
      message.links.forEach(function (link) {
        chrome.tabs.create({index: tab.index + 1, url: link, selected: !!message.foreground});
      });
    } else if (message.link) {
      chrome.tabs.create({index: tab.index + 1, url: message.link, selected: !!message.foreground});
    }
    return;
  } else if (message.action === 'open_window') {
    chrome.windows.create({url: message.link});
    return;
  } else if (message.action === 'goto') {
    chrome.tabs.update(tab.id, {url: message.link});
    return;
  }
  if (message.tabid) {
    chrome.tabs.update(message.tabid, {selected: true});
    return;
  }
  if (message === 'Keyconfig') {
    chrome.tabs.create({index: tab.index + 1, url: 'options_page.html#actions'});
  } else if (message === 'closed_tab') {
    if (LastTabs[tab.windowId]) {
      var last_tab = LastTabs[tab.windowId].pop();
      if (last_tab && last_tab.url) {
        chrome.tabs.create({windowId: last_tab.windowId, index: tab.index + 1, url: last_tab.url, selected: true});
      }
      if (!LastTabs[tab.windowId].length) {
        delete LastTabs[tab.windowId];
      }
    }
  } else if (message.action && TabUtils.actions[message.action]) {
    TabUtils.actions[message.action](tab, message.times);
  } else if (TabUtils.actions[message]) {
    TabUtils.actions[message](tab);
  } else if (TabUtils.actions_with_connection[message]) {
    TabUtils.actions_with_connection[message](tab, sendResponse);
  } else if (message.action && MainActions.actions[message.action]) {
    message.sendResponse = sendResponse;
    message.sender = sender;
    MainActions.actions[message.action](message);
  }
}
if (Keyconfig.ldrize) {
  LDRize();
}
function get_manifest(callback) {
  var url = './manifest.json';
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(JSON.parse(xhr.responseText));
  };
  xhr.open('GET', url, true);
  xhr.send(null);
}
window.addEventListener('load', function () {
  clipNode = document.createElement('textarea');
  document.body.appendChild(clipNode);
  clipRange = document.createRange();
  var CHROME_GESTURES = 'jpkfjicglakibpenojifdiepckckakgk';
  var ldrize = {
    group: 'LDRize',
    actions: [
      {name: "LDRize.next", args: []},
      {name: "LDRize.prev", args: []}
    ]
  };

  chrome.runtime.sendMessage(CHROME_GESTURES, ldrize, function () {
  });
}, false);
function LDRize() {
  function Siteinfo(info) {
    var S = LDRize.Siteinfo = {
      microformats: [],
      sites: [],
      xpath: []
    };
    info.forEach(function (info) {
      var site = info.data;
      if (site.domain === void 0 || site.domain === 'microformats') {
        S.microformats.push(site);
      } else {
        var isRegExp;
        try {
          new RegExp(site.domain);
          isRegExp = /^(\^|http)/.test(site.domain);
        } catch (e) {
        }
        if (isRegExp) {
          S.sites.push(site);
        } else {
          S.xpath.push(site);
        }
      }
    });
  }

  function UpdateSiteinfo() {
    var url = 'http://ss-o.net/json/wedataLDRize.json';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      try {
        Siteinfo(JSON.parse(xhr.responseText));
      } catch (e) {
        console.log(e);
        return;
      }
    };
    xhr.open('GET', url, true);
    xhr.send(null);
  }

  UpdateSiteinfo();
}
