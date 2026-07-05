(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    .lefri-widget-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: all 0.3s ease;
    }
    .lefri-widget-btn:hover {
      transform: scale(1.05);
    }
    .lefri-widget-btn svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    .lefri-widget-box {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 450px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border: 1px solid #e5e7eb;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .lefri-widget-header {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .lefri-widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .lefri-widget-header p {
      margin: 2px 0 0 0;
      font-size: 11px;
      opacity: 0.9;
    }
    .lefri-widget-close {
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      opacity: 0.8;
    }
    .lefri-widget-close:hover { opacity: 1; }
    .lefri-widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .lefri-msg {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      max-width: 80%;
      line-height: 1.4;
    }
    .lefri-msg.bot {
      background: white;
      color: #1f2937;
      border: 1px solid #f3f4f6;
      align-self: flex-start;
    }
    .lefri-msg.user {
      background: #4f46e5;
      color: white;
      align-self: flex-end;
    }
    .lefri-widget-input {
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      background: white;
    }
    .lefri-widget-input input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
    }
    .lefri-widget-input input:focus {
      border-color: #4f46e5;
    }
    .lefri-widget-input button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .lefri-widget-input button:hover {
      background: #4338ca;
    }
  `;
  document.head.appendChild(style);

  const scriptTag = document.currentScript;
  const firmId = scriptTag ? scriptTag.getAttribute('data-firm-id') : 'demo';
  const origin = window.location.origin;

  const btn = document.createElement('div');
  btn.className = 'lefri-widget-btn';
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.className = 'lefri-widget-box';
  box.innerHTML = `
    <div class="lefri-widget-header">
      <div>
        <h3>Asistente de IA Legal</h3>
        <p>Conectado con LeFriApp</p>
      </div>
      <div class="lefri-widget-close">&times;</div>
    </div>
    <div class="lefri-widget-messages">
      <div class="lefri-msg bot">¡Hola! Soy el Asistente de IA. Cuéntame sobre tu problema o caso legal para ayudarte de inmediato.</div>
    </div>
    <div class="lefri-widget-input">
      <input type="text" placeholder="Escribe tu consulta aquí..." />
      <button>Enviar</button>
    </div>
  `;
  document.body.appendChild(box);

  btn.onclick = () => {
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
  };
  box.querySelector('.lefri-widget-close').onclick = () => {
    box.style.display = 'none';
  };

  const input = box.querySelector('input');
  const sendBtn = box.querySelector('button');
  const msgsContainer = box.querySelector('.lefri-widget-messages');

  function appendMsg(text, sender) {
    const el = document.createElement('div');
    el.className = 'lefri-msg ' + sender;
    el.innerText = text;
    msgsContainer.appendChild(el);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMsg(text, 'user');

    appendMsg('Procesando consulta con la red legal...', 'bot');
    const statusMsgIndex = msgsContainer.children.length - 1;

    try {
      const response = await fetch(`${origin}/api/widget/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          firmId: firmId
        })
      });
      
      const data = await response.json();
      
      msgsContainer.removeChild(msgsContainer.children[statusMsgIndex]);

      if (response.ok && data.response) {
        appendMsg(data.response, 'bot');
      } else {
        appendMsg('Lo siento, tuvimos un error procesando tu consulta legal. Intenta de nuevo más tarde.', 'bot');
      }
    } catch(err) {
      msgsContainer.removeChild(msgsContainer.children[statusMsgIndex]);
      appendMsg('Error en la conexión. Por favor, intente de nuevo.', 'bot');
    }
  }

  sendBtn.onclick = handleSend;
  input.onkeydown = (e) => { if(e.key === 'Enter') handleSend(); };
})();
