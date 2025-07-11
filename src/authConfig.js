export const authConfig = {
  clientId: 'oauth-front-a',
  authorizationEndpoint: 'http://localhost:8080/realms/myrealm/protocol/openid-connect/auth',
  tokenEndpoint: 'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
  logoutEndpoint: 'http://localhost:8080/realms/myrealm/protocol/openid-connect/logout',

  redirectUri: 'http://localhost:5173',
  scope: 'openid profile email offline_access',
  onRefreshTokenExpire: (event) => event.logIn(),
  autoLogin: false,
}