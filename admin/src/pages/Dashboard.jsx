import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { Bar, Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

// Component for rendering a product's performance and enabling PDF download
const ProductPerformance = ({ product, performanceData, chartView, currency }) => {
  // Separate refs for details and chart containers
  const detailsRef = useRef(null);
  const chartRef = useRef(null);

  const downloadPdf = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(18);

      // Replace rupee symbol if needed
      const pdfCurrency = currency === "₹" ? "Rs." : currency;

      // Add header
      pdf.text(`Performance for ${product.name}`, 14, 20);

      // Prepare product details data
      const productDetails = [
        ["Name", product.name || ""],
        ["Description", product.description || ""],
        ["Price", `${pdfCurrency}${product.price}`],
        ["Category", product.category || ""],
        ["SubCategory", product.subCategory || ""],
        ["Sizes", product.sizes ? product.sizes.join(", ") : ""],
      ];
      // Add product details table
      autoTable(pdf, {
        startY: 30,
        head: [["Product Detail", "Value"]],
        body: productDetails,
        styles: { halign: "left", fontSize: 10 },
      });

      // Prepare performance metrics table
      const performanceDetails = [
        ["Total Orders", performanceData.totalProductOrders],
        ["Total Quantity Sold", performanceData.totalQuantity],
        ["Total Revenue", `${pdfCurrency}${performanceData.totalProductRevenue.toFixed(2)}`],
      ];
      const finalY = pdf.lastAutoTable.finalY || 30;
      autoTable(pdf, {
        startY: finalY + 10,
        head: [["Performance Metric", "Value"]],
        body: performanceDetails,
        styles: { halign: "left", fontSize: 10 },
      });

      // Now, add the product chart at the end.
      // We'll capture only the chart container (without the details) using html2canvas.
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff", // Force white background
        });
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        // Add a new page for charts if needed
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      }

      pdf.save(`${product.name}-performance.pdf`);
      console.log("PDF generated and downloaded.");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#000000", fontFamily: "Arial, sans-serif" }} className="mb-4 border p-4 rounded">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Performance for {product.name}</h3>
        <button onClick={downloadPdf} className="px-3 py-1 bg-green-500 text-white rounded">
          Download PDF
        </button>
      </div>
      {/* The details section is not captured in the chart capture */}
      <div ref={detailsRef} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-2 border rounded text-gray-700">
            <h4 className="font-semibold">Total Orders</h4>
            <p>{performanceData.totalProductOrders}</p>
          </div>
          <div className="p-2 border rounded text-gray-700">
            <h4 className="font-semibold">Total Quantity Sold</h4>
            <p>{performanceData.totalQuantity}</p>
          </div>
          <div className="p-2 border rounded text-gray-700">
            <h4 className="font-semibold">Total Revenue</h4>
            <p>
              {currency}
              {performanceData.totalProductRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      {/* Chart container that will be captured into the PDF */}
      <div ref={chartRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border rounded shadow">
            <h4 className="text-lg font-semibold mb-2">
              {chartView === "monthly" ? "Monthly Sales" : "Daily Sales"}
            </h4>
            <div className="h-64">
              {chartView === "monthly" ? (
                <Bar data={performanceData.productSalesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <Bar data={performanceData.productDailySalesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          </div>
          <div className="p-4 border rounded shadow">
            <h4 className="text-lg font-semibold mb-2">
              {chartView === "monthly" ? "Monthly Revenue" : "Daily Revenue"}
            </h4>
            <div className="h-64">
              {chartView === "monthly" ? (
                <Line data={performanceData.productRevenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <Line data={performanceData.productDailyRevenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ token }) => {
  // Global data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Dashboard metrics (for overall charts)
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesMonthWise, setSalesMonthWise] = useState({});
  const [revenueMonthWise, setRevenueMonthWise] = useState({});

  // Filter states for orders
  const [filterType, setFilterType] = useState("all"); // "all", "month", "range"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Chart view state ("monthly" or "daily")
  const [chartView, setChartView] = useState("monthly");

  // Pagination for product list (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Track the currently expanded product (only one at a time)
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Helpers for display
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYearVal = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYearVal - 10; y <= currentYearVal; y++) {
    yearOptions.push(y);
  }

  // Fetch data concurrently
  const fetchDashboardData = async () => {
    try {
      const [userRes, productRes, orderRes] = await Promise.all([
        axios.get(backendUrl + "/api/user/list", { headers: { token } }),
        axios.get(backendUrl + "/api/product/list", { headers: { token } }),
        axios.post(backendUrl + "/api/order/list", {}, { headers: { token } }),
      ]);
      if (userRes.data.success) setUsers(userRes.data.users);
      else toast.error(userRes.data.message);
      if (productRes.data.success) setProducts(productRes.data.products);
      else toast.error(productRes.data.message);
      if (orderRes.data.success) setOrders(orderRes.data.orders);
      else toast.error(orderRes.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Filter orders based on filter settings
  const filterOrders = () => {
    if (filterType === "all") return orders;
    if (filterType === "month") {
      return orders.filter((order) => {
        const orderDate = new Date(order.date);
        return (
          orderDate.getMonth() === parseInt(selectedMonth) &&
          orderDate.getFullYear() === parseInt(selectedYear)
        );
      });
    }
    if (filterType === "range") {
      if (!startDate || !endDate) return orders;
      const start = new Date(startDate);
      const end = new Date(endDate);
      return orders.filter((order) => {
        const orderDate = new Date(order.date);
        return orderDate >= start && orderDate <= end;
      });
    }
    return orders;
  };

  // Compute overall dashboard metrics (monthly grouping)
  const computeOrderMetrics = () => {
    let revenue = 0;
    const salesPerMonth = {};
    const revenuePerMonth = {};
    monthNames.forEach((m) => {
      salesPerMonth[m] = 0;
      revenuePerMonth[m] = 0;
    });
    const displayedOrders = filterOrders();
    displayedOrders.forEach((order) => {
      revenue += order.amount;
      const orderDate = new Date(order.date);
      const month = monthNames[orderDate.getMonth()];
      salesPerMonth[month] += 1;
      revenuePerMonth[month] += order.amount;
    });
    setTotalRevenue(revenue);
    setSalesMonthWise(salesPerMonth);
    setRevenueMonthWise(revenuePerMonth);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    computeOrderMetrics();
  }, [orders, filterType, selectedMonth, selectedYear, startDate, endDate]);

  // Dashboard Chart Data (Monthly)
  const salesChartData = {
    labels: monthNames,
    datasets: [
      {
        label: "Monthly Sales",
        data: monthNames.map((m) => salesMonthWise[m]),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: monthNames,
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthNames.map((m) => revenueMonthWise[m]),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Dashboard Daily Chart Data
  const dailySalesData = {};
  const dailyRevenueData = {};
  filterOrders().forEach((order) => {
    const key = new Date(order.date).toISOString().split("T")[0];
    if (!dailySalesData[key]) {
      dailySalesData[key] = 0;
      dailyRevenueData[key] = 0;
    }
    dailySalesData[key] += 1;
    dailyRevenueData[key] += order.amount;
  });
  const sortedDailyKeys = Object.keys(dailySalesData).sort();
  const dailySalesChartData = {
    labels: sortedDailyKeys,
    datasets: [
      {
        label: "Daily Sales",
        data: sortedDailyKeys.map((key) => dailySalesData[key]),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
  const dailyRevenueChartData = {
    labels: sortedDailyKeys,
    datasets: [
      {
        label: "Daily Revenue",
        data: sortedDailyKeys.map((key) => dailyRevenueData[key]),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Overall Dashboard Stats
  const displayedOrders = filterOrders();
  const totalUsers = users.length;
  const bannedUsers = users.filter((user) => user.isBanned).length;
  const totalProducts = products.length;
  const totalOrders = displayedOrders.length;
  const pendingOrders = displayedOrders.filter((order) => order.status !== "Delivered").length;

  // Pagination for product list
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Toggle expanded product performance (only one at a time)
  const toggleExpanded = (productId) => {
    setExpandedProduct((prev) => (prev === productId ? null : productId));
  };

  // Compute performance details for a given product.
  // Here we check if any order item has a productId matching the product's _id,
  // or fall back on matching by product name.
  const getProductPerformance = (product) => {
    const productOrders = orders.filter((order) =>
      order.items &&
      order.items.some(
        (item) => item.productId?.toString() === product._id?.toString() || item.name === product.name
      )
    );
    let totalProductOrders = productOrders.length;
    let totalQuantity = 0;
    let totalProductRevenue = 0;
    productOrders.forEach((order) => {
      order.items.forEach((item) => {
        if ((item.productId?.toString() === product._id?.toString()) || (item.name === product.name)) {
          totalQuantity += item.quantity || 0;
          totalProductRevenue += (item.quantity || 0) * product.price;
        }
      });
    });
    // Group monthly for product performance
    const productMonthlySales = {};
    const productMonthlyRevenue = {};
    monthNames.forEach((m) => {
      productMonthlySales[m] = 0;
      productMonthlyRevenue[m] = 0;
    });
    productOrders.forEach((order) => {
      const orderDate = new Date(order.date);
      const month = monthNames[orderDate.getMonth()];
      productMonthlySales[month] += 1;
      order.items.forEach((item) => {
        if ((item.productId?.toString() === product._id?.toString()) || (item.name === product.name)) {
          productMonthlyRevenue[month] += (item.quantity || 0) * product.price;
        }
      });
    });
    const productSalesChartData = {
      labels: monthNames,
      datasets: [
        {
          label: "Monthly Sales",
          data: monthNames.map((m) => productMonthlySales[m]),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
    const productRevenueChartData = {
      labels: monthNames,
      datasets: [
        {
          label: "Monthly Revenue",
          data: monthNames.map((m) => productMonthlyRevenue[m]),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };

    // Group daily for product performance
    const productDailySales = {};
    const productDailyRevenue = {};
    productOrders.forEach((order) => {
      const key = new Date(order.date).toISOString().split("T")[0];
      if (!productDailySales[key]) {
        productDailySales[key] = 0;
        productDailyRevenue[key] = 0;
      }
      productDailySales[key] += 1;
      order.items.forEach((item) => {
        if ((item.productId?.toString() === product._id?.toString()) || (item.name === product.name)) {
          productDailyRevenue[key] += (item.quantity || 0) * product.price;
        }
      });
    });
    const sortedProductDailyKeys = Object.keys(productDailySales).sort();
    const productDailySalesChartData = {
      labels: sortedProductDailyKeys,
      datasets: [
        {
          label: "Daily Sales",
          data: sortedProductDailyKeys.map((key) => productDailySales[key]),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
    const productDailyRevenueChartData = {
      labels: sortedProductDailyKeys,
      datasets: [
        {
          label: "Daily Revenue",
          data: sortedProductDailyKeys.map((key) => productDailyRevenue[key]),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };

    return {
      totalProductOrders,
      totalQuantity,
      totalProductRevenue,
      productSalesChartData,
      productRevenueChartData,
      productDailySalesChartData,
      productDailyRevenueChartData,
    };
  };

  return (
    <div className="p-4">
      {/* Main Header with Order Filters */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="font-semibold">Order Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="all">All Time</option>
            <option value="month">Specific Month</option>
            <option value="range">Date Range</option>
          </select>
          {filterType === "month" && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2 py-1 border rounded"
              >
                {monthNames.map((month, idx) => (
                  <option key={idx} value={idx}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2 py-1 border rounded"
              >
                {yearOptions.map((year, idx) => (
                  <option key={idx} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}
          {filterType === "range" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 border rounded"
              />
            </>
          )}
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-2xl">{totalUsers}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Banned Users</h2>
          <p className="text-2xl">{bannedUsers}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-2xl">{totalProducts}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl">{totalOrders}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Pending Orders</h2>
          <p className="text-2xl">{pendingOrders}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl">
            {currency}
            {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart View Filter for Dashboard Charts */}
      <div className="flex items-center justify-end mb-4">
        <label className="font-semibold mr-2">Chart View:</label>
        <select
          value={chartView}
          onChange={(e) => setChartView(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            {chartView === "monthly" ? "Monthly Sales" : "Daily Sales"}
          </h2>
          <div className="h-64">
            {chartView === "monthly" ? (
              <Bar data={salesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Bar data={dailySalesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </div>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">
            {chartView === "monthly" ? "Monthly Revenue" : "Daily Revenue"}
          </h2>
          <div className="h-64">
            {chartView === "monthly" ? (
              <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <Line data={dailyRevenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </div>
        </div>
      </div>

      {/* Product Performance Section with Pagination */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">Product Performance</h2>
        {currentProducts.map((product) => (
          <React.Fragment key={product._id}>
            <div className="flex items-center justify-between border p-2 rounded mb-2">
              <span>{product.name}</span>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => toggleExpanded(product._id)}
              >
                {expandedProduct === product._id ? "Hide Performance" : "View Performance"}
              </button>
            </div>
            {expandedProduct === product._id && (
              <ProductPerformance
                product={product}
                performanceData={getProductPerformance(product)}
                chartView={chartView}
                currency={currency}
              />
            )}
          </React.Fragment>
        ))}
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
