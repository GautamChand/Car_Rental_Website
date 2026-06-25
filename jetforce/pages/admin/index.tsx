import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface Booking {
  _id: string;
  name: string;
  email: string;
  bookingId: string;
  rideOption: string;
  pickUpDate: string;
  pickUpTime: string;
  origins: string;
  destinations: string;
  numberPassengers: number;
  paymentStatus: string;
  carChoice: string;
  amount: number;
  phoneNumber: string;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  type: string;
  price_per_km: number;
  price_per_hour: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const router = useRouter();
  const { user, token, isAdmin, isAuthenticated, isLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"bookings" | "vehicles" | "users">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Vehicle modal state
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
    type: "",
    price_per_km: "",
    price_per_hour: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Fetch data
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [token]);

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token && isAdmin) {
      setLoading(true);
      Promise.all([fetchBookings(), fetchVehicles(), fetchUsers()]).finally(() =>
        setLoading(false)
      );
    }
  }, [token, isAdmin, fetchBookings, fetchVehicles, fetchUsers]);

  // Filter bookings by search
  const filteredBookings = bookings.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.rideOption?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (b) => b.paymentStatus === "Completed"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.paymentStatus === "Pending"
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "Completed")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await axios.put(
        "/api/admin/bookings",
        { bookingId, paymentStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      setStatusMessage({ type: "success", text: `Booking marked as ${status}` });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating booking:", error);
      setStatusMessage({ type: "error", text: "Failed to update booking" });
    }
  };

  // Delete booking
  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
        data: { bookingId },
      });
      fetchBookings();
      setStatusMessage({ type: "success", text: "Booking deleted" });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting booking:", error);
      setStatusMessage({ type: "error", text: "Failed to delete booking" });
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await axios.put(
        "/api/admin/users",
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      setStatusMessage({ type: "success", text: `User role updated to ${newRole}` });
      setTimeout(() => setStatusMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating user role:", error);
      setStatusMessage({ type: "error", text: "Failed to update user role" });
    }
  };

  // Vehicle CRUD
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({ type: "", price_per_km: "", price_per_hour: "" });
    setShowVehicleModal(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      type: vehicle.type,
      price_per_km: String(vehicle.price_per_km),
      price_per_hour: String(vehicle.price_per_hour),
    });
    setShowVehicleModal(true);
  };

  const handleVehicleSubmit = async () => {
    const { type, price_per_km, price_per_hour } = vehicleForm;
    if (!type || !price_per_km || !price_per_hour) {
      setStatusMessage({ type: "error", text: "All vehicle fields are required" });
      return;
    }

    try {
      if (editingVehicle) {
        await axios.put(
          "/api/admin/vehicles",
          {
            vehicleId: editingVehicle._id,
            type,
            price_per_km: Number(price_per_km),
            price_per_hour: Number(price_per_hour),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "/api/admin/vehicles",
          {
            type,
            price_per_km: Number(price_per_km),
            price_per_hour: Number(price_per_hour),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowVehicleModal(false);
      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete("/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
        data: { vehicleId },
      });
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading || (!isAuthenticated && !isAdmin)) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | DriveElite</title>
        <meta name="description" content="DriveElite Admin Dashboard — Manage bookings and vehicles" />
      </Head>

      <div className="admin-page">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h1>DRIVEELITE ADMIN</h1>
            <p>Dashboard & Management</p>
          </div>
          <div className="admin-header-right">
            <span>Welcome, {user?.name}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat-card gold">
              <div className="stat-label">Total Bookings</div>
              <div className="stat-value">{totalBookings}</div>
            </div>
            <div className="admin-stat-card green">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedBookings}</div>
            </div>
            <div className="admin-stat-card orange">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{pendingBookings}</div>
            </div>
            <div className="admin-stat-card blue">
              <div className="stat-label">Revenue</div>
              <div className="stat-value">
                ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => { setActiveTab("bookings"); setCurrentPage(1); }}
            >
              📋 Bookings
            </button>
            <button
              className={`admin-tab ${activeTab === "vehicles" ? "active" : ""}`}
              onClick={() => setActiveTab("vehicles")}
            >
              🚗 Vehicles
            </button>
            <button
              className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Users ({users.length})
            </button>
          </div>

          {/* Status Message */}
          {statusMessage.text && (
            <div className={`admin-status-message ${statusMessage.type}`}>
              {statusMessage.text}
              <button onClick={() => setStatusMessage({ type: "", text: "" })}>✕</button>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3>All Bookings ({filteredBookings.length})</h3>
                <input
                  type="text"
                  className="admin-search"
                  placeholder="Search by name, email, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {loading ? (
                <div className="admin-loading">Loading bookings...</div>
              ) : paginatedBookings.length === 0 ? (
                <div className="admin-empty">
                  <p>No bookings found</p>
                </div>
              ) : (
                <>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Ride</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Date</th>
                          <th>Car</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((booking) => (
                          <tr key={booking._id}>
                            <td style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                              {booking.bookingId?.substring(0, 8)}...
                            </td>
                            <td>
                              <div>{booking.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
                                {booking.email}
                              </div>
                            </td>
                            <td>{booking.rideOption}</td>
                            <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {booking.origins}
                            </td>
                            <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {booking.destinations || "—"}
                            </td>
                            <td>
                              {booking.pickUpDate}
                              <br />
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                                {booking.pickUpTime}
                              </span>
                            </td>
                            <td>{booking.carChoice || "—"}</td>
                            <td>₹{(booking.amount || 0).toFixed(2)}</td>
                            <td>
                              <span
                                className={`status-badge ${booking.paymentStatus?.toLowerCase()}`}
                              >
                                {booking.paymentStatus}
                              </span>
                            </td>
                            <td>
                              {booking.paymentStatus === "Pending" && (
                                <button
                                  className="admin-action-btn edit"
                                  onClick={() =>
                                    updateBookingStatus(booking._id, "Completed")
                                  }
                                >
                                  ✓ Complete
                                </button>
                              )}
                              <button
                                className="admin-action-btn delete"
                                onClick={() => deleteBooking(booking._id)}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="admin-pagination">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            className={currentPage === page ? "active" : ""}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "vehicles" && (
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3>Vehicles ({vehicles.length})</h3>
                <button className="admin-add-btn" onClick={openAddVehicle}>
                  + Add Vehicle
                </button>
              </div>

              {loading ? (
                <div className="admin-loading">Loading vehicles...</div>
              ) : vehicles.length === 0 ? (
                <div className="admin-empty">
                  <p>No vehicles found</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Vehicle Type</th>
                        <th>Price per KM</th>
                        <th>Price per Hour</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle._id}>
                          <td style={{ fontWeight: 600 }}>{vehicle.type}</td>
                          <td>₹{vehicle.price_per_km}</td>
                          <td>₹{vehicle.price_per_hour}</td>
                          <td>
                            <button
                              className="admin-action-btn edit"
                              onClick={() => openEditVehicle(vehicle)}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-action-btn delete"
                              onClick={() => deleteVehicle(vehicle._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3>Registered Users ({users.length})</h3>
              </div>

              {loading ? (
                <div className="admin-loading">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="admin-empty">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || "—"}</td>
                          <td>
                            <span
                              className={`status-badge ${u.role === "admin" ? "completed" : "pending"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.8rem" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {u._id !== user?._id && (
                              <button
                                className={`admin-action-btn ${u.role === "admin" ? "delete" : "edit"}`}
                                onClick={() =>
                                  updateUserRole(u._id, u.role === "admin" ? "user" : "admin")
                                }
                              >
                                {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                              </button>
                            )}
                            {u._id === user?._id && (
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                                (You)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Modal */}
        {showVehicleModal && (
          <div
            className="admin-modal-overlay"
            onClick={() => setShowVehicleModal(false)}
          >
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>

              <input
                type="text"
                className="admin-modal-input"
                placeholder="Vehicle Type (e.g., SUV, Sedan)"
                value={vehicleForm.type}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, type: e.target.value })
                }
              />
              <input
                type="number"
                className="admin-modal-input"
                placeholder="Price per KM"
                value={vehicleForm.price_per_km}
                onChange={(e) =>
                  setVehicleForm({ ...vehicleForm, price_per_km: e.target.value })
                }
              />
              <input
                type="number"
                className="admin-modal-input"
                placeholder="Price per Hour"
                value={vehicleForm.price_per_hour}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    price_per_hour: e.target.value,
                  })
                }
              />

              <div className="admin-modal-actions">
                <button
                  className="admin-modal-cancel"
                  onClick={() => setShowVehicleModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="admin-modal-submit"
                  onClick={handleVehicleSubmit}
                >
                  {editingVehicle ? "Update" : "Add Vehicle"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Hide main site header/footer on admin page
AdminDashboard.noHeader = true;
AdminDashboard.noFooter = true;

export default AdminDashboard;
