import { useState } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn({ csrfToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const result = await signIn('credentials', {
      redirect: false, // Handle redirect manually to show errors
      email,
      password,
      // callbackUrl: `${window.location.origin}/` // Or where you want to redirect after login
    });

    if (result.error) {
      setError(result.error);
      // More specific error handling based on result.error string if needed
      // e.g. if (result.error === "CredentialsSignin") { setError("Invalid email or password.") }
      console.error("Sign-in error:", result.error);
    } else if (result.url) {
      // Successfully signed in
      router.push(router.query.callbackUrl || '/'); // Redirect to callbackUrl or home
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
      {/* Placeholder for registration link/form */}
      <p style={{marginTop: '20px', textAlign: 'center'}}>
        Don't have an account? <a href="/auth/register">Register (Placeholder)</a>
      </p>
    </div>
  );
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}
