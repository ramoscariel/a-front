import { useContext, useEffect } from "react"
import { AuthContext } from "react-oauth2-code-pkce"


function App() {
  const { token, tokenData, logIn, logOut, isAuthenticated } =
    useContext(AuthContext);

  useEffect(() => {
    if (token) {
      console.log("Token available " + token);
    }
  }, [token]);

  return (
    <>
      <div style={{ padding: '2rem' }}>
        <h1>Sistema A</h1>
        <div>
          {!token ? (
            <button onClick={() => logIn()}>Log in</button>
          ) : (
            <>
              <button onClick={() => logOut()}>Log out</button>
              <div>
                <h3>Token Data:</h3>
                <pre>{JSON.stringify(tokenData, null, 2)}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default App
