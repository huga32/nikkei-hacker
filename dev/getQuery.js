import request from 'superagent';
import {parseString} from 'xml2js';
import Promise from 'bluebird';

function yahooMaApi(text) {
  return new Promise(function (resolve, reject) {
    request
      .get('https://jlp.yahooapis.jp/MAService/V1/parse')
      .query({
        results: 'ma',
        sentence: text,
      })
      .end(function(err, res) {
        if (err) return reject(err);
        return resolve(res);
      });
  });
}

function xml2query(xml) {
  return new Promise(function (resolve, reject) {
    parseString(xml, function (err, res) {
      if (err) return reject(err);
      let query = '';
      const wordList = res.ResultSet.ma_result[0].word_list[0].word;
      wordList.map((item) => {
        if (item.pos[0] === '名詞') {
          query += item.surface[0] + '+';
        }
      });
      return resolve(query);
    });
  });
}

export default function getQuery(text = null) {
  return yahooMaApi(text)
    .then((xml) => {
      return xml2query(xml.text);
    })
    .then((query) => {
      return query;
    });
}