import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CreatorStore from './pages/CreatorStore';
import Orders from './pages/Orders';
import CreateProduct from './pages/CreateProduct';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/creator/:id" element={<CreatorStore />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/create-product" element={<CreateProduct />} />
      </Routes>
    </BrowserRouter>
  );
}
