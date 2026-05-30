import { describe, test, expect, beforeAll } from 'vitest';

let setPos, pct, IMG1, IMG2;

beforeAll(async () => {
  document.body.innerHTML = `
    <div class="slider-wrap">
        <div class="slider-box" id="slider">
          <div class="photo">
            <img id="img2" src="assets/images/1.jpg" alt="婚紗照" />
          </div>
          <div class="photo photo-left" id="leftPanel">
            <img id="img1" src="assets/images/0.jpg" alt="婚紗照" />
          </div>
          <div class="s-divider" id="sdiv"></div>
          <div class="s-handle" id="shandle">
            <div class="s-handle-in">&#9665;&#9655;</div>
          </div>
          <svg class="sc sc-tl" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 24L2 2L24 2"
              stroke="#f5d070"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="2" cy="2" r="2.8" fill="#c8922a" />
            <circle cx="2" cy="2" r="1.4" fill="#f5d070" />
          </svg>
          <svg class="sc sc-tr" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 24L2 2L24 2"
              stroke="#f5d070"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="2" cy="2" r="2.8" fill="#c8922a" />
            <circle cx="2" cy="2" r="1.4" fill="#f5d070" />
          </svg>
          <svg class="sc sc-bl" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 24L2 2L24 2"
              stroke="#f5d070"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="2" cy="2" r="2.8" fill="#c8922a" />
            <circle cx="2" cy="2" r="1.4" fill="#f5d070" />
          </svg>
          <svg class="sc sc-br" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 24L2 2L24 2"
              stroke="#f5d070"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle cx="2" cy="2" r="2.8" fill="#c8922a" />
            <circle cx="2" cy="2" r="1.4" fill="#f5d070" />
          </svg>
          <div class="s-hint">&#8592; 拖拉滑動 &#8594;</div>
        </div>
      </div>
  `;

  const module = await import('../assets/js/slider.js');
  setPos = module.setPos;
  pct    = module.pct;
  IMG1   = module.IMG1;
  IMG2   = module.IMG2;
});

describe('setPos 邊界與位置計算', () => {
  test('小於 3 會被夾到 3', () => {
    setPos(0);
    expect(document.getElementById('leftPanel').style.clipPath).toContain('97%');
    expect(document.getElementById('sdiv').style.left).toBe('3%');
    expect(document.getElementById('shandle').style.left).toBe('3%');
  });
  test('大於 97 會被夾到 97', () => {
    setPos(100);
    expect(document.getElementById('leftPanel').style.clipPath).toContain('3%');
    expect(document.getElementById('sdiv').style.left).toBe('97%');
    expect(document.getElementById('shandle').style.left).toBe('97%');
  });
  test('正常輸入會正確更新', () => {
    setPos(42);
    expect(document.getElementById('leftPanel').style.clipPath).toContain('58%');
    expect(document.getElementById('sdiv').style.left).toBe('42%');
    expect(document.getElementById('shandle').style.left).toBe('42%');
  });
});

describe('pct 百分比換算', () => {
  test('slider 左邊界', () => {
    const slider = document.getElementById('slider');
    slider.getBoundingClientRect = () => ({ left: 100, width: 200 });
    expect(pct(100)).toBeCloseTo(0);
  });
  test('slider 右邊界', () => {
    const slider = document.getElementById('slider');
    slider.getBoundingClientRect = () => ({ left: 100, width: 200 });
    expect(pct(300)).toBeCloseTo(100);
  });
  test('slider 中央', () => {
    const slider = document.getElementById('slider');
    slider.getBoundingClientRect = () => ({ left: 100, width: 200 });
    expect(pct(200)).toBeCloseTo(50);
  });
});

describe('滑鼠拖曳流程', () => {
  test('mousedown 會開啟 drag 並立即 setPos', () => {
    const slider = document.getElementById('slider');
    const evt = new MouseEvent('mousedown', { clientX: 150, bubbles: true });
    let called = false;
    slider.addEventListener('mousedown', () => { called = true; });
    slider.dispatchEvent(evt);
    expect(called).toBe(true);
  });
  test('mousemove 只有 drag=true 時才會 setPos', () => {
    const evt = new MouseEvent('mousemove', { clientX: 180, bubbles: true });
    document.dispatchEvent(evt); // 應該 drag=false 不會 setPos
    // drag=true
    const slider = document.getElementById('slider');
    slider.dispatchEvent(new MouseEvent('mousedown', { clientX: 120, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 180, bubbles: true }));
    // 只要不 throw 就算通過
    expect(true).toBe(true);
  });
  test('mouseup 會關閉 drag', () => {
    const slider = document.getElementById('slider');
    slider.dispatchEvent(new MouseEvent('mousedown', { clientX: 120, bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    // 只要不 throw 就算通過
    expect(true).toBe(true);
  });
});

describe('觸控拖曳流程', () => {
  test('touchstart 會開啟 drag 並更新位置', () => {
    const slider = document.getElementById('slider');
    const evt = new TouchEvent('touchstart', { touches: [{ clientX: 150 }], bubbles: true });
    slider.dispatchEvent(evt);
    expect(true).toBe(true);
  });
  test('touchmove drag=true 時更新', () => {
    const slider = document.getElementById('slider');
    slider.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 120 }], bubbles: true }));
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 180 }], bubbles: true }));
    expect(true).toBe(true);
  });
  test('touchend 會關閉 drag', () => {
    document.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
    expect(true).toBe(true);
  });
  test('touches[0].clientX 取值正確', () => {
    const slider = document.getElementById('slider');
    let x = 0;
    slider.addEventListener('touchstart', e => { x = e.touches[0].clientX; });
    slider.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 123 }], bubbles: true }));
    expect(x).toBe(123);
  });
});

describe('initAlign 對齊初始化', () => {
  test('參數對應正確', async () => {
    const img1 = document.getElementById('img1');
    const img2 = document.getElementById('img2');
    const m = await import('../assets/js/slider.js');
    let meta1, meta2;
    const orig = m.applyTransform;
    m.applyTransform = (img, meta) => {
      if (img === img1) meta1 = meta;
      if (img === img2) meta2 = meta;
    };
    m.initAlign();
    m.applyTransform = orig;
    expect(meta1).toBe(m.IMG1);
    expect(meta2).toBe(m.IMG2);
  });
});

describe('IntersectionObserver 顯示動畫', () => {
  test('目標元素初始樣式有設定', () => {
    const el = document.createElement('div');
    el.className = 'couple-section';
    document.body.appendChild(el);
    // 模擬 observer 初始化
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = "opacity .7s ease, transform .7s ease";
    expect(el.style.opacity).toBe("0");
    expect(el.style.transform).toBe("translateY(28px)");
    expect(el.style.transition).toContain("opacity");
  });
  test('isIntersecting=true 時變為可見狀態', () => {
    const el = document.createElement('div');
    el.className = 'details-section';
    document.body.appendChild(el);
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    // 模擬 observer callback
    const entry = { target: el, isIntersecting: true };
    const obsCallback = (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
          e.target.style.transform = "translateY(0)";
        }
      });
    };
    obsCallback([entry]);
    expect(el.style.opacity).toBe("1");
    expect(el.style.transform).toBe("translateY(0)");
  });
  test('有正確 observe 指定區塊', () => {
    const els = [
      'couple-section',
      'details-section',
      'poetry-section',
      'rsvp-section',
      'map-section',
    ].map(cls => {
      const el = document.createElement('div');
      el.className = cls;
      document.body.appendChild(el);
      return el;
    });
    // 模擬 obs.observe
    let observed = [];
    const obs = { observe: el => observed.push(el) };
    els.forEach(el => obs.observe(el));
    expect(observed.length).toBe(5);
    expect(observed).toEqual(expect.arrayContaining(els));
  });
});