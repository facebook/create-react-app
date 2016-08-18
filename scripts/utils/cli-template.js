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
  'info': {initial: 'I', blockBg:['bgBlue','black'], titleColor:'blue'},
  'error': {initial: 'E', blockBg:['bgRed','white'], titleColor:'red'},
  'warning': {initial: 'W', blockBg:['bgYellow','black'], titleColor:'yellow'},
  'success': {initial: 'S', blockBg:['bgGreen','black'], titleColor:'green'},
  'note': {initial: 'N', blockBg:['bgBlack','yellow'], titleColor:'yellow'},
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

  template[type] = function(content){
    var line;

    if(typeof content !== 'string'){
      var blk;
      if(isArray(content)){
        blk = block(_specs.initial)
        line = chalk[_specs.blockBg[0]][_specs.blockBg[1]](blk)
                +" " + indentLines(content, blk.length+2)
      } else {

        if(content.type=='title'){
          blk = block(content.name);
          line = chalk[_specs.blockBg[0]][_specs.blockBg[1]](blk)
                  + " " + chalk[_specs.titleColor](indentLines(content.message, blk.length+2));
        } else {
          blk = block(_specs.initial);
          line = chalk[_specs.blockBg[0]][_specs.blockBg[1]](blk)
                  +" " + indentLines(content.message, blk.length);
        }
      }
    } else {
      line = chalk[_specs.blockBg[0]][_specs.blockBg[1]](block(_specs.initial))
              +" " + content
    }
    return line;
  }
})

module.exports = template;
