## Introduction

This is a trans-compiler for the nodejs runtime in lambda, which makes the functions stateful.

## Usage
python transcompile.py src/stringYields.js > dist/index.js

## Code Example
Make sure you use the key word 'function*', some function name and 2 parameters (event, context).
See examples in src/*

## Motivation

Lambda does not directly support saving context(i.e, the state of execution of a program) at specified points. This project does just that by transcompiling any function to a context-aware function.

## What the heck can I do with it?

Plenty! Let's see a few-
1) Your function throws an exception and you want to know what the state of the program was. Just load the context and inspect it.
2) You want to make a function that can yield many values at different times. Like a random function generator which uses the previous output as its seed.
3) You have a large and long running code that needs to be hibernated and then resumed.

## Prerequisite(s) Installation

npm install -g regenerator
python

## How it works
It uses the regenerator library(also used in ES6->ES5 transpiling) to turn a generator function into a ES5 wrapped closure. This module extracts the local variables and the context(similar to stack pointer) into a serializable object which could be saved and restored each time the lambda function executes.

## Note
1) Adding event.restart = true restarts the function from the beginning
2) Once the function finishes executing, the next call fails with an error specifying that it is done executing, & the next call restarts it.
3) Configure the s3bucket and key to store the state in src/lib/lambdaWrapper.js

## Contributors

Sarath Rami

## Reference
https://github.com/facebook/regenerator