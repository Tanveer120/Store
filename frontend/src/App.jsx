import React from 'react'
import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Cart from './pages/Cart'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Profile from './pages/Profile'
import ChatPage from './pages/ChatPage'
import OrderSuccess from './pages/OrderSuccess'
// import Customizer from './pages/Customizer'
import CustomOrders from './pages/CustomOrders'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlaceCustomOrder from './pages/PlaceCustomOrder'

const App = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  return (
    <div className='px-4 sm:px-5[vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer/>
      <Navbar />
      <SearchBar/>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/collection' element={<Collection />}></Route>
        <Route path='/about' element={<About />}></Route>
        <Route path='/contact' element={<Contact />}></Route>
        <Route path='/product/:productId' element={<Product/>}></Route>
        <Route path='/cart' element={<Cart />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/place-order' element={<PlaceOrder />}></Route>
        <Route path='/orders' element={<Orders />}></Route>
        <Route path='/custom-orders/list' element={<CustomOrders />}></Route>
        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/chat' element={<ChatPage />}></Route>
        <Route path='/order-success' element={<OrderSuccess />}></Route>
        {/* <Route path='/customize' element={<Customizer />}></Route> */}
        <Route path='/custom-order' element={<PlaceCustomOrder />}></Route>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App