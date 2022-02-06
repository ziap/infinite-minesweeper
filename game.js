import Grid from "./grid.js";

class Cell {
  explored = false;
  is_mine = false;
  flagged = false;
  mines = 0;

  constructor(is_mine, is_flagged) {
    this.is_mine = is_mine;
    this.flagged = is_flagged;
  }
}

class Board extends Grid {
  density = 0.25;
  first_click = true;
  game_over = false;
  bomb_img = new Image();
  flag_img = new Image();

  /**
   * @type {{[key: string]: Cell}}
   */
  data = {};

  primary_action(x, y) {
    if (this.game_over) this.init(this.density);
    else this.explore(x, y);
  }

  secondary_action(x, y) {
    if (this.game_over) this.init(this.density);
    else this.flag(x, y);
  }

  draw_flags() {
    for (const [key, cell] of Object.entries(this.data)) {
      if (cell.flagged) {
        const [x, y] = key.split(",").map((x) => parseInt(x));
        this.draw_plot(x, y, "#98c379");
        this.ctx.drawImage(
          this.flag_img,
          (x + 0.25) * this.cell_size,
          (y + 0.25) * this.cell_size,
          0.5 * this.cell_size,
          0.5 * this.cell_size
        );
      }
    }
  }

  draw_explored_or_flagged() {
    for (const [key, cell] of Object.entries(this.data)) {
      if (cell.explored || cell.flagged) {
        const [x, y] = key.split(",").map((x) => parseInt(x));
        this.ctx.fillStyle = "#282c34";
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.cell_size, (y - 0.1) * this.cell_size);
        this.ctx.arcTo(
          (x + 1.1) * this.cell_size,
          (y - 0.1) * this.cell_size,
          (x + 1.1) * this.cell_size,
          y * this.cell_size,
          0.1 * this.cell_size
        );
        this.ctx.arcTo(
          (x + 1.1) * this.cell_size,
          (y + 1.1) * this.cell_size,
          (x + 0.1) * this.cell_size,
          (y + 1.1) * this.cell_size,
          0.1 * this.cell_size
        );
        this.ctx.arcTo(
          (x - 0.1) * this.cell_size,
          (y + 1.1) * this.cell_size,
          (x - 0.1) * this.cell_size,
          y * this.cell_size,
          0.1 * this.cell_size
        );
        this.ctx.arcTo(
          (x - 0.1) * this.cell_size,
          (y - 0.1) * this.cell_size,
          x * this.cell_size,
          (y - 0.1) * this.cell_size,
          0.1 * this.cell_size
        );
        this.ctx.fill();
      }
    }
  }

  draw_numbers() {
    for (const [key, cell] of Object.entries(this.data)) {
      const [x, y] = key.split(",").map((x) => parseInt(x));
      if (cell.mines > 0) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = 0.6 * this.cell_size + "px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          cell.mines,
          (x + 0.5) * this.cell_size,
          (y + 0.5) * this.cell_size
        );
      }
    }
  }

  draw_plot(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo((x + 0.2) * this.cell_size, (y + 0.1) * this.cell_size);
    this.ctx.arcTo(
      (x + 0.9) * this.cell_size,
      (y + 0.1) * this.cell_size,
      (x + 0.9) * this.cell_size,
      (y + 0.2) * this.cell_size,
      0.1 * this.cell_size
    );
    this.ctx.arcTo(
      (x + 0.9) * this.cell_size,
      (y + 0.9) * this.cell_size,
      (x + 0.2) * this.cell_size,
      (y + 0.9) * this.cell_size,
      0.1 * this.cell_size
    );
    this.ctx.arcTo(
      (x + 0.1) * this.cell_size,
      (y + 0.9) * this.cell_size,
      (x + 0.1) * this.cell_size,
      (y + 0.2) * this.cell_size,
      0.1 * this.cell_size
    );
    this.ctx.arcTo(
      (x + 0.1) * this.cell_size,
      (y + 0.1) * this.cell_size,
      (x + 0.2) * this.cell_size,
      (y + 0.1) * this.cell_size,
      0.1 * this.cell_size
    );
    this.ctx.fill();
  }

  draw_mines() {
    for (const [key, cell] of Object.entries(this.data)) {
      if (cell.is_mine && cell.explored) {
        const [x, y] = key.split(",").map((x) => parseInt(x));
        this.draw_plot(x, y, "#e06c75");
        this.ctx.drawImage(
          this.bomb_img,
          (x + 0.25) * this.cell_size,
          (y + 0.25) * this.cell_size,
          0.5 * this.cell_size,
          0.5 * this.cell_size
        );
      }
    }
  }

  draw_borders() {
    for (const [key, cell] of Object.entries(this.data)) {
      if (cell.explored || cell.flagged) {
        const [x, y] = key.split(",").map((x) => parseInt(x));
        this.ctx.strokeStyle = "#abb3bf";
        this.ctx.lineWidth = 0.01 * this.cell_size;
        this.ctx.strokeRect(
          x * this.cell_size,
          (y + 0.2) * this.cell_size,
          0,
          0.6 * this.cell_size
        );
        this.ctx.strokeRect(
          (x + 0.2) * this.cell_size,
          y * this.cell_size,
          0.6 * this.cell_size,
          0
        );
        this.ctx.strokeRect(
          (x + 1) * this.cell_size,
          (y + 0.2) * this.cell_size,
          0,
          0.6 * this.cell_size
        );
        this.ctx.strokeRect(
          (x + 0.2) * this.cell_size,
          (y + 1) * this.cell_size,
          0.6 * this.cell_size,
          0
        );
      }
    }
  }

  draw_grid() {
    this.draw_explored_or_flagged();
    this.draw_flags();
    this.draw_numbers();
    this.draw_mines();
    this.draw_borders();
  }

  init(new_density) {
    this.density = new_density;
    this.data = {};
    this.first_click = true;
    this.game_over = false;
  }

  constructor(new_density) {
    super();
    this.bomb_img.src = "assets/bomb.svg";
    this.flag_img.src = "assets/flag.svg";
    this.init(new_density);
  }

  is_mine(x, y) {
    if (this.data[x + "," + y] === undefined) {
      if (Math.random() < this.density) {
        this.data[x + "," + y] = new Cell(true, false);
      } else {
        this.data[x + "," + y] = new Cell(false, false);
      }
    }
    return this.data[x + "," + y].is_mine;
  }

  explore(x, y) {
    if (this.data[x + "," + y] === undefined) {
      if (this.first_click) this.data[x + "," + y] = new Cell(false, false);
      else this.is_mine(x, y);
    }
    if (this.data[x + "," + y].explored || this.data[x + "," + y].flagged)
      return;

    this.data[x + "," + y].explored = true;
    this.first_click = false;

    if (this.data[x + "," + y].is_mine) {
      this.game_over = true;
      return;
    }

    this.data[x + "," + y].mines = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        if (this.is_mine(x + i, y + j)) {
          this.data[x + "," + y].mines++;
        }
      }
    }

    if (this.data[x + "," + y].mines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          this.explore(x + i, y + j);
        }
      }
    }
  }

  flag(x, y) {
    if (this.data[x + "," + y] === undefined)
      this.data[x + "," + y] = new Cell(false, false);
    if (this.data[x + "," + y].explored) return;
    this.data[x + "," + y].flagged = !this.data[x + "," + y].flagged;
  }
}

new Board(0.2);
