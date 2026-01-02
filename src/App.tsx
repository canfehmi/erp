import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Customers from "./pages/Customer/Customer";
import CustomerFinancialDetail from "./pages/Customer/CustomerFinancialDetail";
import Suppliers from "./pages/Suppliers/Suppliers";
import Products from "./pages/Products/Products";
import Stock from "./pages/Stock/Stock";
import Costs from "./pages/Costs/Costs";
import ProductCategories from "./pages/ProductCategories/ProductCategories";
import Jobs from "./pages/Jobs/Jobs";
import JobDetail from "./pages/Jobs/JobDetail";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id/financial" element={<CustomerFinancialDetail />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product-categories" element={<ProductCategories />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:id/edit" element={<JobDetail />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
