(function() {
  var oFReader = new FileReader(),
    rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

  function gifRender() {
    var gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: "/static/js/gif.worker.js"
    });
    document.getElementById("msg").innerHTML = "开始生成gif,稍等";
    for (var i = 0; i < 40; i++) {
      gif.addFrame(document.getElementById("canvas"), { delay: 50 });
    }

    gif.on("finished", function(blob) {
      document.getElementById("msg").innerHTML = "完成";
      document.getElementById("output").src = URL.createObjectURL(blob);
    });

    gif.render();
  }

  function loadImageFile() {
    if (document.getElementById("uploadImage").files.length === 0) {
      return;
    }
    var oFile = document.getElementById("uploadImage").files[0];
    if (!rFilter.test(oFile.type)) {
      alert("You must select a valid image file!");
      return;
    }
    oFReader.readAsDataURL(oFile);
    oFReader.onload = function(oFREvent) {
      let uploadPreview = document.getElementById("uploadPreview");
      uploadPreview.src = oFREvent.target.result;
      uploadPreview.onload = setTimeout(gifRender, 500);
    };
  }

  window.loadImageFile = loadImageFile;

  document.getElementById("color").onchange = function() {
    Pic.fontColor = /#(\w{2})(\w{2})(\w{2})/
      .exec(this.value)
      .slice(1)
      .map(c => parseInt("0x" + c));
    setTimeout(gifRender, 1000);
  };

  class Cell {
    constructor(x, y, speed) {
      this.x = x;
      this.y = y + Math.random() * 6;
      this.speed = speed;
      this.text = this.getNumber();
      this.opacity = 1;
    }
    getNumber() {
      const arr = [1, 0, 2, 4];
      // const arr = ["和","谐", "友","爱", "平",'等', "民","主"];
      let index = parseInt(Math.random() * 4);
      return arr[index];
    }
  }
  class Pic {
    constructor(width, height, col, row) {
      this.width = width;
      this.height = height;
      this.cols = col || 15;
      this.rows = row || 30;
      this.cells = this.initCells();
    }
    initCells() {
      let cols = this.cols;
      let colDist = this.width / this.cols;
      let rowDist = this.height / this.rows;
      let cells = [];
      for (let i = 0; i < this.cols; i++) {
        let colCell = [],
          dist = colDist * i,
          speed = 1 + 2 * Math.random();
        for (let j = 0; j < this.rows; j++) {
          colCell.push(new Cell(dist, rowDist * j, speed));
        }
        cells.push(colCell);
      }
      return cells;
    }
    static draw(pic, speed) {
      let cells = pic.cells;
      let canvas = document.querySelector("canvas");
      let ctx = canvas.getContext("2d");
      let img = document.querySelector("img");
      ctx.fillStyle = "#fff";
      ctx.font = "8px yahei";
      function draw() {
        ctx.clearRect(0, 0, pic.width, pic.height);
        if (img.src) ctx.drawImage(img, 0, 0, 200, (200 * img.height) / img.width);
        for (let col of cells) {
          for (let cell of col) {
            // let color = 'rgba(255,' + Math.floor(255-0.5*cell.x) + ',' +
            //              Math.floor(255-0.5*cell.y) + `,${(cell.y)/400})`;
            let color = `rgba(${Pic.fontColor},${cell.y / 200})`;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;

            ctx.fillText(cell.text, cell.x, cell.y);
            cell.y = cell.y > pic.height - Math.random() * 30 ? 0 : cell.y + cell.speed;
          }
        }
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
    }
  }
  let pic = new Pic(200, 200, 20, 10);
  Pic.fontColor = "255,255,255";
  Pic.draw(pic);
})();
