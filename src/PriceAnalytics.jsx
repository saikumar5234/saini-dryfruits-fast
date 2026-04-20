import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from './config.js';
import { formatDisplayDate, formatDisplayDateTime, formatChartDate } from './utils/dateFormat';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Alert,
  Button,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Timeline,
  ShowChart,
  Analytics,
  ArrowBack,
  Refresh
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PriceAnalytics = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { productId } = useParams();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) fetchPriceHistory(selectedProduct.id);
    // eslint-disable-next-line
  }, [selectedProduct, timeRange]);

  useEffect(() => {
    // If productId is present, auto-select that product
    if (productId && products.length > 0) {
      const found = products.find(p => String(p.id) === String(productId));
      if (found && (!selectedProduct || selectedProduct.id !== found.id)) {
        setSelectedProduct(found);
      }
    }
  }, [productId, products]);

  // Auto-refresh when component mounts to ensure latest data
  useEffect(() => {
    const autoRefresh = async () => {
      if (selectedProduct) {
        await fetchPriceHistory(selectedProduct.id);
      }
    };
    autoRefresh();
  }, [selectedProduct]);

  // Refresh data when window gains focus (user returns from table view)
  useEffect(() => {
    const handleFocus = async () => {
      if (selectedProduct && !loadingHistory) {
        await fetchPriceHistory(selectedProduct.id);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedProduct, loadingHistory]);

  const fetchProducts = async () => {
    try {
      // Add cache busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?_t=${timestamp}`);
      const data = await res.json();
      setProducts(data);
      // If productId is present, select that product, else default
      if (productId) {
        const found = data.find(p => String(p.id) === String(productId));
        if (found) setSelectedProduct(found);
      } else if (!selectedProduct && data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchPriceHistory = async (productId) => {
    setLoadingHistory(true);
    try {
      // Add cache busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_ENDPOINTS.PRODUCT_PRICE_HISTORY(productId)}?_t=${timestamp}`);
      let history = await res.json();
      history = history.map(h => ({
        ...h,
        date: h.changedAt ? h.changedAt.split('T')[0] : '',
        price: h.price
      }));
      setPriceHistory(history);
    } catch (error) {
      setPriceHistory([]);
    }
    setLoadingHistory(false);
  };

  // Add refresh function to manually refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh both products and price history
      await fetchProducts();
      if (selectedProduct) {
        await fetchPriceHistory(selectedProduct.id);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  };

  const calculatePriceChange = () => {
    if (priceHistory.length < 2) return { change: 0, percentage: 0, trend: 'neutral' };
    const current = priceHistory[priceHistory.length - 1].price;
    const prev = priceHistory[priceHistory.length - 2].price;
    const change = current - prev;
    const percentage = prev > 0 ? (change / prev) * 100 : 0;
    return {
      change: Math.round(change * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const calculateStats = () => {
    if (priceHistory.length === 0) return {};
    const prices = priceHistory.map(h => h.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return {
      maxPrice: Math.round(maxPrice * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      avgPrice: Math.round(avgPrice * 100) / 100
    };
  };

  const priceChange = calculatePriceChange();
  const stats = calculateStats();

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <Remove color="disabled" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'success.main';
      case 'down': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const rangeOptions = [
    { label: '1D', value: 1 },
    { label: '1W', value: 7 },
    { label: '1M', value: 30 },
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
    { label: '2Y', value: 730 },
  ];

  // Export chart as image or PDF
  const handleExport = async (type = 'image') => {
    const chartNode = document.getElementById('price-chart-container');
    if (!chartNode) return;
    const canvas = await html2canvas(chartNode, { backgroundColor: null, scale: 2 });
    if (type === 'image') {
      const link = document.createElement('a');
      link.download = `price_chart_${selectedProduct?.id || 'product'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (type === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      pdf.save(`price_chart_${selectedProduct?.id || 'product'}.pdf`);
    }
  };

  // Modern, glassy tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0]?.payload;
      const tooltipLabel = point?.label ?? '';
      return (
        <Box sx={{
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 4px 24px 0 rgba(46,125,50,0.10)',
          borderRadius: 3,
          px: 2.5,
          py: 1.5,
          minWidth: 120,
          border: '1px solid #e0e0e0',
          backdropFilter: 'blur(4px)',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32', mb: 0.5 }}>{tooltipLabel}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>₹{payload[0].value}</Typography>
        </Box>
      );
    }
    return null;
  };

  // Helper to get all dates in range
  const getDateRange = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Build chart data respecting selected time range.
  // - Shows a continuous line from the first known price up to today.
  // - Fills days with no changes using the last known price.
  // - Still shows multiple price changes within the same day as steps.
  const buildContinuousChartData = () => {
    if (!priceHistory.length) {
      // If no price history, show a straight line for the selected time range at the current price
      if (selectedProduct) {
        const days = parseInt(timeRange) || 30;
        const dateRange = getDateRange(days);
        return dateRange.map((date, idx) => ({
          x: `${date}-${idx}`,
          label: formatChartDate(date),
          price: selectedProduct.price
        }));
      }
      return [];
    }
    // Ensure history is sorted by date ascending
    const sorted = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

    const days = parseInt(timeRange);
    const today = new Date();

    // Start date is today - (days - 1), so 1W shows 7 days back,
    // even if the product / price history started later.
    let startDate = new Date(today);
    if (!Number.isNaN(days) && days > 0) {
      startDate.setDate(today.getDate() - (days - 1));
    }

    // Build list of dates from startDate to today
    const dateStrings = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      dateStrings.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Group history entries by date string
    const byDate = {};
    sorted.forEach(entry => {
      if (!entry.date) return;
      if (!byDate[entry.date]) byDate[entry.date] = [];
      byDate[entry.date].push(entry);
    });

    // Determine last price before or at startDate.
    // If there is no history before startDate, we use the first known price
    // as the baseline for earlier days.
    let lastPrice = sorted[0].price;
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].date);
      if (d <= startDate) {
        lastPrice = sorted[i].price;
      } else {
        break;
      }
    }

    const points = [];

    dateStrings.forEach(dateStr => {
      const dayEntries = byDate[dateStr] || [];
      const label = formatChartDate(dateStr);

      // Baseline point for the day (even if there is no change)
      points.push({
        x: `${dateStr}-base`,
        label,
        price: lastPrice,
      });

      // Additional points for each change within the day to show steps
      dayEntries.forEach((entry, idx) => {
        lastPrice = entry.price;
        points.push({
          x: `${dateStr}-chg-${idx}`,
          label,
          price: lastPrice,
        });
      });
    });

    return points;
  };

  // Build history rows from the earliest recorded change (e.g. creation) through today,
  // still respecting the chart range by not starting later than needed. In-between days
  // carry the last price; same-day updates are separate rows (step deltas, not one jump).
  const buildDailyHistoryData = () => {
    if (!selectedProduct) return [];

    const days = parseInt(timeRange) || 30;
    const today = new Date();
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - (days - 1));

    if (!priceHistory.length) {
      const dateStrings = [];
      const cursor = new Date(rangeStart);
      while (cursor <= today) {
        dateStrings.push(cursor.toISOString().split('T')[0]);
        cursor.setDate(cursor.getDate() + 1);
      }
      return dateStrings.map(date => ({ date, price: selectedProduct.price }));
    }

    const sorted = [...priceHistory]
      .filter(entry => entry.date)
      .sort((a, b) => new Date(a.changedAt || a.date) - new Date(b.changedAt || b.date));

    const firstHistoryDate = new Date(sorted[0].changedAt || sorted[0].date);
    const startDate = firstHistoryDate < rangeStart ? firstHistoryDate : rangeStart;

    const dateStrings = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      dateStrings.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    const byDate = {};
    sorted.forEach(entry => {
      if (!byDate[entry.date]) byDate[entry.date] = [];
      byDate[entry.date].push(entry);
    });

    let lastPrice = sorted[0]?.price ?? selectedProduct.price;
    for (let i = 0; i < sorted.length; i++) {
      const entryDate = new Date(sorted[i].date);
      if (entryDate <= startDate) {
        lastPrice = sorted[i].price;
      } else {
        break;
      }
    }

    const rows = [];
    dateStrings.forEach(date => {
      const dayEntries = (byDate[date] || []).sort(
        (a, b) => new Date(a.changedAt || a.date) - new Date(b.changedAt || b.date)
      );

      if (dayEntries.length === 0) {
        rows.push({ date, price: lastPrice });
        return;
      }

      // No same-day baseline row: each update compares to the previous row (true step change).
      dayEntries.forEach(entry => {
        lastPrice = entry.price;
        rows.push({
          date,
          price: lastPrice,
          changedAt: entry.changedAt,
          id: entry.id
        });
      });
    });

    return rows;
  };

  const historyRows = buildDailyHistoryData();

  return (
    <Fade in timeout={600}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pt: { xs: '0px', md: '40px' } }}>
        <Box sx={{ py: 2, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          {/* Header with Back Button and Refresh Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 6, position: 'relative' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 'bold',
                position: 'absolute',
                left: 0,
                top: -20,
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main'
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                borderColor: 'success.main',
                color: 'success.main',
                fontWeight: 'bold',
                position: 'absolute',
                right: 0,
                top: -20,
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'success.main',
                  color: 'white',
                  borderColor: 'success.main'
                }
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' }
                }}
              >
                Market Analytics
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  maxWidth: 800,
                  mx: 'auto',
                  mb: 4
                }}
              >
                Analyze product price trends and history.
              </Typography>
            </Box>
          </Box>

          {/* Product Selector */}
          {!productId && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid span={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setSelectedProduct(product);
                      }}
                      label="Select Product"
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {typeof product.name === 'object' ? product.name.en : product.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          )}

          {selectedProduct && (
            <>
              {/* Price Overview Card */}
              <Card sx={{ mb: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid span={6}>
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {typeof selectedProduct.name === 'object' ? selectedProduct.name.en : selectedProduct.name}
                      </Typography>
                      <Typography variant="h2" sx={{
                        fontWeight: 'bold',
                        color: getTrendColor(priceChange.trend),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        ₹{priceHistory[priceHistory.length - 1]?.price || selectedProduct.price}
                        {getTrendIcon(priceChange.trend)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Chip
                          label={`${priceChange.trend === 'up' ? '+' : ''}₹${priceChange.change}`}
                          color={priceChange.trend === 'up' ? 'success' : priceChange.trend === 'down' ? 'error' : 'default'}
                          variant="outlined"
                        />
                        <Chip
                          label={`${priceChange.trend === 'up' ? '+' : ''}${priceChange.percentage}%`}
                          color={priceChange.trend === 'up' ? 'success' : priceChange.trend === 'down' ? 'error' : 'default'}
                        />
                      </Box>
                    </Grid>
                    <Grid span={6}>
                      <Grid container spacing={2}>
                        <Grid span={6}>
                          <Card sx={{ bgcolor: '#e8f5e8' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                                ₹{stats.maxPrice}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Highest Price
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={6}>
                          <Card sx={{ bgcolor: '#ffebee' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                                ₹{stats.minPrice}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Lowest Price
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={6}>
                          <Card sx={{ bgcolor: '#e3f2fd' }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                ₹{stats.avgPrice}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Average Price
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4, width: '100%' }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  indicatorColor="primary"
                  textColor="primary"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'white',
                    width: '100%'
                  }}
                >
                  <Tab
                    label="Price Chart"
                    icon={<ShowChart />}
                    sx={{
                      py: 2,
                      px: 3,
                      fontWeight: 'bold'
                    }}
                  />
                  <Tab
                    label="Price History"
                    icon={<Timeline />}
                    sx={{
                      py: 2,
                      px: 3,
                      fontWeight: 'bold'
                    }}
                  />
                  <Tab
                    label="Analytics"
                    icon={<Analytics />}
                    sx={{
                      py: 2,
                      px: 3,
                      fontWeight: 'bold'
                    }}
                  />
                </Tabs>
                <Box sx={{ p: 4, backgroundColor: 'white', width: '100%' }}>
                  {tabValue === 0 && (
                    <Box>
                      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        Price Movement Chart
                        {loadingHistory && (
                          <CircularProgress size={20} sx={{ ml: 2, color: 'primary.main' }} />
                        )}
                      </Typography>
                      {/* Range Selector Buttons (moved here) */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {rangeOptions.map(opt => (
                          <Button
                            type="button"
                            key={opt.value}
                            variant={timeRange === String(opt.value) ? 'contained' : 'outlined'}
                            size="small"
                            sx={{ minWidth: 48, fontWeight: 'bold', borderRadius: 2 }}
                            onClick={() => setTimeRange(String(opt.value))}
                          >
                            {opt.label}
                          </Button>
                        ))}

                      </Box>
                      <Card sx={{ mb: 4 }}>
                        <CardContent>
                          <div id="price-chart-container">
                            <ResponsiveContainer width="100%" height={340}>
                              {(() => {
                                const chartData = buildContinuousChartData();
                                let color = '#2E7D32'; // green by default
                                if (chartData.length > 1) {
                                  const prev = chartData[chartData.length - 2].price;
                                  const curr = chartData[chartData.length - 1].price;
                                  if (curr < prev) color = '#D32F2F'; // red
                                }
                                return (
                                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="colorPriceDynamic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.45}/>
                                        <stop offset="100%" stopColor={color} stopOpacity={0.10}/>
                                      </linearGradient>
                                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor={color} floodOpacity="0.10" />
                                      </filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                      dataKey="x"
                                      tickFormatter={(_, idx) => chartData[idx]?.label || ''}
                                      tick={{ fontSize: 14, fill: '#888' }}
                                      axisLine={false}
                                      tickLine={false}
                                      minTickGap={10}
                                    />
                                    <YAxis
                                      domain={['dataMin - 10', 'dataMax + 10']}
                                      tick={{ fontSize: 14, fill: '#888' }}
                                      tickFormatter={(value) => `₹${value}`}
                                      axisLine={false}
                                      tickLine={false}
                                      width={60}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(46,125,50,0.07)' }} />
                                    <Area
                                      type="monotone"
                                      dataKey="price"
                                      stroke={color}
                                      strokeWidth={4}
                                      fill="url(#colorPriceDynamic)"
                                      dot={false}
                                      isAnimationActive={true}
                                      animationDuration={1200}
                                      filter="url(#shadow)"
                                    />
                                    <Brush
                                      dataKey="x"
                                      height={24}
                                      stroke={color}
                                      travellerWidth={12}
                                      fill="#e8f5e9"
                                      tickFormatter={(_, idx) => chartData[idx]?.label || ''}
                                    />
                                  </AreaChart>
                                );
                              })()}
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                  {tabValue === 1 && (
                    <TableContainer sx={{ maxHeight: 480, overflow: 'auto' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Price (₹)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Change</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trend</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...historyRows].reverse().map((record, index, reversedArray) => {
                            const prevRecord = reversedArray[index + 1];
                            const change = prevRecord ? record.price - prevRecord.price : 0;
                            const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
                            return (
                              <TableRow key={record.id != null ? String(record.id) : `${record.date}-${record.changedAt ?? index}`} hover>
                                <TableCell>
                                  {record.changedAt ? formatDisplayDateTime(record.changedAt) : formatDisplayDate(record.date)}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>₹{record.price}</TableCell>
                                <TableCell sx={{
                                  color: getTrendColor(trend),
                                  fontWeight: 'bold'
                                }}>
                                  {change > 0 ? '+' : ''}₹{Math.round(change * 100) / 100}
                                </TableCell>
                                <TableCell>
                                  {getTrendIcon(trend)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                        Analytics Insights
                      </Typography>
                      <Grid container spacing={3} sx={{ width: '100%' }}>
                        <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                          <Card sx={{ height: '100%', bgcolor: '#e8f5e8', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto'  }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="h4" color="#2e7d32" sx={{ fontWeight: 'bold', mb: 1 }}>
                                ₹{stats.maxPrice}
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Highest Price
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Peak value in selected period
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                          <Card sx={{ height: '100%', bgcolor: '#ffe8e8', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto'  }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="h4" color="#d32f2f" sx={{ fontWeight: 'bold', mb: 1 }}>
                                ₹{stats.minPrice}
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Lowest Price
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Minimum value in selected period
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                          <Card sx={{ height: '100%', bgcolor: '#e3f2fd', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="h4" color="#2e7d32" sx={{ fontWeight: 'bold', mb: 1 }}>
                                ₹{stats.avgPrice}
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Average Price
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Mean price over selected period
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={12} sm={6} md={6} lg={6} sx={{ width: '100%' }}>
                          <Card sx={{ height: '100%', bgcolor: '#e3f2fd', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="h4" color="#2e7d32" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {stats.avgPrice && stats.maxPrice && stats.minPrice ? Math.round(((stats.maxPrice - stats.minPrice) / stats.avgPrice) * 100) : 0}%
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Price Volatility
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Price fluctuation range percentage
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={12} sm={6} md={6} lg={6} sx={{ width: '100%' }}>
                          <Card sx={{ height: '100%', bgcolor: '#e8f5e8', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto' }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
                                {getTrendIcon(priceChange.trend)}
                                <Typography variant="h4" sx={{
                                  color: getTrendColor(priceChange.trend),
                                  fontWeight: 'bold'
                                }}>
                                  {priceChange.trend === 'up' ? 'Bullish' : priceChange.trend === 'down' ? 'Bearish' : 'Neutral'}
                                </Typography>
                              </Box>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                Market Trend
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Current market sentiment and direction
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid span={12} sx={{ width: '100%' }}>
                          <Card sx={{ boxShadow: 3, borderRadius: 3, width: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                                Price Performance Summary
                              </Typography>
                              <Grid container spacing={3} sx={{ width: '100%' }}>
                                <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#e8f5e8', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto'  }}>
                                    <Typography variant="h6" color="#2e7d32" sx={{ fontWeight: 'bold', mb: 1 }}>
                                      Current Price
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: getTrendColor(priceChange.trend) }}>
                                      ₹{priceHistory[priceHistory.length - 1]?.price || selectedProduct.price}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#ffe8e8', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto'  }}>
                                    <Typography variant="h6" color="#d32f2f" sx={{ fontWeight: 'bold', mb: 1 }}>
                                      Price Change
                                    </Typography>
                                    <Typography variant="h4" sx={{
                                      fontWeight: 'bold',
                                      color: getTrendColor(priceChange.trend)
                                    }}>
                                      {priceChange.trend === 'up' ? '+' : ''}₹{priceChange.change}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      ({priceChange.trend === 'up' ? '+' : ''}{priceChange.percentage}%)
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid span={12} sm={6} md={4} lg={4} sx={{ width: '100%' }}>
                                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#e3f2fd', boxShadow: 3, borderRadius: 3, width: '100%', maxWidth: '90%', mx: 'auto'  }}>
                                    <Typography variant="h6" color="#2e7d32" sx={{ fontWeight: 'bold', mb: 1 }}>
                                      Price Range
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                      ₹{stats.minPrice} - ₹{stats.maxPrice}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Min to Max in period
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Paper>
            </>
          )}
          {!selectedProduct && (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              Select a product to view analytics.
            </Alert>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default PriceAnalytics; 