import { render } from 'preact';
import { App } from './app';
import './shell.css';

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
