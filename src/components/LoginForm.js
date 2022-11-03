
import PropTypes from 'prop-types'

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
          id='username'
          name="Username"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div>
        Password:
        <input
          type="password"
          id='password'
          name="Password"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      <button id="login-button" type="submit">Login</button>
    </form>
  )
}

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired
}

export default LoginForm