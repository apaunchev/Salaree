import { useEffect, useState } from "react";

const useData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let data;

      try {
        const response = await fetch(`/api/latest-scrape`);
        data = await response.json();
      } catch (error) {
        console.error(error);
        setError(true);
        return;
      } finally {
        setLoading(false);
      }

      setData(data);
    };

    fetchData();
  }, []);

  return [data, loading, error];
};

export default useData;
