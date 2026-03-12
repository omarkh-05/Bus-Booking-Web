import {apiFetch} from "../Auth/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('bookingId');

const tickets = await FetchTicketsForBooking(bookingId);
if(!tickets) return;

 const ticketsContainer = document.querySelector(".Layout");
    if(!ticketsContainer) return;


 for (const ticket of tickets) {
    document.getElementById("loading_Section").style.display = "none";
    const card = CreateTicketCard(ticket);
    ticketsContainer.appendChild(card);
    }
});

function CreateTicketCard(ticket) {
    const card = document.createElement("div");
    card.className = "ticket-card";

    const qrUrl = "https://quickchart.io/qr?text=" + encodeURIComponent(ticket.QRCode); // بنستخدم الانكود عشان احنا بنبعت في url فبدناش مشاكل في الفهم وفي السبيس والسبيشل كاريكتر فبنستخدم انكود

    card.innerHTML = `
        <div class="ticket-header">
            <span>Passenger: <b>${ticket.passengerName}</b></span>
            <span>Type: <b>${ticket.personType}</b></span>
        </div>

        <div class="ticket-info-grid">
            <div class="info-item">
                <b>Gender</b>
                <span>${ticket.passengerGender}</span>
            </div>
            <div class="info-item">
                <b>National ID</b>
                <span>${ticket.nationalID}</span>
            </div>
            <div class="info-item">
                <b>Seat Number</b>
                <span>${ticket.seatNumber}</span>
            </div>
            <div class="info-item">
                <b>Issue Date</b>
                <span>${new Date(ticket.issueDate).toLocaleDateString()}</span>
            </div>
            <div class="info-item">
                <b>Ticket ID</b>
                <span>${ticket.ticketID}</span>
            </div>
            <div class="info-item">
                <b>QR Code</b>
                <span><img src="${qrUrl}" alt="QR Code" width="150px" height="150px"/></span>
            </div>
        </div>
    `;

    return card;
}

// ============ Api Fetch Helpers ============
async function FetchTicketsForBooking(bookingId)
{
    try {
        const response = await apiFetch(`BusBookingRest/GetTicketsForBooking/${bookingId}`,{
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
