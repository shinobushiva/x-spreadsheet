/* global window */
function dpr() {
  return window.devicePixelRatio || 1;
}

function thinLineWidth() {
  return dpr() - 0.5;
}

function npx(px) {
  return parseInt(px * dpr(), 10);
}

function npxLine(px) {
  const n = npx(px);
  return n > 0 ? n - 0.5 : 0.5;
}

class DrawBox {
  constructor(x, y, w, h, padding = 0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.padding = padding;
    this.bgcolor = '#ffffff';
    // border: [width, style, color]
    this.borderTop = null;
    this.borderRight = null;
    this.borderBottom = null;
    this.borderLeft = null;
  }

  setBorders({
    top, bottom, left, right,
  }) {
    if (top && top.length > 0) this.borderTop = top;
    if (right && right.length > 0) this.borderRight = right;
    if (bottom && bottom.length > 0) this.borderBottom = bottom;
    if (left && left.length > 0) this.borderLeft = left;
  }

  innerWidth() {
    return this.width - (this.padding * 2) - 2;
  }

  innerHeight() {
    return this.height - (this.padding * 2) - 2;
  }

  textx(align) {
    const { width, padding } = this;
    let { x } = this;
    if (align === 'left') {
      x += padding;
    } else if (align === 'center') {
      x += width / 2;
    } else if (align === 'right') {
      x += width - padding;
    }
    return x;
  }

  texty(align, h) {
    const { height, padding } = this;
    let { y } = this;
    if (align === 'top') {
      y += padding;
    } else if (align === 'middle') {
      y += height / 2 - h / 2;
    } else if (align === 'bottom') {
      y += height - padding - h;
    }
    return y;
  }

  topxys() {
    const { x, y, width } = this;
    return [[x, y], [x + width, y]];
  }

  rightxys() {
    const {
      x, y, width, height,
    } = this;
    return [[x + width, y], [x + width, y + height]];
  }

  bottomxys() {
    const {
      x, y, width, height,
    } = this;
    return [[x, y + height], [x + width, y + height]];
  }

  leftxys() {
    const {
      x, y, height,
    } = this;
    return [[x, y], [x, y + height]];
  }
}

function drawFontLine(type, tx, ty, align, valign, blheight, blwidth) {
  const floffset = { x: 0, y: 0 };
  if (type === 'underline') {
    if (valign === 'bottom') {
      floffset.y = 0;
    } else if (valign === 'top') {
      floffset.y = -(blheight + 2);
    } else {
      floffset.y = -blheight / 2;
    }
  } else if (type === 'strike') {
    if (valign === 'bottom') {
      floffset.y = blheight / 2;
    } else if (valign === 'top') {
      floffset.y = -((blheight / 2) + 2);
    }
  }

  if (align === 'center') {
    floffset.x = blwidth / 2;
  } else if (align === 'right') {
    floffset.x = blwidth;
  }
  this.line(
    [tx - floffset.x, ty - floffset.y],
    [tx - floffset.x + blwidth, ty - floffset.y],
  );
}

class Draw {
  constructor(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    // XXX: Maybe it is doing nothing
    this.ctx.scale(dpr(), dpr());
    this.dpr = dpr;
  }

  resize(width, height) {
    // console.log('dpr:', dpr);
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.el.width = npx(width);
    this.el.height = npx(height);
  }

  clear() {
    const { width, height } = this.el;
    this.ctx.clearRect(0, 0, width, height);
    return this;
  }

  attr(options) {
    Object.assign(this.ctx, options);
    return this;
  }

  save() {
    this.ctx.save();
    this.ctx.beginPath();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  translate(x, y) {
    this.ctx.translate(npx(x), npx(y));
    return this;
  }

  clearRect(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h);
    return this;
  }

  fillRect(x, y, w, h) {
    this.ctx.fillRect(npx(x) - 0.5, npx(y) - 0.5, npx(w), npx(h));
    return this;
  }

  fillText(text, x, y) {
    this.ctx.fillText(text, npx(x), npx(y));
    return this;
  }

  /*
    txt: render text
    box: DrawBox
    attr: {
      align: left | center | right
      valign: top | middle | bottom
      color: '#333333',
      strike: false,
      font: {
        name: 'Arial',
        size: 14,
        bold: false,
        italic: false,
      }
    }
    textWrap: text wrapping
  */
  text(mtxt, box, attr = {}, textWrap = true) {
    const { ctx } = this;
    const {
      align, valign, font, color, strike, underline,
    } = attr;
    const tx = box.textx(align);
    ctx.save();
    ctx.beginPath();
    this.attr({
      textAlign: align,
      textBaseline: valign,
      font: `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${npx(font.size)}px ${font.name}`,
      fillStyle: color,
      strokeStyle: color,
    });
    const txts = `${mtxt}`.split('\n');
    const biw = box.innerWidth();
    const ntxts = [];
    txts.forEach((it) => {
      const txtWidth = ctx.measureText(it).width;
      if (textWrap && txtWidth > biw) {
        let textLine = { w: 0, len: 0, start: 0 };
        for (let i = 0; i < it.length; i += 1) {
          if (textLine.w >= biw) {
            ntxts.push(it.substr(textLine.start, textLine.len));
            textLine = { w: 0, len: 0, start: i };
          }
          textLine.len += 1;
          textLine.w += ctx.measureText(it[i]).width + 1;
        }
        if (textLine.len > 0) {
          ntxts.push(it.substr(textLine.start, textLine.len));
        }
      } else {
        ntxts.push(it);
      }
    });
    const txtHeight = (ntxts.length - 1) * (font.size + 2);
    let ty = box.texty(valign, txtHeight);
    ntxts.forEach((txt) => {
      const txtWidth = ctx.measureText(txt).width;
      this.fillText(txt, tx, ty);
      if (strike) {
        drawFontLine.call(this, 'strike', tx, ty, align, valign, font.size, txtWidth);
      }
      if (underline) {
        drawFontLine.call(this, 'underline', tx, ty, align, valign, font.size, txtWidth);
      }
      ty += font.size + 2;
    });
    ctx.restore();
    return this;
  }

  border(style, color) {
    const { ctx } = this;
    ctx.lineWidth = thinLineWidth();
    ctx.strokeStyle = color;
    // console.log('style:', style);
    if (style === 'medium') {
      ctx.lineWidth = npx(2) - 0.5;
    } else if (style === 'thick') {
      ctx.lineWidth = npx(3);
    } else if (style === 'dashed') {
      ctx.setLineDash([npx(3), npx(2)]);
    } else if (style === 'dotted') {
      ctx.setLineDash([npx(1), npx(1)]);
    } else if (style === 'double') {
      ctx.setLineDash([npx(2), 0]);
    }
    return this;
  }

  line(...xys) {
    const { ctx } = this;
    if (xys.length > 1) {
      const [x, y] = xys[0];
      ctx.moveTo(npxLine(x), npxLine(y));
      for (let i = 1; i < xys.length; i += 1) {
        const [x1, y1] = xys[i];
        ctx.lineTo(npxLine(x1), npxLine(y1));
      }
      ctx.stroke();
    }
    return this;
  }

  strokeBorders(box) {
    const { ctx } = this;
    // border
    const {
      borderTop, borderRight, borderBottom, borderLeft,
    } = box;
    if (borderTop) {
      ctx.save();
      ctx.beginPath();
      this.border(...borderTop);
      this.line(...box.topxys());
      ctx.restore();
    }
    if (borderRight) {
      ctx.save();
      ctx.beginPath();
      this.border(...borderRight);
      this.line(...box.rightxys());
      ctx.restore();
    }
    if (borderBottom) {
      ctx.save();
      ctx.beginPath();
      this.border(...borderBottom);
      this.line(...box.bottomxys());
      ctx.restore();
    }
    if (borderLeft) {
      ctx.save();
      ctx.beginPath();
      this.border(...borderLeft);
      this.line(...box.leftxys());
      ctx.restore();
    }
  }

  cornerTriangle(box, color = 'rgba(0, 0, 0, .5)', size = 16) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - size), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + size));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  dropdown(box) {
    this.cornerTriangle(box, 'rgba(0, 0, 0, .45)');
  }

  error(box) {
    this.cornerTriangle(box, 'rgba(255, 0, 0, .65)');
  }

  frozen(box) {
    this.cornerTriangle(box, 'rgba(0, 0, 0, .5)');
  }

  varialbe(box) {
    this.cornerTriangle(box, 'rgba(255,192,203,1)');
  }

  rect(box, dtextcb) {
    const { ctx } = this;
    const {
      x, y, width, height, bgcolor,
    } = box;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = bgcolor || '#fff';
    ctx.rect(npxLine(x + 1), npxLine(y + 1), npx(width - 2), npx(height - 2));
    ctx.clip();
    ctx.fill();
    dtextcb();
    ctx.restore();
  }

  image(_image, fw, fh, tx, ty) {
    const { ctx } = this;
    const {
      x, y, rotate, scale, image,
    } = _image;
    ctx.save();
    this.translate(fw, fh).translate(tx, ty);
    try {
      if (image) {
        ctx.scale(dpr() * scale, dpr() * scale);
        ctx.translate(x / scale, y / scale);
        // canvasを回転する
        const TO_RADIANS = Math.PI / 180;
        ctx.rotate(rotate * TO_RADIANS);
        ctx.drawImage(
          image,
          -image.naturalWidth / 2,
          -image.naturalHeight / 2,
        );
        ctx.restore();
      }
    } catch (error) {
      console.log(error);
      console.log(image, _image);
    }
    ctx.restore();
  }

  imageHandler(imageSelector, fw, fh, tx, ty) {
    if (!imageSelector.selectedImage) {
      return;
    }
    const { ctx } = this;
    ctx.save();
    this.translate(fw, fh).translate(tx, ty);
    const { x, y, rotate, scale, image } = imageSelector.selectedImage.image;
    if (!image) {
      return;
    }
    const { naturalWidth, naturalHeight } = image;

    ctx.scale(dpr(), dpr());

    const dhx = naturalHeight / 2 * Math.cos(rotate * Math.PI / 180) * scale;
    const dhy = naturalHeight / 2 * Math.sin(rotate * Math.PI / 180) * scale;
    const dwx = naturalWidth / 2 * Math.cos(rotate * Math.PI / 180) * scale;
    const dwy = naturalWidth / 2 * Math.sin(rotate * Math.PI / 180) * scale;
    const lt = {
      x: x + dhy - dwx,
      y: y - dhx - dwy,
    };
    const rt = {
      x: x + dhy + dwx,
      y: y - dhx + dwy,
    };
    const rb = {
      x: x - dhy + dwx,
      y: y + dhx + dwy,
    };
    const lb = {
      x: x - dhy - dwx,
      y: y + dhx - dwy,
    };

    const radius = 4 * dpr();
    const strokeColor = 'rgba(255, 0, 0, .65)';

    if (imageSelector.debug) {
      // ｘ’＝ｘcosθ-ysinθ
      // ｙ’＝ｘsinθ+ycosθ
      const { tx, ty } = imageSelector.transformPoint(
        imageSelector.lastMousePosition.x,
        imageSelector.lastMousePosition.y,
        imageSelector.selectedImage.image,
      );

      ctx.beginPath();
      ctx.arc(imageSelector.lastMousePosition.x, imageSelector.lastMousePosition.y, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0, 255, 0, .65)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0, 0, 255, .65)';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + naturalWidth, y);
      ctx.lineTo(x + naturalWidth, y + naturalHeight);
      ctx.lineTo(x, y + naturalHeight);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 255, 0, .65)';
      ctx.stroke();
    }

    // center
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // rotate handle
    ctx.beginPath();
    ctx.arc(x + dhy * 1.2, y - dhx * 1.2, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dhy * 1.2, y - dhx * 1.2);
    ctx.stroke();

    // lefttop
    ctx.beginPath();
    ctx.arc(lt.x, lt.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // righttop
    ctx.beginPath();
    ctx.arc(rt.x, rt.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // rightbottom
    ctx.beginPath();
    ctx.arc(lb.x, lb.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // leftbottom
    ctx.beginPath();
    ctx.arc(rb.x, rb.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // border
    ctx.beginPath();
    ctx.moveTo(lt.x, lt.y);
    ctx.lineTo(rt.x, rt.y);
    ctx.lineTo(rb.x, rb.y);
    ctx.lineTo(lb.x, lb.y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 0, 0, .65)';
    ctx.stroke();
    ctx.restore();
  }
}

export default {};
export {
  Draw,
  DrawBox,
  thinLineWidth,
  npx,
};
