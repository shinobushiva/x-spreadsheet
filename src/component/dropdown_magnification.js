import Dropdown from './dropdown';
import { h } from './element';
import { magnifications } from '../core/magnifications';
import { cssPrefix } from '../config';

export default class DropdownMagnification extends Dropdown {
  constructor() {
    const nMagnifications = magnifications.map(it => h('div', `${cssPrefix}-item`)
      .on('click', () => {
        this.setTitle(`${it.title}`);
        this.change(it);
      })
      .child(`${it.title}`));
    super('100%', '60px', true, 'bottom-left', ...nMagnifications);
  }
}
