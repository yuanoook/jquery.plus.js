$.extend({
  randomId: function(prefix){
    return (prefix||'')+( new Date().valueOf().toString(36)+Math.random().toString(36) ).split('0.').join('_').substr(0,12);
  },
  pullValue: function(obj,key,default_value){
    var keys_arr = key.split('.');
    var subobj = obj;
    try{
      while(keys_arr.length)
      subobj = subobj[ keys_arr.shift() ];
      return !/Null|Undefined/.test(Object.prototype.toString.call(subobj)) ? subobj : default_value;
    }catch(e){
      return default_value;
    }
  },
  pushValue: function(obj,key,value){
    var subkey,
    subobj = obj,
    keys_arr = key.split('.');

    while(keys_arr.length>1)(
      subkey = keys_arr.shift(),
      subobj = subobj[subkey] = (
        !/Number|String|Null|Undefined/.test(Object.prototype.toString.call(subobj[subkey]))
        ? subobj[subkey]
        : {}
      )
    )

    subobj[ keys_arr.shift() ] = value;
  },
  dirtyCheck: function(key,value){
    return !$.cacheUnchangedCheck(key,value);
  },
  cacheUnchangedCheck: function(){
    var cache = {};

    return function(key,new_value){
      var result = true;
      var old_value = $.pullValue(cache,key);
      $.pushValue(cache,key,new_value);

      if( /Number|String|Null|Undefined/.test( Object.prototype.toString.call(new_value) ) ){
        result = result && old_value === new_value;
        return result;
      }else{
        for(var k in new_value){
          if( new_value.hasOwnProperty(k) ){
            result = result && $.pullValue(new_value,k) === $.pullValue(old_value,k);
            if(!result){
              return result;
            }
          }
        }
      }

      if( /Number|String|Null|Undefined/.test( Object.prototype.toString.call(old_value) ) ){
        result = result && old_value === new_value;
        return result;
      }else{
        for(var k in old_value){
          if( old_value.hasOwnProperty(k) ){
            result = result && $.pullValue(new_value,k) === $.pullValue(old_value,k);
            if(!result){
              return result;
            }
          }
        }
      }

      return result;
    }
  }(),
  saveLocalJsonData: function(name,obj){
    var prefix = 'rango_';
    localStorage[prefix+name] = JSON.stringify(obj);
  },
  getLocalJsonData: function(name){
    var prefix = 'rango_';
    try{
      return JSON.parse(localStorage[prefix+name]);
    }catch(e){
      return;
    }
  },
  updateLocalJsonData: function(name,key,value){
    var info_cache = $.getLocalJsonData(name) || {};
    info_cache[key] = value;
    $.saveLocalJsonData(name,info_cache);
  },
  loadScripts: function(scripts,callback,inqueue){
    inqueue = $.type(inqueue)!=='undefined' ? inqueue : true;
    if(inqueue){
      var script;
      scripts.length ? $.getScript(script = scripts.shift()).done(
        $.loadScripts.bind(null,scripts,callback,inqueue)
      ).fail(failReport.bind(null,script)) : (callback && callback());
    }else{
      scripts.forEach(function(script){
        $.getScript(script).done(finishCheck).fail(failReport.bind(null,script))
      });
    }

    var done_count = 0;
    function finishCheck(){
      ++done_count >= scripts.length && callback && callback();
    }

    function failReport(script){
      throw new Error(script+' load as script failed');
    }
  }
});