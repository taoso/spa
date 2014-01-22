var spa = function (a){
  var initModule = function ($container) {
    spa.shell.initModule($container);
  };

  return {
    initModule: initModule,
  };
}();
