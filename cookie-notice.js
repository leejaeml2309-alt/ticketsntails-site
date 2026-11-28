/* Analytics-only cookie notice (no ads, no ad cookies). Informational; remembers dismissal on this device. */
(function(){
  var K='tnt-cookie-ok';
  try{ if(localStorage.getItem(K)==='1') return; }catch(e){}
  var d=document.createElement('div');
  d.className='tnt-cookie'; d.setAttribute('role','region'); d.setAttribute('aria-label','Cookie notice');
  d.innerHTML='<p>This site uses Google Analytics cookies to count visits. No ads.</p><button type="button">OK</button>';
  d.querySelector('button').addEventListener('click',function(){
    try{ localStorage.setItem(K,'1'); }catch(e){}
    d.remove();
  });
  document.body.appendChild(d);
})();
