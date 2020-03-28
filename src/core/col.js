import helper from './helper';

class Cols {
  constructor({
    len, width, indexWidth, minWidth,
  }) {
    this._ = {};
    this.len = len;
    this.width = width;
    this.indexWidth = indexWidth;
    this.minWidth = minWidth;
  }

  setData(d) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d;
  }

  getData() {
    const { len } = this;
    return Object.assign({ len }, this._);
  }

  getWidth(i) {

    if (this.isHide(i)) return 0;
    const col = this._[i];
    if (col && col.width) {
      return col.width;
    }
    return this.width;
  }

  getOrNew(ci) {
    this._[ci] = this._[ci] || {};
    return this._[ci];
  }

  setWidth(ci, width) {
    const col = this.getOrNew(ci);
    col.width = width;
  }

  unhide(idx) {
    let index = idx;
    while (index > 0) {
      index -= 1;
      if (this.isHide(index)) {
        this.setHide(index, false);
      } else break;
    }
  }

  isHide(ci) {
    const col = this._[ci];
    return col && col.hide;
  }

  setHide(ci, v) {
    const col = this.getOrNew(ci);
    if (v === true) col.hide = true;
    else delete col.hide;
  }

  setStyle(ci, style) {
    const col = this.getOrNew(ci);
    col.style = style;
  }

  sumWidth(min, max) {
    return helper.rangeSum(min, max, i => this.getWidth(i));
  }

  totalWidth() {
    return this.sumWidth(0, this.len);
  }

  deleteColumn(sci, eci) {
    // eslint-disable-next-line no-plusplus
    for (let i = sci; i <= eci; i++) {
      delete (this._[`${i}`]);
    }
    this.len -= (eci - sci);
  }

  insertColumn(sci, n = 1) {
    const idx = Object.keys(this._).findIndex(x => x === `${sci}`);
    if (idx < 0) {
      this._[`${sci}`] = {
        width: 100,
      };
    } else {
      const res = {};
      Object.keys(this._).forEach((x) => {
        const nx = parseInt(x, 10);
        if (nx >= sci) {
          res[`${nx + n}`] = this._[`${nx}`];
        } else {
          res[`${nx}`] = this._[`${nx}`];
        }
      });
      res[`${sci}`] = {
        width: 100,
      };
      this._ = res;
    }
    this.len += n;
  }
}

export default {};
export {
  Cols,
};
