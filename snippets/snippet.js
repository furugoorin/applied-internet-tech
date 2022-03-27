// snippet.js
const detectNewline = require('detect-newline');

class Snippet{
    constructor(fileName, code, ...tags){
        this.name = fileName; 
        this.code = code; 
        this.tags = tags;
        this.lines = 0;
        this.countLines();
    }
    hasTag(string){
        return this.tags.includes(string);
    }

    countLines(){ 
        let lines = 0;
        let snippetCode = '';
        const newLineChar = detectNewline(this.code);
        const splitData = this.code.split(newLineChar);
       
        //checking for empty lines and updating number of lines
        for(let i = 0; i < this.code.length; i++){ 
            if(splitData[i] == '' || splitData[i] == null){
                continue;
            } else{ 
                snippetCode += splitData[i] + newLineChar;
                lines++;
            }
        }
        this.lines = lines;
        this.code = snippetCode;
    }
}

module.exports = { 
    Snippet: Snippet
};