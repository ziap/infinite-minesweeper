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

  draw_cell(x, y) {
    if (this.data[x + "," + y].explored) {
      this.ctx.fillStyle = "#282c34";
      this.ctx.fillRect(
        x * this.cell_size,
        y * this.cell_size,
        this.cell_size,
        this.cell_size
      );

      if (this.data[x + "," + y].is_mine) {
        this.ctx.fillStyle = "#e06c75";
        this.ctx.fillRect(
          (x + 0.1) * this.cell_size,
          (y + 0.1) * this.cell_size,
          0.8 * this.cell_size,
          0.8 * this.cell_size
        );
        this.ctx.drawImage(
          this.bomb_img,
          (x + 0.2) * this.cell_size,
          (y + 0.2) * this.cell_size,
          0.6 * this.cell_size,
          0.6 * this.cell_size
        );
      } else {
        if (this.data[x + "," + y].mines > 0) {
          this.ctx.fillStyle = "#abb3bf";
          this.ctx.font = 0.6 * this.cell_size + "px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            this.data[x + "," + y].mines,
            x * this.cell_size + this.cell_size / 2,
            y * this.cell_size + this.cell_size / 2
          );
        }
      }
    } else {
      if (this.data[x + "," + y].flagged) {
        this.ctx.drawImage(
          this.flag_img,
          (x + 0.2) * this.cell_size,
          (y + 0.2) * this.cell_size,
          0.6 * this.cell_size,
          0.6 * this.cell_size
        );
      }
    }
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
    if (this.data[x + "," + y] === undefined)
      this.data[x + "," + y] = new Cell(false, false);
    if (this.data[x + "," + y].explored || this.data[x + "," + y].flagged)
      return;

    this.data[x + "," + y].explored = true;

    if (!this.first_click && this.is_mine(x, y)) {
      this.game_over = true;
      return;
    }

    this.first_click = false;

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

  print() {
    let min_x = Infinity;
    let min_y = Infinity;
    let max_x = -Infinity;
    let max_y = -Infinity;

    for (const [key, cell] of Object.entries(this.data)) {
      const [x, y] = key.split(",");
      min_x = Math.min(min_x, parseInt(x));
      min_y = Math.min(min_y, parseInt(y));
      max_x = Math.max(max_x, parseInt(x));
      max_y = Math.max(max_y, parseInt(y));
    }

    console.log(min_x, min_y, max_x, max_y);

    for (let y = min_y; y <= max_y; y++) {
      let line = "";
      for (let x = min_x; x <= max_x; x++) {
        if (this.data[x + "," + y] === undefined) {
          line += ".";
        } else if (this.data[x + "," + y].explored) {
          if (this.data[x + "," + y].mines === 0) {
            line += " ";
          } else {
            line += this.data[x + "," + y].mines;
          }
        } else {
          if (this.data[x + "," + y].is_mine) line += "X";
          else line += ".";
        }
      }
      console.log(line);
    }
  }
}

new Board(99 / (30 * 16));
