var handleEvent = KeyConfig.handleEvent;
KeyConfig.handleEvent = function(evt){
  if (evt.target.className !== 'input_button' ) {
    handleEvent.call(this,evt);
  }
};
BackGround = chrome.extension.getBackgroundPage();
Config = BackGround.Keyconfig;
keyactions = BackGround.keyactions;
KC = BackGround.KC;
config_update = BackGround.config_update;
config_save = BackGround.config_save;
function L10N(){
  chrome.i18n.getAcceptLanguages(function(langs){
    if (langs.indexOf('ja') < 0 ) {
      document.querySelector('#menu_tabs > li.news').style.display = 'none';
    }
  });
  var elems = document.querySelectorAll('*[class^="MSG_"]');
  Array.prototype.forEach.call(elems, function(node){
    var key = node.className.match(/MSG_(\w+)/)[1];
    var message = chrome.i18n.getMessage(key);
    if (message) node.textContent = message;
  });
}
L10N();

$X('//input[@type="checkbox"]').forEach(function(input){
  var id = input.id;
  input.checked = !!Config[id];
  input.addEventListener('click',function(){
    Config[id] = input.checked;
    localStorage.Keyconfig = JSON.stringify(Config);
  },false);
});
$X('id("vim_actions")//input[@name="vim_default_mode"]').forEach(function(radio){
  var val = radio.value;
  if (val === Config.vim_default_mode) {
    radio.checked = true;
  }
  radio.addEventListener('click',function(){
    Config.vim_default_mode = radio.value;
    config_save();
  },false);
});
$X('id("vim_actions")//input[starts-with(@id,"vimcolor_")]').forEach(function(input){
  var ids = input.id.split('_'), mode = ids[1], item = ids[2];
  input.value = Config.vim_color_config[mode][item];
  input.addEventListener('change',function(){
    Config.vim_color_config[mode][item] = input.value;
    config_save();
  },false);
});

document.getElementById('ldrize').addEventListener('click',function(){
  if (this.checked) {
    BackGround.LDRize();
  } else {
    BackGround.LDRize.Siteinfo= void 0;
    delete BackGround.LDRize.Siteinfo;
  }
},false);

var menu_tabs = document.getElementById('menu_tabs');
var container = document.getElementById('container');
var vim_actions = document.getElementById('vim_actions');
var vimtab = $X('id("menu_tabs")/li[@class="vim_actions"]')[0];
document.getElementById('chrome_vim').addEventListener('click',toggle_vim_conf,false);
function toggle_vim_conf(e){
  if (e.target.checked) {
    vim_actions.style.visibility = 'visible';
    vimtab.style.display = 'inline-block';
  } else {
    vim_actions.style.visibility = 'hidden';
    vimtab.style.display = 'none';
  }
}
toggle_vim_conf({target:document.getElementById('chrome_vim')});

document.getElementById('ExtensionVersion').textContent = BackGround.Manifest.version;

utils = {
  'action_names':list_create('action_names'),
  'vim_action_names':list_create('vim_action_names')
};
function list_create(name){
  var root = document.getElementById(name + '_list');
  var filter = function(){};
  root.addEventListener('click',function(evt){
    if (evt.target === root) {
      document.documentElement.className = '';
    }
  },false);
  KC[name].forEach(function(group){
    var opts = document.createElement('li');
    var h3 = document.createElement('h3');
    opts.className = 'group';
    h3.textContent = group.label || group.group;
    opts.appendChild(h3);
    var optg = document.createElement('ul');
    opts.appendChild(optg);
    group.actions.forEach(function(Act, i){
      var opt = document.createElement('li');
      opt.className = 'act';
      var btn = document.createElement('button');
      btn.className = 'action_btn';
      var action = chrome.i18n.getMessage('action_name_' + Act.name.replace(/\W/g,'_'));
      btn.textContent = action || Act.name;
      opt.appendChild(btn);
      optg.appendChild(opt);
      btn.addEventListener('click',function(evt){
        filter(evt.target, Act, group);
      },false);
    });
    root.appendChild(opts);
  });
  return function(action, btn, callback){
    //root.parentNode.style.height = document.documentElement.clientHeight + 'px';
    document.documentElement.className = 'cover';
    //root.style.display = 'block';
    filter = function(_btn, Act, group){
      btn.textContent = _btn.textContent;
      //root.style.display = 'none';
      action.name = Act.name;
      callback(Act, group);
      document.documentElement.className = '';
      //document.documentElement.style.overflow = 'auto';
    }
  }
}

var ActionConfig = function(prefix, ActionNames){
  var action_list = document.getElementById(prefix + 'action_list');
  var append_action = document.getElementById(prefix + 'append_action');
  var action_text = document.getElementById(prefix + 'action_text');
  var reset_action_text = document.getElementById(prefix + 'reset_action_text');
  var actions = Config[prefix + 'actions'];


  var ActionKeys = Object.keys(actions);
  var Actions = ActionKeys.sort().map(function(k){
    var act=actions[k];
    return {action:act, key:k};
  }).map(create_action);
  function create_action(act, i) {
    var Act = KC[ActionNames+'_hash'][act.action.name];
    var tr = document.createElement('tr');
    var td1 =  document.createElement('td');
    var _key = document.createElement('input');
    _key.type = 'button';
    _key.className = 'input_button';
    _key.value = act.key;
    var changed = false;
    _key.addEventListener('focus',function(evt){
      if (!changed) _key.value = ' ';
    },true);
    _key.addEventListener('click',function(evt){
      _key.focus();
    },true);
    _key.addEventListener('blur',function(evt){
      if (_key.value === ' ') {
        _key.value = act.key;
        save.disabled = true;
      } else {
        //save.disabled = false;
      }
    },true);
    _key.addEventListener('keydown',function(evt){
      evt.preventDefault();
      evt.stopPropagation();
      var key = get_key(evt);
      if (!key || /^(Meta|Shift|Control|Alt)$/.test(key)) {
        return;
      }
      if (changed) {
        _key.value += ' ' + key;
      } else {
        _key.value = key;
      }
      if (actions[_key.value]) {
        return;
      }
      changed = true;
      save.disabled = false;
      save.focus();
    },true);
    var save = document.createElement('button');
    save.disabled = true;
    save.className = 'impt';
    save.addEventListener('click',function(evt){
      var old_key = act.key;
      var new_key = _key.value;
      if (old_key !== new_key && new_key) {
        act.key = new_key;
        //KC.change(new_key, old_key, prefix)
        var new_act = Config[prefix + 'actions'][old_key];
        delete Config[prefix + 'actions'][old_key];
        Config[prefix + 'actions'][new_key] = new_act;
        localStorage.Keyconfig = JSON.stringify(Config);
        config_update(prefix + 'actions');
        save.disabled = true;
        changed = false;
      }
    },false);
    save.textContent = 'save';
    var reset = document.createElement('button');
    reset.addEventListener('click',function(evt){
      _key.value = act.key;
      save.disabled = true;
      changed = false;
    },false);
    reset.textContent = 'reset';
    td1.appendChild(_key);
    td1.appendChild(save);
    td1.appendChild(reset);
    tr.appendChild(td1);

    var and = false;
    //var dd = document.createElement('dd');
    var td2 = document.createElement('td');
    var args_list;
    var args = [];
    function set_arg(_act, action, point){
      args_list = document.createElement('ul');
      var args = [];
      _act.args.forEach(function(_arg, i){
        var _i = i+1;
        var _li = document.createElement('li');
        _li.innerHTML = '<span class="lt">' + _arg.type + ':</span>';
        var arg;
        if (_arg.type === 'custom tag') {
          arg = document.createElement('textarea');
        } else if (_arg.type === 'hidden') {
          arg = document.createElement('input');
          arg.type = 'hidden';
        } else {
          arg = document.createElement('input');
          arg.type = 'text';
          if (_arg.type === 'KEY') {
            arg.maxLength = 1;
          }
        }
        if (action.args[i] !== void 0) {
          arg.value = action.args[i];
        } else if (_arg.default_value !== void 0) {
          arg.value = _arg.default_value;
        }
        arg.addEventListener('change',function(){
          args[i] = arg.value;
          if (Config[prefix + 'actions'][act.key]) {
            Config[prefix + 'actions'][act.key] = {name:_act.name, args:args, and:and};
            localStorage.Keyconfig = JSON.stringify(Config);
          }
          config_update(prefix + 'actions');
        },false);
        arg.setAttribute('placeholder', _arg.type);
        _li.appendChild(arg);
        args_list.appendChild(_li);
        args.push(arg.value || '');
      });
      point.appendChild(args_list);
      return args;
    }
    function del_arg(point){
      if (args_list) {
        args_list.parentNode.removeChild(args_list);
        args_list = null;
      }
    }
    var action = document.createElement('button');
    action.className = 'myact';
    var name = chrome.i18n.getMessage('action_name_' + act.action.name.replace(/\W/g,'_'));
    action.textContent = name || act.action.name;
    td2.appendChild(action);
    action.addEventListener('click',function(evt){
      utils[ActionNames](act.action, action,function(Act, group){
        del_arg();
        if (Act.args.length) {
          args = set_arg(Act, act.action, td2);
        }
        //var _and = and.map(function(a){return {name:a.name,args:a.args}});
        //var _and = {name:}
        save_action(act.key, Act.name, prefix, args, false);
      });
    },false);
    var del = document.createElement('button');
    del.textContent = 'Del';
    del.addEventListener('click',function(){
      action.disabled = !action.disabled;
      if (action.disabled) {
        delete Config[prefix + 'actions'][act.key];
        localStorage.Keyconfig = JSON.stringify(Config);
        config_update(prefix + 'actions');
        del.textContent = 'Undo';
        tr.className = 'disabled';
      } else {
        save_action(act.key, action.textContent, prefix, args, and);
        del.textContent = 'Del';
        tr.className = '';
      }
    });
    td2.appendChild(del);
    if (act.action.args && act.action.args.length) {
      if (Act) {
        args = set_arg(Act, act.action, td2);
      }
    }
    tr.appendChild(td2);
    action_list.insertBefore(tr, act.point);
    act.list = tr;
    //if (act.action.and) {
    //	andActAdd({}, act.action, {action:act.action.and});
    //} else if (Act && Act.and){
    //	andActAdd({}, act.action);
    //}
    function andActDel(And){
      if (And && And._dd) {
        And._dd.parentNode.removeChild(And._dd);
        delete And._dd;
      } else if (and.dd) {
        and.dd.parentNode.removeChild(and.dd);
        delete and.dd;
      }
    }
    act.dlist = td2;
    if (act.focus) {
      action.focus();
      act.list.className = 'focus';
      setTimeout(function() {
        act.list.className = '';
      }, 800);
    }
    return act;
  }
  var focus_timer, key_timer;
  action_text.addEventListener('focus',function(evt){
    if (action_text.value === 'type key here') {
      action_text.value = ' ';
    }
    focus_timer = setTimeout(function(){
      if (action_text.value !== ' ') {
        append_action.focus();
      }
    },3000);
  },true);
  action_text.addEventListener('click',function(evt){
    action_text.focus();
  },true);
  action_text.addEventListener('blur',function(evt){
    if (action_text.value === ' ') {
      action_text.value = 'type key here';
      append_action.disabled = true;
    } else {
      append_action.disabled = false;
    }
  },true);
  append_action.disabled = true;
  action_text.addEventListener('keydown',function(evt){
    evt.preventDefault();
    evt.stopPropagation();
    var key = get_key(evt);
    if (!key || /^(Meta|Shift|Control|Alt)$/.test(key)) {
      return;
    }
    if (action_text.value !== ' ') {
      action_text.value += ' ' + key;
    } else {
      action_text.value = key;
    }
    append_action.disabled = false;
    clearTimeout(focus_timer);
    clearTimeout(key_timer);
    key_timer = setTimeout(function() {
      append_action.focus();
    }, 3000);
  },true);
  reset_action_text.addEventListener('click', function() {
    action_text.value = ' ';
    clearTimeout(focus_timer);
    clearTimeout(key_timer);
    action_text.focus();
  }, false);
  append_action.addEventListener('click',function() {
    clearTimeout(focus_timer);
    clearTimeout(key_timer);
    var key = action_text.value;
    if (!key) {
      action_text.focus();
      return;
    }
    if (ActionKeys.indexOf(key) !== -1) {
      var i = ActionKeys.indexOf(key);
      var _act = Actions[i];
      var ac = _act.dlist.querySelector('button.myact');
      if (ac) {
        ac.focus();
        _act.list.className = 'focus';
        setTimeout(function() {
          _act.list.className = '';
        },800);
        return;
      }
    }
    ActionKeys.push(key);
    ActionKeys.sort();
    var index = ActionKeys.indexOf(key);
    var point = (Actions[index] || {}).list;
    var act = {key: key, focus: true, point: point, action: {name: 'no action', args: []}};
    Actions = Actions.slice(0, index).concat([act], Actions.slice(index));
    create_action(act, index);
    save_action(act.key, act.action.name, prefix);
    action_text.value = 'type key here';
    append_action.disabled = true;
  });
  function save_action(key, act, prefix, args, and) {
    Config[prefix + 'actions'][key] = {name:act,args:args || [], and:and};
    localStorage.Keyconfig = JSON.stringify(Config);
    config_update(prefix + 'actions');
  }
};

ActionConfig('normal_', 'action_names');
ActionConfig('limited_', 'action_names');
ActionConfig('vim_normal_', 'vim_action_names');
ActionConfig('vim_insert_', 'vim_action_names');

var config_text = document.getElementById('config_text');
var export_conf = document.getElementById('export_conf');
export_conf.addEventListener('click',function(){
  config_text.value = JSON.stringify(Config, null, 2);
},false);
var import_conf = document.getElementById('import_conf');
import_conf.addEventListener('click',function(){
  if (!config_text.value){
    return;
  }
  try {
    JSON.parse(config_text.value);
  } catch (e) {
    alert('インポートに失敗しました。正しいJSONではありません。');
    return;
  }
  var conf = JSON.parse(config_text.value);
  if (
    typeof conf.normal_actions === 'object' &&
    typeof conf.limited_actions === 'object'
  ) {
    if (conf.version !== BackGround.Manifest.version) {
      if (!confirm('設定がExportされた際のバージョンと現在の使用しているバージョンが異なるため、正常にインポートできない可能性があります。現在の設定をバックアップしてから続行することを推奨します。\n続行しますか?')){
        return;
      }
    }
    var _keyconfig = Config;
    try {
      Config = conf;
      BackGround.Keyconfig = Config;
      localStorage.Keyconfig = JSON.stringify(Config);
      BackGround.initializer();
    } catch (e) {
      alert('インポートに失敗しました。');
      BackGround.Keyconfig = _keyconfig;
      config_save();
      return;
    }
    alert('正常にインポートできました。新しい設定を再読み込みします。');
    location.reload();
  }
},false);
var reset_all = document.getElementById('reset_all');
reset_all.addEventListener('click',function(){
  if (confirm('Are sure you want to delete this config? There is NO undo!')) {
    Config = JSON.parse(JSON.stringify(BackGround.default_keyconfig));
    BackGround.Keyconfig = Config;
    config_save();
    location.reload();
  }
},false);


var sections = $X('id("container")/section[contains(@class, "content")]');
var btns = $X('id("menu_tabs")/li/a');
var default_title = document.title;
window.addEventListener('hashchange',function(evt){
  var hash = location.hash;
  btns.forEach(function(btn, i){
    btn.className = (!hash && !i) || (btn.hash === hash) ? 'active' : '';
  });
  sections.forEach(function(sc, i){
    sc.style.display = (!hash && !i) || ('#'+sc.id === hash) ? 'block' : 'none';
  });
  document.title = default_title + hash;
  window.scrollBy(0, -1000);
},false);
if (location.hash && sections.some(function(section, i){
    if ('#' + section.id === location.hash) {
      btns.forEach(function(btn){btn.className = '';})
      btns[i].className = 'active';
      section.style.display = 'block';
      document.title = default_title + location.hash;
      return true;
    }
  })) {
} else {
  sections[0].style.display = 'block';
  document.title = default_title + '#' + sections[0].id;
}
