'use client'

import { useState } from 'react'

export default function TestAuthPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { test, success, data, time: new Date().toISOString() }])
  }

  const testDbConnection = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      addResult('DB Connection', res.ok, { status: res.status, data })
    } catch (error: any) {
      addResult('DB Connection', false, { error: error.message })
    }
  }

  const testRegister = async () => {
    const testEmail = `test${Date.now()}@example.com`
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: testEmail,
          password: 'Test1234',
          fullName: 'Test User'
        })
      })
      const data = await res.json()
      addResult('Register', res.ok, { status: res.status, data })
    } catch (error: any) {
      addResult('Register', false, { error: error.message })
    }
  }

  const testLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Test1234'
        })
      })
      const data = await res.json()
      addResult('Login', res.ok, { status: res.status, data })
    } catch (error: any) {
      addResult('Login', false, { error: error.message })
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])
    await testDbConnection()
    await new Promise(r => setTimeout(r, 500))
    await testRegister()
    await new Promise(r => setTimeout(r, 500))
    await testLogin()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test d'authentification</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : 'Lancer tous les tests'}
          </button>
          
          <div className="flex gap-4">
            <button onClick={testDbConnection} className="px-4 py-2 bg-slate-700 text-white rounded">
              Test DB
            </button>
            <button onClick={testRegister} className="px-4 py-2 bg-slate-700 text-white rounded">
              Test Register
            </button>
            <button onClick={testLogin} className="px-4 py-2 bg-slate-700 text-white rounded">
              Test Login
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {results.map((result, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
                <h3 className="text-lg font-semibold text-white">{result.test}</h3>
                <span className="text-sm text-slate-400 ml-auto">
                  {new Date(result.time).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            Cliquez sur "Lancer tous les tests" pour commencer
          </div>
        )}
      </div>
    </div>
  )
}
