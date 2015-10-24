import $ from 'jquery';
import request from 'superagent';
import {parseString} from 'xml2js';
import Promise from 'bluebird';

const body = $('body');
const textDefault = '無料で読む';
const textLoading = '読込中';
const div = $('<a id="nhLink" target="_blank">' + textDefault + '</a>').css({
  'font-weight': 'bold',
  'position': 'absolute',
  'border': '1px solid #000',
  'padding': '10px',
  'white-space': 'nowrap',
  'text-align': 'center',
});

function logSelection(selection, x, y) {
  console.log('"' + selection + '" was selected at x=' + x + ', y=' + y);
}

function getSelection() {
  let selection = '';
  if (window.getSelection) {
    selection = window.getSelection();
  } else if (document.selection) {
    selection = document.selection.createRange();
  }
  return selection.toString();
}

function yahooMaApi(selection) {
  return new Promise(function (resolve, reject) {
    request
      .get('https://jlp.yahooapis.jp/MAService/V1/parse')
      .query({
        results: 'ma',
        sentence: selection,
      })
      .end(function(err, res) {
        if (err) return reject(err);
        return resolve(res);
      });
  });
}

function xml2js(selectionXml) {
  return new Promise(function (resolve, reject) {
    parseString(selectionXml, function (err, res) {
      if (err) return reject(err);
      let selectionSeparated = '';
      const wordList = res.ResultSet.ma_result[0].word_list[0].word;
      wordList.map((item) => {
        if (item.pos[0] === '名詞') {
          console.log(item.surface[0]);
          selectionSeparated += item.surface[0] + '+';
        }
      });
      return resolve(selectionSeparated);
    });
  });
}

body.append(div);
body.on('mouseup', (e) => {
  console.log('mouseup');
  const selection = getSelection();
  if (selection !== '') {
    logSelection(selection, e.pageX, e.pageY);
    $('#nhLink')
      .css({
        'top': e.pageY + 20 + 'px',
        'left': e.pageX + 20 + 'px',
      })
      .text(textLoading)
      .show();
    yahooMaApi(selection)
      .then((xml) => {
        return xml2js(xml.text);
      })
      .then((query) => {
        $('#nhLink')
          .attr({'href': 'https://www.google.co.jp/#q=' + query + '&tbm=nws'})
          .text(textDefault);
      });
  } else {
    $('#nhLink').hide();
  }
});
body.on('mouseup', '#nhLink', (e) => {
  e.stopPropagation();
});