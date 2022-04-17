import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// ############# TYPES #############
interface Message {
  name: string;
  text: string;
}

// ############# APP #############
const socket = io('http://localhost:3001');
function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessagesText] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [typingDisplay, setTypingDisplay] = useState<string>('');

  // -------------------- USEEFFECT --------------------
  useEffect(() => {
    socket.emit('findAllMessages', {}, (response: Message[]) => {
      setMessages(response);
    });

    socket.on('message', (msg: Message) => {
      setMessages((prevMessages: Message[]) => [...prevMessages, msg]);
    });

    socket.on(
      'typing',
      ({ name, isTyping }: { name: string; isTyping: boolean }) => {
        isTyping && setTypingDisplay(`${name} is typing...`);
        !isTyping && setTypingDisplay('');
      }
    );

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (messageText) {
      socket.emit('typing', { isTyping: true });

      const timer = setTimeout(() => {
        socket.emit('typing', { isTyping: false });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messageText]);

  // -------------------- FUNCTIONS --------------------
  function sendMessage(e: any) {
    e.preventDefault();

    socket.emit('createMessage', { text: messageText }, (response: any) => {
      setMessagesText('');
    });
  }

  function join(e: any) {
    e.preventDefault();
    const nameValue = e.target?.name?.value;

    if (name) {
      socket.emit('join', { name: nameValue }, (response: any) => {
        setJoined(true);
      });
    }
  }

  return (
    <div className="chat">
      <style>{`
        .chat {
          padding: 20px;
          height: 80vh;
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .messages-container{
          flex: 1;
        }
      `}</style>
      {!joined && (
        <form onSubmit={join}>
          <label>What's your name?</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
      )}

      {joined && (
        <div className="chat-container">
          <div className="messages-container">
            {messages &&
              messages.map((message: any, idx: number) => (
                <div key={idx}>
                  [{message.name}]: {message.text}
                </div>
              ))}
          </div>

          {typingDisplay && <div>{typingDisplay}</div>}
          <hr />

          <div className="message-input">
            <form onSubmit={sendMessage}>
              <label>Message:</label>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessagesText(e.target.value)}
              />
              <input type="submit" value="Send" />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
