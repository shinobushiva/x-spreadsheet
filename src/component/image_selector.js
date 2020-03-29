export default class ImageSelector {
  constructor(table, draw) {
    this.table = table;
    this.draw = draw;
    this.selectedImage = undefined;
    this.lastMousePosition = { x: 0, y: 0 };
    this.rotHandleHold = false;

    // For debugging
    this.debug = false;
  }

  transformPoint(cx, cy, targetImage) {
    // eslint-disable-next-line object-curly-newline
    const { x, y, rotate, scale, image } = targetImage;
    const ax = (cx - x) / scale;
    const ay = (cy - y) / scale;
    const ccx = (ax * Math.cos(-rotate * Math.PI / 180)
      - ay * Math.sin(-rotate * Math.PI / 180))
      + x
      + image.naturalWidth / 2;
    const ccy = ax * Math.sin(-rotate * Math.PI / 180)
      + ay * Math.cos(-rotate * Math.PI / 180)
      + y
      + image.naturalHeight / 2;
    return { tx: ccx, ty: ccy };
  }

  // eslint-disable-next-line no-unused-vars
  mouseup(cx, cy) {
    this.mouseDown = false;
    this.rotHandleHold = false;
    this.scaleHandleHold = false;
  }

  mousemove(cx, cy) {
    this.lastMousePosition = { x: cx, y: cy };
    if (this.rotHandleHold) {
      const { x, y } = this.selectedImage.image;
      const rad = Math.atan2(cy - y, cx - x);
      this.selectedImage.image.rotate = rad / (Math.PI / 180) + 90;
      return;
    }
    if (this.scaleHandleHold) {
      const { x, y, image } = this.selectedImage.image;
      const { naturalWidth, naturalHeight } = image;
      const orgSqrDist = ((naturalWidth / 2) ** 2) + ((naturalHeight / 2) ** 2);
      const distSqr = ((cx - x) ** 2) + ((cy - y) ** 2);
      this.selectedImage.image.scale = Math.sqrt(distSqr / orgSqrDist);
      return;
    }
    const si = this.selectedImage;
    if (si && this.mouseDown) {
      si.image.x = cx - si.point.x;
      si.image.y = cy - si.point.y;
    }
  }

  mousedown(cx, cy, images) {
    this.lastMousePosition = { x: cx, y: cy };
    if (!images) {
      return;
    }
    this.mouseDown = true;
    let hit;
    // eslint-disable-next-line no-restricted-syntax
    for (const image of images) {
      hit = this.hit(cx, cy, image);
      if (hit) {
        this.selectedImage = hit;
        break;
      }
    }
    if (!hit) {
      this.selectedImage = undefined;
    }
  }

  keydown(sheet, evt) {
    if (!this.selectedImage) {
      return false;
    }
    // const keyCode = evt.keyCode || evt.which;
    const {
      key, // ctrlKey, shiftKey, metaKey,
    } = evt;
    if (key === 'Delete' || key === 'Backspace') {
      const idx = sheet.data.images.findIndex(img => img === this.selectedImage.image);
      sheet.data.images.splice(idx, 1);
      this.selectedImage = undefined;
      evt.preventDefault();
      return true;
    }
    return false;
  }

  hit(cx, cy, targetImage) {
    const { x, y, scale, image } = targetImage;
    if (!image) return;
    const { naturalWidth, naturalHeight } = image;

    const { tx, ty } = this.transformPoint(cx, cy, targetImage);

    if (this.selectedImage) {
      {
        const rotHandle = {
          x: x + (naturalWidth / 2),
          y: y + (naturalHeight / 2) - (naturalHeight / 2) * 1.2,
        };
        const sqdist = ((rotHandle.x - tx) ** 2) + ((rotHandle.y - ty) ** 2);
        if (sqdist <= (4 / scale * this.draw.dpr()) ** 2) {
          this.rotHandleHold = true;
          return this.selectedImage;
        }
      }

      const scaleHandles = [
        { x, y },
        { x: x + naturalWidth, y },
        { x: x + naturalWidth, y: y + naturalHeight },
        { x, y: y + naturalHeight },
      ];
      // eslint-disable-next-line no-restricted-syntax
      for (const h of scaleHandles) {
        const sqdist = ((h.x - tx) ** 2) + ((h.y - ty) ** 2);
        if (sqdist <= (4 / scale * this.draw.dpr()) ** 2) {
          this.scaleHandleHold = true;
          return this.selectedImage;
        }
      }
    }

    if (tx >= x
      && tx <= x + naturalWidth
      && ty >= y
      && ty <= y + naturalHeight) {
      // eslint-disable-next-line consistent-return
      return {
        point: {
          x: cx - targetImage.x,
          y: cy - targetImage.y,
        },
        image: targetImage,
      };
    }

    return undefined;
  }
}
