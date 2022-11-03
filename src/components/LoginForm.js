
function LoginForm({
  handleLogin,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password
}) {
  return (
    <form onSubmit={handleLogin}>
      <div>
        Username:
        <input
          type="text"
          value={username}
          name="Username"
          onChange={handleUsernameChange}
        />
      </div>
      <div>
        Password:
        <input
          type="password"
          value={password}
          name="Password"
          onChange={handlePasswordChange}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  )
};

export default LoginForm;