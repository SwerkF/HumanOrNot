import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '@/redux/store'
import { useAppSelector } from '@/hooks/useAppSelector'

import Home from '@/pages/Home'
import Game from '@/pages/Game'
import Login from '@/pages/Login'
import Stats from '@/pages/Stats'
import Register from '@/pages/Register'

import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
  <div className="min-h-screen bg-black mx-auto">
      <Provider store={store}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Router>
          <Routing />
        </Router>
      </Provider>
    </div>
  )
}

const Routing = () => {
  
  const { isAuth } = useAppSelector((state) => state.auth)

  return (
  isAuth ? (
    <div className="mx-auto">
      <ProtectedRoutes />
    </div>
  ) : (
    <PublicRoutes />
  )
  )
}

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='*' element={<Navigate to='/' />} />
      <Route path='/game' element={<Game />} />
      <Route path='/stats' element={<Stats />} />
    </Routes>
  )
}

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}

export default App