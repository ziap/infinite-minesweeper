export default class Grid {
  center = [0, 0];
  cell_size = 80;
  draw_width = 0;
  draw_height = 0;
  data = {};
  canvas = document.getElementById("grid");
  ctx = this.canvas.getContext("2d");

  primary_action(x, y) {}

  secondary_action(x, y) {}

  draw_grid() {}

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.draw();
  }

  constructor() {
    window.addEventListener("resize", () => this.resize());
    this.resize();

    this.listen_mouse();
    this.listen_touch();
  }

  get_mouse_pos(mouse_x, mouse_y) {
    return [
      Math.round(
        (mouse_x - this.canvas.width / 2 + this.center[0]) / this.cell_size -
          0.5
      ),
      Math.round(
        (mouse_y - this.canvas.height / 2 + this.center[1]) / this.cell_size -
          0.5
      ),
    ];
  }

  interact(mouse_x, mouse_y, mouse_button) {
    const [x, y] = this.get_mouse_pos(mouse_x, mouse_y);

    if (mouse_button === 0) {
      this.primary_action(x, y);
    } else if (mouse_button === 2) {
      this.secondary_action(x, y);
    }
  }

  draw_cursor(mouse_x, mouse_y) {
    const [x, y] = this.get_mouse_pos(mouse_x, mouse_y);
    this.ctx.fillStyle = "#eeeeee";
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(
      x * this.cell_size,
      y * this.cell_size,
      this.cell_size,
      this.cell_size
    );
    this.ctx.globalAlpha = 1;
  }

  draw() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(
      this.canvas.width / 2 - this.center[0],
      this.canvas.height / 2 - this.center[1]
    );
    this.draw_grid();
  }

  listen_mouse() {
    let last_mouse_pos = [0, 0];
    let is_dragging = false;
    let mouse_down_time = Date.now();

    this.canvas.addEventListener("mousedown", (e) => {
      is_dragging = true;
      mouse_down_time = Date.now();
      last_mouse_pos = [e.clientX, e.clientY];
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (is_dragging) {
        this.center[0] -= e.clientX - last_mouse_pos[0];
        this.center[1] -= e.clientY - last_mouse_pos[1];
        last_mouse_pos = [e.clientX, e.clientY];
      }
      this.draw();
      this.draw_cursor(e.clientX, e.clientY);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      is_dragging = false;
      if (Date.now() - mouse_down_time < 200) {
        this.interact(e.clientX, e.clientY, e.button);
        this.draw();
      }
    });

    window.addEventListener("wheel", (e) => {
      this.cell_size += e.deltaY;
      this.center[0] -= e.deltaY / 2;
      this.center[1] -= e.deltaY / 2;
      this.cell_size = Math.max(this.cell_size, 10);
      this.draw();
    });

    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // Same as above, but for touch events
  listen_touch() {
    let last_touch_pos = [0, 0];
    let is_dragging = false;
    let touch_down_time = Date.now();

    this.canvas.addEventListener("touchend", (e) => {
      is_dragging = false;
      if (Date.now() - touch_down_time < 200) {
        this.interact(...last_touch_pos, 0);
        this.draw();
      }
      e.preventDefault();
    });

    let last_pinch_dist = 0;
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        last_pinch_dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else {
        is_dragging = true;
        touch_down_time = Date.now();
        last_touch_pos = [e.touches[0].clientX, e.touches[0].clientY];
      }
      e.preventDefault();
    });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 1) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = dist - last_pinch_dist;
        last_pinch_dist = dist;
        this.cell_size += delta;
        this.cell_size = Math.max(this.cell_size, 10);
        this.center[0] -= delta / 2;
        this.center[1] -= delta / 2;
        this.draw();
      } else {
        if (!is_dragging) return;
        this.center[0] -= e.touches[0].clientX - last_touch_pos[0];
        this.center[1] -= e.touches[0].clientY - last_touch_pos[1];
        last_touch_pos = [e.touches[0].clientX, e.touches[0].clientY];
        this.draw();
      }
      e.preventDefault();
    });
  }
}
