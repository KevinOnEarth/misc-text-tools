'use babel';

import MiscTextUtilView from './misc-text-util-view';
import { CompositeDisposable } from 'atom';
const os = require('os')

export default {

  miscTextUtilView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.miscTextUtilView = new MiscTextUtilView(state.miscTextUtilViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.miscTextUtilView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:toggleCsvList': () => this.toggleCsvList()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:sortSelectionAsc': () => this.sortSelection('asc')
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:sortSelectionDesc': () => this.sortSelection('desc')
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:commentWrap': () => this.wrapText('/*','*/')
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:singleQuoteListElements': () => this.quoteSelection('\'')
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'misc-text-tools:doubleQuoteListElements': () => this.quoteSelection('"')
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.miscTextUtilView.destroy();
  },

  serialize() {
    return {
      miscTextUtilViewState: this.miscTextUtilView.serialize()
    };
  },

  toggleCsvList() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      if (selection.includes(os.EOL)) {
        selection = selection.replace(/(\r\n|\n|\r)/gm, ',')
      } else if (selection.includes(',')){
        selection = selection.replace(/,/gm,os.EOL)
      }
      editor.insertText(selection)
    }
  },
  wrapText(begin, end) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      if (selection.includes(begin)) {
        editor.insertText(selection.replace(begin,'').replace(end,''))
      } else {
        editor.insertText(begin+selection+end)
      }
    }
  },
  sortSelection(direction) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      if (!selection) {
        return;
      }
      if (selection.includes(',')) {
        let chArray = sortArray(selection.split(/,/gm),direction)
        selection = chArray.join(',')
      } else if (selection.includes(os.EOL)) {
        let chArray = this.sortArray(selection.split(os.EOL),direction)
        selection = chArray.join(os.EOL)
      } else {
        let chArray = sortArray(selection.split(' '),direction)
        selection = chArray.join(' ')
      }
      editor.insertText(selection)
    }
  },
  sortArray(anArray, direction) {
    return anArray.sort(function(a,b) {
      if (direction==='asc') {
        return a.toLowerCase().localeCompare(b.toLowerCase())
      } else {
        return b.toLowerCase().localeCompare(a.toLowerCase())
      }
    })
  },
  quoteSelection(quote) {
    let re = new RegExp(quote, "gm")
    let editor
    let retArray = []
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      if (selection.includes(quote)) {
        selection = selection.replace(re,'')
      } else if (selection.includes(os.EOL)) {
        let chArray = selection.split(os.EOL)
          chArray.forEach(item => {
            retArray.push(quote+item+quote)
          })
        selection = retArray.join(os.EOL)
      } else if (selection.includes(',')) {
        let chArray = selection.split(',')
          chArray.forEach(item => {
            retArray.push(quote+item+quote)
          })
        selection = retArray.join(',')
      } else if (selection.includes(' ')){
        let chArray = selection.split(' ')
          chArray.forEach(item => {
            retArray.push(quote+item+quote)
          })
        selection = retArray.join(' ')
      } else {
          selection = quote+selection+quote
      }
      editor.insertText(selection)
    }
  }

};
