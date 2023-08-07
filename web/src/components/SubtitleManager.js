// 
// SubtitleManager.js
// 2023.04.06
// by Hu Yuhua
//

import protoRoot from "@/proto/SttMessage.js";
import { text } from "@fortawesome/fontawesome-svg-core";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

class Subtitle {
  uid = 0
  userName = ''
  isFinal = false
  text = ''
  confidence = 0
  time = 0
  translation = [] 
  isTranslate = false
  constructor() {
  }
}

class SubtitleManager {
  subtitleList = []
  praseData(data, callback) {
    let textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data);
    //console.log(textstream) 
    if (undefined == textstream) {
      callback(false, null)
      return
    }

    // switch type
    switch (textstream.dataType) {
      case 'transcribe':
        //
        let textStr = ""
        let isFinal = false
        let confidence = 0.0
        //console.log(textstream.words)
        textstream.words.forEach(word => {
          //console.log(word)
          textStr += word.text
          //console.log(textStr)
          confidence = word.confidence
          isFinal = isFinal ? true : word.isFinal
        })
        if (textStr.length == 0) {
          callback(false, null)
          return
        }
        //console.log(textStr)
        let subtitle = new Subtitle()
        subtitle.isTranslate = false
        subtitle.uid = textstream.uid
        subtitle.text = textStr
        subtitle.confidence = confidence
        subtitle.isFinal = isFinal
        subtitle.time = textstream.time
        // console.log(subtitle)
        this.appendSubtitle(subtitle)
        callback(true, subtitle)
        break
      case 'translate':
        let transTextStr = ""
        let isFinalTrans = false
        textstream.trans.forEach( transItem => {
          let subtitle = new Subtitle()
          subtitle.translation = []
          transItem.texts.forEach( text => {
            console.log('Translation: ' + text)
            subtitle.translation.push(text)
          })
          subtitle.uid = textstream.uid
          isFinalTrans = isFinalTrans ? true : transItem.isFinal
          subtitle.isFinal = isFinalTrans
          subtitle.isTranslate = true
          subtitle.time = textstream.time
          // console.log(subtitle)
          this.appendSubtitle(subtitle)
          callback(true, subtitle)
        })
        break
    }

    return

    let words = textstream.words;
    let trans = textstream.trans

    if (words.length <= 0) {
      callback(false, {})
      return
    }

    let word = textstream.words[0];
    let isFinal = word.isFinal ?? false
    let textUid = textstream.uid

    if ( word.text == undefined ) {
      console.log("no text, return")
      return
    }

    let obj = {
      "uid": textUid,
      "isFinal": isFinal,
      "word": word,
      "time": textstream.time
    }

    // let sub = {
    //   uid: textUid,
    //   isFinal: isFinal,
    //   word: word,
    //   time: textstream.time
    // }

    console.log(`praseData result: ${obj}`)
    callback(isFinal, obj)

    return
  }

  appendSubtitle(subtitle) {
    // console.log(subtitle)
    let last = this.subtitleList.findLast((element) => {
      return element.uid == subtitle.uid
    })
    
    if (last == null) {
      console.log('Add new subtitle')
      this.subtitleList.push(subtitle)
      return
    }

    if (subtitle.isTranslate) {
      last.translation = subtitle.translation
    }
    else {
      if (last.isFinal) {
        this.subtitleList.push(subtitle)
      }
      else {
        last.time = subtitle.time
        last.isFinal = subtitle.isFinal
        last.text = subtitle.text
      }
    }
    // console.log(this.subtitleList)
  }

  clear() {
    this.subtitleList = []
  }
}

// export instance
let subtitleManager = new SubtitleManager()
export default subtitleManager

// EOF
