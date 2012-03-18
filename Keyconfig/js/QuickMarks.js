var QuickMarks = {
  get folderName() {
    return 'QuickMarks';
  },
  addQuickMark: function(options) {
    var key = options.key;
    if (key.length == 0) throw(new Error('key required'));
    var callback = options.callback || function() {
      options.sendResponse({
        action: 'Notify.simple',
        data: {
          message: 'add quickmark "' + key + '" - ' + options.url
        }
      });
    };
    QuickMarks.getChildren(function(children, parentId) {
      var target;
      children.some(function(child){
        if (child.title == key && child.url) {
          target = child;
          return true;
        }
      });
      var create = function() {
        chrome.bookmarks.create({
          parentId: parentId,
          title: key,
          url: options.url
        }, callback);
      }
      if (target) {
        chrome.bookmarks.remove(target.id, create);
      } else {
        create();
      }
    });
  },
  removeQuickMark: function(options) {
    var key = options.key;
    if (key.length == 0) throw(new Error('key required'));
    var callback = options.callback || function() {
      options.sendResponse({
        action: 'Notify.simple',
        data: {
          message: 'remove quickmark "' + key + '"'
        }
      });
    };
    QuickMarks.getChildren(function(children, parentId) {
      children.some(function(child){
        if (child.title == key && child.url) {
          var target = child;
          chrome.bookmarks.remove(target.id, callback);
          return true;
        }
      });
    });
  },
  lunchQuckMark: function(options) {
    var key = options.key;
    if (key.length == 0) throw(new Error('key required'));
    var mode = options.mode;
    var callback = options.callback || function() {};
    QuickMarks.getChildren(function(children, parentId) {
      var target;
      children.some(function(child){
        if (child.title == key && child.url) {
          target = child;
          return true;
        }
      });
      if (target) {
        var url = target.url;
        if (url.indexOf('javascript:') === 0) {
          chrome.tabs.update(options.sender.tab.id, {
            url: url
          });
          return;
        }
        if (mode === 'new') {
          chrome.tabs.create({
            url: url,
            selected: true
          }, callback);
        } else if (mode === 'background') {
          chrome.tabs.create({
            url: url,
            selected: false
          }, callback);
        } else {
          // default
          chrome.tabs.update(options.sender.tab.id, {
            url: url
          });
        }
      }
    });
  },
  getChildren: function(callback) {
    chrome.bookmarks.getTree(function(trees) {
      var others = trees[0].children[1];
      var children = others.children;
      var target;
      children.some(function(child){
        if (child.title == QuickMarks.folderName && !child.url) {
          target = child;
          return true;
        }
      });
      if (target) {
        chrome.bookmarks.getChildren(target.id, function(res) {
          callback(res, target.id);
        });
      } else {
        chrome.bookmarks.create({
          parentId: others.id,
          title: QuickMarks.folderName
        }, function(target) {
          callback([], target.id);
        });
      }
    });
  }
};
window.addEventListener('load',function(){
  MainActions.registerActions({
    add_quick_mark: QuickMarks.addQuickMark,
    remove_quick_mark: QuickMarks.removeQuickMark,
    lunch_quick_mark: QuickMarks.lunchQuckMark
  });
},false);
