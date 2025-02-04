import { useState } from "react"

const Login = () => {
  const [state, setState] = useState('Sign up');
  return (
    <div className='signin-signup-form'>
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <div className="input-container">
          <input type="text" name='username' placeholder='Username' value={formData.username} onChange={handleChange} />
          <input type="password" name='password' placeholder='Password' value={formData.password} onChange={handleChange} />
          <button type='submit'>Sign in</button>
        </div>
        <Link to='/signup' className='link'>Don't have an account? <span>Sign up</span></Link>
      </form>
      <ToastContainer />
    </div>
  )
}

export default Login