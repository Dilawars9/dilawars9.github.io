(() => {
  if (!window.katex) return;
  function render(root) {
    root.querySelectorAll('[data-tex]:not([data-rendered])').forEach(el => {
      katex.render(el.dataset.tex, el, {displayMode: el.classList.contains('math-display'), throwOnError: true, trust: false, output: 'htmlAndMathml'});
      el.dataset.rendered = 'true';
    });
  }
  render(document);
  const symbols = {'S₀':'S_0','S₁':'S_1','T₁':'T_1','S₁ → S₀':'S_1 \\to S_0','S₁ → T₁':'S_1 \\to T_1','T₁ → S₀':'T_1 \\to S_0','τ = 5 ns':'\\tau = 5\\,\\mathrm{ns}','τ = 1 ms':'\\tau = 1\\,\\mathrm{ms}','g = h = 0':'g=h=0'};
  for (const id of ['stage-title','stage-copy','physical-time','event']) {
    const el=document.getElementById(id);
    const update=()=>{
      if (el.children.length) return;
      const parts=el.textContent.split(/(S₁ → S₀|S₁ → T₁|T₁ → S₀|S₀|S₁|T₁|τ = 5 ns|τ = 1 ms|g = h = 0)/g);
      if (parts.length===1) return;
      el.replaceChildren(...parts.map(part=>{
        if(!symbols[part])return document.createTextNode(part);
        const span=document.createElement('span');span.dataset.tex=symbols[part];return span;
      }));
      render(el);
    };
    new MutationObserver(update).observe(el,{childList:true});
    update();
  }
})();
