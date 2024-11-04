# EarScript

EarScript is a domain specific programming language, designed to only work with integers, and multiple 2D arrays of integers. It is designed to be used specifically for procedural generation.

It takes the elegant and minimalistic design of [brainfuck](https://esolangs.org/wiki/Brainfuck) and adds "quality of life features" like goto statements, randomized control flow, multiple arrays, and a second dimension.

This programming language was first implemented to create infinite procedurally generated music and charts in the rhythm game [EternAlgoRhythm](https://www.agecaf.eu/eternalgorhythm.html). While this first implementation leaves much to be desired in terms of performance, it shows the practical potential of EarScript.

# Links
- "Try Earscript Online" under construction. 
- [EternAlgoRhythm official page](https://www.agecaf.eu/eternalgorhythm.html)
- [EternAlgoRhythm on Steam](https://store.steampowered.com/app/2678290/EternAlgoRhythm/)

# What does EarScript look like?
(examples will be added).

# Earscript machines

EarScript is run by machines (often virtual). Each machine may take EarScript code directly, or it may take an intermediate representation like EarByte, a bytecode used in EternAlgoRhythm's machines.

Each machine implements its input and output differently. For example, in EternAlgoRhythm, the Part machine's output is linked to the Instrument machines' input, while the Instrument machines' output is used to generate the notes of the procedurally generated music.

Each machine in a way is a foreign function interface for EarScript.

# Visual representations

EarScript was initially designed to be used through EarVis, a node-based visual programming language. The idea of EarVis is to replace goto statements with node links, which help the code spaghetti look like actual spaghetti.

EarVis actually uses EarScript to save its files, with meta comments used to designate blocks and what their position and size is in the editor. 

By creating similar editors, the way the user writes EarScript can be adjusted just as much as the way the machine runs it. 

# The future of EarScript

There's many new features I'd like to add to a spiritual successor of EarScript, with functionality to use multiple threads, handle other data types like strings, and more. However this spiritual successor will have major breaking changes to the lexical syntax of the language, and would have much more complex compiler implementations. 

So even once this spiritual successor is available, there may still be use cases where EarScript's relative simplicity is preferred. 

EarScript is very flexible, writing a virtual machine for it is relatively straightforward, and customising virtual machines can make them quite applicable to different use cases.

I will be building an implementation of EarScript that runs on JS to be able to test EarScript online. 

I might next attempt to build implementations that compile too native code. 

Anyone is welcome to make their own implementations, or use it to make their own programming languages, this specification is dedicated to the public domain as CC0.
