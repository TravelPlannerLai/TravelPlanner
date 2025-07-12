import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

class TravelAIService {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // Create different prompt templates for different functions
    this.routePlanningTemplate = new PromptTemplate({
      template: `You are a travel expert helping plan routes in {city}. 
      The user has selected these places: {places}
      
      Please provide:
      1. Optimal visiting order
      2. Estimated time at each location
      3. Transportation recommendations
      4. Any special tips
      
      Keep response concise and practical.`,
      inputVariables: ["city", "places"],
    });

    this.restaurantTemplate = new PromptTemplate({
      template: `You are a local food expert in {city}. 
      The user is near these locations: {locations}
      
      Recommend 3-5 nearby restaurants with:
      1. Restaurant name and cuisine type
      2. Distance from current locations
      3. Price range ($ to $$$)
      4. Why it's special
      
      Focus on local favorites and highly-rated places.`,
      inputVariables: ["city", "locations"],
    });

    this.weatherTemplate = new PromptTemplate({
      template: `Provide weather advice for {city} travel planning.
      Current conditions: {weather}
      
      Give advice on:
      1. What to wear
      2. Best activities for this weather
      3. Indoor alternatives if needed
      4. Any weather-related travel tips
      
      Be specific and actionable.`,
      inputVariables: ["city", "weather"],
    });

    this.tipsTemplate = new PromptTemplate({
      template: `You are a local travel expert for {city}. 
      Provide 5 essential travel tips covering:
      1. Transportation
      2. Local customs/etiquette
      3. Money/payment methods
      4. Safety considerations
      5. Hidden gems or local secrets
      
      Make tips practical and current.`,
      inputVariables: ["city"],
    });

    this.generalTemplate = new PromptTemplate({
      template: `You are a helpful travel assistant for {city}. 
      User question: {question}
      Context: User is planning a trip with these places: {places}
      
      Provide a helpful, concise response focused on travel advice.`,
      inputVariables: ["city", "question", "places"],
    });
  }

  async planRoute(city, places) {
    try {
      const chain = new LLMChain({
        llm: this.llm,
        prompt: this.routePlanningTemplate,
      });

      const placesText = places.map(p => p.name).join(", ");
      const response = await chain.call({
        city: city,
        places: placesText,
      });

      return {
        success: true,
        response: response.text,
        type: "route_planning"
      };
    } catch (error) {
      console.error("Route planning error:", error);
      return {
        success: false,
        error: "Failed to generate route plan. Please try again.",
        type: "route_planning"
      };
    }
  }

  async findRestaurants(city, locations) {
    try {
      const chain = new LLMChain({
        llm: this.llm,
        prompt: this.restaurantTemplate,
      });

      const locationsText = locations.map(l => l.name).join(", ");
      const response = await chain.call({
        city: city,
        locations: locationsText,
      });

      return {
        success: true,
        response: response.text,
        type: "restaurant_recommendations"
      };
    } catch (error) {
      console.error("Restaurant search error:", error);
      return {
        success: false,
        error: "Failed to find restaurants. Please try again.",
        type: "restaurant_recommendations"
      };
    }
  }

  async getWeatherAdvice(city, weatherData = null) {
    try {
      const chain = new LLMChain({
        llm: this.llm,
        prompt: this.weatherTemplate,
      });

      const weather = weatherData || "Please check current weather conditions";
      const response = await chain.call({
        city: city,
        weather: weather,
      });

      return {
        success: true,
        response: response.text,
        type: "weather_advice"
      };
    } catch (error) {
      console.error("Weather advice error:", error);
      return {
        success: false,
        error: "Failed to get weather advice. Please try again.",
        type: "weather_advice"
      };
    }
  }

  async getTravelTips(city) {
    try {
      const chain = new LLMChain({
        llm: this.llm,
        prompt: this.tipsTemplate,
      });

      const response = await chain.call({
        city: city,
      });

      return {
        success: true,
        response: response.text,
        type: "travel_tips"
      };
    } catch (error) {
      console.error("Travel tips error:", error);
      return {
        success: false,
        error: "Failed to get travel tips. Please try again.",
        type: "travel_tips"
      };
    }
  }

  async askQuestion(city, question, places = []) {
    try {
      const chain = new LLMChain({
        llm: this.llm,
        prompt: this.generalTemplate,
      });

      const placesText = places.map(p => p.name || p).join(", ");
      const response = await chain.call({
        city: city,
        question: question,
        places: placesText,
      });

      return {
        success: true,
        response: response.text,
        type: "general_question"
      };
    } catch (error) {
      console.error("General question error:", error);
      return {
        success: false,
        error: "Failed to process your question. Please try again.",
        type: "general_question"
      };
    }
  }
}

const travelAIService = new TravelAIService();
export default travelAIService;