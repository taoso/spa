spa.shell = function () {
  'use strict';
  var configMap = {
    anchor_schema_map: {
      chat: {
        opened: true,
        closed: true,
        destroyed: true,
      },
    },
    chat_extend_time: 250,
    chat_retract_time: 300,
    chat_extend_height: 450,
    chat_retract_height: 15,
    chat_extend_title: 'Click to retract',
    chat_retract_title: 'Click to extend',
    resize_interval: 300,
    main_html: String()
      + '<header class="spa-shell-head">'
      + '<div class="spa-shell-head-logo">'
      + '<h1>SPA</h1>'
      + '<p>javascript end to end</p>'
      + '</div>'
      + '<div class="spa-shell-head-acct"></div>'
      //+ '<div class="spa-shell-head-search"></div>'
      + '</header>'
      + '<div class="spa-shell-main">'
      + '<nav class="spa-shell-main-nav"></nav>'
      + '<div class="spa-shell-main-content"></div>'
      + '</div>'
      + '<footer class="spa-shell-foot"></footer>'
      + '<div class="spa-shell-chat"></div>'
      + '<div class="spa-shell-modal"></div>',
  },
      stateMap = {
        anchor_map: {},
        resize_idto: undefined,
      },
      jqueryMap = {},
      copyAnchorMap, setJqueryMap, toggleChat, initModule,
      changeAnchorPart, setChatAnchor, onHashChange, onResize,
      onTapAcct, onLogin, onLogout;

  setJqueryMap = function () {
    jqueryMap = {
      $container: stateMap.$container,
      $acct: stateMap.$container.find('.spa-shell-head-acct'),
      $nav: stateMap.$container.find('.spa-shell-main-nav'),
    };
  };

  initModule = function ($container) {
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map,
    });

    spa.chat.configModule({
      set_chat_anchor: setChatAnchor,
    });
    spa.chat.initModule($container.find('.spa-shell-chat'));

    $(window)
      .bind('hashchange', onHashChange)
      .bind('resize', onResize)
      .trigger('hashchange');

    $.gevent.subscribe($container, 'spa-login', onLogin);
    $.gevent.subscribe($container, 'spa-logout', onLogout);
    jqueryMap.$acct
      .text('Please sign-in')
      .bind('utap', onTapAcct);
  };

  toggleChat = function (do_extend, callback) {
    var px_chat_ht = jqueryMap.$chat.height(),
        is_open = px_chat_ht === configMap.chat_extend_height,
        is_closed = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_open && !is_closed;

    if (is_sliding) { return false; }

    if (do_extend) {
      jqueryMap.$chat.animate({
        height: configMap.chat_extend_height
      }, configMap.chat_extend_time, function () {
        jqueryMap.$chat.attr('title', configMap.chat_extend_title);
        stateMap.is_chat_retracted = false;
        if (callback) {
          callback(jqueryMap.$chat);
        }
      });
      return true;
    }

    jqueryMap.$chat.animate({
      height: configMap.chat_retract_height,
    }, configMap.chat_retract_time, function () {
      jqueryMap.$chat.attr('title', configMap.chat_retract_title);
      stateMap.is_chat_retracted = true;
      if (callback) {
        callback(jqueryMap.$chat);
      }
    });
    return true;
  };

  onResize = function () {
    if (stateMap.resize_idto) return true;

    spa.chat.handleResize();
    stateMap.resize_idto = setTimeout(function () {
      stateMap.resize_idto = undefined;
    }, configMap.resize_interval);

    return true;
  };

  copyAnchorMap = function () {
    return $.extend(true, {}, stateMap.anchor_map);
  };

  changeAnchorPart = function (arg_map) {
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;

    KEYVAL:
      for (key_name in arg_map) {
        if (arg_map.hasOwnProperty(key_name)) {
          if (key_name.indexOf('_') === 0) {
            continue KEYVAL;
          }
          anchor_map_revise[key_name] = arg_map[key_name];
          key_name_dep = '_' + key_name;

          if (arg_map[key_name_dep]) {
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
          } else {
            delete anchor_map_revise[key_name_dep];
            delete anchor_map_revise['_s' + key_name_dep];
          }
        }
      }

    try {
      $.uriAnchor.setAnchor(anchor_map_revise);
    } catch (error) {
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }

    return bool_return;
  };

  onHashChange = function (event) {
    var _s_chat_previous, _s_chat_proposed, s_chat_proposed,
        anchor_map_proposed, is_ok = true,
        anchor_map_previous = copyAnchorMap();

    try {
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    } catch (error) {
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
    }

    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
      if (_s_chat_previous === 'destroyed') {
        spa.chat.configModule({
          set_chat_anchor: setChatAnchor,
        });
        spa.chat.initModule(stateMap.$container.find('.spa-shell-chat'));
      }
      _s_chat_proposed = anchor_map_proposed.chat;
      switch (_s_chat_proposed) {
        case 'opened':
          is_ok = spa.chat.setSliderPosition('opened');
          break;
        case 'closed':
          is_ok = spa.chat.setSliderPosition('closed');
          break;
        case 'destroyed':
          is_ok = spa.chat.removeSlider();
          break;
        default:
          spa.chat.setSliderPosition('closed');
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    if (!is_ok) {
      if (anchor_map_previous) {
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    return false;
  };

  onTapAcct = function (event) {
    var acct_text, user_name, user = spa.model.people.get_user();
    if (user.get_is_anon()) {
      user_name = prompt('Please sign-in');
      spa.model.people.login(user_name);
      jqueryMap.$acct.text('... processing ...');
    } else {
      spa.model.people.logout();
    }

    return false;
  };

  onLogin = function (event, login_user) {
    jqueryMap.$acct.text(login_user.name);
  };

  onLogout = function (event, login_user) {
    jqueryMap.$acct.text('Please sign-in');
  };

  setChatAnchor = function (position_type) {
    return changeAnchorPart({
      chat: position_type,
    });
  };

  return {
    initModule: initModule,
  };
}();
