var chalk = require('chalk');

function isArray(v){
  if( Object.prototype.toString.call( v ) === '[object Array]' ) {
      return true;
  }
  return false;
}

function block(msg){
  return ' '+msg+' ';
}

var types =  {
  'info': {initial: 'I', blockColor:['bgBlue','black'], titleColor:'blue'},
  'error': {initial: 'E', blockColor:['bgRed','white'], titleColor:'red'},
  'warning': {initial: 'W', blockColor:['bgYellow','black'], titleColor:'yellow'},
  'success': {initial: 'S', blockColor:['bgGreen','black'], titleColor:'green'},
  'note': {initial: 'N', blockColor:['bgBlack','yellow'], titleColor:'yellow'},
}

var template = {};

// template['log'] = function(content){
//   return content;
// }

function indentLines(lines, spaces){
  if(isArray(lines))
    return lines.join('\n'+ Array(spaces).join(' '))
  return lines;
}
Object.keys(types).map(function(type){
  var _specs = types[type];
  template[type] = function(content, override){
    var line, specs={};
    Object.assign(specs, _specs, override)
    if(typeof content !== 'string'){
      var blk;
      if(isArray(content)){
        blk = block(specs.initial)
        line = chalk[specs.blockColor[0]][specs.blockColor[1]](blk)
                +" " + indentLines(content, blk.length+2)
      } else {

        if(content.type === 'title'){
          blk = block(content.name);
          line = chalk[specs.blockColor[0]][specs.blockColor[1]](blk)
                  + " " + chalk[specs.titleColor](indentLines(content.message, blk.length+2));
        } else {
          blk = block(specs.initial);
          line = chalk[specs.blockColor[0]][specs.blockColor[1]](blk)
                  +" " + indentLines(content.message, blk.length);
        }
      }
    } else {
      line = chalk[specs.blockColor[0]][specs.blockColor[1]](block(_specs.initial))
              +" " + content
    }
    return line;
  }
  return type;
});

module.exports = template;
