import { useEffect, useMemo, useState } from "react";
import { Users, Clock, CheckCircle2, DollarSign, CalendarRange, Sun, FileDown, Loader2, ChevronDown, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";

type OrderRow = { status: string; total: number; created_at: string };

type CadastroOrderItem = {
  quantidade: number;
  preco_unitario: number;
  products: { nome: string } | null;
};

type CadastroOrder = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: CadastroOrderItem[];
};

type CadastroProfile = {
  user_id: string;
  nome: string;
  email: string;
  orders: CadastroOrder[];
};

type ItemRow = {
  quantidade: number;
  preco_unitario: number;
  tamanho: string | null;
  products: { id: string; nome: string; tamanhos: string[] | null } | null;
};

type PaidOrderRow = {
  id: string;
  user_id: string;
  total: number;
  created_at: string;
  order_items: {
    quantidade: number;
    tamanho: string | null;
    products: { nome: string; tamanhos: string[] | null } | null;
  }[];
};

type ProfileRow = { user_id: string; nome: string };
type ProdutoStat = { id: string; nome: string; qty: number; valor: number; ehCamiseta: boolean };

const DAY_MS = 86_400_000;
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [cadastros, setCadastros] = useState(0);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const [showCadastros, setShowCadastros] = useState(false);
  const [cadastrosDetail, setCadastrosDetail] = useState<CadastroProfile[]>([]);
  const [cadastrosDetailLoading, setCadastrosDetailLoading] = useState(false);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [profilesRes, ordersRes, itemsRes] = await Promise.all([
        supabase.from("customer_profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("status, total, created_at"),
        supabase
          .from("order_items")
          .select("quantidade, preco_unitario, tamanho, products(id, nome, tamanhos), orders!inner(status)")
          .eq("orders.status", "pago"),
      ]);

      setCadastros(profilesRes.count ?? 0);
      setOrders((ordersRes.data as OrderRow[]) ?? []);
      setItems((itemsRes.data as unknown as ItemRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const fetchCadastrosDetail = async () => {
    setCadastrosDetailLoading(true);
    const [profilesRes, ordersRes] = await Promise.all([
      supabase.from("customer_profiles").select("user_id, nome, email").order("nome"),
      supabase
        .from("orders")
        .select("id, user_id, total, status, created_at, order_items(quantidade, preco_unitario, products(nome))")
        .order("created_at", { ascending: false }),
    ]);

    const profiles = (profilesRes.data ?? []) as { user_id: string; nome: string; email: string }[];
    const allOrders = (ordersRes.data ?? []) as CadastroOrder[];

    const ordersByUser = new Map<string, CadastroOrder[]>();
    for (const order of allOrders) {
      const list = ordersByUser.get(order.user_id) ?? [];
      list.push(order);
      ordersByUser.set(order.user_id, list);
    }

    setCadastrosDetail(
      profiles.map((p) => ({ ...p, orders: ordersByUser.get(p.user_id) ?? [] }))
    );
    setCadastrosDetailLoading(false);
  };

  const toggleProfile = (id: string) =>
    setExpandedProfiles((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleOrder = (id: string) =>
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const kpis = useMemo(() => {
    const pendentes = orders.filter((o) => o.status === "pendente").length;
    const pagos = orders.filter((o) => o.status === "pago").length;
    const now = Date.now();
    const totalFat = orders.filter((o) => o.status === "pago").reduce((s, o) => s + Number(o.total), 0);
    const semanaFat = orders
      .filter((o) => o.status === "pago" && now - new Date(o.created_at).getTime() < 7 * DAY_MS)
      .reduce((s, o) => s + Number(o.total), 0);
    const diaFat = orders
      .filter((o) => o.status === "pago" && now - new Date(o.created_at).getTime() < DAY_MS)
      .reduce((s, o) => s + Number(o.total), 0);
    return { pendentes, pagos, totalFat, semanaFat, diaFat };
  }, [orders]);

  const porProduto = useMemo<ProdutoStat[]>(() => {
    const map = new Map<string, ProdutoStat>();
    items.forEach((i) => {
      const p = i.products;
      if (!p) return;
      const cur = map.get(p.id) ?? {
        id: p.id,
        nome: p.nome,
        qty: 0,
        valor: 0,
        ehCamiseta: (p.tamanhos?.length ?? 0) > 0,
      };
      cur.qty += i.quantidade;
      cur.valor += i.quantidade * Number(i.preco_unitario);
      map.set(p.id, cur);
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty);
  }, [items]);

  const porTamanho = useMemo(() => {
    const map = new Map<string, number>();
    items
      .filter((i) => (i.products?.tamanhos?.length ?? 0) > 0 && i.tamanho)
      .forEach((i) => map.set(i.tamanho!, (map.get(i.tamanho!) ?? 0) + i.quantidade));
    const ordem = ["PP", "P", "M", "G", "GG", "XG", "XXG"];
    return [...map.entries()]
      .map(([tamanho, qty]) => ({ tamanho, qty }))
      .sort((a, b) => {
        const ai = ordem.indexOf(a.tamanho);
        const bi = ordem.indexOf(b.tamanho);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.tamanho.localeCompare(b.tamanho);
      });
  }, [items]);

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      // Buscar pedidos pagos com itens
      const { data: paidOrders } = await supabase
        .from("orders")
        .select("id, user_id, total, created_at, order_items(quantidade, tamanho, products(nome, tamanhos))")
        .eq("status", "pago")
        .order("created_at", { ascending: true });

      if (!paidOrders || paidOrders.length === 0) {
        alert("Nenhuma venda paga encontrada.");
        return;
      }

      const rows = paidOrders as unknown as PaidOrderRow[];

      // Buscar perfis dos clientes
      const userIds = [...new Set(rows.map((o) => o.user_id))];
      const { data: profiles } = await supabase
        .from("customer_profiles")
        .select("user_id, nome")
        .in("user_id", userIds);

      const profileMap = new Map<string, string>(
        (profiles as ProfileRow[] ?? []).map((p) => [p.user_id, p.nome])
      );

      // Agrupar itens por cliente
      type ClienteData = { nome: string; linhas: string[] };
      const clientes = new Map<string, ClienteData>();

      for (const order of rows) {
        const nome = profileMap.get(order.user_id) ?? "Cliente desconhecido";
        if (!clientes.has(order.user_id)) clientes.set(order.user_id, { nome, linhas: [] });
        const cliente = clientes.get(order.user_id)!;

        for (const item of order.order_items) {
          const prodNome = item.products?.nome ?? "Produto";
          const linha = item.tamanho
            ? `${prodNome} ${item.tamanho}`
            : prodNome;
          for (let q = 0; q < item.quantidade; q++) {
            cliente.linhas.push(linha);
          }
        }
      }

      // Gerar PDF
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const marginY = 20;
      let y = marginY;

      const now = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
      });

      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Vendas por Cliente", marginX, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`Identidade Santidade 2026  ·  Gerado em ${now}`, marginX, y);
      doc.setTextColor(0, 0, 0);
      y += 10;

      // Linha separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(marginX, y, 196, y);
      y += 8;

      const checkPage = (needed: number) => {
        if (y + needed > pageH - 14) {
          doc.addPage();
          y = marginY;
        }
      };

      let clienteIdx = 0;
      for (const { nome, linhas } of clientes.values()) {
        checkPage(12);
        if (clienteIdx > 0) y += 4;

        // Nome do cliente
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(nome, marginX, y);
        y += 6;

        // Itens
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        for (const linha of linhas) {
          checkPage(6);
          doc.text(`• ${linha}`, marginX + 4, y);
          y += 6;
        }

        clienteIdx++;
      }

      // Rodapé na última página
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(
        `Total de clientes: ${clientes.size}  ·  Total de vendas pagas: ${rows.length}`,
        marginX,
        pageH - 10
      );

      const fileName = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="flex items-center justify-center py-32">
          <p className="font-body text-muted-foreground">Carregando...</p>
        </div>
      </EcommerceLayout>
    );
  }

  return (
    <EcommerceLayout>
      <div className="container py-8 space-y-12">
        <h1 className="font-display text-4xl md:text-5xl">Dashboard</h1>
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            icon={<Users size={16} />}
            label="Cadastros"
            value={cadastros.toString()}
            onClick={() => { setShowCadastros(true); fetchCadastrosDetail(); }}
          />
          <KpiCard icon={<Clock size={16} />} label="Vendas Pendentes" value={kpis.pendentes.toString()} />
          <KpiCard icon={<CheckCircle2 size={16} />} label="Vendas Pagas" value={kpis.pagos.toString()} />
          <KpiCard icon={<DollarSign size={16} />} label="Faturamento Total" value={brl(kpis.totalFat)} />
          <KpiCard icon={<CalendarRange size={16} />} label="Últimos 7 dias" value={brl(kpis.semanaFat)} />
          <KpiCard icon={<Sun size={16} />} label="Hoje" value={brl(kpis.diaFat)} />
        </section>

        {/* Relatório por cliente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-xl">Relatório por cliente</CardTitle>
            <Button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="font-body text-xs font-semibold uppercase tracking-widest"
            >
              {exportLoading ? (
                <><Loader2 size={14} className="mr-2 animate-spin" />Gerando...</>
              ) : (
                <><FileDown size={14} className="mr-2" />Exportar PDF</>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-body text-sm text-muted-foreground">
              Exporta a lista de todos os clientes com seus itens comprados (apenas vendas pagas),
              em formato de árvore — um cliente por bloco com seus produtos listados abaixo.
            </p>
          </CardContent>
        </Card>

        {/* Vendas por produto */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Vendas por produto</CardTitle>
          </CardHeader>
          <CardContent>
            {porProduto.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground py-8 text-center">
                Nenhuma venda paga ainda.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porProduto}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
                      <XAxis
                        dataKey="nome"
                        tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 4,
                          fontFamily: "var(--font-body)",
                          fontSize: 12,
                        }}
                        formatter={(value: number, name) => {
                          if (name === "qty") return [value, "Qtd vendida"];
                          if (name === "valor") return [brl(value), "Faturamento"];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porProduto.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-body">
                          {p.nome}
                          {p.ehCamiseta && (
                            <span className="ml-2 text-xs text-muted-foreground uppercase tracking-widest">
                              camiseta
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-body">{p.qty}</TableCell>
                        <TableCell className="text-right font-body">{brl(p.valor)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Camisetas por tamanho */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Camisetas por tamanho</CardTitle>
          </CardHeader>
          <CardContent>
            {porTamanho.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground py-8 text-center">
                Nenhuma camiseta vendida ainda.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porTamanho}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
                      <XAxis dataKey="tamanho" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                        formatter={(value: number) => [value, "Qtd"]}
                      />
                      <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tamanho</TableHead>
                      <TableHead className="text-right">Qtd vendida</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porTamanho.map((t) => (
                      <TableRow key={t.tamanho}>
                        <TableCell className="font-body font-semibold">{t.tamanho}</TableCell>
                        <TableCell className="text-right font-body">{t.qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        {/* Painel de Cadastros */}
        <AnimatePresence>
          {showCadastros && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/60"
                onClick={() => setShowCadastros(false)}
              />
              <motion.aside
                key="panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-background border-l border-foreground/10 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/10 shrink-0">
                  <div>
                    <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Dashboard
                    </p>
                    <h2 className="font-display text-2xl">
                      Cadastros
                      {cadastrosDetail.length > 0 && (
                        <span className="font-body text-base text-muted-foreground ml-3">
                          {cadastrosDetail.length}
                        </span>
                      )}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCadastros(false)}
                    className="p-2 hover:bg-foreground/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {cadastrosDetailLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 size={20} className="animate-spin text-muted-foreground" />
                    </div>
                  ) : cadastrosDetail.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground text-center py-16">
                      Nenhum cadastro encontrado.
                    </p>
                  ) : (
                    <div className="divide-y divide-foreground/10">
                      {cadastrosDetail.map((profile) => {
                        const profileOpen = expandedProfiles.has(profile.user_id);
                        const totalPago = profile.orders
                          .filter((o) => o.status === "pago")
                          .reduce((s, o) => s + Number(o.total), 0);

                        return (
                          <div key={profile.user_id}>
                            {/* Profile row */}
                            <button
                              type="button"
                              onClick={() => toggleProfile(profile.user_id)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-body text-sm font-semibold truncate">
                                  {profile.nome}
                                </p>
                                <p className="font-body text-xs text-muted-foreground truncate">
                                  {profile.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                {profile.orders.length > 0 && (
                                  <span className="font-body text-xs text-muted-foreground">
                                    {profile.orders.length} {profile.orders.length === 1 ? "pedido" : "pedidos"}
                                    {totalPago > 0 && (
                                      <> · {brl(totalPago)}</>
                                    )}
                                  </span>
                                )}
                                <ChevronDown
                                  size={15}
                                  className={`text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                                />
                              </div>
                            </button>

                            {/* Orders tree */}
                            <AnimatePresence initial={false}>
                              {profileOpen && (
                                <motion.div
                                  key="orders"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-6 pr-4 pb-3 border-l-2 border-foreground/10 ml-6 mb-1">
                                    {profile.orders.length === 0 ? (
                                      <p className="font-body text-xs text-muted-foreground py-3">
                                        Sem pedidos.
                                      </p>
                                    ) : (
                                      <div className="divide-y divide-foreground/[0.06]">
                                        {profile.orders.map((order) => {
                                          const orderOpen = expandedOrders.has(order.id);
                                          const totalItems = order.order_items.reduce(
                                            (s, i) => s + i.quantidade,
                                            0
                                          );
                                          return (
                                            <div key={order.id}>
                                              <button
                                                type="button"
                                                onClick={() => toggleOrder(order.id)}
                                                className="w-full py-3 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors"
                                              >
                                                <div>
                                                  <p className="font-body text-xs font-semibold mb-0.5">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                  </p>
                                                  <p className="font-body text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("pt-BR")} ·{" "}
                                                    {totalItems} {totalItems === 1 ? "item" : "itens"}
                                                  </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                  <span className="font-body text-xs">
                                                    {Number(order.total).toLocaleString("pt-BR", {
                                                      style: "currency",
                                                      currency: "BRL",
                                                    })}
                                                  </span>
                                                  <OrderStatusBadge status={order.status} />
                                                  <ChevronDown
                                                    size={13}
                                                    className={`text-muted-foreground transition-transform duration-200 ${orderOpen ? "rotate-180" : ""}`}
                                                  />
                                                </div>
                                              </button>

                                              <AnimatePresence initial={false}>
                                                {orderOpen && (
                                                  <motion.div
                                                    key="items"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="overflow-hidden"
                                                  >
                                                    <div className="pb-3 pl-3 border-l-2 border-foreground/10 ml-2 mb-1">
                                                      {order.order_items.map((item, idx) => (
                                                        <div
                                                          key={idx}
                                                          className="flex items-center justify-between py-1.5"
                                                        >
                                                          <div className="flex items-center gap-2">
                                                            <span className="font-body text-xs text-muted-foreground w-5 text-right">
                                                              {item.quantidade}×
                                                            </span>
                                                            <span className="font-body text-xs">
                                                              {item.products?.nome ?? "Produto"}
                                                            </span>
                                                          </div>
                                                          <span className="font-body text-xs text-muted-foreground">
                                                            {(item.preco_unitario * item.quantidade).toLocaleString(
                                                              "pt-BR",
                                                              { style: "currency", currency: "BRL" }
                                                            )}
                                                          </span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
    </EcommerceLayout>
  );
}

function KpiCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={onClick ? "cursor-pointer hover:bg-foreground/5 transition-colors" : ""}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="font-body text-xs uppercase tracking-widest">{label}</span>
        </div>
        <p className="font-display text-2xl">{value}</p>
      </CardContent>
    </Card>
  );
}
