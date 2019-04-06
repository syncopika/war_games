// https://jasmine.github.io/tutorials/react_with_npm

import {JSDOM} from 'jsdom';
import React from 'react';
import ReactDOM from 'react-dom';

const dom = new JSDOM('<html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

global.React = React;
global.ReactDOM = ReactDOM;