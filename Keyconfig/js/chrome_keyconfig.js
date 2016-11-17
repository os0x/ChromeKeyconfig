// Chrome Keyconfig
// Authors: os0x, edvakf
// license http://creativecommons.org/licenses/MIT/ (The MIT license)

(function () {
  function get_key(evt) {
    var key = evt.key === ' ' ? 'Space' : evt.key,
      ctrl = evt.ctrlKey ? 'C-' : '',
      meta = (evt.metaKey || evt.altKey) ? 'M-' : '',
      shift = evt.shiftKey ? 'S-' : '';
    if (/^(Meta|Shift|Control|Alt)$/.test(key)) return key;
    if (evt.shiftKey) {
      if (/^[a-z]$/.test(key))
        return ctrl + meta + key.toUpperCase();
      if (/^(Enter|Space|BackSpace|Tab|Escape|Home|End|AllowLeft|AllowRight|AllowUp|AllowDown|PageUp|PageDown|Delete|F\d\d?)$/.test(key))
        return ctrl + meta + shift + key;
    }
    return ctrl + meta + key;
  }


  var keyconfig = chrome.runtime.id;
  var Namespace = 'http://ss-o.net/chrome_extension/ChromeKeyconfig/';

  function backRequest(message) {
    chrome.runtime.sendMessage(keyconfig, message, ResponseHandler);
  }

  var debug = false;
  var Root = /BackCompat/.test(document.compatMode) ? document.body : document.documentElement;
  if (!Root) {
    document.addEventListener('DOMContentLoaded', function () {
      Root = document.body;
    }, false);
  }
  var sprintf = function (str) {
    var args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/%0(\d+)d/g,function (m, num) {
      var r = String(args.shift());
      var c = '';
      num = parseInt(num, 10) - r.length;
      while (--num >= 0) c += '0';
      return c + r;
    }).replace(/%[sdf]/g, function (m) {
        return sprintf._SPRINTF_HASH[m](args.shift())
      });
  };
  sprintf._SPRINTF_HASH = {
    '%s': String,
    '%d': parseInt,
    '%f': parseFloat
  };
  var ResponseManager = {
    'Notify.simple': function (data) {
      var mes = data.message;
      Notify.simple(mes, data);
    }
  };
  Number.prototype.repeat = function (fn, th) {
    for (var i = 0; i < this; i++) {
      fn.call(th, i, this);
    }
  };
  var View = {
    createElementSimply: function (name, attr) {
      var e, children = Array.prototype.slice.call(arguments, 2);
      if (typeof name !== 'string') {
        e = document.createDocumentFragment();
      } else {
        e = document.createElement(name);
        if (attr) {
          Object.keys(attr).forEach(function (key) {
            e[key] = attr[key];
          });
        }
      }
      children.forEach(function (el) {
        if (!(el instanceof Node)) {
          el = document.createTextNode(el);
        }
        e.appendChild(el);
      });
      return e;
    },
    get simpleNotify() {
      if (!this._simpleNotify) {
        var notify = document.createElement('div');
        notify.id = sprintf('%s-simple-notify', keyconfig);
        notify.message = document.createElement('span');
        notify.appendChild(notify.message);
        var cssText = '#%s {'
          + 'margin: 0;'
          + 'padding: 1px 5px 1px 5px;'
          + 'border: 0;'
          + 'text-align: right;'
          + 'font-size: 90%;'
          + 'color:#FFF;'
          + 'font-weight:normal;'
          + '-webkit-border-top-right-radius: 4px;'
          + 'line-height: 1;'
          + 'text-indent: 0;'
          + 'text-decoration: none;'
          + 'letter-spacing: normal;'
          + 'left: 0;'
          + 'bottom: 0;'
          + 'z-index: 10001;'
          + 'background-color: rgba(1,1,1,0.7);'
          + 'position: fixed;'
          + '}\n';
        cssText += '' // animation
          + '.%s-fadeout {'
          + '-webkit-animation-name: fadeout;'
          + '-webkit-animation-duration: 5s;'
          + '}'
          + '@-webkit-keyframes fadeout {'
          + 'from {'
          + 'background-color: rgba(1, 1, 1, 0.7);'
          + '}'
          + '80% {'
          + 'background-color: rgba(1, 1, 1, 0.7);'
          + '-webkit-animation-timing-function: ease-out;'
          + '}'
          + 'to {'
          + 'background-color: rgba(1, 1, 1, 0);'
          + '}'
          + '}\n';
        var style = this.createElementSimply('style', {
          type: 'text/css',
          id: sprintf('%s-simple-notify-style', keyconfig)
        });
        (document.head || document.body).appendChild(style);
        style.appendChild(document.createTextNode(sprintf(cssText, notify.id, notify.id)));
        document.body.appendChild(notify);
        notify.addEventListener('webkitAnimationEnd', function (event) {
          notify.style.display = 'none';
          notify.className = '';
        }, false);
        this._simpleNotify = notify;
      }
      return this._simpleNotify;
    }
  };
  var Utils = {
    registerOneKeyHandler: function (callback) {
      var handler = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var key = get_key(e);
        if (!key || /^(Meta|Shift|Control|Alt)$/.test(key)) {
          return;
        }
        document.removeEventListener('keydown', handler, true);
        callback(key);
      };
      document.addEventListener('keydown', handler, true);
    }
  };
  var Notify = {
    simple: function (message, options) {
      if (!options) options = {};
      var notify = View.simpleNotify;
      if (options.isHTML) {
        notify.message.innerHTML = message;
      } else {
        notify.message.textContent = message;
      }
      notify.style.display = 'block';
      notify.className = '';
      setTimeout(function () {
        notify.className = notify.id + '-fadeout';
      }, 1);
    },
    append: function (message, options) {
      if (!options) options = {};
      var notify = View.simpleNotify;
      if (options.isHTML) {
        notify.message.innerHTML += message;
      } else {
        notify.message.textContent += message;
      }
      notify.style.display = 'block';
      notify.className = '';
      setTimeout(function () {
        notify.className = notify.id + '-fadeout';
      }, 1);
    },
    remove: function () {
      var notify = View.simpleNotify;
      notify.style.display = 'none';
      notify.className = '';
    }
  };
  var ACTION = {
    "back": function (arg) {
      history.go(Math.max(-arg.times, -history.length + 1));
    },
    "fastback": function (arg) {
      history.go(-history.length + 1);
    },
    "forward": function (arg) {
      history.go(arg.times);
    },
    "reload": function () {
      location.reload();
    },
    "cacheless reload": function () {
      location.reload(true);
    },
    "reload all tabs": function () {
      backRequest('reload_all_tabs');
    },
    "go to parent dir": function (arg) {
      var href = location.href;
      if (location.hash) {
        if (arg.times === 1) {
          location.href = location.pathname + location.search;
          return;
        } else {
          href = location.pathname + location.search;
          arg.times--;
        }
      }
      var paths = location.pathname.split('/');
      if (!location.search && paths[paths.length - 1] === '') paths.pop();
      var path = paths.slice(0, Math.max(paths.length - arg.times, 0));
      location.href = path.join('/') + '/';
    },
    "open new tab": function (arg) {
      arg.times.repeat(function () {
        backRequest('open_tab');
      });
    },
    "open new tab background": function (arg) {
      arg.times.repeat(function () {
        backRequest('open_tab_background');
      });
    },
    "open blank tab": function (arg) {
      arg.times.repeat(function () {
        backRequest('open_blank_tab');
      });
    },
    "open blank tab background": function (arg) {
      arg.times.repeat(function () {
        backRequest('open_blank_tab_background');
      });
    },
    "close this tab": function () {
      backRequest('close_tab');
    },
    "open new window": function (arg) {
      arg.times.repeat(function () {
        backRequest('open_window');
      });
    },
    "close this window": function () {
      backRequest('close_window');
    },
    "select right tab": function (arg) {
      backRequest({action: 'right_tab', times: arg.times});
    },
    "select left tab": function (arg) {
      backRequest({action: 'left_tab', times: arg.times});
    },
    "select last tab": function () {
      backRequest('last_tab');
    },
    "select first tab": function () {
      backRequest('first_tab');
    },
    "re-open closed tab": function () {
      backRequest('closed_tab');
    },
    "clone tab": function () {
      backRequest('clone_tab');
    },
    "close other tabs": function () {
      backRequest('close_other_tabs');
    },
    "close right tabs": function () {
      backRequest('close_right_tabs');
    },
    "close left tabs": function () {
      backRequest('close_left_tabs');
    },
    "pin tab": function () {
      backRequest('pin_tab');
    },
    "unpin tab": function () {
      backRequest('unpin_tab');
    },
    "toggle pin tab": function () {
      backRequest('toggle_pin_tab');
    },
    "scroll down": function (arg) {
      if (LDRize.next) {
        if (!LDRize.next(arg)) {
          ACTION["scroll to bottom"](arg);
        }
        return;
      }
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, 100 * arg.times, 100);
      } else {
        window.scrollBy(0, 100 * arg.times);
      }
    },
    "scroll up": function (arg) {
      if (LDRize.prev) {
        if (!LDRize.prev(arg)) {
          ACTION["scroll to top"](arg);
        }
        return;
      }
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, -100 * arg.times, 100);
      } else {
        window.scrollBy(0, -100 * arg.times);
      }
    },
    "scroll right": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(100 * arg.times, 0, 100);
      } else {
        window.scrollBy(100 * arg.times, 0);
      }
    },
    "scroll left": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(-100 * arg.times, 0, 100);
      } else {
        window.scrollBy(-100 * arg.times, 0);
      }
    },
    "scroll down half page": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, window.innerHeight / 2 * arg.times);
      } else {
        window.scrollBy(0, window.innerHeight / 2 * arg.times);
      }
    },
    "scroll up half page": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, -window.innerHeight / 2 * arg.times);
      } else {
        window.scrollBy(0, -window.innerHeight / 2 * arg.times);
      }
    },
    "scroll to top": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, -1 * Root.scrollHeight);
      } else {
        window.scrollBy(0, -1 * Root.scrollHeight);
      }
    },
    "scroll to bottom": function (arg) {
      if (arg.config.smooth_scroll) {
        SmoothScroll(0, Root.scrollHeight);
      } else {
        window.scrollBy(0, Root.scrollHeight);
      }
    },
    "blur focus": function () {
      document.activeElement.blur();
    },
    "focus first text input": function () {
      var elem = document.querySelector('input[type="text"],input:not([type])');
      if (elem) elem.focus();
    },
    "navigate form elements forward": function (arg) {
      var elems = document.querySelectorAll('input:not([type="hidden"]),textarea,button,select');
      var len = elems.length;
      if (!len) return;
      var cur = document.activeElement;
      var focus_next = function _focus_next(i) {
        var j = 0;
        while (i + (++j) < len) {
          elems[i + j].focus();
          if (document.activeElement === elems[i + j]) return true;
        }
      };
      Array.prototype.some.call(elems, function (elem, i) {
        if (cur === elem) return focus_next(i);
      }) || focus_next(-1);
    },
    "navigate form elements backward": function () {
      var elems = document.querySelectorAll('input:not([type="hidden"]),textarea,button,select');
      var len = elems.length;
      if (!len) return;
      var cur = document.activeElement;
      var focus_prev = function _focus_prev(i) {
        var j = 0;
        while (i - (++j) >= 0) {
          elems[i - j].focus();
          if (document.activeElement === elems[i - j]) return true;
        }
      };
      Array.prototype.some.call(elems, function (elem, i) {
        if (cur === elem) return focus_prev(i);
      }) || focus_prev(len);
    },
    "hit a hint": function (arg) {
      arg.event.preventDefault();
      var hintkeys = 'asdfghjkl';

      function createText(num) {
        var text = '', l = hintkeys.length, iter = 0;
        while (num >= 0) {
          var n = num;
          num -= Math.pow(l, 1 + iter++);
        }
        for (var i = 0; i < iter; i++) {
          r = n % l;
          n = Math.floor(n / l);
          text = hintkeys.charAt(r) + text;
        }
        return text;
      }

      function retrieveNumber(text) {
        text += '';
        for (var i = 0, n = 0, l = text.length; i < l; i++) {
          var fix = (i == 0) ? 0 : 1;
          var t = text.charAt(l - i - 1);
          n += (hintkeys.indexOf(t) + fix) * Math.pow(hintkeys.length, i);
        }
        return n;
      }

      function getAbsolutePosition(elem) {
        var rect;
        if ((rect = is_viewable(elem))) {
          return {
            y: window.pageYOffset - Root.clientTop + rect.top,
            x: window.pageXOffset - Root.clientLeft + rect.left
          }
        }
        return false;
      }

      function is_viewable(elem) {
        if (elem.childElementCount === 1 && elem.firstElementChild instanceof HTMLImageElement) {
          elem = elem.firstElementChild;
        }
        var rect = elem.getClientRects()[0];
        if (!rect) return false;
        var _e = document.elementFromPoint(rect.left, rect.top);
        if (_e && (_e === elem || elem.contains(_e))) return rect;
        return false;
      }

      var hints = [];

      function drawHints() {
        var elems = document.querySelectorAll('a[href],*[onclick],input:not([type="hidden"]),textarea,button,select');
        var df = document.createDocumentFragment();
        var count = 0;
        Array.prototype.forEach.call(elems, function (elem) {
          var pos = getAbsolutePosition(elem);
          if (pos) {
            var span = document.createElement('span');
            span.setAttribute('style', [
              'font-size:10pt;',
              'padding:0pt 1pt;',
              'margin:0;',
              'line-height:10pt;',
              'position:absolute;',
              'z-index:2147483647;',
              'opacity:.7;',
              'color:#000;',
              'background-color:#FF0;',
              'left:', Math.max(0, pos.x - 8), 'px;',
              'top:', Math.max(0, pos.y - 8), 'px;'
            ].join(''));
            span.textContent = createText(count++);
            df.appendChild(span);
            hints.push({
              elem: elem,
              label: span,
              text: span.textContent
            });
          }
        });
        if (!hints.length) return;
        var div = document.createElement('div');
        div.setAttribute('id', 'HaH-div-element');
        div.appendChild(df);
        document.body.appendChild(div);
      }

      var choice = '', choiceHint;

      function pushLetter(key, e) {
        var hint = hints[retrieveNumber(choice + key)];
        if (hint) {
          choice += key;
          var lastHint = hints[hints.length - 1].text;
          hint.label.style.backgroundColor = '#ff00ff';
          hint.elem.focus();
          e.preventDefault();
          if (choiceHint) {
            choiceHint.label.style.backgroundColor = '#ffff00';
          }
          choiceHint = hint;
        } else {
          unloadHaH();
        }
      }

      function focusHint(e) {
        e.preventDefault();
        choiceHint.elem.focus();
        unloadHaH();
      }

      function unloadHaH(key) {
        if (choiceHint) choiceHint.label.style.backgroundColor = '#FF0';
        choice = '';
        var div = document.getElementById('HaH-div-element');
        if (div) div.parentNode.removeChild(div);
        document.removeEventListener('keydown', handler, true);
        KeyConfig.load();
      }

      function handler(e) {
        var key = get_key(e);
        if (hintkeys.indexOf(key) >= 0) return pushLetter(key, e);
        //if (key == ENTER) return focusHint(e);
        unloadHaH();
      }

      function initHaH() {
        drawHints();
        document.addEventListener('keydown', handler, true);
        KeyConfig.unload();
      }

      initHaH();
    },
    "open #1 in new tab": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        arg.times.repeat(function () {
          backRequest({action: 'open_tab', 'link': arg.action.args[0], foreground: true});
        });
      }
    },
    "open #1 in new tab background": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        arg.times.repeat(function () {
          backRequest({action: 'open_tab', 'link': arg.action.args[0]});
        });
      }
    },
    "go to #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var url = arg.action.args[0];
        if (url.indexOf('javascript:') === 0) {
          var a = document.createElement('a');
          a.href = url;
          arg.times.repeat(function () {
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null);
            a.dispatchEvent(event);
          });
        } else {
          backRequest({action: 'goto', 'link': url});
        }
      }
    },
    "normal mode": function () {
      KeyConfig.actionSet = 'normal_actions';
      backRequest({actionSet: KeyConfig.actionSet, location: location});
    },
    "limited mode": function () {
      KeyConfig.actionSet = 'limited_actions';
      backRequest({actionSet: KeyConfig.actionSet, location: location});
    },
    "lunch quickmark": function () {
      Utils.registerOneKeyHandler(function (key) {
        backRequest({
          action: 'lunch_quick_mark',
          key: key,
          mode: 'new'
        });
      });
    },
    "lunch quickmark (open this tab)": function () {
      Utils.registerOneKeyHandler(function (key) {
        backRequest({
          action: 'lunch_quick_mark',
          key: key
        });
      });
    },
    "lunch quickmark (open background tab)": function () {
      Utils.registerOneKeyHandler(function (key) {
        backRequest({
          action: 'lunch_quick_mark',
          key: key,
          mode: 'background'
        });
      });
    },
    "add quickmark": function () {
      Utils.registerOneKeyHandler(function (key) {
        backRequest({
          action: 'add_quick_mark',
          key: key,
          url: location.href
        });
      });
    },
    "remove quickmark": function () {
      Utils.registerOneKeyHandler(function (key) {
        backRequest({
          action: 'remove_quick_mark',
          key: key,
          url: location.href
        });
      });
    },
    "copy url": function (arg) {
      backRequest({action: 'copy', 'message': location.href});
    },
    "copy url and title": function (arg) {
      backRequest({action: 'copy', 'message': document.title + ' ' + location.href});
    },
    "copy url and title as html": function (arg) {
      backRequest({action: 'copy', 'message': '<a href="' + location.href + '">' + document.title + '</a>'});
    },
    "copy url and title by custom tag #1": function (arg) {
      if (arg.action && arg.action.args && arg.action.args[0]) {
        var format = arg.action.args[0];
        var data = {
          'URL': location.href,
          'TITLE': document.title
        };
        var message = format.replace(/%(\w+)%/g, function (_, _1) {
          return data[_1] || '';
        });
        backRequest({
          action: 'copy',
          'message': message
        });
      }
    },
    "Keyconfig": function () {
      backRequest('Keyconfig');
    },
    "default action": function (arg) {
      return false;
    },
    "no action": function (arg) {
    }
  };
  var VIM_ACTION = {
    "insert mode": function (arg) {
      KeyConfig.vimActionSet = 'vim_insert_actions';
      var conf = arg.config.vim_color_config['insert'];
      arg.target.style.backgroundColor = conf.background;
      arg.target.style.color = conf.text;
    },
    "normal mode": function (arg) {
      KeyConfig.vimActionSet = 'vim_normal_actions';
      var conf = arg.config.vim_color_config['normal'];
      arg.target.style.backgroundColor = conf.background;
      arg.target.style.color = conf.text;
    },
    "visual mode": function (arg) {
      //console.log("visual mode")
    },
    "command mode": function (arg) {
      //console.log("command mode")
    },
    "Up": function (arg) {
      var target = arg.target;
      var text = target.value, texts = text.split('\n'), len = text.length;
      if (texts.length < 2) return;
      var point = target.selectionEnd, _point = 0, current = -1, totals = [0];
      texts.some(function (txt, i) {
        var next = _point + txt.length + 1;
        if (point < next) {
          current = point - _point;
          var line = i - arg.times;
          if (line < 0) {
            line = 0;
          }
          var total = totals[line];
          var _txt = texts[line];
          var cr = total + Math.min(current, _txt.length);
          target.setSelectionRange(cr, cr);
          return true;
        }
        _point = next;
        totals.push(_point);
      });
    },
    "Down": function (arg) {
      var target = arg.target;
      var text = target.value, texts = text.split('\n'), len = text.length;
      if (texts.length < 2) return;
      var point = target.selectionStart, _point = 0, current = -1, line = -1;
      texts.some(function (txt, _i) {
        var next = _point + txt.length + 1;
        if (line === _i) {
          var cr = _point + Math.min(current, txt.length);
          target.setSelectionRange(cr, cr);
          return true;
        } else if (point < next && current === -1) {
          current = point - _point;
          line = Math.min(_i + arg.times, texts.length - 1);
        }
        _point = next;
      });
    },
    "Left": function (arg) {
      var target = arg.target;
      target.setSelectionRange(target.selectionStart - arg.times, target.selectionStart - arg.times);
    },
    "Right": function (arg) {
      var target = arg.target;
      target.setSelectionRange(target.selectionEnd + arg.times, target.selectionEnd + arg.times);
    },
    "Line head": function (arg) {
      var target = arg.target;
      var text = target.value, texts = text.split('\n'), len = text.length;
      var point = target.selectionStart, _point = 0, current = -1;
      texts.some(function (txt, i) {
        var next = _point + txt.length + 1;
        if (point < next) {
          target.setSelectionRange(_point, _point);
          return true;
        }
        _point = next;
      });
    },
    "Line foot": function (arg) {
      var target = arg.target;
      var text = target.value, texts = text.split('\n'), len = text.length;
      var point = target.selectionStart, _point = 0, current = -1;
      texts.some(function (txt) {
        var next = _point + txt.length + 1;
        if (point < next) {
          target.setSelectionRange(next - 1, next - 1);
          return true;
        }
        _point = next;
      });
    }
  };

  function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  }

  function easeOutQuart(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  }

  function SmoothScroll(_x, _y, _duration) {
    if (SmoothScroll.timer) {
      _x += SmoothScroll.X - window.pageXOffset;
      _y += SmoothScroll.Y - window.pageYOffset;
      SmoothScroll.fin();
    }
    SmoothScroll.X = _x + window.pageXOffset;
    SmoothScroll.Y = _y + window.pageYOffset;
    var from_x = window.pageXOffset;
    var from_y = window.pageYOffset;
    var duration = _duration || 400;
    var easing = easeOutQuart;
    var begin = Date.now();
    SmoothScroll.fin = function () {
      clearInterval(SmoothScroll.timer);
      SmoothScroll.timer = void 0;
    };
    SmoothScroll.timer = setInterval(scroll, 10);
    function scroll() {
      var now = Date.now();
      var time = now - begin;
      var prog_x = easing(time, from_x, _x, duration);
      var prog_y = easing(time, from_y, _y, duration);
      window.scrollTo(prog_x, prog_y);
      if (time > duration) {
        SmoothScroll.fin();
        window.scrollTo(from_x + _x, from_y + _y);
      }
    }
  }

  function dispatch_mutation_event(opt) {
    var ev = document.createEvent('MutationEvent');
    with (opt) {
      ev.initMutationEvent(opt.type, canBubble, cancelable, relatedNode, prevValue, newValue, attrName, attrChange);
      targetNode.dispatchEvent(ev);
    }
  }

  function LDRize(siteinfo) {
    var info = [];
    siteinfo.forEach(function (site) {
      if ((site.domain === true || site.domain === 'microformats') && $X(site.paragraph).length) {
        info.push(site);
        return;
      }
      var match;
      try {
        match = site.domain && new RegExp(site.domain);
      } catch (e) {
      }
      if (match && match.test(location.href)) {
        $X(site.paragraph);
        if ($X(site.paragraph).length) {
          if (site.disable) return true;
          info.unshift(site);
          return;
        }
      }
      try {
        match = $X(site.domain).length;
      } catch (e) {
        match = null;
      }
      if (match && (site.disable || $X(site.paragraph).length)) {
        if (site.disable) return;
        info.push(site);
      }
    });
    if (!info.length) return;
    ACTION["LDRize::pin"] = function (arg) {
      LDRize.pin(arg);
    };
    ACTION["LDRize::view"] = function (arg) {
      LDRize.view(arg);
    };
    ACTION["LDRize::open"] = function (arg) {
      LDRize.open(arg);
    };
    var scroll_down = ACTION["scroll down"];
    ACTION["scroll down"] = function (arg) {
      if (LDRize.next) {
        if (!LDRize.next(arg)) {
          ACTION["scroll to bottom"](arg);
        }
      } else {
        scroll_down.call(ACTION, arg);
      }
    };
    var scroll_up = ACTION["scroll up"];
    ACTION["scroll up"] = function (arg) {
      if (LDRize.prev) {
        if (!LDRize.prev(arg)) {
          ACTION["scroll to top"](arg);
        }
      } else {
        scroll_up.call(ACTION, arg);
      }
    };
    var site = info[0];
    var current_paragraph, prev_paragraph, current_rect, pined = [];

    function get_current(isPrev, arg) {
      var paragraphs = $X(site.paragraph);
      if (isPrev) paragraphs.reverse();
      return paragraphs.some(function (paragraph, i) {
        var rect = paragraph.getBoundingClientRect();
        if (10 < (isPrev ? -rect.top : rect.top) && current_paragraph !== paragraph) {
          if (arg && arg.times > 1) {
            var current = Math.min(paragraphs.length - 1, i - 1 + arg.times);
            current_paragraph = paragraphs[current];
            prev_paragraph = paragraphs[current - 1];
            current_rect = current_paragraph.getBoundingClientRect();
          } else {
            current_paragraph = paragraph;
            prev_paragraph = paragraphs[i - 1];
            current_rect = rect;
          }
          return true;
        }
      });
    }

    LDRize.open = function (arg) {
      if (pined.length) {
        var links = [];
        pined.forEach(function (para) {
          var link = $X(site.link, para)[0];
          if (link) links.push(link.href);
          para.style.outline = '';
        });
        pined = [];
        if (links.length) {
          backRequest({action: 'open_tab', 'links': links});
        }
      } else if (current_paragraph) {
        var links = $X(site.link, current_paragraph);
        if (links[0]) {
          backRequest({action: 'open_tab', 'link': links[0].href});
          LDRize.next(arg);
        }
      }
    };
    LDRize.strokePins = function (evt) {
      if (pined.length) {
        var type = 'LDRize.strokedPins';
        if (evt.data) {
          try {
            var data = JSON.parse(evt.data);
            if (data && typeof data.type === 'string') {
              type = data.type;
            }
          } catch (e) {
          }
        }
        pined.forEach(function (para) {
          var link = $X(site.link, para)[0];
          var mutation = {
            targetNode: para,
            type: type,
            canBubble: true,
            cancelable: false,
            relatedNode: link,
            prevValue: null,
            newValue: link.href,
            attrName: null,
            attrChange: null
          };
          dispatch_mutation_event(mutation);
        });
        var ev = document.createEvent('Event');
        ev.initEvent(type + '.end', true, false);
        document.dispatchEvent(ev);
      }
    };
    LDRize.clearPins = function (evt) {
      pined.forEach(function (node) {
        node.style.outline = '';
      });
      pined = [];
    };
    LDRize.view = function (arg) {
      if (current_paragraph) {
        var link = $X(site.link, current_paragraph)[0];
        if (link) {
          location.href = link.href;
        }
      }
    };
    LDRize.pin = function (arg) {
      if (get_current(false) && current_paragraph) {
        var position = -1;
        if ((position = pined.indexOf(prev_paragraph)) === -1) {
          prev_paragraph.style.outline = '3px solid #99ccff';
          pined.push(prev_paragraph);
        } else {
          pined[position].style.outline = '';
          pined.splice(position, 1);
        }
        LDRize.next(arg, true);
      }
    };
    LDRize.next = function (arg, is_current) {
      if (is_current || get_current(false, arg)) {
        if (LDRize.isSmoothScroll) {
          SmoothScroll(0, current_rect.top - 50, Math.log(current_rect.top) * 50);
        } else {
          window.scrollBy(0, current_rect.top - 50);
        }
        return true;
      } else {
        current_paragraph = null;
        return false;
      }
    };
    LDRize.prev = function (arg, is_current) {
      if (is_current || get_current(true, arg)) {
        if (LDRize.isSmoothScroll) {
          SmoothScroll(0, current_rect.top - 50, Math.log(-current_rect.top) * 50);
        } else {
          window.scrollBy(0, current_rect.top - 50);
        }
        return true;
      } else {
        current_paragraph = null;
        return false;
      }
    };
    LDRize.getStatus = function (evt) {
      var type = 'LDRize.status';
      if (evt.data) {
        try {
          var data = JSON.parse(evt.data);
          if (data && typeof data.type === 'string') {
            type = data.type;
          }
        } catch (e) {
        }
      }
      var message = JSON.stringify({
        name: 'Chrome Keyconfig',
        version: KeyConfig.config.version,
        siteinfo: site,
        pins_count: pined.length
      });
      var ev = document.createEvent('MessageEvent');
      ev.initMessageEvent(type, true, false, message, location.protocol + "//" + location.host, "", window);
      document.dispatchEvent(ev);
    };
    Object.keys(LDRize).forEach(function (key, i) {
      document.addEventListener('LDRize.' + key, function (e) {
        LDRize[key](e);
      }, false);
    });
  }

  KeyConfig = {
    init: function (config, actions, default_set) {
      KeyConfig.config = config;
      KeyConfig.actions = actions;
      if (config.antiAutoFocus) {
        var elem = document.activeElement;
        if (elem) {
          elem.blur();
        }
        if (document.readyState !== 'complete') {
          var focused = [];
          document.addEventListener('focus', focus_killer, true);
          document.addEventListener('DOMContentLoaded', function () {
            setTimeout(function () {
              document.removeEventListener('focus', focus_killer, true);
            }, 10);
          }, false);
          window.addEventListener('load', function (evt) {
            document.removeEventListener('focus', focus_killer, true);
          }, false);
          function focus_killer(evt) {
            if (focused.indexOf(evt.target) >= 0) return;
            focused.push(evt.target);
            setTimeout(function () {
              evt.target.blur();
            }, 10);
          }

          document.addEventListener('focus', function (evt) {
            if (evt.target.hasAttribute('autofocus')) {
              setTimeout(function () {
                evt.target.blur();
              }, 10);
              evt.target.removeAttribute('autofocus');
            }
          }, true);
        }
      }
      if (config.chrome_vim) {
        document.documentElement.addEventListener('focus', function (evt) {
          var target = evt.target;
          if ('selectionStart' in target && target.disabled !== true) {
            var s = null;
            try {
              s = target.selectionStart;
            } catch (e) {
            }
            if (s !== null) {
              var def = config.vim_default_mode;
              var conf = config.vim_color_config[def];
              target.style.backgroundColor = conf.background;
              target.style.color = conf.text;
            }
          }
        }, true);
      }
      KeyConfig.actionSet = default_set || 'normal_actions';
      KeyConfig.vimActionSet = 'vim_' + config.vim_default_mode + '_actions';
      KeyConfig.timesBuf = '';
      KeyConfig.times = 1;
      if (!config.chrome_vim) {
        KeyConfig._times = 1;
      }
      document.addEventListener("keydown", KeyConfig, true);
    },
    load: function () {
      document.addEventListener("keydown", KeyConfig, true);
    },
    unload: function () {
      document.removeEventListener("keydown", KeyConfig, true);
    },
    handleEvent: function (evt) {
      var key = get_key(evt);
      if (!key || /^(Meta|Shift|Control|Alt)$/.test(key)) {
        return;
      }
      var target = evt.target;
      var isTextedit = false;
      if (('selectionStart' in target || target.isContentEditable) && target.disabled !== true) {
        try {
          var s = target.selectionStart;
          if (KeyConfig.config.chrome_vim) {
            if (s === undefined && target.isContentEditable) {
              return;
            }
            if (KeyConfig.vimActionSet === 'vim_normal_actions') {
              evt.preventDefault();
            }
            if (this.handleKey(key, evt, target, KeyConfig.vimActionSet, true)) {
              return;
            }
          }
          if (!/^[CMA]-/.test(key)) {
            return;
          }
        } catch (e) {
        }
      }
      this.handleKey(key, evt, target, KeyConfig.actionSet, isTextedit);
    },
    handleKey: function (key, evt, target, actionset, isTextedit) {
      var matched = false;
      if (/^\d+$/.test(key)) {
        KeyConfig.timesBuf += key;
      }
      var fired = KeyConfig.actions[actionset + '_map'].some(function (keyset, i) {
        if (fired) {
          keyset.input = '';
        } else if (keyset.input) {
          keyset.input += ' ' + key;
          if (keyset.input === keyset.key) {
            Notify.append(' ' + key);
            var res = KeyConfig.fireAction(keyset, isTextedit, evt, target);
            if (res !== false) evt.preventDefault();
            keyset.input = '';
            fired = true;
            KeyConfig.times = 1;
          } else if (keyset.key.indexOf(keyset.input) === 0) {
            Notify.append(' ' + key);
            matched = true;
            //return true;
          } else {
            keyset.input = '';
          }
        } else if (keyset.key.indexOf(key) === 0) {
          keyset.input = key;
          var t = '';
          if (KeyConfig.timesBuf) {
            KeyConfig.times = parseInt(KeyConfig.timesBuf, 10);
            KeyConfig.timesBuf = '';
            t = String(KeyConfig.times) + ' ';
          }
          Notify.simple(t + keyset.input);
          if (keyset.input === keyset.key) {
            var res = KeyConfig.fireAction(keyset, isTextedit, evt, target);
            if (res !== false) evt.preventDefault();
            keyset.input = '';
            KeyConfig.times = 1;
            return true;
          }
          matched = true;
        }
      });
      if (!fired && !matched) {
        KeyConfig.times = 1;
      }
      return fired;
    },
    fireAction: function (keyset, isTextedit, evt, target, _act) {
      var act = _act || keyset.action;
      Notify.append(' :: ' + act.name.replace(/#(\d+)/g, function (_, _1) {
        return act.args[_1] || '';
      }));
      var action = isTextedit ? VIM_ACTION[act.name] : ACTION[act.name];
      var result = true;
      if (typeof action === 'function') {
        result = action({config: KeyConfig.config, key: keyset.key, action: act, times: KeyConfig._times || KeyConfig.times || 1, event: evt, target: target});
      } else {
        var ev = document.createEvent('Event');
        ev.initEvent(act.name, true, false);
        ev.key = keyset.key;
        ev.action = act;
        ev.times = KeyConfig._times || KeyConfig.times || 1;
        ev.target = target;
        document.dispatchEvent(ev);
      }
      if (act.and) {
        result = KeyConfig.fireAction(keyset, isTextedit, evt, target, act.and);
      }
      return result;
    }
  };
  function ResponseHandler(message) {
    if (!message) return;
    if (message.keyconfig) {
      if (message.LDRize) {
        var siteinfo = message.LDRize, inited;
        LDRize.isSmoothScroll = message.keyconfig.smooth_scroll;
        message.actions.normal_actions_map.push({key: 'p', input: '', length: 1, action: {name: 'LDRize::pin', args: []}});
        message.actions.normal_actions_map.push({key: 'v', input: '', length: 1, action: {name: 'LDRize::view', args: []}});
        message.actions.normal_actions_map.push({key: 'o', input: '', length: 1, action: {name: 'LDRize::open', args: []}});
        if (document.readyState === 'complete') {
          LDRize(siteinfo);
        } else {
          document.addEventListener('DOMContentLoaded', function () {
            if (!inited) {
              LDRize(siteinfo);
              inited = true;
            }
          }, false);
          window.addEventListener('load', function () {
            if (!inited) {
              LDRize(siteinfo);
              inited = true;
            }
          }, false);
        }
      }
      KeyConfig.init(message.keyconfig, message.actions, message.default_set);
    }
    if (message.action && ResponseManager[message.action]) {
      ResponseManager[message.action](message.data);
    }
  }

  backRequest({init: true, location: location}, function (message) {
  });
  if (debug) {
    _override(KeyConfig, 'init');
    _override(KeyConfig, 'fireAction');
    _override(ConnectionManager, 'Notify.simple');
    function _override(target, method, ret) {
      var _ = target[method];
      target[method] = function () {
        console.log(arguments, target, method);
        if (ret) {
          var r = _.apply(this, arguments);
          console.log(r, target, method)
          return r;
        } else {
          return _.apply(this, arguments);
        }
      };
    }
  }

// http://nanto.asablo.jp/blog/2008/12/11/4003371
  function addDefaultPrefix(xpath, prefix) {
    var tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g;
    var TERM = 1, OPERATOR = 2, MODIFIER = 3;
    var tokenType = OPERATOR;
    prefix += ':';
    function replacer(token, identifier, suffix, term, operator, modifier) {
      if (suffix) {
        tokenType =
          (suffix == ':' || (suffix == '::' && (identifier == 'attribute' || identifier == 'namespace')))
            ? MODIFIER : OPERATOR;
      } else if (identifier) {
        if (tokenType == OPERATOR && identifier != '*')
          token = prefix + token;
        tokenType = (tokenType == TERM) ? OPERATOR : TERM;
      } else {
        tokenType = term ? TERM : operator ? OPERATOR : MODIFIER;
      }
      return token;
    }

    return xpath.replace(tokenPattern, replacer);
  }

// http://gist.github.com/184276
  function $X(exp, context) {
    context || (context = document);
    var _document = context.ownerDocument || context,
      documentElement = _document.documentElement;
    var isXHTML = documentElement.tagName !== 'HTML' && _document.createElement('p').tagName === 'p';
    var defaultPrefix = null;
    if (isXHTML) {
      defaultPrefix = '__default__';
      exp = addDefaultPrefix(exp, defaultPrefix);
    }
    function resolver(prefix) {
      return context.lookupNamespaceURI(prefix === defaultPrefix ? null : prefix) ||
        documentElement.namespaceURI || '';
    }

    var result = _document.evaluate(exp, context, resolver, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
      case XPathResult.STRING_TYPE :
        return result.stringValue;
      case XPathResult.NUMBER_TYPE :
        return result.numberValue;
      case XPathResult.BOOLEAN_TYPE:
        return result.booleanValue;
      case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        // not ensure the order.
        var ret = [], i = null;
        while (i = result.iterateNext()) ret.push(i);
        return ret;
    }
    return null;
  }

})();
