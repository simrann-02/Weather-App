//when th coordinates are not stored in the local storage area of the browser then a grant access screen will be visilble
//user info screen
//loading screen
//search weather screen


//tabs switching
const userTab=document.querySelector("[data-userWeather]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".content-container");
const error=document.querySelector(".error");

let currentTab=userTab;
const APIkey='e1a96ea59051d7b0ed5a32ac429b354e';
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab){
    if(currentTab!=clickedTab)
    {
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        error.classList.remove("active");
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchInput.value="";
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //for coordinates
            getFromSessionStorage();
        }
    }
}
userTab.addEventListener("click",()=>{
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
switchTab(searchTab);
});

//check if coordinates are present in session storage
function getFromSessionStorage()
{
    const localCoordinates=sessionStorage.getItem("userCoordinates");
    if(!localCoordinates)
    {
        grantAccessContainer.classList.add("active");
    }
    else
    {
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    //make grant container invisible
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    //api call
    try{
        let res=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric`);
        const data=await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(e){
        loadingScreen.classList.remove("active");
        console.log('error occured');
    }
}

function renderWeatherInfo(data)
{
    //fetch 
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windSpeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");
    //fetch values from data
    cityName.innerText=data?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText=data?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText=`${data?.main?.temp} °C`;
    windSpeed.innerText=`${data?.wind?.speed} m/s`;
    humidity.innerText=`${data?.main?.humidity} %`;
    cloudiness.innerText=`${data?.clouds?.all} %`;
    
}

const grantButton=document.querySelector("[data-grantAccess]");
grantButton.addEventListener("click",()=>{
    getLocation();
});
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('no geolocation support available');
    }
}

function showPosition(position){
    const userCoordinates={
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };
    sessionStorage.setItem("userCoordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const searchInput=document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    error.classList.remove("active");
    if(searchInput.value=="") return;

    fetchSearchWeatherInfo(searchInput.value);

})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try{
        const res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}&units=metric`);
        const data=await res.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        if(data?.cod=='404')
        {
            const error=new Error();
            error.message="not found";
            throw error;
        }
        else
        {
        renderWeatherInfo(data);
        }
    }
    catch(e){
        userInfoContainer.classList.remove("active");
        error.classList.add("active");
    }
}
