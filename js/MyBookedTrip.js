import { apiFetch } from "../Auth/auth.js";


document.addEventListener("DOMContentLoaded", async () => {
    const bookings = await FetchBookingsForCustomer();
    if(!bookings || bookings.length === 0) {
    document.getElementById("loading_Section").textContent = "No bookings found.";
    return;
}
    const bookingsContainer = document.querySelector(".Layout");
    if(!bookingsContainer) return;

   for (const booking of bookings) {
    document.getElementById("loading_Section").style.display = "none";
    const card = CreateBookingCard(booking);
    bookingsContainer.appendChild(card);

    card.querySelectorAll('.tickets-button').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.trip-card');// الكلوزيت بتجيب العنصر نفسه الماتش بس بتعطي ترو او فولز
        //  const bookingId = this.closest('.trip-card').dataset.bookingid;
        const bookingId = card.dataset.bookingid;
        window.location.href = `tickets.html?bookingId=${bookingId}`;
    });
    });
    }

    
});

function CreateBookingCard(booking) {
    const card = document.createElement("div");
    card.className = "trip-card";
    card.dataset.bookingid = booking.bookingID;

     let statusClass = "";
    switch (booking.status) {
        case "Done":
            statusClass = "trip-status done";
            break;
        case "Soon":
            statusClass = "trip-status soon";
            break;
            case "On Going":
            statusClass = "trip-status onGoing";
            break;
        case "Stopped":
            statusClass = "trip-status stopped";
            break;
        default:
            statusClass = "trip-status done";
            break;
    }

    card.innerHTML = `
        <div class="info-section">
            <div class="trip-header">
                <span>${booking.tripName}</span>
                <span class="${statusClass}">Status: <span>${booking.status}</span></span>
            </div>

            <div class="booking-grid">
                <div class="info-item">
                    <b>Travel Date</b>
                    <span>${booking.travelDate}</span>
                </div>
                <div class="info-item">
                    <b>Class</b>
                    <span>${booking.class}</span>
                </div>
                <div class="info-item">
                    <b>Passengers</b>
                    <span>${booking.passengerCount}</span>
                </div>
                <div class="info-item">
                    <b>Phone Number</b>
                    <span>${booking.phoneNumber}</span>
                </div>
                <div class="info-item">
                    <b>Travel Type</b>
                    <span>${booking.travelType}</span>
                </div>
                <div class="info-item">
                    <b>Payment</b>
                    <span>${booking.paymentStatus ? "Paid" : "Unpaid"}</span>
                </div>
                <div class="info-item">
                    <b>Total Amount</b>
                    <span>$${booking.totalAmount}</span>
                </div>
            </div>
        </div>

        <div class="action-section">
            <button class="tickets-button">Tickets Info</button>
        </div>
    `;
    
    let tcktsbtn = card.querySelector("button.tickets-button");
if(booking.status === "Done") tcktsbtn.disabled = false;

    return card;
}

// ============ Api Fetch Helpers ============
async function FetchBookingsForCustomer()
{
    try {
        const response = await apiFetch(`BusBookingRest/GetAllBooksForCustomer`,{
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if(!response.ok)
        {
            console.error(response.statusText);
            return null;
        }
        return await response.json();
    
    } catch (error) {
        console.log(error.message);
        return null;
    }
}