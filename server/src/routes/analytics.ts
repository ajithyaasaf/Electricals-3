import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import type { OrderItem } from "@shared/types";

export function registerAnalyticsRoutes(app: Express) {
  // Get inventory tracking - fast vs slow selling products
  app.get("/api/analytics/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all products and orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const products = await storage.getAllProducts();
      const orders = await storage.getAllOrders();

      // Get all order items to analyze sales
      const allOrderItems = await storage.getAllOrderItems();
      
      // Calculate sales velocity for each product
      const productSalesData = products.map(product => {
        // Count quantities sold in the last 30 days
        let totalSold = 0;
        let recentOrdersCount = 0;

        allOrderItems.forEach((item: OrderItem) => {
          if (item.productId === product.id) {
            // Find the order for this item to check date
            const order = orders.find(o => o.id === item.orderId);
            if (order && new Date(order.createdAt) >= thirtyDaysAgo) {
              totalSold += item.quantity || 0;
              recentOrdersCount++;
            }
          }
        });

        // Calculate sales velocity (units per day)
        const salesVelocity = totalSold / 30;
        
        let status = 'slow';
        if (salesVelocity > 1) status = 'fast';
        else if (salesVelocity > 0.3) status = 'medium';

        return {
          id: product.id,
          name: product.name,
          stock: product.stock || 0,
          price: product.price,
          totalSold,
          salesVelocity,
          status,
          recentOrders: recentOrdersCount,
          daysOfStock: product.stock && salesVelocity > 0 ? Math.floor(product.stock / salesVelocity) : 999
        };
      });

      // Sort by sales velocity (fastest first)
      productSalesData.sort((a, b) => b.salesVelocity - a.salesVelocity);

      res.json({
        totalProducts: products.length,
        fastSelling: productSalesData.filter(p => p.status === 'fast'),
        mediumSelling: productSalesData.filter(p => p.status === 'medium'),
        slowSelling: productSalesData.filter(p => p.status === 'slow'),
        allProducts: productSalesData
      });
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
      res.status(500).json({ message: "Failed to fetch inventory analytics" });
    }
  });

  // Get monthly revenue summary
  app.get("/api/analytics/revenue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      const now = new Date();
      const monthlyData = [];

      // Get last 12 months of data
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        let monthRevenue = 0;
        let monthOrderCount = 0;

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
            monthRevenue += parseFloat(order.total.toString());
            monthOrderCount++;
          }
        });

        monthlyData.push({
          month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          orders: monthOrderCount,
          averageOrder: monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0
        });
      }

      // Current month metrics
      const currentMonth = monthlyData[monthlyData.length - 1];
      const lastMonth = monthlyData[monthlyData.length - 2];
      const revenueGrowth = lastMonth && lastMonth.revenue > 0 
        ? ((currentMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100 
        : 0;

      res.json({
        monthlyData,
        totalRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0),
        totalOrders: monthlyData.reduce((sum, month) => sum + month.orders, 0),
        averageMonthlyRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0) / 12,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // Get top selling products
  app.get("/api/analytics/top-products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const products = await storage.getAllProducts();
      const allOrderItems = await storage.getAllOrderItems();

      // Calculate revenue and quantity for each product
      const productRevenue: { [key: string]: number } = {};
      const productQuantity: { [key: string]: number } = {};

      allOrderItems.forEach((item: OrderItem) => {
        if (item.productId) {
          const productId = item.productId;
          const revenue = item.price * item.quantity;
          const quantity = item.quantity;

          productRevenue[productId] = (productRevenue[productId] || 0) + revenue;
          productQuantity[productId] = (productQuantity[productId] || 0) + quantity;
        }
      });

      // Create top products list
      const topProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        totalRevenue: productRevenue[product.id] || 0,
        totalQuantitySold: productQuantity[product.id] || 0,
        stock: product.stock || 0
      }))
      .filter(product => product.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

      res.json({
        topByRevenue: topProducts.slice(0, 10),
        topByQuantity: [...topProducts].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold).slice(0, 10),
        totalProductsWithSales: topProducts.length,
        totalRevenue: topProducts.reduce((sum, p) => sum + p.totalRevenue, 0)
      });
    } catch (error) {
      console.error("Error fetching top products analytics:", error);
      res.status(500).json({ message: "Failed to fetch top products analytics" });
    }
  });

  // Get customer repeat rate
  app.get("/api/analytics/customers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const orders = await storage.getAllOrders();
      
      // Group orders by customer
      const customerOrders: { [key: string]: any[] } = {};
      orders.forEach(order => {
        const customerId = order.userId;
        if (!customerOrders[customerId]) {
          customerOrders[customerId] = [];
        }
        customerOrders[customerId].push(order);
      });

      // Calculate metrics
      const totalCustomers = Object.keys(customerOrders).length;
      const oneTimeCustomers = Object.values(customerOrders).filter((orders: any) => orders.length === 1).length;
      const repeatCustomers = totalCustomers - oneTimeCustomers;
      const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      // Average orders per customer
      const totalOrders = orders.length;
      const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

      // Customer lifetime value
      const customerData = Object.entries(customerOrders).map(([customerId, customerOrderList]: [string, any]) => {
        const totalSpent = customerOrderList.reduce((sum: number, order: any) => 
          sum + parseFloat(order.total.toString()), 0
        );
        return {
          customerId,
          orderCount: customerOrderList.length,
          totalSpent,
          averageOrderValue: totalSpent / customerOrderList.length
        };
      });

      const avgCustomerValue = customerData.reduce((sum, customer) => sum + customer.totalSpent, 0) / totalCustomers;

      res.json({
        totalCustomers,
        oneTimeCustomers,
        repeatCustomers,
        repeatRate: Math.round(repeatRate * 100) / 100,
        avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
        avgCustomerValue: Math.round(avgCustomerValue * 100) / 100,
        topCustomers: customerData.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)
      });
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });
}