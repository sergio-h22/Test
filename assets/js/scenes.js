/* ==========================================================================
   M-Power Print — press-run scenes
   --------------------------------------------------------------------------
   The artwork behind the "press run" section on the home page: one full-bleed
   scene per panel, swapped as you scroll.

   Each scene is hand-drawn SVG rather than a photograph, for one reason: a
   generated photo of a shop that isn't yours is a lie, and a stock photo of
   someone else's press is worse. These are abstract material studies — ink,
   halftone, stock, light — which are honest about being drawn.

   REPLACING A SCENE WITH A REAL PHOTOGRAPH
   ----------------------------------------
   Set `photo` on any scene below and it wins over the drawing:

       { id:"apparel", ..., photo:"photos/scene-apparel.jpg" }

   Nothing else changes — no layout edits, no CSS. Same fallback rule the
   product grid uses. Shoot landscape, roughly 2000px wide, and remember the
   copy sits over the left third, so keep that side quiet.

   `tone` tells the page whether the copy over this scene should be light or
   dark. Get it wrong and the text stops being readable, so if you swap in a
   photo, set the tone to match it.
   ========================================================================== */

const SCENES = [

  /* ------------------------------------------------------------------ 01
     The pressroom. Raking light and the ghost of a six-station carousel.
     Deliberately empty of people — the shop, not the staff. */
  {
    id: "pressroom",
    plate: "01",
    label: "The pressroom",
    ink: "Brass foil",
    chip: "#C9A961",
    tone: "dark",
    /* Footage outranks a photo, which outranks the drawing. This is the same
       clip the hero uses, so it costs one download for both. It plays only
       while this plate is on screen. Empty the string to fall back to the
       drawing below. */
    video: "video/hero.mp4",
    photo: "",
    art: function () {
      /* Six platens on a carousel, drawn from the centre out. Computed rather
         than typed so the spacing is exact at every station. */
      const cx = 1090, cy = 520, spokes = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * 60) * Math.PI / 180;
        const c = Math.cos(a), s = Math.sin(a);
        spokes.push(
          '<line x1="' + (cx + c * 62).toFixed(1) + '" y1="' + (cy + s * 62).toFixed(1) +
          '" x2="' + (cx + c * 300).toFixed(1) + '" y2="' + (cy + s * 300).toFixed(1) + '"/>' +
          '<rect x="' + (cx + c * 250 - 62).toFixed(1) + '" y="' + (cy + s * 250 - 40).toFixed(1) +
          '" width="124" height="80" rx="4" fill="#C9A961" fill-opacity=".07" ' +
          'transform="rotate(' + (i * 60) + ' ' + (cx + c * 250).toFixed(1) + ' ' + (cy + s * 250).toFixed(1) + ')"/>'
        );
      }

      /* Motes in the light shaft. Fixed positions, not random — a scene that
         reshuffles every time you scroll past reads as a glitch. */
      const motes = [
        [340, 210, 2.4], [470, 380, 1.6], [300, 560, 2.0], [560, 690, 1.4],
        [420, 830, 2.2], [640, 260, 1.8], [250, 400, 1.5], [520, 520, 2.6],
        [700, 620, 1.3], [380, 690, 1.7]
      ].map(function (m) {
        return '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="' + m[2] + '" fill="#E6D3A3" opacity=".5"/>';
      }).join("");

      return '' +
      '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="sc1-ground" cx="24%" cy="16%" r="92%">' +
            '<stop offset="0" stop-color="#2C2F35"/>' +
            '<stop offset="52%" stop-color="#131519"/>' +
            '<stop offset="100%" stop-color="#08090B"/>' +
          '</radialGradient>' +
          '<linearGradient id="sc1-beam" x1="0" y1="0" x2=".7" y2="1">' +
            '<stop offset="0" stop-color="#C9A961" stop-opacity=".34"/>' +
            '<stop offset="1" stop-color="#C9A961" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<filter id="sc1-soft" x="-30%" y="-30%" width="160%" height="160%">' +
            '<feGaussianBlur stdDeviation="30"/>' +
          '</filter>' +
        '</defs>' +

        '<rect width="1600" height="1000" fill="url(#sc1-ground)"/>' +

        /* The shaft of window light that gives the room its depth. */
        '<g filter="url(#sc1-soft)">' +
          '<polygon points="150,-120 560,-120 1000,1120 320,1120" fill="url(#sc1-beam)"/>' +
        '</g>' +
        motes +

        /* The carousel itself, held back to a whisper so the copy wins. */
        '<g stroke="#C9A961" fill="none" stroke-width="1" opacity=".5">' +
          '<circle cx="1090" cy="520" r="300"/>' +
          '<circle cx="1090" cy="520" r="212" opacity=".62"/>' +
          '<circle cx="1090" cy="520" r="62" stroke-width="1.6"/>' +
          spokes.join("") +
        '</g>' +

        /* Floor line, to sit the machine in a room rather than in space. */
        '<line x1="0" y1="884" x2="1600" y2="852" stroke="#C9A961" stroke-opacity=".14" stroke-width="1"/>' +
      '</svg>';
    }
  },

  /* ------------------------------------------------------------------ 02
     Large format. One taut vinyl plane, grommeted, catching the light. */
  {
    id: "largeformat",
    plate: "02",
    label: "Large format",
    ink: "Press red",
    chip: "#E31B23",
    tone: "dark",
    photo: "",
    art: function () {
      /* Grommets march along the top and bottom edges of the banner. The edges
         are not horizontal, so each one is interpolated along its own edge. */
      function edge(x1, y1, x2, y2, n) {
        let out = "";
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n;
          const x = (x1 + (x2 - x1) * t).toFixed(1);
          const y = (y1 + (y2 - y1) * t).toFixed(1);
          out += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="#0B0C0E" fill-opacity=".55"/>' +
                 '<circle cx="' + x + '" cy="' + y + '" r="11" fill="none" stroke="#E6D3A3" stroke-opacity=".75" stroke-width="2.5"/>';
        }
        return out;
      }

      return '' +
      '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="sc2-vinyl" x1="0" y1="0" x2="1" y2="1">' +
            '<stop offset="0" stop-color="#F0343C"/>' +
            '<stop offset="46%" stop-color="#E31B23"/>' +
            '<stop offset="100%" stop-color="#780C11"/>' +
          '</linearGradient>' +
          '<linearGradient id="sc2-sheen" x1="0" y1="0" x2="1" y2=".35">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".22"/>' +
            '<stop offset="38%" stop-color="#fff" stop-opacity="0"/>' +
            '<stop offset="72%" stop-color="#fff" stop-opacity=".09"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
          '</linearGradient>' +
          '<filter id="sc2-cast" x="-20%" y="-20%" width="140%" height="150%">' +
            '<feDropShadow dx="0" dy="26" stdDeviation="34" flood-color="#000" flood-opacity=".55"/>' +
          '</filter>' +
        '</defs>' +

        '<rect width="1600" height="1000" fill="#0B0C0E"/>' +
        /* A wall behind, so the banner reads as hung rather than floating. */
        '<rect width="1600" height="1000" fill="#15171B"/>' +
        '<rect y="900" width="1600" height="100" fill="#0D0E11"/>' +

        '<g filter="url(#sc2-cast)">' +
          '<polygon points="150,132 1452,74 1452,904 150,846" fill="url(#sc2-vinyl)"/>' +
          '<polygon points="150,132 1452,74 1452,904 150,846" fill="url(#sc2-sheen)"/>' +
        '</g>' +

        /* Tension creases running the length of the drop. */
        '<g stroke="#fff" stroke-opacity=".07" stroke-width="1">' +
          '<line x1="470" y1="118" x2="470" y2="860"/>' +
          '<line x1="800" y1="103" x2="800" y2="874"/>' +
          '<line x1="1130" y1="88" x2="1130" y2="889"/>' +
        '</g>' +

        edge(196, 130, 1406, 76, 7) +
        edge(196, 848, 1406, 902, 7) +
      '</svg>';
    }
  },

  /* ------------------------------------------------------------------ 03
     Apparel. A folded stack, straight on. Light scene — copy goes dark. */
  {
    id: "apparel",
    plate: "03",
    label: "Apparel",
    ink: "Bone stock",
    chip: "#EDE9E3",
    tone: "light",
    photo: "",
    art: function () {
      /* A garment on a hanger, drawn once in a 200×230 box and reused. The
         collar is a curve rather than a notch, which is the difference
         between reading as a shirt and reading as a cross. */
      const SHIRT = "M42 26 L78 10 Q100 30 122 10 L158 26 L188 62 L156 86 " +
                    "L152 224 L48 224 L44 86 L12 62 Z";

      /* Back to front, so the overlap falls the way it would on a rail.
         x, colour, whether it needs an outline to separate from the ground.

         The order is deliberate: the scrim is heaviest on the left, so the
         white garment takes that end where washing out costs nothing, and
         the graphite one sits centre where it stays black. The run also
         stops short of 1600 — a garment half off the frame reads as a
         mistake rather than as a crop. */
      const rail = [
        [450,  "#FFFFFF", true],
        [810,  "#16181B", false],
        [1150, "#E31B23", false]
      ];

      const shirts = rail.map(function (s) {
        const x = s[0], fill = s[1], outline = s[2];
        const k = 400 / 200;                        /* 400px wide on the rail */
        return '<g transform="translate(' + x + ' 250) scale(' + k + ')">' +
          /* Hook over the rail. Drawn in garment space so it scales with it. */
          '<path d="M100 10 L100 -12 Q100 -26 86 -26 Q74 -26 74 -16" fill="none" ' +
                'stroke="#8E8B84" stroke-width="3.4" stroke-linecap="round"/>' +
          '<path d="' + SHIRT + '" fill="' + fill + '"' +
                (outline ? ' stroke="#0B0C0E" stroke-opacity=".13" stroke-width="1.2"' : '') + '/>' +
          /* Cloth falls into shadow at the sides and where the sleeves meet. */
          '<path d="' + SHIRT + '" fill="url(#sc3-fold)"/>' +
        '</g>';
      }).join("");

      return '' +
      '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="sc3-ground" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#F6F3EE"/>' +
            '<stop offset="62%" stop-color="#E8E3DA"/>' +
            '<stop offset="100%" stop-color="#D6D0C6"/>' +
          '</linearGradient>' +
          /* Light from the left, so every garment shades the same way. */
          '<linearGradient id="sc3-fold" x1="0" y1="0" x2="1" y2=".25">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".16"/>' +
            '<stop offset="42%" stop-color="#000" stop-opacity="0"/>' +
            '<stop offset="100%" stop-color="#000" stop-opacity=".22"/>' +
          '</linearGradient>' +
          '<linearGradient id="sc3-rail" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#B9B5AD"/>' +
            '<stop offset="45%" stop-color="#EFEBE3"/>' +
            '<stop offset="100%" stop-color="#7E7B75"/>' +
          '</linearGradient>' +
          '<filter id="sc3-cast" x="-12%" y="-12%" width="124%" height="130%">' +
            '<feDropShadow dx="6" dy="16" stdDeviation="18" flood-color="#4A423A" flood-opacity=".30"/>' +
          '</filter>' +
        '</defs>' +

        '<rect width="1600" height="1000" fill="url(#sc3-ground)"/>' +

        /* The rail, with its uprights running out of frame. */
        '<g>' +
          '<rect x="252" y="0"  width="9" height="240" fill="#8A867F"/>' +
          '<rect x="1426" y="0" width="9" height="240" fill="#8A867F"/>' +
          '<rect x="210" y="232" width="1270" height="11" rx="5.5" fill="url(#sc3-rail)"/>' +
          '<rect x="210" y="243" width="1270" height="5" rx="2.5" fill="#000" opacity=".14"/>' +
        '</g>' +

        '<g filter="url(#sc3-cast)">' + shirts + '</g>' +
      '</svg>';
    }
  },

  /* ------------------------------------------------------------------ 04
     Ink. A CMYK rosette at screen angles — 15°, 75°, 0°, 45°, the real ones.
     The most literally "printing" image there is, and it costs four rects. */
  {
    id: "ink",
    plate: "04",
    label: "Ink & colour",
    ink: "CMYK rosette",
    chip: "#00AEEF",
    tone: "light",
    photo: "",
    art: function () {
      /* A 22px pitch rather than 30: fine enough to read as a printed tint
         rather than as polka dots, coarse enough that the rosette pattern is
         still visible. Black is set on a tighter dot so it darkens the field
         without turning it to mud. */
      function screenPattern(id, angle, colour, dot) {
        return '<pattern id="' + id + '" width="22" height="22" patternUnits="userSpaceOnUse" ' +
               'patternTransform="rotate(' + angle + ')">' +
               '<circle cx="11" cy="11" r="' + dot + '" fill="' + colour + '"/></pattern>';
      }

      return '' +
      '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          screenPattern("sc4-y", 0,  "#F5C518", 8.4) +
          screenPattern("sc4-c", 15, "#0091C8", 7.6) +
          screenPattern("sc4-m", 75, "#D4006E", 7.2) +
          screenPattern("sc4-k", 45, "#16181B", 4.4) +
          /* The screen dissolves toward the edges. Without this the field
             tiles edge to edge and reads as wallpaper, and the copy has
             nowhere quiet to sit. */
          '<radialGradient id="sc4-focus" cx="66%" cy="48%" r="52%">' +
            '<stop offset="0" stop-color="#fff" stop-opacity="1"/>' +
            '<stop offset="52%" stop-color="#fff" stop-opacity=".66"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
          '</radialGradient>' +
          '<mask id="sc4-mask"><rect width="1600" height="1000" fill="url(#sc4-focus)"/></mask>' +
        '</defs>' +

        '<rect width="1600" height="1000" fill="#EDE9E3"/>' +
        '<g mask="url(#sc4-mask)" style="mix-blend-mode:multiply">' +
          '<rect width="1600" height="1000" fill="url(#sc4-y)" opacity=".70"/>' +
          '<rect width="1600" height="1000" fill="url(#sc4-c)" opacity=".62"/>' +
          '<rect width="1600" height="1000" fill="url(#sc4-m)" opacity=".58"/>' +
          '<rect width="1600" height="1000" fill="url(#sc4-k)" opacity=".62"/>' +
        '</g>' +
      '</svg>';
    }
  },

  /* ------------------------------------------------------------------ 05
     Finishing. The bench from above: cutting mat, trimmed stock, steel rule. */
  {
    id: "finishing",
    plate: "05",
    label: "Finishing",
    ink: "Graphite",
    chip: "#5C626B",
    tone: "dark",
    photo: "",
    art: function () {
      /* The cutting mat. Majors every 200 so the grid reads as a measuring
         surface rather than as graph paper. */
      let grid = "";
      for (let x = 0; x <= 1600; x += 40) {
        const major = x % 200 === 0;
        grid += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="1000" stroke="' +
                (major ? "#414A55" : "#333941") + '" stroke-width="' + (major ? 1.5 : 0.8) + '"/>';
      }
      for (let y = 0; y <= 1000; y += 40) {
        const major = y % 200 === 0;
        grid += '<line x1="0" y1="' + y + '" x2="1600" y2="' + y + '" stroke="' +
                (major ? "#414A55" : "#333941") + '" stroke-width="' + (major ? 1.5 : 0.8) + '"/>';
      }

      /* A trimmed pile, drawn as its own edges: each sheet is one hairline
         stepped up the stack, with the top sheet solid. That is what gives
         cut stock its thickness — a single rectangle just reads as a slab. */
      function pile(x, y, w, h, sheets, angle, top) {
        let out = '<g transform="rotate(' + angle + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')">';
        for (let i = sheets; i > 0; i--) {
          out += '<rect x="' + x + '" y="' + (y + i * 2.2).toFixed(1) + '" width="' + w +
                 '" height="' + h + '" rx="2" fill="#B9B3A8"/>';
        }
        out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
               '" rx="2" fill="' + top + '"/>' +
               /* The light rakes across the top sheet, left to right. */
               '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
               '" rx="2" fill="url(#sc5-rake)"/>' +
               '</g>';
        return out;
      }

      const sheets =
        pile(560, 250, 330, 215, 6, -3, "#F7F4EF") +
        pile(1010, 300, 280, 185, 4,  2, "#EFEAE1") +
        pile(700, 585, 360, 235, 8,  1, "#FFFFFF");

      /* Trim marks around the front pile — the real artifact of a cut job,
         and the detail that says this is a finishing bench and not a desk. */
      let marks = "";
      [[700, 585], [1060, 585], [700, 820], [1060, 820]].forEach(function (c) {
        const sx = c[0] < 880 ? -1 : 1, sy = c[1] < 700 ? -1 : 1;
        marks += '<line x1="' + (c[0] + sx * 16) + '" y1="' + c[1] + '" x2="' + (c[0] + sx * 46) + '" y2="' + c[1] + '"/>' +
                 '<line x1="' + c[0] + '" y1="' + (c[1] + sy * 16) + '" x2="' + c[0] + '" y2="' + (c[1] + sy * 46) + '"/>';
      });
      marks = '<g stroke="#C9A961" stroke-opacity=".75" stroke-width="1.4">' + marks + '</g>';

      /* A steel rule ran along the bottom here and was cut: it sat exactly
         where the plate readout prints, and two rows of small marks fighting
         each other read as clutter. The trim marks already say "finishing". */

      return '' +
      '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<defs>' +
          /* Gentle: paper takes light softly. Push the contrast up here and
             the stock starts reading as sheet metal. */
          '<linearGradient id="sc5-rake" x1="0" y1="0" x2="1" y2=".3">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".16"/>' +
            '<stop offset="55%" stop-color="#000" stop-opacity="0"/>' +
            '<stop offset="100%" stop-color="#000" stop-opacity=".09"/>' +
          '</linearGradient>' +
          '<filter id="sc5-cast" x="-15%" y="-15%" width="130%" height="130%">' +
            '<feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".5"/>' +
          '</filter>' +
          '<radialGradient id="sc5-lamp" cx="66%" cy="42%" r="66%">' +
            '<stop offset="0" stop-color="#fff" stop-opacity=".13"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +

        '<rect width="1600" height="1000" fill="#1A1D21"/>' +
        grid +
        '<rect width="1600" height="1000" fill="url(#sc5-lamp)"/>' +
        marks +
        '<g filter="url(#sc5-cast)">' + sheets + '</g>' +
      '</svg>';
    }
  }
];
