function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
  return this;
};

Point.prototype.add = function(pt) {
  this.x += pt.x;
  this.y += pt.y
  return this;
};

Point.prototype.toString = function() {
  return this.x + "," + this.y;
};

Point.prototype.m = function() {
  return "m" + this.x + "," + this.y;
};

p = function(x, y) {
  return new Point(x, y);
};

pp = function(r, deg) {
  return new Point(r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180));
};

function Char(name, kana, model, headType, tailType, color, bold, offset, right) {
  this.name           = name
  this.model          = model;
  this.kana           = kana;
  this.paths          = [];
  this.pathsExtra     = [];
  this.pos            = [];
  this.pdp            = p(0, 0);
  this.dp             = p(0, 0);
  this.offset         = offset || p(1, 0);
  this.right          = right || 0;
  this.headType       = headType;
  this.tailType       = tailType;
  this.prev           = null;
  this.next           = null;
  this.color          = color;
  this.thickness      = 0.3543307 * 1.2 * (bold ? 1.8 : 1);
  this.thicknessExtra = this.thickness;
  this.description    = "";
  this.speedFactor    = 1.0;
  this.timingFunction = "linear";
}

Char.dict = {};
Char.connectChars = function(chars) {
  for (var i = 1; i < chars.length; i++) {
    chars[i - 1].next = chars[i];
    chars[i].prev = chars[i - 1];
  }
  for (var i = 0; i < 2; i++) {
    chars.forEach(function(c) {
      c.setPaths();
      c.setPathsExtra();
    });
  }
};
Char.createElements = function(chars, pos) {
  if (!pos) pos = {x: 5, y: 10, left: 5, right: 5, bottom: 10, row: 10}

  if (chars.length > 0) {
    pos.x += chars[0].offset.x;
    pos.y += chars[0].offset.y;
  }

  Char.connectChars(chars);

  const groups = document.createDocumentFragment();

  for (var i = 0, j = 0; i < chars.length; i++) {
    const c = chars[i];
    groups.append(c.createElement(pos));
    if (["CharNewline", "CharSpace", "CharFullWidthSpace"].includes(c.name) || i + 1 == chars.length) {
      do {
        const cx = chars[j];
        if (cx.pathsExtra.length > 0) {
          groups.append(cx.createElementExtra());
        }
      } while (++j <= i);
    }
  }

  return groups;
};
Char.prototype.getPaths = function() { return this.paths; };
Char.prototype.updatePenPos = function(pos) {
  pos.x += this.dp.x + this.pdp.x;
  pos.y += this.dp.y + this.pdp.y;
};
Char.prototype.getNextHeadType  = function() { return this.next ? this.next.headType : ""; };
Char.prototype.getPrevTailType  = function() { return this.prev ? this.prev.tailType : ""; };
Char.prototype.getNextModel     = function() { return this.next ? this.next.model : ""; };
Char.prototype.getNextHeadModel = function() { return this.next ? this.next.model.replace(/(\D+\d*).*/, "$1") : ""; };
Char.prototype.getPrevModel     = function() { return this.prev ? this.prev.model : ""; };
Char.prototype.getPrevTailModel = function() { return this.prev ? this.prev.model.replace(/.*?(\D+\d*)$/, "$1") : ""; };
Char.prototype.getNextName      = function() { return this.next ? this.next.name : ""; };
Char.prototype.getPrevName      = function() { return this.prev ? this.prev.name : ""; };
Char.prototype.getNextOffset    = function() { return this.next ? this.next.offset : p(1, 0); };
Char.prototype.getPrevOffset    = function() { return this.prev ? this.prev.offset : p(1, 0); };
Char.prototype.createElement    = function(pos) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const style = "stroke-width:" + this.thickness + ";" + "stroke:" + this.color + ";";
  const transform = "translate(" + (this.pdp.x + pos.x) + " " + (this.pdp.y + pos.y) + ")";
  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  const me = this;
  title.textContent = me.name;

  g.appendChild(title);
  g.setAttribute("style", style);
  g.setAttribute("transform", transform); 

  this.pos.x = pos.x;
  this.pos.y = pos.y;
  pos.right  = pos.right  < pos.x + this.right ? pos.x + this.right : pos.right;
  pos.bottom = pos.bottom < pos.y ? pos.y : pos.bottom;

  this.paths.forEach(function(d) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("data-char", me.name);
    path.setAttribute("data-head", me.headType);
    path.setAttribute("data-tail", me.tailType);
    path.setAttribute("data-kana", me.kana);
    path.setAttribute("data-model", me.model);
    path.setAttribute("data-key", "");
    path.setAttribute("data-speed-factor", me.speedFactor);
    g.appendChild(path);
  });
  this.updatePenPos(pos);
  return g;
};
Char.prototype.createElementExtra = function() {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const style = "stroke-width:" + this.thicknessExtra + ";" + "stroke:" + this.color + ";";
  const transform = "translate(" + this.pos.x + " " + this.pos.y + ")";
  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = this.name;

  g.appendChild(title);
  g.setAttribute("style", style);
  g.setAttribute("transform", transform); 

  this.pathsExtra.forEach(function(d) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    g.appendChild(path);
  });
  return g;
};
Char.prototype.setPaths      = function() {};
Char.prototype.setPathsExtra = function() {};

CharSpace = function() { Char.call(this, "CharSpace", "空白", "", "", "", "black"); };
CharSpace.prototype = Object.create(Char.prototype);
CharSpace.prototype.setPaths = function() {};
CharSpace.prototype.updatePenPos = function(pos) {
  //pos.x += 1;
  //pos.x = pos.right + 1;
  //pos.y  = pos.row;
  const nextName = this.getNextName();
  const prevName = this.getPrevName();
  const offset = this.getNextOffset();
  pos.x = pos.right + offset.x + (((prevName === "CharSpace") || (prevName === "CharNewline")) ? 1 : 5);
  pos.y = pos.row + offset.y;
};
Char.dict["\u0020"] = CharSpace;

CharFullWidthSpace = function() { Char.call(this, "CharFullWidthSpace", "空白", "", "", "", "black"); };
CharFullWidthSpace.prototype = Object.create(Char.prototype);
CharFullWidthSpace.prototype.setPaths = function() {};
CharFullWidthSpace.prototype.updatePenPos = function(pos) {
  //pos.x += 5;
  pos.x = pos.right + 5;
  pos.y = pos.row;
};
Char.dict["\u3040"] = CharFullWidthSpace;

CharUp = function(mm) {
  Char.call(this, "CharUp", "上", "", "", "", "black", false, p(0, 0));
  this.mm = mm;
};
CharUp.prototype = Object.create(Char.prototype);
CharUp.prototype.setPaths = function() { this.dp = this.mm ? p(0, -this.mm) : p(0, -1); };
Char.dict["↑"] = CharUp;

CharDown = function(mm) {
  Char.call(this, "CharDown", "下", "", "", "", "black", false, p(0, 0));
  this.mm = mm;
};
CharDown.prototype = Object.create(Char.prototype);
CharDown.prototype.setPaths = function() { this.dp = this.mm ? p(0, this.mm) : p(0, 1); };
Char.dict["↓"] = CharDown;

CharLeft = function(mm) {
  Char.call(this, "CharLeft", "左", "", "", "", "black", false, p(0, 0));
  this.mm = mm;
};
CharLeft.prototype = Object.create(Char.prototype);
CharLeft.prototype.setPaths = function() { this.dp = this.mm ? p(-this.mm, 0) : p(1, 0); };
Char.dict["←"] = CharLeft;

CharRight = function(mm) {
  Char.call(this, "CharRight", "右", "", "", "", "black", false, p(0, 0));
  this.mm = mm;
};
CharRight.prototype = Object.create(Char.prototype);
CharRight.prototype.setPaths = function() { this.dp = this.mm ? p(this.mm, 0) : p(1, 0); };
Char.dict["→"] = CharRight;


CharNewline = function() {Char.call(this, "CharNewline", "改行", "", "", "", "black"); };
CharNewline.prototype = Object.create(Char.prototype);
CharNewline.prototype.setPaths = function() { this.dp = p(5, 5); };
Char.dict["\n"] = CharNewline;

CharNewline.prototype.updatePenPos = function(pos) {
  const offset = this.getNextOffset();
  pos.x   = pos.left + offset.x;
  //pos.y   = pos.row + this.dp.y;
  pos.row = pos.bottom + this.dp.y;
  pos.y   = pos.row + offset.y;
  pos.right = pos.left;
};

CharNewpage = function() {Char.call(this, "CharNewpage", "改頁", "", "", "", "black"); };
CharNewpage.prototype = Object.create(Char.prototype);
CharNewpage.prototype.setPaths = function() {};
Char.dict["newline"] = CharNewpage;

CharNewpage.prototype.updatePenPos = function(pos) {
  const offset = this.getNextOffset();
  pos.left  = 5;
  pos.x     = pos.left + offset.x;
  pos.y     = Math.ceil(pos.y / 297) * 297 + 10;
  pos.row   = pos.bottom = pos.y + 5;
  pos.right = pos.left;
};

CharDottedLine = function() { Char.call(this, "CharDottedLine", "点線", "E8", "E", "E", "black"); };
CharDottedLine.prototype = Object.create(Char.prototype);
Char.dict["…"] = CharDottedLine;
CharDottedLine.prototype.setPaths = function() {
  this.dp = p(8, 0);
  this.paths = [
    "m0,0h1.2",
    "m2.3,0h1.2",
    "m4.5,0h1.2",
    "m6.8,0h1.2"
  ];
};

CharTofu = function(inputText) { Char.call(this, "CharTofu", "豆腐", "", "", "", "black"); };
CharTofu.prototype = Object.create(Char.prototype);

CharTofu.prototype.setPaths = function() {
  this.dp = p(6, 0);
  this.paths = ["m 1,2 h 4 v -4 h -4 v 4 l 4 -4 m -4,0 l 4,4"];
};

CharText = function(inputText) {
  Char.call(this, "CharText", "文字列", "", "", "", "black");
  this.inputText = inputText;
};

CharText.prototype = Object.create(Char.prototype);
CharText.prototype.createElement = function(pos) {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "text");
  var style = "fill: black;"
            + "stroke-width: 0;"
            + "font-family: sans-serif;"
            + "font-size: 5;"
            + "font-weight: lighter;"
            + "white-space: pre";
  p.setAttribute("style", style);
  p.setAttribute("x", pos.x);
  p.setAttribute("y", pos.y + 2.5);
  p.textContent = this.inputText;
  this.updatePenPos(pos);
  return p;
};

CharText.prototype.updatePenPos = function(pos) {
  pos.x += 5 * this.inputText.length;
};

CharPoint = function() { Char.call(this, "CharPoint", "点", "P", "P", "P", "black", false, p(0.0, -0.1)); };
CharPoint.prototype = Object.create(Char.prototype);
Char.dict["・"] = CharPoint;

CharPoint.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "":
      this.dp = p(0, 0.1);
      this.paths = ["m 0 0 v 0.1"];
      return;
  }

  this.dp = p(0, 0);
  this.paths = [];
};



WasedaChar = function(name, kana, model, headType, tailType, color) { Char.apply(this, arguments); };
WasedaChar.prototype = Object.create(Char.prototype);
WasedaChar.dict = {};

WasedaA = function() { WasedaChar.call(this, "WasedaA", "あ", "EL4", "EL", "EL", "black", false, p(0.0, -0.2)); };
WasedaA.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あ"] = WasedaA;

WasedaA.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "XNE":
    case "ER4":
      this.dp = p(4, 0);
      this.paths = ["m 0,0 c 1.04821,0.5574 2.97476,0.5919 4,0"];
      return;

    case "ER8":
      this.dp = p(4, 0);
      this.paths = ["m 0,0 c 1.0298,0.5475 2.9223,0.4575 4,0"];
      return;

    case "ER16":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.02161 0.5432 2.89547 0.3589 4 0"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "E":
    case "NEL":
      this.dp = p(3.99995, 0);
      this.paths = ["m 0 0 c 1.4551 0.7737 4.4424 1.65126 3.99995 0"];
      return;

    case "WL":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.0195 0.5421 2.8872 0.3191 4 0"];
      return;

    case "SW":
    case "SEL":
      this.dp = p(4, 0);
      this.paths = ["m 0,0 c 1.04821,0.5574 2.97476,0.5919 4,0"];
      return;
  }

  this.dp = p(4, 0);
  this.paths = ["m 0 0c 1.45511 0.773700000000002 3.78509 1.2188 4 0"];
};

WasedaI = function() { WasedaChar.call(this, "WasedaI", "い", "ER4", "ER", "ER4", "black", false, p(0.0, 0.4)); };
WasedaI.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["い"] = WasedaI;

WasedaI.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) { }

  switch (_headModel) {
    case "EL4":
      this.dp = p(4, 0);
      this.paths = ["m 0,0 c 1.0252,-0.5919 2.9518,-0.5573 4,0"];
      return;

    case "EL16":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.57891 -0.9116 3.10827 -0.205825 4 0"];
      return;

    case "EL8":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.00556 -0.5805 2.88958 -0.3608 4 0"];
      return;
  }

  switch (_head) {
    case "E":
    case "NEL":
    case "SER":
    case "SR":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.41 -0.8141 4.60079 -1.88614 4 0"];
      return;

    case "SE":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.48076 -1.79421 4 0"];
      return;

    case "SW":
      this.dp = p(4, 0);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.71182 -1.95571 4 0"];
      return;

  }

  this.dp = p(4, 0);
  this.paths = ["m 0,0 c 1.57891,-0.9116 4.00001,-1.2364 4,0"];
};

WasedaKa = function() { WasedaChar.call(this, "WasedaKa", "か", "E8", "E", "E", "black", false, p(0, 0)); };
WasedaKa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["か"] = WasedaKa;

WasedaKa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E": 
    case "SER":
      this.dp = p(7.59761, 0.282788);
      this.paths = ["m 0 0 h 8.00001 l -0.4024 0.282788"];
      break;

    default:
      this.dp = p(8, 0);
      this.paths = ["m 0 0 l 8 0"];
      break;
  }
};

WasedaGa = function() { WasedaChar.call(this, "WasedaGa", "が", "E8", "E", "E", "black", false, p(0, 0)); };
WasedaGa.prototype = Object.create(WasedaKa.prototype);
WasedaChar.dict["が"] = WasedaGa;
WasedaGa.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.5,1v0.1"];
};

WasedaKaa = function() { WasedaChar.call(this, "WasedaKaa", "かあ", "E8", "E", "E", "black"); };
WasedaKaa.prototype = Object.create(WasedaKa.prototype);
WasedaChar.dict["かあ"] = WasedaKaa;
WasedaChar.dict["かー"] = WasedaKaa;
WasedaKaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.2192449,1.555608 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};


WasedaNa = function() { WasedaChar.call(this, "WasedaNa", "な", "EL8", "EL", "EL", "black"); };
WasedaNa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["な"] = WasedaNa;

WasedaNa.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "ER4":
      this.dp = p(8, 0);
      this.paths = ["m 0 0c 2.665 0.8659 5.5867 1.3934 8 0"];
      break;

    case "ER8":
      this.dp = p(8, 0);
      this.paths = ["m 0 0c 2.6214 0.851800000000001 5.465 1.0761 8 0"];
      break;

    case "ER16":
      this.dp = p(8.0001, 0);
      this.paths = ["m 0 0 c 2.5998 0.845 5.4003 0.845 8.0001 0"];
      break;

    case "UWL4":
      this.dp = p(8.00001, 0);
      this.paths = ["m 0 0 c 1.52541 0.4956 5.35892 1.39161 8.00001 0"];
      break;
    
    default:
      this.dp = p(8, 0);
      this.paths = ["m 0 0c 2.04073 0.6631 7.67821 1.825 8 0"];
      break;
  }

  switch (this.getNextHeadType()) {
    //case "E":
    //  this.dp = p(8, 0);
    //  this.paths = ["m 0 0 c 2.1847 0.7099 8.49877 1.86144 8 0"];
    //  break;

    case "E":
    case "NEL":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 2.1847 0.7099 8.64983 2.42522 8 0"];
      break;
  }
};


WasedaTa = function() { WasedaChar.call(this, "WasedaTa", "た", "SW8", "SW", "SW", "black", false, p(2.9, -3.3)); };
WasedaTa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["た"] = WasedaTa;
WasedaTa.prototype.getFilteredPrevTailType = function() {
  var tail = this.getPrevTailType();
  if (this.getPrevModel() == "ER16SWR4") {
    return tail;
  }
  return tail.replace(/^(?:SWR|SW|SR|S|SER|SWRCR|SCR|SWCR|TAHENKI)$/, "R");
};
WasedaTa.prototype.reverse = function() {
  this.model = "NE8";
  this.headType = "NE";
  this.tailType = "NE";
};
WasedaTa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  switch (model_) {
    case "SER4CR1":
      this.dp = p(6.63226, -4.4736);
      this.paths = ["m 0 0l 6.63226 -4.4736"];
      this.reverse();
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
      this.dp = p(6.63226, -4.4736);
      this.paths = ["m 0 0l 6.63226 -4.4736"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
      this.dp = p(-2.48616, 7.0846);
      this.paths = ["m 0 0l -2.73616 7.5176l 0.25 -0.433"];
      return;
  }

  this.dp = p(-2.73616, 7.5176);
  this.paths = ["m 0 0l -2.73616 7.5176"];
};

WasedaTa.prototype.toReverse = function() {
  return /^(SWR|SW|SR|S|SER|SWRCR|SCR|SWCR|TAHENKI)$/.test(this.getPrevTailType());
};

WasedaTaa = function() { WasedaChar.call(this, "WasedaTa", "たあ", "SW8", "SW", "SW", "black", false, p(2.9, -3.3)); };
WasedaTaa.prototype = Object.create(WasedaTa.prototype);
WasedaChar.dict["たあ"] = WasedaTaa;
WasedaChar.dict["たー"] = WasedaTaa;
WasedaTaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -3.194426,1.748868 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaSa = function() { WasedaChar.call(this, "WasedaSa", "さ", "NEL8", "NEL", "NEL", "black", false, p(0.0, 2.5)); };
WasedaSa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["さ"] = WasedaSa;
WasedaSa.prototype.filterReverseTail = function(tail) { return tail.replace(/^(NELCL4|ECL4|ECL|E|NE)$/, "R"); };
WasedaSa.prototype.getFilteredPrevTailType = function() {
  return this.getPrevTailType().replace(/^(?:ELCL4|NELCL4|ECL4|SERCL4|ECL|NE|NEP|E|SEL4|EP|ECL4P|NECLP|NELCL8|ELONL)$/, "R");
};
WasedaSa.prototype.reverse = function() {
  this.headType = this.tailType = "SWR";
  this.model = "SWR8";
}
WasedaSa.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaWa":
      this.dp = p(5.6479, -5.0854);
      this.paths = ["m 0 0 c 2.01675 0 5.6479 -2.7837 5.6479 -5.0854"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "R_NE":
      this.dp = p(-3.55714, 7.06752);
      this.paths = ["m 0 0 c 0 3.2179 -3.11162 6.76701 -3.55714 7.06752"];
      this.reverse();
      return;

    case "R_NEL":
      this.dp = p(-2.80001, 6.5818);
      this.paths = ["m 0 0c 0 2.5891 -0.601299999999999 5.3124 -2.80001 6.5818"];
      this.reverse();
      return;

    case "R_ER":
      this.dp = p(-3.8, 6.5818);
      this.paths = ["m 0 0 c 0 3.2179 -3.08981 6.39196 -3.8 6.5818"];
      return;

    case "ER_NER":
      this.dp = p(-1.99739, 7.3214);
      this.paths = ["m 0 0 c 1.30093 2.25326 -1.32898 6.16367 -1.99739 7.3214"];
      this.reverse();
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-3.8, 6.5818);
      this.paths = ["m 0 0 c 0 3.2179 -1.8796 6.5818 -3.8 6.5818"];
      this.reverse();
      return;

    case "ER":
      this.dp = p(-3.8, 6.5818);
      this.paths = ["m 0 0 c 1.30093 2.25326 -1.8796 6.5818 -3.8 6.5818"];
      this.reverse();
      return;

    case "NER":
      this.dp = p(-3.8, 6.5818);
      this.paths = ["m 0 0 c 1.99117 1.99117 -1.8796 6.5818 -3.8 6.5818"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  switch (_model) {
      case "SW4":
      case "UWL4":
        this.dp = p(5.6479, -5.0854);
        this.paths = ["m 0 0 c 2.0164 -1.1641 4.50785 -3.11078 5.6479 -5.0854"];
        return;
  }


  switch (_head) {
    case "SL":
      this.dp = p(5.6479, -5.0854);
      this.paths = ["m 0 0 c 1.28214 -0.740262 3.83739 -1.94951 5.6479 -5.0854"];
      return;

    case "E":
    case "ER":
    case "NEL":
      this.dp = p(5.6479, -5.0854);
      this.paths = ["m 0 0 c 1.8711 -1.0803 6.6855 -3.2882 5.6479 -5.0854"];
      return;

    case "SW":
      this.dp = p(5.6479, -5.0854);
      this.paths = ["m 0 0 c 2.01641 -1.1642 4.84257 -2.87276 5.6479 -5.0854"];
      return;
  }

  this.dp = p(5.6479, -5.0854);
  this.paths = ["m 0 0c 2.01641 -1.1642 5.6479 -2.7837 5.6479 -5.0854"];
};

WasedaSa.prototype.toReverse = function() {
  return (this.getPrevModel() != "ER4") && /^(ECL|E|ER|NE|NER)$/.test(this.getPrevTailType());
};

WasedaSaa = function() { WasedaChar.call(this, "WasedaSaa", "さあ", "NEL8", "NEL", "NEL", "black", false, p(0.0, 2.5)); };
WasedaSaa.prototype = Object.create(WasedaSa.prototype);
WasedaChar.dict["さあ"] = WasedaSaa;
WasedaChar.dict["さー"] = WasedaSaa;
WasedaSaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 2.401228,-3.927299 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaMa = function() { WasedaChar.call(this, "WasedaMa", "ま", "ER8", "ER", "ER", "black"); };
WasedaMa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ま"] = WasedaMa;

WasedaMa.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "EL4":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 1.7244 -0.7319 6.3524 -0.876 8 0"];
      return;

    case "EL8":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 3.04662 -1.29321 5.3976 -0.845528 8 0"];
      return;

    case "EL16":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 1.6813 -0.7137 4.98672 -0.773829 8 0"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "SE":
    case "E":
    case "SER":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 3.1159 -1.322 9.4622 -2.088 8 0"];
      break;

    case "SWR":
      this.dp = p(8.00001, 0);
      this.paths = ["m 0 0 c 2.52091 -1.07 6.66667 -2.3094 8.00001 0"];
      return;

    case "SW":
     this.dp = p(8.00001, 0);
     this.paths = ["m 0 0 c 2.52091 -1.07 8.5526 -2.06231 8.00001 0"];
     return;

    default:
      this.dp = p(8.00001, 0);
      this.paths = ["m 0 0c 2.52091 -1.07 8.00001 -2.0823 8.00001 0"];
      break;
  }
};

WasedaU = function() { WasedaChar.call(this, "WasedaU", "う", "S4", "S", "S", "black", false, p(0.0, -2.0)); };
WasedaU.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["う"] = WasedaU;

WasedaU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "S":
    case "SEL":
    //case "EL":
      this.dp = p(0.2, 3.5076);
      this.paths = ["m 0 0l 0 4l 0.2 -0.4924"];
      break;

     case "SW":
      this.dp = p(0, 4);
      this.paths = ["m 0 0 c 0.01249 1.35832 -0.369724 3.50766 0 4"];
      break;

    default:
      this.dp = p(0, 4);
      this.paths = ["m 0 0l 0 4"];
      break;
  }
};

WasedaE = function() { WasedaChar.call(this, "WasedaE", "え", "SE4", "SE", "SE", "black", false, p(0.0, -1.4)); };
WasedaE.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["え"] = WasedaE;

WasedaE.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "SE":
    case "EL":
      this.dp = p(2.41885, 2.5417);
      this.paths = ["m 0 0l 2.82843 2.8284l -0.40958 -0.2867"];
      break;

    default:
      this.dp = p(2.82843, 2.8284);
      this.paths = ["m 0 0l 2.82843 2.8284"];
      break;
  }
};

WasedaO = function() { WasedaChar.call(this, "WasedaO", "お", "SW4", "SW", "SW", "black", false, p(1.4, -1.9)); };
WasedaO.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["お"] = WasedaO;

WasedaO.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    //case "WasedaRi":
    case "WasedaRu":
      this.dp = p(-2.82843, 2.82843);
      this.paths = ["m 0 0 l -2.82843 2.82843"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "_SL":
    case "_SEL":
      this.dp = p(-3.06418, 2.57115);
      this.paths = ["m 0 0 c 0 0 -2.33408 2.37552 -3.06418 2.57115"];
      return;
  }

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(-0.968894, 3.43238);
      this.paths = ["m 0 0 l -1.3681 3.7588 l 0.399206 -0.326424"];
      return;

    case "SEL":
      this.dp = p(-1.84232, 3.60228);
      this.paths = ["m 0 0 c -0.715507 1.96595 -1.08857 3.40031 -1.84232 3.60228"];
      return;
  }

  this.dp = p(-1.3681, 3.7587);
  this.paths = ["m 0 0l -1.3681 3.7587"];
};

WasedaPointAru = function() { 
  WasedaChar.call(this, "WasedaPointAru", "加点ある", "P", "P", "P", "black");
  this.thickness = 0.7;
};
WasedaPointAru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あるｐ"] = WasedaPointAru;

WasedaPointAru.prototype.setPaths = function() {

  switch (this.getPrevTailType()) {

    default:
      this.dp = p(2, 0);
      this.paths = ["m2 0 0 0"];
      break;
  }

  if (this.getNextHeadType() !== "") {
    this.paths = [];
  }
};

WasedaKai = function() { WasedaChar.call(this, "WasedaKai", "かい", "E4", "E", "E", "black"); };
WasedaKai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["かい"] = WasedaKai;

WasedaKai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E": 
      this.dp = p(3.5076, 0.3);
      this.paths = ["m 0 0 l 4 0 l -0.4024 0.3"];
      break;

    default:
      this.dp = p(4, 0);
      this.paths = ["m 0 0 4 0"];
      break;
  }
};

WasedaNihon = function() { WasedaChar.call(this, "WasedaNihon", "にほん", "E4,E4", "E", "E", "black"); };
WasedaNihon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["にほん"] = WasedaNihon;

WasedaNihon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E": 
      this.dp = p(3.5076, 2.3);
      this.paths = ["m 0,0 4,0", "m 0,2 4,0 -0.4024,0.3"];
      break;

    default:
      this.dp = p(4, 2);
      this.paths = ["m 0,0 4,0", "m 0,2 4,0"];
      break;
  }
};


NakaneChar = function(name, kana, model, headType, tailType, color, bold, offset) { Char.apply(this, arguments); };
NakaneChar.prototype = Object.create(Char.prototype);
NakaneChar.dict = {};

NakaneA = function() { NakaneChar.call(this, "NakaneA", "あ", "NEL7", "NEL", "NEL", "black", false, p(0.0, 1.7)); };
NakaneA.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["あ"] = NakaneA;

NakaneA.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.167382,-3.309328);
      this.paths = ["m 0,0 c 2.382943,0 4.889984,-1.096809 6.167382,-3.309328"];
      break;
  }
};

NakaneKa = function() { NakaneChar.call(this, "NakaneKa", "か", "E7", "E", "E", "black", false, p(0.0, 0.0)); };
NakaneKa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["か"] = NakaneKa;

NakaneKa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m0,0h7"];
      break;
  }
};

NakaneKa.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "E":
      this.pathsExtra = ["m 7,-1 0,2"];
      break;

    default:
      break;
  }
};


NakaneGa = function() { NakaneChar.call(this, "NakaneGa", "が", "E7", "E", "E", "black", true); };
NakaneGa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["が"] = NakaneGa;
NakaneGa.prototype.setPaths = NakaneKa.prototype.setPaths;
NakaneGa.prototype.setPathsExtra = NakaneKa.prototype.setPathsExtra;



SvsdChar = function(name, kana, model, headType, tailType, color) {
  Char.apply(this, arguments);
  this.posKoto   = pp(2, 45);
  this.posNode   = p(2, 0);
  this.posWakede = p(0, -2);
  this.posMono   = pp(2, 135);
};
SvsdChar.prototype = Object.create(Char.prototype);
SvsdChar.dict = {};

SvsdA = function() { SvsdChar.call(this, "SvsdA", "あ", "NE10", "NE", "NE", "black", false, p(0, 2.5)); };
SvsdA.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["あ"] = SvsdA;

SvsdA.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, -5);
      this.paths = ["m 0,0 8.66025,-5"];
      break;
  }
};

ShugiinChar = function(name, kana, model, headType, tailType, color) { Char.apply(this, arguments); };
ShugiinChar.prototype = Object.create(Char.prototype);
ShugiinChar.dict = {};

ShugiinA = function() { ShugiinChar.call(this, "ShugiinA", "あ", "EL3", "EL", "EL", "black"); };
ShugiinA.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["あ"] = ShugiinA;
ShugiinChar.dict["ある"] = ShugiinA;
ShugiinChar.dict["R"] = ShugiinA;
ShugiinChar.dict["r"] = ShugiinA;
ShugiinChar.dict["Ｒ"] = ShugiinA;
ShugiinChar.dict["ｒ"] = ShugiinA;

ShugiinA.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3, 0);
      this.paths = ["m 0,0 c 0.7856029,1.084656 2.3420729,1.035708 3,0"];
      break;
  }
};

ShugiinAn = function() { ShugiinChar.call(this, "ShugiinAn", "あん", "EL3F", "EL", "ELF", "black"); };
ShugiinAn.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["あん"] = ShugiinAn;

ShugiinAn.prototype.setPaths = function() {
  this.paths = ["m 0,0 c 0.7856029,1.084656 2.3420729,1.035708 3,0"];

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(3 + 3, 0 + 0.5);
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3+1.3, 0-0.7);
      break;
  }
};

ShugiinKa = function() { ShugiinChar.call(this, "ShugiinKa", "か", "E7", "E", "E", "black", false, p(0, 0)); };
ShugiinKa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["か"] = ShugiinKa;
ShugiinChar.dict["が"] = ShugiinKa;

ShugiinKa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E":
      this.dp = p(7, 0.5);
      this.paths = ["m 0 0l 7 0 0 0.5"];
      break;

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0l 7 0"];
      break;
  }
};

ShugiinKan = function() { ShugiinChar.call(this, "ShugiinKan", "かん", "E7F", "E", "EF", "black", false, p(0, 0)); };
ShugiinKan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["かん"] = ShugiinKan;

ShugiinKan.prototype.setPaths = function() {
  this.paths = ["m 0 0l 7 0"];
  this.dp = p(7 + 2, 0);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "ShugiinIn":
      this.dp = p(7 + 2, 1);
      return;
  }

  //switch (_model) {}

  //switch (_head) {}
};

ShugiinGan = function() { ShugiinChar.call(this, "ShugiinGan", "がん", "E7F", "E", "EF", "black", false, p(0, 0)); };
ShugiinGan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["がん"] = ShugiinGan;

ShugiinGan.prototype.setPaths = function() {
  this.paths = ["m 0 0l 7 0"];

  switch (this.getNextName()) {
    case "ShugiinO":
    case "ShugiinWo":
      this.dp = p(7 - 0, -3);
      return;

    case "ShugiinWa":
      this.dp = p(7 - 0, -3);
      return;

    case "ShugiinHar":
      this.dp = p(7.5 - 0, -3);
      return;
  }

  switch (this.getNextHeadType()) {
    case "S":
    case "SEL":
      this.dp = p(7 + 2, -2);
      break;

    case "SE":
      this.dp = p(7 - 1, -2.5);
      break;

    default:
      this.dp = p(7 - 1, -2);
      break;
  }
};

WasedaKi = function() { WasedaChar.call(this, "WasedaKi", "き", "E8CL1", "E", "ECL", "black"); };
WasedaKi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["き"] = WasedaKi;
WasedaChar.dict["君"] = WasedaKi;

WasedaKi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(6.8, 0);
     this.paths = ["m 0 0 h 7.5 c 0.58408 0 0.140431 -0.845 -0.424609 -0.9192 c -0.46945 -0.0617 -1.18963 0.9192 -0.275391 0.9192"];
     return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "EL16":
      this.dp = p(7.81731, -0.133887);
      this.paths = ["m 0 0 c 2.4983 -0.131 5.0044 -0.1745 7.5 0 c 0.2576 0.0135 0.4426 -0.2257 0.495 -0.495 c 0.241 -1.1339 -1.6417 -0.7453 -1.0399 -0.0769 c 0.229 0.2456 0.515808 0.358058 0.86221 0.438013"];
      return;

    case "EL8":
      this.dp = p(7.84507, -0.165008);
      this.paths = ["m 0 0 c 2.4983 -0.131 5.0044 -0.1745 7.5 0 c 0.2576 0.0135 0.4426 -0.2257 0.495 -0.495 c 0.241 -1.1339 -1.6417 -0.7453 -1.0399 -0.0769 c 0.229 0.2456 0.50176 0.280748 0.889974 0.406892"];
      return;

    case "ER4":
      this.dp = p(7.93837, -0.567344);
      this.paths = ["m 0 0 h 7.5 c 0.58408 0 0.131582 -1.45449 -0.60489 -1.19026 c -0.482752 0.1732 -0.646954 0.767602 -0.468136 1.00292 c 0.216324 0.284677 1.03113 -0.10272 1.5114 -0.380008"];
      return;

    case "EL4":
      this.dp = p(7.80371, -0.120257);
      this.paths = ["m 0 0 c 2.4983 -0.131 5.0044 -0.1745 7.5 0 c 0.2576 0.0135 0.4426 -0.2257 0.495 -0.495 c 0.241 -1.1339 -1.61747 -0.850302 -1.01567 -0.181903 c 0.229 0.2456 0.503333 0.385944 0.824375 0.556646"];
      return;

    case "ER8":
      this.dp = p(8.2482, -0.363);
      this.paths = ["m 0 0 c 2.6674 0 5.3362 -0.1396 8.0002 0 c 0.446 0.0078 0.461 -1.1763 -0.476 -1.1763 c -0.403 0 -0.702 0.3953 -0.552 0.7017 c 0.206 0.4228 0.788 0.3391 1.276 0.1116"];
      return;

    case "ER16":
      this.dp = p(8.27177, -0.49129);
      this.paths = ["m 0 0 c 2.667 0 5.336 -0.139 8 0 c 0.446 0.008 0.461 -1.176 -0.475 -1.176 c -0.404 0 -0.68217 0.41373 -0.55762 0.67871 c 0.18496 0.3935 0.81739 0.16354 1.30439 0.006"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(7.5, -0);
      this.paths = ["m 0 0 h 7.5 c 0.574732 0 0.471236 -0.830049 0.037754 -1.08032 c -0.377426 -0.217907 -1.27396 -0.166828 -1.27396 0.29401 c 0 0.342023 0.584811 0.330195 1.2362 0.78631"];
      return;

    case "SER16":
      this.dp = p(7.77932, -0.09569);
      this.paths = ["m 0 0 c 2.49828 -0.131 5.00439 -0.175 7.50001 0 c 0.25741 0.013 0.499389 -0.2617 0.49497 -0.495 c -0.00558 -0.29484 -0.355773 -0.56817 -0.648782 -0.60144 c -0.250878 -0.0285 -0.657048 0.1248 -0.656819 0.37729 c 0.000379 0.41855 0.77458 0.44146 1.08994 0.62346"];
      return;

    case "SWR4":
    case "SWR8":
    case "SWR16":
      this.dp = p(6.8, 0);
      this.paths = ["m 0 0 h 7.5 c 0.565401 0 0.28981 -0.594014 0.136334 -0.827777 c -0.14898 -0.226915 -0.572172 -0.360131 -0.789907 -0.198029 c -0.274553 0.204402 -0.046427 0.587999 -0.046427 1.02581"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(8.19346, -0.11825);
      this.paths = ["m 0 0 c 2.82603 -0.1481 5.33402 -0.0931 8.00001 0 c 0.36049 0.0126 0.390319 -0.966503 -0.391581 -0.966503 c -0.72857 0 -0.962131 0.922981 -0.598449 0.869403 c 0.305588 0.002287 0.850517 -0.03855 1.18348 -0.02115"];
      return;

    case "SW":
      this.dp = p(6.8, -0);
      this.paths = ["m 0 0 h 7.5 c 0.53582 0 0.666746 -0.743176 0.454977 -1.07903 c -0.231582 -0.367271 -0.672243 -0.247284 -0.799584 0.102585 c -0.118437 0.325406 -0.218884 0.613096 -0.355393 0.976442"];
      return;

    case "SEL":
      this.dp = p(7.1897, -0.0156);
      this.paths = ["m 0 0 c 2.4983 -0.1309 5.0044 -0.1745 7.5 0 c 0.2567 0.0135 0.4381 -0.2273 0.495 -0.4949 c 0.1591 -0.689 -0.5687 -0.8506 -0.6661 -0.5109 c -0.0924 0.322 -0.1392 0.6553 -0.1392 0.9902"];
      return;

    case "S":
      this.dp = p(6.8, 0);
      this.paths = ["m 0 0 h 7.5 c 0.407467 0 0.283251 -0.447164 0.192383 -0.656213 c -0.110495 -0.254199 -0.497258 -0.501418 -0.743035 -0.373278 c -0.307475 0.160307 -0.149348 0.545765 -0.149348 1.02949"];
      return;

    case "SE":
      this.dp = p(6.8, 0);
      this.paths = ["m 0 0 h 7.5 c 0.600392 0 0.223735 -0.627554 0.032189 -0.825307 c -0.255097 -0.263362 -0.901921 -0.300777 -1.09993 0.007812 c -0.161365 0.251481 0.03599 0.485749 0.36774 0.817495"];
      return;
  }

  this.dp = p(6.8, 0);
  this.paths = ["m 0 0 h 7.5 c 0.58408 0 0.751748 -0.94754 0.186707 -1.02174 c -0.46945 -0.0617 -0.6985 0.652087 -0.886707 1.02174"];
};

ShugiinSa = function() { ShugiinChar.call(this, "ShugiinSa", "さ", "SR7", "SR", "SR", "black", false, p(0.4, -3.5)); };
ShugiinSa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さ"] = ShugiinSa;
ShugiinChar.dict["ざ"] = ShugiinSa;

ShugiinSa.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {
    case "SE":
      this.dp = p(-0.357092, 6.96894);
      this.paths = ["m 0 0 c 2.37837 0 1.3803 4.85472 -0.357092 6.96894"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(-0.357092, 6.96894);
      this.paths = ["m 0 0 c 1.86555 2.33801 1.15834 7.68836 -0.357092 6.96894"];
      break;

    default:
      this.dp = p(-0.357092, 6.9689422);
      this.paths = ["m 0 0c 1.865545 2.3380102 1.380297 4.8547172 -0.357092 6.9689422"];
      break;
  }
};

ShugiinSan = function() { ShugiinChar.call(this, "ShugiinSan", "さん", "SR7F", "SR", "SRF", "black", false, p(0.4, -3.5)); };
ShugiinSan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さん"] = ShugiinSan;

ShugiinSan.prototype.setPaths = function() {
  this.paths = ["m 0 0c 1.865545 2.3380102 1.380297 4.8547172 -0.357092 6.9689422"];
  this.dp = p(-0.357092, 6.9689422 + 2);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "ShugiinIn":
      this.dp = p(-0.357092 + 2, 6.9689422);
      return;

  }

  //switch (_model) {}

  switch (_head) {
    case "NER":
      this.dp = p(-0.357092 + 2, 6.9689422);
      return;
  }
};

ShugiinZan = function() { ShugiinChar.call(this, "ShugiinZan", "ざん", "SR7F", "SR", "SRF", "black", false, p(0.4, -3.5)); };
ShugiinZan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["ざん"] = ShugiinZan;

ShugiinZan.prototype.setPaths = function() {
  this.paths = ["m 0 0c 1.865545 2.3380102 1.380297 4.8547172 -0.357092 6.9689422"];

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(-0.357092 + 3.5, 6.9689422 - 1);
      return;
  }

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(-0.357092 + 2.5, 6.9689422 - 1.41);
      break;
  }
};

ShugiinTa = function() { ShugiinChar.call(this, "ShugiinTa", "た", "S7", "S", "S", "black", false, p(0.0, -3.5)); };
ShugiinTa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["た"] = ShugiinTa;
ShugiinChar.dict["だ"] = ShugiinTa;

ShugiinTa.prototype.setPaths = function() {
  switch (this.getNextModel()) {
    case "UWR3ER7":
      this.dp = p(1, 7.4);
      this.paths = ["m 0,0 0,7.0"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "S":
    case "SEL":
      this.dp = p(0.5, 7);
      this.paths = ["m 0,0 0,7.0 0.5,0"];
      break;

    default:
      this.dp = p(0, 7);
      this.paths = ["m 0,0 0,7.0"];
      break;
  }
};

ShugiinTan = function() { ShugiinChar.call(this, "ShugiinTan", "たん", "S7F", "S", "SF", "black", false, p(0.0, -3.5)); };
ShugiinTan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["たん"] = ShugiinTan;

ShugiinTan.prototype.setPaths = function() {
  this.paths = ["m 0,0 0,7.0"];

  //switch (this.getNextModel()) {
  //  case "UWR3ER7":
  //    this.dp = p(1, 7.4);
  //    return;
  //}

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(0, 9);
      break;
  }
};

ShugiinDan = function() { ShugiinChar.call(this, "ShugiinDan", "だん", "S7F", "S", "SF", "black", false, p(0.0, -3.5)); };
ShugiinDan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["だん"] = ShugiinDan;

ShugiinDan.prototype.setPaths = function() {
  this.paths = ["m 0,0 0,7.0"];
  this.dp = p(0 + 1.5, 7 - 2);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "ShugiinWa":
      this.dp = p(0 + 3.5, 7 - 1);
      return;

    case "ShugiinI":
      this.dp = p(0 + 2, 6);
      return;

    case "ShugiinO":
    case "ShugiinWo":
      this.dp = p(0 + 2, 7 - 1);
      return;

    case "ShugiinIn":
      this.dp = p(0 + 1.5, 7 - 1);
      return;
  }

  //switch (_model) {}

  //switch (_head) {}
};

ShugiinNa = function() { ShugiinChar.call(this, "ShugiinNa", "な", "EL7", "EL", "EL", "black", false, p(0.0, -0.5)); };
ShugiinNa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["な"] = ShugiinNa;

ShugiinNa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "NE":
      this.dp = p(7, 0);
      this.paths = ["m 0 0 c 1.78641 1.18957 7.74202 1.28521 7 0"];
      break;

    case "NEL":
      this.dp = p(7, 0);
      this.paths = ["m 0 0 c 1.78641 1.18957 6.61364 1.44193 7 0"];
      break;

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.786412 1.189574 4.533101 1.425728 7 0"];
      break;
  }
};

ShugiinNan = function() { ShugiinChar.call(this, "ShugiinNan", "なん", "EL7F", "EL", "ELF", "black"); };
ShugiinNan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なん"] = ShugiinNan;

ShugiinNan.prototype.setPaths = function() {
  this.paths = ["m 0 0c 1.786412 1.189574 4.533101 1.425728 7 0"];

  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(7 + 1.5, 0);
      break;

    default:
      this.dp = p(7 + 1.41, -1.41);
      break;
  }
};

ShugiinHa = function() { ShugiinChar.call(this, "ShugiinHa", "は", "SEL7", "SEL", "SEL", "black", false, p(0.2, -2.7)); };
ShugiinHa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["は"] = ShugiinHa;
ShugiinChar.dict["ば"] = ShugiinHa;
ShugiinChar.dict["ぱ"] = ShugiinHa;

ShugiinHa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.53396, 5.32792);
      this.paths = ["m 0 0c -0.83754 2.7196949 1.486433 5.6089279 4.533958 5.3279249"];
      break;
  }
};

ShugiinHan = function() { ShugiinChar.call(this, "ShugiinHan", "はん", "SEL7F", "SEL", "SEL7", "black", false, p(0.2, -2.7)); };
ShugiinHan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["はん"] = ShugiinHan;
ShugiinChar.dict["ぱん"] = ShugiinHan;

ShugiinHan.prototype.setPaths = function() {
  this.paths = ["m 0 0c -0.83754 2.7196949 1.486433 5.6089279 4.533958 5.3279249"];

  switch (this.getNextModel()) {
    case "UWL3":
      this.dp = p(4.53396 + 1, 5.32792 + 1.5);
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.53396 + 2, 5.32792);
      break;
  }
};

ShugiinBan = function() { ShugiinChar.call(this, "ShugiinBan", "ばん", "SEL7F", "SEL", "SEL7", "black", false, p(0.2, -2.7)); };
ShugiinBan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["ばん"] = ShugiinBan;

ShugiinBan.prototype.setPaths = function() {
  this.paths = ["m 0 0c -0.83754 2.7196949 1.486433 5.6089279 4.533958 5.3279249"];

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(4.53396, 5.32792 - 3);
      return;

    case "ShugiinO":
    case "ShugiinWo":
      this.dp = p(4.53396 + 1, 5.32792 - 3);
      return;
  }

  switch (this.getNextHeadType()) {
    case "S":
    case "SEL":
      this.dp = p(4.53396 + 1.41, 5.32792 - 1.41);
      break;

    case "SE":
      this.dp = p(4.53396 - 1, 5.32792 - 3);
      break;

    default:
      this.dp = p(4.53396 - 1, 5.32792 - 1.5);
      break;
  }
};

ShugiinMa = function() { ShugiinChar.call(this, "ShugiinMa", "ま", "ER7", "ER", "ER", "black"); };
ShugiinMa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["ま"] = ShugiinMa;

ShugiinMa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "SR":
    case "SE":
      this.dp = p(7, 0);
      this.paths = ["m 0,0 c 1.661847,-2.001066 7.5567301,-1.6027563 7,0"];
      break;

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.661847 -2.001066 5.296682 -2.489993 7 0"];
      break;
  }
};

ShugiinMan = function() { ShugiinChar.call(this, "ShugiinMan", "まん", "ER7F", "ER", "ERF", "black"); };
ShugiinMan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["まん"] = ShugiinMan;

ShugiinMan.prototype.setPaths = function() {
  this.paths = ["m 0 0c 1.661847 -2.001066 5.296682 -2.489993 7 0"];
  this.dp = p(7 + 1.41, 0 + 1.41);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "ShugiinIn":
      this.dp = p(7 + 1.1, 0 + 1.1);
      return;
  }

  //switch (_model) {}

  //switch (_head) {}


};

ShugiinYa = function() { ShugiinChar.call(this, "ShugiinYa", "や", "NER7", "NER", "NER", "black", false, p(0.0, 2.4)); };
ShugiinYa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["や"] = ShugiinYa;

ShugiinYa.prototype.setPaths = function() {
  switch (this.getPrevModel()) {
    case "UWL3":
    case "SW3":
      this.dp = p(6.453801,-4.762448);
      this.paths = ["m 0,0 c 1.783505,-2.585641 4.020085,-4.658954 6.453801,-4.762448"];
      return; 
  }

  switch (this.getPrevTailType()) {
    case "SR":
      this.dp = p(5.0699, -4.83282);
      this.paths = ["m 0,0 c 1.783505,-2.585641 4.020085,-4.658954 6.453801,-4.762448"];
      return; 
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.0699, -4.83282);
      this.paths = ["m 0 0c -0.12547 -3.161679 2.287875 -5.1937337 5.069899 -4.832816"];
      break;
  }
};

ShugiinYan = function() { ShugiinChar.call(this, "ShugiinYan", "やん", "NER7F", "NER", "NERF", "black", false, p(0.0, 2.4)); };
ShugiinYan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["やん"] = ShugiinYan;

ShugiinYan.prototype.setPaths = function() {
  switch (this.getPrevModel()) {
    case "UWL3":
      this.dp = p(6.453801 + 2, -4.762448);
      this.paths = ["m 0,0 c 1.783505,-2.585641 4.020085,-4.658954 6.453801,-4.762448"];
      return; 
  }

  switch (this.getPrevTailType()) {
    case "SR":
      this.dp = p(5.0699 + 2, -4.83282);
      this.paths = ["m 0,0 c 1.783505,-2.585641 4.020085,-4.658954 6.453801,-4.762448"];
      return; 
  }

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(5.0699 + 3, -4.83282 + 1);
      this.paths = ["m 0 0c -0.12547 -3.161679 2.287875 -5.1937337 5.069899 -4.832816"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.0699 + 2, -4.83282);
      this.paths = ["m 0 0c -0.12547 -3.161679 2.287875 -5.1937337 5.069899 -4.832816"];
      break;
  }
};

ShugiinRa = function() { ShugiinChar.call(this, "ShugiinRa", "ら", "SER7", "SER", "SER", "black", false, p(0.0, -2.4)); };
ShugiinRa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["ら"] = ShugiinRa;

ShugiinRa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "S":
      this.dp = p(5.0699 + 0.5, 4.83282);
      this.paths = ["m 0 0c 2.782024 -0.360919 5.195369 1.671137 5.069899 4.832816 h0.5"];
      break;

    default:
      this.dp = p(5.0699, 4.83282);
      this.paths = ["m 0 0c 2.782024 -0.360919 5.195369 1.671137 5.069899 4.832816"];
      break;
  }
};

ShugiinRan = function() { ShugiinChar.call(this, "ShugiinRan", "らん", "SER7F", "SER", "SERF", "black", false, p(0.0, -2.4)); };
ShugiinRan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["らん"] = ShugiinRan;

ShugiinRan.prototype.setPaths = function() {
  this.paths = ["m 0 0c 2.782024 -0.360919 5.195369 1.671137 5.069899 4.832816"];

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(5.0699, 4.83282 + 2);
      break;
  }
};

ShugiinWa = function() { ShugiinChar.call(this, "ShugiinWa", "わ", "UWL3", "WL", "EL", "black", false, p(2.3, -0.8)); };
ShugiinWa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["わ"] = ShugiinWa;
ShugiinChar.dict["わｒ"] = ShugiinWa;
ShugiinChar.dict["わＲ"] = ShugiinWa;
ShugiinChar.dict["わかる"] = ShugiinWa;

ShugiinWa.prototype.setPaths = function() {
  switch (this.getPrevModel()) {
    case "SE2":
    case "UWL3":
      this.dp = p(0.3234, 2.55847);
      this.paths = ["m 0 0 c -0.939676 0 -2.00377 1.31535 -1.71961 2.19124 c 0.249345 0.768581 1.43474 1.05742 2.04301 0.367225"];
      return;

    case "NEL3":
      this.dp = p(1.32824, 2.90299);
      this.paths = ["m 0 0 c 0 0 -1.18529 2.12349 -0.646301 3.02336 c 0.33883 0.56569 1.36627 0.476693 1.97454 -0.120372"];
      return;
  }

  switch (this.getPrevTailType()) {
    case "E":
    case "SEL":
    case "NER":
      switch (this.getNextHeadType()) {
        case "NE":
          this.dp = p(0.171177, 2.14515);
          this.paths = ["m 0 0 c -1.41399 0 -2.04518 0.594028 -2.26136 1.32939 c -0.459904 1.56441 2.47301 2.31718 2.43254 0.815765"];
          return;

        default:
          this.dp = p(-0.112137, 2.14516);
          this.paths = ["m 0 0 c -1.41399 0 -2.31491 0.564783 -2.26136 1.32939 c 0.088303 1.26088 1.62107 1.31255 2.14923 0.815765"];
          return;
      }
    case "EL":
    case "NEL":
      this.dp = p(0.3234, 2.55847);
      this.paths = ["m 0 0c -0.79061 0.681958 -2.19013 1.778974 -1.65114 2.678842c 0.33883 0.56569 1.36627 0.476693 1.97454 -0.120372"];
      return;

    case "ECL1":
      this.dp = p(1.32824, 2.90299);
      this.paths = ["m 0 0 c 0 0 -1.18529 2.12349 -0.646301 3.02336 c 0.33883 0.56569 1.36627 0.476693 1.97454 -0.120372"];
      return;

    case "SRCR1":
      this.dp = p(0.3234, 2.55847);
      this.paths = ["m 0 0 c -0.939676 0 -2.00377 1.31535 -1.71961 2.19124 c 0.249345 0.768581 1.43474 1.05742 2.04301 0.367225"];
      return;
  }
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.141189, 1.63153);
      this.paths = ["m 0 0c -0.849758 -0.958061 -2.373777 -0.252475 -2.290416 0.815765c 0.11455 1.467918 1.621072 1.312545 2.149227 0.815765"];
      break;
  }
};

ShugiinWan = function() { ShugiinChar.call(this, "ShugiinWan", "わん", "UWL3F", "WL", "ELF", "black", false, p(2.3, -0.8)); };
ShugiinWan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["わん"] = ShugiinWan;

ShugiinWan.prototype.setPaths = function() {
  switch (this.getPrevModel()) {
    case "UWL3":
      this.dp = p(0.3234 + 1.41, 2.55847 - 0.5);
      this.paths = ["m 0 0 c -0.939676 0 -2.00377 1.31535 -1.71961 2.19124 c 0.249345 0.768581 1.43474 1.05742 2.04301 0.367225"];
      return;
  }

  switch (this.getPrevTailType()) {
    case "E":
    case "SEL":
    case "NER":
      switch (this.getNextHeadType()) {
        case "NE":
          this.dp = p(0.171177 + 1.41, 2.14515 - 0.5);
          this.paths = ["m 0 0 c -1.41399 0 -2.04518 0.594028 -2.26136 1.32939 c -0.459904 1.56441 2.47301 2.31718 2.43254 0.815765"];
          return;

        default:
          this.dp = p(-0.112137 + 1.41, 2.14516 - 0.5);
          this.paths = ["m 0 0 c -1.41399 0 -2.31491 0.564783 -2.26136 1.32939 c 0.088303 1.26088 1.62107 1.31255 2.14923 0.815765"];
          return;
      }
    case "EL":
      this.dp = p(0.3234 + 1.41, 2.55847 - 0.5);
      this.paths = ["m 0 0c -0.79061 0.681958 -2.19013 1.778974 -1.65114 2.678842c 0.33883 0.56569 1.36627 0.476693 1.97454 -0.120372"];
      return;
  }
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.141189 + 1.41, 1.63153 - 0.5);
      this.paths = ["m 0 0c -0.849758 -0.958061 -2.373777 -0.252475 -2.290416 0.815765c 0.11455 1.467918 1.621072 1.312545 2.149227 0.815765"];
      break;
  }
};


NakaneI = function() { NakaneChar.call(this, "NakaneI", "い", "NER7", "NER", "NER", "black", false, p(0.0, 2.1)); };
NakaneI.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["い"] = NakaneI;

NakaneI.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.52541, -4.2968);
      this.paths = ["m 0 0c 1.249775 -2.164673 4.090949 -4.2968 5.525411 -4.2968"];
      break;
  }
};

NakaneU = function() { NakaneChar.call(this, "NakaneU", "う", "NEL17,P", "NEL", "NEL", "black", false ,p(0.0, 4.1)); };
NakaneU.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["う"] = NakaneU;

NakaneU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.9235, -8.1401);
      this.paths = ["m 0 0c 4.266161 0 12.513341 -3.965562 14.923511 -8.140102"];
      break;
  }
};

NakaneU.prototype.setPathsExtra = function() {
    this.pathsExtra = ["m 8.5,-4.0 v0.1"];
};

NakaneE = function() { NakaneChar.call(this, "NakaneE", "え", "NER17", "NER", "NER", "black", false, p(0.0, 4.8)); };
NakaneE.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["え"] = NakaneE;

NakaneE.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.0344, -9.59827);
      this.paths = ["m 0 0c 2.77984 -4.814825 10.48553 -9.598268 14.03444 -9.598268"];
      break;
  }
};

NakaneO = function() { NakaneChar.call(this, "NakaneO", "お", "NEL17", "NEL", "NEL", "black", false, p(0.0, 4.9)); };
NakaneO.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["お"] = NakaneO;

NakaneO.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.9523, -9.71262);
      this.paths = ["m 0 0c 5.42463 -1.453523 10.772 -4.20423 13.95227 -9.712621"];
      break;
  }
};

NakaneKi = function() { NakaneChar.call(this, "NakaneKi", "き", "SW7", "SW", "SW", "black", false, p(3.5, -3.0)); };
NakaneKi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["き"] = NakaneKi;

NakaneKi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-3.502234, 6.06604);
      this.paths = ["m 0 0l -3.502234 6.06604"];
      break;
  }
};

NakaneKi.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "SW":
      this.pathsExtra = ["m -4.2, 6.06604 l 0.949553 0.54822"];
      break;

    default:
      break;
  }
};

NakaneGi = function() { NakaneChar.call(this, "NakaneGi", "ぎ", "SW7", "SW", "SW", "black", true, p(6, -3.5)); };
NakaneGi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぎ"] = NakaneGi;
NakaneGi.prototype.setPaths = NakaneKi.prototype.setPaths
NakaneGi.prototype.setPathsExtra = NakaneKi.prototype.setPathsExtra 

NakaneKu = function() { NakaneChar.call(this, "NakaneKu", "く", "S7", "S", "S", "black", true, p(3, -3.5)); };
NakaneKu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["く"] = NakaneKu;

NakaneKu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 7);
      this.paths = ["m0,0 v7"];
      break;
  }
};

NakaneGu = function() { NakaneChar.call(this, "NakaneGu", "ぐ", "S7", "S", "S", "black", true, p(3, -3.5)); };
NakaneGu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぐ"] = NakaneGu;
NakaneGu.prototype.setPaths = NakaneKu.prototype.setPaths;
NakaneGu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.5,3.5 v0.1"]; }

NakaneKe = function() { NakaneChar.call(this, "NakaneKe", "け", "SW17", "SW", "SW", "black", false, p(8.5, -7.4)); };
NakaneKe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["け"] = NakaneKe;

NakaneKe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-8.5, 14.7224);
      this.paths = ["m 0 0l -8.5 14.7224"];
      break;
  }
};

NakaneKe.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "SW":
      this.pathsExtra = ["m -9.2, 14.7224 l 0.949553 0.54822"];
      break;

    default:
      break;
  }
};

NakaneGe = function() { NakaneChar.call(this, "NakaneGe", "げ", "SW17", "SW", "SW", "black", true, p(11, -6)); };
NakaneGe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["げ"] = NakaneGe;
NakaneGe.prototype.setPaths = NakaneKe.prototype.setPaths;

NakaneKo = function() { NakaneChar.call(this, "NakaneKo", "こ", "E17", "E", "E", "black"); };
NakaneKo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["こ"] = NakaneKo;

NakaneKo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0 h17"];
      break;
  }
};

NakaneGo = function() { NakaneChar.call(this, "NakaneGo", "ご", "E17", "E", "E", "black", true); };
NakaneGo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ご"] = NakaneGo;
NakaneGo.prototype.setPaths = NakaneKo.prototype.setPaths;

NakaneKo.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "E":
      this.pathsExtra = ["m 17 -0.75 v1.5"];
      break;

    default:
      break;
  }
};

NakaneSa = function() { NakaneChar.call(this, "NakaneSa", "さ", "SER7", "SER", "SER", "black", false, p(0.0, -1.7)); };
NakaneSa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["さ"] = NakaneSa;

NakaneSa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.05971, 3.49858);
      this.paths = ["m 0 0c 2.577952 0 5.627576 1.88584 6.059707 3.49858"];
      break;
  }
};

NakaneZa = function() { NakaneChar.call(this, "NakaneZa", "ざ", "SER7", "SER", "SER", "black", true, p(0.0, -1.7)); };
NakaneZa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ざ"] = NakaneZa;
NakaneZa.prototype.setPaths = NakaneSa.prototype.setPaths;

NakaneShi = function() { NakaneChar.call(this, "NakaneShi", "し", "SEL7", "SEL", "SEL", "black", false, p(0.0, -1.8)); };
NakaneShi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["し"] = NakaneShi;

NakaneShi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.06029, 3.49871);
      this.paths = ["m 0 0c 0.471737 1.06103 3.891974 3.84098 6.060287 3.49871"];
      //this.dp = p(5.44066, 4.40083);
      //this.paths = ["m 0 0c 0.300535 1.12161 3.245501 4.40083 5.440661 4.40083"];
      break;
  }
};

NakaneZi = function() { NakaneChar.call(this, "NakaneZi", "じ", "SEL7", "SEL", "SEL", "black", true, p(0.0, -1.8)); };
NakaneZi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["じ"] = NakaneZi;
NakaneChar.dict["ぢ"] = NakaneZi;
NakaneZi.prototype.setPaths = NakaneShi.prototype.setPaths;

NakaneSu = function() { NakaneChar.call(this, "NakaneSu", "す", "SER17,P", "SER", "SER", "black", false, p(0.0, -4.3)); };
NakaneSu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["す"] = NakaneSu;

NakaneSu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7241, 8.50165);
      this.paths = ["m 0 0c 5.728549 0 12.899335 5.34101 14.724135 8.50165"];
      break;
  }
};

NakaneSu.prototype.setPathsExtra = function() {
  
  switch (this.getPrevName()) {
    case "NakaneSu":
    case "NakaneMu":
      this.pathsExtra = [];
      return; 
  }

  switch (this.getNextName()) {
    case "NakaneSu":
      if (this.next && this.next.next) {
        const name = this.next.next.name;
        if (name == "NakaneMu") {
          this.pathsExtra = ["m 23,9 v0.1"];
        } else {
          this.pathsExtra = ["m 14.7241,6 v0.1"];
        }
      } else {
        this.pathsExtra = ["m 12,8.50165 v0.1"];
      }
      break;

    case "NakaneRu":
      this.pathsExtra = ["m 12,8.50165 v0.1"];
      break;

    default:
      this.pathsExtra = ["m 7,4 v0.1"];
      break;
  }
};


NakaneSe = function() { NakaneChar.call(this, "NakaneSe", "せ", "SEL17", "SEL", "SEL", "black", false, p(0.0, -4.3)); };
NakaneSe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["せ"] = NakaneSe;

NakaneSe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7251, 8.5);
      this.paths = ["m 0 0c 4.38343 4.51145 10.86376 8.67331 14.72513 8.5"];
      break;
  }
};

NakaneZe = function() { NakaneChar.call(this, "NakaneZe", "ぜ", "SEL7", "SEL", "SEL", "black", true, p(0.0, -4.3)); };
NakaneZe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぜ"] = NakaneZe;
NakaneZe.prototype.setPaths = NakaneSe.prototype.setPaths;

NakaneSo = function() { NakaneChar.call(this, "NakaneSo", "そ", "SER17", "SER", "SER", "black", false, p(0.0, -4.3)); };
NakaneSo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["そ"] = NakaneSo;

NakaneSo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7252, 8.50215);
      this.paths = ["m 0 0c 7.22081 1.6256 12.44847 4.8403 14.72515 8.50215"];
      break;
  }
};

NakaneZo = function() { NakaneChar.call(this, "NakaneZo", "ぞ", "SER17", "SER", "SER", "black", true, p(0.0, -4.3)); };
NakaneZo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぞ"] = NakaneZo;
NakaneZo.prototype.setPaths = NakaneSo.prototype.setPaths;

NakaneTa = function() { NakaneChar.call(this, "NakaneTa", "た", "SE7", "SE", "SE", "black", false, p(0.0, -1.8)); };
NakaneTa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["た"] = NakaneTa;

NakaneTa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.06218, 3.5);
      this.paths = ["m 0 0l 6.06218 3.5"];
      break;
  }
};

NakaneDa = function() { NakaneChar.call(this, "NakaneDa", "だ", "SE7", "SE", "SE", "black", true, p(0.0, -1.8)); };
NakaneDa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["だ"] = NakaneDa;
NakaneDa.prototype.setPaths = NakaneTa.prototype.setPaths;

NakaneChi = function() { NakaneChar.call(this, "NakaneChi", "ち", "S7", "S", "S", "black", false, p(0.0, -3.5)); };
NakaneChi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ち"] = NakaneChi;

NakaneChi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 7);
      this.paths = ["m 0 0l 0 7"];
      break;
  }
};

NakaneTsu = function() { NakaneChar.call(this, "NakaneTsu", "つ", "NE17", "NE", "NE", "black", false, p(0.0, 4.2)); };
NakaneTsu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["つ"] = NakaneTsu;

NakaneTsu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7224, -8.5);
      this.paths = ["m 0 0l 14.7224 -8.5"];
      break;
  }
};

NakaneDu = function() { NakaneChar.call(this, "NakaneDu", "づ", "NE17", "NE", "NE", "black", true, p(0.0, 4.2)); };
NakaneDu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["づ"] = NakaneDu;
NakaneChar.dict["ず"] = NakaneDu;
NakaneDu.prototype.setPaths = NakaneTsu.prototype.setPaths;

NakaneTe = function() { NakaneChar.call(this, "NakaneTe", "て", "S17", "S", "S", "black", false, p(0.0, -8.5)); };
NakaneTe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["て"] = NakaneTe;

NakaneTe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 17);
      this.paths = ["m 0 0l 0 17"];
      break;
  }
};

NakaneDe = function() { NakaneChar.call(this, "NakaneDe", "で", "S17", "S", "S", "black", true, p(0.0, -8.5)); };
NakaneDe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["で"] = NakaneDe;
NakaneDe.prototype.setPaths = NakaneTe.prototype.setPaths;

NakaneTo = function() { NakaneChar.call(this, "NakaneTo", "と", "SE17", "SE", "SE", "black", false, p(0.0, -4.2)); };
NakaneTo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["と"] = NakaneTo;

NakaneTo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7224, 8.5);
      this.paths = ["m 0 0l 14.7224 8.5"];
      break;
  }
};

NakaneDo = function() { NakaneChar.call(this, "NakaneDo", "ど", "SE17", "SE", "SE", "black", true, p(0.0, -4.2)); };
NakaneDo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ど"] = NakaneDo;
NakaneDo.prototype.setPaths = NakaneTo.prototype.setPaths;

NakaneNa = function() { NakaneChar.call(this, "NakaneNa", "な", "EL7", "EL", "EL", "black", false, p(0.0, -0.6)); };
NakaneNa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["な"] = NakaneNa;

NakaneNa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.83861 1.60059 5.898 1.33884 7 0"];
      break;
  }
};

NakaneNi = function() { NakaneChar.call(this, "NakaneNi", "に", "EL7", "EL", "EL", "black", true, p(0.0, -0.6)); };
NakaneNi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["に"] = NakaneNi;

NakaneNi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.83861 1.60059 5.898 1.33884 7 0"];
      break;
  }
};

NakaneNu = function() { NakaneChar.call(this, "NakaneNu", "ぬ", "EL17,P", "EL", "EL", "black", false, p(0.0, -1.2)); };
NakaneNu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぬ"] = NakaneNu;

NakaneNu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.45119 4.16377 13.3 1.92354 17 0"];
      break;
  }
};

NakaneNu.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 8.5,0 v0.1"];
};

NakaneNe = function() { NakaneChar.call(this, "NakaneNe", "ね", "EL17", "EL", "EL", "black", true, p(0.0, -1.2)); };
NakaneNe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ね"] = NakaneNe;

NakaneNe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.45119 4.16377 13.3 1.92354 17 0"];
      break;
  }
};

NakaneNo = function() { NakaneChar.call(this, "NakaneNo", "の", "EL17", "EL", "EL", "black", false, p(0.0, -1.2)); };
NakaneNo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["の"] = NakaneNo;

NakaneNo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.45119 4.16377 13.3 1.92354 17 0"];
      break;
  }
};

NakaneLtsu = function() { NakaneChar.call(this, "NakaneLtsu", "っ", "P/X", "P/X", "P/X", "black"); };
NakaneLtsu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["っ"] = NakaneLtsu;

NakaneLtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "SER17_SW":
      this.dp = p(0, -3.5);
      return;
  }

  //switch (model_) {}

  switch (tail_ + "_" + _name) {
    case "E_NakaneKou":
      this.dp = p(-0.8, -1.4);
      return;
  }

  switch (tail_ + "_" + _model) {
    case "SEL_CR1SW17":
    case "SEL_SW17":
      this.dp = p(-1, -2);
      return;
  }

  switch (tail_ + "_" + _head) {
    case "E_E":
      this.dp = p(-2, 2);
      return;

    case "SR_SR":
      this.dp = p(0, -3);
      return;

    case "SER_SER":
      this.dp = p(-3, -1.8);
      return;
  }

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  
  this.dp = p(5, 0);
};

NakaneHa = function() { NakaneChar.call(this, "NakaneHa", "は", "SR7", "SR", "SR", "black", false, p(0.0, -3.5)); };
NakaneHa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["は"] = NakaneHa;

NakaneHa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 7);
      this.paths = ["m 0 0c 1.22423 2.26167 1.03842 4.78703 0 7"];
      break;
  }
};

NakanePa = function() { NakaneChar.call(this, "NakanePa", "ぱ", "SR7", "SR", "SR", "black", false, p(0.0, -3.5)); };
NakanePa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぱ"] = NakanePa;
NakanePa.prototype.setPaths = NakaneHa.prototype.setPaths;
NakanePa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -0.5,3.5 v0.1"];
};

NakaneBa = function() { NakaneChar.call(this, "NakaneBa", "ば", "SR7", "SR", "SR", "black", true, p(0.0, -3.5)); };
NakaneBa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ば"] = NakaneBa;
NakaneBa.prototype.setPaths = NakaneHa.prototype.setPaths;

NakaneHi = function() { NakaneChar.call(this, "NakaneHi", "ひ", "SL7", "SL", "SL", "black", false, p(0.8, -3.5)); };
NakaneHi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ひ"] = NakaneHi;

NakaneHi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 7);
      this.paths = ["m 0 0c -1.22423 2.26167 -1.03842 4.78703 0 7"];
      break;
  }
};

NakanePi = function() { NakaneChar.call(this, "NakanePi", "ぴ", "SL7", "SL", "SL", "black", false, p(0.8, -3.5)); };
NakanePi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぴ"] = NakanePi;
NakanePi.prototype.setPaths = NakaneHi.prototype.setPaths;
NakanePi.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m-2,3.5 v0.1"];
};

NakaneBi = function() { NakaneChar.call(this, "NakaneBi", "び", "SL7", "SL", "SL", "black", true, p(0.8, -3.5)); };
NakaneBi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["び"] = NakaneBi;
NakaneBi.prototype.setPaths = NakaneHi.prototype.setPaths;

NakaneHu = function() { NakaneChar.call(this, "NakaneHu", "ふ", "NE7", "NE", "NE", "black", false, p(0.0, 2.5)); };
NakaneHu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ふ"] = NakaneHu;

NakaneHu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.94975, -4.94975);
      this.paths = ["m 0 0l 4.94975 -4.94975"];
      break;
  }
};

NakanePu = function() { NakaneChar.call(this, "NakanePu", "ぷ", "NE7", "NE", "NE", "black", false, p(0.0, 2.5)); };
NakanePu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぷ"] = NakanePu;
NakanePu.prototype.setPaths = NakaneHu.prototype.setPaths;
NakanePu.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m2,-3.5 v0.1"];
};

NakaneBu = function() { NakaneChar.call(this, "NakaneBu", "ぶ", "NE7", "NE", "NE", "black", true, p(0.0, 2.5)); };
NakaneBu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぶ"] = NakaneBu;
NakaneBu.prototype.setPaths = NakaneHu.prototype.setPaths;

NakaneHe = function() { NakaneChar.call(this, "NakaneHe", "へ", "SL17", "SL", "SL", "black", false, p(3.1, -8.5)); };
NakaneHe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["へ"] = NakaneHe;

NakaneHe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 17);
      this.paths = ["m 0 0c -3.2163 2.7288 -4.86135 13.7644 0 17"];
      break;
  }
};

NakanePe = function() { NakaneChar.call(this, "NakanePe", "ぺ", "SL17", "SL", "SL", "black", false, p(3.1, -8.5)); };
NakanePe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぺ"] = NakanePe;
NakanePe.prototype.setPaths = NakaneHe.prototype.setPaths;
NakanePe.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -4,8.5 v0.1"];
};


NakaneBe = function() { NakaneChar.call(this, "NakaneBe", "べ", "SL17", "SL", "SL", "black", true, p(3.1, -8.5)); };
NakaneBe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["べ"] = NakaneBe;
NakaneBe.prototype.setPaths = NakaneHe.prototype.setPaths;

NakaneHo = function() { NakaneChar.call(this, "NakaneHo", "ほ", "SR17", "SR", "SR", "black", false, p(0.0, -8.5)); };
NakaneHo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ほ"] = NakaneHo;

NakaneHo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 17);
      this.paths = ["m 0 0c 3.2163 2.7288 4.86135 13.7644 0 17"];
      break;
  }
};

NakanePo = function() { NakaneChar.call(this, "NakanePo", "ぽ", "SR17", "SR", "SR", "black", false, p(0.0, -8.5)); };
NakanePo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぽ"] = NakanePo;
NakanePo.prototype.setPaths = NakaneHo.prototype.setPaths;
NakanePo.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 1,8.5 v0.1"];
};

NakaneBo = function() { NakaneChar.call(this, "NakaneBo", "ぼ", "SR17", "SR", "SR", "black", true, p(0.0, -8.5)); };
NakaneBo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぼ"] = NakaneBo;
NakaneBo.prototype.setPaths = NakaneHo.prototype.setPaths;

NakaneMa = function() { NakaneChar.call(this, "NakaneMa", "ま", "ER7", "ER", "ER", "black", false, p(0.0, 0.6)); };
NakaneMa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ま"] = NakaneMa;

NakaneMa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.83861 -1.60059 5.898 -1.33884 7 0"];
      break;
  }
};

NakaneMi = function() { NakaneChar.call(this, "NakaneMi", "み", "ER7", "ER", "ER", "black", true, p(0.0, 0.6)); };
NakaneMi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["み"] = NakaneMi;

NakaneMi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0c 1.83861 -1.60059 5.898 -1.33884 7 0"];
      break;
  }
};

NakaneMu = function() { NakaneChar.call(this, "NakaneMu", "む", "ER17,P", "ER", "ER", "black", false, p(0.0, 1.2)); };
NakaneMu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["む"] = NakaneMu;

NakaneMu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.451187 -4.16377 13.300002 -1.92354 17.000002 0"];
      break;
  }
};

NakaneMu.prototype.setPathsExtra = function() {
  switch (this.getPrevName()) {
    case "NakaneSu":
      this.pathsExtra = [];
      return;
  }

  switch (this.getNextName()) {
    case "NakaneSu":
      this.pathsExtra = ["m 17,-2 v0.1"];
      break;

    default:
      this.pathsExtra = ["m 8.5,-4 v0.1"];
      break;
  }
};

NakaneMe = function() { NakaneChar.call(this, "NakaneMe", "め", "ER17", "ER", "ER", "black", true, p(0.0, 1.2)); };
NakaneMe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["め"] = NakaneMe;

NakaneMe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.45119 -4.16377 13.3 -1.92354 17 0"];
      break;
  }
};

NakaneMo = function() { NakaneChar.call(this, "NakaneMo", "も", "ER17", "ER", "ER", "black", false, p(0.0, 1.2)); };
NakaneMo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["も"] = NakaneMo;

NakaneMo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17, 0);
      this.paths = ["m 0 0c 5.45119 -4.16377 13.3 -1.92354 17 0"];
      break;
  }
};

NakaneYa = function() { NakaneChar.call(this, "NakaneYa", "や", "SWL7", "SWL", "SWL", "black", false, p(6.1, -1.8)); };
NakaneYa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["や"] = NakaneYa;

NakaneYa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-6.06218, 3.5);
      this.paths = ["m 0 0c -2.20426 0.377368 -4.31077 1.36606 -6.06218 3.5"];
      break;
  }
};

NakaneYu = function() { NakaneChar.call(this, "NakaneYu", "ゆ", "SWL7", "SWL", "SWL", "black", true, p(6.1, -1.8)); };
NakaneYu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ゆ"] = NakaneYu;

NakaneYu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-6.06218, 3.5);
      this.paths = ["m 0 0c -2.20426 0.37737 -4.31077 1.36606 -6.06218 3.5"];
      break;
  }
};

NakaneYo = function() { NakaneChar.call(this, "NakaneYo", "よ", "SWL17", "SWL", "SWL", "black", false, p(14.7, -4.3)); };
NakaneYo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["よ"] = NakaneYo;

NakaneYo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-14.7224, 8.50002);
      this.paths = ["m 0 0c -3.95675 0.825336 -10.8572 3.30792 -14.7224 8.50002"];
      break;
  }
};

NakaneRa = function() { NakaneChar.call(this, "NakaneRa", "ら", "SWR7", "SWR", "SWR", "black", false, p(4.5, -2.7)); };
NakaneRa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ら"] = NakaneRa;

NakaneRa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.49951, 5.36232);
      this.paths = ["m 0 0c -0.37738 2.03117 -2.11106 4.2048 -4.49951 5.36232"];
      break;
  }
};

NakaneRi = function() { NakaneChar.call(this, "NakaneRi", "り", "SWR7", "SWR", "SWR", "black", true, p(4.5, -2.7)); };
NakaneRi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["り"] = NakaneRi;

NakaneRi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.49951, 5.36232);
      this.paths = ["m 0 0c -0.37738 2.03117 -2.11106 4.2048 -4.49951 5.36232"];
      break;
  }
};

NakaneRu = function() { NakaneChar.call(this, "NakaneRu", "る", "SWL17,P", "SWL", "SWL", "black", false, p(13.0, -5.5)); };
NakaneRu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["る"] = NakaneRu;

NakaneRu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-13.0228, 10.9274);
      this.paths = ["m 0 0c -2.26592 4.09699 -5.12905 8.0632 -13.0228 10.9274"];
      break;
  }
};

NakaneRu.prototype.setPathsExtra = function() {
  switch (this.getPrevName()) {
    case "NakaneSu":
      this.pathsExtra = [];
      break;
      
    default:
      this.pathsExtra = ["m -6,4 v0.1"];
      break;
  }
};

NakaneRe = function() { NakaneChar.call(this, "NakaneRe", "れ", "SWL17", "SWL", "SWL", "black", true, p(13.0, -5.5)); };
NakaneRe.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["れ"] = NakaneRe;

NakaneRe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-13.0228, 10.9274);
      this.paths = ["m 0 0c -2.26592 4.09699 -5.12905 8.0632 -13.0228 10.9274"];
      break;
  }
};

NakaneRo = function() { NakaneChar.call(this, "NakaneRo", "ろ", "SWL17", "SWL", "SWL", "black", false, p(13.0, -5.5)); };
NakaneRo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ろ"] = NakaneRo;

NakaneRo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-13.0228, 10.9274);
      this.paths = ["m 0 0c -2.26592 4.09699 -5.12905 8.0632 -13.02281 10.92741"];
      break;
  }
};

NakaneWo = function() { NakaneChar.call(this, "NakaneWo", "を", "URNE3", "NER", "SWR", "black", false, p(0.0, 0.8)); };
NakaneWo.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["を"] = NakaneWo;

NakaneWo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.97397, 0.79149);
      this.paths = ["m 0 0c 0.3434 -0.93209 1.49746 -2.81027 2.23462 -2.36494c 0.73716 0.44533 -0.26065 3.15643 -0.26065 3.15643"];
      break;
  }
};

NakaneWa = function() { NakaneChar.call(this, "NakaneWa", "わ", "SWL17", "SWL", "SWL", "black", true, p(14.7, -4.3)); };
NakaneWa.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["わ"] = NakaneWa;

NakaneWa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-14.7224, 8.50002);
      this.paths = ["m 0 0c -3.95675 0.82534 -10.8572 3.30792 -14.7224 8.50002"];
      break;
  }
};

SvsdI = function() { SvsdChar.call(this, "SvsdI", "い", "SW10", "SW", "SW", "black", false, p(5, -4.33011)); };
SvsdI.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["い"] = SvsdI;

SvsdI.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(-4.29289, 7.95309);
      this.paths = ["m 0 0 l -5 8.66021 l 0.707107 -0.707117"];
      return;
  }

  this.dp = p(-5, 8.66022);
  this.paths = ["m 0 0l -5 8.66022"];
};

SvsdU = function() { SvsdChar.call(this, "SvsdU", "う", "SE10", "SE", "SE", "black", false, p(0, -2.5)); };
SvsdU.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["う"] = SvsdU;

SvsdU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, 5);
      this.paths = ["m 0 0l 8.66025 5"];
      break;
  }
};

SvsdE = function() { SvsdChar.call(this, "SvsdE", "え", "S10", "S", "S", "black", false, p(0, -5)); };
SvsdE.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["え"] = SvsdE;

SvsdE.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 10);
      this.paths = ["m 0 0l 0 10"];
      break;
  }
};

SvsdO = function() { SvsdChar.call(this, "SvsdO", "お", "E10", "E", "E", "black", false, p(0, 0.0)); };
SvsdO.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["お"] = SvsdO;

SvsdO.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "E":
      this.dp = p(9.05199, 0.194069);
      this.paths = ["m 0 0 h 10 l -0.948014 0.194069"];
      return;
  }

  this.dp = p(10, 0);
  this.paths = ["m 0 0l 10 0"];
};

SvsdKa = function() { SvsdChar.call(this, "SvsdKa", "か", "NEL10", "NEL", "NEL", "black", false, p(0, 2.3)); };
SvsdKa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["か"] = SvsdKa;

SvsdKa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_.replace(/(\D+\d+).*/, "$1") + "_" + _head) {
    case "SWL10_SW":
      this.dp = p(8.66026, -5);
      this.paths = ["m 0 0 c 2.35702 2.35702 7.30481 -2.65228 8.66026 -5"];
      return;
  }

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_model.replace(/(\D+\d+).*/, "$1")) {
    case "SWL":
      this.dp = p(8.66026, -5);
      this.paths = ["m 0 0 c 2.35702 2.35702 7.71149 -2.45594 8.66026 -5"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(8.66026, -5);
      this.paths = ["m 0 0 c 3.62505 1.61147 7.87213 -3.63491 8.66026 -5"];
      return;

    case "SWL":
      this.dp = p(9.06652, -4.64799);
      this.paths = ["m 0 0 c 3.62505 1.61147 7.34568 -2.92715 9.06652 -4.64799"];
      return;
  }

  this.dp = p(8.66026, -5);
  this.paths = ["m 0 0c 3.62505 1.61147 7.71149 -2.45594 8.66026 -5"];
};

SvsdKi = function() { SvsdChar.call(this, "SvsdKi", "き", "SWL10", "SWL", "SWL", "black", false, p(5, -4.330124999999999)); };
SvsdKi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["き"] = SvsdKi;

SvsdKi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_.replace(/(\D+\d+).*/, "$1")) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NEL":
      this.dp = p(-4.34173, 9.24988);
      this.paths = ["m 0 0 c -1.42813 1.42813 -5.17399 4.96179 -4.34173 9.24988"];
      return;
  }

  switch (_name) {
    case "SvsdHu":
    case "SvsdHun":
    case "SvsdHutsu":
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0 c -1.62303 1.15063 -5.37354 3.71513 -5 8.66025"];
      return;
  }

  switch (_headModel) {
    case "NEL5":
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0 c -2.3816 1.37502 -7.38464 7.22955 -5 8.66025"];
      return;

    case "NEL10":
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0 c -1.62303 1.15063 -7.24646 6.19762 -5 8.66025"];
      return;

    case "EL5":
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0 c -2.71933 1.57001 -6.54789 6.60916 -5 8.66025"];
      return;
  }

  switch (_head) {
    case "SL":
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0 c -1.62303 1.15063 -8.3064 6.91744 -5 8.66025"];
      return;
  }

  this.dp = p(-5, 8.66025);
  this.paths = ["m 0 0c -1.62303 1.15063 -5.83226 4.37216 -5 8.66025"];
};

SvsdKu = function() { SvsdChar.call(this, "SvsdKu", "く", "SEL10", "SEL", "SEL", "black", false, p(0.0, -2.6)); };
SvsdKu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["く"] = SvsdKu;

SvsdKu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "NEL":
      this.dp = p(8.66026, 5);
      this.paths = ["m 0 0 c 0.364894 3.93136 6.18041 7.47435 8.66026 5"];
      return;
  }

  this.dp = p(8.66026, 5);
  this.paths = ["m 0 0c 0.364894 3.93136 4.76838 5.95772 8.66026 5"];
};

SvsdKe = function() { SvsdChar.call(this, "SvsdKe", "け", "SL10", "SL", "SL", "black", false, p(1.5, -5.0)); };
SvsdKe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["け"] = SvsdKe;

SvsdKe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "EL":
      this.dp = p(0.117975, 9.82898);
      this.paths = ["m 0 0 c -1.63643 2.53073 -2.08843 6.05658 -0.640023 8.94219 c 0.10036 0.19995 0.497655 0.96122 0.924712 0.90349 c 0.346799 -0.0469 0.584922 -0.209356 0.601396 -0.461508 c 0.015002 -0.229621 -0.284019 -0.439125 -0.488323 -0.487955 c -0.315715 -0.075458 -0.744045 0.405538 -0.279787 0.932763"];
      return;

    default:
      this.dp = p(0, 10);
      this.paths = ["m 0 0c -1.84278 2.84986 -2.18359 6.96162 0 10"];
      break;
  }
};

SvsdKo = function() { SvsdChar.call(this, "SvsdKo", "こ", "EL10", "EL", "EL", "black", false, p(0.0, -0.9)); };
SvsdKo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["こ"] = SvsdKo;

SvsdKo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(10, 0);
      this.paths = ["m 0 0c 2.74956 3.12248 7.3269 1.33355 10 0"];
      break;
  }
};

SvsdSa = function() { SvsdChar.call(this, "SvsdSa", "さ", "NEL5", "NEL", "NEL", "black", false, p(0.0, 1.1)); };
SvsdSa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["さ"] = SvsdSa;

SvsdSa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, -2.5);
      this.paths = ["m 0 0c 1.59137 0.954753 3.42881 -1.15288 4.33013 -2.5"];
      break;
  }
};

SvsdShi = function() { SvsdChar.call(this, "SvsdShi", "し", "SWL5", "SWL", "SWL", "black", false, p(2.6, -2.2)); };
SvsdShi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["し"] = SvsdShi;

SvsdShi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NEL":
      this.dp = p(-1.99598, 4.62796);
      this.paths = ["m 0 0 c -0.815275 0.815275 -2.68637 2.44928 -1.99598 4.62796"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
  
  this.dp = p(-2.5, 4.33013);
  this.paths = ["m 0 0c -1.11689 0.391995 -3.19039 2.15145 -2.5 4.33013"];
};

SvsdSu = function() { SvsdChar.call(this, "SvsdSu", "す", "SEL5", "SEL", "SEL", "black", false, p(0.0, -1.3)); };
SvsdSu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["す"] = SvsdSu;

SvsdSu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.20152, 2.53215);
      this.paths = ["m 0 0c 0.40822 1.261113 1.10359 3.190304 4.20152 2.532154"];
      break;
  }
};

SvsdSe = function() { SvsdChar.call(this, "SvsdSe", "せ", "SL5", "SL", "SL", "black", false, p(0.7, -2.5)); };
SvsdSe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["せ"] = SvsdSe;

SvsdSe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 5);
      this.paths = ["m 0 0c -0.526006 1.45593 -1.3705 3.54409 0 5"];
      break;
  }
};

SvsdSo = function() { SvsdChar.call(this, "SvsdSo", "そ", "EL5", "EL", "EL", "black", false, p(0.0, -0.5)); };
SvsdSo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["そ"] = SvsdSo;

SvsdSo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5, 0);
      this.paths = ["m 0 0c 1.26737 1.679 3.71345 1.0347 5 0"];
      break;
  }
};

SvsdTa = function() { SvsdChar.call(this, "SvsdTa", "た", "NE5", "NE", "NE", "black", false, p(0.0, 1.2)); };
SvsdTa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["た"] = SvsdTa;

SvsdTa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, -2.5);
      this.paths = ["m 0 0l 4.33013 -2.5"];
      break;
  }
};

SvsdChi = function() { SvsdChar.call(this, "SvsdChi", "ち", "SW5", "SW", "SW", "black", false, p(2.5, -2.2)); };
SvsdChi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ち"] = SvsdChi;

SvsdChi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.5, 4.33012);
      this.paths = ["m 0 0l -2.5 4.33012"];
      break;
  }
};

SvsdTsu = function() { SvsdChar.call(this, "SvsdTsu", "つ", "SE5", "SE", "SE", "black", false, p(0.0, -1.2)); };
SvsdTsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["つ"] = SvsdTsu;

SvsdTsu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, 2.5);
      this.paths = ["m 0 0l 4.33013 2.5"];
      break;
  }
};

SvsdTe = function() { SvsdChar.call(this, "SvsdTe", "て", "S5", "S", "S", "black", false, p(0.0, -2.5)); };
SvsdTe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["て"] = SvsdTe;

SvsdTe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 5);
      this.paths = ["m 0 0l 0 5"];
      break;
  }
};

SvsdTo = function() { SvsdChar.call(this, "SvsdTo", "と", "E5", "E", "E", "black", false, p(0.0, 0.0)); };
SvsdTo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["と"] = SvsdTo;

SvsdTo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5, 0);
      this.paths = ["m 0 0 h5"];
      break;
  }
};

SvsdNa = function() { SvsdChar.call(this, "SvsdNa", "な", "NER10", "NER", "NER", "black", false, p(0.0, 2.5)); };
SvsdNa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["な"] = SvsdNa;

SvsdNa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, -5);
      this.paths = ["m 0 0c 0.338036 -1.74353 4.2163 -5.71161 8.66025 -5"];
      break;
  }
};

SvsdNi = function() { SvsdChar.call(this, "SvsdNi", "に", "SWR10", "SWR", "SWR", "black", false, p(5.0, -4.3)); };
SvsdNi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["に"] = SvsdNi;

SvsdNi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-5, 8.66025);
      this.paths = ["m 0 0c 0.722009 2.68537 -0.707116 7.21951 -5 8.66025"];
      break;
  }
};

SvsdNu = function() { SvsdChar.call(this, "SvsdNu", "ぬ", "SER10", "SER", "SER", "black", false, p(0.0, -2.5)); };
SvsdNu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぬ"] = SvsdNu;

SvsdNu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, 5);
      this.paths = ["m 0 0 c 2.5641,-0.0716 7.28949,-0.0932 8.66025,5"];
      break;
  }
};

SvsdNe = function() { SvsdChar.call(this, "SvsdNe", "ね", "SR10", "SR", "SR", "black", false, p(0.0, -5.0)); };
SvsdNe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ね"] = SvsdNe;

SvsdNe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 10);
      this.paths = ["m 0 0c 3.06633 2.75966 2.35567 7.77508 0 10"];
      break;
  }
};

SvsdNo = function() { SvsdChar.call(this, "SvsdNo", "の", "ER10", "ER", "ER", "black", false, p(0.0, 0.9)); };
SvsdNo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["の"] = SvsdNo;

SvsdNo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(10, 0);
      this.paths = ["m 0 0c 2.61216 -1.76308 7.32951 -2.88933 10 0"];
      break;
  }
};

SvsdHa = function() { SvsdChar.call(this, "SvsdHa", "は", "NEL20", "NEL", "NEL", "black", false, p(0.0, 5.0)); };
SvsdHa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["は"] = SvsdHa;

SvsdHa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, -10);
      this.paths = ["m 0 0c 7.567754 0 13.370745 -5.36129 17.3205 -10"];
      break;
  }
};

SvsdHi = function() { SvsdChar.call(this, "SvsdHi", "ひ", "SWL20", "SWL", "SWL", "black", false, p(10.2, -8.7)); };
SvsdHi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひ"] = SvsdHi;

SvsdHi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-10, 17.3205);
      this.paths = ["m 0 0c -4.58414 4.24962 -11.55 12.3153 -10 17.3205"];
      break;
  }
};

SvsdHu = function() { SvsdChar.call(this, "SvsdHu", "ふ", "SEL20", "SEL", "SEL", "black", false, p(0.0, -5.1)); };
SvsdHu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ふ"] = SvsdHu;

SvsdHu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, 10);
      this.paths = ["m 0 0c 0.556334 7.36507 11.3581 11.1114 17.3205 10"];
      break;
  }
};

SvsdHe = function() { SvsdChar.call(this, "SvsdHe", "へ", "UWL5", "SWL", "SEL", "black", false, p(2.8, -2.6)); };
SvsdHe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["へ"] = SvsdHe;

SvsdHe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.00028, 4.99854);
      this.paths = ["m 0 0c -1.54618 0.81314 -3.06762 1.9439 -2.80689 3.38677c 0.19187 1.06179 1.19064 2.09764 2.80717 1.61177"];
      break;
  }
};

SvsdHo = function() { SvsdChar.call(this, "SvsdHo", "ほ", "EL20", "EL", "EL", "black", false, p(0.0, -1.3)); };
SvsdHo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ほ"] = SvsdHo;

SvsdHo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(20, 0);
      this.paths = ["m 0 0c 5.15578 3.98468 13.0748 2.97834 20 0"];
      break;
  }
};

SvsdMa = function() { SvsdChar.call(this, "SvsdMa", "ま", "NER20", "NER", "NER", "black", false, p(0.0, 5.0)); };
SvsdMa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ま"] = SvsdMa;

SvsdMa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, -10);
      this.paths = ["m 0 0c 4.56521 -6.44915 10.8638 -9.78096 17.3205 -10"];
      break;
  }
};

SvsdMi = function() { SvsdChar.call(this, "SvsdMi", "み", "SWR20", "SWR", "SWR", "black", false, p(10.0, -8.7)); };
SvsdMi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["み"] = SvsdMi;

SvsdMi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-9.99999, 17.3206);
      this.paths = ["m 0 0c 1.75914 4.78201 -3.60044 13.4217 -9.99999 17.3206"];
      break;
  }
};

SvsdMu = function() { SvsdChar.call(this, "SvsdMu", "む", "SER20", "SER", "SER", "black", false, p(0.0, -5.0)); };
SvsdMu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["む"] = SvsdMu;

SvsdMu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, 10);
      this.paths = ["m 0 0c 6.05327 -0.272634 16.7009 3.22004 17.3205 10"];
      break;
  }
};

SvsdMe = function() { SvsdChar.call(this, "SvsdMe", "め", "UER5", "SER", "SWR", "black", false, p(0.0, -2.5)); };
SvsdMe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["め"] = SvsdMe;

SvsdMe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 5.00001);
      this.paths = ["m 0 0c 1.96459 0.169174 2.87771 0.486323 3.07622 1.62962c 0.260213 1.49864 -1.92679 2.77673 -3.07622 3.37039"];
      break;
  }
};

SvsdMo = function() { SvsdChar.call(this, "SvsdMo", "も", "ER20", "ER", "ER", "black", false, p(0.0, 1.3)); };
SvsdMo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["も"] = SvsdMo;

SvsdMo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(20, 0);
      this.paths = ["m 0 0c 6.69402 -2.71754 16.4988 -4.16702 20 0"];
      break;
  }
};

SvsdYa = function() { SvsdChar.call(this, "SvsdYa", "や", "NE20", "NE", "NE", "black", false, p(0.0, 5.0)); };
SvsdYa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["や"] = SvsdYa;

SvsdYa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, -10);
      this.paths = ["m 0 0l 17.3205 -10"];
      break;
  }
};

SvsdYu = function() { SvsdChar.call(this, "SvsdYu", "ゆ", "SE20", "SE", "SE", "black", false, p(0.0, -5.0)); };
SvsdYu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ゆ"] = SvsdYu;

SvsdYu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.3205, 10);
      this.paths = ["m 0 0l 17.3205 10"];
      break;
  }
};

SvsdYo = function() { SvsdChar.call(this, "SvsdYo", "よ", "E20", "E", "E", "black", false, p(0.0, 0.0)); };
SvsdYo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["よ"] = SvsdYo;

SvsdYo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(20, 0);
      this.paths = ["m 0 0l 20 0"];
      break;
  }
};

SvsdRa = function() { SvsdChar.call(this, "SvsdRa", "ら", "NER5", "NER", "NER", "black", false, p(0.0, 1.3)); };
SvsdRa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ら"] = SvsdRa;

SvsdRa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, -2.5);
      this.paths = ["m 0 0c 0.541772 -0.951162 1.94507 -2.71942 4.33013 -2.5"];
      break;
  }
};

SvsdRi = function() { SvsdChar.call(this, "SvsdRi", "り", "SWR5", "SWR", "SWR", "black", false, p(2.5, -2.2)); };
SvsdRi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["り"] = SvsdRi;

SvsdRi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.5, 4.33013);
      this.paths = ["m 0 0c 1.23682 1.79842 -0.379269 3.56029 -2.5 4.33013"];
      break;
  }
};

SvsdRu = function() { SvsdChar.call(this, "SvsdRu", "る", "SER5", "SER", "SER", "black",false, p(0.0, -1.2)); };
SvsdRu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["る"] = SvsdRu;

SvsdRu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, 2.5);
      this.paths = ["m 0 0c 1.48073 0.0776674 4.60895 0.194056 4.33013 2.5"];
      break;
  }
};

SvsdRe = function() { SvsdChar.call(this, "SvsdRe", "れ", "SR5", "SR", "SR", "black", false, p(0.0, -2.5)); };
SvsdRe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["れ"] = SvsdRe;

SvsdRe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 5);
      this.paths = ["m 0 0c 1.1321 2.05387 1.03538 3.75447 0 5"];
      break;
  }
};

SvsdRo = function() { SvsdChar.call(this, "SvsdRo", "ろ", "ER5", "ER", "ER", "black", false, p(0.0, 0.4)); };
SvsdRo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ろ"] = SvsdRo;

SvsdRo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5, 0);
      this.paths = ["m 0 0c 1.72594 -0.816378 3.59517 -1.20627 5 0"];
      break;
  }
};

SvsdWa = function() { SvsdChar.call(this, "SvsdWa", "わ", "USL5", "SEL", "NEL", "black", false, p(0.0, -1.4)); };
SvsdWa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["わ"] = SvsdWa;

SvsdWa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5, 0);
      this.paths = ["m 0 0c 0.0192241 1.2306 0.514416 2.96936 1.65244 2.87958c 1.10088 -0.086848 2.53023 -1.40929 3.34756 -2.87958"];
      break;
  }
};

TakusariChar = function(name, kana, model, headType, tailType, color) { Char.apply(this, arguments); };
TakusariChar.prototype = Object.create(Char.prototype);
TakusariChar.dict = {};

TakusariA = function() { TakusariChar.call(this, "TakusariA", "あ", "E3", "E", "E", "black"); };
TakusariA.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["あ"] = TakusariA;

TakusariA.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.9724, 0);
      this.paths = ["m 0 0 h 2.9724"];
      break;
  }
}

TakusariI = function() { TakusariChar.call(this, "TakusariI", "y", "SE2", "SE", "SE", "black"); };
TakusariI.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["い"] = TakusariI;

TakusariI.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.12003, 1.12003);
      this.paths = ["m 0 0 l 1.12003 1.12003"];
      break;
  }
}

TakusariU = function() { TakusariChar.call(this, "TakusariU", "う", "S3", "S", "S", "black"); };
TakusariU.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["う"] = TakusariU;

TakusariU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 2.6714);
      this.paths = ["m 0 0 v 2.6714"];
      break;
  }
}

TakusariE = function() { TakusariChar.call(this, "TakusariE", "え", "SE3", "SE", "SE", "black"); };
TakusariE.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["え"] = TakusariE;

TakusariE.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.66348, 1.66348);
      this.paths = ["m 0 0 l 1.66348 1.66348"];
      break;
  }
}

TakusariO = function() { TakusariChar.call(this, "TakusariO", "お", "SW3", "SW", "SW", "black"); };
TakusariO.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["お"] = TakusariO;

TakusariO.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.00764, 2.00765);
      this.paths = ["m 0 0 l -2.00764 2.00765"];
      break;
  }
}

TakusariKa = function() { TakusariChar.call(this, "TakusariKa", "か", "E9", "E", "E", "black"); };
TakusariKa.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["か"] = TakusariKa;

TakusariKa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(9.00424, 0);
      this.paths = ["m 0 0 h 9.00424"];
      break;
  }
}

TakusariKi = function() { TakusariChar.call(this, "TakusariKi", "き", "E9NW2", "E", "NW", "black"); };
TakusariKi.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["き"] = TakusariKi;

TakusariKi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.83654, -1.0639);
      this.paths = ["m 0 0 h 8.90045 l -1.0639 -1.0639"];
      //this.dp = p(7.83654, -1.0639);
      //this.paths = ["m 0 0 h 8.90045 l 7.83654 -1.0639"];
      //this.dp = p(16.737, -1.0639);
      //this.paths = ["m 0 0 h 8.90045 l 7.83654 -1.0639"];
      break;
  }
}

TakusariKu = function() { TakusariChar.call(this, "TakusariKu", "く", "E9N2", "E", "N", "black"); };
TakusariKu.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["く"] = TakusariKu;

TakusariKu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(9.00709, -2.22679);
      this.paths = ["m 0 0 h 9.00709 v -2.22679"];
      break;
  }
}

TakusariKe = function() { TakusariChar.call(this, "TakusariKe", "け", "E9NW3", "E", "NW", "black"); };
TakusariKe.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["け"] = TakusariKe;

TakusariKe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.57372, -1.42699);
      this.paths = ["m 0 0 h 9.00071 l -1.42699 -1.42699"];
      break;
  }
}

TakusariKo = function() { TakusariChar.call(this, "TakusariKo", "こ", "E9NE3", "E", "NE", "black"); };
TakusariKo.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["こ"] = TakusariKo;

TakusariKo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(10.0059, -1.63139);
      this.paths = ["m 0 0 l 9.00624 0.100028 l 0.999635 -1.73142"];
      break;
  }
}

TakusariSa = function() { TakusariChar.call(this, "TakusariSa", "さ", "SR7", "SR", "SR", "black"); };
TakusariSa.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["さ"] = TakusariSa;

TakusariSa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.151885, 7.35122);
      this.paths = ["m 0 0 c 1.38526 1.05473 1.71903 5.47967 -0.151885 7.35122"];
      break;
  }
}

TakusariShi = function() { TakusariChar.call(this, "TakusariShi", "し", "SR7NW1", "SR", "NW", "black"); };
TakusariShi.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["し"] = TakusariShi;

TakusariShi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.15432, 6.89557);
      this.paths = ["m 0 0 c 1.19869 2.39225 1.048 6.27643 -0.303769 7.65499 l -0.850555 -0.759425"];
      break;
  }
}

TakusariSu = function() { TakusariChar.call(this, "TakusariSu", "す", "SR7N2", "SR", "N", "black"); };
TakusariSu.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["す"] = TakusariSu;

TakusariSu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.182265, 4.70843);
      this.paths = ["m 0 0 c 1.65725 2.33278 1.44935 5.43283 -0.182264 7.22971 l -1e-06 -2.52129"];
      break;
  }
}


NakaneAn = function() { NakaneChar.call(this, "NakaneAn", "あん", "CL1NEL7", "C", "NEL", "black", false, p(1.4, 1.5)); };
NakaneAn.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["あん"] = NakaneAn;

NakaneAn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.24388, -3.00062);
      this.paths = ["m 0 0 c -0.02492 -1.17664 -1.17719 -1.287 -1.38649 -0.66039 c -0.184343 0.551891 0.548205 0.937461 1.38649 0.66039 c 1.69005 -0.558596 3.30617 -1.37645 4.24388 -3.00062"];
      break;
  }
}

NakaneIn = function() { NakaneChar.call(this, "NakaneIn", "いん", "CR1NER7", "C", "NER", "black", false, p(0.5, 0.9)); };
NakaneIn.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["いん"] = NakaneIn;

NakaneIn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.662, -3.06646);
      this.paths = ["m 0 0 c 1.23903 0.46983 0.793476 1.2456 0.389482 1.34959 c -0.326126 0.08395 -0.673306 -0.216925 -0.742295 -0.508877 c -0.100716 -0.426218 0.409386 -0.900078 0.636519 -1.14939 c 1.39782 -1.5343 3.29166 -2.75779 4.37829 -2.75779"];
      break;
  }
}

NakaneUn = function() { NakaneChar.call(this, "NakaneUn", "うん", "CL1NEL17", "C", "NEL", "black", false, p(0.9, 4.0)); };
NakaneUn.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["うん"] = NakaneUn;

NakaneUn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.1785, -7.96145);
      this.paths = ["m 0 0 c 0.23789 -0.94394 -0.31576 -1.2225 -0.72883 -1.13865 c -0.31784 0.0645 -0.72117 0.86178 -0.32209 1.07707 c 0.37994 0.20497 1.07804 0.0584 1.31435 -0.0151 c 4.95144 -1.53925 9.6925 -4.27169 12.6099 -9.32478"];
      break;
  }
};


NakaneUn.prototype.setPathsExtra = function() {
    this.pathsExtra = ["m 6,-4.0 v0.1"];
};

NakaneEn = function() { NakaneChar.call(this, "NakaneEn", "えん", "CR1NER17", "C", "NER", "black", false, p(0.4, 3.6)); };
NakaneEn.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["えん"] = NakaneEn;

NakaneEn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.3393, -8.53826);
      this.paths = ["m 0 0 c 1.18973 0.62725 0.72813 1.39657 0.47231 1.50302 c -0.26196 0.109 -0.72678 0.0968 -0.8516 -0.29748 c -0.11204 -0.35389 0.2483 -1.03199 0.38226 -1.21709 c 3.20473 -4.42817 10.0513 -8.52671 13.3364 -8.52671"];
      break;

  }
};

NakaneOn = function() { NakaneChar.call(this, "NakaneOn", "おん", "CL1NEL17", "C", "NEL", "black", false, p(1.2, 4.7)); };
NakaneOn.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["おん"] = NakaneOn;

NakaneOn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(12.8733, -9.40146);
      this.paths = ["m 0 0 c 0.23789 -0.94394 -0.31576 -1.2225 -0.72883 -1.13865 c -0.31784 0.0645 -0.72117 0.86178 -0.32209 1.07707 c 0.37994 0.20497 1.07804 0.0584 1.31435 -0.0151 c 4.95144 -1.53925 9.6925 -4.27169 12.6099 -9.32478"];
      break;
  }
};

NakaneKan = function() { NakaneChar.call(this, "NakaneKan", "かん", "CL1E7", "C", "E", "black", false, p(1.1, 0)); };
NakaneKan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["かん"] = NakaneKan;
NakaneChar.dict["から"] = NakaneKan;

NakaneKan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.89798, 0.02238);
      this.paths = ["m 0 0 c 0.484613 -0.72432 0.08681 -1.03795 -0.424345 -0.98699 c -0.595043 0.0593 -0.906903 1.00337 -0.227406 1.00337 c 2.16601 0 4.27941 0.006 6.54973 0.006"];
      break;
  }
};

NakaneKin = function() { NakaneChar.call(this, "NakaneKin", "きん", "CR1SW7", "C", "SW", "black", false, p(2.9, -1.8)); };
NakaneKin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["きん"] = NakaneKin;

NakaneKin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.86156, 4.95636);
      this.paths = ["m 0 0 c -1.88206 -0.17139 -0.679964 -1.57779 0.129227 -1.22096 c 0.585143 0.25804 -0.129227 1.22096 -0.129227 1.22096 l -2.86156 4.95636"];
      break;
  }
};

NakaneKun = function() { NakaneChar.call(this, "NakaneKun", "くん", "CR1S7", "C", "S", "black", true, p(1.0, -2.3)); };
NakaneKun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["くん"] = NakaneKun;

NakaneKun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.016133, 5.80887);
      this.paths = ["m 0,0 c -1.1221982,0.88785216 -1.5670959,0.16681665 -1.6443572,-0.44369222 -0.043385,-0.34282477 0.604067,-0.93379058 1.2540592,-0.69140778 0.49630989,0.18918054 0.430502,0.50729 0.406431,1.29485 v 5.64912"];
      break;
  }
};

NakaneKen = function() { NakaneChar.call(this, "NakaneKen", "けん", "CR1SW17", "C", "SW", "black", false, p(8.1, -6.4)); };
NakaneKen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["けん"] = NakaneKen;

NakaneKen.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {
    case "E":
      this.dp = p(-7.86364, 13.6202);
      this.paths = ["m 0 0 c 0.695304 0 1.11646 0.233633 1.5463 -0.375317 c 0.384163 -0.677656 -0.243854 -1.00987 -0.640214 -0.892382 c -0.464482 0.137678 -0.906087 1.2677 -0.906087 1.2677 l -7.86364 13.6202"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-8.05012, 13.9055);
      this.paths = ["m 0 0 c -0.42265 0.36576 -1.15044 -0.21539 -0.7206 -0.82434 c 0.15545 -0.22023 0.49272 -0.41245 0.80231 -0.2106 c 0.52999 0.34556 -0.26819 1.32019 -0.26819 1.32019 l -7.86364 13.6202"];
      break;
  }
};

NakaneGen = function() { NakaneChar.call(this, "NakaneGen", "げん", "CR1SW17", "C", "SW", "black", true, p(8.1, -6.4)); };
NakaneGen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["げん"] = NakaneGen;

NakaneGen.prototype.setPaths = NakaneKen.prototype.setPaths;

NakaneKon = function() { NakaneChar.call(this, "NakaneKon", "こん", "CL1E17", "C", "E", "black", false, p(1.2, 0)); };
NakaneKon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["こん"] = NakaneKon;

NakaneKon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.7998, 0.04139);
      this.paths = ["m 0 0 c 0.18891 -0.39882 0.12148 -0.95587 -0.40057 -0.96225 c -0.75107 -0.009 -1.1373 0.98294 -0.52768 0.98294 c 0.2939 0 1.20021 0.0207 1.20021 0.0207 h 15.5278"];
      break;
  }
};

SvsdAn = function() { SvsdChar.call(this, "SvsdAn", "あん", "NE10CL1", "NE", "CL", "black", false, p(0.0, 2.5)); };
SvsdAn.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["あん"] = SvsdAn;

SvsdAn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(6.66497, -3.84803);
      this.paths = ["m 0 0 l 7.50277 -4.33173 l 0.862841 -0.50456 c 0.453489 -0.27451 0.508453 -1.00696 0.150327 -1.16644 c -0.86497 -0.385177 -1.10034 0.802285 -1.85096 2.1547"];
      return;
  }


  this.dp = p(7.50277, -4.33173);
  this.paths = ["m 0 0 l 7.50277 -4.33173 l 0.862841 -0.50456 c 0.453489 -0.27451 -0.07577 -1.0977 -0.582858 -1.06324 c -0.432651 0.0294 -0.810198 0.78944 -0.279983 1.5678"];
};

SvsdKan = function() { SvsdChar.call(this, "SvsdKan", "かん", "NEL10CL1", "NEL", "CL", "black", false, p(0, 2.3)); };
SvsdKan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["かん"] = SvsdKan;

SvsdKan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (model_.replace(/(\D+\d+).*/, "$1")) {
    case "SWL10":
      this.dp = p(7.96521, -3.6709);
      this.paths = ["m 0 0 c 1.97024 2.15982 6.39642 -1.28465 7.96521 -3.6709 c 0.131668 -0.20027 0.627511 -0.77622 0.472515 -1.16584 c -0.119981 -0.3016 -0.502465 -0.61366 -0.885737 -0.4046 c -0.475203 0.2592 -0.593013 1.1011 0.413222 1.57044"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "SvsdNi":
    case "SvsdNin":
      this.dp = p(7.77747, -3.39625);
      this.paths = ["m 0 0 c 3.03636 1.34978 6.39642 -1.28465 7.96521 -3.6709 c 0.131668 -0.20027 0.627511 -0.77622 0.472515 -1.16584 c -0.119981 -0.3016 -0.502465 -0.61366 -0.885737 -0.4046 c -0.475203 0.2592 0.0057 1.02785 0.225478 1.84509"];
      return;
  }

  //switch (_model) {}

  console.log(_headModel);
  switch (_headModel) {
    case "SL5":
      this.dp = p(6.50809, -1.92234);
      this.paths = ["m 0 0 c 3.03636 1.34978 6.39642 -1.28465 7.96521 -3.6709 c 0.959847 -1.46 -0.00365 -1.65797 -0.371262 -1.00397 c -0.468226 0.832995 -0.645405 1.53341 -1.08586 2.75254"];
      return;
  }

  //switch (_head) {}

  this.dp = p(7.96521, -3.6709);
  this.paths = ["m 0 0 c 3.03636 1.34978 6.39642 -1.28465 7.96521 -3.6709 c 0.131668 -0.20027 0.627511 -0.77622 0.472515 -1.16584 c -0.119981 -0.3016 -0.502465 -0.61366 -0.885737 -0.4046 c -0.475203 0.2592 -0.593013 1.1011 0.413222 1.57044"];
};

SvsdSan = function() { SvsdChar.call(this, "SvsdSan", "さん", "NEL5CL1", "NEL", "NELCL", "black", false, p(0.0, 1.4)); };
SvsdSan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["さん"] = SvsdSan;

SvsdSan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL5":
      this.dp = p(2.34056, -0.203629);
      this.paths = ["m 0 0 c 1.22256 0.73349 2.70882 -0.236807 3.68582 -1.3848 c 0.12228 -0.14368 0.532099 -0.77822 0.280329 -0.974601 c -0.548032 -0.427467 -1.44751 1.84342 -1.62558 2.15577"];
      return;
  }

  //switch (_head) {}

  this.dp = p(3.83808, -1.78056);
  this.paths = ["m 0 0 c 1.22256 0.73349 2.59036 -0.34046 3.56736 -1.48845 c 0.12228 -0.14368 0.40963 -0.36964 0.53461 -0.75453 c 0.13299 -0.40954 -0.36164 -0.92704 -0.70525 -0.81595 c -0.69755 0.22553 -0.85838 0.81263 0.44136 1.27837"];
};

SvsdTan = function() { SvsdChar.call(this, "SvsdTan", "たん", "NE5CL1", "NE", "CL", "black", false, p(0.0, 1.7)); };
SvsdTan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["たん"] = SvsdTan;

SvsdTan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.14884, -1.81798);
      this.paths = ["m 0 0 l 3.14884 -1.81798 c 0 0 0.88269 -0.36606 0.94421 -0.76682 c 0.0506 -0.32954 -0.18911 -0.6722 -0.55149 -0.83442 c -0.64959 -0.2908 -0.71368 0.77775 -0.39272 1.60124"];
      break;
  }
};

SvsdNan = function() { SvsdChar.call(this, "SvsdNan", "なん", "NER10CR1", "NER", "CR", "black", false, p(0.0, 2.6)); };
SvsdNan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["なん"] = SvsdNan;

SvsdNan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.8924, -5.04873);
      this.paths = ["m 0 0 c 0.29223 -1.50729 3.2303 -4.67736 6.8924 -5.04869 c 0.3211 -0.0326 0.79657 -0.11558 1.11657 -0.0302 c 0.59742 0.15947 0.61071 0.66128 0.42635 0.97213 c -0.51357 0.86592 -1.22155 -0.56813 -1.54292 -0.94197"];
      break;
  }
};

SvsdOn = function() { SvsdChar.call(this, "SvsdOn", "おん", "E10CL1", "E", "CL", "black", false, p(0.0, 0.6)); };
SvsdOn.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["おん"] = SvsdOn;

SvsdOn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.71068, 0);
      this.paths = ["m 0 0 h 8.71068 c 0.715134 0 1.29478 0.21311 1.31863 -0.90043 c 0.0053 -0.24819 -0.207752 -0.39396 -0.387816 -0.37878 c -0.52548 0.0443 -0.930817 1.27921 -0.930817 1.27921"];
      break;
  }
};

SvsdKon = function() { SvsdChar.call(this, "SvsdKon", "こん", "EL10CL1", "EL", "CL", "black", false, p(0.0, -0.2)); };
SvsdKon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["こん"] = SvsdKon;

SvsdKon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.60646, 0.59829);
      this.paths = ["m 0 0 c 2.70023 1.86067 6.02664 1.53794 8.60646 0.59829 c 0.296171 -0.10787 1.16343 -0.36988 1.19347 -0.85914 c 0.0206 -0.33549 -0.425929 -0.77701 -0.740148 -0.68483 c -0.360731 0.10583 -0.531969 0.80038 -0.453327 1.54397"];
      break;
  }
};

SvsdSon = function() { SvsdChar.call(this, "SvsdSon", "そん", "EL5CL1", "EL", "CL", "black", false, p(0.0, -0.1)); };
SvsdSon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["そん"] = SvsdSon;

SvsdSon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.87482, 0.66396);
      this.paths = ["m 0 0 c 0.9556 1.26596 2.5813 1.2111 3.87482 0.66396 c 0.20807 -0.088 1.02833 -0.45494 1.04824 -0.91925 c 0.0123 -0.28659 -0.21015 -0.6317 -0.59606 -0.6207 c -0.33353 0.009 -0.70817 0.82796 -0.45218 1.53995"];
      break;
  }
};

SvsdTon = function() { SvsdChar.call(this, "SvsdTon", "とん", "E5CL1", "E", "CL", "black", false, p(0.0, 0.6)); };
SvsdTon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["とん"] = SvsdTon;

SvsdTon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.71068, 0);
      this.paths = ["m 0 0 h 3.71068 c 0.71513 0 1.29478 0.21311 1.31863 -0.90043 c 0.005 -0.24819 -0.20775 -0.39396 -0.38781 -0.37878 c -0.52548 0.0443 -0.93082 1.27921 -0.93082 1.27921"];
      break;
  }
};

SvsdNon = function() { SvsdChar.call(this, "SvsdNon", "のん", "ER10CR1", "ER", "CR", "black", false, p(0.0, 0.5)); };
SvsdNon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["のん"] = SvsdNon;

SvsdNon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.73364, -1.00721);
      this.paths = ["m 0 0 c 2.23662 -1.50961 6.01662 -2.55232 8.73364 -1.00721 c 0.26023 0.14799 1.09415 0.59065 1.10738 1.1141 c 0.007 0.28679 -0.22769 0.65699 -0.57514 0.64027 c -0.59193 -0.0285 -0.81987 -0.99448 -0.53224 -1.75437"];
      break;
  }
};

NakaneSan = function() { NakaneChar.call(this, "NakaneSan", "さん", "CR1SER7", "C", "SER", "black", false, p(1.5, -1.6)); };
NakaneSan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["さん"] = NakaneSan;

NakaneSan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.76019, 3.35451);
      this.paths = ["m 0 0 c -0.584978 1.14861 -1.17679 1.07187 -1.4528 0.72574 c -0.201503 -0.25269 0.112244 -0.89032 0.726985 -0.82274 c 0.235326 0.0259 0.488711 0.0467 0.725816 0.097 c 2.2128 0.47001 4.39929 2.00763 4.76019 3.35451"];
      break;
  }
};

NakaneShin = function() { NakaneChar.call(this, "NakaneShin", "しん", "CL1SEL7", "C", "SEL", "black", false, p(0.5, -0.5)); };
NakaneShin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["しん"] = NakaneShin;

NakaneShin.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {
    case "NER":
      this.dp = p(6.30353, 3.21105);
      this.paths = ["m 0 0 c 2.33316 0 0.412767 1.73879 -0.138139 1.34755 c -0.744267 -0.528563 0.193006 -1.51977 0.768252 -1.03771 c 0.180119 0.15094 0.254195 0.25402 0.473812 0.463769 c 1.267 1.21006 3.58178 2.69282 5.1996 2.43744"];
      return;

    case "S":
      this.dp = p(5.19983, 2.45104);
      this.paths = ["m 0 0 c 0 0.366779 0.919746 -0.080396 1.09209 -0.391439 c 0.145859 -0.263244 0.153906 -0.715042 -0.33469 -0.938694 c -0.333099 -0.152474 -0.680755 0.116174 -0.762318 0.513188 c -0.047292 0.230195 0.00515 0.52686 0.00515 0.830549 c 0 1.48947 3.58178 2.69282 5.1996 2.43744"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.19961, 2.43744);
      this.paths = ["m 0 0 c 1.24485 -0.7309 0.670914 -1.2693 0.434536 -1.3994 c -0.320934 -0.17665 -1.25469 0.27372 -0.908345 0.93563 c 0.108952 0.20822 0.254195 0.25402 0.473812 0.46377 c 1.267 1.21006 3.58178 2.69282 5.1996 2.43744"];
      break;
  }
};

NakaneZin = function() { NakaneChar.call(this, "NakaneZin", "じん", "CL1SEL7", "C", "SEL", "black", true, p(0.5, -0.5)); };
NakaneZin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["じん"] = NakaneZin;
NakaneZin.prototype.setPaths = NakaneShin.prototype.setPaths;

NakaneSun = function() { NakaneChar.call(this, "NakaneSun", "すん", "CR1NER17", "C", "NER", "black", false, p(1.4, -4.2)); };
NakaneSun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["すん"] = NakaneSun;

NakaneSun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.3551, 8.43844);
      this.paths = ["m 0 0 c -0.47664 1.19616 -0.750848 1.28748 -1.01203 1.16221 c -0.336621 -0.16146 -0.658969 -0.87501 0.08285 -1.12465 c 0.435266 -0.14648 0.663618 -0.0742 0.929177 -0.0376 c 5.43552 0.75501 11.6793 5.53592 13.3551 8.43848"];
      break;
  }
};

NakaneSun.prototype.setPathsExtra = function() {
  
  switch (this.getPrevName()) {
    case "NakaneSu":
    case "NakaneMu":
      this.pathsExtra = [];
      return; 
  }

  switch (this.getNextName()) {
    case "NakaneSu":
      if (this.next && this.next.next) {
        const name = this.next.next.name;
        if (name == "NakaneMu") {
          this.pathsExtra = ["m 23,9 v0.1"];
        } else {
          this.pathsExtra = ["m 14.7241,6 v0.1"];
        }
      } else {
        this.pathsExtra = ["m 12,8.50165 v0.1"];
      }
      break;

    case "NakaneRu":
      this.pathsExtra = ["m 12,8.50165 v0.1"];
      break;

    default:
      this.pathsExtra = ["m 7,4 v0.1"];
      break;
  }
};

NakaneSen = function() { NakaneChar.call(this, "NakaneSen", "せん", "CL1SEL17", "C", "SEL", "black", false, p(0.4, -3.0)); };
NakaneSen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["せん"] = NakaneSen;

NakaneSen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.7984, 7.58106);
      this.paths = ["m 0 0 c 0.68897 -0.6576 0.75102 -1.16259 0.25641 -1.57231 c -0.31467 -0.26066 -0.7595 0.19427 -0.69637 0.84797 c 0.0216 0.2242 0.31393 0.60381 0.43996 0.72434 c 4.33035 4.14121 10.201 7.74252 13.7984 7.58106"];
      break;
  }
};

NakaneSon = function() { NakaneChar.call(this, "NakaneSon", "そん", "CR1SER17", "C", "SER", "black", false, p(1.2, -4.1)); };
NakaneSon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["そん"] = NakaneSon;

NakaneSon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.3551, 8.43844);
      this.paths = ["m 0 0 c -0.47664 1.19616 -0.750848 1.28748 -1.01203 1.16221 c -0.336621 -0.16146 -0.658969 -0.87501 0.08285 -1.12465 c 0.435266 -0.14648 0.663618 -0.0742 0.929177 -0.0376 c 5.43552 0.75501 11.6793 5.53592 13.3551 8.43848"];
      break;
  }
};

ShugiinYama = function() { ShugiinChar.call(this, "ShugiinYama", "やま", "NER14", "NER", "NER", "black", false, p(0.0, 4.4)); };
ShugiinYama.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["やま"] = ShugiinYama;

ShugiinYama.prototype.setPaths = function() {
  console.log(this.getPrevTailType());
  switch (this.getPrevTailType()) {
    case "SR":
      this.dp = pp(16.46, 22.3);
      this.paths = ["m 0,0 c 2.2794596,-3.6912402 5.0869467,-7.1022 8.0660867,-8.19349 4.5388403,-1.66262 6.9670363,1.01541 7.1621363,1.94396"];
      return;

    case "SW3(-105)":
      this.dp = p(13.6496, -5.74733);
      this.paths = ["m 0 0 c 2.25291 -3.90216 4.03745 -6.6 7.01659 -7.69129 c 4.53884 -1.66262 6.43787 1.01541 6.63297 1.94396"];
      return;
  }


  switch (this.getNextHeadType()) {
    case "SE":
      this.dp = p(12.5824, -6.24953);
      this.paths = ["m 0 0 c 0.969553 -4.40028 2.97028 -7.1022 5.94942 -8.19349 c 4.53884 -1.66262 7.45684 1.12009 6.63297 1.94396"];
      break;

    default:
      this.dp = p(12.5824, -6.24953);
      this.paths = ["m 0 0 c 0.969553 -4.40028 2.97028 -7.1022 5.94942 -8.19349 c 4.53884 -1.66262 6.43787 1.01541 6.63297 1.94396"];
      break;
  }
};


NakaneTan = function() { NakaneChar.call(this, "NakaneTan", "たん", "CR1SE7", "C", "SE", "black", false, p(1.4, -1.3)); };
NakaneTan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["たん"] = NakaneTan;

NakaneTan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.1381, 2.96648);
      this.paths = ["m 0 0 c -0.565124 1.20604 -1.4152 1.00913 -1.42397 0.38676 c -0.0048 -0.33803 0.205595 -0.64766 0.485899 -0.73899 c 0.317576 -0.10348 0.938076 0.35223 0.938076 0.35223 l 5.1381 2.96648"];
      break;
  }
};

NakaneChin = function() { NakaneChar.call(this, "NakaneChin", "ちん", "CR1S7", "C", "S", "black", false, p(1.0, -2.3)); };
NakaneChin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ちん"] = NakaneChin;

NakaneChin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.016133, 5.80887);
      this.paths = ["m 0 0 c -0.764301 0.23713 -0.981446 -0.0284 -0.993635 -0.37862 c -0.01202 -0.34535 0.311242 -0.77111 0.603337 -0.75648 c 0.528846 0.0265 0.430502 0.50729 0.406431 1.29485 v 5.64912"];
      break;
  }
};

NakaneTsun = function() { NakaneChar.call(this, "NakaneTsun", "つん", "CL1NE17", "C", "NE", "black", false, p(1.2, 3.8)); };
NakaneTsun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["つん"] = NakaneTsun;

NakaneTsun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.7795, -7.95559);
      this.paths = ["m 0 0 c 0.376378 -1.10396 -0.661145 -0.82666 -0.978769 -0.58849 c -0.210489 0.15784 -0.386326 0.73695 -0.144527 0.94398 c 0.298319 0.25544 1.1233 -0.35549 1.1233 -0.35549 l 13.7795 -7.95559"];
      break;
  }
};

NakaneTen = function() { NakaneChar.call(this, "NakaneTen", "てん", "CR1S17", "C", "S", "black", false, p(1.0, -7.4)); };
NakaneTen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["てん"] = NakaneTen;

NakaneTen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.01613, 15.863);
      this.paths = ["m 0 0 c -0.76431 0.23713 -0.98145 -0.0284 -0.99364 -0.37862 c -0.012 -0.34535 0.31124 -0.77111 0.60334 -0.75648 c 0.52884 0.0265 0.4305 0.50729 0.40643 1.29485 v 15.7033"];
      break;
  }
};

NakaneTon = function() { NakaneChar.call(this, "NakaneTon", "とん", "CR1SE17", "C", "SE", "black", false, p(1.4, -3.8)); };
NakaneTon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["とん"] = NakaneTon;

NakaneTon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.71, 7.93925);
      this.paths = ["m 0 0 c -0.56513 1.20604 -1.4152 1.00913 -1.42398 0.38676 c -0.005 -0.33803 0.2056 -0.64766 0.4859 -0.73899 c 0.31758 -0.10348 0.93808 0.35223 0.93808 0.35223 l 13.71 7.93925"];
      break;
  }
};

SvsdUn = function() { SvsdChar.call(this, "SvsdUn", "うん", "SE10CL1", "SE", "CL", "black", false, p(0.0, -2.4)); };
SvsdUn.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["うん"] = SvsdUn;

SvsdUn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(7.23341, 4.17582);
      this.paths = ["m 0 0 l 7.23341 4.17621 c 0.30661 0.177021 0.93637 0.330917 1.24449 -0.018261 c 0.158163 -0.179237 0.257953 -0.995764 -0.095505 -1.12543 c -0.507243 -0.186084 -0.913747 0.735816 -1.14899 1.1433"];
      return;

    case "E":
      this.dp = p(6.19802, 3.57843);
      this.paths = ["m 0 0 l 7.23341 4.17621 c 0.300429 0.18732 0.80113 0.491204 1.22842 0.421616 c 0.207809 -0.033844 0.397166 -0.09716 0.501496 -0.384022 c 0.202043 -0.55553 -1.62124 -0.635375 -2.7653 -0.635375"];
      return;
  }

  this.dp = p(7.23341, 4.17582);
  this.paths = ["m 0 0 l 7.23341 4.17621 c 0.300429 0.18732 0.855586 0.6616 1.22842 0.5314 c 0.251425 -0.0878 0.463564 -0.31919 0.523453 -0.60359 c 0.10794 -0.51259 -0.828177 -0.8515 -1.75187 0.0718"];
};

SvsdKun = function() { SvsdChar.call(this, "SvsdKun", "くん", "SEL10CL1", "SEL", "CL", "black", false, p(0.0, -2.6)); };
SvsdKun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["くん"] = SvsdKun;

SvsdKun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.287, 5.21489);
      this.paths = ["m 0 0 c 0.322402 3.47355 3.79757 5.45994 7.287 5.21489 c 0.277989 -0.0195 1.2392 -0.21278 1.38604 -0.5511 c 0.208261 -0.47987 -0.251779 -0.77023 -0.379153 -0.7641 c -0.32067 0.0154 -0.75152 0.26713 -1.00689 1.3152"];
      break;
  }
};

SvsdSun = function() { SvsdChar.call(this, "SvsdSun", "すん", "SEL5CL1", "SEL", "CL", "black", false, p(0.0, -1.3)); };
SvsdSun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["すん"] = SvsdSun;

SvsdSun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.81235, 2.65909);
      this.paths = ["m 0 0 c 0.338408 1.04544 0.874149 2.55 2.81235 2.65909 c 0.231118 0.013 1.16839 -0.0193 1.38092 -0.3116 c 0.287052 -0.39473 -0.02316 -0.88905 -0.347275 -0.84667 c -0.286778 0.0375 -0.705286 0.31201 -1.03365 1.15827"];
      break;
  }
};

SvsdTsun = function() { SvsdChar.call(this, "SvsdTsun", "つん", "SE5CL1", "SE", "CL", "black", false, p(0.0, -1.1)); };
SvsdTsun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["つん"] = SvsdTsun;

SvsdTsun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.07253, 1.73028);
      this.paths = ["m 0 0 l 3.07253 1.73067 c 0.30043 0.18732 0.85559 0.6616 1.22842 0.5314 c 0.25143 -0.0878 0.46357 -0.31919 0.52345 -0.60359 c 0.10794 -0.51259 -0.82817 -0.8515 -1.75187 0.0718"];
      break;
  }
};

SvsdNun = function() { SvsdChar.call(this, "SvsdNun", "ぬん", "SER10CR1", "SER", "CR", "black", false, p(0.0, -2.6)); };
SvsdNun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぬん"] = SvsdNun;

SvsdNun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.99032, 3.30273);
      this.paths = ["m 0 0 c 2.23981 -0.0625 6.12876 -0.0869 7.99033 3.30273 c 0.15668 0.28529 0.34994 0.57988 0.42476 0.93044 c 0.0674 0.31561 0.0229 0.76323 -0.32507 0.87329 c -0.35016 0.11076 -1.5027 -0.51882 -0.0997 -1.80373"];
      break;
  }
};

WasedaWa = function() { WasedaChar.call(this, "WasedaWa", "わ", "UWL4", "WL", "EL", "black", false, p(1.8, -1.7)); };
WasedaWa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["わ"] = WasedaWa;

WasedaWa.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaShi":
      this.dp = p(1.94979, 3.31739);
      this.paths = ["m 0 0 c -0.14818 0.553004 -0.29433 1.21369 -0.29433 2.22289 c 0 0.9992 1.20263 1.5802 2.24412 1.0945"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  switch (model_ + "_" + _headModel) {
    case "NEL8_NEL8":
    case "NEL16_NEL8":
    case "E8CL4_NEL8":
      this.dp = p(1.55449, 3.58905);
      this.paths = ["m 0 0 c -0.5364 0.75686 -1.31763 1.85918 -0.837674 2.65251 c 0.419282 0.693045 1.22862 0.936541 2.39216 0.936541"];
      return;
  }

  switch (model_ + "_" + _head) {
    case "EL8CL1_EL":
      this.dp = p(1.69545, 2.69701);
      this.paths = ["m 0 0 c -0.69084 0.90515 -1.28108 2.22721 -0.596457 2.96901 c 0.521773 0.565352 1.69893 0.755071 2.29191 -0.272004"];
      return;

    case "SEL4CL1_E":
    case "SEL4CL1_NEL":
    case "EL8CL1_E":
    case "EL8CL1_NEL":
      this.dp = p(1.33575, 3.43358);
      this.paths = ["m 0 0 c -0.634071 0.83077 -1.18484 1.69014 -0.927046 2.44396 c 0.294368 0.86077 1.26079 0.989621 2.2628 0.989621"];
      return;

    case "SEL4CL1_EL":
      this.dp = p(1.29644, 2.80849);
      this.paths = ["m 0 0 c -0.634071 0.83077 -1.18484 1.69014 -0.927046 2.44396 c 0.294368 0.86077 1.43348 1.15453 2.22348 0.364529"];
      return;

    case "NEL8_E":
      this.dp = p(1.55449, 3.33758);
      this.paths = ["m 0 0 c -0.5364 0.75686 -1.31763 1.85918 -0.837674 2.65251 c 0.419282 0.693045 1.35069 0.685067 2.39216 0.685067"];
      return;
  }

  switch (model_) {
    case "SEL4CL1":
    case "EL8CL1":
      this.dp = p(1.33575, 3.241);
      this.paths = ["m 0 0 c -0.634071 0.83077 -1.18484 1.69014 -0.927046 2.44396 c 0.294368 0.86077 1.38284 1.25889 2.2628 0.79704"];
      return;

    case "NEL8":
    case "NEL16":
    case "E8CL1":
    case "E8CL4":
    case "E16CL1":
      this.dp = p(1.55449, 3.07978);
      this.paths = ["m 0 0 c -0.5364 0.75686 -1.31763 1.85918 -0.837674 2.65251 c 0.419282 0.693045 1.35116 0.91327 2.39216 0.42727"];
      return;

    case "NEL16CL8":
      this.dp = p(1.93729, 3.58864);
      this.paths = ["m 0 0 c -0.22488 0.89047 -0.393661 1.48868 -0.306835 2.49414 c 0.083344 0.965136 1.20263 1.5802 2.24412 1.0945"];
      return;

  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NE":
      this.dp = p(0.385501, 3.40691);
      this.paths = ["m 0 0 c -0.829292 0.602516 -1.85862 1.79935 -1.85862 2.47784 c 0 0.9992 1.20263 1.41477 2.24412 0.929072"];
      return;
  }

  //switch (_name) {}

  switch (_headModel) {
    case "NEL16":
      this.dp = p(0.4109, 3.203);
      this.paths = ["m 0 0 c -0.9755 0.375 -2.15574 1.72647 -1.97805 2.64047 c 0.1735 0.893 1.0456 1.33239 2.38895 0.56253"];
      return;

    case "SER16":
      this.dp = p(0.290882, 3.68363);
      this.paths = ["m 0 0 c -0.975201 0.2797 -1.83318 1.0997 -1.83318 2.1089 c 0 0.9992 1.07608 0.99382 2.12406 1.57473"];
      return;

    case "NEL8":
      this.dp = p(0.4109, 3.203);
      this.paths = ["m 0 0 c -0.9756 0.375 -2.0108 1.195 -1.8331 2.109 c 0.1735 0.893 1.2531 1.094 2.244 1.094"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(0.476898, 4.18281);
      this.paths = ["m 0 0 c -0.975201 0.2797 -1.83318 1.0997 -1.83318 2.1089 c 0 0.9992 1.649 1.61101 2.31008 2.07391"];
      return;
  }

  switch (_head) {
    case "SE":
      this.dp = p(0.780574, 2.53134);
      this.paths = ["m 0 0 c -0.975201 0.2797 -1.83318 1.0997 -1.83318 2.1089 c 0 0.9992 1.56372 1.47247 2.61375 0.422439"];
      return;

    case "E":
      this.dp = p(0.411, 3.2032);
      this.paths = ["m 0 0 c -0.9753 0.3745 -2.0295 1.2338 -1.8517 2.1481 c 0.1736 0.8931 1.2689 1.0551 2.2627 1.0551"];
      return;

    case "EL":
      this.dp = p(0.96477, 2.28926);
      this.paths = ["m 0 0 c -0.975 0.3745 -1.833 1.0997 -1.833 2.1089 c 0 1.7052 2.34522 1.5649 2.79777 0.180359"];
      return;
  }

  this.dp = p(0.410938, 3.2034);
  this.paths = ["m 0 0 c -0.975201 0.2797 -1.83318 1.0997 -1.83318 2.1089 c 0 0.9992 1.20263 1.5802 2.24412 1.0945"];
};

WasedaKu = function() { WasedaChar.call(this, "WasedaKu", "く", "E8CL4", "E", "ECL4", "black", false, p(0.0, 0.9)); };
WasedaKu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["く"] = WasedaKu;

WasedaKu.prototype.setPaths = function() {
  this.right = 8;

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) { }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_model) {
    case "SWR4":
    case "SWR4F":
      this.dp = p(3.88904, -0.053282);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.074488 6.4 0 c 1.01376 0.035402 0.38803 -1.44555 -0.00786 -1.96908 c -0.544934 -0.720644 -1.89375 -1.30597 -2.60496 -0.748789 c -0.699693 0.548157 -0.154662 1.20979 0.10186 2.66459"];
      return;
  }

  switch (_headModel) {
    case "SEL16":
      this.dp = p(3.88904, -0.053281);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.0745 6.4 0 c 1.847 0.0645 1.57245 -2.97824 -0.369508 -3.15733 c -1.05667 -0.097446 -1.68438 0.878422 -2.14145 3.10405"];
      return;

    case "EL8":
      this.dp = p(7.3, -0.0108);
      this.paths = ["m 0 0 c 2.498 -0.131 5.004 -0.1745 7.499 0 c 0.255 0.0133 0.429 -0.2262 0.504 -0.4864 c 0.971 -3.1761 -5.329 -2.3279 -2.573 -0.096 c 0.519 0.4198 1.238 0.3785 1.87 0.5716"];
      return;

    case "EL16":
      this.dp = p(8, 0);
      this.paths = ["m 0 0 c 2.132 0 4.48196 0.007266 6.59119 -0.002903 c 1.8481 -0.00891 1.53778 -1.48537 1.06017 -2.11164 c -0.728014 -0.95461 -3.44133 -0.490191 -3.53154 0.70695 c -0.103389 1.37197 3.27916 1.26887 3.88017 1.40759"];
      return;

    case "ER16":
      this.dp = p(8.71234, -0.77994);
      this.paths = ["m 0 0 c 2.6652 -0.1864 5.3383 -0.2329 7.9999 0 c 1.0614 0.0928 1.1317 -2.241 -1.1419 -2.241 c -1.0213 0 -2.10023 0.692562 -1.851 1.4317 c 0.394649 1.17041 2.40504 0.502658 3.70534 0.02936"];
      return;

    case "ER8":
      this.dp = p(8.70691, -0.921319);
      this.paths = ["m 0 0 c 2.6653 -0.1864 5.3383 -0.23291 7.9999 0 c 1.0615 0.09289 1.1318 -2.241 -1.1418 -2.241 c -1.0213 0 -1.9973 0.6793 -1.8511 1.4317 c 0.2131 1.0964 2.09277 0.537313 3.69991 -0.112019"];
      return;

    case "UWL4":
      this.dp = p(3.23545, -0.0699);
      this.paths = ["m 0 0 c 2.1327 -0.074 4.2691 -0.112 6.4001 0 c 0.8966 0.031 0.5759 -1.4556 0.07654 -1.77228 c -1.03059 -0.65357 -2.71257 1.00977 -3.24119 1.70238"];
      return;

    case "SER4":
      this.dp = p(4.89233, -0.040242);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.074488 6.4 0 c 1.03737 0.036226 0.614657 -1.07061 0.315545 -1.47458 c -0.960815 -1.29765 -3.75498 -1.48397 -4.82631 -0.412645 c -0.972264 0.972263 1.87116 1.05398 3.00309 1.84698"];
      return;

    case "SER8":
      this.dp = p(4.875, -0.089);
      this.paths = ["m 0 0 c 2.5 -0.087 5.001 -0.131 7.499 0 c 0.273 0.01 0.504 -0.207 0.504 -0.486 c 0.0209 -1.19995 -1.10388 -1.67276 -1.98725 -1.97802 c -1.33818 -0.46243 -3.66892 -0.45869 -4.21812 0.49849 c -0.49073 0.85527 2.7376 1.64745 3.07737 1.87653"];
      return;

    case "SER16":
      this.dp = p(6.11041, -0.055634);
      this.paths = ["m 0 0 c 2.5001 -0.0873 5.0016 -0.1309 7.4998 0 c 0.2729 0.0095 0.5036 -0.2074 0.5036 -0.4864 c 0.02659 -1.52295 -1.69646 -2.1773 -3.00769 -2.16166 c -1.62062 0.01933 -3.03258 1.08061 -1.43997 1.6347 c 0.67823 0.235964 1.32988 0.250586 2.55468 0.957725"];
      return;

    case "SW8":
      this.dp = p(4.55466, -0.05328);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.93263 -0.074488 7.06563 0 c 1.01877 0.035577 1.19687 -1.58383 0.566574 -2.57855 c -0.512412 -0.808677 -1.79507 -0.998311 -2.23199 0.202126 c -0.170818 0.469321 -0.515553 1.50943 -0.845547 2.32314"];
      return;

    case "SWR8":
    case "SWR16":
      this.dp = p(3.88903, -0.05328);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.26604 -0.038241 6.4 0 c 0.979302 0.017549 0.939513 -1.58317 0.062936 -2.54276 c -0.639429 -0.699986 -1.91317 -0.945394 -2.62872 -0.53227 c -0.654212 0.377711 0.054816 1.25529 0.054816 3.02175"];
      return;
  }

  switch (_head) {
    case "NE":
     this.dp = p(3.28326, -0.055837);
     this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.0745 6.4 0 c 1.847 0.0645 1.25233 -3.1924 0.21129 -2.4637 c -0.684 0.4789 -2.53223 1.73865 -3.32803 2.40786"];
     return;

    case "S":
      this.dp = p(5.0004, -0.0872);
      this.paths = ["m 0 0 c 2.5002 -0.0873 5.0017 -0.1309 7.5001 0 c 0.27 0.0142 0.4901 -0.2163 0.495 -0.4949 c 0.0699 -2.0024 -3.1828 -2.3955 -3.1828 -1.3825 c 0 0.6017 0.1881 1.1885 0.1881 1.7902"];
      return;

    case "SW":
      this.dp = p(4.12954, -0.057898);
      this.paths = ["m 0 0 c 2.132 -0.084324 4.267 -0.08431 6.39999 0 c 1.2393 0 1.483 -2.00641 0.780494 -2.87679 c -0.601818 -0.745626 -1.78593 -0.469771 -2.32654 0.828673 c -0.187325 0.514655 -0.469132 1.28888 -0.724408 1.99022"];
      return;

    case "SE":
      this.dp = p(3.88904, -0.053282);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.0745 6.4 0 c 1.69524 0 0.124345 -1.80962 -0.530824 -2.14909 c -1.07287 -0.555891 -2.6267 -0.34981 -3.05013 0.054365 c -0.555749 0.530477 0.198596 1.17006 1.06999 2.04144"];
      return;

    case "E":
      this.dp = p(8, -0);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.9132 -0.074488 7.0462 0 c 1.07007 0.037368 1.10131 -1.13741 0.751189 -1.61804 c -0.643246 -0.883019 -3.0735 -0.67558 -3.25265 0.4021 c -0.152034 0.91456 2.26523 1.21594 3.45526 1.21594"];
      return;

    case "SEL":
      this.dp = p(3.88904, -0.053282);
      this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.0745 6.4 0 c 1.847 0.0645 1.27788 -3.23014 -0.664073 -3.40923 c -1.05667 -0.097446 -1.82929 2.2619 -1.84689 3.35595"];
      return;
  }

  this.dp = p(3.88904, -0.053282);
  this.paths = ["m 0 0 c 2.132 -0.0745 4.267 -0.0745 6.4 0 c 1.847 0.0645 1.25233 -3.1924 0.21129 -2.4637 c -0.684 0.4789 -2.13225 1.82002 -2.72225 2.41042"];
};

WasedaKe = function() { WasedaChar.call(this, "WasedaKe", "け", "E16CL1", "E", "ECL", "black", false, p(0.0, 0.5)); };
WasedaKe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["け"] = WasedaKe;

WasedaKe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(14.3169, -0.044538);
      this.paths = ["m 0 0 c 5.0002 -0.1746 10.0087 -0.349 15 0 c 0.2628 0.0092 0.517963 -0.283848 0.571017 -0.54051 c 0.0544 -0.263157 -0.05102 -0.708348 -0.317762 -0.740893 c -0.513298 -0.06263 -0.822443 0.923965 -0.936343 1.23687"];
      return;

    case "SWR":
      this.dp = p(14.3495, -0.0448);
      this.paths = ["m 0 0 c 4.9965 -0.2618 10.0034 -0.2618 15 0 c 0.2699 0.0142 0.496505 -0.26166 0.495 -0.495 c -0.0023 -0.349813 -0.411668 -0.815058 -0.751594 -0.732445 c -0.403749 0.098124 -0.393862 0.352751 -0.393862 1.18264"];
      return;

    case "SEL":
      this.dp = p(14.2109, -0.039166);
      this.paths = ["m 0 0 c 4.9965 -0.2618 10.0034 -0.2618 15 0 c 0.2699 0.0142 0.490614 -0.216366 0.495 -0.495 c 0.0127 -0.811004 -0.567848 -0.932944 -0.767154 -0.709263 c -0.260754 0.292643 -0.516975 0.605379 -0.516975 1.1651"];
      return;

    case "E":
      this.dp = p(15.4887, 0.021419);
      this.paths = ["m 0 0 c 4.99748 0 10.0024 0 15 0 c 0.2699 0.0142 0.543088 -0.266663 0.495 -0.495 c -0.06578 -0.312346 -0.584509 -0.486739 -0.8927 -0.346515 c -0.375333 0.170772 -0.689204 0.862934 0.886392 0.862934"];
      return;

    case "S":
     this.dp = p(14.4396, -0.02826);
     this.paths = ["m 0 0 c 4.9965 -0.2618 10.0034 -0.2618 15 0 c 0.2699 0.0142 0.4853 -0.2165 0.495 -0.495 c 0 -0.971122 -0.69289 -0.865939 -0.899239 -0.519408 c -0.170277 0.285955 -0.156175 0.576677 -0.156175 0.986148"];
     return;

    default:
      this.dp = p(14.0904, -0.0448);
      this.paths = ["m 0 0 c 4.9965 -0.2618 10.0034 -0.2618 15 0 c 0.2699 0.0142 0.4853 -0.2165 0.495 -0.495 c 0.0127 -0.3655 -0.3393 -0.5802 -0.5561 -0.3983 c -0.307 0.2576 -0.5909 0.5415 -0.8485 0.8485"];
      break;
  }

  switch (this.getNextHeadModel()) {
    case "ER8":
      this.dp = p(15.495, -0.495);
      this.paths = ["m 0 0 c 4.99656 -0.262 10.0034 -0.262 15 0 c 0.2699 0.014 0.561845 -0.22395 0.495 -0.495 c -0.145958 -0.59184 -0.435556 -0.69907 -0.698982 -0.62394 c -0.262078 0.0747 -0.498252 0.33 -0.541307 0.46811 c -0.07713 0.24743 0.246543 0.67314 1.24029 0.15583"];
      break;

    case "ER16":
      this.dp = p(15.9203, -0.708327);
      this.paths = ["m 0 0 c 4.99656 -0.2619 10.0034 -0.2619 15 0 c 0.986194 0.05169 1.25342 -0.957776 0.439318 -1.39679 c -0.599829 -0.323463 -1.3404 0.524022 -1.12758 0.972392 c 0.233471 0.491865 1.07591 -0.110871 1.60852 -0.283931"];
      break;
    case "EL4":
      this.dp = p(15, 0);
      this.paths = ["m 0 0 c 4.9965 -0.2618 10.0034 -0.2618 15 0 c 0.2699 0.0142 0.555225 -0.269561 0.495 -0.495 c -0.125561 -0.470008 -1.17026 -0.803634 -1.40917 -0.379852 c -0.207139 0.367412 0.561684 0.687428 0.914175 0.874852"];
      return;

    case "EL8":
      this.dp = p(15.3539, -0.133);
      this.paths = ["m 0 0 c 4.9963 -0.262 10.0033 -0.262 15 0 c 0.2576 0.014 0.4425 -0.225 0.4949 -0.495 c 0.120228 -1.36625 -2.03115 -1.1534 -1.30929 -0.22083 c 0.208395 0.26923 0.845094 0.47783 1.16829 0.58283"];
      break;

    case "SER8":
      this.dp = p(15, 0);
      this.paths = ["m 0 0 c 5.001 -0.1747 10.009 -0.3491 15 0 c 0.261 0.0091 0.50586 -0.244212 0.512 -0.4775 c 0.007 -0.277346 -0.30542 -0.547201 -0.578 -0.5989 c -0.30817 -0.05845 -0.82295 0.07888 -0.856 0.3908 c -0.0403 0.380858 0.588 0.4524 0.922 0.6856"];
      break;
  }
};

WasedaGu = function() { WasedaChar.call(this, "WasedaGu", "ぐ", "E8CL4", "E", "ECL4", "black", false, p(0.0, 0.9)); };
WasedaGu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぐ"] = WasedaGu;
WasedaGu.prototype.setPaths = WasedaKu.prototype.setPaths;
WasedaGu.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.5,1v0.1"];
};

WasedaKo = function() { WasedaChar.call(this, "WasedaKo", "こ", "E16", "E", "E", "black", false, p(0.0, 0.0)); };
WasedaKo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こ"] = WasedaKo;

WasedaKo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E": 
    case "SER":
      this.dp = p(15.5076, 0.2);
      this.paths = ["m 0 0 l 16 0 l -0.4024 0.2"];
      break;

    default:
      this.dp = p(16, 0);
      this.paths = ["m 0 0 l 16 0"];
      break;
  }
};

WasedaNi = function() { WasedaChar.call(this, "WasedaNi", "に", "EL8CL1", "EL", "ELCL", "black", false, p(0.0, -0.1)); };
WasedaNi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["に"] = WasedaNi;

WasedaNi.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "OSEL4":
      this.dp = p(7.54888, 0.78447);
      this.paths = ["m 0 0 c 2.2359 0.66896 8.14076 1.91943 8.14076 0 c 0.04476 -0.72566 -1.25322 -0.92654 -1.11872 -0.37202 c 0.05475 0.22571 0.134588 0.47736 0.526836 1.15649"];
      return;

    case "NEL8":
      this.dp = p(7.9375, -2e-06);
      this.paths = ["m 0 0 c 2.198 0.6302 7.9375 1.913 7.9375 0 c 0 -0.4872 -0.249561 -0.723292 -0.559841 -0.747084 c -0.373313 -0.02862 -0.949046 0.441014 -0.802738 0.785652 c 0.177557 0.418246 1.00498 0.159589 1.36258 -0.03857"];
      return;

    case "ER4":
      this.dp = p(7.86178, 0.40521);
      this.paths = ["m 0 0 c 2.189 0.6692 7.97 1.9201 7.97 0 c 0 -0.556572 -0.818181 -0.394055 -1.16516 -0.132416 c -0.225183 0.169801 -0.391466 0.576847 -0.186635 0.787268 c 0.296999 0.305104 0.519605 0.168357 1.24357 -0.249642"];
      return;

    case "ER8":
      this.dp = p(7.684, 0.6098);
      this.paths = ["m 0 0 c 2.189 0.6692 7.97 1.9201 7.97 0 c 0 -0.4888 -0.518801 -0.426783 -0.807466 -0.364501 c -0.32657 0.07046 -0.771036 0.436473 -0.6622 0.752333 c 0.130776 0.379534 0.552592 0.489842 1.18367 0.221968"];
      return;

    case "ER16":
      this.dp = p(7.87948, 0.31394);
      this.paths = ["m 0 0 c 2.192 0.628 7.941 1.913 7.941 0 c 0 -0.39779 -0.25124 -0.45017 -0.46881 -0.45432 c -0.40384 -0.008 -1.05207 0.43459 -0.9017 0.80946 c 0.16253 0.40516 0.77899 0.13085 1.30899 -0.0412"];
      return;

    case "SER8":
      this.dp = p(7.684, 0.6098);
      this.paths = ["m 0 0 c 2.189 0.6692 7.97 1.9201 7.97 0 c 0 -0.4888 -0.29185 -0.797645 -0.644 -0.8549 c -0.266134 -0.04327 -0.642934 0.190004 -0.666307 0.458617 c -0.041488 0.476785 0.640935 0.747493 1.02431 1.00608"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(6.9736, 0.8815);
      this.paths = ["m 0 0 c 2.1916 0.6285 7.9404 1.9127 7.9404 0 c 0 -0.8314 -0.4079 -0.787 -0.5701 -0.316 c -0.1369 0.3977 -0.2528 0.8023 -0.3967 1.1975"];
      break;

    case "E":
      this.dp = p(7.919, 0.1906);
      this.paths = ["m 0 0 c 2.192 0.6285 7.941 1.9127 7.941 0 c -0.11 -0.6925 -1.116 -0.5097 -1.333 -0.0644 c -0.286 0.587 0.656 0.255 1.311 0.255"];
      break;


    case "SEL":
      this.dp = p(6.62844, 0.919473);
      this.paths = ["m 0 0 c 2.189 0.6692 7.41104 1.87381 7.97 0 c 0.208342 -0.698423 -0.352937 -0.825991 -0.750642 -0.370316 c -0.317634 0.363934 -0.475665 0.859662 -0.590917 1.28979"];
      break;

    default:
      this.dp = p(7.684, 0.6098);
      this.paths = ["m 0 0 c 2.189 0.6692 7.97 1.9201 7.97 0 c 0 -0.4888 -0.335 -0.7721 -0.644 -0.8549 c -0.307 -0.0881 -0.569 0.0282 -0.417 0.3028 c 0.233 0.4034 0.481 0.7998 0.775 1.1619"];
      break;
  }

  switch (this.getNextModel()) {
    case "EL4":
      this.dp = p(7.7294, 0.522);
      this.paths = ["m 0 0 c 2.2021 0.5901 7.94 1.9126 7.94 0 c 0 -0.4871 -0.3989 -0.7351 -0.7537 -0.7537 c -0.244 -0.0171 -0.4489 0.0391 -0.4489 0.2837 c 0 0.5033 0.5349 0.7489 0.992 0.992"];
      break;

    case "EL8":
    case "EL8CL1":
    case "EL8CL4":
      this.dp = p(7.7293, 0.522);
      this.paths = ["m 0 0 c 2.202 0.5901 7.9399 1.9126 7.9399 0 c 0 -0.4871 -0.3988 -0.7351 -0.7537 -0.7537 c -0.244 -0.0171 -0.606 0.2264 -0.606 0.471 c 0 0.5154 0.6321 0.6367 1.1491 0.8047"];
      break;

    case "SE3":
    case "SE4":
      this.dp = p(7.65886, 0.602626);
      this.paths = ["m 0 0 c 2.1804 0.6666 7.9404 1.913 7.9404 0 c 0 -0.5019 -0.4925 -0.930837 -0.888932 -0.837865 c -0.229993 0.053938 -0.657821 0.300888 -0.245834 0.664695 c 0.35665 0.314942 0.521167 0.471473 0.853225 0.775796"];
      return;

    case "UWL4":
      this.dp = p(6.6457, 0.97086);
      this.paths = ["m 0 0 c 2.1942 0.588 8.17049 1.9049 8.2352 0 c 0.03699 -1.08907 -1.06087 0.27825 -1.5895 0.97086"];
      break;
  }
};

WasedaNe = function() { WasedaChar.call(this, "WasedaNe", "ね", "EL16CL1", "EL", "ELCL", "black", false, p(0.0, -0.3)); };
WasedaNe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ね"] = WasedaNe;

WasedaNe.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "ER4":
      this.dp = p(15.8002, 0.183);
      this.paths = ["m 0 0 c 2.87 0.558 15.821 2.735 15.821 0 c 0 -0.355 -0.457412 -0.40155 -0.7194 -0.351 c -0.420711 0.0812 -1.08607 0.58742 -0.8626 0.953 c 0.281024 0.45973 0.9627 -0.073 1.5612 -0.419"];
      return;

    case "EL4":
      this.dp = p(15.461, 0.723);
      this.paths = ["m 0 0 c 2.881 0.56 15.881 2.746 15.881 0 c 0 -0.211 -0.212122 -0.417 -0.414081 -0.469746 c -0.283073 -0.073931 -0.756648 0.006845 -0.828228 0.290521 c -0.09956 0.394546 0.184511 0.563097 0.822309 0.902225"];
      return;

    case "EL8":
      this.dp = p(15.8362, 0.264963);
      this.paths = ["m 0 0 c 2.881 0.56 15.881 2.746 15.881 0 c 0.03215 -0.753708 -0.757525 -0.989674 -1.12758 -0.638587 c -0.424717 0.424716 0.263158 0.652977 1.0828 0.90355"];
      return;

    case "EL16":
      this.dp = p(15.8362, 0.26496);
      this.paths = ["m 0 0 c 2.881 0.56 15.881 2.746 15.881 0 c 0.03215 -0.753708 -0.757525 -0.989674 -1.12758 -0.638587 c -0.424717 0.424716 0.282279 0.742297 1.0828 0.903547"];
      return;

    case "ER8":
      this.dp = p(15.7465, 0.335628);
      this.paths = ["m 0 0 c 2.8701 0.5579 15.821 2.7354 15.821 0 c 0 -0.3547 -0.283566 -0.505143 -0.522755 -0.492922 c -0.490901 0.02508 -1.2124 0.691469 -0.964185 1.11573 c 0.242622 0.4147 0.80478 -0.0038 1.41248 -0.287184"];
      return;

    case "ER16":
      this.dp = p(15.8002, 0.183);
      this.paths = ["m 0 0 c 2.87009 0.558 15.821 2.736 15.821 0 c 0 -0.355 -0.514445 -0.51219 -0.831831 -0.47592 c -0.362513 0.0414 -0.945034 0.40784 -0.802969 0.74392 c 0.209763 0.49623 1.0014 0.114 1.614 -0.085"];
      return;

    case "SER8":
      this.dp = p(15.4031, 0.72);
      this.paths = ["m 0 0 c 2.8793 0.508 15.8213 2.735 15.8213 0 c 0 -0.256 -0.112213 -0.48394 -0.3117 -0.562 c -0.377896 -0.14788 -1.07741 -0.017 -1.15622 0.3811 c -0.08954 0.45232 0.422772 0.46194 1.04972 0.9009"];
      return; 
  }

  switch (this.getNextHeadType()) {
    case "E":
      this.dp = p(15.8213, -0);
      this.paths = ["m 0 0 c 2.87017 0.558 15.8213 2.735 15.8213 0 c 0 -0.343 -0.164113 -0.899306 -0.625879 -0.957407 c -0.419685 -0.052805 -1.1805 0.288565 -1.15719 0.704 c 0.02739 0.48828 0.885946 0.227665 1.78307 0.253407"];
      return;

    case "SW":
      this.dp = p(14.6141, 1.062);
      this.paths = ["m 0 0 c 2.8794 0.508 15.8213 2.735 15.8213 0 c 0 -0.703 -0.58365 -0.651132 -0.733281 -0.240039 c -0.151 0.414857 -0.323019 0.887039 -0.473919 1.30204"];
      return;

    case "NER":
      this.dp = p(14.2543, 1.16319);
      this.paths = ["m 0 0 c 2.881 0.56 15.8965 2.74596 15.881 0 c -0.0028 -0.498484 -0.190417 -0.593657 -0.435923 -0.593657 c -0.341418 0 -1.02975 1.15576 -1.19081 1.75685"];
      break;

    default:
      this.dp = p(15.461, 0.723);
      this.paths = ["m 0 0 c 2.881 0.56 15.881 2.746 15.881 0 c 0 -0.211 -0.054 -0.418 -0.182 -0.56 c -0.12 -0.148 -0.291 -0.251 -0.493 -0.251 c -0.764 0 -0.074 0.964 0.255 1.534"];
      break;
  }
};

WasedaNu = function() { WasedaChar.call(this, "WasedaNu", "ぬ", "EL8CL4", "EL", "ELCL4", "black", false, p(0.0, 0.6)); };
WasedaNu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぬ"] = WasedaNu;

WasedaNu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SER4":
    case "SER8":
      this.dp = p(5.87659, 1.03276);
      this.paths = ["m 0 0 c 2.17652 0.7072 7.9701 1.9199 7.9701 0 c 0 -1.27517 -1.15006 -1.80581 -2.09248 -1.94966 c -0.938167 -0.143201 -2.37646 0.221909 -2.56719 1.23106 c -0.176694 0.934888 1.48943 1.078 2.56616 1.75137"];
      return;

    case "SWR8":
      this.dp = p(3.77542, 0.8628);
      this.paths = ["m 0 0 c 2.17652 0.7072 8.09027 1.91614 7.9701 0 c -0.10209 -1.62789 -3.27209 -2.61596 -4.51653 -1.61254 c -0.647728 0.522277 0.321846 1.58226 0.321846 2.47534"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(7.411, 0.204);
      this.paths = ["m 0 0 c 2.1804 0.6666 7.9407 1.3575 7.9407 -0.5553 c 0 -0.6526 -0.6922 -1.1997 -1.2952 -1.2952 c -0.973 -0.1891 -2.8135 0.2503 -2.7617 1.2402 c 0.0746 1.4221 1.9804 0.8683 3.5272 0.8143"];
      return;

    case "SEL":
      this.dp = p(4.34859, 0.8628);
      this.paths = ["m 0 0 c 2.17652 0.7072 7.47292 1.8555 7.9701 0 c 0.308342 -1.15075 -0.523314 -1.88768 -1.29659 -1.92735 c -1.20902 -0.062018 -2.32492 1.3439 -2.32492 2.79015"];
      return;
  }

  this.dp = p(3.77542, 0.8628);
  this.paths = ["m 0 0 c 2.17652 0.7072 7.9701 1.9199 7.9701 0 c 0 -0.3301 -0.20058 -0.5731 -0.51288 -0.6806 c -0.31037 -0.113 -0.71713 -0.0975 -1.11313 0.0389 c -0.94335 0.3433 -1.7885 0.8728 -2.56867 1.5045"];
};

SvsdEn = function() { SvsdChar.call(this, "SvsdEn", "えん", "S10CR1", "S", "CR", "black", false, p(1.0, -5.0)); };
SvsdEn.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["えん"] = SvsdEn;

SvsdEn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(0, 7.93958);
      this.paths = ["m 0 0 v 8.41643 c 0 0 0.0258 0.92612 -0.04305 1.20913 c -0.12549 0.51585 -0.384672 0.551463 -0.577778 0.414136 c -0.594896 -0.423056 0.155247 -1.29371 0.620828 -2.10011"];
      return;

    case "S":
      this.dp = p(-0.04305, 9.62556);
      this.paths = ["m 0 0 v 8.41643 c 0 0 0.0258 0.92612 -0.04305 1.20913 c -0.12549 0.51585 -0.974068 0.387258 -1.12269 0.0435 c -0.138831 -0.321111 -0.000595 -0.861725 0.335927 -1.05064 c 0.498242 -0.279695 0.786763 0.162013 0.786763 1.00714"];
      return;
  }

  this.dp = p(-1e-06, 8.41646);
  this.paths = ["m 0 0 v 8.41643 c 0 0 0.0258 0.92612 -0.04305 1.20913 c -0.12549 0.51585 -1.02291 0.40942 -1.12269 0.0435 c -0.149656 -0.54884 0.254705 -0.80597 1.16574 -1.2526"];
};

SvsdKen = function() { SvsdChar.call(this, "SvsdKen", "けん", "SL10CL1", "SL", "CL", "black", false, p(1.5, -4.9)); };
SvsdKen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["けん"] = SvsdKen;

SvsdKen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "EL5":
      this.dp = p(0.284689, 9.84568);
      this.paths = ["m 0 0 c -1.63643 2.53073 -2.08843 6.05658 -0.640023 8.94219 c 0.10036 0.19995 0.497655 0.96122 0.924712 0.90349 c 0.346799 -0.0469 0.6757 -0.101526 0.708248 -0.365134 c 0.041044 -0.332424 -0.452266 -0.808626 -0.754317 -0.663866 c -0.309622 0.148389 -0.390404 0.480778 0.046069 1.029"];
      return;

    case "NEL5":
      this.dp = p(0.284689, 9.84568);
      this.paths = ["m 0 0 c -1.63643 2.53073 -2.08843 6.05658 -0.640023 8.94219 c 0.10036 0.19995 0.497655 0.96122 0.924712 0.90349 c 0.346799 -0.0469 0.647377 -0.338106 0.58272 -0.612356 c -0.097575 -0.413875 -0.706517 -0.452614 -0.891618 -0.133708 c -0.135118 0.23279 0.068099 0.601595 0.308898 0.746064"];
      return;
  }

  //switch (_head) {}

  this.dp = p(-0.582933, 9.05614);
  this.paths = ["m 0 0 c -1.63643 2.53073 -2.08843 6.05658 -0.640023 8.94219 c 0.10036 0.19995 0.497655 0.96122 0.924712 0.90349 c 0.346799 -0.0469 0.75273 -0.57082 0.529199 -0.90672 c -0.273963 -0.4117 -1.09938 -0.12136 -1.39682 0.11718"];
};

SvsdSen = function() { SvsdChar.call(this, "SvsdSen", "せん", "SL5CL1", "SL", "CL", "black", false, p(0.7, -2.4)); };
SvsdSen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["せん"] = SvsdSen;

SvsdSen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.50385, 4.24487);
      this.paths = ["m 0 0 c -0.44045 1.21912 -1.10421 2.88152 -0.50385 4.24483 c 0.0653 0.1484 0.40419 0.60941 0.73201 0.5805 c 0.2464 -0.0217 0.58101 -0.17179 0.57401 -0.59356 c -0.0109 -0.6562 -0.94649 -0.42145 -1.30602 0.0131"];
      break;
  }
};

SvsdTen = function() { SvsdChar.call(this, "SvsdTen", "てん", "S5CR1", "S", "CR", "black", false, p(1.2, -2.5)); };
SvsdTen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["てん"] = SvsdTen;

SvsdTen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "SvsdKa":
    case "SvsdKan":
    case "SvsdKa":
      this.dp = p(-0.000631, 3.71813);
      this.paths = ["m 0 0 l -0.005 3.43802 c 0 0 0.0258 0.92612 -0.043 1.20913 c -0.07213 0.296494 -0.719466 0.19258 -0.979071 -0.0052 c -0.228397 -0.174003 -0.397798 -0.594049 -0.233098 -0.829242 c 0.241507 -0.344875 0.654204 -0.363673 1.25954 -0.094578"];
      return;
  }

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.00495, 3.43805);
  this.paths = ["m 0 0 l -0.005 3.43802 c 0 0 0.0258 0.92612 -0.043 1.20913 c -0.12549 0.51585 -1.0229 0.40942 -1.12269 0.0435 c -0.14966 -0.54884 0.2547 -0.80597 1.16574 -1.2526"];
};

SvsdNen = function() { SvsdChar.call(this, "SvsdNen", "sr10cr1", "SR10CR1", "SR", "CR", "black", false, p(0.8, -4.9)); };
SvsdNen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ねん"] = SvsdNen;

SvsdNen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.65674, 9.25179);
      this.paths = ["m 0 0 c 2.75892 2.483 2.4602 6.79214 0.65674 9.25179 c -0.10124 0.13806 -0.49885 0.66368 -0.8343 0.59713 c -0.32255 -0.064 -0.75711 -0.53316 -0.52228 -0.83689 c 0.38043 -0.49206 1.14563 -0.26439 1.35658 0.23976"];
      break;
  }
};

NakaneNan = function() { NakaneChar.call(this, "NakaneNan", "なん", "CL1EL7", "CL", "EL", "black", false, p(0.7, 0.4)); };
NakaneNan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["なん"] = NakaneNan;
NakaneChar.dict["なら"] = NakaneNan;

NakaneNan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.11113, -0.56503);
      this.paths = ["m 0 0 c 0.74728 -0.75698 0.512533 -1.29231 0.205499 -1.3666 c -0.337191 -0.0816 -0.876787 0.0783 -0.915211 0.60518 c -0.02626 0.36011 0.522454 0.67455 0.709712 0.76142 c 2.02869 0.94113 5.16345 0.58632 6.11113 -0.56503"];
      break;
  }
};

NakaneNin = function() { NakaneChar.call(this, "NakaneNin", "にん", "CL1EL7", "CL", "EL", "black", true, p(0.7, 0.4)); };
NakaneNin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["にん"] = NakaneNin;
NakaneNin.prototype.setPaths = NakaneNan.prototype.setPaths;

NakaneNun = function() { NakaneChar.call(this, "NakaneNun", "ぬん", "CL1EL17", "C", "EL", "black", false, p(0.5, -0.2)); };
NakaneNun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぬん"] = NakaneNun;

NakaneNun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.167, -0.57623);
      this.paths = ["m 0 0 c 0.829034 -0.48509 0.648481 -0.9732 0.404567 -1.2159 c -0.211707 -0.21065 -0.965879 0.0572 -0.938587 0.5118 c 0.02014 0.33549 0.377248 0.60625 0.53402 0.7041 c 5.39104 3.36479 12.6516 1.25134 16.167 -0.57623"];
      break;
  }
};

NakaneNun.prototype.setPathsExtra = NakaneNu.prototype.setPathsExtra;

NakaneNen = function() { NakaneChar.call(this, "NakaneNen", "ねん", "CL1EL17", "C", "EL", "black", true, p(0.5, -0.2)); };
NakaneNen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ねん"] = NakaneNen;

NakaneNen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.167, -0.57623);
      this.paths = ["m 0 0 c 0.829034 -0.48509 0.648481 -0.9732 0.404567 -1.2159 c -0.211707 -0.21065 -0.965879 0.0572 -0.938587 0.5118 c 0.02014 0.33549 0.377248 0.60625 0.53402 0.7041 c 5.39104 3.36479 12.6516 1.25134 16.167 -0.57623"];
      break;
  }
};

NakaneNun.prototype.setPathsExtra = NakaneNu.prototype.setPathsExtra;

NakaneNen = function() { NakaneChar.call(this, "NakaneNen", "ねん", "CL1EL17", "C", "EL", "black", true, p(0.5, -0.2)); };
NakaneNen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ねん"] = NakaneNen;

NakaneNen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.167, -0.57623);
      this.paths = ["m 0 0 c 0.829034 -0.48509 0.648481 -0.9732 0.404567 -1.2159 c -0.211707 -0.21065 -0.965879 0.0572 -0.938587 0.5118 c 0.02014 0.33549 0.377248 0.60625 0.53402 0.7041 c 5.39104 3.36479 12.6516 1.25134 16.167 -0.57623"];
      break;
  }
};

NakaneNon = function() { NakaneChar.call(this, "NakaneNon", "のん", "CL1EL17", "C", "EL", "black", false, p(0.5, -0.2)); };
NakaneNon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["のん"] = NakaneNon;

NakaneNon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.167, -0.57623);
      this.paths = ["m 0 0 c 0.829034 -0.48509 0.648481 -0.9732 0.404567 -1.2159 c -0.211707 -0.21065 -0.965879 0.0572 -0.938587 0.5118 c 0.02014 0.33549 0.377248 0.60625 0.53402 0.7041 c 5.39104 3.36479 12.6516 1.25134 16.167 -0.57623"];
      break;
  }
};

ShugiinO = function() { ShugiinChar.call(this, "ShugiinO", "を", "SW3", "SW", "SW", "black", false, p(2.1, -1.1)); };
ShugiinO.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["お"] = ShugiinO;
ShugiinChar.dict["私"] = ShugiinO;

ShugiinO.prototype.setPaths = function() {
  switch (this.getPrevName()) {
    case "ShugiinDan":
      this.tailType = "SW3(-105)";
      this.dp = p(-0.776457, 2.89778);
      this.paths = ["m 0 0 l -0.776457 2.89778"];
      return;
  }

  switch (this.getPrevModel()) {
    case "NEL3":
    case "EL3":
      this.tailType = "SW3(-105)";
      this.dp = p(-0.776457, 2.89778);
      this.paths = ["m 0 0 l -0.776457 2.89778"];
      return;
  }

  switch (this.getPrevTailType()) {
    case "NEL":
    case "ShugiinDan_CR1":
    case "NEF":
      this.tailType = "SW3(-105)";
      this.dp = p(-0.776457, 2.89778);
      this.paths = ["m 0 0 l -0.776457 2.89778"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(-1.76382, 2.47882);
      this.paths = ["m 0 0 l -2.12132 2.12132 l 0.357506 0.357505"];
      break;

    case "NER":
      this.tailType = "SW3(-105)";
      this.dp = p(-0.776457, 2.89778);
      this.paths = ["m 0 0 l -0.776457 2.89778"];
      break;

    default:
      this.dp = p(-2.12132, 2.12132);
      this.paths = ["m 0 0 l -2.12132 2.12132"];
      break;
  }
};

ShugiinOh = function() { ShugiinChar.call(this, "ShugiinOh", "おー", "SW3", "SW", "SW", "black", false, p(2.1, -1.1)); };
ShugiinOh.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["おー"] = ShugiinOh;
ShugiinChar.dict["おう"] = ShugiinOh;
ShugiinChar.dict["おお"] = ShugiinOh;
ShugiinOh.prototype.setPaths = ShugiinO.prototype.setPaths;
ShugiinOh.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.51516 0.3537 v 0.1"]; };

ShugiinWo = function() { ShugiinChar.call(this, "ShugiinWo", "を", "SW3", "SW", "SW", "black", false, p(2.1, -1.1)); };
ShugiinWo.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["を"] = ShugiinWo;
ShugiinWo.prototype.setPaths = ShugiinO.prototype.setPaths;

ShugiinNoJoshi = function() { ShugiinChar.call(this, "ShugiinNoJoshi", "の", "NE2F", "NE", "NEF", "black", false, p(0.0, 0.7)); };
ShugiinNoJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜の"] = ShugiinNoJoshi;

ShugiinNoJoshi.prototype.setPaths = function() {
  switch (this.getPrevModel()) {
    case "SW3":
      this.dp = p(3.5141, -1.9134);
      this.paths = ["m 0 0 l 1.73205 -1"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.89913, -2.75772);
      this.paths = ["m 0 0 l 1.41421 -1.41421"];
      break;
  }
};

ShugiinMo = function() { ShugiinChar.call(this, "ShugiinMo", "も", "UNER3", "NER", "SWR", "black", false, p(0.0, 0.4)); };
ShugiinMo.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["も"] = ShugiinMo;

ShugiinMo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.88521, 0.90446);
      this.paths = ["m 0 0 c 0.440595 -0.4406 2.13369 -2.16957 2.92702 -1.64287 c 1.08243 0.71864 -0.558675 2.10811 -1.04182 2.54733"];
      break;
  }
};

ShugiinKaraJoshi = function() { ShugiinChar.call(this, "ShugiinKaraJoshi", "〜から", "E7SWR7", "E", "SWR", "black", false, p(0.0, -2.5)); };
ShugiinKaraJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜から"] = ShugiinKaraJoshi;
ShugiinChar.dict["から"] = ShugiinKaraJoshi;
ShugiinChar.dict["がら"] = ShugiinKaraJoshi;

ShugiinKaraJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.33108, 5.00458 + 1.5);
      this.paths = ["m 0 0 c 3.85426 0.0368 7.18976 -0.38274 8.11998 0.7002 c 1.42948 1.66415 -0.2185 3.98369 -1.7889 4.30438"];
      break;
  }
};

ShugiinKaramoJoshi = function() { ShugiinChar.call(this, "ShugiinKaramoJoshi", "〜からも", "E7SWR7UNER3", "E", "SWR", "black", false, p(0.0, -3.0)); };
ShugiinKaramoJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜からも"] = ShugiinKaramoJoshi;
ShugiinChar.dict["からも"] = ShugiinKaramoJoshi;

ShugiinKaramoJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.64485, 5.14541);
      this.paths = ["m 0 0 c 3.79242 0.0362 7.07441 -0.3766 7.98971 0.68897 c 0.77146 0.89811 0.43059 2.93821 -0.8885 4.08373 c -0.57487 0.49924 -2.88463 1.77933 -3.92481 1.09113 c -0.50683 -0.33532 -0.24982 -2.19739 1.6214 -2.55995 c 0.47807 -0.0926 1.06412 0.63196 -0.15295 1.84153"];
      break;
  }
};

ShugiinKaranoJoshi = function() { ShugiinChar.call(this, "ShugiinKaranoJoshi", "〜からの", "E7SWR7NE3F", "E", "NEF", "black", false, p(0.0, -2.7)); };
ShugiinKaranoJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜からの"] = ShugiinKaranoJoshi;
ShugiinChar.dict["からの"] = ShugiinKaranoJoshi;

ShugiinKaranoJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.75326 + 0.5, 4.01901 - 1);
      this.paths = ["m 0 0 c 3.44299 0.0329 6.42257 -0.34189 7.25354 0.62549 c 0.70038 0.81536 0.17815 2.782 -0.80664 3.70746 c -0.98479 0.92546 -2.99327 1.19789 -3.80568 0.97074 l 1.11204 -1.28468"];
      break;
  }
};

ShugiinKaradaJoshi = function() { ShugiinChar.call(this, "ShugiinKaradaJoshi", "〜からだ", "E7SWR7S7", "E", "S", "black", false, p(0.0, -6.0)); };
ShugiinKaradaJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜からだ"] = ShugiinKaradaJoshi;
ShugiinChar.dict["からだ"] = ShugiinKaradaJoshi;

ShugiinKaradaJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.74358, 12.0046);
      this.paths = ["m 0 0 c 3.85426 0.0368 7.18976 -0.38274 8.11998 0.7002 c 1.42948 1.66415 -1.806 3.98369 -3.3764 4.30438 v 7"];
      break;
  }
};

WasedaShi = function() { WasedaChar.call(this, "WasedaShi", "し", "NEL8CL1", "NEL", "NELCL", "black", false, p(0.0, 2.5)); };
WasedaShi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["し"] = WasedaShi;
WasedaShi.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaShi.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "SWRCR";
  this.model = "SWR8CR1";
}
WasedaShi.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getFilteredPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaWa":
      this.dp = p(5.542, -4.0329);
      this.paths = ["m 0 0 c 2.329 0 5.822 -2.5835 5.822 -4.885 c 0 -1.0555 -1.255 -0.8817 -0.961 -0.3497 c 0.294 0.5087 0.464 0.8257 0.681 1.2018"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}
  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  switch (tail_ + "_" + _name) {
    case "SEL_WasedaWa":
      this.dp = p(4.31285, -2.04335);
      this.paths = ["m 0 0 c 2.3283 0 5.8218 -2.584 5.8218 -4.8855 c 0 -1.0555 -0.714786 0.398232 -0.832488 0.718004 c -0.182455 0.495695 -0.382129 0.910457 -0.676462 2.12415"];
      return;
  }

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _headModel) {
    case "R_SE4":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.254058 -1.49205 0.345193 -0.892801 c 0.218976 0.218974 0.276533 0.314833 0.641707 0.641701"];
      return;

    case "R_NE4":
    case "R_NE8":
    case "R_NE16":
      this.dp = p(-1.29737, 4.85515);
      this.paths = ["m 0 0 c 0 2.8227 -2.05011 7.42882 -3.67845 6.99251 c -0.549348 -0.147197 2.0602 -1.92159 2.38108 -2.13736"];
      this.reverse();
      return;

    case "R_ER8":
    case "R_ER16":
      this.dp = p(-1.56599, 5.9615);
      this.paths = ["m 0 0 c 0 2.8227 -0.799428 6.02539 -3.08939 7.41029 c -0.171634 0.103799 -0.547499 0.140882 -0.599413 -0.052863 c -0.175768 -0.655976 1.67953 -1.20777 2.12281 -1.39592"];
      this.reverse();
      return;

    case "R_ER4":
      this.dp = p(-1.50554, 5.47911);
      this.paths = ["m 0 0 c 0 2.8227 -1.57325 6.29275 -2.74333 6.97489 c -0.794709 0.463307 -1.30185 0.189757 -0.879883 -0.163927 c 0.136707 -0.114584 1.65379 -1.06403 2.11767 -1.33185"];
      return;

    case "NER_ER8":
    case "NER_ER16":
      this.dp = p(-1.44101, 5.75259);
      this.paths = ["m 0 0 c 1.57971 1.57986 -0.801617 5.39671 -2.72467 7.00039 c -0.332083 0.27693 -1.12158 0.650436 -1.27372 0.245686 c -0.181872 -0.483836 1.95737 -1.25106 2.55738 -1.49349"];
      this.reverse();
      return;

    case "ER_ER4":
      this.dp = p(-1.33384, 5.83675);
      this.paths = ["m 0 0 c 1.30093 2.25326 -0.799428 6.02539 -3.08939 7.41029 c -0.171634 0.103799 -0.547497 0.140882 -0.599413 -0.052863 c -0.175768 -0.655954 1.85654 -1.31145 2.35496 -1.52068"];
      this.reverse();
      return;

    case "R_EL8":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.8301 -1.0327 -0.3834 -0.8612 c 0.4733 0.1629 0.9205 0.3907 1.3703 0.6101"];
      this.reverse();
      return;
  }

  switch (this.getFilteredPrevTailType() + "_" + _head) {
    case "R_SEL":
      this.dp = p(-3.59281, 6.88971);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.132112 -1.33289 0.251288 -1.32456 c 0.47899 0.010411 0.1559 0.866635 0.1559 1.28607"];
      return;

    case "R_S":
      this.dp = p(-3.59281, 6.88971);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.411187 -1.15847 -0.027787 -1.15014 c 0.47899 0.010411 0.434975 0.692213 0.434975 1.11165"];
      return;

    case "NER_SW":
      this.dp = p(-3.7418, 6.90721);
      this.paths = ["m 0 0 c 1.11189 1.112 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.180466 -1.26904 0.236543 -1.23317 c 0.402636 0.034641 0.196616 0.731507 0.021661 1.21218"];
      this.reverse();
      return;

    case "SEL_E":
      this.dp = p(5.59802, -4.81796);
      this.paths = ["m 0 0 c 2.3283 0 5.72379 -3.35499 5.72379 -5.65649 c 0 -1.0555 -1.44882 -0.050717 -1.45066 0.432524 c -0.00183 0.48324 0.650396 0.42195 1.32489 0.406005"];
      return;

    case "SEL_SW":
      this.dp = p(4.4094, -1.86702);
      this.paths = ["m 0 0 c 2.3283 0 5.8218 -1.95426 5.8218 -4.8855 c 0 -1.0555 -0.54513 -0.185427 -0.693725 0.30917 c -0.190747 0.634901 -0.570144 2.30124 -0.718675 2.70931"];
      return;

    case "E_S":
      this.dp = p(-3.38126, 6.83844);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.214213 -1.33318 0.245096 -1.358 c 0.440067 -0.023775 0.37364 0.289242 0.37364 1.26823"];
      this.reverse();
      return;

    case "R_E":
      this.dp = p(-2.12341, 6.03577);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.679453 -0.699205 -0.074878 -0.8612 c 0.436554 -0.116974 1.43026 -0.031233 1.95147 -0.031233"];
      this.reverse();
      return;

    case "ER_NER":
      this.dp = p(0.130294, 3.75322);
      this.paths = ["m 0 0 c 1.30093 2.25326 -0.878848 6.77263 -1.37704 7.01888 c -0.824663 0.407611 -0.289061 -0.727259 -0.0029 -1.13502 c 0.419639 -0.597954 1.00794 -1.41329 1.51024 -2.13064"];
      this.reverse();
      return;

    case "R_SW":
      this.dp = p(-3.56305, 6.88382);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.986698 0 -0.163299 -1.24644 0.460708 -1.11788 c 0.350561 0.072219 0.184204 0.50213 -0.023758 1.0735"];
      this.reverse();
      return;
  }

  switch (this.getFilteredPrevTailType()) {
    case "SEL":
      this.dp = p(5.5418, -4.0334);
      this.paths = ["m 0 0 c 2.3283 0 5.8218 -2.584 5.8218 -4.8855 c 0 -1.0555 -1.2555 -0.8817 -0.9606 -0.3496 c 0.2937 0.5087 0.4635 0.8256 0.6806 1.2017"];
      return;

    case "E":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.8301 -1.0327 -0.3834 -0.8612 c 0.4733 0.1629 0.9205 0.3907 1.3703 0.6101"];
      this.reverse();
      return;

    case "NER":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 1.11189 1.112 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.8301 -1.0327 -0.3834 -0.8612 c 0.4733 0.1629 0.9205 0.3907 1.3703 0.6101"];
      this.reverse();
      return;

    case "ER":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 1.30093 2.25326 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.8301 -1.0327 -0.3834 -0.8612 c 0.4733 0.1629 0.9205 0.3907 1.3703 0.6101"];

      this.reverse();
      return;

    case "R":
      this.dp = p(-3.0131, 6.6771);
      this.paths = ["m 0 0 c 0 2.8227 -1.5507 6.9282 -4 6.9282 c -0.9199 0 -0.8301 -1.0327 -0.3834 -0.8612 c 0.4733 0.1629 0.9205 0.3907 1.3703 0.6101"];
      this.reverse();
      return;
}

  switch (_name) {
    case "WasedaWa":
      this.dp = p(4.49679, -2.72925);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -1.0553 -0.657799 0.039061 -0.796229 0.599568 c -0.144419 0.584756 -0.294602 1.10417 -0.442781 1.65718"];
      return;

    case "WasedaAi":
      this.dp = p(5.72797, -5.12467);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -0.448935 -0.205316 -0.686914 -0.483073 -0.679334 c -0.310031 0.00846 -0.535049 0.478739 -0.49705 0.786549 c 0.027336 0.221428 0.262501 0.48478 0.484431 0.461871 c 0.285021 -0.029422 0.36026 -0.357185 0.487857 -0.707759"];
      return;
  }

  switch (_headModel) {
    case "ER4":
      this.dp = p(5.67157, -4.4639);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -1.0553 -1.31627 0.00452 -1.25546 0.444253 c 0.054513 0.39417 0.276192 0.60615 1.19123 0.077846"];
      return;

    case "SWL8":
      this.dp = p(4.20193, -2.53871);
      this.paths = ["m 0 0 c 2.0364 -1.1288 6.61152 -3.46758 5.82606 -4.82805 c -0.188428 -0.326367 -0.568436 0.229001 -0.920036 0.882755 c -0.302308 0.562103 -0.583614 1.19694 -0.704088 1.40659"];
      return;

    case "NEL16":
      this.dp = p(5.62531, -4.36115);
      this.paths = ["m 0 0 c 2.0364 -1.14419 5.7358 -2.72101 5.7358 -5.054 c 0 -1.02193 -1.45307 0.333932 -1.28715 0.81363 c 0.128881 0.372623 0.766584 0.106635 1.17666 -0.12078"];
      return;

    case "SL8":
      this.dp = p(4.49551, -2.86162);
      this.paths = ["m 0 0 c 2.0364 -1.1288 6.15362 -3.58194 5.86957 -4.64202 c -0.332846 -1.2422 -1.20836 1.1898 -1.37406 1.7804"];
      return;

    case "NE8":
     this.dp = p(5.8001, -4.8669);
     this.paths = ["m 0 0 c 2.02885 -1.1246 5.8001 -2.5739 5.8001 -4.8669 c 0 -0.3853 -0.1734 -0.6318 -0.42922 -0.6363 c -0.42275 -0.0148 -1.00026 0.6628 -0.76372 1.0135 c 0.2436 0.3479 0.80621 -0.0962 1.19294 -0.3772"];
     return;

    case "SER4":
    case "SER8":
     this.dp = p(5.59912, -4.22639);
     this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -0.775621 -0.994327 -0.422534 -1.13415 -0.070506 c -0.159678 0.402018 0.675049 0.604235 0.99747 0.830115"];
     return;

    case "ER8":
      this.dp = p(5.65226, -4.45345);
      this.paths = ["m 0 0 c 2.0483 -1.089 5.7144 -2.675 5.7144 -4.968 c 0 -1.051 -1.85423 0.39838 -1.48776 0.84133 c 0.270309 0.32672 0.946121 -0.13381 1.42562 -0.32678"];
      return;

    case "ER16":
      this.dp = p(5.521, -4.0181);
      this.paths = ["m 0 0 c 2.048 -1.0891 5.714 -2.6744 5.714 -4.9675 c 0 -1.0513 -1.76858 0.481566 -1.48458 1.01677 c 0.217 0.4067 0.60465 0.182666 1.29158 -0.06737"];
      return;

    case "EL4":
      this.dp = p(5.64632, -4.43216);
      this.paths = ["m 0 0 c 2.0287 -1.125 5.714 -2.674 5.714 -4.967 c 0 -0.783 -0.954712 -0.87673 -1.19163 -0.51468 c -0.280674 0.42892 0.291945 0.60713 1.12395 1.04952"];
      return;

    case "EL8":
      this.dp = p(5.64632, -4.43216);
      this.paths = ["m 0 0 c 2.0287 -1.125 5.714 -2.674 5.714 -4.967 c 0 -0.783 -1.09944 -0.73983 -1.288 -0.338 c -0.21246 0.45274 0.52932 0.67484 1.22032 0.87284"];
      return;

    case "EL16":
      this.dp = p(5.64078, -4.35178);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -0.603618 -1.0754 -0.710859 -1.27104 -0.32019 c -0.226056 0.451418 0.184781 0.725617 1.17602 0.95441"];
      return;

    case "SW4":
    case "SW8":
    case "SW16":
      this.dp = p(3.96713, -2.64214);
      this.paths = ["m 0 0 c 2.051 -1.0904 5.90172 -3.66043 5.47632 -4.90729 c -0.29744 -0.87182 -0.66854 0.15315 -1.50919 2.26515"];
      return;

    case "SE4":
      this.dp = p(5.53659, -4.07069);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7357 -2.6844 5.7357 -4.986 c 0 -1.0553 -1.6709 -0.490506 -1.22223 -0.05835 c 0.429694 0.413884 0.715952 0.666501 1.02312 0.973662"];
      return;

    case "SER8":
      this.dp = p(5.496, -3.9928);
      this.paths = ["m 0 0 c 2.029 -1.1245 5.715 -2.6746 5.715 -4.9675 c 0 -1.0512 -1.26883 -0.303688 -1.38662 0.145897 c -0.12096 0.461707 0.48417 0.350264 1.16762 0.828803"];
      return;

    case "SER16":
      this.dp = p(5.63289, -4.38072);
      this.paths = ["m 0 0 c 2.02871 -1.1246 5.71446 -2.6746 5.71446 -4.9675 c 0 -0.265858 -0.08892 -0.431175 -0.263762 -0.506244 c -0.337411 -0.144868 -0.944374 0.01417 -1.05888 0.30377 c -0.167123 0.422698 0.337271 0.267451 1.24107 0.789257"];
      return;

    case "NER8":
      this.dp = p(5.72797, -5.12467);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -0.448935 -0.205316 -0.686914 -0.483073 -0.679334 c -0.310031 0.00846 -0.535049 0.478739 -0.49705 0.786549 c 0.027336 0.221428 0.262501 0.48478 0.484431 0.461871 c 0.285021 -0.029422 0.36026 -0.357185 0.487857 -0.707759"];
      return;

    case "SW8":
      this.dp = p(4.19031, -2.46911);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -1.0553 -0.575586 0.00631 -0.684364 0.294391 c -0.185986 0.492562 -0.441267 1.09343 -0.861131 2.2225"];
      return;

    case "NEL8":
      this.dp = p(5.70879, -4.64675);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -0.998414 -1.25738 -0.193443 -1.25842 0.265386 c -0.00119 0.52533 0.689589 0.420561 1.23142 0.073869"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(5.70949, -4.6511);
      this.paths = ["m 0 0 c 2.03644 -1.1288 5.73582 -2.6844 5.73582 -4.9861 c 0 -1.4267 -2.31267 0.3404 -1.32461 0.3404 c 0.39983 -0.0209 0.89846 0.01561 1.29828 -0.0054"];
      return;

    case "SEL":
     this.dp = p(4.93961, -3.18064);
     this.paths = ["m 0 0 c 2.029 -1.1246 5.714 -2.6746 5.714 -4.9675 c 0 -1.0512 -0.493688 -0.439405 -0.597895 -0.192244 c -0.220322 0.522564 -0.176495 1.3193 -0.176495 1.9791"];
     return;

    case "S":
      this.dp = p(4.86067, -3.08467);
      this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -1.0553 -0.875132 -1.20076 -0.866937 0.031477 c 0.00305 0.457897 -0.00819 1.49344 -0.00819 1.86985"];
      return;

  }

  this.dp = p(5.54091, -4.08037);
  this.paths = ["m 0 0 c 2.0364 -1.1288 5.7358 -2.6844 5.7358 -4.986 c 0 -1.0553 -1.2616 -0.865 -0.9666 -0.3328 c 0.2937 0.5087 0.554514 0.86223 0.771714 1.23843"];
};

WasedaSu = function() { WasedaChar.call(this, "WasedaSu", "す", "NEL8CL4", "NEL", "NELCL4", "black", false, p(0.0, 2.5)); };
WasedaSu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["す"] = WasedaSu;
WasedaSu.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSu.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "SWRCR";
  this.model = "SWR8CR4";
};
//WasedaSu.prototype.filterReverseTail = function(tail) { return tail.replace(/^(?:E)$/, "R"); };
WasedaSu.prototype.getFilteredPrevTailType = WasedaShi.prototype.getFilteredPrevTailType;
WasedaSu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _headModel) {
    case "SEL8_EL8":
      this.dp = p(5.38829, -3.42191);
      this.paths = ["m 0 0 c 2.3202 0 5.8001 -2.574 5.8001 -4.867 c 0 -2.17 -2.72988 -1.44178 -3.12111 -0.465371 c -0.411007 1.02577 1.7713 1.56052 2.7093 1.91046"];
      return;

    case "SEL8_EL16":
      this.dp = p(5.20419, -3.10779);
      this.paths = ["m 0 0 c 0.617619 0 1.3211 -0.18243 2.02 -0.493405 c 0.65574 -0.291775 1.30744 -0.696711 1.88037 -1.1703 c 1.1105 -0.917941 1.9251 -2.0938 1.89973 -3.20349 c -0.04193 -1.83419 -3.9967 -0.810832 -3.26888 0.594788 c 0.337159 0.651149 1.49979 0.893757 2.67297 1.16463"];
      return;

    case "UWL4_SER8":
      this.dp = p(4.68984, -2.91633);
      this.paths = ["m 0 0 c 2.23847 0 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -3.21889 -0.804741 -3.51502 0.334357 c -0.253688 0.975835 0.897163 0.601059 2.49046 1.71671"];
      return;
  }

  //switch (tailModel_) {}

  switch (model_) {
    case "UWL4":
      this.dp = p(4.9106, -2.814);
      this.paths = ["m 0 0 c 2.3202 0 5.8001 -2.573 5.8001 -4.867 c 0 -2.169 -2.4502 -1.883 -2.2468 -0.73 c 0.1692 0.96 0.7703 2.004 1.3573 2.783"];
      return;

    case "SEL8":
      this.dp = p(4.9106, -2.814);
      this.paths = ["m 0 0 c 2.3202 0 5.8001 -2.574 5.8001 -4.867 c 0 -2.17 -2.4503 -1.884 -2.2469 -0.73 c 0.1692 0.959 0.7704 2.004 1.3574 2.783"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _headModel) {
    case "R_EL8":
      this.dp = p(-1.03912, 4.37798);
      this.paths = ["m 0 0 c 0 3.21345 -1.96809 7.09343 -3.84679 6.92264 c -1.26813 -0.115286 -0.486744 -2.87313 0.522733 -3.45265 c 0.710778 -0.408046 1.48397 0.51731 2.28493 0.907987"];
      this.reverse();
      return;

    case "NER_SER8":
      this.dp = p(-1.07113, 4.94124);
      this.paths = ["m 0 0 c 1.11189 1.112 -0.881629 6.26528 -3.34721 6.76286 c -0.628466 0.12683 -1.63306 -0.642121 -1.45495 -1.25802 c 0.349418 -1.20828 2.76803 -1.2055 3.73103 -0.563593"];
      this.reverse();
      return;

    case "R_SER8":
      this.dp = p(-1.66931, 5.46821);
      this.paths = ["m 0 0 c 0 3.21345 -1.96809 7.09343 -3.84679 6.92264 c -0.702213 -0.063838 -1.2843 -0.447712 -1.158 -0.925417 c 0.287731 -1.08833 2.11503 -1.3836 3.33548 -0.529014"];
      return;
  }

  switch (tail_ + "_" + _head) {
    case "R_NE":
      this.dp = p(-0.874496, 4.08031);
      this.paths = ["m 0 0 c 0 3.21345 -1.96809 7.09344 -3.84679 6.92264 c -2.27958 -0.207237 2.21189 -2.32943 2.97229 -2.84233"];
      this.reverse();
      return;

    case "ER_NE":
      this.dp = p(-0.005432, 2.73989);
      this.paths = ["m 0 0 c 1.30093 2.25326 -2.51837 8.26204 -3.84679 6.92264 c -1.04502 -1.05366 3.00651 -3.61964 3.84136 -4.18275"];
      this.reverse();
      return;

    case "ER_E":
      this.dp = p(-0.532801, 4.08291);
      this.paths = ["m 0 0 c 1.30093 2.25326 -2.07382 7.80976 -4.09989 6.12116 c -1.34514 -1.12109 0.611346 -2.03825 3.56709 -2.03825"];
      this.reverse();
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-0.9317, 4.14797);
      this.paths = ["m 0 0 c 0 3.21345 -1.96809 7.09344 -3.84679 6.92264 c -2.27958 -0.207237 1.8144 -2.47974 2.91509 -2.77467"];
      this.reverse();
      return;

    case "ER":
      this.dp = p(-0.58051, 4.11179);
      this.paths = ["m 0 0 c 1.30093 2.25326 -1.96809 7.09344 -3.84679 6.92264 c -2.27958 -0.207237 2.16559 -2.51592 3.26628 -2.81085"];
      this.reverse();
      return;

    case "NER":
      this.dp = p(-0.569343, 3.48671);
      this.paths = ["m 0 0 c 1.11189 1.112 -1.96809 7.09344 -3.84679 6.92264 c -2.27958 -0.207237 2.17676 -3.141 3.27745 -3.43593"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "EL8":
      this.dp = p(5.12678, -3.06292);
      this.paths = ["m 0 0 c 2.05895 -1.0491 5.86209 -2.4626 5.86209 -4.7471 c 0 -1.0867 -1.9661 -1.3883 -3.09921 -0.7602 c -1.06108 0.5881 0.524317 1.84668 2.3639 2.44438"];
      return;

    case "EL16":
      this.dp = p(5.05454, -2.98447);
      this.paths = ["m 0 0 c 2.0589 -1.0491 5.8621 -2.4625 5.8621 -4.747 c 0 -1.0868 -2.1644 -1.1935 -3.2975 -0.5654 c -1.0814 0.5994 0.537436 1.87722 2.48994 2.32793"];
      return;

    case "SER8":
      this.dp = p(4.68984, -2.91633);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -3.21889 -0.804741 -3.51502 0.334357 c -0.253688 0.975835 0.897163 0.601059 2.49046 1.71671"];
      return;

    case "ER8":
      this.dp = p(4.60122, -2.824);
      this.paths = ["m 0 0 c 2.05919 -1.049 5.69296 -2.664 5.69296 -4.949 c 0 -1.465 -3.81386 0.95805 -3.38938 2.245 c 0.240228 0.72833 1.38768 0.248 2.29764 -0.12"];
      return;

    case "ER16":
      this.dp = p(4.6012, -2.824);
      this.paths = ["m 0 0 c 2.0592 -1.0493 5.693 -2.6644 5.693 -4.9489 c 0 -1.4652 -3.9652 0.7979 -3.3922 2.0848 c 0.3507 0.7876 1.50678 0.412554 2.3004 0.0401"];
      return;

    case "SE4":
      this.dp = p(4.66099, -2.88831);
      this.paths = ["m 0 0 c 2.029 -1.1246 5.714 -2.6743 5.714 -4.9674 c 0 -2.1677 -3.74701 -0.993312 -2.6591 0.295885 c 0.63414 0.751478 1.20769 1.38487 1.60609 1.7832"];
      return;

    case "SWR8":
      this.dp = p(3.99798, -2.32147);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -2.54813 -1.38801 -2.2707 -0.6511 c 0.220784 0.586434 0.554279 1.99854 0.554279 3.29703"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(4.77682, -3.00406);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -3.46501 0.335618 -3.30728 1.54166 c 0.104045 0.795534 1.75126 0.421673 2.3697 0.421673"];
      return;

    case "SW":
      this.dp = p(3.03338, -1.75872);
      this.paths = ["m 0 0 c 2.02867 -1.16644 6.23809 -3.19642 5.71403 -5.15222 c -0.33407 -1.24677 -1.27706 -0.480648 -1.4507 0.014213 c -0.332825 0.948521 -0.944585 2.63339 -1.22995 3.37928"];
      return;

    case "S":
      this.dp = p(3.45727, -1.936);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -2.2707 -1.5652 -2.2707 -0.6511 c 0 1.22751 0.013571 2.84214 0.013571 3.6825"];
      return;

    case "NER":
      this.dp = p(5.7144, -4.9674);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -1.92496 -1.77986 -0.993864 -2.14933 -0.367908 c -0.636347 1.07809 -0.509336 1.99307 0.198275 2.25696 c 0.848178 0.316314 1.62499 -0.898433 1.95106 -1.88905"];
      return;

    case "SEL":
      this.dp = p(3.66476, -2.0781);
      this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -1.41165 -1.67045 -1.68754 -0.6511 c -0.254249 0.939388 -0.362101 2.774 -0.362101 3.5404"];
      return;
  }

  this.dp = p(4.6145, -2.9915);
  this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -2.1677 -2.4742 -1.8055 -2.2707 -0.6511 c 0.169 0.9584 0.5711 1.8606 1.1708 2.627"];
};

WasedaSe = function() { WasedaChar.call(this, "WasedaSe", "せ", "NEL16", "NEL", "NELCL", "black", false, p(0.0, 5.7)); };
WasedaSe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["せ"] = WasedaSe;
WasedaSe.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSe.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "SWRCR";
  this.model = "SWR16CR1";
};
WasedaSe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
      this.dp = p(-6.7496, 13.7286);
      this.paths = ["m 0 0 c 0 4.2182 -4.0678 13.9416 -7.7279 13.9416 c -0.9019 0 -0.8143 -1.0128 -0.3761 -0.8446 c 0.469 0.1707 0.9266 0.3745 1.3544 0.6316"];
      this.reverse();
      return;

    case "ER":
      this.dp = p(-6.7496, 13.7286);
      this.paths = ["m 0 0 c 1.33334 2.3094 -4.0678 13.9416 -7.7279 13.9416 c -0.9019 0 -0.8143 -1.0128 -0.3761 -0.8446 c 0.469 0.1707 0.9266 0.3745 1.3544 0.6316"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "EL8":
      this.dp = p(11.018, -9.1428);
      this.paths = ["m 0 0 c 2.989 -1.7958 11.402 -6.6898 11.402 -9.9113 c 0 -1.043 -1.127 -0.658 -1.404 -0.3501 c -0.375 0.4161 0.272 0.8755 1.02 1.1186"];
      return;

    case "SER8":
      this.dp = p(11.3463, -9.31458);
      this.paths = ["m 0 0 c 3.0001 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.0469 -1.13664 -0.774456 -1.34568 -0.359853 c -0.239343 0.474704 0.869345 0.729043 1.24743 0.993768"];
      return;
  }

  switch (_head) {
    case "SEL":
      this.dp = p(10.2165, -7.44201);
      this.paths = ["m 0 0 c 3.0001 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.10086 -1.22803 0.57781 -1.22803 2.50649"];
      return;

    case "S":
     this.dp = p(10.7728, -8.16585);
     this.paths = ["m 0 0 c 3.0001 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.0469 -0.669364 -1.02683 -0.669364 -0.189513 c 0 0.559094 -0.0023 1.56124 -0.0023 1.97217"];
     return;

    case "E":
     this.dp = p(11.3702, -9.40054);
     this.paths = ["m 0 0 c 3.0001 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.0469 -1.59372 -0.317048 -1.56885 0.238544 c 0.021067 0.470618 0.825773 0.309411 1.49453 0.309411"];
     return;

    case "SW":
      this.dp = p(9.82173, -6.67588);
      this.paths = ["m 0 0 c 3.0001 -1.8027 12.2814 -6.82508 11.4445 -9.9485 c -0.297086 -0.917247 -1.4611 2.92137 -1.62277 3.27262"];
      return;
  }

  this.dp = p(11.2422, -9.02036);
  this.paths = ["m 0 0 c 3.0001 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.0469 -1.4523 -1.0345 -1.1326 -0.5228 c 0.3245 0.5068 0.734315 1.07264 0.930315 1.45094"];
};

WasedaSo = function() { WasedaChar.call(this, "WasedaSo", "そ", "NEL16", "NEL", "NEL", "black", false, p(0.0, 5.7)); };
WasedaSo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["そ"] = WasedaSo;
WasedaSo.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSo.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "SWR";
  this.model = "SWR16";
};
WasedaSo.prototype.filterReverseTail = function(tail) {
  return tail.replace(/^ECL4|ECL|E$/, "R");
};
WasedaSo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "SEL_SW":
      this.dp = p(11.9694, -13.0512);
      this.paths = ["m 0 0 c 3.35675 0 10.6013 -9.29254 11.9694 -13.0512"];
      return;

    case "NER_ER":
      this.dp = p(-8, 13.8564);
      this.paths = ["m 0 0 c 2.61142 2.61142 -4.65039 12.9589 -8 13.8564"];
      this.reverse();
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-8, 13.8564);
      this.paths = ["m 0 0 c 0 4.2341 -4.3261 13.8564 -8 13.8564"];
      this.reverse();
      return;

    case "SEL":
      this.dp = p(8, -13.8564);
      this.paths = ["m 0 0 c 3.35675 0 8 -6.1581 8 -13.8564"];
      return;

    case "ER":
      this.dp = p(-8, 13.8564);
      this.paths = ["m 0 0 c 1.33334 2.3094 -4.3261 13.8564 -8 13.8564"];
      this.reverse();
      return;

    case "NER":
      this.dp = p(-8, 13.8564);
      this.paths = ["m 0 0 c 2.61142 2.61142 -4.3261 13.8564 -8 13.8564"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {

  }

  switch (_head) {
    case "SL":
      this.dp = p(11.3137, -11.3137);
      this.paths = ["m 0 0 c 3.0032 -2.0256 8.20727 -5.93321 11.3137 -11.3137"];
      return;

    case "NE":
     this.dp = p(11.3137, -11.3137);
     this.paths = ["m 0 0 c 3.0032 -2.0256 12.9622 -8.45838 11.3137 -11.3137"];
     return;

    case "SW":
      this.dp = p(11.3137, -11.3137);
      this.paths = ["m 0 0 c 4.54793 -3.06749 8.82206 -5.97035 11.3137 -11.3137"];
      return;
  }

  this.dp = p(11.3137, -11.3137);
  this.paths = ["m 0 0 c 3.0032 -2.0256 11.3137 -7.7072 11.3137 -11.3137"];
};

NakaneHan = function() { NakaneChar.call(this, "NakaneHan", "はん", "CR1SR7", "C", "SR", "black", false, p(1.2, -2.9)); };
NakaneHan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["はん"] = NakaneHan;

NakaneHan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.321694, 6.39292);
      this.paths = ["m 0 0 c -0.276566 1.09318 -0.945768 0.68485 -1.05215 0.53783 c -0.374547 -0.51774 0.01624 -1.09017 0.428056 -1.03995 c 0.425912 0.0519 0.756742 0.59015 0.827038 0.79103 c 0.692616 1.97925 0.358335 4.22232 -0.524633 6.10401"];
      break;
  }
};

NakaneHin = function() { NakaneChar.call(this, "NakaneHin", "ひん", "CL1SL7", "C", "SL", "black", false, p(0.3, -2.1)); };
NakaneHin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ひん"] = NakaneHin;

NakaneHin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.584648, 5.5642);
      this.paths = ["m 0 0 c 0.612681 -0.0731 1.56712 -0.23631 1.5311 -0.81305 c -0.02058 -0.3295 -0.460955 -0.65717 -0.925749 -0.35204 c -0.365865 0.24018 -0.529868 0.89815 -0.605349 1.16509 c -0.525872 1.85975 -0.238447 3.81011 0.584648 5.5642"];
      break;
  }
};

NakaneHun = function() { NakaneChar.call(this, "NakaneHun", "ふん", "CL1NE7", "C", "NE", "black", false, p(1.2, 1.7)); };
NakaneHun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ふん"] = NakaneHun;

NakaneHun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.06887, -4.1129);
      this.paths = ["m 0 0 c 0.376378 -1.10396 -0.415546 -0.88902 -0.737323 -0.69197 c -0.377517 0.23119 -0.614979 1.20337 -0.185343 1.33726 c 0.342429 0.10672 0.922666 -0.64529 0.922666 -0.64529 l 4.06887 -4.1129"];
      break;
  }
};

NakaneHen = function() { NakaneChar.call(this, "NakaneHen", "へん", "CL1SL17", "C", "SL", "black", false, p(2.0, -7.3)); };
NakaneHen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["へん"] = NakaneHen;

NakaneHen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.02739, 15.7731);
      this.paths = ["m 0 0 c 0.8915 -0.0535 1.77395 -0.20748 1.73667 -0.77062 c -0.0306 -0.46223 -0.52502 -0.45903 -0.78905 -0.3133 c -0.44422 0.24518 -0.75322 0.77747 -0.94762 1.08392 c -2.47846 3.90697 -3.28209 12.9048 1.02739 15.7731"];
      break;
  }
};

NakaneHon = function() { NakaneChar.call(this, "NakaneHon", "ほん", "CR1SR17", "C", "SR", "black", false, p(1.4, -7.7)); };
NakaneHon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ほん"] = NakaneHon;

NakaneHon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.77609, 16.1436);
      this.paths = ["m 0 0 c -0.51075 0.75295 -1.17059 0.81223 -1.33892 0.14704 c -0.0974 -0.38466 0.16356 -0.8641 0.56449 -0.79987 c 0.2753 0.0441 0.63994 0.46776 0.77443 0.65283 c 2.67111 3.67555 3.67593 13.1805 -0.77609 16.1436"];
      break;
  }
};

SvsdIn = function() { SvsdChar.call(this, "SvsdIn", "いん", "SW10CR1", "SW", "CR", "black", false, p(6.1, -4.3)); };
SvsdIn.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["いん"] = SvsdIn;

SvsdIn.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.43551, 7.68567);
      this.paths = ["m 0 0 l -4.27499 7.40446 c 0 0 -0.559482 1.06452 -0.9101 1.09497 c -0.450685 0.0391 -0.855976 -0.50991 -0.698994 -0.83806 c 0.208405 -0.43564 1.44857 0.0243 1.44857 0.0243"];
      break;
  }
};

SvsdKin = function() { SvsdChar.call(this, "SvsdKin", "きん", "SWL10CL1", "SWL", "CL", "black", false, p(5.1, -4.3)); };
SvsdKin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きん"] = SvsdKin;

SvsdKin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "NEL":
      this.dp = p(-5.09997, 7.24792);
      this.paths = ["m 0 0 c -1.49047 1.05666 -5.16196 3.85976 -5.10719 7.63149 c 0.0016 0.11057 -0.01655 0.79328 0.388776 0.91254 c 0.362273 0.10659 0.893703 -0.22748 0.865118 -0.52645 c -0.04612 -0.48233 -0.84481 -0.537647 -1.24667 -0.769663"];
      return;

    default:
      this.dp = p(-5.10719, 7.63149);
      this.paths = ["m 0 0 c -1.49047 1.05666 -5.16196 3.85976 -5.10719 7.63149 c 0.0016 0.11057 -0.01655 0.79328 0.388776 0.91254 c 0.362273 0.10659 0.893703 -0.22748 0.865118 -0.52645 c -0.04612 -0.48233 -0.88782 -0.77548 -1.25389 -0.38609"];
      break;
  }
};

SvsdShin = function() { SvsdChar.call(this, "SvsdShin", "しん", "SWL5CL1", "SWL", "CL", "black", false, p(2.6, -2.2)); };
SvsdShin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しん"] = SvsdShin;

SvsdShin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NELCL":
      this.dp = p(-1.34081, 3.68914);
      this.paths = ["m 0 0 c -0.483624 0.837661 -1.08224 2.1576 -1.34086 3.68914 c -0.0372 0.22021 -0.0843 0.69238 0.0917 1.01999 c 0.19475 0.36253 0.86414 0.50436 1.06358 -0.0685 c 0.16652 -0.4783 -0.19905 -0.79724 -1.15523 -0.95149"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SL10":
      this.dp = p(-2.598, 2.98683);
      this.paths = ["m 0 0 c -0.87569 0.30734 -2.33943 1.45529 -2.59805 2.98683 c -0.0372 0.22021 -0.0843 0.69238 0.0917 1.01999 c 0.19475 0.36253 0.682822 0.121577 0.882262 -0.451283 c 0.16652 -0.4783 -0.567135 -1.19779 -0.973912 -0.568707"];
      return;
  }

  //switch (_head) {}

  this.dp = p(-2.598, 2.98683);
  this.paths = ["m 0 0 c -0.87569 0.30734 -2.33943 1.45529 -2.59805 2.98683 c -0.0372 0.22021 -0.0843 0.69238 0.0917 1.01999 c 0.19475 0.36253 0.86414 0.50436 1.06358 -0.0685 c 0.16652 -0.4783 -0.19905 -0.79724 -1.15523 -0.95149"];
};

SvsdChin = function() { SvsdChar.call(this, "SvsdChin", "ちん", "SW5CR1", "SW", "CR", "black", false, p(3.3, -2.1)); };
SvsdChin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちん"] = SvsdChin;

SvsdChin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.95859, 3.40708);
      this.paths = ["m 0 0 l -1.79806 3.12587 c 0 0 -0.52815 0.98144 -0.79763 1.10903 c -0.40887 0.19358 -0.96504 -0.38914 -0.84271 -0.74312 c 0.16139 -0.46697 1.47981 -0.0847 1.47981 -0.0847"];
      break;
  }
};

SvsdNin = function() { SvsdChar.call(this, "SvsdNin", "にん", "SWR10CR1", "SWR", "CR", "black", false, p(5.3, -4.2)); };
SvsdNin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にん"] = SvsdNin;

SvsdNin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "SvsdRu":
      this.dp = p(-3.06845, 7.69071);
      this.paths = ["m 0 0 c 0.65918 2.45167 -0.474666 6.44432 -3.94381 8.21708 c -0.188036 0.096088 -0.311653 0.176512 -0.663675 0.27555 c -0.435271 0.122459 -0.76379 -0.218972 -0.632312 -0.545503 c 0.202155 -0.502061 1.86827 -0.272315 2.17134 -0.256418"];
      return;
  }

  //switch (_model) {}

  //switch (_head) {}
  
  this.dp = p(-3.94381, 8.21708);
  this.paths = ["m 0 0 c 0.65918 2.45167 -0.47466 6.44433 -3.94381 8.21708 c -0.18803 0.0961 -0.52726 0.3142 -0.86349 0.27555 c -0.46476 -0.0534 -0.71045 -0.58591 -0.19938 -0.91183 c 0.45833 -0.29229 1.02845 -0.0945 1.06287 0.63628"];
};

ShugiinSaka = function() { ShugiinChar.call(this, "ShugiinSaka", "さか", "UNWR3SR7", "NWR", "SR", "black", false, p(0.2, -1.9)); };
ShugiinSaka.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さか"] = ShugiinSaka;
ShugiinChar.dict["ざか"] = ShugiinSaka;
ShugiinChar.dict["さが"] = ShugiinSaka;

ShugiinSaka.prototype.setPaths = function() {
  switch (this.getNextName()) {
    case "ShugiinMaka":
      this.dp = p(0.253292, 4.67364);
      this.paths = ["m 0 0 c -0.584166 -1.49311 0.45806 -1.6098 0.966648 -0.824252 c 1.07227 1.65621 0.39023 4.91946 -0.713356 5.49789"];
      return;
  }


  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(0.591986, 5.78813);
      this.paths = ["m 0 0 c -0.691561 -1.71645 0.542272 -1.8506 1.14436 -0.947544 c 1.2694 1.90395 1.24453 7.19903 -0.552374 6.73567"];
      break;

    default:
      this.dp = p(0.299858, 5.37273);
      this.paths = ["m 0 0 c -0.691561 -1.71645 0.542272 -1.8506 1.14436 -0.947544 c 1.2694 1.90395 0.833761 4.278 -0.844503 6.32027"];
      break;
  }
};

ShugiinSaka = function() { ShugiinChar.call(this, "ShugiinSakan", "さかん", "UNWR3SR7F", "NWR", "SRF", "black", false, p(0.2, -1.9)); };
ShugiinSaka.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さかん"] = ShugiinSaka;

ShugiinSaka.prototype.setPaths = function() {
  switch (this.getNextName()) {
    case "ShugiinMaka":
      this.dp = p(0.253292, 4.67364 + 2);
      this.paths = ["m 0 0 c -0.584166 -1.49311 0.45806 -1.6098 0.966648 -0.824252 c 1.07227 1.65621 0.39023 4.91946 -0.713356 5.49789"];
      return;
  }


  switch (this.getNextHeadType()) {
    default:
      this.dp = p(0.299858, 5.37273 + 2);
      this.paths = ["m 0 0 c -0.691561 -1.71645 0.542272 -1.8506 1.14436 -0.947544 c 1.2694 1.90395 0.833761 4.278 -0.844503 6.32027"];
      break;
  }
};


ShugiinNaka = function() { ShugiinChar.call(this, "ShugiinNaka", "なか", "UWL3EL7", "WL", "EL", "black", false, p(1.6, -0.8)); };
ShugiinNaka.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なか"] = ShugiinNaka;

ShugiinNaka.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.43482, 0.658512);
      this.paths = ["m 0 0 c -0.68464 -0.273613 -1.45428 -0.23755 -1.58987 0.127459 c -0.129451 0.348515 0.519157 0.903823 0.629973 0.96733 c 1.77327 1.01626 4.19461 1.06648 6.39472 -0.436277"];
      break;
  }
};

ShugiinNaga = function() { ShugiinChar.call(this, "ShugiinNaga", "なが", "UWL3NEL7", "UWL", "NEL", "black", false, p(0.8, 0.9)); };
ShugiinNaga.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なが"] = ShugiinNaga;

ShugiinNaga.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(4.96362, -3.11452);
      this.paths = ["m 0 0 c -0.288046 0 -0.820691 0.261478 -0.836487 0.605286 c -0.01587 0.345474 0.256245 0.682728 0.781231 0.682728 c 2.07634 0 4.57935 -2.7622 5.01888 -4.40253"];
      break;

    default:
      this.dp = p(4.96363, -3.11451);
      this.paths = ["m 0 0 c -0.288046 0 -0.820691 0.261478 -0.836487 0.605286 c -0.01587 0.345474 0.256245 0.682728 0.781231 0.682728 c 2.07634 0 4.83725 -1.16203 5.01888 -4.40253"];
      break;
  }
};

ShugiinNakan = function() { ShugiinChar.call(this, "ShugiinNakan", "なかん", "UWL3EL7F", "WL", "ELF", "black", false, p(1.6, -0.8)); };
ShugiinNakan.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なかん"] = ShugiinNakan;

ShugiinNakan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.43482 + 1.41, 0.658512 - 1.41);
      this.paths = ["m 0 0 c -0.68464 -0.273613 -1.45428 -0.23755 -1.58987 0.127459 c -0.129451 0.348515 0.519157 0.903823 0.629973 0.96733 c 1.77327 1.01626 4.19461 1.06648 6.39472 -0.436277"];
      break;
  }
};

ShugiinMaka = function() { ShugiinChar.call(this, "ShugiinMaka", "まか", "UWR3ER7", "WR", "ER", "black", false, p(1.2, 0.9)); };
ShugiinMaka.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["まか"] = ShugiinMaka;
ShugiinChar.dict["まが"] = ShugiinMaka;
ShugiinChar.dict["さま"] = ShugiinMaka;
ShugiinChar.dict["ざま"] = ShugiinMaka;

ShugiinMaka.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.67367, -0.315797);
      this.paths = ["m 0 0 c -1.1356 0.577981 -1.44764 -0.264407 -0.95576 -0.700562 c 1.75677 -1.55775 4.981 -2.025 6.62943 0.384765"];
      break;
  }
};

ShugiinHana = function() { ShugiinChar.call(this, "ShugiinHana", "はな", "UNL3SEL7", "NWL", "SEL", "black", false, p(1.4, -1.8)); };
ShugiinHana.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["はな"] = ShugiinHana;
ShugiinChar.dict["ばな"] = ShugiinHana;
ShugiinChar.dict["ぱな"] = ShugiinHana;
ShugiinChar.dict["話"] = ShugiinHana;

ShugiinHana.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.45406, 4.55364);
      this.paths = ["m 0 0 c 0.16516 -0.730427 -0.44379 -1.07006 -0.7275 -1.02408 c -0.54522 0.08836 -0.65108 0.862596 -0.64558 0.981218 c 0.12166 2.62235 2.39857 4.832 4.82714 4.5965"];
      break;
  }
};

TakusariSe = function() { TakusariChar.call(this, "TakusariSe", "せ", "SR9NE3", "SR", "NE", "black", false, p(1.2, -3.7)); };
TakusariSe.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["せ"] = TakusariSe;

TakusariSe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.1847, 6.47029);
      this.paths = ["m 0 0 c 1.53287 1.02624 1.68248 6.18504 0.151884 7.44235 l -1.33658 -0.972063"];
      break;
  }
};

TakusariSo = function() { TakusariChar.call(this, "TakusariSo", "そ", "SR9W3", "SR", "W", "black", false, p(2.3, -3.7)); };
TakusariSo.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["そ"] = TakusariSo;

TakusariSo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.30865, 7.32084);
      this.paths = ["m 0 0 c 0.936077 2.07576 1.51939 4.88056 -0.364525 7.32084 h -1.94412"];
      break;
  }
};

TakusariNa = function() { TakusariChar.call(this, "TakusariNa", "な", "EL9", "EL", "EL", "black", false, p(0.0, -0.7)); };
TakusariNa.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["な"] = TakusariNa;

TakusariNa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.27304, 0.51068);
      this.paths = ["m 0 0 c 3.30385 2.01645 6.02756 1.64796 8.27304 0.51068"];
      break;
  }
};

TakusariNi = function() { TakusariChar.call(this, "TakusariNi", "に", "EL9NW2", "EL", "NW", "black", false, p(0.0, -0.3)); };
TakusariNi.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["に"] = TakusariNi;

TakusariNi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.95785, -0.466281);
      this.paths = ["m 0 0 c 3.28353 1.5366 6.28763 1.28175 8.57955 0.373022 l -0.621707 -0.839303"];
      break;
  }
};

TakusariNu = function() { TakusariChar.call(this, "TakusariNu", "ぬ", "EL9N3", "EL", "N", "black", false, p(0.0, -0.1)); };
TakusariNu.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["ぬ"] = TakusariNu;

TakusariNu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(9.44994, -1.61644);
      this.paths = ["m 0 0 c 3.79114 2.74013 7.43968 1.75831 9.44994 0.404108 v -2.02055"];
      break;
  }
};

TakusariNe = function() { TakusariChar.call(this, "TakusariNe", "ね", "EL9NW3", "EL", "NW", "black", false, p(0.0, 0.2)); };
TakusariNe.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["ね"] = TakusariNe;

TakusariNe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.34223, -1.59452);
      this.paths = ["m 0 0 c 3.68339 1.96138 6.36242 1.34387 8.97384 0.296656 l -1.63161 -1.89118"];
      break;
  }
};

TakusariNo = function() { TakusariChar.call(this, "TakusariNo", "の", "EL9W3", "EL", "W", "black", false, p(0.0, -0.7)); };
TakusariNo.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["の"] = TakusariNo;

TakusariNo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.63646, 0.07416);
      this.paths = ["m 0 0 c 3.52153 1.89453 6.48935 1.63575 9.12217 0.07416 h -3.48571"];
      break;
  }
};

TakusariHa = function() { TakusariChar.call(this, "TakusariHa", "は", "SEL9", "SEL", "SEL", "black", false, p(0.0, -3.1)); };
TakusariHa.prototype = Object.create(TakusariChar.prototype);
TakusariChar.dict["は"] = TakusariHa;

TakusariHa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.34317, 6.28165);
      this.paths = ["m 0 0 c 0 2.4443 3.34038 5.7809 5.34317 6.28165"];
      break;
  }
};

WasedaNo = function() { WasedaChar.call(this, "WasedaNo", "の", "EL16", "EL", "EL", "black", false, p(0.0, -0.7)); };
WasedaNo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["の"] = WasedaNo;

WasedaNo.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "ER8":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 5.355 1.2363 11.017 2.3238 16 0"];
      return;

    case "ER16":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 5.86615 1.35399 11.6399 1.5869 16 0"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "SW":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 2.8811 0.665 14.617 2.39543 16 0"];
      return;

    case "E":
    case "NEL":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 2.881 0.6652 17.5774 3.555 16 0"];
      break;

    default:
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 2.8811 0.665 16 2.766 16 0"];
      break;
  }
};

NakaneMan = function() { NakaneChar.call(this, "NakaneMan", "まん", "CR1ER7", "C", "ER", "black", false, p(0.6, -0.4)); };
NakaneMan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["まん"] = NakaneMan;

NakaneMan.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "NakaneShi":
    case "NakaneShiu":
    case "NakaneShin":
      this.dp = p(6.41101, 0.47825);
      this.paths = ["m 0 0 c 0.690568 0.14957 0.759364 -1.1664 0.09713 -1.34333 c -0.400031 -0.10688 -0.8793 0.57109 -0.774024 0.97155 c 0.07798 0.29664 0.715222 0.41388 0.85316 0.34466 c 2.02257 -1.01503 5.26759 -0.66963 6.23474 0.50537"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  this.dp = p(6.23474, 0.50537);
  this.paths = ["m 0 0 c 0.677358 -0.004 0.795881 0.99996 0.36706 1.35399 c -0.340538 0.28114 -0.948956 0.01 -0.998638 -0.50967 c -0.05025 -0.52507 0.49364 -0.7751 0.631578 -0.84432 c 2.02257 -1.01503 5.26759 -0.66963 6.23474 0.50537"];
};

NakaneMin = function() { NakaneChar.call(this, "NakaneMin", "まん", "CR1ER7", "C", "ER", "black", true, p(0.6, -0.4)); };
NakaneMin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["みん"] = NakaneMin;
NakaneMin.prototype.setPaths = NakaneMan.prototype.setPaths;

NakaneMun = function() { NakaneChar.call(this, "NakaneMun", "むん", "CR1ER17", "C", "ER", "black", false, p(0.6, 0.2)); };
NakaneMun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["むん"] = NakaneMun;

NakaneMun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.2415, 0.5293);
      this.paths = ["m 0 0 c 0.919325 0.77026 0.397714 1.50702 -0.08577 1.50476 c -0.263009 -0.001 -0.576846 -0.16077 -0.556324 -0.70913 c 0.01193 -0.31884 0.497076 -0.70345 0.642097 -0.79563 c 5.39847 -3.43123 12.7099 -1.3067 16.2415 0.5293"];
      break;
  }
};

NakaneMun.prototype.setPathsExtra = function() {
  switch (this.getPrevName()) {
    case "NakaneSu":
      this.pathsExtra = [];
      return;
  }

  switch (this.getNextName()) {
    case "NakaneSu":
      this.pathsExtra = ["m 17,-2 v0.1"];
      break;

    default:
      this.pathsExtra = ["m 8.5,-4 v0.1"];
      break;
  }
};

NakaneMen = function() { NakaneChar.call(this, "NakaneMen", "めん", "CR1ER17", "C", "ER", "black", true, p(0.6, 0.2)); };
NakaneMen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["めん"] = NakaneMen;

NakaneMen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.2415, 0.5293);
      this.paths = ["m 0 0 c 0.91932 0.77026 0.39771 1.50702 -0.0858 1.50476 c -0.26301 -0.001 -0.57685 -0.16077 -0.55633 -0.70913 c 0.0119 -0.31884 0.49708 -0.70345 0.6421 -0.79563 c 5.39847 -3.43123 12.7099 -1.3067 16.2415 0.5293"];
      break;
  }
};

NakaneMon = function() { NakaneChar.call(this, "NakaneMon", "もん", "CR1ER17", "C", "ER", "black", false, p(0.6, 0.2)); };
NakaneMon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["もん"] = NakaneMon;

NakaneMon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.2415, 0.5293);
      this.paths = ["m 0 0 c 0.91932 0.77026 0.39771 1.50702 -0.0858 1.50476 c -0.26301 -0.001 -0.57685 -0.16077 -0.55633 -0.70914 c 0.0119 -0.31883 0.49708 -0.70344 0.6421 -0.79562 c 5.39847 -3.43123 12.7099 -1.3067 16.2415 0.5293"];
      break;
  }
};

SvsdHan = function() { SvsdChar.call(this, "SvsdHan", "はん", "NEL20CL1", "NEL", "CL", "black", false, p(0.0, 5.3)); };
SvsdHan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["はん"] = SvsdHan;

SvsdHan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.3611, -8.90272);
      this.paths = ["m 0 0 c 6.97665 0 12.4535 -4.55648 16.3611 -8.90272 c 0.182811 -0.20333 0.493318 -0.515184 0.624212 -0.841307 c 0.321764 -0.801678 -0.37241 -0.870587 -0.683443 -0.742481 c -0.488487 0.201195 -0.371155 1.22447 0.05923 1.58379"];
      break;
  }
};

SvsdYan = function() { SvsdChar.call(this, "SvsdYan", "やん", "NE20CL1", "NE", "CL", "black", false, p(0.0, 5.5)); };
SvsdYan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["やん"] = SvsdYan;

SvsdYan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.2135, -9.3962);
      this.paths = ["m 0 0 l 16.2135 -9.3962 c 0 0 0.88269 -0.36606 0.94421 -0.76682 c 0.0506 -0.32954 -0.18911 -0.6722 -0.55149 -0.83442 c -0.64959 -0.2908 -0.71368 0.77775 -0.39272 1.60124"];
      break;
  }
};

SvsdMan = function() { SvsdChar.call(this, "SvsdMan", "まん", "NER20CSR1", "NER", "CSR", "black", false, p(0.0, 5.0)); };
SvsdMan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["まん"] = SvsdMan;

SvsdMan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.8911, -9.90031);
      this.paths = ["m 0 0 c 4.22756 -5.97217 9.94158 -9.27106 15.8911 -9.90031 c 0.254669 -0.026935 0.869645 -0.153399 1.20215 0.071506 c 0.268193 0.181405 0.44046 0.725224 0.006 1.09656 c -0.250452 0.214082 -0.702147 -0.00233 -1.20818 -1.16807"];
      break;
  }
};

SvsdRan = function() { SvsdChar.call(this, "SvsdRan", "らん", "NER5CR1", "NER", "CR", "black", false, p(0.0, 1.3)); };
SvsdRan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["らん"] = SvsdRan;

SvsdRan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.91706, -2.39127);
      this.paths = ["m 0 0 c 0.424405 -0.745106 1.37749 -1.99163 2.91706 -2.39127 c 0.253889 -0.065903 1.02184 -0.279378 1.27646 0.033091 c 0.280484 0.344205 0.079119 0.80274 -0.103291 0.86918 c -0.3015 0.109817 -0.857271 0.157655 -1.17317 -0.902271"];
      break;
  }
};

SvsdWan = function() { SvsdChar.call(this, "SvsdWan", "わん", "USL5CL1", "USL", "CL", "black", false, p(0.0, -1.3)); };
SvsdWan.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["わん"] = SvsdWan;

SvsdWan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.18945, 1.17722);
      this.paths = ["m 0 0 c 0.019224 1.2306 0.514416 2.96936 1.65244 2.87958 c 0.792399 -0.062512 1.75498 -0.765177 2.53701 -1.70236 c 0.186631 -0.223656 0.608193 -0.679604 0.502827 -1.04994 c -0.143939 -0.505904 -0.707602 -0.522905 -0.937314 -0.290095 c -0.329804 0.334252 0.06131 0.915598 0.434487 1.34003"];
      break;
  }
};


CharDottedCircle = function() { Char.call(this, "CharDottedCircle", "まる", "C", "C", "C", "black", false, p(6.8, 0.0)); };
CharDottedCircle.prototype = Object.create(Char.prototype);
Char.dict["○"] = CharDottedCircle;

CharDottedCircle.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0 0.29 -0.0364 0.572 -0.1051 0.841", "m -0.4168 1.63 c -0.1371 0.249 -0.3046 0.48 -0.4977 0.686", "m -1.5662 2.858 c -0.2366 0.152 -0.4933 0.274 -0.7651 0.364", "m -3.1649 3.383 c -0.0746 0.005 -0.1499 0.007 -0.2257 0.007 c -0.2117 0 -0.4189 -0.019 -0.6198 -0.056", "m -4.8186 3.076 c -0.2586 -0.12 -0.4996 -0.272 -0.7178 -0.451", "m -6.1206 2.011 c -0.1671 -0.226 -0.3066 -0.474 -0.4138 -0.739", "m -6.7514 0.452 c -0.0197 -0.148 -0.0299 -0.299 -0.0299 -0.452 c 0 -0.134 0.0077 -0.265 0.0227 -0.395", "m -6.5563 -1.217 c 0.1027 -0.267 0.2382 -0.518 0.4015 -0.747", "m -5.5805 -2.589 c 0.2152 -0.182 0.4534 -0.338 0.7097 -0.463", "m -4.0672 -3.323 c 0.2187 -0.045 0.4449 -0.068 0.6766 -0.068 c 0.0567 0 0.113 0.001 0.169 0.004", "m -2.3873 -3.24 c 0.2741 0.085 0.5334 0.203 0.7729 0.351", "m -0.9535 -2.358 c 0.1966 0.204 0.368 0.431 0.5092 0.679", "m -0.1197 -0.897 c 0.0732 0.268 0.1144 0.549 0.1193 0.839"];
      break;
  }
};

WasedaMasu = function() { WasedaChar.call(this, "WasedaMasu", "ます", "E24F", "E", "EF", "black"); };
WasedaMasu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ます"] = WasedaMasu;

WasedaMasu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(24 + 2, 0);
      this.paths = ["m0,0h24"];
      break;
  }
};


WasedaMashite = function() { WasedaChar.call(this, "WasedaMashite", "まして", "NE24F", "NE", "NEF", "black"); };
WasedaMashite.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["まして"] = WasedaMashite;

WasedaMashite.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(21.298, -14.9129);
      this.paths = ["m0,0l19.6597,-13.7658"];
      break;
  }
};



SvsdHin = function() { SvsdChar.call(this, "SvsdHin", "ひん", "SWL20CL1", "SWL", "CL", "black", false, p(10.2, -8.7)); };
SvsdHin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひん"] = SvsdHin;

SvsdHin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-10.2188, 15.933);
      this.paths = ["m 0 0 c -4.18081 3.87572 -10.3427 10.9255 -10.2188 15.933 c 0.0067 0.270317 0.03095 0.850035 0.228187 1.18752 c 0.221407 0.378845 0.834008 0.266681 0.949693 -0.02814 c 0.201238 -0.512846 -0.161024 -1.22369 -1.17788 -1.15938"];
      break;
  }
};

SvsdMin = function() { SvsdChar.call(this, "SvsdMin", "みん", "SWR20CR1", "SWR", "CR", "black", false, p(10.5, -8.6)); };
SvsdMin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みん"] = SvsdMin;

SvsdMin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-8.89701, 16.5952);
      this.paths = ["m 0 0 c 1.657 4.50436 -3.00208 12.4314 -8.89701 16.5952 c -0.210968 0.149013 -0.628873 0.562525 -0.984401 0.577932 c -0.394648 0.0171 -0.692651 -0.3985 -0.571155 -0.736425 c 0.179337 -0.498805 0.940511 -0.481281 1.55556 0.158493"];
      break;
  }
};

SvsdRin = function() { SvsdChar.call(this, "SvsdRin", "りん", "SWR5CR1", "SWR", "CR", "black", false, p(2.8, -2.1)); };
SvsdRin.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りん"] = SvsdRin;

SvsdRin.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.34017, 3.77724);
      this.paths = ["m 0 0 c 0.996947 1.44963 0.140282 2.87551 -1.34017 3.77724 c -0.226353 0.13787 -0.628375 0.456437 -1.00653 0.43555 c -0.570243 -0.031497 -0.5333 -0.770792 -0.306824 -0.965818 c 0.40724 -0.350687 0.879387 -0.075527 1.31336 0.530268"];
      break;
  }
};

SvsdHun = function() { SvsdChar.call(this, "SvsdHun", "ふん", "SEL20CL1", "SEL", "CL", "black", false, p(0.0, -5.1)); };
SvsdHun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ふん"] = SvsdHun;

SvsdHun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "S":
    case "S":
      this.dp = p(16.1197, 10.1766);
      this.paths = ["m 0 0 c 0.510129 6.75338 9.63454 10.4642 15.7434 10.1771 c 0.335215 -0.01575 1.09645 0.06791 1.40163 -0.237273 c 0.498649 -0.498649 -0.203453 -1.13831 -0.619562 -1.09243 c -0.460453 0.050766 -0.404322 0.335235 -0.405768 1.32917"];
      return;
  }

  this.dp = p(15.7434, 10.1771);
  this.paths = ["m 0 0 c 0.510129 6.75338 9.63454 10.4642 15.7434 10.1771 c 0.335215 -0.01575 1.07906 0.04946 1.40163 -0.237273 c 0.267763 -0.238011 0.272161 -0.684509 -0.05429 -0.910193 c -0.525879 -0.363549 -0.997442 0.217155 -1.34734 1.14747"];
};

SvsdMun = function() { SvsdChar.call(this, "SvsdMun", "むん", "SER20CR1", "SER", "CR", "black", false, p(0.0, -5.1)); };
SvsdMun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["むん"] = SvsdMun;

SvsdMun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17.058, 8.65728);
      this.paths = ["m 0 0 c 5.63994 -0.254018 15.2682 2.76062 17.058 8.65728 c 0.06841 0.22538 0.363997 1.19993 -0.275106 1.41822 c -0.65533 0.223835 -0.938707 -0.184935 -0.811925 -0.53324 c 0.124193 -0.341193 0.345657 -0.614315 1.08703 -0.884978"];
      break;
  }
};

SvsdYun = function() { SvsdChar.call(this, "SvsdYun", "ゆん", "SE20CL1", "SE", "CL", "black", false, p(0.0, -4.9)); };
SvsdYun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ゆん"] = SvsdYun;

SvsdYun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.1132, 9.31459);
      this.paths = ["m 0 0 l 16.1132 9.31498 c 0.300429 0.18732 0.855586 0.6616 1.22842 0.5314 c 0.251425 -0.0878 0.463564 -0.31919 0.523453 -0.60359 c 0.10794 -0.51259 -0.828177 -0.8515 -1.75187 0.0718"];
      break;
  }
};

SvsdRun = function() { SvsdChar.call(this, "SvsdRun", "るん", "SER5CR1", "SER", "CR", "black", false, p(0.0, -1.3)); };
SvsdRun.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["るん"] = SvsdRun;

SvsdRun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.73751, 0.905521);
      this.paths = ["m 0 0 c 1.01434 0.053204 2.80178 0.124579 3.73751 0.905521 c 0.263101 0.219578 0.483154 0.489687 0.551187 0.84239 c 0.092554 0.479826 -0.188286 0.776154 -0.540888 0.787693 c -0.500532 0.016381 -0.990173 -0.970206 -0.010299 -1.63008"];
      break;
  }
};

ShugiinKar = function() { ShugiinChar.call(this, "ShugiinKar", "かR", "E17F", "E", "EF", "black", false, p(0.0, 0.0)); };
ShugiinKar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["かＲ"] = ShugiinKar;
ShugiinChar.dict["かｒ"] = ShugiinKar;
ShugiinChar.dict["がＲ"] = ShugiinKar;
ShugiinChar.dict["がｒ"] = ShugiinKar;

ShugiinKar.prototype.setPaths = function() {
  this.paths = ["m 0 0 h 17"];

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(18, 1.5);
      return;
  }

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(19, 0);
      break;
  }
};

ShugiinSar = function() { ShugiinChar.call(this, "ShugiinSar", "さR", "SR17F", "SR", "SRF", "black", false, p(0.0, -8.5)); };
ShugiinSar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さＲ"] = ShugiinSar;
ShugiinChar.dict["ざＲ"] = ShugiinSar;
ShugiinChar.dict["さｒ"] = ShugiinSar;
ShugiinChar.dict["ざｒ"] = ShugiinSar;

ShugiinSar.prototype.setPaths = function() {
  this.paths = ["m 0 0 c 2.83221 4.16396 3.99058 11.519 0 17"];

  switch (this.getNextName()) {
    case "ShugiinNomo":
      this.dp = p(0 + 1, 17 + 1.41);
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0 - 1.41, 17 + 1.41);
      break;
  }
};

ShugiinTar = function() { ShugiinChar.call(this, "ShugiinTar", "たR", "S17F", "S", "SF", "black", false, p(0.0, -8.5)); };
ShugiinTar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["たＲ"] = ShugiinTar;
ShugiinChar.dict["だＲ"] = ShugiinTar;
ShugiinChar.dict["たｒ"] = ShugiinTar;
ShugiinChar.dict["だｒ"] = ShugiinTar;

ShugiinTar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "NER":
      this.dp = p(0.6, 17 + 1.5);
      this.paths = ["m 0 0 v 17"];
      break;

    default:
      this.dp = p(0, 17 + 2);
      this.paths = ["m 0 0 v 17"];
      break;
  }
};

ShugiinNara = function() { ShugiinChar.call(this, "ShugiinNara", "なら", "EL17F", "EL", "ELF", "black", false, p(0.0, -1.3)); };
ShugiinNara.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なら"] = ShugiinNara;
ShugiinChar.dict["なり"] = ShugiinNara;
ShugiinChar.dict["なれ"] = ShugiinNara;

ShugiinNara.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17 + 1.41, 0 - 1.41);
      this.paths = ["m 0 0 c 4.57905 3.27522 12.8026 3.87755 17 0"];
      break;
  }
};

ShugiinNaru = function() { ShugiinChar.call(this, "ShugiinNaru", "なる", "EL7UEL3", "EL", "WL", "black", false, p(0.0, -1.0)); };
ShugiinNaru.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なる"] = ShugiinNaru;

ShugiinNaru.prototype.setPaths = function() {
  this.paths = ["m 0 0 c 2.22518 1.89138 5.80144 3.26999 8.65419 1.85154 c 2.67376 -1.32947 0.511931 -3.22497 -1.65845 -1.60724"];
  switch (this.getNextName()) {
    case "ShugiinNo":
      this.dp = p(6.99574 + 0.8, 0.2443 + 3.5);
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.99574, 0.2443 + 1.2);
      this.paths = ["m 0 0 c 2.22518 1.89138 5.80144 3.26999 8.65419 1.85154 c 2.67376 -1.32947 0.511931 -3.22497 -1.65845 -1.60724"];
      break;
  }
};

ShugiinHar = function() { ShugiinChar.call(this, "ShugiinHar", "はR", "SEL17F", "SEL", "SELF", "black", false, p(0.0, -6.0)); };
ShugiinHar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["はＲ"] = ShugiinHar;
ShugiinChar.dict["ぱＲ"] = ShugiinHar;
ShugiinChar.dict["ばＲ"] = ShugiinHar;
ShugiinChar.dict["はｒ"] = ShugiinHar;
ShugiinChar.dict["ぱｒ"] = ShugiinHar;
ShugiinChar.dict["ばｒ"] = ShugiinHar;

ShugiinHar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(12.0208 + 2, 12.0208);
      this.paths = ["m 0 0 c 0.917413 5.61703 6.76627 11.8076 12.0208 12.0208"];
      break;
  }
};

ShugiinMar = function() { ShugiinChar.call(this, "ShugiinMar", "まR", "ER17F", "ER", "ERF", "black", false, p(0.0, 1.2)); };
ShugiinMar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["まＲ"] = ShugiinMar;
ShugiinChar.dict["まｒ"] = ShugiinMar;

ShugiinMar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(17 + 1.41, 0 + 1.41);
      this.paths = ["m 0 0 c 5.72582 -3.66844 13.317 -2.7792 17 0"];
      break;
  }
};

ShugiinYar = function() { ShugiinChar.call(this, "ShugiinYar", "やR", "NER17F", "NER", "NERF", "black", false, p(0.0, 6.0)); };
ShugiinYar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["やＲ"] = ShugiinYar;
ShugiinChar.dict["やｒ"] = ShugiinYar;

ShugiinYar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(12.0208 + 2, -12.0208);
      this.paths = ["m 0 0 c 1.55678 -7.43949 6.55035 -11.0499 12.0208 -12.0208"];
      break;
  }
};

ShugiinKakar = function() { ShugiinChar.call(this, "ShugiinKakar", "かかＲ", "UWR3E17F", "WR", "EF", "black", false, p(1.2, 0.5)); };
ShugiinKakar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["かかＲ"] = ShugiinKakar;
ShugiinChar.dict["がかＲ"] = ShugiinKakar;
ShugiinChar.dict["かかｒ"] = ShugiinKakar;
ShugiinChar.dict["がかｒ"] = ShugiinKakar;

ShugiinKakar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.4715 + 2, -1.01716);
      this.paths = ["m 0 0 c -0.31816 0 -0.87001 -0.0069 -1.0943 -0.266078 c -0.21888 -0.252902 -0.12138 -0.758178 0.45576 -0.758178 l 16.1101 0.0071"];
      break;
  }
};

ShugiinSakar = function() { ShugiinChar.call(this, "ShugiinSakar", "さかＲ", "UNWR3SR17F", "NWR", "SRF", "black", false, p(0.2, -6.4)); };
ShugiinSakar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["さかＲ"] = ShugiinSakar;
ShugiinChar.dict["ざかＲ"] = ShugiinSakar;
ShugiinChar.dict["さかｒ"] = ShugiinSakar;
ShugiinChar.dict["ざかｒ"] = ShugiinSakar;

ShugiinSakar.prototype.setPaths = function() {
  this.paths = ["m 0 0 c -0.30944 -0.487973 -0.14596 -1.61095 0.18774 -1.78436 c 0.33369 -0.173411 0.79422 0.15884 1.04531 0.38468 c 4.0449 4.22905 3.21006 13.1067 0.32927 16.2432"];

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.56232 - 1.41, 14.8435 + 1.41);
      break;
  }
};

ShugiinMakar = function() { ShugiinChar.call(this, "ShugiinMakar", "まかＲ", "UWR3ER17F", "WR", "ERF", "black", false, p(1.6, 1.9)); };
ShugiinMakar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["まかＲ"] = ShugiinMakar;
ShugiinChar.dict["まかｒ"] = ShugiinMakar;
ShugiinChar.dict["まがＲ"] = ShugiinMakar;
ShugiinChar.dict["まがｒ"] = ShugiinMakar;

ShugiinMakar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.2145 + 1.41, -1.29632 + 1.41);
      this.paths = ["m 0 0 c -0.31787 0 -0.50771 -0.01553 -1.07901 -0.07418 c -0.38476 -0.03949 -0.89454 -0.497822 -0.23591 -1.0919 c 5.59722 -5.04859 15.3846 -1.77859 16.5294 -0.130236"];
      break;
  }
};

ShugiinNakar = function() { ShugiinChar.call(this, "ShugiinNakar", "なかＲ", "UWL3EL17F", "WL", "ELF", "black", false, p(1.8, -1.7)); };
ShugiinNakar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["なかＲ"] = ShugiinNakar;
ShugiinChar.dict["なかｒ"] = ShugiinNakar;

ShugiinNakar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.9747 + 1.41, 0.87494 - 1.41);
      this.paths = ["m 0 0 c -0.722481 -0.2477 -1.36714 -0.0678 -1.56002 0.1063 c -0.249188 0.22487 -0.317813 0.49088 0.165846 0.98835 c 3.28908 3.38299 12.6816 3.30053 16.3689 -0.21971"];
      break;
  }
};

ShugiinNagar = function() { ShugiinChar.call(this, "ShugiinNagar", "ながＲ", "UWL3NEL17F", "SWL", "NELF", "black", false, p(1.0, 2.5)); };
ShugiinNagar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["ながＲ"] = ShugiinNagar;
ShugiinChar.dict["ながｒ"] = ShugiinNagar;
ShugiinChar.dict["ながら"] = ShugiinNagar;

ShugiinNagar.prototype.setPaths = function() {
  this.paths = ["m 0 0 c -0.523293 0.20932 -1.09054 0.92025 -0.920988 1.47434 c 0.115139 0.37626 0.590393 0.45457 1.07858 0.47974 c 4.86827 0.25094 12.5864 -3.51756 13.7416 -8.8564"];

  switch (this.getNextName()) {
    case "ShugiinWa":
      this.dp = p(13.8992 + 3, -6.90232 - 1);
      return;
  }

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(13.8992 + 0.333599, -6.90232 - 2.00187);
      break;
  }
};

ShugiinHanar = function() { ShugiinChar.call(this, "ShugiinHanar", "はなＲ", "UNL3SEL17", "NWL", "SEL", "black", false, p(2.4, -4.4)); };
ShugiinHanar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["はなＲ"] = ShugiinHanar;
ShugiinChar.dict["はなｒ"] = ShugiinHanar;
ShugiinChar.dict["ばなＲ"] = ShugiinHanar;
ShugiinChar.dict["ばなｒ"] = ShugiinHanar;
ShugiinChar.dict["ぱなＲ"] = ShugiinHanar;
ShugiinChar.dict["ぱなｒ"] = ShugiinHanar;

ShugiinHanar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(11.3105 + 1.93713, 9.62821 - 0.49521);
      this.paths = ["m 0 0 c -0.400771 -0.85499 -1.09844 -1.09878 -1.76871 -0.83963 c -0.670269 0.25915 -0.725987 1.31461 -0.610011 1.80676 c 1.19175 5.05718 7.9245 9.79156 13.6892 8.66108"];
      break;
  }
};

ShugiinHakar = function() { ShugiinChar.call(this, "ShugiinHakar", "はかＲ", "SEL7E17F", "SEL", "EF", "black", false, p(0.0, -2.7)); };
ShugiinHakar.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["はかＲ"] = ShugiinHakar;
ShugiinChar.dict["はかｒ"] = ShugiinHakar;
ShugiinChar.dict["〜ばかり"] = ShugiinHakar;
ShugiinChar.dict["ばかり"] = ShugiinHakar;

ShugiinHakar.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(19.5806 + 2, 5.34209);
      this.paths = ["m 0 0 c 0.063 3.58498 2.4218 5.38939 4.4641 5.38939 c 4.64828 0 15.1165 -0.0473 15.1165 -0.0473"];
      break;
  }
};

SvsdHen = function() { SvsdChar.call(this, "SvsdHen", "へん", "UWL5CL1", "SWL", "CL", "black", false, p(2.8, -2.5)); };
SvsdHen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["へん"] = SvsdHen;

SvsdHen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.54649, 4.98254);
      this.paths = ["m 0 0 c -1.54618 0.81314 -3.06762 1.9439 -2.80689 3.38677 c 0.119989 0.664008 0.555543 1.31787 1.2604 1.59577 c 0.275956 0.108797 0.952742 0.196911 1.30922 -0.058803 c 0.388983 -0.27903 0.283244 -0.975982 -0.114738 -0.995982 c -0.642244 -0.032275 -0.906897 0.646813 -1.19448 1.05478"];
      break;
  }
};

SvsdMen = function() { SvsdChar.call(this, "SvsdMen", "めん", "UER5CR1", "SER", "CR", "black", false, p(0.4, -2.4)); };
SvsdMen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["めん"] = SvsdMen;

SvsdMen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.08915, 4.37873);
      this.paths = ["m 0 0 c 1.96459 0.169174 2.87771 0.486324 3.07622 1.62962 c 0.189968 1.09408 -0.924359 2.07061 -1.98707 2.74911 c -0.226992 0.144924 -0.678897 0.511886 -1.06051 0.463467 c -0.492592 -0.0625 -0.558086 -0.763341 -0.280114 -1.01928 c 0.277972 -0.255938 0.77527 -0.10462 1.34062 0.555812"];
      break;
  }
};

SvsdRen = function() { SvsdChar.call(this, "SvsdRen", "れん", "SR5CR1", "SR", "CR", "black", false, p(0.8, -2.5)); };
SvsdRen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["れん"] = SvsdRen;

SvsdRen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.629899, 3.88704);
      this.paths = ["m 0 0 c 0.824764 1.4963 0.997332 2.8051 0.629899 3.88704 c -0.084408 0.248545 -0.420098 1.01408 -0.785919 1.01533 c -0.529194 0.00181 -0.799028 -0.731561 -0.572617 -1.00307 c 0.270397 -0.324255 1.07722 -0.130765 1.35854 -0.012258"];
      break;
  }
};

SvsdHon = function() { SvsdChar.call(this, "SvsdHon", "ほん", "EL20CL1", "EL", "CL", "black", false, p(0.0, -0.8)); };
SvsdHon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ほん"] = SvsdHon;

SvsdHon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(18.6888, 0.535348);
      this.paths = ["m 0 0 c 4.83307 3.73527 12.0943 3.08477 18.6888 0.535348 c 0.265164 -0.102511 0.979122 -0.305347 1.16089 -0.643284 c 0.238258 -0.442975 -0.252649 -0.957274 -0.656664 -0.803045 c -0.493835 0.188516 -0.503113 0.767966 -0.504221 1.44633"];
      break;
  }
};

SvsdMon = function() { SvsdChar.call(this, "SvsdMon", "もん", "ER20CR1", "ER", "CR", "black", false, p(0.0, 1.0)); };
SvsdMon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["もん"] = SvsdMon;

SvsdMon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(18.7128, -1.12334);
      this.paths = ["m 0 0 c 5.99742 -2.43474 14.4918 -3.85161 18.7128 -1.12334 c 0.27895 0.180305 0.773613 0.513951 0.937816 0.892871 c 0.26892 0.620568 -0.275207 0.869237 -0.498682 0.835661 c -0.424906 -0.063839 -0.591755 -1.08493 -0.439134 -1.72853"];
      break;
  }
};

SvsdRon = function() { SvsdChar.call(this, "SvsdRon", "ろん", "ER5CR1", "ER", "CR", "black", false, p(0.0, -0.0)); };
SvsdRon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ろん"] = SvsdRon;

SvsdRon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.63185, -0.685131);
      this.paths = ["m 0 0 c 1.20999 -0.57233 2.4904 -0.935049 3.63185 -0.685131 c 0.319967 0.070056 1.14508 0.201426 1.25349 0.628533 c 0.027486 0.108287 0.060225 0.876497 -0.610666 0.862486 c -0.413469 -0.008635 -0.607159 -0.690937 -0.642821 -1.49102"];
      break;
  }
};

NakaneYan = function() { NakaneChar.call(this, "NakaneYan", "やん", "CL1SWL7", "C", "SWL", "black", false, p(4.9, -1.5)); };
NakaneYan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["やん"] = NakaneYan;

NakaneYan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.86827, 3.22952);
      this.paths = ["m 0 0 c -0.256385 0.86587 0.26101 0.9851 0.569911 1.03473 c 0.332442 0.0534 0.978479 -0.31504 0.77237 -0.81443 c -0.271949 -0.65891 -1.11355 -0.28573 -1.34228 -0.2203 c -1.7664 0.50532 -3.43606 1.4845 -4.86827 3.22952"];
      break;
  }
};

NakaneYun = function() { NakaneChar.call(this, "NakaneYun", "ゆん", "CL1SWL7", "C", "SWL", "black", true, p(4.9, -1.5)); };
NakaneYun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ゆん"] = NakaneYun;
NakaneYun.prototype.setPaths = NakaneYan.prototype.setPaths;

NakaneYon = function() { NakaneChar.call(this, "NakaneYon", "よん", "CL1SWL17", "C", "SWL", "black", false, p(13.1, -3.9)); };
NakaneYon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["よん"] = NakaneYon;

NakaneYon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-13.079, 8.10161);
      this.paths = ["m 0 0 c 0.3831 0.48841 0.88696 1.18541 1.46518 0.94893 c 0.39003 -0.15952 0.37458 -0.91954 0.0481 -1.112 c -0.35235 -0.20771 -1.1863 0.0736 -1.51328 0.16302 c -4.02247 1.10358 -9.70627 3.57109 -13.079 8.10166"];
      break;
  }
};

NakaneWan = function() { NakaneChar.call(this, "NakaneWan", "わん", "CL1SWL17", "C", "SWL", "black", true, p(13.1, -3.9)); };
NakaneWan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["わん"] = NakaneWan;

NakaneWan.prototype.setPaths = NakaneYon.prototype.setPaths;

NakaneRan = function() { NakaneChar.call(this, "NakaneRan", "らん", "CR1SWR7", "C", "SWR", "black", false, p(4.1, -1.4)); };
NakaneRan.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["らん"] = NakaneRan;

NakaneRan.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.14535, 4.2042);
      this.paths = ["m 0 0 c -1.37742 -0.36217 -1.00855 -1.07763 -0.810247 -1.22312 c 0.31837 -0.23359 0.712645 -0.21233 0.976507 0.12039 c 0.276609 0.34878 -0.07959 0.89788 -0.16626 1.10273 c -0.701331 1.65774 -2.20793 3.26526 -4.14535 4.2042"];
      break;
  }
};

NakaneRin = function() { NakaneChar.call(this, "NakaneRin", "りん", "CR1SWR7", "C", "SWR", "black", true, p(4.1, -1.4)); };
NakaneRin.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["りん"] = NakaneRin;

NakaneRin.prototype.setPaths = NakaneRan.prototype.setPaths;

NakaneRun = function() { NakaneChar.call(this, "NakaneRun", "るん", "CR1CWR17", "C", "CWR", "black", false, p(12.4, -4.3)); };
NakaneRun.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["るん"] = NakaneRun;

NakaneRun.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-12.4485, 9.9186);
      this.paths = ["m 0 0 c -1.19954 -0.34621 -0.979031 -1.09474 -0.66258 -1.26304 c 0.351572 -0.18698 0.816185 -0.16868 0.976339 0.0257 c 0.332736 0.40387 -0.203821 1.05051 -0.313759 1.23733 c -2.19718 3.73386 -5.20467 7.29024 -12.4485 9.91861"];
      break;
  }
};

NakaneRun.prototype.setPathsExtra = function() {
  switch (this.getPrevName()) {
    case "NakaneSu":
      this.pathsExtra = [];
      break;
      
    default:
      this.pathsExtra = ["m -6,4 v0.1"];
      break;
  }
};

NakaneRen = function() { NakaneChar.call(this, "NakaneRen", "れん", "CR1CWR17", "C", "CWR", "black", true, p(12.4, -4.3)); };
NakaneRen.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["れん"] = NakaneRen;
NakaneRen.prototype.setPaths = NakaneRun.prototype.setPaths;

NakaneRon = function() { NakaneChar.call(this, "NakaneRon", "ろん", "CR1CWR17", "C", "CWR", "black", false, p(12.4, -4.3)); };
NakaneRon.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ろん"] = NakaneRon;
NakaneRon.prototype.setPaths = NakaneRun.prototype.setPaths;

NakaneNiJoshi = function() { NakaneChar.call(this, "NakaneNiJoshi", "〜に", "USWL3", "SWL", "NEL", "black", true, p(1.6, -1.2)); };
NakaneNiJoshi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["〜に"] = NakaneNiJoshi;

NakaneNiJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.99842, 1.11823);
      this.paths = ["m 0 0 c 0 0 -2.08429 1.64949 -1.43236 2.30829 c 0.65117 0.65805 2.43078 -1.19006 2.43078 -1.19006"];
      break;
  }
};

NakaneKurikaeshi = function() { NakaneChar.call(this, "NakaneKurikaeshi", "々", "TS2", "T", "S", "black", true, p(0.0, -1)); };
NakaneKurikaeshi.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["々"] = NakaneKurikaeshi;

NakaneKurikaeshi.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {
    case "S":
      this.dp = p(1, 1);
      this.paths = ["m1,-1v2"];
      break;
      
    default:
      this.dp = p(0, 1);
      this.paths = ["m0,-1v2"];
      break;
  }
};

WasedaHi = function() { WasedaChar.call(this, "WasedaHi", "ひ", "SEL8CL1", "SEL", "SELCL", "black", false, p(0.0, -2.9)); };
WasedaHi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ひ"] = WasedaHi;

WasedaHi.prototype.setPaths = function() {
  switch (this.getNextName()) {
    case "WasedaWa":
      this.dp = p(2.58596, 5.38593);
      this.paths = ["m 0 0 c 0 3.707 1.0848 5.646 4.411 5.646 c 0.3891 0 0.527567 -0.25784 0.446365 -0.45584 c -0.269576 -0.6573 -1.74425 0.0445 -2.27141 0.19577"];
      return;
  }

  switch (this.getNextHeadModel()) {
    case "SR8":
      this.dp = p(4.20763, 5.76385);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.3919 0 0.63912 -0.408569 0.549706 -0.688227 c -0.124066 -0.388039 -0.912417 -0.646563 -1.17527 -0.335316 c -0.243744 0.288619 0.243641 0.668833 0.488989 1.0224"];
      return;

    case "EL16":
      this.dp = p(5.0592, 5.35871);
      this.paths = ["m 0 0 c 0 3.7202 1.0887 5.667 4.4275 5.667 c 0.598501 0 0.776526 -0.511535 0.776526 -0.725935 c 0 -0.3932 -0.790948 -0.849394 -1.26847 -0.192815 c -0.267796 0.368214 0.461641 0.457555 1.12364 0.610455"];
      return;

    case "EL8":
      this.dp = p(4.92477, 5.45748);
      this.paths = ["m 0 0 c 0 3.7202 1.08867 5.6669 4.42754 5.6669 c 0.649137 0 0.63491 -0.581588 0.63491 -0.796088 c 0 -0.493789 -0.790957 -0.595672 -1.09393 -0.263239 c -0.28726 0.315189 0.325161 0.644908 0.956251 0.849908"];
      return;

    case "NEL16":
      this.dp = p(5.48531, 4.76323);
      this.paths = ["m 0 0 c 0 3.7202 1.0885 5.667 4.4275 5.667 c 0.3901 0 0.730452 -0.101222 0.905224 -0.436174 c 0.400375 -0.767321 -0.06285 -0.978685 -0.437432 -1.07334 c -0.372691 -0.09418 -1.03549 0.377026 -0.890322 0.732968 c 0.187033 0.458591 1.07783 0.144176 1.48034 -0.127224"];
      return;

    case "SER8":
      this.dp = p(4.427, 5.6669);
      this.paths = ["m 0 0 c 0 3.7202 1.088 5.6669 4.427 5.6669 c 0.391 0 0.54152 -0.216225 0.494 -0.4291 c -0.0999 -0.447338 -1.09407 -0.771781 -1.323 -0.3747 c -0.19224 0.333453 0.443 0.5335 0.829 0.8038"];
      return;

    case "SER16":
      this.dp = p(4.4275, 5.667);
      this.paths = ["m 0 0 c 0 3.72 1.0886 5.667 4.4275 5.667 c 0.3904 0 0.551354 -0.21885 0.4935 -0.429 c -0.127703 -0.46387 -1.22989 -0.69776 -1.4205 -0.256 c -0.152214 0.35277 0.4988 0.458 0.927 0.685"];
      return;

    case "ER8":
      this.dp = p(4.86875, 5.36523);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.588244 0 0.714155 -0.839759 0.4375 -1.13705 c -0.310836 -0.334024 -1.32265 -0.057564 -1.30954 0.398527 c 0.01376 0.478832 0.4234 0.599525 1.39659 0.338759"];
      return;

    case "SER4":
    case "SER8":
     this.dp = p(4.48139, 5.74753);
     this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.3919 0 0.654699 -0.414037 0.549706 -0.688227 c -0.158844 -0.414823 -1.11236 -0.615053 -1.31439 -0.21946 c -0.192119 0.376191 0.464896 0.386278 0.901874 0.890218"];
     return;
  }

  switch (this.getNextHeadType()) {
    case "S":
      this.dp = p(3.86235, 5.75002);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.767785 0 0.466055 -0.937383 0.138619 -1.12771 c -0.222938 -0.129586 -0.620473 -0.012216 -0.620473 0.462015 v 0.650719"];
      return;

    case "NE":
      this.dp = p(2.9001, 5.60768);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.3919 0 0.631719 -0.489527 0.549706 -0.688227 c -0.42962 -1.04087 -1.30682 0.033397 -1.99381 0.530904"];
      return;

    case "E":
      this.dp = p(5.45112, 4.90528);
      this.paths = ["m 0 0 c 0 3.7201 1.18678 5.5886 4.52557 5.5886 c 0.5132 0 0.742235 -0.09266 0.88951 -0.379396 c 0.151419 -0.294803 0.074323 -0.810136 -0.21567 -0.970575 c -0.319428 -0.176723 -1.04426 0.01365 -1.03193 0.366745 c 0.01743 0.4992 0.748749 0.299907 1.28364 0.299907"];
      break;

    case "SW":
      this.dp = p(3.63045, 5.73098);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.3919 0 0.534242 -0.39503 0.549706 -0.688227 c 0.010682 -0.202526 -0.12508 -0.501815 -0.327595 -0.512699 c -0.49789 -0.026759 -0.675179 0.542121 -0.935859 1.1669"];
      return;

    default:
      this.dp = p(3.3474, 5.6955);
      this.paths = ["m 0 0 c 0 3.7342 0.9929 5.765 4.3442 5.765 c 0.3919 0 0.585112 -0.476203 0.549706 -0.688227 c -0.0558 -0.334177 -0.321131 -0.651399 -0.692405 -0.386917 c -0.387966 0.276374 -0.621814 0.700078 -0.854101 1.00564"];
      break;
  }
};

WasedaHa = function() { WasedaChar.call(this, "WasedaHa", "は", "SEL8", "SEL", "SEL", "black", false, p(0.0, -3.0)); };
WasedaHa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["は"] = WasedaHa;

WasedaHa.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "WasedaToshite_E":
      this.dp = p(5.2185, 4.05424);
      this.paths = ["m 0 0 c 1.1621 3.5932 3.39526 5.87748 5.2185 4.05424"];
      return;
  }

  switch (name_) {
    case "WasedaToJoshi":
    case "WasedaToshite":
      this.dp = p(5.2185, 4.6433);
      this.paths = ["m 0 0 c 1.1621 3.5932 3.2208 4.6433 5.2185 4.6433"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "ELCL":
    case "ELCL4":
      this.dp = p(4.18711, 5.9798);
      this.paths = ["m 0 0 c -0.96945 3.61804 1.58615 5.9798 4.18711 5.9798"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SER16":
      this.dp = p(4.18711, 5.9798);
      this.paths = ["m 0 0 c 0 3.7764 1.12394 4.32292 4.18711 5.9798"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(4.1871, 5.98);
      this.paths = ["m 0 0 c 0 4.28632 2.94727 5.11174 4.1871 5.98"];
      return;
  }

  switch (_head) {
    case "E":
    case "SEL":
    case "EL":
    case "SE":
      this.dp = p(4.18711, 4.5799);
      this.paths = ["m 0 0 c 0 5.4461 2.79955 6.9832 4.18711 4.5799"];
      break;

    case "NEL":
      this.dp = p(4.5, 6.125);
      this.paths = ["m 0 0 c 0 2.082 2.6089 6.125 4.5 6.125"];
      break;

    default:
      this.dp = p(4.18711, 5.9798);
      this.paths = ["m 0 0 c 0 3.7764 0.797901 5.9798 4.18711 5.9798"];
      break;
  }
};

WasedaHu = function() { WasedaChar.call(this, "WasedaHu", "ふ", "SEL8CL4", "SEL", "SELCL4", "black", false, p(0.0, -2.9)); };
WasedaHu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ふ"] = WasedaHu;

WasedaHu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaWa":
      this.dp = p(0.92649, 4.62699);
      this.paths = ["m 0 0 c 0 1.867 0.307 3.31 0.765 4.3381 c 0.493 1.0114 1.382 1.4475 2.722 1.4475 c 0.628 0 1.34865 -0.166261 1.32745 -0.660206 c -0.0512 -1.19284 -2.61931 -0.871696 -3.88796 -0.498401"];
      return;

    case "WasedaSai":
    case "WasedaSei":
      this.dp = p(3.0854, 5.84032);
      this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.52802 -0.519829 1.41513 -1.10825 c -0.255291 -1.33066 -3.19042 -2.29788 -3.90051 -1.14393 c -0.535634 0.870447 1.30704 2.23759 2.09629 2.23759"];
      return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "SL8":
      this.dp = p(0.941047, 4.66447);
      this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.3022 -0.1748 1.3022 -0.7218 c 0 -0.887326 -0.710275 -2.25476 -1.66954 -2.36885 c -0.953769 -0.113438 -1.92007 1.53545 -2.16612 1.90022"];
      return;

    case "SW8":
      this.dp = p(0.7678, 4.3545);
      this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.34181 1.87269 2.18248 1.87269 c 0.686503 0 1.32178 -1.76145 1.26539 -2.77717 c -0.051869 -0.934293 -0.441775 -2.44841 -1.43955 -2.40998 c -0.848915 0.032689 -1.51162 1.88552 -2.00832 3.31447"];
      return;

    case "SE4":
      this.dp = p(2.91358, 5.8235);
      this.paths = ["m 0 0 c -0.03365 2.67325 0.754208 5.81682 3.4745 5.8549 c 0.6304 0 1.3022 -0.1748 1.3022 -0.7218 c 0 -1.70377 -2.23519 -2.83527 -3.16704 -2.00337 c -0.744182 0.66436 0.659576 2.04944 1.30392 2.69378"];
      return;

    case "ER4":
      this.dp = p(0.072595, 3.44336);
      this.paths = ["m 0 0 c -0.11586 1.657 0.04527 3.59 0.25878 4.938 c 0.198361 0.933 0.917832 2.51173 1.8085 2.19043 c 0.637534 -0.22998 0.522335 -1.35924 -0.004552 -2.03324 c -0.327236 -0.435 -1.26594 -1.18183 -1.99013 -1.65183"];
      return;
  }

  switch (_head) {
    case "EL":
      this.dp = p(0.349, 3.1511);
      this.paths = ["m 0 0 c 0 1.867 0.354 3.3083 0.687 4.3331 c 0.367 1.0094 0.996 1.4914 1.979 1.4914 c 0.46 0 0.855 -0.0783 0.855 -0.4361 c 0 -0.3631 -0.654 -0.8706 -1.387 -1.2934 c -0.724 -0.4355 -1.547 -0.8066 -1.785 -0.9439"];
      return;

    case "SER":
      this.dp = p(0.072595, 3.44336);
      this.paths = ["m 0 0 c -0.11586 1.657 0.04527 3.59 0.25878 4.938 c 0.198361 0.933 0.917832 2.51173 1.8085 2.19043 c 0.637534 -0.22998 0.522335 -1.35924 -0.004552 -2.03324 c -0.327236 -0.435 -1.26594 -1.18183 -1.99013 -1.65183"];
      return;

    case "SW":
      this.dp = p(1.7783, 5.47189);
      this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.17973 -0.240859 1.3022 -0.7218 c 0.231203 -0.907971 -0.20436 -2.83417 -1.18593 -2.57342 c -0.989362 0.262822 -1.55567 2.36151 -1.81247 2.91221"];
      return;

    case "SEL":
     this.dp = p(1.57973, 5.34499);
     this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.23675 -0.229846 1.3022 -0.7218 c 0.14847 -1.11596 -1.33329 -2.6351 -2.42309 -2.35272 c -0.864397 0.223974 -0.773881 1.47322 -0.773881 2.56461"];
     return;
  }

  this.dp = p(0.6103, 3.8936);
  this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.3022 -0.1748 1.3022 -0.7218 c 0 -0.42 -0.7718 -0.8055 -1.6955 -1.0188 c -0.9158 -0.2453 -2.0018 -0.2207 -2.4709 -0.2207"];
};

WasedaHe = function() { WasedaChar.call(this, "WasedaHe", "へ", "SEL16CL1", "SEL", "CL", "black", false, p(0.0, -7.0)); };
WasedaHe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["へ"] = WasedaHe;

WasedaHe.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "NEL8":
    case "NEL8CL1":
      this.dp = p(8.54163, 13.034);
      this.paths = ["m 0 0 c 0 4.132 0.5073 7.8422 1.6478 10.4039 c 1.1851 2.5413 4.1962 4.1966 6.4002 3.261 c 0.584413 -0.236032 0.5781 -0.7769 0.3506 -1.0789 c -0.309355 -0.433043 -0.885546 -0.314146 -1.29955 0.235154 c -0.4077 0.5411 0.45018 0.785831 1.44258 0.212831"];
      return;

    case "SER8":
     this.dp = p(7.50437, 13.827);
     this.paths = ["m 0 0 c 0 8.2946 1.4198 15.0205 7.9403 13.753 c 0.2736 -0.0482 0.40475 -0.383783 0.309 -0.5812 c -0.199678 -0.411694 -1.10057 -0.627459 -1.35076 -0.244356 c -0.197672 0.302684 -0.096421 0.425868 0.605837 0.899551"];
     return;

    case "ER8":
      this.dp = p(8.82771, 13.0073);
      this.paths = ["m 0 0 c 0 8.2635 1.463 15.1903 7.911 13.7016 c 1.25573 -0.28992 0.98625 -1.04571 0.573 -1.2283 c -0.59993 -0.26507 -1.23524 0.187582 -1.10524 0.752682 c 0.11 0.4775 0.88395 0.02078 1.44895 -0.218717"];
      return;

    case "NEL16":
    case "NEL16CL1":
    case "NEL16CL8":
      this.dp = p(8.55068, 13.0147);
      this.paths = ["m 0 0 c 0 4.132 0.507 7.8422 1.648 10.4039 c 1.185 2.5413 4.18778 4.17684 6.4 3.261 c 0.61545 -0.254791 0.578 -0.7769 0.351 -1.0789 c -0.39 -0.5366 -1.10954 -0.281369 -1.52354 0.268031 c -0.425 0.564 0.71122 0.81073 1.67522 0.16063"];
      return;

    case "SW8":
      this.dp = p(7.01351, 13.9014);
      this.paths = ["m 0 0 c 0 8.2946 1.44769 15.1564 7.9403 13.753 c 0.273487 -0.05912 0.485738 -0.243699 0.507664 -0.474227 c 0.025536 -0.268487 -0.206842 -0.651987 -0.476534 -0.653873 c -0.531972 -0.0037 -0.738032 0.672356 -0.957922 1.2765"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "S":
      this.dp = p(7.43503, 13.8367);
      this.paths = ["m 0 0 c 0 8.2946 1.4198 15.0205 7.9403 13.753 c 0.2736 -0.0482 0.38303 -0.267953 0.383074 -0.470089 c 6.6e-05 -0.300958 -0.276176 -0.765066 -0.570052 -0.70016 c -0.421094 0.093 -0.31829 0.602213 -0.31829 1.25396"];
      return;

    case "E":
      this.dp = p(8.69414, 13.2206);
      this.paths = ["m 0 0 c 0 8.2946 1.4198 15.0205 7.9403 13.753 c 0.752488 -0.201628 0.856193 -0.593229 0.774184 -1.0092 c -0.06068 -0.307776 -0.500449 -0.495727 -0.813355 -0.47342 c -0.33761 0.02407 -0.875155 0.300984 -0.796231 0.63012 c 0.126009 0.52549 0.71422 0.320111 1.58924 0.320111"];
      return;

    default:
      this.dp = p(6.3301, 13.8713);
      this.paths = ["m 0 0 c 0 8.2946 1.4198 15.0205 7.9403 13.753 c 0.2736 -0.0482 0.3732 -0.3714 0.309 -0.5812 c -0.0492 -0.1716 -0.226 -0.3314 -0.4637 -0.2677 c -0.5609 0.1608 -1.0556 0.5674 -1.4555 0.9672"];
      break;
  }
};

WasedaHo = function() { WasedaChar.call(this, "WasedaHo", "ほ", "SEL16", "SEL", "SEL", "black", false, p(0.0, -6.9)); };
WasedaHo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ほ"] = WasedaHo;

WasedaHo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  switch (model_) {
    case "E8CL4":
      this.dp = p(8, 13.8564);
      this.paths = ["m 0 0 c -1.55282 7.56121 1.3202 13.8564 8 13.8564"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SER8":
      this.dp = p(8, 13.856);
      this.paths = ["m 0 0 c 0 6.4086 2.7214 10.1602 8 13.856"];
      return;
  }

  switch (_head) {
    case "E":
    case "SEL":
    case "EL":
    case "SE":
      this.dp = p(8, 11.1564);
      this.paths = ["m 0 0 c 0 10.815 5.0359 16.2904 8 11.1564"];
      return;

    case "NEL":
      this.dp = p(8, 13.8564);
      this.paths = ["m 0 0 c 0 7.6983 4.64325 13.8564 8 13.8564"];
      return;
  }

  this.dp = p(8, 13.8564);
  this.paths = ["m 0 0 c 0 7.6983 1.3202 13.8564 8 13.8564"];
};

SvsdYon = function() { SvsdChar.call(this, "SvsdYon", "よん", "E20CL1", "E", "CL", "black", false, p(0.0, 0.7)); };
SvsdYon.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["よん"] = SvsdYon;

SvsdYon.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(18.6813, -0.0215);
      this.paths = ["m 0 0 l 18.6813 -0.0215 c 0.715134 -0.00082 1.29478 0.21311 1.31863 -0.90043 c 0.0053 -0.24819 -0.207752 -0.39396 -0.387815 -0.37878 c -0.52548 0.0443 -0.930817 1.27921 -0.930817 1.27921"];
      break;
  }
};

SvsdAi = function() { SvsdChar.call(this, "SvsdAi", "あい", "NE10P", "NE", "P", "black", false, p(0.0, 3.0)); };
SvsdAi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["あい"] = SvsdAi;

SvsdAi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(10.4218, -5.91702);
      this.paths = ["m 0 0 l 8.66025 -5", "m 10.4218 -6.01702 v 0.1"];
      break;

    default:
      this.dp = p(10.4218, -5.91702);
      this.paths = ["m 0,0 8.66025,-5"];
      break;
  }
};

SvsdIi = function() { SvsdChar.call(this, "SvsdIi", "いい", "SW10P", "SW", "P", "black", false, p(6.0, -5.3)); };
SvsdIi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["いい"] = SvsdIi;
SvsdChar.dict["いー"] = SvsdIi;

SvsdIi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-6.01374, 10.5161);
      this.paths = ["m 0 0 l -5 8.66022", "m -6.01374 10.4161 v 0.1"];
      break;

    default:
      this.dp = p(-6.01374, 10.5161);
      this.paths = ["m 0 0 l -5 8.66022"];
      break;
  }
};

SvsdUh = function() { SvsdChar.call(this, "SvsdUh", "うー", "SE10P", "SE", "P", "black", false, p(0.0, -3.1)); };
SvsdUh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["うー"] = SvsdUh;
SvsdChar.dict["うう"] = SvsdUh;

SvsdUh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(10.3948, 6.10142);
      this.paths = ["m 0 0 l 8.66025 5", "m 10.3948 6.00142 v 0.099999"];
      break;

    default:
      this.dp = p(10.3948, 6.10142);
      this.paths = ["m 0 0 l 8.66025 5"];
      break;
  }
};

SvsdEh = function() { SvsdChar.call(this, "SvsdEh", "えー", "S10P", "S", "P", "black", false, p(0.0, -6.0)); };
SvsdEh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["えー"] = SvsdEh;
SvsdChar.dict["えい"] = SvsdEh;
SvsdChar.dict["ええ"] = SvsdEh;

SvsdEh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(0, 12.1);
      this.paths = ["m 0 0 l 0 10", "m 0 12 v 0.1"];
      break;

    default:
      this.dp = p(0, 12.1);
      this.paths = ["m 0 0 l 0 10"];
      break;
  }
};

SvsdOh = function() { SvsdChar.call(this, "SvsdOh", "おー", "E10P", "E", "P", "black", false, p(0.0, 0.0)); };
SvsdOh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["おー"] = SvsdOh;
SvsdChar.dict["おう"] = SvsdOh;
SvsdChar.dict["おお"] = SvsdOh;

SvsdOh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(12.1, 0);
      this.paths = ["m 0 0 l 10 0", "m 12 0 h 0.1"];
      break;


    default:
      this.dp = p(12.1, 0);
      this.paths = ["m 0 0 l 10 0"];
      break;
  }
};

SvsdKai = function() { SvsdChar.call(this, "SvsdKai", "かい", "NEL10P", "NEL", "P", "black", false, p(0.0, 3.3)); };
SvsdKai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["かい"] = SvsdKai;

SvsdKai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(9.35643, -6.84863);
      this.paths = ["m 0 0 c 3.62505 1.61147 7.71149 -2.45594 8.66026 -5", "m 9.35643 -6.94863 v 0.1"];
      break;

    default:
      this.dp = p(9.35643, -6.84863);
      this.paths = ["m 0 0 c 3.62505 1.61147 7.71149 -2.45594 8.66026 -5"];
      break;
  }
};

SvsdKii = function() { SvsdChar.call(this, "SvsdKii", "きい", "SWL10P", "SWL", "P", "black", false, p(5.1, -5.3)); };
SvsdKii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きい"] = SvsdKii;
SvsdChar.dict["きー"] = SvsdKii;

SvsdKii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-4.52326, 10.6979);
      this.paths = ["m 0 0 c -1.62303 1.15063 -5.83226 4.37216 -5 8.66025", "m -4.52326 10.5979 v 0.1"];
      break;

    default:
      this.dp = p(-4.52326, 10.6979);
      this.paths = ["m 0 0 c -1.62303 1.15063 -5.83226 4.37216 -5 8.66025"];
      break;
  }
};

SvsdKuh = function() { SvsdChar.call(this, "SvsdKuh", "くー", "SEL10P", "SEL", "P", "black", false, p(0.0, -2.6)); };
SvsdKuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["くー"] = SvsdKuh;
SvsdChar.dict["くう"] = SvsdKuh;

SvsdKuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(10.5562, 4.47513);
      this.paths = ["m 0 0 c 0.364894 3.93136 4.76838 5.95772 8.66026 5", "m 10.5562 4.37513 v 0.1"];
      break;

    default:
      this.dp = p(10.5562, 4.47513);
      this.paths = ["m 0 0 c 0.364894 3.93136 4.76838 5.95772 8.66026 5"];
      break;
  }
};

SvsdKeh = function() { SvsdChar.call(this, "SvsdKeh", "けー", "SL10P", "SL", "P", "black", false, p(1.5, -5.9)); };
SvsdKeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["けー"] = SvsdKeh;
SvsdChar.dict["けい"] = SvsdKeh;
SvsdChar.dict["けえ"] = SvsdKeh;

SvsdKeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(1.1871, 11.7144);
      this.paths = ["m 0 0 c -1.84278 2.84986 -2.18359 6.96162 0 10", "m 1.1871 11.6144 v 0.1"];
      break;

    default:
      this.dp = p(1.1871, 11.7144);
      this.paths = ["m 0 0 c -1.84278 2.84986 -2.18359 6.96162 0 10"];
      break;
  }
};

SvsdKoh = function() { SvsdChar.call(this, "SvsdKoh", "こー", "EL10P", "EL", "P", "black", false, p(0.0, -0.5)); };
SvsdKoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["こー"] = SvsdKoh;
SvsdChar.dict["こう"] = SvsdKoh;
SvsdChar.dict["こお"] = SvsdKoh;

SvsdKoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(11.8155, -0.717973);
      this.paths = ["m 0 0 c 2.74956 3.12248 7.3269 1.33355 10 0", "m 11.8155 -0.817973 v 0.1"];
      break;

    default:
      this.dp = p(11.8155, -0.717973);
      this.paths = ["m 0 0 c 2.74956 3.12248 7.3269 1.33355 10 0"];
      break;
  }
};

SvsdSai = function() { SvsdChar.call(this, "SvsdSai", "さい", "NEL5P", "NEL", "P", "black", false, p(0.0, 2.0)); };
SvsdSai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["さい"] = SvsdSai;

SvsdSai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(5.4184, -4.08087);
      this.paths = ["m 0 0 c 1.59137 0.954753 3.42881 -1.15288 4.33013 -2.5", "m 5.4184 -4.18088 v 0.1"];
      break;

    default:
      this.dp = p(5.4184, -4.08087);
      this.paths = ["m 0 0 c 1.59137 0.954753 3.42881 -1.15288 4.33013 -2.5"];
      break;
  }
};

SvsdShii = function() { SvsdChar.call(this, "SvsdShii", "しい", "SWL5P", "SWL", "P", "black", false, p(2.6, -3.2)); };
SvsdShii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しい"] = SvsdShii;
SvsdChar.dict["しー"] = SvsdShii;

SvsdShii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-1.90191, 6.33045);
      this.paths = ["m 0 0 c -1.11689 0.391995 -3.19039 2.15145 -2.5 4.33013", "m -1.90191 6.23045 v 0.099999"];
      break;

    default:
      this.dp = p(-1.90191, 6.33045);
      this.paths = ["m 0 0 c -1.11689 0.391995 -3.19039 2.15145 -2.5 4.33013"];
      break;
  }
};

SvsdSuh = function() { SvsdChar.call(this, "SvsdSuh", "すー", "SEL5P", "SEL", "P", "black", false, p(0.0, -1.3)); };
SvsdSuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["すー"] = SvsdSuh;
SvsdChar.dict["すう"] = SvsdSuh;

SvsdSuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.15072, 2.19607);
      this.paths = ["m 0 0 c 0.40822 1.26111 1.10359 3.1903 4.20152 2.53215", "m 6.15072 2.09607 v 0.1"];
      break;

    default:
      this.dp = p(6.15072, 2.19607);
      this.paths = ["m 0 0 c 0.40822 1.26111 1.10359 3.1903 4.20152 2.53215"];
      break;
  }
};

SvsdSeh = function() { SvsdChar.call(this, "SvsdSeh", "せー", "SL5P", "SL", "P", "black", false, p(0.7, -3.3)); };
SvsdSeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["せー"] = SvsdSeh;
SvsdChar.dict["せい"] = SvsdSeh;
SvsdChar.dict["せえ"] = SvsdSeh;

SvsdSeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(1.36029, 6.56607);
      this.paths = ["m 0 0 c -0.526006 1.45593 -1.3705 3.54409 0 5", "m 1.36029 6.46607 v 0.1"];
      break;

    default:
      this.dp = p(1.36029, 6.56607);
      this.paths = ["m 0 0 c -0.526006 1.45593 -1.3705 3.54409 0 5"];
      break;
  }
};

SvsdSoh = function() { SvsdChar.call(this, "SvsdSoh", "そー", "EL5P", "EL", "P", "black", false, p(0.0, 0.1)); };
SvsdSoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["そー"] = SvsdSoh;
SvsdChar.dict["そう"] = SvsdSoh;

SvsdSoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.5239, -1.19137);
      this.paths = ["m 0 0 c 1.26737 1.679 3.71345 1.0347 5 0", "m 6.5239 -1.29137 v 0.1"];
      break;

    default:
      this.dp = p(6.5239, -1.19137);
      this.paths = ["m 0 0 c 1.26737 1.679 3.71345 1.0347 5 0"];
      break;
  }
};

SvsdTai = function() { SvsdChar.call(this, "SvsdTai", "たい", "NE5P", "NE", "P", "black", false, p(0.0, -0.0)); };
SvsdTai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["たい"] = SvsdTai;

SvsdTai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.05829, -3.39775);
      this.paths = ["m 0 0 l 4.33013 -2.5", "m 6.05829 -3.49775 v 0.1"];
      break;

    default:
      this.dp = p(6.05829, -3.39775);
      this.paths = ["m 0 0 l 4.33013 -2.5"];
      break;
  }
};

SvsdChii = function() { SvsdChar.call(this, "SvsdChii", "ちい", "SW5P", "SW", "P", "black", false, p(3.5, -3.1)); };
SvsdChii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちー"] = SvsdChii;
SvsdChar.dict["ちい"] = SvsdChii;

SvsdChii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-3.50247, 6.16645);
      this.paths = ["m 0 0 l -2.5 4.33012", "m -3.50247 6.06645 v 0.1"];
      break;

    default:
      this.dp = p(-3.50247, 6.16645);
      this.paths = ["m 0 0 l -2.5 4.33012"];
      break;
  }
};

SvsdTsuh = function() { SvsdChar.call(this, "SvsdTsuh", "つー", "S5P", "S", "P", "black", false, p(0.0, -1.8)); };
SvsdTsuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["つー"] = SvsdTsuh;
SvsdChar.dict["つう"] = SvsdTsuh;

SvsdTsuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.06001, 3.59875);
      this.paths = ["m 0 0 l 4.33013 2.5", "m 6.06001 3.49875 v 0.1"];
      break;

    default:
      this.dp = p(6.06001, 3.59875);
      this.paths = ["m 0 0 l 4.33013 2.5"];
      break;
  }
};

SvsdToh = function() { SvsdChar.call(this, "SvsdToh", "とー", "E5P", "E", "P", "black", false, p(0.0, -0.1)); };
SvsdToh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["とー"] = SvsdToh;
SvsdChar.dict["とう"] = SvsdToh;
SvsdChar.dict["とお"] = SvsdToh;

SvsdToh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(7, 0.1);
      this.paths = ["m 0 0 h 5", "m 7 0 v 0.1"];
      break;

    default:
      this.dp = p(7, 0.1);
      this.paths = ["m 0 0 h 5"];
      break;
  }
};

SvsdTeh = function() { SvsdChar.call(this, "SvsdTeh", "てー", "S5P", "S", "P", "black", false, p(0.0, -3.5)); };
SvsdTeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["てー"] = SvsdTeh;
SvsdChar.dict["てい"] = SvsdTeh;
SvsdChar.dict["てえ"] = SvsdTeh;

SvsdTeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(0, 7.1);
      this.paths = ["m 0 0 v 5", "m 0 7 v 0.1"];
      break;

    default:
      this.dp = p(0, 7.1);
      this.paths = ["m 0 0 v 5"];
      break;
  }
};

SvsdNai = function() { SvsdChar.call(this, "SvsdNai", "ない", "NER10P", "NER", "P", "black", false, p(0.0, 2.5)); };
SvsdNai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ない"] = SvsdNai;

SvsdNai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(10.628, -4.54252);
      this.paths = ["m 0 0 c 0.338036 -1.74353 4.2163 -5.71161 8.66025 -5", "m 10.628 -4.64252 v 0.1"];
      break;

    default:
      this.dp = p(10.628, -4.54252);
      this.paths = ["m 0 0 c 0.338036 -1.74353 4.2163 -5.71161 8.66025 -5"];
      break;
  }
};

SvsdNii = function() { SvsdChar.call(this, "SvsdNii", "にい", "SWR10P", "SWR", "P", "black", false, p(6.9, -4.7)); };
SvsdNii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にい"] = SvsdNii;
SvsdChar.dict["にー"] = SvsdNii;

SvsdNii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-6.89396, 9.40316);
      this.paths = ["m 0 0 c 0.722009 2.68537 -0.707116 7.21951 -5 8.66025", "m -6.89396 9.30316 v 0.1"];
      break;

    default:
      this.dp = p(-6.89396, 9.40316);
      this.paths = ["m 0 0 c 0.722009 2.68537 -0.707116 7.21951 -5 8.66025"];
      break;
  }
};

SvsdNuh = function() { SvsdChar.call(this, "SvsdNuh", "ぬー", "SER10P", "SER", "P", "black", false, p(0.0, -3.5)); };
SvsdNuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぬー"] = SvsdNuh;
SvsdChar.dict["ぬう"] = SvsdNuh;

SvsdNuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(9.15718, 7.03542);
      this.paths = ["m 0 0 c 2.5641 -0.0716 7.28949 -0.0932 8.66025 5", "m 9.15718 6.93542 v 0.1"];
      break;

    default:
      this.dp = p(9.15718, 7.03542);
      this.paths = ["m 0 0 c 2.5641 -0.0716 7.28949 -0.0932 8.66025 5"];
      break;
  }
};

SvsdNeh = function() { SvsdChar.call(this, "SvsdNeh", "ねー", "SR10P", "SR", "P", "black", false, p(1.5, -5.7)); };
SvsdNeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ねー"] = SvsdNeh;
SvsdChar.dict["ねい"] = SvsdNeh;
SvsdChar.dict["ねえ"] = SvsdNeh;

SvsdNeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-1.51903, 11.4057);
      this.paths = ["m 0 0 c 3.06633 2.75966 2.35567 7.77508 0 10", "m -1.51903 11.3057 v 0.1"];
      break;

    default:
      this.dp = p(-1.51903, 11.4057);
      this.paths = ["m 0 0 c 3.06633 2.75966 2.35567 7.77508 0 10"];
      break;
  }
};

SvsdNoh = function() { SvsdChar.call(this, "SvsdNoh", "のー", "ER10P", "ER", "P", "black", false, p(0.0, 0.1)); };
SvsdNoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["のー"] = SvsdNoh;
SvsdChar.dict["のう"] = SvsdNoh;

SvsdNoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(11.3451, 1.57978);
      this.paths = ["m 0 0 c 2.61216 -1.76308 7.32951 -2.88933 10 0", "m 11.3451 1.47978 v 0.1"];
      break;

    default:
      this.dp = p(11.3451, 1.57978);
      this.paths = ["m 0 0 c 2.61216 -1.76308 7.32951 -2.88933 10 0"];
      break;
  }
};

SvsdHai = function() { SvsdChar.call(this, "SvsdHai", "はい", "NEL20P", "NEL", "P", "black", false, p(0.0, 5.8)); };
SvsdHai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["はい"] = SvsdHai;

SvsdHai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(18.6091, -11.4351);
      this.paths = ["m 0 0 c 7.56775 0 13.3707 -5.36129 17.3205 -10", "m 18.6091 -11.5351 v 0.1"];
      break;

    default:
      this.dp = p(18.6091, -11.4351);
      this.paths = ["m 0 0 c 7.56775 0 13.3707 -5.36129 17.3205 -10"];
      break;
  }
};

SvsdHii = function() { SvsdChar.call(this, "SvsdHii", "ひい", "SWL20P", "SWL", "P", "black", false, p(10.2, -9.7)); };
SvsdHii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひい"] = SvsdHii;
SvsdChar.dict["ひー"] = SvsdHii;

SvsdHii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-9.40564, 19.3264);
      this.paths = ["m 0 0 c -4.58414 4.24962 -11.55 12.3153 -10 17.3205", "m -9.40564 19.2264 v 0.1"];
      break;

    default:
      this.dp = p(-9.40564, 19.3264);
      this.paths = ["m 0 0 c -4.58414 4.24962 -11.55 12.3153 -10 17.3205"];
      break;
  }
};

SvsdHuh = function() { SvsdChar.call(this, "SvsdHuh", "ふー", "SEL20P", "SEL", "P", "black", false, p(0.0, -5.1)); };
SvsdHuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ふー"] = SvsdHuh;
SvsdChar.dict["ふう"] = SvsdHuh;

SvsdHuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(19.2818, 9.71556);
      this.paths = ["m 0 0 c 0.556334 7.36507 11.3581 11.1114 17.3205 10", "m 19.2818 9.61556 v 0.1"];
      break;

    default:
      this.dp = p(19.2818, 9.71556);
      this.paths = ["m 0 0 c 0.556334 7.36507 11.3581 11.1114 17.3205 10"];
      break;
  }
};

SvsdHeh = function() { SvsdChar.call(this, "SvsdHeh", "へー", "UWL5P", "SWL", "SEL", "black", false, p(2.8, -2.6)); };
SvsdHeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["へー"] = SvsdHeh;
SvsdChar.dict["へい"] = SvsdHeh;
SvsdChar.dict["へえ"] = SvsdHeh;

SvsdHeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(1.90386, 4.50053);
      this.paths = ["m 0 0 c -1.54618 0.81314 -3.06762 1.9439 -2.80689 3.38677 c 0.19187 1.06179 1.19064 2.09764 2.80717 1.61177", "m 1.90386 4.40053 v 0.1"];
      break;

    default:
      this.dp = p(1.90386, 4.50053);
      this.paths = ["m 0 0 c -1.54618 0.81314 -3.06762 1.9439 -2.80689 3.38677 c 0.19187 1.06179 1.19064 2.09764 2.80717 1.61177", "m 1.90386 4.40053 v 0.1"];
      break;
  }
};

SvsdHoh = function() { SvsdChar.call(this, "SvsdHoh", "ほー", "EL20P", "EL", "P", "black", false, p(0.0, -0.9)); };
SvsdHoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ほー"] = SvsdHoh;
SvsdChar.dict["ほう"] = SvsdHoh;

SvsdHoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(21.8329, -0.698502);
      this.paths = ["m 0 0 c 5.15578 3.98468 13.0748 2.97834 20 0", "m 21.8329 -0.798502 v 0.1"];
      break;

    default:
      this.dp = p(21.8329, -0.698502);
      this.paths = ["m 0 0 c 5.15578 3.98468 13.0748 2.97834 20 0", "m 21.8329 -0.798502 v 0.1"];
      break;
  }
};

SvsdMai = function() { SvsdChar.call(this, "SvsdMai", "まい", "NER20P", "NER", "P", "black", false, p(0.0, 5.0)); };
SvsdMai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["まい"] = SvsdMai;

SvsdMai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(19.3224, -9.96921);
      this.paths = ["m 0 0 c 4.56521 -6.44915 10.8638 -9.78096 17.3205 -10", "m 19.3224 -10.0692 v 0.1"];
      break;

    default:
      this.dp = p(19.3224, -9.96921);
      this.paths = ["m 0 0 c 4.56521 -6.44915 10.8638 -9.78096 17.3205 -10"];
      break;
  }
};

SvsdMii = function() { SvsdChar.call(this, "SvsdMii", "みい", "SWR20P", "SWR", "P", "black", false, p(11.7, -9.2)); };
SvsdMii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みい"] = SvsdMii;
SvsdChar.dict["みー"] = SvsdMii;

SvsdMii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-11.7288, 18.428);
      this.paths = ["m 0 0 c 1.75914 4.78201 -3.60044 13.4217 -9.99999 17.3206", "m -11.7288 18.328 v 0.1"];
      break;

    default:
      this.dp = p(-11.7288, 18.428);
      this.paths = ["m 0 0 c 1.75914 4.78201 -3.60044 13.4217 -9.99999 17.3206"];
      break;
  }
};

SvsdMuh = function() { SvsdChar.call(this, "SvsdMuh", "むー", "SER20P", "SER", "P", "black", false, p(0.0, -6.0)); };
SvsdMuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["むー"] = SvsdMuh;
SvsdChar.dict["むう"] = SvsdMuh;

SvsdMuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(17.5037, 12.0905);
      this.paths = ["m 0 0 c 6.05327 -0.272634 16.7009 3.22004 17.3205 10", "m 17.5037 11.9905 v 0.1"];
      break;

    default:
      this.dp = p(17.5037, 12.0905);
      this.paths = ["m 0 0 c 6.05327 -0.272634 16.7009 3.22004 17.3205 10"];
      break;
  }
};

SvsdMeh = function() { SvsdChar.call(this, "SvsdMeh", "めー", "UER5P", "SER", "SWR", "black", false, p(1.7, -3.0)); };
SvsdMeh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["めー"] = SvsdMeh;
SvsdChar.dict["めい"] = SvsdMeh;
SvsdChar.dict["めえ"] = SvsdMeh;

SvsdMeh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-1.73901, 6.09635);
      this.paths = ["m 0 0 c 1.96459 0.169174 2.87771 0.486323 3.07622 1.62962 c 0.260213 1.49864 -1.92679 2.77673 -3.07622 3.37039", "m -1.73901 5.99635 v 0.1"];
      break;

    default:
      this.dp = p(-1.73901, 6.09635);
      this.paths = ["m 0 0 c 1.96459 0.169174 2.87771 0.486323 3.07622 1.62962 c 0.260213 1.49864 -1.92679 2.77673 -3.07622 3.37039"];
      break;
  }
};

SvsdMoh = function() { SvsdChar.call(this, "SvsdMoh", "もー", "ER20P", "ER", "P", "black", false, p(0.0, 0.5)); };
SvsdMoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["もー"] = SvsdMoh;
SvsdChar.dict["もう"] = SvsdMoh;

SvsdMoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(21.27, 1.64176);
      this.paths = ["m 0 0 c 6.69402 -2.71754 16.4988 -4.16702 20 0", "m 21.27 1.54176 v 0.1"];
      break;

    default:
      this.dp = p(21.27, 1.64176);
      this.paths = ["m 0 0 c 6.69402 -2.71754 16.4988 -4.16702 20 0", "m 21.27 1.54176 v 0.1"];
      break;
  }
};

SvsdYai = function() { SvsdChar.call(this, "SvsdYai", "やい", "NE20P", "NE", "P", "black", false, p(0.0, 5.5)); };
SvsdYai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["やい"] = SvsdYai;

SvsdYai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(19.0502, -10.8987);
      this.paths = ["m 0 0 l 17.3205 -10", "m 19.0502 -10.9987 v 0.1"];
      break;

    default:
      this.dp = p(19.0502, -10.8987);
      this.paths = ["m 0 0 l 17.3205 -10"];
      break;
  }
};

SvsdYuh = function() { SvsdChar.call(this, "SvsdYuh", "ゆー", "SW20P", "SW", "P", "black", false, p(0.0, -5.5)); };
SvsdYuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ゆー"] = SvsdYuh;
SvsdChar.dict["ゆう"] = SvsdYuh;

SvsdYuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(19.0494, 11.0982);
      this.paths = ["m 0 0 l 17.3205 10", "m 19.0494 10.9982 v 0.1"];
      break;

    default:
      this.dp = p(19.0494, 11.0982);
      this.paths = ["m 0 0 l 17.3205 10", "m 19.0494 10.9982 v 0.1"];
      break;
  }
};

SvsdYoh = function() { SvsdChar.call(this, "SvsdYoh", "よー", "E20P", "E", "P", "black", false, p(0.0, -0.1)); };
SvsdYoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["よー"] = SvsdYoh;
SvsdChar.dict["よう"] = SvsdYoh;

SvsdYoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(22.0016, 0.1);
      this.paths = ["m 0 0 h 20", "m 22.0016 0 v 0.1"];
      break;

    default:
      this.dp = p(22.0016, 0.1);
      this.paths = ["m 0 0 h 20"];
      break;
  }
};

SvsdRai = function() { SvsdChar.call(this, "SvsdRai", "らい", "NER5P", "NER", "P", "black", false, p(0.0, 1.3)); };
SvsdRai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["らい"] = SvsdRai;

SvsdRai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.30917, -2.14437);
      this.paths = ["m 0 0 c 0.541772 -0.951162 1.94507 -2.71942 4.33013 -2.5", "m 6.30917 -2.24437 v 0.1"];
      break;

    default:
      this.dp = p(6.30917, -2.14437);
      this.paths = ["m 0 0 c 0.541772 -0.951162 1.94507 -2.71942 4.33013 -2.5"];
      break;
  }
};

SvsdRii = function() { SvsdChar.call(this, "SvsdRii", "りい", "SWR5P", "SWR", "P", "black", false, p(4.4, -2.6)); };
SvsdRii.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りい"] = SvsdRii;
SvsdChar.dict["りー"] = SvsdRii;

SvsdRii.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-4.37926, 5.10856);
      this.paths = ["m 0 0 c 1.23682 1.79842 -0.379269 3.56029 -2.5 4.33013", "m -4.37926 5.00856 v 0.1"];
      break;

    default:
      this.dp = p(-4.37926, 5.10856);
      this.paths = ["m 0 0 c 1.23682 1.79842 -0.379269 3.56029 -2.5 4.33013"];
      break;
  }
};

SvsdRuh = function() { SvsdChar.call(this, "SvsdRuh", "るー", "SER5P", "SER", "P", "black", false, p(0.0, -2.3)); };
SvsdRuh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["るー"] = SvsdRuh;
SvsdChar.dict["るう"] = SvsdRuh;

SvsdRuh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(4.0541, 4.58411);
      this.paths = ["m 0 0 c 1.48073 0.077667 4.60895 0.194056 4.33013 2.5", "m 4.0541 4.48411 v 0.1"];
      break;

    default:
      this.dp = p(4.0541, 4.58411);
      this.paths = ["m 0 0 c 1.48073 0.077667 4.60895 0.194056 4.33013 2.5"];
      break;
  }
};

SvsdReh = function() { SvsdChar.call(this, "SvsdReh", "れー", "SR5P", "SR", "P", "black", false, p(1.3, -3.3)); };
SvsdReh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["れー"] = SvsdReh;
SvsdChar.dict["れい"] = SvsdReh;
SvsdChar.dict["れえ"] = SvsdReh;

SvsdReh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(-1.27182, 6.63792);
      this.paths = ["m 0 0 c 1.1321 2.05387 1.03538 3.75447 0 5", "m -1.27182 6.53792 v 0.1"];
      break;

    default:
      this.dp = p(-1.27182, 6.63792);
      this.paths = ["m 0 0 c 1.1321 2.05387 1.03538 3.75447 0 5"];
      break;
  }
};

SvsdRoh = function() { SvsdChar.call(this, "SvsdRoh", "ろー", "ER5P", "ER", "P", "black", false, p(0.0, -0.3)); };
SvsdRoh.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ろー"] = SvsdRoh;
SvsdChar.dict["ろう"] = SvsdRoh;

SvsdRoh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(6.51253, 1.40927);
      this.paths = ["m 0 0 c 1.72594 -0.816378 3.59517 -1.20627 5 0", "m 6.51253 1.30927 v 0.1"];
      break;

    default:
      this.dp = p(6.51253, 1.40927);
      this.paths = ["m 0 0 c 1.72594 -0.816378 3.59517 -1.20627 5 0"];
      break;
  }
};

SvsdWai = function() { SvsdChar.call(this, "SvsdWai", "わい", "USL5P", "SEL", "NEL", "black", false, p(0.0, -0.6)); };
SvsdWai.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["わい"] = SvsdWai;

SvsdWai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "":
      this.dp = p(5.95346, -1.65387);
      this.paths = ["m 0 0 c 0.019224 1.2306 0.514416 2.96936 1.65244 2.87958 c 1.10088 -0.086848 2.53023 -1.40929 3.34756 -2.87958", "m 5.95346 -1.75387 v 0.1"];
      break;

    default:
      this.dp = p(5.95346, -1.65387);
      this.paths = ["m 0 0 c 0.019224 1.2306 0.514416 2.96936 1.65244 2.87958 c 1.10088 -0.086848 2.53023 -1.40929 3.34756 -2.87958"];
      break;
  }
};

NakaneAu = function() { NakaneChar.call(this, "NakaneAu", "あう", "USWL2NEL7", "USWL", "NEL", "black", false, p(0.3, -0.5)); };
NakaneAu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["あう"] = NakaneAu;
NakaneChar.dict["あー"] = NakaneAu;

NakaneAu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.58957, -1.10485);
      this.paths = ["m 0 0 c -0.741809 1.68441 0.65145 1.9963 1.48508 1.83762 c 0.712182 -0.13556 4.0281 -1.07811 5.10449 -2.94247"];
      break;
  }
};

NakaneIu = function() { NakaneChar.call(this, "NakaneIu", "いう", "UWR2NER7", "NWR", "NER", "black", false, p(1.8, 2.1)); };
NakaneIu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["いう"] = NakaneIu;

NakaneIu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SW":
      this.dp = p(6.4268, -4.62556);
      this.paths = ["m 0 0 c 0.639178 -1.10709 1.63905 -2.38784 2.79881 -3.20383 c 1.06229 -0.747407 2.48903 -1.42173 3.62799 -1.42173"];
      return;

    case "SER":
      this.dp = p(5.78165, -5.56505);
      this.paths = ["m 0 0 c -0.286898 -1.07072 -0.465803 -1.84091 -0.021869 -2.57592 c 1.12501 -1.86264 4.30528 -2.7364 5.80352 -2.98913"];
      return;

    case "SE":
      this.dp = p(3.90218, -5.52637);
      this.paths = ["m 0 0 c -0.685619 -0.395842 -0.883659 -0.536943 -1.40939 -0.932813 c -0.446871 -0.33648 -0.709182 -1.08894 -0.49195 -1.60443 c 0.845037 -2.00524 4.30528 -2.7364 5.80352 -2.98913"];
      return;

    case "E":
      this.dp = p(3.43082, -4.51958);
      this.paths = ["m 0 0 c -0.851411 0.091063 -2.16542 -0.212538 -1.7445 -1.52689 c 0.627625 -1.96045 5.17532 -2.99269 5.17532 -2.99269"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3.33759, -4.62816);
  this.paths = ["m 0 0 c -0.68562 0.39584 -1.44825 0.36127 -1.97398 -0.0346 c -0.446871 -0.33648 -0.709182 -1.08894 -0.49195 -1.60443 c 0.845037 -2.00524 4.30528 -2.7364 5.80352 -2.98913"];
};

NakaneUu = function() { NakaneChar.call(this, "NakaneUu", "うう", "USWL2NEL17", "SWL", "NEL", "black", false, p(0.7, 1.2)); };
NakaneUu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["うう"] = NakaneUu;
NakaneChar.dict["うー"] = NakaneUu;

NakaneUu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.1062, -5.72733);
      this.paths = ["m 0 0 c -1.1319 0.962885 -1.2127 3.3291 1.69699 3.28791 c 4.95642 -0.0702 11.4258 -5.90117 12.4092 -9.01524"];
      break;
  }
};

NakaneUu.prototype.setPathsExtra = function() {
    this.pathsExtra = ["m 7,-1.3 v0.1"];
};

NakaneEu = function() { NakaneChar.call(this, "NakaneEu", "えう", "USWR2NER17", "NWR", "NER", "black", false, p(3.3, 5.9)); };
NakaneEu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["えう"] = NakaneEu;

NakaneEu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(9.56751, -11.8769);
      this.paths = ["m 0 0 c -1.75549 0.24455 -3.2927 -0.78207 -3.29914 -1.9135 c -0.0309 -5.42434 12.8666 -9.96341 12.8666 -9.96341"];
      break;
  }
};

NakaneOu = function() { NakaneChar.call(this, "NakaneOu", "おう", "USWL2NEL17", "SWL", "NEL", "black", false, p(0.8, 0.8)); };
NakaneOu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["おう"] = NakaneOu;
NakaneChar.dict["おお"] = NakaneOu;
NakaneChar.dict["おー"] = NakaneOu;

NakaneOu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.397, -4.95792);
      this.paths = ["m 0 0 c -0.65208 0.86619 -1.34452 2.85524 -0.0954 3.24172 c 3.88002 1.20044 12.7082 -5.27813 14.4924 -8.19964"];
      break;
  }
};

NakaneKiu = function() { NakaneChar.call(this, "NakaneKiu", "きう", "UNER2SW7", "NER", "SW", "black", false, p(1.3, -2.9)); };
NakaneKiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["きう"] = NakaneKiu;
NakaneChar.dict["きゅう"] = NakaneKiu;
NakaneChar.dict["きゅー"] = NakaneKiu;

NakaneKiu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.26971, 6.17468);
      this.paths = ["m 0 0 c 0.443003 -0.26107 1.3397 -0.40766 1.7387 -0.11202 c 0.340628 0.25235 0.246253 0.866 -0.146897 1.48956 c -1.03845 1.64703 -2.86151 4.79714 -2.86151 4.79714"];
      break;
  }
};

NakaneKiu.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "SW":
      this.pathsExtra = ["m -0.6486585771480455 6.595151606978889 -1.2421008457039093 -0.8409432139577758"];
      break;

    default:
      break;
  }
};

NakaneKau = function() { NakaneChar.call(this, "NakaneKau", "かう", "UWL2E7", "WL", "E", "black", false, p(0.9, -0.9)); };
NakaneKau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["かう"] = NakaneKau;
NakaneChar.dict["かー"] = NakaneKau;
NakaneChar.dict["きゃー"] = NakaneKau;

NakaneKau.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.10436, 1.83625);
      this.paths = ["m 0 0 c -0.491414 0.26561 -0.975884 0.94494 -0.896512 1.31048 c 0.07937 0.36554 0.546729 0.47617 1.11984 0.47617 l 5.88103 0.0496"];
      break;
  }
};

NakaneKuu = function() { NakaneChar.call(this, "NakaneKuu", "くう", "UNR2S7", "NER", "S", "black", true, p(0.0, -2.1)); };
NakaneKuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["くう"] = NakaneKuu;
NakaneChar.dict["くー"] = NakaneKuu;

NakaneKuu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.5029, 5.69501);
      this.paths = ["m 0 0 c 0.398976 -0.7837 1.24545 -1.4609 1.68851 -1.40965 c 0.745407 0.0862 0.814387 1.0267 0.814387 1.51847 v 5.58619"];
      break;
  }
};

NakaneKeu = function() { NakaneChar.call(this, "NakaneKeu", "けう", "UNER2SW17", "NER", "SW", "black", false, p(5.9, -7.1)); };
NakaneKeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["けう"] = NakaneKeu;
NakaneChar.dict["きょう"] = NakaneKeu;
NakaneChar.dict["きょー"] = NakaneKeu;

NakaneKeu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-5.88606, 14.6219);
      this.paths = ["m 0 0 c 0 0 1.54306 -0.79654 2.03197 -0.31609 c 0.55438 0.54479 -0.22577 1.71589 -0.22577 1.71589 l -7.69226 13.2221"];
      break;
  }
};

NakaneKou = function() { NakaneChar.call(this, "NakaneKou", "こう", "UWL2E17", "WL", "E", "black", false, p(0.9, -1.6)); };
NakaneKou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["こう"] = NakaneKou;
NakaneChar.dict["こー"] = NakaneKou;
NakaneChar.dict["こお"] = NakaneKou;

NakaneKou.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.8308, 3.15909);
      this.paths = ["m 0 0 c -0.25598 0.45506 -1.11754 1.63969 -0.88666 2.48992 c 0.19879 0.73211 1.80087 0.69432 1.81346 0.66917 h 14.904"];
      break;
  }
};

ShugiinNo = function() { ShugiinChar.call(this, "ShugiinNo", "の", "NEL3", "NEL", "NEL", "black", false, p(0.0, 1.1)); };
ShugiinNo.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["の"] = ShugiinNo;

ShugiinNo.prototype.setPaths = function() {
  switch (this.getNextName()) {
    case "ShugiinWa":
    case "ShugiinWo":
    case "ShugiinO":
      this.dp = p(2.14115, -2.1029);
      this.paths = ["m 0 0 c 1.18078 -0.215658 1.75387 -1.32912 2.14115 -2.1029"];
      return;
  }


  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.14115, -2.1029);
      this.paths = ["m 0 0 c 1.26691 -0.0434 2.14115 -1.01348 2.14115 -2.1029"];
      break;
  }
};

ShugiinNomo = function() { ShugiinChar.call(this, "ShugiinNomo", "のも", "NEL3UNEL3", "NEL", "SWL", "black", false, p(0.0, 1.5)); };
ShugiinNomo.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["のも"] = ShugiinNomo;

ShugiinNomo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.11263, -2.12648);
      this.paths = ["m 0 0 c 0.90158 0.26154 2.92745 -0.47857 3.6335 -1.59748 c 0.38247 -0.60612 0.60701 -1.90303 -0.0661 -2.1491 c -0.68168 -0.24919 -1.45477 1.6201 -1.45477 1.6201"];
      break;
  }
};

GreggChar = function(name, kana, model, headType, tailType, color) { Char.apply(this, arguments); };
GreggChar.prototype = Object.create(Char.prototype);
GreggChar.dict = {};


GreggK = function() { GreggChar.call(this, "GreggK", "k", "ER7", "ER", "ER", "black", false, p(0.0, 0.7)); };
GreggK.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["k"] = GreggK;

GreggK.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "C":
      this.dp = p(7, 0);
      this.paths = ["m 0 0 c 2.17775 -1.24421 7.47367 -1.654 7 0"];
      return;

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0 c 2.17775 -1.24421 7.47367 -1.654 7 0"];
      break;
  }
};

GreggG = function() { GreggChar.call(this, "GreggG", "g", "ER16", "ER", "ER", "black", false, p(0.0, 1.3)); };
GreggG.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["g"] = GreggG;

GreggG.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
  }

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "C":
      this.dp = p(14.8883, -0.300773);
      this.paths = ["m 0 0 c 3.86615 -2.10782 16.7769 -4.49967 14.8883 -0.300773"];
      return;
  }

  this.dp = p(14.8883, -0.300773);
  this.paths = ["m 0 0 c 3.86615 -2.10782 16.7769 -4.49967 14.8883 -0.300773"];
};

GreggR = function() { GreggChar.call(this, "GreggR", "r", "EL7", "EL", "EL", "black", false, p(0.0, -0.6)); };
GreggR.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["r"] = GreggR;

GreggR.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7, 0);
      this.paths = ["m 0 0 c 0.069725 2.37067 4.63395 0.817184 7 0"];
      break;
  }
};

GreggL = function() { GreggChar.call(this, "GreggL", "l", "EL16", "EL", "EL", "black", false, p(0.0, -1.2)); };
GreggL.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["l"] = GreggL;

GreggL.prototype.setPaths = function() {
  switch (this.getPrevName()) {
    case "GreggA":
      this.dp = p(14.8941, -1.22614);
      this.paths = ["m 0 0 c 2.98464 1.3724 11.7938 1.12002 14.8941 -1.22614"];
      break;

    case "GreggE":
      this.dp = p(15.8289, -0.064);
      this.paths = ["m 0 0 c -0.23715 0.63258 0.24374 1.14753 1.4066 1.45911 c 4.3439 1.16394 10.4091 0.99869 14.4223 -1.52311"];
      break;

    default:
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c -0.038258 4.56535 10.6791 1.65963 16 0"];
      break;
  }
};

GreggN = function() { GreggChar.call(this, "GreggN", "n", "E4", "E", "E", "black", false, p(0.0, 0.0)); };
GreggN.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["n"] = GreggN;

GreggN.prototype.setPaths = function() {
  switch (this.getPrevName()) {
    case "GreggA":
      this.dp = p(7.86436, -0.073);
      this.paths = ["m 0 0 c 1.42119 -0.38081 7.86436 -0.073 7.86436 -0.073"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4, 0);
      this.paths = ["m 0 0 l 4 0"];
      break;
  }
};

GreggM = function() { GreggChar.call(this, "GreggM", "m", "E10", "E", "E", "black", false, p(0.0, 0.0)); };
GreggM.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["m"] = GreggM;

GreggM.prototype.setPaths = function() {

  switch (this.getPrevName()) {
    case "GreggA":
      this.dp = p(12.8624, -0.073);
      this.paths = ["m 0 0 c 1.42119 -0.38081 12.8624 -0.073 12.8624 -0.073"];
      return;
  }

  switch (this.getNextHeadType()) {

    default:
      this.dp = p(10, 0);
      this.paths = ["m 0 0 l 10 0"];
      break;
  }
};

GreggT = function() { GreggChar.call(this, "GreggT", "t", "NE4", "NE", "NE", "black", false, p(0.0, 1.0)); };
GreggT.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["t"] = GreggT;

GreggT.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.4641, -2);
      this.paths = ["m 0 0 l 3.4641 -2"];
      break;
  }
};

GreggD = function() { GreggChar.call(this, "GreggD", "d", "NE10", "NE", "NE", "black", false, p(0.0, 2.5)); };
GreggD.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["d"] = GreggD;

GreggD.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, -5);
      this.paths = ["m 0 0 l 8.66025 -5"];
      break;
  }
};

GreggTh = function() { GreggChar.call(this, "GreggTh", "th", "NER4", "NER", "NER", "black", false, p(0.0, 1.1)); };
GreggTh.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["th"] = GreggTh;

GreggTh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.2766, -2.29431);
      this.paths = ["m 0 0 c -0.084533 -1.22722 2.78425 -2.19996 3.2766 -2.29431"];
      break;
  }
};

GreggThL = function() { GreggChar.call(this, "GreggThL", "Th", "NEL4", "NEL", "NEL", "black", false, p(0.0, 1.1)); };
GreggThL.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["Th"] = GreggThL;

GreggThL.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.27661, -2.29431);
      this.paths = ["m 0 0 c 1.32922 0.043491 2.69759 -1.20187 3.27661 -2.29431"];
      break;
  }
};

GreggP = function() { GreggChar.call(this, "GreggP", "p", "SWL7", "SWL", "SWL", "black", false, p(4.7, -2.9)); };
GreggP.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["p"] = GreggP;

GreggP.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.01503, 5.73407);
      this.paths = ["m 0 0 c -2.00147 1.15832 -6.41868 4.61076 -4.01503 5.73407"];
      break;
  }
};

GreggB = function() { GreggChar.call(this, "GreggB", "b", "SWL14", "SWL", "SWL", "black", false, p(11.2, -6.1)); };
GreggB.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["b"] = GreggB;

GreggB.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-9.8995, 9.8995);
      this.paths = ["m 0 0 c -4.22191 0.909691 -13.2433 7.74135 -9.8995 9.8995"];
      break;
  }
};

GreggF = function() { GreggChar.call(this, "GreggF", "f", "SWR7", "SWR", "SWR", "black", false, p(4.0, -2.9)); };
GreggF.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["f"] = GreggF;

GreggF.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.01504, 5.73406);
      this.paths = ["m 0 0 c 2.55794 0.627846 -1.67707 4.31762 -4.01504 5.73406"];
      break;
  }
};

GreggV = function() { GreggChar.call(this, "GreggV", "v", "SWR14", "SWR", "SWR", "black", false, p(8.0, -5.7)); };
GreggV.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["v"] = GreggV;

GreggV.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-8.03007, 11.4681);
      this.paths = ["m 0 0 c 4.35631 1.1221 -3.77167 8.9541 -8.03007 11.4681"];
      break;
  }
};

GreggCh = function() { GreggChar.call(this, "GreggCh", "ch", "SW7", "SW", "SW", "black", false, p(4.0, -2.9)); };
GreggCh.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["ch"] = GreggCh;
GreggChar.dict["c"] = GreggCh;

GreggCh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-4.01504, 5.73406);
      this.paths = ["m 0 0 l -4.01504 5.73406"];
      break;
  }
};

GreggJ = function() { GreggChar.call(this, "GreggJ", "j", "SW14", "SW", "SW", "black", false, p(7.0, -6.1)); };
GreggJ.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["j"] = GreggJ;

GreggJ.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-7, 12.1243);
      this.paths = ["m 0 0 l -7 12.1243"];
      break;
  }
};

GreggS = function() { GreggChar.call(this, "GreggS", "s", "SWL3", "SWL", "SWL", "black", false, p(1.8, -1.3)); };
GreggS.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["s"] = GreggS;

GreggS.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-1.5, 2.59808);
      this.paths = ["m 0 0 c -0.771314 0.491248 -2.48487 1.68084 -1.5 2.59808"];
      break;
  }
};

GreggSR = function() { GreggChar.call(this, "GreggSR", "S", "SWR3", "SWR", "SWR", "black", false, p(2.1, -1.1)); };
GreggSR.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["S"] = GreggSR;

GreggSR.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2.12133, 2.12133);
      this.paths = ["m 0 0 c 0.880428 0.925001 -0.975988 1.91308 -2.12133 2.12133"];
      break;
  }
};

GreggSh = function() { GreggChar.call(this, "GreggSh", "sh", "SW4", "SW", "SW", "black", false, p(2.0, -1.7)); };
GreggSh.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["sh"] = GreggSh;

GreggSh.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-2, 3.4641);
      this.paths = ["m 0 0 l -2 3.4641"];
      break;
  }
};

GreggH = function() { GreggChar.call(this, "GreggH", "h", "P", "P", "P", "black", true, p(0.0, -0.0)); };
GreggH.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["h"] = GreggH;

GreggH.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 0.1);
      this.paths = ["m 0 0 v 0.1"];
      break;
  }
};

GreggNg = function() { GreggChar.call(this, "GreggNg", "ng", "SE5", "SE", "SE", "black", false, p(0.0, -1.2)); };
GreggNg.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["ng"] = GreggNg;

GreggNg.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.33013, 2.5);
      this.paths = ["m 0 0 l 4.33013 2.5"];
      break;
  }
};

GreggNk = function() { GreggChar.call(this, "GreggNk", "nk", "SE10", "SE", "SE", "black", false, p(0.0, -2.5)); };
GreggNk.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["nk"] = GreggNk;

GreggNk.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.66025, 5);
      this.paths = ["m 0 0 l 8.66025 5"];
      break;
  }
};

GreggA = function() { GreggChar.call(this, "GreggA", "a", "C4", "C", "C", "black", false, p(3.1, -1.8)); };
GreggA.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["a"] = GreggA;

GreggA.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "GreggG_GreggT":
      this.dp = p(-0.866314, -1.97876);
      this.paths = ["m 0 0 c -0.593377 1.31925 -2.55261 1.25789 -3.01323 0.357408 c -0.481641 -0.94158 0.946265 -1.64297 2.14692 -2.33617"];
      return;
  }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "GreggK_E":
      this.dp = p(-2.86436, 0.17299);
      this.paths = ["m 0 0 c -0.642393 2.24316 -3.19525 2.60409 -4.26711 2.03439 c -1.07186 -0.5697 -0.01844 -1.48059 1.40275 -1.8614"];
      return;

    case "GreggG_E":
      this.dp = p(-2.86436, 0.17299);
      this.paths = ["m 0 0 c -0.784766 1.74476 -3.19525 2.60409 -4.26711 2.03439 c -1.07186 -0.5697 -0.01844 -1.48059 1.40275 -1.8614"];
      return;
  }

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  switch (tail_ + "_" + _name) {
  }

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "E_NE":
      this.dp = p(-1e-05, -6e-06);
      this.paths = ["m 0 0 c 0.61007 0.05428 0.990047 0.249509 1.06529 0.660487 c 0.142788 0.779965 -0.722083 1.56608 -1.44653 1.88842 c -0.594341 0.264449 -1.71627 0.45319 -1.94534 -0.155665 c -0.391765 -1.04133 1.12593 -1.70005 2.32658 -2.39325"];
      return;
  }

  //switch (tail_) {}

  switch (_name) {
    case "GreggL":
      this.dp = p(-1.41515, -0.44769 + 3.6);
      this.paths = ["m 0 3.6 c 0.88291 -0.67806 1.62989 -1.36444 1.61416 -2.57541 c -0.0116 -0.89357 -1.19773 -1.41391 -2.50938 -0.9436 c -1.33502 0.47869 -2.33738 2.23562 -0.51993 3.07132"];
      return;

    case "GreggM":
    case "GreggN":
      this.dp = p(-2.86436, 0.17299);
      this.paths = ["m 0 0 c 0.665331 1.77947 -3.19525 2.60409 -4.26711 2.03439 c -1.07186 -0.5697 -0.01844 -1.48059 1.40275 -1.8614"];
      return;
  }

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0);
  this.paths = ["m 0 0 c -1.2047 -0.10718 -2.8967 0.74715 -3.06293 1.94513 c -0.0975 0.70262 0.711768 1.51973 1.41794 1.58685 c 1.25154 0.11895 2.94049 -1.03272 2.99782 -2.28859 c 0.02793 -0.61184 -0.74276 -1.18911 -1.35283 -1.24339"];
};

GreggE = function() { GreggChar.call(this, "GreggE", "e", "C1", "C", "C", "black", false, p(1.0, -0.6)); };
GreggE.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["e"] = GreggE;

GreggE.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "GreggK_GreggT":
      this.dp = p(-0.238854, -0.68917);
      this.paths = ["m 0 0 c -0.119513 0.446028 -0.435092 0.641221 -0.775489 0.670005 c -0.266594 0.02254 -0.671697 -0.148182 -0.686841 -0.415299 c -0.02916 -0.514257 0.905842 -0.76049 1.22348 -0.943876"];
      return;

    case "GreggG_GreggT":
      this.dp = p(0.145538, -1.07201);
      this.paths = ["m 0 0 c -0.219853 0.488797 -0.435092 0.641221 -0.775489 0.670005 c -0.266594 0.02254 -0.667321 -0.148467 -0.686841 -0.415299 c -0.0507 -0.693003 1.29023 -1.14333 1.60787 -1.32672"];
      return;
  }

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "E_NE":
      this.dp = p(-0.672988, 0);
      this.paths = ["m 0 0 c 0.20509 0.01825 0.4638 0.21232 0.4548 0.41801 c -0.01927 0.42221 -0.419636 0.634283 -0.757109 0.703411 c -0.338844 0.069409 -0.881053 -0.018089 -0.976651 -0.350495 c -0.090341 -0.314126 0.217432 -0.546602 0.605972 -0.770926"];
      return;
  }

  //switch (tail_) {}

  switch (_name) {
    case "GreggK":
      this.dp = p(-1.03437, 0.45655);
      this.paths = ["m 0 0 c 0.21019 0.36406 -0.0477 0.95534 -0.743096 1.28304 c -0.414734 0.19545 -1.16244 0.4689 -1.24418 0.0568 c -0.06026 -0.30378 0.568195 -0.6635 0.952903 -0.88329"];
      return;

    case "GreggL":
      this.dp = p(-0.3934, -0.9523);
      this.paths = ["m 0 0 c 0.63894 -0.0982 1.05516 -0.6312 0.83595 -1.05873 c -0.22995 -0.44849 -1.08496 -0.27871 -1.22935 0.10643"];
      return;
  }

  //switch (_model) {}

  switch (_head) {
    case "C":
      this.dp = p(-2.86436, 0.17299);
      this.paths = ["m 0 0 c -0.784766 1.74476 -3.19525 2.60409 -4.26711 2.03439 c -1.07186 -0.5697 -0.01844 -1.48059 1.40275 -1.8614"];
      return;
  }

  this.dp = p(0, 0);
  this.paths = ["m 0 0 c -0.405 -0.036 -0.97382 0.25118 -1.02971 0.65392 c -0.0328 0.23621 0.23929 0.51091 0.47668 0.53348 c 0.42076 0.0399 0.98856 -0.34718 1.00783 -0.76939 c 0.009 -0.20569 -0.24971 -0.39976 -0.4548 -0.41801"];
};

GreggO = function() { GreggChar.call(this, "GreggO", "o", "USW2.5", "SWL", "NEL", "black", false, p(0.8, -0.8)); };
GreggO.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["o"] = GreggO;

GreggO.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.55203, 0.37548);
      this.paths = ["m 0 0 c 0 0 -1.2339 1.20111 -0.62581 1.60208 c 0.69557 0.45865 2.17784 -1.2266 2.17784 -1.2266"];
      break;
  }
};

GreggU = function() { GreggChar.call(this, "GreggU", "u", "UNER2.5", "NER", "SWR", "black", false, p(0.0, 0.5)); };
GreggU.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["u"] = GreggU;

GreggU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.57581, 0.15373);
      this.paths = ["m 0 0 c 0 0 1.50684 -1.63569 2.128 -1.10768 c 0.40108 0.34093 -0.18201 0.96527 -0.55219 1.26141"];
      break;
  }
};

WasedaMi = function() { WasedaChar.call(this, "WasedaMi", "み", "ER8CR1", "ER", "ERCR", "black", false, p(0.0, 0.5)); };
WasedaMi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["み"] = WasedaMi;

WasedaMi.prototype.setPaths = function() {
  switch (this.getNextHeadModel()) {
    case "EL4":
      this.dp = p(7.9507, -0.556);
      this.paths = ["m 0 0 c 1.8595 -0.8279 7.9507 -2.1087 7.9507 -0.556 c 0 0.5944 -0.527104 0.73886 -0.8551 0.6141 c -0.314472 -0.119615 -0.471997 -0.760408 -0.2213 -0.9848 c 0.282758 -0.253089 0.6882 0.1643 1.0764 0.3707"];
      return;

    case "ER4":
      this.dp = p(7.5061, -1.1085);
      this.paths = ["m 0 0 c 1.8594 -0.8279 7.9507 -2.1087 7.9507 -0.556 c 0 0.5944 -0.848982 1.15961 -1.2111 0.8303 c -0.389897 -0.35457 0.0627 -0.9765 0.7665 -1.3828"];
      return;

    case "EL8":
      this.dp = p(7.951, -0.556);
      this.paths = ["m 0 0 c 1.8594 -0.8279 7.951 -2.1087 7.951 -0.556 c 0 0.5944 -0.5354 0.853533 -0.902 0.7301 c -0.29543 -0.09947 -0.434 -0.67874 -0.223 -0.9082 c 0.25699 -0.279473 0.723 0.0477 1.125 0.1781"];
      return;

    case "ER8":
      this.dp = p(7.52195, -1.09855);
      this.paths = ["m 0 0 c 1.85946 -0.8279 7.95073 -2.1087 7.95073 -0.556 c 0 0.5944 -1.0368 1.11998 -1.37394 0.7266 c -0.343253 -0.400509 0.149453 -0.931348 0.945163 -1.26915"];
      return;

    case "SE4":
      this.dp = p(7.79142, 0.039182);
      this.paths = ["m 0 0 c 1.859 -0.8279 7.959 -1.9702 7.959 -0.4171 c 0 0.594 -0.74061 0.996527 -1.18481 0.815898 c -0.30734 -0.124975 -0.45781 -0.776301 -0.19317 -0.976405 c 0.36119 -0.273115 0.8874 0.293789 1.2104 0.616789"];
      return;

    case "NEL8":
      this.dp = p(7.62178, -1.0318);
      this.paths = ["m 0 0 c 1.84486 -0.8603 7.95073 -2.1091 7.95073 -0.556 c 0 0.297 -0.308224 0.446881 -0.549913 0.515734 c -0.249802 0.07116 -0.698849 0.09796 -0.763957 -0.153488 c -0.108053 -0.417308 0.5633 -0.604246 0.98492 -0.838046"];
      return;

    case "NEL16":
      this.dp = p(7.6218, -1.03199);
      this.paths = ["m 0 0 c 1.8449 -0.86 7.9507 -2.109 7.9507 -0.556 c 0 0.297 -0.282684 0.46437 -0.51944 0.55391 c -0.254136 0.0961 -0.722666 0.17997 -0.811482 -0.0768 c -0.150684 -0.43565 0.606522 -0.6861 1.00202 -0.9531"];
      return;

    case "NER8":
      this.dp = p(7.19077, -1.18363);
      this.paths = ["m 0 0 c 1.8517 -0.8635 7.55504 -2.14056 7.9805 -0.558 c 0.15484 0.575949 -0.470199 1.05277 -0.848554 0.89313 c -0.466786 -0.196948 -0.315691 -0.4898 0.058824 -1.51876"];
      return;

    case "NER16":
      this.dp = p(7.187, -1.2054);
      this.paths = ["m 0 0 c 1.845 -0.8603 7.5503 -2.05142 7.951 -0.556 c 0.15374 0.57376 -0.13998 0.857585 -0.44597 0.813296 c -0.49381 -0.07147 -0.57603 -0.752896 -0.31803 -1.4627"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(7.98223, -0.188525);
      this.paths = ["m 0 0 c 1.8517 -0.8635 7.57198 -2.08264 7.9805 -0.558 c 0.15436 0.576078 -0.260356 1.05586 -0.674567 1.04419 c -0.376405 -0.010612 -0.786063 -0.681846 -0.558565 -0.981909 c 0.256262 -0.338003 0.857508 0.052671 1.23486 0.307198"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "NER":
      this.dp = p(6.82513, -1.27077);
      this.paths = ["m 0 0 c 1.8517 -0.8635 7.58904 -2.01896 7.9805 -0.558 c 0.15436 0.576078 -0.276564 0.825088 -0.599829 0.77609 c -0.523728 -0.079383 -0.555546 -0.620026 -0.555544 -1.48886"];
      return;

    case "E":
      this.dp = p(7.9507, -0.556);
      this.paths = ["m 0 0 c 1.8595 -0.828 7.9507 -2.109 7.9507 -0.556 c 0 0.594 -0.283817 0.78486 -0.632 0.87 c -0.305115 0.0746 -0.869394 -0.10777 -0.843151 -0.42078 c 0.04294 -0.51221 0.792151 -0.44922 1.47515 -0.44922"];
      return;

    case "SEL":
      this.dp = p(6.85073, -1.12289);
      this.paths = ["m 0 0 c 1.8595 -0.8279 7.53804 -1.98891 7.9592 -0.4171 c 0.138435 0.516647 -0.160348 0.850944 -0.4789 0.8295 c -0.551872 -0.03715 -0.629574 -0.919291 -0.629574 -1.53529"];
      return;

    case "SW":
    case "SWL":
      this.dp = p(7.146, -1.214);
      this.paths = ["m 0 0 c 1.859 -0.828 7.951 -2.109 7.951 -0.556 c 0 0.594 -0.31177 0.93732 -0.65242 0.83953 c -0.48228 -0.13845 -0.34758 -0.95953 -0.15258 -1.49753"];
      return;

    case "S":
      this.dp = p(6.73913, -1.27096);
      this.paths = ["m 0 0 c 1.8517 -0.8635 7.64527 -2.13214 7.9805 -0.558 c 0.124224 0.583319 -0.301954 0.59088 -0.561318 0.551584 c -0.473203 -0.071694 -0.680051 -0.611148 -0.680051 -1.26455"];
      return;

    case "NE":
     this.dp = p(7.5344, -1.1129);
     this.paths = ["m 0 0 c 1.8517 -0.8635 7.9805 -2.1169 7.9805 -0.558 c 0 0.5964 -1.12611 0.851848 -1.31601 0.703448 c -0.3914 -0.317 0.29873 -0.768335 0.86991 -1.25835"];
     return;

    default:
      this.dp = p(7.5344, -1.1129);
      this.paths = ["m 0 0 c 1.8517 -0.8635 7.9805 -2.1169 7.9805 -0.558 c 0 0.5964 -1.0114 0.9895 -1.2013 0.8411 c -0.3914 -0.317 0.2804 -0.7426 0.7552 -1.396"];
      return;
  }
};

WasedaMu = function() { WasedaChar.call(this, "WasedaMu", "む", "ER8CR4", "ER", "ERCR4", "black", false, p(0.0, 0.2)); };
WasedaMu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["む"] = WasedaMu;

WasedaMu.prototype.setPaths = function() {

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
      this.dp = p(3.68166, -1.13059);
      this.paths = ["m 0 0 c 2.0293 -0.8199 3.6962 -1.258 5.0456 -1.258 c 1.0861 0 2.78 0.3634 2.78 1.6051 c 0 1.46647 -3.16762 -0.848282 -4.14394 -1.47769"];
      return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "ER4":
     this.dp = p(5.57654, -1.23084);
     this.paths = ["m 0 0 c 2.0293 -0.8199 3.6962 -1.258 5.0456 -1.258 c 1.0861 0 3.10138 0.40571 2.78 1.6051 c -0.2972 1.10917 -3.49759 1.46488 -4.05166 0.230814 c -0.348646 -0.776527 1.10538 -1.40621 1.80259 -1.80875"];
     return;

    case "NEL8":
      this.dp = p(5.85932, -1.19414);
      this.paths = ["m 0 0 c 2.036 -0.7814 3.682 -1.2533 5.027 -1.2533 c 1.082 0 2.797 0.3136 2.797 1.5504 c 0 1.4252 -3.9947 0.929334 -4.10017 -0.486666 c -0.0584 -0.784484 1.37449 -0.582574 2.13549 -1.00457"];
      return;

    case "EL8":
      this.dp = p(7.58856, -0.330814);
      this.paths = ["m 0 0 c 2.0216 -0.8168 3.6823 -1.2533 5.0266 -1.2533 c 1.0821 0 2.7696 0.3619 2.7696 1.599 c 0 0.566948 -1.1467 0.679876 -1.74122 0.549583 c -0.625573 -0.137098 -1.52138 -0.658821 -1.42238 -1.29154 c 0.07504 -0.479542 0.843281 -0.802665 1.32552 -0.602761 c 0.455811 0.18895 0.951936 0.460806 1.63044 0.668206"];
      return;

    case "NER8":
      this.dp = p(5.0675, -1.0771);
      this.paths = ["m 0 0 c 2.0492 -0.7459 3.7234 -1.0771 5.0675 -1.0771 c 1.0823 0 2.89146 0.437493 2.8236 1.5013 c -0.04083 0.640069 -1.20558 0.921198 -1.79991 0.680102 c -0.74431 -0.301937 -1.44109 -1.0346 -1.02369 -2.1814"];
      return;

    case "EL16":
      this.dp = p(7.53954, -0.396807);
      this.paths = ["m 0 0 c 2.0216 -0.8168 3.6823 -1.2533 5.0266 -1.2533 c 1.0821 0 2.7696 0.3619 2.7696 1.599 c 0 0.747465 -1.1467 0.679876 -1.74122 0.549583 c -0.625573 -0.137098 -1.52139 -0.658821 -1.42238 -1.29154 c 0.07504 -0.479542 0.843281 -0.802665 1.32552 -0.602761 c 0.455811 0.18895 1.17068 0.522374 1.58141 0.602213"];
      return;

    case "SER8":
      this.dp = p(7.78283, -0.018803);
      this.paths = ["m 0 0 c 2.0357 -0.7814 3.6823 -1.2533 5.0266 -1.2533 c 1.0822 0 2.7973 0.3135 2.7973 1.5506 c 0 1.0442 -1.14874 1.11866 -1.84713 1.02667 c -0.702563 -0.09254 -1.80655 -0.827439 -1.52733 -1.47874 c 0.438173 -1.02209 1.73029 -0.986527 3.33339 0.135973"];
      return;

    case "SER16":
      this.dp = p(7.77707, 0.000381);
      this.paths = ["m 0 0 c 2.0293 -0.8199 3.6962 -1.258 5.0456 -1.258 c 1.0861 0 2.78 0.3634 2.78 1.6051 c 0 1.26668 -3.65304 0.090422 -3.3579 -1.04396 c 0.28386 -1.09102 2.59777 0.302791 3.30937 0.697239"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(7.058, -0.7963);
      this.paths = ["m 0 0 c 2.035 -0.7814 3.682 -1.2533 5.026 -1.2533 c 1.083 0 3.0801 0.579046 2.77 1.5991 c -0.358617 1.17966 -3.55054 0.978483 -3.69068 -0.246494 c -0.116899 -1.02184 1.58968 -0.824202 2.95268 -0.895606"];
      return;
  }

  this.dp = p(3.931, -1.1421);
  this.paths = ["m 0 0 c 2.0293 -0.8199 3.6962 -1.258 5.0456 -1.258 c 1.0861 0 2.78 0.3634 2.78 1.6051 c 0 1.0482 -1.9623 0.4465 -2.6 0 c -0.5764 -0.4036 -0.9162 -0.7134 -1.2946 -1.4892"];
};

WasedaMe = function() { WasedaChar.call(this, "WasedaMe", "め", "ER16CR1", "ER", "ERCR", "black", false, p(0.0, 1.0)); };
WasedaMe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["め"] = WasedaMe;

WasedaMe.prototype.setPaths = function() {
  switch (this.getNextModel().replace(/(\D+\d+).*/, "$1")) {
    case "NEL8":
      this.dp = p(15.4183, -1.578);
      this.paths = ["m 0 0 c 3.62581 -1.109 15.7619 -2.95 15.8262 -1.107 c 0.0156 0.297 -0.343033 0.62722 -0.653104 0.68374 c -0.302834 0.0552 -0.807321 -0.093 -0.832432 -0.39981 c -0.03578 -0.43713 0.728936 -0.56193 1.07764 -0.75493"];
      return;

    case "ER8":
      this.dp = p(15.5816, -1.49181);
      this.paths = ["m 0 0 c 3.606 -1.1717 15.826 -2.9311 15.826 -1.1067 c 0.021 0.2967 -0.12762 0.690075 -0.39762 0.845002 c -0.33015 0.189438 -1.01957 0.260315 -1.13738 -0.101631 c -0.17688 -0.543392 0.76457 -0.894281 1.29057 -1.12848"];
      return;

    case "EL8":
      this.dp = p(15.8166, -0.974);
      this.paths = ["m 0 0 c 3.6061 -1.172 15.3424 -2.91305 15.8263 -1.107 c 0.0156 0.297 -0.02594 0.65592 -0.2706 0.786 c -0.311501 0.16562 -0.817441 0.0132 -1.0223 -0.274 c -0.103225 -0.14473 -0.09997 -0.41893 0.0372 -0.532 c 0.322889 -0.26617 0.8246 0.024 1.246 0.153"];
      return;

    case "SER4":
    case "SER8":
    case "SER16":
      this.dp = p(16.0013, 0.534654);
      this.paths = ["m 0 0 c 3.6262 -1.1087 13.7807 -2.15559 15.543 -1.13817 c 1.41187 0.815141 0.340677 1.93334 0.07138 2.0055 c -0.332823 0.08918 -0.76559 0.03546 -1.01337 -0.203977 c -0.178738 -0.172725 -0.357093 -0.559583 -0.172064 -0.72555 c 0.362392 -0.325057 1.16679 0.312746 1.57239 0.596848"];
      return;

    case "NER8":
      this.dp = p(15.0569, -1.64882);
      this.paths = ["m 0 0 c 3.606 -1.1717 15.349 -2.88721 15.8261 -1.1067 c 0.06839 0.255254 -0.01408 0.608116 -0.208989 0.805468 c -0.146636 0.148471 -0.439971 0.293793 -0.603961 0.164747 c -0.396328 -0.311874 -0.2172 -0.795408 0.04375 -1.51233"];
      return;
  }

  switch (this.getNextHeadType()) {
    case "E":
      this.dp = p(15.861, -0.773351);
      this.paths = ["m 0 0 c 3.60605 -1.1717 15.255 -3.23846 15.8262 -1.1067 c 0.178728 0.667021 0.02198 0.974617 -0.3407 1.1067 c -0.355167 0.129347 -1.12587 -0.202857 -0.952452 -0.615391 c 0.109359 -0.260152 0.877357 -0.157962 1.32796 -0.157962"];
      return;

    case "S":
      this.dp = p(14.6897, -1.7832);
      this.paths = ["m 0 0 c 3.60607 -1.1717 15.8262 -2.95152 15.8262 -1.1067 c 0 0.454188 -0.435749 0.70583 -0.7433 0.6132 c -0.430341 -0.129613 -0.3932 -0.8042 -0.3932 -1.2897"];
      return;

    case "SW":
      this.dp = p(14.7833, -1.69639);
      this.paths = ["m 0 0 c 3.606 -1.1717 15.3645 -2.82891 15.826 -1.1067 c 0.18468 0.68924 -0.276713 1.08335 -0.61029 0.890758 c -0.310522 -0.17928 -0.4324 -0.883706 -0.4324 -1.48045"];
      return;
  }

  this.dp = p(15.4242, -1.568);
  this.paths = ["m 0 0 c 3.606 -1.1717 15.7617 -2.9503 15.8261 -1.1067 c 0.0156 0.2967 -0.0711 0.6193 -0.2989 0.7788 c -0.2223 0.1615 -0.6803 0.276 -0.8222 0.0575 c -0.2159 -0.374 0.4335 -0.9043 0.7192 -1.2976"];
};

WasedaMo = function() { WasedaChar.call(this, "WasedaMo", "も", "ER16", "ER", "ER", "black", false, p(0.0, 1.1)); };
WasedaMo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["も"] = WasedaMo;

WasedaMo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "EL8":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 3.43 -1.249 12.509 -1.067 16 0"];
      return;

    case "EL16":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 3.4161 -1.2433 10.8034 -1.19989 16 0"];
      return;

    case "SW8":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 4.3601 -1.5869 17.3428 -3.68933 16 0"];
      return;

    case "SW16":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 4.3601 -1.5869 17.7542 -3.57051 16 0"];
      return;
  }

  switch (_head) {
    case "SER":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 5.0166 -1.8259 17.94 -3.3601 16 0"];
      return;

    case "SWR":
      this.dp = p(16, 0);
      this.paths = ["m 0 0 c 4.3601 -1.5869 13.8852 -3.66288 16 0"];
      return;
  }

  this.dp = p(16, 0);
  this.paths = ["m 0 0 c 4.3601 -1.5869 15.326 -3.8223 16 0"];
};

SvsdKya = function() { SvsdChar.call(this, "SvsdKya", "きゃ", "HNEL10", "HNEL", "NEL", "black", false, p(1.0, 0.5)); };
SvsdKya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きゃ"] = SvsdKya;

SvsdKya.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.10736, -2.82685);
      this.paths = ["m 0 0 c 0 0 -1.16251 0.934725 -0.960347 1.48994 c 0.134752 0.370086 0.737611 0.394521 1.12883 0.349042 c 3.04896 -0.354437 7.13204 -2.90088 7.93888 -4.66583"];
      break;
  }
};

SvsdGya = function() { SvsdChar.call(this, "SvsdGya", "ぎゃ", "HNEL10", "HNEL", "NEL", "black", false, p(1.0, 0.5)); };
SvsdGya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぎゃ"] = SvsdGya;
SvsdGya.prototype.setPaths = SvsdKya.prototype.setPaths;
SvsdGya.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.81629 -0.01509 l 0.599564 0.98706"]; };

SvsdKyu = function() { SvsdChar.call(this, "SvsdKyu", "きゅ", "HSEL10", "HSEL", "SEL", "black", false, p(1.3, -2.6)); };
SvsdKyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きゅ"] = SvsdKyu;

SvsdKyu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.06996, 5.48121);
      this.paths = ["m 0 0 c 0 0 -0.71392 -0.54351 -1.03417 -0.213149 c -0.341141 0.351908 -0.305085 0.994842 -0.211669 1.45504 c 0.609448 3.00236 6.31144 4.23931 8.3158 4.23931"];
      break;
  }
};

SvsdGyu = function() { SvsdChar.call(this, "SvsdKyu", "ぎゅ", "HSEL10", "HSEL", "SEL", "black", false, p(1.3, -2.6)); };
SvsdGyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぎゅ"] = SvsdGyu;
SvsdGyu.prototype.setPaths = SvsdKyu.prototype.setPaths;
SvsdGyu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.33574 3.70743 l -1.06066 1.06066"]; };

SvsdKyo = function() { SvsdChar.call(this, "SvsdKyo", "きょ", "HEL10", "HEL", "EL", "black", false, p(0.8, -1.2)); };
SvsdKyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きょ"] = SvsdKyo;

SvsdKyo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(9.42422, 1.33708);
      this.paths = ["m 0 0 c -0.35243 0.18977 -0.736279 0.38466 -0.761113 0.73693 c -0.02742 0.389 0.318683 0.75057 0.717981 0.92364 c 2.80684 1.21654 7.83464 0.87384 9.46736 -0.32349"];
      break;
  }
};

SvsdSha = function() { SvsdChar.call(this, "SvsdSha", "しゃ", "HNEL5", "HNEL", "NEL", "black", false, p(0.6, -0.0)); };
SvsdSha.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しゃ"] = SvsdSha;

SvsdSha.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.87029, -1.28517);
      this.paths = ["m 0 0 c 0 0 -0.677518 0.687112 -0.546569 1.06359 c 0.07818 0.224781 0.412964 0.317018 0.649973 0.295442 c 1.52735 -0.139041 3.58129 -1.95154 3.76689 -2.64421"];
      break;
  }
};

SvsdShu = function() { SvsdChar.call(this, "SvsdShu", "しゅ", "HSEL5", "HSEL", "SEL", "black", false, p(1.0, -0.9)); };
SvsdShu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しゅ"] = SvsdShu;

SvsdShu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.35074, 2.22602);
      this.paths = ["m 0 0 c 0 0 -0.501024 -0.566633 -0.85526 -0.374908 c -0.2602 0.14083 -0.02392 0.704146 0.0703 0.902124 c 0.698885 1.46857 3.58272 1.6988 4.13571 1.6988"];
      break;
  }
};

SvsdSho = function() { SvsdChar.call(this, "SvsdSho", "しょ", "HEL5", "HEL", "EL", "black", false, p(0.7, -0.8)); };
SvsdSho.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しょ"] = SvsdSho;

SvsdSho.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.22764, 0.42276);
      this.paths = ["m 0 0 c -0.349828 0.18949 -0.794533 0.47242 -0.737127 0.8672 c 0.05505 0.37862 0.567774 0.64192 1.00813 0.71545 c 0.955564 0.15955 2.99144 -0.31121 3.95664 -1.15989"];
      break;
  }
};

SvsdCha = function() { SvsdChar.call(this, "SvsdCha", "ちゃ", "BNE5", "BNE", "NE", "black", false, p(0.2, -0.3)); };
SvsdCha.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちゃ"] = SvsdCha;

SvsdCha.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.16014, -1.00595);
      this.paths = ["m 0 0 c 0.175105 0.567609 -0.03993 1.14964 -0.214011 1.51947 l 4.37415 -2.52542"];
      break;
  }
};

SvsdChu = function() { SvsdChar.call(this, "SvsdChu", "ちゅ", "BSE5", "BSE", "SE", "black", false, p(1.4, -1.4)); };
SvsdChu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちゅ"] = SvsdChu;

SvsdChu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.88596, 2.72296);
      this.paths = ["m 0 0 l -1.44106 0.224753 l 4.32702 2.49821"];
      break;
  }
};

SvsdCho = function() { SvsdChar.call(this, "SvsdCho", "ちょ", "BE5", "BE", "E", "black", false, p(0.7, -0.6)); };
SvsdCho.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちょ"] = SvsdCho;

SvsdCho.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.31534, 1.21689);
      this.paths = ["m 0 0 c 0.05701 0.51133 -0.01331 0.9755 -0.685138 1.21689 h 5.00048"];
      break;
  }
};

SvsdNya = function() { SvsdChar.call(this, "SvsdNya", "にゃ", "HNER10", "HNER", "NER", "black", false, p(2.0, 3.7)); };
SvsdNya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にゃ"] = SvsdNya;

SvsdNya.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.16322, -5.51296);
      this.paths = ["m 0 0 c -1.62204 0.824997 -1.62645 -0.713151 -1.23316 -1.46891 c 1.43204 -2.65759 5.53253 -4.4211 8.39638 -4.04405"];
      break;
  }
};

SvsdNyu = function() { SvsdChar.call(this, "SvsdNyu", "にゅ", "HSER5", "HSER", "SER", "black", false, p(0.3, -0.7)); };
SvsdNyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にゅ"] = SvsdNyu;

SvsdNyu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.91552, 3.108);
      this.paths = ["m 0 0 c -0.712654 -0.37058 -0.213223 -1.776 0.94128 -1.776 c 4.20669 0 7.55693 3.32659 7.97424 4.884"];
      break;
  }
};

SvsdNyo = function() { SvsdChar.call(this, "SvsdNyo", "にょ", "HER10", "HER", "ER", "black", false, p(1.0, 1.0)); };
SvsdNyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にょ"] = SvsdNyo;

SvsdNyo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.95008, -1.49168);
      this.paths = ["m 0 0 c -0.408598 0.0908 -1.63705 -0.40273 -0.526477 -0.96521 c 2.77099 -1.40345 8.18462 -1.30163 9.47655 -0.52647"];
      break;
  }
};

SvsdHya = function() { SvsdChar.call(this, "SvsdHya", "ひゃ", "HNEL20", "HNEL", "NEL", "black", false, p(1.1, 3.2)); };
SvsdHya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひゃ"] = SvsdHya;

SvsdHya.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.512, -8.03582);
      this.paths = ["m 0 0 c -0.44368 0.21876 -2.23907 1.34031 0.11008 1.54112 c 6.38568 0.545861 15.9754 -7.88468 16.4019 -9.57693"];
      break;
  }
};

SvsdHyu = function() { SvsdChar.call(this, "SvsdHyu", "ひゅ", "HSEL20", "HSEL", "SEL", "black", false, p(1.3, -4.5)); };
SvsdHyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひゅ"] = SvsdHyu;

SvsdHyu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.2315, 9.63365);
      this.paths = ["m 0 0 c -0.17014 -0.467883 -1.31373 -1.15625 -1.29528 0.242865 c 0.0699 5.30391 10.9486 9.39078 17.5268 9.39078"];
      break;
  }
};

SvsdHyo = function() { SvsdChar.call(this, "SvsdHyo", "ひょ", "HEL20", "HEL", "EL", "black", false, p(0.9, -0.9)); };
SvsdHyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひょ"] = SvsdHyo;

SvsdHyo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(19.1008, -0.40448);
      this.paths = ["m 0 0 c -0.73608 -0.0775 -1.54974 0.74747 0.0449 1.30335 c 5.5211 1.9246 14.2539 0.0905 19.0559 -1.70783"];
      break;
  }
};

SvsdMya = function() { SvsdChar.call(this, "SvsdMya", "みゃ", "HNER20", "HNER", "NER", "black", false, p(1.4, 4.9)); };
SvsdMya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みゃ"] = SvsdMya;

SvsdMya.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.0307, -9.98572);
      this.paths = ["m 0 0 c -0.62337 0.381774 -1.92741 0.551066 -1.17219 -0.690083 c 3.47371 -5.70881 12.3661 -8.9155 17.2029 -9.29563"];
      break;
  }
};

SvsdMyu = function() { SvsdChar.call(this, "SvsdMyu", "みゅ", "HSER20", "HSER", "SER", "black", false, p(1.4, -3.3)); };
SvsdMyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みゅ"] = SvsdMyu;

SvsdMyu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(16.5672, 8.04594);
      this.paths = ["m 0 0 c -1.5538 0.156942 -1.77983 -1.26306 -0.68009 -1.37345 c 8.73284 -0.876559 15.2965 7.33849 17.2473 9.41939"];
      break;
  }
};

SvsdMyo = function() { SvsdChar.call(this, "SvsdMyo", "みょ", "HER20", "HER", "ER", "black", false, p(1.1, 1.8)); };
SvsdMyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みょ"] = SvsdMyo;

SvsdMyo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(18.8285, -2.44639);
      this.paths = ["m 0 0 c -1.45965 -0.17738 -1.23502 -1.32599 -0.44947 -1.69125 c 5.3708 -2.49722 14.441 -2.3491 19.278 -0.75514"];
      break;
  }
};

SvsdRya = function() { SvsdChar.call(this, "SvsdRya", "りゃ", "HNER5", "HNER", "NER", "black", false, p(1.6, 1.2)); };
SvsdRya.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りゃ"] = SvsdRya;

SvsdRya.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.53439, -2.69789);
      this.paths = ["m 0 0 c -0.36823 0.368227 -2.18891 0.711058 -1.47158 -0.531402 c 0.78417 -1.35824 2.46741 -2.16649 4.00597 -2.16649"];
      break;
  }
};

SvsdRyu = function() { SvsdChar.call(this, "SvsdRyu", "りゅ", "HSER5", "HSER", "SER", "black", false, p(0.6, -0.0)); };
SvsdRyu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りゅ"] = SvsdRyu;

SvsdRyu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.97901, 1.24447);
      this.paths = ["m 0 0 c -0.70076 -0.220877 -0.9241 -1.09027 0.11462 -1.22809 c 1.05338 -0.139766 3.5647 1.35408 3.86439 2.47256"];
      break;
  }
};

SvsdRyo = function() { SvsdChar.call(this, "SvsdRyo", "りょ", "HER5", "HER", "ER", "black", false, p(1.0, 0.8)); };
SvsdRyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りょ"] = SvsdRyo;

SvsdRyo.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.0522, -0.5427);
      this.paths = ["m 0 0 c -0.80767 0.12029 -1.40235 -0.61714 -0.49447 -1.04923 c 1.45601 -0.69297 3.80519 -0.72052 4.54667 0.50653"];
      break;
  }
};

NakaneSau = function() { NakaneChar.call(this, "NakaneSau", "さう", "HSER7", "SER", "HSER", "black", false, p(0.1, -0.4)); };
NakaneSau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["さう"] = NakaneSau;
NakaneChar.dict["さー"] = NakaneSau;
NakaneChar.dict["しゃー"] = NakaneSau;

NakaneSau.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.99247, 2.77592);
      this.paths = ["m 0 0 c -0.433207 -0.73908 0.668051 -1.83528 1.46016 -1.87949 c 2.16239 -0.12069 4.34984 3.12106 4.5323 4.65541"];
      break;
  }
};

NakaneShiu = function() { NakaneChar.call(this, "NakaneShiu", "しう", "HSEL7", "HSEL", "SEL", "black", false, p(2.2, -2.8)); };
NakaneShiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["しう"] = NakaneShiu;
NakaneChar.dict["しゅう"] = NakaneShiu;
NakaneChar.dict["しゅー"] = NakaneShiu;

NakaneShiu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.47387, 5.77237);
      this.paths = ["m 0 0 c -1.04098 -0.44613 -2.08684 0.27803 -2.22108 1.09204 c -0.359554 2.18034 3.21281 4.35931 4.69495 4.68033"];
      break;
  }
};

NakaneSuu = function() { NakaneChar.call(this, "NakaneSuu", "すう", "HSER17", "HSER", "SER", "black", false, p(0.2, -3.0)); };
NakaneSuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["すう"] = NakaneSuu;
NakaneChar.dict["すー"] = NakaneSuu;

NakaneSuu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(13.2143, 8.88492);
      this.paths = ["m 0 0 c -0.75026 -2.29816 1.34721 -2.97756 2.68163 -2.97241 c 5.28657 0.0203 9.76573 6.48869 10.5327 11.8573"];
      break;
  }
};

NakaneSuu.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 6.9478 1.19683 v 0.1"];
};

NakaneSeu = function() { NakaneChar.call(this, "NakaneSeu", "せう", "HSEL17", "HSEL", "SEL", "black", false, p(3.0, -4.2)); };
NakaneSeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["せう"] = NakaneSeu;
NakaneChar.dict["しょう"] = NakaneSeu;
NakaneChar.dict["しょー"] = NakaneSeu;

NakaneSeu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.82898, 8.73353);
      this.paths = ["m 0 0 c -1.03276 -0.91145 -2.78552 0.004 -2.93197 1.02931 c -0.62372 4.3672 8.89978 7.67509 10.7609 7.70422"];
      break;
  }
};

NakaneSou = function() { NakaneChar.call(this, "NakaneSou", "そう", "HSER17", "HSER", "SER", "black", false, p(0.5, -2.2)); };
NakaneSou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["そう"] = NakaneSou;
NakaneChar.dict["そお"] = NakaneSou;
NakaneChar.dict["そー"] = NakaneSou;

NakaneSou.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.3356, 7.14283);
      this.paths = ["m 0 0 c -1.51044 -1.394 0.88853 -2.55226 1.99799 -2.6973 c 5.216 -0.6819 10.514 3.29477 12.3376 9.84013"];
      break;
  }
};

ShugiinI = function() { ShugiinChar.call(this, "ShugiinI", "い", "C1", "C", "C", "black", false, p(0.0, 0.0)); };
ShugiinI.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["い"] = ShugiinI;

ShugiinI.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();

  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "ShugiinSa_ShugiinMo":
      this.dp = p(-0.177101, -0.754);
      this.paths = ["m 0 0 c -0.218576 0.26599 -0.616914 0.51838 -0.732898 0.42453 c -0.24879 -0.20133 0.17792 -0.81542 0.555797 -1.17853"];
      return;

    case "ShugiinSa_ShugiinWa":
      this.tail = "SRCR1";
      this.dp = p(-0.576851, 0.21418);
      this.paths = ["m 0 0 c -0.541048 0.54105 -0.976127 0.036 -0.892868 -0.27617 c 0.08135 -0.30478 0.461129 -0.34952 0.687252 -0.24169 c 0.236318 0.11269 0.232508 0.38808 0.131986 0.49972 c -0.187493 0.20824 -0.324296 0.23232 -0.503221 0.23232"];
      return;

    case "ShugiinDan_ShugiinO":
    case "ShugiinDan_ShugiinWo":
      this.tail = "ShugiinDan_CR1";
      this.dp = p(0.118877, -0.44366);
      this.paths = ["m 0 0 c -0.677453 0.01 -0.918562 -0.35552 -0.760011 -0.66991 c 0.1041 -0.20642 0.451183 -0.344 0.653512 -0.23217 c 0.209325 0.11569 0.260365 0.32784 0.225376 0.45842"];
      return;

    case "ShugiinO_ShugiinE":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0 0 -0.451393 0.497458 -0.725258 0.432471 c -0.315806 -0.074941 -0.476729 -0.827498 -0.188593 -1.02287 c 0.300163 -0.20353 0.64672 0.323271 0.913851 0.590402"];
      return;
  }

  switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "ShugiinSa_E":
      this.dp = p(0.615012, -0.74596);
      this.paths = ["m 0 0 c -0.541048 0.54104 -0.925923 0.0196 -0.919867 -0.30317 c 0.00999 -0.5324 1.21468 -0.44279 1.53488 -0.44279"];
      return;

    case "ShugiinSa_SEL":
      this.dp = p(0, -0.51474);
      this.paths = ["m 0 0 c -0.28107 0 -0.64582 0.0755 -0.8369 -0.26317 c -0.14287 -0.25322 -0.0457 -0.55801 0.1579 -0.64476 c 0.2406 -0.10254 0.679 -0.10433 0.679 0.39319"];
      return;

    case "ShugiinO_S":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c -0.198746 0.198746 -0.554571 0.143857 -0.720593 -0.097017 c -0.157607 -0.228667 0.072837 -0.738661 0.348532 -0.772144 c 0.509514 -0.06188 0.372061 0.586865 0.372061 0.869161"];
      return;
  }

  switch (name_ + "_") {
    case "ShugiinWa_":
      this.dp = p(-0.235621, 0.17282);
      this.paths = ["m 0 0 c 0.145018 -0.14502 0.291705 -0.29887 0.216002 -0.58404 c -0.147216 -0.55455 -0.776542 -0.28056 -0.844546 0.038 c -0.09517 0.44576 0.183671 0.49195 0.392923 0.71886"];
      return;

    case "ShugiinYa_":
      this.tailType = "NER7CR1";
      this.dp = p(-0.92178, -0.032755);
      this.paths = ["m 0 0 c 0.391922 0.050845 0.539463 0.385642 0.435823 0.609936 c -0.103641 0.224295 -0.369076 0.320162 -0.566468 0.312099 c -0.350438 -0.014314 -0.579972 -0.42165 -0.791135 -0.95479"];
      return;

    case "ShugiinE_":
      this.dp = p(-0.430596, -0.470866);
      this.paths = ["m 0 0 c 0.142909 0.142909 0.339092 0.228805 0.541308 0.17039 c 0.177973 -0.05141 0.29167 -0.384466 0.23678 -0.588746 c -0.0462 -0.171939 -0.245145 -0.300023 -0.420824 -0.328915 c -0.274623 -0.04517 -0.78786 0.276405 -0.78786 0.276405"];
      return;

    case "ShugiinO_":
      this.dp = p(0.403773, -0.403773);
      this.paths = ["m 0 0 c -0.170338 0.170338 -0.391976 0.259247 -0.572012 0.140744 c -0.319813 -0.210506 -0.28771 -0.777781 0.081359 -0.844879 c 0.449115 -0.08165 0.720323 0.187712 0.894426 0.300362"];
      return;

    case "ShugiinRa_":
      this.dp = p(-0.009126, -0.626543);
      this.paths = ["m 0 0 c -0.00801 0.205065 -0.099826 0.512023 -0.390879 0.543836 c -0.284723 0.031122 -0.53417 -0.259302 -0.519196 -0.498835 c 0.02337 -0.373834 0.438809 -0.543136 0.900949 -0.671544"];
      return;
  }

  switch (model_ + "_" + _name) {}

  switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {}

  switch (model_ + "_") {
    case "EL3_":
      this.dp = p(-0.253132, 0.215048);
      this.paths = ["m 0 0 c 0 0 0.190812 -0.223261 0.14784 -0.474924 c -0.073004 -0.42755 -0.703355 -0.447503 -0.858007 -0.084825 c -0.117615 0.275821 0.00866 0.549594 0.457035 0.774797"];
      return;

    case "SR7_":
      this.tailType = "SR7CR1";
      this.dp = p(0.305748, -0.394047);
      this.paths = ["m 0 0 c -0.276261 0.336181 -0.632238 0.149227 -0.809639 -0.05498 c -0.143601 -0.165298 -0.132516 -0.530576 0.047546 -0.655164 c 0.305266 -0.211217 0.844103 -0.02394 1.06784 0.316097"];
      return;
  }

  switch (tail_ + "_" + _name) {
    case "E_ShugiinMo":
    case "E_ShugiinYa":
    case "E_ShugiinYama":
    case "E_ShugiinYar":
      this.dp = p(0.231884, -0.087087);
      this.paths = ["m 0 0 c 0.531938 0 0.463582 -0.871055 0.15213 -0.958428 c -0.363037 -0.101846 -0.697224 0.164938 -0.690248 0.437202 c 0.0075 0.294556 0.392251 0.434139 0.770002 0.434139"];
      return;

    case "S_ShugiinNoJoshi":
      this.dp = p(0.02864, -1.16057);
      this.paths = ["m 0 0 c 0 0.15331 0.0262 0.27166 -0.0858 0.35757 c -0.22186 0.17028 -0.68715 0.003 -0.76611 -0.2547 c -0.11535 -0.37579 0.53563 -0.91851 0.88055 -1.26344"];
      return;

    case "S_ShugiinWa":
    case "S_ShugiinWan":
      this.dp = p(0.728996, 0.427119);
      this.paths = ["m 0 0 c 0 0.421238 -0.063047 0.892053 0.134591 1.16285 c 0.135415 0.185541 0.519631 0.188835 0.686635 -0.05829 c 0.152743 -0.226022 0.04513 -0.522534 -0.09223 -0.67744"];
      return;

    case "E_ShugiinWa":
      this.tailType = "ECL1";
      this.dp = p(-0.72889, 0);
      this.paths = ["m 0 0 c 0.14967 0 0.37718 -0.205179 0.39297 -0.388761 c 0.021 -0.244533 -0.13387 -0.609218 -0.42732 -0.599618 c -0.2424 0.0079 -0.69454 0.988379 -0.69454 0.988379"];
      return;

    case "S_ShugiinE":
      this.dp = p(-0.029, -0.53967);
      this.paths = ["m 0 0 c 0 0.286715 -0.215249 0.456396 -0.417957 0.443439 c -0.249683 -0.015961 -0.506441 -0.257004 -0.441078 -0.607304 c 0.074443 -0.398965 0.479926 -0.725914 0.830035 -0.375805"];
      return;

    case "EF_ShugiinNode":
      this.tailType = "EFCR1";
      break;  // not return

    case "S_ShugiinO":
      this.dp = p(-0, -0.149163);
      this.paths = ["m 0 0 c 0 0.524578 0.411141 0.66794 0.751252 0.377188 c 0.195799 -0.167384 0.325998 -0.771563 0.062151 -0.944701 c -0.25491 -0.167275 -0.340795 -0.054258 -0.813403 0.41835"];
      return;
  }

  switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "E_S":
      this.dp = p(-0.48609, 0);
      this.paths = ["m 0 0 c 0 0 0.44189 -0.07579 0.45641 -0.404876 c 0.0339 -0.769002 -0.92248 -0.750414 -0.9294 -0.353434 c -0.006 0.347058 -0.0131 0.75831 -0.0131 0.75831"];
      return;

    case "E_SW":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0 0 -0.394201 0.471 -0.743971 0.4044 c -0.409765 -0.078 -0.553299 -0.65228 -0.235375 -0.91059 c 0.317924 -0.25831 0.778264 0.10696 0.979346 0.50619"];
      return;

    case "E_SW3(-105)":
      this.dp = p(0, -0);
      this.paths = ["m 0 0 c 0 0 -0.166765 0.424431 -0.586489 0.215671 c -0.426086 -0.211925 -0.363193 -0.719452 -0.109296 -0.851343 c 0.278777 -0.144815 0.739301 -0.082882 0.695785 0.635672"];
      return

    case "SE_S":
        this.dp = p(-0.230276, -0.230275);
        this.paths = ["m 0 0 c 0.113783 0.113783 0.547556 0.153511 0.671533 -0.033193 c 0.167187 -0.251775 -0.013468 -0.794088 -0.310094 -0.85201 c -0.28876 -0.056386 -0.5775 0.132473 -0.591715 0.654928"];
        return;

    case "SE_SE":
        this.dp = p(0, 0);
        this.paths = ["m 0 0 c 0 0 0.270652 0.238868 0.396643 0.169571 c 0.265747 -0.146164 0.342449 -0.667074 0.14594 -0.898093 c -0.140624 -0.16532 -0.48747 -0.163648 -0.651117 0 c -0.257196 0.257196 -0.135013 0.484975 0.108534 0.728522"];
        return;

    case "S_E":
        this.dp = p(0, -0.67654);
        this.paths = ["m 0 0 c 0 0.369198 -0.356193 0.511223 -0.604386 0.460615 c -0.294778 -0.060107 -0.55366 -0.503403 -0.446324 -0.784448 c 0.131811 -0.345129 0.565089 -0.352707 1.05071 -0.352707"];
        return;

    case "S_S":
        this.dp = p(-0.007735, 0.020084);
        this.paths = ["m 0 0 c 0 0.41522 0.201078 0.491145 0.422933 0.522395 c 0.234208 0.03299 0.52145 -0.177905 0.581445 -0.406688 c 0.065225 -0.248726 -0.081781 -0.644457 -0.333812 -0.695442 c -0.29583 -0.059845 -0.678301 -0.103774 -0.678301 0.599819"];
        return;

    case "W_SE":
        this.dp = p(0.733521, -2e-06);
        this.paths = ["m 0 0 c 0 0 -0.316611 0.00912 -0.457383 0.00912 c -0.223564 0 -0.494178 -0.322107 -0.336107 -0.615939 c 0.158071 -0.293832 0.573724 -0.346469 1.52701 0.606817"];
        return;
  }

  switch (tail_ + "_") {
    case "E_":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0 0 0.43798 -0.076 0.45641 -0.40487 c 0.0339 -0.60503 -0.50935 -0.68205 -0.74905 -0.50101 c -0.25322 0.19125 -0.19097 0.7408 0.29264 0.90588"];
      return;

    case "S_":
      this.tailType = "SCR1";
      this.dp = p(-0.029, -0.53967);
      this.paths = ["m 0 0 c 0 0.16603 -0.204068 0.40356 -0.39382 0.43137 c -0.178306 0.0261 -0.333684 -0.0237 -0.465215 -0.28296 c -0.139922 -0.27567 0.01049 -0.89397 0.830035 -0.68808"];
      return;
  }

  switch ("_" + _name) {
    case "_ShugiinO":
      this.dp = p(0.2318, -0.2318);
      this.paths = ["m 0 0 c -0.52286 -0.189956 -0.56294 -0.505401 -0.46542 -0.797264 c 0.0657 -0.19649 0.37607 -0.304735 0.57306 -0.240572 c 0.17053 0.05555 0.26715 0.281501 0.27826 0.460506 c 0.008 0.12587 -0.0939 0.285286 -0.1541 0.34553"];
      return;

    case "_ShugiinMa":
      this.dp = p(-0.47718, 0.488032);
      this.paths = ["m 0 0 c 0.230852 0.162954 0.487822 0.703732 0.287574 0.978429 c -0.134369 0.184326 -0.508759 0.16309 -0.684094 0.01718 c -0.131684 -0.109582 -0.22267 -0.337257 -0.08066 -0.507577"];
      return;

    case "_ShugiinYa":
      this.dp = p(-0.021124, 0.775046);
      this.paths = ["m 0 0 c 0 0 0.897129 0.285185 0.92401 0.663395 c 0.02007 0.282433 -0.245278 0.647803 -0.613014 0.58801 c -0.316895 -0.05153 -0.33212 -0.476359 -0.33212 -0.476359"];
      return;

    case "_ShugiinWa":
    case "_ShugiinWan":
      this.dp = p(0.207821, 0.192747);
      this.paths = ["m 0 0 c -0.466061 0.272883 -0.584222 0.657681 -0.386584 0.928477 c 0.135415 0.185541 0.519631 0.188835 0.686635 -0.05829 c 0.152743 -0.226022 0.04513 -0.522534 -0.09223 -0.67744"];
      return;

    case "_ShugiinNaka":
      this.dp = p(0.251928, 0.085957);
      this.paths = ["m 0 0 c -0.278796 0.23402 -0.530635 0.485385 -0.32243 0.812397 c 0.210965 0.331347 0.61042 0.141188 0.754771 -0.06604 c 0.130432 -0.18725 0.07686 -0.557258 -0.180413 -0.6604"];
      return;

    case "_ShugiinSa":
      this.dp = p(-1.05553, -0.807372);
      this.paths = ["m 0 0 c -0.417828 0.132827 -0.890307 0.202654 -1.08949 -0.02803 c -0.169937 -0.196813 -0.164378 -0.611183 0.03396 -0.779342"];
      return;

    case "_ShugiinSa":
    case "_ShugiinSan":
      this.dp = p(-0.510915, -0.741282);
      this.paths = ["m 0 0 c -0.417828 0.132827 -0.890307 0.202654 -1.08949 -0.02803 c -0.169937 -0.196813 -0.164378 -0.611183 0.03396 -0.779342 c 0.139483 -0.118262 0.394332 -0.12217 0.544614 0.06609"];
      return;

    case "_ShugiinA":
    case "_ShugiinAruiwa":
      this.dp = p(-0.423619, -0.429879);
      this.paths = ["m 0 0 c 0.29907 -0.320073 0.510338 -0.562221 0.39126 -0.85075 c -0.09077 -0.219935 -0.459964 -0.363382 -0.668807 -0.249385 c -0.200708 0.109557 -0.338361 0.404327 -0.146072 0.670256"];
      return;

    case "_ShugiinNo":
      this.dp = p(-0.452214, 0.0573);
      this.paths = ["m 0 0 c 0.128968 -0.15406 0.02815 -0.94444 -0.384077 -0.8884 c -0.279379 0.038 -0.500855 0.37854 -0.463648 0.63908 c 0.02358 0.16514 0.152969 0.31493 0.395511 0.30662"];
      return;
  }

  switch ("_" + _model.replace(/[COF].*/, "")) {
    case "_SER7":
      this.dp = p(-0.468311, 0.03851);
      this.paths = ["m 0 0 c 0.193886 0.269213 0.02673 0.901073 -0.307291 0.992085 c -0.248109 0.0676 -0.560721 -0.262302 -0.570539 -0.519269 c -0.0076 -0.198832 0.199576 -0.4069 0.409519 -0.434306"];
      return;
  }

  switch ("_" + _head) {
    case "_E":
      this.dp = p(-0.32498, 0);
      this.paths = ["m 0 0 c 0.114894 -0.2784 0.194674 -1.00327 -0.42469 -1.04932 c -0.305888 -0.02275 -0.662286 0.368694 -0.609515 0.689387 c 0.073705 0.447908 0.709225 0.359934 0.709225 0.359934"];
      return;

    case "_SE":
      this.dp = p(-0.16359, -0.163591);
      this.paths = ["m 0 0 c 0.062312 0.371346 -0.030336 0.762122 -0.313115 0.794342 c -0.314572 0.03584 -0.649537 -0.486264 -0.538177 -0.782641 c 0.083206 -0.221448 0.475601 -0.387393 0.687702 -0.175292"];
      return;

    case "_S":
      this.dp = p(0, -0.51474);
      this.paths = ["m 0 0 c -0.28107 0 -0.64582 0.0755 -0.8369 -0.26317 c -0.14287 -0.25322 -0.0457 -0.55801 0.1579 -0.64476 c 0.2406 -0.10254 0.679 -0.10433 0.679 0.39319"];
      return;
  }

  this.dp = p(0, 0);
  this.paths = ["m 0 0 c -0.0019 -0.239338 0.260415 -0.524292 0.499607 -0.515722 c 0.217215 0.0078 0.421049 0.28226 0.419024 0.499605 c -0.002 0.220837 -0.214426 0.492005 -0.435141 0.499607 c -0.227784 0.0078 -0.481681 -0.255578 -0.48349 -0.48349"];
};

ShugiinU = function() { ShugiinChar.call(this, "ShugiinU", "う", "S3", "S", "S", "black", false, p(3.7 - 5, -7)); };
ShugiinU.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["う"] = ShugiinU;

ShugiinU.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "S":
    case "SEL":
      this.dp = p(0 + 0.5, 3);
      this.paths = ["m0,0v3h0.5"];
      break;

    default:
      this.dp = p(0, 3);
      this.paths = ["m0,0v3"];
      break;
  }
};

ShugiinUh = function() { ShugiinChar.call(this, "ShugiinU", "うー", "S3", "S", "S", "black", false, p(3.7 - 5, -7)); };
ShugiinUh.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["うー"] = ShugiinUh;
ShugiinChar.dict["うう"] = ShugiinUh;
ShugiinUh.prototype.setPaths = ShugiinU.prototype.setPaths;
ShugiinUh.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m0,-2v0.1"];
};

ShugiinE = function() { ShugiinChar.call(this, "ShugiinE", "え", "SE3", "SE", "SE", "black", false, p(0.0, -1.1)); };
ShugiinE.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["え"] = ShugiinE;
ShugiinChar.dict["あなた"] = ShugiinE;

ShugiinE.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "SE":
      this.dp = p(2.47487, 1.76777);
      this.paths = ["m 0 0 l 2.12132 2.12132 l 0.353553 -0.353553"];
      break;

    default:
      this.dp = p(2.12132, 2.12132);
      this.paths = ["m 0 0 l 2.12132 2.12132"];
      break;
  }
};

ShugiinEh = function() { ShugiinChar.call(this, "ShugiinEh", "えー", "SE3", "SE", "SE", "black", false, p(0.0, -1.1)); };
ShugiinEh.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["えー"] = ShugiinEh;
ShugiinChar.dict["えい"] = ShugiinEh;
ShugiinEh.prototype.setPaths = ShugiinE.prototype.setPaths;
ShugiinEh.prototype.setPathsExtra = function() { this.pathsExtra = ["m 1.6575 0.342332 v 0.1"]; };

ShugiinAruiwa = function() { ShugiinChar.call(this, "ShugiinAruiwa", "あるいは", "EL3UWL3", "EL", "EL", "black", false, p(0.0, -0.8)); };
ShugiinAruiwa.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["あるいは"] = ShugiinAruiwa;

ShugiinAruiwa.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.58978, 1.7229);
      this.paths = ["m 0 0 c 0.785603 1.08466 2.56061 1.14564 3 0 c 0.376304 -0.981145 -1.64281 -0.161104 -1.55945 0.907136 c 0.11455 1.46792 1.62107 1.31255 2.14923 0.815765"];
      break;
  }
};

CharSmallCircle = function() { Char.call(this, "CharSmallCircle", "小円", "C1", "C", "C", "black", false, p(1.2, 0.0)); };
CharSmallCircle.prototype = Object.create(Char.prototype);
Char.dict["。"] = CharSmallCircle;
CharSmallCircle.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c -1e-06 0.34137 -0.276739 0.61811 -0.618112 0.61811 c -0.341373 0 -0.618111 -0.27674 -0.618112 -0.61811 c 1e-06 -0.34137 0.276739 -0.61811 0.618112 -0.61811 c 0.341373 0 0.618111 0.27674 0.618112 0.61811"];
      break;
  }
};

SvsdGa = function() { SvsdChar.call(this, "SvsdGa", "が", "NEL10", "NEL", "NEL", "black", false, p(0.0, 2.3)); };
SvsdGa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["が"] = SvsdGa;
SvsdGa.prototype.setPaths = SvsdKa.prototype.setPaths;
SvsdGa.prototype.setPathsExtra = function() {
  if (this.getNextHeadType() == "SW") {
    this.pathsExtra = ["m 4.6752 -1.59443 l 0.599564 0.98706"]; 
  } else {
    this.pathsExtra = ["m 4.8752 -1.39443 l 0.599564 0.98706"]; 
  }
};

SvsdGi = function() { SvsdChar.call(this, "SvsdGi", "ぎ", "SWL10", "SWL", "SWL", "black", false, p(5.1, -4.3)); };
SvsdGi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぎ"] = SvsdGi;
SvsdGi.prototype.setPaths = SvsdKi.prototype.setPaths;
SvsdGi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -4.13682 2.87398 l 1.16572 0.94399"]; };

SvsdGu = function() { SvsdChar.call(this, "SvsdGu", "ぐ", "SEL10", "SEL", "SEL", "black", false, p(0.0, -2.6)); };
SvsdGu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぐ"] = SvsdGu;
SvsdGu.prototype.setPaths = SvsdKu.prototype.setPaths;
SvsdGu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.49698 3.77787 l -1.06066 1.06066"]; };

SvsdGe = function() { SvsdChar.call(this, "SvsdGe", "げ", "SL10", "SL", "SL", "black", false, p(2.1, -5.0)); };
SvsdGe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["げ"] = SvsdGe;
SvsdGe.prototype.setPaths = SvsdKe.prototype.setPaths;
SvsdGe.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.09972 4.40898 l 1.14907 0.96418"]; };

SvsdGo = function() { SvsdChar.call(this, "SvsdGo", "ご", "EL10", "EL", "EL", "black", false, p(0.0, -0.5)); };
SvsdGo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ご"] = SvsdGo;
SvsdGo.prototype.setPaths = SvsdKo.prototype.setPaths;
SvsdGo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 4.15325 1.16892 l 1.06066 1.06066"]; };

SvsdZa = function() { SvsdChar.call(this, "SvsdZa", "ざ", "NEL5", "NEL", "NEL", "black", false, p(0.0, 1.1)); };
SvsdZa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ざ"] = SvsdZa;
SvsdZa.prototype.setPaths = SvsdSa.prototype.setPaths;
SvsdZa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.04372 -1.08109 l 1.06066 1.06066"]; };

SvsdJi = function() { SvsdChar.call(this, "SvsdJi", "じ", "SWR5", "SWR", "SWR", "black", false, p(2.6, -2.2)); };
SvsdJi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["じ"] = SvsdJi;
SvsdJi.prototype.setPaths = SvsdShi.prototype.setPaths;
SvsdJi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.39211 1.13786 l 1.06066 1.06066"]; };

SvsdZu = function() { SvsdChar.call(this, "SvsdZu", "ず", "SEL5", "SEL", "SEL", "black", false, p(0.0, -1.4)); };
SvsdZu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ず"] = SvsdZu;
SvsdZu.prototype.setPaths = SvsdSu.prototype.setPaths;
SvsdZu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 1.97011 1.67192 l -0.902722 1.19795"]; };

SvsdZe = function() { SvsdChar.call(this, "SvsdZe", "ぜ", "SL5", "SL", "SL", "black", false, p(1.4, -2.5)); };
SvsdZe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぜ"] = SvsdZe;
SvsdZe.prototype.setPaths = SvsdSe.prototype.setPaths;
SvsdZe.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.40471 2.23215 l 1.29904 0.75"]; };

SvsdZo = function() { SvsdChar.call(this, "SvsdZo", "ぞ", "EL5", "EL", "EL", "black", false, p(0.0, -0.8)); };
SvsdZo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぞ"] = SvsdZo;
SvsdZo.prototype.setPaths = SvsdSo.prototype.setPaths;
SvsdZo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.64596 0.37604 l 0.75 1.29904"]; };

SvsdDa = function() { SvsdChar.call(this, "SvsdDa", "だ", "NE5", "NE", "NE", "black", false, p(0.0, 1.2)); };
SvsdDa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["だ"] = SvsdDa;
SvsdDa.prototype.setPaths = SvsdTa.prototype.setPaths;
SvsdDa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 1.71053 -1.8911 l 0.75 1.29904"]; };

SvsdDi = function() { SvsdChar.call(this, "SvsdDi", "ぢ", "SW5", "SW", "SW", "black", false, p(2.5, -2.2)); };
SvsdDi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぢ"] = SvsdDi;
SvsdDi.prototype.setPaths = SvsdChi.prototype.setPaths; 
SvsdDi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.91596 1.66735 l 1.29904 0.75"]; };

SvsdDu = function() { SvsdChar.call(this, "SvsdDu", "づ", "SE5", "SE", "SE", "black", false, p(0.0, -1.2)); };
SvsdDu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["づ"] = SvsdDu;
SvsdDu.prototype.setPaths = SvsdTsu.prototype.setPaths;
SvsdDu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.60497 0.75888 l -0.75 1.29904"]; };

SvsdDe = function() { SvsdChar.call(this, "SvsdDe", "で", "S5", "S", "S", "black", false, p(0.6, -2.5)); };
SvsdDe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["で"] = SvsdDe;
SvsdDe.prototype.setPaths = SvsdTe.prototype.setPaths;
SvsdDe.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.62853 2.20516 l 1.22873 0.86037"]; };

SvsdDo = function() { SvsdChar.call(this, "SvsdDo", "ど", "E5", "E", "E", "black", false, p(0.0, 0.0)); };
SvsdDo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ど"] = SvsdDo;
SvsdDo.prototype.setPaths = SvsdTo.prototype.setPaths;
SvsdDo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.02082 -0.54013 l 1.06066 1.06066"]; };

SvsdBa = function() { SvsdChar.call(this, "SvsdBa", "ば", "NEL20", "NEL", "NEL", "black", false, p(0.0, 5.0)); };
SvsdBa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ば"] = SvsdBa;
SvsdBa.prototype.setPaths = SvsdHa.prototype.setPaths;
SvsdBa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 8.91412 -3.36897 l 0.860365 1.22873"]; };

SvsdBi = function() { SvsdChar.call(this, "SvsdBi", "び", "SWL20", "SWL", "SWL", "black", false, p(10.2, -8.7)); };
SvsdBi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["び"] = SvsdBi;
SvsdBi.prototype.setPaths =  SvsdHi.prototype.setPaths;
SvsdBi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -7.7257 7.69639 l 0.75 1.29904"]; };

SvsdBu = function() { SvsdChar.call(this, "SvsdBu", "ぶ", "SEL20", "SEL", "SEL", "black", false, p(0.0, -5.1)); };
SvsdBu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぶ"] = SvsdBu;
SvsdBu.prototype.setPaths = SvsdHu.prototype.setPaths;
SvsdBu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 6.63739 7.27088 l -0.75 1.29904"]; };

SvsdBe = function() { SvsdChar.call(this, "SvsdBe", "べ", "UWL5", "SWL", "SEL", "black", false, p(3.4, -2.6)); };
SvsdBe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["べ"] = SvsdBe;
SvsdBe.prototype.setPaths = SvsdHe.prototype.setPaths;
SvsdBe.prototype.setPathsExtra = function() { this.pathsExtra = ["m -3.35943 2.33373 l 1.29904 0.75"]; };

SvsdBo = function() { SvsdChar.call(this, "SvsdBo", "ぼ", "EL20", "EL", "EL", "black", false, p(0.0, -0.6)); };
SvsdBo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぼ"] = SvsdBo;
SvsdBo.prototype.setPaths = SvsdHo.prototype.setPaths; 
SvsdBo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 9.33952 1.9409 l 0.96419 1.14907"]; };

SvsdPa = function() { SvsdChar.call(this, "SvsdPa", "ぱ", "NEL20", "NEL", "NEL", "black", false, p(0.0, 4.7)); };
SvsdPa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぱ"] = SvsdPa;
SvsdPa.prototype.setPaths = SvsdHa.prototype.setPaths;
SvsdPa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.06935 -0.90993 v 1.5"]; };

SvsdPi = function() { SvsdChar.call(this, "SvsdPi", "ぴ", "SWL20", "SWL", "SWL", "black", false, p(10.2, -8.7)); };
SvsdPi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぴ"] = SvsdPi;
SvsdPi.prototype.setPaths = SvsdHi.prototype.setPaths; 
SvsdPi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.08899 0.99665 l 0.860365 1.22873"]; };

SvsdPu = function() { SvsdChar.call(this, "SvsdPu", "ぷ", "SEL20", "SEL", "SEL", "black", false, p(0.2, -5.1)); };
SvsdPu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぷ"] = SvsdPu;
SvsdPu.prototype.setPaths = SvsdHu.prototype.setPaths;
SvsdPu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 1.06167 1.71053 l -1.29904 0.75"]; };

SvsdPe = function() { SvsdChar.call(this, "SvsdPe", "ぺ", "WL5", "SWL", "SEL", "black", false, p(2.8, -2.6)); };
SvsdPe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぺ"] = SvsdPe;
SvsdPe.prototype.setPaths = SvsdHe.prototype.setPaths; 
SvsdPe.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.11771 0.5074 l 1.06066 1.06066"]; };

SvsdPo = function() { SvsdChar.call(this, "SvsdPo", "ぽ", "EL20", "EL", "EL", "black", false, p(0.0, -1.3)); };
SvsdPo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぽ"] = SvsdPo;
SvsdPo.prototype.setPaths = SvsdHo.prototype.setPaths;
SvsdPo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 1.86819 0.42815 l -0.75 1.29904"]; };


ShugiinEJoshi = function() { ShugiinChar.call(this, "ShugiinEJoshi", "〜へ", "SE2", "SE", "SE", "black", false, p(0.0, -0.7)); };
ShugiinEJoshi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜へ"] = ShugiinEJoshi;

ShugiinEJoshi.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.41421, 1.41421);
      this.paths = ["m 0 0 l 1.41421 1.41421"];
      break;
  }
};

ShugiinEno = function() { ShugiinChar.call(this, "ShugiinEno", "~への", "SE2NE2F", "SE", "NEF", "black", false, p(0.0, -0.5)); };
ShugiinEno.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜への"] = ShugiinEno;

ShugiinEno.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.18658, -0.379418);
      //this.paths = ["m 0 0 l 1.41608 1.41608 l 1.41609 -1.41608", "m 4.18658 -0.479418 v 0.1"];
      this.paths = ["m 0 0 l 1.41608 1.41608 l 1.41609 -1.41608"];
      break;
  }
};

ShugiinTe = function() { ShugiinChar.call(this, "ShugiinTe", "て", "SE7", "SE", "SE", "black", false, p(0.0, -2.5)); };
ShugiinTe.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["て"] = ShugiinTe;
ShugiinChar.dict["で"] = ShugiinTe;

ShugiinTe.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(4.94975, 4.94975);
      this.paths = ["m 0 0 l 4.94975 4.94975"];
      break;
  }
};

ShugiinEte = function() { ShugiinChar.call(this, "ShugiinEte", "えて", "SE3W2", "SE", "W", "black", false, p(0.0, -1.1)); };
ShugiinEte.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["えて"] = ShugiinEte;

ShugiinEte.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(0.12132, 2.12132);
      this.paths = ["m 0 0 l 2.12132 2.12132 h -2"];
      break;
  }
};

ShugiinMade = function() { ShugiinChar.call(this, "ShugiinMade", "まで", "TE3", "TE", "E", "black", false, p(0.0, 0.0)); };
ShugiinMade.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["まで"] = ShugiinMade;
ShugiinChar.dict["〜まで"] = ShugiinMade;

ShugiinMade.prototype.setPaths = function() {
  const that = this;
  function jog() {
    if (that.getNextHeadType() == "E") {
      that.dp.y += 0.5;
      that.paths[0] += "v0.5";
    }
  }

  switch (this.getPrevName()) {
    case "CharDottedCircle":
      this.dp = p(3, 0);
      this.paths = ["m 0 0 h 3"];
      jog();
      return;

    case "ShugiinGan":
      this.dp = p(3 + 1 - 1, - 2 + 5);
      this.paths = ["m0,3h3"];
      jog();
      return;

    case "ShugiinHa":
      this.dp = p(3 - 3.1, - 1);
      this.paths = ["m-3.1,-1h3"];
      jog();
      return;

    case "ShugiinYa":
      this.dp = p(3 - 3.1, + 0.7);
      this.paths = ["m-3.1,+0.7h3"];
      jog();
      return;

    case "ShugiinWa":
      this.dp = p(3 - 1.4, + 0.5);
      this.paths = ["m-1.4,0.5h3"];
      jog();
      return;
  }

  switch (this.getPrevModel().replace(/[CO].*/, "")) {
    case "SR7":
      this.dp = p(3 + 1.1, 0 - 1.8);
      this.paths = ["m 1.1 -1.8 h 3"];
      jog();
      return;

    case "SR7F":
      this.dp = p(3 + 1.1, 0 - 3.8);
      this.paths = ["m 1.1,-3.8 h 3"];
      jog();
      return;

    case "EL7":
      this.dp = p(3 - 2.2, 0 + 0.9);
      this.paths = ["m-2.2,0.9 h 3"];
      jog();
      return;
  }

  switch (this.getPrevTailType()) {
    case "S":
    case "SER":
      this.dp = p(3, -2);
      this.paths = ["m 0 -2 h 3"];
      jog();
      return;

    case "E":
      this.dp = p(2, 1);
      this.paths = ["m-1,1h3"];
      jog();
      return;

    case "SR7CR1":
      this.dp = p(3 + 1.1, 0 - 1.8);
      this.paths = ["m 1.1 -1.8 h 3"];
      jog();
      return;
  }

  this.dp = p(3, 0);
  this.paths = ["m 0 0 h 3"];
  jog();
};

ShugiinNode = function() { ShugiinChar.call(this, "ShugiinNode", "〜ので", "XSE3F|P", "XSE|P", "SEF|P", "black", false, p(0.0, -1.0)); };
ShugiinNode.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["〜ので"] = ShugiinNode;
ShugiinChar.dict["ので"] = ShugiinNode;

ShugiinNode.prototype.setPaths = function() {
  const prevName = this.getPrevName();
  const nextName = this.getNextName();

  switch (prevName + "_" + nextName) {
    case "CharDottedCircle_ShugiinWa":
      this.dp = p(1, -0.5);
      return;

    case "ShugiinKar_ShugiinWa":
    case "ShugiinKakar_ShugiinWa":
      this.dp = p(-2, -0.8);
      return;

    case "ShugiinNaru_ShugiinWa":
      this.dp = p(4, -2);
      return;

    case "ShugiinIh_ShugiinWa":
      this.dp = p(3, -2);
      return;

    case "CharDottedCircle_ShugiinMo":
      this.dp = p(-1, 0);
      return;

    case "ShugiinSar_ShugiinMo":
      this.dp = p(0.5, -2);
      return;

    case "ShugiinTar_ShugiinMo":
      this.dp = p(-2, -2);
      return;

    case "ShugiinHar_ShugiinMo":
      this.dp = p(-5, 0.5);
      return;

    case "CharDottedCircle_ShugiinA":
      this.dp = p(-1, 0);
      return;

    case "ShugiinMar_ShugiinA":
      this.dp = p(-3.5, -2.1);
      return;
  }

  switch (this.getPrevTailType() + "_" + nextName) {
    case "SCR1_ShugiinA": 
      this.dp = p(-1.5, -2);
      return;
  }

  switch (nextName) {
    case "ShugiinWa":
      this.dp = p(1, -0.5);
      return;

    case "ShugiinMo":
      this.dp = p(-1, 0);
      return;

    case "ShugiinA":
      this.dp = p(-1, 0);
      return;
  }

  switch (prevName) {
    case "CharDottedCircle":
      this.dp = p(3.76592 - 1.5, 3.29054 + 1);
      this.paths = ["m-1.5,1 l 2.29813 1.92836"];
      return;

    case "ShugiinIh":
      this.dp = p(3.76592, 3.29054 - 1);
      this.paths = ["m0,-1 l 2.29813 1.92836"];
      return;

    case "ShugiinTa":
      this.dp = p(3.76592 - 1.1, 3.29054 - 1.9);
      this.paths = ["m-1.1,-1.9 l 2.29813 1.92836"];
      return;

    case "ShugiinYar":
      this.dp = p(3.76592 - 2 - 2.6, 3.29054 - 0.5);
      this.paths = ["m-4.6,-0.5 l 2.29813 1.92836"];
      return;

    case "ShugiinNaru":
      this.dp = p(3.76592 - 1, 3.29054 - 0);
      this.paths = ["m-1,0 l 2.29813 1.92836"];
      return;
  }

  switch (this.getPrevTailType()) {
    case "EFCR1":
      this.dp = p(3.76592 - 5, 3.29054 - 1);
      this.paths = ["m-5,-1 l 2.29813 1.92836"];
      return;

    case "NER7CR1":
      this.dp = p(3.76592 - 2, 3.29054 - 0.5);
      this.paths = ["m-2,-0.5 l 2.29813 1.92836"];
      return;
  }

  this.dp = p(3.76592 - 2, 3.29054 - 1);
  //this.paths = ["m 0 0 l 2.29813 1.92836", "m 3.83022 3.21394 l -0.0643 0.0766"];
  this.paths = ["m-2,-1 l 2.29813 1.92836"];
};


NakaneTau = function() { NakaneChar.call(this, "NakaneTau", "たう", "UNWR2SE7", "NWR", "SE", "black", false, p(0.6, 0.1)); };
NakaneTau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["たう"] = NakaneTau;
NakaneChar.dict["たー"] = NakaneTau;
NakaneChar.dict["たあ"] = NakaneTau;
NakaneChar.dict["ちゃー"] = NakaneTau;
NakaneChar.dict["ちゃあ"] = NakaneTau;

NakaneTau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SW":
      this.dp = p(7.52615, 2.12022);
      this.paths = ["m 0 0 c 0.763942 -1.32319 1.35039 -1.44494 1.99753 -1.07134 l 5.52862 3.19156"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.45556, 1.55943);
  this.paths = ["m 0 0 c -1.61343 -2.09969 0.279789 -2.00573 0.926933 -1.63213 l 5.52862 3.19156"];
};

NakaneChiu = function() { NakaneChar.call(this, "NakaneChiu", "ちう", "UNR2S7", "NER", "S", "black", false, p(0.0, -2.2)); };
NakaneChiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ちう"] = NakaneChiu;
NakaneChar.dict["ちゅー"] = NakaneChiu;
NakaneChar.dict["ちゅう"] = NakaneChiu;

NakaneChiu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.25097, 5.70055);
      this.paths = ["m 0 0 c -0.229364 -0.85601 2.25097 -2.47525 2.25097 -0.0584 v 5.75895"];
      break;
  }
};

NakaneTsuu = function() { NakaneChar.call(this, "NakaneTsuu", "つう", "USWL2NE17", "SWL", "NE", "black", false, p(0.4, 1.6)); };
NakaneTsuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["つー"] = NakaneTsuu;
NakaneChar.dict["つう"] = NakaneTsuu;

NakaneTsuu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SW":
      this.dp = p(14.8009, -5.56544);
      this.paths = ["m 0 0 c -2.16624 -0.580442 -3.16627 4.80923 1.61164 2.0507 l 13.1893 -7.61614"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  
  this.dp = p(14.801, -5.56544);
  this.paths = ["m 0 0 c -0.7807 1.55675 -0.329385 3.17154 1.61164 2.0507 l 13.1893 -7.61614"];
};

NakaneTeu = function() { NakaneChar.call(this, "NakaneTeu", "てう", "UNR2S17", "NER", "S", "black", false, p(0.0, -7.2)); };
NakaneTeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["てう"] = NakaneTeu;
NakaneChar.dict["ちょう"] = NakaneTeu;
NakaneChar.dict["ちょー"] = NakaneTeu;

NakaneTeu.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(2.25096, 15.6776);
      this.paths = ["m 0 0 c -0.22937 -0.85601 2.25452 -2.47525 2.25096 -0.0584 l 0 15.736"];
      break;
  }
};


NakaneTou = function() { NakaneChar.call(this, "NakaneTou", "とう", "UNWR2SE17", "NWR", "SE", "black", false, p(0.4, -1.9)); };
NakaneTou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["とう"] = NakaneTou;
NakaneChar.dict["とー"] = NakaneTou;
NakaneChar.dict["とお"] = NakaneTou;

NakaneTou.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(15.2987, 6.15951);
      this.paths = ["m 0 0 c -1.03972 -1.7483 0.0789 -2.78181 1.2893 -2.0707 l 14.0094 8.23021"];
      break;
  }
};


GreggTen = function() { GreggChar.call(this, "GreggTen", "tn", "NER9", "NER", "NER", "black", false, p(0.0, 2.7)); };
GreggTen.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["tn"] = GreggTen;

GreggTen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(7.39164, -5.32084);
      this.paths = ["m 0 0 c 0 -2.6277 4.99909 -5.32084 7.39164 -5.32084"];
      break;
  }
};

GreggTm = function() { GreggChar.call(this, "GreggTm", "tm", "NER17", "NER", "NER", "black", false, p(0.2, 4.3)); };
GreggTm.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["tm"] = GreggTm;

GreggTm.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(14.7224, -8.5);
      this.paths = ["m 0 0 c -2.04411 -3.54051 11.6218 -9.24816 14.7224 -8.5"];
      break;
  }
};

GreggNt = function() { GreggChar.call(this, "GreggNt", "nt", "NEL10", "NEL", "NEL", "black", false, p(0.0, 2.9)); };
GreggNt.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["nt"] = GreggNt;

GreggNt.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.19152, -5.73577);
      this.paths = ["m 0 0 c 3.13717 0 6.54403 -2.88223 8.19152 -5.73577"];
      break;
  }
};

GreggMt = function() { GreggChar.call(this, "GreggMt", "mt", "NEL15", "NEL", "NEL", "black", false, p(0.0, 4.2)); };
GreggMt.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["mt"] = GreggMt;

GreggMt.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(12.2873, -8.60365);
      this.paths = ["m 0 0 c 4.2672 1.14339 12.2873 -5.77168 12.2873 -8.60365"];
      break;
  }
};

GreggDf = function() { GreggChar.call(this, "GreggDf", "df", "UNER10", "NER", "SWR", "black", false, p(0.4, 3.0)); };
GreggDf.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["df"] = GreggDf;

GreggDf.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(6.28905, 0.75469);
      this.paths = ["m 0 0 c -2.44631 -1.41238 7.57213 -9.02184 10.4194 -6.16259 c 1.89499 1.90292 -1.73645 5.66827 -4.13039 6.91728"];
      break;
  }
};

GreggJnt = function() { GreggChar.call(this, "GreggJnt", "jnt", "USWL9", "SWL", "NEL", "black", false, p(4.1, -4.0)); };
GreggJnt.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["jnt"] = GreggJnt;

GreggJnt.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(5.48515, 1.41858);
      this.paths = ["m 0 0 c -4.84052 2.79467 -4.86817 6.02382 -2.69529 7.61302 c 2.76078 2.01917 9.10396 -2.7478 8.18044 -6.19444"];
      break;
  }
};

GreggPeriod = function() { GreggChar.call(this, "GreggPeriod", "period", "SE3", "SE", "SE", "black", false, p(0.0, 0.0)); };
GreggPeriod.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["."] = GreggPeriod;

GreggPeriod.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.76777, 1.76777);
      this.paths = ["m 0 0 l 1.76777 1.76777"];
      break;
  }
};

GreggParagraph = function() { GreggChar.call(this, "GreggParagraph", ">", "SE3SW3", "SE", "SW", "black", false, p(0.2, -1.5)); };
GreggParagraph.prototype = Object.create(GreggChar.prototype);
GreggChar.dict[">"] = GreggParagraph;

GreggParagraph.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.188166, 3.01068);
      this.paths = ["m 0 0 l 3.01068 1.44262 l -3.19884 1.56806"];
      break;
  }
};

GreggInterrogation = function() { GreggChar.call(this, "GreggInterrogation", "?", "SW3XSE2", "SW", "XSE", "black", false, p(2.7, -0.9)); };
GreggInterrogation.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["?"] = GreggInterrogation;

GreggInterrogation.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.56098, 1.63196);
      this.paths = ["m 0 0 l -2.65193 1.86145", "m -1.68295 -0.0255 l 1.12197 1.65746"];
      break;
  }
};

GreggDash = function() { GreggChar.call(this, "GreggDash", "=", "NE9/NE9", "NE", "NE", "black", false, p(0.0, 0.1)); };
GreggDash.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["="] = GreggDash;

GreggDash.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(8.81902, 0);
      this.paths = ["m 0 0 l 9.26999 -1.15249", "m 0.20043 0.95205 l 8.61859 -0.95205"];
      break;
  }
};

GreggHyphen = function() { GreggChar.call(this, "GreggHyphen", "-", "NE3/NE3", "NE", "NE", "black", false, p(0.0, 0.2)); };
GreggHyphen.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["-"] = GreggHyphen;

GreggHyphen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(3.62613, -0.50363);
      this.paths = ["m 0 0 l 2.86062 -0.90653", "m 0.50364 0.54392 l 3.12249 -1.04755"];
      break;
  }
};

GreggLparen = function() { GreggChar.call(this, "GreggLparen", "{", "SWL14XE4", "SWL", "E", "black", false, p(9.6, -6.0)); };
GreggLparen.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["{"] = GreggLparen;

GreggLparen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-5.05572 + 1, 7.7858);
      this.paths = ["m 0 0 c -4.3274 2.49843 -11.5186 9.32289 -6.82522 12.0326", "m -9.55531 8.08915 l 4.49959 -0.30335"];
      break;
  }
};

GreggRparen = function() { GreggChar.call(this, "GreggRparen", "}", "SWR14XE4", "SWR", "E", "black", false, p(7.7, -5.9)); };
GreggRparen.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["}"] = GreggRparen;

GreggRparen.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(1.01114 + 1, 7.28024);
      this.paths = ["m 0 0 c 4.36948 1.1708 -4.489 11.2391 -7.73525 11.7798", "m -4.09513 7.68469 l 5.10627 -0.40445"];
      break;
  }
};

GreggComma = function() { GreggChar.call(this, "GreggComma", ",", "SWR1", "SWR", "SWR", "black", false, p(0.8, 2)); };
GreggComma.prototype = Object.create(GreggChar.prototype);
GreggChar.dict[","] = GreggComma;

GreggComma.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {

    default:
      this.dp = p(-0.76722 + 1, 0.9386 + 1);
      this.paths = ["m 1 1 c -0.0503 0.0587 -0.62881 -0.49788 -0.0457 -0.69136 c 0.22191 -0.0736 0.18473 0.18808 0.18546 0.30789 c 0.003 0.53578 -0.69905 1.3394 -0.90698 1.32207"];
      break;
  }
};

GreggIng = function() { GreggChar.call(this, "GreggIng", "ing", "P", "P", "P", "black", true, p(0.0, 0.0)); };
GreggIng.prototype = Object.create(GreggChar.prototype);
GreggChar.dict["ing"] = GreggIng;

GreggIng.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {

    default:
      this.dp = p(0, 2.1);
      break;
  }

  if (this.getNextHeadType() == "") {
    this.paths = ["m 0 2 v 0.1"];
  }
};

ShugiinIh = function() { ShugiinChar.call(this, "ShugiinIh", "いー", "C3", "C", "C", "black", false, p(3.0, -0.0)); };
ShugiinIh.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["いー"] = ShugiinIh;

ShugiinIh.prototype.setPaths = function() {
  switch (this.getNextName()) {
    case "ShugiinKakar":
      this.dp = p(1, 1);
      this.paths = ["m 0 0 c -0.82843 0 -1.5 -0.67157 -1.5 -1.5 c 0 -0.82843 0.67157 -1.5 1.5 -1.5 c 0.82843 0 1.5 0.67157 1.5 1.5 c 0 0.82843 -0.67157 1.5 -1.5 1.5"];
      return;
  }

  switch (this.getNextHeadType()) {
    default:
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c -0.82843 0 -1.5 -0.67157 -1.5 -1.5 c 0 -0.82843 0.67157 -1.5 1.5 -1.5 c 0.82843 0 1.5 0.67157 1.5 1.5 c 0 0.82843 -0.67157 1.5 -1.5 1.5"];
      break;
  }
};



ShugiinIi = function() { ShugiinChar.call(this, "ShugiinIi", "いい", "CL1CL1", "CL", "CL", "black", false, p(0.8, 0.6)); };
ShugiinIi.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["いい"] = ShugiinIi;

ShugiinIi.prototype.setPaths = function() {
  switch (this.getPrevName()) {
    case "ShugiinWa":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0.21319 -0.20053 0.19568 -1.02878 -0.17234 -1.17074 c -0.40085 -0.15461 -0.6242 0.14512 -0.67216 0.37782 c -0.0653 0.3169 0.22867 0.51713 0.47264 0.65835 c 0.33947 0.19651 0.8281 0.2127 1.1763 0.0321 c 0.21477 -0.1114 0.29865 -0.23486 0.30059 -0.40223 c 0.003 -0.22998 -0.0516 -0.54147 -0.4001 -0.56214 c -0.42279 -0.0251 -0.49382 0.54875 -0.70493 1.06684"];
      return;
  }

  switch (this.getPrevTailType()) {
    case "S":
    case "SER":
      this.dp = p(-0.012314, -0.22177);
      this.paths = ["m 0 0 c 0 0.42629 0.395684 0.50492 0.723982 0.29156 c 0.283966 -0.18454 0.127363 -0.64928 -0.07307 -0.80607 c -0.558213 -0.43666 -1.31438 -0.19641 -1.50946 0.10366 c -0.195087 0.30007 -0.160316 0.69394 0.08626 0.79654 c 0.299421 0.12459 0.559185 -0.17772 0.759978 -0.60746"];
      break;

    default:
      this.dp = p(0.220836, 0.0231);
      this.paths = ["m 0 0 c -0.0041 -0.56454 0.176797 -0.98718 -0.172338 -1.17074 c -0.210551 -0.1107 -0.574163 0.0862 -0.640546 0.3146 c -0.07867 0.2707 0.197061 0.58035 0.441026 0.72157 c 0.339472 0.19651 0.828102 0.2127 1.1763 0.0321 c 0.214774 -0.1114 0.43254 -0.36454 0.401745 -0.60452 c -0.02815 -0.2194 -0.279202 -0.4909 -0.494932 -0.44203 c -0.41306 0.0936 -0.42814 0.62504 -0.490415 1.17212"];
      break;
  }
};

NakaneNau = function() { NakaneChar.call(this, "NakaneNau", "なう", "HEL7", "SWL", "EL", "black", false, p(1.9, -1.5)); };
NakaneNau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["なう"] = NakaneNau;
NakaneChar.dict["なあ"] = NakaneNau;
NakaneChar.dict["なー"] = NakaneNau;
NakaneChar.dict["にゃー"] = NakaneNau;

NakaneNau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.52111, 1.25797);
  this.paths = ["m 0 0 c -1.14435 -0.13871 -2.74587 1.62051 -1.29292 2.481 c 1.98555 1.1759 5.7632 -0.27349 6.81403 -1.22303"];
};

NakaneNiu = function() { NakaneChar.call(this, "NakaneNiu", "にう", "HEL7", "SWL", "EL", "black", true, p(1.9, -1.5)); };
NakaneNiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["にう"] = NakaneNiu;
NakaneChar.dict["にゅう"] = NakaneNiu;
NakaneChar.dict["にゅー"] = NakaneNiu;
NakaneNiu.prototype.setPaths = NakaneNau.prototype.setPaths;

NakaneNuu = function() { NakaneChar.call(this, "NakaneNuu", "ぬう", "HEL17", "SWL", "HEL", "black", false, p(1.5, -1.6)); };
NakaneNuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ぬう"] = NakaneNuu;
NakaneChar.dict["ぬー"] = NakaneNuu;

NakaneNuu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(15.3088, 1.30726);
  this.paths = ["m 0 0 c -2.66945 1.16498 -1.79435 2.97213 -0.0084 3.57213 c 5.03403 1.69123 11.3577 0.14303 15.3172 -2.26487"];
};

NakaneNuu.prototype.setPathsExtra = function() {
  this.pathsExtra  = ["m5.7815142,1.0540401  v 0.1"];
};

NakaneNeu = function() { NakaneChar.call(this, "NakaneNeu", "ねう", "HEL17", "SWL", "HEL", "black", true, p(1.5, -1.6)); };
NakaneNeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ねう"] = NakaneNeu;
NakaneChar.dict["にょう"] = NakaneNeu;
NakaneChar.dict["にょー"] = NakaneNeu;
NakaneNeu.prototype.setPaths = NakaneNuu.prototype.setPaths;

NakaneNou = function() { NakaneChar.call(this, "NakaneNou", "のう", "HEL17", "SWL", "HEL", "black", false, p(1.5, -1.6)); };
NakaneNou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["のう"] = NakaneNou;
NakaneChar.dict["のお"] = NakaneNou;
NakaneChar.dict["のー"] = NakaneNou;
NakaneNou.prototype.setPaths = NakaneNuu.prototype.setPaths;

SvsdAku = function() { SvsdChar.call(this, "SvsdAku", "あく", "NE10CL4", "NE", "CL", "black", false, p(0.0, 3.8)); };
SvsdAku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["あく"] = SvsdAku;

SvsdAku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.44838, -3.13523);
  this.paths = ["m 0 0 l 7.98774 -4.54366 c 0.848967 -0.482917 1.24621 -1.7047 0.41486 -2.67464 c -0.354328 -0.413398 -1.19087 -0.341461 -1.63323 -0.02402 c -1.16839 0.838454 -1.32099 4.10709 -1.32099 4.10709"];
};

SvsdIku = function() { SvsdChar.call(this, "SvsdIku", "いく", "SW10CR4", "SW", "CR", "black", false, p(6.5, -4.1)); };
SvsdIku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["いく"] = SvsdIku;

SvsdIku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.7447, 4.74768);
  this.paths = ["m 0 0 l -4.37395 7.56591 c -0.713947 1.23496 -0.967199 1.08174 -1.51729 0.882444 c -0.748382 -0.271131 -1.15159 -1.5222 -0.816264 -2.2441 c 0.592879 -1.27636 3.17579 -1.50494 3.96281 -1.45657"];
};

SvsdUku = function() { SvsdChar.call(this, "SvsdUku", "うく", "SE10CL4", "SE", "CL", "black", false, p(0.0, -2.6)); };
SvsdUku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["うく"] = SvsdUku;

SvsdUku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.65852, 3.30026);
  this.paths = ["m 0 0 l 8.80787 5.13708 c 0.48895 0.285174 1.34425 0.07787 1.65082 -0.397961 c 0.37594 -0.583489 0.17165 -1.64043 -0.39234 -2.04503 c -1.20509 -0.864501 -2.68672 -0.785417 -4.40783 0.60617"];
};

SvsdEki = function() { SvsdChar.call(this, "SvsdEki", "えき", "S10CR4", "S", "CR", "black", false, p(2.8, -4.9)); };
SvsdEki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["えき"] = SvsdEki;

SvsdEki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 5.32736);
  this.paths = ["m 0 0 v 8.35761 c 0 1.02644 0.004 1.27522 -0.47419 1.43953 c -0.88331 0.303805 -2.29615 -0.906813 -2.32845 -1.55923 c -0.0665 -1.3427 1.69235 -2.61306 2.80264 -2.91056"];
};

SvsdOku = function() { SvsdChar.call(this, "SvsdOku", "おく", "E10CL4", "E", "CL", "black", false, p(0.0, 1.3)); };
SvsdOku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["おく"] = SvsdOku;

SvsdOku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.73856, 0);
  this.paths = ["m 0 0 h 9.36118 c 0.29823 0 0.7635 -0.293335 0.84579 -0.636433 c 0.17167 -0.715717 -0.25461 -1.81103 -0.97013 -1.98352 c -1.4163 -0.341414 -2.96057 1.68861 -3.49828 2.61995"];
};

SvsdKaku = function() { SvsdChar.call(this, "SvsdKaku", "かく", "NEL10CL4", "NEL", "CL", "black", false, p(0.0, 3.8)); };
SvsdKaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["かく"] = SvsdKaku;

SvsdKaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.31873, -2.77214);
  this.paths = ["m 0 0 c 3.27118 0 6.18114 -2.21671 8.04046 -4.48854 c 0.641501 -0.783822 0.887327 -1.46803 0.562964 -2.12515 c -0.314524 -0.637188 -1.3635 -1.19378 -1.96778 -0.819907 c -1.32441 0.819423 -0.576795 3.69156 -0.316911 4.66146"];
};

SvsdKiku = function() { SvsdChar.call(this, "SvsdKiku", "きく", "SWL10CL4", "SWL", "CL", "black", false, p(5.0, -4.6)); };
SvsdKiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きく"] = SvsdKiku;

SvsdKiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-4.43232, 4.75243);
  this.paths = ["m 0 0 c -1.81741 1.04928 -5.45548 4.66288 -4.99867 7.43644 c 0.119503 0.725562 0.401708 1.56797 1.05883 1.77293 c 0.585583 0.182647 1.44885 -0.192921 1.67443 -0.763342 c 0.532044 -1.34537 -1.0555 -3.3958 -2.16691 -3.6936"];
};

SvsdKuku = function() { SvsdChar.call(this, "SvsdKuku", "くく", "SEL10CL4", "SEL", "CL", "black", false, p(0.0, -2.5)); };
SvsdKuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["くく"] = SvsdKuku;

SvsdKuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.2476, 4.74307);
  this.paths = ["m 0 0 c 0.52036 2.17606 2.98485 4.08038 5.24764 4.74307 c 1.17821 0.345052 2.84977 0.339923 3.63298 -0.605499 c 0.48834 -0.589467 0.64403 -1.97393 -0.0505 -2.29584 c -1.39417 -0.646244 -3.07902 1.96432 -3.58252 2.90134"];
};

SvsdKeki = function() { SvsdChar.call(this, "SvsdKeki", "けき", "SL10CL4", "SL", "CL", "black", false, p(2.2, -4.9)); };
SvsdKeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["けき"] = SvsdKeki;

SvsdKeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.21462, 6.80601);
  this.paths = ["m 0 0 c -0.87814 0.878133 -2.87124 5.33426 -2.01512 7.92053 c 0.3022 0.912916 1.27747 1.80541 2.23901 1.8192 c 0.55227 0.0079 1.36495 -0.457464 1.31542 -1.00756 c -0.12609 -1.40076 -2.06116 -1.92616 -3.75393 -1.92616"];
};

SvsdKoku = function() { SvsdChar.call(this, "SvsdKoku", "こく", "EL10CL4", "EL", "CL", "black", false, p(0.0, 0.2)); };
SvsdKoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["こく"] = SvsdKoku;

SvsdKoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.90002, 1.75993);
  this.paths = ["m 0 0 c 1.85508 1.85507 4.54438 2.05161 6.90004 1.75993 c 1.1454 -0.141825 2.46293 -0.651554 3.04496 -1.64819 c 0.2677 -0.458408 0.24941 -1.13968 -0.028 -1.59231 c -0.259 -0.422677 -0.8451 -0.862212 -1.31296 -0.698384 c -1.35018 0.472784 -1.70402 3.09899 -1.70402 3.93889"];
};

NakaneHau = function() { NakaneChar.call(this, "NakaneHau", "はう", "HSR7", "HSR", "SR", "black", false, p(0.2, -2.0)); };
NakaneHau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["はう"] = NakaneHau;
NakaneChar.dict["はあ"] = NakaneHau;
NakaneChar.dict["はー"] = NakaneHau;
NakaneChar.dict["ひゃあ"] = NakaneHau;
NakaneChar.dict["ひゃー"] = NakaneHau;

NakaneHau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.195286, 5.56152);
  this.paths = ["m 0 0 c 0 -0.93297 0.593288 -1.58723 1.22043 -1.4726 c 0.742826 0.13578 0.766698 1.38837 0.735062 2.14283 c -0.07462 1.77953 -1.27029 4.38294 -2.15077 4.89129"];
};

NakaneHiu = function() { NakaneChar.call(this, "NakaneHiu", "ひう", "HSL7", "HSL", "SL", "black", false, p(1.9, -2.6)); };
NakaneHiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ひう"] = NakaneHiu;
NakaneChar.dict["ひゅう"] = NakaneHiu;
NakaneChar.dict["ひゅー"] = NakaneHiu;

NakaneHiu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.695174, 6.10452);
  this.paths = ["m 0 0 c 0 -0.59626 -0.414786 -0.86825 -0.804485 -0.85005 c -0.51575 0.0241 -0.832202 0.71791 -0.955177 1.21937 c -0.46311 1.88843 0.130201 4.80091 1.06449 5.7352"];
};

NakaneHuu = function() { NakaneChar.call(this, "NakaneHuu", "ふう", "HNE7", "HNE", "NE", "black", false, p(0.3, 0.1)); };
NakaneHuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ふう"] = NakaneHuu;
NakaneChar.dict["ふー"] = NakaneHuu;

NakaneHuu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.04579, -1.89148);
  this.paths = ["m 0 0 c -0.611551 0.66251 -0.290925 2.20169 1.16042 1.34609 c 1.68292 -0.99213 4.88537 -3.23757 4.88537 -3.23757"];
};


NakaneHeu = function() { NakaneChar.call(this, "NakaneHeu", "へう", "HSL17", "HSL", "SL", "black", false, p(4.5, -6.4)); };
NakaneHeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["へう"] = NakaneHeu;
NakaneChar.dict["ひょう"] = NakaneHeu;
NakaneChar.dict["ひょー"] = NakaneHeu;

NakaneHeu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.55557, 14.9075);
  this.paths = ["m 0 0 c 0 -1.61589 -0.68397 -2.0723 -1.54573 -2.07229 c -1.2042 2e-05 -1.82745 1.73842 -2.15988 2.89582 c -1.30029 4.52725 -1.07476 11.8592 1.15004 14.084"];
};


NakaneHou = function() { NakaneChar.call(this, "NakaneHou", "ほう", "HSR17", "HSR", "SR", "black", false, p(0.0, -6.9)); };
NakaneHou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ほう"] = NakaneHou;
NakaneChar.dict["ほお"] = NakaneHou;
NakaneChar.dict["ほー"] = NakaneHou;

NakaneHou.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0.8154, 15.4926);
  this.paths = ["m 0 0 c 0.32272 -1.20443 1.02515 -1.77925 1.82823 -1.63096 c 1.18931 0.21961 1.49351 2.02594 1.66633 3.22293 c 0.67429 4.67038 0.10724 11.1142 -2.67916 13.9006"];
};

WasedaRa = function() { WasedaChar.call(this, "WasedaRa", "ら", "SER8", "SER", "SER", "black", false, p(0.0, -3.5)); };
WasedaRa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ら"] = WasedaRa;

WasedaRa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "NER_":
      this.dp = p(4, 6.928);
      this.paths = ["m 0 0 c 1.9594 0 4 4.67 4 6.928"];
      return;
  }

  switch (tail_) {
    case "NER":
      this.dp = p(4, 6.9282);
      this.paths = ["m 0 0 c 1.48459 0 5.22323 4.8095 4 6.9282"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "S":
      this.dp = p(4, 6.9282);
      this.paths = ["m 0 0 c 2.858 2.0012 6.72302 6.9282 4 6.9282"];
      return;

    case "SEL":
      this.dp = p(4, 6.9283);
      this.paths = ["m 0 0 c 1.93551 1.3553 4 4.5784 4 6.9283"];
      return;
  }

  this.dp = p(4, 6.9282);
  this.paths = ["m 0 0 c 2.26387 1.5852 5.22323 4.8095 4 6.9282"];
};

WasedaRi = function() { WasedaChar.call(this, "WasedaRi", "り", "SER8CR1", "SER", "CR", "black", false, p(0.0, -3.2)); };
WasedaRi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["り"] = WasedaRi;

WasedaRi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NER":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 2.30893 0 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.49407 0.757566 -0.9294 0.1639 c 0.278193 -0.292477 0.569933 -0.569251 0.861524 -0.805337"];
      return;
  }

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(4.26922, 5.11406);
     this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 0.889266 -1.2735 0.177279 -1.14164 -0.31482 c 0.101743 -0.379711 0.678779 -0.326619 1.07376 -0.326619"];
     return;
  }

  switch (_headModel) {
    case "ER16":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.02362 0.757045 -1.12454 0.380395 c -0.126976 -0.47388 0.592677 -0.863164 1.05666 -1.02183"];
      return;

    case "ER4":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -0.813 0.847536 -1.01001 0.494924 c -0.239291 -0.428281 0.45231 -0.853557 0.942133 -1.13636"];
      return;

    case "NER16":
      this.dp = p(4.05635, 4.45241);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -0.916232 1.0211 -0.846498 0.351291 c 0.041798 -0.401481 0.247739 -0.780683 0.565744 -1.65438"];
      return;

    case "NEL8":
      this.dp = p(4.18661, 4.86344);
      this.paths = ["m 0 0 c 1.8842 1.3193 4.34324 3.76703 4.3209 5.734 c -0.01206 1.06203 -1.22739 0.487436 -1.38015 0.053127 c -0.17154 -0.487687 0.470986 -0.494167 1.24586 -0.923691"];
      return;

    case "EL4":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -0.788861 0.445342 -0.9294 0.1639 c -0.17562 -0.351695 -0.31574 -1.4313 0.861522 -0.805338"];
      return;

    case "SER8":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 0.578488 -0.503755 0.284314 -0.70966 0.121726 c -0.204337 -0.161349 -0.368526 -0.532355 -0.327092 -0.709292 c 0.073749 -0.314936 0.617545 -0.299879 0.968872 -0.053874"];
      return;

    case "NER8":
      this.dp = p(4.02333, 4.37523);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -0.920656 0.91403 -0.866136 0.32206 c 0.050819 -0.551787 0.427618 -1.35958 0.552366 -1.70233"];
      return;

    case "EL8":
     this.dp = p(4.3371, 5.7555);
     this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 0.629014 -0.820516 0.570684 -1.10833 0.493344 c -0.386346 -0.103816 -0.646391 -0.605999 -0.493315 -0.879859 c 0.190591 -0.340975 1.19462 0.25426 1.60165 0.386515"];
     return;

    case "ER8":
      this.dp = p(4.26922, 5.11406);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -0.965287 0.69525 -1.1623 0.342638 c -0.239291 -0.428281 0.610463 -0.79989 1.09442 -0.984078"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(3.9643, 4.24556);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.1744 0.945736 -0.9294 0.1639 c 0.1484 -0.473575 0.460045 -1.40855 0.556605 -1.67384"];
      return;

    case "E":
      this.dp = p(4.2446, 5.0477);
      this.paths = ["m 0 0 c 1.907 1.2863 4.3559 3.7332 4.3209 5.734 c 0 1.0622 -1.2807 0.2697 -1.3431 -0.1745 c -0.0722 -0.5135 0.6411 -0.5118 1.2668 -0.5118"];
      return;

    case "S":
      this.dp = p(3.73316, 6.5136);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 0.885535 -0.931169 0.86559 -1.25532 0.638283 c -0.1279 -0.089688 -0.317398 -0.298154 -0.198748 -0.74096 c 0.096731 -0.361007 0.819481 -0.679754 0.852956 0.036744 c 0.013262 0.283862 0.011014 0.354777 -0.00283 0.824037"];
      return;

    case "SE":
      this.dp = p(4.07614, 6.31625);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 0.758139 -1.03917 1.01813 -1.60641 0.573867 c -0.276052 -0.216203 -0.447014 -0.88659 -0.187888 -1.12282 c 0.388404 -0.354078 1.09531 0.67168 1.53333 1.1097"];
      return;

    case "SEL":
      this.dp = p(3.94177, 6.46258);
      this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.38576 0.935309 -1.44165 0.220075 c -0.021318 -0.272797 0.381221 -0.619342 0.656594 -0.546686 c 0.356053 0.093944 0.38973 0.600767 0.38973 1.03369"];
      return;
  }

  this.dp = p(4.26922, 5.11406);
  this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.49407 0.757566 -0.9294 0.1639 c 0.278193 -0.292477 0.569933 -0.569251 0.861524 -0.805337"];
};

WasedaRu = function() { WasedaChar.call(this, "WasedaRu", "る", "SER8CR4", "SER", "SERCR4", "black", false, p(0.0, -3.0)); };
WasedaRu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["る"] = WasedaRu;

WasedaRu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SE":
      this.dp = p(4.38361, 2.86696);
      this.paths = ["m 0 0 c 3.33417 0 5.735 3.9833 4.5184 5.5797 c -0.9554 1.2536 -2.1538 0.6153 -1.8184 -0.5999 c 0.2473 -0.8959 1.28011 -1.66464 1.68361 -2.11284"];
      return;

    case "NER":
      this.dp = p(3.69453, 3.27192);
      this.paths = ["m 0 0 c 2.17128 0 5.31743 4.52484 3.70052 6.37486 c -0.409997 0.469106 -2.06292 0.501706 -1.72752 -0.713494 c 0.2473 -0.8959 1.31803 -1.94124 1.72153 -2.38944"];
      return;
  }

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
      this.dp = p(3.19196, 0.397082);
      this.paths = ["m 0 0 c 1.97931 0 8.87478 1.21251 7.25787 3.06253 c -0.409997 0.469106 -0.90888 0.110789 -1.85151 -0.630835 c -0.70052 -0.551144 -1.64734 -1.60461 -2.21441 -2.03462"];
      return;
  }

  switch (_headModel) {
    case "ER4":
      this.dp = p(3.37842, 3.24328);
      this.paths = ["m 0 0 c 1.907 1.2863 5.4379 4.63748 3.70052 6.37486 c -1.01508 1.01508 -2.22967 0.424744 -2.20866 -0.757836 c 0.010396 -0.58508 0.688792 -1.68221 1.88656 -2.37374"];
      return;

    case "ER8":
      this.dp = p(3.58729, 3.76872);
      this.paths = ["m 0 0 c 1.907 1.2863 5.34852 4.55248 3.70052 6.37486 c -0.466277 0.515614 -2.23494 0.354268 -1.89954 -0.860932 c 0.2473 -0.8959 1.2716 -1.44804 1.7863 -1.7452"];
      return;

    case "NEL8":
      this.dp = p(3.29696, 2.96582);
      this.paths = ["m 0 0 c 1.9001 1.2816 4.5082 3.6458 4.4038 5.6367 c 0 0.669928 -0.47239 0.692173 -0.826277 0.66995 c -1.08874 -0.06837 -2.45349 -1.28859 -2.26425 -2.36293 c 0.127887 -0.726031 0.809102 -0.326806 1.98368 -0.977897"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(3.60834, 3.55462);
      this.paths = ["m 0 0 c 1.907 1.2863 5.67334 4.9103 3.70052 6.37486 c -0.936631 0.695323 -2.79171 -1.46294 -2.38861 -2.5576 c 0.266244 -0.723003 1.61509 -0.739728 2.29643 -0.262642"];
      return;

    case "NER8":
      this.dp = p(3.13979, 2.93314);
      this.paths = ["m 0 0 c 1.907 1.2863 5.41833 4.69157 3.82555 6.5624 c -0.671437 0.788643 -1.49348 0.601862 -1.60154 -0.502793 c -0.085029 -0.869232 0.68281 -2.48637 0.915781 -3.12646"];
      return;

    case "EL8":
      this.dp = p(3.87318, 4.16129);
      this.paths = ["m 0 0 c 1.907 1.2863 5.31743 4.52484 3.70052 6.37486 c -0.845457 0.967346 -2.79919 -1.17508 -2.41253 -2.19003 c 0.306796 -0.805306 1.62753 -0.334717 2.58519 -0.023542"];
      return;

    case "ER16":
      this.dp = p(3.83684, 4.07871);
      this.paths = ["m 0 0 c 1.907 1.2863 5.31743 4.52484 3.70052 6.37486 c -0.612157 0.700411 -1.96689 0.065646 -2.08768 -0.653468 c -0.152663 -0.908894 1.54404 -1.42174 2.224 -1.64268"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(3.06667, 2.4472);
      this.paths = ["m 0 0 c 1.907 1.2863 5.49441 3.97639 4.37183 5.92076 c -0.364356 0.631082 -0.798349 -0.064161 -0.981506 -0.454103 c -0.359308 -0.764966 -0.4709 -2.46992 -0.323653 -3.01946"];
      return;

    case "S":
      this.dp = p(2.74705, 1.93815);
      this.paths = ["m 0 0 c 1.907 1.2863 5.08783 3.1232 4.5758 5.43558 c -0.048904 0.220856 -0.369003 0.391596 -0.607193 0.36058 c -0.037157 -0.00484 -0.072321 -0.014587 -0.10415 -0.02982 c -1.129 -0.540336 -1.11741 -2.56457 -1.11741 -3.82819"];
      return;

    case "SE":
      this.dp = p(3.65787, 3.72405);
      this.paths = ["m 0 0 c 1.907 1.2863 5.31798 4.52532 3.70052 6.37486 c -0.862141 0.985843 -4.34105 -2.04338 -3.5361 -3.49095 c 0.582058 -1.04673 2.6115 -0.041788 3.49344 0.840145"];
      return;

    case "E":
      this.dp = p(3.91611, 4.26581);
      this.paths = ["m 0 0 c 1.907 1.2863 5.31743 4.52484 3.70052 6.37486 c -0.638946 0.731063 -2.64682 -0.179509 -2.31142 -1.39471 c 0.2473 -0.8959 1.83149 -0.714344 2.52701 -0.714344"];
      return;
  }

  this.dp = p(3.53446, 3.51231);
  this.paths = ["m 0 0 c 1.907 1.2863 5.31743 4.52484 3.70052 6.37486 c -0.409997 0.469106 -2.06292 0.501706 -1.72752 -0.713494 c 0.2473 -0.8959 1.15796 -1.70086 1.56146 -2.14906"];
};

WasedaRe = function() { WasedaChar.call(this, "WasedaRe", "れ", "SER16CR1", "SER", "SERCR", "black", false, p(0.0, -6.2)); };
WasedaRe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["れ"] = WasedaRe;

WasedaRe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_headModel) {
    case "NEL8":
      this.dp = p(8.8464, 11.1265);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.24593 -1.94302 0.348467 -1.2989 -0.0462 c 0.332516 -0.20374 0.829906 -0.372078 1.2436 -0.640301"];
      return;

    case "EL8":
      this.dp = p(8.89398, 11.496);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -1.30431 0.226241 -1.06273 -0.449185 c 0.119361 -0.333718 0.588256 -0.09545 1.05501 0.132213"];
      return;

    case "EL4":
      this.dp = p(8.8464, 11.1265);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -0.759845 0.429188 -0.9006 0.1588 c -0.183997 -0.353455 -0.331962 -1.47127 0.8453 -0.8453"];
      return;

    case "ER8":
      this.dp = p(8.8464, 11.1265);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -0.957802 0.515937 -1.11044 0.173789 c -0.18489 -0.41443 0.78744 -0.752128 1.05514 -0.860289"];
      return;

    case "EL16":
      this.dp = p(8.8464, 11.1265);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -0.759845 0.42919 -0.9006 0.1588 c -0.183997 -0.35345 -0.510431 -1.15822 0.8453 -0.8453"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(9.05159, 11.0727);
      this.paths = ["m 0 0 c 3.8463 2.045 9.1956 8.082 9.0724 11.612 c 0 1.029 -1.3469 0.231 -1.3609 -0.169 c -0.0156 -0.447 0.832787 -0.37028 1.34009 -0.37028"];
      return;

    case "SEL":
      this.dp = p(8.6473, 12.255);
      this.paths = ["m 0 0 c 3.8464 2.045 8.9918 8.239 8.8686 11.769 c 0 0.539 -0.732392 0.92012 -1.0492 0.656 c -0.344879 -0.28753 0.04836 -1.2702 0.497 -1.252 c 0.376846 0.0153 0.3309 0.603 0.3309 1.082"];
      return;

    case "NE":
      this.dp = p(8.8464, 11.1265);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -1.64861 0.627936 -1.08877 0.06471 c 0.274919 -0.27658 0.69433 -0.547394 1.03347 -0.751214"];
      return;

    case "SW":
      this.dp = p(8.65035, 10.2243);
      this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -0.787121 1.02596 -0.787285 0.414486 c -0.000183 -0.680297 0.399557 -1.63946 0.535931 -2.00321"];
      return;
  }

  this.dp = p(8.8464, 11.1265);
  this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -1.46044 0.722022 -0.9006 0.1588 c 0.274919 -0.27658 0.558253 -0.56182 0.8453 -0.8453"];
};

WasedaRo = function() { WasedaChar.call(this, "WasedaRo", "ろ", "SER16", "SER", "SER", "black", false, p(0.0, -6.9)); };
WasedaRo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ろ"] = WasedaRo;

WasedaRo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaAi":
      this.dp = p(8.77778, 13.8564);
      this.paths = ["m 0 0 c 4.6323 2.6745 8.77778 10.711 8.77778 13.8564"];
      return;
  }

  //switch (_model) {}

  switch (_head) {
    case "S":
      this.dp = p(8, 13.856);
      this.paths = ["m 0 0 c 6.564 3.79 11.0816 13.856 8 13.856"];
      return;

    case "SW":
     this.dp = p(8, 13.8564);
     this.paths = ["m 0 0 c 4.6323 2.6745 10.0981 10.2225 8 13.8564"];
     return;
  }

  this.dp = p(8, 13.8564);
  this.paths = ["m 0 0 c 4.6323 2.6745 11.0125 11.3286 8 13.8564"];
};



ShugiinIn = function() { ShugiinChar.call(this, "ShugiinIn", "いん", "CL1NE1F", "CL", "NEF", "black", false, p(0.9, 1.0)); };
ShugiinIn.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["いん"] = ShugiinIn;

ShugiinIn.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "ShugiinSa":
      this.dp = p(4.28017, -2.45728);
      this.paths = ["m 0 0 c -0.22063 0.26848 -0.42685 0.32018 -0.65424 0.26145 c -0.13946 -0.036 -0.29349 -0.19201 -0.27341 -0.33465 c 0.10313 -0.73279 1.12937 -0.97971 1.82459 -1.26471 l 1.47452 -0.60445"];
      return;

    case "ShugiinNa":
      this.dp = p(2.36343, -2.25641);
      this.paths = ["m 0 0 c 0.21324 -0.124051 0.014 -0.542111 -0.18359 -0.650065 c -0.21231 -0.115995 -0.56209 0.0088 -0.69434 0.211376 c -0.10126 0.155111 -0.0734 0.429484 0.0658 0.551804 c 0.14451 0.127071 0.47996 0.09112 0.57727 -0.0056 c 0.53141 -0.52812 0.69375 -0.685406 1.1356 -1.12725"];
      return;
    case "ShugiinMa":
      this.dp = p(1.81119, -2.67983);
      this.paths = ["m 0 0 c 0.125681 0.183726 0.025345 0.400143 -0.113327 0.500038 c -0.183831 0.132426 -0.561153 0.127657 -0.676331 -0.067443 c -0.170061 -0.288067 -0.033385 -0.502268 0.39525 -0.922446 l 0.791384 -0.77577"];
      return;

    case "ShugiinYa":
      this.dp = p(2.51819, -2.45682);
      this.paths = ["m 0 0 c 0.373056 0.0484 0.455228 0.27031 0.458372 0.49522 c 0.0032 0.23005 -0.227138 0.48426 -0.454503 0.51945 c -0.168016 0.026 -0.393871 -0.0997 -0.436199 -0.26435 c -0.07186 -0.27957 0.236936 -0.56579 0.43233 -0.75032 l 1.10399 -1.04261"];
      return;

    case "ShugiinRa":
      this.dp = p(2.18792, -3.37797);
      this.paths = ["m 0 0 c -0.014182 0.357419 -0.241804 0.499413 -0.47001 0.497811 c -0.193422 -0.00136 -0.377326 -0.234645 -0.392408 -0.427483 c -0.037349 -0.477525 0.795324 -1.19678 0.795324 -1.19678 l 0.840807 -0.837305", "m 2.18792 -3.37797 v 0"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "E":
      this.dp = p(1.16913 + 1.41, -1.12965 - 1.41);
      this.paths = ["m 0 0 c 0.20183 0 0.276983 -0.509276 0.13948 -0.70573 c -0.124329 -0.177634 -0.457659 -0.212941 -0.642733 -0.099985 c -0.212248 0.129543 -0.37702 0.503863 -0.235017 0.707985 c 0.160977 0.231395 0.747823 0.125973 0.845136 0.029293 c 0 0 0.620414 -0.619371 1.06226 -1.06122"];
      return;
  }

  this.paths = ["m 0 0 c 0.06358 -0.237297 -0.116235 -0.651495 -0.376707 -0.69977 c -0.241821 -0.04482 -0.518981 0.238572 -0.55932 0.48118 c -0.03043 0.183033 0.112614 0.403848 0.281796 0.480037 c 0.150915 0.06796 0.389937 0.0011 0.48725 -0.09558 c 0.531415 -0.52812 0.693753 -0.685406 1.1356 -1.12725"];

  switch (_name) {
    case "ShugiinWa":
      this.dp = p(2.3863 + 2, -1);
      return;

    case "ShugiinMade":
      this.dp = p(0.4, -0.4);
      return;
  }

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.3863, -2.37907);
};


ShugiinIin = function() { ShugiinChar.call(this, "ShugiinIin", "いいん", "CL3NE3F", "CL", "NEF", "black", false, p(3.0, -0.5)); };
ShugiinIin.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["いいん"] = ShugiinIin;

ShugiinIin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "E":
      this.dp = p(2.04269, -2.2008);
      this.paths = ["m 0 0 c 0.185 -0.5569 0.272 -1.9642 -0.1634 -2.4682 c -0.4361 -0.5048 -1.2592 -0.7265 -1.9766 -0.3123 c -0.7175 0.4143 -0.9633 1.4686 -0.5491 2.186 c 0.4143 0.7174 1.861 0.7587 2.7154 0.278 l 2.01639 -1.88431"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3.12866, -3.12867);
  this.paths = ["m 0 0 c 0.03453 -0.585789 0.01293 -1.55027 -0.53813 -1.92444 c -0.551849 -0.37471 -1.40428 -0.37578 -1.99007 0.21 c -0.585789 0.585793 -0.585789 1.53554 0 2.12132 c 0.585789 0.585785 1.42812 0.693195 2.12132 0 l 2.12132 -2.12132"];
};


SvsdSaku = function() { SvsdChar.call(this, "SvsdSaku", "さく", "NEL5CL4", "NEL", "CL", "black", false, p(0.0, 2.2)); };
SvsdSaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["さく"] = SvsdSaku;

SvsdSaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.4894, -0.5073);
  this.paths = ["m 0 0 c 1.12351 0.30105 2.29201 -0.27997 3.14533 -0.96955 c 0.458932 -0.37087 0.85221 -0.95458 0.864874 -1.54449 c 0.01593 -0.74193 -0.271883 -2.11244 -1.00336 -1.98737 c -1.32329 0.22627 -1.13039 2.93246 -0.517446 3.99411"];
};

SvsdShiku = function() { SvsdChar.call(this, "SvsdShiku", "しく", "SWL5CL4", "SWL", "CL", "black", false, p(2.5, -2.4)); };
SvsdShiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しく"] = SvsdShiku;

SvsdShiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.35881, 1.51275);
  this.paths = ["m 0 0 c -0.850954 0.77861 -2.13203 2.03922 -2.4429 3.20959 c -0.09813 0.36946 -0.07647 0.85571 0.188538 1.13122 c 0.322548 0.33534 1.02919 0.60287 1.36689 0.28281 c 0.761231 -0.72145 0.566243 -2.07328 -0.471344 -3.11087"];
};

SvsdSuku = function() { SvsdChar.call(this, "SvsdSuku", "すく", "SEL5CL4", "SEL", "CL", "black", false, p(0.0, -1.1)); };
SvsdSuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["すく"] = SvsdSuku;

SvsdSuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.18652, 1.46314);
  this.paths = ["m 0 0 c 0.64103 1.19599 1.84277 2.26722 3.11107 2.35905 c 0.73364 0.0531 1.59144 -0.56342 1.80688 -1.26672 c 0.11118 -0.36294 -0.0566 -0.91623 -0.40634 -1.0638 c -1.11216 -0.46931 -2.38785 0.49737 -3.32509 1.43461"];
};

SvsdSeki = function() { SvsdChar.call(this, "SvsdSeki", "せき", "SL5CL4", "SL", "CL", "black", false, p(1.3, -2.6)); };
SvsdSeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["せき"] = SvsdSeki;

SvsdSeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.2209, 2.14982);
  this.paths = ["m 0 0 c -0.87814 0.87813 -1.52537 2.32282 -1.27688 3.5582 c 0.13957 0.69387 0.73025 1.4916 1.43412 1.56581 c 0.584 0.0616 1.43836 -0.43524 1.43466 -1.02247 c -0.007 -1.14118 -2.35718 -1.95172 -2.8128 -1.95172"];
};

SvsdSoku = function() { SvsdChar.call(this, "SvsdSoku", "そく", "EL5CL4", "EL", "CL", "black", false, p(0.0, 0.4)); };
SvsdSoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["そく"] = SvsdSoku;

SvsdSoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.97139, 0.91846);
  this.paths = ["m 0 0 c 0.40054 0.40054 1.24726 0.88482 1.97144 0.91846 c 1.05973 0.0492 2.37292 -0.21294 2.99708 -1.07077 c 0.2218 -0.30483 0.23422 -0.8108 0.0343 -1.13043 c -0.16861 -0.26961 -0.56016 -0.46277 -0.87002 -0.39133 c -1.09636 0.25275 -1.95189 1.81059 -2.16141 2.59253"];
};

SvsdTaku = function() { SvsdChar.call(this, "SvsdTaku", "たく", "NE5CL4", "NE", "CL", "black", false, p(0.0, 2.1)); };
SvsdTaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["たく"] = SvsdTaku;

SvsdTaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.10506, -1.23819);
  this.paths = ["m 0 0 l 3.54834 -2.01335 c 1.13623 -0.64471 0.509654 -1.51336 0.0495 -1.99264 c -0.348968 -0.36347 -1.15351 -0.37865 -1.51144 -0.024 c -0.661067 0.65502 -0.59462 1.72957 0.01866 2.7918"];
};

SvsdChiku = function() { SvsdChar.call(this, "SvsdChiku", "ちく", "SW5CR4", "SW", "CR", "black", false, p(3.5, -2.2)); };
SvsdChiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちく"] = SvsdChiku;

SvsdChiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.962932, 1.76839);
  this.paths = ["m 0 0 l -0.414014 0.78358 l -1.30309 2.46627 c -0.288798 0.54658 -0.512632 1.26873 -1.23823 1.01021 c -0.694389 -0.24741 -0.707278 -1.45985 -0.318762 -2.01993 c 0.44815 -0.64606 1.65857 -0.51184 2.31117 -0.47174"];
};


SvsdTsuku = function() { SvsdChar.call(this, "SvsdTsuku", "つく", "SE5CL4", "SE", "CL", "black", false, p(0.0, -0.9)); };
SvsdTsuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["つく"] = SvsdTsuku;

SvsdTsuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.35055, 1.33717);
  this.paths = ["m 0 0 l 3.45257 1.97266 c 0.49147 0.28081 1.34578 0.0789 1.65082 -0.39796 c 0.34058 -0.53236 0.21568 -1.62018 -0.36917 -1.85966 c -0.88941 -0.3642 -1.91245 0.96181 -2.38367 1.62213"];
};

SvsdTeki = function() { SvsdChar.call(this, "SvsdTeki", "てき", "S5CR4", "S", "CR", "black", false, p(2.4, -2.5)); };
SvsdTeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["てき"] = SvsdTeki;

SvsdTeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 1.66945);
  this.paths = ["m 0 0 v 3.5287 c 0 1.02644 -0.004 1.25514 -0.47419 1.43953 c -0.68048 0.26676 -1.82876 -0.33619 -1.9186 -1.06155 c -0.1342 -1.08364 1.73613 -2.06128 2.39279 -2.23723"];
};

SvsdToku = function() { SvsdChar.call(this, "SvsdToku", "とく", "E5CL4", "E", "CL", "black", false, p(0.0, 1.1)); };
SvsdToku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["とく"] = SvsdToku;

SvsdToku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.9762, 0);
  this.paths = ["m 0 0 l 4.11588 0 c 0.29823 0 0.74445 -0.29848 0.84579 -0.63644 c 0.16027 -0.53448 -0.0216 -1.44175 -0.56305 -1.57643 c -1.06133 -0.26396 -2.13016 1.12212 -2.42242 2.21287"];
};

SvsdNaku = function() { SvsdChar.call(this, "SvsdNaku", "なく", "NER10CR4", "NER", "CR", "black", false, p(0.0, 3.1)); };
SvsdNaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["なく"] = SvsdNaku;

SvsdNaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.69017, -5.24388);
  this.paths = ["m 0 0 c 0.668442 -2.49466 4.8196 -6.55009 8.27294 -6.28614 c 0.451689 0.0345 0.895028 0.52683 0.944551 0.97712 c 0.06819 0.62004 -0.382538 1.40736 -0.977118 1.59596 c -1.22841 0.38965 -2.90591 -0.41487 -3.5502 -1.53082"];
};

SvsdNiku = function() { SvsdChar.call(this, "SvsdNiku", "にく", "SWR10CR4", "SWR", "CR", "black", false, p(4.6, -4.4)); };
SvsdNiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["にく"] = SvsdNiku;

SvsdNiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.080365, 5.61757);
  this.paths = ["m 0 0 c 1.0556 1.0556 0.568933 5.72819 -1.16641 7.37585 c -0.573169 0.54421 -1.65158 1.56807 -2.56017 1.27792 c -0.53851 -0.17197 -1.00399 -0.97042 -0.797546 -1.49668 c 0.572494 -1.45935 2.75084 -1.99313 4.44376 -1.53952"];
};

SvsdNuku = function() { SvsdChar.call(this, "SvsdNuku", "ぬく", "SER10CR4", "SER", "CR", "black", false, p(0.0, -2.2)); };
SvsdNuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぬく"] = SvsdNuku;

SvsdNuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(7.24824, 0.05294);
  this.paths = ["m 0 0 c 2.19084 -0.58703 6.83418 -0.92158 9.13961 1.09005 c 0.73391 0.64038 1.05578 1.8307 0.69875 2.68318 c -0.24508 0.58517 -1.07096 1.21165 -1.64905 0.9503 c -1.44713 -0.65423 -0.98442 -3.28024 -0.94107 -4.67059"];
};

SvsdNeki = function() { SvsdChar.call(this, "SvsdNeki", "ねき", "SR10CR4", "SR", "CR", "black", false, p(1.5, -5.0)); };
SvsdNeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ねき"] = SvsdNeki;

SvsdNeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.4643, 5.27244);
  this.paths = ["m 0 0 c 1.84879 1.0674 2.81932 4.6049 2.46429 7.07768 c -0.16348 1.13864 -0.89862 2.49616 -2.00582 2.80815 c -0.65912 0.18573 -1.76422 -0.12942 -1.8912 -0.80233 c -0.33691 -1.78542 3.10928 -3.66336 3.89703 -3.81106"];
};

SvsdNoku = function() { SvsdChar.call(this, "SvsdNoku", "のく", "ER10CR4", "ER", "CR", "black", false, p(0.0, 0.5)); };
SvsdNoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["のく"] = SvsdNoku;

SvsdNoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.23957, -1.85858);
  this.paths = ["m 0 0 c 1.86137 -1.07466 6.2333 -2.78046 9.04151 -1.56789 c 0.53674 0.23176 1.0326 0.88243 0.96687 1.46337 c -0.0582 0.51423 -0.60681 1.04494 -1.12366 1.07138 c -1.53531 0.0785 -3.07048 -2.25076 -3.64515 -2.82544"];
};

SvsdHaku = function() { SvsdChar.call(this, "SvsdHaku", "はく", "NEL20CL4", "NEL", "CL", "black", false, p(0.0, 6.1)); };
SvsdHaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["はく"] = SvsdHaku;

SvsdHaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(15.0996, -7.05464);
  this.paths = ["m 0 0 c 5.0755 0 11.8791 -3.64965 15.8876 -7.83716 c 0.717796 -0.74985 1.66967 -2.15436 1.22489 -3.20956 c -0.33108 -0.78545 -1.65039 -1.50694 -2.34683 -1.0155 c -1.36686 0.96452 -0.937647 3.1001 0.334011 5.00758"];
};

SvsdHiku = function() { SvsdChar.call(this, "SvsdHiku", "ひく", "SWL20CL4", "SWL", "CL", "black", false, p(11.0, -9.0)); };
SvsdHiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひく"] = SvsdHiku;

SvsdHiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-10.3615, 13.3426);
  this.paths = ["m 0 0 c -3.11245 1.79697 -9.55496 9.86919 -10.9196 14.9622 c -0.207048 0.77271 -0.206449 2.24911 0.567442 2.80922 c 0.651187 0.47131 2.03539 0.43404 2.39464 -0.28507 c 0.713652 -1.42853 -0.480105 -3.62825 -2.404 -4.14375"];
};

SvsdHuku = function() { SvsdChar.call(this, "SvsdHuku", "ふく", "SEL20CL4", "SEL", "CL", "black", false, p(0.0, -5.3)); };
SvsdHuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ふく"] = SvsdHuku;

SvsdHuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(14.4342, 10.4797);
  this.paths = ["m 0 0 c 1.23164 4.59654 8.60108 9.7523 14.4342 10.4797 c 1.59825 0.19929 3.78006 0.37964 4.74551 -0.90956 c 0.41278 -0.55119 0.42278 -1.75777 -0.19773 -2.05638 c -1.63081 -0.78479 -3.42115 1.00255 -4.54778 2.96594"];
};

SvsdHeki = function() { SvsdChar.call(this, "SvsdHeki", "へき", "UWL5CL4", "SWL", "CL", "black", false, p(2.3, -2.5)); };
SvsdHeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["へき"] = SvsdHeki;

SvsdHeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.27664, 3.11551);
  this.paths = ["m 0 0 c -1.02348 0.76912 -2.72857 2.56522 -2.24032 4.01925 c 0.25212 0.75083 1.39331 1.08412 2.17501 0.95664 c 0.72563 -0.11834 1.86348 -0.78557 1.63223 -1.48347 c -0.40491 -1.22199 -3.37562 -0.5023 -3.84356 -0.37691"];
};


SvsdHoku = function() { SvsdChar.call(this, "SvsdHoku", "ほく", "EL20CL4", "EL", "CL", "black", false, p(0.0, 1.1)); };
SvsdHoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ほく"] = SvsdHoku;

SvsdHoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(17.7772, 0.23744);
  this.paths = ["m 0 0 c 3.56394 2.8585 11.3939 2.10074 16.7511 0.51708 c 1.90616 -0.56349 5.06861 -1.41437 4.90226 -3.3951 c -0.0762 -0.90761 -1.63823 -1.52051 -2.47432 -1.15923 c -1.37655 0.59482 -1.4054 2.53431 -1.40193 4.27469"];
};


SvsdMaku = function() { SvsdChar.call(this, "SvsdMaku", "まく", "NER20CR4", "NER", "CR", "black", false, p(0.0, 5.7)); };
SvsdMaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["まく"] = SvsdMaku;

SvsdMaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(13.7443, -10.4974);
  this.paths = ["m 0 0 c 0.951612 -1.64824 10.9287 -11.2085 18.0425 -11.4151 c 0.601814 -0.0175 1.3606 0.31475 1.57984 0.87548 c 0.181296 0.46368 -0.03226 1.17886 -0.468883 1.41807 c -1.63163 0.8939 -4.78557 -0.29584 -5.4091 -1.37583"];
};


SvsdMiku = function() { SvsdChar.call(this, "SvsdMiku", "みく", "SWR20CR4", "SWR", "CR", "black", false, p(10.1, -8.9)); };
SvsdMiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みく"] = SvsdMiku;

SvsdMiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-4.5305, 14.8068);
  this.paths = ["m 0 0 c 1.03721 3.8709 -1.27457 11.8471 -5.3218 15.6215 c -0.821301 0.76594 -2.98249 2.79106 -4.27717 1.91661 c -0.743178 -0.50196 -0.539865 -2.06386 0.103699 -2.68844 c 1.18763 -1.1526 2.86046 -1.42779 4.96476 -0.0428"];
};


SvsdMuku = function() { SvsdChar.call(this, "SvsdMuku", "むく", "NER20CR4", "NER", "CR", "black", false, p(0.0, -4.5)); };
SvsdMuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["むく"] = SvsdMuku;

SvsdMuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(15.4278, 3.70919);
  this.paths = ["m 0 0 c 4.15127 -0.56444 14.154 1.1352 17.2897 5.4721 c 0.48605 0.67227 0.61548 1.95045 0.13904 2.72531 c -0.33563 0.54585 -1.21237 1.11596 -1.75742 0.77903 c -1.49504 -0.92419 -0.43189 -4.37247 -0.24351 -5.26725"];
};


SvsdMeki = function() { SvsdChar.call(this, "SvsdMeki", "めき", "UER5CR4", "SER", "SWR", "black", false, p(0.7, -2.5)); };
SvsdMeki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["めき"] = SvsdMeki;

SvsdMeki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.49718, 1.85968);
  this.paths = ["m 0 0 c 2.43632 0.65746 2.43679 1.20845 2.55359 2.36206 c 0.10906 1.07717 -0.81636 2.53352 -1.89391 2.6387 c -0.62931 0.0615 -1.45697 -0.67009 -1.38319 -1.29807 c 0.14432 -1.22846 2.11714 -1.59221 3.22069 -1.84301"];
};

SvsdMoku = function() { SvsdChar.call(this, "SvsdMoku", "もく", "ER20CR4", "ER", "CR", "black", false, p(0.0, 1.0)); };
SvsdMoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["もく"] = SvsdMoku;

SvsdMoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(14.9819, -2.95971);
  this.paths = ["m 0 0 c 1.74531 -1.00766 13.4456 -4.56417 18.6607 -2.17839 c 0.72477 0.33156 1.46938 1.20095 1.33154 1.98595 c -0.11423 0.65056 -0.94184 1.24541 -1.59821 1.17146 c -1.72612 -0.1945 -2.97428 -3.18047 -3.41207 -3.93873"];
};

SvsdYaku = function() { SvsdChar.call(this, "SvsdYaku", "やく", "NE20CL4", "NE", "CL", "black", false, p(0.0, 6.1)); };
SvsdYaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["やく"] = SvsdYaku;

SvsdYaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(13.7218, -8.11575);
  this.paths = ["m 0 0 l 15.6889 -9.04497 c 1.57301 -0.90688 1.28281 -1.6241 0.912214 -2.39318 c -0.290377 -0.60261 -1.32836 -0.93626 -1.91199 -0.60941 c -1.17759 0.65948 -1.28337 2.75222 -0.967299 3.93181"];
};

SvsdYuku = function() { SvsdChar.call(this, "SvsdYuku", "ゆく", "SE20CL4", "SE", "CL", "black", false, p(0.0, -4.8)); };
SvsdYuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ゆく"] = SvsdYuku;

SvsdYuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(13.1709, 7.60424);
  this.paths = ["m 0 0 l 16.3203 9.44107 c 0.48996 0.28343 1.34425 0.0779 1.65082 -0.39797 c 0.37594 -0.58348 0.17165 -1.64043 -0.39234 -2.04503 c -1.20509 -0.8645 -2.68672 -0.78541 -4.40783 0.60617"];
};


SvsdYoku = function() { SvsdChar.call(this, "SvsdYoku", "よく", "E20CL4", "E", "CL", "black", false, p(0.0, 1.3)); };
SvsdYoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["よく"] = SvsdYoku;

SvsdYoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(15.4923, 0);
  this.paths = ["m 0 0 h 19.115 c 0.29823 0 0.7635 -0.29333 0.84579 -0.63643 c 0.17167 -0.71572 -0.25461 -1.81103 -0.97013 -1.98352 c -1.4163 -0.34141 -2.96057 1.68862 -3.49828 2.61995"];
};

SvsdRaku = function() { SvsdChar.call(this, "SvsdRaku", "らく", "NER5CR4", "NER", "CR", "black", false, p(0.0, 1.4)); };
SvsdRaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["らく"] = SvsdRaku;

SvsdRaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.97828, -2.56857);
  this.paths = ["m 0 0 c 0.180368 -0.67315 1.77155 -2.79064 3.21061 -3.37163 c 0.797659 -0.32204 2.04814 -0.56796 2.57832 0.10945 c 0.267165 0.34136 0.09808 1.02818 -0.258643 1.27445 c -0.987297 0.68161 -2.99833 -0.37154 -3.55201 -0.58084"];
};

SvsdRiku = function() { SvsdChar.call(this, "SvsdRiku", "りく", "SWR5CR4", "SWR", "CR", "black", false, p(3.6, -2.3)); };
SvsdRiku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りく"] = SvsdRiku;

SvsdRiku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.259051, 2.41601);
  this.paths = ["m 0 0 c 0 1.04795 -0.08403 2.76602 -0.903483 3.76177 c -0.4005 0.48667 -1.10859 0.94335 -1.7192 0.78712 c -0.51427 -0.13158 -1.12809 -0.77623 -0.951652 -1.27688 c 0.379348 -1.07645 2.58289 -1.27885 3.31528 -0.856"];
};

SvsdRuku = function() { SvsdChar.call(this, "SvsdRuku", "るく", "SER5CR4", "SER", "CR", "black", false, p(0.0, -1.9)); };
SvsdRuku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["るく"] = SvsdRuku;

SvsdRuku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.49575, 0.34963);
  this.paths = ["m 0 0 c 0.69689 0 2.95056 0.15025 3.92735 1.09426 c 0.45225 0.43708 0.77123 1.20304 0.56962 1.79879 c -0.17018 0.5029 -0.81112 1.1114 -1.30412 0.91438 c -1.09183 -0.43632 -0.756 -2.86881 -0.6971 -3.4578"];
};

SvsdReki = function() { SvsdChar.call(this, "SvsdReki", "れき", "SR5CR4", "SR", "CR", "black", false, p(1.2, -2.7)); };
SvsdReki.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["れき"] = SvsdReki;

SvsdReki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.28269, 2.11468);
  this.paths = ["m 0 0 c 1.29191 0.91995 1.46435 2.4332 1.29482 3.74223 c -0.0875 0.67593 -0.46942 1.56992 -1.13881 1.69825 c -0.55151 0.10573 -1.34577 -0.39313 -1.38921 -0.953 c -0.0892 -1.14931 1.61828 -1.92399 2.51589 -2.3728"];
};

SvsdRoku = function() { SvsdChar.call(this, "SvsdRoku", "ろく", "ER5CR4", "ER", "CR", "black", false, p(0.0, -0.0)); };
SvsdRoku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ろく"] = SvsdRoku;

SvsdRoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.25105, -0.92044);
  this.paths = ["m 0 0 c 1.74531 -1.00766 4.19201 -1.8445 5.76708 -0.7168 c 0.32253 0.23093 0.38163 0.79414 0.24156 1.16527 c -0.1667 0.44168 -0.6602 0.86453 -1.1321 0.85101 c -1.14559 -0.0328 -2.1877 -1.46166 -2.62549 -2.21992"];
};

SvsdWaku = function() { SvsdChar.call(this, "SvsdWaku", "わく", "USL5CL4", "SEL", "CL", "black", false, p(0.0, -1.2)); };
SvsdWaku.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["わく"] = SvsdWaku;

SvsdWaku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.00787, 2.92665);
  this.paths = ["m 0 0 c 0 2.17369 0.850081 2.68342 2.00787 2.92665 c 1.1225 0.23581 2.39591 -0.79597 2.9239 -1.81423 c 0.193781 -0.37372 0.207267 -0.94767 -0.07416 -1.26075 c -0.301571 -0.33549 -0.936359 -0.43379 -1.33492 -0.22248 c -1.06867 0.5666 -1.38713 1.89289 -1.51482 3.29746"];
};

SvsdAtsu = function() { SvsdChar.call(this, "SvsdAtsu", "あつ", "NE10OL4", "NE", "OL", "black", false, p(0.0, 2.8)); };
SvsdAtsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["あつ"] = SvsdAtsu;

SvsdAtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.96576, -2.86698);
  this.paths = ["m 0 0 l 7.50277 -4.33173 c 0 0 1.14139 -0.607154 0.998645 -1.07494 c -0.100303 -0.328687 -0.675615 -0.336605 -1.00385 -0.234835 c -1.19586 0.370777 -2.02278 1.89286 -2.53181 2.77452"];
};

SvsdItsu = function() { SvsdChar.call(this, "SvsdItsu", "いつ", "SW10OR4", "SW", "OR", "black", false, p(5.5, -4.2)); };
SvsdItsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["いつ"] = SvsdItsu;

SvsdItsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.81907, 4.88337);
  this.paths = ["m 0 0 l -4.63973 8.03723 c -0.14488 0.250971 -0.440188 0.544006 -0.677871 0.42359 c -0.264111 -0.133805 -0.165722 -0.606971 -0.06604 -0.885757 c 0.417252 -1.16692 1.79059 -2.3858 2.56457 -2.69169"];
};

SvsdUtsu = function() { SvsdChar.call(this, "SvsdUtsu", "うつ", "SE10OL4", "SE", "OL", "black", false, p(0.0, -2.4)); };
SvsdUtsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["うつ"] = SvsdUtsu;

SvsdUtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.40929, 2.54571);
  this.paths = ["m 0 0 c 0 0 5.10325 2.96327 7.44967 4.33461 c 0.33673 0.196799 0.79874 0.58105 1.10426 0.351149 c 0.17032 -0.128175 0.096 -0.467085 -0.0302 -0.638796 c -0.86497 -1.1761 -2.33271 -1.17007 -4.11444 -1.50126"];
};

SvsdEtsu = function() { SvsdChar.call(this, "SvsdEtsu", "えつ", "S10OR4", "S", "OR", "black", false, p(1.2, -5.0)); };
SvsdEtsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["えつ"] = SvsdEtsu;

SvsdEtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 5.39275);
  this.paths = ["m 0 0 v 9.25599 c 0 0 -0.0561 0.659794 -0.31126 0.732366 c -0.2443 0.06949 -0.53124 -0.202393 -0.62251 -0.43942 c -0.51024 -1.32508 -0.0968 -3.12557 0.93377 -4.15618"];
};

SvsdOtsu = function() { SvsdChar.call(this, "SvsdOtsu", "おつ", "E10OL4", "E", "OL", "black", false, p(0.0, 0.5)); };
SvsdOtsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["おつ"] = SvsdOtsu;

SvsdOtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.97713, -0.000598);
  this.paths = ["m 0 0 l 9.14471 -0.000483 c 0.20088 -1.1e-05 0.79637 0.01898 0.85097 -0.273968 c 0.0594 -0.318886 -0.43923 -0.54513 -0.75665 -0.611939 c -1.10252 -0.232048 -3.2619 0.885792 -3.2619 0.885792"];
};

SvsdKatsu = function() { SvsdChar.call(this, "SvsdKatsu", "かつ", "NEL10OL4", "NEL", "OL", "black", false, p(0.0, 2.5)); };
SvsdKatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["かつ"] = SvsdKatsu;

SvsdKatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.62552, -1.1578);
  this.paths = ["m 0 0 c 3.03636 1.34978 6.39642 -1.28465 7.96521 -3.6709 c 0.42766 -0.666957 0.711197 -0.992339 0.462525 -1.42566 c -0.114534 -0.19958 -0.462736 -0.237573 -0.674419 -0.147348 c -1.37271 0.585085 -1.8438 3.05144 -2.12779 4.08611"];
};

SvsdKitsu = function() { SvsdChar.call(this, "SvsdKitsu", "きつ", "SWL10OL5", "SWL", "OL", "black", false, p(5.1, -4.3)); };
SvsdKitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["きつ"] = SvsdKitsu;

SvsdKitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-4.52409, 4.95672);
  this.paths = ["m 0 0 c -1.49047 1.05666 -5.16196 3.85976 -5.10719 7.63149 c 0.0016 0.11057 0.069347 0.827191 0.388776 0.91254 c 0.281674 0.075261 0.590118 -0.255784 0.69849 -0.52645 c 0.384354 -0.959949 -0.222934 -2.4493 -0.50417 -3.06086"];
};

SvsdKutsu = function() { SvsdChar.call(this, "SvsdKutsu", "くつ", "SEL10OL4", "SEL", "OL", "black", false, p(0.0, -2.6)); };
SvsdKutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["くつ"] = SvsdKutsu;

SvsdKutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.52107, 4.93879);
  this.paths = ["m 0 0 c 0.322402 3.47355 3.79757 5.45994 7.287 5.21489 c 0.277989 -0.0195 1.43047 -0.291581 1.37372 -0.822215 c -0.038168 -0.356889 -0.66115 -0.336492 -1.01997 -0.345104 c -1.08118 -0.025949 -2.58498 0.356517 -3.11968 0.89122"];
};

SvsdKetsu = function() { SvsdChar.call(this, "SvsdKetsu", "けつ", "SL10OL4", "SL", "OL", "black", false, p(1.5, -4.9)); };
SvsdKetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["けつ"] = SvsdKetsu;

SvsdKetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.37247, 6.73249);
  this.paths = ["m 0 0 c -1.63643 2.53073 -2.08843 6.05658 -0.640023 8.94219 c 0.10036 0.19995 0.536449 1.09047 0.924712 0.90349 c 0.479819 -0.231073 0.065674 -1.10744 -0.160466 -1.5896 c -0.302298 -0.644544 -1.12746 -1.52358 -1.49669 -1.52358"];
};

SvsdKotsu = function() { SvsdChar.call(this, "SvsdKotsu", "こつ", "EL10OL4", "EL", "OL", "black", false, p(0.0, -0.3)); };
SvsdKotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["こつ"] = SvsdKotsu;

SvsdKotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.95738, 1.08054);
  this.paths = ["m 0 0 c 2.70023 1.86067 6.02664 1.53794 8.60646 0.59829 c 0.296171 -0.10787 1.2137 -0.597397 1.12602 -1.11931 c -0.034941 -0.207969 -0.360642 -0.301766 -0.569808 -0.274898 c -0.957329 0.122973 -1.81874 1.20693 -2.20529 1.87646"];
};

SvsdSatsu = function() { SvsdChar.call(this, "SvsdSatsu", "さつ", "NEL5OL4", "NEL", "OL", "black", false, p(0.0, 1.2)); };
SvsdSatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["さつ"] = SvsdSatsu;

SvsdSatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.46035, -0.414344);
  this.paths = ["m 0 0 c 1.22256 0.73349 2.59036 -0.34046 3.56736 -1.48845 c 0.12228 -0.14368 0.685042 -0.667718 0.517866 -1.0057 c -0.08646 -0.174803 -0.402359 -0.191638 -0.575956 -0.102778 c -0.71852 0.367796 -0.85838 1.09729 -1.04892 2.18258"];
};


SvsdShitsu = function() { SvsdChar.call(this, "SvsdShitsu", "しつ", "SWL5OL4", "SWL", "OL", "black", false, p(2.7, -2.1)); };
SvsdShitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["しつ"] = SvsdShitsu;

SvsdShitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.90771, 1.46861);
  this.paths = ["m 0 0 c -0.87569 0.30734 -2.33943 1.45529 -2.59805 2.98683 c -0.0372 0.22021 -0.293129 1.08587 0.0917 1.23767 c 0.222698 0.087847 0.428316 -0.269346 0.52775 -0.487117 c 0.314263 -0.688276 0.260423 -1.56144 0.070893 -2.26877"];
};

SvsdSutsu = function() { SvsdChar.call(this, "SvsdSutsu", "すつ", "SEL5OL4", "SEL", "OL", "black", false, p(0.0, -1.3)); };
SvsdSutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["すつ"] = SvsdSutsu;

SvsdSutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.30888, 2.16218);
  this.paths = ["m 0 0 c 0.338408 1.04544 0.874149 2.55 2.81235 2.65909 c 0.231118 0.013 1.24653 0.140737 1.38092 -0.3116 c 0.065542 -0.2206 -0.263946 -0.419224 -0.481233 -0.495031 c -0.762599 -0.266057 -1.79529 -0.298145 -2.40316 0.309723"];
};

SvsdSetsu = function() { SvsdChar.call(this, "SvsdSetsu", "せつ", "SL5OL4", "SL", "OL", "black", false, p(0.7, -2.4)); };
SvsdSetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["せつ"] = SvsdSetsu;

SvsdSetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.699, 2.40517);
  this.paths = ["m 0 0 c -0.44045 1.21912 -1.10421 2.88152 -0.50385 4.24483 c 0.0653 0.1484 0.426736 0.642044 0.73201 0.5805 c 0.196331 -0.039581 0.296218 -0.326418 0.28935 -0.526581 c -0.025725 -0.749785 -0.667207 -1.34428 -1.21651 -1.89358"];
};

SvsdSotsu = function() { SvsdChar.call(this, "SvsdSotsu", "そつ", "EL5OL4", "EL", "OL", "black", false, p(0.0, -0.3)); };
SvsdSotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["そつ"] = SvsdSotsu;

SvsdSotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.36708, 1.02643);
  this.paths = ["m 0 0 c 0.9556 1.26596 2.5813 1.2111 3.87482 0.66396 c 0.20807 -0.088 0.916685 -0.35362 0.976868 -0.762231 c 0.017085 -0.115998 -0.088252 -0.263804 -0.203153 -0.28715 c -0.876418 -0.178074 -1.8713 0.994559 -2.28145 1.41185"];
};

SvsdLa = function() { SvsdChar.call(this, "SvsdLa", "ぁ", "UN1NE5", "NER", "NE", "black", false, p(0.0, 1.5)); };
SvsdLa.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぁ"] = SvsdLa;
SvsdChar.dict["ァ"] = SvsdLa;

SvsdLa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.40835, -3.03054);
  this.paths = ["m 0 0 c 0.327644 -0.491467 0.664164 -1.08953 1.14228 -0.955786 c 0.347876 0.0973 0.349679 1.02572 0.349679 1.02572 l 3.91639 -3.10048"];
};

SvsdLi = function() { SvsdChar.call(this, "SvsdLi", "ぃ", "UNE1SW5", "NER", "SW", "black", false, p(0.8, -1.6)); };
SvsdLi.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぃ"] = SvsdLi;
SvsdChar.dict["ィ"] = SvsdLi;

SvsdLi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.814274, 3.97657);
  this.paths = ["m 0 0 c 0.211562 -0.366436 0.737666 -0.926442 1.14768 -0.732055 c 0.240544 0.114041 0.222443 0.547861 0.09369 0.793113 l -2.05564 3.91551"];
};

SvsdLu = function() { SvsdChar.call(this, "SvsdLu", "ぅ", "UNER1SE5", "NER", "SE", "black", false, p(0.0, -0.5)); };
SvsdLu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぅ"] = SvsdLu;
SvsdChar.dict["ゥ"] = SvsdLu;

SvsdLu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.81834, 2.03369);
  this.paths = ["m 0 0 c 0.148093 -0.325804 0.718636 -1.11771 1.17403 -0.9188 c 0.281638 0.123014 0.07657 0.91881 0.07657 0.91881 l 4.56774 2.03368"];
};

SvsdLe = function() { SvsdChar.call(this, "SvsdLe", "ぇ", "UNR1S5", "NER", "S", "black", false, p(0.0, -1.5)); };
SvsdLe.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぇ"] = SvsdLe;
SvsdChar.dict["ェ"] = SvsdLe;

SvsdLe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.24482, 4.01439);
  this.paths = ["m 0 0 c 0 -0.452668 0.362397 -1.06647 0.819378 -0.976953 c 0.311195 0.06096 0.425446 0.500898 0.425446 0.850895 l 0 4.14045"];
};

SvsdLo = function() { SvsdChar.call(this, "SvsdLo", "ぉ", "UNR1E5", "NER", "E", "black", false, p(0.0, 0.5)); };
SvsdLo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぉ"] = SvsdLo;
SvsdChar.dict["ォ"] = SvsdLo;

SvsdLo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.49196, 0.069935);
  this.paths = ["m 0 0 c 0.327644 -0.491467 0.664164 -1.08953 1.14228 -0.955786 c 0.347876 0.0973 0.349679 1.02572 0.349679 1.02572 h 5"];
};


SvsdProlong = function() { SvsdChar.call(this, "SvsdProlong", "ー", "UWL1P", "SWL", "P", "black", false, p(1.1, -0.9)); };
SvsdProlong.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ー"] = SvsdProlong;

SvsdProlong.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0.671, 1.71821);
  this.paths = ["m 0 0 c -0.22027 0.05902 -1.12153 0.553788 -1.08609 1.05794 c 0.0249 0.354198 0.38147 0.629202 0.85953 0.629202", "m 0.671 1.71821 v 0"];
};

SvsdTatsu = function() { SvsdChar.call(this, "SvsdTatsu", "たつ", "NE5OL4", "NE", "OL", "black", false, p(0.0, 1.5)); };
SvsdTatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["たつ"] = SvsdTatsu;

SvsdTatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.92878, -1.11358);
  this.paths = ["m 0 0 l 3.38064 -1.95181 c 0.07403 -0.0427 0.702055 -0.38756 0.666455 -0.65464 c -0.03455 -0.25923 -0.45437 -0.39765 -0.708683 -0.33665 c -0.748629 0.17957 -1.00324 0.9757 -1.40963 1.82952"];
};


SvsdChitsu = function() { SvsdChar.call(this, "SvsdChitsu", "ちつ", "SW5OR4", "SW", "OR", "black", false, p(3.0, -2.1)); };
SvsdChitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ちつ"] = SvsdChitsu;

SvsdChitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.01147, 1.75191);
  this.paths = ["m 0 0 l -2.11204 3.65815 c -0.188808 0.32703 -0.296324 0.59675 -0.552283 0.55092 c -0.251845 -0.0451 -0.373718 -0.44644 -0.321591 -0.69692 c 0.179644 -0.86322 0.840171 -1.57232 1.97444 -1.76024"];
};

SvsdTsutsu = function() { SvsdChar.call(this, "SvsdTsutsu", "つつ", "SE5OL4", "SE", "OL", "black", false, p(0.0, -1.2)); };
SvsdTsutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["つつ"] = SvsdTsutsu;

SvsdTsutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.54783, 0.89364);
  this.paths = ["m 0 0 l 3.56761 2.05976 c 0.2278 0.13152 0.47977 0.35076 0.71679 0.25923 c 0.1831 -0.0707 0.35114 -0.33937 0.27541 -0.52045 c -0.40448 -0.96715 -1.99951 -1.05846 -3.01198 -0.9049"];
};

SvsdTetsu = function() { SvsdChar.call(this, "SvsdTetsu", "てつ", "S5OR4", "S", "OR", "black", false, p(0.8, -2.5)); };
SvsdTetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["てつ"] = SvsdTetsu;

SvsdTetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1e-05, 2.25722);
  this.paths = ["m 0 0 v 4.24601 c 0 0.28521 0.0458 0.75153 -0.22858 0.8095 c -0.25809 0.0545 -0.45643 -0.35018 -0.50475 -0.60951 c -0.14092 -0.75643 -0.0292 -1.42631 0.73332 -2.18878"];
};

SvsdTotsu = function() { SvsdChar.call(this, "SvsdTotsu", "とつ", "E5OL4", "E", "OL", "black", false, p(0.0, 0.5)); };
SvsdTotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["とつ"] = SvsdTotsu;

SvsdTotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.69966, 0);
  this.paths = ["m 0 0 h 4.07472 c 0 0 0.71711 0.0217 0.87179 -0.23663 c 0.11381 -0.19008 0.0414 -0.53505 -0.14945 -0.64761 c -0.9248 -0.54554 -2.38586 0.22286 -3.0974 0.88424"];
};

NakaneMau = function() { NakaneChar.call(this, "NakaneMau", "まう", "HER7", "HER", "ER", "black", false, p(1.7, 1.2)); };
NakaneMau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["まう"] = NakaneMau;
NakaneChar.dict["まあ"] = NakaneMau;
NakaneChar.dict["まー"] = NakaneMau;
NakaneChar.dict["みゃあ"] = NakaneMau;
NakaneChar.dict["みゃー"] = NakaneMau;

NakaneMau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.87309, -1.31198);
  this.paths = ["m 0 0 c -0.512461 -0.0405 -1.54022 -0.15072 -1.71705 -0.7497 c -0.138788 -0.47011 0.367641 -1.01912 0.812018 -1.22599 c 1.75757 -0.81826 4.39459 -0.56608 5.77811 0.66371"];
};

NakaneMiu = function() { NakaneChar.call(this, "NakaneMiu", "みう", "HER7", "HER", "ER", "black", true, p(1.7, 1.2)); };
NakaneMiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["みう"] = NakaneMiu;
NakaneChar.dict["みゅう"] = NakaneMiu;
NakaneChar.dict["みゅー"] = NakaneMiu;
NakaneMiu.prototype.setPaths = NakaneMau.prototype.setPaths;



NakaneMou = function() { NakaneChar.call(this, "NakaneMou", "もう", "HER17", "HER", "ER", "black", false, p(3.7, 2.3)); };
NakaneMou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["もう"] = NakaneMou;
NakaneChar.dict["もー"] = NakaneMou;
NakaneChar.dict["もお"] = NakaneMou;

NakaneMou.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(14.251, -1.61198);
  this.paths = ["m 0 0 c -0.9061 0.24279 -1.64997 0.23565 -1.92799 -0.35578 c -0.41068 -0.87361 0.55956 -2.07587 1.41234 -2.52823 c 4.36442 -2.31512 11.0533 -1.8461 14.7666 1.27203"];
};

NakaneMeu = function() { NakaneChar.call(this, "NakaneMeu", "もう", "HER17", "HER", "ER", "black", true, p(3.7, 2.3)); };
NakaneMeu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["めう"] = NakaneMeu;
NakaneChar.dict["みょう"] = NakaneMeu;
NakaneChar.dict["みょー"] = NakaneMeu;
NakaneMeu.prototype.setPaths = NakaneMou.prototype.setPaths;

NakaneMuu = function() { NakaneChar.call(this, "NakaneMuu", "むう", "HER17", "HER", "ER", "black", false, p(3.7, 2.3)); };
NakaneMuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["むう"] = NakaneMuu;
NakaneChar.dict["むー"] = NakaneMuu;

NakaneMuu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(14.251, -1.61198);
  this.paths = ["m 0 0 c -0.906103 0.24279 -1.64996 0.23565 -1.92799 -0.35578 c -0.410679 -0.87361 0.559563 -2.07587 1.41234 -2.52823 c 4.36442 -2.31512 11.0533 -1.8461 14.7666 1.27203"];
};

NakaneMuu.prototype.setPathsExtra= function() {
  this.pathsExtra = [, "m 5.70251 -5.6324 v 0.1"];
};

NakaneYau = function() { NakaneChar.call(this, "NakaneYau", "やう", "HSWL7", "HSWL", "SWL", "black", false, p(5.5, -0.2)); };
NakaneYau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["やう"] = NakaneYau;
NakaneChar.dict["やあ"] = NakaneYau;
NakaneChar.dict["やー"] = NakaneYau;

NakaneYau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-5.45367, 2.24904);
  this.paths = ["m 0 0 c 0.360783 -0.6249 0.236724 -1.25112 -0.164817 -1.61276 c -0.457324 -0.41188 -1.285 -0.24743 -1.84637 0.005 c -1.57179 0.70638 -2.6199 2.43205 -3.44249 3.8568"];
};

NakaneYuu = function() { NakaneChar.call(this, "NakaneYuu", "ゆう", "HNER7", "HNER", "NER", "black", false, p(2.5, 2.2)); };
NakaneYuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ゆう"] = NakaneYuu;
NakaneChar.dict["ゆー"] = NakaneYuu;
NakaneYuu.prototype.setPaths = NakaneIu.prototype.setPaths; 

//NakaneYuu.prototype.setPaths = function() {
//  //const name_ = this.getPrevName();
//  //const model_ = this.getPrevModel();
//  //const tail_ = this.getPrevTailType();
//  //const _name = this.getNextName();
//  //const _model = this.getNextModel();
//  //const _head = this.getNextHeadType();
//
//  //switch (name_ + "_" + _name) {}
//
//  //switch (name_ + "_" + _model) {}
//
//  //switch (name_ + "_" + _head) {}
//
//  //switch (name_) {}
//
//  //switch (model_ + "_" + _name) {}
//
//  //switch (model_ + "_" + _model) {}
//
//  //switch (model_ + "_" + _head) {}
//
//  //switch (model_) {}
//
//  //switch (tail_ + "_" + _name) {}
//
//  //switch (tail_ + "_" + _model) {}
//
//  //switch (tail_ + "_" + _head) {}
//
//  //switch (tail_) {}
//
//  //switch (_name) {}
//
//  //switch (_model) {}
//
//  //switch (_head) {}
//
//  this.dp = p(3.33759, -4.62816);
//  this.paths = ["m 0 0 c -0.68562 0.39584 -1.44825 0.36127 -1.97398 -0.0346 c -0.446871 -0.33648 -0.709182 -1.08894 -0.49195 -1.60443 c 0.845037 -2.00524 4.30528 -2.7364 5.80352 -2.98913"];
//};

NakaneYou = function() { NakaneChar.call(this, "NakaneYou", "よう", "HNER17", "HNER", "NER", "black", false, p(4.0, 5.9)); };
NakaneYou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["よう"] = NakaneYou;
NakaneChar.dict["よー"] = NakaneYou;
NakaneChar.dict["よお"] = NakaneYou;

NakaneYou.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SE":
    case "SER":
      this.dp = p(12.3247, -11.588);
      this.paths = ["m 0 0 c -0.585942 -1.01488 -0.728548 -2.01929 -0.323034 -2.9053 c 2.12817 -4.64987 8.49076 -7.56885 12.6477 -8.68271"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(8.91419, -11.7216);
  this.paths = ["m 0 0 c -1.55213 0 -2.96159 -0.0217 -3.7415 -1.05669 c -0.39762 -0.52768 -0.301 -1.39813 0.008 -1.98216 c 2.39131 -4.52018 8.49076 -7.56885 12.6477 -8.68271"];
};

ShugiinIinKanji = function() { ShugiinChar.call(this, "ShugiinIinKanji", "委員|医院", "P", "P", "P", "black", false, p(0.0, 0.0)); };
ShugiinIinKanji.prototype = Object.create(ShugiinChar.prototype);
ShugiinChar.dict["委員"] = ShugiinIinKanji;
ShugiinChar.dict["医院"] = ShugiinIinKanji;

ShugiinIinKanji.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "CharDottedCircle_CharDottedLine":
      this.dp = p(-7.8, 6.6);
      return;

    case "CharDottedCircle_ShugiinKa":
      this.dp = p(-6.8, 6.6);
      return;
  }

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0.1);
  this.paths = ["m0,0v0.1"];
};

SvsdNatsu = function() { SvsdChar.call(this, "SvsdNatsu", "なつ", "NER10OL4", "NER", "OL", "black", false, p(0.0, 2.6)); };
SvsdNatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["なつ"] = SvsdNatsu;

SvsdNatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.34148, -4.32899);
  this.paths = ["m 0 0 c 0.469945 -1.75386 2.2848 -3.24208 3.96376 -4.16771 c 1.23481 -0.68076 2.80602 -1.2613 4.14811 -0.82887 c 0.203607 0.0656 0.51821 0.27138 0.437517 0.46949 c -0.52969 1.30045 -3.48056 0.29599 -4.20791 0.1981"];
};

SvsdNitsu = function() { SvsdChar.call(this, "SvsdNitsu", "につ", "SWR10OR4", "SWR", "OR", "black", false, p(5.2, -4.2)); };
SvsdNitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["につ"] = SvsdNitsu;

SvsdNitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.34724, 5.94927);
  this.paths = ["m 0 0 c 0.681879 3.25648 -0.956268 5.74553 -2.33613 7.09253 c -0.593374 0.57924 -1.31931 1.16541 -2.14434 1.31393 c -0.2449 0.0441 -0.599545 0.0667 -0.732576 -0.14356 c -0.641248 -1.01368 3.33213 -2.17063 3.86581 -2.31363"];
};


SvsdNutsu = function() { SvsdChar.call(this, "SvsdNutsu", "ぬつ", "SER10OR4", "SER", "OR", "black", false, p(0.0, -2.6)); };
SvsdNutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぬつ"] = SvsdNutsu;

SvsdNutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.51115, 2.00189);
  this.paths = ["m 0 0 c 3.60267 0 5.75994 1.04161 7.62038 3.0473 c 0.49408 0.53266 1.32155 1.78938 0.65515 2.07878 c -1.09701 0.47641 -1.56192 -2.36864 -1.76438 -3.12419"];
};

SvsdNetsu = function() { SvsdChar.call(this, "SvsdNetsu", "ねつ", "SR10OR4", "SR", "OR", "black", false, p(0.8, -5.0)); };
SvsdNetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ねつ"] = SvsdNetsu;

SvsdNetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.54235, 6.60293);
  this.paths = ["m 0 0 c 1.67165 2.08955 1.9819 5.66169 1.20027 8.36952 c -0.19607 0.67925 -0.69859 1.40578 -1.37357 1.61606 c -0.18585 0.058 -0.4728 0.0205 -0.564 -0.15141 c -0.30072 -0.56701 1.13004 -2.19554 2.27965 -3.23124"];
};

SvsdNotsu = function() { SvsdChar.call(this, "SvsdNotsu", "のつ", "ER10OR4", "ER", "OR", "black", false, p(0.0, 0.9)); };
SvsdNotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["のつ"] = SvsdNotsu;

SvsdNotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.35916, -1.84556);
  this.paths = ["m 0 0 c 1.66634 -0.96205 5.54517 -2.19039 8.37662 -1.81116 c 0.783 0.16244 1.81553 0.61603 1.61617 1.27195 c -0.11433 0.37616 -0.79231 0.17611 -1.17598 0.0903 c -0.91953 -0.20569 -1.65647 -0.79043 -2.45765 -1.39665"];
};



NakaneRau = function() { NakaneChar.call(this, "NakaneRau", "らう", "HSWR", "SWR", "HSWR", "black", false, p(2.1, -2.1)); };
NakaneRau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["らう"] = NakaneRau;
NakaneChar.dict["らあ"] = NakaneRau;
NakaneChar.dict["らー"] = NakaneRau;
NakaneChar.dict["りゃあ"] = NakaneRau;
NakaneChar.dict["りゃー"] = NakaneRau;

NakaneRau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.11198, 4.965);
  this.paths = ["m 0 0 c 0.650934 -0.65093 1.29019 -0.92463 1.79647 -0.55516 c 0.508176 0.37085 0.268371 1.30952 0.01929 1.88722 c -0.7061 1.63769 -2.54881 3.26346 -3.92774 3.63294"];
};

NakaneRiu = function() { NakaneChar.call(this, "NakaneRiu", "りう", "HSWR", "HSWR", "SWR", "black", true, p(2.1, -2.1)); };
NakaneRiu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["りう"] = NakaneRiu;
NakaneChar.dict["りゅう"] = NakaneRiu;
NakaneChar.dict["りゅー"] = NakaneRiu;
NakaneRiu.prototype.setPaths = NakaneRau.prototype.setPaths;

NakaneReu = function() { NakaneChar.call(this, "NakaneReu", "れう", "HSWR17", "HSWR", "SWR", "black", true, p(8.0, -5.0)); };
NakaneReu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["れう"] = NakaneReu;
NakaneChar.dict["りょう"] = NakaneReu;
NakaneChar.dict["りょー"] = NakaneReu;

NakaneReu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

      this.dp = p(-8.03321, 11.4375);
      this.paths = ["m 0 0 c 0.85081 -0.85081 2.1127 -1.77139 3.01539 -1.17972 c 0.9844 0.64522 0.61803 2.45643 0.13231 3.52854 c -1.98206 4.37494 -9.47731 8.63225 -11.1809 9.08873"];
};

NakaneRou = function() { NakaneChar.call(this, "NakaneRou", "ろう", "HSWR17", "HSWR", "SWR", "black", false, p(8.0, -5.0)); };
NakaneRou.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["ろう"] = NakaneRou;
NakaneChar.dict["ろお"] = NakaneRou;
NakaneChar.dict["ろー"] = NakaneRou;
NakaneRou.prototype.setPaths = NakaneReu.prototype.setPaths;

NakaneRuu = function() { NakaneChar.call(this, "NakaneRuu", "るう", "HSWR17", "HSWR", "SWR", "black", false, p(8.0, -5.0)); };
NakaneRuu.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["るう"] = NakaneRuu;
NakaneChar.dict["るー"] = NakaneRuu;
NakaneRuu.prototype.setPaths = NakaneReu.prototype.setPaths;
NakaneRuu.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -1.250913,4.35925 v 0.1"];
};


NakaneWau = function() { NakaneChar.call(this, "NakaneWau", "わう", "HSWL17", "HSWL", "SWL", "black", true, p(14.6, -1.5)); };
NakaneWau.prototype = Object.create(NakaneChar.prototype);
NakaneChar.dict["わう"] = NakaneWau;
NakaneChar.dict["わあ"] = NakaneWau;
NakaneChar.dict["わー"] = NakaneWau;

NakaneWau.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-13.205, 7.29197);
  this.paths = ["m 0 0 c 0 -1.19549 0.341805 -2.86221 -0.625162 -3.60597 c -0.618156 -0.47547 -1.35671 -0.19274 -2.33057 0.2052 c -3.96724 1.62107 -9.34315 7.31106 -10.2493 10.6927"];
};

SvsdHatsu = function() { SvsdChar.call(this, "SvsdHatsu", "はつ", "NEL20OL4", "NEL", "OL", "black", false, p(0.0, 4.7)); };
SvsdHatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["はつ"] = SvsdHatsu;

SvsdHatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(12.602, -4.59758);
  this.paths = ["m 0 0 c 7.56775 0 11.1557 -3.07845 15.1441 -6.94247 c 0.643086 -0.62303 1.75598 -1.70634 1.19617 -2.40515 c -0.210479 -0.26274 -0.708956 0.0428 -0.980647 0.24156 c -1.42172 1.04027 -1.88679 3.00014 -2.75763 4.50848"];
};

SvsdHitsu = function() { SvsdChar.call(this, "SvsdHitsu", "ひつ", "SWL20OL4", "SWL", "OL", "black", false, p(10.2, -9.0)); };
SvsdHitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ひつ"] = SvsdHitsu;

SvsdHitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-9.49783, 12.4427);
  this.paths = ["m 0 0 c -4.58414 4.24962 -11.55 12.3153 -10 17.3205 c 0 0 0.153617 0.62832 0.40621 0.6408 c 0.275154 0.0136 0.430486 -0.387 0.509133 -0.65103 c 0.464859 -1.56058 -0.183801 -4.40878 -0.413171 -4.86752"];
};

SvsdHutsu = function() { SvsdChar.call(this, "SvsdHutsu", "ふつ", "SEL20OL4", "SEL", "OL", "black", false, p(0.0, -5.1)); };
SvsdHutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ふつ"] = SvsdHutsu;

SvsdHutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(13.9932, 10.1308);
  this.paths = ["m 0 0 c 0.556334 7.36507 11.3581 11.1114 17.3205 10 c 0.47172 -0.0879 1.07532 -0.20233 1.29483 -0.62902 c 0.11297 -0.2196 0.12193 -0.70926 -0.12412 -0.73041 c -0.64549 -0.0555 -3.80957 1.02736 -4.49806 1.49022"];
};

SvsdHetsu = function() { SvsdChar.call(this, "SvsdHetsu", "へつ", "UWL5OL4", "SWL", "OL", "black", false, p(2.8, -2.6)); };
SvsdHetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["へつ"] = SvsdHetsu;

SvsdHetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(-2.73121, 3.68515);
  this.paths = ["m 0 0 c -1.54618 0.81314 -3.06762 1.9439 -2.80689 3.38677 c 0.19187 1.06179 1.17672 2.04865 2.80717 1.61177 c 0.31542 -0.0845 0.69931 -0.29432 0.52399 -0.44031 c -0.32634 -0.27174 -2.23988 -0.81054 -3.25548 -0.87308"];
};

SvsdHotsu = function() { SvsdChar.call(this, "SvsdHotsu", "ほつ", "EL20OL4", "EL", "OL", "black", false, p(0.0, -1.0)); };
SvsdHotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ほつ"] = SvsdHotsu;

SvsdHotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(14.8901, 2.06092);
  this.paths = ["m 0 0 c 4.81103 3.71824 12.928 3.58775 18.3006 0.68931 c 0.48354 -0.26087 1.22622 -1.00778 0.85261 -1.41062 c -0.49153 -0.52998 -1.36948 0.52869 -1.93491 0.979 c -0.75645 0.60244 -1.60851 1.38776 -2.32814 1.80323"];
};

WasedaKai = function() { WasedaChar.call(this, "WasedaKai", "かい", "E4", "E", "E", "black"); };
WasedaKai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["かい"] = WasedaKai;

WasedaKai.prototype.setPaths = function() {
  switch (this.getNextHeadType()) {
    case "E": 
    case "SER":
      this.dp = p(3.5076, 0.2);
      this.paths = ["m 0 0 l 4 0 l -0.4024 0.2"];
      break;

    default:
      this.dp = p(4, 0);
      this.paths = ["m 0 0 l 4 0"];
      break;
  }
};

WasedaTo = function() { WasedaChar.call(this, "WasedaTo", "と", "NE16", "NE", "NE", "black", false, p(0.0, 6.1)); };
WasedaTo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["と"] = WasedaTo;
WasedaTo.prototype.normal = function() {
  this.headType = "NE";
  this.tailType = "NE";
  this.model = "NE16";
};
WasedaTo.prototype.reverse = function() {
  this.headType = "SW";
  this.tailType = "SW";
  this.model = "SW16";
};
WasedaTo.prototype.filterReverseTail = function(tail) {
  return tail.replace(/^(?:SELCL4|E|EP|ER|ER4|ERCR|ERCR4|EL|ECL|NELCL|NEL|NE|SELCL|NEF|ELP|ELCLP|NELP|NELCL4|SEL|NW|ELCL|NWF)$/, "R");
};
WasedaTo.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.filterReverseTail(this.getPrevTailType());
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaSei":
      this.dp = p(13.2646, -8.94709);
      this.paths = ["m 0 0 l 13.2646 -8.94709"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "SL8ONEL4":
    case "SWR8CR4":
    case "SWR8CR1":
      this.dp = p(13.2646, -8.94709);
      this.paths = ["m 0 0 l 13.2646 -8.94709"];
      this.normal();
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "R_SW":
     this.dp = p(-6.13821, 13.7192);
     this.paths = ["m 0 0 l -6.76188 14.5009 l 0.623668 -0.781689"];
     this.reverse();
     return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-6.76188, 14.5009);
      this.paths = ["m 0 0 l -6.76188 14.5009"];
      this.reverse();
      return;
  }

  //switch (_name) { }

  //switch (_model) {}

  switch (_head) {
    case "SW":
    case "SWR":
      this.dp = p(13.2646, -8.94709);
      this.paths = ["m 0 0 l 13.2646 -8.94709"];
      this.normal();
      return;
  }

  this.dp = p(10.2846, -12.2567);
  this.paths = ["m 0 0 l 10.2846 -12.2567"];
  this.normal();
};

WasedaToHenki = function() { WasedaChar.call(this, "WasedaToHenki", "と", "SW16", "SW", "SW", "black", false, p(0.0, -6.1)); };
WasedaToHenki.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["とｈ"] = WasedaToHenki;
WasedaToHenki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) { }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
     this.dp = p(-6.13821, 13.7192);
     this.paths = ["m 0 0 l -6.76188 14.5009 l 0.623668 -0.781689"];
     return;
  }

  this.dp = p(-6.76188, 14.5009);
  this.paths = ["m 0 0 l -6.76188 14.5009"];
};


WasedaTei = function() { WasedaChar.call(this, "WasedaTei", "てい", "SW4CR1", "SW", "CR", "black", false, p(1.7, -1.8)); };
WasedaTei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["てい"] = WasedaTei;
WasedaChar.dict["です"] = WasedaTei;
WasedaChar.dict["てー"] = WasedaTei;

WasedaTei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(-0.895577, 2.69429);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -1.14421 0.190548 -0.814726 -0.380151 c 0.17532 -0.2918 0.619725 -0.296978 1.02032 -0.296978"];
     return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "SE3":
    case "SE4":
      this.dp = p(-0.914721, 2.79116);
      this.paths = ["m 0 0 c -0.231247 0.684462 -0.488239 1.46115 -1.10117 3.37142 c -0.09592 0.35798 -0.622157 0.000476 -0.741532 -0.445038 c -0.097752 -0.364816 0.36149 -0.656149 0.632625 -0.406821 l 0.295356 0.271602"];
      return;

    case "EL16":
      this.dp = p(-0.947424, 2.86587);
      this.paths = ["m 0 0 c -0.243546 0.728041 -0.436664 1.44331 -1.10117 3.37142 c -0.15815 0.5902 -1.20243 0.056788 -0.872945 -0.513912 c 0.17532 -0.2918 0.483816 -0.116946 1.02669 0.00836"];
      return;

    case "SER4":
    case "SER8":
     this.dp = p(-0.869968, 2.60938);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -0.808875 -0.17223 -0.670662 -0.720506 c 0.072752 -0.2886 0.444453 -0.361986 0.901864 -0.041536"];
     return;

    case "EL4":
     this.dp = p(-0.957833, 2.90025);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -1.19367 -0.02736 -0.864187 -0.59806 c 0.17532 -0.291799 0.515342 -0.157271 1.00752 0.126891"];
     return;

    case "EL8":
     this.dp = p(-0.929622, 2.80701);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -0.95955 -0.15061 -0.824753 -0.65368 c 0.083026 -0.309857 0.587611 -0.110073 0.996301 0.089269"];
     return;
  }

  switch (_head) {
    case "SW":
     this.dp = p(-1.25157, 3.63128);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.199697 0.630314 -0.958924 0.223651 -0.958924 -0.317933 c 0 -0.514576 0.651141 -0.809813 0.918082 -0.542872 c 0.277434 0.277434 0.00884 0.678774 -0.109561 1.12067"];
     return;

    case "E":
     this.dp = p(-0.87937, 2.64056);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -1.10595 0.082832 -0.776462 -0.487868 c 0.158592 -0.27469 0.588182 -0.242989 0.998262 -0.242989"];
     return;
  }

  this.dp = p(-0.831949, 2.41612);
  this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -1.09575 0.184804 -0.766265 -0.385896 c 0.17532 -0.2918 0.635882 -0.462331 1.03548 -0.569404"];
};

WasedaTeJoshi = function() { WasedaChar.call(this, "WasedaTeJoshi", "〜て", "SW4NW1|SW4CR1", "SW", "CR", "black", false, p(2.0, -1.9)); };
WasedaTeJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜て"] = WasedaTeJoshi;
WasedaChar.dict["テ"] = WasedaTeJoshi;

WasedaTeJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "ER8":
      this.dp = p(-0.818867, 2.49583);
      this.paths = ["m 0 0 c -0.277551 0.665215 -0.707473 2.19577 -1.10117 3.37142 c -0.296738 0.886116 -1.05626 0.752726 -0.934914 0.254343 c 0.105034 -0.431391 0.730349 -0.860052 1.21722 -1.12994"];
      return;

    case "EL16":
      this.dp = p(-0.947424, 2.86587);
      this.paths = ["m 0 0 c -0.243546 0.728041 -0.436664 1.44331 -1.10117 3.37142 c -0.15815 0.5902 -1.20243 0.056788 -0.872945 -0.513912 c 0.17532 -0.2918 0.483816 -0.116946 1.02669 0.00836"];
      return;

    case "SER4":
    case "SER8":
     this.dp = p(-0.869968, 2.60938);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -0.808875 -0.17223 -0.670662 -0.720506 c 0.072752 -0.2886 0.444453 -0.361986 0.901864 -0.041536"];
     return;

    case "EL4":
     this.dp = p(-0.957833, 2.90025);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -1.19367 -0.02736 -0.864187 -0.59806 c 0.17532 -0.291799 0.515342 -0.157271 1.00752 0.126891"];
     return;

    case "EL8":
     this.dp = p(-0.929622, 2.80701);
     this.paths = ["m 0 0 c -0.312294 0.66971 -0.51629 1.45836 -1.10117 3.37142 c -0.15815 0.5902 -0.95955 -0.15061 -0.824753 -0.65368 c 0.083026 -0.309857 0.587611 -0.110073 0.996301 0.089269"];
     return;
  }

  switch (_head) {
    case "SEL":
      this.dp = p(-1.15559, 3.49844);
      this.paths = ["m 0 0 c -0.277551 0.665215 -0.707473 2.19577 -1.10117 3.37142 c -0.296738 0.886116 -0.903111 0.261654 -0.935397 -0.091877 c -0.028512 -0.312216 0.364959 -0.884598 0.64682 -0.829929 c 0.299798 0.058148 0.234156 0.467121 0.234156 1.04882"];
      return;
  }

  this.dp = p(-2.00786, 2.36219);
  this.paths = ["m 0 0 l -1.3681 3.7587 c -0.10953 -0.465502 -0.221256 -0.931004 -0.639765 -1.39651"];
};

WasedaMono = function() { WasedaChar.call(this, "WasedaMono", "もの", "ER16SWR4", "ER", "SWR", "black", false, p(0.0, -0.4)); };
WasedaMono.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["もの"] = WasedaMono;
WasedaChar.dict["物"] = WasedaMono;
WasedaChar.dict["者"] = WasedaMono;

WasedaMono.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(12.4988, 2.77668);
      this.paths = ["m 0 0 c 4.36015 -1.587 15.0808 -3.43036 16 0 c 0.384743 1.43588 -2.71173 3.23246 -3.50116 2.77668"];
      return;
  }

  this.dp = p(13.1716, 2.82843);
  this.paths = ["m 0 0 c 4.36015 -1.587 15.0808 -3.43036 16 0 c 0.384743 1.43588 -2.06328 2.62341 -2.82843 2.82843"];
};

WasedaShorai = function() { WasedaChar.call(this, "WasedaShorai", "将来", "E4GS4", "E", "S", "black", false, p(0.0, -2.0)); };
WasedaShorai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["将来"] = WasedaShorai;

WasedaShorai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2, 4);
  this.paths = ["m 0 0 h 4", "m 2 0 v 4"];
};

WasedaNoJoshi = function() { WasedaChar.call(this, "WasedaNoJoshi", "〜の", "EL8NWL4", "EL", "NWL", "black", false, p(0.0, 0.1)); };
WasedaNoJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜の"] = WasedaNoJoshi;
WasedaChar.dict["乃"] = WasedaNoJoshi;
WasedaChar.dict["ノ"] = WasedaNoJoshi;
WasedaNoJoshi.prototype.loop = function() {
  this.headType = "EL";
  this.tailType = "ELCL4";
  this.model = "EL8CL4";
};
WasedaNoJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "S":
      this.dp = p(4.34089, 1.29313);
      this.paths = ["m 0 0 c 1.80519 0.8805 7.53695 2.62616 8.00001 0 c 0.224917 -1.27558 -3.64618 -3.12103 -3.65142 -1.329 l -0.0077 2.62213"];
      this.loop();
      return;

    case "E":
      this.dp = p(4.34859, -1.65935);
      this.paths = ["m 0 0 c 1.80519 0.8805 7.36342 2.29146 8.00001 0 c 0.318932 -1.14803 -2.15431 -1.65935 -3.65142 -1.65935"];
      return;

    case "SEL":
      this.dp = p(4.34859, 0.8628);
      this.paths = ["m 0 0 c 2.17652 0.7072 7.47292 1.8555 7.9701 0 c 0.308342 -1.15075 -0.523314 -1.88768 -1.29659 -1.92735 c -1.20902 -0.062018 -1.94196 1.36092 -2.32492 2.79015"];
      this.loop();
      return;

    case "SW":
      this.dp = p(4.4742, 0.988213);
      this.paths = ["m 0 0 c 2.17652 0.7072 7.39154 1.95709 7.9701 0 c 0.63838 -2.15946 -1.94012 -2.9497 -2.58118 -1.40814 c -0.217853 0.523873 -0.584299 1.48855 -0.914725 2.39635"];
      this.loop();
      return;
  }

  this.dp = p(4.34859, -1.329);
  this.paths = ["m 0 0 c 1.80519 0.8805 7.53695 2.62616 8.00001 0 c 0.224917 -1.27557 -2.06914 -2.1703 -3.65142 -1.329"];
};

WasedaMoJoshi = function() { WasedaChar.call(this, "WasedaMoJoshi", "〜も", "ER8SWR4", "ER", "SWR", "black", false, p(0.0, -0.6)); };
WasedaMoJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜も"] = WasedaMoJoshi;
WasedaChar.dict["モ"] = WasedaMoJoshi;

WasedaMoJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.3212, 2.3428);
  this.paths = ["m 0 0 c 2.5456 -1.4111 7.48695 -1.60727 7.9924 0.2791 c 0.257836 0.962255 -1.01556 1.92435 -1.6712 2.0637"];
};

WasedaKoto = function() { WasedaChar.call(this, "WasedaKoto", "こと", "S8", "S", "S", "black", false, p(0.0, -4.0)); };
WasedaKoto.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こと"] = WasedaKoto;
WasedaChar.dict["事"] = WasedaKoto;

WasedaKoto.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "S":
    case "SEL":
      this.dp = p(0.314892, 7.53058);
      this.paths = ["m 0 0 v 8 l 0.314892 -0.469422"];
      return;
  }

  this.dp = p(0, 8);
  this.paths = ["m 0 0 v 8"];
};

WasedaAme = function() { WasedaChar.call(this, "WasedaAme", "あめ", "EL4TSE4", "EL", "SE", "black", false, p(0.0, 0.0)); };
WasedaAme.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あめ"] = WasedaAme;
WasedaChar.dict["雨"] = WasedaAme;

WasedaAme.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.75, 1.29904);
  this.paths = ["m 0 0 c 1.0482 0.5573 2.9748 0.5919 4 0", "m 3.25 -1.29904 l 1.5 2.59807"];
};

WasedaFu = function() { WasedaChar.call(this, "WasedaFu", "フ", "NE4F", "NE", "NEF", "black", false, p(0.0, 1.5)); };
WasedaFu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["フ"] = WasedaFu;

WasedaFu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.19615, -2.9);
  this.paths = ["m 0 0 l 3.4641 -2"];
};

WasedaSatsu = function() { WasedaChar.call(this, "WasedaSatsu", "さつ", "CL1NEL8", "CL", "NEL", "black", false, p(1.2, 2.1)); };
WasedaSatsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["さつ"] = WasedaSatsu;

WasedaSatsu.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaShi":
      this.dp = p(5.6479 - 1.7, -5.0854 + 0.9);
      this.paths = ["m-1.7,0.9 c 2.01641 -1.1642 5.6479 -2.7837 5.6479 -5.0854"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.77813, -4.60065);
  this.paths = ["m 0 0 c 0 -0.643115 -0.526286 -0.641808 -0.842072 -0.536627 c -0.273325 0.091037 -0.495096 0.592477 -0.30477 0.808741 c 0.259566 0.294943 0.802626 -0.083512 1.14684 -0.272114 c 2.04111 -1.11836 4.77813 -2.60242 4.77813 -4.60065"];
};

WasedaSuru = function() { WasedaChar.call(this, "WasedaSuru", "する", "P", "P", "P", "black", true, p(0.0, -0.1)); };
WasedaSuru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["する"] = WasedaSuru;

WasedaSuru.prototype.setPaths = function() {
  this.pdp = pp(3, 45);

  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "SE4CR1":
      this.pdp = pp(4, 45);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "":
      this.paths = ["m0,0v0.1"];
      return;
  }
};

WasedaIruP = function() { WasedaChar.call(this, "WasedaIruP", "いる", "P", "P", "P", "black", false, p(0.0, -0.1)); };
WasedaIruP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["いるｐ"] = WasedaIruP;

WasedaIruP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3, 0.1);
};

WasedaKyoh = function() { WasedaChar.call(this, "WasedaKyoh", "きょー", "SW4NE1SW3", "SW", "SW", "black", false, p(1.4, -3.1)); };
WasedaKyoh.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["キョー"] = WasedaKyoh;

WasedaKyoh.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-0.51558, 4.40385);
  this.paths = ["m 0 0 l -1.02607 2.81902 l 1.53657 -1.2342 l -1.02608 2.81903"];
};

WasedaSen = function() { WasedaChar.call(this, "WasedaSen", "せん", "NEL16CL1NE1F", "NEL", "NEF", "black", false, p(0.0, 5.5)); };
WasedaSen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["せん"] = WasedaSen;
WasedaSen.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(14.0776, -10.9133);
  this.paths = ["m 0 0 c 3.00016 -1.8027 11.4445 -6.7149 11.4445 -9.9485 c 0 -1.06838 -1.85336 0.110919 -1.68304 0.69327 c 0.156221 0.534161 1.10548 -0.0205 1.64314 -0.296143 l 0.891005 -0.45399"];
};

WasedaKataP = function() { WasedaChar.call(this, "WasedaKataP", "かた（点）", "P", "P", "P", "black", false, p(0.0, -0.1)); };
WasedaKataP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["かたｐ"] = WasedaKataP;

WasedaKataP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "WasedaNoJoshi_":
      this.dp = p(4.6, -1.1);
      this.paths = ["m4.6,-1.1v0.1"];
      return;
  }

  switch (name_) {
    case "WasedaNoJoshi":
      this.dp = p(4.6, -1.1);
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(1.414, -1.314);
  //this.paths = ["m 0 0", "m 1.414 -1.414 v 0.1"];
};

SvsdMatsu = function() { SvsdChar.call(this, "SvsdMatsu", "まつ", "SER20OR4", "SER", "OR", "black", false, p(0.0, 5.0)); };
SvsdMatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["まつ"] = SvsdMatsu;

SvsdMatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(13.1173, -9.4962);
  this.paths = ["m 0 0 c 4.56521 -6.44915 10.8601 -10 17.3205 -10 c 0.574961 0 0.492127 0.28512 0.450359 0.50737 c -0.05505 0.29292 -0.502791 0.35318 -0.795826 0.40759 c -1.27147 0.23607 -3.03173 0.002 -3.85774 -0.41116"];
};

SvsdMitsu = function() { SvsdChar.call(this, "SvsdMitsu", "みつ", "SWR20OR4", "SWR", "OR", "black", false, p(10.7, -8.6)); };
SvsdMitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["みつ"] = SvsdMitsu;

SvsdMitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-5.90863, 14.0679);
  this.paths = ["m 0 0 c 1.63544 5.6446 -4.02649 12.3735 -7.11992 15.3264 c -0.737515 0.70401 -2.68987 2.58213 -3.4816 1.58293 c -0.280344 -0.35381 0.425106 -0.86744 0.827506 -1.07201 c 0.903274 -0.4592 1.73907 -0.86737 3.86538 -1.76944"];
};

SvsdMutsu = function() { SvsdChar.call(this, "SvsdMutsu", "むつ", "SER20OR4", "SER", "OR", "black", false, p(0.0, -5.1)); };
SvsdMutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["むつ"] = SvsdMutsu;

SvsdMutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(14.7079, 5.15406);
  this.paths = ["m 0 0 c 4.88252 -0.30682 12.0548 2.06311 15.8587 6.29053 c 0.91799 1.02018 1.89085 3.18185 1.10717 3.96553 c -0.45799 0.45799 -1.97133 -4.03228 -2.25796 -5.102"];
};

SvsdMetsu = function() { SvsdChar.call(this, "SvsdMetsu", "めつ", "UER5OR4", "SER", "OR", "black", false, p(0.2, -2.3)); };
SvsdMetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["めつ"] = SvsdMetsu;

SvsdMetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3.08934, 1.72309);
  this.paths = ["m 0 0 c 2.94918 0 3.82119 1.62727 2.53956 3.10928 c -0.65953 0.76264 -2.389 1.8536 -2.70554 1.35262 c -0.26278 -0.41589 2.62743 -2.34569 3.25532 -2.73881"];
};

SvsdMotsu = function() { SvsdChar.call(this, "SvsdMotsu", "もつ", "ER20OR4", "ER", "OR", "black", false, p(0.0, 1.1)); };
SvsdMotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["もつ"] = SvsdMotsu;

SvsdMotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(14.2332, -2.52103);
  this.paths = ["m 0 0 c 6.04386 -2.22628 12.0611 -3.72744 17.6011 -1.7133 c 0.92157 0.33505 2.62112 1.29385 2.06123 2.09889 c -0.41203 0.59245 -3.57782 -1.6567 -5.42905 -2.90662"];
};

WasedaNaiHitei = function() { WasedaChar.call(this, "WasedaNaiHitei", "ない", "XSW3", "XSW", "SW", "black", false, p(1.0, -1.4)); };
WasedaNaiHitei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ないｘ"] = WasedaNaiHitei;

WasedaNaiHitei.prototype.setPaths = function() {
  this.dp = p(-1.0261, 2.819);
  this.paths = ["m 0 0 l -1.0261 2.819"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "E_SW":
      this.pdp = p(-0.5, -1.4);
      this.paths = ["m0,0 l -1.0261 2.819 l 0.25 -0.433"];
      return;
  }

  switch (tail_) {
    case "SCL":
      this.pdp = p(0.5, -1.4);
      return;

    case "E":
      this.pdp = p(-0.5, -1.4);
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
};

WasedaNakuHitei = function() { WasedaChar.call(this, "WasedaNakuHitei", "なくｘ", "XS3", "XS", "S", "black", false, p(0.0, -1.5)); };
WasedaNakuHitei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["なくｘ"] = WasedaNakuHitei;

WasedaNakuHitei.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaWa":
      this.dp = p(-0.8, 3 - 1.3);
  this.paths = ["m-0.8,-1.3v3"];
      return;

    case "WasedaE":
      this.dp = p(-0.8, 3 - 1.8);
  this.paths = ["m-0.8,-1.8v3"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "E":
      this.dp = p(0 - 1, 3 - 1.5);
      this.paths = ["m-1,-1.5v3"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 3);
  this.paths = ["m 0 0 v 3"];
};

WasedaNure = function() { WasedaChar.call(this, "WasedaNure", "ぬれ", "EL8CL4SE1F", "EL", "SEF", "black", false, p(0.0, -0.0)); };
WasedaNure.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぬれ"] = WasedaNure;

WasedaNure.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(8.08703, 3.29605);
  this.paths = ["m 0 0 c 2.13619 0.717134 7.92171 2.05759 7.92171 0 c 0 -0.859357 -1.51314 -1.68308 -2.49222 -1.84485 c -0.67112 -0.107856 -1.78016 -0.06856 -1.95818 0.645703 c -0.239431 1.06718 0.821544 1.45872 2.13619 2.30465 l 0.826508 0.562254"];
      return;
};

WasedaTaxe = function() { WasedaChar.call(this, "WasedaTaxe", "た", "SW8P", "SW", "SWP", "black", false, p(2.7, -3.8)); };
WasedaTaxe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["たぇ"] = WasedaTaxe;

WasedaTaxe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SW":
      this.dp = p(-1.94534, 7.07768);
      this.paths = ["m 0 0 l -2.73616 7.5176", "m -2.39414 6.5779 c 0.318527 0.0853 0.549559 0.22296 0.448806 0.49978"];
      return;
  }

  this.dp = p(-2.29414, 6.5779);
  this.paths = ["m 0 0 l -2.73616 7.5176", "m -2.39414 6.5779 h 0.1"];
};

WasedaFutsu = function() { WasedaChar.call(this, "WasedaFutsu", "ふつ", "CR1NE4F", "CR", "NEF", "black", false, p(1.0, 0.4)); };
WasedaFutsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ふつ"] = WasedaFutsu;

WasedaFutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3.7804, -2.09276);
  this.paths = ["m 0 0 c 0.291272 0.504498 0.06937 0.90074 -0.2404 1.12894 c -0.199503 0.146968 -0.612451 0.144598 -0.740293 -0.06767 c -0.121558 -0.201835 -0.05142 -0.465381 0.272305 -0.652282 l 2.96934 -1.71435"];
};

WasedaToJoshi = function() { WasedaChar.call(this, "WasedaToJoshi", "〜と", "SW4NE1|SW4CL1", "SW", "CR", "black", false, p(1.4, -1.9)); };
WasedaToJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜と"] = WasedaToJoshi;
WasedaChar.dict["ト"] = WasedaToJoshi;

WasedaToJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SEL":
      this.dp = p(-0.839108, 2.2943);
      this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.381794 0.959598 0.585067 0.693272 c 0.266024 -0.348543 -0.005663 -1.09458 -0.217845 -1.69733"];
      return;

    case "":
      this.dp = p(-0.070515, 2.94263);
      this.paths = ["m 0 0 l -1.3681 3.7587 c 0.12032 -0.44904 0.938561 -0.816068 1.29759 -0.816068"];
      return;
  }

  this.dp = p(-1.0434, 2.85288);
  this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.490497 0.87276 0.753496 0.6652 c 0.329153 -0.25977 -0.134344 -0.988445 -0.590566 -1.11069"];
};

WasedaCha = function() { WasedaChar.call(this, "WasedaCha", "ちゃ", "NE8", "NE", "NE", "black", false, p(0.0, 2.4)); };
WasedaCha.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ちゃ"] = WasedaCha;
WasedaCha.prototype.getFilteredPrevTailType = function() {
  return this.getPrevTailType().replace(/^(?:E|NELCL8|NE|ECL|ECL4)$/, "R");
};
WasedaCha.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
      this.dp = p(-2.60455, 7.5641);
      this.paths = ["m 0 0 l -2.60455 7.5641"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "ER":
      this.dp = p(6.05694, -4.0588);
      this.paths = ["m 0 0 l 6.47213 -4.70228 l -0.415188 0.643482"];
      return;
  }

  this.dp = p(6.47213, -4.70228);
  this.paths = ["m 0 0 l 6.47213 -4.70228"];
};

WasedaAi = function() { WasedaChar.call(this, "WasedaAi", "あい", "CR4", "CR", "CR", "black", false, p(1.3, 1.8)); };
WasedaAi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あい"] = WasedaAi;

WasedaAi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SER":
      this.dp = p(1e-05, 1e-05);
      this.paths = ["m 0 0 c 0 -1.33698 -0.132094 -1.80679 0.221672 -2.78599 c 0.365815 -1.01255 1.42997 -1.0661 2.1324 -0.783263 c 0.781613 0.314715 1.41897 1.48997 1.10678 2.2726 c -0.456441 1.14425 -1.70498 1.29666 -3.46085 1.29666"];
      return;

    case "NELCL":
      this.dp = p(0.00058, 1e-05);
      this.paths = ["m 0 0 c -0.166385 -0.78494 -0.61759 -2.50757 0.019479 -3.475 c 0.474014 -0.719821 1.54973 -1.30068 2.36956 -1.03474 c 0.832207 0.269957 1.54531 1.41414 1.33076 2.26232 c -0.355221 1.40427 -1.02903 2.24743 -3.71921 2.24743"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "NER":
      this.dp = p(1e-05, 1e-05);
      this.paths = ["m 0 0 c -2.38175 0 -3.15884 -0.396213 -3.55681 -1.63958 c -0.30127 -0.941255 0.536849 -2.25264 1.47144 -2.57398 c 0.818263 -0.281347 1.95542 0.243556 2.40177 0.984827 c 0.557835 0.926422 0.318104 2.12977 -0.316392 3.22875"];
      return;

    case "ER":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c -1.0994 -0.004 -1.8485 -0.9134 -1.9392 -1.7879 c -0.1001 -0.9638 0.7387 -2.1681 1.6871 -2.3675 c 0.8401 -0.1766 2.03 0.4793 2.2127 1.3182 c 0.2446 1.1233 -0.6072 2.4746 -1.9606 2.8372"];
      return;

    case "NEL":
     this.dp = p(0.0005, -0.0002);
     this.paths = ["m 0 0 c -1.0858 0.1812 -2.0236 -0.6348 -2.2786 -1.5095 c -0.2635 -0.9035 0.2846 -2.2025 1.1466 -2.58 c 0.8026 -0.3515 2.1287 0.0457 2.489 0.8443 c 0.4822 1.0686 0.2421 2.4699 -1.3565 3.245"];
     return;
  }

  this.dp = p(0.000582, 1e-05);
  this.paths = ["m 0 0 c -1.05613 -0.310638 -1.54392 -1.45402 -1.39186 -2.35232 c 0.157075 -0.927936 1.21696 -1.85773 2.15739 -1.82135 c 0.875437 0.033866 1.89542 0.969789 1.87131 1.84555 c -0.03227 1.17192 -0.859712 2.32813 -2.63626 2.32813"];
};

WasedaTsuP = function() { WasedaChar.call(this, "WasedaTsuP", "つｐ", "P/X", "P/X", "P/X", "black"); };
WasedaTsuP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["つｐ"] = WasedaTsuP;

WasedaTsuP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "WasedaNoJoshi_WasedaMa":
      this.dp = p(1, 1.5);
      return;
  }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "WasedaNoJoshi_S":
      this.dp = p(2, 1.2);
      return;
  }

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaTsu = function() { WasedaChar.call(this, "WasedaTsu", "つ", "S4CR1", "S", "SCR", "black", false, p(1.1, -2.3)); };
WasedaTsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["つ"] = WasedaTsu;

WasedaTsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_headModel) {
    case "ER4":
      this.dp = p(-0.024474, 3.09364);
      this.paths = ["m 0 0 c -0.046547 1.3329 -0.046547 2.6671 0 4 c 0.019752 0.5656 -0.64819 0.806362 -0.9 0.5588 c -0.405708 -0.398865 0.309068 -1.13811 0.875526 -1.46516"];
      return;

    case "ER8":
      this.dp = p(-7.5e-05, 2.53762);
      this.paths = ["m 0 0 l -9.8e-05 3.29766 c -1.7e-05 0.565945 -0.604486 0.908633 -0.9 0.5588 c -0.39192 -0.463961 0.184286 -1.00005 0.900023 -1.31884"];
      return;

    case "ER16":
      this.dp = p(-0.018172, 3.37002);
      this.paths = ["m 0 0 c -0.0464 1.3278 -0.0464 2.657 0 3.9852 c 0.0295 0.563 -0.472256 0.745747 -0.799617 0.645136 c -0.203352 -0.0625 -0.257223 -0.410116 -0.185902 -0.610544 c 0.130226 -0.36596 0.756585 -0.573104 0.967347 -0.649773"];
      return;

  case "SER4":
  case "SER8":
      this.dp = p(0, 3.62587);
      this.paths = ["m 0 0 v 4 c 0 0.270603 -0.292696 0.556305 -0.540823 0.521833 c -0.349191 -0.048513 -0.710383 -0.609907 -0.532088 -0.914043 c 0.180896 -0.308573 0.648006 -0.279447 1.07291 0.018078"];
      return;

    case "SER16":
      this.dp = p(0, 3.47802);
      this.paths = ["m 0 0 v 4 c 0 0.79209 -1.12546 0.107757 -1.12028 -0.276872 c 0.005139 -0.382227 0.390019 -0.633379 1.12028 -0.245112"];
      return;

    case "EL8":
      this.dp = p(1e-06, 3.35582);
      this.paths = ["m 0 0 v 3.66158 c 0 0.273546 -0.337487 0.360033 -0.550099 0.332925 c -0.322151 -0.041074 -0.813523 -0.401295 -0.68027 -0.697457 c 0.168472 -0.374435 0.789227 -0.084576 1.23037 0.058769"];
      return;

    case "EL16":
      this.dp = p(-0, 3.58471);
      this.paths = ["m 0 0 v 4 c 0 0.432637 -0.473318 0.444044 -0.745565 0.381958 c -0.270169 -0.061612 -0.612106 -0.40788 -0.502388 -0.662339 c 0.165665 -0.384214 0.548711 -0.322273 1.24795 -0.134912"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(-0.183611, 3.81343);
      this.paths = ["m 0 0 v 3.31915 c 0 0.565945 -0.606958 0.846547 -0.939944 0.532171 c -0.40199 -0.379524 0.326342 -1.16196 0.731708 -1.03901 c 0.319438 0.096886 0.271919 0.321709 0.024625 1.00112"];
      return;

    case "SEL":
    case "S":
      this.dp = p(0, 3.31915);
      this.paths = ["m 0 0 v 3.31915 c 0 0.565945 -0.567037 0.8732 -0.9 0.5588 c -0.263693 -0.248921 -0.016341 -0.889627 0.231761 -1.07571 c 0.307662 -0.23076 0.668239 0.056411 0.668239 0.516914"];
      return;

    case "E":
     this.dp = p(0, 3.06187);
     this.paths = ["m 0 0 v 3.58386 c 0 0.79209 -1.14634 0.276059 -1.19101 -0.120459 c -0.046901 -0.416323 0.45875 -0.401525 1.19101 -0.401525"];
     return;

    case "NER":
      this.dp = p(0, 2.75199);
      this.paths = ["m 0 0 v 4 c 0 0.565945 -0.312067 0.973945 -0.617369 0.81969 c -0.642007 -0.324375 0.115073 -1.35035 0.617369 -2.0677"];
      return;
  }

  this.dp = p(0, 2.31029);
  this.paths = ["m 0 0 v 3.31915 c 0 0.565945 -0.567037 0.8732 -0.9 0.5588 c -0.59069 -0.5576 0.559666 -0.978163 0.9 -1.56766"];
};

WasedaTai = function() { WasedaChar.call(this, "WasedaTai", "たい", "S4", "S", "S", "black", false, p(0.0, -2.0)); };
WasedaTai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["たい"] = WasedaTai;
WasedaTai.prototype.setPaths = WasedaU.prototype.setPaths;


WasedaKokoro = function() { WasedaChar.call(this, "WasedaKokoro", "こころ", "E8SW4F", "E", "SWF", "black", false, p(0.0, -1.9)); };
WasedaKokoro.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こころ"] = WasedaKokoro;
WasedaChar.dict["心"] = WasedaKokoro;

WasedaKokoro.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  this.dp = p(6.09788, 5.4882);
  this.paths = ["m 0 0 h 8 l -1.36808 3.7588"];
};

WasedaShimi = function() { WasedaChar.call(this, "WasedaShimi", "しみ", "NER4SWR4", "NER", "SWR", "black", false, p(0.0, 0.9)); };
WasedaShimi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しみ"] = WasedaShimi;

WasedaShimi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.46028, 0.84309);
  this.paths = ["m 0 0 c 0 -0.77936 1.55441 -3.81196 2.64239 -3.08873 c 1.08812 0.7233 -0.141632 3.28388 -1.18211 3.93182"];
};



WasedaShimiru = function() { WasedaChar.call(this, "WasedaShimiru", "しみる", "NER4SWR4S1F", "NER", "SF", "black", false, p(0.0, -0.3)); };
WasedaShimiru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しみる"] = WasedaShimiru;

WasedaShimiru.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.46028, 3.84309);
  this.paths = ["m 0 0 c 0 -0.77936 1.5544 -3.81194 2.64239 -3.08873 c 0.623957 0.41476 0.485758 1.43364 0.05813 2.3496 c -0.318116 0.68139 -0.796401 1.30582 -1.24025 1.58222 v 1"];
};

WasedaRare = function() { WasedaChar.call(this, "WasedaRare", "られｐ", "P/X", "P/X", "P/X", "black"); };
WasedaRare.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["られｐ"] = WasedaRare;

WasedaRare.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = pp(3, 45);
};

WasedaNaru = function() { WasedaChar.call(this, "WasedaNaru", "なる", "EL8S1F", "EL", "SF", "black", false, p(0.0, -1.5)); };
WasedaNaru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["なる"] = WasedaNaru;

WasedaNaru.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(8, 3.5);
  this.paths = ["m 0 0 c 2.04073 0.6631 7.67821 1.825 8 0 v 1.5"];
};


WasedaSore = function() { WasedaChar.call(this, "WasedaSore", "それ", "SWR4F", "SWR", "SWRF", "black", false, p(3.0, -2.3)); };
WasedaSore.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["それ"] = WasedaSore;
WasedaChar.dict["その"] = WasedaSore;
WasedaChar.dict["ので"] = WasedaSore;

WasedaSore.prototype.setPaths = function() {
  this.dp = p(-2.20899, 3.33472).add(pp(2, 160));
  this.paths = ["m 0 0 c 0 1.34814 -0.949482 2.99724 -2.20899 3.33472"];
  
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "S":
    case "SW":
      this.paths = ["m 0 0 c 1.81463 1.04767 -0.949482 2.99724 -2.20899 3.33472"];
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "E":
      this.dp.move(0, 1);
      return;

    case "ER":
      this.dp.move(0, 1);
      return;
  }
};

WasedaIi = function() { WasedaChar.call(this, "WasedaIi", "いい", "ER4CR1", "ER", "CR", "black", false, p(0.0, 0.0)); };
WasedaIi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["いい"] = WasedaIi;
WasedaChar.dict["いー"] = WasedaIi;

WasedaIi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "S":
      this.dp = p(2.94239, -0.808685);
      this.paths = ["m 0 0 c 1.58483 -0.915 4.015 -1.2411 4.015 0 c 0 0.5987 -0.34418 0.768118 -0.578204 0.674035 c -0.240946 -0.096865 -0.352824 -0.399131 -0.437474 -0.644635 c -0.091272 -0.264712 -0.056929 -0.562771 -0.056929 -0.838085"];
      return;
  }

  this.dp = p(3.49392, -0.703698);
  this.paths = ["m 0 0 c 1.58483 -0.915 4.015 -1.2411 4.015 0 c 0 0.5987 -0.628513 0.911776 -0.97446 0.708 c -0.196365 -0.115666 -0.00415 -0.468157 0.08332 -0.6786 c 0.101695 -0.244663 0.241157 -0.459951 0.370056 -0.733098"];
};

WasedaRouP = function() { WasedaChar.call(this, "WasedaRouP", "ろうｐ", "P/X", "P/X", "P/X", "black"); };
WasedaRouP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ろうｐ"] = WasedaRouP;

WasedaRouP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaTa":
      if (tail_ == "NE") {
        this.dp = p(-2.5, -0.8);
      }
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaGimonhu = function() { WasedaChar.call(this, "WasedaGimonhu", "？", "ER4SW16CL1SW2F", "ER", "SWF", "black", false, p(2.1, -6.6)); };
WasedaGimonhu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["？"] = WasedaGimonhu;

WasedaGimonhu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-2.06188, 14.1924);
  this.paths = ["m 0 0 c 2.14052 -1.14857 5.21408 -1.67903 4.56489 0.971632 c -0.726788 2.96752 -2.59634 6.85911 -3.54381 9.79562 c -0.247255 0.76633 -0.916437 2.09919 -0.172129 2.34985 c 0.769432 0.25912 1.78939 -1.58033 1.32778 -2.04194 c -0.649458 -0.649457 -3.71379 2.59938 -4.23862 3.11727"];
};


WasedaWagakuni = function() { WasedaChar.call(this, "WasedaWagakuni", "わが国", "UWL4EL8CL1", "SWL", "EL", "black", false, p(1.8, -2.2)); };
WasedaWagakuni.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["わが国"] = WasedaWagakuni;

WasedaWagakuni.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_model.replace(/([A-Z]+\d+).*/, "$1")) {
    case "EL8":
      this.dp = p(8.45891, 3.28972);
      this.paths = ["m 0 0 c -0.975 0.3745 -1.93925 1.18359 -1.833 2.1089 c 0.131345 1.1438 1.68672 1.68576 2.79777 2.02542 c 2.189 0.6692 7.72796 0.443685 7.72796 -1.47642 c 0 -0.4888 -0.165727 -0.752748 -0.475372 -0.8549 c -0.287317 -0.094786 -0.769478 0.077947 -0.826525 0.375069 c -0.096893 0.504651 0.394685 0.783189 1.06808 1.11165"];
      return;
  }

  //switch (_head) {}

  this.dp = p(8.45891, 3.28972);
  this.paths = ["m 0 0 c -0.975 0.3745 -1.93925 1.18359 -1.833 2.1089 c 0.131345 1.1438 1.68672 1.68576 2.79777 2.02542 c 2.189 0.6692 7.72796 0.443685 7.72796 -1.47642 c 0 -0.4888 -0.335 -0.7721 -0.644 -0.8549 c -0.307 -0.0881 -0.569 0.0282 -0.417 0.3028 c 0.233 0.4034 0.533183 0.82181 0.827183 1.18391"];
};

WasedaKoi = function() { WasedaChar.call(this, "WasedaKoi", "こい", "NE4", "NE", "NE", "black", false, p(0.0, 1.1)); };
WasedaKoi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こい"] = WasedaKoi;
WasedaChar.dict["こく"] = WasedaKoi;
WasedaChar.dict["どこ"] = WasedaKoi;

WasedaKoi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(3.27666, -2.2943);
  this.paths = ["m 0 0 l 3.27666 -2.2943"];
};




WasedaShin = function() { WasedaChar.call(this, "WasedaShin", "しん", "NEL8CL1NE1F", "NEL", "NEF", "black", false, p(0.0, 3.3)); };
WasedaShin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しん"] = WasedaShin;
WasedaShin.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaShin.prototype.setPaths = function() {
  this.dp = p(8.50046, -6.66964);
  this.paths = ["m 0 0 c 2.02885 -1.1246 5.8001 -2.5739 5.8001 -4.8669 c 0 -0.3853 -0.1734 -0.6318 -0.42922 -0.6363 c -0.42275 -0.0148 -1.00026 0.6628 -0.76372 1.0135 c 0.2436 0.3479 0.83805 -0.0702 1.22478 -0.3512 c 0.58759 -0.4114 0.7648 -0.6094 1.3403 -1.0124"];

  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaNihonP":
      this.dp = p(11.1722, -5.8533).move(1.3282199, -0.81634003);
      this.paths = ["m 0 0 c 0 0 2.9996 0.083484 3.96496 -0.175183 c 2.18756 -0.586155 5.8001 -2.5739 5.8001 -4.8669 c 0 -0.3853 -0.1734 -0.6318 -0.42922 -0.6363 c -0.42275 -0.0148 -1.00026 0.6628 -0.76372 1.0135 c 0.2436 0.3479 0.83805 -0.0702 1.22478 -0.3512 c 0.58759 -0.4114 0.7648 -0.6094 1.3403 -1.0124"];
      return;

    case "WasedaWa":
      this.dp = p(8.78505, -7.03602);
      this.paths = ["m 0 0 c 2.21519 0 5.8001 -2.5739 5.8001 -4.8669 c 0 -0.3853 -0.1734 -0.6318 -0.42922 -0.6363 c -0.42275 -0.0148 -1.00026 0.6628 -0.76372 1.0135 c 0.2436 0.3479 0.83805 -0.0702 1.22478 -0.3512 c 0.58759 -0.4114 0.7648 -0.6094 1.3403 -1.0124"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL8":
      this.dp.x += 2;
      //this.dp.y += 0;
      return;
  }

  //switch (_head) {}

};

WasedaShite = function() { WasedaChar.call(this, "WasedaShite", "して", "SE3", "SE", "SE", "black", false, p(0.0, -1.0)); };
WasedaShite.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["して"] = WasedaShite;

WasedaShite.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SE":
      this.dp = p(1.9555, 1.869);
      this.paths = ["m 0 0 l 2.2082 2.0306 l -0.2527 -0.1616"];
      return;
  }

  this.dp = p(2.2082, 2.0306);
  this.paths = ["m 0 0 l 2.2082 2.0306"];
};

WasedaNuxe = function() { WasedaChar.call(this, "WasedaNuxe", "ぬぇ", "EL8CL4P", "EL", "P", "black", false, p(0.0, 0.6)); };
WasedaNuxe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぬぇ"] = WasedaNuxe;

WasedaNuxe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(6.60272, 0.538417);
  this.paths = ["m 0 0 c 2.1804 0.6666 7.9407 1.3575 7.9407 -0.5553 c 0 -0.6526 -0.6922 -1.1997 -1.2952 -1.2952 c -0.973 -0.1891 -2.783 0.1277 -2.7311 1.1176 c 0.0739 1.4112 2.68832 1.27132 2.68832 1.27132"];
};

WasedaKetsu = function() { WasedaChar.call(this, "WasedaKetsu", "けつ", "SE8", "SE", "SE", "black", false, p(0.0, -3.3)); };
WasedaKetsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["けつ"] = WasedaKetsu;

WasedaKetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(4.58861, 6.55322);
  this.paths = ["m 0 0 l 4.58861 6.55322"];
};

WasedaHoku = function() { WasedaChar.call(this, "WasedaHoku", "ほく", "BSEL16", "BSEL", "SEL", "black", false, p(0.0, -6.9)); };
WasedaHoku.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ほく"] = WasedaHoku;

WasedaHoku.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "E":
    case "EL":
      this.dp = p(9.06067, 10.0957);
      this.paths = ["m 0 0 c 0.590457 0 1.06066 -0.567771 1.06066 -1.06066 c 0 10.815 5.03594 16.2903 8.00001 11.1564"];
      return;
  }

  this.dp = p(9.06066, 12.7957);
  this.paths = ["m 0 0 c 0.590457 0 1.06066 -0.567771 1.06066 -1.06066 c 0 7.6983 1.3202 13.8564 8 13.8564"];
};

WasedaHur = function() { WasedaChar.call(this, "WasedaHur", "ふｒ", "SEL8NWL4", "SEL", "NWL", "black", false, p(0.0, -2.9)); };
WasedaHur.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ふｒ"] = WasedaHur;

WasedaHur.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.50256, 3.1499);
  this.paths = ["m 0 0 c -0.07043 2.58414 0.53302 5.79481 3.4745 5.8548 c 0.49614 0.01012 1.24982 -0.228218 1.3021 -0.7217 c 0.105953 -1.00018 -1.35034 -1.7699 -2.27404 -1.9832"];
};


WasedaNan = function() { WasedaChar.call(this, "WasedaNan", "なん", "EL8F", "EL", "ELF", "black", false, p(0.0, 0.1)); };
WasedaNan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["なん"] = WasedaNan;
WasedaChar.dict["何"] = WasedaNan;

WasedaNan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(9.26562, -1.10113);
  this.paths = ["m 0 0 c 2.62139 0.8517 6.64345 1.35655 8 0"];
};

WasedaNakaP = function() { WasedaChar.call(this, "WasedaNakaP", "なかｐ", "P/X", "P/X", "P/X", "black"); };
WasedaNakaP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["なかｐ"] = WasedaNakaP;
WasedaChar.dict["中ｐ"] = WasedaNakaP;

WasedaNakaP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) {
    case "WasedaNoJoshi_WasedaO":
      this.dp = p(1, 1.5);
      return;
  }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "WasedaNoJoshi_EL":
      this.dp = p(1, 1.3);
      return;
  }

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaLtsuP = function() { WasedaChar.call(this, "WasedaLtsuP", "っ", "P/X", "P/X", "P/X", "black"); };
WasedaLtsuP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["っ"] = WasedaLtsuP;

WasedaLtsuP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) { }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) {
    case "WasedaKetsu_SW":
      this.dp = p(-1, -3.3);
      return;
  }

  //switch (name_) {}
  this.tailType = this.getPrevTailType() + "P";

  switch (model_ + "_" + _name) {
    case "SEL8_WasedaTen2":
     this.dp = p(-4.2, -0.7);
     return;

    case "E16CL1_WasedaTen2":
     this.dp = p(-7.5, 0.6);
     return;

    case "ER16CR1_WasedaSai":
    case "ER16CR1_WasedaSei":
      this.dp = p(-7, -1);
      return;
  }

  switch (model_ + "_" + _model) {
    case "EL16_E8CL4":
      this.dp = p(-7.6, 4.8);
      return;
  }

  switch (model_ + "_" + _headModel) {
    case "EL8_SW8":
      this.dp = p(-2.5, -0.8);
      return;

    case "ER4_SW4":
      this.dp = p(-1.0, -1.8);
      return;

    case "SEL8_SWL16":
      this.dp = p(-1.5, -3);
      return;

    case "NEL8CL1_SWL8":
      this.dp = p(-1.5, 3);
      return;

    case "NEL8CL1_SWL16":
      this.dp = p(-1.5, 0.8);
      return;

    case "NE8OWL4_E4":
      this.dp = p(-4.2, 2.1);
      return;

    case "NEL8CL1_E4":
      this.dp = p(-3, 2);
      return;

    case "E16CL1_SW4":
      this.dp = p(-5.5, -1.5);
      return;

    case "E16CL1_SE3":
      this.dp = p(-6, 0);
      return;
  }

  switch (model_ + "_" + _head) {
    case "NEL8CL1_SW":
      this.dp = p(-1.5, 0.5);
      return;

    case "E8_SL":
      this.dp = p(-3, -2);
      return;

    case "E8_SWL":
      this.dp = p(-2, -1.5);
      return;

    case "E16_SWL":
      this.dp = p(-6, -2);
      return;

    case "EL8CL1_SWL":
      this.dp = p(-2, -1.5);
      return;

    case "EL8_SWL":
      this.dp = p(-2, -1);
      return;

    case "SER8CR1_SWL":
      this.dp = p(0, -3.2);
      return;

    case "E8CL1_SWL":
      this.dp = p(-1.7, -1.6);
      return;

    case "SWL8_E":
      this.dp = p(-1.5, -3.8);
      return;

    case "SL8_SR":
      this.dp = p(0.7, -4.1);
      return;

    case "NEL16CL8_NE":
     this.dp = p(-1, 3);
     return;

    case "E16CL1_E":
      this.dp = p(-6.5, 2);
      return;

    case "NEL8CL1_E":
      this.dp = p(-4, 1.5);
      return;

    case "SEL8CL4_E":
      this.dp = p(-2, 0);
      return;

    case "SER8CR1_E":
      this.dp = p(-3, -2);
      return;

    case "NE16CL1_SWR":
      this.dp = p(-4, 3.5);
      return;

    case "NE16_SWR":
      this.dp = p(-4, 3.5);
      return;

    case "NE16_E":
      this.dp = p(-6.5, 5.5);
      return;

    case "SW8CR1_E":
      this.dp = p(-1, -2.5);
      return;

    case "SW16_E":
      this.dp = p(1.4, -7.3);
      return;

    case "ER16_E":
      this.dp = p(-8, 2.0);
      return;

    case "ER16_SW":
      this.dp = p(-6.3, -3.0);
      return;

    case "SEL16_NEL":
      this.dp = p(-8.3, -3.1);
      return;

    case "SEL8CL1_NE":
      this.dp = p(-3.7, 0);
      return;

    case "SEL8CL1_NEL":
      this.dp = p(-4.2, -0.5);
      return;

    case "SEL8_E":
      this.dp = p(-5.7, -2.2);
      return;

    case "SEL8CL1_E":
      this.dp = p(-4.8, -2.3);
      return;

    case "NEL16_E":
      this.dp = p(-5.5, 5.5);
      return;

    case "NEL16_SW":
      this.dp = p(-3.7, 4.4);
      return;

    case "NEL8_E":
      this.dp = p(-3.6, 2.6);
      return;

    case "EL4_SW":
      this.dp = p(-1.4, -0.8);
      return;

    case "ER8_SW":
      this.dp = p(-2.8, -2.4);
      return;

    case "E8CL4_SWR":
      this.dp = p(0, -2.4);
      return;

    case "SE4_E":
      this.dp = p(-2.7, -1.2);
      return;

    case "NER8_SW":
      this.dp = p(-2.5, -0.4);
      return;

    case "EL16CL1_NE":
      this.dp = p(-8.6, 2.0);
      return;

    case "E8_SW":
      this.dp = p(-3.0, -1.7);
      return;

    case "E16_E":
      this.dp = p(-8, 2);
      return;

    case "ER4_SW":
      this.dp = p(-1.0, -2.4);
      return;

    case "ER16CR1_E":
      this.dp = p(-7.4, 3.6);
      return;

    case "E8_EL":
    case "E8_ER":
    case "E8_E":
      this.dp = p(-4, 2);
      return;

    case "E8_SWR":
      this.dp = p(-3.5, -1.8);
      return;

    case "E16_SW":
      this.dp = p(-6.6, -2.0);
      return;

    case "EL4_EL":
    case "EL4_ER":
    case "EL4_E":
      this.dp = p(-2, 2);
      return;

    case "EL8_EL":
    case "EL8_ER":
    case "EL8_E":
      this.dp = p(-4, 2.5);
      return;

    case "EL16CL1_SW":
      this.dp = p(-5, -1.2);
      return;

    case "ER8_EL":
    case "ER8_ER":
    case "ER8_E":
      this.dp = p(-4, 2);
      return;

    case "ER8_SW":
      this.dp = p(-2.8, -2.4);
      return;

    case "NEL8_E8":
      this.dp = p(-4, 2.5);
      return;
    
    case "NEL8_NEL":
      this.dp = p(-2, 4.5);
      return;

    case "EL8CL1_E":
      this.dp = p(-3.2, 1.9);
      return;

    case "SW8_SW":
      this.dp = p(2.5, -3.2);
      return;

    case "SW4_SW":
      this.dp = p(1.7, -1.1);
      return;
  }

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaXter = function() { WasedaChar.call(this, "WasedaXter", "てｒ", "SW4CR1S1F", "SW", "SF", "black", false, p(2.2, -3.4)); };
WasedaXter.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜てｒ"] = WasedaXter;

WasedaXter.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-1.3681, 6.7587);
  this.paths = ["m 0 0 l -1.3681 3.7587 c -0.122467 0.336465 -0.559886 0.222285 -0.71422 0.04051 c -0.272069 -0.320444 -0.144722 -1.20264 0.274697 -1.23081 c 0.422001 -0.028346 0.439523 0.770494 0.439523 1.1903 v 1"];
};

CharSeparator = function() { Char.call(this, "CharSeparator", "", "-", "-", "-", "black", false, p(0, 0)); };
CharSeparator.prototype = Object.create(Char.prototype);
CharSeparator.prototype.setPaths = function() {
  this.paths = [""];
  this.model = this.getNextModel();
  this.headType = this.getNextHeadType();
  this.tailType = this.getPrevTailType();
};
CharSeparator.prototype.updatePenPos = function(pos) {};
Char.dict["/"] = CharSeparator;
Char.dict["／"] = CharSeparator;

SvsdYatsu = function() { SvsdChar.call(this, "SvsdYatsu", "やつ", "NE20OL4", "NE", "OL", "black", false, p(0.0, 5.4)); };
SvsdYatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["やつ"] = SvsdYatsu;

SvsdYatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(13.2372, -7.64248);
  this.paths = ["m 0 0 l 15.8775 -9.1669 c 0 0 1.30462 -0.68562 1.27984 -1.29109 c -0.0059 -0.14499 -0.185598 -0.28339 -0.330705 -0.28309 c -1.58064 0.003 -3.02363 2.11847 -3.58951 3.0986"];
};

SvsdYutsu = function() { SvsdChar.call(this, "SvsdYutsu", "ゆつ", "SE20OL4", "SE", "OL", "black", false, p(0.0, -4.9)); };
SvsdYutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ゆつ"] = SvsdYutsu;

SvsdYutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(13.4198, 7.74791);
  this.paths = ["m 0 0 l 16.1554 9.32735 c 0 0 1.22323 0.68972 1.4848 0.26066 c 0.13634 -0.22365 -0.26174 -0.47412 -0.47533 -0.62575 c -1.07012 -0.75971 -2.93735 -1.21435 -3.74515 -1.21435"];
};

SvsdYotsu = function() { SvsdChar.call(this, "SvsdYotsu", "よつ", "EL20OL4", "EL", "OL", "black", false, p(0.0, 0.4)); };
SvsdYotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["よつ"] = SvsdYotsu;

SvsdYotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(15.4081, 0);
  this.paths = ["m 0 0 c 2.64281 0 13.1193 0 17.9678 0 c 0.71952 0 1.98675 0.15058 2.01639 -0.54504 c 0.014 -0.32819 -0.59801 -0.31875 -0.92598 -0.33714 c -1.24979 -0.0701 -2.72008 0.34519 -3.65016 0.88218"];
};

SvsdRatsu = function() { SvsdChar.call(this, "SvsdRatsu", "らつ", "NER5OR4", "NER", "OR", "black", false, p(0.0, 1.3)); };
SvsdRatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["らつ"] = SvsdRatsu;

SvsdRatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.5851, -1.76928);
  this.paths = ["m 0 0 c 0.513252 -0.90109 1.79971 -2.53552 3.96161 -2.51854 c 0.377434 -0.008 0.554628 0.20694 0.533948 0.43573 c -0.03616 0.40001 -0.659862 0.51008 -1.055 0.58207 c -0.614812 0.11202 -1.47777 -0.0505 -1.85547 -0.26854"];
};

SvsdRitsu = function() { SvsdChar.call(this, "SvsdRitsu", "りつ", "SWR5OR4", "SWR", "OR", "black", false, p(2.7, -2.1)); };
SvsdRitsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["りつ"] = SvsdRitsu;

SvsdRitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0.331788, 1.89725);
  this.paths = ["m 0 0 c 1.15136 1.67415 -0.169548 3.31663 -2.06838 4.15665 c -0.140949 0.0624 -0.386058 0.16229 -0.523866 0.0536 c -0.124886 -0.0985 -0.131432 -0.32928 -0.06326 -0.47301 c 0.501195 -1.05666 2.37271 -1.65789 2.98729 -1.83999"];
};

SvsdRutsu = function() { SvsdChar.call(this, "SvsdRutsu", "るつ", "SER5OR4", "SER", "OR", "black", false, p(0.0, -1.4)); };
SvsdRutsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["るつ"] = SvsdRutsu;

SvsdRutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.28119, 0.25799);
  this.paths = ["m 0 0 c 1.35132 0.0709 4.07474 0.17402 4.32854 1.94414 c 0.0243 0.16952 0.14461 0.62662 -0.0752 0.74455 c -0.15597 0.0837 -0.3374 -0.13007 -0.46969 -0.24766 c -0.66025 -0.58686 -1.50246 -2.18304 -1.50246 -2.18304"];
};

SvsdRetsu = function() { SvsdChar.call(this, "SvsdRetsu", "れつ", "SR5OR4", "SR", "OR", "black", false, p(0.3, -2.4)); };
SvsdRetsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["れつ"] = SvsdRetsu;

SvsdRetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(0.79734, 2.38926);
  this.paths = ["m 0 0 c 1.01264 1.83714 1.04211 3.39163 0.29607 4.59062 c -0.17797 0.28602 -0.36885 0.35728 -0.54144 0.25673 c -0.16726 -0.0974 -0.0856 -0.39051 -0.0423 -0.5792 c 0.16161 -0.70494 0.5966 -1.39048 1.08501 -1.87889"];
};

SvsdRotsu = function() { SvsdChar.call(this, "SvsdRotsu", "ろつ", "ER5OR4", "ER", "OR", "black", false, p(0.0, 0.2)); };
SvsdRotsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ろつ"] = SvsdRotsu;

SvsdRotsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(1.81903, -0.64604);
  this.paths = ["m 0 0 c 1.57424 -0.74463 3.2677 -1.13444 4.61923 -0.28187 c 0.27712 0.15999 0.38361 0.35148 0.29156 0.53131 c -0.12455 0.24335 -0.54342 0.13985 -0.81394 0.10043 c -0.82001 -0.11949 -1.78543 -0.71163 -2.27782 -0.99591"];
};

SvsdWatsu = function() { SvsdChar.call(this, "SvsdWatsu", "わつ", "UNL5OL4", "SEL", "OL", "black", false, p(0.0, -1.3)); };
SvsdWatsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["わつ"] = SvsdWatsu;

SvsdWatsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2.95593, 2.39463);
  this.paths = ["m 0 0 c 0.0193 1.23 0.514414 2.9679 1.6525 2.879 c 1.1009 -0.086 1.99765 -0.95863 2.63032 -1.81585 c 0.292705 -0.39659 0.877446 -1.17553 0.444122 -1.41046 c -0.427049 -0.23152 -0.731225 0.78795 -0.925996 1.1253 c -0.327678 0.56755 -0.529934 1.07091 -0.845018 1.61664"];
};

SvsdEnd = function() { SvsdChar.call(this, "SvsdEnd", "おわり", "SW8XSE5PCR10", "-", "-", "black", false, p(8.7, -4.2)); };
SvsdEnd.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["〆"] = SvsdEnd;

SvsdEnd.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(-6.26474, 10.5994);
  this.paths = ["m 0 0 l -4.75585 6.98818", "m -4.36761 2.32939 l 3.78526 2.91174", "m -5.7443 8.64502 c -4.21534 -0.65575 -3.08971 -4.74181 -1.9049 -6.76151 c 1.97567 -3.36783 8.79985 -5.64943 11.3914 -2.72889 c 1.85191 2.08702 -1.04732 5.76824 -2.90456 7.85052 c -1.76614 1.98014 -4.91891 4.09225 -7.10236 3.59425"];
};

SvsdGyo = function() { SvsdChar.call(this, "SvsdGyo", "ぎょ", "HEL10", "HEL", "EL", "black", false, p(0.8, -1.2)); };
SvsdGyo.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["ぎょ"] = SvsdGyo;
SvsdGyo.prototype.setPaths = SvsdKyo.prototype.setPaths;
SvsdGyo.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.29445 1.882 l 1.06066 1.06066"]; };

SvsdGen = function() { SvsdChar.call(this, "SvsdGen", "げん", "SL10CL1", "SL", "CL", "black", false, p(1.5, -4.9)); };
SvsdGen.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["げん"] = SvsdGen;
SvsdGen.prototype.setPaths = SvsdKen.prototype.setPaths;
SvsdGen.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.09972 4.40898 l 1.14907 0.96418"]; };

SvsdLtsu = function() { SvsdChar.call(this, "SvsdLtsu", "っ", "P/X", "P/X", "P/X", "black"); };
SvsdLtsu.prototype = Object.create(SvsdChar.prototype);
SvsdChar.dict["っ"] = SvsdLtsu;

SvsdLtsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
  }

  //switch (model_) {}

  switch (tail_ + "_" + _name) {
  }

  switch (tail_ + "_" + _model) {
  }

  switch (tail_ + "_" + _head) {
    case "NEL_E":
      this.dp = p(-2, 1);
      return;

    case "EL_SWL":
      this.dp = p(-1, -0.5);
      return;
  }

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}
  
  this.dp = p(0, 0);
};

WasedaYa = function() { WasedaChar.call(this, "WasedaYa", "や", "NER8", "NER", "NER", "black", false, p(0.0, 2.6)); };
WasedaYa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["や"] = WasedaYa;

WasedaYa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "S4CR1_E":
    case "SW8CR1_E":
    case "SWR8CR1_E":
      this.dp = p(6.83246, -3.39159);
      this.paths = ["m 0 0 c 0.502296 -0.717349 4.94061 -6.66836 6.83246 -3.39159"];
      return;
  }

  switch (model_) {
    case "S4CR1":
    case "SW8CR1":
    case "SWR8CR1":
      this.dp = p(6.46122, -4.07219);
      this.paths = ["m 0 0 c 0.502296 -0.717349 2.93983 -4.07219 6.46122 -4.07219"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "E":
    case "ER":
    case "NER":
      this.dp = p(6.5532, -4.5886);
      this.paths = ["m 0 0 c 1.60694 -4.415 5.63821 -7.1026 6.5532 -4.5886"];
      return;

    case "S":
      this.dp = p(6.1283, -5.1423);
      this.paths = ["m 0 0 c 1.7415 -4.7848 6.1283 -8.4952 6.1283 -5.1423"];
      return;

    case "SWR":
      this.dp = p(6.12836, -5.1423);
      this.paths = ["m 0 0 c 0.925272 -2.5422 4.24274 -7.02792 6.12836 -5.1423"];
      return;

     case "SW":
      this.dp = p(6.12836, -5.1423);
      this.paths = ["m 0 0 c 0.925272 -2.5422 7.37246 -7.62635 6.12836 -5.1423"];
      return; 
  }

  this.dp = p(6.12836, -5.1423);
  this.paths = ["m 0 0 c 0.925272 -2.5422 3.4945 -5.1423 6.12836 -5.1423"];
};

WasedaYu = function() { WasedaChar.call(this, "WasedaYu", "ゆ", "NER8CR1", "NER", "CR", "black", false, p(0.0, 2.5)); };
WasedaYu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ゆ"] = WasedaYu;
WasedaYu.prototype.filterFlatterModel = function(model) {
  return model.replace(/^(?:S4CR1|SWR8CR1|SWR8)$/, "F");
};
WasedaYu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  switch (model_ + "_" + _model) {}

  switch (this.filterFlatterModel(model_) + "_" + _headModel) {
    case "F_ER16":
      this.dp = p(6.47716, -3.28301);
      this.paths = ["m 0 0 c 0.502296 -0.717349 3.01884 -3.88397 5.63294 -3.88397 c 0.435292 0 0.65908 0.04646 0.772117 0.298136 c 0.221786 0.493797 -0.07416 1.30169 -0.569067 1.52098 c -0.280507 0.124288 -0.831953 -0.03429 -0.855245 -0.340212 c -0.0439 -0.576648 0.798139 -0.651048 1.49642 -0.877941"];
      return;
  }

  //switch (model_ + "_" + _head) { }

  switch (model_) {
    case "S4CR1":
    case "SWR8":
    case "SW8CR1":
    case "SWR8CR1":
      this.dp = p(5.75196, -3.94947);
      this.paths = ["m 0 0 c 0.502296 -0.717349 2.93983 -4.07219 5.92623 -3.95313 c 0.275082 0.010967 0.528444 0.250972 0.536378 0.493884 c 0.00991 0.303312 -0.340825 0.561189 -0.628078 0.659078 c -0.165748 0.056483 -0.43293 0.072514 -0.519219 -0.079859 c -0.189742 -0.335054 0.372153 -0.810639 0.436653 -1.06944"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  switch (_headModel) {
    case "SER4":
    case "SER8":
      this.dp = p(7.10817, -4.04326);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.2753 0 0.693226 0.119753 0.826187 0.394436 c 0.157143 0.324639 0.208516 0.947616 -0.240093 1.05504 c -0.381382 0.091323 -1.00726 0.018505 -1.04696 -0.552937 c -0.037346 -0.537486 0.589636 -0.422723 1.39834 0.0572"];
      return;

    case "ER8":
      this.dp = p(6.4732, -4.6466);
      this.paths = ["m 0 0 c 0.90591 -2.1342 4.22914 -5.639 6.1478 -4.9784 c 0.3033 0.0986 0.4472 0.5423 0.4194 0.86 c -0.0168 0.2412 -0.1721 0.5388 -0.4056 0.6014 c -0.2018 0.0578 -0.57388 -0.0605 -0.61393 -0.2665 c -0.08919 -0.4589 0.47143 -0.6513 0.92553 -0.8631"];
      return;

    case "ER16":
      this.dp = p(7.01492, -4.39604);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.435292 0 0.65908 0.046464 0.772117 0.298136 c 0.221786 0.493797 -0.074155 1.30169 -0.569067 1.52098 c -0.280507 0.124288 -0.831953 -0.034288 -0.855245 -0.340212 c -0.043902 -0.576648 0.798139 -0.651048 1.49642 -0.877941"];
      return;

    case "EL4":
      this.dp = p(6.68613, -4.21205);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.2753 0 0.596885 0.151264 0.632499 0.397763 c 0.074249 0.513899 -0.516593 1.2463 -1.02998 1.16858 c -0.374153 -0.056641 -0.698636 -0.738051 -0.464932 -1.03568 c 0.288434 -0.367325 1.03566 -0.015591 1.37784 0.254277"];
      return;

    case "EL4":
      this.dp = p(6.68613, -4.21205);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.2753 0 0.605464 0.150176 0.632499 0.397763 c 0.051853 0.474857 -0.553506 1.11011 -1.01986 1.00672 c -0.292799 -0.064916 -0.506089 -0.613826 -0.313182 -0.843462 c 0.265095 -0.315569 0.873789 -0.045941 1.21597 0.223927"];
      return;
  }

  switch (_head) {
    case "S":
      this.dp = p(5.49979, -4.94365);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.2753 0 0.632342 0.143832 0.655595 0.39851 c 0.02529 0.276987 -0.290675 0.644354 -0.622742 0.555377 c -0.322919 -0.086526 -0.703768 -0.616207 -0.703768 -0.900532"];
      return;

    case "SE":
      this.dp = p(5.20004, -4.88636);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.449809 0 0.575534 0.297236 0.520514 0.541477 c -0.047618 0.211381 -0.393356 0.26049 -0.607906 0.230203 c -0.364134 -0.051404 -0.57162 -0.349392 -0.883264 -0.661036"];
      return;

    case "E":
      this.dp = p(7.05241, -4.37365);
      this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.435292 0 0.76762 0.114382 0.859944 0.419694 c 0.117295 0.387892 -0.231536 0.915372 -0.614017 1.04926 c -0.341375 0.119501 -1.03024 -0.028985 -1.01246 -0.390234 c 0.028014 -0.56931 0.935673 -0.45537 1.64825 -0.45537"];
      return;
  }

  this.dp = p(5.99643, -4.99334);
  this.paths = ["m 0 0 c 0.9622 -2.5068 3.5566 -4.997 6.1707 -4.997 c 0.2753 0 0.528444 0.250972 0.536378 0.493884 c 0.00991 0.303312 -0.340825 0.56119 -0.628078 0.659078 c -0.165748 0.056483 -0.43293 0.072514 -0.519219 -0.079858 c -0.189742 -0.335054 0.372153 -0.81064 0.436653 -1.06944"];
};

WasedaYo = function() { WasedaChar.call(this, "WasedaYo", "よ", "NER16", "NER", "NER", "black", false, p(0.0, 5.7)); };
WasedaYo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["よ"] = WasedaYo;

WasedaYo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "S4CR1_E":
    case "S4CR1_ER":
    case "S4CR1_NER":
      this.dp = p(13.8564, -8);
      this.paths = ["m 0 0 c 2.03772 -2.91015 12.4544 -13.1706 13.8564 -8"];
      return;

    case "S4CR1_SWR":
     this.dp = p(13.8564, -8);
     this.paths = ["m 0 0 c 2.03772 -2.91015 11.8334 -10.023 13.8564 -8"];
     return;
  }

  switch (model_) {
    case "SW4CL1":
    case "S4CR1":
    case "SW8CR1":
    case "SW16CR1":
      this.dp = p(13.8564, -8);
      this.paths = ["m 0 0 c 2.03772 -2.91015 10.5734 -8 13.8564 -8"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_head) {
    case "SER":
      this.dp = p(8, -13.856);
      this.paths = ["m 0 0 c 0 -4.516 4.0812 -13.856 8 -13.856"];
      return;

    case "S":
      this.dp = p(11.3137, -11.314);
      this.paths = ["m 0 0 c 2.1524 -5.914 11.3137 -16.187 11.3137 -11.314"];
      return;

    case "E":
    case "ER":
    case "NER":
    case "E":
      this.dp = p(13.1064, -9.1772);
      this.paths = ["m 0 0 c 2.22622 -6.1165 12.2962 -13.773 13.1064 -9.1772"];
      return;

    case "SWR":
      this.dp = p(11.3138, -11.3137);
      this.paths = ["m 0 0 c 1.2151 -3.3384 8.91307 -13.7087 11.3138 -11.3137"];
      return;
  }

  this.dp = p(11.3138, -11.3137);
  this.paths = ["m 0 0 c 1.2151 -3.3384 7.9227 -11.3137 11.3138 -11.3137"];
};

WasedaChi = function() { WasedaChar.call(this, "WasedaChi", "ち", "SW8CR1", "SW", "SWCR", "black", false, p(2.9, -3.3)); };
WasedaChi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ち"] = WasedaChi;
WasedaChi.prototype.getFilteredPrevTailType = WasedaTa.prototype.getFilteredPrevTailType;
WasedaChi.prototype.reverse = function() {
  this.headType = "NE";
  this.tailType = "NECL";
  this.model = "NE8CL1";
};
WasedaChi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getFilteredPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "SERCR_SE":
      this.dp = p(6.47839, -4.23201);
      this.paths = ["m 0 0 c 2.26448 -1.53943 4.57194 -3.0056 6.851 -4.4493 c 0.8233 -0.521531 -0.197089 -0.975534 -0.545199 -0.928874 c -0.40377 0.05412 -0.702751 0.270834 0.172589 1.14616"];
      this.reverse();
      return;

    case "R_SW":
      this.dp = p(5.77029, -3.764);
      this.paths = ["m 0 0 c 2.26448 -1.53943 4.57194 -3.0056 6.851 -4.4493 c 0.8233 -0.521531 -0.291622 -1.48413 -0.535556 -0.813953 c -0.143911 0.39538 -0.418539 1.15139 -0.545157 1.49926"];
      return;

  }

  switch (tail_) {
    case "SW":
    case "SERCR":
      this.dp = p(6.47839, -4.23201);
      this.paths = ["m 0 0 c 2.26448 -1.53943 4.57194 -3.0056 6.851 -4.4493 c 0.8233 -0.521531 0.0276 -1.05043 -0.32051 -1.00377 c -0.40377 0.05412 -0.25421 0.870841 -0.0521 1.22106"];
      this.reverse();
      return;
  }

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(-2.31036, 6.31636);
     this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.202216 0.754679 -1.15458 0.014599 -0.808639 -0.584591 c 0.193614 -0.335349 0.62137 -0.336123 1.13568 -0.336123"];
     return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "EL16":
      this.dp = p(-2.37403, 6.49574);
      this.paths = ["m 0 0 c -0.750053 2.06535 -1.82115 5.17387 -2.6374 7.23707 c -0.15815 0.5902 -1.27524 -0.210091 -0.945747 -0.780791 c 0.17532 -0.2918 0.334236 -0.233565 1.20911 0.039462"];
      return;

    case "EL8":
      this.dp = p(-2.40816, 6.59592);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.92536 5.23978 -2.67013 7.33311 c -0.1914 0.53797 -1.11511 -0.474227 -0.940642 -0.862111 c 0.165326 -0.367557 0.820941 0.000902 1.20261 0.124922"];
      return;

    case "SER8":
      this.dp = p(-2.37703, 6.50417);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -0.803672 -0.034311 -0.962284 -0.547128 c -0.121807 -0.393823 0.356004 -0.792615 1.22266 -0.18577"];
      return;

    case "SE4":
      this.dp = p(-2.47531, 6.78101);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.172876 0.428219 -1.02322 0.334473 -0.928669 -0.599675 c 0.06193 -0.611854 0.514077 -0.433059 1.09076 0.143613"];
      return;
  }

  switch (_head) {
    case "SEL":
      this.dp = p(-2.58089, 7.07816);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -0.821381 0.000244 -0.821381 -0.488461 c 0 -0.305512 0.221549 -0.796551 0.523812 -0.752106 c 0.375344 0.055191 0.335438 0.513575 0.354081 1.08166"];
      return;

    case "E":
      this.dp = p(-2.37824, 6.47577);
      this.paths = ["m 0 0 c -0.81073 2.06327 -1.88487 5.08986 -2.62964 7.18319 c -0.26253 0.7379 -0.99705 -0.04434 -0.9737 -0.393647 c 0.0281 -0.42061 0.8453 -0.313774 1.2251 -0.313774"];
      return;

    case "NER":
      this.dp = p(-1.87658, 5.09595);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -0.975197 0.312105 -0.645708 -0.258595 c 0.17532 -0.2918 1.14952 -1.51548 1.40653 -1.88253"];
      return;

    case "S":
      this.dp = p(-2.36802, 6.47881);
      this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -0.768887 -0.237394 -0.709736 -0.525824 c 0.06739 -0.328602 0.979114 -1.02348 0.979114 -0.232439"];
      return;
  }

  this.dp = p(-2.1692, 5.9151);
  this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -1.12987 0.250236 -0.800381 -0.320464 c 0.17532 -0.2918 0.922846 -0.777012 1.26858 -1.00151"];
};

WasedaTe = function() { WasedaChar.call(this, "WasedaTe", "て", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 5.9)); };
WasedaTe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["て"] = WasedaTe;
WasedaTe.prototype.filterReverseTail = WasedaTo.prototype.filterReverseTail;
WasedaTe.prototype.reverse = function() {
  this.headType = "SW";
  this.tailType = "SWCR";
  this.model = "SW16CR1";
};
WasedaTe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();
  const _headModel = this.getNextHeadModel();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (this.filterReverseTail(tail_) + "_" + _head) {
    case "R_E":
      this.dp = p(-6.37683, 13.6597);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.09104 9.86559 -6.736 14.4468 c -0.179184 0.310355 -0.444977 0.311439 -0.668965 0.23575 c -0.243504 -0.08228 -0.515167 -0.405054 -0.422731 -0.644889 c 0.179727 -0.466321 0.720884 -0.377918 1.45086 -0.377918"];
      this.reverse();
      return;

    case "R_SEL":
      this.dp = p(-6.48119, 13.8888);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.53528 9.63638 -6.736 14.4468 c -0.144 0.4175 -0.558155 0.325094 -0.711 0.1382 c -0.318725 -0.389727 0.074063 -1.36684 0.576681 -1.39596 c 0.266447 -0.01544 0.389128 0.215252 0.389128 0.699766"];
      this.reverse();
      return;
  }

  switch (this.filterReverseTail(tail_) + "_" + _headModel) {
    case "R_EL16":
      this.dp = p(-6.41977, 13.754);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.53528 9.63638 -6.736 14.4468 c -0.144 0.4175 -0.507884 0.268719 -0.711 0.1382 c -0.285466 -0.183436 -0.464691 -0.736651 -0.238539 -0.989623 c 0.283404 -0.317012 0.892513 0.03748 1.26577 0.158654"];
      this.reverse();
      return;

    case "R_EL4":
      this.dp = p(-6.39789, 13.706);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.53528 9.63638 -6.736 14.4468 c -0.204102 0.446135 -0.518911 0.228203 -0.695405 0.07582 c -0.269676 -0.232834 -0.315304 -0.841496 -0.040359 -1.06808 c 0.28371 -0.233811 0.77878 0.09569 1.07387 0.251453"];
      this.reverse();
      return;

    case "R_EL8":
      this.dp = p(-6.39789, 13.706);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.53528 9.63638 -6.736 14.4468 c -0.204102 0.446135 -0.518911 0.228203 -0.695405 0.07582 c -0.269676 -0.232834 -0.315304 -0.841496 -0.040359 -1.06808 c 0.28371 -0.233812 0.520389 0.0716 1.07387 0.251453"];
      this.reverse();
      return;
  }

switch (this.filterReverseTail(tail_)) {
    case "R":
      this.dp = p(-6.16595, 13.196);
      this.paths = ["m 0 0 c -2.34021 4.59727 -4.53528 9.63638 -6.736 14.4468 c -0.144 0.4175 -0.54177 0.310399 -0.711 0.1382 c -0.18615 -0.189418 -0.26913 -0.522237 0.1656 -0.779336 c 0.2863 -0.169316 0.81945 -0.451846 1.11545 -0.609646"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  switch (_headModel) {
    case "SER8":
      this.dp = p(9.86129, -10.5895);
      this.paths = ["m 0 0 c 3.27921 -3.75924 6.74414 -7.38622 10.1917 -10.9293 c 0.4169 -0.3754 0.265013 -0.593038 0.0819 -0.7793 c -0.335104 -0.340867 -1.26764 -0.324578 -1.4285 0.125542 c -0.159424 0.446094 0.651052 0.737856 1.01619 0.99353"];
      return;

    case "NEL8":
      this.dp = p(10.1905, -10.9281);
      this.paths = ["m 0 0 c 3.27921 -3.75924 6.69605 -7.43365 10.1917 -10.9293 c 0.284296 -0.284296 0.296239 -0.598731 0.09601 -0.753949 c -0.370763 -0.287415 -1.18711 -0.01372 -1.3077 0.520174 c -0.110137 0.487631 0.68887 0.512305 1.21046 0.235004"];
      return;

    case "ER8":
      this.dp = p(9.44089, -11.3614);
      this.paths = ["m 0 0 c 3.18352 -3.82759 6.43506 -8.36185 9.85983 -11.7866 c 0.283896 -0.283896 0.308413 -0.649239 0.0819 -0.7793 c -0.538315 -0.309094 -1.66415 0.502697 -1.50137 1.10172 c 0.087916 0.323534 0.495585 0.317048 1.00053 0.102812"];
      return;

    case "EL8":
      this.dp = p(9.7548, -10.558);
      this.paths = ["m 0 0 c 3.27921 -3.75924 6.74414 -7.38622 10.1917 -10.9293 c 0.345553 -0.355127 0.293862 -0.62667 0.0819 -0.7793 c -0.369512 -0.266079 -1.18606 0.11442 -1.24318 0.566167 c -0.038915 0.307798 0.299442 0.446353 0.724379 0.584433"];
      return;
  }

  switch (_head) {
    case "S":
      this.dp = p(9.53261, -10.2511);
      this.paths = ["m 0 0 c 3.27921 -3.75924 6.74414 -7.38622 10.1917 -10.9293 c 0.22987 -0.236239 0.221307 -0.617198 0.04275 -0.828242 c -0.08826 -0.104319 -0.297177 -0.127937 -0.407246 -0.04696 c -0.424524 0.312325 -0.294591 0.962206 -0.294591 1.55342"];
      return;

    case "E":
      this.dp = p(9.44089, -11.3614);
      this.paths = ["m 0 0 c 3.18352 -3.82759 6.43507 -8.36184 9.85983 -11.7866 c 0.198628 -0.198628 0.00422 -0.529659 -0.371598 -0.529659 c -0.483905 0 -1.08294 0.473757 -1.01318 0.734094 c 0.075174 0.280554 0.576248 0.220765 0.965835 0.220765"];
      return;

    case "SW":
      this.dp = p(8.756, -10.6403);
      this.paths = ["m 0 0 c 3.18352 -3.82759 6.43506 -8.36185 9.85983 -11.7866 c 0.498821 -0.498818 0.294125 -1.04675 -0.109765 -0.8752 c -0.477643 0.202872 -0.659721 0.784118 -0.994069 2.0215"];
      return;
  }

  this.dp = p(9.44089, -11.3614);
  this.paths = ["m 0 0 c 3.18352 -3.82759 6.43506 -8.36185 9.85983 -11.7866 c 0.283896 -0.283896 0.2463 -0.5763 0.0819 -0.7793 c -0.1259 -0.1611 -0.454 -0.2328 -0.606 -0.0959 c -0.3046 0.284 -0.025641 0.992434 0.105159 1.30043"];
};


WasedaAn = function() { WasedaChar.call(this, "WasedaAn", "あん", "EL4F", "EL", "ELF", "black", false, p(0.0, 0.3)); };
WasedaAn.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あん"] = WasedaAn;

WasedaAn.prototype.setPaths = function() {
  this.dp = p(5.73205, -1);
  this.paths = ["m 0 0 c 1.04821 0.5574 2.97476 0.5919 4 0"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL8":
      this.dp.x += 0.5;
      this.dp.y += 1;
      return;
  }

  //switch (_head) {}
};

WasedaIn = function() { WasedaChar.call(this, "WasedaIn", "い", "ER4NE1F", "ER", "NEF", "black", false, p(0.0, 1.1)); };
WasedaIn.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["いん"] = WasedaIn;

WasedaIn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}


  this.dp = p(6.82842, -2.82842);
  this.paths = ["m 0 0 c 1.41 -0.8141 4.60079 -1.88614 4 0 l 1.41421 -1.41421"];
};

WasedaUn = function() { WasedaChar.call(this, "WasedaUn", "うん", "S4NE1F", "S", "SF", "black", false, p(0.0, -2.0)); };
WasedaUn.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["うん"] = WasedaUn;
WasedaChar.dict["クン"] = WasedaUn;

WasedaUn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(3.27408, 1.82135);
  this.paths = ["m 0 0 v 4 c 0.345163 -0.471403 0.524663 -0.942807 1.41421 -1.41421"];
};

WasedaEn = function() { WasedaChar.call(this, "WasedaEn", "えん", "SE4NE1F", "SE", "NEF", "black", false, p(0.0, -1.4)); };
WasedaEn.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["えん"] = WasedaEn;

WasedaEn.prototype.setPaths = function() {
  this.dp = p(5.44144, 0.259613);
  this.paths = ["m 0 0 l 2.82843 2.8284 c 0.061958 -0.530441 0.400725 -1.02792 0.957906 -1.44602"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaNodesu":
      this.dp.move(1, 0);
      return;
  }

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
};

WasedaOn = function() { WasedaChar.call(this, "WasedaOn", "おん", "SW4NE1F", "SW", "NEF", "black", false, p(1.4, -1.9)); };
WasedaOn.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["おん"] = WasedaOn;

WasedaOn.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.23346, 2.02191);
  this.paths = ["m 0 0 l -1.36291 3.74445 c 0.499009 -0.454771 0.966662 -0.956577 1.64856 -1.13702"];
};

WasedaKan = function() { WasedaChar.call(this, "WasedaKan", "か", "E8NE1F", "E", "NEF", "black", false, p(0.0, 0.0)); };
WasedaKan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["かん"] = WasedaKan;

WasedaKan.prototype.setPaths = function() {
  this.dp = p(10.6082, -2.3427);
  this.paths = ["m 0 0 h 8 c 0.284462 -0.471403 0.544353 -0.718694 0.959694 -1.01317"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL8":
      this.dp.x += 1;
      return;
  }

  //switch (_head) {}
};

WasedaTan = function() { WasedaChar.call(this, "WasedaTan", "たん", "SW8NE1F", "SW", "NEF", "black", false, p(2.7, -3.8)); };
WasedaTan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["たん"] = WasedaTan;

WasedaTan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-0.170556, 5.1128);
  this.paths = ["m 0 0 l -2.73616 7.5176 l 1.06066 -1.06066"];
};

WasedaKin = function() { WasedaChar.call(this, "WasedaKin", "きん", "E8CL1E1F", "E", "EF", "black", false, p(0.0, 0.5)); };
WasedaKin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きん"] = WasedaKin;

WasedaKin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(11.69346, -0.11825);
  this.paths = ["m 0 0 c 2.82603 -0.1481 5.33402 -0.0931 8.00001 0 c 0.36049 0.0126 0.390319 -0.966503 -0.391581 -0.966503 c -0.72857 0 -0.962131 0.922981 -0.598449 0.869403 c 0.305588 0.002287 0.850517 -0.03855 1.18348 -0.02115 h 1.5"];
};

WasedaSan = function() { WasedaChar.call(this, "WasedaSan", "さん", "NEL8F", "NEL", "NELF", "black", false, p(0.0, 3.5)); };
WasedaSan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["さん"] = WasedaSan;
WasedaSan.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSan.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "NEF";
  this.model = "SWR8NE1F";
};
WasedaSan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  this.dp = p(6.17803, -7.01386);
  this.paths = ["m 0 0 c 2.01641 -1.1642 5.04219 -2.82488 5.6479 -5.0854"];

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
     this.dp = p(-0.28054, 5.8079);
     this.paths = ["m 0 0 c 0 3.2179 -2.31848 6.00458 -3.66998 6.78487 l 1.45759 -0.459329"];
     this.reverse();
     return;

    case "NER":
     this.dp = p(-0.398029, 5.33064);
     this.paths = ["m 0 0 c 1.99117 1.99117 -2.37334 6.02486 -3.42912 7.08064 l 1.29904 -0.75"];
     this.reverse();
     return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL8":
      this.dp.x += 2;
      this.dp.y += 1.5;
      return;
  }

  switch (_head) {
    case "SW":
      this.dp.x += 0.9;
      this.dp.y -= 0.3;
      return;
  }
};

WasedaSun = function() { WasedaChar.call(this, "WasedaSun", "すん", "NEL8CL4NE1F", "NEL", "NEF", "black", false, p(0.0, 3.0)); };
WasedaSun.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["すん"] = WasedaSun;
WasedaSun.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8.24647, -3.99453);
  this.paths = ["m 0 0 c 2.0288 -1.1246 5.7144 -2.6743 5.7144 -4.9674 c 0 -0.974244 -0.76502 -0.992617 -1.28555 -0.91591 c -1.22747 0.180887 -2.85917 1.84545 -2.27958 2.94249 c 0.424822 0.804107 2.16192 -0.014316 2.72331 -0.164741 l 1.40954 -0.513029", "m 8.24647 -3.99453 v 0"];
};

WasedaSon = function() { WasedaChar.call(this, "WasedaSon", "そん", "NEL16F", "NEL", "NELF", "black", false, p(0.0, 6.6)); };
WasedaSon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["そん"] = WasedaSon;
WasedaSon.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "R_SWR":
     this.dp = p(-4.61056, 12.8794);
     this.paths = ["m 0 0 c 0 4.2341 -6.24243 13.3855 -8 13.8564 l 1.45759 -0.459329", "m -4.61056 12.8794 v 0"];
     return;
  }

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(12.0293, -13.1813);
  this.paths = ["m 0 0 c 3.0032 -2.0256 10.3796 -7.82744 11.3137 -11.3137"];
};


WasedaChin = function() { WasedaChar.call(this, "WasedaChin", "ちん", "SW8CR1NE1F", "SW", "NEF", "black", false, p(3.5, -3.8)); };
WasedaChin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ちん"] = WasedaChin;

WasedaChin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.875081, 4.21592);
  this.paths = ["m 0 0 c -0.810734 2.06327 -1.89263 5.14374 -2.6374 7.23707 c -0.15815 0.5902 -1.12987 0.250236 -0.800381 -0.320464 c 0.17532 -0.2918 0.922846 -0.777012 1.26858 -1.00151 l 1.22876 -0.86032"];
};

WasedaTsun = function() { WasedaChar.call(this, "WasedaTsun", "つん", "S4CR1NE1F", "S", "NEF", "black", false, p(1.1, -2.3)); };
WasedaTsun.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["つん"] = WasedaTsun;

WasedaTsun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.77989, 0.86912);
  this.paths = ["m 0 0 v 4 c 0 0.565945 -0.567037 0.8732 -0.9 0.5588 c -0.59069 -0.5576 0.424556 -1.17201 0.9 -1.56766 l 1.14939 -0.963799"];
};

WasedaTen = function() { WasedaChar.call(this, "WasedaTen", "てん", "NE16CL1NE1F", "NE", "NEF", "black", false, p(0.0, 7.3)); };
WasedaTen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["てん"] = WasedaTen;

WasedaTen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(12.3121, -14.6068);
  this.paths = ["m 0 0 c 3.18352 -3.82759 6.43506 -8.36185 9.85983 -11.7866 c 0.283896 -0.283896 0.2463 -0.5763 0.0819 -0.7793 c -0.445776 -0.445776 -1.25069 0.349359 -1.08538 0.758649 c 0.145979 0.361435 0.719126 0.30792 1.1549 -0.183619 l 0.972907 -1.12037"];
};

WasedaTon = function() { WasedaChar.call(this, "WasedaTon", "とん", "NE16NE1F", "NE", "NEF", "black", false, p(0.0, 7.8)); };
WasedaTon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["とん"] = WasedaTon;
WasedaTon.prototype.filterReverseTail = WasedaTo.prototype.filterReverseTail;
WasedaTon.prototype.reverse = function() {
  this.headType = "SW";
  this.tailType = "NEF";
  this.model = "SW1NE1F";
};
WasedaTon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.filterReverseTail(this.getPrevTailType());
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "_SW":
      this.dp = p(-3.87094, 12.5398 - 15);
      this.paths = ["m 0 -15 l -6.76188 14.5009 l 1.17817 -0.928409"];
      this.reverse();
      return;

    case "R_SW":
      this.dp = p(12.4728, -15.5415);
      this.paths = ["m 0 0 c 3.4282 -4.08557 9.06295 -11.3863 10.2846 -12.2567 l 0.610987 -1.36992"];
      this.reverse();
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-3.87094, 12.5398);
      this.paths = ["m 0 0 l -6.76188 14.5009 l 1.17817 -0.928409"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
  }

  this.dp = p(11.4728, -15.5415);
  this.paths = ["m 0 0 c 3.4282 -4.08557 9.06295 -11.3863 10.2846 -12.2567 l 0.610987 -1.36992"];
};

WasedaTonHenki = function() { WasedaChar.call(this, "WasedaTon", "とん", "SW16NE1F", "SW", "NEF", "black", false, p(0.0, -7.8)); };
WasedaTonHenki.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["とんｈ"] = WasedaTonHenki;
WasedaTonHenki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) { }

  switch (tail_) { }
  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
  }

  this.dp = p(-3.87094, 12.5398);
  this.paths = ["m 0 0 l -6.76188 14.5009 l 1.17817 -0.928409"];
};


WasedaHan = function() { WasedaChar.call(this, "WasedaHan", "はん", "SEL8F", "SEL", "SELF", "black", false, p(0.0, -2.6)); };
WasedaHan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["はん"] = WasedaHan;

WasedaHan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(5.68513, 3.25478);
  this.paths = ["m 0 0 c 0 5.4461 2.95975 5.80726 4.18711 4.5799"];
};

WasedaNin = function() { WasedaChar.call(this, "WasedaNin", "にん", "EL8CL1E1F", "EL", "EF", "black", false, p(0.0, -0.2)); };
WasedaNin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["にん"] = WasedaNin;

WasedaNin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(11.419, 0.1906);
  this.paths = ["m 0 0 c 2.192 0.6285 7.941 1.9127 7.941 0 c -0.11 -0.6925 -1.10255 -0.657626 -1.31955 -0.212326 c -0.286 0.587 0.642552 0.402926 1.29755 0.402926 h 1.5"];
};

WasedaThree = function() { WasedaChar.call(this, "WasedaThree", "３", "UER3UER3", "UER", "UER", "black", false, p(0.2, -1.6), 3); };
WasedaThree.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["３"] = WasedaThree;

WasedaThree.prototype.setPaths = function() {
  this.dp = p(-0.06441, 4.54089);
  this.paths = ["m 0 0 c 0.988395 -0.988396 2.61829 -1.19918 3.15608 -0.28985 c 0.48804 0.825209 -0.614458 1.82303 -1.61025 2.38317 c 1.57018 0.0513 1.67679 0.680557 1.54584 1.3526 c -0.212972 1.09299 -1.98772 2.26333 -3.15608 1.09497"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaZero":
      this.dp = p(7, 0.4);
      return;
  }

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

};

WasedaNen = function() { WasedaChar.call(this, "WasedaNen", "ねん", "EL16CL1E1F", "EL", "EF", "black", false, p(0.0, -0.3)); };
WasedaNen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ねん"] = WasedaNen;

WasedaNen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(19.3877, -4e-06);
  this.paths = ["m 0 0 c 2.87017 0.558 15.8213 2.735 15.8213 0 c 0 -0.343 -0.06851 -0.857695 -0.6056 -0.925273 c -0.419685 -0.052806 -1.1064 0.302458 -1.0558 0.715458 c 0.06 0.488 1.14179 0.29675 1.67811 0.274397 l 1.54965 -0.064586"];
};

WasedaHen = function() { WasedaChar.call(this, "WasedaHen", "へん", "SEL16CL1E1F", "SEL", "EF", "black", false, p(0.0, -7.0)); };
WasedaHen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["へん"] = WasedaHen;

WasedaHen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(12.2167, 13.2206);
  this.paths = ["m 0 0 c 0 8.2946 1.4198 15.0205 7.9403 13.753 c 0.752487 -0.201628 0.856192 -0.593229 0.774183 -1.0092 c -0.060678 -0.307776 -0.500448 -0.495727 -0.813355 -0.47342 c -0.337609 0.02407 -0.875154 0.300984 -0.79623 0.63012 c 0.126008 0.52549 0.71422 0.320111 1.58924 0.320111 l 1.52254 -3e-06"];
};


WasedaHon = function() { WasedaChar.call(this, "WasedaHon", "ほん", "SEL16F", "SEL", "SELF", "black", false, p(0.0, -6.1)); };
WasedaHon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ほん"] = WasedaHon;

WasedaHon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(9.55449, 9.898);
  this.paths = ["m 0 0 c 0 10.815 4.99297 14.1634 8 11.1564"];
};

WasedaMan = function() { WasedaChar.call(this, "WasedaMan", "まん", "ER8NE1F", "ER", "NEF", "black", false, p(0.0, 1.3)); };
WasedaMan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["まん"] = WasedaMan;

WasedaMan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(10.5515, -2.55149);
  this.paths = ["m 0 0 c 2.52091 -1.07 8.00001 -2.0823 8.00001 0 l 1.11363 -1.11364"];
};

WasedaMen = function() { WasedaChar.call(this, "WasedaMen", "めん", "ER16CR1NE1F", "ER", "NEF", "black", false, p(0.0, 2.0)); };
WasedaMen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["めん"] = WasedaMen;

WasedaMen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(17.909, -4.05285);
  this.paths = ["m 0 0 c 3.606 -1.1717 15.7617 -2.9503 15.8261 -1.1067 c 0.0156 0.2967 -0.07538 0.613394 -0.2989 0.7788 c -0.220843 0.163427 -0.6803 0.276 -0.8222 0.0575 c -0.2159 -0.374 0.376249 -0.95308 0.7192 -1.2976 l 1.05824 -1.06308"];
};

WasedaMin = function() { WasedaChar.call(this, "WasedaMin", "みん", "ER8CR1NE1F", "ER", "NEF", "black", false, p(0.0, 1.6)); };
WasedaMin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["みん"] = WasedaMin;

WasedaMin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(9.98552, -3.62634);
  this.paths = ["m 0 0 c 1.8517 -0.8635 7.9805 -2.1169 7.9805 -0.558 c 0 0.5964 -0.836363 1.16633 -1.2013 0.8411 c -0.394973 -0.351996 0.197185 -0.837987 0.7552 -1.396 l 1.06841 -1.06841"];
};

WasedaMon = function() { WasedaChar.call(this, "WasedaMon", "もん", "ER16NE1F", "ER", "NEF", "black", false, p(0.0, 1.3)); };
WasedaMon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["もん"] = WasedaMon;

WasedaMon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(18.463, -2.50927);
  this.paths = ["m 0 0 c 4.3601 -1.5869 15.326 -3.8223 16 0 l 1.0721 -1.0721"];
};

WasedaRan = function() { WasedaChar.call(this, "WasedaRan", "らん", "SER8NE1F", "SER", "NEF", "black", false, p(0.0, -3.5)); };
WasedaRan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["らん"] = WasedaRan;

WasedaRan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(6.50756, 4.42063);
  this.paths = ["m 0 0 c 2.26387 1.5852 5.22323 4.8095 4 6.9282 l 1.07181 -1.07182"];
};

WasedaRin = function() { WasedaChar.call(this, "WasedaRin", "りん", "SER8CR1NE1F", "SER", "NEF", "black", false, p(0.0, -3.2)); };
WasedaRin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["りん"] = WasedaRin;

WasedaRin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(6.71297, 2.6092);
  this.paths = ["m 0 0 c 1.8914 1.3243 4.3722 3.7473 4.3371 5.7555 c 0 1.0663 -1.47426 0.793947 -0.909594 0.200281 c 0.278193 -0.292477 0.58521 -0.56792 0.841716 -0.84172 l 1.02553 -1.09467"];
};

WasedaRen = function() { WasedaChar.call(this, "WasedaRen", "れん", "SER16CR1NE1F", "SER", "NEF", "black", false, p(0.0, -6.3)); };
WasedaRen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["れん"] = WasedaRen;

WasedaRen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(11.3748, 8.59813);
  this.paths = ["m 0 0 c 3.8244 2.1199 8.9636 8.2683 8.9017 11.813 c 0 1.0327 -1.51715 0.77874 -0.957311 0.215514 c 0.274919 -0.27658 0.622228 -0.622232 0.902011 -0.902016 l 1.09593 -1.09593"];
};

WasedaWan = function() { WasedaChar.call(this, "WasedaWan", "わん", "UWL4F", "WL", "ELF", "black", false, p(1.8, -1.7)); };
WasedaWan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["わん"] = WasedaWan;

WasedaWan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.59334, 1.78216);
  this.paths = ["m 0 0 c -0.975 0.3745 -1.833 1.0997 -1.833 2.1089 c 0 1.50864 1.8714 1.76055 2.79777 0.834187"];
};

WasedaTateJoshi = function() { WasedaChar.call(this, "WasedaTateJoshi", "タテ", "SW8NW1|SW8CR1", "SW", "SWCR", "black", false, p(3.4, -3.8)); };
WasedaTateJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["タテ"] = WasedaTateJoshi;

WasedaTateJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-3.37592, 6.12109);
  this.paths = ["m 0 0 l -2.73616 7.5176 c -0.10953 -0.465502 -0.221256 -0.931004 -0.639765 -1.39651"];
};

WasedaTatoJoshi = function() { WasedaChar.call(this, "WasedaTatoJoshi", "タト", "SW8NE1|SW8CL1", "SW", "SWCR", "black", false, p(2.7, -3.8)); };
WasedaTatoJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["タト"] = WasedaTatoJoshi;

WasedaTatoJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SEL":
      this.dp = p(-1.91235, 5.25418);
      this.paths = ["m 0 0 l -2.50358 6.86185 c -0.317836 0.87113 0.2161 0.922357 0.436925 0.670392 c 0.238287 -0.271889 0.195005 -1.89811 0.154306 -2.27807"];
      return;
  }

  this.dp = p(-1.43857, 6.70153);
  this.paths = ["m 0 0 l -2.73616 7.5176 c 0.12032 -0.44904 0.938561 -0.816068 1.29759 -0.816068"];
};

WasedaToteJoshi = function() { WasedaChar.call(this, "WasedaToteJoshi", "トテ", "SW16NW1|SW16CR1", "SW", "SWCR", "black", false, p(7.4, -7.3)); };
WasedaToteJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["トテ"] = WasedaToteJoshi;

WasedaToteJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-7.40164, 13.1044);
  this.paths = ["m 0 0 l -6.76188 14.5009 c -0.10953 -0.465502 -0.221256 -0.931004 -0.639765 -1.39651"];
};

WasedaTotoJoshi = function() { WasedaChar.call(this, "WasedaTotoJoshi", "トテ", "SW16NE1|SW16CL1", "SW", "SWCR", "black", false, p(6.8, -7.3)); };
WasedaTotoJoshi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["トト"] = WasedaTotoJoshi;

WasedaTotoJoshi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-5.46429, 13.6848);
  this.paths = ["m 0 0 l -6.76188 14.5009 c 0.12032 -0.44904 0.938561 -0.816068 1.29759 -0.816068"];
};

WasedaHai = function() { WasedaChar.call(this, "WasedaHai", "はい", "SEL4", "SEL", "SEL4", "black", false, p(0.0, -1.5)); };
WasedaHai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["はい"] = WasedaHai;

WasedaHai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "E":
    case "SE":
      this.dp = p(3.27993, 2.29595);
      this.paths = ["m 0 0 c 0 1.61602 1.71103 4.20452 3.27993 2.29595"];
      return;
  }

  this.dp = p(2.09355, 2.9899);
  this.paths = ["m 0 0 c 0 1.47086 0.398951 2.9899 2.09355 2.9899"];
};

WasedaSai = function() { WasedaChar.call(this, "WasedaSai", "さい", "UER4", "SER", "SWR", "black", false, p(0.0, -2.0)); };
WasedaSai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["さい"] = WasedaSai;

WasedaSai.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaRu":
      this.dp = p(0.142444, 5.18992);
      this.paths = ["m 0 0 c 0.913443 0.527376 2.2615 1.90793 2.14035 3.17987 c -0.089577 0.940432 -0.889795 1.71314 -1.99791 2.01005"];
      return;

    case "WasedaMu":
      this.dp = p(0.046693, 4.47939);
      this.paths = ["m 0 0 c 0.607248 0.350595 2.33796 1.60108 2.20226 2.77385 c -0.105315 0.91016 -1.04746 1.40863 -2.15557 1.70554"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (tailModel_) {
  }

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NER":
      this.dp = p(0.2712, 3.98819);
      this.paths = ["m 0 0 c 1.46211 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005"];
      return;
  }

  switch (_name) {
    case "WasedaWai":
      this.dp = p(0.598586, 4.31558);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.669567 2.44078 1.71623 c 0.03261 0.985327 -0.806353 2.0013 -1.84219 2.59935"];
      return;
  }

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "NE":
      this.dp = p(0.342847, 4.43598);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.027281 0.824299 -1.4479 1.98557 -2.09793 2.45784"];
      return;

    case "SW":
     this.dp = p(0.130512, 3.32734);
     this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.31027 1.3492"];
     return;
  }

  this.dp = p(0.271196, 3.9882);
  this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005"];
};

WasedaNai = function() { WasedaChar.call(this, "WasedaNai", "ない", "USL4", "SEL", "NEL", "black", false, p(0.0, -1.3)); };
WasedaNai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ない"] = WasedaNai;

WasedaNai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
     this.dp = p(5.32956, 1e-06);
     this.paths = ["m 0 0 c -2e-06 1.02926 0.631647 3.40084 1.94174 3.41748 c 1.32971 0.016904 3.11022 -2.93666 3.38782 -3.41748"];
     return;
  }

  this.dp = p(4, 0);
  this.paths = ["m 0 0 c -2e-06 1.02926 0.631647 3.40084 1.94174 3.41748 c 1.32971 0.016904 2.05826 -2.19838 2.05826 -3.41748"];
};

WasedaMai = function() { WasedaChar.call(this, "WasedaMai", "まい", "UNR4", "NER", "SER", "black", false, p(4.0, 1.1)); };
WasedaMai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["まい"] = WasedaMai;

WasedaMai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SER":
      this.dp = p(3.27109, -9e-06);
      this.paths = ["m 0 0 c 2e-06 -0.868833 0.93735 -3.04543 2.20691 -3.06896 c 1.19581 -0.022169 1.95185 1.53145 1.06418 3.06895"];
      return;
  }

  this.dp = p(4.00001, 0);
  this.paths = ["m 0 0 c 2e-06 -0.868833 0.93735 -3.04543 2.20691 -3.06896 c 1.19581 -0.022169 1.7931 1.82624 1.7931 3.06896"];
};

WasedaYai = function() { WasedaChar.call(this, "WasedaYai", "やい", "NER4", "NER", "NER", "black", false, p(0.0, 1.4)); };
WasedaYai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["やい"] = WasedaYai;

WasedaYai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.82843, -2.82843);
  this.paths = ["m 0 0 c 0.571351 -2.05731 2.01807 -2.84123 2.82843 -2.82843"];
};

WasedaRai = function() { WasedaChar.call(this, "WasedaRai", "らい", "SER4", "SER", "SER", "black", false, p(0, -1.4)); };
WasedaRai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["らい"] = WasedaRai;

WasedaRai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "S":
      this.dp = p(2.32305, 2.82843);
      this.paths = ["m 0 0 c 0.81036 -0.0128 4.20255 1.7433 2.32305 2.82843"];
      return;
  }

  this.dp = p(2, 3.464);
  this.paths = ["m 0 0 c 1.13193 0.793 2.61161 2.405 2 3.464"];
};

WasedaWai = function() { WasedaChar.call(this, "WasedaWai", "わい", "CR4CR1", "CR", "SWRCR", "black", false, p(1.5, 2.0)); };
WasedaWai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["わい"] = WasedaWai;

WasedaWai.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    case "WasedaSai":
      this.dp = p(1.51909, 1.57335);
      this.paths = ["m 0 0 c 1.03835 -0.845361 3.11212 -2.46435 4.34062 -1.54306 c 0.633337 0.474961 0.393787 1.78357 -0.136912 2.37099 c -0.731323 0.809488 -2.30449 1.09354 -3.23144 0.518348 c -0.461699 -0.286493 -0.717293 -1.4045 -0.483286 -1.5568 c 0.549667 -0.357742 1.5364 0.810466 1.03012 1.78386"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "E":
      this.dp = p(2.12359, -0.74619);
      this.paths = ["m 0 0 c -1.05896 -0.295582 -1.63769 -1.22576 -1.39536 -2.23831 c 0.242336 -1.01255 1.26819 -1.89952 2.25477 -1.83503 c 0.986574 0.064472 1.71532 0.498592 1.78371 1.85806 c 0.054753 1.08832 -0.794309 2.00445 -1.68004 2.16743 c -0.286239 0.052671 -0.702538 0.136749 -0.837521 -0.107656 c -0.354191 -0.641309 0.799393 -0.590684 1.99804 -0.590684"];
      return;
  }

  this.dp = p(1.48248, -0.231002);
  this.paths = ["m 0 0 c -1.05896 -0.295582 -1.63769 -1.22576 -1.39536 -2.23831 c 0.242336 -1.01255 1.26819 -1.89952 2.25477 -1.83503 c 0.986574 0.064472 1.71532 0.498592 1.78371 1.85806 c 0.054753 1.08832 -0.794309 2.00445 -1.68004 2.16743 c -0.286239 0.052671 -0.640095 0.08977 -0.837521 -0.107656 c -0.563004 -0.563004 0.432711 -1.02347 1.35693 -0.075497"];
};

WasedaKen = function() { WasedaChar.call(this, "WasedaKen", "けん", "E16CL1E1F", "E", "EF", "black", false, p(0.0, 0.4)); };
WasedaKen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["けん"] = WasedaKen;

WasedaKen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(18.9887, 0.021416);
  this.paths = ["m 0 0 h 15 c 0.2699 0.0142 0.543088 -0.266663 0.495 -0.495 c -0.06578 -0.312346 -0.584509 -0.486739 -0.8927 -0.346515 c -0.375333 0.170772 -0.689204 0.862934 0.886392 0.862934 l 1.5 -3e-05"];
};

WasedaToki = function() { WasedaChar.call(this, "WasedaToki", "とき", "NE4CL1", "NE", "CL", "black", false, p(0.0, 1.5)); };
WasedaToki.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["とき"] = WasedaToki;

WasedaToki.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "EL8":
      this.dp = p(2.45854, -1.75595);
      this.paths = ["m 0 0 c 0.428695 -0.292419 2.07203 -1.4683 2.88276 -2.06659 c 0.693154 -0.511523 0.141389 -0.747297 -0.087724 -0.761831 c -0.365843 -0.023209 -0.915485 0.197418 -0.944801 0.562823 c -0.021154 0.263681 0.37938 0.439656 0.608313 0.509643"];
      return;
  }

  //switch (_head) {}

  this.dp = p(2.42724, -1.74161);
  this.paths = ["m 0 0 c 0.428694 -0.292419 1.98435 -1.36712 2.79985 -1.9589 c 0.615974 -0.44699 0.0276 -1.05043 -0.32051 -1.00377 c -0.40377 0.05412 -0.25421 0.870841 -0.0521 1.22106"];
};

WasedaXru = function() { WasedaChar.call(this, "WasedaXru", "ル", "S1F", "S", "SF", "black", false, p(0.0, -1.8)); };
WasedaXru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ル"] = WasedaXru;

WasedaXru.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 3.5);
  this.paths = ["m 0 0 v 1.5"];
};

WasedaRazu = function() { WasedaChar.call(this, "WasedaRazu", "らず", "SER8CL1SW1F", "SER", "SWF", "black", false, p(0.0, -4.2)); };
WasedaRazu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["らず"] = WasedaRazu;

WasedaRazu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(1.5292, 8.3633);
  this.paths = ["m 0 0 c 1.94949 1.36506 4.28069 3.92722 4.28069 5.98892 c 0 0.559889 -0.191765 1.04601 0.182881 1.18856 c 0.3024 0.115058 0.577886 -0.229652 0.703805 -0.485287 c 0.177758 -0.360878 0.289692 -1.12548 -0.062444 -1.20523 c -0.206161 -0.046689 -0.297133 0.086901 -0.796583 0.52929 c -0.586499 0.519492 -0.496892 0.459868 -1.2325 1.07903"];
};

WasedaRepeat = function() { WasedaChar.call(this, "WasedaRepeat", "ー", "E30F", "E", "EF", "black", false, p(0.0, 0.0)); };
WasedaRepeat.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["−"] = WasedaRepeat;

WasedaRepeat.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(32, 0);
  this.paths = ["m 0 0 h 30"];
};

WasedaPointSu = function() { WasedaChar.call(this, "WasedaPointSu", "加点す", "P", "P", "P", "black"); };
WasedaPointSu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["すｐ"] = WasedaPointSu;

WasedaPointSu.prototype.setPaths = function() {
  switch (this.getPrevTailType()) {
    case "S":
      this.dp = p(-1, -2.5);
      break;

    default:
      this.dp = p(2, 0);
      break;
  }
};

WasedaKitsu = function() { WasedaChar.call(this, "WasedaKitsu", "きつ", "E8CL1SW1F", "E", "SWF", "black", false, p(0.0, -1.0)); };
WasedaKitsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きつ"] = WasedaKitsu;

WasedaKitsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(5.4549, 3.24131);
  this.paths = ["m 0 0 c 2.489 -0.1305 4.9857 -0.1739 7.472 0 c 0.262 0.0091 0.490341 -0.314183 0.507945 -0.567427 c 0.01981 -0.285044 -0.192141 -0.709166 -0.477863 -0.711641 c -0.499366 -0.00433 -0.754304 0.948304 -0.856603 1.2291 l -0.513035 1.40951"];
};

WasedaKei = function() { WasedaChar.call(this, "WasedaKei", "けい", "E4CL1", "E", "ECL", "black", false, p(0.0, 0.5)); };
WasedaKei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["けい"] = WasedaKei;
WasedaChar.dict["けー"] = WasedaKei;

WasedaKei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
      this.dp = p(2.83239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 -8e-05 -0.794082 -0.56512 -0.868282 c -0.46945 -0.0617 -0.704402 0.868284 -0.13488 0.868282"];
      return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "EL8":
      this.dp = p(3.53239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.332837 -1e-06 0.340269 -0.712144 0.116525 -0.930376 c -0.254939 -0.248658 -0.961877 -0.18417 -1.05645 0.159168 c -0.107627 0.390722 0.431725 0.523328 0.939926 0.771208"];
      return;

    case "SER4":
    case "SER8":
     this.dp = p(3.53239, -6e-06);
     this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.342874 -1e-06 0.452713 -0.450108 0.343218 -0.678788 c -0.147442 -0.307934 -0.816986 -0.500098 -1.00183 -0.213054 c -0.200086 0.310707 0.153239 0.537789 0.658615 0.891842"];
     return;

    case "ER4":
      this.dp = p(3.95818, -0.265638);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 0.63639 -0.845 0.07135 -0.9192 c -0.46945 -0.0617 -1.22447 1.56517 0.354438 0.653568"];
      return;

    case "EL16":
      this.dp = p(2.83239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.338535 -1e-06 0.159297 -0.421038 0.049096 -0.581222 c -0.159232 -0.231454 -0.591555 -0.411037 -0.809681 -0.233986 c -0.211564 0.171724 -0.423242 0.703496 0.060586 0.815208"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(2.83239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 0.63639 -1.01152 0.07135 -1.08572 c -0.46945 -0.0617 -0.602488 0.667653 -0.77135 1.08572"];
      return;

    case "SEL":
      this.dp = p(2.83239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 0.155992 -0.937349 -0.174876 -0.98955 c -0.368855 -0.058195 -0.525124 0.530676 -0.525124 0.98955"];
      return;

    case "S":
      this.dp = p(2.83239, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 0.19768 -0.991237 -0.36736 -1.06544 c -0.46945 -0.0617 -0.33264 0.625494 -0.33264 1.06544"];
      return;

    case "SWR":
      this.dp = p(2.94141, -5e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.532991 0 0.488931 -0.563556 0.148359 -0.881524 c -0.354458 -0.330932 -0.906933 -0.373648 -0.835796 -0.012008 c 0.05887 0.219705 0.096457 0.424093 0.096457 0.893533"];
      return;

    case "SE":
      this.dp = p(3.4806, -6e-06);
      this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.397369 -1e-06 0.421721 -0.495443 0.349046 -0.766671 c -0.095371 -0.35593 -1.09344 -0.926859 -1.09344 -0.227322 c 0 0.269778 0.281272 0.583731 0.692597 0.993993"];
      return;
  }

  this.dp = p(2.83239, -6e-06);
  this.paths = ["m 0 0 l 3.53239 -6e-06 c 0.58408 -1e-06 0.63639 -0.845 0.07135 -0.9192 c -0.46945 -0.0617 -0.653485 0.479321 -0.77135 0.9192"];
};

WasedaSei = function() { WasedaChar.call(this, "WasedaSei", "せい", "UER4CR1", "SER", "SWRCR", "black", false, p(0.5, -2.0)); };
WasedaSei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["せい"] = WasedaSei;
WasedaChar.dict["せー"] = WasedaSei;

WasedaSei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL16":
      this.dp = p(2.33244, 2.55633);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.15241 2.27511 -1.84804 2.17082 c -0.977519 -0.146557 1.34372 -1.35418 1.7397 -1.59263"];
      return;

    case "ER4":
     this.dp = p(2.31944, 2.6106);
     this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.15385 2.4211 -1.80323 2.2471 c -0.418068 -0.112021 -0.182848 -0.431934 0.198974 -0.702335 c 0.328357 -0.232538 1.00728 -0.637693 1.48291 -0.912305"];
     return;

    case "NEL8":
      this.dp = p(2.3458, 2.55275);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.0259 2.1179 -2.16958 2.01005 c -1.46372 -0.138035 1.85098 -1.3147 2.0746 -1.43544"];
      return;

    case "NE16":
     this.dp = p(2.42154, 2.23009);
     this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.36008 2.61733 -2.07746 2.07146 c -0.374145 -0.284689 1.46597 -1.52841 2.05822 -1.81951"];
     return;
  }

  switch (_head) {
    case "E":
      this.dp = p(1.68024, 3.32404);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005 c -1.05081 0.281557 -0.896663 -0.661385 -0.418309 -0.672797 c 0.366975 -0.00875 1.34254 0.00865 1.82735 0.00865"];
      return;

    case "SEL":
      this.dp = p(0.393502, 3.95365);
      this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005 c -1.18796 0.318304 -0.6848 -1.07032 -0.108989 -1.07032 c 0.35376 0 0.231291 0.616636 0.231291 1.03577"];
      return;

    case "SW":
     this.dp = p(0.636504, 3.87422);
     this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005 c -1.05081 0.281557 -0.3532 -1.23526 0.189322 -1.07597 c 0.312785 0.091837 0.365477 0.441386 0.175982 0.962002"];
     return;

    case "S":
     this.dp = p(0.670948, 3.86176);
     this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005 c -1.05081 0.281557 -0.375853 -1.14063 0.099799 -1.08859 c 0.366907 0.040141 0.299949 0.482637 0.299949 0.962157"];
     return;

  }

  this.dp = p(1.26261, 3.59407);
  this.paths = ["m 0 0 c 1.0063 0 2.40614 0.931476 2.44078 1.97814 c 0.03261 0.985327 -1.06147 1.71314 -2.16958 2.01005 c -1.05081 0.281557 -0.859052 -0.913238 -0.3834 -0.8612 c 0.366907 0.040141 0.92501 0.247679 1.37481 0.467079"];
};

WasedaNei = function() { WasedaChar.call(this, "WasedaNei", "ねい", "EL4CL1", "EL", "ELCL", "black", false, p(0.0, 0.1)); };
WasedaNei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ねい"] = WasedaNei;
WasedaChar.dict["ねー"] = WasedaNei;
WasedaChar.dict["ああ"] = WasedaNei;
WasedaChar.dict["あー"] = WasedaNei;

WasedaNei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL8":
      this.dp = p(4, -0);
      this.paths = ["m 0 0 c 1.45511 0.7737 3.78509 1.2188 4 0 c 0.091733 -0.520237 -0.34505 -0.641476 -0.644 -0.625924 c -0.301536 0.015687 -0.682969 0.296768 -0.580554 0.695331 c 0.124144 0.449009 0.643721 0.333193 1.22455 -0.069407"];
      return;

    case "EL8":
     this.dp = p(3.79793, 0.41315);
     this.paths = ["m 0 0 c 1.45511 0.7737 3.78509 1.2188 4 0 c 0.066954 -0.37971 -0.223353 -0.58695 -0.486323 -0.645724 c -0.29857 -0.06673 -0.806149 0.122421 -0.811743 0.428306 c -0.00771 0.421413 0.663097 0.489904 1.096 0.630568"];
     return;
  }

  switch (_head) {
    case "E":
      this.dp = p(3.92902, 0.223385);
      this.paths = ["m 0 0 c 1.45511 0.7737 3.78509 1.2188 4 0 c 0.07358 -0.41729 -0.150943 -0.60715 -0.404288 -0.675116 c -0.358535 -0.096186 -1.01794 0.172208 -0.973538 0.540755 c 0.054027 0.448399 0.77145 0.357746 1.30685 0.357746"];
      return;
  }

  this.dp = p(3.67823, 0.51712);
  this.paths = ["m 0 0 c 1.45511 0.7737 3.78509 1.2188 4 0 c 0.091733 -0.520237 -0.335 -0.7721 -0.644 -0.8549 c -0.307 -0.0881 -0.569 0.0282 -0.417 0.3028 c 0.233 0.4034 0.445226 0.70712 0.739226 1.06922"];
};

WasedaHei = function() { WasedaChar.call(this, "WasedaHei", "へい", "SEL4CL1", "SEL", "SELCL", "black", false, p(0.0, -1.5)); };
WasedaHei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["へい"] = WasedaHei;
WasedaChar.dict["へー"] = WasedaHei;

WasedaHei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(1.98632, 2.88916);
     this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 0.670236 -0.420503 0.549706 -0.688227 c -0.128932 -0.286387 -0.811724 -0.334067 -0.940999 -0.047835 c -0.126594 0.280298 0.016012 0.660374 0.644393 0.660374"];
     return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "NEL16":
     this.dp = p(2.25941, 2.50107);
     this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 0.633706 -0.490359 0.549706 -0.688227 c -0.306457 -0.721883 -0.992997 -0.439153 -0.992997 0.128675 c 0 0.317983 0.394094 0.513406 0.969484 0.095775"];
     return;

    case "EL8":
     this.dp = p(2.40541, 2.65895);
     this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 1.06486 -0.492728 0.944077 -0.913676 c -0.098224 -0.342312 -0.869227 -0.532687 -1.04487 -0.222887 c -0.186539 0.329025 0.192204 0.54421 0.77298 0.830659"];
     return;
  }

  switch (_head) {
    case "E":
      this.dp = p(2.51902, 2.40555);
      this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 0.765256 -0.345328 0.785797 -0.559304 c 0.033072 -0.344514 0.08052 -0.796335 -0.42454 -0.874679 c -0.35458 -0.055002 -0.943349 0.342011 -0.869422 0.634726 c 0.093914 0.371852 0.884768 0.239953 1.29397 0.239953"];
      return;

    case "SW":
     this.dp = p(1.1605, 2.82787);
     this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 0.549706 -0.473267 0.549706 -0.688227 c 0 -0.556261 -0.485084 -0.661601 -0.753081 -0.197417 c -0.227443 0.393943 -0.242468 0.400076 -0.369348 0.748664"];
     return;
  }

  this.dp = p(0.926802, 2.6742);
  this.paths = ["m 0 0 c 0 1.47086 0.567464 2.96485 1.73322 2.96485 c 0.3919 0 0.585112 -0.476203 0.549706 -0.688227 c -0.0558 -0.334177 -0.321131 -0.506159 -0.588662 -0.324671 c -0.394195 0.267414 -0.535173 0.416686 -0.76746 0.722248"];
};

WasedaMei = function() { WasedaChar.call(this, "WasedaMei", "めい", "ER4CR1", "ER", "ERCR", "black", false, p(0.0, -0.1)); };
WasedaMei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["めい"] = WasedaMei;
WasedaChar.dict["めー"] = WasedaMei;
WasedaChar.dict["いい"] = WasedaMei;
WasedaChar.dict["いー"] = WasedaMei;

WasedaMei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
     this.dp = p(3.99224, -0.117139);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.501169 0.989285 -0.806628 0.775321 c -0.390326 -0.27341 -0.641289 -0.89246 0.798864 -0.89246"];
     return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "NE8":
      this.dp = p(3.77228, -0.531902);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.5978 0.815597 -0.874198 0.741536 c -0.614041 -0.164532 -0.00317 -0.719039 0.646478 -1.27344"];
      return;

    case "EL4":
      this.dp = p(3.95915, -0.256212);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.514221 0.533487 -0.791922 0.422245 c -0.28808 -0.115399 -0.497305 -0.651405 -0.29192 -0.884051 c 0.234519 -0.265647 0.806766 0.045186 1.043 0.205594"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(3.88021, 0.47693);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.493591 1.13353 -0.955596 1.04133 c -0.288453 -0.057565 -0.496552 -0.609317 -0.301366 -0.829366 c 0.25827 -0.291171 0.869114 0.07717 1.13717 0.264962"];
      return;

    case "EL8":
     this.dp = p(3.99903, 0.047201);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.379865 0.889672 -0.806628 0.775321 c -0.334713 -0.089686 -0.506456 -0.676983 -0.302644 -0.880794 c 0.271116 -0.271117 0.840111 0.041713 1.1083 0.152674"];
     return;

    case "NEL8":
     this.dp = p(3.74776, -0.55263);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.977961 0.655707 -1.26818 0.488147 c -0.602405 -0.347799 0.477043 -0.785541 1.01594 -1.04078"];
     return;

    case "NER4":
    case "NER8":
    case "NER16":
     this.dp = p(3.47393, -0.703638);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.354121 1.0173 -0.677098 0.830834 c -0.301755 -0.174219 -0.094491 -0.859938 0.151024 -1.53447"];
     return;

    case "ER4":
     this.dp = p(3.77228, -0.531902);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.456144 0.824583 -0.806628 0.775321 c -0.471919 -0.06633 -0.505884 -0.680918 0.578908 -1.30722"];
     return;
  }

  switch (_head) {
    case "S":
      this.dp = p(3.03691, -0.797642);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4 -1.2364 4 0 c 0 0.378241 -0.067924 0.694199 -0.32183 0.690481 c -0.540079 -0.007908 -0.459257 -0.80887 -0.641263 -1.48812"];
      return;

    case "SW":
      this.dp = p(3.49533, -0.695484);
      this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.26873 0.905681 -0.571346 0.788392 c -0.414894 -0.160805 -0.191841 -0.779935 0.06668 -1.48388"];
      return;

    case "E":
     this.dp = p(3.90698, -0.36942);
     this.paths = ["m 0 0 c 1.57891 -0.9116 4 -1.2364 4 0 c 0 0.42183 -0.35076 0.572708 -0.634339 0.567142 c -0.271766 -0.005335 -0.647021 -0.302047 -0.586113 -0.566953 c 0.08862 -0.385433 0.714409 -0.369609 1.12743 -0.369609"];
     return;
  }

  this.dp = p(3.77228, -0.531902);
  this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.501169 0.989285 -0.806628 0.775321 c -0.390326 -0.27341 0.104104 -0.653823 0.578904 -1.30722"];
};

WasedaRei = function() { WasedaChar.call(this, "WasedaRei", "れい", "SER4CR1", "SER", "SERCR", "black", false, p(0.0, -1.6)); };
WasedaRei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["れい"] = WasedaRei;
WasedaChar.dict["れー"] = WasedaRei;

WasedaRei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL8":
      this.dp = p(1.99759, 2.21004);
      this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -1.16031 0.518301 -1.04761 0.068839 c 0.094144 -0.375475 0.663869 -0.469207 1.10851 -0.705595"];
      return;

    case "NE16":
      this.dp = p(1.79186, 1.74639);
      this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.497621 0.861904 -1.37596 0.317737 -1.01544 -0.098971 c 0.284747 -0.329119 0.608401 -0.65566 0.870599 -1.00144"];
      return;

    case "NEL16":
     this.dp = p(1.88561, 1.91769);
     this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -1.18 0.447159 -1.02861 -0.066103 c 0.11304 -0.383256 0.685928 -0.62692 0.977519 -0.863006"];
     return;

    case "EL8":
      this.dp = p(2.0342, 2.48093);
      this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -1.41125 0.097765 -1.16085 -0.612003 c 0.142197 -0.403049 0.773029 0.088442 1.25835 0.246137"];
      return;
  }

  switch (_head) {
    case "NE":
      this.dp = p(1.91114, 1.97174);
      this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.497621 0.861904 -1.5316 0.14375 -1.08017 -0.163703 c 0.325053 -0.221382 0.697519 -0.469244 1.05461 -0.711355"];
      return;

    case "SW":
     this.dp = p(1.59208, 1.45464);
     this.paths = ["m 0 0 c 1.13193 0.793 2.41954 1.8056 1.9367 2.8468 c -0.079918 0.172334 -0.50736 0.509172 -0.566752 0.05971 c -0.050711 -0.383762 0.140129 -1.14582 0.222136 -1.45187"];
     return;

    case "SEL":
     this.dp = p(1.61176, 3.21775);
     this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -1.12212 0.472372 -1.12212 0.021468 c 0 -0.211057 0.198737 -0.809231 0.498262 -0.761415 c 0.378674 0.060451 0.298914 0.719914 0.298914 1.11089"];
     return;

    case "S":
     this.dp = p(1.63129, 3.19819);
     this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -1.13292 0.631785 -1.13292 0.186642 c 0 -0.272602 0.261626 -0.670829 0.530617 -0.624005 c 0.276764 0.048177 0.29689 0.216074 0.29689 0.788753"];
     return;

    case "E":
      this.dp = p(2.01166, 2.2688);
      this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.394456 0.683216 -1.2785 0.088359 -1.17413 -0.301147 c 0.092079 -0.343647 0.680548 -0.276853 1.24909 -0.276853"];
      return;
  }

  this.dp = p(1.82724, 1.80712);
  this.paths = ["m 0 0 c 1.13193 0.793 2.39846 2.04701 1.9367 2.8468 c -0.412248 0.714034 -0.947141 0.47093 -0.834445 0.021468 c 0.094144 -0.375475 0.433398 -0.825054 0.724989 -1.06114"];
};

WasedaEi = function() { WasedaChar.call(this, "WasedaEi", "えい", "SE4CR1", "SE", "SECR", "black", false, p(0.0, -1.7)); };
WasedaEi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["えい"] = WasedaEi;
WasedaChar.dict["えー"] = WasedaEi;

WasedaEi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "E":
      this.dp = p(2.41441, 2.40911);
      this.paths = ["m 0 0 c 0.938951 0.955664 2.62877 2.62062 2.62877 2.62062 c 0.572965 0.572964 -0.610614 0.889135 -1.02809 0.280207 c -0.406809 -0.593365 0.364044 -0.491721 0.813738 -0.491721"];
      return;

    case "SEL":
     this.dp = p(1.87157, 1.87206);
     this.paths = ["m 0 0 c 0.938951 0.955664 2.62877 2.62062 2.62877 2.62062 c 0.369896 0.344259 0.00308 0.881939 -0.41677 0.769441 c -0.36465 -0.097708 -0.340425 -1.05665 -0.340425 -1.518"];
     return;
  }

  this.dp = p(2.08599, 2.0844);
  this.paths = ["m 0 0 c 0.938951 0.955664 2.62877 2.62062 2.62877 2.62062 c 0.369896 0.344259 -0.320387 0.932917 -0.609863 0.808596 c -0.350952 -0.150722 -0.216334 -1.05553 0.067084 -1.34481"];
};

WasedaTwo = function() { WasedaChar.call(this, "WasedaTwo", "２", "2", "NER", "E", "black", false, p(0.4, -1.2)); };
WasedaTwo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["２"] = WasedaTwo;

WasedaTwo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  this.dp = p(4.03025, 4.47806);
  this.paths = ["m 0 0 c 0.800212 -0.936349 2.84851 -1.86051 3.52683 -0.85859 c 1.23161 1.81917 -3.05393 4.67676 -3.82578 5.36654 l 4.3292 -0.02989"];

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaZero":
      this.dp = p(5.0, -0.8);
      return;

    case "WasedaTwo":
      this.dp = p(4.0, 0);
      return;
  }

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
};

WasedaZero = function() { WasedaChar.call(this, "WasedaZero", "０", "0", "SWR", "NWL", "black", false, p(2.0, -2.0)); };
WasedaZero.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["０"] = WasedaZero;

WasedaZero.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
  this.paths = ["m 0 0 c -1.195 -0.0342 -2.096 1.4557 -2.462 2.5816 c -0.266 0.8188 -0.449 2.2138 0.348 2.5571 c 0.987 0.4247 2.217 -0.8638 2.636 -1.8441 c 0.438 -1.0239 0.652 -2.8325 -0.522 -3.2946"];
};

WasedaKen2 = function() { WasedaChar.call(this, "WasedaKen2", "けん", "E8NW4", "E", "NW", "black", false, p(0.0, 1.4)); };
WasedaKen2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["けん２"] = WasedaKen2;
WasedaChar.dict["ケン"] = WasedaKen2;

WasedaKen2.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SE":
    case "SER":
     this.dp = p(6.39891, -3.66558);
     this.paths = ["m 0 0 h 8 l -1.60109 -3.66558"];
     return;

    case "SW":
     this.dp = p(5.50571, -2.78067);
     this.paths = ["m 0 0 h 8 l -2.49429 -2.78067"];
     return;
  }

  this.dp = p(5.17157, -2.8284);
  this.paths = ["m 0 0 h 8 l -2.82843 -2.8284"];
};

WasedaKon2 = function() { WasedaChar.call(this, "WasedaKon2", "こん", "E8S4F", "E", "SF", "black", false, p(0.0, -2.8)); };
WasedaKon2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こん２"] = WasedaKon2;
WasedaChar.dict["コン"] = WasedaKon2;

WasedaKon2.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8, 5.5);
  this.paths = ["m 0 0 h 8 l 0 3.5"];
};

WasedaSen2 = function() { WasedaChar.call(this, "WasedaSen2", "せん", "NE8F", "NE", "NEF", "black", false, p(0.0, 2.9)); };
WasedaSen2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["せん２"] = WasedaSen2;
WasedaChar.dict["セン"] = WasedaSen2;

WasedaSen2.prototype.setPaths = function() {
  this.dp = p(8.09026, -5.87772);
  this.paths = ["m 0 0 l 6.47213 -4.70228"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL8":
      this.dp.x += 0.5; 
      this.dp.y += 0.5; 
      return;
  }

  //switch (_head) {}
};

WasedaHun2 = function() { WasedaChar.call(this, "WasedaHun2", "ふん", "BNE8F", "B", "NEF", "black", false, p(1.0, 1.2)); };
WasedaHun2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ふん２"] = WasedaHun2;
WasedaChar.dict["フン"] = WasedaHun2;

WasedaHun2.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(7.09026, -4.14567);
  this.paths = ["m 0 0 c 0 0.56523 -0.514572 1.37937 -1 1.73205 l 6.47213 -4.70228"];
};

WasedaTen2 = function() { WasedaChar.call(this, "WasedaTen2", "てん", "P", "P", "P", "black", false, p(0.0, 0.0)); };
WasedaTen2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["てん２"] = WasedaTen2;
WasedaChar.dict["テン"] = WasedaTen2;

WasedaTen2.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) {
    //case "WasedaHon":
    //  this.dp = p(2-1.5, 0);
    //  this.paths = ["m-1.5 -2 v0.1"];
    //  return;
    case "WasedaLtsuP":
      this.dp = p(3.68618, -2.5811);
      this.paths = ["m 0 0 l 2.04788 -1.43394"];
      return;
  }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "NEL8CL1_EL":
    case "NEL8CL1_ER":
    case "NEL8CL1_E":
    case "NEL8CL1_SW":
    case "SWL16NEL4CL1":
    case "SWL16NEL4CL1_EL":
    case "SWL16NEL4CL1_ER":
    case "SWL16NEL4CL1_E":
    case "SWL16NEL4CL1_SW":
      this.dp = p(2, 0);
      this.paths = ["m2 -2 v0.1"];
      return;

    case "E8CL1_SW":
      this.dp = p(3, 0);
      this.paths = ["m3 -2 v0.1"];
      return;

    case "SEL16F_SW":
      this.dp = p(2, 1);
      this.paths = ["m2,-1v0.1"];
      return;

    case "NER8CR1_SW":
      this.dp = p(2, 1);
      this.paths = ["m2,-1v0.1"];
      return;
  }

  //switch (tailModel_) {}

  switch (model_) {
    case "SEL16F":
      this.dp = p(2-1.5, 0);
      this.paths = ["m-1.5 -2 v0.1"];
      return;

    case "NEL8CL1":
    case "SWL16NEL4CL1":
      this.dp = p(2, 0);
      this.paths = ["m0 -4 v0.1"];
      return;

    case "E8CL1":
      this.dp = p(1, -1);
      this.paths = ["m1 -3 v0.1"];
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _head) {
    case "E_SE":
    case "ER_SE":
    case "EL_SE":
      this.dp = p(2, 0);
      this.paths = ["m2 -2 v 0.1"];
      return;
  }

  if (tail_.endsWith("F")) {
    this.dp = p(0, 2);
    this.paths = ["m 0 0 v 0.1"];
    return;
  }

  switch (tail_) {
    case "E":
    case "ER":
    case "EL":
      this.dp = p(2, 0);
      this.paths = ["m 0 -2 v 0.1"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
  this.paths = ["m 0 -2 v 0.1"];
};

WasedaN = function() { WasedaChar.call(this, "WasedaN", "ん", "NE1F", "NE", "NEF", "black", false, p(0.0, 0.5)); };
WasedaN.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict[" ん"] = WasedaN;

WasedaN.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.46129, -2.48832);
  this.paths = ["m 0 0 l 1.06066 -1.06066"];
};

WasedaHun = function() { WasedaChar.call(this, "WasedaHun", "ふん", "SEL8CL4NE1F", "SEL", "NEF", "black", false, p(0.0, -2.9)); };
WasedaHun.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ふん"] = WasedaHun;

WasedaHun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

 this.dp = p(3.08518, 1.41873);
 this.paths = ["m 0 0 c 0 1.8741 0.2905 3.3309 0.7678 4.3545 c 0.4951 1.0151 1.3611 1.5004 2.7067 1.5004 c 0.6304 0 1.3022 -0.1748 1.3022 -0.7218 c 0 -0.42 -0.7718 -0.8055 -1.6955 -1.0188 c -0.9158 -0.2453 -2.0018 -0.2207 -2.4709 -0.2207 l 1.06066 -1.06066"];
};

WasedaKun = function() { WasedaChar.call(this, "WasedaKun", "くん", "E8CL4E1F", "E", "EF", "black", false, p(0.0, 1.4)); };
WasedaKun.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["くん"] = WasedaKun;

WasedaKun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

   this.dp = p(11.5, -0);
   this.paths = ["m 0 0 c 2.132 -0.0745 4.9132 -0.074488 7.0462 0 c 1.07007 0.037368 1.10131 -1.13741 0.751189 -1.61804 c -0.643246 -0.883019 -3.0735 -0.67558 -3.25265 0.4021 c -0.152034 0.91456 2.26523 1.21594 3.45526 1.21594 h 1.5"];
};

WasedaRon = function() { WasedaChar.call(this, "WasedaRon", "ろん", "SER16NE1F", "SER", "NEF", "black", false, p(0.0, -6.9)); };
WasedaRon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ろん"] = WasedaRon;

WasedaRon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

 this.dp = p(10.4776, 11.3843);
 this.paths = ["m 0 0 c 4.6323 2.6745 11.0125 11.3286 8 13.8564 l 1.06066 -1.06066"];
};

WasedaKon = function() { WasedaChar.call(this, "WasedaKon", "こん", "E16NE1F", "E", "NEF", "black", false, p(0.0, 1.2)); };
WasedaKon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こん"] = WasedaKon;

WasedaKon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(18.4749, -2.47487);
  this.paths = ["m 0 0 h 16 l 1.06066 -1.06066"];
};

WasedaHin = function() { WasedaChar.call(this, "WasedaHin", "ひん", "SEL8CL1E1F", "SEL", "EF", "black", false, p(0.0, -2.8)); };
WasedaHin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ひん"] = WasedaHin;

WasedaHin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8.95112, 4.90528);
  this.paths = ["m 0 0 c 0 3.7201 1.18678 5.5886 4.52557 5.5886 c 0.5132 0 0.742235 -0.09266 0.88951 -0.379396 c 0.151419 -0.294803 0.074323 -0.810136 -0.21567 -0.970575 c -0.319428 -0.176723 -1.04426 0.01365 -1.03193 0.366745 c 0.01743 0.4992 0.748749 0.299907 1.28364 0.299907 h 1.5"];
};

WasedaXro = function() { WasedaChar.call(this, "WasedaXro", "ロ", "SW1F", "SW", "SWF", "black", false, p(1.1, -1.7)); };
WasedaXro.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ロ"] = WasedaXro;

WasedaXro.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.10908, 3.31866);
  this.paths = ["m 0 0 l -0.51303 1.40954"];
};


WasedaXre = function() { WasedaChar.call(this, "WasedaXre", "レ", "SE1F", "SE", "SEF", "black", false, p(2.6, 1.2)); };
WasedaXre.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["レ"] = WasedaXre;

WasedaXre.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.56572, 2.38042);
  this.paths = ["m 0 0 l 1.10696 1.01224"];
};

WasedaKya = function() { WasedaChar.call(this, "WasedaKya", "きゃ", "SL8", "SL", "SL", "black", false, p(1.1, -4.0)); };
WasedaKya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きゃ"] = WasedaKya;

WasedaKya.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 8);
  this.paths = ["m 0 0 c -1.20973 2.0953 -1.81809 6.9503 0 8"];
};

WasedaKyu = function() { WasedaChar.call(this, "WasedaKyu", "きゅ", "SL8CL1", "SL", "SLCL", "black", false, p(1.6, -4.0)); };
WasedaKyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きゅ"] = WasedaKyu;

WasedaKyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL8":
    case "NEL16":
      this.dp = p(0.663103, 7.48295);
      this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.60319 -0.08986 1.30704 -0.7245 c -0.292074 -0.625915 -1.25758 -0.232601 -1.16249 0.278381 c 0.047913 0.257483 0.549556 0.372423 1.21319 -0.010729"];
      return;

    case "ER8":
      this.dp = p(0.553824, 7.61099);
      this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.62466 -0.35023 1.37559 -0.781628 c -0.302685 -0.524267 -1.26679 -0.238627 -1.29686 0.344815 c -0.01499 0.290888 0.401507 0.418388 1.16973 0.108001"];
      return;
  }

  switch (_head) {
    case "SEL":
      this.dp = p(-0.370089, 8.07479);
      this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.39283 -0.029439 1.30704 -0.7245 c -0.056432 -0.533887 -0.603725 -0.57866 -0.759273 -0.248881 c -0.171653 0.363922 -0.223216 0.66805 -0.223216 1.10838"];
      return;

    case "E":
      this.dp = p(0.584059, 7.52919);
      this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.38024 -0.028 1.30704 -0.7245 c -0.019583 -0.223986 -0.03087 -0.576429 -0.528193 -0.576429 c -0.310474 0 -0.721087 0.351157 -0.592867 0.666227 c 0.127736 0.31388 0.441645 0.224093 1.09272 0.224093"];
      return;

    case "SW":
      this.dp = p(-0.4959, 8.0625);
      this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.38024 -0.028 1.30704 -0.7245 c -0.0281 -0.3214 -0.321945 -0.550654 -0.541845 -0.359554 c -0.21646 0.1949 -0.358592 0.629643 -0.566455 1.20675"];
      return;
  }

  this.dp = p(-0.4959, 8.0625);
  this.paths = ["m 0 0 c -1.3479 1.9983 -2.38673 6.7105 -0.69464 7.9398 c 0.58058 0.3916 1.38024 -0.028 1.30704 -0.7245 c -0.0281 -0.3214 -0.1926 -0.3016 -0.4125 -0.1105 c -0.21646 0.1949 -0.47333 0.5724 -0.6958 0.9577"];
};

WasedaKyo = function() { WasedaChar.call(this, "WasedaKyo", "きょ", "SL8ONEL4", "SL", "SLONEL", "black", false, p(1.0, -4.0), 4); };
WasedaKyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きょ"] = WasedaKyo;

WasedaKyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  switch (tail_ + "_" + _head) {
    case "NELCL_SW":
    case "NELCL4_SW":
    case "NELCL8_SW":
      this.dp = p(0.465456, 7.7595);
      this.paths = ["m 0 0 c -0.501084 1.99247 -0.996743 6.396 0.465457 7.7595 c 0.3695 0.31 1.00598 -0.225455 1.46432 -0.810916 c 0.323926 -0.413764 0.817117 -1.51256 0.431669 -1.75754 c -0.642268 -0.408204 -1.5005 1.4819 -1.89599 2.56846"];
      return;
  }

  switch (tail_) {
    case "NELCL":
    case "NELCL4":
    case "NELCL8":
      this.dp = p(0.465456, 7.7595);
      this.paths = ["m 0 0 c -0.501084 1.99247 -0.996744 6.396 0.465456 7.7595 c 0.3695 0.31 1.3711 0.0966 1.9253 -0.2364 c 0.5787 -0.3341 1.62932 -1.12869 1.1783 -1.6217 c -0.411326 -0.449615 -2.27664 1.08665 -3.1036 1.8581"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "NEL":
      this.dp = p(0.65428, 7.94763);
      this.paths = ["m 0 0 c -1.106 1.9953 -1.5977 6.396 -0.1355 7.7595 c 0.789703 0.789703 1.39599 -0.443643 1.76377 -0.975398 c 0.450786 -0.651769 0.792502 -1.51136 0.451888 -1.80564 c -0.461116 -0.39839 -1.03156 1.97052 -1.42588 2.96917"];
      return;

    case "NE":
    case "NEL":
      this.dp = p(0.133493, 7.79889);
      this.paths = ["m 0 0 c -1.106 1.9953 -1.5977 6.396 -0.1355 7.7595 c 0.3695 0.31 1.30004 -0.524865 1.76377 -0.975398 c 0.527015 -0.512016 0.792502 -1.51136 0.451888 -1.80564 c -0.461116 -0.39839 -1.55235 1.82178 -1.94667 2.82043"];
      return;

    case "E":
      this.dp = p(-0.1355, 7.7595);
      this.paths = ["m 0 0 c -1.106 1.9953 -1.5977 6.396 -0.1355 7.7595 c 0.3695 0.31 1.3711 0.0966 1.9253 -0.2364 c 0.5787 -0.3341 1.62932 -1.12869 1.1783 -1.6217 c -0.411326 -0.449615 -2.27664 1.08665 -3.1036 1.8581"];
      return;

    case "SW":
      this.dp = p(-0.1355, 7.7595);
      this.paths = ["m 0 0 c -1.106 1.9953 -1.5977 6.396 -0.1355 7.7595 c 0.3695 0.31 1.00598 -0.225455 1.46432 -0.810916 c 0.323926 -0.413764 0.817117 -1.51256 0.431669 -1.75754 c -0.642268 -0.408204 -1.5005 1.4819 -1.89599 2.56846"];
      return;

    case "ER":
      this.dp = p(0.581876, 7.97949);
      this.paths = ["m 0 0 c -1.106 1.9953 -1.61795 6.41805 -0.1355 7.7595 c 0.59274 0.536365 1.27358 0.016822 1.82778 -0.316178 c 0.5787 -0.3341 1.85725 -1.69809 1.38325 -2.16905 c -0.681449 -0.677087 -2.47609 2.26649 -2.49365 2.70522"];
      return;
  }

  this.dp = p(-0.1355, 7.7595);
  this.paths = ["m 0 0 c -1.106 1.9953 -1.5977 6.396 -0.1355 7.7595 c 0.3695 0.31 1.3711 0.0966 1.9253 -0.2364 c 0.5787 -0.3341 1.62932 -1.12869 1.1783 -1.6217 c -0.411326 -0.449615 -2.27664 1.08665 -3.1036 1.8581"];
};

WasedaSha = function() { WasedaChar.call(this, "WasedaSha", "しゃ", "SR8", "SR", "SR", "black", false, p(0.0, -4.0)); };
WasedaSha.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しゃ"] = WasedaSha;

WasedaSha.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
      this.dp = p(0, 8);
      this.paths = ["m 0 0 c 1.5045 2.2306 1.92646 8.51619 0 8"];
      return;
  }

  this.dp = p(0, 8);
  this.paths = ["m 0 0 c 1.5045 2.2306 1.944 6.4812 0 8"];
};

WasedaShu = function() { WasedaChar.call(this, "WasedaShu", "しゅ", "SR8CR1", "SR", "SRCR", "black", false, p(0.5, -4.0)); };
WasedaShu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しゅ"] = WasedaShu;

WasedaShu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NELCL":
    case "NELCL4":
    case "NELCL8":
      this.dp = p(0.752215, 6.49959);
      this.paths = ["m 0 0 c 0.664724 2.48078 1.52006 6.82469 0 7.9701 c -0.2799 0.2187 -0.6365 -0.139 -0.4227 -0.4227 c 0.3455 -0.4267 0.743565 -0.798766 1.17491 -1.04781"];
      return;
  }

  switch (_name) {
    case "WasedaSai":
    case "WasedaSei":
      this.dp = p(0.709979, 7.15706);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.510542 0.398912 -1.1052 -0.104266 -0.716704 -0.444282 c 0.386908 -0.338625 0.960664 -0.360436 1.42668 -0.36876"];
      return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "NEL16":
      this.dp = p(1.01661, 6.47999);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.42778 0.246979 -0.765088 -0.324507 -0.478688 -0.534675 c 0.448246 -0.328934 0.791237 -0.581367 1.4953 -0.955435"];
      return;

    case "SER4":
    case "SER8":
      this.dp = p(0.359662, 7.6396);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.586749 0.458457 -1.15404 -0.206763 -1.07896 -0.629183 c 0.11484 -0.536894 0.921123 -0.063676 1.43862 0.298682"];
      return;

    case "ER8":
      this.dp = p(0.988973, 6.55808);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.2799 0.2187 -0.75032 0.056771 -0.563252 -0.374573 c 0.151676 -0.349738 1.0351 -0.817957 1.55222 -1.03745"];
      return;

    case "NEL8":
      this.dp = p(0.9476, 6.66668);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.315447 0.315447 -0.672197 0.107124 -0.724527 -0.132765 c -0.145015 -0.664762 1.11648 -0.884244 1.67213 -1.17065"];
      return;
  }

  switch (_head) {
    case "NER":
      this.dp = p(1.27667, 5.20086);
      this.paths = ["m 0 0 c 1.499 2.2223 1.76954 7.32571 0.33599 8.15337 c -0.526587 0.304026 -0.271056 -0.47084 0.115778 -1.32122 c 0.294663 -0.647766 0.665513 -1.33935 0.824899 -1.63128"];
      return;

    case "SEL":
      this.dp = p(-0, 7.9701);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.2799 0.2187 -0.782033 -0.062009 -0.862349 -0.363425 c -0.093165 -0.349641 0.306707 -0.950492 0.657917 -0.863425 c 0.402407 0.099759 0.204432 0.728437 0.204432 1.22685"];
      return;

    case "E":
      this.dp = p(0.75947, 7.1657);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.403256 0.315084 -0.979353 -0.139 -0.765553 -0.4227 c 0.3455 -0.4267 0.877382 -0.381702 1.52502 -0.381702"];
      return;

    case "SW":
      this.dp = p(-0.530489, 8.11527);
      this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.397518 0.310601 -1.55542 0.123176 -1.13804 -0.565146 c 0.136366 -0.224885 0.689012 -0.553204 0.925148 -0.3269 c 0.261056 0.250186 -0.217217 0.761423 -0.3176 1.03721"];
      return;
  }

  this.dp = p(1.01661, 6.47999);
  this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.2799 0.2187 -0.6365 -0.139 -0.4227 -0.4227 c 0.3455 -0.4267 1.00796 -0.818369 1.43931 -1.06741"];
};

WasedaChu = function() { WasedaChar.call(this, "WasedaChu", "ちゅ", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 2.7)); };
WasedaChu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ちゅ"] = WasedaChu;
WasedaChu.prototype.getFilteredPrevTailType = WasedaCha.prototype.getFilteredPrevTailType;
WasedaChu.prototype.reverse = function() {
  this.headType = "SW";
  this.tailType = "SWCR";
  this.model = "SW8CR1";
};
WasedaChu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  switch (tail_ + "_" + _head) {
    case "R_SW":
      this.dp = p(-2.4721, 7.6085);
      this.paths = ["m 0 0 c -0.772463 2.53527 -1.65863 5.21653 -2.4721 7.6085 c -0.452 1.1775 -1.23205 0.609299 -0.811043 -0.105236 c 0.452294 -0.767631 1.02301 -0.477131 0.811043 0.105236"];
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-2.1259, 6.6979);
      this.paths = ["m 0 0 c -0.8368 2.5753 -1.5112 5.2299 -2.4721 7.6085 c -0.452 1.1775 -1.46994 0.447664 -0.811043 -0.105236 c 0.5191 -0.4204 0.578743 -0.471464 1.15724 -0.805364"];
      this.reverse();
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "ER16":
      this.dp = p(6.42308, -4.61614);
      this.paths = ["m 0 0 c 1.97075 -1.42983 4.20479 -2.95817 6.226 -4.3592 c 0.38218 -0.264914 0.167229 -0.681924 -0.02848 -0.762169 c -0.557664 -0.228657 -1.25099 0.20726 -1.00208 0.723561 c 0.186856 0.387582 0.811439 -0.015769 1.22764 -0.218334"];
      return;

    case "SR8":
      this.dp = p(5.907, -4.1588);
      this.paths = ["m 0 0 c 1.97075 -1.42983 4.20479 -2.95817 6.226 -4.3592 c 1.10192 -0.763812 -0.343082 -1.32523 -0.749847 -1.12878 c -0.419407 0.202549 -0.1107 0.526277 0.430847 1.32918"];
      return;

    case "EL4":
      this.dp = p(5.907, -4.1588);
      this.paths = ["m 0 0 c 1.97075 -1.42983 4.20479 -2.95817 6.226 -4.3592 c 0.369124 -0.255863 0.140663 -0.67106 -0.171673 -0.75475 c -0.25462 -0.068225 -0.653731 0.015691 -0.757997 0.191071 c -0.206979 0.348146 0.222804 0.557846 0.61067 0.764079"];
      return;

    case "ER4":
      this.dp = p(6.64899, -4.93357);
      this.paths = ["m 0 0 c 1.97075 -1.42983 4.20479 -2.95817 6.226 -4.3592 c 1.10192 -0.763812 0.386789 -1.37738 -0.127754 -1.28773 c -0.429386 0.074808 -0.707595 0.317892 -0.757978 0.611912 c -0.057719 0.336832 0.197013 0.743305 1.30872 0.101449"];
      return;
  }

  //switch (_head) {}

  this.dp = p(5.907, -4.1588);
  this.paths = ["m 0 0 c 1.97075 -1.42983 4.20479 -2.95817 6.226 -4.3592 c 1.10192 -0.763812 -0.52668 -1.27081 -0.566 -0.8714 c -0.0361 0.366578 0.127 0.7234 0.247 1.0718"];
};


WasedaCho = function() { WasedaChar.call(this, "WasedaCho", "ちょ", "NE8OWL4", "NE", "OWL", "black", false, p(0.0, 2.6)); };
WasedaCho.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ちょ"] = WasedaCho;
WasedaCho.prototype.getFilteredPrevTailType = WasedaCha.prototype.getFilteredPrevTailType;
WasedaCho.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
      this.dp = p(-2.9473, 6.3205);
      this.paths = ["m 0 0 c -1.05273 2.02284 -1.97036 4.22226 -2.9473 6.3205 c -0.2756 0.8005 -1.3406 0.5429 -2.2566 0.3979 c -0.8777 -0.1548 -2.1384 -0.7025 -1.2167 -0.7025 c 1.1646 0 2.3265 0.1023 3.4733 0.3046"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(6.472, -4.7023);
  this.paths = ["m 0 0 c 1.98474 -1.44203 4.62515 -3.31619 6.472 -4.7023 c 0.801 -0.8011 -0.879 -0.6161 -2.257 -0.3979 c -0.906 0.1598 -2.172 0.9161 -1.2 0.7795 c 1.148 -0.1614 2.301 -0.2886 3.457 -0.3816"];
};

WasedaTer = function() { WasedaChar.call(this, "WasedaTer", "てr", "NE8CR1", "NE", "CR", "black", false, p(0.0, 2.6)); };
WasedaTer.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["てｒ"] = WasedaTer;
WasedaChar.dict["ちぇ"] = WasedaTer;
WasedaTer.prototype.getFilteredPrevTailType = WasedaCha.prototype.getFilteredPrevTailType;
WasedaTer.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tail_ = this.getFilteredPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "R":
      this.dp = p(-1.9998, 6.4346);
      this.paths = ["m 0 0 c -0.7355 2.5649 -1.3098 4.488 -2.2762 7.0053 c -0.4452 1.1019 0.856578 1.05446 0.650578 0.335861 c -0.1141 -0.4258 -0.110948 -0.450634 -0.374178 -0.906561"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(5.52004, -4.60012);
  this.paths = ["m 0 0 c 2.13049 -1.58006 4.01619 -3.22646 5.97267 -5.0117 c 0.3253 -0.3253 0.407186 -0.04102 0.46407 0.1072 c 0.157612 0.410691 -0.326208 1.17013 -0.75698 1.081 c -0.258809 -0.05355 -0.260337 -0.447519 -0.159717 -0.776619"];
};

WasedaSho = function() { WasedaChar.call(this, "WasedaSho", "しょ", "NEL16CL8", "NEL", "NELCL8", "black", false, p(0.0, 6.5)); };
WasedaSho.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しょ"] = WasedaSho;
WasedaSho.prototype.getFilteredPrevTailType = WasedaSa.prototype.getFilteredPrevTailType;
WasedaSho.prototype.reverse = function() {
  this.headType = "SWR";
  this.tailType = "SWRCR";
  this.model = "SWR16CR8";
}
WasedaSho.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getFilteredPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  switch (name_) { }

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  switch (tail_ + "_" + _headModel) {
    case "SR8":
      this.dp = p(9.28081, -5.73627);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -4.99079 -3.72655 -3.97439 -1.37472 c 0.772142 1.78666 1.29555 3.59207 1.8264 5.57325"];
      return;
  }

  switch (tail_ + "_" + _head) {
    case "R_SW":
      this.dp = p(-2.29575, 8.30146);
      this.paths = ["m 0 0 c 0 6.4269 -5.18193 12.6639 -8.37831 10.8185 c -2.3733 -1.37022 3.4047 -7.54723 6.40593 -6.35724 c 1.19417 0.473488 0.261148 1.65881 -0.323365 3.84024"];
      return;
  }

  switch (tail_) {
    case "R":
      this.dp = p(-1.749, 8.1606);
      this.paths = ["m 0 0 c 0 6.4269 -3.93618 14.1869 -7.69358 13.8453 c -4.55916 -0.4145 3.7432 -5.0948 5.94458 -5.6847"];
      this.reverse();
      return;

    case "ER":
      this.dp = p(-1.161, 8.2236);
      this.paths = ["m 0 0 c 2.6019 4.5065 -3.9362 14.1869 -7.6936 13.8453 c -4.5591 -0.4145 4.3312 -5.0319 6.5326 -5.6217"];
      this.reverse();
      return;

    case "NER":
      this.dp = p(-1.1387, 6.9734);
      this.paths = ["m 0 0 c 2.2238 2.224 -3.9362 14.1869 -7.6936 13.8453 c -4.5591 -0.4145 4.3535 -6.282 6.5549 -6.8719"];
      this.reverse();
      return;
  }

  switch (_name) {
    case "WasedaWa":
      this.dp = p(5.03437, -2.70962);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -3.16539 0.211921 -3.82993 1.39731 c -0.982888 1.75326 -2.33962 4.9374 -2.5645 5.82787"];
      return;
  }

  //switch (_model) {}

  switch (_headModel) {
    case "SER4":
    case "SER8":
      this.dp = p(7.34101, -4.16427);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -8.79408 -0.022101 -8.38708 2.2867 c 0.338 1.9168 2.55205 2.27992 4.2993 3.48383"];
      return;

    case "SWR16":
      this.dp = p(7.64313, -4.38011);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -4.9484 -3.611 -4.5414 -1.3022 c 0.338 1.9168 0.755726 5.07422 0.755726 6.85689"];
      return;

    case "EL8":
      this.dp = p(10.6043, -7.31615);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -6.88121 -3.28887 -6.47421 -0.980065 c 0.338 1.9168 3.45768 2.97021 5.64968 3.59871"];
      return;

    case "SR8":
      this.dp = p(9.28081, -5.73627);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -4.99079 -3.72655 -3.97439 -1.37472 c 0.772142 1.78666 1.29555 3.59207 1.8264 5.57325"];
      return;

    case "SL8":
      this.dp = p(6.31596, -3.45736);
      this.paths = ["m 0 0 c 4.0576 -2.2492 12.5237 -6.09584 11.6295 -9.43296 c -0.72514 -2.70626 -4.95886 4.71757 -5.31354 5.9756"];
      return;
  }

  switch (_head) {
    case "E":
      this.dp = p(8.31598, -4.89296);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.0307 -5.36591 11.4288 -9.9348 c 0.555216 -6.37272 -7.7629 1.38952 -7.3559 3.69832 c 0.338 1.9168 2.80641 1.34352 4.24308 1.34352"];
      return;

    case "SEL":
      this.dp = p(7.6139, -4.35888);
      this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -1.66715 -2.49951 -2.35942 -1.02065 c -0.700898 1.49729 -1.45548 4.9214 -1.45548 6.59658"];
      return;

    case "SW":
      this.dp = p(6.06714, -3.3913);
      this.paths = ["m 0 0 c 4.0576 -2.2492 12.3379 -6.1301 11.4288 -9.9348 c -0.353362 -1.47876 -2.36811 -2.04751 -3.14684 0.192476 c -0.796744 2.37012 -1.45983 4.272 -2.21482 6.35102"];
      return;
  }

  this.dp = p(9.229, -5.983);
  this.paths = ["m 0 0 c 4.0576 -2.2492 11.4288 -5.3486 11.4288 -9.9348 c 0 -4.3354 -4.9484 -3.611 -4.5414 -1.3022 c 0.338 1.9168 1.1422 3.7212 2.3416 5.254"];
};

WasedaNya = function() { WasedaChar.call(this, "WasedaNya", "にゃ", "EL8", "EL", "EL", "black"); };
WasedaNya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["にゃ"] = WasedaNya;
WasedaNya.prototype.setPaths = WasedaNa.prototype.setPaths;
WasedaNya.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m5,2.2 v0.1"];
};

WasedaNyu = function() { WasedaChar.call(this, "WasedaNyu", "にゅ", "EL8ONL4", "EL", "ELONL", "black", false, p(0.0, 0)); };
WasedaNyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["にゅ"] = WasedaNyu;

WasedaNyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWR8":
      this.dp = p(7.47951, 0.630764);
      this.paths = ["m 0 0 c 2.189 0.6692 7.46584 1.88154 7.97 0 c 0.163787 -0.611261 0.240481 -2.6653 -0.5063 -2.6653 c -0.443871 0 0.01581 2.18649 0.01581 3.29606"];
      return;
  }

  //switch (_head) {}

  this.dp = p(7.47951, 0.630764);
  this.paths = ["m 0 0 c 2.189 0.6692 7.46584 1.88154 7.97 0 c 0.163787 -0.611261 0.240481 -2.6653 -0.5063 -2.6653 c -0.443871 0 -0.242453 2.22003 0.015813 3.29607"];
};

WasedaNyo = function() { WasedaChar.call(this, "WasedaNyo", "にょ", "EL16CL8", "EL", "ELCL8", "black", false, p(0.0, 0), 15); };
WasedaNyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["にょ"] = WasedaNyo;

WasedaNyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(9.85129, 1.64927);
  this.paths = ["m 0 0 c 2.8811 0.665 13.2586 3.60028 16.2385 -0.039754 c 1.35539 -1.65561 -0.18069 -2.65738 -1.42977 -2.04033 c -1.56863 0.774913 -3.50513 2.31371 -4.95747 3.72936"];
};

WasedaHya = function() { WasedaChar.call(this, "WasedaHya", "ひゃ", "SWL8", "SWL", "SWL", "black", false, p(4.3, -3.5)); };
WasedaHya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ひゃ"] = WasedaHya;

WasedaHya.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-4, 6.9282);
  this.paths = ["m 0 0 c -2.23251 1.28894 -5.14965 4.93695 -4 6.9282"];
};

WasedaHyu = function() { WasedaChar.call(this, "WasedaHyu", "ひゅ", "SWL8CL1", "SWL", "SWLCL", "black", false, p(4.3, -3.6)); };
WasedaHyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ひゅ"] = WasedaHyu;

WasedaHyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-4.23101, 5.49726);
  this.paths = ["m 0 0 c -1.83452 1.05916 -4.13133 3.71125 -4.25403 5.72805 c -0.01248 0.205061 0.000884 0.986273 0.305569 1.17369 c 0.372417 0.229082 0.624562 -0.0069 0.579168 -0.360401 c -0.04643 -0.36157 -0.607995 -0.81225 -0.861717 -1.04408"];
};

WasedaHyo = function() { WasedaChar.call(this, "WasedaHyo", "ひょ", "SWL8CL4", "SWL", "SWLCL4", "black", false, p(4.3, -3.5)); };
WasedaHyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ひょ"] = WasedaHyo;

WasedaHyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  switch (tail_ + "_" + _head) {
    case "SELCL_SW":
    case "NELCL_SW":
    case "NE_SW":
      this.dp = p(-2.60966, 6.5552);
      this.paths = ["m 0 0 c -0.928261 1.60779 -2.49349 4.22058 -2.61619 6.23738 c -0.01248 0.205061 -0.051148 0.983457 0.305569 1.17369 c 0.649586 0.346416 1.67284 -0.118641 2.08486 -0.728729 c 0.510709 -0.756224 0.734838 -2.43598 -0.127439 -2.7346 c -1.08613 -0.376152 -2.11784 2.22659 -2.25647 2.60746"];
      return;
  }

  switch (tail_) {
    case "SELCL":
    case "NELCL":
    case "NE":
      this.dp = p(-1.93746, 3.70004);
      this.paths = ["m 0 0 c -0.928261 1.60779 -2.49349 4.22058 -2.61619 6.23738 c -0.01248 0.205061 0.01481 0.965315 0.305569 1.17369 c 0.490085 0.351235 1.20942 0.020205 1.44336 -0.423252 c 0.537754 -1.01938 -0.816484 -3.05595 -1.07021 -3.28778"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
      this.dp = p(-4.24325, 6.27062);
      this.paths = ["m 0 0 c -1.83452 1.05916 -4.13133 3.71125 -4.25403 5.72805 c -0.01248 0.205061 0.019706 0.887827 0.305569 1.17369 c 0.820097 0.820097 1.74209 -0.027613 2.17073 -0.649468 c 0.487919 -0.707862 0.626666 -2.29859 -0.18833 -2.5723 c -1.08991 -0.366035 -1.87292 1.29788 -2.27719 2.59065"];
      return;
  }

  this.dp = p(-3.35763, 3.34002);
  this.paths = ["m 0 0 c -1.83452 1.05916 -4.13133 3.71125 -4.25403 5.72805 c -0.01248 0.205061 0.01481 0.965315 0.305569 1.17369 c 0.490085 0.351235 1.19853 0.01429 1.44336 -0.423252 c 0.529366 -0.946029 -0.598801 -2.90664 -0.852523 -3.13847"];
};

WasedaMyu = function() { WasedaChar.call(this, "WasedaMyu", "みゅ", "ER8ONL4", "ER", "ERONL", "black", false, p(0.0, 0)); };
WasedaMyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["みゅ"] = WasedaMyu;
WasedaChar.dict["昔"] = WasedaMyu;

WasedaMyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8.00001, 0);
  this.paths = ["m 0 0 c 2.52091 -1.07 7.16392 -1.69909 8.00001 0 c 0.298542 -0.612789 0.730968 -3.29607 -0.015813 -3.29607 c -0.540748 0 -0.397961 2.18162 0.015813 3.29607"];
};

WasedaMya = function() { WasedaChar.call(this, "WasedaMya", "みゃ", "ER8", "ER", "ER", "black"); };
WasedaMya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["みゃ"] = WasedaMya;
WasedaMya.prototype.setPaths = WasedaMa.prototype.setPaths;
WasedaMya.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m5,1v0.1"];
};

WasedaMyo = function() { WasedaChar.call(this, "WasedaMyo", "みゅ", "ER8OSWR4", "ER", "EROSWR", "black", false, p(0.0, 0)); };
WasedaMyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["みょ"] = WasedaMyo;

WasedaMyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8.00001, 0);
  this.paths = ["m 0 0 c 2.52091 -1.07 7.16598 -1.7001 8.00001 0 c 0.401232 0.817876 -2.10496 2.52172 -2.43467 2.21845 c -0.547555 -0.503648 0.806293 -1.35222 2.43467 -2.21845"];
};

WasedaRya = function() { WasedaChar.call(this, "WasedaRya", "りゃ", "SER8", "SER", "SER", "black", false, p(0.0, -3.5)); };
WasedaRya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["りゃ"] = WasedaRya;
WasedaRya.prototype.setPaths = WasedaRa.prototype.setPaths;
WasedaRya.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m1.5,4.2v0.1"]; 
};

WasedaRyo = function() { WasedaChar.call(this, "WasedaRyo", "りょ", "SER8OSWR4", "SER", "SEROSWR", "black", false, p(0.0, -3.5)); };
WasedaRyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["りょ"] = WasedaRyo;

WasedaRyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL16":
      this.dp = p(4.28137, 5.67313);
      this.paths = ["m 0 0 c 2.26387 1.5852 5.22323 4.8095 4 6.9282 c -0.46562 0.80648 -2.31799 1.15794 -2.66242 0.8715 c -0.556246 -0.462612 1.41474 -1.27899 2.94379 -2.12657"];
      return;

  }

  //switch (_head) {}

  this.dp = p(4.28137, 5.67313);
  this.paths = ["m 0 0 c 2.26387 1.5852 5.22323 4.8095 4 6.9282 c -0.463317 0.80249 -1.87098 1.74249 -2.21541 1.45605 c -0.556246 -0.462612 0.91316 -1.79681 2.49678 -2.71112"];
};

WasedaRyu = function() { WasedaChar.call(this, "WasedaRyu", "りゅ", "SER8OWR4", "SER", "SEROWR", "black", false, p(0.0, -3.5)); };
WasedaRyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["りゅ"] = WasedaRyu;

WasedaRyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NER":
      this.dp = p(4.18994, 6.49181);
      this.paths = ["m 0 0 c 2.76369 0 5.22323 4.8095 4 6.9282 c -0.463317 0.80249 -2.91292 0.521997 -3.2766 0.088495 c -0.464989 -0.554261 1.62455 -0.52489 3.46654 -0.52489"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(4.18994, 6.49181);
  this.paths = ["m 0 0 c 2.26387 1.5852 5.22323 4.8095 4 6.9282 c -0.463317 0.80249 -2.91292 0.521997 -3.2766 0.088495 c -0.464989 -0.554261 1.62455 -0.52489 3.46654 -0.52489"];
};

WasedaOneLong = function() { WasedaChar.call(this, "WasedaOneLong", "一", "SW18P", "SW", "SWP", "black", false, p(9.0, -7.6)); };
WasedaOneLong.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["一"] = WasedaOneLong;

WasedaOneLong.prototype.setPaths = function() {
  this.paths = ["m 0 0 l -8.99651 15.1121"];
  this.dp = p(-5.21372, 12.7068);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "SWL16":
      this.dp.x += 6;
      this.dp.y += -5;
      return;

    case "SWL8":
      this.dp.x += 5;
      this.dp.y += -5;
      return;
  }

  //switch (_head) {}
};

WasedaEight = function() { WasedaChar.call(this, "WasedaEight", "８", "8", "NWL", "NEL", "black", false, p(3.0, -2)); };
WasedaEight.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["８"] = WasedaEight;

WasedaEight.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.53839, 0.150752);
  this.paths = ["m 0 0 c -0.27285 -1.01827 -2.48057 -1.63167 -3.1442 -0.04307 c -0.34662 0.829743 1.91981 2.1737 1.78746 3.46724 c -0.0883 0.863237 -0.76958 1.99173 -1.63671 2.02435 c -0.33493 0.0126 -0.68765 -0.397043 -0.68914 -0.732209 c -0.009 -2.07258 4.22098 -4.56555 4.22098 -4.56555"];
};

WasedaPya = function() { WasedaChar.call(this, "WasedaPya", "ぴゃ", "SWL8", "SWL", "SWL", "black", false, p(4.3, -3.5)); };
WasedaPya.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぴゃ"] = WasedaPya;

WasedaPya.prototype.setPaths = WasedaHya.prototype.setPaths; 
WasedaPya.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m-1.6,4.0v0.1"];
};

WasedaPa = function() { WasedaChar.call(this, "WasedaPa", "ぱ", "SWL8NEL4", "SWL", "NEL", "black", false, p(4.3, -3.7)); };
WasedaPa.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぱ"] = WasedaPa;

WasedaPa.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-0.327817, 5.09172);
  this.paths = ["m 0 0 c -1.69793 0.980301 -5.70552 5.28918 -3.75382 7.13783 c 0.965719 0.914725 3.05936 -0.677791 3.426 -2.04611"];
};

WasedaPi = function() { WasedaChar.call(this, "WasedaPi", "ぴ", "SWL8NEL4CL1", "SWL", "NELCL", "black", false, p(4.3, -3.7)); };
WasedaPi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぴ"] = WasedaPi;

WasedaPi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "NEL8":
      this.dp = p(-0.36276, 5.84668);
      this.paths = ["m 0 0 c -1.69793 0.980301 -5.58539 5.17009 -3.75382 7.13783 c 0.860217 0.924168 3.46997 -0.101931 3.46997 -1.51851 c 0 -1.28493 -1.53767 -0.132568 -1.45366 0.35946 c 0.077479 0.453794 0.649379 0.288293 1.37475 -0.132101"];
      return;
  }

  switch (_head) {
    case "SW":
      this.dp = p(-1.29906, 7.1492);
      this.paths = ["m 0 0 c -1.69793 0.980301 -5.58539 5.17009 -3.75382 7.13783 c 0.860217 0.924168 3.38493 0.010715 3.75157 -1.3576 c 0.224221 -0.836807 -0.372502 -0.95893 -0.722941 -0.092971 c -0.228753 0.565266 -0.438365 1.08966 -0.573869 1.46194"];
      return;

    case "S":
      this.dp = p(-1.04617, 6.73721);
      this.paths = ["m 0 0 c -1.69793 0.980301 -5.58539 5.17009 -3.75382 7.13783 c 0.860217 0.924168 3.10333 -0.1502 3.46997 -1.51851 c 0.344272 -1.28484 -0.756203 -1.42628 -0.756203 -0.376163 c 0 0.587397 -0.00612 1.06563 -0.00612 1.49405"];
      return;
  }

  this.dp = p(-0.657873, 6.33586);
  this.paths = ["m 0 0 c -1.69793 0.980301 -5.58539 5.17009 -3.75382 7.13783 c 0.860217 0.924168 3.10333 -0.1502 3.46997 -1.51851 c 0.344272 -1.28484 -1.34164 -0.918359 -1.04664 -0.386159 c 0.2937 0.5087 0.455416 0.726511 0.672616 1.10271"];
};

WasedaPu = function() { WasedaChar.call(this, "WasedaPu", "ぷ", "SWL16", "SWL", "SWL", "black", false, p(6.9, -7.3)); };
WasedaPu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぷ"] = WasedaPu;

WasedaPu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
      this.dp = p(-6.76189, 14.5009);
      this.paths = ["m 0 0 c -3.2552 3.2552 -10.1102 14.5009 -6.76189 14.5009"];
      return;
  }

  this.dp = p(-6.76189, 14.5009);
  this.paths = ["m 0 0 c -3.2552 3.2552 -7.65129 11.1816 -6.76189 14.5009"];
};

WasedaPe = function() { WasedaChar.call(this, "WasedaPe", "ぺ", "SWL16NEL4CL1", "SWL", "NELCL", "black", false, p(7.3, -7.4)); };
WasedaPe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぺ"] = WasedaPe;

WasedaPe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-3.70494, 13.2294);
  this.paths = ["m 0 0 c -3.2552 3.2552 -9.19184 12.0711 -6.76189 14.5009 c 0.940596 0.94054 3.05936 -0.677791 3.426 -2.0461 c 0.344271 -1.28484 -1.34164 -0.918359 -1.04664 -0.386159 c 0.2937 0.5087 0.460386 0.784524 0.677586 1.16072"];
};

WasedaPo = function() { WasedaChar.call(this, "WasedaPo", "ぽ", "SWL16ONEL4", "SWL", "SWLONEL", "black", false, p(7.3, -7.4)); };
WasedaPo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぽ"] = WasedaPo;

WasedaPo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "NEL":
      this.dp = p(-5.88056, 14.632);
      this.paths = ["m 0 0 c -3.2552 3.2552 -9.19177 12.071 -6.76189 14.5009 c 0.540532 0.540533 1.43519 -0.105032 1.89102 -0.563559 c 0.479314 -0.46559 1.22132 -1.6301 0.663341 -1.99771 c -0.508869 -0.335253 -1.48042 1.81315 -1.67303 2.69242"];
      return;
  }

  this.dp = p(-6.54779, 14.6491);
  this.paths = ["m 0 0 c -3.2552 3.2552 -9.19177 12.071 -6.76189 14.5009 c 0.540532 0.540533 1.43519 -0.105032 1.89102 -0.563559 c 0.479314 -0.46559 1.22132 -1.6301 0.663341 -1.99771 c -0.508869 -0.335253 -1.72729 1.75907 -2.34026 2.70947"];
};

WasedaPai = function() { WasedaChar.call(this, "WasedaPai", "ぱい", "SWL8ONEL4", "SWL", "SWLONEL", "black", false, p(4.3, -3.6)); };
WasedaPai.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぱい"] = WasedaPai;

WasedaPai.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "NELF":
      this.dp = p(-2.92779, 7.6226);
      this.paths = ["m 0 0 c -1.82284 1.82284 -4.43268 5.3175 -3.27715 7.30534 c 0.413629 0.711565 1.33377 0.249932 1.7896 -0.208595 c 0.479309 -0.46559 1.3988 -1.83294 0.840819 -2.20055 c -0.508869 -0.335253 -1.66809 1.77601 -2.28106 2.72641"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SW":
      this.dp = p(-3.48203, 7.42005);
      this.paths = ["m 0 0 c -2.23251 1.28894 -5.2686 5.01054 -4 6.9282 c 0.979602 1.48079 2.07186 -0.384595 2.26796 -1.06376 c 0.198558 -0.687662 0.517971 -1.65993 0.047356 -1.94017 c -0.523577 -0.311786 -1.55003 2.8163 -1.79735 3.49578"];
      return;
  }

  this.dp = p(-3.65064, 7.24547);
  this.paths = ["m 0 0 c -2.23251 1.28894 -5.15553 4.94036 -4 6.9282 c 0.41363 0.711565 1.33377 0.249932 1.7896 -0.208595 c 0.47931 -0.46559 1.3988 -1.83294 0.84082 -2.20055 c -0.50887 -0.335253 -1.66809 1.77601 -2.28106 2.72641"];
};

WasedaPyu = function() { WasedaChar.call(this, "WasedaPyu", "ぴゅ", "SWL16CL1", "SWL", "SWLCL", "black", false, p(6.9, -7.3)); };
WasedaPyu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぴゅ"] = WasedaPyu;

WasedaPyu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-6.86932, 13.1963);
  this.paths = ["m 0 0 c -2.8832 2.8832 -6.66141 9.43097 -6.86932 13.1963 c -0.01488 0.269591 -0.153793 1.07491 0.226806 1.28642 c 0.254368 0.141356 0.757241 -0.03916 0.810143 -0.325314 c 0.08567 -0.463431 -0.711117 -0.850484 -1.03695 -0.961101"];
};

WasedaPyo = function() { WasedaChar.call(this, "WasedaPyo", "ぴょ", "SWL16CL8", "SWL", "SWLCL", "black", false, p(6.8, -7.3)); };
WasedaPyo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぴょ"] = WasedaPyo;

WasedaPyo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-5.567, 8.48128);
  this.paths = ["m 0 0 c -2.8832 2.88319 -6.79055 9.40441 -6.79055 13.1754 c 0 1.6449 2.82366 2.24165 2.82366 -0.223886 c 0 -1.07603 -0.240635 -2.11558 -1.60011 -4.47026"];
};

WasedaPan = function() { WasedaChar.call(this, "WasedaPan", "ぱん", "SWL8NEL4F", "SWL", "NELF", "black", false, p(4.3, -3.7)); };
WasedaPan.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぱん"] = WasedaPan;

WasedaPan.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.17656, 3.15637);
  this.paths = ["m 0 0 c -1.69793 0.980301 -5.70552 5.28918 -3.75382 7.13783 c 0.965719 0.914725 3.05936 -0.677791 3.426 -2.04611"];
};

WasedaPen = function() { WasedaChar.call(this, "WasedaPen", "ぺん", "SWL16NEL4CL1NE1F", "SWL", "NEF", "black", false, p(7.3, -7.4)); };
WasedaPen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぺん"] = WasedaPen;

WasedaPen.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-0.583877, 12.0286);
  this.paths = ["m 0 0 c -3.2552 3.2552 -9.19184 12.0711 -6.76189 14.5009 c 0.940596 0.94054 3.426 -0.629522 3.426 -2.0461 c 0 -0.798266 -1.27554 0.08357 -1.24825 0.535507 c 0.020819 0.344799 0.464789 0.528708 0.994581 0.291006 l 1.14689 -0.514575"];
};

WasedaPon = function() { WasedaChar.call(this, "WasedaPon", "ぽん", "SWL16ONEL4NE1F", "SWL", "NEF", "black", false, p(7.3, -7.3)); };
WasedaPon.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぽん"] = WasedaPon;

WasedaPon.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-2.84326, 13.5824);
  this.paths = ["m 0 0 c -3.2552 3.2552 -9.19177 12.071 -6.76189 14.5009 c 0.540532 0.540533 1.43409 -0.36221 1.83441 -0.869925 c 0.435933 -0.552887 0.982665 -1.53464 0.424686 -1.90225 c -0.508869 -0.335253 -1.29884 1.89989 -1.80166 2.94744 l 1.55118 -0.500565"];
};

WasedaOu = function() { WasedaChar.call(this, "WasedaOu", "おー", "SW4CL1", "SW", "SWCL", "black", false, p(1.3, -2.0)); };
WasedaOu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["おー"] = WasedaOu;

WasedaOu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SR":
      this.dp = p(-0.910605, 2.48978);
      this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.516589 0.902107 0.753496 0.6652 c 0.320144 -0.320144 -0.207749 -1.04072 -0.457771 -1.47378"];
      return;
  }

  this.dp = p(-1.0434, 2.85287);
  this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.490497 0.87276 0.753496 0.6652 c 0.329153 -0.25977 -0.134344 -0.988445 -0.590566 -1.11069"];
};

WasedaUu = function() { WasedaChar.call(this, "WasedaUu", "うう", "S4CL1", "S", "SCL", "black", false, p(0.0, -2.0)); };
WasedaUu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["うう"] = WasedaUu;
WasedaChar.dict["うー"] = WasedaUu;

WasedaUu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 2.75413);
  this.paths = ["m 0 0 v 2.75413 c 0 0.466672 -0.158809 1.23022 0.419996 1.25999 c 0.730631 0.037576 0.924407 -0.981626 -0.419996 -1.25999"];
};

WasedaNaa = function() { WasedaChar.call(this, "WasedaNaa", "なあ", "EL8", "EL", "EL", "black"); };
WasedaNaa.prototype = Object.create(WasedaNa.prototype);
WasedaChar.dict["なあ"] = WasedaNaa;
WasedaChar.dict["なー"] = WasedaNaa;
WasedaNaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.167805,2.23111 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};


WasedaHaa = function() { WasedaChar.call(this, "WasedaHaa", "はあ", "SEL8", "SEL", "SEL", "black", false, p(0.0, -3.0)); };
WasedaHaa.prototype = Object.create(WasedaHa.prototype);
WasedaChar.dict["はあ"] = WasedaHaa;
WasedaChar.dict["はー"] = WasedaHaa;
WasedaHaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -0.140693,4.528369 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaMaa = function() { WasedaChar.call(this, "WasedaMaa", "まあ", "ER8", "ER", "ER", "black"); };
WasedaMaa.prototype = Object.create(WasedaMa.prototype);
WasedaChar.dict["まあ"] = WasedaMaa;
WasedaChar.dict["まー"] = WasedaMaa;
WasedaMaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.683933,0.02235 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaYaa = function() { WasedaChar.call(this, "WasedaYaa", "やあ", "NER8", "NER", "NER", "black", false, p(0.0, 2.6)); };
WasedaYaa.prototype = Object.create(WasedaYa.prototype);
WasedaChar.dict["やあ"] = WasedaYaa;
WasedaChar.dict["やー"] = WasedaYaa;
WasedaYaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 1.202014,-5.329489 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaRaa = function() { WasedaChar.call(this, "WasedaRaa", "らあ", "SER8", "SER", "SER", "black", false, p(0.0, -3.5)); };
WasedaRaa.prototype = Object.create(WasedaRa.prototype);
WasedaChar.dict["らあ"] = WasedaRaa;
WasedaChar.dict["らー"] = WasedaRaa;
WasedaRaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 1.395454,3.052909 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaWaa = function() { WasedaChar.call(this, "WasedaWaa", "わあ", "UWL4", "WL", "EL", "black", false, p(1.8, -1.7)); };
WasedaWaa.prototype = Object.create(WasedaWa.prototype);
WasedaChar.dict["わあ"] = WasedaWaa;
WasedaChar.dict["わー"] = WasedaWaa;
WasedaWaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -3.182625,1.763309 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaKyaa = function() { WasedaChar.call(this, "WasedaKyaa", "きゃあ", "SL8", "SL", "SL", "black", false, p(1.1, -4.0)); };
WasedaKyaa.prototype = Object.create(WasedaKya.prototype);
WasedaChar.dict["きゃあ"] = WasedaKyaa;
WasedaChar.dict["きゃー"] = WasedaKyaa;
WasedaKyaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -2.6470192,3.651155 c 0,0.545901 0.118182,1.053503 0.67553,1.202845"];
};

WasedaShaa = function() { WasedaChar.call(this, "WasedaShaa", "しゃあ", "SR8", "SR", "SR", "black", false, p(0.0, -4.0)); };
WasedaShaa.prototype = Object.create(WasedaSha.prototype);
WasedaChar.dict["しゃあ"] = WasedaShaa;
WasedaChar.dict["しゃー"] = WasedaShaa;
WasedaShaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -0.516642,3.651155 c 0,0.545901 0.118182,1.053503 0.67553,1.202845"];
};

WasedaChaa = function() { WasedaChar.call(this, "WasedaChaa", "ちゃあ", "NE8", "NE", "NE", "black", false, p(0.0, 2.4)); };
WasedaChaa.prototype = Object.create(WasedaCha.prototype);
WasedaChar.dict["ちゃあ"] = WasedaChaa;
WasedaChar.dict["ちゃー"] = WasedaChaa;
WasedaChaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 2.459843,-4.494998 c 0,0.545901 0.118182,1.053503 0.67553,1.202845"];
};

WasedaNyaa = function() { WasedaChar.call(this, "WasedaNyaa", "にゃあ", "EL8", "EL", "EL", "black"); };
WasedaNyaa.prototype = Object.create(WasedaNya.prototype);
WasedaChar.dict["にゃあ"] = WasedaNyaa;
WasedaChar.dict["にゃー"] = WasedaNyaa;
WasedaNyaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.245971,-0.06125 c 0,0.545901 0.180595,1.598482 0.737943,1.747824"];
};

WasedaHyaa = function() { WasedaChar.call(this, "WasedaHyaa", "ひゃあ", "SWL8", "SWL", "SWL", "black", false, p(4.3, -3.5)); };
WasedaHyaa.prototype = Object.create(WasedaHya.prototype);
WasedaChar.dict["ひゃあ"] = WasedaHyaa;
WasedaChar.dict["ひゃー"] = WasedaHyaa;
WasedaHyaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m -3.847314,0.760966 c 0,0.545901 0.118182,1.053503 0.67553,1.202845"];
};

WasedaMyaa = function() { WasedaChar.call(this, "WasedaMyaa", "みゃあ", "ER8", "ER", "ER", "black"); };
WasedaMyaa.prototype = Object.create(WasedaMya.prototype);
WasedaChar.dict["みゃあ"] = WasedaMyaa;
WasedaChar.dict["みゃー"] = WasedaMyaa;
WasedaMyaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 4.48037,-2.050129 c 0,0.545901 0.179954,1.485905 0.737302,1.635247"];
};

WasedaRyaa = function() { WasedaChar.call(this, "WasedaRyaa", "りゃあ", "SER8", "SER", "SER", "black", false, p(0.0, -3.5)); };
WasedaRyaa.prototype = Object.create(WasedaRya.prototype);
WasedaChar.dict["りゃあ"] = WasedaRyaa;
WasedaChar.dict["りゃー"] = WasedaRyaa;
WasedaRyaa.prototype.setPathsExtra = function() {
  this.pathsExtra = ["m 1.973922,2.839352 c 0.407489,0.405605 1.717135,0.179561 2.004017,-0.08154"];
};

WasedaMein = function() { WasedaChar.call(this, "WasedaMein", "めいん", "ER4CR1NE1F", "ER", "NEF", "black", false, p(0.0, 1.1)); };
WasedaMein.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["めいん"] = WasedaMein;
WasedaChar.dict["いいん"] = WasedaMein;
WasedaChar.dict["めーん"] = WasedaMein;
WasedaChar.dict["いーん"] = WasedaMein;

WasedaMein.prototype.setPaths = function() {
  this.dp = p(6.30505, -2.9464);
  this.paths = ["m 0 0 c 1.57891 -0.9116 4.00001 -1.2364 4 0 c 0 0.5964 -0.501169 0.989285 -0.806628 0.775321 c -0.390326 -0.27341 0.104104 -0.653823 0.578906 -1.30722 l 1.06066 -1.06066"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  switch (_name) {
    case "WasedaTei":
    case "WasedaDesu":
      this.dp.move(0.5, 0);
      return;
  }

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
};

WasedaNii = function() { WasedaChar.call(this, "WasedaNii", "にい", "EL8CL1", "EL", "ELCL", "black", false, p(0.0, -0.1)); };
WasedaNii.prototype = Object.create(WasedaNi.prototype);
WasedaChar.dict["にい"] = WasedaNii;
WasedaChar.dict["にー"] = WasedaNii;
WasedaNii.prototype.setPathsExtra = function() { this.pathsExtra = ["m 4.322525,1.68948 c 0,0.545902 0.118182,1.053505 0.67553,1.202846"]; };

WasedaSou = function() { WasedaChar.call(this, "WasedaSou", "そう", "NEL16", "NEL", "NEL", "black", false, p(0.0, 5.7)); };
WasedaSou.prototype = Object.create(WasedaSo.prototype);
WasedaChar.dict["そう"] = WasedaSou;
WasedaChar.dict["そー"] = WasedaSou;
WasedaSou.prototype.setPathsExtra = function() {
  if (this.model == "SWR16") {
    this.pathsExtra = ["m -4.486723,6.95321 c 0,0.5459 0.118181,1.0535 0.675529,1.20284"];
    return;
  }
  this.pathsExtra = ["m 5.840203,-7.53078 c 0,0.5459 0.118182,1.0535 0.67553,1.20284"];
};

WasedaKyou = function() { WasedaChar.call(this, "WasedaKyou", "きょう", "SL8ONEL4", "SL", "SLONEL", "black", false, p(1.0, -4.0), 4); };
WasedaKyou.prototype = Object.create(WasedaKyo.prototype);
WasedaChar.dict["きょう"] = WasedaKyou;
WasedaChar.dict["きょー"] = WasedaKyou;
WasedaKyou.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.6342711,3.157745 c 0,0.5459 0.118182,1.0535 0.67553,1.20284"]; };

WasedaTou = function() { WasedaChar.call(this, "WasedaTou", "とう", "NE16", "NE", "NE", "black", false, p(0.0, 6.1)); };
WasedaTou.prototype = Object.create(WasedaTo.prototype);
WasedaChar.dict["とう"] = WasedaTou;
WasedaChar.dict["とー"] = WasedaTou;
WasedaTou.prototype.setPathsExtra = function() {
  if (this.model == "SW16") {
    this.pathsExtra = ["m -5.5,6.66675 c 0,0.5459 0.312901,1.05351 0.870249,1.20285"];
    return;
  }
  switch (this.getNextHeadType()) {
    case "SW":
    case "SWR":
      this.pathsExtra = ["m 5.514891,-6.71872 c 0,0.5459 0.118182,1.0535 0.67553,1.20284"];
      return;
  }
  this.pathsExtra = ["m 4.152952,-8.295694 c 0,0.5459 0.118182,1.0535 0.67553,1.20284"];
};

WasedaGi = function() { WasedaChar.call(this, "WasedaGi", "ぎ", "E8CL1", "E", "ECL", "black"); };
WasedaGi.prototype = Object.create(WasedaKi.prototype);
WasedaChar.dict["ぎ"] = WasedaGi;
WasedaGi.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.5,1v0.1"];
};

WasedaGu = function() { WasedaChar.call(this, "WasedaGu", "ぐ", "E8CL4", "E", "ECL4", "black", false, p(0.0, 0.9)); };
WasedaGu.prototype = Object.create(WasedaKu.prototype);
WasedaChar.dict["ぐ"] = WasedaGu;
WasedaGu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.5,1v0.1"];
};

WasedaGe = function() { WasedaChar.call(this, "WasedaGe", "げ", "E16CL1", "E", "ECL", "black", false, p(0.0, 0.5)); };
WasedaGe.prototype = Object.create(WasedaKe.prototype);
WasedaChar.dict["げ"] = WasedaGe;
WasedaGe.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m9,1v0.1"];
};

WasedaGo = function() { WasedaChar.call(this, "WasedaGo", "ご", "E16", "E", "E", "black", false, p(0.0, 0.0)); };
WasedaGo.prototype = Object.create(WasedaKo.prototype);
WasedaChar.dict["ご"] = WasedaGo;
WasedaGo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m9,1v0.1"];
};

WasedaZa = function() { WasedaChar.call(this, "WasedaZa", "ざ", "NEL8", "NEL", "NEL", "black", false, p(0.0, 2.5)); };
WasedaZa.prototype = Object.create(WasedaSa.prototype);
WasedaChar.dict["ざ"] = WasedaZa;
WasedaZa.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 3.0687526,-3.76471 v 0.1"];
};

WasedaJi = function() { WasedaChar.call(this, "WasedaJi", "じ", "NEL8CL1", "NEL", "NELCL", "black", false, p(0.0, 2.5)); };
WasedaJi.prototype = Object.create(WasedaShi.prototype);
WasedaChar.dict["じ"] = WasedaJi;
WasedaJi.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 3.0902351,-3.4 v 0.1"];
};

WasedaZu = function() { WasedaChar.call(this, "WasedaZu", "ず", "NEL8CL4", "NEL", "NELCL4", "black", false, p(0.0, 2.5)); };
WasedaZu.prototype = Object.create(WasedaSu.prototype);
WasedaChar.dict["ず"] = WasedaZu;
WasedaZu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 3.0902351,-2.920441 v 0.1"];
};

WasedaZe = function() { WasedaChar.call(this, "WasedaZe", "ぜ", "NEL16", "NEL", "NELCL", "black", false, p(0.0, 5.7)); };
WasedaZe.prototype = Object.create(WasedaSe.prototype);
WasedaChar.dict["ぜ"] = WasedaZe;
WasedaZe.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  if (this.model == "SWR16CR1") {
    this.pathsExtra = ["m -3.169702,6.6515 v 0.1"];
  } else {
    this.pathsExtra = ["m 6.186364,-6.482285 v 0.1"];
  }
};

WasedaZo = function() { WasedaChar.call(this, "WasedaZo", "ぞ", "NEL16", "NEL", "NEL", "black", false, p(0.0, 5.7)); };
WasedaZo.prototype = Object.create(WasedaSo.prototype);
WasedaChar.dict["ぞ"] = WasedaZo;
WasedaZo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 6.186364,-6.482285 v 0.1"];
};

WasedaDa = function() { WasedaChar.call(this, "WasedaDa", "だ", "SW8", "SW", "SW", "black", false, p(2.9, -3.3)); };
WasedaDa.prototype = Object.create(WasedaTa.prototype);
WasedaChar.dict["だ"] = WasedaDa;
WasedaDa.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -2.2584033,2.64108 v 0.1"];
};

WasedaDhi = function() { WasedaChar.call(this, "WasedaDhi", "ぢ", "SW8CR1", "SW", "SWCR", "black", false, p(2.9, -3.3)); };
WasedaDhi.prototype = Object.create(WasedaChi.prototype);
WasedaChar.dict["ぢ"] = WasedaDhi;
WasedaDhi.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  if (this.model == "NE8CL1") {
    this.pathsExtra = ["m 3.297685,-3.25821 v 0.1"];
  } else {
    this.pathsExtra = ["m -2.2584033,2.64108 v 0.1"];
  }
};

WasedaDu = function() { WasedaChar.call(this, "WasedaDu", "どぅ", "S4CR1", "S", "SCR", "black", false, p(1.1, -2.3)); };
WasedaDu.prototype = Object.create(WasedaTsu.prototype);
WasedaChar.dict["づ"] = WasedaDu;
WasedaDu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  if (this.getPrevModel() == "NEL16") {
    this.pathsExtra = ["m -0.4,2.4 v 0.1"];
  } else {
    this.pathsExtra = ["m -0.883492,1.408401 v 0.1"];
  }
};

WasedaDe = function() { WasedaChar.call(this, "WasedaDe", "で", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 5.9)); };
WasedaDe.prototype = Object.create(WasedaTe.prototype);
WasedaChar.dict["で"] = WasedaDe;
WasedaDe.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.706209,-7.371519 v 0.1"];
};

WasedaDo = function() { WasedaChar.call(this, "WasedaDo", "ど", "NE16", "NE", "NE", "black", false, p(0.0, 6.1)); };
WasedaDo.prototype = Object.create(WasedaTo.prototype);
WasedaChar.dict["ど"] = WasedaDo;
WasedaDo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.706209,-7.371519 v 0.1"];
};

WasedaBa = function() { WasedaChar.call(this, "WasedaBa", "ば", "SEL8", "SEL", "SEL", "black", false, p(0.0, -3.0)); };
WasedaBa.prototype = Object.create(WasedaHa.prototype);
WasedaChar.dict["ば"] = WasedaBa;
WasedaBa.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.2446876,5.607452 v 0.1"];
};

WasedaBi = function() { WasedaChar.call(this, "WasedaBi", "び", "SEL8CL1", "SEL", "SELCL", "black", false, p(0.0, -2.9)); };
WasedaBi.prototype = Object.create(WasedaHi.prototype);
WasedaChar.dict["び"] = WasedaBi;
WasedaBi.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.2446876,5.607452 v 0.1"];
};

WasedaBu = function() { WasedaChar.call(this, "WasedaBu", "ぶ", "SEL8CL4", "SEL", "SELCL4", "black", false, p(0.0, -2.9)); };
WasedaBu.prototype = Object.create(WasedaHu.prototype);
WasedaChar.dict["ぶ"] = WasedaBu;
WasedaBu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.2446876,5.607452 v 0.1"];
};

WasedaBe = function() { WasedaChar.call(this, "WasedaBe", "べ", "SEL16CL1", "SEL", "CL", "black", false, p(0.0, -7.0)); };
WasedaBe.prototype = Object.create(WasedaHe.prototype);
WasedaChar.dict["べ"] = WasedaBe;
WasedaBe.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.04477,9.805729 v 0.1"];
};

WasedaBo = function() { WasedaChar.call(this, "WasedaBo", "ぼ", "SEL16", "SEL", "SEL", "black", false, p(0.0, -6.9)); };
WasedaBo.prototype = Object.create(WasedaHo.prototype);
WasedaChar.dict["ぼ"] = WasedaBo;
WasedaBo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.04477,9.805729 v 0.1"];
};

WasedaGya = function() { WasedaChar.call(this, "WasedaGya", "ぎゃ", "SL8", "SL", "SL", "black", false, p(1.1, -4.0)); };
WasedaGya.prototype = Object.create(WasedaKya.prototype);
WasedaChar.dict["ぎゃ"] = WasedaGya;
WasedaGya.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -2.5,3.997611 v 0.1"];
};

WasedaGyu = function() { WasedaChar.call(this, "WasedaGyu", "ぎゅ", "SL8CL1", "SL", "SLCL", "black", false, p(1.6, -4.0)); };
WasedaGyu.prototype = Object.create(WasedaKyu.prototype);
WasedaChar.dict["ぎゅ"] = WasedaGyu;
WasedaGyu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -2.5,3.997611 v 0.1"];
};

WasedaGyo = function() { WasedaChar.call(this, "WasedaGyo", "ぎょ", "SL8ONEL4", "SL", "SLONEL", "black", false, p(1.0, -4.0), 4); };
WasedaGyo.prototype = Object.create(WasedaKyo.prototype);
WasedaChar.dict["ぎょ"] = WasedaGyo;
WasedaGyo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -2.5,3.997611 v 0.1"];
};

WasedaJa = function() { WasedaChar.call(this, "WasedaJa", "じゃ", "SR8", "SR", "SR", "black", false, p(0.0, -4.0)); };
WasedaJa.prototype = Object.create(WasedaSha.prototype);
WasedaChar.dict["じゃ"] = WasedaJa;
WasedaJa.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.06228,3.913652 v 0.1"];
};

WasedaJu = function() { WasedaChar.call(this, "WasedaJu", "じゅ", "SR8CR1", "SR", "SRCR", "black", false, p(0.5, -4.0)); };
WasedaJu.prototype = Object.create(WasedaShu.prototype);
WasedaChar.dict["じゅ"] = WasedaJu;
WasedaJu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.06228,3.913652 v 0.1"];
};

WasedaJo = function() { WasedaChar.call(this, "WasedaJo", "じょ", "NEL16CL8", "NEL", "NELCL8", "black", false, p(0.0, 6.5)); };
WasedaJo.prototype = Object.create(WasedaSho.prototype);
WasedaChar.dict["じょ"] = WasedaJo;
WasedaJo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 6.864682,-5.117058 v 0.1"];
};

WasedaDya = function() { WasedaChar.call(this, "WasedaDya", "ぢゃ", "NE8", "NE", "NE", "black", false, p(0.0, 2.4)); };
WasedaDya.prototype = Object.create(WasedaCha.prototype);
WasedaChar.dict["ぢゃ"] = WasedaDya;
WasedaDya.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 2.8588032,-3.4825 v 0.1"];
};

WasedaDyu = function() { WasedaChar.call(this, "WasedaDyu", "ぢゅ", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 2.7)); };
WasedaDyu.prototype = Object.create(WasedaChu.prototype);
WasedaChar.dict["ぢゅ"] = WasedaDyu;
WasedaDyu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 2.8588032,-3.4825 v 0.1"];
};

WasedaDyo = function() { WasedaChar.call(this, "WasedaDyo", "ぢょ", "NE8OWL4", "NE", "OWL", "black", false, p(0.0, 2.6)); };
WasedaDyo.prototype = Object.create(WasedaCho.prototype);
WasedaChar.dict["ぢょ"] = WasedaDyo;
WasedaDyo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 2.8588032,-3.4825 v 0.1"];
};

WasedaBya = function() { WasedaChar.call(this, "WasedaBya", "びゃ", "SWL8", "SWL", "SWL", "black", false, p(4.3, -3.5)); };
WasedaBya.prototype = Object.create(WasedaHya.prototype);
WasedaChar.dict["びゃ"] = WasedaBya;
WasedaBya.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -3.821902,1.713604 v 0.1"];
};

WasedaByu = function() { WasedaChar.call(this, "WasedaByu", "びゅ", "SWL8CL1", "SWL", "SWLCL", "black", false, p(4.3, -3.6)); };
WasedaByu.prototype = Object.create(WasedaHyu.prototype);
WasedaChar.dict["びゅ"] = WasedaByu;
WasedaByu.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -3.821902,1.713604 v 0.1"];
};

WasedaByo = function() { WasedaChar.call(this, "WasedaByo", "びょ", "SWL8CL4", "SWL", "SWLCL4", "black", false, p(4.3, -3.5)); };
WasedaByo.prototype = Object.create(WasedaHyo.prototype);
WasedaChar.dict["びょ"] = WasedaByo;
WasedaByo.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -3.821902,1.713604 v 0.1"];
};

WasedaGaa = function() { WasedaChar.call(this, "WasedaGaa", "があ", "E8", "E", "E", "black", false, p(0, 0)); };
WasedaGaa.prototype = Object.create(WasedaKa.prototype);
WasedaChar.dict["があ"] = WasedaGaa;
WasedaChar.dict["がー"] = WasedaGaa;
WasedaGaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 4.1666249,-0.54766 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };


WasedaGii = function() { WasedaChar.call(this, "WasedaGii", "ぎい", "E8CL1", "E", "ECL", "black"); };
WasedaGii.prototype = Object.create(WasedaKi.prototype);
WasedaChar.dict["ぎい"] = WasedaGii;
WasedaChar.dict["ぎー"] = WasedaGii;
WasedaGii.prototype.setPathsExtra = function() { this.pathsExtra = ["m 4.1666249,-0.54766 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; }

WasedaGuu = function() { WasedaChar.call(this, "WasedaGuu", "ぐう", "E8CL4", "E", "ECL4", "black", false, p(0.0, 0.9)); };
WasedaGuu.prototype = Object.create(WasedaKu.prototype);
WasedaChar.dict["ぐう"] = WasedaGuu;
WasedaChar.dict["ぐー"] = WasedaGuu;
WasedaGuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.5,-0.54766 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaGei = function() { WasedaChar.call(this, "WasedaGei", "げい", "E16CL1", "E", "ECL", "black", false, p(0.0, 0.5)); };
WasedaGei.prototype = Object.create(WasedaKe.prototype);
WasedaChar.dict["げい"] = WasedaGei;
WasedaChar.dict["げー"] = WasedaGei;
WasedaGei.prototype.setPathsExtra = function() { this.pathsExtra = ["m 8.515951,-0.837615 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaGou = function() { WasedaChar.call(this, "WasedaGou", "ごう", "E16", "E", "E", "black", false, p(0.0, 0.0)); };
WasedaGou.prototype = Object.create(WasedaKo.prototype);
WasedaChar.dict["ごう"] = WasedaGou;
WasedaChar.dict["ごー"] = WasedaGou;
WasedaGou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 8.515951,-0.672877 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaZaa = function() { WasedaChar.call(this, "WasedaZaa", "ざあ", "NEL8", "NEL", "NEL", "black", false, p(0.0, 2.5)); };
WasedaZaa.prototype = Object.create(WasedaSa.prototype);
WasedaChar.dict["ざあ"] = WasedaZaa;
WasedaChar.dict["ざー"] = WasedaZaa;
WasedaZaa.prototype.setPathsExtra = function() {
  if (this.model == "SWR8") {
    this.pathsExtra = ["m -0.919854,3.35137 c 0,0.5459 0.312901,1.05351 0.870249,1.20285"]; 
    return;
  }
  this.pathsExtra = ["m 3.268934,-2.775263 c 0,0.545901 0.118182,1.053504 0.6755299,1.202845"];
};


WasedaJii = function() { WasedaChar.call(this, "WasedaJii", "じい", "NEL8CL1", "NEL", "NELCL", "black", false, p(0.0, 2.5)); };
WasedaJii.prototype = Object.create(WasedaShi.prototype);
WasedaChar.dict["じい"] = WasedaJii;
WasedaChar.dict["じー"] = WasedaJii;
WasedaJii.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.268934,-2.775263 c 0,0.545901 0.118182,1.053504 0.6755299,1.202845"]; };

WasedaZuu = function() { WasedaChar.call(this, "WasedaZuu", "ずう", "NEL8CL4", "NEL", "NELCL4", "black", false, p(0.0, 2.5)); };
WasedaZuu.prototype = Object.create(WasedaSu.prototype);
WasedaChar.dict["ずう"] = WasedaZuu;
WasedaChar.dict["ずー"] = WasedaZuu;
WasedaZuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 3.268934,-2.775263 c 0,0.545901 0.118182,1.053504 0.6755299,1.202845"]; };

WasedaZei = function() { WasedaChar.call(this, "WasedaZei", "ぜい", "NEL16", "NEL", "NELCL", "black", false, p(0.0, 5.7)); };
WasedaZei.prototype = Object.create(WasedaSe.prototype);
WasedaChar.dict["ぜい"] = WasedaZei;
WasedaChar.dict["ぜー"] = WasedaZei;
WasedaZei.prototype.setPathsExtra = function() { this.pathsExtra = ["m 7.009872,-5.45847 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaZou = function() { WasedaChar.call(this, "WasedaZou", "ぞう", "NEL16", "NEL", "NEL", "black", false, p(0.0, 5.7)); };
WasedaZou.prototype = Object.create(WasedaSo.prototype);
WasedaChar.dict["ぞう"] = WasedaZou;
WasedaChar.dict["ぞー"] = WasedaZou;
WasedaZou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 6.78115,-5.961659 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaDaa = function() { WasedaChar.call(this, "WasedaDaa", "だあ", "SW8", "SW", "SW", "black", false, p(2.9, -3.3)); };
WasedaDaa.prototype = Object.create(WasedaTa.prototype);
WasedaChar.dict["だあ"] = WasedaDaa;
WasedaChar.dict["だー"] = WasedaDaa;
WasedaDaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.6992626,3.074845 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaDii = function() { WasedaChar.call(this, "WasedaDii", "でぃい", "SW8CR1", "SW", "SWCR", "black", false, p(2.9, -3.3)); };
WasedaDii.prototype = Object.create(WasedaChi.prototype);
WasedaChar.dict["ぢい"] = WasedaDii;
WasedaChar.dict["ぢー"] = WasedaDii;
WasedaDii.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.6992626,3.074845 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaDuu = function() { WasedaChar.call(this, "WasedaDuu", "どぅう", "S4CR1", "S", "SCR", "black", false, p(1.1, -2.3)); };
WasedaDuu.prototype = Object.create(WasedaTsu.prototype);
WasedaChar.dict["づう"] = WasedaDuu;
WasedaChar.dict["づー"] = WasedaDuu;
WasedaDuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.521962,0.9 c 0,0.545901 0.555742,1.018562 1.113201,1.018562"]; };

WasedaDei = function() { WasedaChar.call(this, "WasedaDei", "でい", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 5.9)); };
WasedaDei.prototype = Object.create(WasedaTe.prototype);
WasedaChar.dict["でい"] = WasedaDei;
WasedaChar.dict["でー"] = WasedaDei;
WasedaDei.prototype.setPathsExtra = function() { this.pathsExtra = ["m 5.177192,-7.355181 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaDou = function() { WasedaChar.call(this, "WasedaDou", "どう", "NE16", "NE", "NE", "black", false, p(0.0, 6.1)); };
WasedaDou.prototype = Object.create(WasedaTo.prototype);
WasedaChar.dict["どう"] = WasedaDou;
WasedaChar.dict["どー"] = WasedaDou;
WasedaDou.prototype.setPathsExtra = function() {
  if (this.model == "SW16") {
    this.pathsExtra = ["m -3.804665,6.66675 c 0,0.5459 0.312901,1.05351 0.870249,1.20285"];
    return;
  } else {
    switch (this.getNextHeadType()) {
      case "SW":
      case "SWR":
        this.pathsExtra = ["m 6.260263,-5.21438 c 0,0.5459 0.312901,1.05351 0.870249,1.20285"];
        return;
    }
  }
  this.pathsExtra = ["m 5.33028,-7.278636 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaBaa = function() { WasedaChar.call(this, "WasedaBaa", "ばあ", "SEL8", "SEL", "SEL", "black", false, p(0.0, -3.0)); };
WasedaBaa.prototype = Object.create(WasedaHa.prototype);
WasedaChar.dict["ばあ"] = WasedaBaa;
WasedaChar.dict["ばー"] = WasedaBaa;
WasedaBaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.2978169,3.457128 c 0.5959128,0.595913 1.2589844,0.645969 1.7151087,0.523751"]; };

WasedaBii = function() { WasedaChar.call(this, "WasedaBii", "びい", "SEL8CL1", "SEL", "SELCL", "black", false, p(0.0, -2.9)); };
WasedaBii.prototype = Object.create(WasedaHi.prototype);
WasedaChar.dict["びい"] = WasedaBii;
WasedaChar.dict["びー"] = WasedaBii;
WasedaBii.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.2978169,3.457128 c 0.5959128,0.595913 1.2589844,0.645969 1.7151087,0.523751"]; };

WasedaBuu = function() { WasedaChar.call(this, "WasedaBuu", "ぶう", "SEL8CL4", "SEL", "SELCL4", "black", false, p(0.0, -2.9)); };
WasedaBuu.prototype = Object.create(WasedaHu.prototype);
WasedaChar.dict["ぶう"] = WasedaBuu;
WasedaChar.dict["ぶー"] = WasedaBuu;
WasedaBuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.590394,2.615965 c 0.595912,0.595912 1.258984,0.645968 1.715108,0.523751"]; };

WasedaBei = function() { WasedaChar.call(this, "WasedaBei", "べい", "SEL16CL1", "SEL", "CL", "black", false, p(0.0, -7.0)); };
WasedaBei.prototype = Object.create(WasedaHe.prototype);
WasedaChar.dict["べい"] = WasedaBei;
WasedaChar.dict["べー"] = WasedaBei;
WasedaBei.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.301297,7.169237 c 0.595912,0.595912 1.258984,0.645968 1.715108,0.523751"]; };

WasedaBou = function() { WasedaChar.call(this, "WasedaBou", "ぼう", "SEL16", "SEL", "SEL", "black", false, p(0.0, -6.9)); };
WasedaBou.prototype = Object.create(WasedaHo.prototype);
WasedaChar.dict["ぼう"] = WasedaBou;
WasedaChar.dict["ぼー"] = WasedaBou;
WasedaBou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 0.188692,8.2581 c 0.595912,0.595912 1.258984,0.645968 1.715108,0.523751"]; };

WasedaJaa = function() { WasedaChar.call(this, "WasedaJaa", "じゃあ", "SR8", "SR", "SR", "black", false, p(0.0, -4.0)); };
WasedaJaa.prototype = Object.create(WasedaSha.prototype);
WasedaChar.dict["じゃあ"] = WasedaJaa;
WasedaChar.dict["じゃー"] = WasedaJaa;
WasedaJaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 0.6794013,3.65565 c 0,0.5459 0.7439963,1.0535 1.3013443,1.20284"]; };

WasedaJuu = function() { WasedaChar.call(this, "WasedaJuu", "じゅう", "SR8CR1", "SR", "SRCR", "black", false, p(0.5, -4.0)); };
WasedaJuu.prototype = Object.create(WasedaShu.prototype);
WasedaChar.dict["じゅう"] = WasedaJuu;
WasedaChar.dict["じゅー"] = WasedaJuu;
WasedaJuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 0.6794013,3.65565 c 0,0.5459 0.7439963,1.0535 1.3013443,1.20284"]; };

WasedaJou = function() { WasedaChar.call(this, "WasedaJou", "じょう", "NEL16CL8", "NEL", "NELCL8", "black", false, p(0.0, 6.5)); };
WasedaJou.prototype = Object.create(WasedaSho.prototype);
WasedaChar.dict["じょう"] = WasedaJou;
WasedaChar.dict["じょー"] = WasedaJou;
WasedaJou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 7.043582,-5.23006 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaGyaa = function() { WasedaChar.call(this, "WasedaGyaa", "ぎゃあ", "SL8", "SL", "SL", "black", false, p(1.1, -4.0)); };
WasedaGyaa.prototype = Object.create(WasedaKya.prototype);
WasedaChar.dict["ぎゃあ"] = WasedaGyaa;
WasedaChar.dict["ぎゃー"] = WasedaGyaa;
WasedaGyaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.6531475,3.23781 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaGyuu = function() { WasedaChar.call(this, "WasedaGyuu", "ぎゅう", "SL8CL1", "SL", "SLCL", "black", false, p(1.6, -4.0)); };
WasedaGyuu.prototype = Object.create(WasedaKyu.prototype);
WasedaChar.dict["ぎゅう"] = WasedaGyuu;
WasedaChar.dict["ぎゅー"] = WasedaGyuu;
WasedaGyuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -1.919988,3.14886 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaGyou = function() { WasedaChar.call(this, "WasedaGyou", "ぎょう", "SL8ONEL4", "SL", "SLONEL", "black", false, p(1.0, -4.0), 4); };
WasedaGyou.prototype = Object.create(WasedaKyo.prototype);
WasedaChar.dict["ぎょう"] = WasedaGyou;
WasedaChar.dict["ぎょー"] = WasedaGyou;
WasedaGyou.prototype.setPathsExtra = function() {
  switch (this.getPrevTailType()) {
    case "NELCL":
    case "NELCL4":
    case "NELCL8":
      this.pathsExtra = ["m -1.0,3.23781 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"];
      return;
  }
  this.pathsExtra = ["m -1.608673,3.23781 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"];
};

WasedaByaa = function() { WasedaChar.call(this, "WasedaByaa", "びゃあ", "SWL8", "SWL", "SWL", "black", false, p(4.3, -3.5)); };
WasedaByaa.prototype = Object.create(WasedaHya.prototype);
WasedaChar.dict["びゃあ"] = WasedaByaa;
WasedaChar.dict["びゃー"] = WasedaByaa;
WasedaByaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m -3.356759,2.20952 c 0,0.5459 0.7439969,1.0535 1.301345,1.20284"]; };

WasedaByuu = function() { WasedaChar.call(this, "WasedaByuu", "びゅう", "SWL8CL1", "SWL", "SWLCL", "black", false, p(4.3, -3.6)); };
WasedaByuu.prototype = Object.create(WasedaHyu.prototype);
WasedaChar.dict["びゅう"] = WasedaByuu;
WasedaChar.dict["びゅー"] = WasedaByuu;
WasedaByuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -3.35676,2.20952 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaByou = function() { WasedaChar.call(this, "WasedaByou", "びょう", "SWL8CL4", "SWL", "SWLCL4", "black", false, p(4.3, -3.5)); };
WasedaByou.prototype = Object.create(WasedaHyo.prototype);
WasedaChar.dict["びょう"] = WasedaByou;
WasedaChar.dict["びょー"] = WasedaByou;
WasedaByou.prototype.setPathsExtra = function() { this.pathsExtra = ["m -3.35676,2.20952 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaJaa = function() { WasedaChar.call(this, "WasedaJaa", "じゃあ", "NE8", "NE", "NE", "black", false, p(0.0, 2.4)); };
WasedaJaa.prototype = Object.create(WasedaCha.prototype);
WasedaChar.dict["ぢゃあ"] = WasedaJaa;
WasedaChar.dict["ぢゃー"] = WasedaJaa;
WasedaJaa.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.9566643,-3.10252 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaJuu = function() { WasedaChar.call(this, "WasedaJuu", "じゅう", "NE16CL1", "NE", "NECL", "black", false, p(0.0, 2.7)); };
WasedaJuu.prototype = Object.create(WasedaChu.prototype);
WasedaChar.dict["ぢゅう"] = WasedaJuu;
WasedaChar.dict["ぢゅー"] = WasedaJuu;
WasedaJuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.9566643,-3.10252 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaJou = function() { WasedaChar.call(this, "WasedaJou", "じょう", "NE8OWL4", "NE", "OWL", "black", false, p(0.0, 2.6)); };
WasedaJou.prototype = Object.create(WasedaCho.prototype);
WasedaChar.dict["ぢょう"] = WasedaJou;
WasedaChar.dict["ぢょー"] = WasedaJou;
WasedaJou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.9566643,-3.10252 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaJei = function() { WasedaChar.call(this, "WasedaJei", "Jえい", "NE8CR1", "NE", "CR", "black", false, p(0.0, 2.6)); };
WasedaJei.prototype = Object.create(WasedaTer.prototype);
WasedaChar.dict["ぢぇい"] = WasedaJei;
WasedaChar.dict["ぢぇー"] = WasedaJei;
WasedaJei.prototype.setPathsExtra = function() { this.pathsExtra = ["m 2.775684,-3.22317 c 0,0.5459 0.743997,1.0535 1.301345,1.20284"]; };

WasedaHou = function() { WasedaChar.call(this, "WasedaHou", "ほう", "SEL16", "SEL", "SEL", "black", false, p(0.0, -6.9)); };
WasedaHou.prototype = Object.create(WasedaHo.prototype);
WasedaChar.dict["ほう"] = WasedaHou;
WasedaChar.dict["ほー"] = WasedaHou;
WasedaHou.prototype.setPathsExtra = function() { this.pathsExtra = ["m -0.250365,8.556441 c 0,0.5459 0.118182,1.05351 0.67553,1.20285"]; };

WasedaZai = function() { WasedaChar.call(this, "WasedaZai", "ざい", "UER4", "SER", "SWR", "black", false, p(0.0, -2.0)); };
WasedaZai.prototype = Object.create(WasedaSai.prototype);
WasedaChar.dict["ざい"] = WasedaZai;
WasedaZai.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m -0.46811,1.819487 v 0.1"];
};

WasedaShun = function() { WasedaChar.call(this, "WasedaShun", "しゅん", "SR8CR1NE1F", "SR", "NEF", "black", false, p(0.5, -4.0)); };
WasedaShun.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しゅん"] = WasedaShun;

WasedaShun.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(3.60063, 3.70794);
  this.paths = ["m 0 0 c 1.499 2.2223 1.9629 6.491 0 7.9701 c -0.2799 0.2187 -0.6365 -0.139 -0.4227 -0.4227 c 0.3455 -0.4267 1.21063 -1.17249 1.56772 -1.51436 l 0.98794 -0.966441"];
};

WasedaKyuu = function() { WasedaChar.call(this, "WasedaKyuu", "きゅう", "SL8CL1", "SL", "SLCL", "black", false, p(1.6, -4.0)); };
WasedaKyuu.prototype = Object.create(WasedaKyu.prototype);
WasedaChar.dict["きゅう"] = WasedaKyuu;
WasedaChar.dict["きゅー"] = WasedaKyuu;
WasedaKyuu.prototype.setPathsExtra = function() { this.pathsExtra = ["m -2.886311,3.497459 c 0,0.5459 0.118182,1.05351 0.67553,1.20285"]; };

WasedaJun = function() { WasedaChar.call(this, "WasedaJun", "じゅん", "SR8CR1NE1F", "SR", "NEF", "black", false, p(0.5, -4.0)); };
WasedaJun.prototype = Object.create(WasedaShun.prototype);
WasedaChar.dict["じゅん"] = WasedaJun;
WasedaJun.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 0.06228,3.913652 v 0.1"];
};

WasedaShou = function() { WasedaChar.call(this, "WasedaShou", "しょう", "NEL16CL8", "NEL", "NELCL8", "black", false, p(0.0, 6.5)); };
WasedaShou.prototype = Object.create(WasedaSho.prototype);
WasedaChar.dict["しょう"] = WasedaShou;
WasedaChar.dict["しょー"] = WasedaShou;
WasedaShou.prototype.setPathsExtra = function() {
  switch (this.getNextHeadType()) {
    case "SER":
      this.pathsExtra = ["m 4.386652,-4.818376 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
      return;

    case "SW":
      this.pathsExtra = ["m 4.17827,-4.83722 c 0,0.5459 0.118182,1.0535 0.67553,1.20284"];
      return;
  }
  this.pathsExtra = ["m 6.401668,-6.228887 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"];
};

WasedaKou = function() { WasedaChar.call(this, "WasedaKou", "こう", "E16", "E", "E", "black", false, p(0.0, 0.0)); };
WasedaKou.prototype = Object.create(WasedaKo.prototype);
WasedaChar.dict["こう"] = WasedaKou;
WasedaChar.dict["こー"] = WasedaKou;
WasedaKou.prototype.setPathsExtra = function() { this.pathsExtra = ["m 8.71157,1.403832 c 0,0.545901 0.118182,1.053504 0.67553,1.202845"]; };

WasedaKou2 = function() { WasedaChar.call(this, "WasedaKou2", "コー", "E4P", "E", "P", "black", false, p(0.0, -0.5)); };
WasedaKou2.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["コー"] = WasedaKou2;

WasedaKou2.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2, 1.5);
  this.paths = ["m 0 0 h 4", "m 2 0 v 1.5"];
};

WasedaGin = function() { WasedaChar.call(this, "WasedaGin", "ぎん", "E8CL1E1F", "E", "EF", "black", false, p(0.0, 0.5)); };
WasedaGin.prototype = Object.create(WasedaKin.prototype);
WasedaChar.dict["ぎん"] = WasedaGin;
WasedaGin.prototype.setPathsExtra = function() {
  this.thicknessExtra = this.thickness * 1.5;
  this.pathsExtra = ["m 4.5,1v0.1"];
};

WasedaZen = function() { WasedaChar.call(this, "WasedaZen", "ぜん", "NE8", "NE", "NEF", "black", false, p(0.0, 2.4)); };
WasedaZen.prototype = Object.create(WasedaSen2.prototype);
WasedaChar.dict["ぜん"] = WasedaZen;
WasedaZen.prototype.setPathsExtra = WasedaDya.prototype.setPathsExtra;

WasedaJin = function() { WasedaChar.call(this, "WasedaJin", "じん", "NEL8CL1NE1F", "NEL", "NEF", "black", false, p(0.0, 3.3)); };
WasedaJin.prototype = Object.create(WasedaShin.prototype);
WasedaChar.dict["じん"] = WasedaJin;
WasedaJin.prototype.setPathsExtra = WasedaJi.prototype.setPathsExtra;

WasedaDoutoJoshi = function() { WasedaChar.call(this, "WasedaDoutoJoshi", "どうとじょし", "SW16NE1|SW16CL1", "SW", "SWCR", "black", false, p(6.8, -7.3)); };
WasedaDoutoJoshi.prototype = Object.create(WasedaTotoJoshi.prototype);
WasedaChar.dict["ドウト"] = WasedaDoutoJoshi;
WasedaDoutoJoshi.prototype.setPathsExtra = function() { this.pathsExtra = ["m -3.4528406,6.170042 c 0,0.5459 0.118182,1.0535 0.6755296,1.20284"]; };

WasedaKara = function() { WasedaChar.call(this, "WasedaKara", "から", "SER4F", "SER", "SERF", "black", false, p(0.0, -2.7)); };
WasedaKara.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["から"] = WasedaKara;

WasedaKara.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "SE":
      this.dp = p(1.15811, 5.27817);
      this.paths = ["m 0 0 c 1.99714 0 2.61161 2.405 2 3.464"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(1.15811, 5.27817);
  this.paths = ["m 0 0 c 1.13193 0.793 2.61161 2.405 2 3.464"];
};

WasedaNoni = function() { WasedaChar.call(this, "WasedaNoni", "のに", "EL8ONWL4", "EL", "ELONWL", "black", false, p(0.0, 0.7)); };
WasedaNoni.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["のに"] = WasedaNoni;

WasedaNoni.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(7.59184, 0.553125);
  this.paths = ["m 0 0 c 2.189 0.6692 7.46584 1.88154 7.97 0 c 0.308203 -1.15023 -0.936702 -2.35923 -1.68348 -2.35923 c -0.443871 0 0.849145 1.99457 1.30532 2.91236"];
};

WasedaKoso = function() { WasedaChar.call(this, "WasedaKoso", "こそ", "USWL4", "SWL", "NEL", "black", false, p(1.8, -1.9)); };
WasedaKoso.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["こそ"] = WasedaKoso;

WasedaKoso.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.46896, 1.27495);
  this.paths = ["m 0 0 c -0.610525 0.352487 -2.50254 2.72009 -1.5178 3.56177 c 1.16669 0.997213 3.67497 -1.74679 3.98676 -2.28682"];
};

WasedaToshite = function() { WasedaChar.call(this, "WasedaToshite", "として", "SW4CL1NW1", "SW", "NW", "black", false, p(1.8, -2.0)); };
WasedaToshite.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["として"] = WasedaToshite;

WasedaToshite.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SEL":
      this.dp = p(-1.35313, 1.03212);
      this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.313556 0.931741 0.576555 0.72418 c 0.421938 -0.332997 0.055353 -1.02864 -0.148213 -1.44817 c -0.189359 -0.390251 -0.433727 -1.11794 -0.57514 -1.54224"];
      return;
  }

  this.dp = p(-1.96277, 1.83434);
  this.paths = ["m 0 0 l -1.20633 3.29836 c -0.318513 0.870883 0.490497 0.872761 0.753496 0.6652 c 0.421938 -0.332997 -0.244144 -0.841121 -0.590566 -1.15327 c -0.232329 -0.209344 -0.561167 -0.624322 -0.919367 -0.975944"];
};

WasedaBakari = function() { WasedaChar.call(this, "WasedaBakari", "ばかり", "SEL8S3", "SEL", "S", "black", false, p(0.0, -4.2)); };
WasedaBakari.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ばかり"] = WasedaBakari;

WasedaBakari.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "S":
      this.dp = p(4.38711, 8);
      this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 2.5 l 0.2 -0.4924"];
      return;
  }

  this.dp = p(4.18711, 8.4798);
  this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 2.5"];
};

WasedaNagara = function() { WasedaChar.call(this, "WasedaNagara", "ながら", "EL8", "EL", "EL", "black"); };
WasedaNagara.prototype = Object.create(WasedaChar.prototype);
WasedaNagara.prototype.setPaths = function() {
  this.dp = p(4.423791, -1.5);
  this.paths = ["m 0 0c 2.04073 0.6631 7.67821 1.825 8 0"];
  if (this.getNextHeadType() == "") {
    this.paths.push("m 4.423791,-1.5 v 0.1 h -0.1 v -0.1");
  }
};
WasedaChar.dict["ながら"] = WasedaNagara;

WasedaKamo = function() { WasedaChar.call(this, "WasedaKamo", "かも", "E8CL1NE1F", "E", "NEF", "black", false, p(0.0, 0.7)); };
WasedaKamo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["かも"] = WasedaKamo;
WasedaChar.dict["けれども"] = WasedaKamo;
WasedaKamo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(8.03695, -2.73282);
  this.paths = ["m 0 0 h 7.5 c 0.540649 0 0.018764 1.22641 -0.692861 1.05074 c -0.306854 -0.075752 -0.33866 -0.344042 -0.00714 -1.05074 l 0.637054 -1.358"];
};

WasedaYoriP = function() { WasedaChar.call(this, "WasedaYoriP", "よりｐ", "P", "P", "P", "black"); };
WasedaYoriP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["よりｐ"] = WasedaYoriP;

WasedaYoriP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) { }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) { }

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "SER8CR4":
      this.dp = pp(5, 60);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = pp(3, 60);
};

WasedaYorimo = function() { WasedaChar.call(this, "WasedaYorimo", "よりも", "NER16CR1NE1F", "NER", "NEF", "black", false, p(0.0, 7.1)); };
WasedaYorimo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["よりも"] = WasedaYorimo;

WasedaYorimo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(13.2422, -14.1079);
  this.paths = ["m 0 0 c 1.2151 -3.3384 7.9227 -11.3137 11.3138 -11.3137 c 0.2753 0 0.528444 0.250972 0.536378 0.493884 c 0.0099 0.303312 -0.340825 0.56119 -0.628078 0.659078 c -0.165748 0.056483 -0.43293 0.072514 -0.519219 -0.079858 c -0.189742 -0.335054 0.27377 -0.849727 0.436653 -1.06944 l 0.893312 -1.20499"];
};

WasedaNado = function() { WasedaChar.call(this, "WasedaNado", "等", "SW4ONEL4", "SW", "SWONEL4", "black", false, p(1.4, -2.0)); };
WasedaNado.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["等"] = WasedaNado;

WasedaNado.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "ER":
      this.dp = p(-1.3681, 3.7587);
      this.paths = ["m 0 0 l -1.3681 3.7587 c 0.703988 -0.245888 3.3824 -1.75745 2.81445 -2.43641 c -0.301817 -0.360802 -1.98748 1.66496 -2.81445 2.43641"];
      return;
  }

  this.dp = p(-1.3681, 3.7587);
  this.paths = ["m 0 0 l -1.3681 3.7587 c 0.374934 0.100463 1.15212 0.209997 1.9253 -0.2364 c 0.836241 -0.482804 1.43476 -1.36524 1.1783 -1.6217 c -0.332619 -0.332619 -2.27664 1.08665 -3.1036 1.8581"];
};

WasedaMade = function() { WasedaChar.call(this, "WasedaMade", "まで", "PS3", "PS", "PS", "black", false, p(0.0, -1.5)); };
WasedaMade.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["まで"] = WasedaMade;
WasedaMade.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "ER8CR4":
      this.dp = p(5.9, 1.6).move(0, 1.5);
      this.paths = [this.dp.m() + "m0,-3v3"];
      return;
  }

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2, 0).move(0, 1.5);
  this.paths = [this.dp.m() + "m0,-3v3"];
};

WasedaMadeP = function() { WasedaChar.call(this, "WasedaMadeP", "までｐ", "P", "P", "P", "black"); };
WasedaMadeP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["までｐ"] = WasedaMadeP;

WasedaMadeP.prototype.setPaths = function() {
  const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tail_ = this.getPrevTailType();
  const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _head = this.getNextHeadType();

  switch (name_ + "_" + _name) { }

  //switch (name_ + "_" + _model) {}

  switch (name_ + "_" + _head) { }

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_head) {}

  this.dp = p(2, -1.5);
};

WasedaTsutsu = function() { WasedaChar.call(this, "WasedaTsutsu", "つつ", "PSW4F", "PSW", "SWF", "black", false, p(2.0, -2.8)); };
WasedaTsutsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["つつ"] = WasedaTsutsu;
WasedaChar.dict["ずつ"] = WasedaTsutsu;

WasedaTsutsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  switch (tail_ + "_" + _head) {
    case "SELCL_ER":
      this.dp = p(3.2, -7.7).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m3.2,-7.7 l -1.3681 3.7587"];
      return;
  }

  switch (tail_) {
    case "SWRCR":
      this.dp = p(4.2, -3.8).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m4.2,-3.8l -1.3681 3.7587"];
      return;

    case "NELCL":
      this.dp = p(2.2, -6).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m2.2,-6l -1.3681 3.7587"];
      return;

    case "S":
      this.dp = p(2.1, -5.7).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m2.1,-5.7 l -1.3681 3.7587"];
      return;

    case "ERCR":
      this.dp = p(2.5, -5.5).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m2.5,-5.5 l -1.3681 3.7587"];
      return;

    case "SER":
      this.dp = p(3, -5.5).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m3,-5.5 l -1.3681 3.7587"];
      return;

    case "ECL":
      this.dp = p(2.6, -6.0).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m2.6, -6.0 l -1.3681 3.7587"];
      return;

    case "SELCL":
      this.dp = p(2.6, -6.0).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m2.6, -6.0 l -1.3681 3.7587"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "":
      this.dp = p(1, -5.7).move(-1.3681, 3.7587);
      this.paths = ["m1,-5.7 l -1.3681 3.7587"];
      return;

    default:
      this.dp = p(3.2, -7.7).move(-1.3681, 3.7587).move(-0.6751016, 1.8826159);
      this.paths = ["m3.2,-7.7 l -1.3681 3.7587"];
      return;
  }
};

WasedaDakeP = function() { WasedaChar.call(this, "WasedaDakeP", "だけｐ", "P/X", "P/X", "P/X", "black"); };
WasedaDakeP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["だけｐ"] = WasedaDakeP;

WasedaDakeP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  switch (model_) {
    case "E4":
      this.dp = p(-1, -2);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "E":
      this.dp = p(-1.5, -2);
      return;
      
    case "S":
      this.tailType = "TAHENKI";
      this.dp = p(-1.749784, -1.028684);
      return;

    case "SERCR":
      this.tailType = "TAHENKI";
      this.dp = p(-1.749784, -1.028684);
      return;

    case "SERCR4":
      this.tailType = "TAHENKI";
      this.dp = p(-2, 1);
      return;

    case "SW":
      this.tailType = "TAHENKI";
      this.dp = p(-1.749784, -1.028684);
      return;

    case "ERCR4":
      this.tailType = "TAHENKI";
      this.dp = p(0, -2);
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};


WasedaZuHitei = function() { WasedaChar.call(this, "WasedaZuHitei", "ズ", "S24F", "S", "SF", "black", false, p(0.0, -13.0)); };
WasedaZuHitei.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ズ"] = WasedaZuHitei;

WasedaZuHitei.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 26.1);
  this.paths = ["m 0 0 v 24"];
};

CharDottedVerticalLine = function() { Char.call(this, "CharDottedVerticalLine", "…↓", "S8", "S", "S", "black", false, p(0.0, 1.5)); };
CharDottedVerticalLine.prototype = Object.create(Char.prototype);
Char.dict["…↓"] = CharDottedVerticalLine;

CharDottedVerticalLine.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 3);
  this.paths = ["m 0 0 l 0 1", "m 0 -2 l 0 1", "m 0 -4 l 0 1", "m 0 -6 l 0 1", "m 0 2 l 0 1"];
};

WasedaKkiri = function() { WasedaChar.call(this, "WasedaKkiri", "っきり", "XE16F", "XE", "EF", "black", false, p(0.0, -0.0)); };
WasedaKkiri.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["っきり"] = WasedaKkiri;

WasedaKkiri.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(18, 0.1);
  this.paths = ["m 0 0 h 16"];
};

WasedaKiri = function() { WasedaChar.call(this, "WasedaKiri", "きり", "E8F", "E", "EF", "black", false, p(0.0, -0.1)); };
WasedaKiri.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きり"] = WasedaKiri;
WasedaChar.dict["かり"] = WasedaKiri;

WasedaKiri.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "VERTICAL":
      this.dp = p(0, 10);
      this.paths = ["m0,0v8"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(10, 0);
  this.paths = ["m 0 0 h 8"];
};

WasedaKiriP = function() { WasedaChar.call(this, "WasedaKiriP", "つｐ", "P/X", "P/X", "P/X", "black"); };
WasedaKiriP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きりｐ"] = WasedaKiriP;

WasedaKiriP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  switch (tailModel_) {
    case "S8":
      this.dp = p(-2, -4);
      return;

    case "E8":
      this.dp = p(-4, -2);
      this.tailType = "VERTICAL";
      return;
  }

  switch (model_) {
    case "SE4NE1F":
      this.dp = p(-6, 1.2);
      return;

    case "NE16CL1":
      this.dp = p(-6, 4);
      return;

    case "ER8CR1":
      this.dp = p(-3, -2);
      this.tailType = "VERTICAL";
      return;

    case "SER16CR1":
      this.dp = p(-4, -4);
      return;

    case "SEL8":
      this.dp = p(-6, -2.5);
      return;

    case "SER8CR4":
      this.dp = p(-3, 0);
      return;

    case "NEL8CL4":
      this.dp = p(-3, 0);
      return;

    case "NEL8CL1":
      this.dp = p(-3.5, 1.5);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaMadede = function() { WasedaChar.call(this, "WasedaMadede", "までで", "PS3NW1", "PS", "NW", "black", false, p(1.1, -1.5)); };
WasedaMadede.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["までで"] = WasedaMadede;

WasedaMadede.prototype.setPaths = function() {
  this.pdp = p(2.5, -1.3);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  switch (_headModel) {
    case "ER8":
      this.dp = p(0, 1.85583);
      this.paths = ["m 0 0 v 2.97939 c 0 0.48482 -0.969503 0.339367 -0.969503 -0.198851 c 0 -0.354695 0.56064 -0.721298 0.969503 -0.924717"];
      return;
  }

  switch (_head) {
  }

  this.dp = p(-1.07885, 1.90656);
  this.paths = ["m 0 0 v 3 c -0.262148 -0.399955 -0.526361 -0.799162 -1.07885 -1.09344"];
};

WasedaMadeto = function() { WasedaChar.call(this, "WasedaMadeto", "までと", "PS3NE1", "PS", "NE", "black", false, p(0.0, -1.5)); };
WasedaMadeto.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["までと"] = WasedaMadeto;

WasedaMadeto.prototype.setPaths = function() {
  this.pdp = p(2, -1.3);

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "E":
    case "ER":
    case "SEL":
      this.dp = p(0.054905, 3.23947);
      this.paths = ["m 0 0 v 3 c 0.043507 0.657485 0.747991 0.433237 0.860742 -0.251762 c 0.100327 -0.609517 -0.837755 -0.901427 -0.837755 -0.63319 c 0 0.187757 0.031918 0.829654 0.031918 1.12442"];
      return;
  }

  this.dp = p(0.940224, 1.78935);
  this.paths = ["m 0 0 l 0 3 c -0.04052 -0.46311 0.602847 -1.08786 0.940224 -1.21065"];
};

WasedaBakaride = function() { WasedaChar.call(this, "WasedaBakaride", "ばかりで", "SEL8S3NW", "SELS3NW1", "NE", "black", false, p(0.0, -4.2)); };
WasedaBakaride.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ばかりで"] = WasedaBakaride;

WasedaBakaride.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "SEL":
      this.dp = p(4.18711, 8.4798);
      this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 2.5 c 0 0.492882 -1.17941 0.456754 -0.969112 -0.328099 c 0.116666 -0.435404 0.969112 -0.852454 0.969112 0.328099"];
      return;
  }

  this.dp = p(3.10826, 7.38636);
  this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 2.5 c -0.283545 -0.456142 -0.652748 -0.862702 -1.07885 -1.09344"];
};

WasedaBakarito = function() { WasedaChar.call(this, "WasedaBakarito", "ばかりと", "SEL8S3NE1", "SEL", "NE", "black", false, p(0.0, -4.2)); };
WasedaBakarito.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ばかりと"] = WasedaBakarito;

WasedaBakarito.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "ER":
    case "E":
      this.dp = p(4.18711, 8.09485);
      this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 3 c 0.04351 0.65748 0.747991 0.43323 0.860743 -0.25176 c 0.100327 -0.60952 -0.633279 -0.63319 -0.860743 -0.63319"];
      return;
  }

  this.dp = p(5.12733, 7.26915);
  this.paths = ["m 0 0 c 0 3.7764 0.935824 6.85098 4.18711 5.9798 v 1.25 v 0.625 v 0.625 c 0.08275 -0.57893 0.461904 -0.92743 0.940224 -1.21065"];
};

WasedaBunsuu = function() { WasedaChar.call(this, "WasedaBunsuu", "ぶんすう", "PE10P", "PE", "P", "black", false, p(0.0, 0.0)); };
WasedaBunsuu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ぶんすう"] = WasedaBunsuu;

WasedaBunsuu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(10, 0);
  this.paths = ["m 0 0 h 10"];
};

WasedaFour = function() { WasedaChar.call(this, "WasedaFour", "４", "SW5E4XSW6", "SW", "SW", "black", false, p(3.2, -3)); };
WasedaFour.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["４"] = WasedaFour;

WasedaFour.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.25326, 6.73624);
  this.paths = ["m 0 0 l -3.16447 4.38639 l 4.44905 0.03133", "m 0.783283 1.34725 l -2.03654 5.38899"];
};

WasedaFive = function() { WasedaChar.call(this, "WasedaFive", "５", "SW3SWR3GE4", "SW", "E", "black", false, p(3.7, -3.3)); };
WasedaFive.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["５"] = WasedaFive;

WasedaFive.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.55763, 1.5433);
  this.paths = ["m 0 0 l -1.33829 2.37919 c 0 0.608191 0.454606 3.09231 -0.594798 3.86618 c -0.465655 0.343393 -0.993566 0.468586 -1.71693 -0.254783", "m -0.868105 1.5433 h 3.42573"];
};

WasedaSix = function() { WasedaChar.call(this, "WasedaSix", "６", "SWL8CL1", "SWL", "SWLCL", "black", false, p(4.1, -3.7)); };
WasedaSix.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["６"] = WasedaSix;

WasedaSix.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-3.72996, 4.74722);
  this.paths = ["m 0 0 c 0 0 -4.29234 3.76681 -4.09327 6.24889 c 0.04021 0.501286 0.514384 1.11842 1.01726 1.11414 c 0.366064 -0.0031 0.71442 -0.457621 0.726614 -0.823495 c 0.02512 -0.753709 -1.38057 -1.79232 -1.38057 -1.79232"];
};

WasedaSeven = function() { WasedaChar.call(this, "WasedaSeven", "７", "SW2E3SW7", "SW", "SW", "black", false, p(1.0, -3.2), 4.3); };
WasedaSeven.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["７"] = WasedaSeven;

WasedaSeven.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.159657, 6.38633);
  this.paths = ["m 0 0 l -0.98456 2.15539", "m -0.133592 0.292458 l 3.43319 0.239736 l -3.13994 5.85413"];
};

WasedaNine = function() { WasedaChar.call(this, "WasedaNine", "９", "CL4SW7", "CL", "SW", "black", false, p(3.6, -2.7)); };
WasedaNine.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["９"] = WasedaNine;

WasedaNine.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-2.66349, 6.2311);
  this.paths = ["m 0 0 c -0.16025 -0.598048 -0.90849 -0.976057 -1.47852 -0.893913 c -1.03328 0.148902 -2.14568 1.26772 -2.11354 2.31118 c 0.0105 0.339703 0.39634 0.66268 0.73308 0.708637 c 1.18449 0.161654 3.15221 -1.7105 3.15221 -1.7105 l -2.95672 5.81569"];
};

WasedaOne = function() { WasedaChar.call(this, "WasedaOne", "１", "SW7", "SW", "SW", "black", false, p(1.7, -2.2)); };
WasedaOne.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["１"] = WasedaOne;

WasedaOne.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-2.37258, 6.23909);
  this.paths = ["m 0 0 l -2.37258 6.23909"];
};

WasedaWave = function() { WasedaChar.call(this, "WasedaWave", "〜", "ER3EL3", "ER", "EL", "black", false, p(0.0, 0.5)); };
WasedaWave.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["〜"] = WasedaWave;

WasedaWave.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(5.84148, -0.944554).add(this.getNextOffset());
  this.paths = ["m 0 0 c 0.803712 -0.803712 1.8476 -1.13751 2.76809 -0.436745 c 1.01156 0.770095 1.98032 0.585253 3.07339 -0.507809"];
};

WasedaWatakushi = function() { WasedaChar.call(this, "WasedaWatakushi", "わたくし", "NE8", "NE", "NE", "black", false, p(0.0, 2.4-10)); };
WasedaWatakushi.prototype = Object.create(WasedaCha.prototype);
WasedaChar.dict["わたくし"] = WasedaWatakushi;
WasedaChar.dict["私"] = WasedaWatakushi;

WasedaShikashi = function() { WasedaChar.call(this, "WasedaShikashi", "しかし", "NE8", "NE", "NE", "black", false, p(0.0, 2.4+10)); };
WasedaShikashi.prototype = Object.create(WasedaCha.prototype);
WasedaChar.dict["しかし"] = WasedaShikashi;
WasedaChar.dict["然"] = WasedaShikashi;


WasedaKin = function() { WasedaChar.call(this, "WasedaKin", "きん", "E4", "E", "E", "black"); }; WasedaKai = function() { WasedaChar.call(this, "WasedaKai", "きん", "E4F", "E", "EF", "black"); };
WasedaKin.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["きん"] = WasedaKin;
WasedaChar.dict["彼"] = WasedaKin;
WasedaKin.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(6, 0);
  this.paths = ["m0,0h4"];
};


WasedaAna = function() { WasedaChar.call(this, "WasedaAna", "あな", "SE4NE4", "SE", "NE", "black", false, p(0.0, -1.6)); };
WasedaAna.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["あな"] = WasedaAna;
WasedaChar.dict["穴"] = WasedaAna;
WasedaChar.dict["あなた"] = WasedaAna;

WasedaAna.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(4.94211, 0);
  this.paths = ["m 0 0 l 2.47105 3.20134 l 2.47105 -3.20134"];
};

WasedaShikamo = function() { WasedaChar.call(this, "WasedaShikamo", "しかも", "NE8CR1NE1F", "NE", "NEF", "black", false, p(0.0, 4.0+10)); };
WasedaShikamo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["しかも"] = WasedaShikamo;

WasedaShikamo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(7.53024, -7.98411);
  this.paths = ["m 0 0 c 2.13049 -1.58006 4.01619 -3.22646 5.97267 -5.0117 c 0.3253 -0.3253 0.412482 -0.042948 0.46407 0.1072 c 0.147916 0.430508 -0.433841 1.2184 -0.860697 1.06026 c -0.360699 -0.133634 -0.160993 -0.812152 0.031995 -1.15353 c 0.258913 -0.457996 0.684588 -1.04459 0.859358 -1.29211"];
};

WasedaKore = function() { WasedaChar.call(this, "WasedaKore", "これ", "OSWL4", "OSWL", "OSWL", "black", false, p(2.6, -1.5)); };
WasedaKore.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["これ"] = WasedaKore;
WasedaChar.dict["この"] = WasedaKore;

WasedaKore.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-2e-06, -1e-05);
  this.paths = ["m 0 0 c -0.246867 0.142528 -0.929546 0.984295 -1.23455 1.57861 c -0.302872 0.590156 -1.07917 2.15984 -0.558772 1.90995 c 0.780763 -0.374902 1.77743 -2.32943 1.79332 -3.48857"];
};

WasedaOnajiP = function() { WasedaChar.call(this, "WasedaOnajiP", "おなじｐ", "P/X", "P/X", "P/X", "black"); };
WasedaOnajiP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["おなじｐ"] = WasedaOnajiP;

WasedaOnajiP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(3, -3.8);
};

WasedaDaitaiP = function() { WasedaChar.call(this, "WasedaDaitaiP", "だいたいｐ", "P/X", "P/X", "P/X", "black"); };
WasedaDaitaiP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["だいたいｐ"] = WasedaDaitaiP;

WasedaDaitaiP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2, -4);
};

WasedaSunawachi = function() { WasedaChar.call(this, "WasedaSunawachi", "すなわち", "SW4E4NW4", "SW", "NW", "black", false, p(1.8, -1.5)); };
WasedaSunawachi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["すなわち"] = WasedaSunawachi;
WasedaChar.dict["△"] = WasedaSunawachi;

WasedaSunawachi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
  this.paths = ["m 0 0 l -1.78629 3.05865 h 3.57259 l -1.78629 -3.05865"];
};

WasedaNihonP = function() { WasedaChar.call(this, "WasedaNihonP", "日本ｐ", "P/X", "P/X", "P/X", "black"); };
WasedaNihonP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["日本ｐ"] = WasedaNihonP;

WasedaNihonP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-4, 2);
};

WasedaTaihen = function() { WasedaChar.call(this, "WasedaTaihen", "大変", "PS4NW1F", "PS", "NWF", "black", false, p(2.6, -2.0)); };
WasedaTaihen.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["大変"] = WasedaTaihen;
WasedaChar.dict["たいへん"] = WasedaTaihen;

WasedaTaihen.prototype.setPaths = function() {
  this.dp = p(-2.59002, 2.07432);
  this.paths = ["m 0 0 v 4 c -0.262148 -0.399955 -0.526361 -0.799162 -1.07885 -1.09344"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "EL":
      this.dp.move(0, 2.5);
      return;
  }
};

WasedaDatoJoshi = function() { WasedaChar.call(this, "WasedaDatoJoshi", "ダト", "SW8NE1", "SW", "SWNE", "black", false, p(2.7, -3.8)); };
WasedaDatoJoshi.prototype = Object.create(WasedaTatoJoshi.prototype);
WasedaChar.dict["ダト"] = WasedaDatoJoshi;
WasedaDatoJoshi.prototype.setPathsExtra = WasedaDa.prototype.setPathsExtra;

WasedaKotode = function() { WasedaChar.call(this, "WasedaKotode", "ことで", "S8NW1", "S", "NW", "black", false, p(1.1, -4.0)); };
WasedaKotode.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ことで"] = WasedaKotode;

WasedaKotode.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.07885, 6.90656);
  this.paths = ["m 0 0 v 8 c -0.262148 -0.399955 -0.526361 -0.799162 -1.07885 -1.09344"];
};

WasedaKototo = function() { WasedaChar.call(this, "WasedaKototo", "ことと", "S8NE1", "S", "NE", "black", false, p(0.0, -4.0)); };
WasedaKototo.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ことと"] = WasedaKototo;

WasedaKototo.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.940224, 6.78935);
  this.paths = ["m 0 0 v 8 c -0.04052 -0.46311 0.602847 -1.08786 0.940224 -1.21065"];
};

WasedaLtsusuru = function() { WasedaChar.call(this, "WasedaLtsusuru", "っする", "XSE2NE2", "XSE", "NE", "black", false, p(0.0, -1.1)); };
WasedaLtsusuru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["っする"] = WasedaLtsusuru;

WasedaLtsusuru.prototype.setPaths = function() {
  this.dp = p(2.57373, 0.3357);
  this.paths = ["m 0 0 l 1.34281 2.23802 l 1.23091 -1.90232"];

  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  switch (tailModel_) {

    case "SE8":
      this.pdp = p(-4, -4);
      this.dp = p(2.69865, -0.25878);
      this.paths = ["m 0 0 l 1.40478 1.47871 l 1.29388 -1.73749"];
      return;

    case "SW8":
      this.pdp = p(1, -5);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
};

WasedaSetsu = function() { WasedaChar.call(this, "WasedaSetsu", "せつ", "SE4F", "SE", "SEF", "black", false, p(0.0, -2.1)); };
WasedaSetsu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["せつ"] = WasedaSetsu;

WasedaSetsu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(4.24265, 4.24261);
  this.paths = ["m 0 0 l 2.82843 2.8284"];
};

WasedaTsukeP = function() { WasedaChar.call(this, "WasedaTsukeP", "つけｐ", "P/X", "P/X", "P/X", "black"); };
WasedaTsukeP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["つけｐ"] = WasedaTsukeP;

WasedaTsukeP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _head) {}

  //switch (tailModel_) {}

  switch (model_) {
    case "E8CL1SW1F":
      this.dp = p(-2.6, -4.2);
      return;
  }

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaShita = function() { WasedaChar.call(this, "WasedaShita", "した", "PS2", "PS", "S", "black", false, p(0.0, -1)); };
WasedaShita.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["した"] = WasedaShita;
WasedaChar.dict["下"] = WasedaShita;

WasedaShita.prototype.setPaths = function() {
  this.dp = p(0, 2);
  this.paths = ["m 0 0 v 2"];

  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "EL4":
      this.pdp = p(-1.5, 3);
      return;

    case "E8":
      this.pdp = p(-4, 2);
      return;
  }

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}
};

WasedaNodesu = function() { WasedaChar.call(this, "WasedaNodesu", "のです", "SWR4CR1", "SWR", "SWRCR", "black", false, p(2.9, -1.7)); };
WasedaNodesu.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["のです"] = WasedaNodesu;

WasedaNodesu.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "S":
    case "SW":
      this.dp = p(-1.25465, 2.79326);
      this.paths = ["m 0 0 c 1.08852 0.628458 -0.949482 2.99724 -2.20899 3.33472 c -0.911152 0.244139 -0.852114 -0.917681 -0.175057 -0.917681 c 0.465188 0 0.698252 0.127307 1.1294 0.376226"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.25465, 2.79327);
  this.paths = ["m 0 0 c 0 1.34814 -0.949482 2.99724 -2.20899 3.33472 c -0.911152 0.244139 -0.852114 -0.917681 -0.175057 -0.917681 c 0.465188 0 0.698252 0.127307 1.1294 0.376226"];
};

WasedaNodeshita = function() { WasedaChar.call(this, "WasedaNodeshita", "のでした", "SWR4CR1S3", "SWR", "S", "black", false, p(2.8, -2.8)); };
WasedaNodeshita.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["のでした"] = WasedaNodeshita;

WasedaNodeshita.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "S":
    case "SW":
      this.dp = p(-1.83376, 5.69213);
      this.paths = ["m 0 0 c 1.08852 0.628458 -0.949481 2.99724 -2.20899 3.33472 c -0.911152 0.244139 -0.629394 -1.09586 0.04766 -1.09586 c 0.465188 0 0.327567 0.591145 0.327569 0.953274 l 1e-06 2.5"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.83376, 5.69214);
  this.paths = ["m 0 0 c 0 1.34814 -0.949482 2.99724 -2.20899 3.33472 c -0.911152 0.244139 -0.629394 -1.09586 0.04766 -1.09586 c 0.465188 0 0.327567 0.591145 0.327569 0.953274 l 1e-06 2.5"];
};

WasedaDeshita = function() { WasedaChar.call(this, "WasedaDeshita", "でした", "SW4CR1S3", "SW", "S", "black", false, p(2.0, -3.0)); };
WasedaDeshita.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["でした"] = WasedaDeshita;

WasedaDeshita.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.14385, 5.95592);
  this.paths = ["m 0 0 l -1.10117 3.37142 c -0.096608 0.360532 -0.865201 0.071469 -0.865201 -0.340074 c 0 -0.450639 0.854628 -1.02543 0.836873 -0.223505 l -0.014348 0.648075 v 2.5"];
};

WasedaDeshou = function() { WasedaChar.call(this, "WasedaDeshou", "でしょう", "SW4OWR4", "SW", "SWOWR", "black", false, p(4.4, -1.9)); };
WasedaDeshou.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["でしょう"] = WasedaDeshou;

WasedaDeshou.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.01492, 3.10736);
  this.paths = ["m 0 0 l -1.10117 3.37142 c -0.21016 0.64344 -2.91292 0.521997 -3.2766 0.088495 c -0.316661 -0.377456 2.97984 -0.352558 3.36285 -0.352558"];
};

WasedaNodeshite = function() { WasedaChar.call(this, "WasedaNodeshite", "のでして", "SWR4CR1", "SWR", "SE", "black", false, p(2.7, -1.7)); };
WasedaNodeshite.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["のでして"] = WasedaNodeshite;

WasedaNodeshite.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  switch (tail_) {
    case "S":
    case "SW":
      this.dp = p(0.75492, 4.98729);
      this.paths = ["m 0 0 c 1.08852 0.628458 -1.47691 3.6616 -2.34036 3.26173 c -0.640754 -0.296735 -0.261467 -1.36122 0.427644 -0.727527 c 0.292305 0.268795 0.107496 0.09588 0.459436 0.422484 l 2.2082 2.0306"];
      return;
  }

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.754915, 4.98729);
  this.paths = ["m 0 0 c 0 1.34814 -1.47691 3.6616 -2.34036 3.26173 c -0.640754 -0.296735 -0.261467 -1.36122 0.427644 -0.727527 c 0.292305 0.268795 0.107496 0.095875 0.459436 0.422484 l 2.2082 2.0306"];
};

WasedaNodeshou = function() { WasedaChar.call(this, "WasedaNodeshou", "のでしょう", "SWR4OWR4", "SWR", "SWROWR", "black", false, p(4.9, -1.8)); };
WasedaNodeshou.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["のでしょう"] = WasedaNodeshou;

WasedaNodeshou.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-1.04634, 2.5876);
  this.paths = ["m 0 0 c 0 1.34814 -0.949482 2.99724 -2.20899 3.33472 c -1.2879 0.345088 -2.30635 0.168162 -2.67002 -0.265341 c -0.316661 -0.377456 3.17117 -0.481775 3.83268 -0.481775"];
};


WasedaSoi = function() { WasedaChar.call(this, "WasedaSoi", "そい", "NEL4", "NEL", "NEL", "black", false, p(0.0, 1.3)); };
WasedaSoi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["そい"] = WasedaSoi;

WasedaSoi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(2.99304, -2.65362);
  this.paths = ["m 0 0 c 1.44749 -0.387854 2.99304 -1.552 2.99304 -2.65362"];
};

WasedaShoReversed = function() { WasedaChar.call(this, "WasedaShoReversed", "しょ変規", "SWR16CR8", "SWR", "SWRCR8", "black", false, p(5, -6.5)); };
WasedaShoReversed.prototype = Object.create(WasedaSho.prototype);
WasedaShoReversed.prototype.getFilteredPrevTailType = function() { return "R"; };
WasedaChar.dict["しょ変"] = WasedaShoReversed;
WasedaChar.dict["しょｈ"] = WasedaShoReversed;

WasedaTori = function() { WasedaChar.call(this, "WasedaTori", "とり", "S8CL1", "S", "SCL", "black", false, p(0.0, -4.0)); };
WasedaTori.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["とり"] = WasedaTori;
WasedaChar.dict["とれ"] = WasedaTori;

WasedaTori.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0.021129, 6.73906);
  this.paths = ["m 0 0 l 0.021129 6.73906 c 0.00146 0.466669 -0.158809 1.23022 0.419996 1.25999 c 0.730631 0.037576 0.924407 -0.981626 -0.419996 -1.25999"];
};

WasedaYouP = function() { WasedaChar.call(this, "WasedaYouP", "ようｐ", "P/X", "P/X", "P/X", "black"); };
WasedaYouP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ようｐ"] = WasedaYouP;

WasedaYouP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "EL8NWL4_EL":
      this.pdp = p(0, -2);
      return;
  }

  //switch (model_ + "_" + _headModel) {}

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaMixe = function() { WasedaChar.call(this, "WasedaMixe", "みぇ", "ER8CR1P", "ER", "ERCRP", "black", false, p(0.0, 0.5)); };
WasedaMixe.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["みぇ"] = WasedaMixe;

WasedaMixe.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(7.98641, -0.422351);
  this.paths = ["m 0 0 c 1.859 -0.828 7.951 -2.109 7.951 -0.556 c 0 0.594 -0.300334 0.880054 -0.65242 0.83953 c -0.259684 -0.029889 -0.532362 -0.35827 -0.327944 -0.712332 c 0.233198 -0.40391 1.19006 -0.472364 1.01578 0.006451"];
};

WasedaNakyaP = function() { WasedaChar.call(this, "WasedaNakyaP", "なきゃｐ", "P/X", "P/X", "P/X", "black"); };
WasedaNakyaP.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["なきゃｐ"] = WasedaNakyaP;

WasedaNakyaP.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  switch (model_ + "_" + _head) {
    case "NEL8_SL":
      this.dp = p(-1, 0);
      return;
  }

  //switch (tailModel_) {}

  //switch (model_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
};

WasedaTatoshite = function() { WasedaChar.call(this, "WasedaTatoshite", "たとして", "SW8CL1NW1", "SW", "NW", "black", false, p(3.3, -3.8)); };
WasedaTatoshite.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["たとして"] = WasedaTatoshite;

WasedaTatoshite.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(-3.2602, 5.45046);
  this.paths = ["m 0 0 l -2.50377 6.91448 c -0.315719 0.8719 0.490497 0.872761 0.753496 0.6652 c 0.421938 -0.332997 -0.244144 -0.841121 -0.590566 -1.15327 c -0.232329 -0.209344 -0.561167 -0.624322 -0.919367 -0.975944"];
};


WasedaYuchi = function() { WasedaChar.call(this, "WasedaYuchi", "ゆち", "NER8CR1", "NER", "NERCR", "black", false, p(0.0, 0.9)); };
WasedaYuchi.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["ゆち"] = WasedaYuchi;
WasedaChar.dict["ゆき"] = WasedaYuchi;

WasedaYuchi.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  //const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  //switch (model_) {}

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  switch (_head) {
    case "E":
      this.dp = p(7.36317, -2.88195);
      this.paths = ["m 0 0 c 0.207697 0.062913 0.471023 0.156079 0.828402 0.350212 c 0.445752 0.242137 0.819905 0.756044 0.590566 1.15327 c -0.167518 0.290151 -1.25763 0.207983 -0.753496 -0.665201 c 1.2372 -2.14289 3.20188 -4.34358 5.81598 -4.34358 c 0.435292 0 0.76762 0.114382 0.859944 0.419694 c 0.117295 0.387892 -0.231536 0.915372 -0.614017 1.04926 c -0.341375 0.119501 -1.03024 -0.028985 -1.01246 -0.390234 c 0.028014 -0.56931 0.935673 -0.45537 1.64825 -0.45537"];
      return;

  }

  this.dp = p(6.30719, -3.50163);
  this.paths = ["m 0 0 c 0.207697 0.062913 0.471023 0.156079 0.828402 0.350212 c 0.445752 0.242137 0.819905 0.756044 0.590566 1.15327 c -0.167518 0.290151 -1.25763 0.207983 -0.753496 -0.665201 c 1.2372 -2.14289 3.20188 -4.34358 5.81598 -4.34358 c 0.2753 0 0.528448 0.250972 0.536378 0.493884 c 0.00991 0.303312 -0.340825 0.56119 -0.628078 0.659078 c -0.165748 0.056483 -0.43293 0.072514 -0.519219 -0.079858 c -0.189742 -0.335054 0.372153 -0.81064 0.436653 -1.06944"];
};

WasedaEru = function() { WasedaChar.call(this, "WasedaEru", "える", "OSEL4", "OSEL", "OSEL", "black", false, p(0.0, -1.6)); };
WasedaEru.prototype = Object.create(WasedaChar.prototype);
WasedaChar.dict["える"] = WasedaEru;

WasedaEru.prototype.setPaths = function() {
  //const name_ = this.getPrevName();
  const model_ = this.getPrevModel();
  //const tailModel_ = this.getPrevTailModel();
  //const tail_ = this.getPrevTailType();
  //const _name = this.getNextName();
  //const _model = this.getNextModel();
  //const _headModel = this.getNextHeadModel();
  //const _head = this.getNextHeadType();

  //switch (name_ + "_" + _name) {}

  //switch (name_ + "_" + _model) {}

  //switch (name_ + "_" + _headModel) {}

  //switch (name_ + "_" + _head) {}

  //switch (name_) {}

  //switch (model_ + "_" + _name) {}

  //switch (model_ + "_" + _model) {}

  //switch (model_ + "_" + _headModel) {}

  //switch (model_ + "_" + _head) {}

  switch (model_) {
    case "EL8CL1":
      this.dp = p(0, 0);
      this.paths = ["m 0 0 c 0.604983 1.04786 2.39945 3.68758 2.89251 2.76287 c 0.389146 -0.895092 -1.8982 -2.26026 -2.89251 -2.76287"];
      return;
  }

  //switch (tailModel_ + "_" + _name) {}

  //switch (tailModel_ + "_" + _model) {}

  //switch (tailModel_ + "_" + _headModel) {}

  //switch (tailModel_ + "_" + _head) {}

  //switch (tailModel_) {}

  //switch (tail_ + "_" + _name) {}

  //switch (tail_ + "_" + _model) {}

  //switch (tail_ + "_" + _headModel) {}

  //switch (tail_ + "_" + _head) {}

  //switch (tail_) {}

  //switch (_name) {}

  //switch (_model) {}

  //switch (_headModel) {}

  //switch (_head) {}

  this.dp = p(0, 0);
  this.paths = ["m 0 0 c -0.01408 1.18398 2.11686 3.92395 2.57865 3.05787 c 0.364473 -0.838342 -1.64739 -2.58713 -2.57865 -3.05787"];
};
