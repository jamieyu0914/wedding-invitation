const slider = document.getElementById("slider");
const leftPnl = document.getElementById("leftPanel");
const sdiv = document.getElementById("sdiv");
const shandle = document.getElementById("shandle");

function setPos(p) {
  p = Math.max(3, Math.min(97, p));
  leftPnl.style.clipPath = "inset(0 " + (100 - p) + "% 0 0)";
  sdiv.style.left = p + "%";
  shandle.style.left = p + "%";
}
function pct(x) {
  const r = slider.getBoundingClientRect();
  return ((x - r.left) / r.width) * 100;
}
var drag = false;
slider.addEventListener("mousedown", function (e) {
  drag = true;
  setPos(pct(e.clientX));
  e.preventDefault();
});
document.addEventListener("mousemove", function (e) {
  if (drag) setPos(pct(e.clientX));
});
document.addEventListener("mouseup", function () {
  drag = false;
});
slider.addEventListener(
  "touchstart",
  function (e) {
    drag = true;
    setPos(pct(e.touches[0].clientX));
  },
  { passive: true },
);

/*
 * Transform-based photo alignment
 * Goal: both subjects appear at identical height, feet aligned at bottom.
 *
 * Photo metadata (measured from actual images):
 *   img1 = 0.jpg (bride alone) 3948x5922
 *     - subject top (head)  : ~1600px from image top  (27.0% of height)
 *     - subject bottom(feet): ~5750px from image top  (97.1% of height)
 *     - subject centre X    : ~2700px                 (68.4% of width)
 *     - person height in px : 4150px  (70.1% of image height)
 *
 *   img2 = 1.jpg (couple)    4000x6000
 *     - subject top (head)  : ~1780px from image top  (29.7% of height)
 *     - subject bottom(feet): ~5520px from image top  (92.0% of height)
 *     - subject centre X    : ~2000px                 (50.0% of width)
 *     - person height in px : 3740px  (62.3% of image height)
 *
 * We scale each image so its person height equals TARGET_PERSON_HEIGHT
 * fraction of the container height, then translate so:
 *   - feet sit at FEET_FRAC of the container height
 *   - subject centre X is horizontally centred in the container
 */
// 0.jpg = 左邊：婚紗
// 1.jpg = 右邊：旗袍、中山裝
var IMG1 = {
  natW: 3948,
  natH: 5922,
  personTopFrac: 0.45,
  personBotFrac: 0.91,
  subjectXFrac: 0.55,
  scaleBoost: 1.2, // 額外放大 1%（0.jpg）
  xOffset: 0.135, // 往右偏移（容器寬度的倍數）
  yOffset: 0.123, // 往下偏移（容器高度的倍數）
};
var IMG2 = {
  natW: 4000,
  natH: 6000,
  personTopFrac: 0.37,
  personBotFrac: 0.91,
  subjectXFrac: 0.5,
  xOffset: 0,
  yOffset: 0,
  scaleBoost: 1.09, // 額外放大 1%（1.jpg）
  xOffset: -0.01,
};

var TARGET_PERSON_HEIGHT = 0.78; // 人物占容器高度78%
var FEET_FRAC = 0.96; // 腳底對齊容器96%高度處

function applyTransform(img, meta) {
  var cW = slider.offsetWidth;
  var cH = slider.offsetHeight;

  // 以人物高度（頭頂到腳底）決定縮放比例
  var personHeightNat = (meta.personBotFrac - meta.personTopFrac) * meta.natH;
  var targetPersonPx = TARGET_PERSON_HEIGHT * cH;
  var scale = (targetPersonPx / personHeightNat) * (meta.scaleBoost || 1);

  // 若以人物高度計算出來的縮放仍然無法填滿容器寬度，強制放大到至少填滿寬度
  var minScaleForWidth = cW / meta.natW;
  if (scale < minScaleForWidth) scale = minScaleForWidth;

  var rW = meta.natW * scale;
  var rH = meta.natH * scale;

  // 腳底對齊 FEET_FRAC * cH
  var feetYContainer = FEET_FRAC * cH;
  var feetYRendered = meta.personBotFrac * rH;
  var imgTop = feetYContainer - feetYRendered;

  // 人物中心對齊容器水平中央
  var subjectXRendered = meta.subjectXFrac * rW;
  var imgLeft = cW * 0.5 - subjectXRendered;

  img.style.width = rW.toFixed(1) + "px";
  img.style.height = rH.toFixed(1) + "px";
  img.style.left = (imgLeft + (meta.xOffset || 0) * cW).toFixed(1) + "px";
  img.style.top = (imgTop + (meta.yOffset || 0) * cH).toFixed(1) + "px";
}

function initAlign() {
  var img1 = document.getElementById("img1");
  var img2 = document.getElementById("img2");
  applyTransform(img1, IMG1);
  applyTransform(img2, IMG2);
}

// 於兩張圖片全數載入後執行
var img1El = document.getElementById("img1");
var img2El = document.getElementById("img2");
var loaded = 0;
function onImgLoad() {
  loaded++;
  if (loaded >= 2) initAlign();
}
if (img1El.complete) onImgLoad();
else img1El.addEventListener("load", onImgLoad);
if (img2El.complete) onImgLoad();
else img2El.addEventListener("load", onImgLoad);
window.addEventListener("resize", initAlign);

document.addEventListener(
  "touchmove",
  function (e) {
    if (drag) setPos(pct(e.touches[0].clientX));
  },
  { passive: true },
);
document.addEventListener("touchend", function () {
  drag = false;
});
var f = 0;
(function sweep() {
  if (f < 30) {
    // 前30幀停留在正中間
    setPos(50);
  } else if (f < 70) {
    // 接下來40幀從中間往左側移動到14.2%
    setPos(50 - (f - 30) * 0.895);
  } else if (f < 140) {
    // 最後70幀從左側14.2%移動到右側83.8%
    setPos(14.2 + (f - 70) * 0.994);
  } else {
    // 結束，停在右側83.8%
    setPos(83.8);
    return;
  }
  f++;
  requestAnimationFrame(sweep);
})();

var obs = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.15 },
);
document
  .querySelectorAll(
    ".couple-section,.details-section,.poetry-section,.rsvp-section,.map-section",
  )
  .forEach(function (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = "opacity .7s ease, transform .7s ease";
    obs.observe(el);
  });
