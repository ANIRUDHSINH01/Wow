import type { VNode, Props } from './types';
import { isFunction, isString } from '../utils/typeGuards';

export function createDOMElement(node: VNode): Element {
  if (isString(node.type)) {
    const element = document.createElement(node.type);
    updateDOMProperties(element, {}, node.props);
    
    node.props.children?.forEach((child: VNode) => {
      const childElement = createDOMElement(child);
      element.appendChild(childElement);
    });
    
    return element;
  }
  
  throw new Error('Invalid node type');
}

export function updateDOMProperties(element: Element, oldProps: Props, newProps: Props): void {
  // Remove old properties
  Object.keys(oldProps).forEach(key => {
    if (key !== 'children' && !(key in newProps)) {
      removeProp(element, key, oldProps[key]);
    }
  });

  // Set new properties
  Object.keys(newProps).forEach(key => {
    if (key !== 'children' && oldProps[key] !== newProps[key]) {
      setProp(element, key, newProps[key]);
    }
  });
}

function setProp(element: Element, name: string, value: any): void {
  if (name === 'className') {
    element.setAttribute('class', value);
  } else if (name === 'style' && typeof value === 'object') {
    Object.assign((element as HTMLElement).style, value);
  } else if (name.startsWith('on') && isFunction(value)) {
    const eventName = name.toLowerCase().substring(2);
    element.addEventListener(eventName, value);
  } else if (typeof value !== 'object' && typeof value !== 'function') {
    element.setAttribute(name, value);
  }
}

function removeProp(element: Element, name: string, value: any): void {
  if (name === 'className') {
    element.removeAttribute('class');
  } else if (name === 'style') {
    (element as HTMLElement).style.cssText = '';
  } else if (name.startsWith('on') && isFunction(value)) {
    const eventName = name.toLowerCase().substring(2);
    element.removeEventListener(eventName, value);
  } else {
    element.removeAttribute(name);
  }
}