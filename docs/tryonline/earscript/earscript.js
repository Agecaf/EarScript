import * as codejar from 'https://cdn.jsdelivr.net/npm/codejar@4.2.0/+esm';


//
// Codejar doesn't work well on Firefox :(
//
var FF = (document.getBoxObjectFor != null || window.mozInnerScreenX != null);

if (FF) {
    let container = document.getElementById("container")
    container.innerHTML += `<p style="color: orange">The code editor unfortunately does not work well in Firefox,
you may want to try Chrome/Chromium instead; 
pressing backspace sometimes moves the cursor to the end. 
Sorry about that, by the time I noticed
this issue I'd already made the code for the syntax highlighting :(</p>`
}


//
// Highlight!
//
const highlight = (editor) => {
    let sourcecode = editor.textContent
    let output = ""
    let tkIdx = 0


    while (sourcecode.length > 0) {
        let mtc

        // Whitespace
        if (sourcecode[0] == " ") {
            output += " "
            sourcecode = sourcecode.slice(1)
            continue
        }
        else if (sourcecode[0] == "\t") {
            output += "\t"
            sourcecode = sourcecode.slice(1)
            continue
        }
        // Comments
        else if (mtc = sourcecode.match(/^#[^\n]*/)) {
            output += `<span style="color: #aaa; font-style: italic;">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            continue
        }
        // Assigment
        else if (mtc = sourcecode.match(/^=\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #9CCC49;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Arithmetic Operators
        else if (mtc = sourcecode.match(/^[+\-*/%]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #62CF56;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Bitwise Operators
        else if (mtc = sourcecode.match(/^[?!]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #53BB96;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        else if (mtc = sourcecode.match(/^&(\w*)/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #53BB96;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Special Operators
        else if (mtc = sourcecode.match(/^\\\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #45A1D6;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Movement Operators
        else if (mtc = sourcecode.match(/^>(\w*)/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #D9B44C;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        else if (mtc = sourcecode.match(/^<(\w*)/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #D9B44C;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        else if (mtc = sourcecode.match(/^\$\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #D9B44C;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        else if (mtc = sourcecode.match(/^[\^`:;]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #D9B44C;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // I/O Operators
        else if (mtc = sourcecode.match(/^[.,]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #6584F3;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Flow Operators
        else if (mtc = sourcecode.match(/^[@'"~]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #D77F32;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }
        // Delimiters
        else if (mtc = sourcecode.match(/^[\[\](){}|]\w*/)) {
            output += `<span id="tk${tkIdx}" style=\"color: #822;\">${mtc[0]}</span>`
            sourcecode = sourcecode.slice(mtc[0].length)
            tkIdx++
            continue
        }

        else {
            output += sourcecode[0]
            sourcecode = sourcecode.slice(1)
            continue
        }
    }

    editor.innerHTML = output
}


//
// Initialize Jar
//
let jar = codejar.CodeJar(document.querySelector('#editor'), highlight, {
    addClosing: false,
    tab: "    ",
    indentOn: /# neverIndent/,

})

//
// Initial code
//
jar.updateCode(`# Compile: Check for errors.
# Run: Run 1000 steps, or until the end.
# Step: Test the code and machine step by step.

# Assignment, output
=42 . 

# Operations
+3 . -4. *2. /4. .3

# Fibonacci example
\\ncol2 =1>=1>
[10 . +l > ]

# In this machine, .2 prints the table, 
.3 .3 .2  # and .3 prints a line break
`)

// Globals    
let needsRecompile = false
let mustClear = false
let compiledCode = null
let lastPressed = "none"
let gvm = null
jar.onUpdate(code => {
    needsRecompile = true;
})
let outputElement = document.querySelector('#output')
let tableviewElement = document.querySelector('#tableview')

// Compile button
buttonCompile = () => {
    let out = compile(jar.toString())
    compiledCode = out
    gvm = makeVM(out)
    needsRecompile = false
    mustClear = true
    lastPressed = "compile"
    tableviewElement.innerHTML = ""
    if (out.errors.length == 0) {
        outputElement.innerHTML = `<span style="color: green">Code compiled succesfully!</span>
<br>Number of tokens: ${out.code.length}`
    }
    else {
        outputElement.innerHTML = ""
        for (let error of out.errors) {
            outputElement.innerHTML += `<p>[${error.ln+1}:${error.col}:${error.source}] 
<span style="color: red">${error.type}</span>: ${error.info}</p>`
        }
    }
}

// Run all the code
buttonRun = () => {
    if (needsRecompile) { buttonCompile() }
    if (!compiledCode) { buttonCompile() }
    lastPressed = "run"
    if (compiledCode.errors.length > 0) { return }
    let steps = 0
    if (mustClear) { outputElement.innerHTML = ""; mustClear = false }
    tableviewElement.innerHTML = ""
    while (gvm.currentCodeIdx < gvm.code.length && steps < 1000) {
        step(gvm)
        steps++
    }
}

// Step through the code
buttonStep = () => {
    if (needsRecompile) { buttonCompile() }
    if (!compiledCode) { buttonCompile() }
    console.log(lastPressed)
    if (lastPressed == "run") { buttonCompile()  }
    lastPressed = "step"
    if (compiledCode.errors.length > 0) { return }
    if (mustClear) { outputElement.innerHTML = ""; mustClear = false }
    if( gvm.currentCodeIdx < gvm.code.length) {
        if (gvm.currentCodeIdx > 0) {
            document.getElementById("tk"+(gvm.currentCodeIdx)).style.backgroundColor = null
        }
        step(gvm)
    }
    else {
        return
    }
    if (gvm.currentCodeIdx >= gvm.code.length) {
        outputElement.innerHTML += "<b>END</b>"
    } else {
        document.getElementById("tk"+(gvm.currentCodeIdx)).style.backgroundColor = "#333"
    }
    
    // Print the table
    tableviewElement.innerHTML = ""
    let t = gvm.tables[gvm.currentTableIdx]
    let out2 = "<table>"
    for (let j=t.h-1; j >= 0; j--) { 
        out2 += "<tr>"
        for (let i = 0; i < t.w; i++) {
            if (i == t.x && j == t.y) {
                out2 += "<td style=\"background-color: #333\">" + String(t[i+j*t.w]) + "</td>"
            }
            else {
                out2 += "<td>" + String(t[i+j*t.w]) + "</td>"
            }
        } 
        out2 += "</tr>" 
    }
    out2 += "</table>"
    tableviewElement.innerHTML += out2
}


/*

// Note; I first tried using the ace editor,
// but couldn't figure out how to implement syntax highlighting. 
// Code left commented in case it's useful later.

<style type="text/css" media="screen">
        #editor { 
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
    </style>

*/

/* Editor 
let editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");

// Listen to Command!
editor.commands.addCommand({
    name: 'myCommand',
    bindKey: {win: 'Ctrl-1',  mac: 'Command-1'},
    exec: function(editor) {
        let out = compile(editor.getValue());
        console.log(out)
        makeVM(out)
        let steps = 0
        while (out.currentCodeIdx < out.code.length && steps < 1000) {
            step(out)
            steps++
        }

    },
    readOnly: true, 
});

// Listen to changes!
editor.session.on('change', function(delta) {
    // delta.start, delta.end, delta.lines, delta.action
    // console.log("Boop")
});


// */


// Let's use const objects for enums
const NONE = {type: "None"}
const NUMBER = {type: "Number"}
const RELATIVEH = {type: "Relative Horizontal"}
const RELATIVEV = {type: "Relative Vertical"}
const TABLE = {type: "Table reference"}
const FLOW = {type: "Label reference"}




// Our main compiler!
function compile(sourcecode) {
    // console.log("Compiling!")
    // console.log(sourcecode)

    let operators = "+-*/%!&?=><:^`;$@'\"~\\.,|()[]{}"
    let operatorsAndWhitespace = "+-*/%!&?=><:^`;$@'\"~\\.,|()[]{} \t\n"
    let tokens = []
    let errors = []
    let labels = {}
    let tables = []
    let delimiters = []
    let sourceIdx = 0
    let codeIdx = 0
    let ln = 0
    let col = 0
    while (sourcecode.length > 0) {

        // Remove comments
        let spaceAndCommentMtc = sourcecode.match(/^[ \t]*(#[^\n]*)?/);
        if (spaceAndCommentMtc) {
            let spaceAndComment = spaceAndCommentMtc[0]
            sourceIdx += spaceAndComment.length
            col += spaceAndComment.length
            sourcecode = sourcecode.slice(spaceAndComment.length)
        }

        // Check if newline
        if (sourcecode.startsWith("\n")) {
            sourcecode = sourcecode.slice(1);
            col = 0; sourceIdx++; ln++;
            continue
        }

        // Check if token
        let tokenMtc = sourcecode.match(/^[+\-*\/%!&?=><:^`;$@'"~\\.,|()\[\]{}]\w*/);
        if (tokenMtc) {
            let token = {
                token: tokenMtc[0], head: "", tail: "", opchar: tokenMtc[0][0],
                sourceIdx: sourceIdx, col: col, ln: ln, len: tokenMtc[0].length,
                codeIdx: codeIdx,
            }
            // Split head an tail.
            if("+-*/%!&?=><:^`;$@'\"~|}])".includes(token.opchar)) {
                token.head = token.opchar
                token.tail = token.token.slice(1)
            }
            else {
                token.head = token.token.match(/^[^_0-9]+/)[0]
                token.tail = token.token.slice(token.head.length)
            }

            //
            // TAILS
            // 
            // No tails
            if (['|', ')', ']', '}', '[i', '~', '{m'].includes(token.head)) {
                token.tailType = NONE;
            }

            // Flow tails
            else if (['@', '\'', '"'].includes(token.head)) {
                token.tailType = FLOW;
                if (token.tail[0] == "_") {
                    // Syntax error
                    errors.push({
                        type: "Syntax Error",
                        info: "Label reference cannot start with \"_\"",
                        idx: sourceIdx, col: col, ln: ln,
                        source: token.token,
                    })
                    sourceIdx += token.len
                    col += token.len
                    sourcecode = sourcecode.slice(token.len)
                    continue
                }
                else if (!(token.tail in labels)) {
                    // New label reference
                    labels[token.tail] = [-1]
                }
                if (token.head == "@") {
                    // @ label
                    if (labels[token.tail][0] != -1) {
                        // Syntax error
                        errors.push({
                            type: "Syntax Error",
                            info: "\"@\" Label reference may only be defined once!",
                            idx: sourceIdx, col: col, ln: ln,
                            source: token.token,
                        })
                        sourceIdx += token.len
                        col += token.len
                        sourcecode = sourcecode.slice(token.len)
                        continue
                    }
                    labels[token.tail][0] = codeIdx
                    token.tailValue = 1
                }
                else {
                    // ', " labels
                    labels[token.tail].push(codeIdx)
                    token.tailValue = -1
                }
            }
            
            // Table move tail
            else if (token.head == "$") {
                token.tailType = TABLE;
                if (token.tail == "") {
                    // Return to default table
                    token.tailValue = 0
                }
                else if (token.tail[0] == "_") {
                    // Syntax error
                    errors.push({
                        type: "Syntax Error",
                        info: "Table reference cannot start with \"_\"",
                        idx: sourceIdx, col: col, ln: ln,
                        source: token.token,
                    })
                    sourceIdx += token.len
                    col += token.len
                    sourcecode = sourcecode.slice(token.len)
                    continue
                }
                else if (tables.length) {
                    // Check if table is there, otherwise add it.
                    let tableIdx = tables.indexOf(token.tail)
                    if (tableIdx < 0) {
                        token.tailValue = tables.length
                        tables.push(token.tail)
                    }
                    else {
                        token.tailValue = tableIdx
                    }
                }
                else {
                    // Naming default table
                    tables.push(token.tail)
                    token.tailValue = 0
                }
            }
            
            // Normal tails, in need of evaluation
            else {
                // Empty tail
                if (token.tail == "") {
                    token.tailType = Number
                    token.tailValue = 1
                }
                // Self reference
                else if (token.tail == "_") {
                    token.tailType = RELATIVEH
                    token.tailValue = 0
                }
                // Number tail
                else if (token.tail.match(/^_?\d+$/)) {
                    token.tailType = NUMBER;
                    token.tailValue = Number(token.tail.replace("_", "-"))
                }
                // Relative references
                else if (token.tail.match(/^\d+[udlr]$/)) {
                    let direction = token.tail[token.tail.length-1]
                    token.tailValue = Number(token.tail.slice(0, token.tail.length-1))
                    switch (direction){
                        case "d":
                            token.tailValue *= -1
                        case "u":
                            token.tailType = RELATIVEV;
                            break;
                        case "l":
                            token.tailValue *= -1
                        case "r":
                            token.tailType = RELATIVEH;
                            break;
                    }
                }
                // Relative references part 2
                else if (token.tail.match(/^_?[udlr]$/)) {
                    let direction = token.tail[token.tail.length-1]
                    token.tailValue = 1
                    switch (direction){
                        case "d":
                            token.tailValue *= -1
                        case "u":
                            token.tailType = RELATIVEV;
                            break;
                        case "l":
                            token.tailValue *= -1
                        case "r":
                            token.tailType = RELATIVEH;
                            break;
                    }
                }
                // Table reference
                else {
                    // Slice optional "_"
                    if (token.tail.startsWith("_")) {
                        token.tail = token.tail.slice(1)
                    }
                    token.tailType = TABLE
                    token.tailValue = tables.indexOf(token.tail)
                    if(token.tailValue < 0) {
                        // Syntax error, unkown table
                        errors.push({
                            type: "Syntax Error",
                            info: "Unkown table " + token.tail,
                            idx: sourceIdx, col: col, ln: ln,
                            source: token.token,
                        })
                        sourceIdx += token.len
                        col += token.len
                        sourcecode = sourcecode.slice(token.len)
                        continue
                    }
                }
            } // End of normal tails

            // Tails have been evaluated.
            
            //
            // DELIMITERS
            //

            // Opening delimiters
            if (token.opchar == "{" || token.opchar == "(" || token.opchar == "[") {
                delimiters.push(codeIdx)
                token.delimiters = [codeIdx]
            }

            // Separator delimiter
            else if (token.opchar == "|") {
                if (delimiters.length == 0) {
                    // Syntax error
                    errors.push({
                        type: "Syntax Error",
                        info: "Unexpected \"|\"",
                        idx: sourceIdx, col: col, ln: ln,
                        source: token.token,
                    })
                    sourceIdx += token.len
                    col += token.len
                    sourcecode = sourcecode.slice(token.len)
                    continue
                }
                token.delimiter = delimiters[delimiters.length-1]
                tokens[delimiters[delimiters.length-1]].delimiters.push(codeIdx)
            }

            // Closing delimiter
            else if (token.opchar == "}" || token.opchar == ")" || token.opchar == "]") {
                if (delimiters.length == 0) {
                    // Syntax error, no matchin opening delimiter.
                    errors.push({
                        type: "Syntax Error",
                        info: "Unexpected \"" + token.opchar + "\"",
                        idx: sourceIdx, col: col, ln: ln,
                        source: token.token,
                    })
                    sourceIdx += token.len
                    col += token.len
                    sourcecode = sourcecode.slice(token.len)
                    continue
                }
                token.delimiter = delimiters[delimiters.length-1]
                tokens[delimiters[delimiters.length-1]].delimiters.push(codeIdx)
                // Maybe todo: Check that { matches } etc.
                delimiters.pop()
            }

            //
            // Add TOKEN
            //
            tokens.push(token)
            sourceIdx += token.len; codeIdx++; col += token.len
            sourcecode = sourcecode.slice(token.len)
            continue

        }// End of token match

        
        // We have a syntax error.
        let errorMtc = sourcecode.match(/^[^\s+\-*/!&?=><:^`;$@'\"~\\.,|()\[\]{}]+/);
        if (errorMtc) {
            errors.push({
                type: "Syntax Error",
                info: "Not a token",
                idx: sourceIdx, col: col, ln: ln,
                source: errorMtc[0],
            })
            sourceIdx += errorMtc[0].length
            col += errorMtc[0].length
            sourcecode = sourcecode.slice(errorMtc[0].length)
            continue
        }
        else {
            errors.push({
                type: "Syntax Error",
                info: "Irrecoverable, unknown pattern",
                idx: sourceIdx, col: col, ln: ln,
                source: sourcecode,
            })
            return {
                code: tokens, errors: errors, canRun: false,
                tables: tables, labels: labels,
            }
        }
    } // End of while sourcecode.length > 0.

    // Link Flow & Tables
    for (let label in labels) {
        if (labels[label][0] == -1) {
            // Syntax error,
            for (let i = 1; i < labels[label].length; i++){
                let token = tokens[labels[label][i]]
                // Undefined label
                errors.push({
                    type: "Syntax Error",
                    info: "Unkown label " + label,
                    idx: token.sourceIdx, col: token.col, ln: token.ln,
                    source: token.token,
                })
            }
            
        }
        // Link flow
        for (let i = 1; i < labels[label].length; i++){
            let token = tokens[labels[label][i]]
            token.tailValue = labels[label][0]
        }
    }

    // Check delimiters
    for (let i = 0; i < delimiters.length; i++) {
        // Undefined label
        let token = tokens[delimiters[i]]
        errors.push({
            type: "Syntax Error",
            info: "Mismatched delimiter " + token.head,
            idx: token.sourceIdx, col: token.col, ln: token.ln,
            source: token.token,
        })
    }

    return {
        code: tokens, errors: errors, canRun: true,
        tableNames: tables, labels: labels,
    }
}


//
// TABLES
//
function makeTable() {
    return {
        0: 0,
        x: 0, y: 0,
        w: 1, h: 1,
    }
}

//
// Virtual machines
//
function makeVM(data) {
    
    // Initialize tables
    data.tables = []
    for (let tableName of data.tableNames) {
        data.tables.push(makeTable())
    }
    if (data.tables.length == 0) {
        data.tables.push(makeTable())
    }

    // Indices.
    data.currentTableIdx = 0
    data.currentCodeIdx = 0
    data.callStack = []

    data.output = (vm, opcode) => {
        let t = vm.tables[vm.currentTableIdx]
        switch (opcode) {
            case 1: 
                outputElement.innerHTML += t[t.x+t.y*t.w].toString() + ", "
                break
            case 2: 
                let out2 = "<table>"
                for (let j=t.h-1; j >= 0; j--) { 
                    out2 += "<tr>"
                    for (let i = 0; i < t.w; i++) {
                        out2 += "<td>" + String(t[i+j*t.w]) + "</td>"
                    } 
                    out2 += "</tr>" 
                }
                out2 += "</table>"
                outputElement.innerHTML += out2
                break
            case 3:
                outputElement.innerHTML += "<br>"
                break

        }
    }
    data.input = (vm, opcode) => {
        let t = vm.tables[vm.currentTableIdx]
        let input = prompt("Input value", "0")
        let inputVal = Number(input)
        if (!isNaN(inputVal)) {
            t[t.x+t.y*t.w] = inputVal
        }
    }

    return data
}


//
// VM Implementation
//
function step(vm) {
    let t = vm.tables[vm.currentTableIdx]
    let tk = vm.code[vm.currentCodeIdx]
    let v = tk.tailValue
    switch(tk.tailType) {
        case NUMBER: v = tk.tailValue; break
        case NONE: v = 1; break
        case RELATIVEH:
            let nx = (((t.x+v)%t.w)+t.w)%t.w;
            v = t[nx+t.y*t.w]
            break
        case RELATIVEV: 
            let ny = (((t.y+v)%t.h)+t.h)%t.h;
            v = t[t.x+ny*t.w]
            break
        case TABLE: 
            let t2 = vm.tables[v]
            v = t2[t2.x+t2.y*t2.w]
            break
    }
    
    switch (tk.head) {
        // Operations
        case "=": t[t.x+t.y*t.w] = v; break
        case "+": t[t.x+t.y*t.w] += v; break
        case "-": t[t.x+t.y*t.w] -= v; break
        case "*": t[t.x+t.y*t.w] *= v; break
        case "/": 
            if (v == 0) {
                vm.errors.push({
                    type: "Runtime Error",
                    info: "Division by zero attempted " + token.head,
                    idx: token.sourceIdx, col: token.col, ln: token.ln,
                    source: token.token,
                })
                break
            }
            t[t.x+t.y*t.w] = Math.floor(t[t.x+t.y*t.w]/ v); 
            break
        case "%": 
            t[t.x+t.y*t.w] = t[t.x+t.y*t.w] - Math.floor(t[t.x+t.y*t.w]/ v) * v
            break
        case "!": t[t.x+t.y*t.w] = ~t[t.x+t.y*t.w]; break
        case "&": t[t.x+t.y*t.w] = t[t.x+t.y*t.w] & v; break
        case "?": t[t.x+t.y*t.w] = t[t.x+t.y*t.w] | v; break
        case "\\pow": t[t.x+t.y*t.w] = Math.floor(Math.pow(t[t.x+t.y*t.w], v)); break
        case "\\min": t[t.x+t.y*t.w] = Math.min(t[t.x+t.y*t.w], v); break
        case "\\max": t[t.x+t.y*t.w] = Math.max(t[t.x+t.y*t.w], v); break

        // TODO: Optional operators

        // I/O
        case ".": vm.output(vm, v); break
        case ",": vm.input(vm, v); break

        // Pen movement
        case "$": vm.currentTableIdx = tk.tailValue; break
        case ">": t.x = (((t.x+v)%t.w)+t.w)%t.w; break
        case "<": t.x = (((t.x-v)%t.w)+t.w)%t.w; break
        case "^": t.y = (((t.y+v)%t.h)+t.h)%t.h; break
        case "`": t.y = (((t.y-v)%t.h)+t.h)%t.h; break
        case ":": t.x = (((v)%t.w)+t.w)%t.w; break
        case ";": t.y = (((v)%t.h)+t.h)%t.h; break
        case "\\nrow":
            let temp = [];
            for (let i = 0; i < t.h*t.w; i++) { temp.push(t[i]) }
            for (let i = 0; i < t.w; i++) { for(let j = 0; j < v; j++) {
                t[i+j*t.w] = j < t.h ? temp[i+j*t.w] : 0;
            }}
            t.h = v
            break
        case "\\ncol":
            let temp2 = [];
            for (let i = 0; i < t.h*t.w; i++) { temp2.push(t[i]) }
            for (let i = 0; i < v; i++) { for(let j = 0; j < t.h; j++) {
                t[i+j*v] = i < t.w ? temp2[i+j*t.w] : 0;
            }}
            t.w = v
            break

        // FLOW
        case "@": break
        case "'": vm.currentCodeIdx = tk.tailValue; break
        case "\"": 
            vm.callStack.push(tk.codeIdx)
            vm.currentCodeIdx = tk.tailValue
            break
        case "~": 
            if (vm.callStack.length == 0) { vm.currentCodeIdx = vm.code.length }
            else { vm.currentCodeIdx = vm.callStack.pop() }
            break

        // DELIMITERS
        case "|":
            let tk2 = vm.code[tk.delimiter]
            vm.currentCodeIdx = tk2.delimiters[tk2.delimiters.length-1]
            break
        case ")": break
        case "}": break
        case "]": 
            vm.currentCodeIdx = tk.delimiter
            return
        
        // Conditionals
        case "(eq": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] == v ? 0: 1]; break
        case "(ne": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] != v ? 0: 1]; break
        case "(lt": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] <  v ? 0: 1]; break
        case "(le": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] <= v ? 0: 1]; break
        case "(gt": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] >  v ? 0: 1]; break
        case "(ge": vm.currentCodeIdx = tk.delimiters[t[t.x+t.y*t.w] >= v ? 0: 1]; break
        case "(div": vm.currentCodeIdx = tk.delimiters[(t[t.x+t.y*t.w] % v) == 0 ? 0: 1]; break
        case "(r": vm.currentCodeIdx = tk.delimiters[ (Math.random() < (1/(1+v)))? 0: 1]; break
        case "(x":
            if ("count" in tk) {
                tk.count--
            } else {
                tk.count = v
            }
            vm.currentCodeIdx = tk.delimiters[ tk.count > 0 ? 0: 1]; 
            break
        case "(c":
            if ("count" in tk) {
                tk.count--
            } else {
                tk.count = v
            }
            vm.currentCodeIdx = tk.delimiters[ tk.count > 0 ? 0: 1];
            if (tk.count <= 0) { tk.count = v+1; }
            break

        // LOOPS
        case "[i": break
        case "[":
            if (v <= 1) {
                if (t[t.x+t.y*t.w] == 0) {
                    vm.currentCodeIdx = tk.delimiters[1]
                    break
                }
            }
            else {
                if ("count" in tk) {
                    tk.count--
                } else {
                    tk.count = v
                }
                vm.currentCodeIdx = tk.delimiters[ tk.count > 0 ? 0: 1];
                if (tk.count <= 0) { tk.count = v+1; }
            }

            break
        case "[r":
            if ("count" in tk) {
                tk.count++
            } else {
                tk.count = 0
            }
            if (tk.count == 0) { break }
            else {
                if (Math.random() < 1/(1+v)) {
                    tk.count = -1;
                    vm.currentCodeIdx = tk.delimiters[1]
                }
            }
            break
        
        // SEQUENCERS
        case "{":
            if ("count" in tk) { tk.count-- } 
            else { tk.count = v; tk.seq = 0 }
            if (tk.count <= 0) { tk.count = v; tk.seq++ }
            if (tk.seq >= tk.delimiters.length - 1) {tk.seq = 0}
            vm.currentCodeIdx = tk.delimiters[tk.seq]
            break
        case "{r":
            if ("count" in tk) { tk.count-- } 
            else { tk.count = v; tk.seq = Math.floor(Math.random() * (tk.delimiters.length - 1)) }
            if (tk.count == 0) { tk.count = v; tk.seq = Math.floor(Math.random() * (tk.delimiters.length - 1)) }
            vm.currentCodeIdx = tk.delimiters[tk.seq]
            break
        case "{m":
            vm.currentCodeIdx = tk.delimiters[
                (((t[t.x+t.y*t.w] % (tk.delimiters.length-1)) +
                (tk.delimiters.length-1))% (tk.delimiters.length-1)) ]
            break
        case "{s":
            if ("count" in tk) { tk.count-- } 
            else { tk.count = v; tk.seq = randomSequence(tk.delimiters.length-1) }
            if (tk.count == 0) { tk.count = v; tk.seq = randomSequence(tk.delimiters.length-1)}
            vm.currentCodeIdx = tk.delimiters[tk.seq[0]]
            tk.seq.push(tk.seq.shift())
            break

    }

    // Advance
    vm.currentCodeIdx++
}

function randomSequence(n) {
    let start = []
    let out = []
    for (let i = 0; i < n; i++) {
        start.push(i)
    }
    while(start.length > 0) {
        let idx = Math.floor(Math.random() * (start.length))
        out.push(start[idx])
        start.splice(idx, 1)
    }
    return out
}
