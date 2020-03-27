import DropdownItem from './dropdown_item';
import DropdownMagnification from '../dropdown_magnification';

export default class Magnification extends DropdownItem {
  constructor() {
    super('magnification');
  }

  getValue(it) {
    return it.key;
  }

  dropdown() {
    return new DropdownMagnification();
  }
}
