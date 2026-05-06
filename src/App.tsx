import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import TransferirIngresso from "./pages/TransferirIngresso";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AdminRouteGuard } from "./components/AdminRouteGuard";
import { CustomerRouteGuard } from "./components/CustomerRouteGuard";
import { ScrollToTop } from "./components/ScrollToTop";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import { CartProvider } from "./contexts/CartContext";
import Catalogo from "./pages/ecommerce/Catalogo";
import ProdutoDetalhe from "./pages/ecommerce/ProdutoDetalhe";
import Carrinho from "./pages/ecommerce/Carrinho";
import Checkout from "./pages/ecommerce/Checkout";
import Obrigado from "./pages/ecommerce/Obrigado";
import Conta from "./pages/ecommerce/Conta";
import Pedidos from "./pages/ecommerce/Pedidos";
import Login from "./pages/ecommerce/Login";
import Cadastro from "./pages/ecommerce/Cadastro";
import RecuperarSenha from "./pages/ecommerce/RecuperarSenha";
import NovaSenha from "./pages/ecommerce/NovaSenha";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CustomerAuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ingresso/transferir" element={<TransferirIngresso />} />
              <Route path="/loja" element={<Navigate to="/ecommerce" replace />} />
              <Route path="/admin" element={<AdminRouteGuard><Admin /></AdminRouteGuard>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/dashboard" element={<AdminRouteGuard><Dashboard /></AdminRouteGuard>} />

              {/* E-Commerce */}
              <Route path="/ecommerce" element={<Catalogo />} />
              <Route path="/ecommerce/produto/:id" element={<ProdutoDetalhe />} />
              <Route path="/ecommerce/carrinho" element={<Carrinho />} />
              <Route path="/ecommerce/obrigado" element={<Obrigado />} />
              <Route path="/ecommerce/login" element={<Login />} />
              <Route path="/ecommerce/cadastro" element={<Cadastro />} />
              <Route path="/ecommerce/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/ecommerce/nova-senha" element={<NovaSenha />} />
              <Route path="/ecommerce/checkout" element={<CustomerRouteGuard><Checkout /></CustomerRouteGuard>} />
              <Route path="/ecommerce/conta" element={<CustomerRouteGuard><Conta /></CustomerRouteGuard>} />
              <Route path="/ecommerce/conta/pedidos" element={<CustomerRouteGuard><Pedidos /></CustomerRouteGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CustomerAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
