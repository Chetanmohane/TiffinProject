export const db = {
  pausedMeals: [
    { id: 1, customerName: "Rahul Sharma", phone: "9876543210", planName: "Monthly Veg", pauseFrom: "2026-01-20", pauseTo: "2026-01-25", reason: "Out of station" },
    { id: 2, pauseFrom: "2026-02-01", pauseTo: "2026-02-05", reason: "Vacation", customerName: "Chetan Mohane", phone: "9123456789", planName: "Premium Monthly Thali" }
  ],
  customers: [
    {
      id: "CUST-001",
      name: "Chetan",
      phone: "9123456789",
      email: "chetan@example.com",
      password: "password123",
      role: "customer",
      address: "123 Main Street, Pune",
      walletBalance: 450,
      subscription: {
        planName: "Premium Monthly Thali",
        status: "Active",
        startDate: "01 Jan 2026",
        nextRenewal: "25 Jan 2026",
        mealsLeft: 14,
        totalMeals: 30
      }
    },
    {
      id: "ADMIN-001",
      name: "Admin Chetan",
      phone: "0000000000",
      email: "chetanmohane27@gmail.com",
      password: "admin123",
      role: "admin",
      address: "Main Office",
      walletBalance: 0
    }
  ],
  menu: [
    { day: "Monday", lunch: "4 Roti, Paneer Butter Masala, Dal Fry, Jeera Rice, Fresh Salad", dinner: "3 Roti, Mix Veg, Yellow Dal, Plain Rice, Sweet" },
    { day: "Tuesday", lunch: "4 Roti, Rajma Masala, Raita, Pulao, Salad", dinner: "3 Roti, Palak Paneer, Dal Makhani, Jeera Rice" },
    { day: "Wednesday", lunch: "4 Roti, Bhindi Masala, Dal Tadka, Steam Rice", dinner: "3 Roti, Chana Masala, Aloo Gobi, Rice" },
    { day: "Thursday", lunch: "4 Roti, Kadhai Paneer, Black Dal, Rice, Salad", dinner: "3 Roti, Mutter Paneer, Yellow Dal, Rice" },
    { day: "Friday", lunch: "4 Roti, Chole, Bhature/Rice, Salad, Raita", dinner: "3 Roti, Dum Aloo, Dal Fry, Steam Rice" },
    { day: "Saturday", lunch: "Special Thali: Puri, Shahi Paneer, Dal Makhani, Pulao, Gulab Jamun", dinner: "3 Roti, Malai Kofta, Mix Dal, Rice" },
  ],
  payments: [
    { id: "TXN101", customerId: "CUST-001", customerName: "Chetan Mohane", date: "25 Jan 2026", desc: "Daily Meal - Lunch", type: "Debit", amt: "-₹120", status: "Success" },
    { id: "TXN102", customerId: "CUST-001", customerName: "Chetan Mohane", date: "20 Jan 2026", desc: "Wallet Recharge - UPI", type: "Credit", amt: "+₹2000", status: "Success" }
  ],
  deliveries: [
    { id: "DEL-1", customerId: "CUST-001", customerName: "Chetan Mohane", targetTime: "01:00 PM", status: "Out for Delivery", type: "Lunch" }
  ],
  plans: [
    { id: 1, name: "Premium Monthly Thali", price: 3500, duration: 30, mealsPerDay: 2, visible: true },
    { id: 2, name: "Basic Weekly Veg", price: 800, duration: 7, mealsPerDay: 1, visible: true },
    { id: 3, name: "Budget Daily Lunch", price: 100, duration: 1, mealsPerDay: 1, visible: true },
  ]
};
