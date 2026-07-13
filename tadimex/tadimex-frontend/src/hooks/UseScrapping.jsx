import { useState, useEffect } from "react";
import { baseURL } from "../api/baseUrl";

export const UseScrapping = (urls, token) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Extraer a sitios web
  const fetchData = async () => {
    try {
      const url = `${import.meta.env.VITE_API_SERVER}/scrape`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json.results); 
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (urls) {
      fetchData();
    }
  }, [urls, token]);

  return {
    data,
    error,
  };
};