
export const getWeather = async (lat, lon) => {
    try {
        // Fetch Weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Fetch Location Name (Reverse Geocoding)
        let locationName = "Unknown Location";
        try {
            const geoResponse = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const geoData = await geoResponse.json();
            // detailed locality or city or locality
            locationName = geoData.locality || geoData.city || geoData.principalSubdivision || "Your Area";
        } catch (err) {
            console.warn("Location fetch failed", err);
        }

        if (!weatherData.current) {
            throw new Error("No weather data found");
        }

        return {
            temp: Math.round(weatherData.current.temperature_2m),
            isDay: weatherData.current.is_day === 1,
            code: weatherData.current.weather_code,
            location: locationName
        };
    } catch (error) {
        console.error("Weather fetch failed:", error);
        return null;
    }
};

export const getWeatherDescription = (code) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const codes = {
        0: "weather_0",
        1: "weather_1",
        2: "weather_2",
        3: "weather_3",
        45: "weather_45",
        48: "weather_48",
        51: "weather_51",
        53: "weather_53",
        55: "weather_55",
        61: "weather_61",
        63: "weather_63",
        65: "weather_65",
        71: "weather_71",
        73: "weather_73",
        75: "weather_75",
        95: "weather_95",
    };
    return codes[code] || "weather_variable";
};
