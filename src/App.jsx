import { useContext, useEffect, useState } from "react"
import { AuthContext } from "react-oauth2-code-pkce"

const API_BASE_URL = "https://localhost:8081/api";

function App() {
  const { token, tokenData, logIn, logOut, isAuthenticated } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      console.log("Token available " + token);
      registerUser();
      fetchMessages();
    }
  }, [token]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const registerUser = async () => {
    try {
      await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setError("Failed to fetch messages");
      }
    } catch (error) {
      setError("Error fetching messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage })
      });
      
      if (response.ok) {
        const createdMessage = await response.json();
        setMessages([...messages, createdMessage]);
        setNewMessage("");
      } else {
        setError("Failed to create message");
      }
    } catch (error) {
      setError("Error creating message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (id) => {
    if (!editText.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: editText })
      });
      
      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(messages.map(msg => msg.id === id ? updatedMessage : msg));
        setEditingMessage(null);
        setEditText("");
      } else {
        setError("Failed to update message");
      }
    } catch (error) {
      setError("Error updating message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== id));
      } else {
        setError("Failed to delete message");
      }
    } catch (error) {
      setError("Error deleting message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sistema A - Notes Manager</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        {!token ? (
          <button onClick={() => logIn()}>Log in</button>
        ) : (
          <>
            <button onClick={() => logOut()}>Log out</button>
            <div style={{ marginTop: '1rem' }}>
              <h3>User: {tokenData?.preferred_username || tokenData?.sub}</h3>
            </div>
          </>
        )}
      </div>

      {token && (
        <div>
          {error && (
            <div style={{ 
              color: 'red', 
              backgroundColor: '#ffebee', 
              padding: '1rem', 
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Create new message */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Add New Note</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter your note..."
                style={{ 
                  flex: 1, 
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && createMessage()}
              />
              <button 
                onClick={createMessage} 
                disabled={loading || !newMessage.trim()}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div>
            <h3>Your Notes ({messages.length})</h3>
            {loading && messages.length === 0 ? (
              <div>Loading...</div>
            ) : messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '2rem',
                border: '1px dashed #ccc',
                borderRadius: '4px'
              }}>
                No notes yet. Add your first note above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    style={{ 
                      border: '1px solid #ddd',
                      padding: '1rem',
                      borderRadius: '4px',
                      backgroundColor: '#242424'
                    }}
                  >
                    {editingMessage === message.id ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          style={{ 
                            flex: 1, 
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && updateMessage(message.id)}
                        />
                        <button 
                          onClick={() => updateMessage(message.id)}
                          disabled={loading || !editText.trim()}
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelEditing}
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>{message.message}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                          ID: {message.id}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => startEditing(message)}
                            style={{ 
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteMessage(message.id)}
                            disabled={loading}
                            style={{ 
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;