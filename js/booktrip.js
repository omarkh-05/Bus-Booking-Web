import { UrlBase , apiFetch , checkAuth } from "../Auth/auth.js";

/*const accesstoken = sessionStorage.getItem("accessToken");
if(accesstoken) {
   await checkAuth(); // إذا مسجل دخول يظهر الاسم بدل MyAccount
}*/

let _passengerCount = 0;
let _passengerTypes = [];
let _selectedSeats = [];
let _totalAmount = 0;
let _tripName = "";
let _tripClass = "";
const BookingState = {
  booking: {
    travelDate: null,
    class: "",
    adultCount: 0,
    childCount: 0,
    disabledCount: 0,
    phoneNumber: "",
    status: "",
    travelType: "",
    paymentStatus: false,
    totalAmount: _totalAmount,
    tripID: null
  },

  tickets: [],

  payments: {
    amount: 0,
    paymentMethod: "",
    transactionDate: null,
    isRefunded: false
  },
};
document.addEventListener("DOMContentLoaded", async function () {
  const nextBtns = document.querySelectorAll(".next");
  const prevBtns = document.querySelectorAll(".previous");
  const fieldsets = document.querySelectorAll("#msform fieldset");
  const progressItems = document.querySelectorAll("#progressbar li");

  let currentIndex = 0;
  fieldsets[currentIndex].style.display = "block";
  fieldsets[currentIndex].style.opacity = 1;

  // إيجاد index fieldset المقاعد تلقائياً
  const seatSelectionIndex = Array.from(fieldsets).findIndex(fs => fs.querySelector("#seatsMain") !== null);
  const ticketsInfoIndex = Array.from(fieldsets).findIndex(fs => fs.querySelector(".ticketsContainer") !== null);

  nextBtns.forEach(btn => {
    btn.addEventListener("click",async function () {
      const current_fs = fieldsets[currentIndex];
      const next_fs = fieldsets[currentIndex + 1];
      if (!next_fs) return;
      // تحقق من صحة الحقول الحالية
      const inputs = current_fs.querySelectorAll("input,textarea");
      for (let input of inputs) {
        if (!input.checkValidity()) {
          PrintValidateErrorMessage("inputs", "All fields are required and must be valid.");
          PrintValidateErrorMessage("Ticketsinputs", "All fields are required and must be valid.");
          return;
        }
      }
      const selects = current_fs.querySelectorAll("select");
      for (let select of selects) {
        if(!select.value) {
          PrintValidateErrorMessage("selects", "Please select a value for all dropdowns.");
          return;
        }
      }
      PrintValidateErrorMessage("selects", "");
      PrintValidateErrorMessage("inputs", "");
      PrintValidateErrorMessage("Ticketsinputs", "");
      // تحديث عدد الركاب وأنواعهم إذا نحن في fieldset اختيار الركاب ومعلومات الرحلة
  
      if(currentIndex === 0) {
        const adult = Number(document.getElementById("adult").value) || 0;
        const child = Number(document.getElementById("child").value) || 0;
        const disable = Number(document.getElementById("disable").value) || 0;
        _passengerCount = adult + child + disable;
        _passengerTypes = [
          ...Array(adult).fill("Adult"),
          ...Array(child).fill("Child"),
          ...Array(disable).fill("Disabled")
        ];
        const TotalAmountDTO = {
          tripName: _tripName,
          adultCount : adult,
          childCount : child,
          disabledCount : disable
        }
        const totalAmount =await FetchTotalTripAmount(TotalAmountDTO);
        if(typeof totalAmount !== "number" || isNaN(totalAmount))
         { PrintValidateErrorMessage("Ticketsinputs", "All fields are required and must be valid.");
          return;
        }
        _totalAmount = totalAmount;

        const tripDateInput = document.getElementById("TripDate").value; // "2026-03-09"
        const travelDate = new Date(tripDateInput + "T12:00:00Z"); // Noon UTC avoids timezone shift
        BookingState.booking.travelDate = travelDate.toISOString();
        BookingState.booking.class = _tripClass;
        BookingState.booking.phoneNumber = document.getElementById("phoneNumber").value;
        BookingState.booking.adultCount = adult;
        BookingState.booking.childCount = child;
        BookingState.booking.disabledCount = disable;
        BookingState.booking.status = document.getElementById("status").value;
        BookingState.booking.travelType = document.querySelector("input[name='tripType']:checked").value;
        BookingState.booking.tripID = Number(document.getElementById("tripsSelect").value);
        BookingState.booking.totalAmount = totalAmount;

        BookingState.payments.amount = totalAmount;
        BookingState.payments.paymentMethod = document.getElementById("payment").value;
        BookingState.payments.transactionDate = new Date().toISOString();
        BookingState.payments.isRefunded = false;

        document.getElementById("totalAmount").textContent = "Total Amount: " + _totalAmount + "$";
      }
      // إذا نحن في fieldset المقاعد، تحقق من اختيار جميع المقاعد
      if(currentIndex === seatSelectionIndex) {
        if (_selectedSeats.length !== _passengerCount) {
          return;
        }
      }
      // تحديث الـ progressbar
      if (progressItems[currentIndex + 1])
        progressItems[currentIndex + 1].classList.add("active");

      if(currentIndex === ticketsInfoIndex)
      {
        const customer = await checkAuth();
       if(!customer) 
       {
        const currentUrl = window.location.pathname + window.location.search;
         window.location.href = `../html/login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return;
        }
        else{
        const confirm = await openPopup();
        if(!confirm)
          return;
        PrintValidateErrorMessage("Ticketsinputs","Completing Booking...");
          BuildTicketsObject();
          const result = await FetchBookFromClient(BookingState);
          if(!result){
             PrintValidateErrorMessage("Ticketsinputs","Booking Failed");
             return;
          }
        }
        
      }
      // إخفاء الحالي وإظهار التالي
      current_fs.style.display = "none";
      current_fs.style.opacity = 0;
      next_fs.style.display = "block";
      next_fs.style.opacity = 1;
      // إذا نحن انتقلنا إلى fieldset التذاكر بعد اختيار المقاعد، توليد التذاكر
      if(currentIndex === seatSelectionIndex) {
        GenerateTicketsInOneFieldset(_passengerCount, _selectedSeats, _passengerTypes);
      }
      currentIndex++;
    });
  });
  prevBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const current_fs = fieldsets[currentIndex];
      const prev_fs = fieldsets[currentIndex - 1];

      if (progressItems[currentIndex]) 
        progressItems[currentIndex].classList.remove("active");

      current_fs.style.display = "none";
      current_fs.style.opacity = 0;
      prev_fs.style.display = "block";
      prev_fs.style.opacity = 1;

      currentIndex--;
    });
  });
  await FillNationalTrips();
});


// ============== Update Inputs With Logic On Load ==============
const phoneInput = document.getElementById("phoneNumber");
const rdInternational = document.getElementById("rdInternational");
const rdNational = document.getElementById("rdNational");
const radio_group = document.querySelector(".radio-group.trip-type");
const tripsSelect = document.getElementById("tripsSelect");
const tripTimesSelect = document.getElementById("tripTimes");
const numberInput = document.querySelectorAll("input[type='number']");

radio_group.addEventListener("change", async function () {
  tripsSelect.innerHTML =
    `<option value="" selected disabled hidden>Select Your Trip</option>`;
  if (rdInternational.checked) {
    await FillInternationalTrips();
  } else if (rdNational.checked) {
    await FillNationalTrips();
  }
});
phoneInput.addEventListener("input", function () {
  let numbers = this.value.replace(/\D/g, "");
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted =
      "(+" +
      numbers.slice(0, 3) +
      ") " +
      numbers.slice(3, 6) +
      "-" +
      numbers.slice(6, 9) +
      "-" +
      numbers.slice(9, 12);
  }
  this.value = formatted;
});
tripsSelect.addEventListener("change", async function () {
  const option = this.options[this.selectedIndex];
  const tripId = Number(option.value);
  const tripName = option.textContent;
  const tripTimeId = Number(option.dataset.tripTimeId);

  if(tripTimeId)
    {
      tripTimesSelect.disabled = false;
      await FillTripTimes(tripTimeId);
    }
    _tripName = tripName;
    _tripClass = getTripType(tripName);

  if(!tripId) return;
  FillbookedSeatsArray(tripId);
});
setDateRange("TripDate");
ValidateNumbersInput();


// ================ Helper Functions ================
function PrintValidateErrorMessage(inputId, message) {
  const errorMessageElement = document.getElementById(inputId + "_ErrorMessage");
  if (errorMessageElement) {
    errorMessageElement.style.display = "block";
    errorMessageElement.style.color = "red";
    errorMessageElement.textContent = message;
  }
}
function setDateRange(dateInputId) {
  const dateInput = document.getElementById(dateInputId);
  if (!dateInput) return;

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const minDate = `${yyyy}-${mm}-${dd}`;

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 10);
  const ddMax = String(maxDateObj.getDate()).padStart(2, "0");
  const mmMax = String(maxDateObj.getMonth() + 1).padStart(2, "0");
  const yyyyMax = maxDateObj.getFullYear();
  const maxDate = `${yyyyMax}-${mmMax}-${ddMax}`;

  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);
  dateInput.value = minDate;
}
function ValidateNumbersInput() {
  numberInput.forEach(input => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
      if (this.value > 10) this.value = 10;
    });
  });
}
async function FillInternationalTrips() {
  const loadingOption = document.createElement("option");
    loadingOption.textContent = "Loading Trips...";
    loadingOption.value = 0;
    loadingOption.dataset.seats = 0;
    tripsSelect.appendChild(loadingOption);

  const trips = await FetchInternationalTrips();
  loadingOption.remove();

  if (!trips || trips.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No Trip Found";
    option.value = 0;
    option.dataset.seats = 0;
    tripsSelect.appendChild(option);
    return;
  }
  trips.forEach(trip => {
    const option = document.createElement("option");
    option.dataset.seats = trip.availableSeats;
    option.dataset.tripTimeId = trip.tripTimesId;
    option.value = trip.tripId;
    option.textContent = trip.tripName;
    tripsSelect.appendChild(option);
  });
}
async function FillNationalTrips() {
  const loadingOption = document.createElement("option");
    loadingOption.textContent = "Loading Trips...";
    loadingOption.value = 0;
    loadingOption.dataset.seats = 0;
    tripsSelect.appendChild(loadingOption);

  const trips = await FetchINationalTrips();
  loadingOption.remove();
  if (!trips || trips.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No Trip Found";
    option.value = 0;
    option.dataset.seats = 0;
    tripsSelect.appendChild(option);
    return;
  }
  trips.forEach(trip => {
    const option = document.createElement("option");
    option.dataset.seats = trip.availableSeats;
    option.dataset.tripTimeId = trip.tripTimesId;
    option.value = trip.tripId;
    option.textContent = trip.tripName;
    tripsSelect.appendChild(option);
  });
}
async function FillTripTimes(tripTimeId) {
  const loadingOption = document.createElement("option");
    loadingOption.textContent = "Loading Trips...";
    loadingOption.value = 0;
    tripTimesSelect.appendChild(loadingOption);
    const times = await FetchTripTimes(tripTimeId); // API call
    loadingOption.remove();

    if(!times || times.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No times available";
        option.value = 0;
        tripTimesSelect.appendChild(option);
        return;
    }

    times.forEach(timeStr => {
    const option = document.createElement("option");
    option.value = timeStr;
    option.textContent =formatTimeAMPM(timeStr);
    tripTimesSelect.appendChild(option);
});
}
function formatTimeAMPM(timeStr) {
    // timeStr مثل "06:00:00"
    const [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2,'0')} ${ampm}`;
}
function getTripType(tripName) {
    if (!tripName) return "";

    // افصل الاسم بالكلمة الأخيرة بعد الفراغ
    const parts = tripName.trim().split(" ");
    const type = parts[parts.length - 1];
    return type;
}
async function FillbookedSeatsArray(tripId) {
  const bookedSeats = await FetchbookedSeatsArray(tripId);
  if(!bookedSeats) return;
  DrawBussSeats(bookedSeats);
}
function DrawBussSeats(bookedSeats) {
  const mainContainer = document.getElementById("seatsMain");
  const backContainer = document.getElementById("seatsBack");
  let seatCounter = 0;

  if (!mainContainer || !backContainer) {
      console.error("seatsMain or seatsBack not found in DOM");
      return;
  }

  mainContainer.innerHTML = "";
  backContainer.innerHTML = "";

  function updateSelectedSeats() {
    _selectedSeats = Array.from(document.querySelectorAll(".selected")).map(seat => Number(seat.value));
  }

  for (let i = 1; i <= 44; i++) {
    const seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.innerHTML = `<i class="fa fa-chair"></i> ${i}`;
    seat.value = i;

    if (bookedSeats.has(i)) {
      seat.classList.add("booked");
      seat.disabled = true;
    } else {
      seat.addEventListener("click", function () {
        if (seat.classList.contains("selected")) {
          seat.classList.remove("selected");
          seatCounter--;
        } else if (seatCounter < _passengerCount) {
          seat.classList.add("selected");
          seatCounter++;
        }
        updateSelectedSeats();
      });
    }

    if ((i % 4) === 3) mainContainer.appendChild(document.createElement("div"));
    mainContainer.appendChild(seat);
  }

  for (let i = 45; i <= 50; i++) {
    const seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.innerHTML = `<i class="fa fa-chair"></i> ${i}`;
    seat.value = i;

    if (bookedSeats.has(i)) {
      seat.classList.add("booked");
      seat.disabled = true;
    } else {
      seat.addEventListener("click", function () {
        if (seat.classList.contains("selected")) {
          seat.classList.remove("selected");
          seatCounter--;
        } else if (seatCounter < _passengerCount) {
          seat.classList.add("selected");
          seatCounter++;
        }
        updateSelectedSeats();
      });
    }
    backContainer.appendChild(seat);
  }
}
function GenerateTicketsInOneFieldset(passengerCount, selectedSeats, passengerTypes) {
  const container = document.querySelector(".ticketsContainer");
    const AmountPriceElement = document.getElementById("totalAmount");
    AmountPriceElement.textContent ="Total Amount: " + _totalAmount + "$";

  if(!container) return;

  container.innerHTML = "";

  for (let i = 0; i < passengerCount; i++) {
    const ticketDiv = document.createElement("div");
    ticketDiv.className = "ticket-card";

    ticketDiv.innerHTML =`
      <h3>Passenger ${i + 1}</h3>
      <input type="text" name="fname" placeholder="Passenger Full Name" required />
      <input type="text" name="nationalId" placeholder="National ID" required />
      <div>Seat: ${selectedSeats[i]}</div>
      <div>Type: ${passengerTypes[i]}</div>
      <div class="radio-group gender">
        <div>
          <input id="rdMale${i}" name="gender${i}" value="Male" type="radio" />
          <label for="rdMale${i}"><span></span> Male</label>
        </div>  
        <div>
          <input id="rdFemale${i}" name="gender${i}" value="Female" type="radio" checked />
          <label for="rdFemale${i}"><span></span> Female</label>
        </div>
      </div>
    `;
    container.appendChild(ticketDiv);
  }
}
function BuildTicketsObject() {

  const tickets = [];
  const cards = document.querySelectorAll(".ticket-card");

  cards.forEach((card, index) => {

    const name = card.querySelector("input[name='fname']").value;
    const nationalId = card.querySelector("input[name='nationalId']").value;
    const gender = card.querySelector(`input[name='gender${index}']:checked`).value;

    tickets.push({
      passengerName: name,
      passengerGender: gender,
      nationalID: nationalId,
      issueDate: new Date().toISOString(),
      seatNumber: _selectedSeats[index],
      qrCode: crypto.randomUUID(),
      personType: _passengerTypes ? _passengerTypes[index] : ""
    });

  });

  BookingState.tickets = tickets;
}
function openPopup() {
  return new Promise((resolve) => {
    const popup = document.getElementById("popup");
    popup.style.display = "flex";

    // منع أي ضغط على الصفحة عدا البوب أب
    function blockEvent(e) {
      if (!popup.contains(e.target)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
    // or
    /*
    function blockEvent(e) {
      if (!e.target.closest("#popup")) {
        e.stopPropagation();
        e.preventDefault();
      }
    }*/

    document.addEventListener("click", blockEvent, true);
    document.addEventListener("keydown", blockEvent, true); // يمنع أي ضغطات كيبورد خارج البوب أب

    function closePopup(result) {
      popup.style.display = "none";
      document.removeEventListener("click", blockEvent, true);
      document.removeEventListener("keydown", blockEvent, true);
      resolve(result);
    }

    document.getElementById("btnYes").addEventListener("click", () => closePopup(true));
    document.getElementById("btnCancel").addEventListener("click", () => closePopup(false));
  });
}


// ================= API Helper Functions =================
const getCommonHeaders = () => ({
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // تخطي صفحة تحذير ngrok
});
async function FetchInternationalTrips() {
  try {
    const response = await fetch(`${UrlBase}BusBookingRest/GetInternationalTrips`, {
      method: "GET",
      headers: getCommonHeaders()
    });
    if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }
    return await response.json();
  } catch(error) {
    console.error(error);
    return null;
  }
}
async function FetchINationalTrips() {
  try {
    const response = await fetch(`${UrlBase}BusBookingRest/GetNationalTrips`, {
      method: "GET",
      headers: getCommonHeaders()
    });
    if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }
    return await response.json();
  } catch(error) {
    console.error(error);
    return null;
  }
}
async function FetchTripTimes(tripTimeId) {
  try {
    const response = await fetch(`${UrlBase}BusBookingRest/GetAllTripTimes/${tripTimeId}`, {
        method: "GET",
      headers: getCommonHeaders()
    });
    if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }
    return await response.json();
  } catch(error) {
    console.error(error);
    return null;
  }
}
async function FetchbookedSeatsArray(tripId) {
  try {
    const response = await fetch(`${UrlBase}BusBookingRest/GetbookedSeats/${tripId}`, {
      method: "GET",
      headers: getCommonHeaders()
    });
    if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }
    const bookedSeatsArray = await response.json();
    return new Set(bookedSeatsArray);
  } catch (error) {
    console.error(error);
    return null;
  }
}
async function FetchTotalTripAmount(TotalAmountDTO) {
  try {
    const response = await fetch(`${UrlBase}BusBookingRest/GetMoneyAmount`, {
      method: "Post",
      headers: getCommonHeaders(),
      body: JSON.stringify(TotalAmountDTO)
    });
     if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }

    const data = await response.json();
    if(data <= 0)
      return null;

    return data;
  }catch (error) {
    console.error(error);
    return null;
  }
}
async function FetchBookFromClient(BookingDTO) {
  try
  {
    const response = await apiFetch(`BusBookingRest/BookFromClient`, {
      method: "Post",
      body: JSON.stringify(BookingDTO)
    });
     if(!response.ok)
      { 
        console.error(response.statusText);
        return null;
      }
    const data = await response.json();
    return data;
  }catch(error)
  {
    console.error(error);
    return null;
  }
}    
