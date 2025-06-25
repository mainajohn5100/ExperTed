import React from 'react';
import Link from 'next/link';

export default function Register() {
  const handleRegister = (event) => {
    event.preventDefault();
    // Placeholder for registration logic
    console.log('Registration form submitted (placeholder)');
    alert('Registration functionality is not yet implemented. This is a placeholder.');
    // In the future, this would involve:
    // 1. Collecting user input (name, email, password, confirm password)
    // 2. Validating input
    // 3. Hashing the password (e.g., using bcrypt)
    // 4. Making an API call to a registration endpoint (e.g., /api/auth/register)
    // 5. That endpoint would then use Prisma to create a new user in the database.
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h1>Register</h1>
      <p>Registration functionality is currently under development.</p>
      <form onSubmit={handleRegister} style={{ marginTop: '20px' }}>
        {/* Basic form fields for future use - non-functional for now */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name</label>
          <input id="name" type="text" placeholder="Your Name" disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input id="email" type="email" placeholder="your@email.com" disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input id="password" type="password" placeholder="Password" disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register (Disabled)
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link href="/auth/signin">Sign In</Link>
      </p>
    </div>
  );
}
