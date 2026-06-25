const PriceMap = require("../models/priceModel");
const { Client } = require("@googlemaps/google-maps-services-js");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const conditionedPrice = require("../models/priceDiffModel");
const googleMapsClient = new Client({});

async function calculateDistance(origins, destinations) {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [origins],
        destinations: [destinations],
        travelMode: "driving",
        unitSystem: "imperial",
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      throw new Error(response.data.error_message || "Google Maps API error.");
    }

    const distanceInMeters =
      response.data.rows[0]?.elements[0]?.distance?.value || 0;

    // Convert meters to miles
    return distanceInMeters / 1609.34;
  } catch (error) {
    throw new Error(`Error calculating distance: ${error.message}`);
  }
}

async function getUnitPrice(distance, carType) {
  console.log("distance----->",distance);
  
  const vehicleData = await PriceMap.findOne({ vehicleType: carType });
  console.log("vehicleData",vehicleData);
  
  if (!vehicleData || !vehicleData.pricing) {
    throw new Error(`No pricing data found for carType: ${carType}`);
  }

  for (const range of vehicleData.pricing) {
    if (
      range.distanceGreaterEqual <= distance &&
      (!range.distanceLessEqual || distance <= range.distanceLessEqual)
    ) {
      // return null;
      return range.price;
    }
  }

  throw new Error("No matching price range found for the given distance.");
}

async function calculatePrice(req, res) {
  // console.log("req------>",req)
  const { origins, destinations, rideOption, hourlyservice, selectTime } = req.body;

  console.log("Payload:", req.body);

  // Validate required parameters
  if (!origins) {
    return errorResponse(res, 400, "Missing required parameter: origins.");
  }

  if ((rideOption !== "Hourly Service" && rideOption !== "Chauffeur") && !destinations) {
    return errorResponse(res, 400, "Missing required parameter: destinations.");
  }

  try {
    if (rideOption === "Hourly Service" || rideOption === "Chauffeur") {
      // Validate hourlyservice input
      if (!hourlyservice || isNaN(hourlyservice) || hourlyservice <= 0) {
        return errorResponse(res, 400, "Invalid or missing hourly service value.");
      }

      // Fetch pricing data for the specified rideOption
      const ridePricingData = await conditionedPrice.findOne({ rideType: rideOption });

      if (!ridePricingData) {
        return errorResponse(res, 404, `No pricing data found for rideOption: ${rideOption}`);
      }

      console.log("Ride Pricing Data:", ridePricingData);

      const results = ridePricingData.pricing.map((priceEntry) => {
        const totalPrice = priceEntry.price * hourlyservice;
        return {
          carType: priceEntry.vehicleType,
          hourlyRate: priceEntry.price,
          totalHours: hourlyservice,
          totalPrice,
        };
      });
      console.log("resultsHourly",results);
      
      return successResponse(res, 200, "Price calculation completed successfully.", { results });
    } else {
      // For other rideOptions, perform distance-based calculation
      // For other rideOptions, perform distance-based calculation
      const distance = await calculateDistance(origins, destinations);
      const allVehicles = await PriceMap.find();

      if (!allVehicles || allVehicles.length === 0) {
        return errorResponse(res, 404, "No vehicle pricing data found.");
      }

      const results = [];

      // Parse the selected time in "HH:mm" format; fallback to current hour if not provided or invalid
      let selectedHour = 0;

      if (selectTime && typeof selectTime === "string") {
        const [time, modifier] = selectTime.split(" ");
        const [hoursStr, minutesStr] = time.split(":");

        let hour = parseInt(hoursStr, 10);
        if (modifier === "PM" && hour !== 12) {
          hour += 12;
        }
        if (modifier === "AM" && hour === 12) {
          hour = 0;
        }

        selectedHour = hour;
      } else {
        selectedHour = new Date().getHours(); // fallback to current local hour
      }

      // Define the night fee for hours between midnight (inclusive) and 5am (exclusive)
      const additionalFee = (selectedHour >= 0 && selectedHour < 5) ? 10 : 0;
      // const minimum_fare = 25;
      for (const vehicle of allVehicles) {
        const carType = vehicle.vehicleType;

        try {
          const unitPrice = await getUnitPrice(distance, carType);
          let totalPrice = distance*unitPrice + additionalFee;
          
          // if(totalPrice < minimum_fare){
          //   totalPrice = minimum_fare;
          // }
          
          results.push({ carType, distance, unitPrice, additionalFee, totalPrice });
        } catch (err) {
          console.error(`Error processing carType ${carType}:`, err.message);
          results.push({ carType, error: err.message });
        }
      }

      console.log("results", results);
      return successResponse(res, 200, "Price calculation completed successfully.", { results });

    }
  } catch (error) {
    console.error("Error in calculatePrice:", error.message);
    return errorResponse(res, 500, "An error occurred during price calculation.");
  }
}


module.exports = { calculatePrice };