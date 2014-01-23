spa.chat = function () {
  var configMap = {
    main_html: String()
      + '<div class="spa-chat">'
      + '<div class="spa-chat-head">'
      + '<div class="spa-chat-head-toggle">+</div>'
      + '<div class="spa-chat-title">chat</div>'
      + '</div>'
      + '<div class="spa-chat-closer">x</div>'
      + '<div class="spa-chat-sizer">'
      + '<div class="spa-chat-msgs"></div>'
      + '<div class="spa-chat-box">'
      + '<input type="text" />'
      + '<div>send</div>'
      + '</div>'
      + '</div>'
      + '</div>',
    settable_map: {
      slider_open_time: true,
      slider_close_time: true,
      slider_opened_em: true,
      slider_closed_em: true,
      slider_opened_title: true,
      slider_closed_title: true,

      chat_model: true,
      people_model: true,
      set_chat_anchor: true,
    },

    slider_open_time: 250,
    slider_close_time: 250,
    slider_opened_em: 18,
    slider_closed_em: 2,
    slider_opened_title: 'Click to close',
    slider_closed_title: 'Click to open',

    slider_opened_min_em: 10,
    window_height_min_em: 20,

    chat_model: null,
    people_model: null,
    set_chat_anchor: null,
  },
      stateMap = {
        $append_target: null,
        position_type: 'closed',
        px_per_em: 0,
        slider_hidden_px: 0,
        slider_closed_px: 0,
        slider_opened_px: 0,
      },
      jqueryMap = {},
      setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
      onClickToggle, configModule, initModule;

  getEmSize = function (elem) {
    return Number(getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]);
  };

  setJqueryMap = function () {
    var $append_target = stateMap.$append_target,
        $slider = $append_target.find('.spa-chat');

    jqueryMap = {
      $slider: $slider,
      $head: $slider.find('.spa-chat-head'),
      $toggle: $slider.find('.spa-chat-head-toggle'),
      $title: $slider.find('.spa-chat-head-title'),
      $sizer: $slider.find('.spa-chat-sizer'),
      $msgs: $slider.find('.spa-chat-msgs'),
      $box: $slider.find('.spa-chat-box'),
      $input: $slider.find('.spa-chat-input'),
    };
  };

  handleResize = function () {
    if (!jqueryMap.$slider) { return false };

    setPxSizes();
    if (stateMap.position_type === 'opened') {
      jqueryMap.$slider.css({height: stateMap.slider_opened_px});
    }

    return true;
  };

  setPxSizes = function () {
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = getEmSize(jqueryMap.$slider.get(0));
    window_height_em = Math.floor($(window).height() / px_per_em + 0.5);
    opened_height_em = window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em : configMap.slider_opened_min_em;

    opened_height_em = configMap.slider_opened_em;
    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em;

    jqueryMap.$sizer.css({
      height: (opened_height_em - 2) * px_per_em
    });
  };

  setSliderPosition = function (position_type, callback) {
    var height_px, animate_time, slider_title, toggle_text;
    if (stateMap.position_type === position_type) {
      return true;
    }

    switch (position_type) {
      case 'opened':
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
        break;
      case 'hidden':
        height_px = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text = '+';
        break;
      case 'closed':
        height_px = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text = '+';
        break;
      default:
        return false;
    }

    jqueryMap.$slider.animate({
      height: height_px,
    }, animate_time, function () {
      jqueryMap.$toggle.prop('title', slider_title);
      jqueryMap.$toggle.text(toggle_text);
      stateMap.position_type = position_type;
      if (callback) { callback(jqueryMap.$slider); }
    });

    return true;
  };

  onClickToggle = function (event) {
    var set_chat_anchor = configMap.set_chat_anchor;
    if (stateMap.position_type === 'opened') {
      set_chat_anchor('closed');
    } else if (stateMap.position_type === 'closed') {
      set_chat_anchor('opened');
    }

    return false;
  };

  configModule = function (input_map) {
    spa.util.setConfigMap({
      input_map: input_map,
      settable_map: configMap.settable_map,
      config_map: configMap,
    });

    return true;
  };

  initModule = function ($append_target) {
    $append_target.html(configMap.main_html);
    stateMap.$append_target = $append_target;
    setJqueryMap();
    setPxSizes();

    jqueryMap.$toggle.attr('title', configMap.slider_closed_title);
    jqueryMap.$head.click(onClickToggle);
    stateMap.position_type = 'closed';

    return true;
  };

  return {
    configModule: configModule,
      initModule: initModule,
      setSliderPosition: setSliderPosition,
      handleResize: handleResize,
  };
}();
