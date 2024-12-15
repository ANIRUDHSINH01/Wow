import type { VNode } from './types';
import { isFunction, isString, isComponent } from '../utils/typeGuards';
import { createDOMElement, updateDOMProperties } from './dom';

export class DiffEngine {
  private static instance: DiffEngine;

  private constructor() {}

  static getInstance(): DiffEngine {
    if (!DiffEngine.instance) {
      DiffEngine.instance = new DiffEngine();
    }
    return DiffEngine.instance;
  }

  diff(oldNode: VNode | null, newNode: VNode | null, parentDom: Element | null): void {
    if (oldNode === null && newNode === null) {
      return;
    }

    if (oldNode === null) {
      this.mount(newNode!, parentDom!);
      return;
    }

    if (newNode === null) {
      this.unmount(oldNode, parentDom!);
      return;
    }

    if (this.shouldReplace(oldNode, newNode)) {
      this.replace(oldNode, newNode, parentDom!);
      return;
    }

    if (isComponent(newNode.type)) {
      this.updateComponent(oldNode, newNode, parentDom!);
      return;
    }

    this.updateElement(oldNode, newNode, parentDom!);
  }

  private shouldReplace(oldNode: VNode, newNode: VNode): boolean {
    return (
      typeof oldNode.type !== typeof newNode.type ||
      (isString(oldNode.type) && isString(newNode.type) && oldNode.type !== newNode.type)
    );
  }

  private mount(node: VNode, parentDom: Element): void {
    const element = createDOMElement(node);
    parentDom.appendChild(element);
  }

  private unmount(node: VNode, parentDom: Element): void {
    if (node.props.__ref) {
      node.props.__ref.current = null;
    }
    parentDom.removeChild(parentDom.childNodes[0]);
  }

  private replace(oldNode: VNode, newNode: VNode, parentDom: Element): void {
    this.unmount(oldNode, parentDom);
    this.mount(newNode, parentDom);
  }

  private updateComponent(oldNode: VNode, newNode: VNode, parentDom: Element): void {
    // Component update logic
  }

  private updateElement(oldNode: VNode, newNode: VNode, parentDom: Element): void {
    updateDOMProperties(
      parentDom.childNodes[0] as Element,
      oldNode.props,
      newNode.props
    );

    // Recursively update children
    const maxLength = Math.max(
      oldNode.props.children.length,
      newNode.props.children.length
    );

    for (let i = 0; i < maxLength; i++) {
      this.diff(
        oldNode.props.children[i],
        newNode.props.children[i],
        parentDom.childNodes[0] as Element
      );
    }
  }
}