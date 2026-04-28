import Navbar from './components/Navbar'
import AppRouter from './router'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <AppRouter />
      </main>
    </div>
  )
}

export default App
