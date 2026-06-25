import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { withAuthAxios } from "../../services/config";

interface Booking {
  _id: string;
  bookingId: string;
  rideOption: string;
  pickUpDate: string;
  pickUpTime: string;
  origins: string;
  destinations: string;
  carChoice: string;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
}

const BookingsPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/bookings");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await withAuthAxios().get("/bookings", {
        params: { limit: 50 },
      });
      setBookings(res.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBookings();
  }, [token, fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await withAuthAxios().put(`/bookings/${bookingId}`, {
        action: "cancel",
        cancelReason: "Cancelled by user",
      });
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const filteredBookings =
    activeFilter === "all"
      ? bookings
      : bookings.filter(
          (b) => b.bookingStatus.toLowerCase() === activeFilter
        );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "status-confirmed";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "inprogress":
        return "status-inprogress";
      default:
        return "status-pending";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "payment-paid";
      case "failed":
        return "payment-failed";
      case "refunded":
        return "payment-refunded";
      default:
        return "payment-pending";
    }
  };

  if (authLoading) {
    return (
      <div className="bookings-page">
        <div className="bookings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Bookings | DriveElite</title>
        <meta
          name="description"
          content="View and manage your DriveElite ride bookings."
        />
      </Head>

      <div className="bookings-page">
        <div className="bookings-container">
          <div className="bookings-header">
            <h1>My Bookings</h1>
            <p>View and manage your ride history</p>
          </div>

          {/* Filter tabs */}
          <div className="bookings-filters">
            {["all", "confirmed", "inprogress", "completed", "cancelled"].map(
              (filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === "all"
                    ? "All"
                    : filter === "inprogress"
                    ? "In Progress"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              )
            )}
          </div>

          {loading ? (
            <div className="bookings-loading">
              <div className="loading-spinner"></div>
              <p>Loading your bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bookings-empty">
              <div className="empty-icon">🚗</div>
              <h3>No bookings found</h3>
              <p>
                {activeFilter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${activeFilter} bookings found.`}
              </p>
              <Link href="/booking" className="book-now-btn">
                Book a Ride
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card-header">
                    <div className="booking-id">
                      <span className="id-label">Booking</span>
                      <span className="id-value">{booking.bookingId}</span>
                    </div>
                    <div className="booking-badges">
                      <span
                        className={`status-badge ${getStatusColor(
                          booking.bookingStatus
                        )}`}
                      >
                        {booking.bookingStatus}
                      </span>
                      <span
                        className={`payment-badge ${getPaymentColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="booking-card-body">
                    <div className="booking-route">
                      <div className="route-point">
                        <div className="route-dot pickup-dot"></div>
                        <div className="route-info">
                          <span className="route-label">Pickup</span>
                          <span className="route-value">
                            {booking.origins || "—"}
                          </span>
                        </div>
                      </div>
                      {booking.destinations && (
                        <div className="route-point">
                          <div className="route-dot dropoff-dot"></div>
                          <div className="route-info">
                            <span className="route-label">Drop-off</span>
                            <span className="route-value">
                              {booking.destinations}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Date & Time</span>
                        <span className="detail-value">
                          {booking.pickUpDate} • {booking.pickUpTime}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ride Type</span>
                        <span className="detail-value">
                          {booking.rideOption}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Vehicle</span>
                        <span className="detail-value">
                          {booking.carChoice || "—"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value amount">
                          ₹{(booking.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-card-footer">
                    <span className="booking-date">
                      Booked on{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="booking-actions">
                      {booking.bookingStatus === "Confirmed" && (
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingsPage;
