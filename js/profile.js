import { checkAuth, UrlBase , Logout , setLoading} from "../Auth/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
   const profileAvatar = document.getElementById("content__avatar");
   const customerName = document.getElementById("customerName");
   const phoneNumber = document.getElementById("phoneNumber");
   const customerCountry = document.getElementById("customerCountry");
   const content_description = document.getElementById("content_description");
   const city_visited = document.getElementById("city_visited");
   const distance_done = document.getElementById("distance_done");
   const money_spent = document.getElementById("money_spent");

   setLoading(true,"Loading Profile...");
  const customer = await checkAuth();

  if(!customer) 
  {
   const currentUrl = window.location.pathname + window.location.search;
    window.location.href = `../html/login.html?redirect=${encodeURIComponent(currentUrl)}`;
   return;
   }  
   const customerCountryName = await FetchCountryName(customer.countryId);
   const customerProfilePicture = customer.imgUrl;
   const description = customer.discription;

   const testimg = document.getElementById("testimg");

  const API_BASE = "https://professionally-overjocular-chelsie.ngrok-free.dev";
  const imgUrl = API_BASE + customerProfilePicture;
      console.log(imgUrl);
      
      testimg.src = imgUrl;
   if(profileAvatar)
   {
      profileAvatar.style.background = `#f3f3f3 url("${imgUrl}") center center no-repeat`;
      profileAvatar.style.backgroundSize = "cover";
   }

  customerName.textContent = customer.fullName;
  phoneNumber.textContent = customer.phoneNumber;
  customerCountry.textContent = customerCountryName;
  if(!description)
  content_description.textContent = "No Description Yet";
   else
  content_description.textContent = customer.discription;
  city_visited.textContent = customer.numberOfCountryVisited;
  distance_done.textContent = customer.distanceKm + " km";
  money_spent.textContent = customer.moneySpent + "$";
  setLoading(false,"");
});

document.getElementById("btnLogout").addEventListener("click",async () => {
   await Logout();
});

const getCommonHeaders = () => ({
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true" // تخطي صفحة تحذير ngrok
});
// ========= Api Fetch Helpers =========
async function FetchCountryName(countryId) {
   try {
      const response = await fetch(`${UrlBase}BusBookingRest/GetCountrNameById/${countryId}`, {
         method: "GET",
         headers: getCommonHeaders()
      });
      if(!response.ok)
         { 
            console.error(response.statusText);
            return null;
         }
      const text = await response.text();
         
      return text;
   /*try {
         return JSON.parse(text); // only if server sometimes returns objects
      } catch {
         return text; // fallback to plain string
         }*/
   } catch(error) {
      console.error(error);
      return null;
   }
}
