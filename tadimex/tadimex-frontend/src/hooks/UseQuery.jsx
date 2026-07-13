import { useState, useEffect } from "react";
import { baseURL } from "../api/baseUrl";

export const UseQuery = (query_text, token) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const url = `${import.meta.env.VITE_API_SERVER}/query`;

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query_text }),
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
    if (query_text) {
      fetchData();
    }
  }, [query_text, token]);

  return {
    data,
    error,
  };
};